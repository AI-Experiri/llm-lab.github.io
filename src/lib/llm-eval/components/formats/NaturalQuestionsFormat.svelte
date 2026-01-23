<!--
  Natural Questions Dataset (Google Research)
  Paper: "Natural Questions: a Benchmark for Question Answering Research" (2019)

  Task: Given a real Google search question and a Wikipedia page, find:
  1. Long answer: The paragraph/table/list containing the answer
  2. Short answer: The exact extractive answer span(s)
  3. Yes/No answer: For polar questions

  HuggingFace format (parallel arrays in annotations):
  {
    "id": "string",
    "question": {"text": "query string", "tokens": ["array", "of", "tokens"]},
    "document": {"title": "Wikipedia Title", "url": "https://...", "html": "...", "tokens": [...]},
    "annotations": {
      "id": ["annotator1_id", "annotator2_id", ...],
      "short_answers": [
        {"text": ["answer1"], "start_token": [...], "end_token": [...], ...},
        {"text": [], ...}  // empty if no short answer
      ],
      "long_answer": [
        {"candidate_index": 5, "start_token": 100, "end_token": 200, ...},
        {"candidate_index": -1, ...}  // -1 if no long answer
      ],
      "yes_no_answer": [1, -1, 0, ...]  // 1=YES, 0=NO, -1=NONE
    }
  }
-->
<script>
	let { sample, showAnswer = true } = $props();

	// Extract question text
	const question = $derived(
		sample.question?.text || (typeof sample.question === 'string' ? sample.question : '')
	);

	// Extract document info
	const docTitle = $derived(sample.document?.title || '');
	const docUrl = $derived(sample.document?.url || '');

	// Parse annotations (HuggingFace uses parallel arrays)
	function parseAnnotations() {
		const ann = sample.annotations;
		if (!ann) return [];

		const ids = ann.id || [];
		const shortAnswers = ann.short_answers || [];
		const longAnswers = ann.long_answer || [];
		const yesNoAnswers = ann.yes_no_answer || [];

		return ids.map((id, i) => ({
			id,
			shortAnswer: extractShortAnswer(shortAnswers[i]),
			hasLongAnswer: longAnswers[i]?.candidate_index >= 0,
			longAnswerTokens: longAnswers[i],
			yesNo: parseYesNo(yesNoAnswers[i])
		}));
	}

	function extractShortAnswer(sa) {
		if (!sa) return null;
		// text is an array of answer strings
		const texts = sa.text || [];
		if (Array.isArray(texts) && texts.length > 0) {
			const filtered = texts.filter((t) => t && t.length > 0);
			if (filtered.length > 0) return filtered;
		}
		return null;
	}

	function parseYesNo(val) {
		if (val === 1) return 'Yes';
		if (val === 0) return 'No';
		return null;
	}

	const annotations = $derived(parseAnnotations());

	// Get consensus answer (most common among annotators)
	function getConsensusAnswer() {
		const validAnnotations = annotations.filter((a) => a.shortAnswer || a.yesNo);
		if (validAnnotations.length === 0) return { type: 'none', value: null };

		// Check for yes/no answers first
		const yesNoAnswers = annotations.filter((a) => a.yesNo).map((a) => a.yesNo);
		if (yesNoAnswers.length > 0) {
			const counts = yesNoAnswers.reduce((acc, v) => {
				acc[v] = (acc[v] || 0) + 1;
				return acc;
			}, {});
			const majority = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
			if (majority)
				return {
					type: 'yesno',
					value: majority[0],
					agreement: majority[1],
					total: yesNoAnswers.length
				};
		}

		// Check for short answers
		const shortAnswers = annotations
			.filter((a) => a.shortAnswer)
			.map((a) => a.shortAnswer.join(', '));
		if (shortAnswers.length > 0) {
			// Return the first valid short answer (they're often the same)
			const uniqueAnswers = [...new Set(shortAnswers)];
			return {
				type: 'short',
				value: shortAnswers[0],
				allAnswers: uniqueAnswers,
				agreement: shortAnswers.length,
				total: annotations.length
			};
		}

		return { type: 'none', value: null };
	}

	const consensus = $derived(getConsensusAnswer());

	// Count annotation stats
	const annotationStats = $derived(() => {
		const total = annotations.length;
		const withShort = annotations.filter((a) => a.shortAnswer).length;
		const withLong = annotations.filter((a) => a.hasLongAnswer).length;
		const withYesNo = annotations.filter((a) => a.yesNo).length;
		const noAnswer = annotations.filter((a) => !a.shortAnswer && !a.yesNo).length;
		return { total, withShort, withLong, withYesNo, noAnswer };
	});

	// Extract long answer context from document tokens
	function getLongAnswerContext() {
		const firstWithLong = annotations.find((a) => a.hasLongAnswer);
		if (!firstWithLong || !sample.document?.tokens) return null;

		const tokens = sample.document.tokens;
		const la = firstWithLong.longAnswerTokens;

		// tokens can be object with token array or array directly
		const tokenList = tokens.token || tokens;
		if (!Array.isArray(tokenList)) return null;

		const start = la.start_token;
		const end = la.end_token;
		if (start < 0 || end < 0) return null;

		// Extract tokens, filtering out HTML tags
		const isHtmlList = tokens.is_html || [];
		const contextTokens = [];
		for (let i = start; i < Math.min(end, start + 200); i++) {
			// Limit to 200 tokens
			if (!isHtmlList[i]) {
				contextTokens.push(tokenList[i]);
			}
		}
		return contextTokens.join(' ').replace(/\s+/g, ' ').trim();
	}

	const longAnswerContext = $derived(getLongAnswerContext());
