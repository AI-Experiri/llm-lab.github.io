<!-- ABOUTME: Dataset information card with metadata and links -->
<!-- ABOUTME: Displays dataset name, category badge, and action links -->

<script>
	import PillLink from './PillLink.svelte';

	let {
		name,
		category,
		categoryColor = 'gray',
		description = '',
		year = '',
		size = '',
		hfUrl = '',
		paperUrl = '',
		codeUrl = '',
		license = '',
		children
	} = $props();

	const borderColors = {
		purple: 'border-purple-500',
		blue: 'border-blue-500',
		green: 'border-green-500',
		amber: 'border-amber-500',
		red: 'border-red-500',
		cyan: 'border-cyan-500',
		gray: 'border-gray-500'
	};

	const badgeColors = {
		purple: 'border-purple-700/50 bg-purple-900/40 text-purple-300',
		blue: 'border-blue-700/50 bg-blue-900/40 text-blue-300',
		green: 'border-green-700/50 bg-green-900/40 text-green-300',
		amber: 'border-amber-700/50 bg-amber-900/40 text-amber-300',
		red: 'border-red-700/50 bg-red-900/40 text-red-300',
		cyan: 'border-cyan-700/50 bg-cyan-900/40 text-cyan-300',
		gray: 'border-gray-700/50 bg-gray-900/40 text-gray-300'
	};

	let borderColor = $derived(borderColors[categoryColor] || borderColors.gray);
	let badgeColor = $derived(badgeColors[categoryColor] || badgeColors.gray);
</script>

<section class="rounded-lg border-l-4 bg-[var(--color-secondary)] p-4 {borderColor}">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
		<div class="min-w-0 flex-1">
			<div class="flex flex-wrap items-center gap-2">
				<h3 class="font-semibold text-[var(--color-text)] text-[var(--text-body)]">
					{name}
				</h3>
				<span class="rounded-full border px-2 py-0.5 text-[var(--text-tiny)] {badgeColor}">
					{category}
				</span>
				{#if year}
					<span
						class="rounded-full border border-gray-700 bg-gray-800 px-2 py-0.5 text-[var(--text-tiny)] text-gray-300"
					>
						{year}
					</span>
				{/if}
			</div>
			<div class="mt-1.5 flex flex-wrap items-center gap-2">
				{#if size}
					<PillLink color="cyan">{size}</PillLink>
				{/if}
				{#if paperUrl}
					<PillLink href={paperUrl} color="red">Paper</PillLink>
				{/if}
				{#if codeUrl}
					<PillLink href={codeUrl} color="green">Code</PillLink>
				{/if}
				{#if hfUrl}
					<PillLink href={hfUrl} color="yellow">HF</PillLink>
				{/if}
				{#if license}
					<span class="text-[var(--color-muted)] text-[var(--text-tiny)]">{license}</span>
				{/if}
			</div>
			{#if description}
				<p class="mt-1 truncate text-[var(--color-muted)] text-[var(--text-tiny)]">
					{description}
				</p>
			{/if}
		</div>
		{#if children}
			{@render children()}
		{/if}
	</div>
</section>
