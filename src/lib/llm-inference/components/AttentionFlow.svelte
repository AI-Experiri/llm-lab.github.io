<!-- ABOUTME: SVG.js-based attention flow diagram for inference architecture visualization -->
<!-- ABOUTME: Shows single attention head with dimension annotations for understanding Q/K/V heads -->

<script>
	import { onMount } from 'svelte';
	import { SVG } from '@svgdotjs/svg.js';
	import { matrix, loadMathJax } from '$lib/llm-pos-enc/utils/attentionSVGs.js';

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
		// COLOR-CODED DIMENSION NOTATION
		// Blue (#3b82f6) = batch/sequence dims: B, T, S
		// Red (#ef4444) = contracting/head dims: D, H
		// Purple (#a855f7) = parameters
		// ========================================
		const blue = '3b82f6'; // B, T, S
		const red = 'ef4444'; // D, H (contracting)
		const purple = 'a855f7'; // parameters

		// Symbolic dimension strings with color
		const dimBTD = `\\textcolor[HTML]{${blue}}{B}\\textcolor[HTML]{${blue}}{T}\\textcolor[HTML]{${red}}{D}`;
		const dimDH = `\\textcolor[HTML]{${red}}{D}\\textcolor[HTML]{${red}}{H}`;
		const dimBTH = `\\textcolor[HTML]{${blue}}{B}\\textcolor[HTML]{${blue}}{T}\\textcolor[HTML]{${red}}{H}`;
		const dimBSH = `\\textcolor[HTML]{${blue}}{B}\\textcolor[HTML]{${blue}}{S}\\textcolor[HTML]{${red}}{H}`;
		const dimHS = `\\textcolor[HTML]{${red}}{H}\\textcolor[HTML]{${blue}}{S}`;
		const dimBTS = `\\textcolor[HTML]{${blue}}{B}\\textcolor[HTML]{${blue}}{T}\\textcolor[HTML]{${blue}}{S}`;

		// ========================================
		// X MATRIX - Anchor point for the layout
		// ========================================
		const xCols = 10; // visual columns (compressed representation of dModel)
		const xCellWidth = 8;
		const xCellHeight = 16;
		const xWidth = xCols * xCellWidth;
		const xHeight = seqLen * xCellHeight;
		const xX = 70; // Leave space for token labels on left
		const xY = 210;

		// Draw token labels to the left of X matrix (right-aligned, vertically centered with each row)
		tokens.forEach((token, i) => {
			const text = content.text(token).font({ family: 'sans-serif', size: 10 }).fill('#d4d4d4');
			const textWidth = text.bbox().width || 40;
			// Position left of matrix, aligned with each row
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
			labels: {
				left: 'X',
				center: '',
				right: dimBTD
			},
			labelSizes: { left: 13, center: 16, right: 14 },
			labelColors: { left: '#9ca3af', center: '#9ca3af', right: '#ffffff' },
			mathjax
		}).move(xX, xY);

		// ========================================
		// ATTENTION HEAD - Positioned relative to X
		// ========================================
		const gapBetweenXAndHead = 15;
		const attentionHeadX = xX + xWidth + gapBetweenXAndHead;

		// Matrix configuration based on seqLen
		const qkvCellHeight = 10;
		const qkvCols = 64; // visual columns for Q, K, V (compressed dHead)
		const qkvCellWidth = 5;
		const matrixHeight = seqLen * qkvCellHeight;
		const matrixWidth = qkvCols * qkvCellWidth;
		const spacing = 100;

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
			fill: '#1e3a5f',
			stroke: '#3b82f6',
			labels: {
				left: '',
				center: '',
				right: `${dModel} \\times ${dHead}`
			},
			labelSizes: { left: 10, center: 16, right: 12 },
			labelColors: { left: '#22c55e', center: '#9ca3af', right: '#ef4444' },
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
			rows: dHead - 15,
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

		// A matrix (Attention Pattern)
		const aX = qktX + qktWidth + 80;
		const aCellSize = 25;
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
		attentionHead
			.circle(circleRadius * 2)
			.move(circleX - circleRadius, circleY - circleRadius)
			.fill('none')
			.stroke({ color: '#9ca3af', width: 1.5 });
		attentionHead
			.line(circleX - 6, circleY - 6, circleX + 6, circleY + 6)
			.stroke({ color: '#9ca3af', width: 1.5 });
		attentionHead
			.line(circleX - 6, circleY + 6, circleX + 6, circleY - 6)
			.stroke({ color: '#9ca3af', width: 1.5 });

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
		// Use aRightEdge (shared right edge of A and O) + padding for labels
		const borderPadding = 60;
		const borderWidth = aRightEdge + borderPadding;
		const borderHeight = vY + matrixHeight + 60;

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
		const attentionHeadY = xY + xHeight / 2 - borderHeight / 2;
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

		// Helper to draw arrow with arrowhead
		const drawArrow = (x1, y1, x2, y2, color = '#9ca3af') => {
			const angle = Math.atan2(y2 - y1, x2 - x1);
			const headLen = 12;
			// Line ends at the back of the arrowhead
			const lineEndX = x2 - headLen * Math.cos(angle);
			const lineEndY = y2 - headLen * Math.sin(angle);
			content.line(x1, y1, lineEndX, lineEndY).stroke({ color, width: 1.5 });
			// Arrowhead with depth
			content
				.polygon([
					[x2, y2],
					[
						x2 - headLen * Math.cos(angle - Math.PI / 6),
						y2 - headLen * Math.sin(angle - Math.PI / 6)
					],
					[x2 - headLen * 0.6 * Math.cos(angle), y2 - headLen * 0.6 * Math.sin(angle)],
					[
						x2 - headLen * Math.cos(angle + Math.PI / 6),
						y2 - headLen * Math.sin(angle + Math.PI / 6)
					]
				])
				.fill(color);
		};

		// Helper to draw arrowhead only
		const drawArrowHead = (x, y, angle, color = '#9ca3af') => {
			const headLen = 12;
			content
				.polygon([
					[x, y],
					[
						x - headLen * Math.cos(angle - Math.PI / 6),
						y - headLen * Math.sin(angle - Math.PI / 6)
					],
					[x - headLen * 0.6 * Math.cos(angle), y - headLen * 0.6 * Math.sin(angle)],
					[x - headLen * Math.cos(angle + Math.PI / 6), y - headLen * Math.sin(angle + Math.PI / 6)]
				])
				.fill(color);
		};

		// Helper to draw L-shaped path with rounded corner
		const drawLPath = (
			x1,
			y1,
			cornerX,
			cornerY,
			x2,
			y2,
			radius = 10,
			color = '#9ca3af',
			withArrow = true
		) => {
			// Determine directions
			const goingDownToCorner = cornerY > y1;
			const goingRightToCorner = cornerX > x1;
			const goingDownFromCorner = y2 > cornerY;
			const goingRightFromCorner = x2 > cornerX;

			// Build path with rounded corner using quadratic bezier
			let pathStr = `M ${x1} ${y1} `;

			// Line to just before corner
			if (x1 === cornerX) {
				// Vertical first, then horizontal
				pathStr += `L ${cornerX} ${cornerY + (goingDownToCorner ? -radius : radius)} `;
				pathStr += `Q ${cornerX} ${cornerY} ${cornerX + (goingRightFromCorner ? radius : -radius)} ${cornerY} `;
				pathStr += `L ${x2} ${y2}`;
			} else {
				// Horizontal first, then vertical
				pathStr += `L ${cornerX + (goingRightToCorner ? -radius : radius)} ${y1} `;
				pathStr += `Q ${cornerX} ${y1} ${cornerX} ${y1 + (goingDownFromCorner ? radius : -radius)} `;
				pathStr += `L ${x2} ${y2}`;
			}

			content.path(pathStr).fill('none').stroke({ color, width: 1.5 });

			// Add arrowhead if requested
			if (withArrow) {
				const angle = Math.atan2(y2 - cornerY, x2 - cornerX);
				drawArrowHead(x2, y2, angle, color);
			}
		};

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
		content
			.line(xRightEdge + 5, wkAbsY, junctionX, wkAbsY)
			.stroke({ color: '#9ca3af', width: 1.5 });

		// Vertical line from W_Q level to W_V level
		content.line(junctionX, wqAbsY, junctionX, wvAbsY).stroke({ color: '#9ca3af', width: 1.5 });

		// Arrow to W_Q (horizontal from junction)
		drawArrow(junctionX, wqAbsY, wLeftEdge - 5, wqAbsY);

		// Arrow to W_K (horizontal from junction)
		drawArrow(junctionX, wkAbsY, wLeftEdge - 5, wkAbsY);

		// Arrow to W_V (horizontal from junction)
		drawArrow(junctionX, wvAbsY, wLeftEdge - 5, wvAbsY);

		// Arrows from W matrices to Q, K, V matrices
		const wRightEdge = attentionHeadX + wMatrixX + wMatrixWidth;
		const qkvLeftEdge = attentionHeadX + qkvMatrixX;

		// Q/K/V matrix center Y positions (absolute coordinates)
		const qCenterY = attentionHeadY + qkvY + matrixHeight / 2;
		const kCenterY = attentionHeadY + kY + matrixHeight / 2;
		const vCenterY = attentionHeadY + vY + matrixHeight / 2;

		// Arrow from W_Q to Q (W center Y = wqAbsY, Q center Y = qCenterY)
		drawArrow(wRightEdge + 5, wqAbsY, qkvLeftEdge - 5, qCenterY);

		// Arrow from W_K to K
		drawArrow(wRightEdge + 5, wkAbsY, qkvLeftEdge - 5, kCenterY);

		// Arrow from W_V to V
		drawArrow(wRightEdge + 5, wvAbsY, qkvLeftEdge - 5, vCenterY);

		// Arrow from Q to K^T (horizontal from Q's center)
		const qRightEdge = attentionHeadX + qkvMatrixX + matrixWidth;
		const ktLeftEdge = attentionHeadX + ktX;
		drawArrow(qRightEdge + 5, qCenterY, ktLeftEdge - 5, qCenterY);

		// L-shaped arrow from K to K^T bottom (with Transpose label)
		const kRightEdge = attentionHeadX + qkvMatrixX + matrixWidth;
		const ktHeight = (dHead - 15) * 3; // K^T has (dHead-15) rows with cellHeight 3
		const ktBottomY = attentionHeadY + qkvY + ktHeight;
		const ktCenterX = attentionHeadX + ktX + ktWidth / 2;

		// L-shaped path with rounded corner: horizontal from K, then up to K^T
		const ktLabelOffset = 35; // Space for K^T label below the matrix
		drawLPath(
			kRightEdge + 5,
			kCenterY,
			ktCenterX,
			kCenterY,
			ktCenterX,
			ktBottomY + ktLabelOffset,
			10
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
		drawArrow(ktRightEdge + 5, qCenterY, qktLeftEdge - 5, qCenterY);

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
		drawLPath(
			qktCenterX,
			qktBottomWithLabels,
			qktCenterX,
			maskSoftmaxY,
			aLeftEdge - aRowLabelSpace,
			maskSoftmaxY,
			10
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
		drawArrow(vRightEdgeAbs + 5, vCenterY, circleXAbs - circleRadius - 5, circleYAbs);

		// Arrow from circle (⊗) to O - to middle of O's left side
		const oLeftEdgeAbs = attentionHeadX + oX;
		drawArrow(circleXAbs + circleRadius + 5, circleYAbs, oLeftEdgeAbs - 5, vCenterY);

		// Arrow from A to circle (⊗) - down from A bottom center, left, then down to circle top
		const aBottomY = attentionHeadY + qkvY + aHeight;
		const aBottomLabelsY = aBottomY + 110; // Below A's column labels (starting point)
		const aCenterXAbs = attentionHeadX + aX + aWidth / 2;
		const corner1Y = aBottomY + 130; // Fixed position for horizontal line
		const radius = 10;

		// Path with two rounded corners: down, left, down
		const pathStr =
			`M ${aCenterXAbs} ${aBottomLabelsY} ` +
			`L ${aCenterXAbs} ${corner1Y - radius} ` +
			`Q ${aCenterXAbs} ${corner1Y} ${aCenterXAbs - radius} ${corner1Y} ` +
			`L ${circleXAbs + radius} ${corner1Y} ` +
			`Q ${circleXAbs} ${corner1Y} ${circleXAbs} ${corner1Y + radius} ` +
			`L ${circleXAbs} ${circleYAbs - circleRadius - 5}`;

		content.path(pathStr).fill('none').stroke({ color: '#9ca3af', width: 1.5 });
		drawArrowHead(circleXAbs, circleYAbs - circleRadius - 5, Math.PI / 2);

		// Thick arrow from O right side to outside attention head border
		const oRightEdgeAbs = attentionHeadX + oX + oWidth;
		const oCenterY = vCenterY;
		const borderRightEdge = attentionHeadX + borderWidth;

		// Draw larger arrowhead first
		const thickHeadLen = 18;
		const thickArrowX = borderRightEdge + 40;
		content
			.polygon([
				[thickArrowX, oCenterY],
				[thickArrowX - thickHeadLen, oCenterY - 10],
				[thickArrowX - thickHeadLen * 0.6, oCenterY],
				[thickArrowX - thickHeadLen, oCenterY + 10]
			])
			.fill('#9ca3af');

		// Draw thick line (ends at back of arrowhead)
		content
			.line(oRightEdgeAbs + 5, oCenterY, thickArrowX - thickHeadLen, oCenterY)
			.stroke({ color: '#9ca3af', width: 3 });

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

<div class="w-full rounded-lg bg-[#0a0a1a] p-6">
	<div bind:this={container} class="min-h-[500px] w-full"></div>
</div>
