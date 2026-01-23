<!--
  REAL DATA from HuggingFace API (HuggingFaceH4/mt_bench_prompts - default - train split)
  {
    "category": "writing",
    "prompt": [
      "Compose an engaging travel blog post about a recent trip to Hawaii, highlighting cultural experiences and must-see attractions.",
      "Rewrite your previous response. Start every sentence with the letter A."
    ],
    "reference": [],
    "prompt_id": 44067482
  }
-->
<script>
	let { sample, showAnswer = false } = $props();

	const category = $derived(sample.category || '');
	const prompts = $derived(sample.prompt || []);
	const reference = $derived(sample.reference || []);
	const promptId = $derived(sample.prompt_id);
</script>

<div class="space-y-3">
	<div class="flex flex-wrap items-center gap-2">
		{#if category}
			<span
				class="rounded-full border border-pink-700/50 bg-pink-900/40 px-2 py-0.5 text-[var(--text-tiny)] text-pink-300"
			>
				{category}
			</span>
		{/if}
		{#if promptId}
			<span class="text-[var(--color-muted)] text-[var(--text-tiny)]">ID: {promptId}</span>
		{/if}
	</div>

	<div class="space-y-2">
		{#each prompts as prompt, i (i)}
			<div
				class="rounded-lg border-l-4 bg-[var(--color-bg)] p-3 {i === 0
					? 'border-pink-500'
					: 'border-purple-500'}"
			>
				<p class="text-[var(--text-tiny)] {i === 0 ? 'text-pink-400' : 'text-purple-400'} mb-1">
					Turn {i + 1}
				</p>
				<p class="text-[var(--color-text)] text-[var(--text-body)]">{prompt}</p>
			</div>
		{/each}
	</div>

	{#if showAnswer && reference.length > 0}
		<div class="space-y-2">
			<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">Reference Answers</p>
			{#each reference as ref, i (i)}
				<div class="rounded-lg border border-green-700/50 bg-green-900/20 p-3">
					<p class="mb-1 text-[var(--text-tiny)] text-green-400">Reference {i + 1}</p>
					<p class="text-[var(--text-small)] text-green-300">{ref}</p>
				</div>
			{/each}
		</div>
	{:else if showAnswer && reference.length === 0}
		<div class="rounded-lg border border-yellow-700/50 bg-yellow-900/20 p-3">
			<p class="text-[var(--text-tiny)] text-yellow-400">
				No reference answers provided (open-ended evaluation)
			</p>
		</div>
	{/if}
</div>
