<!--
  REAL DATA from HuggingFace API (google-research-datasets/mbpp - full - test split)
  {
    "task_id": 11,
    "text": "Write a python function to remove first and last occurrence of a given character from the string.",
    "code": "def remove_Occ(s,ch): ...",
    "test_list": ["assert remove_Occ(\"hello\",\"l\") == \"heo\"", ...],
    "test_setup_code": "",
    "challenge_test_list": ["assert remove_Occ(\"hellolloll\",\"l\") == \"helollol\"", ...]
  }
-->
<script>
	let { sample, showAnswer = false } = $props();

	const prompt = $derived(sample.text || '');
	const code = $derived(sample.code || '');
	const testList = $derived(sample.test_list || []);
	const challengeTests = $derived(sample.challenge_test_list || []);
</script>

<div class="space-y-3">
	{#if sample.task_id !== undefined}
		<div class="text-[var(--color-muted)] text-[var(--text-tiny)]">Task ID: {sample.task_id}</div>
	{/if}

	<div class="rounded-lg border-l-4 border-[var(--color-primary)] bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--color-primary)] text-[var(--text-tiny)]">Task</p>
		<p class="text-[var(--color-text)] text-[var(--text-body)]">{prompt}</p>
	</div>

	{#if testList.length > 0}
		<div class="rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)] p-3">
			<p class="mb-2 text-[var(--text-tiny)] text-yellow-400">Test Cases ({testList.length})</p>
			<pre
				class="overflow-x-auto font-mono whitespace-pre-wrap text-[var(--color-text)] text-[var(--text-tiny)]">{testList.join(
					'\n'
				)}</pre>
		</div>
	{/if}

	{#if showAnswer && code}
		<div class="rounded-lg border border-green-700/50 bg-green-900/20 p-3">
			<p class="mb-2 text-[var(--text-tiny)] text-green-400">Solution</p>
			<pre
				class="overflow-x-auto font-mono whitespace-pre-wrap text-[var(--text-tiny)] text-green-200">{code}</pre>
		</div>
	{/if}

	{#if showAnswer && challengeTests.length > 0}
		<div class="rounded-lg border border-purple-700/50 bg-purple-900/20 p-3">
			<p class="mb-2 text-[var(--text-tiny)] text-purple-400">
				Challenge Tests ({challengeTests.length})
			</p>
			<pre
				class="overflow-x-auto font-mono whitespace-pre-wrap text-[var(--text-tiny)] text-purple-200">{challengeTests.join(
					'\n'
				)}</pre>
		</div>
	{/if}
</div>
