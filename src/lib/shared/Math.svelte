<!-- ABOUTME: Renders LaTeX math formulas using MathJax -->
<!-- ABOUTME: Supports inline and block (display) modes -->

<script>
	import { tick, onMount } from 'svelte';

	let { formula, display = false, class: className = '' } = $props();
	let container = $state(null);

	// Typeset after mount
	onMount(async () => {
		await tick();
		if (window.MathJax?.typesetPromise && container) {
			await window.MathJax.typesetPromise([container]);
		}
	});

	// Re-typeset when formula changes
	$effect(() => {
		if (formula && container) {
			tick().then(() => {
				if (window.MathJax?.typesetPromise) {
					window.MathJax.typesetPromise([container]);
				}
			});
		}
	});
</script>

{#if display}
	<div bind:this={container} class="math-display my-4 text-center {className}">
		{@html `$$${formula}$$`}
	</div>
{:else}
	<span bind:this={container} class="math-inline {className}">
		{@html `$${formula}$`}
	</span>
{/if}

<style>
	.math-display :global(mjx-container) {
		font-size: 1.1em;
	}

	.math-inline :global(mjx-container) {
		display: inline;
		vertical-align: middle;
	}
</style>
