<!--
  REAL DATA from HuggingFace API (mandarjoshi/trivia_qa - rc - validation split)
  {
    "question": "Who was the man behind The Chipmunks?",
    "question_id": "tc_2",
    "question_source": "http://www.triviacountry.com/",
    "entity_pages": {...},
    "search_results": {...},
    "answer": {
      "aliases": ["David Seville"],
      "normalized_aliases": ["david seville"],
      "value": "David Seville",
      "type": "WikipediaEntity"
    }
  }
-->
<script>
	let { sample, showAnswer = false } = $props();

	const question = $derived(sample.question || '');
	const questionId = $derived(sample.question_id || '');
	const questionSource = $derived(sample.question_source || '');
	const answer = $derived(sample.answer?.value || sample.answer || '');
	const aliases = $derived(sample.answer?.aliases || []);
</script>

<div class="space-y-3">
	{#if questionId}
		<div class="flex flex-wrap items-center gap-2">
			<span class="text-[var(--color-muted)] text-[var(--text-tiny)]">ID: {questionId}</span>
			{#if questionSource}
				<span class="text-[var(--color-muted)] text-[var(--text-tiny)]">|</span>
				<a
					href={questionSource}
					target="_blank"
					rel="noopener noreferrer external"
					class="text-[var(--text-tiny)] text-blue-400 hover:text-blue-300"
				>
					Source
				</a>
			{/if}
		</div>
	{/if}

	<div class="rounded-lg border-l-4 border-[var(--color-primary)] bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--color-primary)] text-[var(--text-tiny)]">Question</p>
		<p class="text-[var(--color-text)] text-[var(--text-body)]">{question}</p>
	</div>

	{#if showAnswer && answer}
		<div class="rounded-lg border border-green-700/50 bg-green-900/20 p-3">
			<p class="mb-1 text-[var(--text-tiny)] text-green-400">Answer</p>
			<p class="font-medium text-[var(--text-body)] text-green-300">{answer}</p>
			{#if aliases.length > 1}
				<p class="mt-2 text-[var(--text-tiny)] text-green-400/70">
					Also known as: {aliases.filter((a) => a !== answer).join(', ')}
				</p>
			{/if}
		</div>
	{/if}
</div>
