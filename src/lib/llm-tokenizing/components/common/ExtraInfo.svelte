<!-- ABOUTME: Reusable info bar for displaying legends, hints, or metadata.
     ABOUTME: Used by visualizers to show additional context like morpheme types. -->
<script>
	let { label = '', items = [], children } = $props();
</script>

<div class="rounded-xl bg-white/10 p-3 backdrop-blur">
	<div class="flex flex-wrap items-center justify-center gap-4 text-xs lg:justify-start">
		{#if label}
			<span class="font-medium text-slate-400">{label}</span>
		{/if}
		{#if children}
			{@render children()}
		{:else}
			{#each items as item, i (i)}
				<span class="flex items-center gap-1.5">
					<span class="h-3 w-3 rounded {item.bgColor}"></span>
					<span class={item.textColor}>{item.text}</span>
				</span>
			{/each}
		{/if}
	</div>
</div>
