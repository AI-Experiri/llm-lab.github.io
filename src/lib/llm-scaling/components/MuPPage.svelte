<script>
	const keyPapers = [
		{
			title:
				'Tensor Programs V: Tuning Large Neural Networks via Zero-Shot Hyperparameter Transfer',
			authors: 'Yang et al. (2022)',
			url: 'https://arxiv.org/abs/2203.03466',
			description: 'The muP paper - enables hyperparameter transfer across model widths'
		},
		{
			title: 'A Large-Scale Exploration of μ-Transfer',
			authors: 'Lingle (2024)',
			url: 'https://arxiv.org/abs/2404.05728',
			description: 'Empirical validation of muP with extensive ablation studies'
		}
	];

	const coreProblem = {
		title: 'The Hyperparameter Transfer Problem',
		description:
			'Standard practice requires tuning learning rates differently at each model scale. A learning rate that works well for a 100M model may not work for a 10B model.',
		solution:
			'muP (Maximal Update Parametrization) provides a principled way to transfer hyperparameters across scales by controlling how activations and updates scale with width.'
	};

	const conditions = [
		{
			name: 'Condition A1: Activation Stability',
			formula: 'Activations at initialization remain O(1) as width increases',
			explanation:
				'All hidden activations should have constant variance regardless of model width. This prevents explosion or vanishing at initialization.'
		},
		{
			name: 'Condition A2: Update Stability',
			formula: 'After one gradient step, activation changes remain O(1)',
			explanation:
				'The change in activations from a gradient step should not depend on model width. This ensures consistent learning dynamics.'
		}
	];

	const parametrizations = [
		{
			name: 'Standard Parametrization (SP)',
			init: 'σ = 1/√fan_in',
			lr: 'η = constant',
			issue: 'Learning rate must be reduced as width increases'
		},
		{
			name: 'Maximal Update Parametrization (muP)',
			init: 'σ = Θ(1/√fan_in) × min(1, √(n_l/n_{l-1}))',
			lr: 'η_l = Θ(1/n_{l-1})',
			issue: 'Learning rate transfers across widths'
		}
	];

	const mathDetails = [
		{
			title: 'Initialization (muP)',
			formula: 'σ_l = 1/√n_{l-1} × min(1, √(n_l/n_{l-1}))',
			note: 'For width n_l at layer l'
		},
		{
			title: 'Learning Rate (muP with Adam)',
			formula: 'η_l = η_base / n_{l-1}',
			note: 'Per-layer LR scales inversely with input width'
		}
	];

	const whatWorks = [
		{ item: 'Nonlinearities (SwiGLU, Squared ReLU)', status: 'works' },
		{ item: 'Batch size variations', status: 'works' },
		{ item: 'Zero-query initialization', status: 'works' },
		{ item: 'Different model depths', status: 'works' },
		{ item: 'Various optimizers (Adam, SGD)', status: 'works' }
	];

	const whatBreaks = [
		{ item: 'RMSNorm learnable gains', status: 'breaks' },
		{ item: 'Strong weight decay (0.1)', status: 'breaks' },
		{ item: 'Exotic optimizers (Lion)', status: 'breaks' },
		{ item: 'QK-normalization in some forms', status: 'breaks' }
	];

	const wsdSchedule = {
		name: 'WSD Learning Rate Schedule',
		phases: [
			{ name: 'Warmup', percentage: '~2-10%', description: 'Linear warmup from 0 to peak LR' },
			{ name: 'Stable', percentage: '~80-88%', description: 'Constant learning rate at peak' },
			{ name: 'Decay', percentage: '~10%', description: 'Linear or cosine decay to 0' }
		],
		benefits: [
			'Allows checkpoint reuse for Chinchilla analysis',
			'More flexible than cosine schedule',
			'Can extend training without re-warmup',
			'Used by MiniCPM and DeepSeek'
		]
	};

	const scalingRecipes = [
		{
			approach: 'muP + Search Small',
			description: 'Aggressive hyperparameter search on small proxy model, then scale up with muP',
			usedBy: 'Cerebras-GPT, MiniCPM'
		},
		{
			approach: 'Direct Scaling Law Fit',
			description: 'Fit scaling laws for optimal hyperparameters directly, without muP',
			usedBy: 'DeepSeek'
		},
		{
			approach: 'IsoFLOP Analysis',
			description: 'Simple grid search at fixed compute budgets, less focus on HP transfer',
			usedBy: 'Llama 3, Hunyuan'
		}
	];
</script>

