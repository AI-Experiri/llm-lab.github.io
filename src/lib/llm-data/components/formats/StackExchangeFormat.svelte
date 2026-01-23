<script>
	let { sample, showRaw = false } = $props();

	const question = $derived(sample?.question || '');
	const answers = $derived(sample?.answers || []);
	const date = $derived(sample?.date || '');
	const metadata = $derived(sample?.metadata || []);
	const questionUrl = $derived(metadata[0] || '');

	// Get the top answer by score
	const topAnswer = $derived(
		answers.length > 0
			? answers.reduce((best, curr) => (curr.pm_score > best.pm_score ? curr : best), answers[0])
			: null
	);

	// Strip HTML tags for display
	function stripHtml(html) {
		return (
			html
				?.replace(/<[^>]*>/g, ' ')
				.replace(/\s+/g, ' ')
				.trim() || ''
		);
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
				class="rounded-full border border-orange-700/50 bg-orange-900/40 px-2 py-0.5 text-[var(--text-tiny)] text-orange-300"
			>
				Stack Exchange
			</span>
			{#if date}
				<span
					class="rounded-full border border-gray-700/50 bg-gray-900/40 px-2 py-0.5 text-[var(--text-tiny)] text-gray-300"
				>
					{date}
				</span>
			{/if}
			{#if answers.length > 0}
				<span
					class="rounded-full border border-emerald-700/50 bg-emerald-900/40 px-2 py-0.5 text-[var(--text-tiny)] text-emerald-300"
				>
					{answers.length} answers
				</span>
			{/if}
			{#if questionUrl}
				<a
					href={questionUrl}
					target="_blank"
					rel="noopener noreferrer external"
					class="rounded-full border border-blue-700/50 bg-blue-900/40 px-2 py-0.5 text-[var(--text-tiny)] text-blue-300 transition-colors hover:bg-blue-800/60"
				>
					View on SE ↗
				</a>
			{/if}
		</div>

		<!-- Question -->
		{#if question}
			<div class="rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)] p-3">
				<p class="mb-2 text-[var(--color-muted)] text-[var(--text-tiny)]">Question</p>
				<div class="max-h-48 overflow-y-auto">
					<p
						class="break-words whitespace-pre-wrap text-[var(--color-text)] text-[var(--text-small)]"
					>
						{stripHtml(question)}
					</p>
				</div>
			</div>
		{/if}

		<!-- Top Answer -->
		{#if topAnswer}
			<div class="rounded-lg border border-emerald-700/30 bg-[var(--color-bg)] p-3">
				<div class="mb-2 flex items-center justify-between">
					<p class="text-[var(--text-tiny)] text-emerald-400">Top Answer</p>
					<div class="flex items-center gap-2 text-[var(--text-tiny)]">
						<span class="text-[var(--color-muted)]">by {topAnswer.author}</span>
						<span class="rounded bg-emerald-900/40 px-1.5 py-0.5 text-xs text-emerald-300">
							Score: {topAnswer.pm_score}
						</span>
					</div>
				</div>
				<div class="max-h-48 overflow-y-auto">
					<p
						class="break-words whitespace-pre-wrap text-[var(--color-text)] text-[var(--text-small)]"
					>
						{stripHtml(topAnswer.text)}
					</p>
				</div>
			</div>
		{/if}
	</div>
{/if}
