<!--
  REAL DATA from HuggingFace API (lmms-lab/MME - default - test split)
  {
    "question_id": "code_reasoning/0020.png",
    "image": {
      "src": "https://datasets-server.huggingface.co/cached-assets/...",
      "height": 114,
      "width": 416
    },
    "question": "Is a python code shown in the picture? Please answer yes or no.",
    "answer": "Yes",
    "category": "code_reasoning"
  }
-->
<script>
	let { sample, showAnswer = false } = $props();

	const questionId = $derived(sample.question_id || '');
	const image = $derived(sample.image || {});
	const question = $derived(sample.question || '');
	const answer = $derived(sample.answer || '');
	const category = $derived(sample.category || '');
</script>

<div class="space-y-3">
	<div class="flex flex-wrap items-center gap-2">
		{#if category}
			<span
				class="rounded-full border border-fuchsia-700/50 bg-fuchsia-900/40 px-2 py-0.5 text-[var(--text-tiny)] text-fuchsia-300"
			>
				{category.replace(/_/g, ' ')}
			</span>
		{/if}
		{#if questionId}
			<span class="text-[var(--color-muted)] text-[var(--text-tiny)]">ID: {questionId}</span>
		{/if}
	</div>

	{#if image.src}
		<div class="rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)] p-3">
			<p class="mb-2 text-[var(--text-tiny)] text-fuchsia-400">Image</p>
			<img
				src={image.src}
				alt="MME question visual"
				class="h-auto max-w-full rounded border border-[var(--color-secondary)]"
				style="max-height: 300px; object-fit: contain;"
			/>
			{#if image.width && image.height}
				<p class="mt-1 text-[var(--color-muted)] text-[var(--text-tiny)]">
					{image.width} x {image.height}
				</p>
			{/if}
		</div>
	{/if}

	<div class="rounded-lg border-l-4 border-fuchsia-500 bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--text-tiny)] text-fuchsia-400">Question</p>
		<p class="text-[var(--color-text)] text-[var(--text-body)]">{question}</p>
	</div>

	{#if showAnswer && answer}
		<div class="rounded-lg border border-green-700/50 bg-green-900/20 p-3">
			<p class="mb-1 text-[var(--text-tiny)] text-green-400">Answer</p>
			<p class="font-medium text-[var(--text-body)] text-green-300">{answer}</p>
		</div>
	{/if}
</div>
