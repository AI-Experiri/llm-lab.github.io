<script>
	let { sample, showRaw = false } = $props();

	const text = $derived(sample?.text || '');
	const meta = $derived(sample?.meta || {});
	const pileSetName = $derived(meta?.pile_set_name || '');

	function getSetColor(name) {
		const n = (name || '').toLowerCase();
		if (n.includes('wiki')) return 'blue';
		if (n.includes('github') || n.includes('code')) return 'green';
		if (n.includes('arxiv') || n.includes('paper')) return 'purple';
		if (n.includes('book')) return 'amber';
		if (n.includes('news') || n.includes('cc')) return 'cyan';
		return 'gray';
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
				The Pile
			</span>
			{#if pileSetName}
				{@const color = getSetColor(pileSetName)}
				<span
					class="bg-{color}-900/40 text-{color}-300 rounded-full border px-2 py-0.5 text-[var(--text-tiny)] border-{color}-700/50"
				>
					{pileSetName}
				</span>
			{/if}
		</div>

		<!-- Additional metadata -->
		{#if Object.keys(meta).length > 1 || (Object.keys(meta).length === 1 && !pileSetName)}
			<details class="group">
				<summary
					class="flex cursor-pointer items-center gap-2 text-[var(--color-primary)] text-[var(--text-small)] transition-colors hover:text-pink-400"
				>
					<span class="transition-transform group-open:rotate-90">+</span>
					Metadata
				</summary>
				<div
					class="mt-2 rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)] p-3"
				>
					<pre
						class="overflow-x-auto text-[var(--color-muted)] text-[var(--text-tiny)]">{JSON.stringify(
							meta,
							null,
							2
						)}</pre>
				</div>
			</details>
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
