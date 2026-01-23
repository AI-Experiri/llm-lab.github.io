<!--
  REAL DATA from HuggingFace API (cimec/lambada - plain_text - test split)
  {
    "text": "in my palm is a clear stone , and inside it is a small ivory statuette . a guardian angel . `` figured if you 're going to be out at night getting hit by cars , you might as well have some backup . '' i look at him , feeling stunned . like this is some sort of sign . but as i stare at harlin , his mouth curved in a confident grin , i do n't care about signs",
    "domain": null
  }
  Note: The task is to predict the last word of the passage
-->
<script>
	let { sample, showAnswer = false } = $props();

	const text = $derived(sample.text || '');
	const domain = $derived(sample.domain || '');

	// Split text to show context and target word
	const words = $derived(text.split(' '));
	const lastWord = $derived(words[words.length - 1] || '');
	const contextWords = $derived(words.slice(0, -1).join(' '));
</script>

<div class="space-y-3">
	{#if domain}
		<div class="flex items-center gap-2">
			<span
				class="rounded-full border border-purple-700/50 bg-purple-900/40 px-2 py-0.5 text-[var(--text-tiny)] text-purple-300"
			>
				{domain}
			</span>
		</div>
	{/if}

	<div class="rounded-lg border-l-4 border-[var(--color-primary)] bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--color-primary)] text-[var(--text-tiny)]">
			Passage (predict the last word)
		</p>
		<p class="leading-relaxed text-[var(--color-text)] text-[var(--text-body)]">
			{contextWords}
			{#if showAnswer}
				<span
					class="ml-1 rounded border border-green-700/50 bg-green-900/40 px-1.5 py-0.5 font-medium text-green-300"
				>
					{lastWord}
				</span>
			{:else}
				<span
					class="ml-1 rounded border border-yellow-700/50 bg-yellow-900/40 px-1.5 py-0.5 font-medium text-yellow-300"
				>
					____
				</span>
			{/if}
		</p>
	</div>

	{#if showAnswer}
		<div class="rounded-lg border border-green-700/50 bg-green-900/20 p-3">
			<p class="mb-1 text-[var(--text-tiny)] text-green-400">Target Word</p>
			<p class="font-medium text-[var(--text-body)] text-green-300">{lastWord}</p>
		</div>
	{/if}
</div>
