<!-- ABOUTME: Reusable section wrapper with consistent styling -->
<!-- ABOUTME: Used across all PE visualization tabs -->

<script>
	let { children, title = '' } = $props();
</script>

<section class="mb-4 rounded-lg bg-[#16213e] p-4">
	{#if title}
		<h3 class="mb-2 font-semibold text-[#e94560] text-[var(--text-h2)]">{title}</h3>
	{/if}
	{@render children()}
</section>
