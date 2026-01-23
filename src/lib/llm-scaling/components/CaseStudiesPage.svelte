<script>
	const caseStudies = [
		{
			name: 'Cerebras-GPT',
			year: '2023',
			org: 'Cerebras',
			sizes: '111M to 13B parameters',
			approach: 'muP + Chinchilla',
			keyInnovations: [
				'Aggressive hyperparameter search on 40M parameter model',
				'Scale up using muP for per-layer learning rates',
				'Shows muP reduces training oscillations vs standard parametrization',
				'Validates that small-scale HP search transfers to large scale'
			],
			tokenRatio: '~20 tokens/param',
			lrSchedule: 'Cosine decay',
			link: 'https://arxiv.org/abs/2304.03208'
		},
		{
			name: 'MiniCPM',
			year: '2024',
			org: 'Tsinghua / ModelBest',
			sizes: '1.2B to 2.4B parameters',
			approach: 'muP + WSD Schedule',
			keyInnovations: [
				'Uses muP for initialization and learning rate scaling',
				'WSD (Warmup-Stable-Decay) learning rate schedule',
				'Allows cheap Chinchilla analysis by reusing stable phase checkpoints',
				'High token-to-parameter ratio: ~192x (vs traditional 20x)',
				'Beats most 2B models, matches many 7B models'
			],
			tokenRatio: '~192 tokens/param',
			lrSchedule: 'WSD (10% warmup, 80% stable, 10% decay)',
			link: 'https://arxiv.org/abs/2404.06395'
		},
		{
			name: 'DeepSeek LLM',
			year: '2024',
			org: 'DeepSeek AI',
			sizes: '7B and 67B parameters',
			approach: 'Direct Scaling Law Fit',
			keyInnovations: [
				'No muP; directly estimates optimal batch size and learning rate through scaling analysis',
				'Grid search at small scale for batch/LR combinations',
				'Fits scaling laws to optimal points across scales',
				'Uses WSD learning rate (10% warmup + 10% decay)',
				'Chinchilla isoFLOP analysis replication'
			],
			tokenRatio: '~29 tokens/param',
			lrSchedule: 'WSD (10% + 10%)',
			link: 'https://arxiv.org/abs/2401.02954'
		},
		{
			name: 'Llama 3',
			year: '2024',
			org: 'Meta',
			sizes: '8B to 405B parameters',
			approach: 'IsoFLOP Analysis',
			keyInnovations: [
				'39-to-1 token-to-parameter ratio (highly over-trained)',
				'Perplexity-to-downstream accuracy mapping for predictions',
				'Focus on inference efficiency over training optimality',
				'15T+ tokens for 70B model',
				'Demonstrates post-Chinchilla trend toward smaller, better-trained models'
			],
			tokenRatio: '~39 tokens/param (8B), ~214 tokens/param (70B)',
			lrSchedule: 'Cosine with warmup',
			link: 'https://arxiv.org/abs/2407.21783'
		},
		{
			name: 'Hunyuan-Large',
			year: '2024',
			org: 'Tencent',
			sizes: '389B total (52B active) MoE',
			approach: 'MoE Scaling Laws',
			keyInnovations: [
				'Mixture-of-Experts architecture scaling laws',
				'96-to-1 ratio for sparse/active parameters',
				'Novel scaling analysis for MoE vs dense models',
				'Demonstrates different optimal ratios for sparse architectures'
			],
			tokenRatio: '~96 tokens/active param',
			lrSchedule: 'WSD variant',
			link: 'https://arxiv.org/abs/2411.02265'
		},
		{
			name: 'MiniMax-01',
			year: '2024',
			org: 'MiniMax',
			sizes: '456B parameters',
			approach: 'Architecture Scaling Laws',
			keyInnovations: [
				'Architecture scaling laws for linear attention vs softmax',
				'Studies how different attention mechanisms scale',
				'Hybrid architecture optimization',
				'Novel insights on attention efficiency at scale'
			],
			tokenRatio: 'Varied by component',
			lrSchedule: 'Custom schedule',
			link: 'https://arxiv.org/abs/2501.08313'
		}
	];

	const comparisonTable = [
		{ model: 'Cerebras-GPT', mup: 'Yes', wsd: 'No', chinchilla: 'Yes', ratio: '20x' },
		{ model: 'MiniCPM', mup: 'Yes', wsd: 'Yes', chinchilla: 'Yes', ratio: '192x' },
		{ model: 'DeepSeek', mup: 'No', wsd: 'Yes', chinchilla: 'Yes', ratio: '29x' },
		{ model: 'Llama 3', mup: 'No', wsd: 'No', chinchilla: 'IsoFLOP', ratio: '39-214x' }
	];

	const commonIngredients = [
		{
			ingredient: 'Chinchilla IsoFLOP Analysis',
			description: 'Most replicated method for determining optimal model-data tradeoff',
			adoption: 'High'
		},
		{
			ingredient: 'Learning Rate Scaling Laws',
			description: 'Fit optimal LR as function of model size, either via muP or direct fitting',
			adoption: 'High'
		},
		{
			ingredient: 'Batch Size Scaling',
			description: 'Critical batch size analysis to determine optimal batch for each scale',
			adoption: 'Medium'
		},
		{
			ingredient: 'Aspect Ratio Fixing',
			description: 'Keep depth/width ratio constant during scaling',
			adoption: 'High'
		}
	];

	const trends = [
		{
			title: 'Over-training is Intentional',
			description:
				'Modern models intentionally train beyond Chinchilla optimal because inference cost dominates. Smaller, better-trained models are cheaper to deploy at scale.'
		},
		{
			title: 'WSD Replacing Cosine',
			description:
				'The Warmup-Stable-Decay schedule is becoming standard as it enables checkpoint reuse and more flexible training extensions.'
		},
		{
			title: 'muP Adoption Growing',
			description:
				'More teams are adopting muP or similar techniques to reduce hyperparameter search costs at scale.'
		},
		{
			title: 'Architecture-Specific Scaling',
			description:
				'MoE and hybrid attention architectures require different scaling laws than dense transformers.'
		}
	];
