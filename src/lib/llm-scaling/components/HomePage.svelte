<script>
	const keyInsights = [
		{
			title: 'Predictability',
			description:
				'Loss scales as a power law with compute, data, and model size. Small-scale experiments reliably predict large-scale behavior.',
			icon: '📈'
		},
		{
			title: 'Efficiency',
			description:
				'Train small surrogate models to learn scaling behavior, then extrapolate to large models rather than brute-force hyperparameter tuning.',
			icon: '⚡'
		},
		{
			title: 'Trade-offs',
			description:
				'Given fixed compute, there is an optimal way to trade off model size vs. training data. The Chinchilla ratio suggests ~20 tokens per parameter.',
			icon: '⚖️'
		},
		{
			title: 'Practical Impact',
			description:
				'Modern LLMs like Llama 3, DeepSeek, and MiniCPM use scaling laws to make informed decisions about model architecture and training.',
			icon: '🚀'
		}
	];

	const motivatingQuestion = {
		title: 'The Core Question',
		scenario: 'You have 100,000 H100 GPUs for a month. How do you build the best open-source LLM?',
		insight:
			'Scaling laws provide a principled answer: train small models to learn scaling behavior, then extrapolate to determine the optimal model size and data requirements.'
	};

	const lectureTopics = [
		{
			lecture: 'Foundations',
			topics: [
				'Historical context and motivation',
				'Data scaling laws',
				'Model scaling laws',
				'Power law relationships'
			]
		},
		{
			lecture: 'Practical Strategies',
			topics: [
				'Chinchilla and joint scaling',
				'muP (Maximum Update Parametrization)',
				'Case studies: Cerebras-GPT, MiniCPM, DeepSeek',
				'Learning rate schedules'
			]
		}
	];

	const references = [
		{
			title: 'Stanford CS336: Language Modeling from Scratch',
			url: 'https://web.stanford.edu/class/cs336/',
			description: 'Spring 2025 course covering scaling laws in Lectures 9 and 11'
		},
		{
			title: 'Scaling Laws for Neural Language Models',
			authors: 'Kaplan et al. (2020)',
			url: 'https://arxiv.org/abs/2001.08361',
			description: 'Foundational OpenAI paper establishing scaling law relationships'
		},
		{
			title: 'Training Compute-Optimal Large Language Models',
			authors: 'Hoffmann et al. (2022)',
			url: 'https://arxiv.org/abs/2203.15556',
			description: 'The Chinchilla paper on compute-optimal training'
		},
		{
			title:
				'Tensor Programs V: Tuning Large Neural Networks via Zero-Shot Hyperparameter Transfer',
			authors: 'Yang et al. (2022)',
			url: 'https://arxiv.org/abs/2203.03466',
			description: 'The muP paper on hyperparameter transfer across scales'
		},
		{
			title: 'Deep Learning Scaling is Predictable, Empirically',
			authors: 'Hestness et al. (2017)',
			url: 'https://arxiv.org/abs/1712.00409',
			description: 'Early large-scale neural network scaling study'
		}
	];
</script>

