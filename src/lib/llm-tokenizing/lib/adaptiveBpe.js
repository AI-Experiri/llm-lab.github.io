import { preTokenize, countPreTokens, sortPairs, applyMerge } from './utils.js';

/**
 * Adaptive BPE Algorithm (AdaptBPE)
 * Based on "Adaptive BPE Tokenization for Enhanced Vocabulary Adaptation
 * in Finetuning Pretrained Language Models" (arXiv:2410.03258) - October 2024
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * IMPROVES UPON: Standard BPE
 * PROBLEM SOLVED: Poor utilization of domain-specific vocabulary during fine-tuning
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * THE PROBLEM:
 * ────────────
 * When fine-tuning a model for a domain (medical, legal, code), you add
 * domain-specific tokens. But standard BPE's merge rules were learned on
 * general text, so domain terms get fragmented:
 *
 *   Standard BPE:  "myocardial" → ["my", "oc", "ard", "ial"]
 *   With AdaptBPE: "myocardial" → ["myocardial"] (if in domain vocab)
 *
 * THE SOLUTION:
 * ─────────────
 * BEFORE character splitting, perform LONGEST SUBSTRING MATCHING:
 *
 *   1. Input: "myocardialinfarction"
 *   2. Check domain vocab for longest match from start
 *   3. Found: "myocardial" (10 chars) → preserve as single token
 *   4. Remaining: "infarction" → check again
 *   5. Found: "infarction" (10 chars) → preserve
 *   6. Result: ["myocardial", "infarction"]
 *
 * If no match found, fall back to character-level splitting and standard BPE.
 *
 * VISUALIZATION:
 * ──────────────
 * • Cyan tokens = matched from domain vocabulary
 * • Enter domain terms in the input field
 * • Watch how they're preserved during tokenization
 *
 * USE CASES:
 * ──────────
 * • Medical: Drug names, conditions, procedures
 * • Legal: Legal terms, case citations
 * • Code: Function names, keywords, library names
 * • Scientific: Chemical compounds, species names
 */
export class AdaptiveBPE {
	constructor(text, maxMerges = 10, domainVocab = []) {
		this.originalText = text;
		this.maxMerges = maxMerges;
		this.domainVocab = new Set(domainVocab);
		this.reset();
	}

	/**
	 * Update domain vocabulary and recompute
	 */
	setDomainVocab(vocab) {
		this.domainVocab = new Set(vocab);
		this.reset();
	}

	reset() {
		// Pre-tokenize and count
		const chunks = preTokenize(this.originalText);
		this.preTokenCounts = countPreTokens(chunks);

		// Initialize with AdaptBPE: longest substring matching first
		this.preTokensTrained = {};
		this.substringMatches = {}; // Track which substrings were matched

		for (const pt of Object.keys(this.preTokenCounts)) {
			const { tokens, matches } = this.adaptiveInitialize(pt);
			this.preTokensTrained[pt] = tokens;
			this.substringMatches[pt] = matches;
		}

		// Build base vocabulary (includes domain vocab tokens)
		this.vocab = {};
		this.vocabIndex = 0;
		const baseChars = new Set();

		// Add all characters from initialized tokens
		for (const pt of Object.keys(this.preTokensTrained)) {
			for (const token of this.preTokensTrained[pt]) {
				// If it's a domain vocab match, add as single token
				if (this.domainVocab.has(token)) {
					if (!(token in this.vocab)) {
						this.vocab[token] = this.vocabIndex++;
					}
				} else {
					// Otherwise add individual characters
					for (const char of token) {
						baseChars.add(char);
					}
				}
			}
		}

		this.baseVocab = Array.from(baseChars).sort();
		for (const char of this.baseVocab) {
			if (!(char in this.vocab)) {
				this.vocab[char] = this.vocabIndex++;
			}
		}

		// Add domain vocab to base vocab list for display
		this.domainVocabList = Array.from(this.domainVocab).sort();

		// Compute all merges
		this.merges = [];
		this.computeAllMerges();
	}

	/**
	 * AdaptBPE initialization: longest substring matching
	 * Instead of splitting to characters, find longest matches in domain vocab first
	 */
	adaptiveInitialize(text) {
		const tokens = [];
		const matches = []; // Track matched substrings for visualization
		let remaining = text;
		let position = 0;

		while (remaining.length > 0) {
			// Find longest substring match in domain vocab
			let longestMatch = null;
			let longestLength = 0;

			for (const term of this.domainVocab) {
				if (remaining.startsWith(term) && term.length > longestLength) {
					longestMatch = term;
					longestLength = term.length;
				}
			}

			if (longestMatch) {
				// Found a domain vocab match - preserve it
				tokens.push(longestMatch);
				matches.push({
					term: longestMatch,
					start: position,
					end: position + longestLength
				});
				remaining = remaining.slice(longestLength);
				position += longestLength;
			} else {
				// No match - take single character
				tokens.push(remaining[0]);
				remaining = remaining.slice(1);
				position += 1;
			}
		}

		return { tokens, matches };
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

			// Sort pairs (standard BPE sorting)
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
		// Base characters
		const vocab = this.baseVocab.map((char) => ({
			token: char,
			from: null,
			count: null,
			step: 0,
			isBase: true,
			isDomain: false
		}));

		// Domain vocabulary (preserved during initialization)
		for (const term of this.domainVocabList) {
			vocab.push({
				token: term,
				from: 'domain vocab',
				count: null,
				step: 0,
				isBase: false,
				isDomain: true
			});
		}

		// Learned merges
		for (let i = 0; i < step; i++) {
			const merge = this.merges[i];
			vocab.push({
				token: merge.newToken,
				from: `${merge.token1} + ${merge.token2}`,
				count: merge.count,
				step: merge.step,
				isBase: false,
				isDomain: false
			});
		}

		return vocab;
	}

	/**
	 * Get substring matches for visualization
	 */
	getSubstringMatches() {
		return this.substringMatches;
	}
}
