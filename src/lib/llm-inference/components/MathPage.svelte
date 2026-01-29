<!-- ABOUTME: Transformer math formulas essential for understanding inference -->
<!-- ABOUTME: Covers arithmetic intensity, KV cache, latency, throughput calculations -->

<script>
	import { HeroSection, Section, ContentBox, KeyTakeaway } from '$lib/shared';
	import SHA from './SHA.svelte';
	import MHA from './MHA.svelte';
	import MQA from './MQA.svelte';

	// Notation reference
	const notation = [
		{ symbol: 'B', meaning: 'Batch size' },
		{ symbol: 'T', meaning: 'Sequence length (query/generate)' },
		{ symbol: 'S', meaning: 'Sequence length (conditioning/KV cache)' },
		{ symbol: 'D', meaning: 'Model dimension' },
		{ symbol: 'F', meaning: 'MLP hidden dimension (typically 4D)' },
		{ symbol: 'N', meaning: 'Number of query heads' },
		{ symbol: 'K', meaning: 'Number of KV heads' },
		{ symbol: 'H', meaning: 'Head dimension' },
		{ symbol: 'L', meaning: 'Number of layers' },
		{ symbol: 'V', meaning: 'Vocabulary size' }
	];

	// Batch size examples for LLaMA-2 13B
	const batchExamples = [
		{ batch: 'B=1', memory: '26GB', latency: '8ms', throughput: '124 tok/s' },
		{ batch: 'B=64', memory: '53GB', latency: '16ms', throughput: '4000 tok/s' },
		{ batch: 'B=256', memory: '240GB', latency: 'OOM', throughput: '-' }
	];

	// Optimization techniques
	const optimizations = [
		{
			technique: 'GQA (K < N)',
			reduces: 'KV cache by N/K',
			impact: 'Smaller kv_cache_size'
		},
		{
			technique: 'MLA (compress KV)',
			reduces: 'KV dims from NH to C',
			impact: 'DeepSeek: 16384 → 512'
		},
		{
			technique: 'Local attention',
			reduces: 'S to fixed window',
			impact: 'KV cache constant regardless of seq length'
		},
		{
			technique: 'Quantization',
			reduces: 'Bytes per param',
			impact: 'int8 → halves memory'
		},
		{
			technique: 'Speculative decoding',
			reduces: 'Generation steps',
			impact: 'Prefill (fast) to verify draft tokens'
		}
	];
</script>

