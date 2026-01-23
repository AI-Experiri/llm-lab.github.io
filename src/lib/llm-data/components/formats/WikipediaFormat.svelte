<script>
	let { sample, showRaw = false } = $props();

	const text = $derived(sample?.text || '');
	const title = $derived(sample?.title || '');
	const url = $derived(sample?.url || '');
</script>

{#if showRaw}
	<pre class="max-h-96 overflow-auto rounded-lg bg-[var(--color-secondary)] p-4 text-sm">
		{JSON.stringify(sample, null, 2)}
	</pre>
{:else}
	<div class="space-y-3">
		<!-- Header with Wikipedia styling -->
		<div class="flex flex-wrap items-center gap-2">
			<span
				class="flex items-center gap-1 rounded-full border border-blue-700/50 bg-blue-900/40 px-2 py-0.5 text-[var(--text-tiny)] text-blue-300"
			>
				<svg class="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
					<path
						d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
					/>
				</svg>
				Wikipedia
			</span>
		</div>

		<!-- Title -->
		{#if title}
			<div class="border-l-4 border-blue-500 pl-3">
				<h3 class="font-semibold text-[var(--color-text)] text-[var(--text-body)]">{title}</h3>
				{#if url}
					<a
						href={url}
						target="_blank"
						rel="noopener noreferrer external"
						class="text-[var(--color-primary)] text-[var(--text-tiny)] transition-colors hover:text-pink-400"
					>
						View on Wikipedia
					</a>
				{/if}
			</div>
		{/if}

		<!-- Article content -->
		<div class="rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)] p-3">
			<p class="mb-2 text-[var(--color-muted)] text-[var(--text-tiny)]">Article Content</p>
			<div class="max-h-96 overflow-y-auto">
				<p
					class="leading-relaxed break-words whitespace-pre-wrap text-[var(--color-text)] text-[var(--text-small)]"
				>
					{text}
				</p>
			</div>
		</div>
	</div>
{/if}
