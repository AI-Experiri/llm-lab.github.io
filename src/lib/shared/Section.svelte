<!-- ABOUTME: Main content section container with optional title -->
<!-- ABOUTME: Title uses --color-primary by default, or custom titleColor for themed sections -->

<script>
	let { children, title = '', titleColor = '', class: className = '' } = $props();
</script>

<section class="rounded-lg bg-[var(--color-surface)] p-4 {className}">
	{#if title}
		<h3
			class="mb-3 font-semibold text-[var(--text-h3)]"
			style="color: {titleColor || 'var(--color-primary)'}"
		>
			{title}
		</h3>
	{/if}
	{@render children()}
</section>
