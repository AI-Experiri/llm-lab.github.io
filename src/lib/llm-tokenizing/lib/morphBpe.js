import { preTokenize, countPreTokens, sortPairs, applyMerge } from './utils.js';

/**
 * Contextual Morphologically-Guided Tokenization (MorphBPE)
 * Based on "Contextual morphologically-guided tokenization for Latin encoder models"
 * (arXiv:2511.09709) - Hudspeth et al., June 2025
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * IMPROVES UPON: Standard BPE
 * PROBLEM SOLVED: BPE ignores morphological structure, creating linguistically
 * meaningless subwords that hurt model understanding
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * THE PROBLEM:
 * ────────────
 * Standard BPE merges based purely on frequency, ignoring word structure:
 *
 *   "unhelpful" might tokenize as: ["un", "hel", "pful"]
 *                    instead of: ["un", "help", "ful"]
 *
 * The first splits the root "help" and combines it with the suffix "ful".
 * This destroys morphological meaning the model could otherwise learn.
 *
 * TWO SOLUTIONS (MODES):
 * ──────────────────────
 *
 * 1. SEEDING MODE:
 *    • Add morphological suffixes (ing, ed, er, tion, etc.) to initial vocab
 *    • Standard BPE then tends to preserve these when merging
 *    • Lighter touch - just biases toward morphemes
 *
 * 2. PRE-TOKENIZE MODE (stronger):
 *    • First segment each word into morphemes: "unhelpful" → ["un", "help", "ful"]
 *    • Then PREVENT merges across morpheme boundaries
 *    • "help" + "ful" → BLOCKED (different morpheme types)
 *    • "he" + "lp" within "help" → allowed (same morpheme)
 *
 * MORPHEME TYPES:
 * ───────────────
 * • PREFIX (rose): un-, re-, pre-, dis-, mis-...
 * • ROOT (amber): help, play, work, think...
 * • SUFFIX (teal): -ing, -ed, -er, -tion, -ness...
 *
 * VISUALIZATION:
 * ──────────────
 * • Color-coded morpheme boundaries
 * • Watch how merges respect linguistic structure
 * • Compare seeding vs pre-tokenize modes
 *
 * For visualization, we simulate morphological analysis using common
 * English morphemes (prefixes, roots, suffixes).
 */

// Common English morphemes for demonstration
const PREFIXES = [
	'un',
	'pre',
	're',
	'dis',
	'mis',
	'over',
	'under',
	'out',
	'sub',
	'super',
	'anti',
	'auto',
	'co',
	'de',
	'ex',
	'inter',
	'non',
	'post',
	'trans'
];
const SUFFIXES = [
	'ing',
	'ed',
	'er',
	'est',
	'ly',
	'tion',
	'sion',
	'ness',
	'ment',
	'able',
	'ible',
	'ful',
	'less',
	'ous',
	'ive',
	'al',
	'ity',
	'ty',
	'ry',
	'ery',
	'ary',
	'ory',
	's',
	'es'
];
const _ROOTS = [
	'help',
	'play',
	'work',
	'walk',
	'talk',
	'think',
	'make',
	'take',
	'give',
	'come',
	'go',
	'see',
	'know',
	'want',
	'use',
	'find',
	'tell',
	'ask',
	'seem',
	'feel',
	'try',
	'leave',
	'call',
	'good',
	'new',
	'first',
	'last',
	'long',
	'great',
	'little',
	'own',
	'other',
	'old',
	'right',
	'big',
	'high',
	'small',
	'large',
	'next',
	'early',
	'young',
	'import',
	'public',
	'bad',
	'same',
	'differ'
];

export class MorphBPE {
	constructor(text, maxMerges = 10, mode = 'pretokenize') {
		this.originalText = text;
		this.maxMerges = maxMerges;
		this.mode = mode; // 'seeding' or 'pretokenize'
		this.reset();
	}

