<!--
  REAL DATA from HuggingFace API (trivia_qa - rc config - validation split):
  {
    "question": "Who was the man behind The Chipmunks?",
    "question_id": "tc_2",
    "question_source": "http://www.triviacountry.com/",
    "entity_pages": {"doc_source": [], "filename": [], "title": [], "wiki_context": []},
    "search_results": {
      "description": ["A struggling songwriter named Dave Seville finds success when he comes across a trio of singing chipmunks...", "The man who brought the Chipmunks to life..."],
      "filename": ["61/61_97.txt", "10/10_99.txt"],
      "rank": [4, 6],
      "title": ["Alvin and the Chipmunks (2007) - IMDb", "The Chipmunks - Biography | Billboard"],
      "url": ["http://www.imdb.com/title/tt0952640/", "http://www.billboard.com/artist/393411/chipmunks/biography"],
      "search_context": ["...long text..."]
    },
    "answer": {
      "aliases": ["David Seville"],
      "normalized_aliases": ["david seville"],
      "matched_wiki_entity_name": "",
      "normalized_value": "david seville",
      "type": "WikipediaEntity",
      "value": "David Seville"
    }
  }

  REAL DATA from HuggingFace API (google-research-datasets/natural_questions - validation split):
  {
    "id": "-8817510910624892182",
    "question": {"text": "what is the lowest recorded temperature on mount vinson", "tokens": ["what", "is", "the", ...]},
    "document": {"html": "...", "title": "Vinson Massif", "tokens": {...}, "url": "..."},
    "annotations": {
      "id": ["1884601184937164176", ...],
      "long_answer": [{"candidate_index": -1, "end_byte": -1, ...}],
      "short_answers": [{"end_byte": [], "end_token": [], "start_byte": [], "start_token": [], "text": []}],
      "yes_no_answer": [-1, -1, -1, -1, -1]
    }
  }
-->
<script>
	let { sample, dataset, showAnswer = true } = $props();

	const fields = $derived(dataset.fields || {});

	// Question field - various naming conventions
	function getQuestion() {
		const q = sample[fields.question] || sample.question || sample.Question || sample.prompt || '';
		// Natural Questions format: {text: "...", tokens: [...]}
		if (q && typeof q === 'object' && q.text) {
			return q.text;
		}
		return String(q || '');
	}
	const question = $derived(getQuestion());

	// Answer field - can be string, object, or nested
	function getAnswer() {
		let ans = sample[fields.answer] || sample.answer || sample.Answer || sample.annotations || '';

		// Handle string directly
		if (typeof ans === 'string') return ans;

		// TriviaQA format: {aliases: [], normalized_aliases: [], value: ""}
		if (ans && typeof ans === 'object') {
			if (ans.value) return ans.value;
			if (ans.aliases && ans.aliases.length > 0) return ans.aliases[0];

			// Natural Questions format: {short_answers: {text: [[...]], ...}, yes_no_answer: [...]}
			if (ans.short_answers) {
				const texts = ans.short_answers.text;
				if (texts && Array.isArray(texts)) {
					// texts is array of arrays: [["answer1"], ["answer2"]]
					const allTexts = texts.flat().filter(Boolean);
					if (allTexts.length > 0) return allTexts.join(', ');
				}
			}
			// Check yes_no_answer (Natural Questions uses 0=NO, 1=YES, -1=NONE)
			if (ans.yes_no_answer && Array.isArray(ans.yes_no_answer)) {
				const yesNo = ans.yes_no_answer.find((v) => v >= 0);
				if (yesNo === 0) return 'No';
				if (yesNo === 1) return 'Yes';
			}

			// Legacy: array of annotation objects
			if (Array.isArray(ans)) {
				const shortAnswers = ans.flatMap((a) => a.short_answers || []);
				if (shortAnswers.length > 0) {
					const docTokens = sample.document?.tokens?.token;
					if (docTokens && Array.isArray(docTokens)) {
						return shortAnswers
							.map((sa) => {
								if (sa.text && sa.text.length > 0) return sa.text.join(' ');
								if (sa.start_token !== undefined && sa.end_token !== undefined) {
									const start = Array.isArray(sa.start_token) ? sa.start_token[0] : sa.start_token;
									const end = Array.isArray(sa.end_token) ? sa.end_token[0] : sa.end_token;
									return docTokens.slice(start, end + 1).join(' ');
								}
								return '';
							})
							.filter(Boolean)
							.join(', ');
					}
				}
				const yesNo = ans.find(
					(a) => a.yes_no_answer && a.yes_no_answer !== 'NONE' && a.yes_no_answer !== -1
				);
				if (yesNo) return yesNo.yes_no_answer === 1 ? 'Yes' : 'No';
			}

			// Fallback: don't return [object Object]
			return '';
		}
		return '';
	}

	// Get all answer aliases for TriviaQA
	function getAliases() {
		const ans = sample.answer;
		if (ans && typeof ans === 'object' && ans.aliases) {
			return ans.aliases.filter((a) => a !== ans.value);
		}
		return [];
	}

	const answer = $derived(getAnswer());
	const aliases = $derived(getAliases());

	// Get search results context (TriviaQA)
	function getSearchResults() {
		const sr = sample.search_results;
		if (!sr || typeof sr !== 'object') return [];

		// TriviaQA has parallel arrays: title[], description[], url[]
		if (sr.title && Array.isArray(sr.title)) {
			return sr.title
				.map((title, i) => ({
					title: title || '',
					description: sr.description?.[i] || '',
					url: sr.url?.[i] || ''
				}))
				.filter((r) => r.title || r.description);
		}
		return [];
	}

	const searchResults = $derived(getSearchResults());

	// Simple context (other formats)
	function getContext() {
		if (typeof sample.context === 'string') return sample.context;
		if (typeof sample.evidence === 'string') return sample.evidence;
		if (typeof sample.document === 'string') return sample.document;
		// Natural Questions: document is an object with title and tokens
		if (sample.document && typeof sample.document === 'object') {
			const doc = sample.document;
			if (doc.title) return `Document: ${doc.title}`;
		}
		return null;
	}
	const simpleContext = $derived(getContext());
