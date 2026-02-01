<!-- ABOUTME: Single SVG visualization of Multi-Query Attention (MQA) -->
<!-- ABOUTME: Shows N query heads sharing a single K,V projection (K=1) -->

<script>
	import { onMount } from 'svelte';
	import { SVG } from '@svgdotjs/svg.js';
	import { loadMathJax } from '$lib/llm-inference/utils/matrixSVG.js';
	import { drawAttentionHead } from '$lib/llm-inference/utils/MQASVG.js';

	let container;

	const heads = [
		{
			label: 'N',
			baseOffsetX: 120,
			offsetY: -120,
			highlight: false,
			showLabels: false,
			smearColor: '#1f2937',
			arrowColor: '#1f2937',
			headLabelWeight: 'normal',
			showSharedKV: false
		},
		{
			label: 3,
			baseOffsetX: 40,
			offsetY: -40,
			highlight: false,
			showLabels: false,
			smearColor: '#374151',
			arrowColor: '#374151',
			headLabelWeight: 'normal',
			showSharedKV: true
		},
		{
			label: 2,
			baseOffsetX: 20,
			offsetY: -20,
			highlight: false,
			showLabels: false,
			smearColor: '#4b5563',
			arrowColor: '#4b5563',
			headLabelWeight: 'normal',
			showSharedKV: false
		},
		{
			label: 1,
			baseOffsetX: 0,
			offsetY: 0,
			highlight: true,
			highlightColor: '#fde047',
			showLabels: true,
			smearColor: null,
			arrowColor: '#9ca3af',
			headLabelWeight: 900,
			showSharedKV: true
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

		heads.forEach((head, _index) => {
			// All heads use baseOffsetX - borders stack naturally
			// Heads without K/V will have empty space on left, but borders align
			drawAttentionHead(content, {
				mathjax,
				instanceId: `mqa-head-${head.label}`,
				showX: false,
				showHeadLabel: head.showHeadLabel !== false,
				headLabelText: `HEAD ${head.label}`,
				highlight: head.highlight,
				highlightColor: head.highlightColor || '#fde047',
				showLabels: head.showLabels,
				offsetX: head.baseOffsetX,
				offsetY: head.offsetY,
				smearColor: head.smearColor,
				arrowColor: head.arrowColor,
				headLabelWeight: head.headLabelWeight,
				showSharedKV: head.showSharedKV,
				kvXAdjust: 0
			});
		});

		const baseArrowTipX = 1110;
		const baseArrowTipY = 408;
		const head3 = heads.find((h) => h.label === 3);
		const headN = heads.find((h) => h.label === 'N');

		if (head3 && headN) {
			// Use baseOffsetX directly (same as forEach loop)
			const head3OffsetX = head3.baseOffsetX;
			const headNOffsetX = headN.baseOffsetX;

			const x1 = baseArrowTipX + head3OffsetX + 10;
			const y1 = baseArrowTipY + head3.offsetY - 10;
			const x2 = baseArrowTipX + headNOffsetX;
			const y2 = baseArrowTipY + headN.offsetY;

			content
				.line(x1, y1, x2, y2)
				.stroke({ color: '#d1d5db', width: 3, dasharray: '0.1,10', linecap: 'round' });
		}

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

<!-- Key Notation - Only new notations not in SHA/MHA -->
<div class="mt-4">
	<div class="mb-2 font-semibold text-[var(--color-primary)] text-[var(--text-small)]">
		Key Notation
	</div>
	<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
		<div class="rounded bg-[var(--color-secondary)] p-3">
			<span class="font-mono text-lg font-bold text-[var(--color-primary)]">K = 1</span>
			<span class="ml-2 text-[var(--color-muted)] text-[var(--text-tiny)]"
				>Single shared KV head</span
			>
		</div>
		<div class="rounded bg-[var(--color-secondary)] p-3">
			<span class="font-mono text-lg font-bold text-[var(--color-primary)]">N &gt; K</span>
			<span class="ml-2 text-[var(--color-muted)] text-[var(--text-tiny)]"
				>Multiple Q heads share K, V</span
			>
		</div>
	</div>
</div>
