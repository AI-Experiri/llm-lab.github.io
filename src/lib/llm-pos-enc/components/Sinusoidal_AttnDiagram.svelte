<!-- ABOUTME: Shows how Positional Encoding combines with Token Embeddings before attention -->
<!-- ABOUTME: E + PE = X, then X flows into the attention mechanism -->

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
		// Viewbox will be auto-fitted to content at the end
		const content = draw.group();

		// Helper to render MathJax label on a group
		const renderMath = (group, latex, x, y, color = '#ffffff', fontSize = 16) => {
			const mjContainer = mathjax.tex2svg(latex, { display: false });
			const svg = mjContainer.querySelector('svg');
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
		// MATRIX CONFIGURATION - E+PE vertical, then = X horizontal
		// ========================================
		const matrixCols = 10;
		const matrixCellWidth = 8;
		const matrixCellHeight = 14;
		const embMatrixWidth = matrixCols * matrixCellWidth;
		const embMatrixHeight = seqLen * matrixCellHeight;

		// E+PE vertical stack position (positive coordinates, room for labels on left)
		const stackX = -5;
		const eY = 170;

		// ========================================
		// E MATRIX (Token Embeddings) - Top of stack
		// ========================================
		content
			.text('Token')
			.font({ family: 'sans-serif', size: 10, weight: 'bold' })
			.fill('#60a5fa')
			.move(stackX, eY - 28);
		content
			.text('Embeddings')
			.font({ family: 'sans-serif', size: 10, weight: 'bold' })
			.fill('#60a5fa')
			.move(stackX, eY - 15);

		matrix(content, {
			rows: seqLen,
			cols: matrixCols,
			cellWidth: matrixCellWidth,
			cellHeight: matrixCellHeight,
			fill: '#1e3a5f',
			stroke: '#3b82f6',
			colorStart: '#60a5fa',
			colorEnd: '#1e40af',
			labels: { left: 'E', center: '', right: `${seqLen} \\times ${dModel}` },
			labelSizes: { left: 12, center: 14, right: 12 },
			labelColors: { left: '#60a5fa', center: '#9ca3af', right: '#ef4444' },
			rowLabels: tokens,
			rowLabelConfig: { fontSize: 9, color: '#d4d4d4', offset: -5 },
			mathjax
		}).move(stackX, eY);

		// ========================================
		// PLUS SYMBOL (between E and PE)
		// ========================================
		const plusY = eY + embMatrixHeight + 40;
		const plusRadius = 12;
		createCircleSymbol(content, {
			symbol: 'plus',
			color: '#22c55e',
			radius: plusRadius
		}).move(stackX + embMatrixWidth / 2 - plusRadius, plusY - plusRadius);

		// ========================================
		// PE MATRIX (Positional Encoding) - Bottom of stack
		// ========================================
		const peY = plusY + 60;

		content
			.text('Positional')
			.font({ family: 'sans-serif', size: 10, weight: 'bold' })
			.fill('#a855f7')
			.move(stackX, peY - 28);
		content
			.text('Encoding')
			.font({ family: 'sans-serif', size: 10, weight: 'bold' })
			.fill('#a855f7')
			.move(stackX, peY - 15);

		const posLabels = tokens.map((_, i) => `pos${i}`);
		matrix(content, {
			rows: seqLen,
			cols: matrixCols,
			cellWidth: matrixCellWidth,
			cellHeight: matrixCellHeight,
			fill: '#3b0764',
			stroke: '#a855f7',
			colorStart: '#c084fc',
			colorEnd: '#7c3aed',
			labels: { left: 'PE', center: '', right: `${seqLen} \\times ${dModel}` },
			labelSizes: { left: 12, center: 14, right: 12 },
			labelColors: { left: '#a855f7', center: '#9ca3af', right: '#ef4444' },
			rowLabels: posLabels,
			rowLabelConfig: { fontSize: 9, color: '#d4d4d4', offset: -5 },
			highlight: true,
			mathjax
		}).move(stackX, peY);

		// ========================================
		// EQUALS SYMBOL (to the right of E+PE stack, vertically centered)
		// ========================================
		const stackCenterY = (eY + peY + embMatrixHeight) / 2;
		const equalsX = stackX + embMatrixWidth + 20;
		content
			.text('=')
			.font({ family: 'sans-serif', size: 22, weight: 'bold' })
			.fill('#9ca3af')
			.move(equalsX, stackCenterY - 10);

		// ========================================
		// X MATRIX (E + PE) - To the right of =
		// ========================================
		const xX = equalsX + 35;
		const xCols = matrixCols;
		const xCellWidth = matrixCellWidth;
		const xCellHeight = matrixCellHeight;
		const xWidth = xCols * xCellWidth;
		const xHeight = seqLen * xCellHeight;
		const xY = stackCenterY - xHeight / 2;

		content
			.text('Input X')
			.font({ family: 'sans-serif', size: 10, weight: 'bold' })
			.fill('#22c55e')
			.move(xX, xY - 15);

		matrix(content, {
			rows: seqLen,
			cols: xCols,
			cellWidth: xCellWidth,
			cellHeight: xCellHeight,
			fill: '#14532d',
			stroke: '#22c55e',
			colorStart: '#4ade80',
			colorEnd: '#15803d',
			labels: { left: 'X', center: '', right: `${seqLen} \\times ${dModel}` },
			labelSizes: { left: 12, center: 14, right: 12 },
			labelColors: { left: '#22c55e', center: '#9ca3af', right: '#ef4444' },
			mathjax
		}).move(xX, xY);

		// ========================================
		// ATTENTION HEAD - Positioned relative to X
		// ========================================
		const gapBetweenXAndHead = 15;
		const attentionHeadX = xX + xWidth + gapBetweenXAndHead;

		// Matrix configuration based on seqLen
		const qkvCellHeight = 12;
		const qkvCols = 55; // visual columns for Q, K, V (compressed dHead)
		const qkvCellWidth = 6;
		const matrixHeight = seqLen * qkvCellHeight;
		const matrixWidth = qkvCols * qkvCellWidth;
		const spacing = 115;

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

		// Positions relative to attention head group (0,0)
		const qkvY = 40;
		const kY = qkvY + matrixHeight + spacing;
		const vY = qkvY + 2 * (matrixHeight + spacing);

		// Weight matrix configuration
		const wMatrixCols = 1;
		const wMatrixRows = 1;
		const wCellWidth = 55;
		const wCellHeight = 55;
		const wMatrixX = 50;
		const wMatrixWidth = wMatrixCols * wCellWidth;
		const wMatrixHeight = wMatrixRows * wCellHeight;
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
			labelTopSizes: { left: 10, center: 20, right: 12 },
			labelTopColors: { left: '#ffffff', center: '#ffffff', right: '#ffffff' },
			labelYTop: 15
		}).move(wMatrixX, qkvY + matrixHeight / 2 - wMatrixHeight / 2);

		// W_K matrix
		matrix(attentionHead, {
			...wMatrixConfig,
			labelsTop: { left: '', center: 'W_K', right: '' },
			labelTopSizes: { left: 10, center: 20, right: 12 },
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
			labelTopSizes: { left: 10, center: 20, right: 12 },
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
			rows: dHead - 15,
			cols: ktCols,
			cellWidth: ktCellWidth,
			cellHeight: 3,
			fill: '#1e3a5f',
			stroke: '#3b82f6',
			labels: { left: '', center: 'K^T', right: '' },
			labelSizes: { left: 10, center: 16, right: 12 },
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

		// A matrix (Attention Pattern)
		const aX = qktX + qktWidth + 80;
		const aCellSize = 28;
		const aWidth = seqLen * aCellSize;

		// Draw row labels (left of A matrix)
		tokens.forEach((token, i) => {
			const text = attentionHead
				.text(token)
				.font({ family: 'sans-serif', size: 10 })
				.fill('#d4d4d4');
			const textWidth = text.bbox().width || 40;
			text.move(aX - textWidth - 5, qkvY + i * aCellSize + aCellSize / 2 - 5);
		});

		// Draw column labels (bottom of A matrix, vertical)
		const aHeight = seqLen * aCellSize;
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

		matrix(attentionHead, {
			rows: seqLen,
			cols: seqLen,
			cellWidth: aCellSize,
			cellHeight: aCellSize,
			fill: '#4a044e',
			stroke: '#a855f7',
			colorStart: '#fde047',
			colorEnd: '#a855f7',
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

		// O matrix (Output = A × V)
		// Align right edge of O with right edge of A
		const aRightEdge = aX + aWidth;
		const oWidth = qkvCols * qkvCellWidth;
		const oX = aRightEdge - oWidth;

		// Circle with X (⊗) between V and O
		const circleRadius = 12;
		const vRightEdge = qkvMatrixX + matrixWidth;
		const circleX = (vRightEdge + oX) / 2;
		const circleY = vY + matrixHeight / 2;
		createCircleSymbol(attentionHead, {
			symbol: 'cross',
			color: '#9ca3af',
			radius: circleRadius
		}).move(circleX - circleRadius, circleY - circleRadius);

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
				left: '\\text{Att. Head Out}',
				center: 'O = AV',
				right: `${seqLen} \\times ${dHead}`
			},
			labelSizes: { left: 16, center: 14, right: 12 },
			labelColors: { left: '#22c55e', center: '#9ca3af', right: '#ef4444' },
			mathjax
		}).move(oX, vY);

		// Dashed border around attention head (relative to group)
		const borderPadding = 60;
		const borderWidth = aRightEdge + borderPadding;
		const borderHeight = vY + matrixHeight + 60;

		border(attentionHead, {
			width: borderWidth,
			height: borderHeight,
			label: 'ATTENTION HEAD'
		});

		// Center attention head with the E+PE stack
		const attentionHeadY = stackCenterY - borderHeight / 2;
		attentionHead.move(attentionHeadX, attentionHeadY);

		// Arrows from X to W matrices (with vertical connector for W_Q and W_V)
		const xRightEdge = xX + xWidth;
		const wLeftEdge = attentionHeadX + wMatrixX;
		const junctionX = xRightEdge + 40;

		// W matrix Y positions (top of each W matrix, relative to attentionHead)
		const wqTopY = qkvY + matrixHeight / 2 - wMatrixHeight / 2;
		const wkTopY = kY + matrixHeight / 2 - wMatrixHeight / 2;
		const wvTopY = vY + matrixHeight / 2 - wMatrixHeight / 2;

		// Center Y of each W matrix (absolute coordinates)
		const wqAbsY = attentionHeadY + wqTopY + wMatrixHeight / 2;
		const wkAbsY = attentionHeadY + wkTopY + wMatrixHeight / 2;
		const wvAbsY = attentionHeadY + wvTopY + wMatrixHeight / 2;

		// Horizontal line from X to junction point (at W_K level)
		drawLines(content, [
			[xRightEdge + 5, wkAbsY],
			[junctionX, wkAbsY]
		]);

		// Vertical line from W_Q level to W_V level
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
		const ktHeight = (dHead - 15) * 3; // K^T has (dHead-15) rows with cellHeight 3
		const ktBottomY = attentionHeadY + qkvY + ktHeight;
		const ktCenterX = attentionHeadX + ktX + ktWidth / 2;

		// L-shaped path with rounded corner: horizontal from K, then up to K^T
		const ktLabelOffset = 35; // Space for K^T label below the matrix
		drawLines(
			content,
			[
				[kRightEdge + 5, kCenterY],
				[ktCenterX, kCenterY],
				[ktCenterX, ktBottomY + ktLabelOffset]
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

		// L-shaped arrow from QK^T to A (down then right)
		const qktHeight = seqLen * qktCellSize;
		const qktCenterX = attentionHeadX + qktX + qktWidth / 2;
		const aLeftEdge = attentionHeadX + aX;

		// Start below QK^T labels (matrix + label space)
		const qktLabelOffset = 30; // Space for QK^T labels
		const qktBottomWithLabels = attentionHeadY + qkvY + qktHeight + qktLabelOffset;
		const maskSoftmaxY = qktBottomWithLabels + 60;

		// L-shaped path with rounded corner: down from QK^T, then right to A
		const aRowLabelSpace = 55; // Space for row labels on left of A
		drawLines(
			content,
			[
				[qktCenterX, qktBottomWithLabels],
				[qktCenterX, maskSoftmaxY],
				[aLeftEdge - aRowLabelSpace, maskSoftmaxY]
			],
			{ withArrow: true }
		);

		// "Mask & Softmax" label below the arrow
		content
			.text('Mask &')
			.font({ family: 'sans-serif', size: 14 })
			.fill('#9ca3af')
			.move(qktCenterX - 20, maskSoftmaxY + 15);
		content
			.text('Softmax')
			.font({ family: 'sans-serif', size: 14 })
			.fill('#9ca3af')
			.move(qktCenterX - 20, maskSoftmaxY + 30);

		// Arrow from V to circle (⊗) - from middle of V's right side
		const vRightEdgeAbs = attentionHeadX + qkvMatrixX + matrixWidth;
		const circleXAbs = attentionHeadX + circleX;
		const circleYAbs = attentionHeadY + circleY;
		drawLines(
			content,
			[
				[vRightEdgeAbs + 5, vCenterY],
				[circleXAbs - circleRadius - 5, circleYAbs]
			],
			{ withArrow: true }
		);

		// Arrow from circle (⊗) to O - to middle of O's left side
		const oLeftEdgeAbs = attentionHeadX + oX;
		drawLines(
			content,
			[
				[circleXAbs + circleRadius + 5, circleYAbs],
				[oLeftEdgeAbs - 5, vCenterY]
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
		const oCenterY = vCenterY;
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
