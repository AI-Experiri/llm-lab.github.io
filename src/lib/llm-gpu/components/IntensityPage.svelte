<!-- ABOUTME: Arithmetic intensity and performance calculations for GPU Lab -->
<!-- ABOUTME: Covers FLOPs/byte, roofline model, tiling math, wave quantization -->

<script>
	import { onMount } from 'svelte';
	import { HeroSection, Section, ContentBox, KeyTakeaway, Math as MathDisplay } from '$lib/shared';

	const formula = '\\text{Arithmetic Intensity} = \\frac{\\text{FLOPs}}{\\text{Bytes Transferred}}';
	import Chart from 'chart.js/auto';

	let rooflineChartCanvas;
	let rooflineChart;

	// Generate roofline data: Performance = min(PeakCompute, Bandwidth × Intensity)
	function generateRoofline(intensities, bandwidth, peakCompute) {
		return intensities.map((i) => ({ x: i, y: Math.min(bandwidth * i, peakCompute) }));
	}

	onMount(() => {
		// X-axis: Operational Intensity (FLOPs/byte) - log scale from 0.01 to 1000
		const intensities = [];
		for (let i = 0.01; i <= 1000; i *= 1.3) {
			intensities.push(i);
		}
		intensities.push(1000);

		// Peak compute (GFLOPS)
		const gpuPeakFlops = 4000; // GPU ALU throughput
		const cpuPeakFlops = 300; // CPU ALU throughput

		// Bandwidths (GB/s) - determines slope of memory-bound region
		const gpuRegistersBW = 20000; // GPU registers ~20 TB/s effective
		const gpuSharedMemBW = 8000; // GPU shared memory ~8 TB/s
		const gpuMainMemBW = 1000; // GPU HBM ~1 TB/s
		const cpuMainMemBW = 50; // CPU DDR ~50 GB/s

		// Generate rooflines
		const gpuRegistersRoofline = generateRoofline(intensities, gpuRegistersBW, gpuPeakFlops);
		const gpuSharedMemRoofline = generateRoofline(intensities, gpuSharedMemBW, gpuPeakFlops);
		const gpuMainMemRoofline = generateRoofline(intensities, gpuMainMemBW, gpuPeakFlops);
		const cpuMainMemRoofline = generateRoofline(intensities, cpuMainMemBW, cpuPeakFlops);

		// Horizontal ceiling lines for ALU throughput
		const gpuCeiling = intensities.map((i) => ({ x: i, y: gpuPeakFlops }));
		const cpuCeiling = intensities.map((i) => ({ x: i, y: cpuPeakFlops }));

		rooflineChart = new Chart(rooflineChartCanvas, {
			type: 'scatter',
			data: {
				datasets: [
					// GPU ALU ceiling (horizontal line)
					{
						label: 'GPU ALU throughput',
						data: gpuCeiling,
						borderColor: '#ec4899',
						backgroundColor: 'transparent',
						showLine: true,
						pointRadius: 0,
						borderWidth: 2,
						borderDash: [5, 5],
						tension: 0
					},
					// CPU ALU ceiling (horizontal line)
					{
						label: 'CPU ALU throughput',
						data: cpuCeiling,
						borderColor: '#a855f7',
						backgroundColor: 'transparent',
						showLine: true,
						pointRadius: 0,
						borderWidth: 2,
						borderDash: [5, 5],
						tension: 0
					},
					// GPU Registers roofline
					{
						label: 'GPU registers',
						data: gpuRegistersRoofline,
						borderColor: '#991b1b',
						backgroundColor: 'transparent',
						showLine: true,
						pointRadius: 0,
						borderWidth: 2,
						tension: 0
					},
					// GPU Shared Memory roofline
					{
						label: 'GPU shared memory',
						data: gpuSharedMemRoofline,
						borderColor: '#f97316',
						backgroundColor: 'transparent',
						showLine: true,
						pointRadius: 0,
						borderWidth: 2,
						tension: 0
					},
					// GPU Main Memory roofline
					{
						label: 'GPU main memory',
						data: gpuMainMemRoofline,
						borderColor: '#eab308',
						backgroundColor: 'transparent',
						showLine: true,
						pointRadius: 0,
						borderWidth: 2,
						tension: 0
					},
					// CPU Main Memory roofline
					{
						label: 'CPU main memory',
						data: cpuMainMemRoofline,
						borderColor: '#22c55e',
						backgroundColor: 'transparent',
						showLine: true,
						pointRadius: 0,
						borderWidth: 2,
						tension: 0
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						display: true,
						position: 'top',
						labels: {
							color: '#d4d4d4',
							usePointStyle: true,
							padding: 15
						}
					},
					tooltip: {
						callbacks: {
							label: (ctx) => {
								const ds = ctx.dataset.label;
								if (ds.includes('matrix')) {
									return `${ds}: ${ctx.parsed.y.toFixed(0)} GFLOPS at ${ctx.parsed.x} FLOPs/byte`;
								}
								return `${ds}: ${ctx.parsed.y.toFixed(0)} GFLOPS`;
							}
						}
					}
				},
				scales: {
					y: {
						type: 'logarithmic',
						title: { display: true, text: 'Throughput (GFLOPS)', color: '#9ca3af' },
						ticks: {
							color: '#9ca3af',
							callback: function (value) {
								if ([1, 10, 100, 1000].includes(value)) return value;
								return '';
							}
						},
						grid: { color: '#374151' },
						min: 1,
						max: 5000
					},
					x: {
						type: 'logarithmic',
						title: { display: true, text: 'Operational Intensity (FLOPs/byte)', color: '#9ca3af' },
						ticks: {
							color: '#9ca3af',
							callback: function (value) {
								if ([0.01, 0.1, 1, 10, 100, 1000].includes(value)) return value;
								return '';
							}
						},
						grid: { color: '#374151' },
						min: 0.01,
						max: 1000
					}
				}
			}
		});

		return () => {
			rooflineChart?.destroy();
		};
	});
