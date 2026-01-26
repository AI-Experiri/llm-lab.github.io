<!-- ABOUTME: Architecture page for GPU Lab covering GPU hardware structure -->
<!-- ABOUTME: Covers SMs, SPs, Tensor Cores, warps, threads, blocks, grids, SIMT -->

<script>
	import { HeroSection, Section, ContentBox, KeyTakeaway, ComparisonGrid } from '$lib/shared';

	// GPU selector state
	let selectedGpu = $state('h100');

	// GPU specifications - SOURCE: Official NVIDIA datasheets
	const gpuSpecs = {
		h100: {
			name: 'NVIDIA H100',
			arch: 'Hopper',
			sms: 132,
			spPerSm: 128,
			tensorCoresPerSm: 4,
			totalSps: 132 * 128,
			totalTensorCores: 132 * 4,
			memory: '80 GB',
			memoryType: 'HBM3',
			bandwidth: '3.35 TB/s',
			l2Cache: '50 MB',
			sharedMemPerSm: '228 KB',
			color: 'pink',
			source: 'https://resources.nvidia.com/en-us-gpu-resources/h100-datasheet-24306'
		},
		rtxPro6000: {
			name: 'RTX PRO 6000',
			arch: 'Blackwell',
			sms: 170,
			spPerSm: 128,
			tensorCoresPerSm: 4,
			totalSps: 170 * 128,
			totalTensorCores: 170 * 4,
			memory: '96 GB',
			memoryType: 'GDDR7',
			bandwidth: '1.8 TB/s',
			l2Cache: '96 MB',
			sharedMemPerSm: '228 KB',
			color: 'emerald',
			source: 'https://www.nvidia.com/en-us/design-visualization/rtx-pro-6000/'
		},
		a100: {
			name: 'NVIDIA A100',
			arch: 'Ampere',
			sms: 108,
			spPerSm: 64,
			tensorCoresPerSm: 4,
			totalSps: 108 * 64,
			totalTensorCores: 108 * 4,
			memory: '80 GB',
			memoryType: 'HBM2e',
			bandwidth: '2.0 TB/s',
			l2Cache: '40 MB',
			sharedMemPerSm: '164 KB',
			color: 'cyan',
			source:
				'https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/a100/pdf/nvidia-a100-datasheet-nvidia-us-2188504-web.pdf'
		}
	};

	const executionHierarchy = [
		{
			title: 'Thread',
			color: 'cyan',
			points: ['Smallest unit of execution', 'Has private registers', 'Runs one instance of kernel']
		},
		{
			title: 'Warp (32 threads)',
			color: 'blue',
			points: [
				'Executes in lockstep (SIMT)',
				'All run same instruction',
				'Divergence causes serialization'
			]
		},
		{
			title: 'Block (up to 1024 threads)',
			color: 'purple',
			points: ['Runs on single SM', 'Shares shared memory', 'Can synchronize threads']
		},
		{
			title: 'Grid (many blocks)',
			color: 'pink',
			points: ['Entire kernel launch', 'Blocks distributed to SMs', 'No cross-block sync']
		}
	];
</script>

