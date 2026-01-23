<!--
  REAL DATA from HuggingFace API (derek-thomas/ScienceQA - default - test split)
  {
    "image": null,
    "question": "Which figure of speech is used in this text?\nSing, O goddess, the anger of Achilles...",
    "choices": ["chiasmus", "apostrophe"],
    "answer": 1,
    "hint": "",
    "task": "closed choice",
    "grade": "grade11",
    "subject": "language science",
    "topic": "figurative-language",
    "category": "Literary devices",
    "skill": "Classify the figure of speech: anaphora, antithesis, apostrophe...",
    "lecture": "Figures of speech are words or phrases that use language...",
    "solution": "The text uses apostrophe, a direct address to an absent person..."
  }
-->
<script>
	let { sample, showAnswer = false } = $props();

	const question = $derived(sample.question || '');
	const choices = $derived(() => {
		if (!Array.isArray(sample.choices)) return [];
		return sample.choices.map((text, i) => ({
			label: String.fromCharCode(65 + i),
			text
		}));
	});

	function isCorrect(choice) {
		if (!showAnswer) return false;
		// answer is 0-indexed
		const correctLabel = String.fromCharCode(65 + sample.answer);
		return choice.label === correctLabel;
	}
</script>

<div class="space-y-3">
	<div class="flex flex-wrap items-center gap-2">
		{#if sample.grade}
			<span
				class="rounded border border-blue-700/50 bg-blue-900/30 px-2 py-0.5 text-[var(--text-tiny)] text-blue-300"
			>
				{sample.grade}
			</span>
		{/if}
		{#if sample.subject}
			<span
				class="rounded border border-purple-700/50 bg-purple-900/30 px-2 py-0.5 text-[var(--text-tiny)] text-purple-300"
			>
				{sample.subject}
			</span>
		{/if}
		{#if sample.topic}
			<span
				class="rounded border border-cyan-700/50 bg-cyan-900/30 px-2 py-0.5 text-[var(--text-tiny)] text-cyan-300"
			>
				{sample.topic}
			</span>
		{/if}
	</div>

	{#if sample.image}
		<div class="rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)] p-2">
			<img src={sample.image} alt="Question visual" class="max-h-64 rounded" />
		</div>
	{/if}

	<div class="rounded-lg border-l-4 border-[var(--color-primary)] bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--color-primary)] text-[var(--text-tiny)]">Question</p>
		<p class="whitespace-pre-line text-[var(--color-text)] text-[var(--text-body)]">{question}</p>
	</div>

	{#if sample.hint}
		<div class="rounded-lg border border-yellow-700/50 bg-yellow-900/20 p-2">
			<p class="text-[var(--text-tiny)] text-yellow-400">Hint: {sample.hint}</p>
		</div>
	{/if}

	{#if choices().length > 0}
		<div class="space-y-2">
			<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">Choices ({choices().length})</p>
			<ul class="space-y-1.5">
				{#each choices() as choice (choice.label)}
					<li
						class="flex items-start gap-2 rounded-lg p-2 text-[var(--text-small)] transition-colors
            {isCorrect(choice)
							? 'border border-green-700/50 bg-green-900/30'
							: 'border border-transparent bg-[var(--color-bg)]/50'}"
					>
						<span
							class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full font-medium text-[var(--text-tiny)]
              {isCorrect(choice)
								? 'bg-green-600 text-white'
								: 'bg-[var(--color-secondary)] text-[var(--color-muted)]'}"
						>
							{choice.label}
						</span>
						<span class={isCorrect(choice) ? 'text-green-300' : 'text-[var(--color-text)]'}>
							{choice.text}
						</span>
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	{#if showAnswer && sample.solution}
		<div class="rounded-lg border border-green-700/50 bg-green-900/20 p-3">
			<p class="mb-1 text-[var(--text-tiny)] text-green-400">Solution</p>
			<p class="text-[var(--text-small)] text-green-200">{sample.solution}</p>
		</div>
	{/if}

	{#if showAnswer && sample.lecture}
		<details class="rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)]">
			<summary class="cursor-pointer p-2 text-[var(--color-muted)] text-[var(--text-tiny)]"
				>Lecture</summary
			>
			<p class="p-3 pt-0 text-[var(--color-text)] text-[var(--text-small)]">{sample.lecture}</p>
		</details>
	{/if}
</div>
