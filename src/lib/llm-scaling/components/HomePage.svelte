<!-- ABOUTME: Overview page for Scaling Lab -->
<!-- ABOUTME: Uses shared components for consistent styling -->

<script>
	import { HeroSection, Section, ContentBox, KeyTakeaway } from '$lib/shared';

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
			url: 'https://stanford-cs336.github.io/spring2025/',
			description: 'Lectures 9 & 11: Scaling Laws'
		},
		{
			title: 'Scaling Laws for Neural Language Models',
			authors: 'Kaplan et al. (2020)',
			url: 'https://arxiv.org/abs/2001.08361'
		},
		{
			title: 'Training Compute-Optimal Large Language Models',
			authors: 'Hoffmann et al. (2022)',
			url: 'https://arxiv.org/abs/2203.15556'
		},
		{
			title: 'Tensor Programs V: Zero-Shot Hyperparameter Transfer',
			authors: 'Yang et al. (2022)',
			url: 'https://arxiv.org/abs/2203.03466'
		},
		{
			title: 'Deep Learning Scaling is Predictable, Empirically',
			authors: 'Hestness et al. (2017)',
			url: 'https://arxiv.org/abs/1712.00409'
		},
		{
			title: "Veritasium: We're Building Computers Wrong",
			url: 'https://www.youtube.com/watch?v=HBluLfX2F_k',
			description: 'Video explaining power laws'
		}
	];
</script>