</script>

<div class="space-y-3">
	<!-- Question -->
	<div class="rounded-lg border-l-4 border-blue-500 bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--text-tiny)] text-blue-400">Question</p>
		<p class="text-[var(--color-text)] text-[var(--text-body)]">{question}</p>
	</div>

	<!-- Search Results (TriviaQA) -->
	{#if searchResults.length > 0}
		<details class="group">
			<summary
				class="flex cursor-pointer items-center gap-2 text-[var(--color-primary)] text-[var(--text-small)] transition-colors hover:text-pink-400"
			>
				<span class="transition-transform group-open:rotate-90">+</span>
				Evidence ({searchResults.length} sources)
			</summary>
			<div class="mt-2 max-h-64 space-y-2 overflow-y-auto">
				{#each searchResults.slice(0, 5) as result, i (i)}
					<div class="rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)] p-2">
						<p class="font-medium text-[var(--text-tiny)] text-cyan-400">{result.title}</p>
						{#if result.description}
							<p class="mt-1 line-clamp-2 text-[var(--color-muted)] text-[var(--text-tiny)]">
								{result.description}
							</p>
						{/if}
						{#if result.url}
							<a
								href={result.url}
								target="_blank"
								rel="noopener noreferrer external"
								class="mt-1 block truncate text-[10px] text-[var(--color-primary)] hover:text-pink-400"
							>
								{result.url}
							</a>
						{/if}
					</div>
				{/each}
			</div>
		</details>
	{/if}

	<!-- Simple Context (other formats) -->
	{#if simpleContext}
		<details class="group">
			<summary
				class="flex cursor-pointer items-center gap-2 text-[var(--color-primary)] text-[var(--text-small)] transition-colors hover:text-pink-400"
			>
				<span class="transition-transform group-open:rotate-90">+</span>
				Show Context
			</summary>
			<div
				class="mt-2 max-h-48 overflow-y-auto rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)] p-3"
			>
				<p class="whitespace-pre-wrap text-[var(--color-muted)] text-[var(--text-small)]">
					{simpleContext}
				</p>
			</div>
		</details>
	{/if}

	<!-- Answer -->
	{#if showAnswer}
		<div class="rounded-lg border border-green-700/30 bg-green-900/20 p-3">
			<p class="mb-1 text-[var(--text-tiny)] text-green-400">Answer</p>
			{#if answer}
				<p class="font-medium text-[var(--text-body)] text-green-300">{answer}</p>
				{#if aliases.length > 0}
					<p class="mt-1 text-[var(--color-muted)] text-[var(--text-tiny)]">
						Also accepted: {aliases.join(', ')}
					</p>
				{/if}
			{:else}
				<p class="text-[var(--color-muted)] text-[var(--text-body)] italic">No answer available</p>
			{/if}
		</div>
	{/if}
</div>
