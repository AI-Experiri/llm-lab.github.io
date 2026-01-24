<!-- ABOUTME: Colored pill-style link or badge -->
<!-- ABOUTME: Used for Paper, Code, HuggingFace links in dataset info cards -->

<script>
	let { href = '', color = 'gray', title = '', children } = $props();

	const colors = {
		red: 'border-red-700/50 bg-red-900/30 text-red-300 hover:bg-red-900/50',
		green: 'border-green-700/50 bg-green-900/30 text-green-300 hover:bg-green-900/50',
		yellow: 'border-yellow-700/50 bg-yellow-900/30 text-yellow-300 hover:bg-yellow-900/50',
		blue: 'border-blue-700/50 bg-blue-900/30 text-blue-300 hover:bg-blue-900/50',
		cyan: 'border-cyan-700/50 bg-cyan-900/30 text-cyan-300 hover:bg-cyan-900/50',
		purple: 'border-purple-700/50 bg-purple-900/30 text-purple-300 hover:bg-purple-900/50',
		emerald: 'border-emerald-700/50 bg-emerald-900/30 text-emerald-300 hover:bg-emerald-900/50',
		gray: 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700'
	};

	let colorClass = $derived(colors[color] || colors.gray);
</script>

{#if href}
	<a
		{href}
		target="_blank"
		rel="noopener noreferrer external"
		class="rounded-full border px-2 py-0.5 text-[var(--text-tiny)] transition-colors {colorClass}"
		{title}
	>
		{@render children()}
	</a>
{:else}
	<span class="rounded-full border px-2 py-0.5 text-[var(--text-tiny)] {colorClass}">
		{@render children()}
	</span>
{/if}
