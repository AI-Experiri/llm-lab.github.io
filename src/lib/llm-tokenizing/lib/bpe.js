import { preTokenize, countPreTokens, sortPairs, applyMerge } from './utils.js';

/**
 * Standard BPE (Byte Pair Encoding) Algorithm
 * Based on "Neural Machine Translation of Rare Words with Subword Units"
 * (Sennrich et al., 2016) - https://arxiv.org/abs/1508.07909
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * THE FOUNDATION: This is the baseline algorithm that most variants improve upon.
 * Used by GPT-2, GPT-3, GPT-4, and many other models.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ALGORITHM:
 * ──────────
 * 1. PRE-TOKENIZE: Split text using GPT-2 regex (words, numbers, punctuation)
 * 2. CHARACTER SPLIT: Each pre-token → array of characters
 * 3. COUNT PAIRS: Count adjacent token pairs (weighted by pre-token frequency)
 * 4. MERGE BEST: Select most frequent pair, merge everywhere
 * 5. REPEAT: Until reaching max vocabulary size
 *
 * SORTING TIE-BREAKERS:
 * ─────────────────────
 * When pairs have equal frequency:
 *   1. Frequency (descending)
 *   2. Merged token length (descending)
 *   3. Lexicographic order (descending)
 *
 * LIMITATION:
 * ───────────
 * Pure frequency-based merging can create suboptimal vocabularies:
 * • May merge common characters too aggressively
 * • Doesn't consider semantic relationships
 * • Can't merge across pre-token boundaries
 * • No mechanism to handle domain-specific terms
 *
 * → Later algorithms (Scaffold, Adaptive, Boundless, AG-BPE) address these.
 */
export class BPE {
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

	computeAllMerges() {
		// Work on copies
		let ptTrained = {};
		for (const [pt, tokens] of Object.entries(this.preTokensTrained)) {
			ptTrained[pt] = [...tokens];
		}

		let localVocab = { ...this.vocab };
		let localVi = this.vocabIndex;

		for (let round = 0; round < this.maxMerges; round++) {
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

			// Sort pairs
			const sortedPairs = sortPairs(Object.entries(pairFreqs));

			// Find first pair not already in vocab
			let newVocabPair = null;
			let newVocabFreq = 0;
			let newVocabToken = null;

			for (const [pair, freq] of sortedPairs) {
				const [t1, t2] = pair.split('|');
				const merged = t1 + t2;
				if (!(merged in localVocab)) {
					newVocabPair = pair;
					newVocabFreq = freq;
					newVocabToken = merged;
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
				pairFreqs: { ...pairFreqs },
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
			step: 0,
			isBase: true
		}));

		for (let i = 0; i < step; i++) {
			const merge = this.merges[i];
			vocab.push({
				token: merge.newToken,
				from: `${merge.token1} + ${merge.token2}`,
				count: merge.count,
				step: merge.step,
				isBase: false
			});
		}

		return vocab;
	}
}
