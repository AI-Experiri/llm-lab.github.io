<!-- ABOUTME: Displays pair frequencies or scores during BPE steps.
     ABOUTME: Used by all visualizers to show merge candidates. -->
<script>
	let {
		pairs = [],
		title = 'Pair Frequencies',
		emptyMessage = 'Pair counts appear here during each step...',
		highlightColor = 'bg-yellow-400 text-yellow-900',
		highlightBadge = 'bg-yellow-600 text-yellow-100',
		children
	} = $props();
</script>

<div>
	<div class="h-full rounded-xl bg-white/10 p-4 backdrop-blur">
		<h3 class="mb-3 flex items-center gap-2 text-base font-semibold text-white">
			<span class="h-2 w-2 rounded-full bg-blue-400"></span>
			{title}
		</h3>
		<div
			class="max-h-[300px] min-h-[120px] space-y-2 overflow-y-auto md:max-h-[350px] md:min-h-[200px] lg:max-h-[400px] lg:min-h-[250px]"
		>
			{#if children}
				{@render children()}
			{:else if pairs.length === 0}
				<p class="py-4 text-center text-sm text-slate-500">{emptyMessage}</p>
			{:else}
				{#each pairs as pair (pair.pair)}
					<div
						class="rounded-lg px-3 py-2 font-mono text-sm transition-all
            {pair.isMax
							? highlightColor + ' font-bold shadow-lg'
							: 'bg-slate-700/70 text-slate-300'}"
					>
						<div class="flex items-center justify-between">
							<span>{pair.display}</span>
							<span
								class="rounded px-1.5 py-0.5 text-xs {pair.isMax ? highlightBadge : 'bg-slate-600'}"
								>{pair.count}×</span
							>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</div>
</div>
