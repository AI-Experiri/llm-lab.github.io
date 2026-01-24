<script>
	import { untrack } from 'svelte';

	let { data, label = 'JSON Data', initiallyExpanded = false } = $props();

	let expanded = $state(untrack(() => initiallyExpanded));

	function formatJSON(obj) {
		try {
			return JSON.stringify(obj, null, 2);
		} catch {
			return String(obj);
		}
	}

	function toggleExpanded() {
		expanded = !expanded;
	}
</script>

<div class="overflow-hidden rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)]">
	<!-- Header / Toggle Button -->
	<button
		type="button"
		onclick={toggleExpanded}
		class="flex w-full cursor-pointer items-center justify-between bg-[var(--color-secondary)]/50 px-4 py-3 transition-colors hover:bg-[var(--color-secondary)]"
	>
		<div class="flex items-center gap-2">
			<span class="font-mono text-[var(--color-primary)] text-[var(--text-small)]">{'{...}'}</span>
			<span class="text-[var(--color-muted)] text-[var(--text-small)]">{label}</span>
		</div>
		<span
			class="text-[var(--color-muted)] text-[var(--text-small)] transition-transform {expanded
				? 'rotate-180'
				: ''}"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</span>
	</button>

	<!-- Collapsible Content -->
	{#if expanded}
		<div class="max-h-[32rem] overflow-auto p-4">
			<pre
				class="font-mono break-words whitespace-pre-wrap text-[var(--color-text)] text-[var(--text-small)]">{formatJSON(
					data
				)}</pre>
		</div>
	{/if}
</div>
