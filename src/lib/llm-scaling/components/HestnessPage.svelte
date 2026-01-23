<script>
	const keyPaper = {
		title: 'Deep Learning Scaling is Predictable, Empirically',
		authors: 'Hestness et al. (2017)',
		url: 'https://arxiv.org/abs/1712.00409',
		description:
			'First large-scale empirical study showing neural network performance follows predictable power law scaling across diverse tasks'
	};

	const scalingRegions = [
		{
			name: 'Best Guess Region',
			color: 'bg-red-500',
			description:
				'Model performs at random or baseline level. Insufficient data or compute to learn meaningful patterns. Performance is essentially random guessing.'
		},
		{
			name: 'Power Law Region',
			color: 'bg-[var(--color-primary)]',
			description:
				'Predictable scaling where loss decreases as a power law with increased resources. This is where scaling laws are most useful for prediction and planning.'
		},
		{
			name: 'Asymptotic Region',
			color: 'bg-green-500',
			description:
				'Approaching irreducible error (entropy of the data). Returns diminish significantly as model approaches the theoretical limit of the task.'
		}
	];

	const keyFindings = [
		{
			title: 'Universal Power Laws',
			content:
				'Across machine translation, language modeling, image classification, and speech recognition, performance follows power law scaling in the middle region.'
		},
		{
			title: 'Predictable Exponents',
			content:
				'The power law exponent (slope on log-log plot) is relatively consistent within task domains, enabling extrapolation from small-scale experiments.'
		},
		{
			title: 'Task-Dependent Constants',
			content:
				'While the functional form is universal, the constants (intercept, irreducible error) vary by task and dataset.'
		},
		{
			title: 'Architecture Independence',
			content:
				"Different architectures show similar scaling exponents but different constants - better architectures shift the curve but don't change the slope."
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
			content:
				'Compare architectures fairly by measuring the constant factor improvement, not just single-point benchmarks.'
		}
	];
</script>

<div class="space-y-8">
	<!-- Section Header -->
	<section
		class="rounded-2xl border border-[var(--color-primary)]/30 bg-gradient-to-br from-[var(--color-primary)]/20 to-pink-600/20 p-8"
	>
		<div class="flex items-start gap-4">
			<div class="text-4xl">📊</div>
			<div>
				<h2 class="mb-2 font-bold text-[var(--color-text)] text-[var(--text-h2)]">
					Hestness 2017: Three Scaling Regions
				</h2>
				<p class="text-lg text-[var(--color-muted)]">
					The first large-scale empirical study demonstrating that deep learning performance follows
					predictable power law scaling across diverse tasks. Established the foundational
					observation that scaling is predictable.
				</p>
			</div>
		</div>
	</section>

	<!-- Key Paper -->
	<section class="rounded-xl border border-[var(--color-muted)]/20 bg-[var(--color-secondary)] p-6">
		<h3 class="mb-4 text-xl font-semibold text-[var(--color-text)]">Paper</h3>
		<a
			href={keyPaper.url}
			target="_blank"
			rel="noopener noreferrer external"
			class="block rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-4 transition-colors hover:border-[var(--color-primary)]/50"
		>
			<h4 class="font-semibold text-[var(--color-text)]">{keyPaper.title}</h4>
			<p class="text-sm text-[var(--color-muted)]">{keyPaper.authors}</p>
			<p class="mt-2 text-sm text-[var(--color-muted)]">{keyPaper.description}</p>
		</a>
	</section>

	<!-- Three Scaling Regions -->
	<section class="rounded-xl border border-[var(--color-muted)]/20 bg-[var(--color-secondary)] p-6">
		<h3 class="mb-4 text-xl font-semibold text-[var(--color-text)]">Three Scaling Regions</h3>
		<p class="mb-6 text-[var(--color-muted)]">
			Neural network performance follows a characteristic S-curve pattern on a log-log plot as
			resources increase:
		</p>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
			{#each scalingRegions as region (region.name)}
				<div class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-4">
					<div class="mb-3 flex items-center gap-2">
						<span class="h-3 w-3 rounded-full {region.color}"></span>
						<h4 class="font-semibold text-[var(--color-text)]">{region.name}</h4>
					</div>
					<p class="text-sm text-[var(--color-muted)]">{region.description}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- Visual Representation -->
	<section class="rounded-xl border border-[var(--color-muted)]/20 bg-[var(--color-secondary)] p-6">
		<h3 class="mb-4 text-xl font-semibold text-[var(--color-text)]">Log-Log Plot Pattern</h3>
		<div class="rounded-lg bg-[var(--color-bg)] p-6">
			<div class="flex h-48 items-end gap-1">
				<!-- Best Guess Region -->
				<div class="flex flex-1 flex-col items-center justify-end">
					<div class="h-8 w-full rounded-t bg-red-500/30"></div>
					<span class="mt-2 text-xs text-[var(--color-muted)]">Best Guess</span>
				</div>
				<!-- Power Law Region -->
				<div class="flex flex-[3] flex-col items-center justify-end">
					<div
						class="w-full rounded-t bg-[var(--color-primary)]/30"
						style="height: 70%; clip-path: polygon(0 100%, 100% 20%, 100% 100%);"
					></div>
					<span class="mt-2 text-xs text-[var(--color-muted)]">Power Law (Linear on log-log)</span>
				</div>
				<!-- Asymptotic Region -->
				<div class="flex flex-1 flex-col items-center justify-end">
					<div class="h-32 w-full rounded-t bg-green-500/30"></div>
					<span class="mt-2 text-xs text-[var(--color-muted)]">Asymptotic</span>
				</div>
			</div>
			<div class="mt-4 flex justify-between text-sm text-[var(--color-muted)]">
				<span>← Less Resources</span>
				<span>More Resources →</span>
			</div>
		</div>
	</section>

	<!-- Key Findings -->
	<section class="rounded-xl border border-[var(--color-muted)]/20 bg-[var(--color-secondary)] p-6">
		<h3 class="mb-4 text-xl font-semibold text-[var(--color-text)]">Key Findings</h3>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			{#each keyFindings as finding (finding.title)}
				<div class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-4">
					<h4 class="mb-2 font-medium text-[var(--color-accent)]">{finding.title}</h4>
					<p class="text-sm text-[var(--color-muted)]">{finding.content}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- Tasks Studied -->
	<section class="rounded-xl border border-[var(--color-muted)]/20 bg-[var(--color-secondary)] p-6">
		<h3 class="mb-4 text-xl font-semibold text-[var(--color-text)]">Tasks Studied</h3>
		<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
			{#each tasksStudied as item (item.task)}
				<div
					class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-4 text-center"
				>
					<p class="font-medium text-[var(--color-text)]">{item.task}</p>
					<p class="text-sm text-[var(--color-muted)]">{item.dataset}</p>
					<p class="mt-1 text-xs text-[var(--color-accent)]">{item.metric}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- Implications -->
	<section
		class="rounded-xl border border-[var(--color-accent)]/30 bg-gradient-to-r from-[var(--color-accent)]/10 to-[var(--color-primary)]/10 p-6"
	>
		<h3 class="mb-4 text-xl font-semibold text-[var(--color-text)]">Practical Implications</h3>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
			{#each implications as item (item.title)}
				<div>
					<h4 class="mb-2 font-medium text-[var(--color-accent)]">{item.title}</h4>
					<p class="text-sm text-[var(--color-muted)]">{item.content}</p>
				</div>
			{/each}
		</div>
	</section>
</div>
