<!-- ABOUTME: muP (Maximum Update Parametrization) deep dive -->
<!-- ABOUTME: Uses shared components for consistent styling -->

<script>
	import { HeroSection, Section, ContentBox, KeyTakeaway, Math } from '$lib/shared';

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
			formula: '\\text{Activations at initialization remain } O(1) \\text{ as width increases}',
			explanation:
				'All hidden activations should have constant variance regardless of model width. This prevents explosion or vanishing at initialization.'
		},
		{
			name: 'Condition A2: Update Stability',
			formula: '\\text{After one gradient step, activation changes remain } O(1)',
			explanation:
				'The change in activations from a gradient step should not depend on model width. This ensures consistent learning dynamics.'
		}
	];

	const parametrizationComparison = {
		headers: ['Aspect', 'Standard (SP)', 'muP'],
		rows: [
			[
				'Initialization',
				'\\sigma = 1/\\sqrt{\\text{fan\\_in}}',
				'\\sigma = \\Theta(1/\\sqrt{\\text{fan\\_in}}) \\times \\min(1, \\sqrt{n_l/n_{l-1}})'
			],
			['Learning Rate', '\\eta = \\text{constant}', '\\eta_l = \\Theta(1/n_{l-1})'],
			['HP Transfer', 'Must re-tune at each scale', 'Transfers across widths']
		]
	};

	const mathDetails = [
		{
			title: 'Initialization (muP)',
			formula:
				'\\sigma_l = \\frac{1}{\\sqrt{n_{l-1}}} \\times \\min\\left(1, \\sqrt{\\frac{n_l}{n_{l-1}}}\\right)',
			note: 'For width n_l at layer l'
		},
		{
			title: 'Learning Rate (muP with Adam)',
			formula: '\\eta_l = \\frac{\\eta_{\\text{base}}}{n_{l-1}}',
			note: 'Per-layer LR scales inversely with input width'
		}
	];

	const whatWorks = [
		'Nonlinearities (SwiGLU, Squared ReLU)',
		'Batch size variations',
		'Zero-query initialization',
		'Different model depths',
		'Various optimizers (Adam, SGD)'
	];

	const whatBreaks = [
		'RMSNorm learnable gains',
		'Strong weight decay (0.1)',
		'Exotic optimizers (Lion)',
		'QK-normalization in some forms'
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

<div class="space-y-6">
	<HeroSection icon="μ" title="muP: Maximum Update Parametrization">
		<p class="max-w-3xl leading-relaxed text-[var(--color-muted)] text-[var(--text-body)]">
			muP is a principled approach to neural network initialization and learning rate scaling that
			enables hyperparameters to transfer reliably across model widths. This allows expensive
			hyperparameter searches to be done once at small scale and reused at large scale.
		</p>
	</HeroSection>

	<!-- Key Papers -->
	<Section title="Papers">
		<div class="grid gap-4 md:grid-cols-2">
			<ContentBox variant="dark" class="transition-colors hover:border-[var(--color-primary)]/50">
				<a
					href="https://arxiv.org/abs/2203.03466"
					target="_blank"
					rel="noopener noreferrer external"
					class="block"
				>
					<h4 class="mb-1 font-semibold text-[var(--color-primary)] text-[var(--text-small)]">
						Tensor Programs V: Zero-Shot Hyperparameter Transfer
					</h4>
					<p class="mb-2 text-[var(--color-accent)] text-[var(--text-tiny)]">
						Yang et al. (2022) — Microsoft
					</p>
					<p class="text-[var(--color-muted)] text-[var(--text-small)]">
						The muP paper - enables hyperparameter transfer across model widths through principled
						initialization and learning rate scaling.
					</p>
				</a>
			</ContentBox>
			<ContentBox variant="dark" class="transition-colors hover:border-[var(--color-primary)]/50">
				<a
					href="https://arxiv.org/abs/2404.05728"
					target="_blank"
					rel="noopener noreferrer external"
					class="block"
				>
					<h4 class="mb-1 font-semibold text-[var(--color-primary)] text-[var(--text-small)]">
						A Large-Scale Exploration of μ-Transfer
					</h4>
					<p class="mb-2 text-[var(--color-accent)] text-[var(--text-tiny)]">Lingle (2024)</p>
					<p class="text-[var(--color-muted)] text-[var(--text-small)]">
						Empirical validation of muP with extensive ablation studies on what works and what
						breaks during transfer.
					</p>
				</a>
			</ContentBox>
		</div>
	</Section>

	<!-- The Problem -->
	<Section title={coreProblem.title}>
		<div class="grid gap-6 lg:grid-cols-2">
			<ContentBox variant="dark" class="border-l-4 border-red-500">
				<h4 class="mb-2 font-medium text-[var(--text-small)] text-red-400">The Problem</h4>
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">{coreProblem.description}</p>
			</ContentBox>
			<ContentBox variant="dark" class="border-l-4 border-green-500">
				<h4 class="mb-2 font-medium text-[var(--text-small)] text-green-400">The Solution</h4>
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">{coreProblem.solution}</p>
			</ContentBox>
		</div>
	</Section>

	<!-- Core Conditions -->
	<Section title="Core Conditions for Stability">
		<div class="space-y-4">
			{#each conditions as condition (condition.name)}
				<ContentBox variant="dark">
					<h4 class="mb-2 font-semibold text-[var(--color-primary)] text-[var(--text-small)]">
						{condition.name}
					</h4>
					<div
						class="mb-3 rounded bg-[var(--color-bg)] p-3 text-[var(--color-text)] text-[var(--text-small)]"
					>
						<Math formula={condition.formula} />
					</div>
					<p class="text-[var(--color-muted)] text-[var(--text-small)]">{condition.explanation}</p>
				</ContentBox>
			{/each}
		</div>
	</Section>

	<!-- Parametrization Comparison -->
	<Section title="Standard vs muP">
		<div class="overflow-x-auto">
			<table class="w-full text-[var(--text-small)]">
				<thead>
					<tr class="border-b border-[var(--color-muted)]/20 text-left">
						{#each parametrizationComparison.headers as header, idx (idx)}
							<th
								class="pr-4 pb-3 {idx === 0
									? 'text-[var(--color-muted)]'
									: 'text-[var(--color-primary)]'}">{header}</th
							>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each parametrizationComparison.rows as row, rowIdx (rowIdx)}
						<tr class="border-b border-[var(--color-muted)]/10">
							{#each row as cell, cellIdx (cellIdx)}
								<td
									class="py-3 pr-4 {cellIdx === 0
										? 'text-[var(--color-text)]'
										: 'text-[var(--color-muted)]'}"
								>
									{#if cell.startsWith('\\')}
										<Math formula={cell} />
									{:else}
										{cell}
									{/if}
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</Section>

	<!-- Mathematical Details -->
	<Section title="Mathematical Details">
		<div class="grid gap-6 lg:grid-cols-2">
			{#each mathDetails as detail (detail.title)}
				<ContentBox variant="dark">
					<h4 class="mb-3 font-medium text-[var(--color-primary)] text-[var(--text-small)]">
						{detail.title}
					</h4>
					<div class="space-y-2 text-[var(--text-small)]">
						<div class="text-[var(--color-text)]">
							<Math formula={detail.formula} />
						</div>
						<p class="mt-2 text-[var(--color-muted)] text-[var(--text-tiny)]">{detail.note}</p>
					</div>
				</ContentBox>
			{/each}
		</div>
	</Section>

	<!-- What Works / What Breaks -->
	<Section title="Empirical Validation">
		<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
			Based on Lucas Dax Lingle's extensive exploration of muP transfer properties:
		</p>
		<div class="grid gap-6 md:grid-cols-2">
			<ContentBox variant="dark">
				<h4
					class="mb-3 flex items-center gap-2 font-medium text-[var(--text-small)] text-green-400"
				>
					<span>✓</span> What Works
				</h4>
				<ul class="space-y-2">
					{#each whatWorks as item, idx (idx)}
						<li class="flex items-center gap-2 text-[var(--color-muted)] text-[var(--text-small)]">
							<span class="h-2 w-2 rounded-full bg-green-500"></span>
							{item}
						</li>
					{/each}
				</ul>
			</ContentBox>
			<ContentBox variant="dark">
				<h4 class="mb-3 flex items-center gap-2 font-medium text-[var(--text-small)] text-red-400">
					<span>✗</span> What Breaks
				</h4>
				<ul class="space-y-2">
					{#each whatBreaks as item, idx (idx)}
						<li class="flex items-center gap-2 text-[var(--color-muted)] text-[var(--text-small)]">
							<span class="h-2 w-2 rounded-full bg-red-500"></span>
							{item}
						</li>
					{/each}
				</ul>
			</ContentBox>
		</div>
	</Section>

	<!-- WSD Learning Rate Schedule -->
	<Section title={wsdSchedule.name}>
		<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
			A practical alternative to cosine decay that enables efficient scaling law studies:
		</p>
		<div class="grid gap-6 lg:grid-cols-2">
			<div class="flex gap-2">
				{#each wsdSchedule.phases as phase (phase.name)}
					<div class="flex-1 text-center">
						<ContentBox variant="dark">
							<div class="font-bold text-[var(--color-primary)] text-[var(--text-body)]">
								{phase.name}
							</div>
							<div class="text-[var(--color-muted)] text-[var(--text-small)]">
								{phase.percentage}
							</div>
						</ContentBox>
						<div class="mt-2 text-[var(--color-muted)] text-[var(--text-tiny)]">
							{phase.description}
						</div>
					</div>
				{/each}
			</div>
			<ContentBox variant="dark">
				<h4 class="mb-3 font-medium text-[var(--color-primary)] text-[var(--text-small)]">
					Benefits
				</h4>
				<ul class="space-y-2">
					{#each wsdSchedule.benefits as benefit, idx (idx)}
						<li class="flex items-start gap-2 text-[var(--color-muted)] text-[var(--text-small)]">
							<span class="text-[var(--color-primary)]">•</span>
							{benefit}
						</li>
					{/each}
				</ul>
			</ContentBox>
		</div>
	</Section>

	<!-- Practical Scaling Recipes -->
	<Section title="Practical Scaling Recipes">
		<div class="space-y-4">
			{#each scalingRecipes as recipe (recipe.approach)}
				<ContentBox variant="dark" class="transition-colors hover:border-[var(--color-primary)]/50">
					<div class="mb-2 flex items-start justify-between">
						<h4 class="font-semibold text-[var(--color-primary)] text-[var(--text-small)]">
							{recipe.approach}
						</h4>
						<span
							class="rounded bg-[var(--color-bg)] px-2 py-1 text-[var(--color-muted)] text-[var(--text-tiny)]"
						>
							{recipe.usedBy}
						</span>
					</div>
					<p class="text-[var(--color-muted)] text-[var(--text-small)]">{recipe.description}</p>
				</ContentBox>
			{/each}
		</div>
	</Section>

	<KeyTakeaway
		items={[
			'muP enables HP transfer: Tune hyperparameters on small models, apply directly to large models',
			'Not universally applicable: Some components (weight decay, exotic optimizers) break transfer',
			'WSD complements muP: The warmup-stable-decay schedule enables efficient scaling experiments',
			'Multiple approaches work: muP, direct scaling law fits, and IsoFLOP analysis all yield good results'
		]}
	/>
</div>
