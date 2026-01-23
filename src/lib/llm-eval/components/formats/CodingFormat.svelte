<!--
  REAL DATA from HuggingFace API (openai/openai_humaneval - test split):
  {
    "task_id": "HumanEval/0",
    "prompt": "from typing import List\n\n\ndef has_close_elements(numbers: List[float], threshold: float) -> bool:\n    \"\"\" Check if in given list of numbers, are any two numbers closer to each other than\n    given threshold.\n    >>> has_close_elements([1.0, 2.0, 3.0], 0.5)\n    False\n    >>> has_close_elements([1.0, 2.8, 3.0, 4.0, 5.0, 2.0], 0.3)\n    True\n    \"\"\"\n",
    "canonical_solution": "    for idx, elem in enumerate(numbers):\n        for idx2, elem2 in enumerate(numbers):\n            if idx != idx2:\n                distance = abs(elem - elem2)\n                if distance < threshold:\n                    return True\n\n    return False\n",
    "test": "\n\nMETADATA = {\n    'author': 'jt',\n    'dataset': 'test'\n}\n\n\ndef check(candidate):\n    assert candidate([1.0, 2.0, 3.9, 4.0, 5.0, 2.2], 0.3) == True\n    assert candidate([1.0, 2.0, 3.9, 4.0, 5.0, 2.2], 0.05) == False\n    assert candidate([1.0, 2.0, 5.9, 4.0, 5.0], 0.95) == True\n    assert candidate([1.0, 2.0, 5.9, 4.0, 5.0], 0.8) == False\n    assert candidate([1.0, 2.0, 3.0, 4.0, 5.0, 2.0], 0.1) == True\n    assert candidate([1.1, 2.2, 3.1, 4.1, 5.1], 1.0) == True\n    assert candidate([1.1, 2.2, 3.1, 4.1, 5.1], 0.5) == False\n\n",
    "entry_point": "has_close_elements"
  }
-->
<script>
	let { sample, dataset, showAnswer = true } = $props();

	const fields = $derived(dataset.fields || {});

	// Get prompt/question
	const prompt = $derived(
		sample[fields.prompt] || sample[fields.question] || sample.prompt || sample.question || ''
	);

	// Get solution - may be JSON string for APPS
	function getSolutions() {
		let sol =
			sample[fields.solution] || sample[fields.solutions] || sample.solutions || sample.code || '';
		if (typeof sol === 'string' && sol.startsWith('[')) {
			try {
				const parsed = JSON.parse(sol);
				return Array.isArray(parsed) ? parsed : [sol];
			} catch {
				return [sol];
			}
		}
		return Array.isArray(sol) ? sol : [sol];
	}

	const solutions = $derived(getSolutions());

	// Get test cases
	function getTests() {
		let tests = sample[fields.tests] || sample.test_list || sample.test || '';
		if (typeof tests === 'string' && tests.startsWith('{')) {
			try {
				return JSON.parse(tests);
			} catch {
				return tests;
			}
		}
		return tests;
	}

	const tests = $derived(getTests());

	// Difficulty
	const difficulty = $derived(sample.difficulty || sample[fields.difficulty] || '');

	function getDifficultyColor(diff) {
		const d = diff.toLowerCase();
		if (d === 'introductory' || d === 'easy') return 'green';
		if (d === 'interview' || d === 'medium') return 'yellow';
		if (d === 'competition' || d === 'hard') return 'red';
		return 'gray';
	}
</script>

<div class="space-y-3">
	<!-- Header with difficulty -->
	{#if difficulty}
		{@const color = getDifficultyColor(difficulty)}
		<div class="flex items-center gap-2">
			<span
				class="bg-{color}-900/40 text-{color}-300 rounded-full border px-2 py-0.5 text-[var(--text-tiny)] border-{color}-700/50 capitalize"
			>
				{difficulty}
			</span>
			{#if sample.url}
				<a
					href={sample.url}
					target="_blank"
					rel="noopener noreferrer external"
					class="text-[var(--color-primary)] text-[var(--text-tiny)] transition-colors hover:text-pink-400"
				>
					Source
				</a>
			{/if}
		</div>
	{/if}

	<!-- Problem/Prompt -->
	<div
		class="overflow-hidden rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)]"
	>
		<div
			class="border-b border-[var(--color-secondary)] bg-[var(--color-secondary)]/50 px-3 py-1.5"
		>
			<span class="font-mono text-[var(--text-tiny)] text-green-400">Problem</span>
		</div>
		<pre
			class="max-h-64 overflow-x-auto overflow-y-auto p-3 whitespace-pre-wrap text-[var(--color-text)] text-[var(--text-small)]">{prompt}</pre>
	</div>

	<!-- Solution -->
	{#if showAnswer && solutions.length > 0 && solutions[0]}
		<details class="group">
			<summary
				class="flex cursor-pointer items-center gap-2 text-[var(--color-primary)] text-[var(--text-small)] transition-colors hover:text-pink-400"
			>
				<span class="transition-transform group-open:rotate-90">+</span>
				Show Solution{solutions.length > 1 ? `s (${solutions.length})` : ''}
			</summary>
			<div class="mt-2 overflow-hidden rounded-lg border border-green-900/30 bg-[var(--color-bg)]">
				<div class="border-b border-green-900/30 bg-green-900/20 px-3 py-1.5">
					<span class="font-mono text-[var(--text-tiny)] text-green-400">Solution</span>
				</div>
				<pre
					class="max-h-64 overflow-x-auto overflow-y-auto p-3 text-[var(--text-small)] text-green-300">{solutions[0]}</pre>
			</div>
		</details>
	{/if}

	<!-- Test Cases -->
	{#if showAnswer && tests}
		<details class="group">
			<summary
				class="flex cursor-pointer items-center gap-2 text-[var(--color-primary)] text-[var(--text-small)] transition-colors hover:text-pink-400"
			>
				<span class="transition-transform group-open:rotate-90">+</span>
				Show Tests
			</summary>
			<div class="mt-2 overflow-hidden rounded-lg border border-blue-900/30 bg-[var(--color-bg)]">
				<div class="border-b border-blue-900/30 bg-blue-900/20 px-3 py-1.5">
					<span class="font-mono text-[var(--text-tiny)] text-blue-400">Tests</span>
				</div>
				<pre
					class="max-h-48 overflow-x-auto overflow-y-auto p-3 text-[var(--text-small)] text-blue-300">{typeof tests ===
					'string'
						? tests
						: JSON.stringify(tests, null, 2)}</pre>
			</div>
		</details>
	{/if}
</div>