</script>

<div class="space-y-3">
	<!-- Question -->
	<div class="rounded-lg border-l-4 border-blue-500 bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--text-tiny)] text-blue-400">Google Search Query</p>
		<p class="text-[var(--color-text)] text-[var(--text-body)]">{question}</p>
	</div>

	<!-- Wikipedia Source -->
	{#if docTitle}
		<div class="flex flex-wrap items-center gap-2">
			<span
				class="rounded bg-[#1a1a2e] px-2 py-1 text-[var(--color-muted)] text-[var(--text-tiny)]"
			>
				Wikipedia Source
			</span>
			<span class="font-medium text-[var(--text-small)] text-cyan-400">{docTitle}</span>
			{#if docUrl}
				<a
					href={docUrl}
					target="_blank"
					rel="noopener noreferrer external"
					class="max-w-xs truncate text-[var(--color-primary)] text-[var(--text-tiny)] hover:text-pink-400"
				>
					[link]
				</a>
			{/if}
		</div>
	{/if}

	<!-- Answer Section -->
	{#if showAnswer}
		<!-- Consensus Answer -->
		<div class="rounded-lg border border-green-700/30 bg-green-900/20 p-3">
			<div class="mb-2 flex items-center gap-2">
				<p class="text-[var(--text-tiny)] text-green-400">Answer</p>
				{#if consensus.agreement && consensus.total}
					<span class="rounded bg-green-800/50 px-1.5 py-0.5 text-[10px] text-green-300">
						{consensus.agreement}/{consensus.total} annotators agree
					</span>
				{/if}
			</div>

			{#if consensus.type === 'yesno'}
				<div class="flex items-center gap-2">
					<span
						class="bg-{consensus.value === 'Yes'
							? 'green'
							: 'red'}-600 rounded-full px-3 py-1 font-bold text-[var(--text-small)] text-white"
					>
						{consensus.value}
					</span>
					<span class="text-[var(--color-muted)] text-[var(--text-tiny)]">(Yes/No Question)</span>
				</div>
			{:else if consensus.type === 'short'}
				<p class="font-medium text-[var(--text-body)] text-green-300">{consensus.value}</p>
				{#if consensus.allAnswers && consensus.allAnswers.length > 1}
					<p class="mt-1 text-[var(--color-muted)] text-[var(--text-tiny)]">
						Variants: {consensus.allAnswers.slice(1).join(' | ')}
					</p>
				{/if}
			{:else}
				<p class="text-[var(--color-muted)] text-[var(--text-body)] italic">
					No short answer (may require reading the full paragraph)
				</p>
			{/if}
		</div>

		<!-- Long Answer Context -->
		{#if longAnswerContext}
			<details class="group">
				<summary
					class="flex cursor-pointer items-center gap-2 text-[var(--color-primary)] text-[var(--text-small)] transition-colors hover:text-pink-400"
				>
					<span class="transition-transform group-open:rotate-90">▶</span>
					Long Answer Context (Wikipedia Paragraph)
				</summary>
				<div
					class="mt-2 max-h-48 overflow-y-auto rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)] p-3"
				>
					<p class="leading-relaxed text-[var(--color-text)] text-[var(--text-small)]">
						{longAnswerContext}
					</p>
				</div>
			</details>
		{/if}

		<!-- Annotation Details -->
		{#if annotationStats().total > 0}
			<details class="group">
				<summary
					class="flex cursor-pointer items-center gap-2 text-[var(--color-muted)] text-[var(--text-tiny)] transition-colors hover:text-[var(--color-text)]"
				>
					<span class="transition-transform group-open:rotate-90">▶</span>
					Annotation Details ({annotationStats().total} annotators)
				</summary>
				<div
					class="mt-2 rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)] p-3"
				>
					<div class="grid grid-cols-2 gap-2 text-[var(--text-tiny)] sm:grid-cols-4">
						<div class="rounded bg-[var(--color-secondary)] p-2">
							<p class="text-[var(--color-muted)]">Short Answers</p>
							<p class="font-medium text-green-400">{annotationStats().withShort}</p>
						</div>
						<div class="rounded bg-[var(--color-secondary)] p-2">
							<p class="text-[var(--color-muted)]">Long Answers</p>
							<p class="font-medium text-blue-400">{annotationStats().withLong}</p>
						</div>
						<div class="rounded bg-[var(--color-secondary)] p-2">
							<p class="text-[var(--color-muted)]">Yes/No</p>
							<p class="font-medium text-yellow-400">{annotationStats().withYesNo}</p>
						</div>
						<div class="rounded bg-[var(--color-secondary)] p-2">
							<p class="text-[var(--color-muted)]">No Answer</p>
							<p class="font-medium text-red-400">{annotationStats().noAnswer}</p>
						</div>
					</div>

					<!-- Individual annotations -->
					<div class="mt-3 space-y-1">
						{#each annotations as ann, i (i)}
							<div
								class="flex items-center gap-2 border-b border-[var(--color-secondary)] py-1 text-[var(--text-tiny)] last:border-0"
							>
								<span class="w-6 text-[var(--color-muted)]">#{i + 1}</span>
								{#if ann.shortAnswer}
									<span class="text-green-400">{ann.shortAnswer.join(', ')}</span>
								{:else if ann.yesNo}
									<span class="text-yellow-400">{ann.yesNo}</span>
								{:else}
									<span class="text-red-400 italic">No answer found</span>
								{/if}
								{#if ann.hasLongAnswer}
									<span class="text-[10px] text-blue-400">[has context]</span>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			</details>
		{/if}
	{/if}
</div>