	reset() {
		// Pre-tokenize and count
		const chunks = preTokenize(this.originalText);
		this.preTokenCounts = countPreTokens(chunks);

		// Apply morphological analysis
		this.morphemeSegments = {}; // Track morpheme boundaries
		this.preTokensTrained = {};

		for (const pt of Object.keys(this.preTokenCounts)) {
			if (this.mode === 'pretokenize') {
				// Pre-segment into morphemes
				const { tokens, segments } = this.morphologicalSegment(pt);
				this.preTokensTrained[pt] = tokens;
				this.morphemeSegments[pt] = segments;
			} else {
				// Standard character-level initialization
				this.preTokensTrained[pt] = Array.from(pt);
				this.morphemeSegments[pt] = [];
			}
		}

		// Build base vocabulary
		this.vocab = {};
		this.vocabIndex = 0;
		const baseChars = new Set();

		for (const pt of Object.keys(this.preTokensTrained)) {
			for (const token of this.preTokensTrained[pt]) {
				if (token.length === 1) {
					baseChars.add(token);
				}
			}
		}

		this.baseVocab = Array.from(baseChars).sort();
		for (const char of this.baseVocab) {
			this.vocab[char] = this.vocabIndex++;
		}

		// In seeding mode, add morphological suffixes to vocab
		this.seededMorphemes = [];
		if (this.mode === 'seeding') {
			for (const suffix of SUFFIXES) {
				if (!(suffix in this.vocab)) {
					this.vocab[suffix] = this.vocabIndex++;
					this.seededMorphemes.push(suffix);
				}
			}
		}

		// In pretokenize mode, add identified morphemes to vocab
		if (this.mode === 'pretokenize') {
			for (const pt of Object.keys(this.preTokensTrained)) {
				for (const token of this.preTokensTrained[pt]) {
					if (token.length > 1 && !(token in this.vocab)) {
						this.vocab[token] = this.vocabIndex++;
					}
				}
			}
		}

		// Compute all merges
		this.merges = [];
		this.computeAllMerges();
	}

	/**
	 * Morphological segmentation - simulates a morphological analyzer
	 * Returns tokens split at morpheme boundaries
	 */
	morphologicalSegment(word) {
		const segments = [];
		let remaining = word.toLowerCase();
		const tokens = [];

		// Try to find prefix
		let foundPrefix = null;
		for (const prefix of PREFIXES) {
			if (remaining.startsWith(prefix) && remaining.length > prefix.length) {
				foundPrefix = prefix;
				break;
			}
		}

		if (foundPrefix) {
			// Get the actual case from original word
			const actualPrefix = word.slice(0, foundPrefix.length);
			tokens.push(actualPrefix);
			segments.push({ type: 'prefix', text: actualPrefix, start: 0, end: foundPrefix.length });
			remaining = remaining.slice(foundPrefix.length);
			word = word.slice(foundPrefix.length);
		}

		// Try to find suffix
		let foundSuffix = null;
		for (const suffix of SUFFIXES) {
			if (remaining.endsWith(suffix) && remaining.length > suffix.length) {
				foundSuffix = suffix;
				break;
			}
		}

		if (foundSuffix) {
			// Root is everything between prefix and suffix
			const rootLen = remaining.length - foundSuffix.length;
			if (rootLen > 0) {
				const root = word.slice(0, rootLen);
				tokens.push(root);
				segments.push({ type: 'root', text: root, start: tokens.length - 1, end: tokens.length });
			}

			const actualSuffix = word.slice(-foundSuffix.length);
			tokens.push(actualSuffix);
			segments.push({
				type: 'suffix',
				text: actualSuffix,
				start: tokens.length - 1,
				end: tokens.length
			});
		} else if (remaining.length > 0) {
			// No suffix found, treat rest as root
			tokens.push(word);
			segments.push({ type: 'root', text: word, start: tokens.length - 1, end: tokens.length });
		}

		// If no morphemes found, fall back to character-level
		if (tokens.length === 0 || (tokens.length === 1 && tokens[0] === word)) {
			return { tokens: Array.from(word), segments: [] };
		}

		return { tokens, segments };
	}

