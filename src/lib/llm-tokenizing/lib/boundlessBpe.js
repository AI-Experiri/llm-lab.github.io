import { preTokenize, countPreTokens, sortPairs } from './utils.js';

/**
 * BoundlessBPE Algorithm
 * Based on "Boundless Byte Pair Encoding: Breaking the Pre-tokenization Barrier"
 * (arXiv:2504.00178) - Schmidt et al., April 2025
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * IMPROVES UPON: Standard BPE
 * PROBLEM SOLVED: Pre-tokenization creates artificial barriers that limit compression
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * THE PROBLEM:
 * ────────────
 * Standard BPE uses pre-tokenization (GPT-2 regex) to split text into chunks:
 *   " of the people" → [" of", " the", " people"]
 *
 * Merges can ONLY happen WITHIN each chunk, never across:
 *   " of" can become one token, " the" can become one token
 *   But " of the" can NEVER become one token!
 *
 * Common phrases like "of the", "in the", "to the" stay fragmented.
 *
 * THE SOLUTION - SUPERMERGES:
 * ───────────────────────────
 * When TWO ADJACENT pretokens are BOTH single tokens, they can "supermerge":
 *
 *   Condition: pretoken1 = [single_token] AND pretoken2 = [single_token]
 *   Action: Combine into superword = pretoken1 + pretoken2
 *
 *   Step 1: " of" → [" of"] (single token) ✓
 *   Step 2: " the" → [" the"] (single token) ✓
 *   Step 3: SUPERMERGE! " of" + " the" → " of the" (new pretoken)
 *
 * ALGORITHM CHANGE:
 * ─────────────────
 * At each step, compare:
 *   • Best regular merge (within pretokens) - frequency F_regular
 *   • Best supermerge (across pretokens) - frequency F_super
 *
 * Choose whichever has higher frequency!
 *
 * VISUALIZATION:
 * ──────────────
 * • Fuchsia tokens = supermerge candidates
 * • ⊕ symbol = supermerge operation (vs + for regular merge)
 * • Watch compression improve beyond normal BPE limits
 */
export class BoundlessBPE {
	constructor(text, maxMerges = 10) {
		this.originalText = text;
		this.maxMerges = maxMerges;
		this.reset();
	}

	reset() {
		// Pre-tokenize and count
		const chunks = preTokenize(this.originalText);
		this.preTokenCounts = countPreTokens(chunks);

		// Store original pretokens (before supermerges pollute preTokenCounts)
		this.originalPreTokenCounts = { ...this.preTokenCounts };

		// Store original pretoken sequence for supermerge tracking
		this.preTokenSequence = chunks;

		// Store original sequence (before supermerges modify it)
		this.originalSequence = [...chunks];

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

		// Track superwords (merged pretokens)
		this.superwords = new Map(); // superword -> [pt1, pt2]

		// Compute all merges (including supermerges)
		this.merges = [];
		this.computeAllMerges();
	}

	/**
	 * Check if a pretoken is a single token (eligible for supermerge)
	 */
	isSingleToken(pt, ptTrained) {
		return ptTrained[pt] && ptTrained[pt].length === 1;
	}

	/**
	 * Count supermerge frequencies (adjacent pretokens that are both single tokens)
	 */
	countSupermerges(ptTrained) {
		const supermergeFreqs = {};

		// Go through the original sequence to find adjacent pretokens
		for (let i = 0; i < this.preTokenSequence.length - 1; i++) {
			const pt1 = this.preTokenSequence[i];
			const pt2 = this.preTokenSequence[i + 1];

			// Both must be single tokens to be eligible for supermerge
			if (this.isSingleToken(pt1, ptTrained) && this.isSingleToken(pt2, ptTrained)) {
				const superword = pt1 + pt2;
				supermergeFreqs[superword] = (supermergeFreqs[superword] || 0) + 1;
			}
		}

		return supermergeFreqs;
	}

