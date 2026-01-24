<!-- ABOUTME: Consistent paper/source reference link styling -->
<!-- ABOUTME: Numbered reference with primary color link -->

<script>
	let { href, number = null, children } = $props();
</script>

<li class="flex items-start gap-2">
	{#if number !== null}
		<span class="text-[var(--color-primary)]">{number}.</span>
	{/if}
	<span class="text-[var(--color-muted)]">
		{#if children}
			{@render children()}
		{/if}
		{#if href}
			<a
				{href}
				target="_blank"
				rel="noopener noreferrer external"
				class="text-[var(--color-primary)] underline transition-colors hover:text-pink-400"
			>
				{href}
			</a>
		{/if}
	</span>
</li>
