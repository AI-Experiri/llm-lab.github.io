<!-- ABOUTME: Error and warning notice display -->
<!-- ABOUTME: Used for showing errors, warnings, and inaccessible dataset notices -->

<script>
	let { title = 'Error', message, variant = 'error', children } = $props();

	const variants = {
		error: {
			border: 'border-red-500/50',
			bg: 'bg-gradient-to-r from-red-900/30 to-red-950/20',
			icon: 'text-red-500',
			title: 'text-red-300',
			text: 'text-red-200/80'
		},
		warning: {
			border: 'border-yellow-500/50',
			bg: 'bg-gradient-to-r from-yellow-900/30 to-yellow-950/20',
			icon: 'text-yellow-500',
			title: 'text-yellow-300',
			text: 'text-yellow-200/80'
		}
	};

	let style = $derived(variants[variant] || variants.error);
</script>

<section class="rounded-lg border p-4 {style.border} {style.bg}">
	<div class="flex items-start gap-3">
		<div class="text-xl {style.icon}">&#9888;</div>
		<div class="flex-1">
			<h4 class="font-medium text-[var(--text-small)] {style.title}">{title}</h4>
			{#if message}
				<p class="mt-1 text-[var(--text-tiny)] {style.text}">{message}</p>
			{/if}
			{#if children}
				<div class="mt-2">
					{@render children()}
				</div>
			{/if}
		</div>
	</div>
</section>
