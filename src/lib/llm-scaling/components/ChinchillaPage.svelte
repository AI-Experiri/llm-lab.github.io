<script>
	const keyPapers = [
		{
			title: 'Training Compute-Optimal Large Language Models',
			authors: 'Hoffmann et al. (2022)',
			url: 'https://arxiv.org/abs/2203.15556',
			description:
				'The Chinchilla paper - showed most LLMs were undertrained and proposed compute-optimal training'
		},
		{
			title: 'Scaling Laws for Neural Language Models',
			authors: 'Kaplan et al. (2020)',
			url: 'https://arxiv.org/abs/2001.08361',
			description: 'Original OpenAI scaling laws paper that Chinchilla builds upon'
		}
	];

	const jointScalingFormula = {
		main: 'L(N, D) = E + A/N^α + B/D^β',
		where: [
			{ symbol: 'E', meaning: 'Irreducible loss (entropy of data)' },
			{ symbol: 'A, B', meaning: 'Scaling constants' },
			{ symbol: 'α', meaning: 'Model scaling exponent (~0.34)' },
			{ symbol: 'β', meaning: 'Data scaling exponent (~0.28)' }
		]
	};

	const threeMethods = [
		{
			name: 'Method 1: Minimum Envelope',
			description:
				'Overlay all training curves (loss vs. FLOPs for different model sizes), then extract the lower envelope to find optimal model size for each compute budget.',
			pros: ['Simple to implement', 'Visual intuition'],
			cons: ['Requires many full training runs', 'Noisy at boundaries']
		},
		{
			name: 'Method 2: IsoFLOP Analysis',
			description:
				'Fix compute budget, vary model size and data. Find the model size that minimizes loss for each fixed compute level.',
			pros: ['Directly answers the optimization question', 'Fewer assumptions'],
			cons: ['Requires training to completion at each point', 'Expensive grid search']
		},
		{
			name: 'Method 3: Curve Fitting',
			description:
				'Fit a joint 3D surface of loss as a function of both model size and data: L(N, D) = E + A/N^α + B/D^β',
			pros: ['Most data-efficient', 'Can extrapolate beyond observed points'],
			cons: ['Assumes functional form', 'Sensitive to fit quality']
		}
	];

	const modelComparisons = [
		{
			model: 'GPT-3',
			params: '175B',
			tokens: '300B',
			ratio: '1.7x',
			status: 'Undertrained',
			year: '2020'
		},
		{
			model: 'Chinchilla',
			params: '70B',
			tokens: '1.4T',
			ratio: '20x',
			status: 'Optimal',
			year: '2022'
		},
		{
			model: 'Llama 2',
			params: '70B',
			tokens: '2T',
			ratio: '29x',
			status: 'Over-trained',
			year: '2023'
		},
		{
			model: 'Llama 3',
			params: '70B',
			tokens: '15T',
			ratio: '214x',
			status: 'Highly over-trained',
			year: '2024'
		}
	];

	const evolutionInsights = [
		{
			title: 'Post-Chinchilla Shift',
			content:
				'Modern models intentionally over-train relative to Chinchilla optimal because inference cost dominates. Smaller, better-trained models are cheaper to deploy.'
		},
		{
			title: 'Data Quality Matters',
			content:
				'Higher quality data allows higher token-to-parameter ratios. The effective "Chinchilla ratio" depends on data quality and curation.'
		},
		{
			title: 'Inference-Time Compute',
			content:
				'Training-time optimality (Chinchilla) differs from deployment optimality. Total cost = training cost + (inference cost × number of queries).'
		}
	];
</script>

