<!-- ABOUTME: Card component for displaying items with pros and cons lists -->
<!-- ABOUTME: All styling controlled here - pages only pass title, description, pros, cons, and optional reference -->

<script>
	/**
	 * @typedef {Object} Reference
	 * @property {string} text - Display text for the reference
	 * @property {string} url - URL to the paper/source
	 */

	/** @type {{ title?: string, description?: string, pros?: string[], cons?: string[], reference?: Reference, class?: string }} */
	let {
		title = '',
		description = '',
		pros = [],
		cons = [],
		reference = null,
		class: className = ''
	} = $props();
</script>

<div
	class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-3 transition-colors hover:border-[var(--color-primary)]/40 {className}"
>
	{#if title}
		<h3 class="mb-3 flex items-center gap-2 font-bold text-[color:var(--color-primary)]">
			{title}
			{#if reference}
				<a
					href={reference.url}
					target="_blank"
					rel="noopener noreferrer external"
					class="text-[var(--color-muted)] transition-colors hover:text-[color:var(--color-primary)]"
					title={reference.text}
				>
					↗
				</a>
			{/if}
		</h3>
	{/if}

	{#if description}
		<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
			{description}
		</p>
	{/if}

	{#if pros.length > 0 || cons.length > 0}
		<div class="grid grid-cols-2 gap-3">
			{#if pros.length > 0}
				<div>
					<span class="font-semibold text-[var(--text-small)] text-green-400">Pros</span>
					<ul class="mt-1 space-y-1 text-[var(--color-muted)] text-[var(--text-small)]">
						{#each pros as pro, i (i)}
							<li class="flex items-start gap-1">
								<span class="text-green-400">+</span>
								{pro}
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			{#if cons.length > 0}
				<div>
					<span class="font-semibold text-[var(--text-small)] text-amber-400">Cons</span>
					<ul class="mt-1 space-y-1 text-[var(--color-muted)] text-[var(--text-small)]">
						{#each cons as con, i (i)}
							<li class="flex items-start gap-1">
								<span class="text-amber-400">-</span>
								{con}
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>
	{/if}
</div>
