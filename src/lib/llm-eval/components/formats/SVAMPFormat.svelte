<!--
  REAL DATA from HuggingFace API (ChilleD/SVAMP - default - test split)
  {
    "ID": "chal-736",
    "Body": "Winter is almost here and most animals are migrating to warmer countries...",
    "Question": "How many more bird families flew away to africa than those that flew away to asia?",
    "Equation": "( 62.0 - 35.0 )",
    "Answer": "27",
    "Type": "Subtraction",
    "question_concat": "..."
  }
-->
<script>
	let { sample, showAnswer = false } = $props();

	const body = $derived(sample.Body || '');
	const question = $derived(sample.Question || '');
	const answer = $derived(sample.Answer || '');
	const equation = $derived(sample.Equation || '');
	const problemType = $derived(sample.Type || '');
</script>

<div class="space-y-3">
	<div class="flex flex-wrap items-center gap-2">
		{#if sample.ID}
			<span class="text-[var(--color-muted)] text-[var(--text-tiny)]">ID: {sample.ID}</span>
		{/if}
		{#if problemType}
			<span
				class="rounded border border-yellow-700/50 bg-yellow-900/30 px-2 py-0.5 text-[var(--text-tiny)] text-yellow-300"
			>
				{problemType}
			</span>
		{/if}
	</div>

	<div class="rounded-lg border-l-4 border-blue-500 bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--text-tiny)] text-blue-400">Problem</p>
		<p class="text-[var(--color-text)] text-[var(--text-body)]">{body}</p>
	</div>

	<div class="rounded-lg border-l-4 border-[var(--color-primary)] bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--color-primary)] text-[var(--text-tiny)]">Question</p>
		<p class="text-[var(--color-text)] text-[var(--text-body)]">{question}</p>
	</div>

	{#if showAnswer}
		<div class="space-y-2">
			{#if equation}
				<div class="rounded-lg border border-purple-700/50 bg-purple-900/20 p-3">
					<p class="mb-1 text-[var(--text-tiny)] text-purple-400">Equation</p>
					<p class="font-mono text-[var(--text-body)] text-purple-200">{equation}</p>
				</div>
			{/if}
			{#if answer}
				<div class="rounded-lg border border-green-700/50 bg-green-900/20 p-3">
					<p class="mb-1 text-[var(--text-tiny)] text-green-400">Answer</p>
					<p class="font-mono text-[var(--text-body)] text-green-200">{answer}</p>
				</div>
			{/if}
		</div>
	{/if}
</div>
