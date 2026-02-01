// ABOUTME: Multi-Query Attention drawing function
// ABOUTME: Exports drawAttentionHead that uses connectors for arrow connections

import {
	createMatrix,
	createPoint,
	connect,
	connectPath,
	connectL,
	connectFanOut
} from './connectMatrix.js';

/**
 * Draws a complete attention head diagram into an SVG group.
 * Returns dimensions info for viewbox fitting.
 *
 * @param {SVG.Container} parentGroup - SVG.js group to draw into
 * @param {Object} options - Configuration options
 * @param {Object} options.mathjax - MathJax instance for LaTeX rendering
 * @param {string} [options.instanceId='default'] - Unique ID for SVG element namespacing
 * @param {boolean} [options.showX=true] - Show X input matrix
 * @param {boolean} [options.showHeadLabel=true] - Show "ATTENTION HEAD" label
 * @param {boolean} [options.highlight=false] - Highlight matrices
 * @param {string} [options.highlightColor='#fde047'] - Highlight color
 * @param {boolean} [options.showLabels=true] - Show matrix labels
 * @param {number} [options.offsetX=0] - X offset for positioning
 * @param {number} [options.offsetY=0] - Y offset for positioning
 * @param {string} [options.headLabelText='ATTENTION HEAD'] - Custom label text
 * @param {string} [options.smearColor=null] - If set, use this single color for all matrices (shadow effect)
 * @param {string} [options.arrowColor='#9ca3af'] - Color for arrows and connectors
 * @param {boolean} [options.showSharedKV=true] - Show shared K/V matrices (W_K, K, W_V, V) and their arrows
 * @param {number} [options.kvXAdjust=0] - X adjustment for K/V position (allows K/V to be positioned independently from border)
 * @returns {Object} { group, width, height } - The drawn group and its dimensions
 */
