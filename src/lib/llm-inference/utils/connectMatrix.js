// ABOUTME: Connection-based arrow system for SVG diagrams
// ABOUTME: Arrows tied to matrix anchors - move matrix, arrows follow

import { matrix } from './matrixSVG.js';

/**
 * Wraps a matrix call and returns a connectable object with anchor methods.
 * When the matrix moves, the anchors move with it.
 *
 * @param {SVG.Container} parentGroup - SVG.js group to draw into
 * @param {Object} config - Matrix configuration (same as matrix())
 * @returns {Object} Connectable matrix with anchor methods
 */
export function createMatrix(parentGroup, config) {
	const { rows, cols, cellWidth, cellHeight } = config;
	const width = cols * cellWidth;
	const height = rows * cellHeight;

	const group = matrix(parentGroup, config);

	return {
		group,
		width,
		height,
		// Position tracking
		_x: 0,
		_y: 0,

		// Move the matrix and update position tracking
		move(x, y) {
			this._x = x;
			this._y = y;
			this.group.move(x, y);
			return this;
		},

		// Get anchor point positions
		anchor(name, options = {}) {
			const { dx = 0, dy = 0 } = options;
			const baseX = this._x;
			const baseY = this._y;

			switch (name) {
				case 'left':
					return { x: baseX + dx, y: baseY + this.height / 2 + dy };
				case 'right':
					return { x: baseX + this.width + dx, y: baseY + this.height / 2 + dy };
				case 'top':
					return { x: baseX + this.width / 2 + dx, y: baseY + dy };
				case 'bottom':
					return { x: baseX + this.width / 2 + dx, y: baseY + this.height + dy };
				case 'center':
					return { x: baseX + this.width / 2 + dx, y: baseY + this.height / 2 + dy };
				case 'topLeft':
					return { x: baseX + dx, y: baseY + dy };
				case 'topRight':
					return { x: baseX + this.width + dx, y: baseY + dy };
				case 'bottomLeft':
					return { x: baseX + dx, y: baseY + this.height + dy };
				case 'bottomRight':
					return { x: baseX + this.width + dx, y: baseY + this.height + dy };
				default:
					return { x: baseX + this.width / 2 + dx, y: baseY + this.height / 2 + dy };
			}
		}
	};
}

/**
 * Creates a virtual point that acts like a matrix anchor (for junctions).
 *
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {Object} Point with anchor method
 */
export function createPoint(x, y) {
	return {
		_x: x,
		_y: y,
		width: 0,
		height: 0,
		anchor() {
			return { x: this._x, y: this._y };
		},
		move(newX, newY) {
			this._x = newX;
			this._y = newY;
			return this;
		}
	};
}

/**
 * Draws an arrow head at the specified position.
 */
export function drawArrowHeadAt(group, x, y, angle, color = '#9ca3af', size = 12) {
	group
		.polygon([
			[x, y],
			[x - size * Math.cos(angle - Math.PI / 6), y - size * Math.sin(angle - Math.PI / 6)],
			[x - size * 0.6 * Math.cos(angle), y - size * 0.6 * Math.sin(angle)],
			[x - size * Math.cos(angle + Math.PI / 6), y - size * Math.sin(angle + Math.PI / 6)]
		])
		.fill(color);
}

/**
 * Connects two anchors with a straight arrow.
 *
 * @param {SVG.Container} group - SVG group to draw into
 * @param {Object} from - Source connectable or point
 * @param {string} fromAnchor - Anchor name on source ('left', 'right', 'top', 'bottom', 'center')
 * @param {Object} to - Target connectable or point
 * @param {string} toAnchor - Anchor name on target
 * @param {Object} options - Arrow styling options
 */
export function connect(group, from, fromAnchor, to, toAnchor, options = {}) {
	const {
		color = '#9ca3af',
		strokeWidth = 1.5,
		gap = 5,
		arrowSize = 12,
		showArrow = true,
		fromOffset = {},
		toOffset = {}
	} = options;

	const start = from.anchor(fromAnchor, fromOffset);
	const end = to.anchor(toAnchor, toOffset);

	// Apply gap based on direction
	const angle = Math.atan2(end.y - start.y, end.x - start.x);
	const startX = start.x + Math.cos(angle) * gap;
	const startY = start.y + Math.sin(angle) * gap;
	const endX = end.x - Math.cos(angle) * gap;
	const endY = end.y - Math.sin(angle) * gap;

	// Draw line (stopping short of arrowhead)
	const lineEndX = showArrow ? endX - arrowSize * Math.cos(angle) : endX;
	const lineEndY = showArrow ? endY - arrowSize * Math.sin(angle) : endY;

	group.line(startX, startY, lineEndX, lineEndY).stroke({ color, width: strokeWidth });

	if (showArrow) {
		drawArrowHeadAt(group, endX, endY, angle, color, arrowSize);
	}
}

/**
 * Draws connected path through waypoints with rounded corners.
 *
 * @param {SVG.Container} group - SVG group to draw into
 * @param {Array<{x: number, y: number}>} points - Path points
 * @param {Object} options - Path styling options
 */
