<!--
  REAL DATA from HuggingFace API (tasksource/logical-fallacy - default - test split)
  {
    "config": "edu",
    "source_article": "People who drive big cars probably hate the environment.",
    "logical_fallacies": "fallacy of extension"
  }
  Fallacy types include: ad hominem, ad populum, appeal to emotion, circular reasoning,
  equivocation, fallacy of credibility, fallacy of extension, fallacy of logic,
  fallacy of relevance, false causality, false dilemma, faulty generalization, intentional
-->
<script>
	let { sample, showAnswer = false } = $props();

	const text = $derived(sample.source_article || sample['source_article'] || '');
	const fallacy = $derived(sample.logical_fallacies || sample['logical_fallacies'] || '');
	const domain = $derived(sample.config || sample['config'] || '');

	// Fallacy descriptions for context
	const fallacyDescriptions = {
		'ad hominem': 'Attacking the person making the argument rather than the argument itself',
		'ad populum': 'Appealing to popularity or the majority opinion as evidence',
		'appeal to emotion': 'Using emotional manipulation instead of logical reasoning',
		'circular reasoning': 'Using the conclusion as a premise in the argument',
		equivocation: 'Using a word with multiple meanings ambiguously',
		'fallacy of credibility': 'Misusing authority or credentials to support a claim',
		'fallacy of extension': 'Extending an argument beyond its logical scope',
		'fallacy of logic': 'A general error in logical reasoning',
		'fallacy of relevance': 'Using irrelevant information to support a conclusion',
		'false causality': 'Incorrectly attributing cause and effect',
		'false dilemma': 'Presenting only two options when more exist',
		'faulty generalization': 'Making broad conclusions from limited evidence',
		intentional: 'Deliberately misleading reasoning'
	};

	const fallacyDesc = $derived(fallacyDescriptions[fallacy] || '');

	// Color based on fallacy category
	const getFallacyColor = (f) => {
		if (f.includes('ad ')) return 'red';
		if (f.includes('appeal')) return 'orange';
		if (f.includes('false')) return 'yellow';
		if (f.includes('fallacy of')) return 'purple';
		return 'blue';
	};

	const fallacyColor = $derived(getFallacyColor(fallacy));
</script>

<div class="space-y-3">
	{#if domain}
		<div class="text-[var(--text-tiny)]">
			<span class="rounded-full border border-gray-600/50 bg-gray-700/40 px-2 py-0.5 text-gray-300">
				Domain: {domain}
			</span>
		</div>
	{/if}

	<div class="rounded-lg border-l-4 border-blue-500 bg-[var(--color-bg)] p-4">
		<p class="mb-2 text-[var(--text-tiny)] text-blue-400">Statement to Analyze</p>
		<p class="text-[var(--color-text)] text-[var(--text-body)] italic">"{text}"</p>
	</div>

	{#if !showAnswer}
		<div class="rounded-lg border border-yellow-700/50 bg-yellow-900/20 p-3">
			<p class="text-[var(--text-small)] text-yellow-300">
				What logical fallacy does this statement contain?
			</p>
		</div>
	{/if}

	{#if showAnswer}
		<div class="bg-{fallacyColor}-900/20 rounded-lg border p-3 border-{fallacyColor}-700/50">
			<div class="mb-2 flex items-center gap-2">
				<p class="text-[var(--text-tiny)] text-{fallacyColor}-400">Logical Fallacy</p>
				<span
					class="bg-{fallacyColor}-900/40 text-{fallacyColor}-300 rounded-full border px-3 py-1 font-bold text-[var(--text-small)] border-{fallacyColor}-700/50 capitalize"
				>
					{fallacy}
				</span>
			</div>
			{#if fallacyDesc}
				<p class="text-[var(--text-small)] text-{fallacyColor}-300/80">
					{fallacyDesc}
				</p>
			{/if}
		</div>
	{/if}
</div>
