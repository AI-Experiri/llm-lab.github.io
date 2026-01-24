<!-- ABOUTME: Chinchilla compute-optimal training deep dive -->
<!-- ABOUTME: Uses shared components for consistent styling -->

<script>
	import {
		HeroSection,
		Section,
		ContentBox,
		KeyTakeaway,
		DataTable,
		ProsConsCard,
		Math
	} from '$lib/shared';

	const jointScalingFormula = {
		main: 'L(N, D) = E + \\frac{A}{N^\\alpha} + \\frac{B}{D^\\beta}',
		where: [
			{ symbol: 'E', meaning: 'Irreducible loss (entropy of data)' },
			{ symbol: 'A, B', meaning: 'Scaling constants' },
			{ symbol: '\\alpha', meaning: 'Model scaling exponent (~0.34)' },
			{ symbol: '\\beta', meaning: 'Data scaling exponent (~0.28)' }
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

	const modelComparisons = {
		headers: ['Model', 'Year', 'Parameters', 'Tokens', 'Ratio (D/N)', 'Status'],
		rows: [
			['GPT-3', '2020', '175B', '300B', '1.7x', 'Undertrained'],
			['Chinchilla', '2022', '70B', '1.4T', '20x', 'Optimal'],
			['Llama 2', '2023', '70B', '2T', '29x', 'Over-trained'],
			['Llama 3', '2024', '70B', '15T', '214x', 'Highly over-trained']
		]
	};

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

	// Formulas stored as constants to avoid template parsing issues with \text{}
	const nOptFormula = 'N_{\\text{opt}} \\propto C^{0.5}';
	const dOptFormula = 'D_{\\text{opt}} \\propto C^{0.5}';
</script>

<div class="space-y-6">
	<HeroSection icon="🐭" title="Chinchilla: Compute-Optimal Training">
		<p class="max-w-3xl leading-relaxed text-[var(--color-muted)] text-[var(--text-body)]">
			The Chinchilla paper (Hoffmann et al., 2022) revealed that most large language models were
			significantly undertrained. It established the principle of compute-optimal training: for a
			fixed compute budget, there's an optimal balance between model size and training data.
		</p>
	</HeroSection>

	<!-- Key Papers -->
	<Section title="Papers">
		<div class="grid gap-4 md:grid-cols-2">
			<ContentBox variant="dark" class="transition-colors hover:border-[var(--color-primary)]/50">
				<a
					href="https://arxiv.org/abs/2203.15556"
					target="_blank"
					rel="noopener noreferrer external"
					class="block"
				>
					<h4 class="mb-1 font-semibold text-[var(--color-primary)] text-[var(--text-small)]">
						Training Compute-Optimal Large Language Models
					</h4>
					<p class="mb-2 text-[var(--color-accent)] text-[var(--text-tiny)]">
						Hoffmann et al. (2022) — DeepMind
					</p>
					<p class="text-[var(--color-muted)] text-[var(--text-small)]">
						The Chinchilla paper - showed most LLMs were undertrained and proposed compute-optimal
						training with ~20 tokens per parameter.
					</p>
				</a>
			</ContentBox>
			<ContentBox variant="dark" class="transition-colors hover:border-[var(--color-primary)]/50">
				<a
					href="https://arxiv.org/abs/2001.08361"
					target="_blank"
					rel="noopener noreferrer external"
					class="block"
				>
					<h4 class="mb-1 font-semibold text-[var(--color-primary)] text-[var(--text-small)]">
						Scaling Laws for Neural Language Models
					</h4>
					<p class="mb-2 text-[var(--color-accent)] text-[var(--text-tiny)]">
						Kaplan et al. (2020) — OpenAI
					</p>
					<p class="text-[var(--color-muted)] text-[var(--text-small)]">
						Original scaling laws paper that Chinchilla builds upon and refines.
					</p>
				</a>
			</ContentBox>
		</div>
	</Section>

	<!-- The Core Problem -->
	<Section title="The Core Problem">
		<ContentBox variant="dark" class="mb-4 border-l-4 border-[var(--color-primary)]">
			<p class="font-medium text-[var(--color-text)] text-[var(--text-body)]">
				Given a fixed compute budget <Math formula="C" />, how should we allocate between model size
				<Math formula="N" /> and training tokens <Math formula="D" />?
			</p>
		</ContentBox>
		<div class="grid gap-4 md:grid-cols-2">
			<ContentBox variant="dark" class="text-center">
				<h4 class="mb-2 font-medium text-[var(--color-primary)] text-[var(--text-small)]">
					Constraint
				</h4>
				<div class="text-[var(--color-muted)] text-[var(--text-body)]">
					<Math formula="C \\approx 6 \\times N \\times D" />
				</div>
				<p class="mt-2 text-[var(--color-muted)] text-[var(--text-small)]">
					Total FLOPs is proportional to model size times tokens.
				</p>
			</ContentBox>
			<ContentBox variant="dark" class="text-center">
				<h4 class="mb-2 font-medium text-[var(--color-primary)] text-[var(--text-small)]">Goal</h4>
				<div class="text-[var(--color-muted)] text-[var(--text-body)]">
					<Math formula="\\min L(N, D)" />
				</div>
				<p class="mt-2 text-[var(--color-muted)] text-[var(--text-small)]">
					Minimize loss subject to compute constraint.
				</p>
			</ContentBox>
		</div>
	</Section>

	<!-- Joint Scaling Law -->
	<Section title="Joint Scaling Law">
		<div class="grid gap-6 lg:grid-cols-2">
			<div>
				<ContentBox variant="dark" class="mb-4 text-center">
					<div class="text-[var(--color-accent)] text-[var(--text-body)]">
						<Math formula={jointScalingFormula.main} />
					</div>
				</ContentBox>
				<div class="space-y-2">
					{#each jointScalingFormula.where as item (item.symbol)}
						<div class="flex gap-3 text-[var(--text-small)]">
							<span class="w-12 font-bold text-[var(--color-accent)]"
								><Math formula={item.symbol} /></span
							>
							<span class="text-[var(--color-muted)]">{item.meaning}</span>
						</div>
					{/each}
				</div>
			</div>
			<ContentBox variant="dark">
				<h4 class="mb-3 font-medium text-[var(--color-primary)] text-[var(--text-small)]">
					The Chinchilla Result
				</h4>
				<div class="space-y-3">
					<div class="flex items-center gap-3">
						<span class="h-2 w-2 rounded-full bg-[var(--color-primary)]"></span>
						<p class="text-[var(--color-muted)] text-[var(--text-small)]">
							Model size and data should scale <strong class="text-[var(--color-text)]"
								>equally</strong
							> with compute
						</p>
					</div>
					<div class="flex items-center gap-3">
						<span class="h-2 w-2 rounded-full bg-[var(--color-primary)]"></span>
						<p class="text-[var(--color-muted)] text-[var(--text-small)]">
							Optimal ratio: <strong class="text-[var(--color-accent)]"
								>~20 tokens per parameter</strong
							>
						</p>
					</div>
					<div class="flex items-center gap-3">
						<span class="h-2 w-2 rounded-full bg-[var(--color-primary)]"></span>
						<p class="text-[var(--color-muted)] text-[var(--text-small)]">
							<Math formula={nOptFormula} /> and <Math formula={dOptFormula} />
						</p>
					</div>
				</div>
			</ContentBox>
		</div>
	</Section>

	<!-- Three Methods -->
	<Section title="Three Methods to Find Optimal Allocation">
		<div class="space-y-4">
			{#each threeMethods as method (method.name)}
				<ProsConsCard
					title={method.name}
					description={method.description}
					pros={method.pros}
					cons={method.cons}
				/>
			{/each}
		</div>
	</Section>

	<!-- Model Comparisons -->
	<Section title="Evolution of Training Ratios">
		<DataTable headers={modelComparisons.headers} rows={modelComparisons.rows} />
	</Section>

	<!-- Evolution Insights -->
	<Section title="Beyond Chinchilla: Modern Practice">
		<div class="grid gap-4 md:grid-cols-3">
			{#each evolutionInsights as insight (insight.title)}
				<ContentBox variant="dark" class="border border-[var(--color-muted)]/20">
					<h4 class="mb-2 font-semibold text-[var(--color-primary)] text-[var(--text-small)]">
						{insight.title}
					</h4>
					<p class="text-[var(--color-muted)] text-[var(--text-small)]">{insight.content}</p>
				</ContentBox>
			{/each}
		</div>
	</Section>

	<!-- Practical Implications -->
	<Section title="Practical Implications">
		<div class="grid gap-6 md:grid-cols-2">
			<ContentBox variant="dark">
				<h4 class="mb-3 font-medium text-[var(--color-primary)] text-[var(--text-small)]">
					For Training-Optimal (Research)
				</h4>
				<ul class="space-y-2 text-[var(--color-muted)] text-[var(--text-small)]">
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
			</ContentBox>
			<ContentBox variant="dark">
				<h4 class="mb-3 font-medium text-[var(--color-primary)] text-[var(--text-small)]">
					For Inference-Optimal (Production)
				</h4>
				<ul class="space-y-2 text-[var(--color-muted)] text-[var(--text-small)]">
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
			</ContentBox>
		</div>
	</Section>

	<KeyTakeaway
		items={[
			'Chinchilla ratio: ~20 tokens per parameter for compute-optimal training',
			'N_opt and D_opt both scale as C^0.5 - model and data should grow equally',
			'Three methods: minimum envelope, IsoFLOP analysis, curve fitting',
			'Modern models intentionally over-train for cheaper inference deployment'
		]}
	/>
</div>
