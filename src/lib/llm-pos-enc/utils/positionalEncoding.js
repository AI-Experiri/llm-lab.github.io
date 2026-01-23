// ABOUTME: Positional encoding calculations from "Attention Is All You Need"
// ABOUTME: Implements sinusoidal PE formula: PE(pos,2i)=sin(pos/10000^(2i/d)), PE(pos,2i+1)=cos(pos/10000^(2i/d))

/**
 * Calculate positional encoding value for a single position and dimension
 * @param {number} pos - Position in sequence (0-indexed)
 * @param {number} i - Dimension index (0-indexed)
 * @param {number} dModel - Model dimension (typically 512)
 * @returns {number} The positional encoding value
 */
export function getPositionalEncodingValue(pos, i, dModel) {
	const dimPair = Math.floor(i / 2);
	const angle = pos / Math.pow(10000, (2 * dimPair) / dModel);

	if (i % 2 === 0) {
		return Math.sin(angle);
	} else {
		return Math.cos(angle);
	}
}

/**
 * Generate positional encoding matrix for visualization
 * @param {number} maxPosition - Maximum sequence length
 * @param {number} dModel - Model dimension
 * @returns {number[][]} 2D array [position][dimension]
 */
export function generatePositionalEncodingMatrix(maxPosition, dModel) {
	const matrix = [];

	for (let pos = 0; pos < maxPosition; pos++) {
		const row = [];
		for (let i = 0; i < dModel; i++) {
			row.push(getPositionalEncodingValue(pos, i, dModel));
		}
		matrix.push(row);
	}

	return matrix;
}

/**
 * Calculate wavelength for a given dimension
 * The wavelength tells us how many positions before the pattern repeats
 * @param {number} i - Dimension index
 * @param {number} dModel - Model dimension
 * @returns {number} Wavelength in positions
 */
export function getWavelength(i, dModel) {
	const dimPair = Math.floor(i / 2);
	return 2 * Math.PI * Math.pow(10000, (2 * dimPair) / dModel);
}

/**
 * Calculate dot product between two position encodings
 * Shows how similarity decreases with distance
 * @param {number} pos1 - First position
 * @param {number} pos2 - Second position
 * @param {number} dModel - Model dimension
 * @returns {number} Dot product (similarity measure)
 */
export function positionDotProduct(pos1, pos2, dModel) {
	let dotProduct = 0;

	for (let i = 0; i < dModel; i++) {
		const val1 = getPositionalEncodingValue(pos1, i, dModel);
		const val2 = getPositionalEncodingValue(pos2, i, dModel);
		dotProduct += val1 * val2;
	}

	return dotProduct;
}

/**
 * Generate dot product similarity matrix between positions
 * @param {number} maxPosition - Maximum sequence length
 * @param {number} dModel - Model dimension
 * @returns {number[][]} 2D similarity matrix
 */
export function generateSimilarityMatrix(maxPosition, dModel) {
	const matrix = [];

	for (let i = 0; i < maxPosition; i++) {
		const row = [];
		for (let j = 0; j < maxPosition; j++) {
			row.push(positionDotProduct(i, j, dModel));
		}
		matrix.push(row);
	}

	return matrix;
}
