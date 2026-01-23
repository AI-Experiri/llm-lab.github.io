<!--
  REAL DATA from HuggingFace API (Yusuf5/OpenCaselist - default - train split)
  {
    "tag": "Legalization of organ sales means regulation",
    "cite": "Diamond '13",
    "summary": "A Proposal to Legalize the Sale of Human Organs...",
    "fulltext": "(A TV and radio commercial spokesman...) The David Diamond Plan...",
    "pocket": "1NC",
    "hat": "1NC OFF CASE",
    "tournament": "Kentucky",
    "year": 2014,
    "schoolName": "Baylor",
    "teamDisplayName": "Baylor BaSh",
    "event": "cx",
    "level": "college"
  }
  Dataset contains 465,187 debate evidence documents from NDCA/NDT policy debates (2002-2022)
-->
<script>
	let { sample, showAnswer = false } = $props();

	const tag = $derived(sample.tag || '');
	const cite = $derived(sample.cite || '');
	const summary = $derived(sample.summary || '');
	const spoken = $derived(sample.spoken || '');
	const fulltext = $derived(sample.fulltext || '');
	const pocket = $derived(sample.pocket || '');
	const hat = $derived(sample.hat || '');
	const tournament = $derived(sample.tournament || '');
	const year = $derived(sample.year || '');
	const school = $derived(sample.schoolDisplayName || sample.schoolName || '');
	const team = $derived(sample.teamDisplayName || '');
	const event = $derived(sample.event || '');
	const level = $derived(sample.level || '');

	// Truncate long text
	const truncate = (text, maxLength = 600) => {
		if (!text || text.length <= maxLength) return text;
		return text.substring(0, maxLength) + '...';
	};
</script>

<div class="space-y-3">
	<!-- Metadata badges -->
	<div class="flex flex-wrap gap-2 text-[var(--text-tiny)]">
		{#if year}
			<span class="rounded-full border border-blue-700/50 bg-blue-900/40 px-2 py-0.5 text-blue-300">
				{year}
			</span>
		{/if}
		{#if tournament}
			<span
				class="rounded-full border border-purple-700/50 bg-purple-900/40 px-2 py-0.5 text-purple-300"
			>
				{tournament}
			</span>
		{/if}
		{#if school}
			<span
				class="rounded-full border border-green-700/50 bg-green-900/40 px-2 py-0.5 text-green-300"
			>
				{school}
			</span>
		{/if}
		{#if level}
			<span
				class="rounded-full border border-gray-600/50 bg-gray-700/40 px-2 py-0.5 text-gray-300 capitalize"
			>
				{level}
			</span>
		{/if}
		{#if team}
			<span class="rounded-full border border-teal-700/50 bg-teal-900/40 px-2 py-0.5 text-teal-300">
				{team}
			</span>
		{/if}
		{#if event}
			<span
				class="rounded-full border border-pink-700/50 bg-pink-900/40 px-2 py-0.5 text-pink-300 uppercase"
			>
				{event}
			</span>
		{/if}
		{#if pocket}
			<span
				class="rounded-full border border-amber-700/50 bg-amber-900/40 px-2 py-0.5 text-amber-300"
			>
				{pocket}
			</span>
		{/if}
	</div>

	<!-- Tag (argument claim) -->
	{#if tag}
		<div class="rounded-lg border-l-4 border-yellow-500 bg-[var(--color-bg)] p-3">
			<p class="mb-1 text-[var(--text-tiny)] text-yellow-400">Tag (Argument Claim)</p>
			<p class="font-medium text-[var(--color-text)] text-[var(--text-body)]">{tag}</p>
		</div>
	{/if}

	<!-- Summary/Spoken -->
	{#if summary || spoken}
		<div class="rounded-lg border-l-4 border-blue-500 bg-[var(--color-bg)] p-3">
			<p class="mb-1 text-[var(--text-tiny)] text-blue-400">Summary</p>
			<p class="text-[var(--color-text)] text-[var(--text-body)]">
				{truncate(summary || spoken, 500)}
			</p>
		</div>
	{/if}

	<!-- Citation -->
	{#if cite}
		<div class="text-[var(--color-muted)] text-[var(--text-small)]">
			<span class="text-cyan-400">Citation:</span>
			{cite}
		</div>
	{/if}

	{#if showAnswer}
		<div class="rounded-lg border border-green-700/50 bg-green-900/20 p-3">
			<p class="mb-1 text-[var(--text-tiny)] text-green-400">Full Evidence Text</p>
			<p class="whitespace-pre-wrap text-[var(--color-text)] text-[var(--text-small)]">
				{truncate(fulltext, 1000)}
			</p>
			{#if hat}
				<p class="mt-2 text-[var(--color-muted)] text-[var(--text-tiny)]">
					Section: {hat}
				</p>
			{/if}
		</div>
	{/if}
</div>
