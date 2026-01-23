<!--
  NOTE: nguha/legalbench dataset may have access restrictions on HuggingFace API
  Expected LegalBench format:
  {
    "text": "The contract states that the buyer shall pay within 30 days...",
    "answer": "Yes",
    "label": 1
  }

  Expected CUAD format:
  {
    "context": "This Agreement is entered into as of the date last signed below...",
    "question": "Is there a non-compete clause?",
    "answers": {"text": ["The Employee agrees not to compete..."], "answer_start": [1234]}
  }
-->
<script>
	let { sample, dataset, showAnswer = true } = $props();

	const fields = $derived(dataset.fields || {});

	// LegalBench format
	const text = $derived(sample[fields.text] || sample.text || '');

	// CUAD format
	const context = $derived(sample[fields.context] || sample.context || '');
	const question = $derived(sample[fields.question] || sample.question || '');

	// Answer - can be string or object with text array
	function getAnswer() {
		const ans =
			sample[fields.answer] || sample[fields.answers] || sample.answer || sample.answers || '';
		if (typeof ans === 'object' && ans.text) {
			return Array.isArray(ans.text) ? ans.text.filter(Boolean).join(', ') : ans.text;
		}
		return String(ans || '');
	}

	const answer = $derived(getAnswer());
</script>

<div class="space-y-3">
	{#if context}
		<!-- CUAD style: Context + Question -->
		<div class="rounded-lg border-l-4 border-amber-500 bg-[var(--color-bg)] p-3">
			<p class="mb-1 text-[var(--text-tiny)] text-amber-400">Contract Excerpt</p>
			<p
				class="max-h-48 overflow-y-auto whitespace-pre-wrap text-[var(--color-text)] text-[var(--text-small)]"
			>
				{context}
			</p>
		</div>

		{#if question}
			<div class="rounded-lg border-l-4 border-blue-500 bg-[var(--color-bg)] p-3">
				<p class="mb-1 text-[var(--text-tiny)] text-blue-400">Question</p>
				<p class="text-[var(--color-text)] text-[var(--text-body)]">{question}</p>
			</div>
		{/if}
	{:else if text}
		<!-- LegalBench style: Text prompt -->
		<div class="rounded-lg border-l-4 border-amber-500 bg-[var(--color-bg)] p-3">
			<p class="mb-1 text-[var(--text-tiny)] text-amber-400">Legal Text</p>
			<p class="whitespace-pre-wrap text-[var(--color-text)] text-[var(--text-body)]">{text}</p>
		</div>
	{/if}

	{#if showAnswer && answer}
		<div class="rounded-lg border border-green-700/30 bg-green-900/20 p-3">
			<p class="mb-1 text-[var(--text-tiny)] text-green-400">Answer</p>
			<p class="text-[var(--text-body)] text-green-300">{answer || 'No answer in contract'}</p>
		</div>
	{/if}
</div>
