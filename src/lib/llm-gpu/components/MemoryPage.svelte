<!-- ABOUTME: Memory hierarchy page for GPU Lab -->
<!-- ABOUTME: Covers HBM, L2, L1, shared memory, registers, latencies, coalescing -->

<script>
	import { onMount } from 'svelte';
	import { HeroSection, Section, ContentBox, KeyTakeaway } from '$lib/shared';
	import Chart from 'chart.js/auto';

	let latencyChartCanvas;
	let bandwidthChartCanvas;
	let latencyChart;
	let bandwidthChart;

	onMount(() => {
		// Latency comparison chart
		latencyChart = new Chart(latencyChartCanvas, {
			type: 'bar',
			data: {
				labels: ['Registers', 'Shared Mem', 'L1 Cache', 'L2 Cache', 'HBM (Global)'],
				datasets: [
					{
						label: 'Latency (cycles)',
						data: [1, 20, 33, 200, 400],
						backgroundColor: [
							'rgba(34, 211, 238, 0.7)',
							'rgba(34, 197, 94, 0.7)',
							'rgba(250, 204, 21, 0.7)',
							'rgba(249, 115, 22, 0.7)',
							'rgba(239, 68, 68, 0.7)'
						],
						borderColor: ['#22d3ee', '#22c55e', '#facc15', '#f97316', '#ef4444'],
						borderWidth: 1
					}
				]
			},
			options: {
				indexAxis: 'y',
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false },
					title: {
						display: true,
						text: 'Memory Access Latency (cycles)',
						color: '#d4d4d4'
					}
				},
				scales: {
					x: {
						type: 'logarithmic',
						title: { display: true, text: 'Cycles (log scale)', color: '#9ca3af' },
						ticks: { color: '#9ca3af' },
						grid: { color: '#374151' }
					},
					y: {
						ticks: { color: '#9ca3af' },
						grid: { display: false }
					}
				}
			}
		});

		// Bandwidth comparison chart
		bandwidthChart = new Chart(bandwidthChartCanvas, {
			type: 'bar',
			data: {
				labels: ['HBM3', 'L2 Cache', 'Shared Memory'],
				datasets: [
					{
						label: 'Bandwidth (TB/s)',
						data: [3.35, 12, 19],
						backgroundColor: [
							'rgba(236, 72, 153, 0.7)',
							'rgba(168, 85, 247, 0.7)',
							'rgba(34, 211, 238, 0.7)'
						],
						borderColor: ['#ec4899', '#a855f7', '#22d3ee'],
						borderWidth: 1
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false },
					title: {
						display: true,
						text: 'Aggregate Bandwidth (TB/s)',
						color: '#d4d4d4'
					}
				},
				scales: {
					y: {
						title: { display: true, text: 'TB/s', color: '#9ca3af' },
						ticks: { color: '#9ca3af' },
						grid: { color: '#374151' },
						beginAtZero: true
					},
					x: {
						ticks: { color: '#9ca3af' },
						grid: { display: false }
					}
				}
			}
		});

		return () => {
			latencyChart?.destroy();
			bandwidthChart?.destroy();
		};
	});
</script>

