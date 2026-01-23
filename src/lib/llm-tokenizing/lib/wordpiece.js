import { preTokenize, countPreTokens, applyMerge } from './utils.js';

/**
 * WordPiece Algorithm
 * Based on "Japanese and Korean Voice Search" (Schuster & Nakajima, 2012)
 * https://static.googleusercontent.com/media/research.google.com/en//pubs/archive/37842.pdf
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * HISTORICAL CONTEXT: One of the earliest subword tokenization algorithms,
 * developed for speech recognition. Later adopted by BERT and related models.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * KEY INNOVATION vs Raw Frequency:
 * ─────────────────────────────────
 * Instead of merging the most FREQUENT pair, WordPiece merges the pair
 * with the highest SCORE:
 *
 *   score(a, b) = count(ab) / (count(a) × count(b))
 *
 * WHY THIS MATTERS:
 * ─────────────────
 * • Frequent tokens like "e" or "t" appear everywhere
 * • Pure frequency would merge them with everything
 * • Score normalizes by individual frequencies
 * • Prioritizes "surprising" co-occurrences
 *
 * EXAMPLE:
 * ────────
 * If "e" appears 1000× and "r" appears 500×, but "er" appears 400×:
 *   - Frequency: "er" = 400 (might be highest)
 *   - Score: 400 / (1000 × 500) = 0.0008 (relatively low)
 *
 * If "qu" appears together 50× but "q" only appears 52× total:
 *   - Frequency: "qu" = 50 (lower)
 *   - Score: 50 / (52 × X) = much higher (strong association)
 */
export class WordPiece {
	constructor(text, maxMerges = 10) {
		this.originalText = text;
		this.maxMerges = maxMerges;
		this.reset();
	}

	reset() {
		// Pre-tokenize and count
		const chunks = preTokenize(this.originalText);
		this.preTokenCounts = countPreTokens(chunks);

		// Initialize each pre-token as array of characters
		this.preTokensTrained = {};
		for (const pt of Object.keys(this.preTokenCounts)) {
			this.preTokensTrained[pt] = Array.from(pt);
		}

		// Build base vocabulary
		this.vocab = {};
		this.vocabIndex = 0;
		const baseChars = new Set();
		for (const pt of Object.keys(this.preTokensTrained)) {
			for (const char of this.preTokensTrained[pt]) {
				baseChars.add(char);
			}
		}

		this.baseVocab = Array.from(baseChars).sort();
		for (const char of this.baseVocab) {
			this.vocab[char] = this.vocabIndex++;
		}

		// Compute all merges
		this.merges = [];
		this.computeAllMerges();
	}

	/**
	 * Count individual token frequencies
	 */
	getTokenCounts(ptTrained) {
		const counts = {};
		for (const [pt, tokens] of Object.entries(ptTrained)) {
			const ptCount = this.preTokenCounts[pt];
			for (const token of tokens) {
				counts[token] = (counts[token] || 0) + ptCount;
			}
		}
		return counts;
	}

	/**
	 * Sort pairs by WordPiece score (desc), then by frequency (desc), length (desc), lex (desc)
	 */
	sortPairsByScore(pairs, tokenCounts) {
		return pairs.sort((a, b) => {
			const [pairA, countA] = a;
			const [pairB, countB] = b;

			const [t1a, t2a] = pairA.split('|');
			const [t1b, t2b] = pairB.split('|');

			// Calculate WordPiece scores
			const scoreA = countA / ((tokenCounts[t1a] || 1) * (tokenCounts[t2a] || 1));
			const scoreB = countB / ((tokenCounts[t1b] || 1) * (tokenCounts[t2b] || 1));

			// 1. Score descending
			if (Math.abs(scoreB - scoreA) > 1e-10) return scoreB - scoreA;

			// 2. Frequency descending (tiebreaker)
			if (countB !== countA) return countB - countA;

			// 3. Length descending
			const lenA = t1a.length + t2a.length;
			const lenB = t1b.length + t2b.length;
			if (lenB !== lenA) return lenB - lenA;

			// 4. Lexicographically descending
			return pairB.localeCompare(pairA);
		});
	}

