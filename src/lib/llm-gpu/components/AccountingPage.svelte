<!-- ABOUTME: Resource accounting page for GPU Lab -->
<!-- ABOUTME: Covers memory, FLOPs, MFU calculations from Lecture 2 -->

<script>
	import { onMount } from 'svelte';
	import {
		HeroSection,
		Section,
		ContentBox,
		KeyTakeaway,
		DataTable,
		ComparisonGrid,
		CodeBlock,
		Math
	} from '$lib/shared';
	import Chart from 'chart.js/auto';

	let dataTypeChartCanvas;
	let dataTypeChart;

	const gpuSpecColumns = [
		{ key: 'name', header: 'GPU', color: 'accent', mono: true },
		{ key: 'mem', header: 'Memory (GB)', color: 'text' },
		{ key: 'bw', header: 'BW (GB/s)', color: 'text' },
		{ key: 'fp32', header: 'FP32 (TFLOP/s)', color: 'muted' },
		{ key: 'bf16', header: 'BF16 (TFLOP/s)', color: 'primary' },
		{ key: 'fp8', header: 'FP8 (TFLOP/s)', color: 'text' }
	];

	const gpuSpecData = [
		{ name: 'A100', mem: '80 HBM2e', bw: 2039, fp32: 19.5, bf16: 312, fp8: '—' },
		{ name: 'H100', mem: '80 HBM3', bw: 3350, fp32: 67, bf16: 990, fp8: 1979 },
		{ name: 'RTX PRO 6000', mem: '96 GDDR7', bw: 1800, fp32: 125, bf16: 252, fp8: 504 }
	];

	const memoryBreakdownItems = [
		{ title: 'Parameters', color: 'cyan', points: ['4 bytes (FP32)', 'Model weights'] },
		{ title: 'Gradients', color: 'emerald', points: ['4 bytes (FP32)', 'Same size as params'] },
		{ title: 'Optimizer (m)', color: 'amber', points: ['4 bytes (FP32)', 'First moment (AdamW)'] },
		{ title: 'Optimizer (v)', color: 'red', points: ['4 bytes (FP32)', 'Second moment (AdamW)'] }
	];

	const flopComparison = [
		{
			title: 'Forward Pass',
			color: 'blue',
			points: ['2 × N × T FLOPs', 'N = parameters', 'T = tokens']
		},
		{
			title: 'Backward Pass',
			color: 'purple',
			points: ['4 × N × T FLOPs', '2× for param grad', '2× for activation grad']
		},
		{
			title: 'Total Training',
			color: 'pink',
			points: ['6 × N × T FLOPs', 'The famous 6NT rule', '≈ 6 FLOPs per param-token']
		}
	];

	const mfuLevels = [
		{
			title: '<10% MFU',
			color: 'red',
			points: ['Something is wrong', 'Check for bottlenecks', 'Memory or communication bound']
		},
		{
			title: '30-50% MFU',
			color: 'amber',
			points: ['Typical for large models', 'Communication overhead', 'Acceptable for distributed']
		},
		{
			title: '>50% MFU',
			color: 'emerald',
			points: ['Good utilization', 'Matmuls dominating', 'Well-optimized code']
		}
	];

	const formulas = {
		memoryTotal: '\\text{Total} = 4 + 4 + 4 + 4 = \\mathbf{16} \\text{ bytes/parameter}',
		matmulFlops: '\\text{FLOPs} = 2 \\times B \\times D \\times K',
		mfu: '\\text{MFU} = \\frac{\\text{Actual FLOPs}}{\\text{Promised FLOP/s} \\times \\text{Time}}'
	};

	onMount(() => {
		console.log('Canvas element:', dataTypeChartCanvas);

		// Data type bit layout chart
		dataTypeChart = new Chart(dataTypeChartCanvas, {
			type: 'bar',
			data: {
				labels: ['FP32 (4 bytes)', 'FP16 (2 bytes)', 'BF16 (2 bytes)', 'FP8 (1 byte)'],
				datasets: [
					{ label: 'Sign', data: [1, 1, 1, 1], backgroundColor: '#ef4444' },
					{ label: 'Exponent', data: [8, 5, 8, 4], backgroundColor: '#3b82f6' },
					{ label: 'Fraction', data: [23, 10, 7, 3], backgroundColor: '#10b981' }
				]
			},
			options: {
				indexAxis: 'y',
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { position: 'bottom', labels: { color: '#9ca3af' } },
					title: { display: true, text: 'Floating Point Bit Layout', color: '#d4d4d4' },
					tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.raw} bits` } }
				},
				scales: {
					x: {
						stacked: true,
						max: 32,
						title: { display: true, text: 'Bits', color: '#9ca3af' },
						ticks: { color: '#9ca3af' },
						grid: { color: '#374151' }
					},
					y: { stacked: true, ticks: { color: '#9ca3af' }, grid: { display: false } }
				}
			}
		});

		return () => {
			dataTypeChart?.destroy();
		};
	});
</script>

<div class="space-y-6">
	<HeroSection icon="🧮" title="Resource Accounting">
		<p class="max-w-3xl leading-relaxed text-[var(--color-muted)] text-[var(--text-body)]">
			Before training a model, you need to know exactly how much memory and compute it requires.
			This "napkin math" directly translates to dollars—efficiency is the name of the game.
		</p>
	</HeroSection>

	<Section title="Napkin Math Questions">
		<ComparisonGrid
			columns={2}
			items={[
				{
					title: '70B model on 15T tokens with 1,024 H100s?',
					color: 'pink',
					points: ['≈ 144 days training time', '6 × 70B × 15T = 6.3e24 FLOPs', 'Assuming 50% MFU']
				},
				{
					title: 'Largest model on 8 H100s with AdamW?',
					color: 'cyan',
					points: ['≈ 40B parameters', '640GB ÷ 16 bytes/param', 'Not counting activations']
				}
			]}
		/>
	</Section>

	<!-- SOURCE: IEEE 754 / Wikipedia https://en.wikipedia.org/wiki/IEEE_754 -->
	<Section title="Data Types & Memory">
		<ContentBox variant="dark">
			<div class="h-64">
				<canvas bind:this={dataTypeChartCanvas}></canvas>
			</div>
		</ContentBox>

		<!-- How floating point works -->
		<ContentBox variant="dark" class="mt-4">
			<p class="mb-3 text-[var(--color-muted)] text-[var(--text-small)]">
				Floating point numbers are stored as: <span class="font-mono text-[var(--color-accent)]"
					>(-1)^sign × 1.mantissa × 2^(exponent-bias)</span
				>
			</p>

			<!-- Formula breakdown -->
			<div class="mb-4 grid grid-cols-3 gap-2 text-[var(--text-tiny)]">
				<div class="rounded border border-red-500/30 bg-red-500/10 p-2">
					<p class="mb-1 font-mono text-red-300">(-1)^sign</p>
					<p class="text-[var(--color-muted)]">
						<span class="text-red-300">sign=0</span> → (-1)⁰ =
						<span class="text-[var(--color-text)]">+1</span>
					</p>
					<p class="text-[var(--color-muted)]">
						<span class="text-red-300">sign=1</span> → (-1)¹ =
						<span class="text-[var(--color-text)]">-1</span>
					</p>
				</div>
				<div class="rounded border border-emerald-500/30 bg-emerald-500/10 p-2">
					<p class="mb-1 font-mono text-emerald-300">1.mantissa</p>
					<p class="text-[var(--color-muted)]">
						The <span class="text-emerald-300">1.</span> is implicit (not stored)
					</p>
					<p class="text-[var(--color-muted)]">
						e.g., stored <span class="font-mono">1011</span> →
						<span class="text-[var(--color-text)]">1.1011</span>
					</p>
				</div>
				<div class="rounded border border-blue-500/30 bg-blue-500/10 p-2">
					<p class="mb-1 font-mono text-blue-300">2^(exp-bias)</p>
					<p class="text-[var(--color-muted)]">
						Bias shifts stored value to allow negative exponents
					</p>
					<p class="text-[var(--color-muted)]">
						e.g., stored <span class="font-mono">129</span> → 2^(129-127) =
						<span class="text-[var(--color-text)]">4</span>
					</p>
				</div>
			</div>

			<!-- Side-by-side Forward and Reverse -->
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<!-- Forward: Decimal to Binary -->
				<div class="rounded-lg border border-cyan-500/30 bg-[var(--color-bg)] p-3">
					<p class="mb-2 font-medium text-cyan-400">Forward: Decimal → FP32</p>
					<p class="mb-3 text-[var(--color-muted)] text-[var(--text-tiny)]">
						Example: <span class="font-mono text-[var(--color-primary)]">6.75</span>
					</p>

					<div class="space-y-2 text-[var(--text-tiny)]">
						<!-- Step 1: To binary -->
						<div class="rounded border border-cyan-500/20 bg-cyan-500/5 p-2">
							<p class="mb-1 text-cyan-300">Step 1: Convert to binary</p>
							<div class="ml-2 space-y-1 text-[var(--color-muted)]">
								<p>
									Integer <span class="font-mono">6</span>: divide by 2, read remainders ↑
								</p>
								<p class="ml-2 font-mono text-[var(--color-text)]">
									6→3→1→0 remainders: 0,1,1 → 110₂
								</p>
								<p>
									Fraction <span class="font-mono">0.75</span>: multiply by 2, read integers ↓
								</p>
								<p class="ml-2 font-mono text-[var(--color-text)]">0.75×2=1.5, 0.5×2=1.0 → .11₂</p>
							</div>
							<p class="mt-1 text-center font-mono text-[var(--color-text)]">
								6.75₁₀ = <span class="text-cyan-300">110.11</span>₂
							</p>
						</div>

						<!-- Step 2: Normalize -->
						<div class="rounded border border-cyan-500/20 bg-cyan-500/5 p-2">
							<p class="mb-1 text-cyan-300">Step 2: Normalize to 1.xxx</p>
							<p class="text-center font-mono text-[var(--color-muted)]">
								110.11₂ → <span class="text-[var(--color-text)]">1.1011 × 2²</span>
							</p>
						</div>

						<!-- Step 3: Extract components -->
						<div class="rounded border border-cyan-500/20 bg-cyan-500/5 p-2">
							<p class="mb-1 text-cyan-300">Step 3: Store components</p>
							<div class="space-y-1 text-[var(--color-muted)]">
								<p>
									<span class="rounded bg-red-500/20 px-1 font-mono text-red-300">Sign</span> = 0 (positive)
								</p>
								<p>
									<span class="rounded bg-blue-500/20 px-1 font-mono text-blue-300">Exp</span> = 2 + 127
									= 129
								</p>
								<p>
									<span class="rounded bg-emerald-500/20 px-1 font-mono text-emerald-300">Frac</span
									>
									= 1011 (implicit 1.)
								</p>
							</div>
						</div>

						<!-- Result -->
						<div
							class="rounded border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 p-2"
						>
							<p class="text-center font-mono text-[var(--text-tiny)]">
								<span class="text-red-300">0</span><span class="text-[var(--color-muted)]">|</span
								><span class="text-blue-300">10000001</span><span class="text-[var(--color-muted)]"
									>|</span
								><span class="text-emerald-300">10110000...</span>
							</p>
						</div>
					</div>
				</div>

				<!-- Reverse: Binary to Decimal -->
				<div class="rounded-lg border border-amber-500/30 bg-[var(--color-bg)] p-3">
					<p class="mb-2 font-medium text-amber-400">Reverse: FP32 → Decimal</p>
					<p class="mb-3 font-mono text-[var(--color-muted)] text-[var(--text-tiny)]">
						<span class="text-red-300">0</span>|<span class="text-blue-300">10000001</span>|<span
							class="text-emerald-300">1011...</span
						>
					</p>

					<div class="space-y-2 text-[var(--text-tiny)]">
						<!-- Step 1: Extract -->
						<div class="rounded border border-amber-500/20 bg-amber-500/5 p-2">
							<p class="mb-1 text-amber-300">Step 1: Extract components</p>
							<div class="flex flex-wrap gap-1">
								<span class="rounded bg-red-500/20 px-1 font-mono text-red-300">sign=0</span>
								<span class="rounded bg-blue-500/20 px-1 font-mono text-blue-300">exp=129</span>
								<span class="rounded bg-emerald-500/20 px-1 font-mono text-emerald-300"
									>frac=1011</span
								>
							</div>
						</div>

						<!-- Step 2: Decode exponent -->
						<div class="rounded border border-amber-500/20 bg-amber-500/5 p-2">
							<p class="mb-1 text-amber-300">Step 2: Decode exponent</p>
							<p class="text-center font-mono text-[var(--color-muted)]">
								129 - 127 = <span class="text-[var(--color-text)]">2</span>
							</p>
						</div>

						<!-- Step 3: Add implicit 1 -->
						<div class="rounded border border-amber-500/20 bg-amber-500/5 p-2">
							<p class="mb-1 text-amber-300">Step 3: Add implicit 1.</p>
							<p class="text-center font-mono text-[var(--color-muted)]">
								1011 → <span class="text-[var(--color-text)]">1.1011₂</span>
							</p>
						</div>

						<!-- Step 4: Apply formula -->
						<div class="rounded border border-amber-500/20 bg-amber-500/5 p-2">
							<p class="mb-1 text-amber-300">Step 4: Apply formula</p>
							<div class="space-y-0.5 font-mono text-[var(--color-muted)]">
								<p>(-1)⁰ × 1.1011₂ × 2²</p>
								<p>= 1.1011₂ × 4 = <span class="text-[var(--color-text)]">110.11₂</span></p>
							</div>
						</div>

						<!-- Step 5: To decimal -->
						<div class="rounded border border-amber-500/20 bg-amber-500/5 p-2">
							<p class="mb-1 text-amber-300">Step 5: Binary to decimal</p>
							<div class="space-y-0.5 font-mono text-[var(--color-muted)]">
								<p>
									<span class="text-cyan-300">110</span>₂ = 4+2+0 =
									<span class="text-cyan-300">6</span>
								</p>
								<p>
									.<span class="text-purple-300">11</span>₂ = 0.5+0.25 =
									<span class="text-purple-300">0.75</span>
								</p>
							</div>
						</div>

						<!-- Result -->
						<div
							class="rounded border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 p-2"
						>
							<p class="text-center font-mono text-[var(--color-text)]">
								= <span class="text-[var(--color-primary)]">6.75</span>
							</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Detailed explanations below -->
			<div class="mt-4 space-y-3">
				<!-- Exponent bias explanation -->
				<div class="rounded border border-blue-500/30 bg-blue-500/10 p-3 text-[var(--text-tiny)]">
					<p class="mb-2 font-medium text-blue-300">Why add 127 to exponent?</p>
					<p class="mb-2 text-[var(--color-muted)]">
						Exponents can be negative (0.5 = 2⁻¹) or positive (8 = 2³). Adding 127 shifts everything
						positive:
					</p>
					<div class="grid grid-cols-4 gap-1 text-center font-mono">
						<div class="rounded bg-blue-500/20 px-1 py-0.5 text-blue-300">Number</div>
						<div class="rounded bg-blue-500/20 px-1 py-0.5 text-blue-300">Real exp</div>
						<div class="rounded bg-blue-500/20 px-1 py-0.5 text-blue-300">Stored</div>
						<div class="rounded bg-blue-500/20 px-1 py-0.5 text-blue-300">Decode</div>
						<div class="text-[var(--color-muted)]">0.25</div>
						<div class="text-[var(--color-muted)]">-2</div>
						<div class="text-[var(--color-text)]">125</div>
						<div class="text-[var(--color-muted)]">125-127=-2</div>
						<div class="text-[var(--color-muted)]">1.0</div>
						<div class="text-[var(--color-muted)]">0</div>
						<div class="text-[var(--color-text)]">127</div>
						<div class="text-[var(--color-muted)]">127-127=0</div>
						<div class="text-[var(--color-primary)]">6.75</div>
						<div class="text-[var(--color-primary)]">2</div>
						<div class="text-[var(--color-text)]">129</div>
						<div class="text-[var(--color-muted)]">129-127=2</div>
					</div>
				</div>

				<!-- Implicit 1 explanation -->
				<div
					class="rounded border border-emerald-500/30 bg-emerald-500/10 p-3 text-[var(--text-tiny)]"
				>
					<p class="mb-1 font-medium text-emerald-300">Why is the 1. implicit?</p>
					<p class="text-[var(--color-muted)]">
						Normalized binary always starts with 1.xxx, so we don't store it. From
						<span class="font-mono">1.1011</span>, we only store
						<span class="font-mono text-emerald-300">1011</span>. This gives us 1 extra bit of
						precision for free!
					</p>
				</div>
			</div>

			<p class="mt-3 text-[var(--color-muted)] text-[var(--text-tiny)]">
				<a
					href="https://en.wikipedia.org/wiki/IEEE_754"
					target="_blank"
					rel="noopener noreferrer external"
					class="text-cyan-400 hover:underline">Source: IEEE 754 Standard</a
				>
			</p>
		</ContentBox>

		<ContentBox variant="dark" class="mt-4">
			<p class="mb-3 font-medium text-[var(--color-text)] text-[var(--text-small)]">
				Key Insight: BF16 vs FP16
			</p>
			<div class="grid grid-cols-2 gap-4">
				<div class="rounded bg-[var(--color-bg)] p-3">
					<p class="font-mono text-[var(--color-accent)] text-[var(--text-small)]">BF16</p>
					<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">
						8-bit exponent = FP32's dynamic range
					</p>
					<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">
						Handles large gradients without overflow
					</p>
				</div>
				<div class="rounded bg-[var(--color-bg)] p-3">
					<p class="font-mono text-[var(--color-accent)] text-[var(--text-small)]">FP16</p>
					<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">
						5-bit exponent = limited range
					</p>
					<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">
						Needs loss scaling to avoid underflow
					</p>
				</div>
			</div>
			<p class="mt-3 text-[var(--color-primary)] text-[var(--text-tiny)]">
				BF16 is preferred for training because it has FP32's dynamic range with FP16's memory
				footprint.
			</p>
		</ContentBox>
	</Section>

	<Section title="Training Memory Breakdown">
		<ContentBox variant="dark">
			<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
				For AdamW with FP32, each parameter requires <strong class="text-[var(--color-accent)]"
					>16 bytes</strong
				> of memory:
			</p>
			<ComparisonGrid columns={4} items={memoryBreakdownItems} />
		</ContentBox>

		<ContentBox variant="dark" class="mt-4">
			<Math formula={formulas.memoryTotal} />
		</ContentBox>

		<ContentBox variant="dark" class="mt-4">
			<CodeBlock title="Quick Calculation: Max Model Size">
				# 8× H100 (80GB each) = 640GB total<br />
				# 16 bytes per parameter for AdamW<br />
				<br />
				max_params = 640 GB / 16 bytes =
				<span class="text-[var(--color-primary)]">40B parameters</span>
			</CodeBlock>
		</ContentBox>
	</Section>

	<!-- SOURCE: Kaplan et al. 2020 "Scaling Laws for Neural Language Models" https://arxiv.org/abs/2001.08361 -->
	<Section title="FLOP Counting">
		<ContentBox variant="dark">
			<p class="mb-3 text-[var(--color-muted)] text-[var(--text-small)]">
				For a matrix multiply [B×D] × [D×K] → [B×K]:
			</p>
			<Math formula={formulas.matmulFlops} />
			<p class="mt-2 text-[var(--color-muted)] text-[var(--text-tiny)]">
				One multiply + one add per output element, summed over inner dimension
			</p>
		</ContentBox>

		<ContentBox variant="dark" class="mt-4">
			<div class="mb-3 flex items-center justify-between">
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">
					Training FLOPs for a model with <strong class="text-[var(--color-accent)]"
						>N parameters</strong
					>
					on
					<strong class="text-[var(--color-accent)]">T tokens</strong>:
				</p>
				<a
					href="https://arxiv.org/abs/2001.08361"
					target="_blank"
					rel="noopener noreferrer external"
					class="rounded bg-cyan-500/20 px-2 py-1 text-[var(--text-tiny)] text-cyan-400 hover:bg-cyan-500/30"
				>
					Kaplan et al. 2020
				</a>
			</div>
			<ComparisonGrid columns={3} items={flopComparison} />
			<p class="mt-3 text-[var(--color-muted)] text-[var(--text-tiny)]">
				From "Scaling Laws for Neural Language Models" (arXiv:2001.08361): Forward pass ≈ 2N FLOPs
				per token, backward pass ≈ 4N (2× for activation gradients, 2× for weight gradients).
			</p>
		</ContentBox>
	</Section>

	<Section title="Model FLOPs Utilization (MFU)">
		<ContentBox variant="dark">
			<p class="mb-3 text-[var(--color-muted)] text-[var(--text-small)]">
				MFU measures how efficiently you're using your GPU's theoretical peak performance:
			</p>
			<Math formula={formulas.mfu} />
			<p class="mt-3 text-[var(--color-muted)] text-[var(--text-small)]">
				If a GPU advertises 990 TFLOP/s and your training achieves 495 TFLOP/s, your MFU is 50%.
			</p>
		</ContentBox>

		<ContentBox variant="dark" class="mt-4">
			<ComparisonGrid columns={3} items={mfuLevels} />
			<p class="mt-4 text-[var(--color-muted)] text-[var(--text-small)]">
				MFU can't reach 100% because it ignores communication overhead, memory transfers, and
				non-matmul operations.
			</p>
		</ContentBox>
	</Section>

	<Section title="Training Time Calculation">
		<ContentBox variant="dark">
			<CodeBlock title="Example: 70B Model on 1,024 H100s">
				Total FLOPs needed: 6 × 70B × 15T = 6.3e24<br />
				H100 BF16 (no sparsity): ~990 TFLOP/s<br />
				MFU assumption: 50%<br />
				Effective FLOP/s per GPU: 495 TFLOP/s<br />
				Total cluster FLOP/s: 1,024 × 495T = 5.07e17 FLOP/s<br />
				<br />
				<span class="text-[var(--color-primary)]"
					>Time: 6.3e24 / 5.07e17 = 1.24e7 seconds ≈ 144 days</span
				>
			</CodeBlock>
		</ContentBox>
	</Section>

	<Section title="GPU Specifications Reference">
		<ContentBox variant="dark">
			<DataTable columns={gpuSpecColumns} data={gpuSpecData} keyField="name" />
			<p class="mt-3 text-[var(--color-muted)] text-[var(--text-tiny)]">
				* BF16/FP8 numbers are for tensor cores without sparsity. Sparsity can 2× these numbers.
			</p>
		</ContentBox>
	</Section>

	<KeyTakeaway
		items={[
			'Memory per parameter: 16 bytes for AdamW (params + grads + 2× optimizer state)',
			'Training FLOPs = 6 × N × T (2× forward + 4× backward)',
			'MFU > 50% is considered good; matmuls dominate when matrices are large'
		]}
	/>
</div>
