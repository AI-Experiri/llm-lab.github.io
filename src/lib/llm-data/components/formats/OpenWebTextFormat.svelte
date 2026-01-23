<script>
	let { sample, showRaw = false } = $props();

	const text = $derived(sample?.text || '');
</script>

{#if showRaw}
	<pre class="max-h-96 overflow-auto rounded-lg bg-[var(--color-secondary)] p-4 text-sm">
		{JSON.stringify(sample, null, 2)}
	</pre>
{:else}
	<div class="space-y-3">
		<!-- Metadata badge -->
		<div class="flex items-center gap-2">
			<span
				class="rounded-full border border-blue-700/50 bg-blue-900/40 px-2 py-0.5 text-[var(--text-tiny)] text-blue-300"
			>
				OpenWebText
			</span>
			<span class="text-[var(--color-muted)] text-[var(--text-tiny)]"> Web text corpus </span>
		</div>

		<!-- Text content -->
		<div class="rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)] p-3">
			<p class="mb-2 text-[var(--color-muted)] text-[var(--text-tiny)]">Content</p>
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
