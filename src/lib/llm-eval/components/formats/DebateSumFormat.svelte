<!--
  REAL DATA from HuggingFace API (Hellisotherpeople/DebateSum - default - train split)
  {
    "Full-Document": "How does one write the nation's modernity as the event of the everyday...",
    "Citation": "Bhabha 1994 (Homi K. Anne F. Rothenberg Professor of English...)",
    "Extract": "why do nations celebrate their hoariness, not their astonishing youth?...",
    "Abstract": "A) The Affirmatives construction of a \"Nation-Space\" manifests in distinction...",
    "Tag": "Kritiks",
    "DebateCamp": "Gonzaga (GDI)",
    "Year": "2013"
  }
-->
<script>
	let { sample, showAnswer = false } = $props();

	const document = $derived(sample['Full-Document'] || '');
	const citation = $derived(sample['Citation'] || '');
	const extract = $derived(sample['Extract'] || '');
	const abstract = $derived(sample['Abstract'] || '');
	const tag = $derived(sample['Tag'] || '');
	const debateCamp = $derived(sample['DebateCamp'] || '');
	const year = $derived(sample['Year'] || '');

	// Truncate long text for display
	const truncate = (text, maxLength = 500) => {
		if (!text || text.length <= maxLength) return text;
		return text.substring(0, maxLength) + '...';
	};
</script>

<div class="space-y-3">
	<div class="flex flex-wrap gap-2 text-[var(--text-tiny)]">
		{#if tag}
			<span class="rounded-full border border-blue-700/50 bg-blue-900/40 px-2 py-0.5 text-blue-300">
				{tag}
			</span>
		{/if}
		{#if debateCamp}
			<span
				class="rounded-full border border-purple-700/50 bg-purple-900/40 px-2 py-0.5 text-purple-300"
			>
				{debateCamp}
			</span>
		{/if}
		{#if year}
			<span class="rounded-full border border-gray-600/50 bg-gray-700/40 px-2 py-0.5 text-gray-300">
				{year}
			</span>
		{/if}
	</div>

	{#if abstract}
		<div class="rounded-lg border-l-4 border-yellow-500 bg-[var(--color-bg)] p-3">
			<p class="mb-1 text-[var(--text-tiny)] text-yellow-400">Abstract (Argument Summary)</p>
			<p class="text-[var(--color-text)] text-[var(--text-body)]">{abstract}</p>
		</div>
	{/if}

	<div class="rounded-lg border-l-4 border-blue-500 bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--text-tiny)] text-blue-400">Extract (Key Evidence)</p>
		<p class="text-[var(--color-text)] text-[var(--text-body)]">{truncate(extract, 600)}</p>
	</div>

	{#if showAnswer}
		<div class="rounded-lg border border-green-700/50 bg-green-900/20 p-3">
			<p class="mb-1 text-[var(--text-tiny)] text-green-400">Full Document</p>
			<p class="whitespace-pre-wrap text-[var(--color-text)] text-[var(--text-small)]">
				{truncate(document, 800)}
			</p>
			{#if citation}
				<p class="mt-3 text-[var(--color-muted)] text-[var(--text-tiny)] italic">
					Source: {citation}
				</p>
			{/if}
		</div>
	{/if}
</div>
