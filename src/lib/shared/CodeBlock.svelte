<!-- ABOUTME: Styled code or formula display block -->
<!-- ABOUTME: Monospace font with dark background for code snippets -->

<script>
	let { children, title = '', class: className = '' } = $props();
</script>

<div class="rounded-lg bg-[var(--color-bg)] p-3 {className}">
	{#if title}
		<p class="mb-2 text-[var(--color-muted)] text-[var(--text-tiny)]">{title}</p>
	{/if}
	<div class="font-mono text-[var(--color-text)] text-[var(--text-small)]">
		{@render children()}
	</div>
</div>
