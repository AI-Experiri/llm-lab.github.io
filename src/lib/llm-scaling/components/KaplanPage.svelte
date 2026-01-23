<script>
	const keyPaper = {
		title: 'Scaling Laws for Neural Language Models',
		authors: 'Kaplan et al. (2020)',
		url: 'https://arxiv.org/abs/2001.08361',
		description:
			'Foundational OpenAI paper establishing power law relationships between loss, compute, data, and model parameters for language models'
	};

	const dataScalingInsights = [
		{
			title: 'Power Law Relationship',
			content:
				'Loss scales as L(D) = (D_c / D)^α where α is typically 0.095-0.13 for language models. Much slower than the 1/√n rate simple theory predicts.'
		},
		{
			title: 'Intrinsic Dimensionality',
			content:
				'The scaling slope is affected by the intrinsic dimensionality of the data distribution, not just sample size.'
		},
		{
			title: 'Data Composition',
			content:
				'Mixing multiple data sources follows predictable scaling. The optimal mixture depends on the target task distribution.'
		},
		{
			title: 'Multi-epoch Training',
			content:
				'Repeated passes over data show diminishing returns. Fresh data is more valuable than repeated data.'
		}
	];

	const modelScalingInsights = [
		{
			title: 'Architecture Comparison',
			content:
				'Transformers consistently outperform LSTMs by constant factors across scales. The gap remains stable as models grow.'
		},
		{
			title: 'Depth vs Width',
			content:
				'Optimal aspect ratios (depth/width) of 10-100 remain stable across scales. Wider models are not always better.'
		},
		{
			title: 'Batch Size',
			content:
				'Critical batch size diminishes as loss target decreases. Larger models benefit from larger batch sizes.'
		},
		{
			title: 'Learning Rate',
			content:
				'Optimal learning rates shift predictably with scale, following approximately a 1/width relationship.'
		}
	];

	const architectureDecisions = [
		{
			title: 'Transformers vs LSTMs',
			content:
				'Transformers show better scaling constants but similar exponents. The gap is a constant multiplier, not growing.'
		},
		{
			title: 'GLU Variants',
			content:
				'Gated Linear Units (SwiGLU, GeGLU) improve constants without changing scaling behavior.'
		},
		{
			title: 'Mixture of Experts',
			content: 'MoE models require different scaling analysis due to sparse activation patterns.'
		},
		{
			title: 'Optimizer Choice',
			content:
				'Adam generally preferred over SGD for transformers, but scaling behavior is similar.'
		}
	];

	const keyTakeaways = [
		{
			title: 'Power laws are universal',
			content:
				'Loss scaling follows power law relationships across architectures, tasks, and modalities.'
		},
		{
			title: 'Small-scale predicts large-scale',
			content: 'Experiments on 10-100x smaller models reliably predict behavior at scale.'
		},
		{
			title: 'Scaling exponents matter',
			content: 'The slope (α) determines how efficiently resources translate to performance.'
		},
		{
			title: 'Architecture affects constants, not slopes',
			content: 'Better architectures shift curves up but maintain similar scaling.'
		}
	];
</script>

