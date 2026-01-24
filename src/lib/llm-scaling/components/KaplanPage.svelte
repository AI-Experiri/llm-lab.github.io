<!-- ABOUTME: Kaplan 2020 scaling laws paper deep dive -->
<!-- ABOUTME: Uses shared components for consistent styling -->

<script>
	import { HeroSection, Section, ContentBox, KeyTakeaway, Math } from '$lib/shared';

	const dataScalingInsights = [
		{
			title: 'Power Law Relationship',
			content: 'Loss scales as L(D) = (D_c / D)^α where α ≈ 0.095-0.13.'
		},
		{
			title: 'Intrinsic Dimensionality',
			content: 'Scaling slope affected by data distribution complexity.'
		},
		{
			title: 'Data Composition',
			content: 'Mixing multiple sources follows predictable scaling.'
		},
		{
			title: 'Multi-epoch Training',
			content: 'Repeated passes show diminishing returns vs fresh data.'
		}
	];

	const modelScalingInsights = [
		{
			title: 'Architecture Comparison',
			content: 'Transformers outperform LSTMs by constant factors across scales.'
		},
		{
			title: 'Depth vs Width',
			content: 'Optimal aspect ratios (10-100) remain stable across scales.'
		},
		{
			title: 'Batch Size',
			content: 'Critical batch size diminishes as loss target decreases.'
		},
		{
			title: 'Learning Rate',
			content: 'Optimal LR shifts predictably, ~1/width relationship.'
		}
	];

	const architectureDecisions = [
		{
			title: 'Transformers vs LSTMs',
			content: 'Similar exponents, better constants. Gap is constant multiplier.'
		},
		{
			title: 'GLU Variants',
			content: 'SwiGLU, GeGLU improve constants without changing scaling.'
		},
		{
			title: 'Mixture of Experts',
			content: 'MoE requires different analysis due to sparse activation.'
		},
		{
			title: 'Optimizer Choice',
			content: 'Adam preferred for transformers, similar scaling behavior.'
		}
	];

	// Formulas stored as constants to avoid template parsing issues with escape sequences
	const formulas = {
		dataScaling: 'L(D) = \\left(\\frac{D_c}{D}\\right)^{\\alpha_D}',
		alphaD: '\\alpha_D \\approx 0.095',
		alphaDRange: '\\alpha_D \\approx 0.095 \\text{ to } 0.13',
		modelScaling: 'L(N) = \\left(\\frac{N_c}{N}\\right)^{\\alpha_N}',
		alphaN: '\\alpha_N \\approx 0.076',
		computeScaling: 'L(C) = \\left(\\frac{C_c}{C}\\right)^{\\alpha_C}',
		alphaC: '\\alpha_C \\approx 0.050',
		oneOverN: '1/n',
		computeFLOPs: 'C \\approx 6 \\times N \\times D',
		computeShort: 'C \\approx 6ND',
		C: 'C',
		twoN: '2N',
		fourN: '4N',
		sixN: '6N'
	};
</script>

