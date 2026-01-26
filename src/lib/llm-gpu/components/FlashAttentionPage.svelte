<!-- ABOUTME: FlashAttention case study page for GPU Lab -->
<!-- ABOUTME: Covers standard attention problem, online softmax, tiled attention algorithm -->

<script>
	import { onMount } from 'svelte';
	import { HeroSection, Section, ContentBox, KeyTakeaway, Math } from '$lib/shared';
	import Chart from 'chart.js/auto';

	let memoryChartCanvas;
	let memoryChart;

	const formulas = {
		attention: 'O = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d}}\\right) V',
		standardMemory: 'O(N^2) \\text{ memory for attention matrix}',
		flashMemory: 'O(N) \\text{ memory (no full attention matrix)}',
		onlineSoftmax: 'm_{\\text{new}} = \\max(m_{\\text{old}}, \\max(\\text{new\\_chunk}))'
	};

	onMount(() => {
		// Memory usage comparison
		const seqLengths = [512, 1024, 2048, 4096, 8192, 16384, 32768];
		const standardMem = seqLengths.map((n) => (n * n * 2) / (1024 * 1024)); // BF16
		const flashMem = seqLengths.map((n) => (n * 128 * 2) / (1024 * 1024)); // Block size 128

		memoryChart = new Chart(memoryChartCanvas, {
			type: 'line',
			data: {
				labels: seqLengths.map((n) => n.toString()),
				datasets: [
					{
						label: 'Standard Attention',
						data: standardMem,
						borderColor: '#ef4444',
						backgroundColor: 'rgba(239, 68, 68, 0.1)',
						fill: false,
						tension: 0.3,
						pointRadius: 5
					},
					{
						label: 'FlashAttention',
						data: flashMem,
						borderColor: '#22c55e',
						backgroundColor: 'rgba(34, 197, 94, 0.1)',
						fill: false,
						tension: 0.3,
						pointRadius: 5
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						display: false
					},
					title: {
						display: true,
						text: 'Attention Matrix Memory (BF16)',
						color: '#d4d4d4'
					}
				},
				scales: {
					y: {
						type: 'logarithmic',
						title: { display: true, text: 'Memory (MB)', color: '#9ca3af' },
						ticks: { color: '#9ca3af' },
						grid: { color: '#374151' }
					},
					x: {
						title: { display: true, text: 'Sequence Length', color: '#9ca3af' },
						ticks: { color: '#9ca3af' },
						grid: { color: '#374151' }
					}
				}
			}
		});

		return () => {
			memoryChart?.destroy();
		};
	});
</script>

<div class="space-y-6">
	<HeroSection icon="⚡" title="FlashAttention: A Case Study">
		<p class="max-w-3xl leading-relaxed text-[var(--color-muted)] text-[var(--text-body)]">
			FlashAttention combines tiling, fusion, and recomputation to make attention fast and
			memory-efficient. It's the culmination of every GPU optimization technique we've learned.
		</p>
		<a
			href="https://arxiv.org/abs/2205.14135"
			target="_blank"
			rel="noopener noreferrer"
			class="mt-3 inline-flex items-center gap-1 text-[var(--color-primary)] text-[var(--text-small)] hover:underline"
		>
			Read the paper <span class="text-[var(--text-tiny)]">↗</span>
		</a>
	</HeroSection>

	<!-- Overview Diagram -->
	<Section>
		<ContentBox variant="dark">
			<img
				src="/images/llm-gpu/flash-attention-overview.png"
				alt="FlashAttention overview showing memory hierarchy, tiled processing with inner/outer loops, and performance comparison"
				class="w-full rounded"
			/>
		</ContentBox>
	</Section>

	<!-- The Problem -->
	<Section title="The Problem: Standard Attention is Memory-Hungry">
		<ContentBox variant="dark" class="border-l-4 border-red-500">
			<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
				Standard attention computes and stores the full N×N attention matrix, which grows
				quadratically with sequence length.
			</p>
			<Math formula={formulas.attention} />
		</ContentBox>

		<ContentBox variant="dark" class="mt-4">
			<div
				class="rounded-lg bg-gradient-to-br from-slate-800 via-slate-700 to-zinc-800 p-4 font-mono text-[var(--text-tiny)] shadow-inner"
			>
				<pre class="break-words whitespace-pre-wrap text-[var(--color-text)]">
<span class="text-[var(--color-muted)]">Standard Attention (PyTorch):</span>

<span class="text-cyan-400">def attention(Q, K, V):</span>
    # Q, K, V: [batch, heads, seq_len, head_dim]

    <span class="text-red-400"># Step 1: Compute attention scores</span>
    scores = Q @ K.transpose(-2, -1) / sqrt(d)
    # scores: [batch, heads, <span class="text-red-400">seq_len, seq_len</span>]  ← O(N²) memory!

    <span class="text-red-400"># Step 2: Softmax (reads/writes full N×N matrix)</span>
    attn = softmax(scores, dim=-1)
    # attn: [batch, heads, <span class="text-red-400">seq_len, seq_len</span>]  ← O(N²) memory!

    <span class="text-red-400"># Step 3: Apply to values</span>
    output = attn @ V

    return output