<div class="space-y-6">
	<HeroSection icon="🏗️" title="GPU Architecture">
		<p class="max-w-3xl leading-relaxed text-[var(--color-muted)] text-[var(--text-body)]">
			GPUs are massively parallel processors organized into Streaming Multiprocessors (SMs).
			Understanding this hierarchy is key to writing efficient GPU code.
		</p>
	</HeroSection>

	<!-- GPU at a Glance -->
	<Section title="GPU at a Glance">
		<!-- GPU Selector Tabs -->
		<div class="mb-4 flex gap-2">
			{#each Object.entries(gpuSpecs) as [key, gpu] (key)}
				<button
					class="rounded-lg px-4 py-2 text-[var(--text-small)] transition-all {selectedGpu === key
						? 'bg-[var(--color-primary)] font-semibold text-white'
						: 'bg-[var(--color-secondary)] text-[var(--color-muted)] hover:bg-[var(--color-muted)]/20'}"
					onclick={() => (selectedGpu = key)}
				>
					{gpu.name}
				</button>
			{/each}
		</div>

		<ContentBox variant="dark">
			<!-- GPU Overview Diagram -->
			<div
				class="rounded-lg border border-[var(--color-muted)]/30 bg-gradient-to-br from-slate-800 via-slate-700 to-zinc-800 p-6 shadow-inner"
			>
				<div class="mb-4 flex items-center justify-center gap-3">
					<span
						class="rounded-full bg-[var(--color-primary)]/20 px-4 py-1 font-semibold text-[var(--color-primary)]"
					>
						{gpuSpecs[selectedGpu].name}
					</span>
					<span
						class="rounded bg-[var(--color-accent)]/20 px-2 py-0.5 text-[var(--color-accent)] text-[var(--text-tiny)]"
					>
						{gpuSpecs[selectedGpu].arch}
					</span>
				</div>

				<!-- SMs Grid -->
				<div class="mb-4">
					<div class="mb-2 flex items-center justify-between">
						<span class="text-[var(--color-muted)] text-[var(--text-tiny)]"
							>{gpuSpecs[selectedGpu].sms} Streaming Multiprocessors</span
						>
						<span class="text-[var(--color-accent)] text-[var(--text-tiny)]"
							>{gpuSpecs[selectedGpu].totalSps.toLocaleString()} CUDA Cores • {gpuSpecs[selectedGpu]
								.totalTensorCores} Tensor Cores</span
						>
					</div>
					<div class="grid grid-cols-8 gap-1 md:grid-cols-12 lg:grid-cols-16">
						{#each Array(32) as _, i (i)}
							<div
								class="group relative flex h-8 items-center justify-center rounded border border-cyan-500/30 bg-cyan-500/10 transition-all hover:border-cyan-400 hover:bg-cyan-500/20"
							>
								<span class="text-[8px] text-cyan-400">SM</span>
								<div
									class="absolute -top-8 left-1/2 z-10 hidden -translate-x-1/2 rounded bg-zinc-800 px-2 py-1 text-[10px] whitespace-nowrap text-white group-hover:block"
								>
									{gpuSpecs[selectedGpu].spPerSm} SPs + {gpuSpecs[selectedGpu].tensorCoresPerSm} TC
								</div>
							</div>
						{/each}
						<div
							class="col-span-2 flex items-center justify-center text-[var(--color-muted)] text-[var(--text-tiny)]"
						>
							...×{gpuSpecs[selectedGpu].sms}
						</div>
					</div>
				</div>

				<!-- L2 Cache Bar -->
				<div class="my-4">
					<div
						class="flex h-8 items-center justify-center rounded-lg border-2 border-purple-500/50 bg-gradient-to-r from-purple-500/20 via-purple-500/30 to-purple-500/20"
					>
						<span class="font-semibold text-[var(--text-small)] text-purple-400"
							>L2 Cache — {gpuSpecs[selectedGpu].l2Cache}</span
						>
					</div>
				</div>

				<!-- Memory Bar -->
				<div
					class="rounded-lg border-2 border-pink-500/50 bg-gradient-to-r from-pink-500/10 via-pink-500/20 to-pink-500/10 p-3"
				>
					<div class="flex items-center justify-between">
						<span class="font-semibold text-pink-400"
							>{gpuSpecs[selectedGpu].memoryType} Memory</span
						>
						<span class="text-[var(--color-muted)] text-[var(--text-tiny)]"
							>{gpuSpecs[selectedGpu].memory} @ {gpuSpecs[selectedGpu].bandwidth}</span
						>
					</div>
					<div class="mt-2 flex gap-2">
						{#each Array(gpuSpecs[selectedGpu].memoryType.includes('HBM') ? 6 : 12) as _, i (i)}
							<div class="flex-1 rounded bg-pink-500/30 py-1 text-center text-[10px] text-pink-300">
								{gpuSpecs[selectedGpu].memoryType.includes('HBM')
									? `Stack ${i + 1}`
									: `Ch ${i + 1}`}
							</div>
						{/each}
					</div>
				</div>

				<!-- Legend -->
				<div class="mt-4 flex flex-wrap justify-center gap-4 text-[var(--text-tiny)]">
					<span class="text-[var(--color-muted)]">SM = Streaming Multiprocessor</span>
					<span class="text-[var(--color-muted)]">SP = CUDA Core</span>
					<span class="text-[var(--color-muted)]">TC = Tensor Core</span>
				</div>
			</div>
		</ContentBox>

		<div class="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
			<ContentBox variant="dark" class="text-center">
				<p class="font-mono text-2xl text-[var(--color-primary)]">{gpuSpecs[selectedGpu].sms}</p>
				<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">SMs</p>
			</ContentBox>
			<ContentBox variant="dark" class="text-center">
				<p class="font-mono text-2xl text-[var(--color-accent)]">
					{gpuSpecs[selectedGpu].totalSps.toLocaleString()}
				</p>
				<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">CUDA Cores</p>
			</ContentBox>
			<ContentBox variant="dark" class="text-center">
				<p class="font-mono text-2xl text-pink-400">{gpuSpecs[selectedGpu].totalTensorCores}</p>
				<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">Tensor Cores</p>
			</ContentBox>
			<ContentBox variant="dark" class="text-center">
				<p class="font-mono text-2xl text-purple-400">{gpuSpecs[selectedGpu].memory}</p>
				<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">
					{gpuSpecs[selectedGpu].memoryType}
				</p>
			</ContentBox>
		</div>

		<!-- Source link -->
		<div class="mt-2 text-center">
			<a
				href={gpuSpecs[selectedGpu].source}
				target="_blank"
				rel="noopener noreferrer external"
				class="text-[var(--color-accent)] text-[var(--text-tiny)] hover:underline"
			>
				Official {gpuSpecs[selectedGpu].name} Datasheet →
			</a>
		</div>
	</Section>

	<!-- Streaming Multiprocessor -->
	<Section title="Inside a Streaming Multiprocessor">
		<ContentBox variant="dark">
			<!-- SM Diagram -->
			<div
				class="rounded-lg border border-[var(--color-muted)]/30 bg-gradient-to-br from-slate-800 via-slate-700 to-zinc-800 p-4 shadow-inner"
			>
				<div class="mb-4 flex items-center justify-center gap-3">
					<span
						class="rounded bg-[var(--color-primary)]/20 px-3 py-1 font-semibold text-[var(--color-primary)] text-[var(--text-small)]"
					>
						Streaming Multiprocessor (SM)
					</span>
					<span class="text-[var(--color-muted)] text-[var(--text-tiny)]">
						{gpuSpecs[selectedGpu].name}
					</span>
				</div>

				<!-- Warp Schedulers -->
				<div class="mb-4 grid grid-cols-4 gap-2">
					{#each Array(4) as _, wsIdx (wsIdx)}
						<div
							class="rounded border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 p-2 text-center"
						>
							<span class="text-[var(--color-accent)] text-[var(--text-tiny)]">Warp Scheduler</span>
							<div class="mt-1 text-center text-lg">↓</div>
						</div>
					{/each}
				</div>

				<!-- CUDA Cores Grid -->
				<div class="mb-4 rounded border border-cyan-500/30 bg-cyan-500/5 p-3">
					<div class="mb-2 text-center text-[var(--text-tiny)] text-cyan-400">
						{gpuSpecs[selectedGpu].spPerSm} Streaming Processors (SPs) / CUDA Cores
					</div>
					<div class="grid grid-cols-16 gap-1">
						{#each Array(gpuSpecs[selectedGpu].spPerSm) as _, spIdx (spIdx)}
							<div class="h-4 rounded-sm bg-cyan-400/60"></div>
						{/each}
					</div>
				</div>

				<!-- Tensor Cores -->
				<div class="mb-4 rounded border border-pink-500/30 bg-pink-500/5 p-3">
					<div class="mb-2 text-center text-[var(--text-tiny)] text-pink-400">
						{gpuSpecs[selectedGpu].tensorCoresPerSm} Tensor Cores (TCs)
					</div>
					<div class="grid grid-cols-4 gap-2">
						{#each Array(gpuSpecs[selectedGpu].tensorCoresPerSm) as _, tcIdx (tcIdx)}
							<div
								class="flex h-12 flex-col items-center justify-center rounded border border-pink-500/30 bg-pink-500/20"
							>
								<span class="text-[10px] font-medium text-pink-400">TC {tcIdx + 1}</span>
								<span class="text-[8px] text-pink-300">Matrix Multiply-Accumulate</span>
							</div>
						{/each}
					</div>
				</div>

				<!-- Shared Memory -->
				<div class="mb-3 rounded border border-green-500/30 bg-green-500/10 p-3 text-center">
					<span class="font-medium text-[var(--text-small)] text-green-400"
						>Shared Memory / L1 Cache</span
					>
					<span class="ml-2 text-[var(--color-muted)] text-[var(--text-tiny)]"
						>{gpuSpecs[selectedGpu].sharedMemPerSm}</span
					>
				</div>

				<!-- Register File -->
				<div class="rounded border border-yellow-500/30 bg-yellow-500/10 p-3 text-center">
					<span class="font-medium text-[var(--text-small)] text-yellow-400">Register File</span>
					<span class="ml-2 text-[var(--color-muted)] text-[var(--text-tiny)]">256 KB</span>
				</div>
			</div>
		</ContentBox>

		<div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
			<ContentBox variant="dark" class="border border-cyan-500/30">
				<h4 class="mb-2 font-semibold text-cyan-400">Streaming Processors (SPs) / CUDA Cores</h4>
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">
					General-purpose processors for FP32 (32-bit floating point) and INT32 (32-bit integer)
					operations. Execute standard math: add, multiply, compare.
				</p>
			</ContentBox>
			<ContentBox variant="dark" class="border border-pink-500/30">
				<h4 class="mb-2 font-semibold text-pink-400">Tensor Cores (TCs)</h4>
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">
					Specialized for MMA (Matrix Multiply-Accumulate): D = A×B + C. 10-100× faster than SPs for
					matrix operations.
				</p>
			</ContentBox>
		</div>
	</Section>

	<!-- Execution Hierarchy -->
	<Section title="Execution Hierarchy: Thread → Warp → Block → Grid">
		<ComparisonGrid columns={4} items={executionHierarchy} />

		<ContentBox variant="dark" class="mt-4">
			<!-- All three sections in one row -->
			<div class="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3">
				<!-- Explanation of how work is organized -->
				<div
					class="flex flex-col rounded border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 p-3"
				>
					<p class="mb-2 text-[var(--color-text)] text-[var(--text-small)]">
						<strong>How GPU work is organized:</strong>
					</p>
					<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">
						When you launch a GPU function (called a <strong class="text-[var(--color-accent)]"
							>kernel</strong
						>), you specify how many parallel workers to create:
					</p>
					<ul class="mt-2 flex-1 space-y-1 text-[var(--color-muted)] text-[var(--text-tiny)]">
						<li>• <strong class="text-pink-400">Grid</strong> = entire job</li>
						<li>
							• <strong class="text-purple-400">Block</strong> = threads that share memory
							<ul class="mt-1 ml-3">
								<li>
									◦ <strong class="text-green-400">Tile</strong> = chunk of data a block computes; fits
									in shared memory for reuse
								</li>
							</ul>
						</li>
						<li>• <strong class="text-blue-400">Warp</strong> = 32 threads in lockstep</li>
						<li>• <strong class="text-cyan-400">Thread</strong> = single worker</li>
					</ul>
				</div>

				<!-- Grid -->
				<div class="flex flex-col rounded-lg border-2 border-pink-500/50 bg-pink-500/5 p-4">
					<div class="mb-2 text-center font-semibold text-pink-400">GRID (entire job)</div>
					<div class="flex flex-1 items-center justify-center">
						<div class="grid grid-cols-3 gap-2">
							{#each Array(6) as _, blkIdx (blkIdx)}
								<div
									class="flex h-12 w-12 flex-col items-center justify-center rounded border border-purple-500/50 bg-purple-500/10 transition-all hover:bg-purple-500/20"
								>
									<span class="text-[9px] font-medium text-purple-400">Block</span>
									<span class="text-[8px] text-purple-300"
										>({Math.floor(blkIdx / 3)},{blkIdx % 3})</span
									>
								</div>
							{/each}
						</div>
					</div>
					<p class="mt-2 text-center text-[10px] text-[var(--color-muted)]">6 blocks in 2×3 grid</p>
				</div>

				<!-- Block Detail -->
				<div class="flex flex-col rounded-lg border-2 border-purple-500/50 bg-purple-500/5 p-4">
					<div class="mb-2 text-center font-semibold text-purple-400">Inside a Block</div>
					<div class="flex-1 space-y-1">
						{#each Array(4) as _, warpIdx (warpIdx)}
							<div
								class="flex items-center gap-2 rounded border border-blue-500/30 bg-blue-500/10 px-2 py-1"
							>
								<span class="font-medium text-[var(--text-tiny)] text-blue-400">Warp {warpIdx}</span
								>
								<span class="text-[9px] text-[var(--color-muted)]"
									>Threads {warpIdx * 32}-{warpIdx * 32 + 31}</span
								>
							</div>
						{/each}
					</div>
					<p class="mt-2 text-center text-[10px] text-[var(--color-muted)]">
						up to 32 warps (1024 threads)
					</p>
				</div>
			</div>
		</ContentBox>

		<!-- Matrix Multiplication Example -->
		<ContentBox variant="dark" class="mt-4">
			<h4 class="mb-3 font-semibold text-[var(--color-text)]">
				Example: Matrix Multiply C = A × B
			</h4>
			<p class="mb-3 text-[var(--color-muted)] text-[var(--text-small)]">
				Multiply a <strong class="text-cyan-400">64×128</strong> matrix by a
				<strong class="text-cyan-400">128×64</strong> matrix to get a
				<strong class="text-pink-400">64×64</strong> output (4,096 elements).
			</p>

			<div class="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
				<!-- Left: GPU Mapping -->
				<div
					class="flex flex-col rounded border border-[var(--color-muted)]/30 bg-[var(--color-bg)] p-3"
				>
					<p class="mb-2 font-medium text-[var(--color-accent)] text-[var(--text-small)]">
						GPU Mapping
					</p>
					<ul class="flex-1 space-y-2 text-[var(--text-tiny)]">
						<li class="flex items-start gap-2">
							<span class="font-semibold text-cyan-400">Thread:</span>
							<span class="text-[var(--color-muted)]"
								>Computes <strong class="text-[var(--color-text)]">1 element</strong> of C</span
							>
						</li>
						<li class="flex items-start gap-2">
							<span class="font-semibold text-blue-400">Warp:</span>
							<span class="text-[var(--color-muted)]"
								>32 threads compute <strong class="text-[var(--color-text)]">32 elements</strong> in lockstep</span
							>
						</li>
						<li class="flex items-start gap-2">
							<span class="font-semibold text-purple-400">Block:</span>
							<span class="text-[var(--color-muted)]"
								>16×16 = 256 threads compute a <strong class="text-green-400">16×16 tile</strong> of C</span
							>
						</li>
						<li class="flex items-start gap-2">
							<span class="font-semibold text-pink-400">Grid:</span>
							<span class="text-[var(--color-muted)]"
								>4×4 = 16 blocks cover all <strong class="text-[var(--color-text)]"
									>4,096 elements</strong
								></span
							>
						</li>
					</ul>
					<div
						class="mt-3 space-y-1 border-t border-[var(--color-muted)]/20 pt-2 text-[var(--text-tiny)]"
					>
						<p class="text-[var(--color-muted)]">
							16 blocks × 256 threads = <strong class="text-[var(--color-text)]"
								>4,096 threads</strong
							>
						</p>
						<p class="text-[var(--color-muted)]">
							256 threads ÷ 32 = <strong class="text-[var(--color-text)]">8 warps/block</strong>
						</p>
					</div>
				</div>

				<!-- Right: Visual diagram -->
				<div class="flex flex-col rounded border border-pink-500/30 bg-pink-500/5 p-3">
					<p class="mb-2 text-center font-medium text-[var(--text-small)] text-pink-400">
						Output Matrix C (64×64)
					</p>
					<div class="flex flex-1 items-center justify-center">
						<div class="grid grid-cols-4 gap-1">
							{#each Array(16) as _, blockIdx (blockIdx)}
								<div
									class="flex h-12 w-12 flex-col items-center justify-center rounded border border-purple-500/50 bg-purple-500/10 text-center transition-all hover:bg-purple-500/20"
								>
									<span class="text-[8px] font-medium text-purple-400">Block</span>
									<span class="text-[7px] text-purple-300"
										>({Math.floor(blockIdx / 4)},{blockIdx % 4})</span
									>
									<span class="text-[6px] text-[var(--color-muted)]">16×16</span>
								</div>
							{/each}
						</div>
					</div>
					<p class="mt-2 text-center text-[var(--color-muted)] text-[var(--text-tiny)]">
						4×4 grid of blocks, each computing a <span class="text-green-400">16×16 tile</span>
					</p>
				</div>
			</div>
		</ContentBox>
	</Section>

	<!-- SIMT Execution -->
	<Section title="SIMT: Single Instruction, Multiple Threads">
		<ContentBox variant="dark" class="border-l-4 border-[var(--color-primary)]">
			<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
				All 32 threads in a warp execute the <strong class="text-[var(--color-accent)]"
					>same instruction</strong
				> at the same time. This is efficient when all threads take the same path. Divergence is costly.
			</p>
		</ContentBox>

		<div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
			<ContentBox variant="dark" class="border border-green-500/30">
				<h4 class="mb-3 font-semibold text-green-400">Uniform Execution (Fast)</h4>
				<!-- Uniform execution diagram -->
				<div
					class="rounded-lg bg-gradient-to-br from-slate-800 via-slate-700 to-zinc-800 p-3 shadow-inner"
				>
					<div class="mb-2 text-[var(--color-muted)] text-[var(--text-tiny)]">
						if (x &gt; 0) — all threads true
					</div>
					<div class="flex gap-[2px]">
						{#each Array(32) as _, uniformIdx (uniformIdx)}
							<div class="h-6 w-2 rounded-sm bg-green-400" title="Active"></div>
						{/each}
					</div>
					<div class="mt-2 flex items-center gap-2 text-[var(--text-tiny)]">
						<div class="h-3 w-3 rounded-sm bg-green-400"></div>
						<span class="text-green-400">All 32 threads execute → Full throughput</span>
					</div>
				</div>
			</ContentBox>

			<ContentBox variant="dark" class="border border-red-500/30">
				<h4 class="mb-3 font-semibold text-red-400">Divergent Execution (Slow)</h4>
				<!-- Divergent execution diagram -->
				<div
					class="rounded-lg bg-gradient-to-br from-slate-800 via-slate-700 to-zinc-800 p-3 shadow-inner"
				>
					<div class="mb-2 text-[var(--color-muted)] text-[var(--text-tiny)]">
						if (threadIdx % 2 == 0)
					</div>
					<div class="mb-1 flex gap-[2px]">
						{#each Array(32) as _, divIdx1 (divIdx1)}
							<div
								class="h-6 w-2 rounded-sm {divIdx1 % 2 === 0 ? 'bg-cyan-400' : 'bg-zinc-700'}"
								title={divIdx1 % 2 === 0 ? 'Active' : 'Masked'}
							></div>
						{/each}
					</div>
					<div class="mb-2 text-[10px] text-[var(--color-muted)]">Cycle 1: Even threads</div>
					<div class="mb-1 flex gap-[2px]">
						{#each Array(32) as _, divIdx2 (divIdx2)}
							<div
								class="h-6 w-2 rounded-sm {divIdx2 % 2 !== 0 ? 'bg-pink-400' : 'bg-zinc-700'}"
								title={divIdx2 % 2 !== 0 ? 'Active' : 'Masked'}
							></div>
						{/each}
					</div>
					<div class="text-[10px] text-[var(--color-muted)]">Cycle 2: Odd threads</div>
					<div class="mt-2 text-[var(--text-tiny)] text-red-400">→ 50% throughput (serialized)</div>
				</div>
			</ContentBox>
		</div>

		<ContentBox variant="dark" class="mt-4">
			<p class="text-center text-[var(--color-primary)] text-[var(--text-small)]">
				<strong>Rule:</strong> Minimize branch divergence within warps. Divergence across warps (different
				blocks) is fine.
			</p>
		</ContentBox>
	</Section>

	<!-- Warp Scheduling -->
	<Section title="Warp Scheduling: Hiding Latency">
		<ContentBox variant="dark">
			<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
				SMs keep many warps "in flight" and switch between them to hide memory latency. When one
				warp waits for data, another executes.
			</p>

			<!-- Warp scheduling timeline diagram -->
			<div
				class="rounded-lg bg-gradient-to-br from-slate-800 via-slate-700 to-zinc-800 p-4 shadow-inner"
			>
				<div class="space-y-2">
					<!-- Time axis header -->
					<div class="flex items-center gap-2">
						<span class="w-16 text-[var(--color-accent)] text-[var(--text-tiny)]"></span>
						<div class="flex flex-1 gap-1">
							{#each Array(7) as _, t (t)}
								<div class="flex-1 text-center text-[9px] text-[var(--color-accent)]">t{t + 1}</div>
							{/each}
						</div>
					</div>
					<!-- Warp rows -->
					{#each [{ name: 'Warp 0', color: 'cyan', pattern: [1, 1, 0, 0, 0, 0, 1] }, { name: 'Warp 1', color: 'blue', pattern: [0, 1, 1, 0, 0, 0, 1] }, { name: 'Warp 2', color: 'purple', pattern: [0, 0, 1, 1, 0, 0, 1] }, { name: 'Warp 3', color: 'pink', pattern: [0, 0, 0, 1, 1, 1, 1] }] as warp (warp.name)}
						<div class="flex items-center gap-2">
							<span class="w-16 text-{warp.color}-400 text-[var(--text-tiny)]">{warp.name}</span>
							<div class="flex flex-1 gap-1">
								{#each warp.pattern as active, patternIdx (patternIdx)}
									<div
										class="h-6 flex-1 rounded {active
											? `bg-${warp.color}-500/60`
											: 'flex items-center justify-center bg-red-500/30'}"
									>
										{#if !active}
											<span class="text-[8px] text-red-300">WAIT</span>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					{/each}
					<!-- SM busy row -->
					<div class="flex items-center gap-2 border-t border-[var(--color-muted)]/20 pt-2">
						<span class="w-16 text-[var(--color-muted)] text-[var(--text-tiny)]">SM busy:</span>
						<div class="flex flex-1 gap-1">
							{#each Array(7) as _, busyIdx (busyIdx)}
								<div class="h-6 flex-1 rounded bg-green-500/60"></div>
							{/each}
						</div>
					</div>
				</div>
				<!-- Axis label -->
				<div
					class="mt-2 flex items-center justify-end gap-1 text-[var(--color-accent)] text-[var(--text-tiny)]"
				>
					<span>Time →</span>
				</div>
				<p class="mt-2 text-center text-[var(--color-primary)] text-[var(--text-tiny)]">
					More warps = more opportunities to hide latency. SM is always executing something!
				</p>
			</div>
		</ContentBox>

		<ContentBox variant="dark" class="mt-4">
			<h4 class="mb-3 font-medium text-[var(--color-text)]">Occupancy</h4>
			<p class="mb-3 text-[var(--color-muted)] text-[var(--text-small)]">
				Occupancy = Active Warps / Max Warps per SM. Higher occupancy means more warps available for
				scheduling.
			</p>
			<div class="grid grid-cols-1 gap-3 md:grid-cols-3">
				<div class="rounded border border-red-500/30 bg-[var(--color-bg)] p-3 text-center">
					<p class="font-mono text-red-400">&lt;25%</p>
					<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">Low occupancy</p>
					<p class="text-[var(--text-tiny)] text-red-400">Likely memory bound</p>
				</div>
				<div class="rounded border border-yellow-500/30 bg-[var(--color-bg)] p-3 text-center">
					<p class="font-mono text-yellow-400">25-50%</p>
					<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">Moderate</p>
					<p class="text-[var(--text-tiny)] text-yellow-400">Often sufficient</p>
				</div>
				<div class="rounded border border-green-500/30 bg-[var(--color-bg)] p-3 text-center">
					<p class="font-mono text-green-400">&gt;50%</p>
					<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">High occupancy</p>
					<p class="text-[var(--text-tiny)] text-green-400">Good latency hiding</p>
				</div>
			</div>
		</ContentBox>
	</Section>

	<!-- Block Scheduling -->
	<Section title="Block Distribution to SMs">
		<ContentBox variant="dark">
			<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
				Kernel with 264 blocks on H100 (132 SMs):
			</p>

			<!-- Wave visualization -->
			<div class="space-y-4">
				<!-- Wave 1 -->
				<div>
					<div class="mb-2 flex items-center gap-2">
						<span class="font-semibold text-[var(--color-primary)] text-[var(--text-small)]"
							>Wave 1:</span
						>
						<span class="text-[var(--color-muted)] text-[var(--text-tiny)]">Blocks 0-131</span>
					</div>
					<div class="grid grid-cols-[repeat(8,1fr)_6rem] gap-1">
						{#each Array(8) as _, w1Idx (w1Idx)}
							<div class="h-10 rounded bg-green-500/30 py-2 text-center">
								<span class="text-[10px] text-green-400">SM {w1Idx}</span>
							</div>
						{/each}
						<div
							class="flex h-10 items-center justify-end text-[var(--color-muted)] text-[var(--text-tiny)]"
						>
							+124 more
						</div>
					</div>
					<div class="mt-1 text-center text-[var(--text-tiny)] text-green-400">
						100% SM utilization
					</div>
				</div>

				<!-- Wave 2 -->
				<div>
					<div class="mb-2 flex items-center gap-2">
						<span class="font-semibold text-[var(--color-primary)] text-[var(--text-small)]"
							>Wave 2:</span
						>
						<span class="text-[var(--color-muted)] text-[var(--text-tiny)]">Blocks 132-263</span>
					</div>
					<div class="grid grid-cols-[repeat(8,1fr)_6rem] gap-1">
						{#each Array(8) as _, w2Idx (w2Idx)}
							<div class="h-10 rounded bg-green-500/30 py-2 text-center">
								<span class="text-[10px] text-green-400">SM {w2Idx}</span>
							</div>
						{/each}
						<div
							class="flex h-10 items-center justify-end text-[var(--color-muted)] text-[var(--text-tiny)]"
						>
							+124 more
						</div>
					</div>
					<div class="mt-1 text-center text-[var(--text-tiny)] text-green-400">
						100% SM utilization
					</div>
				</div>

				<!-- Wave 3 (bad) - if we had 265 blocks -->
				<div>
					<div class="mb-2 flex items-center gap-2">
						<span class="font-semibold text-[var(--color-primary)] text-[var(--text-small)]"
							>Wave 3:</span
						>
						<span class="text-[var(--color-muted)] text-[var(--text-tiny)]"
							>Block 264 (if 265 blocks)</span
						>
					</div>
					<div class="grid grid-cols-[repeat(8,1fr)_6rem] gap-1">
						<div class="h-10 rounded bg-red-500/30 py-2 text-center">
							<span class="text-[10px] text-red-400">SM 0</span>
						</div>
						{#each Array(7) as _, idleIdx (idleIdx)}
							<div class="h-10 rounded bg-zinc-800 py-2 text-center">
								<span class="text-[10px] text-zinc-600">idle</span>
							</div>
						{/each}
						<div class="flex h-10 items-center justify-end text-[var(--text-tiny)] text-zinc-600">
							+124 more idle
						</div>
					</div>
					<div class="mt-1 text-center text-[var(--text-tiny)] text-red-400">0.7% utilization!</div>
				</div>
			</div>

			<p class="mt-4 text-[var(--color-primary)] text-[var(--text-small)]">
				This is "wave quantization" — we'll explore it more in the Intensity tab.
			</p>
		</ContentBox>
	</Section>

	<!-- Resource Limits -->
	<Section title="Per-SM Resource Limits">
		<ContentBox variant="dark">
			<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
				Each block consumes SM resources. Too many resources per block = fewer concurrent blocks.
			</p>
			<div class="overflow-x-auto">
				<table class="w-full text-[var(--text-small)]">
					<thead>
						<tr class="border-b border-[var(--color-muted)]/20">
							<th class="py-2 text-left text-[var(--color-muted)]">Resource</th>
							<th class="py-2 text-left text-[var(--color-accent)]">Per SM Limit</th>
							<th class="py-2 text-left text-[var(--color-muted)]">Implication</th>
						</tr>
					</thead>
					<tbody class="font-mono">
						<tr class="border-b border-[var(--color-muted)]/10">
							<td class="py-2 text-[var(--color-text)]">Threads</td>
							<td class="py-2 text-[var(--color-accent)]">2048</td>
							<td class="py-2 text-[var(--color-muted)]">Max 64 warps</td>
						</tr>
						<tr class="border-b border-[var(--color-muted)]/10">
							<td class="py-2 text-[var(--color-text)]">Blocks</td>
							<td class="py-2 text-[var(--color-accent)]">32</td>
							<td class="py-2 text-[var(--color-muted)]">Can't have tiny blocks</td>
						</tr>
						<tr class="border-b border-[var(--color-muted)]/10">
							<td class="py-2 text-[var(--color-text)]">Registers</td>
							<td class="py-2 text-[var(--color-accent)]">65,536</td>
							<td class="py-2 text-[var(--color-muted)]">Complex kernels use more</td>
						</tr>
						<tr>
							<td class="py-2 text-[var(--color-text)]">Shared Memory</td>
							<td class="py-2 text-[var(--color-accent)]">228 KB (H100)</td>
							<td class="py-2 text-[var(--color-muted)]">Tiling size limit</td>
						</tr>
					</tbody>
				</table>
			</div>
		</ContentBox>
	</Section>

	<!-- Tensor Core Operations -->
	<Section title="Tensor Core: Matrix Multiply Engine">
		<ContentBox variant="dark">
			<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
				Tensor Cores perform matrix-multiply-accumulate on small matrix tiles in a single operation:
			</p>

			<!-- Matrix multiply diagram -->
			<div class="flex flex-wrap items-center justify-center gap-3">
				<div class="text-center">
					<div class="mb-1 text-[var(--color-muted)] text-[var(--text-tiny)]">A (M×K)</div>
					<div
						class="flex h-16 w-16 items-center justify-center rounded border-2 border-cyan-500/50 bg-cyan-500/10"
					>
						<span class="text-[10px] text-cyan-400">FP16/<br />BF16/<br />FP8</span>
					</div>
				</div>
				<span class="text-xl text-[var(--color-muted)]">×</span>
				<div class="text-center">
					<div class="mb-1 text-[var(--color-muted)] text-[var(--text-tiny)]">B (K×N)</div>
					<div
						class="flex h-16 w-16 items-center justify-center rounded border-2 border-cyan-500/50 bg-cyan-500/10"
					>
						<span class="text-[10px] text-cyan-400">FP16/<br />BF16/<br />FP8</span>
					</div>
				</div>
				<span class="text-xl text-[var(--color-muted)]">+</span>
				<div class="text-center">
					<div class="mb-1 text-[var(--color-muted)] text-[var(--text-tiny)]">C (M×N)</div>
					<div
						class="flex h-16 w-16 items-center justify-center rounded border-2 border-purple-500/50 bg-purple-500/10"
					>
						<span class="text-[10px] text-purple-400">FP32</span>
					</div>
				</div>
				<span class="text-xl text-[var(--color-muted)]">=</span>
				<div class="text-center">
					<div class="mb-1 text-[var(--color-muted)] text-[var(--text-tiny)]">D (M×N)</div>
					<div
						class="flex h-16 w-16 items-center justify-center rounded border-2 border-pink-500/50 bg-pink-500/10"
					>
						<span class="text-[10px] text-pink-400">FP32</span>
					</div>
				</div>
			</div>

			<div class="mt-4 rounded bg-[var(--color-bg)] p-3">
				<div class="mb-2 text-[var(--color-muted)] text-[var(--text-tiny)]">
					H100 Tensor Core tile sizes:
				</div>
				<div class="grid grid-cols-3 gap-2 text-center">
					<div class="rounded bg-pink-500/10 p-2">
						<span class="font-mono text-[var(--text-tiny)] text-pink-400">FP8</span>
						<p class="text-[10px] text-[var(--color-muted)]">M=16, N=16, K=32</p>
					</div>
					<div class="rounded bg-cyan-500/10 p-2">
						<span class="font-mono text-[var(--text-tiny)] text-cyan-400">BF16</span>
						<p class="text-[10px] text-[var(--color-muted)]">M=16, N=16, K=16</p>
					</div>
					<div class="rounded bg-green-500/10 p-2">
						<span class="font-mono text-[var(--text-tiny)] text-green-400">FP16</span>
						<p class="text-[10px] text-[var(--color-muted)]">M=16, N=16, K=16</p>
					</div>
				</div>
			</div>

			<p class="mt-3 text-center text-[var(--color-primary)] text-[var(--text-small)]">
				One Tensor Core operation = 2×M×N×K FLOPs in one cycle!
			</p>
		</ContentBox>

		<ContentBox variant="dark" class="mt-4">
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div class="rounded border border-cyan-500/30 bg-[var(--color-bg)] p-3">
					<h5 class="mb-2 font-medium text-cyan-400">CUDA Core (FP32)</h5>
					<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">
						1 multiply + 1 add per cycle per core
					</p>
					<p class="font-mono text-[var(--color-accent)] text-[var(--text-tiny)]">
						H100: 67 TFLOP/s FP32
					</p>
				</div>
				<div class="rounded border border-pink-500/30 bg-[var(--color-bg)] p-3">
					<h5 class="mb-2 font-medium text-pink-400">Tensor Core (BF16)</h5>
					<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">
						256 FLOPs per cycle (16×16×K tile)
					</p>
					<p class="font-mono text-[var(--color-primary)] text-[var(--text-tiny)]">
						H100: 990 TFLOP/s BF16
					</p>
				</div>
			</div>
			<p class="mt-3 text-center text-[var(--color-primary)] text-[var(--text-small)]">
				<strong>~15× faster for matrix operations!</strong> This is why matmuls are "blessed operations."
			</p>
		</ContentBox>
	</Section>

	<KeyTakeaway
		items={[
			'H100 has 132 SMs, each with 128 CUDA cores and 4 Tensor Cores',
			'Warp = 32 threads executing same instruction (SIMT model)',
			'Branch divergence within warp causes serialization—avoid it',
			'Tensor Cores are 10-15× faster than CUDA cores for matrix ops',
			'High occupancy (many warps) helps hide memory latency'
		]}
	/>
</div>
