<!-- ABOUTME: Single Head Attention visualization component -->
<!-- ABOUTME: Uses drawAttentionHead from SHASVG.js -->

<script>
	import { onMount } from 'svelte';
	import { SVG } from '@svgdotjs/svg.js';
	import { loadMathJax } from '$lib/llm-inference/utils/matrixSVG.js';
	import { drawAttentionHead } from '$lib/llm-inference/utils/SHASVG.js';

	let {
		showX = true,
		showHeadLabel = true,
		instanceId = 'default',
		showBackground = true,
		highlight = false,
		highlightColor = '#fde047',
		showLabels = true
	} = $props();

	let container;

	onMount(async () => {
		const mathjax = await loadMathJax();

		const draw = SVG().addTo(container).attr({
			width: '100%',
			height: '100%',
			preserveAspectRatio: 'xMidYMid meet'
		});

		const content = draw.group();

		drawAttentionHead(content, {
			mathjax,
			instanceId,
			showX,
			showHeadLabel,
			highlight,
			highlightColor,
			showLabels
		});

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

<div class="w-full rounded-lg p-6" class:bg-[#0a0a1a]={showBackground}>
	<div bind:this={container} class="min-h-[500px] w-full"></div>
</div>
