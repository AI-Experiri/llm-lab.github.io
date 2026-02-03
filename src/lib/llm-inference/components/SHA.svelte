<!-- ABOUTME: Single Head Attention visualization component -->
<!-- ABOUTME: Uses drawAttentionHead from SHASVG.js -->

<script>
	import { onMount } from 'svelte';
	import { SVG } from '@svgdotjs/svg.js';
	import { loadMathJax } from '$lib/llm-inference/utils/matrixSVG.js';
	import { drawAttentionHead } from '$lib/llm-inference/utils/SHASVG.js';
	import { DiagramBox } from '$lib/shared';

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

{#if showBackground}
	<DiagramBox>
		<div bind:this={container} class="w-full"></div>
	</DiagramBox>
{:else}
	<div class="w-full p-6">
		<div bind:this={container} class="w-full"></div>
	</div>
{/if}

<!-- Key Notation -->
<div class="mt-4">
	<div class="mb-2 font-semibold text-[var(--color-primary)] text-[var(--text-small)]">
		Key Notation
	</div>
	<div class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
		<div class="rounded bg-[var(--color-secondary)] p-3">
			<span class="font-mono text-lg font-bold text-[var(--color-primary)]">B = 1</span>
			<span class="ml-2 text-[var(--color-muted)] text-[var(--text-tiny)]">Batch size</span>
		</div>
		<div class="rounded bg-[var(--color-secondary)] p-3">
			<span class="font-mono text-lg font-bold text-[var(--color-primary)]">T</span>
			<span class="ml-2 text-[var(--color-muted)] text-[var(--text-tiny)]"
				>Query sequence length</span
			>
		</div>
		<div class="rounded bg-[var(--color-secondary)] p-3">
			<span class="font-mono text-lg font-bold text-[var(--color-primary)]">S</span>
			<span class="ml-2 text-[var(--color-muted)] text-[var(--text-tiny)]"
				>Key/Value sequence length</span
			>
		</div>
		<div class="rounded bg-[var(--color-secondary)] p-3">
			<span class="font-mono text-lg font-bold text-[var(--color-primary)]">D</span>
			<span class="ml-2 text-[var(--color-muted)] text-[var(--text-tiny)]">Model dimension</span>
		</div>
		<div class="rounded bg-[var(--color-secondary)] p-3">
			<span class="font-mono text-lg font-bold text-[var(--color-primary)]">H</span>
			<span class="ml-2 text-[var(--color-muted)] text-[var(--text-tiny)]">Head dimension</span>
		</div>
		<div class="rounded bg-[var(--color-secondary)] p-3">
			<span class="font-mono text-lg font-bold text-[var(--color-primary)]">N = K = 1</span>
			<span class="ml-2 text-[var(--color-muted)] text-[var(--text-tiny)]">Single head</span>
		</div>
	</div>
</div>
