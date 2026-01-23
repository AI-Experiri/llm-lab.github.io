<!--
  REAL DATA from HuggingFace API (kqsong/InFoBench - default - train split)
  {
    "id": "user_oriented_task_167",
    "input": "The typical avocado is over 300 calories from the oil in it...",
    "category": "Quora",
    "instruction": "Choose an appealing title for your post.",
    "decomposed_questions": [
      "Is the generated text a post title?",
      "Is the generated text appealing as a post tile?",
      "Is the generated post title suitable for the post in the given input?"
    ],
    "subset": "Easy_set",
    "question_label": [["Format"], ["Content"], ["Content"]]
  }
-->
<script>
	let { sample, showAnswer = false } = $props();

	const id = $derived(sample.id || '');
	const input = $derived(sample.input || '');
	const category = $derived(sample.category || '');
	const instruction = $derived(sample.instruction || '');
	const decomposedQuestions = $derived(sample.decomposed_questions || []);
	const subset = $derived(sample.subset || '');
	const questionLabels = $derived(sample.question_label || []);
</script>

<div class="space-y-3">
	<div class="flex flex-wrap items-center gap-2">
		{#if category}
			<span
				class="rounded-full border border-teal-700/50 bg-teal-900/40 px-2 py-0.5 text-[var(--text-tiny)] text-teal-300"
			>
				{category}
			</span>
		{/if}
		{#if subset}
			<span
				class="rounded-full border border-purple-700/50 bg-purple-900/40 px-2 py-0.5 text-[var(--text-tiny)] text-purple-300"
			>
				{subset}
			</span>
		{/if}
		{#if id}
			<span class="text-[var(--color-muted)] text-[var(--text-tiny)]">ID: {id}</span>
		{/if}
	</div>

	{#if input}
		<div class="rounded-lg border-l-4 border-blue-500 bg-[var(--color-bg)] p-3">
			<p class="mb-1 text-[var(--text-tiny)] text-blue-400">Input Context</p>
			<p class="text-[var(--color-text)] text-[var(--text-small)]">{input}</p>
		</div>
	{/if}

	<div class="rounded-lg border-l-4 border-teal-500 bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--text-tiny)] text-teal-400">Instruction</p>
		<p class="text-[var(--color-text)] text-[var(--text-body)]">{instruction}</p>
	</div>

	{#if showAnswer && decomposedQuestions.length > 0}
		<div class="rounded-lg border border-teal-700/50 bg-teal-900/20 p-3">
			<p class="mb-2 text-[var(--text-tiny)] text-teal-400">
				Evaluation Criteria ({decomposedQuestions.length})
			</p>
			<div class="space-y-2">
				{#each decomposedQuestions as q, i (i)}
					<div class="flex items-start gap-2">
						<span
							class="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-teal-600 font-medium text-[var(--text-tiny)] text-white"
						>
							{i + 1}
						</span>
						<div class="flex-1">
							<span class="text-[var(--color-text)] text-[var(--text-small)]">{q}</span>
							{#if questionLabels[i]}
								<span
									class="ml-2 rounded bg-gray-800 px-1.5 py-0.5 text-[var(--text-tiny)] text-gray-300"
								>
									{questionLabels[i].join(', ')}
								</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
