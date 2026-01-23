<!-- ABOUTME: Wrapper for attention diagram SVG visualizations -->
<!-- ABOUTME: Provides dark background, legend, and attribution -->

<script>
	let { children, showLegend = true, attribution = null } = $props();
</script>

<div class="w-full rounded-lg bg-[#0a0a1a] p-6">
	{@render children()}
	<div class="mt-2 flex w-full items-center justify-between">
		{#if showLegend}
			<div class="flex gap-4 text-[var(--text-small)]">
				<div class="flex items-center gap-1">
					<div class="h-3 w-3 rounded border-2 border-white bg-[#1e3a5f]"></div>
					<span class="text-gray-400">Learned</span>
				</div>
				<div class="flex items-center gap-1">
					<div class="h-3 w-3 rounded border-2 border-yellow-400 bg-[#1e3a5f]"></div>
					<span class="text-gray-400">Items of Interest</span>
				</div>
			</div>
		{:else}
			<div></div>
		{/if}
		{#if attribution}
			<p class="text-[var(--text-small)] text-gray-500">
				Diagram inspired by
				<a
					href={attribution.url}
					target="_blank"
					rel="noopener noreferrer external"
					class="text-gray-400 underline hover:text-white">{attribution.name}</a
				>
			</p>
		{/if}
	</div>
</div>
