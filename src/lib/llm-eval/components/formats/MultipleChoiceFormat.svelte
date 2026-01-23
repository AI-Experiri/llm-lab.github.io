<!--
  REAL DATA from HuggingFace API

  Sample Raw Data (MMLU - cais/mmlu - test split):
  {
    "question": "Find the degree for the given field extension Q(sqrt(2), sqrt(3), sqrt(18)) over Q.",
    "subject": "abstract_algebra",
    "choices": ["0", "4", "2", "6"],
    "answer": 1
  }

  Sample Raw Data (ARC Challenge - allenai/ai2_arc - ARC-Challenge config):
  {
    "id": "Mercury_7175875",
    "question": "An astronomer observes that a planet rotates faster after a meteorite impact. Which is the most likely effect of this increase in rotation?",
    "choices": {
      "text": ["Planetary density will decrease.", "Planetary years will become longer.", "Planetary days will become shorter.", "Planetary gravity will become stronger."],
      "label": ["A", "B", "C", "D"]
    },
    "answerKey": "C"
  }
-->
<script>
	let { sample, dataset, showAnswer = true } = $props();

	function getChoices() {
		const fields = dataset.fields;
		const choicesField = fields.choices;

		// Handle array of field names (PIQA: ["sol1", "sol2"])
		if (Array.isArray(choicesField)) {
			return choicesField
				.map((fieldName, i) => ({
					label: String.fromCharCode(65 + i),
					text: sample[fieldName] || ''
				}))
				.filter((c) => c.text);
		}

		if (!sample[choicesField]) return [];

		const choices = sample[choicesField];

		// Handle array of strings
		if (Array.isArray(choices) && typeof choices[0] === 'string') {
			return choices.map((c, i) => ({ label: String.fromCharCode(65 + i), text: c }));
		}

		// Handle {text: [], label: []} format (ARC, CommonsenseQA)
		if (choices.text && Array.isArray(choices.text)) {
			return choices.text.map((t, i) => ({
				label: choices.label?.[i] || String.fromCharCode(65 + i),
				text: t
			}));
		}

		return [];
	}

	function isCorrect(choice) {
		if (!showAnswer) return false;
		const answer = sample[dataset.fields.answer];
		// Handle numeric answer (0, 1, 2, 3) - convert to letter (0-indexed)
		if (typeof answer === 'number') {
			return choice.label === String.fromCharCode(65 + answer);
		}
		// Handle string numeric answer "1", "2", "3" (1-indexed, e.g., Social IQA)
		if (typeof answer === 'string' && /^[1-9]$/.test(answer)) {
			return choice.label === String.fromCharCode(64 + parseInt(answer));
		}
		// Handle letter answer (A, B, C, D)
		return choice.label === String(answer);
	}

	const choices = $derived(getChoices());
	const question = $derived(sample[dataset.fields.question] || '');
</script>

<div class="space-y-3">
	<div class="rounded-lg border-l-4 border-[var(--color-primary)] bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--color-primary)] text-[var(--text-tiny)]">Question</p>
		<p class="text-[var(--color-text)] text-[var(--text-body)]">{question}</p>
	</div>

	{#if choices.length > 0}
		<div class="space-y-2">
			<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">Options ({choices.length})</p>
			<ul class="space-y-1.5">
				{#each choices as choice (choice.label)}
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
</div>