<div class="space-y-8">
	<!-- Section Header -->
	<section
		class="rounded-2xl border border-[var(--color-primary)]/30 bg-gradient-to-br from-[var(--color-primary)]/20 to-pink-600/20 p-8"
	>
		<div class="flex items-start gap-4">
			<div class="text-4xl">🐭</div>
			<div>
				<h2 class="mb-2 font-bold text-[var(--color-text)] text-[var(--text-h2)]">
					Chinchilla: Compute-Optimal Training
				</h2>
				<p class="text-lg text-[var(--color-muted)]">
					The Chinchilla paper (Hoffmann et al., 2022) revealed that most large language models were
					significantly undertrained. It established the principle of compute-optimal training: for
					a fixed compute budget, there's an optimal balance between model size and training data.
				</p>
			</div>
		</div>
	</section>

	<!-- Key Papers -->
	<section class="rounded-xl border border-[var(--color-muted)]/20 bg-[var(--color-secondary)] p-6">
		<h3 class="mb-4 text-xl font-semibold text-[var(--color-text)]">Key Papers</h3>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			{#each keyPapers as paper (paper.title)}
				<a
					href={paper.url}
					target="_blank"
					rel="noopener noreferrer external"
					class="block rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-4 transition-colors hover:border-[var(--color-primary)]/50"
				>
					<h4 class="font-semibold text-[var(--color-text)]">{paper.title}</h4>
					<p class="text-sm text-[var(--color-muted)]">{paper.authors}</p>
					<p class="mt-2 text-sm text-[var(--color-muted)]">{paper.description}</p>
				</a>
			{/each}
		</div>
	</section>

	<!-- The Core Problem -->
	<section class="rounded-xl border border-[var(--color-muted)]/20 bg-[var(--color-secondary)] p-6">
		<h3 class="mb-4 text-xl font-semibold text-[var(--color-text)]">The Core Problem</h3>
		<div class="mb-4 rounded-lg border-l-4 border-[var(--color-primary)] bg-[var(--color-bg)] p-4">
			<p class="text-lg font-medium text-[var(--color-text)]">
				Given a fixed compute budget C, how should we allocate between model size N and training
				tokens D?
			</p>
		</div>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div class="rounded-lg bg-[var(--color-bg)] p-4">
				<h4 class="mb-2 font-medium text-[var(--color-accent)]">Constraint</h4>
				<p class="text-center font-mono text-lg text-[var(--color-muted)]">C ≈ 6 × N × D</p>
				<p class="mt-2 text-sm text-[var(--color-muted)]">
					Total FLOPs is proportional to model size times tokens.
				</p>
			</div>
			<div class="rounded-lg bg-[var(--color-bg)] p-4">
				<h4 class="mb-2 font-medium text-[var(--color-accent)]">Goal</h4>
				<p class="text-center font-mono text-lg text-[var(--color-muted)]">min L(N, D)</p>
				<p class="mt-2 text-sm text-[var(--color-muted)]">
					Minimize loss subject to compute constraint.
				</p>
			</div>
		</div>
	</section>

	<!-- Joint Scaling Law -->
	<section class="rounded-xl border border-[var(--color-muted)]/20 bg-[var(--color-secondary)] p-6">
		<h3 class="mb-4 text-xl font-semibold text-[var(--color-text)]">Joint Scaling Law</h3>
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
			<div>
				<div class="mb-4 rounded-lg bg-[var(--color-bg)] p-4">
					<p class="text-center font-mono text-xl text-[var(--color-accent)]">
						{jointScalingFormula.main}
					</p>
				</div>
				<div class="space-y-2">
					{#each jointScalingFormula.where as item (item.symbol)}
						<div class="flex gap-3 text-sm">
							<span class="w-12 font-mono font-bold text-[var(--color-accent)]">{item.symbol}</span>
							<span class="text-[var(--color-muted)]">{item.meaning}</span>
						</div>
					{/each}
				</div>
			</div>
			<div class="rounded-lg bg-[var(--color-bg)] p-4">
				<h4 class="mb-3 font-medium text-[var(--color-text)]">The Chinchilla Result</h4>
				<div class="space-y-3">
					<div class="flex items-center gap-3">
						<span class="h-2 w-2 rounded-full bg-[var(--color-primary)]"></span>
						<p class="text-[var(--color-muted)]">
							Model size and data should scale <strong class="text-[var(--color-text)]"
								>equally</strong
							> with compute
						</p>
					</div>
					<div class="flex items-center gap-3">
						<span class="h-2 w-2 rounded-full bg-[var(--color-primary)]"></span>
						<p class="text-[var(--color-muted)]">
							Optimal ratio: <strong class="text-[var(--color-accent)]"
								>~20 tokens per parameter</strong
							>
						</p>
					</div>
					<div class="flex items-center gap-3">
						<span class="h-2 w-2 rounded-full bg-[var(--color-primary)]"></span>
						<p class="text-[var(--color-muted)]">
							N<sub>opt</sub> ∝ C<sup>0.5</sup> and D<sub>opt</sub> ∝ C<sup>0.5</sup>
						</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Three Methods -->
	<section class="rounded-xl border border-[var(--color-muted)]/20 bg-[var(--color-secondary)] p-6">
		<h3 class="mb-4 text-xl font-semibold text-[var(--color-text)]">
			Three Methods to Find Optimal Allocation
		</h3>
		<div class="space-y-4">
			{#each threeMethods as method (method.name)}
				<div class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-4">
					<h4 class="mb-2 font-semibold text-[var(--color-accent)]">{method.name}</h4>
					<p class="mb-3 text-[var(--color-muted)]">{method.description}</p>
					<div class="grid grid-cols-2 gap-4 text-sm">
						<div>
							<span class="font-medium text-green-400">Pros:</span>
							<ul class="mt-1 space-y-1">
								{#each method.pros as pro, i (i)}
									<li class="flex items-center gap-2 text-[var(--color-muted)]">
										<span class="text-green-400">+</span>
										{pro}
									</li>
								{/each}
							</ul>
						</div>
						<div>
							<span class="font-medium text-red-400">Cons:</span>
							<ul class="mt-1 space-y-1">
								{#each method.cons as con, i (i)}
									<li class="flex items-center gap-2 text-[var(--color-muted)]">
										<span class="text-red-400">-</span>
										{con}
									</li>
								{/each}
							</ul>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Model Comparisons -->
	<section class="rounded-xl border border-[var(--color-muted)]/20 bg-[var(--color-secondary)] p-6">
		<h3 class="mb-4 text-xl font-semibold text-[var(--color-text)]">
			Evolution of Training Ratios
		</h3>
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-[var(--color-muted)]/20">
						<th class="px-4 py-3 text-left font-medium text-[var(--color-muted)]">Model</th>
						<th class="px-4 py-3 text-left font-medium text-[var(--color-muted)]">Year</th>
						<th class="px-4 py-3 text-left font-medium text-[var(--color-muted)]">Parameters</th>
						<th class="px-4 py-3 text-left font-medium text-[var(--color-muted)]">Tokens</th>
						<th class="px-4 py-3 text-left font-medium text-[var(--color-muted)]">Ratio (D/N)</th>
						<th class="px-4 py-3 text-left font-medium text-[var(--color-muted)]">Status</th>
					</tr>
				</thead>
				<tbody>
					{#each modelComparisons as model (model.model)}
						<tr class="border-b border-[var(--color-muted)]/10">
							<td class="px-4 py-3 font-medium text-[var(--color-text)]">{model.model}</td>
							<td class="px-4 py-3 text-[var(--color-muted)]">{model.year}</td>
							<td class="px-4 py-3 font-mono text-[var(--color-accent)]">{model.params}</td>
							<td class="px-4 py-3 font-mono text-[var(--color-accent)]">{model.tokens}</td>
							<td class="px-4 py-3 font-mono text-[var(--color-primary)]">{model.ratio}</td>
							<td class="px-4 py-3">
								<span
									class="rounded-full px-2 py-1 text-xs
									{model.status === 'Optimal'
										? 'bg-green-500/20 text-green-400'
										: model.status === 'Undertrained'
											? 'bg-red-500/20 text-red-400'
											: 'bg-yellow-500/20 text-yellow-400'}"
								>
									{model.status}
								</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<!-- Evolution Insights -->
	<section class="rounded-xl border border-[var(--color-muted)]/20 bg-[var(--color-secondary)] p-6">
		<h3 class="mb-4 text-xl font-semibold text-[var(--color-text)]">
			Beyond Chinchilla: Modern Practice
		</h3>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
			{#each evolutionInsights as insight (insight.title)}
				<div class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-4">
					<h4 class="mb-2 font-semibold text-[var(--color-accent)]">{insight.title}</h4>
					<p class="text-sm text-[var(--color-muted)]">{insight.content}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- Practical Implications -->
	<section
		class="rounded-xl border border-[var(--color-accent)]/30 bg-gradient-to-r from-[var(--color-accent)]/10 to-[var(--color-primary)]/10 p-6"
	>
		<h3 class="mb-4 text-xl font-semibold text-[var(--color-text)]">Practical Implications</h3>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div>
				<h4 class="mb-3 font-medium text-[var(--color-accent)]">For Training-Optimal (Research)</h4>
				<ul class="space-y-2 text-sm text-[var(--color-muted)]">
					<li class="flex items-start gap-2">
						<span class="text-[var(--color-primary)]">•</span>
						Use ~20 tokens per parameter
					</li>
					<li class="flex items-start gap-2">
						<span class="text-[var(--color-primary)]">•</span>
						Scale model and data equally with budget
					</li>
					<li class="flex items-start gap-2">
						<span class="text-[var(--color-primary)]">•</span>
						Minimizes training compute for target loss
					</li>
				</ul>
			</div>
			<div>
				<h4 class="mb-3 font-medium text-[var(--color-accent)]">
					For Inference-Optimal (Production)
				</h4>
				<ul class="space-y-2 text-sm text-[var(--color-muted)]">
					<li class="flex items-start gap-2">
						<span class="text-[var(--color-primary)]">•</span>
						Use 30-200+ tokens per parameter
					</li>
					<li class="flex items-start gap-2">
						<span class="text-[var(--color-primary)]">•</span>
						Smaller models trained longer are cheaper to serve
					</li>
					<li class="flex items-start gap-2">
						<span class="text-[var(--color-primary)]">•</span>
						Total cost = training + (inference × queries)
					</li>
				</ul>
			</div>
		</div>
	</section>
</div>
