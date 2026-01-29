<!-- ABOUTME: Single Head Attention visualization component -->
<!-- ABOUTME: Uses drawAttentionHead from SHASVGs.js -->

<script>
	import { onMount } from 'svelte';
	import { SVG } from '@svgdotjs/svg.js';
	import { loadMathJax } from '$lib/llm-inference/utils/helperMatrixSVGs.js';
	import { drawAttentionHead } from '$lib/llm-inference/utils/SHASVGs.js';

	let {
		showX = true,
		showHeadLabel = true,
		instanceId = 'default',
		showBackground = true,
		highlight = false,
		highlightColor = '#fde047',
		showLabels = true,
		showKeyNotation = true
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

	<!-- Key Notation -->
	{#if showKeyNotation}
		<div
			class="mt-4 rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-secondary)] p-4"
		>
			<div class="mb-2 font-semibold text-[var(--color-muted)] text-[var(--text-tiny)]">
				KEY NOTATION
			</div>
			<div class="flex flex-wrap gap-x-6 gap-y-2 text-[var(--text-small)]">
				<div>
					<span class="font-mono font-bold text-[var(--color-primary)]">T</span>
					<span class="ml-1 text-[var(--color-muted)]">Query sequence length</span>
				</div>
				<div>
					<span class="font-mono font-bold text-[var(--color-primary)]">S</span>
					<span class="ml-1 text-[var(--color-muted)]">Key/Value sequence length</span>
				</div>
				<div>
					<span class="font-mono font-bold text-[var(--color-primary)]">D</span>
					<span class="ml-1 text-[var(--color-muted)]">Model dimension</span>
				</div>
				<div>
					<span class="font-mono font-bold text-[var(--color-primary)]">H</span>
					<span class="ml-1 text-[var(--color-muted)]">Head dimension</span>
				</div>
			</div>
		</div>
	{/if}
</div>
