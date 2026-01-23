<!--
  REAL DATA from HuggingFace API (Rowan/hellaswag - validation split):
  {
    "ind": 24,
    "activity_label": "Roof shingle removal",
    "ctx_a": "A man is sitting on a roof.",
    "ctx_b": "he",
    "ctx": "A man is sitting on a roof. he",
    "endings": [
      "is using wrap to wrap a pair of skis.",
      "is ripping level tiles off.",
      "is holding a rubik's cube.",
      "starts pulling up roofing on a roof."
    ],
    "source_id": "activitynet~v_-JhWjGDPHMY",
    "split": "val",
    "split_type": "indomain",
    "label": "3"
  }
-->
<script>
	let { sample, showAnswer = true } = $props();

	const context = $derived(sample.ctx || sample.context || '');
	const endings = $derived(sample.endings || []);
	const label = $derived(sample.label ?? -1);

	function isCorrect(index) {
		if (!showAnswer) return false;
		// Handle both numeric and string labels
		return index === Number(label);
	}
</script>

<div class="space-y-3">
	<!-- Context -->
	<div class="rounded-lg border-l-4 border-cyan-500 bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--text-tiny)] text-cyan-400">Context</p>
		<p class="text-[var(--color-text)] text-[var(--text-body)]">{context}</p>
	</div>

	<!-- Possible Endings -->
	{#if endings.length > 0}
		<div class="space-y-2">
			<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">
				Choose the most plausible continuation:
			</p>
			<div class="space-y-1.5">
				{#each endings as ending, i (i)}
					<div
						class="flex items-start gap-2 rounded-lg p-2 text-[var(--text-small)] transition-colors
            {isCorrect(i)
							? 'border border-green-700/50 bg-green-900/30'
							: 'border border-transparent bg-[var(--color-bg)]/50'}"
					>
						<span
							class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full font-medium text-[var(--text-tiny)]
              {isCorrect(i)
								? 'bg-green-600 text-white'
								: 'bg-[var(--color-secondary)] text-[var(--color-muted)]'}"
						>
							{String.fromCharCode(65 + i)}
						</span>
						<span class={isCorrect(i) ? 'text-green-300' : 'text-[var(--color-text)]'}>
							{ending}
						</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
