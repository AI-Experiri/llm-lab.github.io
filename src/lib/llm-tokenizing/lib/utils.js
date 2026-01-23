// GPT-2/GPT-4 pre-tokenization regex
export const PRE_TOKENIZE_REGEX =
	/'(?:[sdmt]|ll|ve|re)| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu;

/**
 * Pre-tokenize text using GPT-2/GPT-4 style regex
 * @param {string} text - Input text
 * @returns {string[]} Array of pre-tokens
 */
export function preTokenize(text) {
	return text.match(PRE_TOKENIZE_REGEX) || [];
}

/**
 * Count pre-token frequencies
 * @param {string[]} chunks - Array of pre-tokens
 * @returns {Object} Map of pre-token to count
 */
export function countPreTokens(chunks) {
	const counts = {};
	for (const chunk of chunks) {
		counts[chunk] = (counts[chunk] || 0) + 1;
	}
	return counts;
}

/**
 * Display-safe string (replace spaces and newlines with visible chars)
 * @param {string} str - Input string
 * @returns {string} Display-safe string
 */
export function toDisplay(str) {
	return str.replace(/ /g, '␣').replace(/\n/g, '↵').replace(/\t/g, '→');
}

/**
 * Sleep utility for animations
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after ms
 */
export function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Sort pairs by frequency (desc), length (desc), lexicographically (desc)
 * Matches Python: sorted(..., key=lambda t:(t[1], len(t[0]), mix_to_bytes(t[0])), reverse=True)
 * @param {Array} pairs - Array of [pair, count] entries
 * @returns {Array} Sorted array
 */
export function sortPairs(pairs) {
	return pairs.sort((a, b) => {
		// 1. Frequency descending
		if (b[1] !== a[1]) return b[1] - a[1];

		// 2. Length descending (longer pairs first)
		const [t1a, t2a] = a[0].split('|');
		const [t1b, t2b] = b[0].split('|');
		const lenA = t1a.length + t2a.length;
		const lenB = t1b.length + t2b.length;
		if (lenB !== lenA) return lenB - lenA;

		// 3. Lexicographically descending (max token first)
		return b[0].localeCompare(a[0]);
	});
}

/**
 * Apply a single merge to a token list
 * @param {string[]} tokens - Current token list
 * @param {string} token1 - First token of pair
 * @param {string} token2 - Second token of pair
 * @param {string} newToken - Merged token
 * @returns {string[]} New token list after merge
 */
export function applyMerge(tokens, token1, token2, newToken) {
	const result = [];
	let i = 0;
	while (i < tokens.length) {
		if (i < tokens.length - 1 && tokens[i] === token1 && tokens[i + 1] === token2) {
			result.push(newToken);
			i += 2;
		} else {
			result.push(tokens[i]);
			i++;
		}
	}
	return result;
}
