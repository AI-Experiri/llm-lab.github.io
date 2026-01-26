<!-- ABOUTME: Overview page for GPU Lab -->
<!-- ABOUTME: Introduces GPU computing concepts for LLM training -->

<script>
	import { HeroSection, Section, ContentBox, KeyTakeaway } from '$lib/shared';

	const keyInsights = [
		{
			title: 'Parallel Processing',
			description:
				'GPUs use SIMT (Single Instruction Multi-Thread) to execute the same instruction across thousands of threads simultaneously.',
			icon: '🔀'
		},
		{
			title: 'Memory Bottleneck',
			description:
				'Compute has scaled 100,000x faster than memory bandwidth. Memory movement, not FLOPs, is typically the limiting factor.',
			icon: '🧠'
		},
		{
			title: 'Blessed Operations',
			description:
				'Matrix multiplies are 10-100x faster than other operations thanks to specialized tensor cores. Design your architecture around matmuls.',
			icon: '✨'
		},
		{
			title: 'Hardware Scaling',
			description:
				'From K20 to H100, GPU performance has grown super-exponentially, driven largely by lower precision formats (FP32 → FP16 → INT8).',
			icon: '📈'
		}
	];

	const cpuVsGpu = {
		cpu: {
			title: 'CPU: Latency Optimized',
			points: [
				'Finish each task as quickly as possible',
				'Large control units for branch prediction',
				'Few cores running at high clock speeds',
				'Good for sequential, branching code'
			]
		},
		gpu: {
			title: 'GPU: Throughput Optimized',
			points: [
				'Finish all tasks as quickly as possible',
				'Minimal control logic, maximum ALUs',
				'Thousands of lightweight threads',
				'Good for parallel, uniform operations'
			]
		}
	};

	const lectureTopics = [
		{
			tab: 'Architecture',
			topics: [
				'Streaming Multiprocessors (SMs)',
				'Warps, Blocks, Threads',
				'Execution model',
				'TPU comparison'
			]
		},
		{
			tab: 'Memory',
			topics: [
				'Physical chip layout',
				'L1/L2/HBM hierarchy',
				'Access latencies (20 vs 300 cycles)',
				'Shared vs Global memory'
			]
		},
		{
			tab: 'Intensity',
			topics: [
				'Arithmetic intensity (FLOPs/byte)',
				'Roofline model',
				'Memory vs compute bound',
				'Tiling math'
			]
		},
		{
			tab: 'Optimization',
			topics: ['Lower precision', 'Operator fusion', 'Recomputation', 'Memory coalescing', 'Tiling']
		}
	];

	const references = [
		{
			title: 'Stanford CS336: Language Modeling from Scratch',
			url: 'https://stanford-cs336.github.io/spring2025/',
			description: 'Lectures 2, 5 & 6: PyTorch, GPUs, Kernels & Triton'
		},
		{
			title: 'Bill Dally - Hot Chips 2023 Keynote',
			url: 'https://hc2023.hotchips.org/assets/program/conference/day2/Keynote%202/Keynote-NVIDIA_Hardware-for-Deep-Learning.pdf',
			description: 'Hardware for Deep Learning'
		},
		{
			title: "Horace He's GPU Blog",
			url: 'https://horace.io/',
			description: 'Fun GPU facts and performance insights'
		},
		{
			title: 'GPU Mode',
			url: 'https://github.com/gpu-mode',
			description: 'Community resources for CUDA programming'
		}
	];
</script>

