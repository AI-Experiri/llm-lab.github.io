<!-- ABOUTME: Side-by-side comparison layout for contrasting items -->
<!-- ABOUTME: Supports 2-4 columns with responsive grid -->

<script>
	/**
	 * @typedef {Object} ComparisonItem
	 * @property {string} title - Item title
	 * @property {string} [color] - Border/accent color (tailwind class like 'emerald', 'amber')
	 * @property {string[]} points - List of points for this item
	 */

	/** @type {{ items: ComparisonItem[], columns?: number }} */
	let { items, columns = 2 } = $props();

	const gridCols = {
		2: 'md:grid-cols-2',
		3: 'md:grid-cols-3',
		4: 'md:grid-cols-4'
	};
</script>

<div class="grid gap-3 {gridCols[columns]}">
	{#each items as item (item.title)}
		{@const borderColor = item.color
			? `border-${item.color}-500/30`
			: 'border-[var(--color-muted)]/20'}
		{@const titleColor = item.color ? `text-${item.color}-400` : 'text-[var(--color-text)]'}
		<div class="rounded-lg border {borderColor} bg-[var(--color-bg)] p-3">
			<p class="mb-2 font-semibold text-[var(--text-small)] {titleColor}">{item.title}</p>
			<ul class="space-y-1 text-[var(--color-muted)] text-[var(--text-tiny)]">
				{#each item.points as point, idx (idx)}
					<li>&bull; {point}</li>
				{/each}
			</ul>
		</div>
	{/each}
</div>
