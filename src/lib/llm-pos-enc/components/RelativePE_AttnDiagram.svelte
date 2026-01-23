<!-- ABOUTME: Shows how Relative PE is injected into the attention computation -->
<!-- ABOUTME: Position info added in QK^T and AV, not to input embeddings -->

<script>
	import { onMount } from 'svelte';
	import { SVG } from '@svgdotjs/svg.js';
	import {
		loadMathJax,
		matrix,
		createCircleSymbol,
		drawLines,
		border
	} from '../utils/attentionSVGs.js';
	import { DiagramWrapper } from './layouts';

	let container;

	onMount(async () => {
		const mathjax = await loadMathJax();

		const draw = SVG().addTo(container).attr({
			width: '100%',
			height: '100%',
			preserveAspectRatio: 'xMidYMid meet'
		});

		// Create main content group - everything goes inside this
		// SVG size will be auto-fitted to content at the end
		const content = draw.group();

		// Helper to render MathJax label on a group
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
			g.node.appendChild(clone);
			g.move(x, y);
			return { width: w, height: h, group: g };
		};

		// ========================================
		// TOKEN LIST - Drives matrix dimensions
		// ========================================
		const tokens = ['The', 'cat', 'sat', 'on', 'the', 'mat'];
		const seqLen = tokens.length;
		const dModel = 768; // embedding dimension
		const dHead = 64; // head dimension

		// ========================================
		// X MATRIX - Anchor point for the layout
		// ========================================
		const xCols = 10; // visual columns (compressed representation of dModel)
		const xCellWidth = 8;
		const xCellHeight = 16;
		const xWidth = xCols * xCellWidth;
		const xHeight = seqLen * xCellHeight;
		const xX = 10; // Leave space for token labels on left
		const xY = 250;

		matrix(content, {
			rows: seqLen,
			cols: xCols,
			cellWidth: xCellWidth,
			cellHeight: xCellHeight,
			fill: '#1e3a5f',
			stroke: '#3b82f6',
			colorStart: '#fde047',
			colorEnd: '#3b82f6',
			rowLabels: tokens,
			rowLabelConfig: { fontSize: 10, color: '#d4d4d4', offset: -5 },
			labels: {
				left: 'X',
				center: '',
				right: `${seqLen} \\times ${dModel}`
			},
			labelSizes: { left: 13, center: 16, right: 12 },
			labelColors: { left: '#9ca3af', center: '#9ca3af', right: '#ef4444' },
			mathjax
		}).move(xX, xY);

		// ========================================
		// RELATIVE PE: a^K and a^V embedding tables (aligned with W_Q and W_V)
		// ========================================

		// Pre-compute W matrix positions needed for a^K/a^V alignment
		const qkvCellHeight = 10;
		const matrixHeight = seqLen * qkvCellHeight;
		const spacing = 100;
		const borderTopPadding = 80;
		const borderBottomPadding = 100;
		const qkvY = borderTopPadding;
		const kY = qkvY + matrixHeight + spacing;
		const vY = qkvY + 2 * (matrixHeight + spacing);
		const wMatrixHeight = 50;
		const borderHeight = vY + matrixHeight + borderBottomPadding;
		const attentionHeadY = xY + xHeight / 2 - borderHeight / 2;
		const wqTopY = qkvY + matrixHeight / 2 - wMatrixHeight / 2;
		const wvTopY = vY + matrixHeight / 2 - wMatrixHeight / 2;
		const wqAbsY = attentionHeadY + wqTopY + wMatrixHeight / 2;
		const wvAbsY = attentionHeadY + wvTopY + wMatrixHeight / 2;

		const akRows = 6; // -2 to +2
		const akCols = xCols;
		const akCellWidth = xCellWidth;
		const akCellHeight = xCellHeight;
		const akTableHeight = akRows * akCellHeight;
		const akTableX = xX;
		// Position a^K aligned with W_Q
		const akTableY = wqAbsY - akTableHeight / 2;

		const akColors = ['#3b82f6', '#3b82f6', '#10b981', '#f97316', '#f97316'];
		const akLabels = ['-2', '-1', '0', '+1', '+2', '+3'];

		matrix(content, {
			rows: akRows,
			cols: akCols,
			cellWidth: akCellWidth,
			cellHeight: akCellHeight,
			fill: '#1e3a5f',
			stroke: '#1a1a2e',
			rowColors: akColors,
			rowLabels: akLabels,
			rowLabelConfig: { fontSize: 9, color: '#d4d4d4', offset: -5 },
			labels: {
				left: 'a^K',
				center: '',
				right: `${akRows} \\times ${dHead}`
			},
			labelSizes: { left: 15, center: 14, right: 12 },
			labelColors: { left: '#60a5fa', center: '#9ca3af', right: '#ef4444' },
			highlight: true,
			highlightColor: '#ffffff',
			mathjax
		}).move(akTableX, akTableY);

		// a^V embedding table - aligned with W_V
		const avRows = 6;
		const avCols = xCols;
		const avCellWidth = xCellWidth;
		const avCellHeight = xCellHeight;
		const avTableHeight = avRows * avCellHeight;
		const avTableX = xX;
		// Position a^V aligned with W_V
		const avTableY = wvAbsY - avTableHeight / 2;

		const avColors = ['#a855f7', '#a855f7', '#10b981', '#c084fc', '#c084fc'];
		const avLabels = ['-2', '-1', '0', '+1', '+2', '+3'];

		matrix(content, {
			rows: avRows,
			cols: avCols,
			cellWidth: avCellWidth,
			cellHeight: avCellHeight,
			fill: '#1e3a5f',
			stroke: '#1a1a2e',
			rowColors: avColors,
			rowLabels: avLabels,
			rowLabelConfig: { fontSize: 9, color: '#d4d4d4', offset: -5 },
			labels: {
				left: 'a^V',
				center: '',
				right: `${avRows} \\times ${dHead}`
			},
			labelSizes: { left: 15, center: 14, right: 12 },
			labelColors: { left: '#a855f7', center: '#9ca3af', right: '#ef4444' },
			highlight: true,
			highlightColor: '#ffffff',
			mathjax
		}).move(avTableX, avTableY);

		// ========================================
		// ATTENTION HEAD - Positioned relative to X
		// ========================================
		const gapBetweenXAndHead = 100;
		const attentionHeadX = xX + xWidth + gapBetweenXAndHead;

		// Additional matrix configuration
		const qkvCols = 48; // visual columns for Q, K, V (compressed dHead)
		const qkvCellWidth = 4;
		const matrixWidth = qkvCols * qkvCellWidth;

		// Create attention head group inside content
		const attentionHead = content.group();

		const baseMatrixConfig = {
			rows: seqLen,
			cols: qkvCols,
			cellWidth: qkvCellWidth,
			cellHeight: qkvCellHeight,
			fill: '#1e3a5f',
			stroke: '#3b82f6',
			labelFonts: {
				left: 'sans-serif',
				center: 'Times New Roman',
				right: 'sans-serif'
			},
			labelSizes: { left: 12, center: 14, right: 12 },
			labelColors: { left: '#22c55e', center: '#9ca3af', right: '#ef4444' },
			mathjax
		};

		// W_K position (wkAbsY needed for arrows)
		const wkTopY = kY + matrixHeight / 2 - wMatrixHeight / 2;
		const wkAbsY = attentionHeadY + wkTopY + wMatrixHeight / 2;

		// Weight matrix configuration
		const wMatrixCols = 1;
		const wMatrixRows = 1;
		const wCellWidth = 50;
		const wCellHeight = 50;
		const wMatrixX = 50;
		const wMatrixWidth = wMatrixCols * wCellWidth;
		const qkvMatrixX = wMatrixX + wMatrixWidth + 50;

		const wMatrixConfig = {
			rows: wMatrixRows,
			cols: wMatrixCols,
			cellWidth: wCellWidth,
			cellHeight: wCellHeight,
			fill: '#1e3a5f',
			stroke: '#3b82f6',
			labels: {
				left: '',
				center: '',
				right: `${dModel} \\times ${dHead}`
			},
			labelSizes: { left: 10, center: 16, right: 12 },
			labelColors: { left: '#22c55e', center: '#9ca3af', right: '#ef4444' },
			highlight: true,
			highlightColor: '#ffffff',
			mathjax
		};

		// W_Q matrix
		matrix(attentionHead, {
			...wMatrixConfig,
			labelsTop: { left: '', center: 'W_Q', right: '' },
			labelTopSizes: { left: 10, center: 20, right: 10 },
			labelTopColors: { left: '#ffffff', center: '#ffffff', right: '#ffffff' },
			labelYTop: 15
		}).move(wMatrixX, qkvY + matrixHeight / 2 - wMatrixHeight / 2);

		// W_K matrix
		matrix(attentionHead, {
			...wMatrixConfig,
			labelsTop: { left: '', center: 'W_K', right: '' },
			labelTopSizes: { left: 10, center: 20, right: 10 },
			labelTopColors: { left: '#ffffff', center: '#ffffff', right: '#ffffff' },
			labelYTop: 15
		}).move(wMatrixX, kY + matrixHeight / 2 - wMatrixHeight / 2);

		// W_V matrix
		matrix(attentionHead, {
			...wMatrixConfig,
			labelsTop: {
				left: '',
				center: 'W_V',
				right: ''
			},
			labelTopSizes: { left: 10, center: 20, right: 10 },
			labelTopColors: { left: '#ffffff', center: '#ffffff', right: '#ffffff' },
			labelYTop: 15
		}).move(wMatrixX, vY + matrixHeight / 2 - wMatrixHeight / 2);

		// Q matrix
		matrix(attentionHead, {
			...baseMatrixConfig,
			labels: {
				left: '\\text{QUERIES}',
				center: 'Q = XW_Q',
				right: `${seqLen} \\times ${dHead}`
			}
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
			fill: '#1e3a5f',
			stroke: '#3b82f6',
			labels: { left: '', center: 'K^T', right: '' },
			labelSizes: { left: 10, center: 16, right: 10 },
			labelColors: { left: '#22c55e', center: '#9ca3af', right: '#ef4444' },
			mathjax
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
			fill: '#1e3a5f',
			stroke: '#3b82f6',
			colorStart: '#fde047',
			colorEnd: '#7c3aed',
			labels: {
				left: 'QK^T',
				center: '',
				right: `${seqLen} \\times ${seqLen}`
			},
			labelSizes: { left: 16, center: 12, right: 12 },
			labelColors: { left: '#9ca3af', center: '#9ca3af', right: '#ef4444' },
			mathjax
		}).move(qktX, qkvY);

		// Q·a^K result matrix (same size as QK^T)
		const qakX = qktX + qktWidth + 40;

		// Circle with + between QK^T and Q·a^K
		const plusCircleX = qktX + qktWidth + 20;
		const plusCircleY = qkvY + (seqLen * qktCellSize) / 2;
		const plusCircleR = 12;
		createCircleSymbol(attentionHead, {
			symbol: 'plus',
			color: '#60a5fa',
			radius: plusCircleR
		}).move(plusCircleX - plusCircleR, plusCircleY - plusCircleR);

		matrix(attentionHead, {
			rows: seqLen,
			cols: seqLen,
			cellWidth: qktCellSize,
			cellHeight: qktCellSize,
			fill: '#1e3a5f',
			stroke: '#60a5fa',
			colorStart: '#60a5fa',
			colorEnd: '#3b82f6',
			labels: {
				left: 'Q \\cdot a^K',
				center: '',
				right: ''
			},
			labelSizes: { left: 14, center: 12, right: 12 },
			labelColors: { left: '#60a5fa', center: '#9ca3af', right: '#ef4444' },
			highlight: true,
			mathjax
		}).move(qakX, qkvY);

		// Update positions for A matrix to account for Q·a^K
		const qakWidth = seqLen * qktCellSize;

		// A matrix (Attention Pattern) - positioned after Q·a^K matrix
		const aX = qakX + qakWidth + 80;
		const aCellSize = 35;
		const aWidth = seqLen * aCellSize;
		const aHeight = seqLen * aCellSize;

		matrix(attentionHead, {
			rows: seqLen,
			cols: seqLen,
			cellWidth: aCellSize,
			cellHeight: aCellSize,
			fill: '#4a044e',
			stroke: '#a855f7',
			colorStart: '#fde047',
			colorEnd: '#a855f7',
			rowLabels: tokens,
			rowLabelConfig: { fontSize: 10, color: '#d4d4d4', offset: -5 },
			colLabels: tokens,
			colLabelConfig: {
				fontSize: 10,
				color: '#d4d4d4',
				offset: 15,
				rotate: 90
			},
			labels: {
				left: 'Attention\\ Pattern',
				center: '',
				right: `${seqLen} \\times ${seqLen}`
			},
			labelSizes: { left: 16, center: 10, right: 12 },
			labelColors: { left: '#22c55e', center: '#9ca3af', right: '#ef4444' },
			labelYBottom: aHeight + 70,
			labelXBottom: 0,
			maskUpperDiagonal: true,
			mathjax
		}).move(aX, qkvY);

		// Draw A matrix formula label separately (to avoid bounding box issues)
		// For Relative PE: A = Softmax((QK^T + Q·a^K)/√d)
		const formula = renderMath(
			attentionHead,
			'A = \\text{Softmax}\\left(\\frac{QK^T + Q \\cdot a^K}{\\sqrt{d}}\\right)',
			0,
			0,
			'#ffffff',
			14
		);
		if (formula) {
			formula.group.move(aX + 25 + aWidth / 2 - formula.width / 2, qkvY + 5);
		}

		// K matrix
		matrix(attentionHead, {
			...baseMatrixConfig,
			labels: {
				left: '\\text{KEYS}',
				center: 'K = XW_K',
				right: `${seqLen} \\times ${dHead}`
			}
		}).move(qkvMatrixX, kY);

		// V matrix
		matrix(attentionHead, {
			...baseMatrixConfig,
			labels: {
				left: '\\text{VALUES}',
				center: 'V = XW_V',
				right: `${seqLen} \\times ${dHead}`
			}
		}).move(qkvMatrixX, vY);

		// Circle with X (⊗) above Q matrix (centered) - yellow to show relative PE injection
		const qCenterX = qkvMatrixX + matrixWidth / 2;
		const topCircleY = qkvY - 50;
		const topCircleRadius = 12;
		createCircleSymbol(attentionHead, {
			symbol: 'cross',
			color: '#fde047',
			radius: topCircleRadius
		}).move(qCenterX - topCircleRadius, topCircleY - topCircleRadius);

		// Circle with + (⊕) below V matrix (centered) - yellow to show relative PE injection
		const vCenterX = qkvMatrixX + matrixWidth / 2;
		const bottomCircleY = vY + matrixHeight + 80;
		const bottomCircleRadius = 12;
		createCircleSymbol(attentionHead, {
			symbol: 'plus',
			color: '#fde047',
			radius: bottomCircleRadius
		}).move(vCenterX - bottomCircleRadius, bottomCircleY - bottomCircleRadius);

		// Arrow from V to circle below V (start below V = XW_V label)
		const vBottomY = vY + matrixHeight;
		drawLines(
			attentionHead,
			[
				[vCenterX, vBottomY + 35],
				[vCenterX, bottomCircleY - bottomCircleRadius - 5]
			],
			{ withArrow: true, color: '#fde047' }
		);

		// Arrow from a^K top to circle above Q (L-shaped: up then right)
		const akCenterX = akTableX + (akCols * akCellWidth) / 2;
		const akTopY = akTableY;
		const topCircleAbsX = attentionHeadX + qCenterX;
		const topCircleAbsY = attentionHeadY + topCircleY;
		// L-path from a^K top: up, then right to circle
		drawLines(
			content,
			[
				[akCenterX, akTopY - 5],
				[akCenterX, topCircleAbsY],
				[topCircleAbsX - topCircleRadius - 5, topCircleAbsY]
			],
			{ withArrow: true, color: '#fde047' }
		);

		// Arrow from Q top to circle above Q
		const qTopY = attentionHeadY + qkvY;
		const qTopCenterX = topCircleAbsX;
		drawLines(
			content,
			[
				[qTopCenterX, qTopY - 5],
				[qTopCenterX, topCircleAbsY + topCircleRadius + 15]
			],
			{ withArrow: true, color: '#fde047' }
		);

		// Arrow from circle above Q to Q·a^K matrix (L-shaped: right then down to top center)
		const qakMatrixWidth = seqLen * qktCellSize;
		const qakCenterX = attentionHeadX + qakX + qakMatrixWidth / 2;
		const qakTopY = attentionHeadY + qkvY;
		// Start from right of circle, go right to Q·a^K center, then down to top
		drawLines(
			content,
			[
				[topCircleAbsX + topCircleRadius + 5, topCircleAbsY],
				[qakCenterX, topCircleAbsY],
				[qakCenterX, qakTopY - 5]
			],
			{ withArrow: true, color: '#fde047' }
		);

		// Arrow from a^V bottom to circle below V (L-shaped: down then right)
		const avCenterX = avTableX + (avCols * avCellWidth) / 2;
		const avBottomY = avTableY + avTableHeight;
		const bottomCircleAbsX = attentionHeadX + vCenterX;
		const bottomCircleAbsY = attentionHeadY + bottomCircleY;
		// L-path from a^V bottom: down (below labels), then right to circle
		drawLines(
			content,
			[
				[avCenterX, avBottomY + 35],
				[avCenterX, bottomCircleAbsY],
				[bottomCircleAbsX - bottomCircleRadius - 5, bottomCircleAbsY]
			],
			{ withArrow: true, color: '#fde047' }
		);

		// O matrix (Output = A × V)
		// Position below and to the left of original position
		const aRightEdge = aX + aWidth;
		const oWidth = qkvCols * qkvCellWidth;
		const oX = aRightEdge - oWidth - 40;
		const oY = vY + 50;

		// Circle with X (⊗) between V and O - aligned with O center
		const circleRadius = 12;
		const vRightEdge = qkvMatrixX + matrixWidth;
		const circleX = (vRightEdge + oX) / 2;
		const circleY = oY + matrixHeight / 2;
		createCircleSymbol(attentionHead, {
			symbol: 'cross',
			color: '#9ca3af',
			radius: circleRadius
		}).move(circleX - circleRadius, circleY - circleRadius);

		// Arrow from plus circle below V to circle between V and O (right then up)
		const plusCircleAbsX = attentionHeadX + vCenterX;
		const plusCircleAbsY = attentionHeadY + bottomCircleY;
		const voCircleAbsX = attentionHeadX + circleX;
		const voCircleAbsY = attentionHeadY + circleY;
		// Go right from plus circle, then up to the ⊗ circle
		drawLines(
			content,
			[
				[plusCircleAbsX + bottomCircleRadius + 5, plusCircleAbsY],
				[voCircleAbsX, plusCircleAbsY],
				[voCircleAbsX, voCircleAbsY + circleRadius + 15]
			],
			{ withArrow: true, color: '#fde047' }
		);

		matrix(attentionHead, {
			rows: seqLen,
			cols: qkvCols,
			cellWidth: qkvCellWidth,
			cellHeight: qkvCellHeight,
			fill: '#1e3a5f',
			stroke: '#3b82f6',
			colorStart: '#fde047',
			colorEnd: '#3b82f6',
			labels: {
				left: '\\text{Out}',
				center: 'O = AV',
				right: `${seqLen} \\times ${dHead}`
			},
			labelSizes: { left: 16, center: 14, right: 12 },
			labelColors: { left: '#22c55e', center: '#9ca3af', right: '#ef4444' },
			mathjax
		}).move(oX, oY);

		// Dashed border around attention head (relative to group)
		const borderPadding = 60;
		const borderWidth = aRightEdge + borderPadding;

		border(attentionHead, {
			width: borderWidth,
			height: borderHeight,
			label: 'ATTENTION HEAD'
		});

		// Position attention head relative to X matrix (vertically centered with X)
		attentionHead.move(attentionHeadX, attentionHeadY);

		// Arrows from X to W matrices (with vertical connector for W_Q and W_V)
		const xRightEdge = xX + xWidth;
		const wLeftEdge = attentionHeadX + wMatrixX;
		// Junction inside the attention head border
		const junctionX = attentionHeadX + 20;

		// Horizontal line from X to junction point (at W_K level)
		// Start past X's dimension label
		const arrowStartX = xRightEdge + 70;
		drawLines(content, [
			[arrowStartX, wkAbsY],
			[junctionX, wkAbsY]
		]);

		// Vertical line from W_Q level to W_V level (inside attention border)
		drawLines(content, [
			[junctionX, wqAbsY],
			[junctionX, wvAbsY]
		]);

		// Arrow to W_Q (horizontal from junction)
		drawLines(
			content,
			[
				[junctionX, wqAbsY],
				[wLeftEdge - 5, wqAbsY]
			],
			{ withArrow: true }
		);

		// Arrow to W_K (horizontal from junction)
		drawLines(
			content,
			[
				[junctionX, wkAbsY],
				[wLeftEdge - 5, wkAbsY]
			],
			{ withArrow: true }
		);

		// Arrow to W_V (horizontal from junction)
		drawLines(
			content,
			[
				[junctionX, wvAbsY],
				[wLeftEdge - 5, wvAbsY]
			],
			{ withArrow: true }
		);

		// Arrows from W matrices to Q, K, V matrices
		const wRightEdge = attentionHeadX + wMatrixX + wMatrixWidth;
		const qkvLeftEdge = attentionHeadX + qkvMatrixX;

		// Q/K/V matrix center Y positions (absolute coordinates)
		const qCenterY = attentionHeadY + qkvY + matrixHeight / 2;
		const kCenterY = attentionHeadY + kY + matrixHeight / 2;
		const vCenterY = attentionHeadY + vY + matrixHeight / 2;

		// Arrow from W_Q to Q (W center Y = wqAbsY, Q center Y = qCenterY)
		drawLines(
			content,
			[
				[wRightEdge + 5, wqAbsY],
				[qkvLeftEdge - 5, qCenterY]
			],
			{ withArrow: true }
		);

		// Arrow from W_K to K
		drawLines(
			content,
			[
				[wRightEdge + 5, wkAbsY],
				[qkvLeftEdge - 5, kCenterY]
			],
			{ withArrow: true }
		);

		// Arrow from W_V to V
		drawLines(
			content,
			[
				[wRightEdge + 5, wvAbsY],
				[qkvLeftEdge - 5, vCenterY]
			],
			{ withArrow: true }
		);

		// Arrow from Q to K^T (horizontal from Q's center)
		const qRightEdge = attentionHeadX + qkvMatrixX + matrixWidth;
		const ktLeftEdge = attentionHeadX + ktX;
		drawLines(
			content,
			[
				[qRightEdge + 5, qCenterY],
				[ktLeftEdge - 5, qCenterY]
			],
			{ withArrow: true }
		);

		// L-shaped arrow from K to K^T bottom (with Transpose label)
		const kRightEdge = attentionHeadX + qkvMatrixX + matrixWidth;
		const ktRows = dHead - 30; // Must match K^T matrix rows
		const ktHeight = ktRows * 3; // K^T cellHeight is 3
		const ktBottomY = attentionHeadY + qkvY + ktHeight;
		const ktCenterX = attentionHeadX + ktX + ktWidth / 2;

		// L-shaped path with rounded corner: horizontal from K, then up to K^T bottom
		// Pull back arrow to avoid overlapping with K^T label
		drawLines(
			content,
			[
				[kRightEdge + 5, kCenterY],
				[ktCenterX, kCenterY],
				[ktCenterX, ktBottomY + 50]
			],
			{ withArrow: true }
		);

		// "Transpose" label below the arrow
		const transposeText = content
			.text('Transpose')
			.font({ family: 'sans-serif', size: 14 })
			.fill('#9ca3af');
		const transposeWidth = transposeText.bbox().width || 50;
		transposeText.move(ktCenterX - transposeWidth / 2, kCenterY + 20);

		// Arrow from K^T to QK^T (aligned with Q to K^T arrow at qCenterY)
		const ktRightEdge = attentionHeadX + ktX + ktWidth;
		const qktLeftEdge = attentionHeadX + qktX;
		drawLines(
			content,
			[
				[ktRightEdge + 5, qCenterY],
				[qktLeftEdge - 5, qCenterY]
			],
			{ withArrow: true }
		);

		// L-shaped arrow from plus circle (between QK^T and Q·a^K) to A (down then right)
		const qktHeight = seqLen * qktCellSize;
		const sumPlusAbsX = attentionHeadX + plusCircleX;
		const sumPlusAbsY = attentionHeadY + plusCircleY;
		const aLeftEdge = attentionHeadX + aX;

		// Start below the plus circle
		const qktLabelOffset = 30; // Space for labels
		const qktBottomWithLabels = attentionHeadY + qkvY + qktHeight + qktLabelOffset;
		const maskSoftmaxY = qktBottomWithLabels + 60;

		// L-shaped path with rounded corner: down from plus circle, then right to A
		const aRowLabelSpace = 55; // Space for row labels on left of A
		drawLines(
			content,
			[
				[sumPlusAbsX, sumPlusAbsY + plusCircleR + 15],
				[sumPlusAbsX, maskSoftmaxY],
				[aLeftEdge - aRowLabelSpace, maskSoftmaxY]
			],
			{ withArrow: true }
		);

		// "Mask & Softmax" label below the arrow
		content
			.text('Mask &')
			.font({ family: 'sans-serif', size: 14 })
			.fill('#9ca3af')
			.move(sumPlusAbsX - 20, maskSoftmaxY + 15);
		content
			.text('Softmax')
			.font({ family: 'sans-serif', size: 14 })
			.fill('#9ca3af')
			.move(sumPlusAbsX - 20, maskSoftmaxY + 30);

		// Arrow from circle (⊗) to O - to middle of O's left side
		const circleXAbs = attentionHeadX + circleX;
		const circleYAbs = attentionHeadY + circleY;
		const oLeftEdgeAbs = attentionHeadX + oX;
		const oCenterY = attentionHeadY + oY + matrixHeight / 2;
		drawLines(
			content,
			[
				[circleXAbs + circleRadius + 5, circleYAbs],
				[oLeftEdgeAbs - 5, oCenterY]
			],
			{ withArrow: true }
		);

		// Arrow from A to circle (⊗) - down from A bottom center, left, then down to circle top
		const aBottomY = attentionHeadY + qkvY + aHeight;
		const aBottomLabelsY = aBottomY + 110; // Below A's column labels (starting point)
		const aCenterXAbs = attentionHeadX + aX + aWidth / 2;
		const corner1Y = aBottomY + 130; // Fixed position for horizontal line

		// Path with two rounded corners: down, left, down
		drawLines(
			content,
			[
				[aCenterXAbs, aBottomLabelsY],
				[aCenterXAbs, corner1Y],
				[circleXAbs, corner1Y],
				[circleXAbs, circleYAbs - circleRadius - 5]
			],
			{ withArrow: true }
		);

		// Thick arrow from O right side to outside attention head border
		const oRightEdgeAbs = attentionHeadX + oX + oWidth;
		const borderRightEdge = attentionHeadX + borderWidth;
		const thickArrowX = borderRightEdge + 40;

		drawLines(
			content,
			[
				[oRightEdgeAbs + 5, oCenterY],
				[thickArrowX, oCenterY]
			],
			{ withArrow: true, width: 3, headLen: 18 }
		);

		// Auto-fit viewbox to content with padding
		const bbox = content.bbox();
		const padding = 20;
		draw.viewbox(
			bbox.x - padding,
			bbox.y - padding,
			bbox.width + padding * 2,
			bbox.height + padding * 2
		);

		return () => draw.remove();
	});
</script>

<DiagramWrapper
	attribution={{ url: 'https://www.youtube.com/watch?v=0VLAoVGf_74', name: 'Welch Labs' }}
>
	<div bind:this={container} class="w-full"></div>
</DiagramWrapper>
