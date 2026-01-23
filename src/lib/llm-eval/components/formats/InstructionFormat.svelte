<!--
  REAL DATA from HuggingFace API (google/IFEval - train split):
  {
    "key": 1000,
    "prompt": "Write a 300+ word summary of the wikipedia page \"https://en.wikipedia.org/wiki/Raymond_III,_Count_of_Tripoli\". Do not use any commas and highlight at least 3 sections that has titles in markdown format, for example *highlighted section part 1*, *highlighted section part 2*, *highlighted section part 3*.",
    "instruction_id_list": [
      "punctuation:no_comma",
      "detectable_format:number_highlighted_sections",
      "length_constraints:number_words"
    ],
    "kwargs": [
      {"num_highlights": null, "relation": null, "num_words": null, ...},
      {"num_highlights": 3, "relation": null, "num_words": null, ...},
      {"num_highlights": null, "relation": "at least", "num_words": 300, ...}
    ]
  }
-->
<script>
	let { sample, dataset, showAnswer = true } = $props();

	const fields = $derived(dataset.fields || {});

	// IFEval format
	const prompt = $derived(
		sample[fields.prompt] || sample.prompt || sample.instruction || sample.input || ''
	);
	const instructions = $derived(sample[fields.instructions] || sample.instruction_id_list || []);

	// AlpacaEval format
	const instruction = $derived(sample[fields.instruction] || sample.instruction || prompt);
	const output = $derived(sample[fields.output] || sample.output || '');

	// InfoBench format
	const input = $derived(sample[fields.input] || sample.input || prompt);
	const decomposedQuestions = $derived(
		sample[fields.decomposed_questions] || sample.decomposed_questions || []
	);

	// Parse instructions if string
	function getInstructions() {
		if (!instructions) return [];
		if (Array.isArray(instructions)) return instructions;
		if (typeof instructions === 'string') {
			try {
				return JSON.parse(instructions);
			} catch {
				return [instructions];
			}
		}
		return [];
	}

	const instructionList = $derived(getInstructions());

	function getInstructionColor(inst) {
		const i = inst.toLowerCase();
		if (i.includes('length') || i.includes('word')) return 'blue';
		if (i.includes('format') || i.includes('json')) return 'green';
		if (i.includes('keyword') || i.includes('include')) return 'yellow';
		if (i.includes('language')) return 'purple';
		if (i.includes('punctuation')) return 'pink';
		return 'gray';
	}
</script>

<div class="space-y-3">
	<!-- Instruction/Prompt -->
	<div class="rounded-lg border-l-4 border-indigo-500 bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--text-tiny)] text-indigo-400">Instruction</p>
		<p class="whitespace-pre-wrap text-[var(--color-text)] text-[var(--text-body)]">
			{instruction || input}
		</p>
	</div>

	<!-- Verifiable Instructions (IFEval) -->
	{#if instructionList.length > 0}
		<div class="space-y-2">
			<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">
				Constraints ({instructionList.length}):
			</p>
			<div class="flex flex-wrap gap-1.5">
				{#each instructionList as inst (inst)}
					{@const color = getInstructionColor(inst)}
					<span
						class="bg-{color}-900/40 text-{color}-300 rounded border px-2 py-0.5 text-[var(--text-tiny)] border-{color}-700/50"
					>
						{inst}
					</span>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Decomposed Questions (InfoBench) -->
	{#if decomposedQuestions.length > 0}
		<details class="group">
			<summary
				class="flex cursor-pointer items-center gap-2 text-[var(--color-primary)] text-[var(--text-small)] transition-colors hover:text-pink-400"
			>
				<span class="transition-transform group-open:rotate-90">+</span>
				Evaluation Criteria ({decomposedQuestions.length})
			</summary>
			<div class="mt-2 space-y-1.5">
				{#each decomposedQuestions as q, i (i)}
					<div
						class="rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)] p-2 text-[var(--text-small)]"
					>
						<span class="text-[var(--color-muted)]">{i + 1}.</span>
						<span class="text-[var(--color-text)]">{q}</span>
					</div>
				{/each}
			</div>
		</details>
	{/if}

	<!-- Output (AlpacaEval) -->
	{#if showAnswer && output}
		<details class="group">
			<summary
				class="flex cursor-pointer items-center gap-2 text-[var(--color-primary)] text-[var(--text-small)] transition-colors hover:text-pink-400"
			>
				<span class="transition-transform group-open:rotate-90">+</span>
				Reference Output
			</summary>
			<div class="mt-2 rounded-lg border border-green-700/30 bg-green-900/20 p-3">
				<p
					class="max-h-48 overflow-y-auto whitespace-pre-wrap text-[var(--text-small)] text-green-300"
				>
					{output}
				</p>
			</div>
		</details>
	{/if}
</div>
