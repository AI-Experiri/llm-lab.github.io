<!--
  REAL DATA from HuggingFace API (wis-k/instruction-following-eval - default - train split)
  {
    "key": 1000,
    "prompt": "Write a 300+ word summary of the wikipedia page \"https://en.wikipedia.org/wiki/Raymond_III,_Count_of_Tripoli\". Do not use any commas and highlight at least 3 sections that has titles in markdown format, for example *highlighted section part 1*, *highlighted section part 2*, *highlighted section part 3*.",
    "instruction_id_list": [
      "punctuation:no_comma",
      "detectable_format:number_highlighted_sections",
      "length_constraints:number_words"
    ],
    "kwargs": [...]
  }
-->
<script>
	let { sample, showAnswer = false } = $props();

	const key = $derived(sample.key);
	const prompt = $derived(sample.prompt || '');
	const instructionIds = $derived(sample.instruction_id_list || []);

	function formatInstruction(id) {
		return id.replace(/_/g, ' ').replace(/:/g, ': ');
	}
</script>

<div class="space-y-3">
	{#if key !== undefined}
		<div class="text-[var(--color-muted)] text-[var(--text-tiny)]">Key: {key}</div>
	{/if}

	<div class="rounded-lg border-l-4 border-indigo-500 bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--text-tiny)] text-indigo-400">Prompt</p>
		<p class="text-[var(--color-text)] text-[var(--text-body)]">{prompt}</p>
	</div>

	{#if showAnswer && instructionIds.length > 0}
		<div class="rounded-lg border border-indigo-700/50 bg-indigo-900/20 p-3">
			<p class="mb-2 text-[var(--text-tiny)] text-indigo-400">
				Instructions to Follow ({instructionIds.length})
			</p>
			<div class="space-y-1.5">
				{#each instructionIds as id, i (id)}
					<div class="flex items-start gap-2">
						<span
							class="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 font-medium text-[var(--text-tiny)] text-white"
						>
							{i + 1}
						</span>
						<span class="text-[var(--text-small)] text-indigo-300">{formatInstruction(id)}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