<div class="space-y-6">
	<HeroSection title="Transformer Math for Inference">
		<p class="max-w-3xl leading-relaxed text-[var(--color-muted)] text-[var(--text-body)]">
			Understanding the math behind inference is essential for optimizing LLM serving. The key
			insight:
			<span class="font-semibold text-red-400">inference is memory-bandwidth bound</span>, not
			compute bound. Reducing memory transfers matters more than reducing FLOPs.
		</p>
	</HeroSection>

	<!-- Notation Reference -->
	<Section title="Key Notation">
		<div class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
			{#each notation as { symbol, meaning } (symbol)}
				<div class="rounded bg-[var(--color-secondary)] p-3">
					<span class="font-mono text-lg font-bold text-[var(--color-primary)]">{symbol}</span>
					<span class="ml-2 text-[var(--color-muted)] text-[var(--text-tiny)]">{meaning}</span>
				</div>
			{/each}
		</div>
	</Section>

	<!-- Attention Flow Diagram -->
	<Section title="Single Attention Head Data Flow">
		<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
			This diagram shows how data flows through a single attention head. The dimensions at each step
			use the notation above. Notice how Q, K, V matrices are created and combined.
		</p>
		<div class="overflow-x-auto">
			<SHA instanceId="math-sha" />
		</div>
	</Section>

	<!-- Multi-Head Attention -->
	<Section title="Multi-Head Attention (MHA)">
		<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
			In Multi-Head Attention, we run N independent attention heads in parallel. Each head has its
			own W<sub>Q</sub>, W<sub>K</sub>, W<sub>V</sub> projections, allowing the model to attend to different
			representation subspaces at different positions.
		</p>
		<div class="overflow-x-auto">
			<MHA />
		</div>
		<div
			class="mt-4 rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-secondary)] p-4"
		>
			<div class="font-mono text-[var(--text-small)]">
				<span class="text-[var(--color-muted)]">KV Cache per layer:</span>
				<span class="ml-2 text-[var(--color-accent)]">2 × N × S × H × 2 bytes</span>
				<span class="ml-4 text-[var(--color-muted)]">(N heads, each with own K,V)</span>
			</div>
		</div>
	</Section>

	<!-- Multi-Query Attention -->
	<Section title="Multi-Query Attention (MQA)">
		<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
			Multi-Query Attention shares a single K,V projection across all N query heads (K=1). This
			dramatically reduces KV cache size by factor of N, at minor quality cost.
		</p>
		<div class="overflow-x-auto">
			<MQA />
		</div>
		<div class="mt-4 grid gap-4 md:grid-cols-2">
			<div class="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
				<div class="mb-1 font-semibold text-emerald-400">Memory Savings</div>
				<div class="font-mono text-[var(--color-muted)] text-[var(--text-small)]">
					KV cache reduced by <span class="text-emerald-400">N×</span> (e.g., 32× for N=32 heads)
				</div>
			</div>
			<div class="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
				<div class="mb-1 font-semibold text-amber-400">Trade-off</div>
				<div class="text-[var(--color-muted)] text-[var(--text-small)]">
					Slight quality degradation, but enables much larger batch sizes
				</div>
			</div>
		</div>
	</Section>

	<!-- 1. Arithmetic Intensity -->
	<Section title="1. Arithmetic Intensity (The Core Insight)">
		<div class="grid gap-6 md:grid-cols-2">
			<ContentBox variant="dark" class="border border-[var(--color-muted)]/20">
				<h3 class="mb-3 font-semibold text-[var(--color-text)]">Definition</h3>
				<p class="mb-3 text-[var(--color-muted)] text-[var(--text-small)]">
					FLOPs per byte transferred (want this HIGH)
				</p>
				<div
					class="rounded bg-[var(--color-bg)] p-4 font-mono text-[var(--color-accent)] text-[var(--text-body)]"
				>
					Arithmetic Intensity = FLOPs / Bytes Transferred
				</div>
			</ContentBox>

			<ContentBox variant="dark" class="border border-[var(--color-muted)]/20">
				<h3 class="mb-3 font-semibold text-[var(--color-text)]">H100 Accelerator Intensity</h3>
				<div class="space-y-2 font-mono text-[var(--text-small)]">
					<div>
						<span class="text-[var(--color-muted)]">FLOP/s:</span>
						<span class="text-[var(--color-text)]">989 × 10¹²</span>
					</div>
					<div>
						<span class="text-[var(--color-muted)]">Memory BW:</span>
						<span class="text-[var(--color-text)]">3.35 × 10¹² B/s</span>
					</div>
					<div class="border-t border-[var(--color-muted)]/20 pt-2">
						<span class="text-[var(--color-muted)]">Intensity:</span>
						<span class="text-xl font-bold text-[var(--color-primary)]">≈ 295</span>
					</div>
				</div>
			</ContentBox>
		</div>

		<div class="mt-4 grid gap-4 md:grid-cols-2">
			<div class="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
				<div class="mb-1 font-semibold text-emerald-400">intensity &gt; 295</div>
				<div class="text-[var(--color-muted)] text-[var(--text-small)]">
					<span class="font-semibold text-emerald-400">Compute-limited</span> (good, GPU saturated)
				</div>
			</div>
			<div class="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
				<div class="mb-1 font-semibold text-red-400">intensity &lt; 295</div>
				<div class="text-[var(--color-muted)] text-[var(--text-small)]">
					<span class="font-semibold text-red-400">Memory-limited</span> (bad, waiting on memory)
				</div>
			</div>
		</div>
	</Section>

	<!-- 2. Matrix Multiplication -->
	<Section title="2. Matrix Multiplication Intensity">
		<ContentBox variant="dark" class="border border-[var(--color-muted)]/20">
			<h3 class="mb-3 font-semibold text-[var(--color-text)]">For X (B×D) @ W (D×F):</h3>
			<div class="grid gap-4 md:grid-cols-2">
				<div>
					<div class="mb-2 text-[var(--color-muted)] text-[var(--text-tiny)]">FLOPs</div>
					<div class="font-mono text-[var(--color-accent)] text-[var(--text-body)]">
						FLOPs = 2 × B × D × F
					</div>
				</div>
				<div>
					<div class="mb-2 text-[var(--color-muted)] text-[var(--text-tiny)]">Bytes (bf16)</div>
					<div class="font-mono text-[var(--color-accent)] text-[var(--text-body)]">
						Bytes = 2BD + 2DF + 2BF
					</div>
				</div>
			</div>
			<div class="mt-4 border-t border-[var(--color-muted)]/20 pt-4">
				<div class="mb-2 text-[var(--color-muted)] text-[var(--text-tiny)]">
					When B &lt;&lt; D, F:
				</div>
				<div class="font-mono text-lg font-bold text-[var(--color-primary)]">
					Arithmetic Intensity ≈ B
				</div>
			</div>
		</ContentBox>

		<KeyTakeaway title="Generation Problem" class="mt-4">
			<p>
				B=1 means intensity=1 → <span class="font-semibold text-red-400"
					>severely memory-limited</span
				>. This is why single-request generation is so inefficient.
			</p>
		</KeyTakeaway>
	</Section>

	<!-- 3. MLP Layer Math -->
	<Section title="3. MLP Layer Math">
		<div class="grid gap-6 md:grid-cols-2">
			<ContentBox variant="dark" class="border border-[var(--color-muted)]/20">
				<h3 class="mb-3 font-semibold text-[var(--color-text)]">FLOPs</h3>
				<p class="mb-2 text-[var(--color-muted)] text-[var(--text-tiny)]">
					(up + gate + down projections)
				</p>
				<div class="font-mono text-[var(--color-accent)] text-[var(--text-body)]">
					FLOPs = 6 × B × T × D × F
				</div>
			</ContentBox>

			<ContentBox variant="dark" class="border border-[var(--color-muted)]/20">
				<h3 class="mb-3 font-semibold text-[var(--color-text)]">Bytes Transferred</h3>
				<div class="font-mono text-[var(--color-accent)] text-[var(--text-body)]">
					Bytes = 4BTD + 4BTF + 6DF
				</div>
			</ContentBox>
		</div>

		<ContentBox variant="dark" class="mt-4 border border-[var(--color-primary)]/30">
			<h3 class="mb-3 font-semibold text-[var(--color-text)]">
				Arithmetic Intensity (when BT &lt;&lt; D,F)
			</h3>
			<div class="mb-4 font-mono text-lg font-bold text-[var(--color-primary)]">
				MLP Intensity ≈ B × T
			</div>
			<div class="grid gap-3 md:grid-cols-2">
				<div class="rounded bg-emerald-500/10 p-3">
					<div class="font-semibold text-emerald-400">Prefill (T=S large)</div>
					<div class="text-[var(--color-muted)] text-[var(--text-small)]">
						Easy to make compute-limited ✓
					</div>
				</div>
				<div class="rounded bg-red-500/10 p-3">
					<div class="font-semibold text-red-400">Generation (T=1)</div>
					<div class="text-[var(--color-muted)] text-[var(--text-small)]">
						Intensity = B, needs many concurrent requests
					</div>
				</div>
			</div>
		</ContentBox>
	</Section>

	<!-- 4. Attention Layer Math -->
	<Section title="4. Attention Layer Math (FlashAttention)">
		<div class="grid gap-6 md:grid-cols-2">
			<ContentBox variant="dark" class="border border-[var(--color-muted)]/20">
				<h3 class="mb-3 font-semibold text-[var(--color-text)]">FLOPs</h3>
				<div class="mb-2 font-mono text-[var(--color-accent)] text-[var(--text-body)]">
					Attention FLOPs = 4 × B × S × T × D
				</div>
				<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">
					(2BSTD for Q@K + 2BSTD for softmax(A)@V)
				</p>
			</ContentBox>

			<ContentBox variant="dark" class="border border-[var(--color-muted)]/20">
				<h3 class="mb-3 font-semibold text-[var(--color-text)]">Bytes Transferred</h3>
				<div class="font-mono text-[var(--color-accent)] text-[var(--text-body)]">
					Bytes = 4BSD + 4BTD = 4BD(S+T)
				</div>
			</ContentBox>
		</div>

		<ContentBox variant="dark" class="mt-4 border border-purple-500/30">
			<h3 class="mb-3 font-semibold text-[var(--color-text)]">Arithmetic Intensity</h3>
			<div class="mb-4 font-mono text-lg font-bold text-purple-400">
				Attention Intensity = (S × T) / (S + T)
			</div>

			<div class="overflow-x-auto">
				<table class="w-full text-[var(--text-small)]">
					<thead>
						<tr class="border-b border-[var(--color-muted)]/20 text-left text-[var(--color-muted)]">
							<th class="pr-4 pb-2">Stage</th>
							<th class="pr-4 pb-2">T</th>
							<th class="pr-4 pb-2">Intensity</th>
							<th class="pb-2">Status</th>
						</tr>
					</thead>
					<tbody>
						<tr class="border-b border-[var(--color-muted)]/10">
							<td class="py-2 pr-4 text-[var(--color-text)]">Prefill</td>
							<td class="py-2 pr-4 font-mono text-[var(--color-muted)]">T=S</td>
							<td class="py-2 pr-4 font-mono text-[var(--color-accent)]">S/2</td>
							<td class="py-2 text-emerald-400">✓ Compute-limited</td>
						</tr>
						<tr>
							<td class="py-2 pr-4 text-[var(--color-text)]">Generation</td>
							<td class="py-2 pr-4 font-mono text-[var(--color-muted)]">T=1</td>
							<td class="py-2 pr-4 font-mono text-[var(--color-accent)]">S/(S+1) ≈ 1</td>
							<td class="py-2 text-red-400">✗ Memory-limited</td>
						</tr>
					</tbody>
				</table>
			</div>
		</ContentBox>

		<KeyTakeaway title="Critical Insight" class="mt-4">
			<p>
				<span class="font-semibold text-red-400">No dependence on B!</span> Batching doesn't help attention
				intensity because each sequence has its own KV cache. This is fundamentally different from MLP
				layers.
			</p>
		</KeyTakeaway>
	</Section>

	<!-- 5. KV Cache Size -->
	<Section title="5. KV Cache Size">
		<ContentBox variant="dark" class="border border-cyan-500/30">
			<h3 class="mb-3 font-semibold text-[var(--color-text)]">Per Sequence</h3>
			<div class="mb-2 font-mono text-[var(--color-accent)] text-[var(--text-body)]">
				kv_cache_size = S × K × H × L × 2 × 2
			</div>
			<div class="flex gap-6 text-[var(--color-muted)] text-[var(--text-tiny)]">
				<span>↑ keys + values</span>
				<span>↑ bf16 (2 bytes)</span>
			</div>
		</ContentBox>

		<div class="mt-4 grid gap-4 md:grid-cols-2">
			<ContentBox variant="dark" class="border border-[var(--color-muted)]/20">
				<h3 class="mb-3 font-semibold text-[var(--color-text)]">Example: LLaMA-13B, 8k context</h3>
				<div class="space-y-1 font-mono text-[var(--text-tiny)]">
					<div class="text-[var(--color-muted)]">8192 × 40 × 128 × 40 × 2 × 2</div>
					<div class="text-lg font-bold text-[var(--color-primary)]">= 6.7 GB per sequence</div>
				</div>
			</ContentBox>

			<ContentBox variant="dark" class="border border-[var(--color-muted)]/20">
				<h3 class="mb-3 font-semibold text-[var(--color-text)]">Total Memory</h3>
				<div class="font-mono text-[var(--color-accent)] text-[var(--text-body)]">
					Memory = B × kv_cache_size + parameter_size
				</div>
			</ContentBox>
		</div>
	</Section>

	<!-- 6. Latency & Throughput -->
	<Section title="6. Latency & Throughput">
		<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
			Since generation is memory-limited, latency is determined by memory I/O:
		</p>

		<div class="grid gap-6 md:grid-cols-2">
			<ContentBox variant="dark" class="border border-[var(--color-muted)]/20">
				<h3 class="mb-3 font-semibold text-[var(--color-text)]">Latency (seconds/token)</h3>
				<div class="font-mono text-[var(--color-accent)] text-[var(--text-small)]">
					latency = (B × kv_cache + params) / memory_bw
				</div>
			</ContentBox>

			<ContentBox variant="dark" class="border border-[var(--color-muted)]/20">
				<h3 class="mb-3 font-semibold text-[var(--color-text)]">Throughput (tokens/second)</h3>
				<div class="font-mono text-[var(--color-accent)] text-[var(--text-small)]">
					throughput = B / latency
				</div>
			</ContentBox>
		</div>

		<ContentBox variant="dark" class="mt-4 border border-amber-500/30">
			<h3 class="mb-3 font-semibold text-[var(--color-text)]">LLaMA-2 13B on H100</h3>
			<div class="overflow-x-auto">
				<table class="w-full text-[var(--text-small)]">
					<thead>
						<tr class="border-b border-[var(--color-muted)]/20 text-left text-[var(--color-muted)]">
							<th class="pr-4 pb-2">Batch</th>
							<th class="pr-4 pb-2">Memory</th>
							<th class="pr-4 pb-2">Latency</th>
							<th class="pb-2">Throughput</th>
						</tr>
					</thead>
					<tbody>
						{#each batchExamples as ex (ex.batch)}
							<tr class="border-b border-[var(--color-muted)]/10">
								<td class="py-2 pr-4 font-mono text-[var(--color-text)]">{ex.batch}</td>
								<td class="py-2 pr-4 text-[var(--color-muted)]">{ex.memory}</td>
								<td class="py-2 pr-4 text-[var(--color-accent)]">{ex.latency}</td>
								<td class="py-2 text-emerald-400">{ex.throughput}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<p class="mt-3 text-[var(--color-muted)] text-[var(--text-tiny)]">
				<span class="font-semibold">Tradeoff:</span> Small B = better latency, Large B = better throughput
			</p>
		</ContentBox>
	</Section>

	<!-- 7. Forward Pass FLOPs -->
	<Section title="7. Forward Pass FLOPs (Full Model)">
		<div class="grid gap-6 md:grid-cols-2">
			<ContentBox variant="dark" class="border border-[var(--color-muted)]/20">
				<h3 class="mb-3 font-semibold text-[var(--color-text)]">Per Token</h3>
				<div class="space-y-2 font-mono text-[var(--text-small)]">
					<div class="text-[var(--color-accent)]">FLOPs = 6 × num_params + O(T²)</div>
					<div class="text-[var(--color-muted)]">≈ 6 × num_params (when T not huge)</div>
				</div>
			</ContentBox>

			<ContentBox variant="dark" class="border border-[var(--color-muted)]/20">
				<h3 class="mb-3 font-semibold text-[var(--color-text)]">Parameter Count</h3>
				<div class="font-mono text-[var(--color-accent)] text-[var(--text-small)]">
					num_params = 2VD + L(3DF + 4DNH + D)
				</div>
				<div class="mt-2 flex gap-4 text-[var(--color-muted)] text-[var(--text-tiny)]">
					<span>↑ MLP</span>
					<span>↑ attention</span>
					<span>↑ norm</span>
				</div>
			</ContentBox>
		</div>
	</Section>

	<!-- 8. Optimization Techniques -->
	<Section title="8. Key Inference Optimizations (Math Implications)">
		<div class="overflow-x-auto">
			<table class="w-full text-[var(--text-small)]">
				<thead>
					<tr class="border-b border-[var(--color-muted)]/20 text-left text-[var(--color-muted)]">
						<th class="pr-4 pb-2">Technique</th>
						<th class="pr-4 pb-2">What it reduces</th>
						<th class="pb-2">Math impact</th>
					</tr>
				</thead>
				<tbody>
					{#each optimizations as opt (opt.technique)}
						<tr class="border-b border-[var(--color-muted)]/10">
							<td class="py-3 pr-4 font-semibold text-[var(--color-text)]">{opt.technique}</td>
							<td class="py-3 pr-4 text-[var(--color-muted)]">{opt.reduces}</td>
							<td class="py-3 font-mono text-[var(--color-accent)]">{opt.impact}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</Section>

	<!-- 9. The Fundamental Problem -->
	<Section title="9. The Fundamental Problem">
		<div class="grid gap-4 md:grid-cols-2">
			<ContentBox variant="dark" class="border border-emerald-500/30">
				<h3 class="mb-3 font-semibold text-emerald-400">Training</h3>
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">
					All tokens visible → parallelize over T
				</p>
				<div class="mt-2 font-mono text-emerald-400">→ compute-limited ✓</div>
			</ContentBox>

			<ContentBox variant="dark" class="border border-red-500/30">
				<h3 class="mb-3 font-semibold text-red-400">Generation</h3>
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">One token at a time → T=1</p>
				<div class="mt-2 font-mono text-red-400">→ memory-limited ✗</div>
			</ContentBox>
		</div>

		<ContentBox variant="dark" class="mt-4 border border-[var(--color-muted)]/20">
			<h3 class="mb-3 font-semibold text-[var(--color-text)]">Why Attention is the Bottleneck</h3>
			<div class="space-y-2 text-[var(--color-muted)] text-[var(--text-small)]">
				<div class="flex items-start gap-2">
					<span class="font-semibold text-emerald-400">MLP:</span>
					<span>Every sequence hits same weights (batching helps)</span>
				</div>
				<div class="flex items-start gap-2">
					<span class="font-semibold text-red-400">Attention:</span>
					<span>Every sequence has its own KV cache (batching doesn't help intensity)</span>
				</div>
			</div>
		</ContentBox>
	</Section>

	<!-- Summary -->
	<div
		class="rounded-xl border border-[var(--color-primary)]/20 bg-gradient-to-br from-[var(--color-primary)]/10 to-purple-600/10 p-6"
	>
		<h2 class="mb-4 text-xl font-bold text-[var(--color-text)]">Key Takeaway</h2>
		<p class="text-[var(--color-muted)] text-[var(--text-body)]">
			This math explains why inference is fundamentally different from training and why techniques
			like <span class="font-semibold text-[var(--color-primary)]">GQA</span>,
			<span class="font-semibold text-[var(--color-primary)]">MLA</span>, and
			<span class="font-semibold text-[var(--color-primary)]">speculative decoding</span> are so
			impactful. The core insight:
			<span class="font-semibold text-[var(--color-accent)]"
				>inference is memory-bandwidth bound, not compute bound</span
			>, so reducing memory transfers (smaller KV cache, quantization) matters more than reducing
			FLOPs.
		</p>
	</div>
</div>
