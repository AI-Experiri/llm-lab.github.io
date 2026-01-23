<!--
  NOTE: maveriq/bigbenchhard dataset not found on HuggingFace API
  Expected format based on dataset documentation:
  {
    "input": "Q: Is the following sentence plausible? \"Lebron James hit a triple.\"\nOptions:\n(A) yes\n(B) no",
    "target": "(B)"
  }
-->
<script>
	let { sample, showAnswer = true } = $props();

	// Parse input to detect if it has options
	function parseInput(input) {
		if (!input) return { question: '', options: [] };

		const optionsMatch = input.match(/Options:\s*\n([\s\S]*?)$/);
		if (optionsMatch) {
			const questionPart = input.replace(/Options:\s*\n[\s\S]*$/, '').trim();
			const optionsText = optionsMatch[1];
			const options = optionsText
				.split('\n')
				.map((o) => o.trim())
				.filter((o) => o.match(/^\([A-Z]\)/))
				.map((o) => {
					const match = o.match(/^\(([A-Z])\)\s*(.*)$/);
					return match ? { label: match[1], text: match[2] } : null;
				})
				.filter(Boolean);
			return { question: questionPart, options };
		}

		return { question: input, options: [] };
	}

	const parsed = $derived(parseInput(sample.input));
	const target = $derived(sample.target || '');

	function isCorrect(option) {
		if (!showAnswer) return false;
		return target.includes(`(${option.label})`);
	}
</script>

<div class="space-y-3">
	<!-- Question/Input -->
	<div class="rounded-lg border-l-4 border-amber-500 bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--text-tiny)] text-amber-400">Input</p>
		<p class="whitespace-pre-wrap text-[var(--color-text)] text-[var(--text-body)]">
			{parsed.question}
		</p>
	</div>

	<!-- Options (if present) -->
	{#if parsed.options.length > 0}
		<div class="space-y-2">
			<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">Options</p>
			<div class="grid gap-1.5">
				{#each parsed.options as option (option.label)}
					<div
						class="flex items-start gap-2 rounded-lg p-2 text-[var(--text-small)] transition-colors
            {isCorrect(option)
							? 'border border-green-700/50 bg-green-900/30'
							: 'border border-transparent bg-[var(--color-bg)]/50'}"
					>
						<span
							class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full font-medium text-[var(--text-tiny)]
              {isCorrect(option)
								? 'bg-green-600 text-white'
								: 'bg-[var(--color-secondary)] text-[var(--color-muted)]'}"
						>
							{option.label}
						</span>
						<span class={isCorrect(option) ? 'text-green-300' : 'text-[var(--color-text)]'}>
							{option.text}
						</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Target/Answer -->
	{#if showAnswer}
		<div class="rounded-lg border border-green-700/30 bg-green-900/20 p-3">
			<p class="mb-1 text-[var(--text-tiny)] text-green-400">Target Answer</p>
			<p class="font-mono text-[var(--text-body)] text-green-300">{target}</p>
		</div>
	{/if}
</div>
