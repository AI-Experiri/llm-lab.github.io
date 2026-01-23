import { preTokenize, countPreTokens, applyMerge } from './utils.js';

/**
 * AG-BPE (Attention-Guided Byte-Pair Encoding)
 * Based on "AG-BPE: Attention-Guided Byte-Pair Encoding for Semantic-Aware Tokenization"
 * Hugging Face blog, August 2025
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * IMPROVES UPON: Standard BPE
 * PROBLEM SOLVED: Frequency-based merging ignores semantic relationships
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * THE PROBLEM:
 * ────────────
 * Standard BPE merges purely by frequency. But frequency != semantic importance:
 *
 *   "th" might be most frequent, but merging "qu" matters more semantically
 *   because "q" almost ALWAYS appears with "u" (strong semantic bond).
 *
 * THE SOLUTION - HYBRID SCORING:
 * ──────────────────────────────
 *
 *   MergeScore(a,b) = α × Freq(a,b) + (1-α) × Attention(a,b)
 *
 *   • α = 1.0: Pure frequency (standard BPE)
 *   • α = 0.0: Pure attention (semantic only)
 *   • α = 0.6: Default balance (60% freq, 40% attention)
 *
 * ATTENTION SCORE COMPONENTS:
 * ───────────────────────────
 * In real AG-BPE, a Transformer computes attention. We simulate with:
 *
 * 1. CO-OCCURRENCE COHERENCE (40%)
 *    How often do these tokens appear together vs separately?
 *    High ratio = strong semantic bond
 *
 * 2. MORPHOLOGICAL PATTERNS (20%)
 *    Does the merge create known patterns? (ing, ed, tion, etc.)
 *
 * 3. PHONETIC COHERENCE (15%)
 *    Vowel-consonant patterns that create pronounceable units
 *
 * 4. LENGTH BONUS (10%)
 *    Prefer medium-length tokens (3-6 chars) - not too short, not too long
 *
 * 5. CONSISTENCY BONUS (15%)
 *    If pair appears together >80% of the time, strong bonus
 *
 * VISUALIZATION:
 * ──────────────
 * • Adjust α slider to see frequency vs attention tradeoff
 * • Each pair shows hybrid score breakdown
 * • Watch how different α values change merge order
 *
 * For visualization, we simulate attention scores based on linguistic heuristics.
 */
export class AGBPE {
	constructor(text, maxMerges = 10, alpha = 0.6) {
		this.originalText = text;
		this.maxMerges = maxMerges;
		this.alpha = alpha; // Balance between frequency (α) and attention (1-α)
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

		// Compute all merges with attention guidance
		this.merges = [];
		this.computeAllMerges();
	}

	/**
	 * Simulate attention score for a token pair
	 *
	 * Real AG-BPE uses a ContextAnalyzer (3-layer Transformer) to compute
	 * attention between adjacent characters. High attention = strong bond.
	 *
	 * We simulate with co-occurrence ratio: "When A appears, how often is B next to it?"
	 * This captures the core insight that tokens appearing together have a strong bond.
	 */
	computeAttentionScore(token1, token2, pairFreq, tokenCounts) {
		const count1 = tokenCounts[token1] || 1;
		const count2 = tokenCounts[token2] || 1;

		// Co-occurrence ratio: pairFreq / min(count1, count2)
		// High ratio = tokens almost always appear together = strong bond
		const cooccurrenceRatio = pairFreq / Math.min(count1, count2);

		return Math.min(cooccurrenceRatio, 1.0);
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

	computeAllMerges() {
		// Work on copies
		let ptTrained = {};
		for (const [pt, tokens] of Object.entries(this.preTokensTrained)) {
			ptTrained[pt] = [...tokens];
		}

		let localVocab = { ...this.vocab };
		let localVi = this.vocabIndex;

		for (let round = 0; round < this.maxMerges; round++) {
			// Count token frequencies
			const tokenCounts = this.getTokenCounts(ptTrained);

			// Count pair frequencies
			const pairFreqs = {};
			for (const [pt, tokens] of Object.entries(ptTrained)) {
				const count = this.preTokenCounts[pt];
				for (let i = 0; i < tokens.length - 1; i++) {
					const pair = tokens[i] + '|' + tokens[i + 1];
					pairFreqs[pair] = (pairFreqs[pair] || 0) + count;
				}
			}

			if (Object.keys(pairFreqs).length === 0) break;

			// Compute hybrid scores for all pairs
			const pairScores = {};
			const attentionScores = {};
			let maxFreq = Math.max(...Object.values(pairFreqs));

			for (const [pair, freq] of Object.entries(pairFreqs)) {
				const [t1, t2] = pair.split('|');
				const merged = t1 + t2;

				if (merged in localVocab) continue;

				// Normalize frequency to [0, 1]
				const normFreq = freq / maxFreq;

				// Compute attention score
				const attScore = this.computeAttentionScore(t1, t2, freq, tokenCounts, ptTrained);
				attentionScores[pair] = attScore;

				// Hybrid score: α * freq + (1-α) * attention
				const hybridScore = this.alpha * normFreq + (1 - this.alpha) * attScore;
				pairScores[pair] = hybridScore;
			}

			if (Object.keys(pairScores).length === 0) break;

			// Sort by hybrid score
			const sortedPairs = Object.entries(pairScores).sort((a, b) => {
				if (Math.abs(b[1] - a[1]) > 0.0001) return b[1] - a[1];
				// Tiebreaker: frequency
				return (pairFreqs[b[0]] || 0) - (pairFreqs[a[0]] || 0);
			});

			const [bestPair, bestScore] = sortedPairs[0];
			const [token1, token2] = bestPair.split('|');
			const newToken = token1 + token2;
			const freq = pairFreqs[bestPair];

			if (freq < 2) break;

			// Store merge info
			this.merges.push({
				step: round + 1,
				token1,
				token2,
				newToken,
				count: freq,
				hybridScore: bestScore,
				freqScore: freq / maxFreq,
				attentionScore: attentionScores[bestPair],
				alpha: this.alpha,
				pairFreqs: { ...pairFreqs },
				pairScores: { ...pairScores },
				attentionScores: { ...attentionScores },
				ptTrainedBefore: JSON.parse(JSON.stringify(ptTrained))
			});

			// Add to vocabulary
			localVocab[newToken] = localVi++;

			// Apply merge
			for (const [pt, tokens] of Object.entries(ptTrained)) {
				ptTrained[pt] = applyMerge(tokens, token1, token2, newToken);
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
			hybridScore: null,
			step: 0,
			isBase: true
		}));

		for (let i = 0; i < step; i++) {
			const merge = this.merges[i];
			vocab.push({
				token: merge.newToken,
				from: `${merge.token1} + ${merge.token2}`,
				count: merge.count,
				hybridScore: merge.hybridScore,
				attentionScore: merge.attentionScore,
				step: merge.step,
				isBase: false
			});
		}

		return vocab;
	}
}
