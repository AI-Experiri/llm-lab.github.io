<!-- ABOUTME: Challenges page for LLM Inference covering KV cache and memory bottlenecks -->
<!-- ABOUTME: Explains memory-bound nature of generation and batching effects -->

<script>
	import { HeroSection, Section, ContentBox, KeyTakeaway, Math } from '$lib/shared';

	// Formulas stored as constants for proper rendering
	const formulas = {
		attention: '\\text{Attention}(Q, K, V) = \\text{softmax}(Q \\cdot K^T) \\cdot V',
		kvSize: '\\text{kv\\_size} = 2 \\cdot L \\cdot K \\cdot H \\cdot S \\cdot \\text{bytes}',
		totalMem: 'B \\cdot \\text{kv\\_size} + \\text{params}',
		bigOS: 'O(S)',
		intensityMLP: 'B \\cdot T',
		intensityAttn: '\\frac{S \\cdot T}{S + T}'
	};

	// KV Cache size examples
	const kvCacheExamples = [
		{
			model: 'LLaMA-7B (4K)',
			layers: 32,
			heads: 32,
			dim: 128,
			seqLen: '4K',
			cacheSize: '1 GB',
			note: 'Per sequence'
		},
		{
			model: 'LLaMA-70B (4K)',
			layers: 80,
			heads: 64,
			dim: 128,
			seqLen: '4K',
			cacheSize: '5 GB',
			note: 'Per sequence'
		},
		{
			model: 'LLaMA-70B (128K)',
			layers: 80,
			heads: 64,
			dim: 128,
			seqLen: '128K',
			cacheSize: '160 GB',
			note: 'Long context!'
		}
	];

	// Batching effects
	const batchingEffects = [
		{
			operation: 'MLP Layers',
			withoutBatch: 'Intensity: T',
			withBatch: 'Intensity: B*T',
			effect: 'Linear improvement',
			helps: true
		},
		{
			operation: 'Attention',
			withoutBatch: 'Intensity: S*T/(S+T)',
			withBatch: 'Intensity: S*T/(S+T)',
			effect: 'No improvement!',
			helps: false
		}
	];

	// Compute vs memory scenarios
	const scenarios = [
		{ batch: 1, seqLen: 1, intensity: '~1', bound: 'Memory', util: '0.3%', color: 'red' },
		{ batch: 1, seqLen: 1024, intensity: '~512', bound: 'Compute', util: '100%', color: 'green' },
		{ batch: 32, seqLen: 1, intensity: '~32', bound: 'Memory', util: '11%', color: 'yellow' },
		{ batch: 32, seqLen: 1024, intensity: '~16K', bound: 'Compute', util: '100%', color: 'green' }
	];
</script>

