<!-- ABOUTME: Displays the vocabulary built during BPE training.
     ABOUTME: Used by all visualizers to show learned tokens. -->
<script>
	import { toDisplay } from '../../lib/utils.js';

	let {
		vocabulary = [],
		emptyMessage = 'Vocabulary appears here...',
		mergedColor = 'text-purple-300',
		currentToken = null,
		children
	} = $props();
</script>

<div>
	<div class="h-full rounded-xl bg-white/10 p-4 backdrop-blur">
		<h3 class="mb-3 flex items-center gap-2 font-semibold text-[var(--text-body)] text-white">
			<span class="h-2 w-2 rounded-full bg-emerald-400"></span>
			Vocabulary
			<span class="ml-auto font-normal text-[var(--text-small)] text-slate-400"
				>{vocabulary.length}</span
			>
		</h3>
		<div
			class="max-h-[300px] min-h-[120px] space-y-1 overflow-y-auto md:max-h-[350px] md:min-h-[200px] lg:max-h-[400px] lg:min-h-[250px]"
		>
			{#if children}
				{@render children()}
			{:else if vocabulary.length === 0}
				<p class="py-4 text-center text-[var(--text-small)] text-slate-500">{emptyMessage}</p>
			{:else}
				{#each [...vocabulary].reverse() as item (item.token)}
					<div
						class="flex items-center justify-between rounded-lg px-2 py-1.5 text-[var(--text-small)] transition-all
              {item.token === currentToken
							? 'bg-yellow-400 font-bold text-yellow-900 shadow-lg'
							: 'bg-slate-800/50'}"
					>
						<span
							class="font-mono {item.token === currentToken
								? ''
								: item.isBase
									? 'text-slate-400'
									: mergedColor}">{toDisplay(item.token)}</span
						>
						{#if item.from}
							<span
								class="{item.token === currentToken
									? 'text-yellow-700'
									: 'text-slate-500'} ml-2 truncate text-[var(--text-tiny)]">{item.from}</span
							>
						{/if}
					</div>
				{/each}
			{/if}
		</div>
	</div>
</div>
