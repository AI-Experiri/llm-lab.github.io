// ABOUTME: Single Head Attention drawing function
// ABOUTME: Exports drawAttentionHead that uses matrix from helperMatrixSVGs

import { matrix } from './helperMatrixSVGs.js';

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
		showWK = true,
		showWV = true
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

	// Draw X matrix if enabled
	if (showX) {
		tokens.forEach((token, i) => {
			const text = content.text(token).font({ family: 'sans-serif', size: 10 }).fill('#d4d4d4');
			const textWidth = text.bbox().width || 40;
			text.move(xX - textWidth - 5, xY + i * xCellHeight + xCellHeight / 2 - 5);
		});

		matrix(content, {
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

	// Attention head positioning
	const gapBetweenXAndHead = 15;
	const attentionHeadX = xX + xWidth + gapBetweenXAndHead;

	// Matrix configuration
	const qkvCellHeight = 10;
	const qkvCols = 64;
	const qkvCellWidth = 5;
	const matrixHeight = seqLen * qkvCellHeight;
	const matrixWidth = qkvCols * qkvCellWidth;
	const spacing = 100;

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

	// Weight matrix configuration
	const wMatrixCols = 1;
	const wMatrixRows = 1;
	const wCellWidth = 50;
	const wCellHeight = 50;
	const wMatrixX = 50;
	const wMatrixWidth = wMatrixCols * wCellWidth;
	const wMatrixHeight = wMatrixRows * wCellHeight;
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

	// W_Q, W_K, W_V matrices
	matrix(attentionHead, {
		...wMatrixConfig,
		labelsTop: { left: '', center: 'W_Q', right: '' },
		labelTopSizes: { left: 10, center: 20, right: 10 },
		labelTopColors: { left: '#ffffff', center: '#ffffff', right: '#ffffff' },
		labelYTop: 15
	}).move(wMatrixX, qkvY + matrixHeight / 2 - wMatrixHeight / 2);

	if (showWK) {
		matrix(attentionHead, {
			...wMatrixConfig,
			labelsTop: { left: '', center: 'W_K', right: '' },
			labelTopSizes: { left: 10, center: 20, right: 10 },
			labelTopColors: { left: '#ffffff', center: '#ffffff', right: '#ffffff' },
			labelYTop: 15
		}).move(wMatrixX, kY + matrixHeight / 2 - wMatrixHeight / 2);
	}

	if (showWV) {
		matrix(attentionHead, {
			...wMatrixConfig,
			labelsTop: { left: '', center: 'W_V', right: '' },
			labelTopSizes: { left: 10, center: 20, right: 10 },
			labelTopColors: { left: '#ffffff', center: '#ffffff', right: '#ffffff' },
			labelYTop: 15
		}).move(wMatrixX, vY + matrixHeight / 2 - wMatrixHeight / 2);
	}

	// Q matrix
	matrix(attentionHead, {
		...baseMatrixConfig,
		labels: { left: '\\text{QUERIES}', center: 'Q = XW_Q', right: 'T \\times H' }
	}).move(qkvMatrixX, qkvY);

	// K^T matrix
	const ktCols = 8;
	const ktCellWidth = 8;
	const ktWidth = ktCols * ktCellWidth;
	const ktX = qkvMatrixX + matrixWidth + 30;

	matrix(attentionHead, {
		rows: dHead - 30,
		cols: ktCols,
		cellWidth: ktCellWidth,
		cellHeight: 3,
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
	const qktWidth = seqLen * qktCellSize;
	const qktX = ktX + ktWidth + 30;

	matrix(attentionHead, {
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
	const aX = qktX + qktWidth + 80;
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

	matrix(attentionHead, {
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

	// K matrix
	matrix(attentionHead, {
		...baseMatrixConfig,
		labels: { left: '\\text{KEYS}', center: 'K = XW_K', right: 'S \\times H' }
	}).move(qkvMatrixX, kY);

	// V matrix
	matrix(attentionHead, {
		...baseMatrixConfig,
		labels: { left: '\\text{VALUES}', center: 'V = XW_V', right: 'S \\times H' }
	}).move(qkvMatrixX, vY);

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

	matrix(attentionHead, {
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

	// Dashed border
	const borderPadding = 60;
	const borderWidth = aRightEdge + borderPadding;
	const borderHeight = vY + matrixHeight + 60;

	attentionHead
		.rect(borderWidth, borderHeight)
		.fill('none')
		.stroke({ color: arrowColor, width: 1.5, dasharray: '8,4' })
		.radius(8);

	// Position attention head
	const attentionHeadY = xY + xHeight / 2 - borderHeight / 2;
	attentionHead.move(attentionHeadX, attentionHeadY);

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

	// Arrow helpers
	const drawArrow = (x1, y1, x2, y2, color = arrowColor) => {
		const angle = Math.atan2(y2 - y1, x2 - x1);
		const headLen = 12;
		const lineEndX = x2 - headLen * Math.cos(angle);
		const lineEndY = y2 - headLen * Math.sin(angle);
		content.line(x1, y1, lineEndX, lineEndY).stroke({ color, width: 1.5 });
		content
			.polygon([
				[x2, y2],
				[
					x2 - headLen * Math.cos(angle - Math.PI / 6),
					y2 - headLen * Math.sin(angle - Math.PI / 6)
				],
				[x2 - headLen * 0.6 * Math.cos(angle), y2 - headLen * 0.6 * Math.sin(angle)],
				[x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6)]
			])
			.fill(color);
	};

	const drawArrowHead = (x, y, angle, color = arrowColor) => {
		const headLen = 12;
		content
			.polygon([
				[x, y],
				[x - headLen * Math.cos(angle - Math.PI / 6), y - headLen * Math.sin(angle - Math.PI / 6)],
				[x - headLen * 0.6 * Math.cos(angle), y - headLen * 0.6 * Math.sin(angle)],
				[x - headLen * Math.cos(angle + Math.PI / 6), y - headLen * Math.sin(angle + Math.PI / 6)]
			])
			.fill(color);
	};

	const drawLPath = (
		x1,
		y1,
		cornerX,
		cornerY,
		x2,
		y2,
		radius = 10,
		color = arrowColor,
		withArrow = true
	) => {
		const goingDownToCorner = cornerY > y1;
		const goingRightToCorner = cornerX > x1;
		const goingDownFromCorner = y2 > cornerY;
		const goingRightFromCorner = x2 > cornerX;

		let pathStr = `M ${x1} ${y1} `;
		if (x1 === cornerX) {
			pathStr += `L ${cornerX} ${cornerY + (goingDownToCorner ? -radius : radius)} `;
			pathStr += `Q ${cornerX} ${cornerY} ${cornerX + (goingRightFromCorner ? radius : -radius)} ${cornerY} `;
			pathStr += `L ${x2} ${y2}`;
		} else {
			pathStr += `L ${cornerX + (goingRightToCorner ? -radius : radius)} ${y1} `;
			pathStr += `Q ${cornerX} ${y1} ${cornerX} ${y1 + (goingDownFromCorner ? radius : -radius)} `;
			pathStr += `L ${x2} ${y2}`;
		}

		content.path(pathStr).fill('none').stroke({ color, width: 1.5 });
		if (withArrow) {
			const angle = Math.atan2(y2 - cornerY, x2 - cornerX);
			drawArrowHead(x2, y2, angle, color);
		}
	};

	// Arrows from X to W matrices
	const xRightEdge = xX + xWidth;
	const wLeftEdge = attentionHeadX + wMatrixX;
	const junctionX = xRightEdge + 40;

	const wqTopY = qkvY + matrixHeight / 2 - wMatrixHeight / 2;
	const wkTopY = kY + matrixHeight / 2 - wMatrixHeight / 2;
	const wvTopY = vY + matrixHeight / 2 - wMatrixHeight / 2;

	const wqAbsY = attentionHeadY + wqTopY + wMatrixHeight / 2;
	const wkAbsY = attentionHeadY + wkTopY + wMatrixHeight / 2;
	const wvAbsY = attentionHeadY + wvTopY + wMatrixHeight / 2;

	if (showX) {
		content
			.line(xRightEdge + 5, wkAbsY, junctionX, wkAbsY)
			.stroke({ color: arrowColor, width: 1.5 });
		content.line(junctionX, wqAbsY, junctionX, wvAbsY).stroke({ color: arrowColor, width: 1.5 });
		drawArrow(junctionX, wqAbsY, wLeftEdge - 5, wqAbsY);
		drawArrow(junctionX, wkAbsY, wLeftEdge - 5, wkAbsY);
		drawArrow(junctionX, wvAbsY, wLeftEdge - 5, wvAbsY);
	}

	// Arrows from W to Q, K, V
	const wRightEdge = attentionHeadX + wMatrixX + wMatrixWidth;
	const qkvLeftEdge = attentionHeadX + qkvMatrixX;

	const qCenterY = attentionHeadY + qkvY + matrixHeight / 2;
	const kCenterY = attentionHeadY + kY + matrixHeight / 2;
	const vCenterY = attentionHeadY + vY + matrixHeight / 2;

	drawArrow(wRightEdge + 5, wqAbsY, qkvLeftEdge - 5, qCenterY);
	drawArrow(wRightEdge + 5, wkAbsY, qkvLeftEdge - 5, kCenterY);
	drawArrow(wRightEdge + 5, wvAbsY, qkvLeftEdge - 5, vCenterY);

	// Arrow from Q to K^T
	const qRightEdge = attentionHeadX + qkvMatrixX + matrixWidth;
	const ktLeftEdge = attentionHeadX + ktX;
	drawArrow(qRightEdge + 5, qCenterY, ktLeftEdge - 5, qCenterY);

	// L-shaped arrow from K to K^T
	const kRightEdge = attentionHeadX + qkvMatrixX + matrixWidth;
	const ktHeight = (dHead - 30) * 3; // K^T has (dHead-30) rows with cellHeight 3
	const ktBottomY = attentionHeadY + qkvY + ktHeight;
	const ktCenterX = attentionHeadX + ktX + ktWidth / 2;
	const ktLabelOffset = 35;
	drawLPath(
		kRightEdge + 5,
		kCenterY,
		ktCenterX,
		kCenterY,
		ktCenterX,
		ktBottomY + ktLabelOffset,
		10
	);

	// Transpose label
	if (showLabels) {
		const transposeText = content
			.text('Transpose')
			.font({ family: 'sans-serif', size: 14 })
			.fill(arrowColor);
		const transposeWidth = transposeText.bbox().width || 50;
		transposeText.move(ktCenterX - transposeWidth / 2, kCenterY + 20);
	}

	// Arrow from K^T to QK^T
	const ktRightEdge = attentionHeadX + ktX + ktWidth;
	const qktLeftEdge = attentionHeadX + qktX;
	drawArrow(ktRightEdge + 5, qCenterY, qktLeftEdge - 5, qCenterY);

	// L-shaped arrow from QK^T to A
	const qktHeight = seqLen * qktCellSize;
	const qktCenterX = attentionHeadX + qktX + qktWidth / 2;
	const aLeftEdge = attentionHeadX + aX;
	const qktLabelOffset = 30;
	const qktBottomWithLabels = attentionHeadY + qkvY + qktHeight + qktLabelOffset;
	const maskSoftmaxY = qktBottomWithLabels + 60;
	const aRowLabelSpace = 55;
	drawLPath(
		qktCenterX,
		qktBottomWithLabels,
		qktCenterX,
		maskSoftmaxY,
		aLeftEdge - aRowLabelSpace,
		maskSoftmaxY,
		10
	);

	// Mask & Softmax label
	if (showLabels) {
		content
			.text('Mask &')
			.font({ family: 'sans-serif', size: 14 })
			.fill(arrowColor)
			.move(qktCenterX - 20, maskSoftmaxY + 15);
		content
			.text('Softmax')
			.font({ family: 'sans-serif', size: 14 })
			.fill(arrowColor)
			.move(qktCenterX - 20, maskSoftmaxY + 30);
	}

	// Arrow from V to circle
	const vRightEdgeAbs = attentionHeadX + qkvMatrixX + matrixWidth;
	const circleXAbs = attentionHeadX + circleX;
	const circleYAbs = attentionHeadY + circleY;
	drawArrow(vRightEdgeAbs + 5, vCenterY, circleXAbs - circleRadius - 5, circleYAbs);

	// Arrow from circle to O
	const oLeftEdgeAbs = attentionHeadX + oX;
	drawArrow(circleXAbs + circleRadius + 5, circleYAbs, oLeftEdgeAbs - 5, vCenterY);

	// Arrow from A to circle
	const aBottomY = attentionHeadY + qkvY + aHeight;
	const aBottomLabelsY = aBottomY + 110;
	const aCenterXAbs = attentionHeadX + aX + aWidth / 2;
	const corner1Y = aBottomY + 130;
	const pathRadius = 10;

	const pathStr =
		`M ${aCenterXAbs} ${aBottomLabelsY} ` +
		`L ${aCenterXAbs} ${corner1Y - pathRadius} ` +
		`Q ${aCenterXAbs} ${corner1Y} ${aCenterXAbs - pathRadius} ${corner1Y} ` +
		`L ${circleXAbs + pathRadius} ${corner1Y} ` +
		`Q ${circleXAbs} ${corner1Y} ${circleXAbs} ${corner1Y + pathRadius} ` +
		`L ${circleXAbs} ${circleYAbs - circleRadius - 5}`;

	content.path(pathStr).fill('none').stroke({ color: arrowColor, width: 1.5 });
	drawArrowHead(circleXAbs, circleYAbs - circleRadius - 5, Math.PI / 2);

	// Thick arrow from O to outside
	const oRightEdgeAbs = attentionHeadX + oX + oWidth;
	const oCenterY = vCenterY;
	const borderRightEdge = attentionHeadX + borderWidth;
	const thickHeadLen = 18;
	const thickArrowX = borderRightEdge + 40;

	content
		.polygon([
			[thickArrowX, oCenterY],
			[thickArrowX - thickHeadLen, oCenterY - 10],
			[thickArrowX - thickHeadLen * 0.6, oCenterY],
			[thickArrowX - thickHeadLen, oCenterY + 10]
		])
		.fill(arrowColor);
	content
		.line(oRightEdgeAbs + 5, oCenterY, thickArrowX - thickHeadLen, oCenterY)
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
