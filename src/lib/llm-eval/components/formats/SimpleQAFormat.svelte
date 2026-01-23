<!--
  REAL DATA from HuggingFace API (basicv8vc/SimpleQA - default - test split)
  {
    "metadata": "{'topic': 'Science and technology', 'answer_type': 'Person', 'urls': [...]}",
    "problem": "Who received the IEEE Frank Rosenblatt Award in 2010?",
    "answer": "Michio Sugeno"
  }
-->
<script>
	let { sample, showAnswer = false } = $props();

	const question = $derived(sample.problem || '');
	const answer = $derived(sample.answer || '');
	const metadata = $derived(() => {
		try {
			return JSON.parse(sample.metadata?.replace(/'/g, '"') || '{}');
		} catch {
			return {};
		}
	});
</script>

<div class="space-y-3">
	<div class="flex flex-wrap items-center gap-2">
		{#if metadata().topic}
			<span
				class="rounded border border-blue-700/50 bg-blue-900/30 px-2 py-0.5 text-[var(--text-tiny)] text-blue-300"
			>
				{metadata().topic}
			</span>
		{/if}
		{#if metadata().answer_type}
			<span
				class="rounded border border-purple-700/50 bg-purple-900/30 px-2 py-0.5 text-[var(--text-tiny)] text-purple-300"
			>
				{metadata().answer_type}
			</span>
		{/if}
	</div>

	<div class="rounded-lg border-l-4 border-[var(--color-primary)] bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--color-primary)] text-[var(--text-tiny)]">Question</p>
		<p class="text-[var(--color-text)] text-[var(--text-body)]">{question}</p>
	</div>

	{#if showAnswer && answer}
		<div class="rounded-lg border border-green-700/50 bg-green-900/20 p-3">
			<p class="mb-1 text-[var(--text-tiny)] text-green-400">Answer</p>
			<p class="text-[var(--text-body)] text-green-200">{answer}</p>
		</div>
	{/if}

	{#if showAnswer && metadata().urls?.length > 0}
		<div class="rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)] p-2">
			<p class="mb-1 text-[var(--color-muted)] text-[var(--text-tiny)]">Sources</p>
			<ul class="space-y-1">
				{#each metadata().urls.slice(0, 3) as url (url)}
					<li>
						<a
							href={url}
							target="_blank"
							rel="noopener noreferrer external"
							class="block truncate text-[var(--text-tiny)] text-blue-400 hover:underline"
						>
							{url}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
