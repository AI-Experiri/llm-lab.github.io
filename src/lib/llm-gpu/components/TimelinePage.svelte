<!-- ABOUTME: Timeline page for GPU Lab showing evolution of GPU computing -->
<!-- ABOUTME: Three-column timeline: GPU releases (with spec links), DL milestones, supporting links -->

<script>
	import { HeroSection, Section, ContentBox } from '$lib/shared';

	// Combined timeline with GPU releases, DL milestones, and supporting links
	// For reference only - not exhaustive
	const timelineYears = [
		{
			year: '2012',
			gpu: {
				name: 'Tesla K20 (Kepler)',
				specs: '3.5 TFLOP/s FP32, 5GB GDDR5, 208 GB/s',
				specUrl: 'https://www.nvidia.com/content/PDF/kepler/tesla-k20-active-bd-06499-001-v03.pdf'
			},
			milestone: {
				name: 'AlexNet',
				description: 'CNN trained on 2 GTX 580s wins ImageNet'
			},
			sources: [
				{
					label: 'AlexNet Paper',
					url: 'https://papers.nips.cc/paper/2012/hash/c399862d3b9d6b76c8436e924a68c45b-Abstract.html'
				}
			]
		},
		{
			year: '2014',
			gpu: {
				name: 'Tesla K80 (Kepler)',
				specs: '8.7 TFLOP/s FP32, 24GB GDDR5, 480 GB/s',
				specUrl:
					'https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/tesla-product-literature/TeslaK80-datasheet.pdf'
			},
			milestone: {
				name: 'GANs / Seq2Seq',
				description: 'Generative adversarial networks, LSTM translation'
			},
			sources: [
				{ label: 'GAN Paper', url: 'https://arxiv.org/abs/1406.2661' },
				{ label: 'Seq2Seq Paper', url: 'https://arxiv.org/abs/1409.3215' }
			]
		},
		{
			year: '2015',
			gpu: {
				name: 'Tesla M40 (Maxwell)',
				specs: '7 TFLOP/s FP32, 12GB GDDR5, 288 GB/s',
				specUrl:
					'https://www.nvidia.com/content/dam/en-zz/Solutions/design-visualization/documents/NV-DS-Tesla-M40-M40-24GB-Aug17-US-NV-fnl-Web.pdf'
			},
			milestone: {
				name: 'ResNet / BatchNorm',
				description: 'Skip connections, training breakthrough'
			},
			sources: [
				{ label: 'ResNet Paper', url: 'https://arxiv.org/abs/1512.03385' },
				{ label: 'BatchNorm Paper', url: 'https://arxiv.org/abs/1502.03167' }
			]
		},
		{
			year: '2016',
			gpu: {
				name: 'Tesla P100 (Pascal)',
				specs: '10.6 TFLOP/s FP32, 16GB HBM2, 732 GB/s',
				specUrl: 'https://images.nvidia.com/content/tesla/pdf/nvidia-tesla-p100-datasheet.pdf'
			},
			milestone: null,
			sources: []
		},
		{
			year: '2017',
			gpu: {
				name: 'Tesla V100 (Volta)',
				specs: '125 TFLOP/s Tensor, 32GB HBM2, 900 GB/s',
				specUrl:
					'https://images.nvidia.com/content/technologies/volta/pdf/tesla-volta-v100-datasheet-letter-fnl-web.pdf'
			},
			milestone: {
				name: 'Transformer',
				description: 'Attention Is All You Need paper'
			},
			sources: [
				{ label: 'Attention Paper', url: 'https://arxiv.org/abs/1706.03762' },
				{
					label: 'Volta Whitepaper',
					url: 'https://images.nvidia.com/content/volta-architecture/pdf/volta-architecture-whitepaper.pdf'
				}
			]
		},
		{
			year: '2018',
			gpu: null,
			milestone: {
				name: 'BERT',
				description: 'Bidirectional pre-training, transfer learning'
			},
			sources: [
				{ label: 'BERT Paper', url: 'https://arxiv.org/abs/1810.04805' },
				{
					label: 'Mixed Precision (ICLR)',
					url: 'https://arxiv.org/abs/1710.03740'
				}
			]
		},
		{
			year: '2019',
			gpu: null,
			milestone: {
				name: 'GPT-2',
				description: '1.5B params, staged release controversy'
			},
			sources: [
				{
					label: 'GPT-2 Paper',
					url: 'https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf'
				}
			]
		},
		{
			year: '2020',
			gpu: {
				name: 'A100 (Ampere)',
				specs: '312 TFLOP/s Tensor, 80GB HBM2e, 2 TB/s',
				specUrl:
					'https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/a100/pdf/nvidia-a100-datasheet-nvidia-us-2188504-web.pdf'
			},
			milestone: {
				name: 'GPT-3',
				description: '175B params, in-context learning'
			},
			sources: [
				{ label: 'GPT-3 Paper', url: 'https://arxiv.org/abs/2005.14165' },
				{
					label: 'Ampere Whitepaper',
					url: 'https://images.nvidia.com/aem-dam/en-zz/Solutions/data-center/nvidia-ampere-architecture-whitepaper.pdf'
				}
			]
		},
		{
			year: '2022',
			gpu: {
				name: 'H100 (Hopper)',
				specs: '990 TFLOP/s Tensor, 80GB HBM3, 3.35 TB/s',
				specUrl: 'https://resources.nvidia.com/en-us-gpu-resources/h100-datasheet-24306'
			},
			milestone: {
				name: 'ChatGPT',
				description: 'RLHF, AI goes mainstream (trained on A100s)'
			},
			sources: [
				{ label: 'InstructGPT Paper', url: 'https://arxiv.org/abs/2203.02155' },
				{
					label: 'Hopper Whitepaper',
					url: 'https://resources.nvidia.com/en-us-tensor-core/gtc22-whitepaper-hopper'
				}
			]
		},
		{
			year: '2023',
			gpu: null,
			milestone: {
				name: 'GPT-4 / LLaMA',
				description: 'Multimodal GPT, open-weight models'
			},
			sources: [
				{ label: 'GPT-4 Paper', url: 'https://arxiv.org/abs/2303.08774' },
				{ label: 'LLaMA Paper', url: 'https://arxiv.org/abs/2302.13971' }
			]
		},
		{
			year: '2024',
			gpu: {
				name: 'B200 (Blackwell)',
				specs: '9 PFLOP/s FP4, 192GB HBM3e, 8 TB/s',
				specUrl: 'https://resources.nvidia.com/en-us-dgx-systems/dgx-b200-datasheet'
			},
			milestone: null,
			sources: []
		}
	];

	// Precision evolution with verified sources for each claim
	// Each claim links to its source document
	const precisionEvolution = [
		{
			era: '2017-2018',
			format: 'FP16 + FP32 (Mixed Precision)',
			claims: [
				'Loss scaling required to prevent gradient underflow',
				'2-6× speedup on Volta GPUs with Tensor Cores'
			],
			source: {
				label: 'Mixed Precision Training (ICLR 2018)',
				url: 'https://arxiv.org/abs/1710.03740',
				quote:
					'We observed 2-6x speedups for memory or arithmetic bandwidth-limited operations on NVIDIA Volta V100'
			}
		},
		{
			era: '2019+',
			format: 'BF16 + FP32 (Brain Float)',
			claims: [
				'Same exponent range as FP32 (no loss scaling needed)',
				'Drop-in replacement for FP32 in most cases'
			],
			source: {
				label: 'Google Cloud BF16 Blog',
				url: 'https://cloud.google.com/blog/products/ai-machine-learning/bfloat16-the-secret-to-high-performance-on-cloud-tpus',
				quote: 'bfloat16 has the same exponent size as FP32'
			}
		},
		{
			era: '2022+',
			format: 'FP8 + BF16 (H100 Hopper)',
			claims: [
				'Per-tensor scaling required (narrower dynamic range)',
				'Up to 2× speedup over BF16 on H100'
			],
			source: {
				label: 'NVIDIA FP8 Scaling Blog',
				url: 'https://developer.nvidia.com/blog/per-tensor-and-per-block-scaling-strategies-for-effective-fp8-training/',
				quote: 'Hardware-native scaling achieves up to 2x acceleration over BF16'
			}
		}
	];
