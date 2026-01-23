<script>
	let { sample, showRaw = false } = $props();

	const text = $derived(sample?.text || '');
	const title = $derived(sample?.short_book_title || '');
	const url = $derived(sample?.url || '');
	const date = $derived(sample?.publication_date || '');
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
				class="rounded-full border border-amber-700/50 bg-amber-900/40 px-2 py-0.5 text-[var(--text-tiny)] text-amber-300"
			>
				Project Gutenberg
			</span>
			<span
				class="rounded-full border border-emerald-700/50 bg-emerald-900/40 px-2 py-0.5 text-[var(--text-tiny)] text-emerald-300"
			>
				Public Domain
			</span>
		</div>

		<!-- Title and Metadata -->
		{#if title || url || date}
			<div class="rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)] p-3">
				{#if title}
					<h4 class="mb-1 font-semibold text-[var(--color-text)] text-[var(--text-body)]">
						{title}
					</h4>
				{/if}
				<div
					class="flex flex-wrap items-center gap-3 text-[var(--color-muted)] text-[var(--text-tiny)]"
				>
					{#if date}
						<span>Published: {date}</span>
					{/if}
					{#if url}
						<a
							href={url}
							target="_blank"
							rel="noopener noreferrer external"
							class="text-[var(--color-primary)] hover:text-pink-400"
						>
							View on Gutenberg ↗
						</a>
					{/if}
				</div>
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
