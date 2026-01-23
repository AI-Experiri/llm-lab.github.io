<!-- ABOUTME: Reusable inner content box with dark background -->
<!-- ABOUTME: Used for highlighted content within sections -->

<script>
	let { children, variant = 'default', class: className = '' } = $props();

	const variants = {
		default: 'bg-[#0f3460]',
		dark: 'bg-[#1a1a2e]'
	};
</script>

<div class="{variants[variant]} rounded p-3 {className}">
	{@render children()}
</div>
