import { preTokenize, countPreTokens, sortPairs, applyMerge } from './utils.js';

/**
 * Scaffold-BPE Algorithm
 * Based on "Scaffold-BPE: Enhancing Byte Pair Encoding with Simple and Effective
 * Scaffold Token Removal" (arXiv:2404.17808) - April 2024
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * IMPROVES UPON: Standard BPE
 * PROBLEM SOLVED: Learning imbalance from rarely-used intermediate tokens
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * THE PROBLEM:
 * ────────────
 * During BPE training, some tokens are created as stepping stones:
 *   "l" + "o" → "lo"   (might merge)
 *   "lo" + "w" → "low" (final useful token)
 *
 * After "low" is created, "lo" might rarely appear on its own. These
 * "scaffold tokens" waste vocabulary space and cause learning issues.
 *
 * THE SOLUTION:
 * ─────────────
 * 1. During training, detect when a component token becomes a scaffold
 * 2. Scaffold criterion: remainingFreq(token) < freq(next_best_pair)
 * 3. Mark these tokens as "scaffolds"
 * 4. During encoding, "demolish" scaffolds back to non-scaffold components
 *
 * VISUALIZATION:
 * ──────────────
 * • Orange tokens = scaffolds (will be demolished)
 * • nextPairFreq = threshold for scaffold detection
 * • Toggle "Demolish" to see scaffold removal
 *
 * EXAMPLE:
 * ────────
 * Step 1: Merge "e" + "s" → "es" (freq=100)
 * Step 2: Merge "es" + "t" → "est" (freq=80)
 *   → After step 2, "es" only appears 5× on its own
 *   → If next best pair has freq=20, then 5 < 20
 *   → "es" becomes a scaffold
 *
 * During encoding, "es" would be split back to "e" + "s"
 */
export class ScaffoldBPE {
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

		// Build base vocabulary (never scaffolds)
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

		// Scaffold tracking
		this.scaffoldTokens = new Set(); // Tokens marked as scaffolds
		this.tokenComponents = {}; // Map token -> [component1, component2] for demolishing