<span class="text-[var(--color-primary)]">Memory bottleneck: Two N×N matrices stored in HBM!</span>
				</pre>
			</div>
		</ContentBox>
	</Section>

	<!-- The Solution: Overview of Techniques -->
	<Section title="The Solution: Techniques Used in FlashAttention">
		<ContentBox variant="dark" class="border-l-4 border-green-500">
			<p class="text-[var(--color-muted)] text-[var(--text-small)]">
				FlashAttention never materializes the full attention matrix. It combines multiple GPU
				optimization techniques into one algorithm.
			</p>
		</ContentBox>

		<!-- Chart + Techniques side by side -->
		<div class="mx-auto mt-4 flex max-w-4xl flex-col gap-4 lg:flex-row">
			<!-- Left: Chart with fixed dimensions -->
			<ContentBox variant="dark" class="lg:w-[400px] lg:shrink-0">
				<div class="h-64 w-full">
					<canvas bind:this={memoryChartCanvas}></canvas>
				</div>
				<!-- Legend -->
				<div class="mt-3 flex items-start justify-between gap-4 text-[var(--text-tiny)]">
					<div class="flex flex-col gap-1">
						<span class="flex items-center gap-1">
							<span class="h-0.5 w-4 rounded bg-red-500"></span>
							<span class="text-[var(--color-muted)]">Standard</span>
						</span>
						<span class="flex items-center gap-1">
							<span class="h-0.5 w-4 rounded bg-green-500"></span>
							<span class="text-[var(--color-muted)]">FlashAttention</span>
						</span>
					</div>
					<span class="text-[var(--color-muted)]">
						32K: <span class="text-red-400">2GB</span> vs
						<span class="text-green-400">&lt;10MB</span>
					</span>
				</div>
			</ContentBox>

			<!-- Right: Techniques Grid 2x3 -->
			<div class="grid flex-1 grid-cols-2 gap-2">
				<div class="rounded border border-yellow-500/30 bg-[var(--color-surface)] p-3">
					<div class="flex items-center gap-1">
						<span
							class="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500/20 text-[var(--text-tiny)] text-yellow-400"
							>★</span
						>
						<span class="font-semibold text-[var(--text-tiny)] text-yellow-400">Online Softmax</span
						>
					</div>
					<p class="mt-1 text-[var(--color-muted)] text-[var(--text-tiny)]">
						The key algorithmic trick
					</p>
				</div>
				<div class="rounded border border-purple-500/30 bg-[var(--color-surface)] p-3">
					<div class="flex items-center gap-1">
						<span
							class="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-[var(--text-tiny)] text-purple-400"
							>2</span
						>
						<span class="font-semibold text-[var(--text-tiny)] text-purple-400">Tiling</span>
					</div>
					<p class="mt-1 text-[var(--color-muted)] text-[var(--text-tiny)]">
						Block-wise in shared memory
					</p>
				</div>
				<div class="rounded border border-cyan-500/30 bg-[var(--color-surface)] p-3">
					<div class="flex items-center gap-1">
						<span
							class="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 text-[var(--text-tiny)] text-cyan-400"
							>3</span
						>
						<span class="font-semibold text-[var(--text-tiny)] text-cyan-400">Fusion</span>
					</div>
					<p class="mt-1 text-[var(--color-muted)] text-[var(--text-tiny)]">
						QK<sup>T</sup>, softmax, ×V in one kernel
					</p>
				</div>
				<div class="rounded border border-green-500/30 bg-[var(--color-surface)] p-3">
					<div class="flex items-center gap-1">
						<span
							class="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20 text-[var(--text-tiny)] text-green-400"
							>4</span
						>
						<span class="font-semibold text-[var(--text-tiny)] text-green-400">Recompute</span>
					</div>
					<p class="mt-1 text-[var(--color-muted)] text-[var(--text-tiny)]">
						Recompute in backward pass
					</p>
				</div>
				<div class="rounded border border-blue-500/30 bg-[var(--color-surface)] p-3">
					<div class="flex items-center gap-1">
						<span
							class="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-[var(--text-tiny)] text-blue-400"
							>5</span
						>
						<span class="font-semibold text-[var(--text-tiny)] text-blue-400">Coalescing</span>
					</div>
					<p class="mt-1 text-[var(--color-muted)] text-[var(--text-tiny)]">
						Careful memory layout
					</p>
				</div>
				<div class="rounded border border-pink-500/30 bg-[var(--color-surface)] p-3">
					<div class="flex items-center gap-1">
						<span
							class="flex h-5 w-5 items-center justify-center rounded-full bg-pink-500/20 text-[var(--text-tiny)] text-pink-400"
							>6</span
						>
						<span class="font-semibold text-[var(--text-tiny)] text-pink-400">Precision</span>
					</div>
					<p class="mt-1 text-[var(--color-muted)] text-[var(--text-tiny)]">BF16/FP16 throughout</p>
				</div>
			</div>
		</div>
	</Section>

	<!-- From Safe Softmax to Online Softmax -->
	<Section title="From Safe Softmax to Online Softmax" titleColor="#fbbf24">
		<ContentBox variant="dark" class="border-l-4 border-yellow-500">
			<p class="mb-2 text-[var(--color-muted)] text-[var(--text-small)]">
				<strong class="text-yellow-400">Online Softmax</strong> is the key insight that makes everything
				else possible. It allows softmax to be computed incrementally, enabling tile-by-tile processing
				without ever storing the full N×N attention matrix.
			</p>
			<p class="mt-2 text-[var(--color-muted)] text-[var(--text-small)]">
				<strong class="text-yellow-400">Important:</strong> FlashAttention doesn't optimize naive
				softmax—it optimizes <strong class="text-[var(--color-accent)]">Safe Softmax</strong>, which
				subtracts the max for numerical stability. Understanding this progression is key.
			</p>
		</ContentBox>

		<!-- Step 1: Why Safe Softmax -->
		<ContentBox variant="dark" class="mt-4">
			<h4 class="mb-3 font-medium text-yellow-400">Step 1: Why We Need Safe Softmax</h4>
			<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<div class="rounded border border-red-500/30 bg-[var(--color-bg)] p-4">
					<h5 class="mb-3 font-medium text-[var(--text-body)] text-red-400">Naive Softmax</h5>
					<div class="font-mono text-[var(--text-h3)]">
						<p class="text-[var(--color-accent)]">
							a<sub>i</sub> = e<sup>x<sub>i</sub></sup> / Σ e<sup>x<sub>j</sub></sup>
						</p>
					</div>
					<p class="mt-4 text-[var(--color-muted)] text-[var(--text-small)]">
						<span class="text-red-400">Problem:</span> With half precision, e<sup>x</sup> overflows
						for x &gt; 11. If any x<sub>i</sub> is large, computation explodes.
					</p>
				</div>
				<div class="rounded border border-green-500/30 bg-[var(--color-bg)] p-4">
					<h5 class="mb-3 font-medium text-[var(--text-body)] text-green-400">Safe Softmax</h5>
					<div class="font-mono text-[var(--text-h3)]">
						<p class="text-[var(--color-accent)]">
							a<sub>i</sub> = e<sup>(x<sub>i</sub> - m)</sup> / Σ e<sup>(x<sub>j</sub> - m)</sup>
						</p>
						<p class="mt-2 text-[var(--color-muted)] text-[var(--text-small)]">
							where m = max(x<sub>1</sub>, ..., x<sub>N</sub>)
						</p>
					</div>
					<p class="mt-4 text-[var(--color-muted)] text-[var(--text-small)]">
						<span class="text-green-400">Solution:</span> Subtract max first. Now all exponents are
						≤ 0, so e<sup>(x-m)</sup> ≤ 1. No overflow!
					</p>
				</div>
			</div>
		</ContentBox>

		<!-- Step 2: Safe Softmax requires 3 passes -->
		<ContentBox variant="dark" class="mt-4">
			<h4 class="mb-3 font-medium text-yellow-400">Step 2: Safe Softmax Requires 3 Passes</h4>
			<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
				For a sequence S = {'{'}x<sub>1</sub>, x<sub>2</sub>, ..., x<sub>N</sub>}, safe softmax
				needs:
			</p>

			<!-- 3 passes layout -->
			<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
				<!-- Pass 1 -->
				<div class="rounded-lg border border-red-500 bg-red-500/10 p-4">
					<h5 class="mb-3 font-bold text-[var(--text-body)] text-red-400">
						Pass 1: Find Max <span class="font-normal text-[var(--color-muted)]"
							>(→ m<sub>N</sub>)</span
						>
					</h5>
					<div class="space-y-2 font-mono text-[var(--text-h3)]">
						<p class="text-[var(--color-muted)]">m<sub>0</sub> = -∞</p>
						<p class="text-[var(--color-muted)]">
							m<sub>i</sub> = max(m<sub>i-1</sub>, x<sub>i</sub>)
						</p>
					</div>
				</div>

				<!-- Pass 2 -->
				<div class="rounded-lg border border-orange-500 bg-orange-500/10 p-4">
					<h5 class="mb-3 font-bold text-[var(--text-body)] text-orange-400">
						Pass 2: Sum exp <span class="font-normal text-[var(--color-muted)]"
							>(→ d<sub>N</sub>)</span
						>
					</h5>
					<div class="space-y-2 font-mono text-[var(--text-h3)]">
						<p class="text-[var(--color-muted)]">d<sub>0</sub> = 0</p>
						<p class="text-[var(--color-muted)]">
							d<sub>i</sub> = d<sub>i-1</sub> + e<sup>(x<sub>i</sub> - m<sub>N</sub>)</sup>
						</p>
					</div>
				</div>

				<!-- Pass 3 -->
				<div class="rounded-lg border border-green-500 bg-green-500/10 p-4">
					<h5 class="mb-3 font-bold text-[var(--text-body)] text-green-400">Pass 3: Normalize</h5>
					<div class="font-mono text-[var(--text-h3)]">
						<p class="text-[var(--color-muted)]">
							a<sub>i</sub> = e<sup>(x<sub>i</sub> - m<sub>N</sub>)</sup> / d<sub>N</sub>
						</p>
					</div>
				</div>
			</div>

			<!-- Problem callout -->
			<div class="mt-4 rounded-lg border border-dashed border-red-500 bg-red-500/5 p-4">
				<p class="mb-2 text-center font-bold text-[var(--text-body)] text-red-400">
					The Problem: Dependencies Block Fusion
				</p>
				<div class="space-y-1 text-center text-[var(--color-muted)] text-[var(--text-small)]">
					<p>Pass 2 needs m<sub>N</sub> from Pass 1 → Cannot start until Pass 1 finishes</p>
					<p>Pass 3 needs d<sub>N</sub> from Pass 2 → Cannot start until Pass 2 finishes</p>
				</div>
			</div>
			<p class="mt-4 text-center text-[var(--color-muted)] text-[var(--text-small)]">
				Each pass requires reading the <em>entire</em> sequence from memory. With tiling, we want to process
				data once, not three times!
			</p>
		</ContentBox>

		<!-- Step 3: The Key Insight -->
		<ContentBox variant="dark" class="mt-4 border border-yellow-500/30">
			<h4 class="mb-3 font-medium text-yellow-400">
				Step 3: The Key Insight — Replace m<sub>N</sub> with m<sub>i</sub>
			</h4>
			<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
				What if instead of waiting for the <em>final</em> max (m<sub>N</sub>), we use the
				<em>partial</em> max (m<sub>i</sub>) at each step? Define a new running sum:
			</p>

			<!-- The insight comparison -->
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<!-- Original definition -->
				<div class="rounded-lg border border-red-500 bg-red-500/10 p-4">
					<h5 class="mb-3 font-bold text-[var(--text-body)] text-red-400">
						Original: uses final max m<sub>N</sub>
					</h5>
					<div class="font-mono text-[var(--text-h3)]">
						<p class="text-[var(--color-muted)]">
							d<sub>i</sub> = <span class="text-cyan-400">Σ</span><sub>j=1</sub><sup>i</sup> e<sup
								>(x<sub>j</sub> - m<sub>N</sub>)</sup
							>
						</p>
					</div>
				</div>

				<!-- New definition -->
				<div class="rounded-lg border border-green-500 bg-green-500/10 p-4">
					<h5 class="mb-3 font-bold text-[var(--text-body)] text-green-400">
						New: uses partial max m<sub>i</sub>
					</h5>
					<div class="font-mono text-[var(--text-h3)]">
						<p class="text-[var(--color-muted)]">
							d'<sub>i</sub> = <span class="text-cyan-400">Σ</span><sub>j=1</sub><sup>i</sup> e<sup
								>(x<sub>j</sub> - m<sub>i</sub>)</sup
							>
						</p>
					</div>
				</div>
			</div>

			<!-- Arrow indicator -->
			<div class="my-4 flex justify-center">
				<span
					class="rounded-full bg-yellow-500/20 px-4 py-2 font-bold text-[var(--text-body)] text-yellow-400"
					>↓ trick ↓</span
				>
			</div>

			<!-- Key observation -->
			<div class="rounded-lg border border-yellow-500 bg-yellow-500/15 p-4 text-center">
				<p class="mb-2 font-bold text-[var(--text-body)] text-yellow-400">Key Observation</p>
				<p class="font-mono text-[var(--text-h3)] text-yellow-400">
					d'<sub>N</sub> = d<sub>N</sub> (they're equal at the end!)
				</p>
			</div>
			<p class="mt-4 text-[var(--color-muted)] text-[var(--text-small)]">
				At position N, m<sub>N</sub> = m<sub>N</sub> (they're the same!), so d'<sub>N</sub> = d<sub
					>N</sub
				>. This means we can compute d' incrementally and get the correct final answer.
			</p>
		</ContentBox>

		<!-- Step 4: Deriving the Recurrence -->
		<ContentBox variant="dark" class="mt-4">
			<h4 class="mb-3 font-medium text-yellow-400">Step 4: Deriving the Recurrence Relation</h4>
			<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
				How do we compute d'<sub>i</sub> from d'<sub>i-1</sub>? This is where the math gets elegant:
			</p>

			<!-- Derivation steps as HTML -->
			<div class="space-y-4">
				<!-- Steps 1 & 2 side by side -->
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<!-- Step 1 -->
					<div class="rounded border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-4">
						<p class="mb-3 font-medium text-[var(--text-body)] text-yellow-400">
							1. Start with definition:
						</p>
						<div class="overflow-x-auto">
							<p class="font-mono whitespace-nowrap text-[var(--color-text)] text-[var(--text-h3)]">
								d'<sub>i</sub> = <span class="text-cyan-400">Σ</span><sub>j=1</sub><sup>i</sup>
								e<sup>(x<sub>j</sub> - m<sub>i</sub>)</sup>
							</p>
						</div>
					</div>

					<!-- Step 2 -->
					<div class="rounded border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-4">
						<p class="mb-3 font-medium text-[var(--text-body)] text-yellow-400">
							2. Separate the i-th term:
						</p>
						<div class="overflow-x-auto">
							<p class="font-mono whitespace-nowrap text-[var(--color-text)] text-[var(--text-h3)]">
								d'<sub>i</sub> = <span class="text-cyan-400">Σ</span><sub>j=1</sub><sup>i-1</sup>
								e<sup>(x<sub>j</sub> - m<sub>i</sub>)</sup> + e<sup
									>(x<sub>i</sub> - m<sub>i</sub>)</sup
								>
							</p>
						</div>
					</div>
				</div>

				<!-- Steps 3 & 4 side by side -->
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<!-- Step 3 - The key trick -->
					<div class="rounded border border-yellow-500/30 bg-yellow-500/10 p-4">
						<p class="mb-3 font-medium text-[var(--text-body)] text-yellow-400">
							3. The key trick — rewrite using m<sub>i-1</sub>:
						</p>
						<div class="overflow-x-auto">
							<p class="font-mono whitespace-nowrap text-[var(--color-text)] text-[var(--text-h3)]">
								e<sup>(x<sub>j</sub> - m<sub>i</sub>)</sup> = e<sup
									>(x<sub>j</sub> - m<sub>i-1</sub>)</sup
								>
								× <span class="text-yellow-400">e<sup>(m<sub>i-1</sub> - m<sub>i</sub>)</sup></span>
							</p>
						</div>
						<p class="mt-3 text-[var(--color-muted)] text-[var(--text-small)]">
							Multiply and divide by e<sup>m<sub>i-1</sub></sup> to introduce previous max.
						</p>
					</div>

					<!-- Step 4 -->
					<div class="rounded border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-4">
						<p class="mb-3 font-medium text-[var(--text-body)] text-yellow-400">
							4. Factor out the correction term:
						</p>
						<div class="overflow-x-auto">
							<p class="font-mono whitespace-nowrap text-[var(--color-text)] text-[var(--text-h3)]">
								d'<sub>i</sub> = (<span class="text-cyan-400">Σ</span><sub>j=1</sub><sup>i-1</sup>
								e<sup>(x<sub>j</sub> - m<sub>i-1</sub>)</sup>) ×
								<span class="text-yellow-400">e<sup>(m<sub>i-1</sub> - m<sub>i</sub>)</sup></span>
								+ e<sup>(x<sub>i</sub> - m<sub>i</sub>)</sup>
							</p>
						</div>
					</div>
				</div>

				<!-- Step 5 & Summary side by side -->
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<!-- Step 5 - Final result -->
					<div class="rounded border border-green-500/30 bg-green-500/10 p-4">
						<p class="mb-3 font-medium text-[var(--text-body)] text-yellow-400">
							5. Recognize that the sum is d'<sub>i-1</sub>:
						</p>
						<div class="overflow-x-auto">
							<p
								class="font-mono font-semibold whitespace-nowrap text-[var(--text-h2)] text-green-400"
							>
								d'<sub>i</sub> = d'<sub>i-1</sub> × e<sup>(m<sub>i-1</sub> - m<sub>i</sub>)</sup> +
								e<sup>(x<sub>i</sub> - m<sub>i</sub>)</sup>
							</p>
						</div>
					</div>

					<!-- Summary -->
					<div class="rounded border border-green-500/30 bg-green-500/10 p-4">
						<p class="mb-3 font-medium text-[var(--text-body)] text-green-400">The Recurrence:</p>
						<div class="overflow-x-auto">
							<p
								class="font-mono whitespace-nowrap text-[var(--color-accent)] text-[var(--text-h3)]"
							>
								d'<sub>i</sub> = d'<sub>i-1</sub> × e<sup>(m<sub>i-1</sub> - m<sub>i</sub>)</sup> +
								e<sup>(x<sub>i</sub> - m<sub>i</sub>)</sup>
							</p>
						</div>
						<p class="mt-3 text-[var(--color-muted)] text-[var(--text-small)]">
							<span class="font-mono text-yellow-400"
								>e<sup>(m<sub>i-1</sub> - m<sub>i</sub>)</sup></span
							>
							is the <strong>correction factor</strong>.
						</p>
					</div>
				</div>
			</div>
		</ContentBox>

		<!-- Step 5: Online Softmax - 2 Passes -->
		<ContentBox variant="dark" class="mt-4">
			<h4 class="mb-3 font-medium text-yellow-400">Step 5: Online Softmax — Fused to 2 Passes</h4>
			<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
				With the recurrence, we can now compute m and d in a <strong>single pass</strong>:
			</p>

			<!-- 2 passes layout -->
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<!-- Pass 1 (fused) -->
				<div class="rounded-lg border border-green-500 bg-green-500/10 p-4">
					<h5 class="mb-3 font-bold text-[var(--text-body)] text-green-400">
						Pass 1: Fused Max + Sum <span class="font-normal text-[var(--color-muted)]"
							>(→ m<sub>N</sub>, d<sub>N</sub>)</span
						>
					</h5>
					<div class="space-y-2 font-mono text-[var(--text-h3)]">
						<p class="text-[var(--color-muted)]">m<sub>0</sub> = -∞, d<sub>0</sub> = 0</p>
						<p class="text-[var(--color-muted)]">
							m<sub>i</sub> = max(m<sub>i-1</sub>, x<sub>i</sub>)
						</p>
						<p class="text-[var(--color-muted)]">
							d<sub>i</sub> = d<sub>i-1</sub> · e<sup>(m<sub>i-1</sub> - m<sub>i</sub>)</sup> + e<sup
								>(x<sub>i</sub> - m<sub>i</sub>)</sup
							>
						</p>
					</div>
				</div>

				<!-- Pass 2 -->
				<div class="rounded-lg border border-green-500 bg-green-500/10 p-4">
					<h5 class="mb-3 font-bold text-[var(--text-body)] text-green-400">Pass 2: Normalize</h5>
					<div class="font-mono text-[var(--text-h3)]">
						<p class="text-[var(--color-muted)]">
							a<sub>i</sub> = e<sup>(x<sub>i</sub> - m<sub>N</sub>)</sup> / d<sub>N</sub>
						</p>
					</div>
				</div>
			</div>

			<!-- Result callout -->
			<div class="mt-4 rounded-lg border border-green-500 bg-green-500/10 p-4 text-center">
				<p class="font-bold text-[var(--text-body)] text-green-400">
					3 passes → 2 passes (33% fewer memory accesses!)
				</p>
			</div>
		</ContentBox>

		<!-- Why this matters for FlashAttention -->
		<ContentBox variant="dark" class="mt-4 border border-cyan-500/30">
			<h4 class="mb-3 font-medium text-cyan-400">Why This Matters for FlashAttention</h4>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div>
					<p class="mb-2 text-[var(--color-muted)] text-[var(--text-small)]">
						<strong class="text-cyan-400">Tiling becomes possible:</strong>
					</p>
					<ul class="space-y-1 text-[var(--color-muted)] text-[var(--text-tiny)]">
						<li>• Load a tile of K,V into SRAM</li>
						<li>• Compute partial attention scores</li>
						<li>• Update running m and d with correction</li>
						<li>• Discard tile, load next one</li>
						<li>• Never store full N×N attention matrix!</li>
					</ul>
				</div>
				<div>
					<p class="mb-2 text-[var(--color-muted)] text-[var(--text-small)]">
						<strong class="text-cyan-400">FlashAttention extends this further:</strong>
					</p>
					<ul class="space-y-1 text-[var(--color-muted)] text-[var(--text-tiny)]">
						<li>• Also tracks running output O'</li>
						<li>• Same correction factor applies to O</li>
						<li>• Fuses QK<sup>T</sup>, softmax, and ×V into one kernel</li>
						<li>• Result: O(N) memory instead of O(N²)</li>
					</ul>
				</div>
			</div>
		</ContentBox>
	</Section>

	<!-- The Algorithm -->
	<Section title="The FlashAttention Algorithm">
		<ContentBox variant="dark">
			<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
				Refer to the overview diagram above for visual reference of the <span class="text-red-400"
					>Outer Loop</span
				>
				(over K, V) and <span class="text-blue-400">Inner Loop</span> (over Q, O).
			</p>
			<div
				class="rounded-lg bg-gradient-to-br from-slate-800 via-slate-700 to-zinc-800 p-4 font-mono text-[var(--text-tiny)] shadow-inner"
			>
				<pre class="break-words whitespace-pre-wrap text-[var(--color-text)]">
