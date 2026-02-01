<!-- ABOUTME: Single SVG visualization of Multi-Query Attention (MQA) -->
<!-- ABOUTME: Shows N query heads sharing a single K,V projection (K=1) -->

<script>
	import { onMount } from 'svelte';
	import { SVG } from '@svgdotjs/svg.js';
	import { loadMathJax } from '$lib/llm-inference/utils/matrixSVG.js';
	import { drawAttentionHead } from '$lib/llm-inference/utils/MQASVG.js';

	let container;

	// Extra offset needed to align background heads with HEAD 1
	// (accounts for space taken by shared W_K, K, W_V, V matrices)
	// = sharedMatrixGap(15) + wMatrixWidth(50) + sharedMatrixGap(15) + matrixWidth(160) + headGapFromK(50)
	const sharedMatrixOffset = 290;

	const heads = [
		{
			label: 'N',
			offsetX: 120 + sharedMatrixOffset,
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
			offsetX: 40 + sharedMatrixOffset,
			offsetY: -40,
			highlight: false,
			showLabels: false,
			smearColor: '#374151',
			arrowColor: '#374151',
			headLabelWeight: 'normal',
			showSharedKV: false
		},
		{
			label: 2,
			offsetX: 20 + sharedMatrixOffset,
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
			offsetX: 0,
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
			drawAttentionHead(content, {
				mathjax,
				instanceId: `mqa-head-${head.label}`,
				showX: false,
				showHeadLabel: head.showHeadLabel !== false,
				headLabelText: `HEAD ${head.label}`,
				highlight: head.highlight,
				highlightColor: head.highlightColor || '#fde047',
				showLabels: head.showLabels,
				offsetX: head.offsetX,
				offsetY: head.offsetY,
				smearColor: head.smearColor,
				arrowColor: head.arrowColor,
				headLabelWeight: head.headLabelWeight,
				showSharedKV: head.showSharedKV
			});
		});

		const baseArrowTipX = 850;
		const baseArrowTipY = 408;
		const head3 = heads.find((h) => h.label === 3);
		const headN = heads.find((h) => h.label === 'N');

		if (head3 && headN) {
			const x1 = baseArrowTipX + head3.offsetX + 10;
			const y1 = baseArrowTipY + head3.offsetY - 10;
			const x2 = baseArrowTipX + headN.offsetX;
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
