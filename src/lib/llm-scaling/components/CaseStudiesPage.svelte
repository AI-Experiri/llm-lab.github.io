<!-- ABOUTME: Case studies of scaling laws in production LLMs -->
<!-- ABOUTME: Uses shared components for consistent styling -->

<script>
	import {
		HeroSection,
		Section,
		ContentBox,
		KeyTakeaway,
		DataTable,
		NumberedSteps
	} from '$lib/shared';

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

	const comparisonTable = {
		headers: ['Model', 'muP', 'WSD', 'Chinchilla', 'Token Ratio'],
		rows: [
			['Cerebras-GPT', 'Yes', 'No', 'Yes', '20x'],
			['MiniCPM', 'Yes', 'Yes', 'Yes', '192x'],
			['DeepSeek', 'No', 'Yes', 'Yes', '29x'],
			['Llama 3', 'No', 'No', 'IsoFLOP', '39-214x']
		]
	};

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

	const scalingRecipe = [
		{
			title: 'Proxy Models',
			description: 'Train surrogate models at 10-100x smaller scale'
		},
		{
			title: 'HP Search',
			description: 'Aggressive hyperparameter search at small scale (optionally with muP)'
		},
		{
			title: 'Scaling Analysis',
			description: 'IsoFLOP analysis or curve fitting for optimal model-data tradeoff'
		},
		{
			title: 'Validate',
			description: 'Confirm predictions with larger validation runs before final training'
		}
	];
</script>

<div class="space-y-6">
	<HeroSection icon="🔬" title="Case Studies: Scaling Laws in Practice">
		<p class="max-w-3xl leading-relaxed text-[var(--color-muted)] text-[var(--text-body)]">
			How production language models apply scaling laws for optimal training. Each team takes a
			different approach to hyperparameter transfer, learning rate schedules, and compute
			allocation, but all rely on scaling law principles.
		</p>
	</HeroSection>

	<!-- Quick Comparison Table -->
	<Section title="Quick Comparison">
		<DataTable headers={comparisonTable.headers} rows={comparisonTable.rows} />
	</Section>

	<!-- Common Scaling Ingredients -->
	<Section title="Common Scaling Ingredients">
		<div class="grid gap-4 md:grid-cols-2">
			{#each commonIngredients as item (item.ingredient)}
				<ContentBox variant="dark" class="transition-colors hover:border-[var(--color-primary)]/50">
					<div class="mb-2 flex items-start justify-between">
						<h4 class="font-semibold text-[var(--color-primary)] text-[var(--text-small)]">
							{item.ingredient}
						</h4>
						<span
							class="rounded bg-[var(--color-bg)] px-2 py-1 text-[var(--text-tiny)]
							{item.adoption === 'High' ? 'text-green-400' : 'text-yellow-400'}"
						>
							{item.adoption}
						</span>
					</div>
					<p class="text-[var(--color-muted)] text-[var(--text-small)]">{item.description}</p>
				</ContentBox>
			{/each}
		</div>
	</Section>

	<!-- Detailed Case Studies -->
	<Section title="Detailed Case Studies">
		<div class="space-y-6">
			{#each caseStudies as study (study.name)}
				<ContentBox variant="dark">
					<div class="mb-4 flex flex-wrap items-start justify-between gap-4">
						<div>
							<h4 class="font-bold text-[var(--color-primary)] text-[var(--text-body)]">
								{study.name}
							</h4>
							<div class="mt-2 flex flex-wrap gap-2">
								<span
									class="rounded bg-[var(--color-bg)] px-2 py-1 text-[var(--color-muted)] text-[var(--text-tiny)]"
								>
									{study.year}
								</span>
								<span
									class="rounded bg-[var(--color-bg)] px-2 py-1 text-[var(--color-accent)] text-[var(--text-tiny)]"
								>
									{study.org}
								</span>
								<span
									class="rounded bg-[var(--color-bg)] px-2 py-1 text-[var(--color-primary)] text-[var(--text-tiny)]"
								>
									{study.sizes}
								</span>
							</div>
						</div>
						<a
							href={study.link}
							target="_blank"
							rel="noopener noreferrer external"
							class="rounded-lg bg-[var(--color-bg)] px-4 py-2 text-[var(--color-accent)] text-[var(--text-small)] transition-colors hover:bg-[var(--color-primary)]/20"
						>
							Read Paper →
						</a>
					</div>

					<div class="mb-4 grid gap-4 lg:grid-cols-3">
						<div class="rounded-lg bg-[var(--color-bg)] p-3">
							<span class="text-[var(--color-muted)] text-[var(--text-tiny)]">Approach</span>
							<p class="font-medium text-[var(--color-text)] text-[var(--text-small)]">
								{study.approach}
							</p>
						</div>
						<div class="rounded-lg bg-[var(--color-bg)] p-3">
							<span class="text-[var(--color-muted)] text-[var(--text-tiny)]">Token Ratio</span>
							<p class="font-mono text-[var(--color-accent)] text-[var(--text-small)]">
								{study.tokenRatio}
							</p>
						</div>
						<div class="rounded-lg bg-[var(--color-bg)] p-3">
							<span class="text-[var(--color-muted)] text-[var(--text-tiny)]">LR Schedule</span>
							<p class="text-[var(--color-text)] text-[var(--text-small)]">{study.lrSchedule}</p>
						</div>
					</div>

					<div>
						<h5 class="mb-2 font-medium text-[var(--color-muted)] text-[var(--text-small)]">
							Key Innovations
						</h5>
						<ul class="grid gap-2 md:grid-cols-2">
							{#each study.keyInnovations as innovation, idx (idx)}
								<li
									class="flex items-start gap-2 text-[var(--color-muted)] text-[var(--text-small)]"
								>
									<span class="mt-1 text-[var(--color-primary)]">•</span>
									{innovation}
								</li>
							{/each}
						</ul>
					</div>
				</ContentBox>
			{/each}
		</div>
	</Section>

	<!-- Industry Trends -->
	<Section title="Emerging Trends">
		<div class="grid gap-4 md:grid-cols-2">
			{#each trends as trend (trend.title)}
				<ContentBox variant="dark" class="transition-colors hover:border-[var(--color-primary)]/50">
					<h4 class="mb-2 font-semibold text-[var(--color-primary)] text-[var(--text-small)]">
						{trend.title}
					</h4>
					<p class="text-[var(--color-muted)] text-[var(--text-small)]">{trend.description}</p>
				</ContentBox>
			{/each}
		</div>
	</Section>

	<!-- Practical Recipe -->
	<Section title="A Practical Scaling Recipe">
		<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
			Based on patterns from these case studies, here's a general recipe for applying scaling laws:
		</p>
		<NumberedSteps steps={scalingRecipe} />
	</Section>

	<KeyTakeaway
		items={[
			'Multiple approaches work: muP, direct fitting, and IsoFLOP all produce good results',
			'Inference matters: Production models over-train relative to Chinchilla to reduce deployment costs',
			'WSD is practical: The warmup-stable-decay schedule enables efficient experimentation and training extensions',
			'Data quality shifts ratios: Better data quality allows higher tokens-per-parameter ratios'
		]}
	/>
</div>