	computeAllMerges() {
		// Work on copies
		let ptTrained = {};
		for (const [pt, tokens] of Object.entries(this.preTokensTrained)) {
			ptTrained[pt] = [...tokens];
		}

		let localVocab = { ...this.vocab };
		let localVi = this.vocabIndex;

		for (let round = 0; round < this.maxMerges; round++) {
			// Count individual token frequencies
			const tokenCounts = this.getTokenCounts(ptTrained);

			// Count pair frequencies (weighted by pre-token counts)
			const pairFreqs = {};
			for (const [pt, tokens] of Object.entries(ptTrained)) {
				const count = this.preTokenCounts[pt];
				for (let i = 0; i < tokens.length - 1; i++) {
					const pair = tokens[i] + '|' + tokens[i + 1];
					pairFreqs[pair] = (pairFreqs[pair] || 0) + count;
				}
			}

			if (Object.keys(pairFreqs).length === 0) break;

			// Sort pairs by WordPiece score
			const sortedPairs = this.sortPairsByScore(Object.entries(pairFreqs), tokenCounts);

			// Calculate scores for display
			const pairScores = {};
			for (const [pair, freq] of Object.entries(pairFreqs)) {
				const [t1, t2] = pair.split('|');
				const score = freq / ((tokenCounts[t1] || 1) * (tokenCounts[t2] || 1));
				pairScores[pair] = score;
			}

			// Find first pair not already in vocab
			let newVocabPair = null;
			let newVocabFreq = 0;
			let newVocabToken = null;
			let newVocabScore = 0;

			for (const [pair, freq] of sortedPairs) {
				const [t1, t2] = pair.split('|');
				const merged = t1 + t2;
				if (!(merged in localVocab)) {
					newVocabPair = pair;
					newVocabFreq = freq;
					newVocabToken = merged;
					newVocabScore = pairScores[pair];
					break;
				}
			}

			if (!newVocabPair || newVocabFreq < 2) break;

			const [token1, token2] = newVocabPair.split('|');

			// Store merge info
			this.merges.push({
				step: round + 1,
				token1,
				token2,
				newToken: newVocabToken,
				count: newVocabFreq,
				score: newVocabScore,
				pairFreqs: { ...pairFreqs },
				pairScores: { ...pairScores },
				tokenCounts: { ...tokenCounts },
				ptTrainedBefore: JSON.parse(JSON.stringify(ptTrained))
			});

			// Add to vocabulary
			localVocab[newVocabToken] = localVi++;

			// Apply merge to all pre-tokens
			for (const [pt, tokens] of Object.entries(ptTrained)) {
				ptTrained[pt] = applyMerge(tokens, token1, token2, newVocabToken);
			}
		}
	}

	/**
	 * Get tokens at a specific step
	 */
	getTokensAtStep(step) {
		let ptTrained = {};
		for (const [pt, tokens] of Object.entries(this.preTokensTrained)) {
			ptTrained[pt] = [...tokens];
		}

		for (let i = 0; i < step; i++) {
			const merge = this.merges[i];
			for (const [pt, tokens] of Object.entries(ptTrained)) {
				ptTrained[pt] = applyMerge(tokens, merge.token1, merge.token2, merge.newToken);
			}
		}

		return ptTrained;
	}

	/**
	 * Get total token count at a step
	 */
	getTokenCount(step) {
		const ptTrained = this.getTokensAtStep(step);
		let count = 0;
		for (const [pt, tokens] of Object.entries(ptTrained)) {
			count += tokens.length * this.preTokenCounts[pt];
		}
		return count;
	}

	/**
	 * Get initial token count
	 */
	getInitialTokenCount() {
		let count = 0;
		for (const [pt, tokens] of Object.entries(this.preTokensTrained)) {
			count += tokens.length * this.preTokenCounts[pt];
		}
		return count;
	}

	/**
	 * Get vocabulary at a specific step
	 */
	getVocabAtStep(step) {
		const vocab = this.baseVocab.map((char) => ({
			token: char,
			from: null,
			count: null,
			score: null,
			step: 0,
			isBase: true
		}));

		for (let i = 0; i < step; i++) {
			const merge = this.merges[i];
			vocab.push({
				token: merge.newToken,
				from: `${merge.token1} + ${merge.token2}`,
				count: merge.count,
				score: merge.score,
				step: merge.step,
				isBase: false
			});
		}

		return vocab;
	}
}