<div class="space-y-8">
	<!-- Section Header -->
	<section
		class="rounded-2xl border border-[var(--color-primary)]/30 bg-gradient-to-br from-[var(--color-primary)]/20 to-pink-600/20 p-8"
	>
		<div class="flex items-start gap-4">
			<div class="text-4xl">📈</div>
			<div>
				<h2 class="mb-2 font-bold text-[var(--color-text)] text-[var(--text-h2)]">
					Kaplan 2020: Neural Language Model Scaling
				</h2>
				<p class="text-lg text-[var(--color-muted)]">
					The foundational OpenAI paper that established predictable power law relationships between
					loss and three key factors: data, model parameters, and compute.
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

	<!-- Core Equations -->
	<section class="rounded-xl border border-[var(--color-muted)]/20 bg-[var(--color-secondary)] p-6">
		<h3 class="mb-4 text-xl font-semibold text-[var(--color-text)]">Core Scaling Equations</h3>
		<p class="mb-6 text-[var(--color-muted)]">
			Kaplan et al. discovered that loss follows power law relationships with each scaling factor:
		</p>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
			<div
				class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-4 text-center"
			>
				<p class="mb-2 font-mono text-lg text-[var(--color-accent)]">
					L(D) = (D<sub>c</sub> / D)<sup>α<sub>D</sub></sup>
				</p>
				<p class="text-sm text-[var(--color-muted)]">Data Scaling</p>
				<p class="mt-1 text-xs text-[var(--color-text)]">α<sub>D</sub> ≈ 0.095</p>
			</div>
			<div
				class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-4 text-center"
			>
				<p class="mb-2 font-mono text-lg text-[var(--color-accent)]">
					L(N) = (N<sub>c</sub> / N)<sup>α<sub>N</sub></sup>
				</p>
				<p class="text-sm text-[var(--color-muted)]">Model Scaling</p>
				<p class="mt-1 text-xs text-[var(--color-text)]">α<sub>N</sub> ≈ 0.076</p>
			</div>
			<div
				class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-4 text-center"
			>
				<p class="mb-2 font-mono text-lg text-[var(--color-accent)]">
					L(C) = (C<sub>c</sub> / C)<sup>α<sub>C</sub></sup>
				</p>
				<p class="text-sm text-[var(--color-muted)]">Compute Scaling</p>
				<p class="mt-1 text-xs text-[var(--color-text)]">α<sub>C</sub> ≈ 0.050</p>
			</div>
		</div>
	</section>

	<!-- Data Scaling Laws -->
	<section class="rounded-xl border border-[var(--color-muted)]/20 bg-[var(--color-secondary)] p-6">
		<h3 class="mb-4 text-xl font-semibold text-[var(--color-text)]">Data Scaling Laws</h3>
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
			<div>
				<div class="mb-4 rounded-lg bg-[var(--color-bg)] p-4 font-mono">
					<p class="text-center text-lg text-[var(--color-accent)]">
						L(D) = (D<sub>c</sub> / D)<sup>α<sub>D</sub></sup>
					</p>
					<p class="mt-2 text-center text-sm text-[var(--color-muted)]">
						α<sub>D</sub> ≈ 0.095 to 0.13
					</p>
				</div>
				<p class="text-sm text-[var(--color-muted)]">
					<strong class="text-[var(--color-text)]">Theoretical Motivation:</strong> For mean estimation,
					error scales as 1/n. However, language modeling shows much slower scaling due to high intrinsic
					dimensionality of natural language.
				</p>
			</div>
			<div class="space-y-3">
				{#each dataScalingInsights as insight (insight.title)}
					<div class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-3">
						<h4 class="text-sm font-medium text-[var(--color-accent)]">{insight.title}</h4>
						<p class="text-sm text-[var(--color-muted)]">{insight.content}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Model Scaling Laws -->
	<section class="rounded-xl border border-[var(--color-muted)]/20 bg-[var(--color-secondary)] p-6">
		<h3 class="mb-4 text-xl font-semibold text-[var(--color-text)]">Model Scaling Laws</h3>
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
			<div>
				<div class="mb-4 rounded-lg bg-[var(--color-bg)] p-4 font-mono">
					<p class="text-center text-lg text-[var(--color-accent)]">
						L(N) = (N<sub>c</sub> / N)<sup>α<sub>N</sub></sup>
					</p>
					<p class="mt-2 text-center text-sm text-[var(--color-muted)]">α<sub>N</sub> ≈ 0.076</p>
				</div>
				<p class="text-sm text-[var(--color-muted)]">
					<strong class="text-[var(--color-text)]">Key Finding:</strong> Model size scaling is highly
					predictable. Doubling parameters provides consistent loss reduction, but with diminishing returns
					in absolute terms.
				</p>
			</div>
			<div class="space-y-3">
				{#each modelScalingInsights as insight (insight.title)}
					<div class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-3">
						<h4 class="text-sm font-medium text-[var(--color-accent)]">{insight.title}</h4>
						<p class="text-sm text-[var(--color-muted)]">{insight.content}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Architecture Decisions -->
	<section class="rounded-xl border border-[var(--color-muted)]/20 bg-[var(--color-secondary)] p-6">
		<h3 class="mb-4 text-xl font-semibold text-[var(--color-text)]">
			Architecture & Optimizer Decisions
		</h3>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			{#each architectureDecisions as decision (decision.title)}
				<div class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-4">
					<h4 class="mb-2 font-medium text-[var(--color-accent)]">{decision.title}</h4>
					<p class="text-sm text-[var(--color-muted)]">{decision.content}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- Compute Scaling -->
	<section class="rounded-xl border border-[var(--color-muted)]/20 bg-[var(--color-secondary)] p-6">
		<h3 class="mb-4 text-xl font-semibold text-[var(--color-text)]">Compute Scaling</h3>
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
			<div>
				<div class="mb-4 rounded-lg bg-[var(--color-bg)] p-4 font-mono">
					<p class="text-center text-lg text-[var(--color-accent)]">
						L(C) = (C<sub>c</sub> / C)<sup>α<sub>C</sub></sup>
					</p>
					<p class="mt-2 text-center text-sm text-[var(--color-muted)]">C ≈ 6 × N × D (FLOPs)</p>
				</div>
				<p class="text-sm text-[var(--color-muted)]">
					Compute budget C determines the total training FLOPs. Since C ≈ 6ND, increasing either
					model size or data increases compute. Loss also follows a power law with compute.
				</p>
			</div>
			<div class="rounded-lg bg-[var(--color-bg)] p-4">
				<h4 class="mb-3 font-medium text-[var(--color-text)]">Key Relationships</h4>
				<div class="space-y-2 text-sm">
					<div class="flex justify-between">
						<span class="text-[var(--color-muted)]">Compute (FLOPs):</span>
						<span class="font-mono text-[var(--color-accent)]">C ≈ 6ND</span>
					</div>
					<div class="flex justify-between">
						<span class="text-[var(--color-muted)]">Forward pass:</span>
						<span class="font-mono text-[var(--color-accent)]">2N FLOPs/token</span>
					</div>
					<div class="flex justify-between">
						<span class="text-[var(--color-muted)]">Backward pass:</span>
						<span class="font-mono text-[var(--color-accent)]">4N FLOPs/token</span>
					</div>
					<div class="flex justify-between">
						<span class="text-[var(--color-muted)]">Total per token:</span>
						<span class="font-mono text-[var(--color-accent)]">6N FLOPs</span>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Key Takeaways -->
	<section
		class="rounded-xl border border-[var(--color-accent)]/30 bg-gradient-to-r from-[var(--color-accent)]/10 to-[var(--color-primary)]/10 p-6"
	>
		<h3 class="mb-4 text-xl font-semibold text-[var(--color-text)]">Key Takeaways</h3>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			{#each keyTakeaways as takeaway, i (i)}
				<div class="flex items-start gap-3">
					<span class="font-bold text-[var(--color-primary)]">{i + 1}.</span>
					<p class="text-[var(--color-muted)]">
						<strong class="text-[var(--color-text)]">{takeaway.title}:</strong>
						{takeaway.content}
					</p>
				</div>
			{/each}
		</div>
	</section>
</div>