export function drawAttentionHead(
	parentGroup,
	{
		mathjax,
		instanceId = 'default',
		showX = true,
		showHeadLabel = true,
		highlight = false,
		highlightColor = '#fde047',
		showLabels = true,
		offsetX = 0,
		offsetY = 0,
		headLabelText = 'ATTENTION HEAD',
		smearColor = null,
		arrowColor = '#9ca3af',
		headLabelWeight = 'bold',
		showSharedKV = true,
		kvXAdjust = 0
	} = {}
) {
	// Create a group for this head, offset as specified
	const content = parentGroup.group();

	// Helper to render MathJax label on a group
	let mathIdCounter = 0;
	const renderMath = (group, latex, x, y, color = '#ffffff', fontSize = 16) => {
		const container = mathjax.tex2svg(latex, { display: false });
		const svg = container.querySelector('svg');
		if (!svg) return;
		const exToPx = fontSize * 0.45;
		const w = parseFloat(svg.getAttribute('width')) * exToPx;
		const h = parseFloat(svg.getAttribute('height')) * exToPx;
		const g = group.group();
		const clone = svg.cloneNode(true);
		clone.setAttribute('width', w);
		clone.setAttribute('height', h);
		clone.querySelectorAll('path, rect').forEach((el) => el.setAttribute('fill', color));
		clone.querySelectorAll('[id]').forEach((el) => {
			const oldId = el.getAttribute('id');
			const newId = `${instanceId}-${mathIdCounter++}-${oldId}`;
			el.setAttribute('id', newId);
			clone.querySelectorAll(`[href="#${oldId}"]`).forEach((ref) => {
				ref.setAttribute('href', `#${newId}`);
			});
			clone.querySelectorAll(`[xlink\\:href="#${oldId}"]`).forEach((ref) => {
				ref.setAttribute('xlink:href', `#${newId}`);
			});
		});
		g.node.appendChild(clone);
		g.move(x, y);
		return { width: w, height: h, group: g };
	};

	// Token list drives matrix dimensions
	const tokens = ['The', 'cat', 'sat', 'on', 'the', 'mat'];
	const seqLen = tokens.length;
	const dHead = 64;

	// X matrix configuration
	const xCols = 10;
	const xCellWidth = 8;
	const xCellHeight = 16;
	const xWidth = xCols * xCellWidth;
	const xHeight = seqLen * xCellHeight;
	const xX = 70;
	const xY = 210;

	// Draw X matrix if enabled - store reference for connections
	let xMatrix = null;
	if (showX) {
		tokens.forEach((token, i) => {
			const text = content.text(token).font({ family: 'sans-serif', size: 10 }).fill('#d4d4d4');
			const textWidth = text.bbox().width || 40;
			text.move(xX - textWidth - 5, xY + i * xCellHeight + xCellHeight / 2 - 5);
		});

		xMatrix = createMatrix(content, {
			rows: seqLen,
			cols: xCols,
			cellWidth: xCellWidth,
			cellHeight: xCellHeight,
			fill: '#1e3a5f',
			stroke: '#3b82f6',
			colorStart: '#fde047',
			colorEnd: '#3b82f6',
			labels: { left: 'X', center: '', right: 'T \\times D' },
			labelSizes: { left: 13, center: 16, right: 12 },
			labelColors: { left: '#9ca3af', center: '#9ca3af', right: '#ef4444' },
			mathjax,
			highlight,
			highlightColor,
			showLabels
		}).move(xX, xY);
	}

	// Matrix configuration
	const qkvCellHeight = 10;
	const qkvCols = 32;
	const qkvCellWidth = 5;
	const matrixHeight = seqLen * qkvCellHeight;
	const matrixWidth = qkvCols * qkvCellWidth;
	const spacing = 100;

	// Weight matrix configuration (needed before positioning)
	const wMatrixCols = 1;
	const wMatrixRows = 1;
	const wCellWidth = 50;
	const wCellHeight = 50;
	const wMatrixWidth = wMatrixCols * wCellWidth;
	const wMatrixHeight = wMatrixRows * wCellHeight;

	// Shared W_K and K positioning (OUTSIDE the head border)
	const sharedMatrixGap = 15;
	const wkX = xX + xWidth + sharedMatrixGap; // W_K starts after X
	const kX = wkX + wMatrixWidth + sharedMatrixGap; // K starts after W_K

	// Attention head positioning - always positioned after where K would be
	// so all heads align regardless of whether shared K/V is shown
	const headGapFromK = 50;
	const attentionHeadX = kX + matrixWidth + headGapFromK;

	const attentionHead = content.group();

	const baseMatrixConfig = {
		rows: seqLen,
		cols: qkvCols,
		cellWidth: qkvCellWidth,
		cellHeight: qkvCellHeight,
		fill: smearColor || '#1e3a5f',
		stroke: smearColor || '#3b82f6',
		colorStart: smearColor || '#fde047',
		colorEnd: smearColor || '#3b82f6',
		labelFonts: { left: 'sans-serif', center: 'Times New Roman', right: 'sans-serif' },
		labelSizes: { left: 12, center: 14, right: 12 },
		labelColors: { left: '#22c55e', center: '#9ca3af', right: '#ef4444' },
		mathjax,
		highlight,
		highlightColor,
		showLabels
	};

	const qkvY = 40;
	const kY = qkvY + matrixHeight + spacing;
	const vY = qkvY + 2 * (matrixHeight + spacing);

	// W matrix positioning inside attentionHead
	const wMatrixX = 50;
	const qkvMatrixX = wMatrixX + wMatrixWidth + 50;

	const wMatrixConfig = {
		rows: wMatrixRows,
		cols: wMatrixCols,
		cellWidth: wCellWidth,
		cellHeight: wCellHeight,
		fill: smearColor || '#1e3a5f',
		stroke: smearColor || '#3b82f6',
		colorStart: smearColor || '#fde047',
		colorEnd: smearColor || '#3b82f6',
		labels: { left: '', center: '', right: 'D \\times H' },
		labelSizes: { left: 10, center: 16, right: 12 },
		labelColors: { left: '#22c55e', center: '#9ca3af', right: '#ef4444' },
		mathjax,
		highlight,
		highlightColor,
		showLabels
	};

	// Border starts at the left edge of attentionHead (K is outside, to the left)
	const borderStartX = 0;

	// W_Q inside attention head
	const wqMatrix = createMatrix(attentionHead, {
		...wMatrixConfig,
		labelsTop: { left: '', center: 'W_Q', right: '' },
		labelTopSizes: { left: 10, center: 20, right: 10 },
		labelTopColors: { left: '#ffffff', center: '#ffffff', right: '#ffffff' },
		labelYTop: 15
	}).move(wMatrixX, qkvY + matrixHeight / 2 - wMatrixHeight / 2);

	// W_K is OUTSIDE the attention head (shared in MQA) - will be drawn in content group later
	let wkMatrix = null;

	// W_V is OUTSIDE the attention head (shared in MQA) - will be drawn in content group later
	let wvMatrix = null;

	// Q matrix
	const qMatrix = createMatrix(attentionHead, {
		...baseMatrixConfig,
		labels: { left: '\\text{QUERIES}', center: 'Q = XW_Q', right: 'T \\times H' }
	}).move(qkvMatrixX, qkvY);

	// K^T matrix
	const ktCols = 8;
	const ktCellWidth = 8;
	const ktWidth = ktCols * ktCellWidth;
	const ktX = qkvMatrixX + matrixWidth + 30;
	const ktRows = dHead - 30;
	const ktCellHeight = 3;

	const ktMatrix = createMatrix(attentionHead, {
		rows: ktRows,
		cols: ktCols,
		cellWidth: ktCellWidth,
		cellHeight: ktCellHeight,
		fill: smearColor || '#1e3a5f',
		stroke: smearColor || '#3b82f6',
		colorStart: smearColor || '#fde047',
		colorEnd: smearColor || '#3b82f6',
		labels: { left: '', center: 'K^T', right: '' },
		labelSizes: { left: 10, center: 16, right: 10 },
		labelColors: { left: '#22c55e', center: '#9ca3af', right: '#ef4444' },
		mathjax,
		highlight,
		highlightColor,
		showLabels
	}).move(ktX, qkvY);

	// QK^T matrix
	const qktCellSize = 12;
	const qktX = ktX + ktWidth + 30;

	const qktMatrix = createMatrix(attentionHead, {
		rows: seqLen,
		cols: seqLen,
		cellWidth: qktCellSize,
		cellHeight: qktCellSize,
		fill: smearColor || '#1e3a5f',
		stroke: smearColor || '#3b82f6',
		colorStart: smearColor || '#fde047',
		colorEnd: smearColor || '#7c3aed',
		labels: { left: 'QK^T', center: '', right: 'T \\times S' },
		labelSizes: { left: 16, center: 12, right: 12 },
		labelColors: { left: '#9ca3af', center: '#9ca3af', right: '#ef4444' },
		mathjax,
		highlight,
		highlightColor,
		showLabels
	}).move(qktX, qkvY);

	// A matrix (Attention Pattern)
	const aX = qktX + qktMatrix.width + 80;
	const aCellSize = 25;
	const aWidth = seqLen * aCellSize;
	const aHeight = seqLen * aCellSize;

	// Row labels for A matrix
	if (showLabels) {
		tokens.forEach((token, i) => {
			const text = attentionHead
				.text(token)
				.font({ family: 'sans-serif', size: 10 })
				.fill('#d4d4d4');
			const textWidth = text.bbox().width || 40;
			text.move(aX - textWidth - 5, qkvY + i * aCellSize + aCellSize / 2 - 5);
		});

		// Column labels for A matrix
		tokens.forEach((token, i) => {
			const text = attentionHead
				.text(token)
				.font({ family: 'sans-serif', size: 10 })
				.fill('#d4d4d4');
			const labelX = aX + i * aCellSize + aCellSize / 2;
			const labelY = qkvY + aHeight + 15;
			text.move(labelX, labelY);
			text.rotate(90, labelX, labelY);
		});
	}

	const aMatrix = createMatrix(attentionHead, {
		rows: seqLen,
		cols: seqLen,
		cellWidth: aCellSize,
		cellHeight: aCellSize,
		fill: smearColor || '#4a044e',
		stroke: smearColor || '#a855f7',
		colorStart: smearColor || '#fde047',
		colorEnd: smearColor || '#a855f7',
		labels: { left: 'Att.\\ Pattern', center: '', right: 'T \\times S' },
		labelSizes: { left: 16, center: 10, right: 12 },
		labelColors: { left: '#22c55e', center: '#9ca3af', right: '#ef4444' },
		labelYBottom: aHeight + 70,
		labelXBottom: 0,
		maskUpperDiagonal: true,
		mathjax,
		highlight,
		highlightColor,
		showLabels
	}).move(aX, qkvY);

	// A matrix formula label
	if (showLabels) {
		const formula = renderMath(
			attentionHead,
			'A = \\text{Softmax}\\left(\\frac{QK^T}{\\sqrt{d}}\\right)',
			0,
			0,
			'#ffffff',
			14
		);
		if (formula) {
			formula.group.move(aX + 25 + aWidth / 2 - formula.width / 2, qkvY + 5);
		}
	}

	// K matrix - placeholder, will be drawn in content group (shared in MQA)
	let kMatrix = null;

	// V matrix - placeholder, will be drawn in content group (shared in MQA)
	let vMatrix = null;

	// O matrix
	const aRightEdge = aX + aWidth;
	const oWidth = qkvCols * qkvCellWidth;
	const oX = aRightEdge - oWidth;

	// Circle with X (⊗)
	const circleRadius = 12;
	const vRightEdge = qkvMatrixX + matrixWidth;
	const circleX = (vRightEdge + oX) / 2;
	const circleY = vY + matrixHeight / 2;

	attentionHead
		.circle(circleRadius * 2)
		.move(circleX - circleRadius, circleY - circleRadius)
		.fill('none')
		.stroke({ color: arrowColor, width: 1.5 });
	attentionHead
		.line(circleX - 6, circleY - 6, circleX + 6, circleY + 6)
		.stroke({ color: arrowColor, width: 1.5 });
	attentionHead
		.line(circleX - 6, circleY + 6, circleX + 6, circleY - 6)
		.stroke({ color: arrowColor, width: 1.5 });

	const oMatrix = createMatrix(attentionHead, {
		rows: seqLen,
		cols: qkvCols,
		cellWidth: qkvCellWidth,
		cellHeight: qkvCellHeight,
		fill: smearColor || '#1e3a5f',
		stroke: smearColor || '#3b82f6',
		colorStart: smearColor || '#fde047',
		colorEnd: smearColor || '#3b82f6',
		labels: { left: '\\text{Att. Head Out}', center: 'O = AV', right: 'T \\times H' },
		labelSizes: { left: 16, center: 14, right: 12 },
		labelColors: { left: '#22c55e', center: '#9ca3af', right: '#ef4444' },
		mathjax,
		highlight,
		highlightColor,
		showLabels
	}).move(oX, vY);

	// Dashed border - starts at borderStartX to exclude shared W_K and K
	const borderPadding = 60;
	const borderWidth = aRightEdge + borderPadding - borderStartX;
	const borderHeight = vY + matrixHeight + 60;

	attentionHead
		.rect(borderWidth, borderHeight)
		.move(borderStartX, 0)
		.fill('none')
		.stroke({ color: arrowColor, width: 1.5, dasharray: '8,4' })
		.radius(8);

	// Position attention head
	const attentionHeadY = xY + xHeight / 2 - borderHeight / 2;
	attentionHead.move(attentionHeadX, attentionHeadY);

	// Shared W_K, K, W_V, V matrices - ALWAYS drawn to maintain consistent bounding box
	// When showSharedKV is false, draw invisible placeholders to reserve space
	// wkX and kX are defined at the top of the function
	// kvXAdjust allows positioning K/V independently from the border (for shadow effect)

	// W_K matrix
	wkMatrix = createMatrix(content, {
		...wMatrixConfig,
		labelsTop: { left: '', center: 'W_K', right: '' },
		labelTopSizes: { left: 10, center: 20, right: 10 },
		labelTopColors: { left: '#ffffff', center: '#ffffff', right: '#ffffff' },
		labelYTop: 15,
		visible: showSharedKV
	}).move(wkX + kvXAdjust, attentionHeadY + kY + matrixHeight / 2 - wMatrixHeight / 2);

	// K matrix (shared across heads in MQA)
	kMatrix = createMatrix(content, {
		...baseMatrixConfig,
		labels: { left: '\\text{KEYS}', center: 'K = XW_K', right: 'S \\times H' },
		visible: showSharedKV
	}).move(kX + kvXAdjust, attentionHeadY + kY);

	// W_V matrix
	wvMatrix = createMatrix(content, {
		...wMatrixConfig,
		labelsTop: { left: '', center: 'W_V', right: '' },
		labelTopSizes: { left: 10, center: 20, right: 10 },
		labelTopColors: { left: '#ffffff', center: '#ffffff', right: '#ffffff' },
		labelYTop: 15,
		visible: showSharedKV
	}).move(wkX + kvXAdjust, attentionHeadY + vY + matrixHeight / 2 - wMatrixHeight / 2);

	// V matrix (shared across heads in MQA)
	vMatrix = createMatrix(content, {
		...baseMatrixConfig,
		labels: { left: '\\text{VALUES}', center: 'V = XW_V', right: 'S \\times H' },
		visible: showSharedKV
	}).move(kX + kvXAdjust, attentionHeadY + vY);

	// Head label
	if (showHeadLabel) {
		const headerLabelX = attentionHeadX + borderWidth - 80;
		const headerLabelY = attentionHeadY - 8;
		content
			.text(headLabelText)
			.font({ family: 'sans-serif', size: 14, weight: headLabelWeight })
			.fill('#9ca3af')
			.move(headerLabelX, headerLabelY);
	}

	// ========================================================================
	// CONNECTIONS - Using anchor-based system
	// Adjust matrix positions to absolute coordinates after attentionHead moves
	// ========================================================================

	// Adjust positions for matrices inside attentionHead to absolute coordinates
	wqMatrix._x += attentionHeadX;
	wqMatrix._y += attentionHeadY;
	// wkMatrix, kMatrix, wvMatrix, vMatrix are already at absolute positions (drawn in content group)
	qMatrix._x += attentionHeadX;
	qMatrix._y += attentionHeadY;
	ktMatrix._x += attentionHeadX;
	ktMatrix._y += attentionHeadY;
	qktMatrix._x += attentionHeadX;
	qktMatrix._y += attentionHeadY;
	aMatrix._x += attentionHeadX;
	aMatrix._y += attentionHeadY;
	oMatrix._x += attentionHeadX;
	oMatrix._y += attentionHeadY;

	const circleXAbs = attentionHeadX + circleX;
	const circleYAbs = attentionHeadY + circleY;
	const connOpts = { color: arrowColor, strokeWidth: 1.5 };

	// X → W matrices (fan-out pattern)
	// W_K is outside the border (shared), W_Q and W_V are inside
	if (showX && xMatrix) {
		const targets = [];
		if (showSharedKV) targets.push({ target: wkMatrix, anchor: 'left' });
		targets.push({ target: wqMatrix, anchor: 'left' });
		if (showSharedKV) targets.push({ target: wvMatrix, anchor: 'left' });
		connectFanOut(content, xMatrix, 'right', targets, { ...connOpts, junctionOffset: 40 });
	}

	// W → Q, K, V
	connect(content, wqMatrix, 'right', qMatrix, 'left', connOpts);
	if (showSharedKV) connect(content, wkMatrix, 'right', kMatrix, 'left', connOpts);
	if (showSharedKV) connect(content, wvMatrix, 'right', vMatrix, 'left', connOpts);

	// Q → K^T
	connect(content, qMatrix, 'right', ktMatrix, 'left', connOpts);

	// K → K^T (L-shaped)
	if (showSharedKV) {
		const ktLabelOffset = 35;
		const ktBottomPoint = createPoint(
			ktMatrix.anchor('bottom').x,
			ktMatrix.anchor('bottom').y + ktLabelOffset
		);
		connectL(content, kMatrix, 'right', ktBottomPoint, 'center', {
			...connOpts,
			cornerY: kMatrix.anchor('center').y
		});

		// Transpose label
		if (showLabels) {
			const kCenterY = kMatrix.anchor('center').y;
			const ktCenterX = ktMatrix.anchor('center').x;
			const transposeText = content
				.text('Transpose')
				.font({ family: 'sans-serif', size: 14 })
				.fill(arrowColor);
			const transposeWidth = transposeText.bbox().width || 50;
			transposeText.move(ktCenterX - transposeWidth / 2, kCenterY + 20);
		}
	}

	// K^T → QK^T
	connect(content, ktMatrix, 'right', qktMatrix, 'left', connOpts);

	// QK^T → A (with Mask & Softmax label)
	const qktLabelOffset = 30;
	const qktBottomY = qktMatrix.anchor('bottom').y + qktLabelOffset;
	const maskSoftmaxY = qktBottomY + 60;
	const aRowLabelSpace = 55;

	connectPath(
		content,
		[
			{ x: qktMatrix.anchor('bottom').x, y: qktBottomY },
			{ x: qktMatrix.anchor('bottom').x, y: maskSoftmaxY },
			{ x: aMatrix.anchor('left').x - aRowLabelSpace, y: maskSoftmaxY }
		],
		{ ...connOpts, radius: 10, showArrow: true }
	);

	if (showLabels) {
		content
			.text('Mask &')
			.font({ family: 'sans-serif', size: 14 })
			.fill(arrowColor)
			.move(qktMatrix.anchor('center').x - 20, maskSoftmaxY + 15);
		content
			.text('Softmax')
			.font({ family: 'sans-serif', size: 14 })
			.fill(arrowColor)
			.move(qktMatrix.anchor('center').x - 20, maskSoftmaxY + 30);
	}

	// V → ⊗
	const circleLeftPoint = createPoint(circleXAbs - circleRadius, circleYAbs);
	if (showSharedKV) {
		connect(content, vMatrix, 'right', circleLeftPoint, 'center', connOpts);
	}

	// ⊗ → O
	const circleRightPoint = createPoint(circleXAbs + circleRadius, circleYAbs);
	connect(content, circleRightPoint, 'center', oMatrix, 'left', connOpts);

	// A → ⊗ (complex path)
	const aBottomY = aMatrix.anchor('bottom').y + 110;
	const corner1Y = aBottomY + 20;
	connectPath(
		content,
		[
			{ x: aMatrix.anchor('bottom').x, y: aBottomY },
			{ x: aMatrix.anchor('bottom').x, y: corner1Y },
			{ x: circleXAbs, y: corner1Y },
			{ x: circleXAbs, y: circleYAbs - circleRadius - 5 }
		],
		{ ...connOpts, radius: 10, showArrow: true }
	);

	// O → output (thick arrow)
	const borderRightEdge = attentionHeadX + borderWidth;
	const thickArrowX = borderRightEdge + 40;
	const oCenterY = oMatrix.anchor('center').y;
	const thickHeadLen = 18;

	content
		.polygon([
			[thickArrowX, oCenterY],
			[thickArrowX - thickHeadLen, oCenterY - 10],
			[thickArrowX - thickHeadLen * 0.6, oCenterY],
			[thickArrowX - thickHeadLen, oCenterY + 10]
		])
		.fill(arrowColor);
	content
		.line(oMatrix.anchor('right').x + 5, oCenterY, thickArrowX - thickHeadLen, oCenterY)
		.stroke({ color: arrowColor, width: 3 });

	// Apply offset to entire content group
	content.move(offsetX, offsetY);

	// Return dimensions for viewbox fitting
	const bbox = content.bbox();
	return {
		group: content,
		width: bbox.width,
		height: bbox.height,
		x: bbox.x,
		y: bbox.y
	};
}