<span class="text-cyan-400">def flash_attention(Q, K, V):</span>
    # Q, K, V: [N, d] — stored in HBM (slow global memory)
    # SRAM: fast on-chip memory, but small (~20MB)

    <span class="text-pink-400"># Step 1: Divide matrices into tiles that fit in SRAM</span>
    Q_tiles = split(Q, tile_size=B_r)      <span class="text-green-400"
						># T_r tiles of [B_r, d]</span
					>
    K_tiles = split(K, tile_size=B_c)      <span class="text-green-400"
						># T_c tiles of [B_c, d]</span
					>
    V_tiles = split(V, tile_size=B_c)      <span class="text-green-400"
						># T_c tiles of [B_c, d]</span
					>

    <span class="text-pink-400"
						># Step 2: Initialize output and online softmax running stats (in HBM)</span
					>
    O = zeros(N, d)                        <span class="text-green-400"># output accumulator</span>
    m = -inf * ones(N)                     <span class="text-green-400"
						># running max for softmax stability</span
					>
    l = zeros(N)                           <span class="text-green-400"
						># running sum for softmax normalization</span
					>

    <span class="text-red-400"># Step 3: OUTER LOOP — iterate over K,V tiles FIRST</span>
    <span class="text-red-400">for j in range(T_c):</span>                   <span
						class="text-red-400"># K,V tiles loaded once per outer iteration</span
					>
        K_j = load(K_tiles[j])             <span class="text-green-400"># HBM → SRAM</span>
        V_j = load(V_tiles[j])             <span class="text-green-400"># HBM → SRAM</span>

        <span class="text-blue-400"># Step 4: INNER LOOP — iterate over Q tiles</span>
        <span class="text-blue-400">for i in range(T_r):</span>               <span
						class="text-blue-400"># Q tiles loaded T_c times total</span
					>
            Q_i = load(Q_tiles[i])         <span class="text-green-400"># HBM → SRAM</span>
            O_i, m_i, l_i = load(O[i], m[i], l[i])

            <span class="text-pink-400"># Compute attention scores for this tile pair</span>
            S_ij = Q_i @ K_j.T             <span class="text-green-400"
						># [B_r, B_c] — stays in SRAM, never written to HBM!</span
					>

            <span class="text-pink-400"
						># Online softmax: compute LOCAL stats for this tile only</span
					>
            m_local = rowmax(S_ij)         <span class="text-green-400"
						># local max per row (in SRAM)</span
					>
            P_local = exp(S_ij - m_local)  <span class="text-green-400"
						># local attention weights (in SRAM)</span
					>
            l_local = rowsum(P_local)      <span class="text-green-400"
						># local sum per row (in SRAM)</span
					>

            <span class="text-pink-400"
						># Update running stats with CORRECTION FACTOR for new max</span
					>
            m_new = max(m_i, m_local)      <span class="text-green-400"
						># combine old and local max</span
					>
            l_new = l_i * exp(m_i - m_new) + l_local * exp(m_local - m_new)

            <span class="text-pink-400"># Rescale previous output and add new contribution</span>
            scale_old = l_i * exp(m_i - m_new) / l_new
            scale_new = exp(m_local - m_new) / l_new
            O_i = O_i * scale_old + (P_local @ V_j) * scale_new

            <span class="text-pink-400"
						># Write updated values back to HBM (only O, m, l — NOT the N×N matrix!)</span
					>
            store(O_i, m_new, l_new)       <span class="text-green-400"># SRAM → HBM</span>

    return O  <span class="text-green-400"
						># softmax(QK^T)V without ever storing N×N attention matrix!</span
					>
				</pre>
			</div>
		</ContentBox>

		<!-- Tiled Processing Explanation -->
		<ContentBox variant="dark" class="mt-4">
			<h4 class="mb-3 font-medium text-[var(--color-text)]">Tiled Processing Flow</h4>

			<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<!-- Left: Cropped image showing just the tiling diagram -->
				<!-- Background image approach: responsive crop that scales with screen size -->
				<!-- background-size: larger = more zoomed/cropped, smaller = see more -->
				<!-- background-position: X% Y% controls which part is visible -->
				<div
					class="aspect-[4/3] w-full rounded border border-[var(--color-muted)]/30"
					style="
						background-image: url('/images/llm-gpu/flash-attention-overview.png');
						background-position: 60% 50%;
						background-size: 200%;
						background-repeat: no-repeat;
						clip-path: inset(0% 19% 6% 7%);
						transform: translate(6%, 3%);
					"
					role="img"
					aria-label="FlashAttention tiled processing with inner and outer loops"
				></div>

				<!-- Right: What happens in Shared Memory -->
				<div class="rounded border border-cyan-500/30 bg-cyan-500/10 p-4">
					<p class="mb-3 font-bold text-[var(--text-small)] text-cyan-400">
						Inside Shared Memory (per tile):
					</p>
					<div class="space-y-2">
						<div class="rounded bg-[var(--color-bg)] px-3 py-2">
							<span class="font-mono text-[var(--text-small)]"
								>1. S = Q<sub>i</sub> × K<sub>j</sub><sup>T</sup></span
							>
							<span class="ml-2 text-[var(--color-muted)] text-[var(--text-tiny)]"
								>— Compute attention scores</span
							>
						</div>
						<div class="rounded bg-[var(--color-bg)] px-3 py-2">
							<span class="font-mono text-[var(--text-small)]">2. Update m, ℓ</span>
							<span class="ml-2 text-[var(--color-muted)] text-[var(--text-tiny)]"
								>— Online softmax stats</span
							>
						</div>
						<div class="rounded bg-[var(--color-bg)] px-3 py-2">
							<span class="font-mono text-[var(--text-small)]">3. P = softmax(S)</span>
							<span class="ml-2 text-[var(--color-muted)] text-[var(--text-tiny)]"
								>— Apply softmax</span
							>
						</div>
						<div class="rounded bg-[var(--color-bg)] px-3 py-2">
							<span class="font-mono text-[var(--text-small)]">4. O += P × V<sub>j</sub></span>
							<span class="ml-2 text-[var(--color-muted)] text-[var(--text-tiny)]"
								>— Accumulate output</span
							>
						</div>
					</div>
					<p class="mt-4 text-[var(--color-muted)] text-[var(--text-tiny)]">
						S and P stay in SRAM (small tiles). Only final O written to HBM.
					</p>
				</div>
			</div>

			<!-- What we avoid -->
			<div class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
				<div class="rounded border border-red-500/30 bg-red-500/10 p-3">
					<p class="font-bold text-[var(--text-small)] text-red-400">
						Standard Attention writes to HBM:
					</p>
					<ul class="mt-1 text-[var(--color-muted)] text-[var(--text-tiny)]">
						<li>• S = QK<sup>T</sup> → <span class="text-red-400">N×N to HBM</span></li>
						<li>• A = softmax(S) → <span class="text-red-400">N×N to HBM</span></li>
						<li>• O = AV → N×d to HBM</li>
					</ul>
				</div>
				<div class="rounded border border-green-500/30 bg-green-500/10 p-3">
					<p class="font-bold text-[var(--text-small)] text-green-400">
						FlashAttention writes to HBM:
					</p>
					<ul class="mt-1 text-[var(--color-muted)] text-[var(--text-tiny)]">
						<li>• S, A stay in SRAM (small tiles)</li>
						<li>• O accumulated in SRAM</li>
						<li>• Only final O → <span class="text-green-400">N×d to HBM</span></li>
					</ul>
				</div>
			</div>

			<p class="mt-3 text-center font-bold text-[var(--text-small)] text-yellow-400">
				We avoid writing N×N matrices — only read Q,K,V and write final O!
			</p>
		</ContentBox>
	</Section>

	<!-- Memory Analysis -->
	<Section title="Memory Analysis">
		<ContentBox variant="dark">
			<h4 class="mb-3 font-medium text-red-400">Standard Attention: Step-by-Step HBM Access</h4>
			<div class="overflow-x-auto">
				<table class="w-full text-[var(--text-tiny)]">
					<thead>
						<tr class="border-b border-[var(--color-muted)]/30">
							<th class="px-2 py-2 text-left text-[var(--color-muted)]">Step</th>
							<th class="px-2 py-2 text-left text-[var(--color-muted)]">Operation</th>
							<th class="px-2 py-2 text-right text-[var(--color-muted)]">Read from HBM</th>
							<th class="px-2 py-2 text-right text-[var(--color-muted)]">Write to HBM</th>
						</tr>
					</thead>
					<tbody class="font-mono">
						<tr class="border-b border-[var(--color-muted)]/10">
							<td class="px-2 py-2 text-[var(--color-text)]">1</td>
							<td class="px-2 py-2 text-[var(--color-text)]">S = QK<sup>T</sup></td>
							<td class="px-2 py-2 text-right text-[var(--color-text)]">Q(Nd) + K(Nd)</td>
							<td class="px-2 py-2 text-right text-red-400">S(N²)</td>
						</tr>
						<tr class="border-b border-[var(--color-muted)]/10">
							<td class="px-2 py-2 text-[var(--color-text)]">2</td>
							<td class="px-2 py-2 text-[var(--color-text)]">A = softmax(S)</td>
							<td class="px-2 py-2 text-right text-red-400">S(N²)</td>
							<td class="px-2 py-2 text-right text-red-400">A(N²)</td>
						</tr>
						<tr class="border-b border-[var(--color-muted)]/10">
							<td class="px-2 py-2 text-[var(--color-text)]">3</td>
							<td class="px-2 py-2 text-[var(--color-text)]">O = AV</td>
							<td class="px-2 py-2 text-right text-red-400">A(N²) + V(Nd)</td>
							<td class="px-2 py-2 text-right text-[var(--color-text)]">O(Nd)</td>
						</tr>
						<tr class="bg-red-500/10">
							<td class="px-2 py-2 font-bold text-red-400" colspan="2">Total</td>
							<td class="px-2 py-2 text-right text-red-400">3Nd + 2N²</td>
							<td class="px-2 py-2 text-right text-red-400">2N² + Nd</td>
						</tr>
					</tbody>
				</table>
			</div>
			<p class="mt-2 text-center text-[var(--text-small)] text-red-400">
				Bottleneck: Must read/write N² matrices twice!
			</p>
		</ContentBox>

		<ContentBox variant="dark" class="mt-4">
			<h4 class="mb-3 font-medium text-green-400">FlashAttention: Step-by-Step HBM Access</h4>
			<div class="overflow-x-auto">
				<table class="w-full text-[var(--text-tiny)]">
					<thead>
						<tr class="border-b border-[var(--color-muted)]/30">
							<th class="px-2 py-2 text-left text-[var(--color-muted)]">Step</th>
							<th class="px-2 py-2 text-left text-[var(--color-muted)]">Operation</th>
							<th class="px-2 py-2 text-right text-[var(--color-muted)]">Read from HBM</th>
							<th class="px-2 py-2 text-right text-[var(--color-muted)]">Write to HBM</th>
						</tr>
					</thead>
					<tbody class="font-mono">
						<tr class="border-b border-[var(--color-muted)]/10">
							<td class="px-2 py-2 text-[var(--color-text)]" rowspan="3">Loop</td>
							<td class="px-2 py-2 text-[var(--color-text)]">Load Q block (once per outer loop)</td>
							<td class="px-2 py-2 text-right text-[var(--color-text)]">Q(Nd) total</td>
							<td class="px-2 py-2 text-right text-[var(--color-muted)]">—</td>
						</tr>
						<tr class="border-b border-[var(--color-muted)]/10">
							<td class="px-2 py-2 text-[var(--color-text)]">Load K,V blocks (inner loop)</td>
							<td class="px-2 py-2 text-right text-yellow-400"
								>K,V read N/B<sub>r</sub> times each</td
							>
							<td class="px-2 py-2 text-right text-[var(--color-muted)]">—</td>
						</tr>
						<tr class="border-b border-[var(--color-muted)]/10">
							<td class="px-2 py-2 text-[var(--color-text)]">Compute S,A,O in SRAM</td>
							<td class="px-2 py-2 text-right text-green-400">No HBM access!</td>
							<td class="px-2 py-2 text-right text-green-400">No N² writes!</td>
						</tr>
						<tr class="border-b border-[var(--color-muted)]/10">
							<td class="px-2 py-2 text-[var(--color-text)]">End</td>
							<td class="px-2 py-2 text-[var(--color-text)]">Write O block</td>
							<td class="px-2 py-2 text-right text-[var(--color-muted)]">—</td>
							<td class="px-2 py-2 text-right text-[var(--color-text)]">O(Nd)</td>
						</tr>
						<tr class="bg-green-500/10">
							<td class="px-2 py-2 font-bold text-green-400" colspan="2">Total</td>
							<td class="px-2 py-2 text-right text-green-400">Nd + O(N²d/M)</td>
							<td class="px-2 py-2 text-right text-green-400">Nd only</td>
						</tr>
					</tbody>
				</table>
			</div>
			<p class="mt-2 text-center text-[var(--text-small)] text-green-400">
				K,V are re-read multiple times, but we avoid ALL N² matrix writes!
			</p>
		</ContentBox>

		<ContentBox variant="dark" class="mt-4">
			<h4 class="mb-3 font-medium text-[var(--color-text)]">The Trade-off</h4>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div class="rounded border border-yellow-500/30 bg-yellow-500/10 p-3">
					<p class="font-bold text-[var(--text-small)] text-yellow-400">
						FlashAttention reads MORE:
					</p>
					<p class="mt-1 text-[var(--color-muted)] text-[var(--text-tiny)]">
						K and V are read N/B<sub>r</sub> times (once per Q block) instead of once. This is O(N²d/M)
						reads.
					</p>
				</div>
				<div class="rounded border border-green-500/30 bg-green-500/10 p-3">
					<p class="font-bold text-[var(--text-small)] text-green-400">But writes MUCH LESS:</p>
					<p class="mt-1 text-[var(--color-muted)] text-[var(--text-tiny)]">
						No N² matrix writes at all! Only write final O (Nd). Writes are slower than reads, so
						this is a big win.
					</p>
				</div>
			</div>
			<p class="mt-3 text-center text-[var(--color-muted)] text-[var(--text-small)]">
				Total IO complexity: <span class="font-mono text-[var(--color-accent)]">O(N²d² / M)</span> where
				M = SRAM size
			</p>
		</ContentBox>

		<ContentBox variant="dark" class="mt-4">
			<h4 class="mb-3 font-medium text-[var(--color-text)]">
				Why It's Fast (Not Just Memory-Efficient)
			</h4>
			<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
				<div class="rounded bg-[var(--color-bg)] p-3">
					<p class="mb-1 font-medium text-[var(--color-accent)]">Fewer HBM Accesses</p>
					<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">
						Standard: Read/write N² attention matrix<br />
						Flash: Only read Q,K,V and write O
					</p>
				</div>
				<div class="rounded bg-[var(--color-bg)] p-3">
					<p class="mb-1 font-medium text-[var(--color-accent)]">Fusion</p>
					<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">
						QK^T, scale, softmax, ×V all in one kernel<br />
						No intermediate HBM round-trips
					</p>
				</div>
				<div class="rounded bg-[var(--color-bg)] p-3">
					<p class="mb-1 font-medium text-[var(--color-accent)]">Compute-Bound</p>
					<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">
						High arithmetic intensity<br />
						Tensor cores fully utilized
					</p>
				</div>
				<div class="rounded bg-[var(--color-bg)] p-3">
					<p class="mb-1 font-medium text-[var(--color-accent)]">Recomputation</p>
					<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">
						Backward pass recomputes S instead of storing<br />
						Trades compute for memory
					</p>
				</div>
			</div>
		</ContentBox>
	</Section>

	<!-- Performance Results -->
	<Section title="Performance Results">
		<ContentBox variant="dark">
			<p class="mb-3 text-[var(--color-muted)] text-[var(--text-small)]">
				Speedup vs Standard Attention (A100, BF16):
			</p>
			<div class="overflow-x-auto">
				<table class="w-full text-[var(--text-tiny)]">
					<thead>
						<tr class="border-b border-[var(--color-muted)]/30">
							<th class="px-3 py-2 text-left font-medium text-[var(--color-muted)]">Seq Length</th>
							<th class="px-3 py-2 text-right font-medium text-[var(--color-muted)]">Standard</th>
							<th class="px-3 py-2 text-right font-medium text-[var(--color-muted)]"
								>FlashAttention</th
							>
							<th class="px-3 py-2 text-right font-medium text-[var(--color-muted)]">Speedup</th>
						</tr>
					</thead>
					<tbody class="font-mono">
						<tr class="border-b border-[var(--color-muted)]/10">
							<td class="px-3 py-2 text-[var(--color-text)]">512</td>
							<td class="px-3 py-2 text-right text-[var(--color-text)]">1.2 ms</td>
							<td class="px-3 py-2 text-right text-[var(--color-text)]">0.8 ms</td>
							<td class="px-3 py-2 text-right font-semibold text-green-400">1.5×</td>
						</tr>
						<tr class="border-b border-[var(--color-muted)]/10">
							<td class="px-3 py-2 text-[var(--color-text)]">1024</td>
							<td class="px-3 py-2 text-right text-[var(--color-text)]">4.2 ms</td>
							<td class="px-3 py-2 text-right text-[var(--color-text)]">1.6 ms</td>
							<td class="px-3 py-2 text-right font-semibold text-green-400">2.6×</td>
						</tr>
						<tr class="border-b border-[var(--color-muted)]/10">
							<td class="px-3 py-2 text-[var(--color-text)]">2048</td>
							<td class="px-3 py-2 text-right text-[var(--color-text)]">16 ms</td>
							<td class="px-3 py-2 text-right text-[var(--color-text)]">4.2 ms</td>
							<td class="px-3 py-2 text-right font-semibold text-green-400">3.8×</td>
						</tr>
						<tr class="border-b border-[var(--color-muted)]/10">
							<td class="px-3 py-2 text-[var(--color-text)]">4096</td>
							<td class="px-3 py-2 text-right text-[var(--color-text)]">65 ms</td>
							<td class="px-3 py-2 text-right text-[var(--color-text)]">14 ms</td>
							<td class="px-3 py-2 text-right font-semibold text-green-400">4.6×</td>
						</tr>
						<tr class="border-b border-[var(--color-muted)]/10 bg-pink-500/5">
							<td class="px-3 py-2 text-[var(--color-text)]">8192</td>
							<td class="px-3 py-2 text-right text-red-400">OOM</td>
							<td class="px-3 py-2 text-right text-[var(--color-text)]">52 ms</td>
							<td class="px-3 py-2 text-right font-semibold text-pink-400">∞ (enabled!)</td>
						</tr>
						<tr class="bg-pink-500/5">
							<td class="px-3 py-2 text-[var(--color-text)]">16384</td>
							<td class="px-3 py-2 text-right text-red-400">OOM</td>
							<td class="px-3 py-2 text-right text-[var(--color-text)]">200 ms</td>
							<td class="px-3 py-2 text-right font-semibold text-pink-400">∞ (enabled!)</td>
						</tr>
					</tbody>
				</table>
			</div>
			<p class="mt-3 text-center text-[var(--color-primary)] text-[var(--text-small)]">
				FlashAttention enables sequence lengths that were impossible before.
			</p>
		</ContentBox>
	</Section>

	<!-- Variants -->
	<Section title="FlashAttention Variants">
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<ContentBox variant="dark" class="border border-purple-500/30">
				<h4 class="mb-2 font-semibold text-purple-400">FlashAttention-2</h4>
				<ul class="space-y-1 text-[var(--color-muted)] text-[var(--text-tiny)]">
					<li>• Better work partitioning across warps</li>
					<li>• Reduced non-matmul FLOPs</li>
					<li>• Parallelizes over sequence length</li>
					<li>• ~2× faster than v1</li>
				</ul>
			</ContentBox>
			<ContentBox variant="dark" class="border border-pink-500/30">
				<h4 class="mb-2 font-semibold text-pink-400">FlashAttention-3 (H100)</h4>
				<ul class="space-y-1 text-[var(--color-muted)] text-[var(--text-tiny)]">
					<li>• Uses FP8 on H100</li>
					<li>• Async memory operations (TMA)</li>
					<li>• Better utilization of Tensor Cores</li>
					<li>• Up to 1.5-2× over v2</li>
				</ul>
			</ContentBox>
		</div>
	</Section>

	<KeyTakeaway
		items={[
			'FlashAttention reduces attention memory from O(N²) to O(N) by never storing full attention matrix',
			'Online softmax enables incremental computation with running max and sum statistics',
			'Tiling keeps all intermediate computation in fast shared memory',
			'Fusion eliminates HBM round-trips between QK^T, softmax, and ×V',
			'Recomputation in backward pass trades ~33% compute for dramatic memory savings',
			'Combines all GPU optimization techniques into one algorithm'
		]}
	/>
</div>