</script>

<div class="space-y-6">
	<HeroSection icon="📐" title="Arithmetic Intensity & Performance">
		<p class="max-w-3xl leading-relaxed text-[var(--color-muted)] text-[var(--text-body)]">
			Understanding when your code is memory-bound vs compute-bound is essential for optimization.
			Arithmetic intensity—FLOPs per byte of memory accessed—determines which regime you're in.
		</p>
	</HeroSection>

	<!-- Definition -->
	<Section title="Arithmetic Intensity">
		<ContentBox variant="dark" class="border-l-4 border-[var(--color-primary)]">
			<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
				Arithmetic intensity measures how much computation you do for every byte of data moved from
				memory. It determines whether your operation is
				<strong class="text-[var(--color-accent)]">memory-bound</strong>
				or <strong class="text-[var(--color-accent)]">compute-bound</strong>.
			</p>
			<div class="my-6">
				<MathDisplay {formula} />
			</div>
			<p class="text-[var(--color-muted)] text-[var(--text-small)]">
				Units: FLOPs per byte. The goal is to maximize intensity—do as much work as possible for
				every byte you move from slow global memory.
			</p>
		</ContentBox>

		<div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
			<ContentBox variant="dark" class="border border-red-500/30">
				<div class="mb-2 flex items-center gap-2">
					<span class="text-2xl">🐢</span>
					<h4 class="font-semibold text-red-400">Low Intensity (Memory-Bound)</h4>
				</div>
				<p class="mb-3 font-mono text-[var(--color-muted)] text-[var(--text-tiny)]">
					&lt; 100 FLOPs/byte
				</p>
				<ul class="space-y-1 text-[var(--color-muted)] text-[var(--text-small)]">
					<li>• Elementwise ops (ReLU, add, multiply)</li>
					<li>• Softmax, LayerNorm</li>
					<li>• Small matrix multiplies</li>
				</ul>
				<p class="mt-3 text-[var(--text-tiny)] text-red-400">Waiting for data, not doing math</p>
			</ContentBox>

			<ContentBox variant="dark" class="border border-green-500/30">
				<div class="mb-2 flex items-center gap-2">
					<span class="text-2xl">🚀</span>
					<h4 class="font-semibold text-green-400">High Intensity (Compute-Bound)</h4>
				</div>
				<p class="mb-3 font-mono text-[var(--color-muted)] text-[var(--text-tiny)]">
					&gt; 100 FLOPs/byte
				</p>
				<ul class="space-y-1 text-[var(--color-muted)] text-[var(--text-small)]">
					<li>• Large matrix multiplies</li>
					<li>• Convolutions with large channels</li>
					<li>• Batched operations</li>
				</ul>
				<p class="mt-3 text-[var(--text-tiny)] text-green-400">Fully utilizing compute cores</p>
			</ContentBox>
		</div>

		<ContentBox variant="dark" class="mt-4">
			<p class="text-center text-[var(--color-muted)] text-[var(--text-small)]">
				<strong class="text-[var(--color-accent)]">Goal:</strong> Restructure your code to maximize arithmetic
				intensity—do more FLOPs per byte moved.
			</p>
		</ContentBox>
	</Section>

	<!-- Roofline Model -->
	<Section title="The Roofline Model">
		<ContentBox variant="dark">
			<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
				The roofline model visualizes performance limits from different memory hierarchies. Each
				roofline shows where operations transition from memory-bound (diagonal) to compute-bound
				(flat ceiling).
			</p>
			<div class="mx-auto h-80 max-w-2xl">
				<canvas bind:this={rooflineChartCanvas}></canvas>
			</div>
			<div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
				<div class="rounded border border-yellow-500/30 bg-[var(--color-bg)] p-3">
					<h5 class="mb-2 font-medium text-yellow-400">Memory-Bound (Diagonal Slope)</h5>
					<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">
						Performance = Intensity × Bandwidth. Higher bandwidth memory (registers, shared) gives
						steeper slopes. Operations with low arithmetic intensity are limited by memory access.
					</p>
				</div>
				<div class="rounded border border-green-500/30 bg-[var(--color-bg)] p-3">
					<h5 class="mb-2 font-medium text-green-400">Compute-Bound (Flat Ceiling)</h5>
					<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">
						Saturating ALU throughput at peak FLOP/s. GPU ceiling is ~10× higher than CPU.
						Operations with high arithmetic intensity can fully utilize compute cores.
					</p>
				</div>
			</div>
			<div class="mt-4 rounded border border-[var(--color-muted)]/30 bg-[var(--color-bg)] p-3">
				<p class="text-center text-[var(--color-muted)] text-[var(--text-tiny)]">
					<strong class="text-[var(--color-accent)]">Key insight:</strong> Moving data closer to compute
					(registers → shared → global) raises your roofline ceiling. Increasing arithmetic intensity
					moves your operation rightward toward the compute-bound region.
				</p>
			</div>
		</ContentBox>
	</Section>

	<!-- ReLU Example -->
	<Section title="Example: ReLU Arithmetic Intensity">
		<ContentBox variant="dark">
			<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
				Consider applying ReLU to a vector: <code class="font-mono text-[var(--color-accent)]"
					>x = max(0, x)</code
				>
			</p>

			<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<!-- FP32 Calculation -->
				<div class="rounded border border-blue-500/30 bg-[var(--color-bg)] p-4">
					<h5 class="mb-3 font-medium text-blue-400">Float32 (4 bytes per number)</h5>
					<div class="space-y-2 font-mono text-[var(--text-tiny)]">
						<p>
							<span class="text-[var(--color-muted)]">Memory Read:</span>
							<span class="text-[var(--color-text)]">4 bytes (read x)</span>
						</p>
						<p>
							<span class="text-[var(--color-muted)]">Memory Write:</span>
							<span class="text-[var(--color-text)]">4 bytes (write result)</span>
						</p>
						<p>
							<span class="text-[var(--color-muted)]">Total Memory:</span>
							<span class="text-[var(--color-accent)]">8 bytes</span>
						</p>
						<hr class="my-2 border-[var(--color-muted)]/20" />
						<p>
							<span class="text-[var(--color-muted)]">Operations:</span>
							<span class="text-[var(--color-text)]">1 comparison + 1 select</span>
						</p>
						<p>
							<span class="text-[var(--color-muted)]">FLOPs:</span>
							<span class="text-[var(--color-accent)]">~1 FLOP</span>
						</p>
						<hr class="my-2 border-[var(--color-muted)]/20" />
						<p class="text-[var(--color-primary)]">Intensity = 1 / 8 = 0.125 FLOPs/byte</p>
					</div>
				</div>

				<!-- FP16 Calculation -->
				<div class="rounded border border-green-500/30 bg-[var(--color-bg)] p-4">
					<h5 class="mb-3 font-medium text-green-400">Float16 (2 bytes per number)</h5>
					<div class="space-y-2 font-mono text-[var(--text-tiny)]">
						<p>
							<span class="text-[var(--color-muted)]">Memory Read:</span>
							<span class="text-[var(--color-text)]">2 bytes (read x)</span>
						</p>
						<p>
							<span class="text-[var(--color-muted)]">Memory Write:</span>
							<span class="text-[var(--color-text)]">2 bytes (write result)</span>
						</p>
						<p>
							<span class="text-[var(--color-muted)]">Total Memory:</span>
							<span class="text-[var(--color-accent)]">4 bytes</span>
						</p>
						<hr class="my-2 border-[var(--color-muted)]/20" />
						<p>
							<span class="text-[var(--color-muted)]">Operations:</span>
							<span class="text-[var(--color-text)]">1 comparison + 1 select</span>
						</p>
						<p>
							<span class="text-[var(--color-muted)]">FLOPs:</span>
							<span class="text-[var(--color-accent)]">~1 FLOP</span>
						</p>
						<hr class="my-2 border-[var(--color-muted)]/20" />
						<p class="text-[var(--color-primary)]">Intensity = 1 / 4 = 0.25 FLOPs/byte</p>
					</div>
				</div>
			</div>

			<div class="mt-4 rounded border border-[var(--color-primary)]/30 bg-[var(--color-bg)] p-3">
				<p class="text-center text-[var(--color-primary)] text-[var(--text-small)]">
					<strong>FP16 gives 2x effective memory bandwidth</strong> for the same operation
				</p>
			</div>
		</ContentBox>
	</Section>

	<!-- Matrix Multiply Intensity -->
	<Section title="Matrix Multiply: High Intensity Operation">
		<ContentBox variant="dark">
			<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
				Matrix multiplication has much higher arithmetic intensity than elementwise operations:
			</p>

			<!-- Setup -->
			<p class="mb-4 text-center font-mono text-[var(--color-text)] text-[var(--text-small)]">
				For <span class="text-[var(--color-accent)]">C = A × B</span> where A is (M×K) and B is (K×N):
			</p>

			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<!-- Memory Access -->
				<div class="rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-4">
					<h5 class="mb-3 font-semibold text-cyan-400">Memory Access</h5>
					<div class="space-y-2 font-mono text-[var(--text-tiny)]">
						<p class="text-[var(--color-muted)]">
							Read A: <span class="text-[var(--color-text)]">M × K elements</span>
						</p>
						<p class="text-[var(--color-muted)]">
							Read B: <span class="text-[var(--color-text)]">K × N elements</span>
						</p>
						<p class="text-[var(--color-muted)]">
							Write C: <span class="text-[var(--color-text)]">M × N elements</span>
						</p>
						<p class="mt-2 border-t border-cyan-500/20 pt-2 text-[var(--color-accent)]">
							Total: M×K + K×N + M×N
						</p>
					</div>
				</div>

				<!-- Computation -->
				<div class="rounded-lg border border-purple-500/30 bg-purple-500/5 p-4">
					<h5 class="mb-3 font-semibold text-purple-400">Computation</h5>
					<div class="space-y-2 font-mono text-[var(--text-tiny)]">
						<p class="text-[var(--color-muted)]">
							Each C[i,j]: <span class="text-[var(--color-text)]">K muls + (K-1) adds</span>
						</p>
						<p class="text-[var(--color-muted)]">
							Total elements: <span class="text-[var(--color-text)]">M × N</span>
						</p>
						<p class="mt-2 border-t border-purple-500/20 pt-2 text-[var(--color-accent)]">
							Total FLOPs: 2 × M × N × K
						</p>
					</div>
				</div>
			</div>

			<!-- Square Matrix Result -->
			<div
				class="mt-4 rounded-lg border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 p-4"
			>
				<h5 class="mb-3 font-semibold text-[var(--color-primary)]">
					For Square Matrices (M = N = K = n)
				</h5>
				<div class="grid grid-cols-1 gap-2 font-mono text-[var(--text-tiny)] sm:grid-cols-3">
					<div class="rounded bg-slate-800/50 p-2">
						<p class="text-[var(--color-muted)]">Memory</p>
						<p class="text-[var(--color-text)]">12n² bytes</p>
					</div>
					<div class="rounded bg-slate-800/50 p-2">
						<p class="text-[var(--color-muted)]">FLOPs</p>
						<p class="text-[var(--color-text)]">2n³</p>
					</div>
					<div class="rounded bg-[var(--color-primary)]/20 p-2">
						<p class="text-[var(--color-muted)]">Intensity</p>
						<p class="text-[var(--color-primary)]">n/6 FLOPs/byte</p>
					</div>
				</div>
			</div>

			<p class="mt-4 text-[var(--color-muted)] text-[var(--text-small)]">
				As matrix size <code class="font-mono text-[var(--color-accent)]">n</code> grows, intensity increases
				linearly. Large matrix multiplies become compute-bound, which is why they're so efficient on GPUs.
			</p>
		</ContentBox>
	</Section>

	<!-- Tiling Math -->
	<Section title="Tiling: Reducing Global Memory Access">
		<ContentBox variant="dark">
			<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
				Tiling reduces how often we read from slow global memory by reusing data in fast shared
				memory. Setup: N×N matrix multiply, Tile size = T.
			</p>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<!-- Non-Tiled (Naive) -->
				<div class="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
					<h5 class="mb-3 font-semibold text-red-400">Non-Tiled (Naive)</h5>
					<p class="mb-3 text-[var(--color-muted)] text-[var(--text-tiny)]">
						Each input element read N times from global memory.<br />
						Total global reads: N × (N²) = N³
					</p>
					<!-- 4x4 matrix with arrows showing repeated global reads -->
					<div class="mb-3 flex items-center justify-center gap-4">
						<div class="grid grid-cols-4 gap-0.5">
							{#each Array(16) as _, matIdx (matIdx)}
								<div
									class="flex h-7 w-7 items-center justify-center rounded border border-red-400/40 bg-red-500/20 text-[var(--text-tiny)] text-red-300"
								>
									{matIdx}
								</div>
							{/each}
						</div>
						<div class="text-center text-[var(--text-tiny)]">
							<div class="mb-1 text-red-400">→ Global Memory</div>
							<div class="font-mono text-red-300">N reads each</div>
						</div>
					</div>
					<p class="text-center text-[var(--color-muted)] text-[var(--text-tiny)]">
						Every output element requires reading entire row + column from slow global memory
					</p>
				</div>

				<!-- Tiled -->
				<div class="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
					<h5 class="mb-3 font-semibold text-green-400">Tiled (T=2, so 2×2 per tile)</h5>
					<p class="mb-3 text-[var(--color-muted)] text-[var(--text-tiny)]">
						Load tile into shared memory, reuse within tile.<br />
						Global reads: N/T per element. Shared reads: T per element.
					</p>
					<!-- Same 4x4 matrix but grouped into 2x2 tiles -->
					<div class="mb-3 flex items-center justify-center gap-4">
						<div class="grid grid-cols-2 gap-1">
							<!-- Tile 0 -->
							<div class="rounded border border-cyan-400/50 bg-cyan-500/10 p-0.5">
								<div class="grid grid-cols-2 gap-0.5">
									{#each [0, 1, 4, 5] as idx (idx)}
										<div
											class="flex h-6 w-6 items-center justify-center rounded bg-cyan-500/30 text-[var(--text-tiny)] text-cyan-300"
										>
											{idx}
										</div>
									{/each}
								</div>
							</div>
							<!-- Tile 1 -->
							<div class="rounded border border-cyan-400/50 bg-cyan-500/10 p-0.5">
								<div class="grid grid-cols-2 gap-0.5">
									{#each [2, 3, 6, 7] as idx (idx)}
										<div
											class="flex h-6 w-6 items-center justify-center rounded bg-cyan-500/30 text-[var(--text-tiny)] text-cyan-300"
										>
											{idx}
										</div>
									{/each}
								</div>
							</div>
							<!-- Tile 2 -->
							<div class="rounded border border-cyan-400/50 bg-cyan-500/10 p-0.5">
								<div class="grid grid-cols-2 gap-0.5">
									{#each [8, 9, 12, 13] as idx (idx)}
										<div
											class="flex h-6 w-6 items-center justify-center rounded bg-cyan-500/30 text-[var(--text-tiny)] text-cyan-300"
										>
											{idx}
										</div>
									{/each}
								</div>
							</div>
							<!-- Tile 3 -->
							<div class="rounded border border-cyan-400/50 bg-cyan-500/10 p-0.5">
								<div class="grid grid-cols-2 gap-0.5">
									{#each [10, 11, 14, 15] as idx (idx)}
										<div
											class="flex h-6 w-6 items-center justify-center rounded bg-cyan-500/30 text-[var(--text-tiny)] text-cyan-300"
										>
											{idx}
										</div>
									{/each}
								</div>
							</div>
						</div>
						<div class="text-center text-[var(--text-tiny)]">
							<div class="mb-1 text-green-400">→ Shared Memory</div>
							<div class="font-mono text-green-300">N/T reads each</div>
						</div>
					</div>
					<p class="text-center font-medium text-[var(--color-primary)] text-[var(--text-tiny)]">
						Same 16 elements, but grouped into 4 tiles for T× fewer global reads
					</p>
				</div>
			</div>
		</ContentBox>

		<ContentBox variant="dark" class="mt-4">
			<h4 class="mb-3 font-semibold text-[var(--color-text)]">Tiling Math Summary</h4>
			<div class="overflow-x-auto">
				<table class="w-full text-[var(--text-small)]">
					<thead>
						<tr class="border-b border-[var(--color-muted)]/20">
							<th class="py-2 text-left text-[var(--color-muted)]">Metric</th>
							<th class="py-2 text-left text-[var(--color-accent)]">Non-Tiled</th>
							<th class="py-2 text-left text-[var(--color-primary)]">Tiled (size T)</th>
						</tr>
					</thead>
					<tbody class="font-mono">
						<tr class="border-b border-[var(--color-muted)]/10">
							<td class="py-2 text-[var(--color-muted)]">Global reads per element</td>
							<td class="py-2 text-[var(--color-text)]">N</td>
							<td class="py-2 text-[var(--color-text)]">N / T</td>
						</tr>
						<tr class="border-b border-[var(--color-muted)]/10">
							<td class="py-2 text-[var(--color-muted)]">Shared reads per element</td>
							<td class="py-2 text-[var(--color-text)]">0</td>
							<td class="py-2 text-[var(--color-text)]">T</td>
						</tr>
						<tr class="border-b border-[var(--color-muted)]/10">
							<td class="py-2 text-[var(--color-muted)]">Total global memory access</td>
							<td class="py-2 text-[var(--color-text)]">N³</td>
							<td class="py-2 text-[var(--color-text)]">N³ / T</td>
						</tr>
						<tr>
							<td class="py-2 text-[var(--color-muted)]">Speedup from tiling</td>
							<td class="py-2 text-[var(--color-text)]">1×</td>
							<td class="py-2 text-[var(--color-primary)]">T×</td>
						</tr>
					</tbody>
				</table>
			</div>
		</ContentBox>
	</Section>

	<!-- What Controls Tile Size -->
	<Section title="What Controls Tile Size?">
		<ContentBox variant="dark">
			<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
				Tile size (T) is determined by different components depending on how you're running your
				code:
			</p>

			<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
				<!-- CUDA Kernel Programmer -->
				<div class="rounded-lg border border-purple-500/30 bg-purple-500/5 p-4">
					<div class="mb-2 flex items-center gap-2">
						<span class="text-xl">👨‍💻</span>
						<h5 class="font-semibold text-purple-400">CUDA Programmer</h5>
					</div>
					<p class="mb-2 text-[var(--color-muted)] text-[var(--text-tiny)]">
						When writing custom kernels, you explicitly choose T in your code:
					</p>
					<div class="rounded bg-slate-800 p-2 font-mono text-[var(--text-tiny)] text-purple-300">
						#define TILE_SIZE 32<br />
						__shared__ float tile[TILE_SIZE][TILE_SIZE];
					</div>
					<a
						href="https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#shared-memory"
						target="_blank"
						rel="noopener noreferrer external"
						class="mt-2 block text-[var(--text-tiny)] text-purple-400 hover:underline"
					>
						📖 CUDA Programming Guide
					</a>
				</div>

				<!-- Libraries -->
				<div class="rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-4">
					<div class="mb-2 flex items-center gap-2">
						<span class="text-xl">📚</span>
						<h5 class="font-semibold text-cyan-400">Libraries (cuBLAS, cuDNN)</h5>
					</div>
					<p class="mb-2 text-[var(--color-muted)] text-[var(--text-tiny)]">
						Pre-tuned tile sizes optimized for each GPU architecture. Auto-selects based on:
					</p>
					<ul class="space-y-1 text-[var(--color-muted)] text-[var(--text-tiny)]">
						<li>• GPU model (A100, H100, etc.)</li>
						<li>• Matrix dimensions</li>
						<li>• Data type (FP32, FP16, INT8)</li>
					</ul>
					<a
						href="https://docs.nvidia.com/cuda/cublas/index.html"
						target="_blank"
						rel="noopener noreferrer external"
						class="mt-2 block text-[var(--text-tiny)] text-cyan-400 hover:underline"
					>
						📖 cuBLAS Documentation
					</a>
				</div>

				<!-- JIT Compilers -->
				<div class="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
					<div class="mb-2 flex items-center gap-2">
						<span class="text-xl">⚡</span>
						<h5 class="font-semibold text-green-400">JIT Compilers</h5>
					</div>
					<p class="mb-2 text-[var(--color-muted)] text-[var(--text-tiny)]">
						Auto-tune tile sizes at runtime:
					</p>
					<ul class="space-y-1 text-[var(--color-muted)] text-[var(--text-tiny)]">
						<li>• PyTorch <span class="text-green-400">torch.compile</span></li>
						<li>• TensorRT</li>
						<li>• XLA (JAX/TensorFlow)</li>
						<li>• Triton</li>
					</ul>
					<div class="mt-2 flex flex-wrap gap-2">
						<a
							href="https://pytorch.org/docs/stable/generated/torch.compile.html"
							target="_blank"
							rel="noopener noreferrer external"
							class="text-[var(--text-tiny)] text-green-400 hover:underline"
						>
							📖 torch.compile
						</a>
						<a
							href="https://triton-lang.org/main/getting-started/tutorials/03-matrix-multiplication.html"
							target="_blank"
							rel="noopener noreferrer external"
							class="text-[var(--text-tiny)] text-green-400 hover:underline"
						>
							📖 Triton Tutorial
						</a>
					</div>
				</div>
			</div>
		</ContentBox>

		<!-- Constraints -->
		<ContentBox variant="dark" class="mt-4">
			<h4 class="mb-3 font-semibold text-[var(--color-text)]">Constraints on Tile Size</h4>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
				<div class="rounded border border-yellow-500/30 bg-yellow-500/10 p-3">
					<h5 class="mb-2 font-medium text-yellow-400">Shared Memory Limit</h5>
					<p class="mb-2 text-[var(--color-muted)] text-[var(--text-tiny)]">
						Tiles must fit in shared memory. Example for A100 (164 KB):
					</p>
					<div class="rounded bg-slate-800 p-2 font-mono text-[var(--text-tiny)] text-yellow-300">
						T=128, FP32:<br />
						2 tiles × 128² × 4B = 128 KB ✓
					</div>
				</div>
				<div class="rounded border border-blue-500/30 bg-blue-500/10 p-3">
					<h5 class="mb-2 font-medium text-blue-400">Warp Alignment</h5>
					<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">
						T should be a multiple of 32 (warp size) for coalesced memory access. Common values:
					</p>
					<div class="mt-2 flex flex-wrap gap-1">
						{#each [16, 32, 64, 128] as size (size)}
							<span
								class="rounded bg-blue-500/20 px-2 py-0.5 font-mono text-[var(--text-tiny)] text-blue-300"
								>{size}</span
							>
						{/each}
					</div>
				</div>
				<div class="rounded border border-green-500/30 bg-green-500/10 p-3">
					<h5 class="mb-2 font-medium text-green-400">Matrix Divisibility</h5>
					<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">
						T should divide matrix dimensions evenly to avoid partially-filled tiles with low
						utilization.
					</p>
				</div>
			</div>
		</ContentBox>
	</Section>

	<!-- Wave Quantization -->
	<Section title="Wave Quantization: The Performance Cliff">
		<ContentBox variant="dark">
			<p class="mb-2 text-[var(--color-muted)] text-[var(--text-small)]">
				When the number of tiles exceeds the number of SMs, you need multiple "waves" of execution.
			</p>
			<p class="mb-4 font-mono text-[var(--color-accent)] text-[var(--text-tiny)]">
				Setup: A100 has 108 SMs, Tile size = 256×128
			</p>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<!-- Good case: 1792 × 1792 -->
				<div class="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
					<h5 class="mb-2 font-semibold text-green-400">Matrix Size: 1792 × 1792</h5>
					<div class="mb-3 space-y-1 text-[var(--color-muted)] text-[var(--text-tiny)]">
						<p>
							Tiles: (1792/256) × (1792/128) = 7 × 14 = <span class="font-mono text-green-400"
								>98 tiles</span
							>
						</p>
						<p>98 tiles &lt; 108 SMs → <span class="text-green-400">1 wave</span></p>
					</div>

					<!-- Wave 1 visualization -->
					<div class="mb-2">
						<p class="mb-1 text-[var(--text-tiny)] text-green-400">Wave 1:</p>
						<div class="flex h-6 overflow-hidden rounded">
							<div class="bg-green-500/60" style="width: 91%"></div>
							<div class="bg-slate-600/40" style="width: 9%"></div>
						</div>
						<div
							class="mt-1 flex justify-between text-[var(--color-muted)] text-[var(--text-tiny)]"
						>
							<span>98 active</span>
							<span>10 idle</span>
						</div>
					</div>

					<!-- Wave 2: Not needed -->
					<div class="mb-2">
						<p class="mb-1 text-[var(--color-muted)]/50 text-[var(--text-tiny)]">Wave 2:</p>
						<div
							class="flex h-6 items-center justify-center overflow-hidden rounded bg-slate-600/20"
						>
							<span class="text-[var(--color-muted)]/50 text-[var(--text-tiny)]">Not needed</span>
						</div>
						<div class="mt-1 text-center text-[var(--color-muted)]/50 text-[var(--text-tiny)]">
							—
						</div>
					</div>

					<div class="mt-3 rounded bg-green-500/20 p-2 text-center">
						<span class="font-mono text-green-400">91% utilization</span>
					</div>
				</div>

				<!-- Bad case: 1794 × 1794 -->
				<div class="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
					<h5 class="mb-2 font-semibold text-red-400">Matrix Size: 1794 × 1794</h5>
					<div class="mb-3 space-y-1 text-[var(--color-muted)] text-[var(--text-tiny)]">
						<p>
							Tiles: ceil(1794/256) × ceil(1794/128) = 8 × 15 = <span class="font-mono text-red-400"
								>120 tiles</span
							>
						</p>
						<p>120 tiles &gt; 108 SMs → <span class="text-red-400">2 waves</span></p>
					</div>

					<!-- Wave 1 visualization -->
					<div class="mb-2">
						<p class="mb-1 text-[var(--text-tiny)] text-cyan-400">Wave 1:</p>
						<div class="flex h-6 overflow-hidden rounded">
							<div class="w-full bg-cyan-500/60"></div>
						</div>
						<div class="mt-1 text-center text-[var(--color-muted)] text-[var(--text-tiny)]">
							108 active (full)
						</div>
					</div>

					<!-- Wave 2 visualization -->
					<div class="mb-2">
						<p class="mb-1 text-[var(--text-tiny)] text-red-400">Wave 2:</p>
						<div class="flex h-6 overflow-hidden rounded">
							<div class="bg-red-500/60" style="width: 11%"></div>
							<div class="bg-slate-600/40" style="width: 89%"></div>
						</div>
						<div
							class="mt-1 flex justify-between text-[var(--color-muted)] text-[var(--text-tiny)]"
						>
							<span>12 active</span>
							<span>96 idle</span>
						</div>
					</div>

					<div class="mt-3 rounded bg-red-500/20 p-2 text-center">
						<span class="font-mono text-red-400">56% utilization</span>
						<span class="text-[var(--color-muted)] text-[var(--text-tiny)]"> (120/216)</span>
					</div>
				</div>
			</div>

			<div class="mt-4 rounded border border-[var(--color-primary)]/30 bg-[var(--color-bg)] p-3">
				<p class="text-center text-[var(--color-primary)] text-[var(--text-small)]">
					Adding just 2 elements to each dimension caused utilization to drop from 91% to 56%!
				</p>
			</div>
		</ContentBox>
	</Section>

	<!-- Andrej Karpathy Tweet -->
	<Section title="Real-World Example: nanoGPT Optimization">
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<ContentBox variant="dark" class="border-l-4 border-[var(--color-primary)]">
				<blockquote class="text-[var(--color-muted)] text-[var(--text-small)] italic">
					"The most dramatic optimization to nanoGPT is to increase the vocab size from 50,257 to
					50,304, which is the nearest multiple of 64, giving you much higher occupancy."
				</blockquote>
				<p class="mt-2 text-right text-[var(--color-accent)] text-[var(--text-tiny)]">
					— Andrej Karpathy
				</p>
			</ContentBox>

			<ContentBox variant="dark" class="flex items-center justify-center">
				<div
					class="rounded-lg bg-gradient-to-br from-slate-800 via-slate-700 to-zinc-800 p-3 font-mono text-[var(--text-tiny)] shadow-inner"
				>
					<div class="text-center text-[var(--color-text)]">
						<div class="flex flex-wrap items-center justify-center gap-x-2">
							<span>50,257</span>
							<span>→</span>
							<span>50,304</span>
							<span class="text-[var(--color-muted)]">(+47 vocab tokens)</span>
						</div>
						<div class="mt-1">
							Result: <span class="text-green-400">~25% speedup</span> from better hardware alignment!
						</div>
					</div>
				</div>
			</ContentBox>
		</div>
	</Section>

	<!-- Burst Sections and Alignment -->
	<Section title="Burst Sections: Memory Alignment Matters">
		<ContentBox variant="dark">
			<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
				DRAM reads data in burst sections. Misaligned tiles require multiple reads:
			</p>

			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<!-- Aligned Tile -->
				<div class="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
					<h5 class="mb-3 font-semibold text-green-400">Aligned (4×4, burst size = 4)</h5>

					<!-- Memory Layout -->
					<p class="mb-2 text-[var(--color-muted)] text-[var(--text-tiny)]">Memory layout:</p>
					<div class="mb-3 flex flex-wrap gap-1">
						{#each ['0 1 2 3', '4 5 6 7', '8 9 A B', 'C D E F'] as burst, i (i)}
							<div
								class="rounded border border-green-400/40 bg-green-500/20 px-2 py-1 font-mono text-[var(--text-tiny)] text-green-300"
							>
								{burst}
							</div>
						{/each}
					</div>

					<!-- Tile Reads -->
					<p class="mb-2 text-[var(--color-muted)] text-[var(--text-tiny)]">Tile reads:</p>
					<div class="space-y-1 font-mono text-[var(--text-tiny)]">
						{#each [{ row: 0, data: '0 1 2 3' }, { row: 1, data: '4 5 6 7' }, { row: 2, data: '8 9 A B' }, { row: 3, data: 'C D E F' }] as read (read.row)}
							<div class="flex flex-wrap items-center gap-1">
								<span class="text-[var(--color-muted)]">Row {read.row}:</span>
								<span class="text-green-400">1 burst</span>
								<span class="text-[var(--color-muted)]">→</span>
								<span class="text-[var(--color-text)]">[{read.data}]</span>
							</div>
						{/each}
					</div>

					<!-- Result -->
					<div class="mt-3 rounded bg-green-500/20 p-2 text-center">
						<span class="font-mono text-green-400">4 burst reads</span>
					</div>
				</div>

				<!-- Misaligned Tile -->
				<div class="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
					<h5 class="mb-3 font-semibold text-red-400">Misaligned (+1 offset)</h5>

					<!-- Memory Layout -->
					<p class="mb-2 text-[var(--color-muted)] text-[var(--text-tiny)]">Memory layout:</p>
					<div class="mb-3 flex flex-wrap gap-1">
						{#each ['X 0 1 2', '3 4 5 6', '7 8 9 A', 'B C D E', 'F ...'] as burst, i (i)}
							<div
								class="rounded border border-red-400/40 bg-red-500/20 px-2 py-1 font-mono text-[var(--text-tiny)] text-red-300"
							>
								{burst}
							</div>
						{/each}
					</div>

					<!-- Tile Reads -->
					<p class="mb-2 text-[var(--color-muted)] text-[var(--text-tiny)]">Tile reads:</p>
					<div class="space-y-1 font-mono text-[var(--text-tiny)]">
						{#each [{ row: 0, data: '0 1 2 3' }, { row: 1, data: '4 5 6 7' }, { row: 2, data: '8 9 A B' }, { row: 3, data: 'C D E F' }] as read (read.row)}
							<div class="flex flex-wrap items-center gap-1">
								<span class="text-[var(--color-muted)]">Row {read.row}:</span>
								<span class="text-red-400">2 bursts!</span>
								<span class="text-[var(--color-muted)]">→</span>
								<span class="text-[var(--color-text)]">[{read.data}]</span>
							</div>
						{/each}
					</div>

					<!-- Result -->
					<div class="mt-3 rounded bg-red-500/20 p-2 text-center">
						<span class="font-mono text-red-400">8 burst reads (2× overhead!)</span>
					</div>
				</div>
			</div>

			<p class="mt-4 text-[var(--color-muted)] text-[var(--text-small)]">
				Ensuring data starts at aligned addresses avoids this 2× memory overhead. Memory allocators
				typically align to cache line boundaries for this reason.
			</p>
		</ContentBox>
	</Section>

	<!-- Performance Mystery Explained -->
	<Section title="The Mystery Explained: FLOPs Achieved for Square Matmuls">
		<ContentBox variant="dark">
			<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
				This chart reveals why GPU performance varies so dramatically with matrix dimensions. Three
				key effects combine to create the strange squiggly patterns:
			</p>

			<!-- Image from Horace He's blog -->
			<div class="mx-auto max-w-2xl">
				<a
					href="https://www.thonking.ai/p/what-shapes-do-matrix-multiplications"
					target="_blank"
					rel="noopener noreferrer"
					class="block"
				>
					<img
						src="/images/llm-gpu/matmul-flops.webp"
						alt="FLOPs achieved for square matmuls showing compute intensity, tiling, and wave quantization effects"
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
			</div>

			<!-- Annotations explaining the chart -->
			<div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
				<div class="rounded border border-pink-500/30 bg-pink-500/10 p-4">
					<h5 class="mb-2 font-medium text-pink-400">Compute Intensity</h5>
					<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">
						Square matmuls perform 2N³ FLOPs but only 3N² memory accesses. As N grows, the ratio
						improves and performance increases. N must reach hundreds before compute time exceeds
						memory time.
					</p>
				</div>
				<div class="rounded border border-yellow-500/30 bg-yellow-500/10 p-4">
					<h5 class="mb-2 font-medium text-yellow-400">Tiling!</h5>
					<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">
						Each horizontal "tier" represents a different tile size configuration. Larger tiles =
						more data reuse = higher performance. Divisibility by 32, 64, 128 yields progressively
						better results.
					</p>
				</div>
				<div class="rounded border border-green-500/30 bg-green-500/10 p-4">
					<h5 class="mb-2 font-medium text-green-400">Wave Quantization</h5>
					<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">
						With an A100's 108 SMs, if your tile grid needs 109 blocks, you need 2 "waves" instead
						of 1—cutting performance roughly in half. This creates the wavy patterns within each
						tier.
					</p>
				</div>
			</div>
		</ContentBox>

		<ContentBox variant="dark" class="mt-4">
			<p class="mb-2 font-medium text-[var(--color-text)] text-[var(--text-small)]">
				Why dimensions matter:
			</p>
			<div class="grid grid-cols-2 gap-2 text-[var(--text-tiny)] md:grid-cols-4">
				<div class="rounded bg-green-500/20 p-2 text-center">
					<span class="font-mono text-green-400">÷128</span>
					<p class="text-[var(--color-muted)]">Best alignment</p>
				</div>
				<div class="rounded bg-blue-500/20 p-2 text-center">
					<span class="font-mono text-blue-400">÷64</span>
					<p class="text-[var(--color-muted)]">Good</p>
				</div>
				<div class="rounded bg-yellow-500/20 p-2 text-center">
					<span class="font-mono text-yellow-400">÷32</span>
					<p class="text-[var(--color-muted)]">Okay</p>
				</div>
				<div class="rounded bg-red-500/20 p-2 text-center">
					<span class="font-mono text-red-400">Prime</span>
					<p class="text-[var(--color-muted)]">Worst</p>
				</div>
			</div>
		</ContentBox>
	</Section>

	<KeyTakeaway
		items={[
			'Arithmetic intensity = FLOPs / Bytes. High intensity → compute-bound (good)',
			'Lower precision (FP16 vs FP32) doubles effective memory bandwidth',
			'Tiling reduces global memory access by factor of tile size T',
			'Wave quantization: exceeding SM count by 1 tile can halve utilization',
			'Choose matrix dimensions divisible by 32/64/128 for best performance'
		]}
	/>
</div>