<div class="space-y-6">
	<HeroSection title="The Memory Wall: KV Cache & Bottlenecks">
		<p class="max-w-3xl leading-relaxed text-[var(--color-muted)] text-[var(--text-body)]">
			During generation, the <span class="font-semibold text-red-400">KV cache</span> dominates
			memory usage. For a 70B model with batch size 32, the KV cache can be
			<span class="font-semibold text-red-400">larger than the model itself</span>. This
			fundamentally limits how many concurrent requests we can serve.
		</p>
		<div class="mt-4 flex flex-wrap gap-3">
			<span
				class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-[var(--text-small)] text-red-400"
			>
				KV Cache grows with B*S*L
			</span>
			<span
				class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-[var(--text-small)] text-red-400"
			>
				Memory-Limited Generation
			</span>
			<span
				class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-[var(--color-accent)] text-[var(--text-small)]"
			>
				Batching Helps MLP Only
			</span>
		</div>
	</HeroSection>

	<!-- KV Cache Explained -->
	<Section title="Understanding KV Cache">
		<p class="mb-6 text-[var(--color-muted)] text-[var(--text-small)]">
			Attention requires access to all previous tokens. Rather than recomputing K and V for every
			token, we cache them - but this cache grows with every generated token.
		</p>

		<div class="grid gap-6 md:grid-cols-2">
			<ContentBox title="Why Cache K and V?" variant="dark">
				<div class="space-y-3 text-[var(--color-muted)] text-[var(--text-small)]">
					<p>In autoregressive generation, attention computes:</p>
					<div
						class="rounded-lg bg-[var(--color-secondary)] p-3 text-center text-[var(--text-tiny)]"
					>
						<Math formula={formulas.attention} />
					</div>
					<p>For each new token, Q changes but K and V for previous tokens stay the same.</p>
					<p class="text-[var(--color-accent)]">
						Caching avoids <Math formula={formulas.bigOS} /> recomputation per token!
					</p>
				</div>
			</ContentBox>

			<ContentBox title="KV Cache Size Formula" variant="dark">
				<div
					class="mb-3 rounded-lg bg-[var(--color-secondary)] p-3 text-center text-[var(--text-small)]"
				>
					<Math formula={formulas.kvSize} />
					<div class="mt-2 text-[var(--color-muted)] text-[var(--text-tiny)]">
						L = layers, K = kv_heads, H = head_dim, S = seq_length
					</div>
				</div>
				<div class="space-y-1 text-[var(--color-muted)] text-[var(--text-tiny)]">
					<div class="flex items-center justify-between">
						<span>Total memory:</span>
						<Math formula={formulas.totalMem} />
					</div>
				</div>
			</ContentBox>
		</div>
	</Section>

	<!-- KV Cache Size Examples -->
	<Section title="KV Cache Size in Practice">
		<div class="overflow-x-auto">
			<table class="w-full text-[var(--text-small)]">
				<thead>
					<tr class="border-b border-[var(--color-muted)]/20 text-left text-[var(--color-muted)]">
						<th class="pr-4 pb-3">Model</th>
						<th class="pr-4 pb-3">Layers</th>
						<th class="pr-4 pb-3">KV Heads</th>
						<th class="pr-4 pb-3">Head Dim</th>
						<th class="pr-4 pb-3">Seq Length</th>
						<th class="pr-4 pb-3">KV Cache</th>
						<th class="pb-3">Note</th>
					</tr>
				</thead>
				<tbody>
					{#each kvCacheExamples as ex (ex.model)}
						<tr class="border-b border-[var(--color-muted)]/10">
							<td class="py-3 pr-4 font-semibold text-[var(--color-text)]">{ex.model}</td>
							<td class="py-3 pr-4 font-mono text-[var(--color-muted)]">{ex.layers}</td>
							<td class="py-3 pr-4 font-mono text-[var(--color-muted)]">{ex.heads}</td>
							<td class="py-3 pr-4 font-mono text-[var(--color-muted)]">{ex.dim}</td>
							<td class="py-3 pr-4 font-mono text-[var(--color-accent)]">{ex.seqLen}</td>
							<td class="py-3 pr-4 font-mono font-bold text-[var(--color-primary)]"
								>{ex.cacheSize}</td
							>
							<td class="py-3 text-[var(--color-muted)] text-[var(--text-tiny)]">{ex.note}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<KeyTakeaway title="Warning" class="mt-4">
			<p>
				With 128K context, a single sequence's KV cache (160 GB) exceeds the model parameters (140
				GB)! This severely limits batch sizes for long-context models.
			</p>
		</KeyTakeaway>
	</Section>

	<!-- Memory Breakdown Visualization -->
	<Section title="Memory Breakdown (LLaMA-70B)">
		<div class="overflow-x-auto">
			<table class="w-full text-[var(--text-small)]">
				<thead>
					<tr class="border-b border-[var(--color-muted)]/20 text-left text-[var(--color-muted)]">
						<th class="pr-4 pb-3">Component</th>
						<th class="pr-4 pb-3">Size</th>
						<th class="pb-3">Note</th>
					</tr>
				</thead>
				<tbody>
					<tr class="border-b border-[var(--color-muted)]/10">
						<td class="py-3 pr-4 text-[var(--color-text)]">Model Parameters</td>
						<td class="py-3 pr-4 font-mono font-bold text-purple-400">140 GB</td>
						<td class="py-3 text-[var(--color-muted)]">fp16 weights</td>
					</tr>
					<tr class="border-b border-[var(--color-muted)]/10">
						<td class="py-3 pr-4 text-[var(--color-text)]">KV Cache (B=1)</td>
						<td class="py-3 pr-4 font-mono font-bold text-cyan-400">5 GB</td>
						<td class="py-3 text-[var(--color-muted)]">Single sequence, 4K context</td>
					</tr>
					<tr class="border-b border-[var(--color-muted)]/10">
						<td class="py-3 pr-4 text-[var(--color-text)]">KV Cache (B=32)</td>
						<td class="py-3 pr-4 font-mono font-bold text-pink-400">160 GB</td>
						<td class="py-3 text-pink-400">Exceeds model size!</td>
					</tr>
					<tr>
						<td class="py-3 pr-4 text-[var(--color-text)]">Activations</td>
						<td class="py-3 pr-4 font-mono font-bold text-green-400">~1 GB</td>
						<td class="py-3 text-[var(--color-muted)]">Intermediate values</td>
					</tr>
				</tbody>
			</table>
		</div>
		<p class="mt-4 text-[var(--color-muted)] text-[var(--text-small)]">
			With batch size 32, total memory: ~300 GB — requires multi-GPU setup.
		</p>
	</Section>

	<!-- Compute vs Memory Bound -->
	<Section title="Compute vs Memory Bound">
		<p class="mb-6 text-[var(--color-muted)] text-[var(--text-small)]">
			Whether an operation is compute or memory bound depends on batch size and sequence length.
			H100 threshold: 295 FLOPs/byte.
		</p>

		<div class="overflow-x-auto">
			<table class="w-full text-[var(--text-small)]">
				<thead>
					<tr class="border-b border-[var(--color-muted)]/20 text-left text-[var(--color-muted)]">
						<th class="pr-4 pb-3">Batch Size</th>
						<th class="pr-4 pb-3">Seq Length</th>
						<th class="pr-4 pb-3">Intensity</th>
						<th class="pr-4 pb-3">Bottleneck</th>
						<th class="pb-3">GPU Utilization</th>
					</tr>
				</thead>
				<tbody>
					{#each scenarios as s, i (i)}
						<tr class="border-b border-[var(--color-muted)]/10">
							<td class="py-3 pr-4 font-mono text-[var(--color-text)]">{s.batch}</td>
							<td class="py-3 pr-4 font-mono text-[var(--color-text)]">{s.seqLen}</td>
							<td class="py-3 pr-4 font-mono text-[var(--color-accent)]">{s.intensity}</td>
							<td class="py-3 pr-4">
								<span
									class="rounded px-2 py-0.5 text-[var(--text-tiny)] {s.bound === 'Memory'
										? 'bg-red-500/20 text-red-400'
										: 'bg-green-500/20 text-green-400'}"
								>
									{s.bound}
								</span>
							</td>
							<td
								class="py-3 font-mono {s.color === 'red'
									? 'text-red-400'
									: s.color === 'yellow'
										? 'text-yellow-400'
										: 'text-green-400'}"
							>
								{s.util}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<KeyTakeaway title="Generation bottleneck" class="mt-4">
			<p>
				<span class="font-semibold text-[var(--color-accent)]">Generation (B=1, S=1):</span> Only 0.3%
				GPU utilization! We load the entire model weights for a single matrix-vector product.
			</p>
		</KeyTakeaway>
	</Section>

	<!-- Batching Analysis -->
	<Section title="Does Batching Help?">
		<p class="mb-6 text-[var(--color-muted)] text-[var(--text-small)]">
			Batching multiple requests together can improve efficiency, but not uniformly across all
			operations.
		</p>

		<div class="grid gap-6 md:grid-cols-2">
			{#each batchingEffects as effect (effect.operation)}
				<ContentBox
					title={effect.operation}
					variant="dark"
					class="border-2 {effect.helps ? 'border-green-500/30' : 'border-red-500/30'}"
				>
					<div class="space-y-2 text-[var(--text-small)]">
						<div class="flex justify-between">
							<span class="text-[var(--color-muted)]">Without batching:</span>
							<span class="font-mono text-[var(--color-accent)]">{effect.withoutBatch}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-[var(--color-muted)]">With batching:</span>
							<span class="font-mono text-[var(--color-accent)]">{effect.withBatch}</span>
						</div>
						<div
							class="mt-3 rounded p-2 text-[var(--text-tiny)] {effect.helps
								? 'bg-green-500/10 text-green-400'
								: 'bg-red-500/10 text-red-400'}"
						>
							{effect.effect}
						</div>
					</div>
				</ContentBox>
			{/each}
		</div>

		<ContentBox title="Why Attention Doesn't Benefit" variant="dark" class="mt-6">
			<div class="grid gap-4 md:grid-cols-2">
				<div>
					<div class="mb-2 text-[var(--color-muted)] text-[var(--text-small)]">
						MLP intensity formula:
					</div>
					<div
						class="rounded bg-[var(--color-secondary)] p-2 font-mono text-[var(--color-accent)] text-[var(--text-tiny)]"
					>
						intensity = B * T
					</div>
					<p class="mt-2 text-[var(--color-muted)] text-[var(--text-tiny)]">
						Batch size B directly multiplies intensity
					</p>
				</div>
				<div>
					<div class="mb-2 text-[var(--color-muted)] text-[var(--text-small)]">
						Attention intensity formula:
					</div>
					<div
						class="rounded bg-[var(--color-secondary)] p-2 font-mono text-[var(--color-accent)] text-[var(--text-tiny)]"
					>
						intensity = S * T / (S + T)
					</div>
					<p class="mt-2 text-[var(--color-muted)] text-[var(--text-tiny)]">
						No dependence on batch size B!
					</p>
				</div>
			</div>
		</ContentBox>
	</Section>

	<!-- The Fundamental Problem -->
	<Section title="The Fundamental Problem">
		<div class="grid gap-4 md:grid-cols-3">
			<ContentBox title="Sequential Generation" variant="warning">
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">
					Each token depends on all previous tokens. Can't parallelize like training.
				</p>
			</ContentBox>

			<ContentBox title="Memory Bandwidth" variant="warning">
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">
					Must load model weights and KV cache for each token. GPU compute sits idle.
				</p>
			</ContentBox>

			<ContentBox title="Growing KV Cache" variant="warning">
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">
					Cache grows linearly with sequence length, limiting batch sizes for long contexts.
				</p>
			</ContentBox>
		</div>

		<ContentBox title="Solutions Preview" variant="highlight" class="mt-6">
			<div class="grid gap-4 text-[var(--color-muted)] text-[var(--text-small)] sm:grid-cols-2">
				<div class="flex items-start gap-2">
					<span class="text-[var(--color-primary)]">→</span>
					<span
						><span class="text-[var(--color-text)]">Reduce KV cache:</span> GQA, MLA, CLA, local attention</span
					>
				</div>
				<div class="flex items-start gap-2">
					<span class="text-[var(--color-primary)]">→</span>
					<span
						><span class="text-[var(--color-text)]">Alternative architectures:</span> SSMs, linear attention</span
					>
				</div>
				<div class="flex items-start gap-2">
					<span class="text-[var(--color-primary)]">→</span>
					<span
						><span class="text-[var(--color-text)]">Compress model:</span> Quantization, pruning</span
					>
				</div>
				<div class="flex items-start gap-2">
					<span class="text-[var(--color-primary)]">→</span>
					<span
						><span class="text-[var(--color-text)]">Speculative decoding:</span> Exploit checking &gt;
						generating</span
					>
				</div>
			</div>
		</ContentBox>
	</Section>

	<!-- Key Takeaways -->
	<div
		class="rounded-xl border border-red-600/20 bg-gradient-to-br from-red-600/10 to-[var(--color-primary)]/10 p-6"
	>
		<h2 class="mb-4 text-xl font-bold text-[var(--color-text)]">Key Takeaways</h2>
		<div class="grid gap-4 sm:grid-cols-2">
			<div class="flex items-start gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 font-bold text-[var(--text-small)] text-red-400"
				>
					1
				</div>
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">
					<span class="font-semibold text-[var(--color-text)]">KV cache can exceed model size.</span
					>
					With long contexts and batching, memory is dominated by cached KV states.
				</p>
			</div>
			<div class="flex items-start gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 font-bold text-[var(--text-small)] text-red-400"
				>
					2
				</div>
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">
					<span class="font-semibold text-[var(--color-text)]">Generation wastes 99%+ of GPU.</span>
					Arithmetic intensity ~1 vs GPU's 295 means severe underutilization.
				</p>
			</div>
			<div class="flex items-start gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 font-bold text-[var(--text-small)] text-red-400"
				>
					3
				</div>
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">
					<span class="font-semibold text-[var(--color-text)]"
						>Batching helps MLP, not attention.</span
					>
					Attention intensity is independent of batch size - a fundamental limitation.
				</p>
			</div>
			<div class="flex items-start gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 font-bold text-[var(--text-small)] text-red-400"
				>
					4
				</div>
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">
					<span class="font-semibold text-[var(--color-text)]">Long context is expensive.</span>
					128K context makes single-sequence KV cache larger than 70B model weights.
				</p>
			</div>
		</div>
	</div>
</div>