</script>

<div class="space-y-6">
	<HeroSection icon="📅" title="GPU Computing Timeline">
		<p class="max-w-3xl leading-relaxed text-[var(--color-muted)] text-[var(--text-body)]">
			From gaming hardware to the engines powering trillion-parameter models. GPU compute has scaled
			super-exponentially, driven largely by specialized tensor cores and lower precision formats.
		</p>
		<p class="mt-2 text-[var(--color-muted)]/70 text-[var(--text-tiny)] italic">
			For reference only — not an exhaustive list of all GPU releases or DL milestones.
		</p>
	</HeroSection>

	<!-- GPU & Deep Learning Timeline -->
	<Section title="GPU & Deep Learning Evolution">
		<ContentBox variant="dark">
			<!-- Header row (hidden on small screens) -->
			<div
				class="mb-4 hidden border-b border-[var(--color-muted)]/20 pb-2 md:grid md:grid-cols-12 md:gap-2"
			>
				<div
					class="col-span-2 font-semibold text-[var(--color-accent)] text-[var(--text-tiny)] lg:col-span-1"
				>
					Year
				</div>
				<div class="col-span-4 font-semibold text-[var(--text-tiny)] text-green-400 lg:col-span-4">
					GPU Release
				</div>
				<div class="col-span-3 font-semibold text-[var(--text-tiny)] text-purple-400 lg:col-span-4">
					DL Milestone
				</div>
				<div class="col-span-3 font-semibold text-[var(--text-tiny)] text-cyan-400">Sources</div>
			</div>

			<!-- Timeline rows -->
			<div class="space-y-4 md:space-y-3">
				{#each timelineYears as row (row.year)}
					<!-- Mobile layout (stacked) -->
					<div class="border-b border-[var(--color-muted)]/10 pb-4 last:border-0 md:hidden">
						<div class="mb-2 font-mono text-lg font-bold text-[var(--color-accent)]">
							{row.year}
						</div>
						<div class="space-y-2">
							{#if row.gpu}
								<div>
									<span class="text-[var(--text-tiny)] text-green-400/70">GPU:</span>
									<a
										href={row.gpu.specUrl}
										target="_blank"
										rel="noopener noreferrer external"
										class="ml-1 font-medium text-[var(--text-small)] text-green-400 hover:underline"
									>
										{row.gpu.name}
									</a>
									<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">{row.gpu.specs}</p>
								</div>
							{/if}
							{#if row.milestone}
								<div>
									<span class="text-[var(--text-tiny)] text-purple-400/70">Milestone:</span>
									<span class="ml-1 font-medium text-[var(--text-small)] text-purple-400">
										{row.milestone.name}
									</span>
									<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">
										{row.milestone.description}
									</p>
								</div>
							{/if}
							{#if row.sources && row.sources.length > 0}
								<div class="flex flex-wrap gap-1">
									{#each row.sources as source (source.url)}
										<a
											href={source.url}
											target="_blank"
											rel="noopener noreferrer external"
											class="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[var(--text-tiny)] text-cyan-400 hover:bg-cyan-500/30"
										>
											{source.label}
										</a>
									{/each}
								</div>
							{/if}
						</div>
					</div>

					<!-- Desktop layout (grid) -->
					<div
						class="hidden border-b border-[var(--color-muted)]/10 pb-3 last:border-0 md:grid md:grid-cols-12 md:gap-2"
					>
						<!-- Year -->
						<div class="col-span-2 font-mono font-bold text-[var(--color-accent)] lg:col-span-1">
							{row.year}
						</div>

						<!-- GPU -->
						<div class="col-span-4">
							{#if row.gpu}
								<a
									href={row.gpu.specUrl}
									target="_blank"
									rel="noopener noreferrer external"
									class="font-medium text-[var(--text-small)] text-green-400 hover:underline"
								>
									{row.gpu.name}
								</a>
								<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">{row.gpu.specs}</p>
							{:else}
								<span class="text-[var(--color-muted)]/50 text-[var(--text-tiny)]">—</span>
							{/if}
						</div>

						<!-- Milestone -->
						<div class="col-span-3 lg:col-span-4">
							{#if row.milestone}
								<p class="font-medium text-[var(--text-small)] text-purple-400">
									{row.milestone.name}
								</p>
								<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">
									{row.milestone.description}
								</p>
							{:else}
								<span class="text-[var(--color-muted)]/50 text-[var(--text-tiny)]">—</span>
							{/if}
						</div>

						<!-- Sources -->
						<div class="col-span-3">
							{#if row.sources && row.sources.length > 0}
								<div class="flex flex-wrap gap-1">
									{#each row.sources as source (source.url)}
										<a
											href={source.url}
											target="_blank"
											rel="noopener noreferrer external"
											class="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[var(--text-tiny)] text-cyan-400 hover:bg-cyan-500/30"
										>
											{source.label}
										</a>
									{/each}
								</div>
							{:else}
								<span class="text-[var(--color-muted)]/50 text-[var(--text-tiny)]">—</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</ContentBox>
	</Section>

	<!-- The Precision Evolution (with verified sources) -->
	<Section title="Training Precision Evolution">
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			{#each precisionEvolution as era (era.era)}
				<ContentBox variant="dark" class="border-l-4 border-[var(--color-primary)]">
					<div class="mb-2 flex items-center gap-3">
						<span
							class="rounded bg-[var(--color-primary)]/20 px-2 py-1 font-mono text-[var(--color-primary)] text-[var(--text-tiny)]"
						>
							{era.era}
						</span>
						<h4 class="font-semibold text-[var(--color-text)] text-[var(--text-small)]">
							{era.format}
						</h4>
					</div>
					<ul class="mb-3 space-y-1">
						{#each era.claims as claim, claimIdx (claimIdx)}
							<li class="flex items-start gap-2 text-[var(--color-muted)] text-[var(--text-tiny)]">
								<span class="text-[var(--color-accent)]">•</span>
								{claim}
							</li>
						{/each}
					</ul>
					<a
						href={era.source.url}
						target="_blank"
						rel="noopener noreferrer external"
						class="block rounded border border-cyan-500/30 bg-cyan-500/10 p-2 hover:border-cyan-500/50"
					>
						<p class="font-medium text-[var(--text-tiny)] text-cyan-400">{era.source.label}</p>
						<p class="mt-1 text-[var(--color-muted)] text-[var(--text-tiny)] italic">
							"{era.source.quote}"
						</p>
					</a>
				</ContentBox>
			{/each}
		</div>
	</Section>
</div>
