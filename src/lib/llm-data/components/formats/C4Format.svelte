<script>
	let { sample, showRaw = false } = $props();

	const text = $derived(sample?.text || '');
	const url = $derived(sample?.url || '');
	const timestamp = $derived(sample?.timestamp || '');

	function formatTimestamp(ts) {
		if (!ts) return '';
		try {
			const date = new Date(ts);
			return date.toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric'
			});
		} catch {
			return ts;
		}
	}
</script>

{#if showRaw}
	<pre class="max-h-96 overflow-auto rounded-lg bg-[var(--color-secondary)] p-4 text-sm">
		{JSON.stringify(sample, null, 2)}
	</pre>
{:else}
	<div class="space-y-3">
		<!-- Metadata badges -->
		<div class="flex flex-wrap items-center gap-2">
			<span
				class="rounded-full border border-cyan-700/50 bg-cyan-900/40 px-2 py-0.5 text-[var(--text-tiny)] text-cyan-300"
			>
				C4
			</span>
			{#if timestamp}
				<span
					class="flex items-center gap-1 rounded-full border border-gray-600/50 bg-gray-700/50 px-2 py-0.5 text-[var(--text-tiny)] text-gray-300"
				>
					<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
					{formatTimestamp(timestamp)}
				</span>
			{/if}
		</div>

		<!-- URL -->
		{#if url}
			<div class="flex items-center gap-2">
				<span class="text-[var(--color-muted)] text-[var(--text-tiny)]">Source:</span>
				<a
					href={url}
					target="_blank"
					rel="noopener noreferrer external"
					class="max-w-md truncate text-[var(--color-primary)] text-[var(--text-tiny)] transition-colors hover:text-pink-400"
				>
					{url}
				</a>
			</div>
		{/if}

		<!-- Text content -->
		<div class="rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)] p-3">
			<p class="mb-2 text-[var(--color-muted)] text-[var(--text-tiny)]">Content</p>
			<div class="max-h-96 overflow-y-auto">
				<p
					class="break-words whitespace-pre-wrap text-[var(--color-text)] text-[var(--text-small)]"
				>
					{text}
				</p>
			</div>
		</div>
	</div>
{/if}
