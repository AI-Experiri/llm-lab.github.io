<!-- ABOUTME: Inline code or formula display with accent styling -->
<!-- ABOUTME: Use for formulas, variable names, or code within text -->

<script>
	let { children, class: className = '' } = $props();
</script>

<span class="font-mono text-[var(--color-accent)] text-[var(--text-small)] {className}">
	{@render children()}
</span>
