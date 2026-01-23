<script>
	let { sample, showRaw = false } = $props();

	const text = $derived(sample?.text || '');
	const url = $derived(sample?.url || '');
	const score = $derived(sample?.score ?? null);

	function getScoreColor(s) {
		if (s === null || s === undefined) return 'gray';
		if (s >= 4) return 'green';
		if (s >= 3) return 'yellow';
		if (s >= 2) return 'orange';
		return 'red';
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
				class="rounded-full border border-purple-700/50 bg-purple-900/40 px-2 py-0.5 text-[var(--text-tiny)] text-purple-300"
			>
				FineWeb-Edu
			</span>
			{#if score !== null}
				{@const color = getScoreColor(score)}
				<span
					class="bg-{color}-900/40 text-{color}-300 rounded-full border px-2 py-0.5 text-[var(--text-tiny)] border-{color}-700/50 flex items-center gap-1"
				>
					<svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
						<path
							d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
						/>
					</svg>
					Score: {typeof score === 'number' ? score.toFixed(2) : score}
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
			<p class="mb-2 text-[var(--color-muted)] text-[var(--text-tiny)]">Educational Content</p>
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
