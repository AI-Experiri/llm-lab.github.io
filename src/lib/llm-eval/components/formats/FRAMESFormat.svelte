<!--
  REAL DATA from HuggingFace API (google/frames-benchmark - default - test split)
  {
    "Unnamed: 0": 0,
    "Prompt": "If my future wife has the same first name as the 15th first lady of the United States' mother and her surname is the same as the second assassinated president's mother's maiden name, what is my future wife's name?",
    "Answer": "Jane Ballou",
    "wikipedia_link_1": "https://en.wikipedia.org/wiki/President_of_the_United_States",
    "wikipedia_link_2": "https://en.wikipedia.org/wiki/James_Buchanan",
    ...
    "reasoning_types": "Multiple constraints",
    "wiki_links": "[...]"
  }
-->
<script>
	let { sample, showAnswer = false } = $props();

	const prompt = $derived(sample.Prompt || '');
	const answer = $derived(sample.Answer || '');
	const reasoningTypes = $derived(sample.reasoning_types || '');

	// Collect all wiki links
	const wikiLinks = $derived(() => {
		const links = [];
		for (let i = 1; i <= 11; i++) {
			const link = sample[`wikipedia_link_${i}`];
			if (link) links.push(link);
		}
		return links;
	});
</script>

<div class="space-y-3">
	<div class="flex flex-wrap items-center gap-2">
		{#if reasoningTypes}
			<span
				class="rounded-full border border-orange-700/50 bg-orange-900/40 px-2 py-0.5 text-[var(--text-tiny)] text-orange-300"
			>
				{reasoningTypes}
			</span>
		{/if}
	</div>

	<div class="rounded-lg border-l-4 border-orange-500 bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--text-tiny)] text-orange-400">Question</p>
		<p class="text-[var(--color-text)] text-[var(--text-body)]">{prompt}</p>
	</div>

	{#if showAnswer}
		<div class="rounded-lg border border-green-700/50 bg-green-900/20 p-3">
			<p class="mb-1 text-[var(--text-tiny)] text-green-400">Answer</p>
			<p class="font-medium text-[var(--text-body)] text-green-300">{answer}</p>
		</div>

		{#if wikiLinks().length > 0}
			<div class="rounded-lg border border-blue-700/50 bg-blue-900/20 p-3">
				<p class="mb-2 text-[var(--text-tiny)] text-blue-400">
					Reference Links ({wikiLinks().length})
				</p>
				<div class="flex flex-wrap gap-2">
					{#each wikiLinks() as link, i (link)}
						<a
							href={link}
							target="_blank"
							rel="noopener noreferrer external"
							class="rounded border border-blue-700/50 bg-blue-900/40 px-2 py-0.5 text-[var(--text-tiny)] text-blue-300 transition-colors hover:bg-blue-900/60"
						>
							Wiki {i + 1}
						</a>
					{/each}
				</div>
			</div>
		{/if}
	{/if}
</div>
