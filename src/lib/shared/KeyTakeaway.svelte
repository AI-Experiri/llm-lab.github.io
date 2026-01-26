<!-- ABOUTME: Key takeaways component with two modes: numbered list or single callout -->
<!-- ABOUTME: Pass items array for numbered bullets, or children for simple callout -->

<script>
	let {
		items = [],
		title = 'Key Takeaways',
		columns = 1,
		children,
		class: className = ''
	} = $props();
</script>

{#if items.length > 0}
	<!-- Numbered bullet design for overview pages -->
	<div
		class="rounded-xl border border-[var(--color-primary)]/20 bg-gradient-to-br from-[var(--color-primary)]/10 to-pink-600/10 p-6 {className}"
	>
		<h2 class="mb-4 text-xl font-bold text-[var(--color-text)]">{title}</h2>
		<div class="grid gap-4 {columns === 1 ? '' : 'sm:grid-cols-2'}">
			{#each items as item, i (i)}
				<div class="flex items-start gap-3">
					<div
						class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/20 font-bold text-[var(--color-primary)] text-[var(--text-small)]"
					>
						{i + 1}
					</div>
					<p class="text-[var(--color-muted)] text-[var(--text-small)]">
						{item}
					</p>
				</div>
			{/each}
		</div>
	</div>
{:else if children}
	<!-- Simple callout design for inline usage -->
	<div
		class="rounded-lg border border-[var(--color-primary)]/40 bg-[var(--color-bg)] p-4 {className}"
	>
		<p class="mb-2 font-semibold text-[var(--color-primary)] text-[var(--text-small)]">{title}</p>
		<div class="text-[var(--color-muted)] text-[var(--text-small)]">
			{@render children()}
		</div>
	</div>
{/if}