<div class="space-y-6">
	<HeroSection icon="🧠" title="Memory Hierarchy">
		<p class="max-w-3xl leading-relaxed text-[var(--color-muted)] text-[var(--text-body)]">
			GPU memory forms a hierarchy from fast-but-small registers to slow-but-large HBM.
			Understanding this hierarchy is crucial—memory access patterns often determine performance
			more than compute.
		</p>
	</HeroSection>

	<!-- The Hierarchy -->
	<Section title="Memory Hierarchy Overview">
		<ContentBox variant="dark">
			<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
				Faster memory is smaller. The latency bar shows relative access time (log scale).
			</p>

			<!-- Simple horizontal hierarchy -->
			<div class="space-y-2">
				<!-- Registers -->
				<div class="flex items-center gap-3 rounded border border-cyan-500/30 bg-cyan-500/5 p-3">
					<div class="w-28 shrink-0">
						<p class="font-semibold text-cyan-400">Registers</p>
						<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">Per thread</p>
					</div>
					<div class="flex-1">
						<div class="mb-1 flex justify-between text-[var(--text-tiny)]">
							<span class="text-[var(--color-muted)]">~1 cycle</span>
							<span class="text-cyan-400">256 KB/SM</span>
						</div>
						<div class="h-2 w-full rounded-full bg-slate-700">
							<div class="h-2 rounded-full bg-cyan-500" style="width: 1%"></div>
						</div>
					</div>
				</div>

				<!-- Shared Memory -->
				<div class="flex items-center gap-3 rounded border border-green-500/30 bg-green-500/5 p-3">
					<div class="w-28 shrink-0">
						<p class="font-semibold text-green-400">Shared Mem</p>
						<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">Per block</p>
					</div>
					<div class="flex-1">
						<div class="mb-1 flex justify-between text-[var(--text-tiny)]">
							<span class="text-[var(--color-muted)]">~20 cycles</span>
							<span class="text-green-400">228 KB/SM</span>
						</div>
						<div class="h-2 w-full rounded-full bg-slate-700">
							<div class="h-2 rounded-full bg-green-500" style="width: 5%"></div>
						</div>
					</div>
				</div>

				<!-- L1 Cache -->
				<div
					class="flex items-center gap-3 rounded border border-yellow-500/30 bg-yellow-500/5 p-3"
				>
					<div class="w-28 shrink-0">
						<p class="font-semibold text-yellow-400">L1 Cache</p>
						<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">Per SM</p>
					</div>
					<div class="flex-1">
						<div class="mb-1 flex justify-between text-[var(--text-tiny)]">
							<span class="text-[var(--color-muted)]">~33 cycles</span>
							<span class="text-yellow-400">256 KB/SM</span>
						</div>
						<div class="h-2 w-full rounded-full bg-slate-700">
							<div class="h-2 rounded-full bg-yellow-500" style="width: 8%"></div>
						</div>
					</div>
				</div>

				<!-- L2 Cache -->
				<div
					class="flex items-center gap-3 rounded border border-orange-500/30 bg-orange-500/5 p-3"
				>
					<div class="w-28 shrink-0">
						<p class="font-semibold text-orange-400">L2 Cache</p>
						<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">Global</p>
					</div>
					<div class="flex-1">
						<div class="mb-1 flex justify-between text-[var(--text-tiny)]">
							<span class="text-[var(--color-muted)]">~200 cycles</span>
							<span class="text-orange-400">50 MB</span>
						</div>
						<div class="h-2 w-full rounded-full bg-slate-700">
							<div class="h-2 rounded-full bg-orange-500" style="width: 50%"></div>
						</div>
					</div>
				</div>

				<!-- HBM -->
				<div class="flex items-center gap-3 rounded border border-red-500/30 bg-red-500/5 p-3">
					<div class="w-28 shrink-0">
						<p class="font-semibold text-red-400">HBM3</p>
						<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">Global</p>
					</div>
					<div class="flex-1">
						<div class="mb-1 flex justify-between text-[var(--text-tiny)]">
							<span class="text-[var(--color-muted)]">~400 cycles</span>
							<span class="text-red-400">80 GB</span>
						</div>
						<div class="h-2 w-full rounded-full bg-slate-700">
							<div class="h-2 rounded-full bg-red-500" style="width: 100%"></div>
						</div>
					</div>
				</div>
			</div>

			<!-- Key insight -->
			<div
				class="mt-4 rounded border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 p-3"
			>
				<p class="text-center text-[var(--color-primary)] text-[var(--text-small)]">
					HBM is 400× slower than registers — minimize global memory access!
				</p>
			</div>
		</ContentBox>
	</Section>

	<!-- Latency and Bandwidth Charts -->
	<Section title="Latency & Bandwidth Comparison">
		<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
			<ContentBox variant="dark">
				<div class="h-64">
					<canvas bind:this={latencyChartCanvas}></canvas>
				</div>
			</ContentBox>
			<ContentBox variant="dark">
				<div class="h-64">
					<canvas bind:this={bandwidthChartCanvas}></canvas>
				</div>
			</ContentBox>
		</div>

		<ContentBox variant="dark" class="mt-4 border-l-4 border-[var(--color-primary)]">
			<p class="text-[var(--color-muted)] text-[var(--text-small)]">
				<strong class="text-[var(--color-primary)]">Key insight:</strong> HBM access is ~400× slower than
				registers. Moving data from HBM to shared memory once, then reusing it many times, is the core
				optimization strategy.
			</p>
		</ContentBox>
	</Section>

	<!-- Registers -->
	<Section title="Registers: Per-Thread Fast Storage" titleColor="rgb(34, 211, 238)">
		<ContentBox variant="dark">
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div>
					<h4 class="mb-3 font-semibold text-cyan-400">Properties</h4>
					<ul class="space-y-2 text-[var(--color-muted)] text-[var(--text-small)]">
						<li class="flex items-start gap-2">
							<span class="text-cyan-400">•</span>
							Private to each thread
						</li>
						<li class="flex items-start gap-2">
							<span class="text-cyan-400">•</span>
							~1 cycle access latency
						</li>
						<li class="flex items-start gap-2">
							<span class="text-cyan-400">•</span>
							256 KB per SM (H100)
						</li>
						<li class="flex items-start gap-2">
							<span class="text-cyan-400">•</span>
							Compiler manages allocation
						</li>
					</ul>
				</div>
				<div>
					<h4 class="mb-3 font-semibold text-red-400">Register Pressure</h4>
					<p class="text-[var(--color-muted)] text-[var(--text-small)]">
						Using too many registers per thread reduces occupancy. If each thread needs 64 registers
						and max is 255, you can't run as many warps.
					</p>
					<div class="mt-3 rounded bg-[var(--color-bg)] p-2 font-mono text-[var(--text-tiny)]">
						<span class="text-[var(--color-muted)]">Fix:</span> Use
						<span class="text-[var(--color-accent)]">--maxrregcount</span> compiler flag
					</div>
				</div>
			</div>
		</ContentBox>
	</Section>

	<!-- Shared Memory -->
	<Section title="Shared Memory: Per-Block Tiling" titleColor="rgb(74, 222, 128)">
		<ContentBox variant="dark">
			<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
				The core idea: <strong class="text-green-400"
					>load data once from slow HBM, reuse it many times from fast shared memory</strong
				>. This is called "tiling" because you process data in small tiles that fit in shared
				memory.
			</p>

			<!-- Before/After Comparison -->
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<!-- Without Tiling -->
				<div class="flex flex-col rounded-lg border border-red-500/30 bg-red-500/5 p-4">
					<h5 class="mb-3 font-semibold text-red-400">Without Tiling</h5>
					<p class="mb-3 text-[var(--color-muted)] text-[var(--text-tiny)]">
						Each thread reads from HBM every time it needs data:
					</p>
					<div class="flex-1 space-y-2">
						<div class="flex items-center gap-2">
							<span
								class="w-20 shrink-0 whitespace-nowrap text-[var(--color-muted)] text-[var(--text-tiny)]"
								>Thread 0:</span
							>
							<span class="rounded bg-red-500/20 px-2 py-0.5 text-[var(--text-tiny)] text-red-400"
								>HBM</span
							>
							<span class="text-[var(--color-muted)]">→</span>
							<span class="rounded bg-red-500/20 px-2 py-0.5 text-[var(--text-tiny)] text-red-400"
								>HBM</span
							>
							<span class="text-[var(--color-muted)]">→</span>
							<span class="rounded bg-red-500/20 px-2 py-0.5 text-[var(--text-tiny)] text-red-400"
								>HBM</span
							>
						</div>
						<div class="flex items-center gap-2">
							<span
								class="w-20 shrink-0 whitespace-nowrap text-[var(--color-muted)] text-[var(--text-tiny)]"
								>Thread 1:</span
							>
							<span class="rounded bg-red-500/20 px-2 py-0.5 text-[var(--text-tiny)] text-red-400"
								>HBM</span
							>
							<span class="text-[var(--color-muted)]">→</span>
							<span class="rounded bg-red-500/20 px-2 py-0.5 text-[var(--text-tiny)] text-red-400"
								>HBM</span
							>
							<span class="text-[var(--color-muted)]">→</span>
							<span class="rounded bg-red-500/20 px-2 py-0.5 text-[var(--text-tiny)] text-red-400"
								>HBM</span
							>
						</div>
						<div class="flex items-center gap-2">
							<span
								class="w-20 shrink-0 whitespace-nowrap text-[var(--color-muted)] text-[var(--text-tiny)]"
								>Thread 2:</span
							>
							<span class="rounded bg-red-500/20 px-2 py-0.5 text-[var(--text-tiny)] text-red-400"
								>HBM</span
							>
							<span class="text-[var(--color-muted)]">→</span>
							<span class="rounded bg-red-500/20 px-2 py-0.5 text-[var(--text-tiny)] text-red-400"
								>HBM</span
							>
							<span class="text-[var(--color-muted)]">→</span>
							<span class="rounded bg-red-500/20 px-2 py-0.5 text-[var(--text-tiny)] text-red-400"
								>HBM</span
							>
						</div>
					</div>
					<div class="mt-3 rounded bg-red-500/20 p-2 text-center">
						<span class="font-mono text-red-400">9 × 400 = 3600 cycles</span>
					</div>
				</div>

				<!-- With Tiling -->
				<div class="flex flex-col rounded-lg border border-green-500/30 bg-green-500/5 p-4">
					<h5 class="mb-3 font-semibold text-green-400">With Tiling</h5>
					<p class="mb-3 text-[var(--color-muted)] text-[var(--text-tiny)]">
						Load tile once to shared memory, all threads reuse it:
					</p>
					<!-- Load tile step (separate header) -->
					<div
						class="mb-3 flex items-center gap-2 rounded border border-green-500/30 bg-green-500/10 p-2"
					>
						<span class="font-medium whitespace-nowrap text-[var(--text-tiny)] text-green-400"
							>Load tile:</span
						>
						<span class="rounded bg-red-500/20 px-2 py-0.5 text-[var(--text-tiny)] text-red-400"
							>HBM</span
						>
						<span class="text-[var(--color-muted)]">→</span>
						<span class="rounded bg-green-500/30 px-2 py-0.5 text-[var(--text-tiny)] text-green-400"
							>Shared</span
						>
						<span class="text-[var(--color-muted)] text-[var(--text-tiny)]">(400 cycles, once)</span
						>
					</div>
					<!-- Thread rows (aligned with left side) -->
					<div class="flex-1 space-y-2">
						<div class="flex items-center gap-2">
							<span
								class="w-20 shrink-0 whitespace-nowrap text-[var(--color-muted)] text-[var(--text-tiny)]"
								>Thread 0:</span
							>
							<span
								class="rounded bg-green-500/20 px-2 py-0.5 text-[var(--text-tiny)] text-green-400"
								>shared</span
							>
							<span class="text-[var(--color-muted)]">→</span>
							<span
								class="rounded bg-green-500/20 px-2 py-0.5 text-[var(--text-tiny)] text-green-400"
								>shared</span
							>
							<span class="text-[var(--color-muted)]">→</span>
							<span
								class="rounded bg-green-500/20 px-2 py-0.5 text-[var(--text-tiny)] text-green-400"
								>shared</span
							>
						</div>
						<div class="flex items-center gap-2">
							<span
								class="w-20 shrink-0 whitespace-nowrap text-[var(--color-muted)] text-[var(--text-tiny)]"
								>Thread 1:</span
							>
							<span
								class="rounded bg-green-500/20 px-2 py-0.5 text-[var(--text-tiny)] text-green-400"
								>shared</span
							>
							<span class="text-[var(--color-muted)]">→</span>
							<span
								class="rounded bg-green-500/20 px-2 py-0.5 text-[var(--text-tiny)] text-green-400"
								>shared</span
							>
							<span class="text-[var(--color-muted)]">→</span>
							<span
								class="rounded bg-green-500/20 px-2 py-0.5 text-[var(--text-tiny)] text-green-400"
								>shared</span
							>
						</div>
						<div class="flex items-center gap-2">
							<span
								class="w-20 shrink-0 whitespace-nowrap text-[var(--color-muted)] text-[var(--text-tiny)]"
								>Thread 2:</span
							>
							<span
								class="rounded bg-green-500/20 px-2 py-0.5 text-[var(--text-tiny)] text-green-400"
								>shared</span
							>
							<span class="text-[var(--color-muted)]">→</span>
							<span
								class="rounded bg-green-500/20 px-2 py-0.5 text-[var(--text-tiny)] text-green-400"
								>shared</span
							>
							<span class="text-[var(--color-muted)]">→</span>
							<span
								class="rounded bg-green-500/20 px-2 py-0.5 text-[var(--text-tiny)] text-green-400"
								>shared</span
							>
						</div>
					</div>
					<div class="mt-3 rounded bg-green-500/20 p-2 text-center">
						<span class="font-mono text-green-400">400 + 9×20 = 580 cycles</span>
					</div>
				</div>
			</div>

			<!-- Speedup callout -->
			<div
				class="mt-4 rounded border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 p-3"
			>
				<p class="text-center text-[var(--color-primary)] text-[var(--text-small)]">
					<strong>6× speedup</strong> from loading once and reusing — scales with more threads and reuse!
				</p>
			</div>

			<!-- Reference for tiling code -->
			<div class="mt-4 text-[var(--text-small)]">
				<span class="text-[var(--color-muted)]">Learn to write tiled CUDA kernels: </span>
				<a
					href="https://developer.nvidia.com/blog/efficient-matrix-transpose-cuda-cc/"
					target="_blank"
					rel="noopener noreferrer external"
					class="text-[var(--color-accent)] hover:underline"
				>
					NVIDIA Developer Blog: Efficient Matrix Operations
				</a>
			</div>
		</ContentBox>
	</Section>

	<!-- L2 Cache -->
	<Section title="L2 Cache: Last Stop Before HBM" titleColor="rgb(251, 146, 60)">
		<ContentBox variant="dark">
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div>
					<h4 class="mb-3 font-semibold text-orange-400">Properties</h4>
					<ul class="space-y-2 text-[var(--color-muted)] text-[var(--text-small)]">
						<li class="flex items-start gap-2">
							<span class="text-orange-400">•</span>
							50 MB on H100 (shared by all SMs)
						</li>
						<li class="flex items-start gap-2">
							<span class="text-orange-400">•</span>
							~200 cycle latency
						</li>
						<li class="flex items-start gap-2">
							<span class="text-orange-400">•</span>
							~12 TB/s aggregate bandwidth
						</li>
						<li class="flex items-start gap-2">
							<span class="text-orange-400">•</span>
							Hardware-managed (automatic)
						</li>
					</ul>
				</div>
				<div>
					<h4 class="mb-3 font-semibold text-[var(--color-accent)]">Working Set Size</h4>
					<p class="text-[var(--color-muted)] text-[var(--text-small)]">
						If your working set fits in L2 (50MB), you get L2 bandwidth. If not, you're limited to
						HBM bandwidth.
					</p>
					<div class="mt-3 rounded bg-[var(--color-bg)] p-2 font-mono text-[var(--text-tiny)]">
						50MB ≈ 12.5M FP32 values
					</div>
				</div>
			</div>
		</ContentBox>
	</Section>

	<!-- Global Memory & Coalescing -->
	<Section title="Global Memory: Coalescing Matters" titleColor="rgb(248, 113, 113)">
		<ContentBox variant="dark">
			<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
				When threads in a warp access global memory, the hardware tries to combine (coalesce)
				accesses into fewer transactions.
			</p>

			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<!-- Coalesced Access -->
				<div class="rounded border border-green-500/30 bg-[var(--color-bg)] p-4">
					<h5 class="mb-3 font-medium text-green-400">Coalesced Access (Good)</h5>
					<div class="mb-3">
						<div class="mb-1 text-[var(--color-muted)] text-[var(--text-tiny)]">
							Threads accessing adjacent memory:
						</div>
						<div class="flex gap-[2px]">
							{#each Array(8) as _, coalIdx (coalIdx)}
								<div
									class="flex h-12 flex-1 flex-col items-center justify-center rounded bg-green-500/30"
								>
									<span class="text-[var(--text-tiny)] text-green-300">T{coalIdx}</span>
									<span class="text-[var(--text-tiny)] text-green-400">→[{coalIdx}]</span>
								</div>
							{/each}
						</div>
					</div>
					<div class="rounded bg-green-500/10 p-2">
						<div class="h-3 w-full rounded bg-green-500/50"></div>
						<p class="mt-1 text-center text-[var(--text-tiny)] text-green-400">
							1 memory transaction (128 bytes)
						</p>
					</div>
				</div>

				<!-- Strided Access -->
				<div class="rounded border border-red-500/30 bg-[var(--color-bg)] p-4">
					<h5 class="mb-3 font-medium text-red-400">Strided Access (Bad)</h5>
					<div class="mb-3">
						<div class="mb-1 text-[var(--color-muted)] text-[var(--text-tiny)]">
							Threads accessing scattered memory:
						</div>
						<div class="flex gap-[2px]">
							{#each Array(8) as _, stridedIdx (stridedIdx)}
								<div
									class="flex h-12 flex-1 flex-col items-center justify-center rounded bg-red-500/30"
								>
									<span class="text-[var(--text-tiny)] text-red-300">T{stridedIdx}</span>
									<span class="text-[var(--text-tiny)] text-red-400">→[{stridedIdx * 32}]</span>
								</div>
							{/each}
						</div>
					</div>
					<div class="rounded bg-red-500/10 p-2">
						<div class="flex gap-1">
							{#each Array(8) as _, txnIdx (txnIdx)}
								<div class="h-3 w-2 rounded bg-red-500/50"></div>
							{/each}
						</div>
						<p class="mt-1 text-center text-[var(--text-tiny)] text-red-400">
							32 memory transactions!
						</p>
					</div>
				</div>
			</div>
		</ContentBox>
	</Section>

	<!-- GPU Memory Comparison -->
	<Section title="GPU Memory Comparison" titleColor="rgb(248, 113, 113)">
		<ContentBox variant="dark">
			<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
				Memory specifications across consumer and datacenter GPUs. HBM provides significantly higher
				bandwidth than GDDR, critical for large model training and inference.
			</p>

			<!-- Comparison Table -->
			<div class="overflow-x-auto">
				<table class="w-full text-[var(--text-tiny)]">
					<thead>
						<tr class="border-b border-[var(--color-muted)]/30">
							<th class="px-2 py-2 text-left font-semibold text-[var(--color-text)]">GPU</th>
							<th class="px-2 py-2 text-left font-semibold text-[var(--color-text)]">Type</th>
							<th class="px-2 py-2 text-right font-semibold text-[var(--color-text)]">VRAM</th>
							<th class="px-2 py-2 text-right font-semibold text-[var(--color-text)]">Bandwidth</th>
							<th class="px-2 py-2 text-right font-semibold text-[var(--color-text)]"
								>L1+Shared/SM</th
							>
							<th class="px-2 py-2 text-right font-semibold text-[var(--color-text)]">L2 Cache</th>
						</tr>
					</thead>
					<tbody>
						<!-- Datacenter GPUs -->
						<tr class="border-b border-[var(--color-muted)]/10">
							<td colspan="6" class="px-2 py-2 font-semibold text-green-400">Datacenter GPUs</td>
						</tr>
						<tr class="border-b border-[var(--color-muted)]/10 hover:bg-[var(--color-bg)]">
							<td class="px-2 py-2"
								><a
									href="https://resources.nvidia.com/en-us-dgx-systems/dgx-b200-datasheet"
									target="_blank"
									rel="noopener noreferrer external"
									class="text-[var(--color-accent)] hover:underline">B200</a
								></td
							>
							<td class="px-2 py-2 text-[var(--color-muted)]">HBM3e</td>
							<td class="px-2 py-2 text-right text-[var(--color-text)]">192 GB</td>
							<td class="px-2 py-2 text-right font-mono text-green-400">8 TB/s</td>
							<td class="px-2 py-2 text-right text-[var(--color-muted)]">256 KB</td>
							<td class="px-2 py-2 text-right text-[var(--color-muted)]">128 MB</td>
						</tr>
						<tr class="border-b border-[var(--color-muted)]/10 hover:bg-[var(--color-bg)]">
							<td class="px-2 py-2"
								><a
									href="https://www.nvidia.com/en-us/data-center/h200/"
									target="_blank"
									rel="noopener noreferrer external"
									class="text-[var(--color-accent)] hover:underline">H200</a
								></td
							>
							<td class="px-2 py-2 text-[var(--color-muted)]">HBM3e</td>
							<td class="px-2 py-2 text-right text-[var(--color-text)]">141 GB</td>
							<td class="px-2 py-2 text-right font-mono text-green-400">4.8 TB/s</td>
							<td class="px-2 py-2 text-right text-[var(--color-muted)]">256 KB</td>
							<td class="px-2 py-2 text-right text-[var(--color-muted)]">50 MB</td>
						</tr>
						<tr class="border-b border-[var(--color-muted)]/10 hover:bg-[var(--color-bg)]">
							<td class="px-2 py-2"
								><a
									href="https://www.nvidia.com/en-us/data-center/h100/"
									target="_blank"
									rel="noopener noreferrer external"
									class="text-[var(--color-accent)] hover:underline">H100</a
								></td
							>
							<td class="px-2 py-2 text-[var(--color-muted)]">HBM3</td>
							<td class="px-2 py-2 text-right text-[var(--color-text)]">80 GB</td>
							<td class="px-2 py-2 text-right font-mono text-green-400">3.35 TB/s</td>
							<td class="px-2 py-2 text-right text-[var(--color-muted)]">256 KB</td>
							<td class="px-2 py-2 text-right text-[var(--color-muted)]">50 MB</td>
						</tr>
						<tr class="border-b border-[var(--color-muted)]/10 hover:bg-[var(--color-bg)]">
							<td class="px-2 py-2"
								><a
									href="https://www.nvidia.com/en-us/data-center/a100/"
									target="_blank"
									rel="noopener noreferrer external"
									class="text-[var(--color-accent)] hover:underline">A100</a
								></td
							>
							<td class="px-2 py-2 text-[var(--color-muted)]">HBM2e</td>
							<td class="px-2 py-2 text-right text-[var(--color-text)]">80 GB</td>
							<td class="px-2 py-2 text-right font-mono text-yellow-400">2 TB/s</td>
							<td class="px-2 py-2 text-right text-[var(--color-muted)]">192 KB</td>
							<td class="px-2 py-2 text-right text-[var(--color-muted)]">40 MB</td>
						</tr>
						<tr class="border-b border-[var(--color-muted)]/10 hover:bg-[var(--color-bg)]">
							<td class="px-2 py-2"
								><a
									href="https://images.nvidia.com/content/volta-architecture/pdf/volta-architecture-whitepaper.pdf"
									target="_blank"
									rel="noopener noreferrer external"
									class="text-[var(--color-accent)] hover:underline">V100</a
								></td
							>
							<td class="px-2 py-2 text-[var(--color-muted)]">HBM2</td>
							<td class="px-2 py-2 text-right text-[var(--color-text)]">32 GB</td>
							<td class="px-2 py-2 text-right font-mono text-red-400">900 GB/s</td>
							<td class="px-2 py-2 text-right text-[var(--color-muted)]">128 KB</td>
							<td class="px-2 py-2 text-right text-[var(--color-muted)]">6 MB</td>
						</tr>
						<!-- Workstation GPUs -->
						<tr class="border-b border-[var(--color-muted)]/10">
							<td colspan="6" class="px-2 py-2 font-semibold text-purple-400">Workstation GPUs</td>
						</tr>
						<tr class="border-b border-[var(--color-muted)]/10 hover:bg-[var(--color-bg)]">
							<td class="px-2 py-2"
								><a
									href="https://www.nvidia.com/content/dam/en-zz/Solutions/data-center/rtx-pro-6000-blackwell-workstation-edition/workstation-blackwell-rtx-pro-6000-workstation-edition-nvidia-us-3519208-web.pdf"
									target="_blank"
									rel="noopener noreferrer external"
									class="text-[var(--color-accent)] hover:underline">RTX PRO 6000</a
								></td
							>
							<td class="px-2 py-2 text-[var(--color-muted)]">GDDR7</td>
							<td class="px-2 py-2 text-right text-[var(--color-text)]">96 GB</td>
							<td class="px-2 py-2 text-right font-mono text-green-400">1.79 TB/s</td>
							<td class="px-2 py-2 text-right text-[var(--color-muted)]">128 KB</td>
							<td class="px-2 py-2 text-right text-[var(--color-muted)]">128 MB</td>
						</tr>
						<!-- Consumer GPUs -->
						<tr class="border-b border-[var(--color-muted)]/10">
							<td colspan="6" class="px-2 py-2 font-semibold text-cyan-400">Consumer GPUs</td>
						</tr>
						<tr class="border-b border-[var(--color-muted)]/10 hover:bg-[var(--color-bg)]">
							<td class="px-2 py-2"
								><a
									href="https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/"
									target="_blank"
									rel="noopener noreferrer external"
									class="text-[var(--color-accent)] hover:underline">RTX 5090</a
								></td
							>
							<td class="px-2 py-2 text-[var(--color-muted)]">GDDR7</td>
							<td class="px-2 py-2 text-right text-[var(--color-text)]">32 GB</td>
							<td class="px-2 py-2 text-right font-mono text-yellow-400">1.79 TB/s</td>
							<td class="px-2 py-2 text-right text-[var(--color-muted)]">128 KB</td>
							<td class="px-2 py-2 text-right text-[var(--color-muted)]">96 MB</td>
						</tr>
						<tr class="border-b border-[var(--color-muted)]/10 hover:bg-[var(--color-bg)]">
							<td class="px-2 py-2"
								><a
									href="https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4090/"
									target="_blank"
									rel="noopener noreferrer external"
									class="text-[var(--color-accent)] hover:underline">RTX 4090</a
								></td
							>
							<td class="px-2 py-2 text-[var(--color-muted)]">GDDR6X</td>
							<td class="px-2 py-2 text-right text-[var(--color-text)]">24 GB</td>
							<td class="px-2 py-2 text-right font-mono text-red-400">1 TB/s</td>
							<td class="px-2 py-2 text-right text-[var(--color-muted)]">128 KB</td>
							<td class="px-2 py-2 text-right text-[var(--color-muted)]">72 MB</td>
						</tr>
					</tbody>
				</table>
			</div>

			<!-- Key insight -->
			<div
				class="mt-4 rounded border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 p-3"
			>
				<p class="text-center text-[var(--color-primary)] text-[var(--text-small)]">
					B200 has <strong>8× more bandwidth</strong> than V100 and <strong>4× more</strong> than RTX
					5090
				</p>
			</div>
		</ContentBox>
	</Section>

	<KeyTakeaway
		items={[
			'Memory hierarchy: Registers → Shared → L1 → L2 → HBM (each level ~10-20× slower)',
			'Minimize global memory access—load once from HBM, reuse in shared memory',
			'Coalesced access: adjacent threads should access adjacent memory addresses',
			'Avoid bank conflicts in shared memory—pad arrays if threads access same bank',
			'Working set fitting in L2 cache can dramatically boost effective bandwidth'
		]}
	/>
</div>
