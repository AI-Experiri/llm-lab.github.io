// ABOUTME: SVG.js element factory functions for attention flow diagrams
// ABOUTME: Returns SVG.js elements that can be placed and animated

/**
 * Loads MathJax with SVG output, handling race conditions when multiple components
 * try to load it simultaneously. Returns a promise that resolves to the MathJax instance.
 *
 * @returns {Promise<Object>} Promise resolving to window.MathJax
 */
export function loadMathJax() {
	return new Promise((resolve) => {
		// Already fully loaded
		if (window.MathJax?.tex2svg) {
			resolve(window.MathJax);
			return;
		}

		// Already loading - wait for startup promise
		if (window.MathJax?.startup?.promise) {
			window.MathJax.startup.promise.then(() => resolve(window.MathJax));
			return;
		}

		// Check if script tag already exists (another component is loading it)
		const existingScript = document.querySelector('script[src*="mathjax"]');
		if (existingScript) {
			// Poll until MathJax is ready
			const checkLoaded = setInterval(() => {
				if (window.MathJax?.tex2svg) {
					clearInterval(checkLoaded);
					resolve(window.MathJax);
				}
			}, 50);
			return;
		}

		// Load fresh
		window.MathJax = {
			tex: { inlineMath: [['$', '$']] },
			svg: { fontCache: 'none' },
			startup: {
				ready: () => {
					window.MathJax.startup.defaultReady();
					window.MathJax.startup.promise.then(() => {
						resolve(window.MathJax);
					});
				}
			}
		};

		const script = document.createElement('script');
		script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';
		script.async = true;
		document.head.appendChild(script);
	});
}

/**
 * Linearly interpolates between two hex colors.
 *
 * @param {string} color1 - Starting hex color (e.g., "#ff0000")
 * @param {string} color2 - Ending hex color (e.g., "#0000ff")
 * @param {number} t - Interpolation factor (0 = color1, 1 = color2)
 * @returns {string} Interpolated color as "rgb(r,g,b)"
 */
function lerpColor(color1, color2, t) {
	const c1 = hexToRgb(color1);
	const c2 = hexToRgb(color2);
	const r = Math.round(c1.r + (c2.r - c1.r) * t);
	const g = Math.round(c1.g + (c2.g - c1.g) * t);
	const b = Math.round(c1.b + (c2.b - c1.b) * t);
	return `rgb(${r},${g},${b})`;
}

/**
 * Converts a hex color string to RGB object.
 *
 * @param {string} hex - Hex color (e.g., "#ff0000" or "ff0000")
 * @returns {{r: number, g: number, b: number}} RGB values (0-255)
 */
function hexToRgb(hex) {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
			}
		: { r: 0, g: 0, b: 0 };
}

/**
 * Creates a visual matrix representation with colored cells and optional labels.
 * Supports row/column labels, MathJax rendering, Toeplitz coloring, and diagonal masking.
 *
 * @param {SVG.Container} draw - SVG.js container to draw into
 * @param {Object} options - Matrix configuration
 * @param {number} [options.rows=5] - Number of rows
 * @param {number} [options.cols=64] - Number of columns
 * @param {number} [options.cellWidth=4] - Width of each cell in pixels
 * @param {number} [options.cellHeight=8] - Height of each cell in pixels
 * @param {string} [options.fill="#1e3a5f"] - Background fill color
 * @param {string} [options.stroke="#3b82f6"] - Border stroke color
 * @param {string} [options.colorStart="#fde047"] - Gradient start color for cells
 * @param {string} [options.colorEnd="#3b82f6"] - Gradient end color for cells
 * @param {number} [options.radius=2] - Border corner radius
 * @param {Object} [options.labels] - Bottom labels {left, center, right}
 * @param {Object} [options.labelsTop] - Top labels {left, center, right}
 * @param {boolean} [options.maskUpperDiagonal=false] - Mask cells where col > row
 * @param {Object} [options.mathjax=null] - MathJax instance for LaTeX rendering
 * @param {string[]} [options.rowLabels=null] - Labels for each row
 * @param {string[]} [options.colLabels=null] - Labels for each column
 * @param {string[]} [options.rowColors=null] - Color for each row
 * @param {Object} [options.toeplitzConfig=null] - Diagonal-based coloring config
 * @param {boolean} [options.highlight=false] - Add highlight border
 * @returns {SVG.G} SVG group containing the matrix
 */
