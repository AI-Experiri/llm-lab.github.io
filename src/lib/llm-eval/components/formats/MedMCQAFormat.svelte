<!--
  REAL DATA from HuggingFace API (openlifescienceai/medmcqa - default - validation split)
  {
    "id": "45258d3d-b974-44dd-a161-c3fccbdadd88",
    "question": "Which of the following is not true for myelinated nerve fibers:",
    "opa": "Impulse through myelinated fibers is slower than non-myelinated fibers",
    "opb": "Membrane currents are generated at nodes of Ranvier",
    "opc": "Saltatory conduction of impulses is seen",
    "opd": "Local anesthesia is effective only when the nerve is not covered by myelin sheath",
    "cop": 0,
    "choice_type": "multi",
    "exp": null,
    "subject_name": "Physiology",
    "topic_name": null
  }
-->
<script>
	let { sample, showAnswer = false } = $props();

	const question = $derived(sample.question || '');
	const choices = $derived(
		[
			{ label: 'A', text: sample.opa || '' },
			{ label: 'B', text: sample.opb || '' },
			{ label: 'C', text: sample.opc || '' },
			{ label: 'D', text: sample.opd || '' }
		].filter((c) => c.text)
	);

	function isCorrect(choice) {
		if (!showAnswer) return false;
		// cop is 0-indexed: 0 = A, 1 = B, 2 = C, 3 = D
		const correctLabel = String.fromCharCode(65 + sample.cop);
		return choice.label === correctLabel;
	}
</script>

<div class="space-y-3">
	<div class="flex flex-wrap items-center gap-2">
		{#if sample.id}
			<span class="text-[var(--color-muted)] text-[var(--text-tiny)]">ID: {sample.id}</span>
		{/if}
		{#if sample.subject_name}
			<span
				class="rounded border border-red-700/50 bg-red-900/30 px-2 py-0.5 text-[var(--text-tiny)] text-red-300"
			>
				{sample.subject_name}
			</span>
		{/if}
		{#if sample.topic_name}
			<span
				class="rounded border border-orange-700/50 bg-orange-900/30 px-2 py-0.5 text-[var(--text-tiny)] text-orange-300"
			>
				{sample.topic_name}
			</span>
		{/if}
	</div>

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

	{#if showAnswer && sample.exp}
		<div class="rounded-lg border border-green-700/50 bg-green-900/20 p-3">
			<p class="mb-1 text-[var(--text-tiny)] text-green-400">Explanation</p>
			<p class="text-[var(--text-small)] text-green-200">{sample.exp}</p>
		</div>
	{/if}
</div>
