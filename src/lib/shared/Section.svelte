<!-- ABOUTME: Main content section container with optional title -->
<!-- ABOUTME: Title uses --color-primary to stand out from paragraph content -->

<script>
	let { children, title = '', class: className = '' } = $props();
</script>

<section class="rounded-lg bg-[var(--color-surface)] p-4 {className}">
	{#if title}
		<h3 class="mb-3 font-semibold text-[color:var(--color-primary)] text-[var(--text-h3)]">
			{title}
		</h3>
	{/if}
	{@render children()}
</section>