export function matrix(
	draw,
	{
		rows = 5,
		cols = 64,
		cellWidth = 4,
		cellHeight = 8,
		fill = '#1e3a5f',
		stroke = '#3b82f6',
		colorStart = '#fde047',
		colorEnd = '#3b82f6',
		radius = 2,
		// Bottom labels
		labels = { left: '', center: '', right: '' },
		labelSizes = { left: 10, center: 14, right: 10 },
		labelColors = { left: '#ffffff', center: '#ffffff', right: '#ffffff' },
		// Top labels
		labelsTop = { left: '', center: '', right: '' },
		labelTopSizes = { left: 10, center: 14, right: 10 },
		labelTopColors = { left: '#ffffff', center: '#ffffff', right: '#ffffff' },
		labelYTop = -25,
		labelXTop = 0,
		// Bottom label position
		labelYBottom = null,
		labelXBottom = 0,
		maskUpperDiagonal = false,
		maskColor = '#374151',
		mathjax = null,
		// Optional row/column labels (arrays of strings)
		rowLabels = null,
		rowLabelConfig = { fontSize: 10, color: '#d4d4d4', offset: -5 },
		colLabels = null,
		colLabelConfig = { fontSize: 10, color: '#d4d4d4', offset: 5, rotate: -45 },
		// Row-based coloring: array of colors, one per row
		rowColors = null,
		// Toeplitz coloring: colors based on diagonal offset (row - col)
		toeplitzConfig = null,
		// Highlight: adds a thick yellow border to focus attention
		highlight = false,
		highlightColor = '#fde047',
		highlightWidth = 3,
		// Toggle all labels on/off
		showLabels = true,
		// Visibility: when false, matrix is invisible but still occupies space
		visible = true
	} = {}
) {
	const width = cols * cellWidth;
	const height = rows * cellHeight;
	const group = draw.group();

	// Apply visibility - group still occupies space but is invisible
	if (!visible) {
		group.opacity(0);
	}

	// Highlight border (drawn first so it's behind)
	if (highlight) {
		group
			.rect(width + highlightWidth * 2, height + highlightWidth * 2)
			.move(-highlightWidth, -highlightWidth)
			.fill('none')
			.stroke({ color: highlightColor, width: highlightWidth })
			.radius(radius + 2);
	}

	// Outer border rect
	group.rect(width, height).fill(fill).stroke({ color: stroke, width: 1 }).radius(radius);

	// Draw individual cells with gradient from yellow to blue
	// Smear mode: when colorStart and colorEnd are the same, use solid color
	const isSmearMode = colorStart && colorEnd && colorStart === colorEnd;

	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			const x = c * cellWidth;
			const y = r * cellHeight;

			// Check if this cell is in the upper diagonal (column > row)
			const isUpperDiagonal = maskUpperDiagonal && c > r;

			if (isUpperDiagonal) {
				group
					.rect(cellWidth - 1, cellHeight - 1)
					.move(x + 0.5, y + 0.5)
					.fill(isSmearMode ? colorStart : maskColor)
					.opacity(0.8);
			} else {
				let cellColor;
				let opacity;

				if (isSmearMode) {
					// Solid uniform color, no randomness
					cellColor = colorStart;
					opacity = 0.8;
				} else if (toeplitzConfig) {
					// Toeplitz coloring: color based on diagonal offset (row - col)
					opacity = 0.5 + Math.random() * 0.4;
					let offset = r - c;
					// Clip if specified
					if (toeplitzConfig.clipTo !== undefined) {
						offset = Math.max(-toeplitzConfig.clipTo, Math.min(toeplitzConfig.clipTo, offset));
					}
					const offsetIndex = toeplitzConfig.offsets.indexOf(offset);
					if (offsetIndex >= 0 && toeplitzConfig.colors[offsetIndex]) {
						cellColor = toeplitzConfig.colors[offsetIndex];
					} else {
						cellColor = lerpColor(colorStart, colorEnd, Math.random());
					}
				} else if (rowColors && rowColors[r]) {
					// Row-based coloring
					opacity = 0.5 + Math.random() * 0.4;
					cellColor = rowColors[r];
				} else {
					// Default gradient coloring
					opacity = 0.5 + Math.random() * 0.4;
					const t = Math.random();
					cellColor = lerpColor(colorStart, colorEnd, t);
				}

				group
					.rect(cellWidth - 1, cellHeight - 1)
					.move(x + 0.5, y + 0.5)
					.fill(cellColor)
					.opacity(opacity);
			}
		}
	}

	// Helper to render a MathJax SVG label
	const renderMathLabel = (latex, x, y, color, fontSize = 14) => {
		if (!mathjax) return null;

		try {
			const container = mathjax.tex2svg(latex, { display: false });
			const mathSvg = container.querySelector('svg');
			if (!mathSvg) return null;

			// MathJax uses "ex" units - parse width/height
			const widthAttr = mathSvg.getAttribute('width') || '1ex';
			const heightAttr = mathSvg.getAttribute('height') || '1ex';

			// Convert ex to pixels (1ex ≈ fontSize * 0.45)
			const exToPx = fontSize * 0.45;
			const svgWidthEx = parseFloat(widthAttr) || 1;
			const svgHeightEx = parseFloat(heightAttr) || 1;
			const svgWidthPx = svgWidthEx * exToPx;
			const svgHeightPx = svgHeightEx * exToPx;

			// Create a group for positioning
			const mathGroup = group.group();

			// Clone the MathJax SVG and set pixel dimensions
			const clonedSvg = mathSvg.cloneNode(true);
			clonedSvg.setAttribute('width', svgWidthPx);
			clonedSvg.setAttribute('height', svgHeightPx);
			clonedSvg.style.overflow = 'visible';

			// Apply color via CSS style on the SVG element
			clonedSvg.style.color = color;
			clonedSvg.querySelectorAll('path').forEach((path) => {
				path.setAttribute('fill', color);
			});
			clonedSvg.querySelectorAll('rect').forEach((rect) => {
				rect.setAttribute('fill', color);
			});

			// Append the native SVG element directly to the group's DOM node
			mathGroup.node.appendChild(clonedSvg);

			// Position the group
			mathGroup.move(x, y);

			return { width: svgWidthPx, height: svgHeightPx, group: mathGroup };
		} catch (e) {
			console.error('MathJax render error:', e);
			return null;
		}
	};

	// Helper to render labels at a given position
	const renderLabels = (labelSet, sizes, colors, yPos, xOffset = 0) => {
		if (labelSet.left) {
			renderMathLabel(labelSet.left, xOffset, yPos, colors.left, sizes.left);
		}

		if (labelSet.center) {
			const result = renderMathLabel(labelSet.center, 0, yPos, colors.center, sizes.center);
			if (result) {
				result.group.move(width / 2 - result.width / 2 + xOffset, yPos);
			}
		}

		if (labelSet.right) {
			const result = renderMathLabel(labelSet.right, 0, yPos, colors.right, sizes.right);
			if (result) {
				result.group.move(width - result.width - 5 + xOffset, yPos);
			}
		}
	};

	if (showLabels) {
		// Render top labels (above matrix)
		renderLabels(labelsTop, labelTopSizes, labelTopColors, labelYTop, labelXTop);

		// Render bottom labels (below matrix)
		const effectiveLabelYBottom = labelYBottom !== null ? labelYBottom : height + 15;
		renderLabels(labels, labelSizes, labelColors, effectiveLabelYBottom, labelXBottom);

		// Render row labels (left side of matrix)
		if (rowLabels && rowLabels.length > 0) {
			rowLabels.forEach((label, i) => {
				// Use per-row color if rowColors is provided, otherwise use default
				const labelColor = rowColors && rowColors[i] ? rowColors[i] : rowLabelConfig.color;
				const text = group
					.text(label)
					.font({ family: 'sans-serif', size: rowLabelConfig.fontSize })
					.fill(labelColor);
				const textWidth = text.bbox().width || 40;
				text.move(
					rowLabelConfig.offset - textWidth,
					i * cellHeight + cellHeight / 2 - rowLabelConfig.fontSize / 2
				);
			});
		}

		// Render column labels (bottom of matrix)
		if (colLabels && colLabels.length > 0) {
			colLabels.forEach((label, i) => {
				const text = group
					.text(label)
					.font({ family: 'sans-serif', size: colLabelConfig.fontSize })
					.fill(colLabelConfig.color);
				text.move(i * cellWidth + cellWidth / 2, height + colLabelConfig.offset);
				if (colLabelConfig.rotate) {
					text.rotate(
						colLabelConfig.rotate,
						i * cellWidth + cellWidth / 2,
						height + colLabelConfig.offset
					);
				}
			});
		}
	}

	return group;
}
