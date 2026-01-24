<!-- ABOUTME: Hestness 2017 paper deep dive on three scaling regions -->
<!-- ABOUTME: Uses shared components for consistent styling -->

<script>
	import { HeroSection, Section, ContentBox, KeyTakeaway } from '$lib/shared';

	const scalingRegions = [
		{
			name: 'Best Guess Region',
			color: 'red',
			description:
				'Model performs at random or baseline level. Insufficient data or compute to learn meaningful patterns.'
		},
		{
			name: 'Power Law Region',
			color: 'primary',
			description:
				'Predictable scaling where loss decreases as a power law. This is where scaling laws are most useful.'
		},
		{
			name: 'Asymptotic Region',
			color: 'green',
			description:
				'Approaching irreducible error (entropy). Returns diminish as model approaches theoretical limit.'
		}
	];

	const keyFindings = [
		{
			title: 'Universal Power Laws',
			content:
				'Across translation, language modeling, image classification, and speech, performance follows power law scaling.'
		},
		{
			title: 'Predictable Exponents',
			content:
				'The power law exponent is consistent within task domains, enabling extrapolation from small-scale experiments.'
		},
		{
			title: 'Task-Dependent Constants',
			content: 'While the functional form is universal, the constants vary by task and dataset.'
		},
		{
			title: 'Architecture Independence',
			content:
				'Different architectures show similar exponents but different constants - better architectures shift the curve.'
		}
	];

	const tasksStudied = [
		{ task: 'Machine Translation', dataset: 'WMT', metric: 'BLEU' },
		{ task: 'Language Modeling', dataset: 'Billion Word', metric: 'Perplexity' },
		{ task: 'Image Classification', dataset: 'ImageNet', metric: 'Top-1 Accuracy' },
		{ task: 'Speech Recognition', dataset: 'WSJ', metric: 'Word Error Rate' }
	];

	const implications = [
		{
			title: 'Resource Planning',
			content: 'Predict how much data/compute is needed to reach a target performance level.'
		},
		{
			title: 'Diminishing Returns',
			content:
				"Understand when you're approaching the asymptotic region where more resources yield little benefit."
		},
		{
			title: 'Architecture Comparison',
			content: 'Compare architectures fairly by measuring the constant factor improvement.'
		}
	];
</script>