		// Compute all merges with scaffold detection
		this.merges = [];
		this.computeAllMerges();
	}

	/**
	 * Calculate token frequency in current state
	 */
	getTokenFrequency(token, ptTrained) {
		let freq = 0;
		for (const [pt, tokens] of Object.entries(ptTrained)) {
			const count = this.preTokenCounts[pt];
			for (const t of tokens) {
				if (t === token) freq += count;
			}
		}
		return freq;
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
			let nextPairFreq = 0; // Frequency of next-best pair (for scaffold threshold)
			let nextPairTokens = null; // The actual next pair tokens [t1, t2]

			for (let i = 0; i < sortedPairs.length; i++) {
				const [pair, freq] = sortedPairs[i];
				const [t1, t2] = pair.split('|');
				const merged = t1 + t2;

				if (!(merged in localVocab)) {
					newVocabPair = pair;
					newVocabFreq = freq;
					newVocabToken = merged;

					// Find next pair frequency for scaffold threshold
					for (let j = i + 1; j < sortedPairs.length; j++) {
						const [nextPair, nextFreq] = sortedPairs[j];
						const [nt1, nt2] = nextPair.split('|');
						const nextMerged = nt1 + nt2;
						if (!(nextMerged in localVocab)) {
							nextPairFreq = nextFreq;
							nextPairTokens = [nt1, nt2];
							break;
						}
					}
					break;
				}
			}

			if (!newVocabPair || newVocabFreq < 2) break;

			const [token1, token2] = newVocabPair.split('|');

			// Store components for demolishing
			this.tokenComponents[newVocabToken] = [token1, token2];

			// Check if the new token was previously a scaffold - unmark it
			if (this.scaffoldTokens.has(newVocabToken)) {
				this.scaffoldTokens.delete(newVocabToken);
			}

			// Apply merge first to get new frequencies
			let ptTrainedAfter = {};
			for (const [pt, tokens] of Object.entries(ptTrained)) {
				ptTrainedAfter[pt] = applyMerge(tokens, token1, token2, newVocabToken);
			}

			// SCAFFOLD DETECTION: Check if component tokens become scaffolds
			// A token becomes scaffold if its remaining frequency < next pair frequency
			const scaffoldsThisRound = [];

			for (const componentToken of [token1, token2]) {
				// Skip base vocab - they're never scaffolds
				if (this.baseVocab.includes(componentToken)) continue;

				const remainingFreq = this.getTokenFrequency(componentToken, ptTrainedAfter);

				// Scaffold criterion: f(component) < f(next_best_pair)
				if (remainingFreq < nextPairFreq && remainingFreq > 0) {
					if (!this.scaffoldTokens.has(componentToken)) {
						this.scaffoldTokens.add(componentToken);
						scaffoldsThisRound.push({
							token: componentToken,
							remainingFreq,
							threshold: nextPairFreq,
							nextPairTokens
						});
					}
				}
			}

			// Store merge info with scaffold information
			this.merges.push({
				step: round + 1,
				token1,
				token2,
				newToken: newVocabToken,
				count: newVocabFreq,
				pairFreqs: { ...pairFreqs },
				ptTrainedBefore: JSON.parse(JSON.stringify(ptTrained)),
				nextPairFreq,
				scaffoldsMarked: scaffoldsThisRound,
				currentScaffolds: new Set(this.scaffoldTokens)
			});

			// Add to vocabulary
			localVocab[newVocabToken] = localVi++;

			// Update state
			ptTrained = ptTrainedAfter;
		}
	}

	/**
	 * Demolish scaffold tokens into non-scaffold components
	 */
	demolishToken(token) {
		if (!this.scaffoldTokens.has(token)) {
			return [token];
		}

		const components = this.tokenComponents[token];
		if (!components) {
			return [token];
		}

		// Recursively demolish components
		const result = [];
		for (const comp of components) {
			result.push(...this.demolishToken(comp));
		}
		return result;
	}

	/**
	 * Get tokens at a specific step (with scaffold marking)
	 */
	getTokensAtStep(step, demolish = false) {
		let ptTrained = {};
		for (const [pt, tokens] of Object.entries(this.preTokensTrained)) {
			ptTrained[pt] = [...tokens];
		}

		// Apply merges up to step
		for (let i = 0; i < step; i++) {
			const merge = this.merges[i];
			for (const [pt, tokens] of Object.entries(ptTrained)) {
				ptTrained[pt] = applyMerge(tokens, merge.token1, merge.token2, merge.newToken);
			}
		}

		// Get scaffold set at this step
		const scaffoldsAtStep = step > 0 ? this.merges[step - 1].currentScaffolds : new Set();

		// Optionally demolish scaffolds
		if (demolish) {
			for (const [pt, tokens] of Object.entries(ptTrained)) {
				const demolishedTokens = [];
				for (const token of tokens) {
					if (scaffoldsAtStep.has(token)) {
						demolishedTokens.push(...this.demolishToken(token));
					} else {
						demolishedTokens.push(token);
					}
				}
				ptTrained[pt] = demolishedTokens;
			}
		}

		return { ptTrained, scaffolds: scaffoldsAtStep };
	}

	/**
	 * Get total token count at a step
	 */
	getTokenCount(step, demolish = false) {
		const { ptTrained } = this.getTokensAtStep(step, demolish);
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
	 * Get vocabulary at a specific step (with scaffold marking)
	 */
	getVocabAtStep(step) {
		const scaffoldsAtStep = step > 0 ? this.merges[step - 1].currentScaffolds : new Set();

		const vocab = this.baseVocab.map((char) => ({
			token: char,
			from: null,
			count: null,
			step: 0,
			isBase: true,
			isScaffold: false
		}));

		for (let i = 0; i < step; i++) {
			const merge = this.merges[i];
			vocab.push({
				token: merge.newToken,
				from: `${merge.token1} + ${merge.token2}`,
				count: merge.count,
				step: merge.step,
				isBase: false,
				isScaffold: scaffoldsAtStep.has(merge.newToken)
			});
		}

		return vocab;
	}
}