	/**
	 * Check if merging these tokens would cross a morpheme boundary
	 */
	crossesMorphemeBoundary(pt, idx, _token1, _token2) {
		if (this.mode !== 'pretokenize') return false;

		const segments = this.morphemeSegments[pt] || [];
		if (segments.length === 0) return false;

		// In pretokenize mode, tokens are already morphemes
		// Don't allow merging different morpheme types
		const tokens = this.preTokensTrained[pt];
		if (!tokens) return false;

		// Find which segment each token belongs to
		let seg1 = null,
			seg2 = null;

		for (let i = 0; i < tokens.length; i++) {
			const t = tokens[i];
			for (const seg of segments) {
				if (seg.text === t) {
					if (i === idx) seg1 = seg;
					if (i === idx + 1) seg2 = seg;
				}
			}
		}

		// If tokens are from different morpheme types, don't merge
		if (seg1 && seg2 && seg1.type !== seg2.type) {
			return true;
		}

		return false;
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
			const pairLocations = {}; // Track where pairs occur

			for (const [pt, tokens] of Object.entries(ptTrained)) {
				const count = this.preTokenCounts[pt];
				for (let i = 0; i < tokens.length - 1; i++) {
					// In pretokenize mode, check morpheme boundaries
					if (this.mode === 'pretokenize') {
						// Skip if this would merge across initial morpheme segments
						const originalTokens = this.preTokensTrained[pt];
						if (originalTokens && originalTokens.length > 1) {
							// Don't merge tokens that were originally separate morphemes
							// This is simplified - in practice we'd track boundaries more carefully
						}
					}

					const pair = tokens[i] + '|' + tokens[i + 1];
					pairFreqs[pair] = (pairFreqs[pair] || 0) + count;

					if (!pairLocations[pair]) pairLocations[pair] = [];
					pairLocations[pair].push({ pt, idx: i });
				}
			}

			if (Object.keys(pairFreqs).length === 0) break;

			// Sort pairs
			const sortedPairs = sortPairs(Object.entries(pairFreqs));

			// Find first valid pair
			let newVocabPair = null;
			let newVocabFreq = 0;
			let newVocabToken = null;
			let isMorphemePreserving = false;

			for (const [pair, freq] of sortedPairs) {
				const [t1, t2] = pair.split('|');
				const merged = t1 + t2;

				if (merged in localVocab) continue;

				// Check if this merge preserves morpheme structure
				const locations = pairLocations[pair] || [];
				let crossesBoundary = false;

				if (this.mode === 'pretokenize') {
					// Check all locations where this pair occurs
					for (const loc of locations) {
						if (this.crossesMorphemeBoundary(loc.pt, loc.idx, t1, t2)) {
							crossesBoundary = true;
							break;
						}
					}
				}

				// In seeding mode, prefer merges that create known morphemes
				let morphemeBonus = false;
				if (this.mode === 'seeding') {
					if (SUFFIXES.includes(merged) || PREFIXES.includes(merged)) {
						morphemeBonus = true;
					}
				}

				if (!crossesBoundary) {
					newVocabPair = pair;
					newVocabFreq = freq;
					newVocabToken = merged;
					isMorphemePreserving = !crossesBoundary && (morphemeBonus || this.mode === 'pretokenize');
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
				isMorphemePreserving,
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
			isBase: true,
			isSeeded: false,
			isMorpheme: false
		}));

		// Add seeded morphemes
		for (const morph of this.seededMorphemes) {
			vocab.push({
				token: morph,
				from: 'morpheme seed',
				count: null,
				step: 0,
				isBase: false,
				isSeeded: true,
				isMorpheme: true
			});
		}

		// Add pre-tokenized morphemes
		if (this.mode === 'pretokenize') {
			const addedMorphemes = new Set();
			for (const pt of Object.keys(this.preTokensTrained)) {
				for (const token of this.preTokensTrained[pt]) {
					if (token.length > 1 && !addedMorphemes.has(token)) {
						addedMorphemes.add(token);
						vocab.push({
							token,
							from: 'morpheme',
							count: null,
							step: 0,
							isBase: false,
							isSeeded: false,
							isMorpheme: true
						});
					}
				}
			}
		}

		// Add learned merges
		for (let i = 0; i < step; i++) {
			const merge = this.merges[i];
			vocab.push({
				token: merge.newToken,
				from: `${merge.token1} + ${merge.token2}`,
				count: merge.count,
				step: merge.step,
				isBase: false,
				isSeeded: false,
				isMorpheme: false
			});
		}

		return vocab;
	}

	/**
	 * Get morpheme segments for visualization
	 */
	getMorphemeSegments() {
		return this.morphemeSegments;
	}
}