<div class="space-y-6">
	<HeroSection icon="🖥️" title="Understanding GPU Computing">
		<p class="max-w-3xl leading-relaxed text-[var(--color-muted)] text-[var(--text-body)]">
			GPUs are the hardware that makes large language models possible. Understanding how they
			work—and why they get slow in mysterious ways—is essential for building efficient training and
			inference systems.
		</p>
		<div class="mt-4 flex flex-wrap gap-3">
			<span
				class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-[var(--color-accent)] text-[var(--text-small)]"
			>
				CUDA
			</span>
			<span
				class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-[var(--color-accent)] text-[var(--text-small)]"
			>
				Memory Hierarchy
			</span>
			<span
				class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-[var(--color-accent)] text-[var(--text-small)]"
			>
				FlashAttention
			</span>
		</div>
	</HeroSection>

	<!-- The Mystery -->
	<Section title="The Mystery">
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<ContentBox variant="dark" class="transition-colors hover:border-[var(--color-primary)]/50">
				<a
					href="https://www.thonking.ai/p/what-shapes-do-matrix-multiplications"
					target="_blank"
					rel="noopener noreferrer"
					class="block"
				>
					<img
						src="/images/llm-gpu/matmul-flops.webp"
						alt="FLOPs achieved for square matmuls showing mysterious wavy patterns"
						class="w-full rounded-lg transition-opacity hover:opacity-90"
					/>
				</a>
				<p class="mt-2 text-center text-[var(--color-muted)] text-[var(--text-tiny)]">
					Source:
					<a
						href="https://www.thonking.ai/p/what-shapes-do-matrix-multiplications"
						target="_blank"
						rel="noopener noreferrer"
						class="text-[var(--color-accent)] hover:underline"
					>
						Horace He - "What Shapes Do Matrix Multiplications Like?"
					</a>
				</p>
			</ContentBox>

			<ContentBox variant="dark" class="flex flex-col justify-center">
				<h4 class="mb-3 font-semibold text-[var(--color-text)]">
					Why do GPUs get slow in mysterious, wavy patterns?
				</h4>
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">
					As you increase matrix multiply sizes, you might expect performance to smoothly increase.
					Instead, you see unpredictable wave-like patterns—fast at certain multiples, slow at
					others.
				</p>
				<p class="mt-4 font-medium text-[var(--color-accent)] text-[var(--text-small)]">
					By the end of this lab, you'll understand exactly why.
				</p>
			</ContentBox>
		</div>
	</Section>

	<!-- Key Insights Grid -->
	<Section title="Key Insights">
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			{#each keyInsights as insight (insight.title)}
				<ContentBox variant="dark" class="transition-colors hover:border-[var(--color-primary)]/50">
					<div class="flex items-start gap-3">
						<span class="text-2xl">{insight.icon}</span>
						<div>
							<h4 class="mb-1 font-semibold text-[var(--color-text)]">{insight.title}</h4>
							<p class="text-[var(--color-muted)] text-[var(--text-small)]">
								{insight.description}
							</p>
						</div>
					</div>
				</ContentBox>
			{/each}
		</div>
	</Section>

	<!-- CPU vs GPU -->
	<Section title="CPU vs GPU: Different Design Goals">
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<ContentBox variant="dark" class="flex flex-col border border-blue-500/30">
				<h4 class="mb-3 font-semibold text-blue-400">{cpuVsGpu.cpu.title}</h4>
				<ul class="space-y-2">
					{#each cpuVsGpu.cpu.points as point, cpuPointIdx (cpuPointIdx)}
						<li class="flex items-center gap-2 text-[var(--color-muted)] text-[var(--text-small)]">
							<span class="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
							{point}
						</li>
					{/each}
				</ul>
				<!-- CPU Architecture Diagram -->
				<div class="mt-auto pt-4">
					<div
						class="rounded-lg border border-blue-500/40 bg-gradient-to-br from-slate-800 via-slate-700 to-zinc-800 p-3 shadow-inner"
					>
						<div class="space-y-1">
							<!-- Row 1: Control Unit -->
							<div
								class="rounded border border-blue-400/50 bg-blue-500/20 py-1 text-center text-[var(--text-tiny)] text-blue-300 shadow-sm"
							>
								Control Unit (Branch Prediction, Out-of-Order)
							</div>
							<!-- Row 2: Cache -->
							<div
								class="rounded border border-blue-400/30 bg-blue-500/10 py-1 text-center text-[var(--text-tiny)] text-blue-300"
							>
								L1/L2/L3 Cache
							</div>
							<!-- Row 3: ALUs -->
							<div class="flex gap-1">
								{#each Array(2) as _, cpuAluIdx (cpuAluIdx)}
									<div
										class="flex-1 rounded border border-cyan-400/50 bg-cyan-500/25 py-1 text-center font-medium text-[var(--text-tiny)] text-cyan-300 shadow-sm"
									>
										ALU
									</div>
								{/each}
							</div>
						</div>
					</div>
					<p class="mt-2 text-center text-[var(--text-tiny)] text-slate-400">
						Few powerful cores, large control logic
					</p>
				</div>
			</ContentBox>

			<ContentBox variant="dark" class="flex flex-col border border-green-500/30">
				<h4 class="mb-3 font-semibold text-green-400">{cpuVsGpu.gpu.title}</h4>
				<ul class="space-y-2">
					{#each cpuVsGpu.gpu.points as point, gpuPointIdx (gpuPointIdx)}
						<li class="flex items-center gap-2 text-[var(--color-muted)] text-[var(--text-small)]">
							<span class="h-1.5 w-1.5 rounded-full bg-green-400"></span>
							{point}
						</li>
					{/each}
				</ul>
				<!-- GPU Architecture Diagram -->
				<div class="mt-auto pt-4">
					<div
						class="rounded-lg border border-green-500/40 bg-gradient-to-br from-slate-800 via-slate-700 to-zinc-800 p-3 shadow-inner"
					>
						<div class="space-y-1">
							{#each Array(3) as _, rowIdx (rowIdx)}
								<div class="flex gap-1">
									<div
										class="w-9 rounded border border-green-400/40 bg-green-500/15 p-1 text-center text-[var(--text-tiny)] text-green-300"
									>
										Ctrl
									</div>
									<div class="grid flex-1 grid-cols-8 gap-0.5">
										{#each Array(8) as _, aluIdx (`row${rowIdx}-alu${aluIdx}`)}
											<div
												class="rounded border border-cyan-400/40 bg-cyan-500/25 py-1 text-center text-[var(--text-tiny)] text-cyan-300 shadow-sm"
											>
												ALU
											</div>
										{/each}
									</div>
								</div>
							{/each}
						</div>
					</div>
					<p class="mt-2 text-center text-[var(--text-tiny)] text-slate-400">
						Many simple cores, minimal control logic
					</p>
				</div>
			</ContentBox>
		</div>
	</Section>

	<!-- Compute vs Memory Scaling -->
	<Section title="The Scaling Gap">
		<ContentBox variant="dark">
			<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
				From Bill Dally's keynote: Compute has scaled dramatically faster than memory bandwidth.
			</p>

			<!-- Scaling comparison -->
			<div class="grid grid-cols-3 gap-4 text-center">
				<div class="rounded-lg border border-pink-500/30 bg-pink-500/10 p-4">
					<p class="font-mono text-2xl font-bold text-pink-400">100,000×</p>
					<p class="mt-1 text-[var(--text-tiny)] text-slate-400">Compute (matmul FLOPs)</p>
				</div>
				<div class="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-4">
					<p class="font-mono text-2xl font-bold text-cyan-400">100×</p>
					<p class="mt-1 text-[var(--text-tiny)] text-slate-400">Memory Bandwidth</p>
				</div>
				<div class="rounded-lg border border-purple-500/30 bg-purple-500/10 p-4">
					<p class="font-mono text-2xl font-bold text-purple-400">10×</p>
					<p class="mt-1 text-[var(--text-tiny)] text-slate-400">Host Connectivity</p>
				</div>
			</div>

			<!-- Gap indicator -->
			<div
				class="mt-4 flex items-center justify-center gap-2 rounded-lg border border-pink-500/30 bg-pink-500/10 p-2"
			>
				<span class="text-pink-400">⚡</span>
				<span class="font-medium text-[var(--text-tiny)] text-pink-300"
					>Compute scaled 1000× faster than memory bandwidth</span
				>
			</div>

			<p class="mt-4 text-[var(--color-muted)] text-[var(--text-small)]">
				This gap means memory movement is increasingly the bottleneck. Optimizing for fewer memory
				accesses matters more than reducing FLOPs.
			</p>
		</ContentBox>
	</Section>

	<!-- What You'll Learn -->
	<Section title="What You'll Learn">
		<!-- Learning Goals -->
		<div class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
			<ContentBox variant="dark" class="border border-[var(--color-primary)]/30">
				<h4 class="mb-2 font-medium text-[var(--color-primary)]">1. Understand GPUs</h4>
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">
					Feel comfortable with how GPUs work: SMs, warps, memory hierarchy, and execution model.
				</p>
				<p class="mt-2 text-[var(--color-accent)] text-[var(--text-tiny)]">Architecture • Memory</p>
			</ContentBox>
			<ContentBox variant="dark" class="border border-[var(--color-primary)]/30">
				<h4 class="mb-2 font-medium text-[var(--color-primary)]">2. Accelerate Algorithms</h4>
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">
					Feel comfortable accelerating parts of your models with CUDA. Understand what makes code
					fast or slow.
				</p>
				<p class="mt-2 text-[var(--color-accent)] text-[var(--text-tiny)]">
					Intensity • Optimization
				</p>
			</ContentBox>
		</div>

		<!-- Topics -->
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			{#each lectureTopics as topic (topic.tab)}
				<ContentBox variant="dark">
					<h4 class="mb-3 font-semibold text-[var(--color-accent)]">{topic.tab}</h4>
					<ul class="space-y-2">
						{#each topic.topics as item, i (i)}
							<li
								class="flex items-center gap-2 text-[var(--color-muted)] text-[var(--text-small)]"
							>
								<span class="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]"></span>
								{item}
							</li>
						{/each}
					</ul>
				</ContentBox>
			{/each}
		</div>
	</Section>

	<!-- References -->
	<Section title="References">
		<ul class="space-y-2 text-[var(--text-small)]">
			{#each references as ref, i (ref.title)}
				<li class="flex items-start gap-3">
					<span class="font-medium text-[var(--color-primary)]">{i + 1}.</span>
					<div>
						<a
							href={ref.url}
							target="_blank"
							rel="noopener noreferrer external"
							class="text-[var(--color-accent)] hover:underline"
						>
							{ref.title}
						</a>
						{#if ref.description}
							<span class="text-[var(--color-muted)]"> — {ref.description}</span>
						{/if}
					</div>
				</li>
			{/each}
		</ul>
	</Section>

	<KeyTakeaway
		items={[
			'GPUs optimize for throughput (all tasks fast) not latency (each task fast)',
			'Memory bandwidth is the bottleneck—compute has scaled 1000x faster',
			'Matrix multiplies are "blessed operations" with 10-100x speedup via tensor cores',
			'Understanding memory hierarchy is key to writing fast GPU code'
		]}
	/>
</div>