<div class="space-y-6">
	<HeroSection icon="📊" title="Hestness 2017: Three Scaling Regions">
		<p class="max-w-3xl leading-relaxed text-[var(--color-muted)] text-[var(--text-body)]">
			The first large-scale empirical study demonstrating that deep learning performance follows
			predictable power law scaling across diverse tasks. Established the foundational observation
			that scaling is predictable.
		</p>
	</HeroSection>

	<!-- Key Paper -->
	<Section title="Paper">
		<ContentBox variant="dark" class="transition-colors hover:border-[var(--color-primary)]/50">
			<a
				href="https://arxiv.org/abs/1712.00409"
				target="_blank"
				rel="noopener noreferrer external"
				class="block"
			>
				<h4 class="mb-1 font-semibold text-[var(--color-primary)] text-[var(--text-body)]">
					Deep Learning Scaling is Predictable, Empirically
				</h4>
				<p class="mb-2 text-[var(--color-accent)] text-[var(--text-small)]">
					Hestness et al. (2017)
				</p>
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">
					First large-scale empirical study showing neural network performance follows predictable
					power law scaling across diverse tasks. Establishes the three scaling regions framework.
				</p>
			</a>
		</ContentBox>
	</Section>

	<!-- Three Scaling Regions -->
	<Section title="Three Scaling Regions">
		<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
			Neural network performance follows a characteristic S-curve pattern on a log-log plot:
		</p>
		<div class="grid gap-4 md:grid-cols-3">
			{#each scalingRegions as region (region.name)}
				<ContentBox
					variant="dark"
					class="border-l-4 {region.color === 'red'
						? 'border-red-500'
						: region.color === 'primary'
							? 'border-[var(--color-primary)]'
							: 'border-green-500'}"
				>
					<div class="mb-2 flex items-center gap-2">
						<span
							class="h-3 w-3 rounded-full {region.color === 'red'
								? 'bg-red-500'
								: region.color === 'primary'
									? 'bg-[var(--color-primary)]'
									: 'bg-green-500'}"
						></span>
						<h4 class="font-semibold text-[var(--color-primary)]">{region.name}</h4>
					</div>
					<p class="text-[var(--color-muted)] text-[var(--text-small)]">{region.description}</p>
				</ContentBox>
			{/each}
		</div>
	</Section>

	<!-- Visual Representation -->
	<Section title="Log-Log Plot Pattern">
		<ContentBox variant="dark">
			<div class="flex h-48 items-end gap-1">
				<div class="flex flex-1 flex-col items-center justify-end">
					<div class="h-8 w-full rounded-t bg-red-500/30"></div>
					<span class="mt-2 text-[var(--color-muted)] text-[var(--text-tiny)]">Best Guess</span>
				</div>
				<div class="flex flex-[3] flex-col items-center justify-end">
					<div
						class="w-full rounded-t bg-[var(--color-primary)]/30"
						style="height: 70%; clip-path: polygon(0 100%, 100% 20%, 100% 100%);"
					></div>
					<span class="mt-2 text-[var(--color-muted)] text-[var(--text-tiny)]"
						>Power Law (Linear on log-log)</span
					>
				</div>
				<div class="flex flex-1 flex-col items-center justify-end">
					<div class="h-32 w-full rounded-t bg-green-500/30"></div>
					<span class="mt-2 text-[var(--color-muted)] text-[var(--text-tiny)]">Asymptotic</span>
				</div>
			</div>
			<div class="mt-4 flex justify-between text-[var(--color-muted)] text-[var(--text-small)]">
				<span>← Less Resources</span>
				<span>More Resources →</span>
			</div>
		</ContentBox>
	</Section>

	<!-- Key Findings -->
	<Section title="Key Findings">
		<div class="grid gap-4 md:grid-cols-2">
			{#each keyFindings as finding (finding.title)}
				<ContentBox variant="dark" class="transition-colors hover:border-[var(--color-primary)]/50">
					<h4 class="mb-2 font-medium text-[var(--color-accent)]">{finding.title}</h4>
					<p class="text-[var(--color-muted)] text-[var(--text-small)]">{finding.content}</p>
				</ContentBox>
			{/each}
		</div>
	</Section>

	<!-- Tasks Studied -->
	<Section title="Tasks Studied">
		<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
			{#each tasksStudied as item (item.task)}
				<ContentBox variant="dark" class="text-center">
					<p class="font-medium text-[var(--color-primary)]">{item.task}</p>
					<p class="text-[var(--color-muted)] text-[var(--text-small)]">{item.dataset}</p>
					<p class="mt-1 text-[var(--color-accent)] text-[var(--text-tiny)]">{item.metric}</p>
				</ContentBox>
			{/each}
		</div>
	</Section>

	<!-- Implications -->
	<Section title="Practical Implications">
		<div class="grid gap-4 md:grid-cols-3">
			{#each implications as item (item.title)}
				<ContentBox variant="dark" class="border border-[var(--color-accent)]/30">
					<h4 class="mb-2 font-medium text-[var(--color-accent)]">{item.title}</h4>
					<p class="text-[var(--color-muted)] text-[var(--text-small)]">{item.content}</p>
				</ContentBox>
			{/each}
		</div>
	</Section>

	<KeyTakeaway
		items={[
			'Three regions: best guess → power law → asymptotic',
			'Power law scaling is universal across diverse ML tasks',
			'Exponents are consistent, enabling prediction from small experiments',
			'Better architectures shift the curve but maintain the same slope'
		]}
	/>
</div>