<div class="space-y-6">
	<HeroSection icon="📈" title="Kaplan 2020: Neural Language Model Scaling">
		<p class="max-w-3xl leading-relaxed text-[var(--color-muted)] text-[var(--text-body)]">
			The foundational OpenAI paper that established predictable power law relationships between
			loss and three key factors: data, model parameters, and compute.
		</p>
	</HeroSection>

	<Section title="Paper">
		<ContentBox variant="dark" class="transition-colors hover:border-[var(--color-primary)]/50">
			<a
				href="https://arxiv.org/abs/2001.08361"
				target="_blank"
				rel="noopener noreferrer external"
				class="block"
			>
				<h4 class="mb-1 font-semibold text-[var(--color-primary)] text-[var(--text-body)]">
					Scaling Laws for Neural Language Models
				</h4>
				<p class="mb-2 text-[var(--color-accent)] text-[var(--text-small)]">
					Kaplan et al. (2020) — OpenAI
				</p>
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">
					Foundational paper establishing power law relationships between loss, compute, data, and
					model parameters. Introduced the key exponents α_D, α_N, α_C that govern scaling behavior.
				</p>
			</a>
		</ContentBox>
	</Section>

	<!-- Core Equations -->
	<Section title="Core Scaling Equations">
		<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
			Loss follows power law relationships with each scaling factor:
		</p>
		<div class="grid gap-4 md:grid-cols-3">
			<ContentBox variant="dark" class="text-center">
				<div class="mb-2 text-[var(--color-accent)] text-[var(--text-body)]">
					<Math formula={formulas.dataScaling} />
				</div>
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">Data Scaling</p>
				<p class="mt-1 text-[var(--color-text)] text-[var(--text-tiny)]">
					<Math formula={formulas.alphaD} />
				</p>
			</ContentBox>
			<ContentBox variant="dark" class="text-center">
				<div class="mb-2 text-[var(--color-accent)] text-[var(--text-body)]">
					<Math formula={formulas.modelScaling} />
				</div>
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">Model Scaling</p>
				<p class="mt-1 text-[var(--color-text)] text-[var(--text-tiny)]">
					<Math formula={formulas.alphaN} />
				</p>
			</ContentBox>
			<ContentBox variant="dark" class="text-center">
				<div class="mb-2 text-[var(--color-accent)] text-[var(--text-body)]">
					<Math formula={formulas.computeScaling} />
				</div>
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">Compute Scaling</p>
				<p class="mt-1 text-[var(--color-text)] text-[var(--text-tiny)]">
					<Math formula={formulas.alphaC} />
				</p>
			</ContentBox>
		</div>
	</Section>

	<!-- Data Scaling Laws -->
	<Section title="Data Scaling Laws">
		<div class="grid gap-6 lg:grid-cols-2">
			<div>
				<ContentBox variant="dark" class="mb-4 text-center">
					<div class="text-[var(--color-accent)] text-[var(--text-body)]">
						<Math formula={formulas.dataScaling} />
					</div>
					<p class="mt-2 text-[var(--color-muted)] text-[var(--text-small)]">
						<Math formula={formulas.alphaDRange} />
					</p>
				</ContentBox>
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">
					<strong class="text-[var(--color-primary)]">Theoretical Motivation:</strong> For mean
					estimation, error scales as <Math formula={formulas.oneOverN} />. Language modeling shows
					slower scaling due to high intrinsic dimensionality.
				</p>
			</div>
			<div class="space-y-3">
				{#each dataScalingInsights as insight (insight.title)}
					<ContentBox variant="dark">
						<h4 class="font-medium text-[var(--color-accent)] text-[var(--text-small)]">
							{insight.title}
						</h4>
						<p class="text-[var(--color-muted)] text-[var(--text-small)]">{insight.content}</p>
					</ContentBox>
				{/each}
			</div>
		</div>
	</Section>

	<!-- Model Scaling Laws -->
	<Section title="Model Scaling Laws">
		<div class="grid gap-6 lg:grid-cols-2">
			<div>
				<ContentBox variant="dark" class="mb-4 text-center">
					<div class="text-[var(--color-accent)] text-[var(--text-body)]">
						<Math formula={formulas.modelScaling} />
					</div>
					<p class="mt-2 text-[var(--color-muted)] text-[var(--text-small)]">
						<Math formula={formulas.alphaN} />
					</p>
				</ContentBox>
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">
					<strong class="text-[var(--color-primary)]">Key Finding:</strong> Model size scaling is highly
					predictable. Doubling parameters provides consistent loss reduction.
				</p>
			</div>
			<div class="space-y-3">
				{#each modelScalingInsights as insight (insight.title)}
					<ContentBox variant="dark">
						<h4 class="font-medium text-[var(--color-accent)] text-[var(--text-small)]">
							{insight.title}
						</h4>
						<p class="text-[var(--color-muted)] text-[var(--text-small)]">{insight.content}</p>
					</ContentBox>
				{/each}
			</div>
		</div>
	</Section>

	<!-- Architecture Decisions -->
	<Section title="Architecture & Optimizer Decisions">
		<div class="grid gap-4 md:grid-cols-2">
			{#each architectureDecisions as decision (decision.title)}
				<ContentBox variant="dark" class="transition-colors hover:border-[var(--color-primary)]/50">
					<h4 class="mb-2 font-medium text-[var(--color-accent)]">{decision.title}</h4>
					<p class="text-[var(--color-muted)] text-[var(--text-small)]">{decision.content}</p>
				</ContentBox>
			{/each}
		</div>
	</Section>

	<!-- Compute Scaling -->
	<Section title="Compute Scaling">
		<div class="grid gap-6 lg:grid-cols-2">
			<div>
				<ContentBox variant="dark" class="mb-4 text-center">
					<div class="text-[var(--color-accent)] text-[var(--text-body)]">
						<Math formula={formulas.computeScaling} />
					</div>
					<p class="mt-2 text-[var(--color-muted)] text-[var(--text-small)]">
						<Math formula={formulas.computeFLOPs} /> (FLOPs)
					</p>
				</ContentBox>
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">
					Compute budget <Math formula={formulas.C} /> determines total training FLOPs. Since <Math
						formula={formulas.computeShort}
					/>, increasing model size or data increases compute.
				</p>
			</div>
			<ContentBox variant="dark">
				<h4 class="mb-3 font-medium text-[var(--color-primary)]">Key Relationships</h4>
				<div class="space-y-2 text-[var(--text-small)]">
					<div class="flex justify-between">
						<span class="text-[var(--color-muted)]">Compute (FLOPs):</span>
						<span class="text-[var(--color-accent)]"><Math formula={formulas.computeShort} /></span>
					</div>
					<div class="flex justify-between">
						<span class="text-[var(--color-muted)]">Forward pass:</span>
						<span class="text-[var(--color-accent)]"
							><Math formula={formulas.twoN} /> FLOPs/token</span
						>
					</div>
					<div class="flex justify-between">
						<span class="text-[var(--color-muted)]">Backward pass:</span>
						<span class="text-[var(--color-accent)]"
							><Math formula={formulas.fourN} /> FLOPs/token</span
						>
					</div>
					<div class="flex justify-between">
						<span class="text-[var(--color-muted)]">Total per token:</span>
						<span class="text-[var(--color-accent)]"><Math formula={formulas.sixN} /> FLOPs</span>
					</div>
				</div>
			</ContentBox>
		</div>
	</Section>

	<KeyTakeaway
		items={[
			'Power laws are universal across architectures, tasks, and modalities',
			'Small-scale experiments (10-100x smaller) reliably predict large-scale behavior',
			'Scaling exponents (α) determine how efficiently resources translate to performance',
			'Better architectures shift curves up but maintain similar scaling slopes'
		]}
	/>
</div>
