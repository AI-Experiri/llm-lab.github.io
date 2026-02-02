<!-- ABOUTME: Visualization of stacked attention layers (L layers) -->
<!-- ABOUTME: Shows Layer 0 with small MHA, Layer 1 and Layer L as equal-sized boxes -->

<script>
	import { onMount } from 'svelte';
	import { SVG } from '@svgdotjs/svg.js';
	import { loadMathJax } from '$lib/llm-inference/utils/matrixSVG.js';
	import { drawAttentionHead } from '$lib/llm-inference/utils/SHASVG.js';

	let container;

	// Head configurations for MHA in Layer 0
	const heads = [
		{
			label: 'N',
			offsetX: 40,
			offsetY: -40,
			highlight: false,
			showLabels: false,
			smearColor: '#1f2937',
			arrowColor: '#1f2937',
			headLabelWeight: 'normal'
		},
		{
			label: 2,
			offsetX: 20,
			offsetY: -20,
			highlight: false,
			showLabels: false,
			smearColor: '#374151',
			arrowColor: '#374151',
			headLabelWeight: 'normal'
		},
		{
			label: 1,
			offsetX: 0,
			offsetY: 0,
			highlight: true,
			highlightColor: '#fde047',
			showLabels: false,
			smearColor: null,
			arrowColor: '#9ca3af',
			headLabelWeight: 900
		}
	];

	onMount(async () => {
		const mathjax = await loadMathJax();

		const draw = SVG().addTo(container).attr({
			width: '100%',
			height: '100%',
			preserveAspectRatio: 'xMidYMid meet'
		});

		const content = draw.group();

		// First draw MHA to get its natural size
		const mhaGroup = content.group();
		heads.forEach((head) => {
			drawAttentionHead(mhaGroup, {
				mathjax,
				instanceId: `layer0-head-${head.label}`,
				showX: false,
				showHeadLabel: false,
				highlight: head.highlight,
				highlightColor: head.highlightColor || '#fde047',
				showLabels: false,
				offsetX: head.offsetX,
				offsetY: head.offsetY,
				smearColor: head.smearColor,
				arrowColor: head.arrowColor,
				headLabelWeight: head.headLabelWeight
			});
		});

		// Get MHA dimensions and scale it down
		const mhaBbox = mhaGroup.bbox();
		const mhaScale = 0.45; // Adjust this to change overall size
		const boxPadding = 25;

		// Box dimensions derived from scaled MHA
		const boxWidth = mhaBbox.width * mhaScale + boxPadding * 2;
		const boxHeight = mhaBbox.height * mhaScale + boxPadding * 2;
		const boxY = 60;
		const layerGap = 60;

		// Position MHA at Layer 0
		const layer0X = 0;
		mhaGroup.transform({
			origin: [mhaBbox.cx, mhaBbox.cy],
			scale: mhaScale,
			translate: [layer0X + boxWidth / 2 - mhaBbox.cx, boxY + boxHeight / 2 - mhaBbox.cy]
		});

		// Draw Layer 0 box around MHA
		content
			.rect(boxWidth, boxHeight)
			.move(layer0X, boxY)
			.fill('#1a1a2e')
			.stroke({ color: '#6b7280', width: 2, dasharray: '8,4' })
			.radius(12)
			.back(); // Send to back so MHA is visible

		const layers = [
			{ label: 'Layer 0', x: 0 },
			{ label: 'Layer 1', x: boxWidth + layerGap },
			{ label: 'Layer L', x: 2 * (boxWidth + layerGap) }
		];

		// Draw Layer 1 and Layer L
		layers.forEach((layer, index) => {
			const x = layer.x;

			if (index > 0) {
				// Box for Layer 1 and Layer L
				content
					.rect(boxWidth, boxHeight)
					.move(x, boxY)
					.fill('#1a1a2e')
					.stroke({ color: '#6b7280', width: 2, dasharray: '8,4' })
					.radius(12);

				// Simplified stacked heads visual
				const stackPadding = boxWidth * 0.15;
				const stackWidth = boxWidth - stackPadding * 2 - 30;
				const stackHeight = boxHeight * 0.4;
				const stackBaseX = x + stackPadding;
				const stackBaseY = boxY + (boxHeight - stackHeight) / 2 + 10;
				const stackOffset = 10;

				for (let i = 3; i >= 0; i--) {
					const colors = ['#1e40af', '#2563eb', '#3b82f6', '#60a5fa'];
					content
						.rect(stackWidth, stackHeight)
						.move(stackBaseX + i * stackOffset, stackBaseY - i * stackOffset)
						.fill(colors[i])
						.stroke({ color: '#93c5fd', width: 1 })
						.radius(6);
				}

				// "N Heads" label
				content
					.text('N Heads')
					.font({ family: 'sans-serif', size: 24, weight: 'bold' })
					.fill('#93c5fd')
					.move(x + boxWidth / 2 - 35, boxY + boxHeight - 25);
			}

			// Layer label (below box)
			content
				.text(layer.label)
				.font({ family: 'sans-serif', size: 32, weight: 'bold' })
				.fill('#e5e7eb')
				.move(x + boxWidth / 2 - 40, boxY + boxHeight + 25);

			// Arrow to next layer
			if (index < layers.length - 1) {
				const arrowStartX = x + boxWidth + 15;
				const arrowEndX = layers[index + 1].x - 15;
				const arrowY = boxY + boxHeight / 2;

				if (index === 1) {
					// Dotted line between Layer 1 and Layer L
					content
						.line(arrowStartX, arrowY, arrowEndX, arrowY)
						.stroke({ color: '#9ca3af', width: 4, dasharray: '2,15', linecap: 'round' });
				} else {
					// Solid arrow
					content
						.line(arrowStartX, arrowY, arrowEndX - 15, arrowY)
						.stroke({ color: '#9ca3af', width: 3 });
					content
						.polygon([
							[arrowEndX, arrowY],
							[arrowEndX - 15, arrowY - 8],
							[arrowEndX - 15, arrowY + 8]
						])
						.fill('#9ca3af');
				}
			}
		});

		// Input arrow
		const inputY = boxY + boxHeight / 2;
		content
			.text('Input')
			.font({ family: 'sans-serif', size: 24, weight: 'bold' })
			.fill('#9ca3af')
			.move(-70, inputY - 8);
		content.line(-30, inputY, -15, inputY).stroke({ color: '#9ca3af', width: 3 });
		content
			.polygon([
				[0, inputY],
				[-12, inputY - 6],
				[-12, inputY + 6]
			])
			.fill('#9ca3af');

		// MLP block to the right of Layer L (in the main flow)
		const lastX = layers[layers.length - 1].x;
		const mlpGap = 60;
		const mlpX = lastX + boxWidth + mlpGap;
		const mlpWidth = boxWidth * 0.5;
		const mlpHeight = boxHeight;

		// Arrow from Layer L to MLP
		content
			.line(lastX + boxWidth + 15, inputY, mlpX - 15, inputY)
			.stroke({ color: '#9ca3af', width: 3 });
		content
			.polygon([
				[mlpX, inputY],
				[mlpX - 12, inputY - 6],
				[mlpX - 12, inputY + 6]
			])
			.fill('#9ca3af');

		// MLP box
		content
			.rect(mlpWidth, mlpHeight)
			.move(mlpX, boxY)
			.fill('#1a1a2e')
			.stroke({ color: '#7c3aed', width: 2 })
			.radius(12);

		// MLP visual - D→F→D expansion bars showing the hidden dimension
		const barPadding = 15;
		const barSpacing = 8;
		const narrowWidth = (mlpWidth - barPadding * 2 - barSpacing * 2) * 0.25;
		const wideWidth = (mlpWidth - barPadding * 2 - barSpacing * 2) * 0.5;
		const barHeight = mlpHeight * 0.5;
		const barY = boxY + (mlpHeight - barHeight) / 2;

		// D input (narrow)
		const bar1X = mlpX + barPadding;
		content
			.rect(narrowWidth, barHeight)
			.move(bar1X, barY)
			.fill('#8b5cf6')
			.stroke({ color: '#c4b5fd', width: 1 })
			.radius(4);

		// F hidden (wide)
		const bar2X = bar1X + narrowWidth + barSpacing;
		content
			.rect(wideWidth, barHeight)
			.move(bar2X, barY)
			.fill('#a78bfa')
			.stroke({ color: '#c4b5fd', width: 1 })
			.radius(4);

		// D output (narrow)
		const bar3X = bar2X + wideWidth + barSpacing;
		content
			.rect(narrowWidth, barHeight)
			.move(bar3X, barY)
			.fill('#8b5cf6')
			.stroke({ color: '#c4b5fd', width: 1 })
			.radius(4);

		// Arrows inside MLP showing flow D→F→D
		const arrowInY = barY + barHeight / 2;
		// Arrow D→F
		content
			.line(bar1X + narrowWidth + 2, arrowInY, bar2X - 2, arrowInY)
			.stroke({ color: '#e9d5ff', width: 2 });
		// Arrow F→D
		content
			.line(bar2X + wideWidth + 2, arrowInY, bar3X - 2, arrowInY)
			.stroke({ color: '#e9d5ff', width: 2 });

		// Labels above bars: D, F, D
		content
			.text('D')
			.font({ family: 'sans-serif', size: 16, weight: 'bold' })
			.fill('#c4b5fd')
			.move(bar1X + narrowWidth / 2 - 5, barY - 22);
		content
			.text('F')
			.font({ family: 'sans-serif', size: 20, weight: 'bold' })
			.fill('#fde047')
			.move(bar2X + wideWidth / 2 - 6, barY - 25);
		content
			.text('D')
			.font({ family: 'sans-serif', size: 16, weight: 'bold' })
			.fill('#c4b5fd')
			.move(bar3X + narrowWidth / 2 - 5, barY - 22);

		// "MLP" label below box
		content
			.text('MLP')
			.font({ family: 'sans-serif', size: 32, weight: 'bold' })
			.fill('#a78bfa')
			.move(mlpX + mlpWidth / 2 - 30, boxY + mlpHeight + 25);

		// Output arrow from MLP (continuing right)
		const outputArrowStartX = mlpX + mlpWidth + 15;
		content
			.line(outputArrowStartX, inputY, outputArrowStartX + 35, inputY)
			.stroke({ color: '#9ca3af', width: 3 });
		content
			.polygon([
				[outputArrowStartX + 50, inputY],
				[outputArrowStartX + 38, inputY - 6],
				[outputArrowStartX + 38, inputY + 6]
			])
			.fill('#9ca3af');
		content
			.text('Output')
			.font({ family: 'sans-serif', size: 24, weight: 'bold' })
			.fill('#9ca3af')
			.move(outputArrowStartX + 55, inputY - 8);

		// Auto-fit viewbox
		const bbox = content.bbox();
		const padding = 40;
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
	<div bind:this={container} class="min-h-[350px] w-full"></div>
</div>

<!-- Key Notation -->
<div class="mt-4">
	<div class="mb-2 font-semibold text-[var(--color-primary)] text-[var(--text-small)]">
		Key Notation
	</div>
	<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
		<div class="rounded bg-[var(--color-secondary)] p-3">
			<span class="font-mono text-lg font-bold text-[var(--color-primary)]">L</span>
			<span class="ml-2 text-[var(--color-muted)] text-[var(--text-tiny)]"
				>Number of layers (depth of transformer)</span
			>
		</div>
		<div class="rounded bg-[var(--color-secondary)] p-3">
			<span class="font-mono text-lg font-bold text-[#a78bfa]">F</span>
			<span class="ml-2 text-[var(--color-muted)] text-[var(--text-tiny)]"
				>FFN intermediate size (typically 4×D)</span
			>
		</div>
	</div>
</div>