	/**
	 * Apply a supermerge: combine two pretokens into a superword
	 */
	applySupermerge(ptTrained, pt1, pt2, superword) {
		// The superword becomes a new "pretoken" with the merged content
		const token1 = ptTrained[pt1][0];
		const token2 = ptTrained[pt2][0];
		const mergedToken = token1 + token2;

		// Count occurrences of this adjacency
		let count = 0;
		for (let i = 0; i < this.preTokenSequence.length - 1; i++) {
			if (this.preTokenSequence[i] === pt1 && this.preTokenSequence[i + 1] === pt2) {
				count++;
			}
		}

		// Add superword to ptTrained
		ptTrained[superword] = [mergedToken];

		// Update pretoken sequence
		const newSequence = [];
		let i = 0;
		while (i < this.preTokenSequence.length) {
			if (
				i < this.preTokenSequence.length - 1 &&
				this.preTokenSequence[i] === pt1 &&
				this.preTokenSequence[i + 1] === pt2
			) {
				newSequence.push(superword);
				i += 2;
			} else {
				newSequence.push(this.preTokenSequence[i]);
				i++;
			}
		}
		this.preTokenSequence = newSequence;

		// Update pretoken counts
		this.preTokenCounts[superword] = count;

		return mergedToken;
	}

	computeAllMerges() {
		// Work on copies
		let ptTrained = {};
		for (const [pt, tokens] of Object.entries(this.preTokensTrained)) {
			ptTrained[pt] = [...tokens];
		}

		let localVocab = { ...this.vocab };
		let localVi = this.vocabIndex;

		// Reset sequence for computation
		this.preTokenSequence = preTokenize(this.originalText);

		for (let round = 0; round < this.maxMerges; round++) {
			// Count regular pair frequencies (within pretokens)
			const pairFreqs = {};
			for (const [pt, tokens] of Object.entries(ptTrained)) {
				const count = this.preTokenCounts[pt] || 0;
				if (count === 0) continue;
				for (let i = 0; i < tokens.length - 1; i++) {
					const pair = tokens[i] + '|' + tokens[i + 1];
					pairFreqs[pair] = (pairFreqs[pair] || 0) + count;
				}
			}

			// Count supermerge frequencies
			const supermergeFreqs = this.countSupermerges(ptTrained);

			// Find best regular merge
			let bestRegularPair = null;
			let bestRegularFreq = 0;
			let bestRegularToken = null;

			if (Object.keys(pairFreqs).length > 0) {
				const sortedPairs = sortPairs(Object.entries(pairFreqs));
				for (const [pair, freq] of sortedPairs) {
					const [t1, t2] = pair.split('|');
					const merged = t1 + t2;
					if (!(merged in localVocab)) {
						bestRegularPair = pair;
						bestRegularFreq = freq;
						bestRegularToken = merged;
						break;
					}
				}
			}

			// Find best supermerge
			let bestSupermerge = null;
			let bestSupermergeFreq = 0;

			const sortedSupermerges = Object.entries(supermergeFreqs).sort((a, b) => b[1] - a[1]);

			for (const [superword, freq] of sortedSupermerges) {
				// Find the component pretokens
				for (let i = 0; i < this.preTokenSequence.length - 1; i++) {
					const pt1 = this.preTokenSequence[i];
					const pt2 = this.preTokenSequence[i + 1];
					if (
						pt1 + pt2 === superword &&
						this.isSingleToken(pt1, ptTrained) &&
						this.isSingleToken(pt2, ptTrained)
					) {
						const mergedToken = ptTrained[pt1][0] + ptTrained[pt2][0];
						if (!(mergedToken in localVocab)) {
							bestSupermerge = { pt1, pt2, superword };
							bestSupermergeFreq = freq;
							break;
						}
					}
				}
				if (bestSupermerge) break;
			}

			// Decide: regular merge or supermerge?
			const doSupermerge = bestSupermergeFreq > bestRegularFreq && bestSupermerge;
			const doRegular = bestRegularFreq >= 2 && bestRegularPair;

			if (!doSupermerge && !doRegular) break;

			if (doSupermerge && (!doRegular || bestSupermergeFreq > bestRegularFreq)) {
				// Perform supermerge
				const { pt1, pt2, superword } = bestSupermerge;
				const token1 = ptTrained[pt1][0];
				const token2 = ptTrained[pt2][0];
				const mergedToken = token1 + token2;

				// Store merge info
				this.merges.push({
					step: round + 1,
					token1,
					token2,
					newToken: mergedToken,
					count: bestSupermergeFreq,
					isSupermerge: true,
					superword,
					pt1,
					pt2,
					pairFreqs: { ...pairFreqs },
					supermergeFreqs: { ...supermergeFreqs },
					ptTrainedBefore: JSON.parse(JSON.stringify(ptTrained))
				});

				// Apply supermerge
				this.applySupermerge(ptTrained, pt1, pt2, superword);
				localVocab[mergedToken] = localVi++;
				this.superwords.set(superword, [pt1, pt2]);
			} else if (doRegular) {
				// Perform regular merge
				const [token1, token2] = bestRegularPair.split('|');

				this.merges.push({
					step: round + 1,
					token1,
					token2,
					newToken: bestRegularToken,
					count: bestRegularFreq,
					isSupermerge: false,
					pairFreqs: { ...pairFreqs },
					supermergeFreqs: { ...supermergeFreqs },
					ptTrainedBefore: JSON.parse(JSON.stringify(ptTrained))
				});

				// Add to vocabulary
				localVocab[bestRegularToken] = localVi++;

				// Apply merge to all pre-tokens
				for (const [pt, tokens] of Object.entries(ptTrained)) {
					const newTokens = [];
					let i = 0;
					while (i < tokens.length) {
						if (i < tokens.length - 1 && tokens[i] === token1 && tokens[i + 1] === token2) {
							newTokens.push(bestRegularToken);
							i += 2;
						} else {
							newTokens.push(tokens[i]);
							i++;
						}
					}
					ptTrained[pt] = newTokens;
				}
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

		// Reset sequence
		let sequence = preTokenize(this.originalText);
		let localPreTokenCounts = { ...this.preTokenCounts };

		for (let i = 0; i < step; i++) {
			const merge = this.merges[i];

			if (merge.isSupermerge) {
				// Apply supermerge
				const { pt1, pt2, superword } = merge;
				const token1 = ptTrained[pt1][0];
				const token2 = ptTrained[pt2][0];
				const mergedToken = token1 + token2;

				// Count and update sequence
				let count = 0;
				const newSequence = [];
				let j = 0;
				while (j < sequence.length) {
					if (j < sequence.length - 1 && sequence[j] === pt1 && sequence[j + 1] === pt2) {
						newSequence.push(superword);
						count++;
						j += 2;
					} else {
						newSequence.push(sequence[j]);
						j++;
					}
				}
				sequence = newSequence;
				ptTrained[superword] = [mergedToken];
				localPreTokenCounts[superword] = count;
			} else {
				// Apply regular merge
				for (const [pt, tokens] of Object.entries(ptTrained)) {
					const newTokens = [];
					let j = 0;
					while (j < tokens.length) {
						if (
							j < tokens.length - 1 &&
							tokens[j] === merge.token1 &&
							tokens[j + 1] === merge.token2
						) {
							newTokens.push(merge.newToken);
							j += 2;
						} else {
							newTokens.push(tokens[j]);
							j++;
						}
					}
					ptTrained[pt] = newTokens;
				}
			}
		}

		return { ptTrained, sequence, preTokenCounts: localPreTokenCounts };
	}

	/**
	 * Get total token count at a step
	 */
	getTokenCount(step) {
		const { ptTrained, preTokenCounts } = this.getTokensAtStep(step);
		let count = 0;
		for (const [pt, tokens] of Object.entries(ptTrained)) {
			const ptCount = preTokenCounts[pt] || 0;
			count += tokens.length * ptCount;
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
			isBase: true,
			isSupermerge: false
		}));

		for (let i = 0; i < step; i++) {
			const merge = this.merges[i];
			vocab.push({
				token: merge.newToken,
				from: merge.isSupermerge
					? `${merge.token1} ⊕ ${merge.token2}`
					: `${merge.token1} + ${merge.token2}`,
				count: merge.count,
				step: merge.step,
				isBase: false,
				isSupermerge: merge.isSupermerge
			});
		}

		return vocab;
	}
}
