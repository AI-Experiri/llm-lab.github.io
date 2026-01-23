<!--
  NOTE: lmms-lab/MME dataset not accessible via HuggingFace API
  Expected MME format:
  {
    "question": "Is there a dog in this image?",
    "answer": "Yes",
    "category": "existence",
    "image_id": "000001.jpg",
    "image": "<binary image data>"
  }

  Expected SEED-Bench format:
  {
    "question": "What color is the car?",
    "choice_a": "Red",
    "choice_b": "Blue",
    "choice_c": "Green",
    "choice_d": "Yellow",
    "answer": "A",
    "image": "<binary image data>"
  }
-->
<script>
	let { sample, dataset, showAnswer = true } = $props();

	const fields = $derived(dataset.fields || {});

	// MME format
	const question = $derived(sample[fields.question] || sample.question || '');
	const answer = $derived(sample[fields.answer] || sample.answer || '');
	const category = $derived(sample.category || sample.task || '');
	const imageId = $derived(sample.image_id || sample.image || '');

	// SEED-Bench format (handled by MMLUProFormat, but keep for reference)
	const choiceA = $derived(sample[fields.choice_a] || sample.choice_a || '');
	const choiceB = $derived(sample[fields.choice_b] || sample.choice_b || '');
	const choiceC = $derived(sample[fields.choice_c] || sample.choice_c || '');
	const choiceD = $derived(sample[fields.choice_d] || sample.choice_d || '');

	const choices = $derived([choiceA, choiceB, choiceC, choiceD].filter(Boolean));

	function isCorrect(idx) {
		if (!showAnswer) return false;
		const ans = sample.answer || '';
		return String.fromCharCode(65 + idx) === ans;
	}
</script>

<div class="space-y-3">
	<!-- Category Tag -->
	{#if category}
		<div class="flex items-center gap-2">
			<span
				class="rounded-full border border-fuchsia-700/50 bg-fuchsia-900/40 px-2 py-0.5 text-[var(--text-tiny)] text-fuchsia-300"
			>
				{category}
			</span>
			{#if imageId}
				<span class="text-[var(--color-muted)] text-[var(--text-tiny)]">Image: {imageId}</span>
			{/if}
		</div>
	{/if}

	<!-- Image Placeholder -->
	{#if imageId || sample.image}
		<div
			class="rounded-lg border border-dashed border-fuchsia-500/50 bg-[var(--color-bg)] p-4 text-center"
		>
			<p class="text-[var(--text-small)] text-fuchsia-400">
				[Image content - visual inspection required]
			</p>
			{#if imageId}
				<p class="mt-1 text-[var(--color-muted)] text-[var(--text-tiny)]">ID: {imageId}</p>
			{/if}
		</div>
	{/if}

	<!-- Question -->
	<div class="rounded-lg border-l-4 border-fuchsia-500 bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--text-tiny)] text-fuchsia-400">Question</p>
		<p class="text-[var(--color-text)] text-[var(--text-body)]">{question}</p>
	</div>

	<!-- Choices (if available) -->
	{#if choices.length > 0}
		<div class="space-y-1.5">
			{#each choices as choice, i (i)}
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
						{choice}
					</span>
				</div>
			{/each}
		</div>
	{:else if showAnswer && answer}
		<!-- Simple answer -->
		<div class="rounded-lg border border-green-700/30 bg-green-900/20 p-3">
			<p class="mb-1 text-[var(--text-tiny)] text-green-400">Answer</p>
			<p class="font-medium text-[var(--text-body)] text-green-300">{answer}</p>
		</div>
	{/if}
</div>