<div class="space-y-8">
	<!-- Hero Section -->
	<section
		class="rounded-2xl border border-[var(--color-primary)]/30 bg-gradient-to-br from-[var(--color-primary)]/20 to-pink-600/20 p-8"
	>
		<div class="flex items-start gap-4">
			<div class="text-4xl">📊</div>
			<div>
				<h2 class="mb-2 font-bold text-[var(--color-text)] text-[var(--text-h2)]">
					Understanding Scaling Laws
				</h2>
				<p class="text-lg text-[var(--color-muted)]">
					Scaling laws describe how the performance of language models improves predictably as we
					increase compute, data, and model size. They enable researchers to make informed decisions
					about resource allocation without expensive trial-and-error at scale.
				</p>
			</div>
		</div>
	</section>

	<!-- Motivating Question -->
	<section class="rounded-xl border border-[var(--color-muted)]/20 bg-[var(--color-secondary)] p-6">
		<h3 class="mb-4 text-xl font-semibold text-[var(--color-accent)]">
			{motivatingQuestion.title}
		</h3>
		<div class="mb-4 rounded-lg border-l-4 border-[var(--color-primary)] bg-[var(--color-bg)] p-4">
			<p class="text-lg font-medium text-[var(--color-text)]">{motivatingQuestion.scenario}</p>
		</div>
		<p class="text-[var(--color-muted)]">{motivatingQuestion.insight}</p>
	</section>

	<!-- Key Insights Grid -->
	<section>
		<h3 class="mb-4 text-xl font-semibold text-[var(--color-text)]">Key Insights</h3>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			{#each keyInsights as insight (insight.title)}
				<div
					class="rounded-xl border border-[var(--color-muted)]/20 bg-[var(--color-secondary)] p-5 transition-colors hover:border-[var(--color-primary)]/50"
				>
					<div class="flex items-start gap-3">
						<span class="text-2xl">{insight.icon}</span>
						<div>
							<h4 class="mb-1 font-semibold text-[var(--color-text)]">{insight.title}</h4>
							<p class="text-sm text-[var(--color-muted)]">{insight.description}</p>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Power Law Visualization -->
	<section class="rounded-xl border border-[var(--color-muted)]/20 bg-[var(--color-secondary)] p-6">
		<h3 class="mb-4 text-xl font-semibold text-[var(--color-text)]">The Power Law Relationship</h3>
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
			<div>
				<p class="mb-4 text-[var(--color-muted)]">
					Loss scales as a power law with compute (C), data (D), and model parameters (N):
				</p>
				<div class="rounded-lg bg-[var(--color-bg)] p-4 text-center font-mono">
					<p class="text-lg text-[var(--color-accent)]">
						L(C) = (C<sub>c</sub> / C)<sup>α<sub>C</sub></sup>
					</p>
					<p class="mt-2 text-lg text-[var(--color-accent)]">
						L(N) = (N<sub>c</sub> / N)<sup>α<sub>N</sub></sup>
					</p>
					<p class="mt-2 text-lg text-[var(--color-accent)]">
						L(D) = (D<sub>c</sub> / D)<sup>α<sub>D</sub></sup>
					</p>
				</div>
				<p class="mt-3 text-sm text-[var(--color-muted)]">
					Where α values represent the scaling exponents (typically 0.05-0.13 for language models).
				</p>
			</div>
			<div>
				<h4 class="mb-3 font-semibold text-[var(--color-text)]">Three Scaling Regions</h4>
				<div class="space-y-3">
					<div class="flex items-center gap-3">
						<span class="h-3 w-3 rounded-full bg-red-500"></span>
						<div>
							<span class="font-medium text-[var(--color-text)]">Best Guess Region</span>
							<span class="ml-2 text-sm text-[var(--color-muted)]"
								>- Random/baseline performance</span
							>
						</div>
					</div>
					<div class="flex items-center gap-3">
						<span class="h-3 w-3 rounded-full bg-[var(--color-primary)]"></span>
						<div>
							<span class="font-medium text-[var(--color-text)]">Power Law Region</span>
							<span class="ml-2 text-sm text-[var(--color-muted)]">- Predictable scaling</span>
						</div>
					</div>
					<div class="flex items-center gap-3">
						<span class="h-3 w-3 rounded-full bg-green-500"></span>
						<div>
							<span class="font-medium text-[var(--color-text)]">Asymptotic Region</span>
							<span class="ml-2 text-sm text-[var(--color-muted)]"
								>- Approaching irreducible error</span
							>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Lecture Coverage -->
	<section>
		<h3 class="mb-4 text-xl font-semibold text-[var(--color-text)]">What You'll Learn</h3>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			{#each lectureTopics as lecture (lecture.lecture)}
				<div
					class="rounded-xl border border-[var(--color-muted)]/20 bg-[var(--color-secondary)] p-5"
				>
					<h4 class="mb-3 font-semibold text-[var(--color-accent)]">{lecture.lecture}</h4>
					<ul class="space-y-2">
						{#each lecture.topics as topic, i (i)}
							<li class="flex items-center gap-2 text-[var(--color-muted)]">
								<span class="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]"></span>
								{topic}
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	</section>

	<!-- Why This Matters -->
	<section
		class="rounded-xl border border-[var(--color-accent)]/30 bg-gradient-to-r from-[var(--color-accent)]/10 to-[var(--color-primary)]/10 p-6"
	>
		<h3 class="mb-3 text-xl font-semibold text-[var(--color-text)]">Why Scaling Laws Matter</h3>
		<div class="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
			<div>
				<h4 class="mb-2 font-medium text-[var(--color-accent)]">Resource Planning</h4>
				<p class="text-[var(--color-muted)]">
					Predict compute, data, and time requirements before committing to expensive training runs.
				</p>
			</div>
			<div>
				<h4 class="mb-2 font-medium text-[var(--color-accent)]">Architecture Decisions</h4>
				<p class="text-[var(--color-muted)]">
					Choose optimal model width, depth, and batch size based on principled analysis.
				</p>
			</div>
			<div>
				<h4 class="mb-2 font-medium text-[var(--color-accent)]">Cost Efficiency</h4>
				<p class="text-[var(--color-muted)]">
					Avoid over-training or under-training by finding the compute-optimal balance.
				</p>
			</div>
		</div>
	</section>

	<!-- References Section -->
	<section class="rounded-xl border border-[var(--color-muted)]/20 bg-[var(--color-secondary)] p-6">
		<h3 class="mb-4 text-xl font-semibold text-[var(--color-text)]">References</h3>
		<ol class="space-y-2">
			{#each references as ref, i (ref.title)}
				<li class="flex items-start gap-3">
					<span class="font-medium text-[var(--color-primary)]">{i + 1}.</span>
					<div>
						<a
							href={ref.url}
							target="_blank"
							rel="noopener noreferrer external"
							class="text-[var(--color-accent)] hover:underline"
						>
							{ref.title}
						</a>
						{#if ref.authors}
							<span class="text-sm text-[var(--color-muted)]"> — {ref.authors}</span>
						{/if}
					</div>
				</li>
			{/each}
		</ol>
	</section>
</div>
