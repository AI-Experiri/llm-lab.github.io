<!--
  REAL DATA from HuggingFace API (MMMU/MMMU - Art - validation split)
  {
    "id": "validation_Art_1",
    "question": "This Roman portrait mummy <image 1> from the 1st century AD was discovered in Cairo, Egypt...",
    "options": "['Aurelia', 'Matilda', 'Hermione', 'Juno']",
    "explanation": "This Roman portrait mummy from the Julio-Claudian dynasty is known as Hermione Grammatike...",
    "image_1": { "src": "...", "height": 926, "width": 654 },
    "img_type": "['Photographs']",
    "answer": "C",
    "topic_difficulty": "Easy",
    "question_type": "multiple-choice",
    "subfield": "Drawing and Painting"
  }
-->
<script>
	let { sample, showAnswer = false } = $props();

	const question = $derived(sample.question || '');
	const options = $derived(() => {
		try {
			// Options is a stringified JSON array
			const parsed = JSON.parse(sample.options?.replace(/'/g, '"') || '[]');
			return parsed.map((text, i) => ({
				label: String.fromCharCode(65 + i),
				text
			}));
		} catch {
			return [];
		}
	});

	function isCorrect(choice) {
		if (!showAnswer) return false;
		return choice.label === sample.answer;
	}
</script>

<div class="space-y-3">
	<div class="flex flex-wrap items-center gap-2">
		{#if sample.id}
			<span class="text-[var(--color-muted)] text-[var(--text-tiny)]">ID: {sample.id}</span>
		{/if}
		{#if sample.subfield}
			<span
				class="rounded border border-purple-700/50 bg-purple-900/30 px-2 py-0.5 text-[var(--text-tiny)] text-purple-300"
			>
				{sample.subfield}
			</span>
		{/if}
		{#if sample.topic_difficulty}
			<span
				class="rounded border border-blue-700/50 bg-blue-900/30 px-2 py-0.5 text-[var(--text-tiny)] text-blue-300"
			>
				{sample.topic_difficulty}
			</span>
		{/if}
	</div>

	{#if sample.image_1?.src}
		<div class="rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)] p-2">
			<img src={sample.image_1.src} alt="Question visual" class="max-h-64 rounded" />
		</div>
	{/if}

	<div class="rounded-lg border-l-4 border-[var(--color-primary)] bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--color-primary)] text-[var(--text-tiny)]">Question</p>
		<p class="text-[var(--color-text)] text-[var(--text-body)]">{question}</p>
	</div>

	{#if options().length > 0}
		<div class="space-y-2">
			<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">Options ({options().length})</p>
			<ul class="space-y-1.5">
				{#each options() as choice (choice.label)}
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

	{#if showAnswer && sample.explanation}
		<div class="rounded-lg border border-green-700/50 bg-green-900/20 p-3">
			<p class="mb-1 text-[var(--text-tiny)] text-green-400">Explanation</p>
			<p class="text-[var(--text-small)] text-green-200">{sample.explanation}</p>
		</div>
	{/if}
</div>