</script>

<div class="space-y-8">
	<!-- Section Header -->
	<section
		class="rounded-2xl border border-[var(--color-primary)]/30 bg-gradient-to-br from-[var(--color-primary)]/20 to-pink-600/20 p-8"
	>
		<div class="flex items-start gap-4">
			<div class="text-4xl">🔬</div>
			<div>
				<h2 class="mb-2 font-bold text-[var(--color-text)] text-[var(--text-h2)]">
					Case Studies: Scaling Laws in Practice
				</h2>
				<p class="text-lg text-[var(--color-muted)]">
					How production language models apply scaling laws for optimal training. Each team takes a
					different approach to hyperparameter transfer, learning rate schedules, and compute
					allocation, but all rely on scaling law principles.
				</p>
			</div>
		</div>
	</section>

	<!-- Quick Comparison Table -->
	<section class="rounded-xl border border-[var(--color-muted)]/20 bg-[var(--color-secondary)] p-6">
		<h3 class="mb-4 text-xl font-semibold text-[var(--color-text)]">Quick Comparison</h3>
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-[var(--color-muted)]/20">
						<th class="px-4 py-3 text-left font-medium text-[var(--color-muted)]">Model</th>
						<th class="px-4 py-3 text-center font-medium text-[var(--color-muted)]">muP</th>
						<th class="px-4 py-3 text-center font-medium text-[var(--color-muted)]">WSD</th>
						<th class="px-4 py-3 text-center font-medium text-[var(--color-muted)]">Chinchilla</th>
						<th class="px-4 py-3 text-left font-medium text-[var(--color-muted)]">Token Ratio</th>
					</tr>
				</thead>
				<tbody>
					{#each comparisonTable as row (row.model)}
						<tr class="border-b border-[var(--color-muted)]/10">
							<td class="px-4 py-3 font-medium text-[var(--color-text)]">{row.model}</td>
							<td class="px-4 py-3 text-center">
								<span class={row.mup === 'Yes' ? 'text-green-400' : 'text-[var(--color-muted)]'}
									>{row.mup}</span
								>
							</td>
							<td class="px-4 py-3 text-center">
								<span class={row.wsd === 'Yes' ? 'text-green-400' : 'text-[var(--color-muted)]'}
									>{row.wsd}</span
								>
							</td>
							<td class="px-4 py-3 text-center">
								<span
									class={row.chinchilla === 'Yes' ? 'text-green-400' : 'text-[var(--color-accent)]'}
									>{row.chinchilla}</span
								>
							</td>
							<td class="px-4 py-3 font-mono text-[var(--color-primary)]">{row.ratio}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<!-- Common Scaling Ingredients -->
	<section class="rounded-xl border border-[var(--color-muted)]/20 bg-[var(--color-secondary)] p-6">
		<h3 class="mb-4 text-xl font-semibold text-[var(--color-text)]">Common Scaling Ingredients</h3>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			{#each commonIngredients as item (item.ingredient)}
				<div class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-4">
					<div class="mb-2 flex items-start justify-between">
						<h4 class="font-semibold text-[var(--color-accent)]">{item.ingredient}</h4>
						<span
							class="rounded bg-[var(--color-secondary)] px-2 py-1 text-xs
							{item.adoption === 'High' ? 'text-green-400' : 'text-yellow-400'}"
						>
							{item.adoption}
						</span>
					</div>
					<p class="text-sm text-[var(--color-muted)]">{item.description}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- Detailed Case Studies -->
	<section>
		<h3 class="mb-4 text-xl font-semibold text-[var(--color-text)]">Detailed Case Studies</h3>
		<div class="space-y-6">
			{#each caseStudies as study (study.name)}
				<div
					class="rounded-xl border border-[var(--color-muted)]/20 bg-[var(--color-secondary)] p-6"
				>
					<div class="mb-4 flex flex-wrap items-start justify-between gap-4">
						<div>
							<h4 class="text-xl font-bold text-[var(--color-text)]">{study.name}</h4>
							<div class="mt-2 flex flex-wrap gap-2">
								<span
									class="rounded bg-[var(--color-bg)] px-2 py-1 text-xs text-[var(--color-muted)]"
									>{study.year}</span
								>
								<span
									class="rounded bg-[var(--color-bg)] px-2 py-1 text-xs text-[var(--color-accent)]"
									>{study.org}</span
								>
								<span
									class="rounded bg-[var(--color-bg)] px-2 py-1 text-xs text-[var(--color-primary)]"
									>{study.sizes}</span
								>
							</div>
						</div>
						<a
							href={study.link}
							target="_blank"
							rel="noopener noreferrer external"
							class="rounded-lg bg-[var(--color-bg)] px-4 py-2 text-sm text-[var(--color-accent)] transition-colors hover:bg-[var(--color-primary)]/20"
						>
							Read Paper →
						</a>
					</div>

					<div class="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
						<div class="rounded-lg bg-[var(--color-bg)] p-3">
							<span class="text-xs text-[var(--color-muted)]">Approach</span>
							<p class="font-medium text-[var(--color-text)]">{study.approach}</p>
						</div>
						<div class="rounded-lg bg-[var(--color-bg)] p-3">
							<span class="text-xs text-[var(--color-muted)]">Token Ratio</span>
							<p class="font-mono text-[var(--color-accent)]">{study.tokenRatio}</p>
						</div>
						<div class="rounded-lg bg-[var(--color-bg)] p-3">
							<span class="text-xs text-[var(--color-muted)]">LR Schedule</span>
							<p class="text-[var(--color-text)]">{study.lrSchedule}</p>
						</div>
					</div>

					<div>
						<h5 class="mb-2 text-sm font-medium text-[var(--color-muted)]">Key Innovations</h5>
						<ul class="grid grid-cols-1 gap-2 md:grid-cols-2">
							{#each study.keyInnovations as innovation, i (i)}
								<li class="flex items-start gap-2 text-sm text-[var(--color-muted)]">
									<span class="mt-1 text-[var(--color-primary)]">•</span>
									{innovation}
								</li>
							{/each}
						</ul>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Industry Trends -->
	<section class="rounded-xl border border-[var(--color-muted)]/20 bg-[var(--color-secondary)] p-6">
		<h3 class="mb-4 text-xl font-semibold text-[var(--color-text)]">Emerging Trends</h3>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			{#each trends as trend (trend.title)}
				<div class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-4">
					<h4 class="mb-2 font-semibold text-[var(--color-accent)]">{trend.title}</h4>
					<p class="text-sm text-[var(--color-muted)]">{trend.description}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- Practical Recipe -->
	<section
		class="rounded-xl border border-[var(--color-accent)]/30 bg-gradient-to-r from-[var(--color-accent)]/10 to-[var(--color-primary)]/10 p-6"
	>
		<h3 class="mb-4 text-xl font-semibold text-[var(--color-text)]">A Practical Scaling Recipe</h3>
		<p class="mb-4 text-[var(--color-muted)]">
			Based on patterns from these case studies, here's a general recipe for applying scaling laws:
		</p>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
			<div class="rounded-lg bg-[var(--color-bg)]/50 p-4">
				<div class="mb-2 text-2xl font-bold text-[var(--color-primary)]">1</div>
				<h4 class="mb-1 font-medium text-[var(--color-text)]">Proxy Models</h4>
				<p class="text-sm text-[var(--color-muted)]">
					Train surrogate models at 10-100x smaller scale
				</p>
			</div>
			<div class="rounded-lg bg-[var(--color-bg)]/50 p-4">
				<div class="mb-2 text-2xl font-bold text-[var(--color-primary)]">2</div>
				<h4 class="mb-1 font-medium text-[var(--color-text)]">HP Search</h4>
				<p class="text-sm text-[var(--color-muted)]">
					Aggressive hyperparameter search at small scale (optionally with muP)
				</p>
			</div>
			<div class="rounded-lg bg-[var(--color-bg)]/50 p-4">
				<div class="mb-2 text-2xl font-bold text-[var(--color-primary)]">3</div>
				<h4 class="mb-1 font-medium text-[var(--color-text)]">Scaling Analysis</h4>
				<p class="text-sm text-[var(--color-muted)]">
					IsoFLOP analysis or curve fitting for optimal model-data tradeoff
				</p>
			</div>
			<div class="rounded-lg bg-[var(--color-bg)]/50 p-4">
				<div class="mb-2 text-2xl font-bold text-[var(--color-primary)]">4</div>
				<h4 class="mb-1 font-medium text-[var(--color-text)]">Validate</h4>
				<p class="text-sm text-[var(--color-muted)]">
					Confirm predictions with larger validation runs before final training
				</p>
			</div>
		</div>
	</section>

	<!-- Key Lessons -->
	<section class="rounded-xl border border-[var(--color-muted)]/20 bg-[var(--color-secondary)] p-6">
		<h3 class="mb-4 text-xl font-semibold text-[var(--color-text)]">Key Lessons</h3>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div class="flex items-start gap-3">
				<span class="font-bold text-[var(--color-primary)]">1.</span>
				<p class="text-[var(--color-muted)]">
					<strong class="text-[var(--color-text)]">Multiple approaches work:</strong> muP, direct fitting,
					and IsoFLOP all produce good results. Choose based on your constraints.
				</p>
			</div>
			<div class="flex items-start gap-3">
				<span class="font-bold text-[var(--color-primary)]">2.</span>
				<p class="text-[var(--color-muted)]">
					<strong class="text-[var(--color-text)]">Inference matters:</strong> Production models over-train
					relative to Chinchilla to reduce deployment costs.
				</p>
			</div>
			<div class="flex items-start gap-3">
				<span class="font-bold text-[var(--color-primary)]">3.</span>
				<p class="text-[var(--color-muted)]">
					<strong class="text-[var(--color-text)]">WSD is practical:</strong> The warmup-stable-decay
					schedule enables efficient experimentation and training extensions.
				</p>
			</div>
			<div class="flex items-start gap-3">
				<span class="font-bold text-[var(--color-primary)]">4.</span>
				<p class="text-[var(--color-muted)]">
					<strong class="text-[var(--color-text)]">Data quality shifts ratios:</strong> Better data quality
					allows higher tokens-per-parameter ratios.
				</p>
			</div>
		</div>
	</section>
</div>
