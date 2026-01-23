<!--
  REAL DATA from HuggingFace API (allenai/winogrande - winogrande_xl config - validation split):
  {
    "sentence": "Sarah was a much better surgeon than Maria so _ always got the easier cases.",
    "option1": "Sarah",
    "option2": "Maria",
    "answer": "2"
  }
-->
<script>
	let { sample, showAnswer = true } = $props();

	const sentence = $derived(sample.sentence || '');
	const option1 = $derived(sample.option1 || '');
	const option2 = $derived(sample.option2 || '');
	const answer = $derived(sample.answer || '');

	function isCorrect(opt) {
		if (!showAnswer) return false;
		return opt === answer;
	}
</script>

<div class="space-y-3">
	<!-- Sentence with blank -->
	<div class="rounded-lg border-l-4 border-violet-500 bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--text-tiny)] text-violet-400">Sentence (fill in the blank)</p>
		<p class="text-[var(--color-text)] text-[var(--text-body)]">
			{sentence.replace('_', '______')}
		</p>
	</div>

	<!-- Options -->
	<div class="space-y-2">
		<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">Options:</p>
		<div class="space-y-1.5">
			<div
				class="flex items-start gap-2 rounded-lg p-2 text-[var(--text-small)] transition-colors
        {isCorrect('1')
					? 'border border-green-700/50 bg-green-900/30'
					: 'border border-transparent bg-[var(--color-bg)]/50'}"
			>
				<span
					class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full font-medium text-[var(--text-tiny)]
          {isCorrect('1')
						? 'bg-green-600 text-white'
						: 'bg-[var(--color-secondary)] text-[var(--color-muted)]'}"
				>
					1
				</span>
				<span class={isCorrect('1') ? 'text-green-300' : 'text-[var(--color-text)]'}>
					{option1}
				</span>
			</div>
			<div
				class="flex items-start gap-2 rounded-lg p-2 text-[var(--text-small)] transition-colors
        {isCorrect('2')
					? 'border border-green-700/50 bg-green-900/30'
					: 'border border-transparent bg-[var(--color-bg)]/50'}"
			>
				<span
					class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full font-medium text-[var(--text-tiny)]
          {isCorrect('2')
						? 'bg-green-600 text-white'
						: 'bg-[var(--color-secondary)] text-[var(--color-muted)]'}"
				>
					2
				</span>
				<span class={isCorrect('2') ? 'text-green-300' : 'text-[var(--color-text)]'}>
					{option2}
				</span>
			</div>
		</div>
	</div>
</div>
