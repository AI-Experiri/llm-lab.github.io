<!-- ABOUTME: Displays pre-tokenized words with their counts.
     ABOUTME: Used by all visualizers to show initial tokenization. -->
<script>
	import { toDisplay } from '../../lib/utils.js';

	let { preTokens = [], children } = $props();
</script>

{#if preTokens.length > 0}
	<div class="rounded-xl bg-white/10 p-4 backdrop-blur">
		<h3 class="mb-3 flex items-center gap-2 font-semibold text-[var(--text-body)] text-white">
			<span class="h-2 w-2 rounded-full bg-pink-400"></span>
			Pre-tokens
			<span class="font-normal text-[var(--text-small)] text-slate-400"
				>({preTokens.length} unique)</span
			>
		</h3>
		<div class="flex flex-wrap gap-2">
			{#if children}
				{@render children()}
			{:else}
				{#each preTokens as pt (pt.text)}
					<span
						class="rounded-lg bg-pink-500/20 px-2 py-1 font-mono text-[var(--text-small)] text-pink-300"
					>
						{toDisplay(pt.text)}<span class="ml-1 text-pink-400/60">×{pt.count}</span>
					</span>
				{/each}
			{/if}
		</div>
	</div>
{/if}