export function connectPath(group, points, options = {}) {
	const {
		color = '#9ca3af',
		strokeWidth = 1.5,
		radius = 10,
		showArrow = true,
		arrowSize = 12
	} = options;

	if (points.length < 2) return;

	let pathStr = `M ${points[0].x} ${points[0].y} `;

	for (let i = 1; i < points.length - 1; i++) {
		const prev = points[i - 1];
		const curr = points[i];
		const next = points[i + 1];

		const dx1 = curr.x - prev.x;
		const dy1 = curr.y - prev.y;
		const dx2 = next.x - curr.x;
		const dy2 = next.y - curr.y;

		const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
		const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

		// Check for direction change (turn)
		const cross = Math.abs(dx1 * dy2 - dy1 * dx2);
		const isTurn = cross > 0.01;

		if (isTurn && radius > 0) {
			const nx1 = dx1 / len1;
			const ny1 = dy1 / len1;
			const nx2 = dx2 / len2;
			const ny2 = dy2 / len2;

			const r = Math.min(radius, len1 / 2, len2 / 2);
			const beforeX = curr.x - nx1 * r;
			const beforeY = curr.y - ny1 * r;
			const afterX = curr.x + nx2 * r;
			const afterY = curr.y + ny2 * r;

			pathStr += `L ${beforeX} ${beforeY} `;
			pathStr += `Q ${curr.x} ${curr.y} ${afterX} ${afterY} `;
		} else {
			pathStr += `L ${curr.x} ${curr.y} `;
		}
	}

	const last = points[points.length - 1];
	pathStr += `L ${last.x} ${last.y}`;

	group.path(pathStr).fill('none').stroke({ color, width: strokeWidth });

	if (showArrow && points.length >= 2) {
		const prev = points[points.length - 2];
		const angle = Math.atan2(last.y - prev.y, last.x - prev.x);
		drawArrowHeadAt(group, last.x, last.y, angle, color, arrowSize);
	}
}

/**
 * Connects with an L-shaped path (horizontal then vertical, or vice versa).
 *
 * @param {SVG.Container} group - SVG group to draw into
 * @param {Object} from - Source connectable
 * @param {string} fromAnchor - Source anchor
 * @param {Object} to - Target connectable
 * @param {string} toAnchor - Target anchor
 * @param {Object} options - Path options
 */
export function connectL(group, from, fromAnchor, to, toAnchor, options = {}) {
	const {
		color = '#9ca3af',
		strokeWidth = 1.5,
		radius = 10,
		showArrow = true,
		arrowSize = 12,
		gap = 5,
		cornerX = null,
		cornerY = null,
		fromOffset = {},
		toOffset = {}
	} = options;

	const start = from.anchor(fromAnchor, fromOffset);
	const end = to.anchor(toAnchor, toOffset);

	// Determine corner point
	let cx, cy;
	if (cornerX !== null) {
		cx = cornerX;
		cy = end.y;
	} else if (cornerY !== null) {
		cx = end.x;
		cy = cornerY;
	} else {
		// Auto-detect based on anchors
		if (fromAnchor === 'right' || fromAnchor === 'left') {
			cx = end.x;
			cy = start.y;
		} else {
			cx = start.x;
			cy = end.y;
		}
	}

	// Apply gaps
	const angle1 = Math.atan2(cy - start.y, cx - start.x);
	const startX = start.x + Math.cos(angle1) * gap;
	const startY = start.y + Math.sin(angle1) * gap;

	const angle2 = Math.atan2(end.y - cy, end.x - cx);
	const endX = end.x - Math.cos(angle2) * gap;
	const endY = end.y - Math.sin(angle2) * gap;

	connectPath(
		group,
		[
			{ x: startX, y: startY },
			{ x: cx, y: cy },
			{ x: endX, y: endY }
		],
		{
			color,
			strokeWidth,
			radius,
			showArrow,
			arrowSize
		}
	);
}

/**
 * Creates a fan-out pattern: one source to multiple targets via a junction.
 *
 * @param {SVG.Container} group - SVG group to draw into
 * @param {Object} from - Source connectable
 * @param {string} fromAnchor - Source anchor
 * @param {Array<{target: Object, anchor: string}>} targets - Array of targets
 * @param {Object} options - Fan-out options
 */
export function connectFanOut(group, from, fromAnchor, targets, options = {}) {
	const { color = '#9ca3af', strokeWidth = 1.5, junctionOffset = 40, gap = 5 } = options;

	const start = from.anchor(fromAnchor);

	// Calculate junction point
	let junctionX, junctionY;
	if (fromAnchor === 'right') {
		junctionX = start.x + junctionOffset;
		junctionY = start.y;
	} else if (fromAnchor === 'left') {
		junctionX = start.x - junctionOffset;
		junctionY = start.y;
	} else if (fromAnchor === 'bottom') {
		junctionX = start.x;
		junctionY = start.y + junctionOffset;
	} else {
		junctionX = start.x;
		junctionY = start.y - junctionOffset;
	}

	// Draw line from source to junction
	const angle = Math.atan2(junctionY - start.y, junctionX - start.x);
	const startX = start.x + Math.cos(angle) * gap;
	const startY = start.y + Math.sin(angle) * gap;
	group.line(startX, startY, junctionX, junctionY).stroke({ color, width: strokeWidth });

	// Calculate spine extent (vertical line through junction)
	const targetYs = targets.map((t) => t.target.anchor(t.anchor).y);
	const minY = Math.min(...targetYs);
	const maxY = Math.max(...targetYs);

	// Draw vertical spine
	if (targets.length > 1) {
		group.line(junctionX, minY, junctionX, maxY).stroke({ color, width: strokeWidth });
	}

	// Create junction point and connect to each target
	const junction = createPoint(junctionX, junctionY);
	for (const { target, anchor } of targets) {
		// Adjust junction Y to align with target
		const targetPos = target.anchor(anchor);
		junction.move(junctionX, targetPos.y);
		connect(group, junction, 'center', target, anchor, { color, strokeWidth, gap, ...options });
	}
}