<div class="space-y-8">
	<!-- Section Header -->
	<section
		class="rounded-2xl border border-[var(--color-primary)]/30 bg-gradient-to-br from-[var(--color-primary)]/20 to-pink-600/20 p-8"
	>
		<div class="flex items-start gap-4">
			<div class="text-4xl">μ</div>
			<div>
				<h2 class="mb-2 font-bold text-[var(--color-text)] text-[var(--text-h2)]">
					muP: Maximum Update Parametrization
				</h2>
				<p class="text-lg text-[var(--color-muted)]">
					muP is a principled approach to neural network initialization and learning rate scaling
					that enables hyperparameters to transfer reliably across model widths. This allows
					expensive hyperparameter searches to be done once at small scale and reused at large
					scale.
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

	<!-- The Problem -->
	<section class="rounded-xl border border-[var(--color-muted)]/20 bg-[var(--color-secondary)] p-6">
		<h3 class="mb-4 text-xl font-semibold text-[var(--color-accent)]">{coreProblem.title}</h3>
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
			<div class="rounded-lg border-l-4 border-red-500 bg-[var(--color-bg)] p-4">
				<h4 class="mb-2 font-medium text-red-400">The Problem</h4>
				<p class="text-[var(--color-muted)]">{coreProblem.description}</p>
			</div>
			<div class="rounded-lg border-l-4 border-green-500 bg-[var(--color-bg)] p-4">
				<h4 class="mb-2 font-medium text-green-400">The Solution</h4>
				<p class="text-[var(--color-muted)]">{coreProblem.solution}</p>
			</div>
		</div>
	</section>

	<!-- Core Conditions -->
	<section class="rounded-xl border border-[var(--color-muted)]/20 bg-[var(--color-secondary)] p-6">
		<h3 class="mb-4 text-xl font-semibold text-[var(--color-text)]">
			Core Conditions for Stability
		</h3>
		<div class="space-y-4">
			{#each conditions as condition (condition.name)}
				<div class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-4">
					<h4 class="mb-2 font-semibold text-[var(--color-accent)]">{condition.name}</h4>
					<div
						class="mb-3 rounded bg-[var(--color-secondary)] p-3 font-mono text-sm text-[var(--color-text)]"
					>
						{condition.formula}
					</div>
					<p class="text-sm text-[var(--color-muted)]">{condition.explanation}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- Parametrization Comparison -->
	<section class="rounded-xl border border-[var(--color-muted)]/20 bg-[var(--color-secondary)] p-6">
		<h3 class="mb-4 text-xl font-semibold text-[var(--color-text)]">Standard vs muP</h3>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			{#each parametrizations as param, i (param.name)}
				<div
					class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-4
					{i === 1 ? 'border-[var(--color-primary)]/50' : ''}"
				>
					<h4
						class="mb-3 font-semibold text-[var(--color-text)]
						{i === 1 ? 'text-[var(--color-primary)]' : ''}"
					>
						{param.name}
					</h4>
					<div class="space-y-2 text-sm">
						<div class="flex gap-2">
							<span class="w-20 text-[var(--color-muted)]">Init:</span>
							<span class="font-mono text-[var(--color-accent)]">{param.init}</span>
						</div>
						<div class="flex gap-2">
							<span class="w-20 text-[var(--color-muted)]">LR:</span>
							<span class="font-mono text-[var(--color-accent)]">{param.lr}</span>
						</div>
						<div class="mt-3 flex gap-2 border-t border-[var(--color-muted)]/20 pt-3">
							<span class="text-[var(--color-muted)]">{param.issue}</span>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Mathematical Details -->
	<section class="rounded-xl border border-[var(--color-muted)]/20 bg-[var(--color-secondary)] p-6">
		<h3 class="mb-4 text-xl font-semibold text-[var(--color-text)]">Mathematical Details</h3>
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
			{#each mathDetails as detail (detail.title)}
				<div class="rounded-lg bg-[var(--color-bg)] p-4">
					<h4 class="mb-3 font-medium text-[var(--color-accent)]">{detail.title}</h4>
					<div class="space-y-2 font-mono text-sm">
						<p class="text-[var(--color-text)]">{detail.formula}</p>
						<p class="mt-2 text-xs text-[var(--color-muted)]">{detail.note}</p>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- What Works / What Breaks -->
	<section class="rounded-xl border border-[var(--color-muted)]/20 bg-[var(--color-secondary)] p-6">
		<h3 class="mb-4 text-xl font-semibold text-[var(--color-text)]">Empirical Validation</h3>
		<p class="mb-4 text-sm text-[var(--color-muted)]">
			Based on Lucas Dax Lingle's extensive exploration of muP transfer properties:
		</p>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div>
				<h4 class="mb-3 flex items-center gap-2 font-medium text-green-400">
					<span>✓</span> What Works
				</h4>
				<ul class="space-y-2">
					{#each whatWorks as item (item.item)}
						<li class="flex items-center gap-2 text-sm text-[var(--color-muted)]">
							<span class="h-2 w-2 rounded-full bg-green-500"></span>
							{item.item}
						</li>
					{/each}
				</ul>
			</div>
			<div>
				<h4 class="mb-3 flex items-center gap-2 font-medium text-red-400">
					<span>✗</span> What Breaks
				</h4>
				<ul class="space-y-2">
					{#each whatBreaks as item (item.item)}
						<li class="flex items-center gap-2 text-sm text-[var(--color-muted)]">
							<span class="h-2 w-2 rounded-full bg-red-500"></span>
							{item.item}
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</section>

	<!-- WSD Learning Rate Schedule -->
	<section class="rounded-xl border border-[var(--color-muted)]/20 bg-[var(--color-secondary)] p-6">
		<h3 class="mb-4 text-xl font-semibold text-[var(--color-text)]">{wsdSchedule.name}</h3>
		<p class="mb-4 text-[var(--color-muted)]">
			A practical alternative to cosine decay that enables efficient scaling law studies:
		</p>
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
			<div>
				<div class="mb-4 flex gap-2">
					{#each wsdSchedule.phases as phase (phase.name)}
						<div class="flex-1 text-center">
							<div
								class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-3"
							>
								<div class="text-lg font-bold text-[var(--color-accent)]">{phase.name}</div>
								<div class="text-sm text-[var(--color-muted)]">{phase.percentage}</div>
							</div>
							<div class="mt-2 text-xs text-[var(--color-muted)]">{phase.description}</div>
						</div>
					{/each}
				</div>
			</div>
			<div>
				<h4 class="mb-3 font-medium text-[var(--color-text)]">Benefits</h4>
				<ul class="space-y-2">
					{#each wsdSchedule.benefits as benefit, i (i)}
						<li class="flex items-start gap-2 text-sm text-[var(--color-muted)]">
							<span class="text-[var(--color-primary)]">•</span>
							{benefit}
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</section>

	<!-- Practical Scaling Recipes -->
	<section class="rounded-xl border border-[var(--color-muted)]/20 bg-[var(--color-secondary)] p-6">
		<h3 class="mb-4 text-xl font-semibold text-[var(--color-text)]">Practical Scaling Recipes</h3>
		<div class="space-y-4">
			{#each scalingRecipes as recipe (recipe.approach)}
				<div class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-4">
					<div class="mb-2 flex items-start justify-between">
						<h4 class="font-semibold text-[var(--color-accent)]">{recipe.approach}</h4>
						<span
							class="rounded bg-[var(--color-secondary)] px-2 py-1 text-xs text-[var(--color-muted)]"
						>
							{recipe.usedBy}
						</span>
					</div>
					<p class="text-sm text-[var(--color-muted)]">{recipe.description}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- Key Takeaways -->
	<section
		class="rounded-xl border border-[var(--color-accent)]/30 bg-gradient-to-r from-[var(--color-accent)]/10 to-[var(--color-primary)]/10 p-6"
	>
		<h3 class="mb-4 text-xl font-semibold text-[var(--color-text)]">Key Takeaways</h3>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div class="flex items-start gap-3">
				<span class="font-bold text-[var(--color-primary)]">1.</span>
				<p class="text-[var(--color-muted)]">
					<strong class="text-[var(--color-text)]">muP enables HP transfer:</strong> Tune hyperparameters
					on small models, apply directly to large models.
				</p>
			</div>
			<div class="flex items-start gap-3">
				<span class="font-bold text-[var(--color-primary)]">2.</span>
				<p class="text-[var(--color-muted)]">
					<strong class="text-[var(--color-text)]">Not universally applicable:</strong> Some components
					(weight decay, exotic optimizers) break transfer.
				</p>
			</div>
			<div class="flex items-start gap-3">
				<span class="font-bold text-[var(--color-primary)]">3.</span>
				<p class="text-[var(--color-muted)]">
					<strong class="text-[var(--color-text)]">WSD complements muP:</strong> The warmup-stable-decay
					schedule enables efficient scaling experiments.
				</p>
			</div>
			<div class="flex items-start gap-3">
				<span class="font-bold text-[var(--color-primary)]">4.</span>
				<p class="text-[var(--color-muted)]">
					<strong class="text-[var(--color-text)]">Multiple approaches work:</strong> muP, direct scaling
					law fits, and IsoFLOP analysis all yield good results.
				</p>
			</div>
		</div>
	</section>
</div>