<div class="space-y-6">
	<HeroSection icon="📊" title="Understanding Scaling Laws">
		<p class="max-w-3xl leading-relaxed text-[var(--color-muted)] text-[var(--text-body)]">
			Scaling laws describe how the performance of language models improves predictably as we
			increase compute, data, and model size. They enable researchers to make informed decisions
			about resource allocation without expensive trial-and-error at scale.
		</p>
		<div class="mt-4 flex flex-wrap gap-3">
			<span
				class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-[var(--color-accent)] text-[var(--text-small)]"
			>
				Power Laws
			</span>
			<span
				class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-[var(--color-accent)] text-[var(--text-small)]"
			>
				Compute-Optimal
			</span>
			<span
				class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-[var(--color-accent)] text-[var(--text-small)]"
			>
				Hyperparameter Transfer
			</span>
		</div>
	</HeroSection>

	<!-- Motivating Question -->
	<Section title="The Core Question">
		<ContentBox variant="dark" class="border-l-4 border-[var(--color-primary)]">
			<p class="font-medium text-[var(--color-text)] text-[var(--text-body)]">
				You have 100,000 H100 GPUs for a month. How do you build the best open-source LLM?
			</p>
		</ContentBox>
		<p class="mt-4 text-[var(--color-muted)] text-[var(--text-small)]">
			Scaling laws provide a principled answer: train small models to learn scaling behavior, then
			extrapolate to determine the optimal model size and data requirements.
		</p>
	</Section>

	<!-- Key Insights Grid -->
	<Section title="Key Insights">
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			{#each keyInsights as insight (insight.title)}
				<ContentBox variant="dark" class="transition-colors hover:border-[var(--color-primary)]/50">
					<div class="flex items-start gap-3">
						<span class="text-2xl">{insight.icon}</span>
						<div>
							<h4 class="mb-1 font-semibold text-[var(--color-text)]">{insight.title}</h4>
							<p class="text-[var(--color-muted)] text-[var(--text-small)]">
								{insight.description}
							</p>
						</div>
					</div>
				</ContentBox>
			{/each}
		</div>
	</Section>

	<!-- Power Law Visualization -->
	<Section title="The Power Law Relationship">
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
			<div>
				<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
					Loss scales as a power law with compute (C), data (D), and model parameters (N):
				</p>
				<ContentBox variant="dark" class="text-center font-mono">
					<p class="text-[var(--color-accent)] text-[var(--text-body)]">
						L(C) = (C<sub>c</sub> / C)<sup>α<sub>C</sub></sup>
					</p>
					<p class="mt-2 text-[var(--color-accent)] text-[var(--text-body)]">
						L(N) = (N<sub>c</sub> / N)<sup>α<sub>N</sub></sup>
					</p>
					<p class="mt-2 text-[var(--color-accent)] text-[var(--text-body)]">
						L(D) = (D<sub>c</sub> / D)<sup>α<sub>D</sub></sup>
					</p>
				</ContentBox>
				<p class="mt-3 text-[var(--color-muted)] text-[var(--text-tiny)]">
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
							<span class="ml-2 text-[var(--color-muted)] text-[var(--text-small)]"
								>- Random/baseline performance</span
							>
						</div>
					</div>
					<div class="flex items-center gap-3">
						<span class="h-3 w-3 rounded-full bg-[var(--color-primary)]"></span>
						<div>
							<span class="font-medium text-[var(--color-text)]">Power Law Region</span>
							<span class="ml-2 text-[var(--color-muted)] text-[var(--text-small)]"
								>- Predictable scaling</span
							>
						</div>
					</div>
					<div class="flex items-center gap-3">
						<span class="h-3 w-3 rounded-full bg-green-500"></span>
						<div>
							<span class="font-medium text-[var(--color-text)]">Asymptotic Region</span>
							<span class="ml-2 text-[var(--color-muted)] text-[var(--text-small)]"
								>- Approaching irreducible error</span
							>
						</div>
					</div>
				</div>
			</div>
		</div>
	</Section>

	<!-- Lecture Coverage -->
	<Section title="What You'll Learn">
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			{#each lectureTopics as lecture (lecture.lecture)}
				<ContentBox variant="dark">
					<h4 class="mb-3 font-semibold text-[var(--color-accent)]">{lecture.lecture}</h4>
					<ul class="space-y-2">
						{#each lecture.topics as topic, i (i)}
							<li
								class="flex items-center gap-2 text-[var(--color-muted)] text-[var(--text-small)]"
							>
								<span class="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]"></span>
								{topic}
							</li>
						{/each}
					</ul>
				</ContentBox>
			{/each}
		</div>
	</Section>

	<!-- Why This Matters -->
	<Section title="Why Scaling Laws Matter">
		<div class="grid grid-cols-1 gap-4 text-[var(--text-small)] md:grid-cols-3">
			<ContentBox variant="dark" class="border border-[var(--color-accent)]/30">
				<h4 class="mb-2 font-medium text-[var(--color-accent)]">Resource Planning</h4>
				<p class="text-[var(--color-muted)]">
					Predict compute, data, and time requirements before committing to expensive training runs.
				</p>
			</ContentBox>
			<ContentBox variant="dark" class="border border-[var(--color-accent)]/30">
				<h4 class="mb-2 font-medium text-[var(--color-accent)]">Architecture Decisions</h4>
				<p class="text-[var(--color-muted)]">
					Choose optimal model width, depth, and batch size based on principled analysis.
				</p>
			</ContentBox>
			<ContentBox variant="dark" class="border border-[var(--color-accent)]/30">
				<h4 class="mb-2 font-medium text-[var(--color-accent)]">Cost Efficiency</h4>
				<p class="text-[var(--color-muted)]">
					Avoid over-training or under-training by finding the compute-optimal balance.
				</p>
			</ContentBox>
		</div>
	</Section>

	<!-- References Section -->
	<Section title="References">
		<ul class="space-y-2 text-[var(--text-small)]">
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
							<span class="text-[var(--color-muted)]"> — {ref.authors}</span>
						{/if}
					</div>
				</li>
			{/each}
		</ul>
	</Section>

	<KeyTakeaway
		items={[
			'Loss follows power laws: L(x) = (x_c / x)^α for compute, data, and model size',
			'Chinchilla ratio: ~20 tokens per parameter for compute-optimal training',
			'muP enables zero-shot hyperparameter transfer from small to large models',
			'Modern labs (Cerebras, MiniCPM, DeepSeek) use scaling laws for efficient training'
		]}
	/>
</div>
