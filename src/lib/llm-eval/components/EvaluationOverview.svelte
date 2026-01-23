<script>
	// Overview of LLM evaluation datasets
</script>

<section class="mb-6 rounded-lg bg-[var(--color-surface)] p-4 md:p-6">
	<h2 class="mb-4 font-semibold text-[var(--color-primary)] text-[var(--text-h2)]">
		Exploring LLM Evaluation Datasets
	</h2>

	<div class="mb-6 rounded bg-[var(--color-secondary)] p-4">
		<p class="text-[var(--color-text)] text-[var(--text-body)]">
			This tool lets you explore the actual questions and tasks used to evaluate Large Language
			Models. Browse different evaluation datasets to understand <strong
				>what kinds of problems</strong
			>
			LLMs are tested on and <strong>what makes these evaluations challenging</strong>.
		</p>
	</div>

	<h3 class="mb-3 font-semibold text-[var(--color-primary)] text-[var(--text-h3)]">
		Types of Evaluation Data
	</h3>

	<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
		<div class="rounded bg-[var(--color-secondary)] p-3">
			<div class="mb-2 flex items-center gap-2">
				<span class="h-3 w-3 rounded-full bg-purple-600"></span>
				<span class="font-medium">Knowledge Questions</span>
			</div>
			<p class="text-[var(--color-muted)] text-[var(--text-small)]">
				Multiple-choice questions testing factual knowledge across academic subjects like science,
				history, and medicine.
			</p>
		</div>

		<div class="rounded bg-[var(--color-secondary)] p-3">
			<div class="mb-2 flex items-center gap-2">
				<span class="h-3 w-3 rounded-full bg-blue-600"></span>
				<span class="font-medium">Reasoning Problems</span>
			</div>
			<p class="text-[var(--color-muted)] text-[var(--text-small)]">
				Logic puzzles, common sense questions, and multi-step reasoning tasks that test thinking
				ability.
			</p>
		</div>

		<div class="rounded bg-[var(--color-secondary)] p-3">
			<div class="mb-2 flex items-center gap-2">
				<span class="h-3 w-3 rounded-full bg-green-600"></span>
				<span class="font-medium">Coding Tasks</span>
			</div>
			<p class="text-[var(--color-muted)] text-[var(--text-small)]">
				Programming problems with function signatures, docstrings, and test cases to verify
				correctness.
			</p>
		</div>

		<div class="rounded bg-[var(--color-secondary)] p-3">
			<div class="mb-2 flex items-center gap-2">
				<span class="h-3 w-3 rounded-full bg-yellow-600"></span>
				<span class="font-medium">Math Word Problems</span>
			</div>
			<p class="text-[var(--color-muted)] text-[var(--text-small)]">
				From grade-school arithmetic to competition-level mathematics requiring step-by-step
				solutions.
			</p>
		</div>

		<div class="rounded bg-[var(--color-secondary)] p-3">
			<div class="mb-2 flex items-center gap-2">
				<span class="h-3 w-3 rounded-full bg-red-600"></span>
				<span class="font-medium">Safety Prompts</span>
			</div>
			<p class="text-[var(--color-muted)] text-[var(--text-small)]">
				Questions testing whether models refuse harmful requests and provide accurate,
				non-misleading information.
			</p>
		</div>

		<div class="rounded bg-[var(--color-secondary)] p-3">
			<div class="mb-2 flex items-center gap-2">
				<span class="h-3 w-3 rounded-full bg-cyan-600"></span>
				<span class="font-medium">Agent Tasks</span>
			</div>
			<p class="text-[var(--color-muted)] text-[var(--text-small)]">
				Multi-step instructions for navigating websites, using tools, or completing real-world
				tasks.
			</p>
		</div>
	</div>

	<div class="mt-4 text-[var(--color-muted)] text-[var(--text-small)] italic">
		Select a dataset below to view sample questions and understand how LLMs are evaluated.
	</div>
</section>
