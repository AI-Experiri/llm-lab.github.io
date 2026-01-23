<!-- ABOUTME: Shows how Transformer-XL injects relative PE into attention computation -->
<!-- ABOUTME: Based on RelativePE diagram, will be customized for four-term decomposition -->

<script>
	import { onMount } from 'svelte';
	import { SVG } from '@svgdotjs/svg.js';
	import { loadMathJax, matrix, createCircleSymbol, drawLines } from '../utils/attentionSVGs.js';
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
		// TRANSFORMER-XL: R embedding table and u/v bias vectors
		// ========================================

		// Pre-compute W matrix positions needed for alignment
		const qkvCellHeight = 10;
		const matrixHeight = seqLen * qkvCellHeight;
		const spacing = 100;
		const borderTopPadding = 160;
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
		// W_k,R position (calculated here for R matrix alignment)
		const wkrTopY = qkvY + matrixHeight / 2 - wMatrixHeight / 2 - wMatrixHeight - 50;
		const wkrAbsY = attentionHeadY + wkrTopY + wMatrixHeight / 2;

		const akRows = 6;
		const akCols = xCols;
		const akCellWidth = xCellWidth;
		const akCellHeight = xCellHeight;
		const akTableHeight = akRows * akCellHeight;
		const akTableX = xX;
		// Position R aligned with W_k,R
		const akTableY = wkrAbsY - akTableHeight / 2 + 40;

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
				left: 'R',
				center: '',
				right: `${akRows} \\times ${dHead}`
			},
			labelSizes: { left: 15, center: 14, right: 12 },
			labelColors: { left: '#60a5fa', center: '#9ca3af', right: '#ef4444' },
			highlight: true,
			mathjax
		}).move(akTableX, akTableY);

		// u and v learned bias vectors
		const uvCols = xCols;
		const uvCellWidth = xCellWidth;
		const uvCellHeight = xCellHeight;
		const uvTableX = xX;

		// v vector - above R matrix
		const vTableY = akTableY - uvCellHeight - 50;
		matrix(content, {
			rows: 1,
			cols: uvCols,
			cellWidth: uvCellWidth,
			cellHeight: uvCellHeight,
			fill: '#1e3a5f',
			stroke: '#a855f7',
			colorStart: '#c084fc',
			colorEnd: '#7c3aed',
			labels: {
				left: 'v',
				center: '',
				right: `1 \\times ${dHead}`
			},
			labelSizes: { left: 15, center: 14, right: 12 },
			labelColors: { left: '#a855f7', center: '#9ca3af', right: '#ef4444' },
			rowLabels: ['--- '],
			highlight: true,
			highlightColor: '#ffffff',
			mathjax
		}).move(uvTableX, vTableY);

		// u vector - centered between W_K and W_V
		const wkAbsYCalc =
			attentionHeadY + (kY + matrixHeight / 2 - wMatrixHeight / 2) + wMatrixHeight / 2;
		const uTableY = (wkAbsYCalc + wvAbsY) / 2 - uvCellHeight / 2;
		matrix(content, {
			rows: 1,
			cols: uvCols,
			cellWidth: uvCellWidth,
			cellHeight: uvCellHeight,
			fill: '#1e3a5f',
			stroke: '#a855f7',
			colorStart: '#c084fc',
			colorEnd: '#7c3aed',
			labels: {
				left: 'u',
				center: '',
				right: `1 \\times ${dHead}`
			},
			labelSizes: { left: 15, center: 14, right: 12 },
			labelColors: { left: '#a855f7', center: '#9ca3af', right: '#ef4444' },
			rowLabels: ['--- '],
			highlight: true,
			highlightColor: '#ffffff',
			mathjax
		}).move(uvTableX, uTableY);

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

		// W_k,R matrix (Transformer-XL specific - projects relative position encodings)
		matrix(attentionHead, {
			...wMatrixConfig,
			labelsTop: { left: '', center: 'W_{k,R}', right: '' },
			labelTopSizes: { left: 10, center: 18, right: 10 },
			labelTopColors: { left: '#ffffff', center: '#fde047', right: '#ffffff' },
			labelYTop: 15
		}).move(wMatrixX, wkrTopY);

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

		// Circle B (⊗) between QK^T and R·W_k,R
		const crossCircleX = qktX + qktWidth + 20;
		const crossCircleY = qkvY + (seqLen * qktCellSize) / 2;
		const crossCircleR = 12;
		createCircleSymbol(attentionHead, {
			symbol: 'cross',
			color: '#fde047',
			radius: crossCircleR
		}).move(crossCircleX - crossCircleR, crossCircleY - crossCircleR);
		// Label B
		attentionHead
			.text('B')
			.font({ family: 'sans-serif', size: 14, weight: 'bold' })
			.fill('#fde047')
			.move(crossCircleX - 5, crossCircleY - crossCircleR - 20);

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
				left: 'R \\cdot W_{k,R}',
				center: '',
				right: ''
			},
			labelSizes: { left: 14, center: 12, right: 12 },
			labelColors: { left: '#60a5fa', center: '#9ca3af', right: '#ef4444' },
			highlight: true,
			mathjax
		}).move(qakX, qkvY);

		// Circle Attention Score Plus symbol below R·W_k,R, aligned with K row (intersection of their centers)
		const rwkrWidth = seqLen * qktCellSize;
		const plusX = qakX + rwkrWidth / 2;
		const plusY = kY + matrixHeight / 2;
		const plusR = 12;
		createCircleSymbol(attentionHead, {
			symbol: 'plus',
			color: '#fde047',
			radius: plusR
		}).move(plusX - plusR, plusY - plusR);

		// Arrow from cross circle (⊗) down to plus symbol (enters from top)
		drawLines(
			attentionHead,
			[
				[crossCircleX, crossCircleY + crossCircleR + 5],
				[crossCircleX, plusY - plusR - 30],
				[plusX, plusY - plusR - 30],
				[plusX, plusY - plusR - 5]
			],
			{ withArrow: true, color: '#fde047' }
		);

		// Arrow from QK^T bottom center down to plus symbol (enters from left)
		const qktCenterX = qktX + qktWidth / 2;
		const qktBottomY = qkvY + seqLen * qktCellSize;
		drawLines(
			attentionHead,
			[
				[qktCenterX, qktBottomY + 30],
				[qktCenterX, plusY],
				[plusX - plusR - 5, plusY]
			],
			{ withArrow: true, color: '#fde047' }
		);

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

		// Arrow from plus symbol to attention pattern
		drawLines(
			attentionHead,
			[
				[plusX + plusR + 5, plusY],
				[aX - 5, plusY]
			],
			{ withArrow: true, color: '#fde047' }
		);

		// Draw A matrix formula label separately (to avoid bounding box issues)
		// For Relative PE: A = Softmax((QK^T + Q·a^K)/√d)
		const formula = renderMath(
			attentionHead,
			'A = \\text{Softmax}\\left(\\frac{QK^T + Q \\cdot (W_{k,R} \\cdot R)^T + (u \\cdot K^T) + (v \\cdot (W_{k,R} \\cdot R)^T ) }{\\sqrt{d}}\\right)',
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

		// Multiplication symbol (⊗) between K and V, aligned with K^T center
		const uMultX = ktX + ktWidth / 2;
		const uMultY = kY + matrixHeight + (vY - kY - matrixHeight) / 2;
		const uMultR = 12;
		createCircleSymbol(attentionHead, {
			symbol: 'cross',
			color: '#fde047',
			radius: uMultR
		}).move(uMultX - uMultR, uMultY - uMultR);
		// Label C
		attentionHead
			.text('C')
			.font({ family: 'sans-serif', size: 14, weight: 'bold' })
			.fill('#fde047')
			.move(uMultX - 5, uMultY + uMultR + 5);

		// Line from u to the multiplication symbol (horizontal then to symbol)
		const uRightEdge = uvTableX + uvCols * uvCellWidth;
		const uCenterY = uTableY + uvCellHeight / 2;
		const uMultAbsX = attentionHeadX + uMultX;
		const uMultAbsY = attentionHeadY + uMultY;
		drawLines(
			content,
			[
				[uRightEdge + 70, uCenterY],
				[uMultAbsX - uMultR - 30, uCenterY],
				[uMultAbsX - uMultR - 30, uMultAbsY],
				[uMultAbsX - uMultR - 5, uMultAbsY]
			],
			{ withArrow: true, color: '#fde047' }
		);

		// Arrow from K^T straight down to circle with X (below the label)
		const ktCenterXLocal = ktX + ktWidth / 2;
		const ktBottomYLocal = qkvY + (dHead - 30) * 3; // ktRows * cellHeight
		drawLines(
			attentionHead,
			[
				[ktCenterXLocal, ktBottomYLocal + 50],
				[ktCenterXLocal, uMultY - uMultR - 5]
			],
			{ withArrow: true, color: '#fde047' }
		);

		// Arrow from circle with X (below K^T) to circle with plus (bottom)
		drawLines(
			attentionHead,
			[
				[uMultX + uMultR + 5, uMultY],
				[plusX, uMultY],
				[plusX, plusY + plusR + 5]
			],
			{ withArrow: true, color: '#fde047' }
		);

		// Circle D (⊗) horizontally aligned with W_k,R
		const vMultX = attentionHeadX + 700;
		const vMultY = wkrAbsY;
		const vMultR = 12;
		createCircleSymbol(content, {
			symbol: 'cross',
			color: '#fde047',
			radius: vMultR
		}).move(vMultX - vMultR, vMultY - vMultR);
		// Label D
		content
			.text('D')
			.font({ family: 'sans-serif', size: 14, weight: 'bold' })
			.fill('#fde047')
			.move(vMultX + vMultR + 5, vMultY - 7);

		// Arrow from v to circle with X (from top)
		const vVectorRightEdge = uvTableX + uvCols * uvCellWidth;
		const vVectorY = vTableY + uvCellHeight / 2;
		drawLines(
			content,
			[
				[vVectorRightEdge + 70, vVectorY],
				[vMultX, vVectorY],
				[vMultX, vMultY - vMultR - 5]
			],
			{ withArrow: true, color: '#fde047' }
		);

		// Arrow from top of R·W_k,R, up and right to left edge of circle with X
		const rwkrCenterXLocal = attentionHeadX + qakX + qakWidth / 2;
		const rwkrTopYLocal = attentionHeadY + qkvY;
		drawLines(
			content,
			[
				[rwkrCenterXLocal, rwkrTopYLocal - 15],
				[rwkrCenterXLocal, vMultY],
				[vMultX - vMultR - 5, vMultY]
			],
			{ withArrow: true, color: '#fde047' }
		);

		// Arrow from Circle D to plus (joins horizontal section from Circle B)
		const plusAbsX = attentionHeadX + plusX;
		const plusAbsY = attentionHeadY + plusY;
		const horizontalSectionY = plusAbsY - plusR - 30;
		drawLines(
			content,
			[
				[vMultX, vMultY + vMultR + 5],
				[vMultX, horizontalSectionY],
				[plusAbsX + 40, horizontalSectionY],
				[plusAbsX + 15, plusAbsY - plusR - 1]
			],
			{ withArrow: true, color: '#fde047' }
		);

		// O matrix (Output = A × V)
		// Position below and to the left of original position
		const aRightEdge = aX + aWidth;
		const oWidth = qkvCols * qkvCellWidth;
		const oX = aRightEdge - oWidth - 40;
		const oY = vY + 50;

		// Circle (⊗) between V and O - aligned with O center
		const circleRadius = 12;
		const vRightEdge = qkvMatrixX + matrixWidth;
		const circleX = (vRightEdge + oX) / 2;
		const circleY = oY + matrixHeight / 2;
		createCircleSymbol(attentionHead, {
			symbol: 'cross',
			color: '#9ca3af',
			radius: circleRadius
		}).move(circleX - circleRadius, circleY - circleRadius);

		// Arrow from V right side middle to circle (before O)
		const vMatrixRightEdge = qkvMatrixX + matrixWidth;
		const vMatrixCenterY = vY + matrixHeight / 2;
		const cornerX = (vMatrixRightEdge + circleX) / 2;
		drawLines(
			attentionHead,
			[
				[vMatrixRightEdge + 5, vMatrixCenterY],
				[cornerX, vMatrixCenterY],
				[cornerX, circleY],
				[circleX - circleRadius - 5, circleY]
			],
			{ withArrow: true }
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
		// Use aRightEdge (shared right edge of A and O) + padding for labels
		const borderPadding = 60;
		const borderWidth = aRightEdge + borderPadding;

		attentionHead
			.rect(borderWidth, borderHeight)
			.fill('none')
			.stroke({
				color: '#6b7280',
				width: 1.5,
				dasharray: '8,4'
			})
			.radius(8);

		// Position attention head relative to X matrix (vertically centered with X)
		attentionHead.move(attentionHeadX, attentionHeadY);

		// "ATTENTION HEAD" label - drawn on content group
		const headerLabelX = attentionHeadX + borderWidth - 145;
		const headerLabelY = attentionHeadY - 8;

		content
			.rect(130, 18)
			.move(headerLabelX - 5, headerLabelY - 2)
			.fill('#0a0a1a');
		content
			.text('ATTENTION HEAD')
			.font({ family: 'sans-serif', size: 14, weight: 'bold' })
			.fill('#9ca3af')
			.move(headerLabelX, headerLabelY);

		// Arrow from R to W_k,R (yellow) - horizontal then up to W_k,R center
		const rRightEdge = akTableX + akCols * akCellWidth;
		const rCenterY = akTableY + akTableHeight / 2;
		const wkrLeftEdge = attentionHeadX + wMatrixX;
		drawLines(
			content,
			[
				[rRightEdge + 70, rCenterY],
				[wkrLeftEdge - 30, rCenterY],
				[wkrLeftEdge - 30, wkrAbsY],
				[wkrLeftEdge - 5, wkrAbsY]
			],
			{ withArrow: true, color: '#fde047' }
		);

		// Curved arrow from W_k,R to R·W_k,R matrix
		const wkrRightEdge = attentionHeadX + wMatrixX + wMatrixWidth;
		const rwkrCenterX = attentionHeadX + qakX + qakWidth / 2;
		const rwkrTopY = attentionHeadY + qkvY;
		drawLines(
			content,
			[
				[wkrRightEdge + 5, wkrAbsY],
				[rwkrCenterX - 15, wkrAbsY],
				[rwkrCenterX - 15, rwkrTopY - 15]
			],
			{ withArrow: true, color: '#fde047' }
		);

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
				[ktCenterX - 15, kCenterY],
				[ktCenterX - 15, ktBottomY + 50]
			],
			{ withArrow: true }
		);

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
		drawLines(
			content,
			[
				[oRightEdgeAbs + 5, oCenterY],
				[borderRightEdge + 40, oCenterY]
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
	attribution={{
		url: 'https://www.youtube.com/watch?v=0VLAoVGf_74',
		name: 'Welch Labs'
	}}
>
	<div bind:this={container} class="w-full"></div>
</DiagramWrapper>
