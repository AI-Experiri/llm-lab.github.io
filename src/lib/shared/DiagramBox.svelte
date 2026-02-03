<!-- ABOUTME: Container for SVG diagrams with dark background -->
<!-- ABOUTME: SVG fills width, height determined by aspect ratio -->

<script>
	let { children, class: className = '' } = $props();
</script>

<div class="flex w-full items-center justify-center rounded-lg bg-[#0a0a1a] p-6 {className}">
	{@render children()}
</div>
