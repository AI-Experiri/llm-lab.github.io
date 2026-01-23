<script>
	let { sample, showRaw = false } = $props();

	const article = $derived(sample?.article || '');
	const abstract = $derived(sample?.abstract || '');
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
				class="rounded-full border border-red-700/50 bg-red-900/40 px-2 py-0.5 text-[var(--text-tiny)] text-red-300"
			>
				arXiv
			</span>
			<span
				class="rounded-full border border-blue-700/50 bg-blue-900/40 px-2 py-0.5 text-[var(--text-tiny)] text-blue-300"
			>
				Academic Paper
			</span>
		</div>

		<!-- Abstract -->
		{#if abstract}
			<div class="rounded-lg border border-blue-700/30 bg-[var(--color-bg)] p-3">
				<p class="mb-2 text-[var(--text-tiny)] text-blue-400">Abstract</p>
				<div class="max-h-48 overflow-y-auto">
					<p
						class="break-words whitespace-pre-wrap text-[var(--color-text)] text-[var(--text-small)]"
					>
						{abstract}
					</p>
				</div>
			</div>
		{/if}

		<!-- Article content -->
		{#if article}
			<div class="rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)] p-3">
				<p class="mb-2 text-[var(--color-muted)] text-[var(--text-tiny)]">Article Content</p>
				<div class="max-h-96 overflow-y-auto">
					<p
						class="break-words whitespace-pre-wrap text-[var(--color-text)] text-[var(--text-small)]"
					>
						{article}
					</p>
				</div>
			</div>
		{/if}
	</div>
{/if}
