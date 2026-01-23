<script>
	let { sample, showRaw = false } = $props();

	const text = $derived(sample?.text || '');
	const url = $derived(sample?.url || '');
	const dump = $derived(sample?.dump || '');
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
				class="rounded-full border border-purple-700/50 bg-purple-900/40 px-2 py-0.5 text-[var(--text-tiny)] text-purple-300"
			>
				FineWeb
			</span>
			{#if dump}
				<span
					class="rounded-full border border-blue-700/50 bg-blue-900/40 px-2 py-0.5 text-[var(--text-tiny)] text-blue-300"
				>
					Dump: {dump}
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
