<script>
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

	// Memory breakdown
	const memoryBreakdown = [
		{ component: 'Model Parameters', size: '140 GB', note: 'LLaMA-70B in fp16', color: 'purple' },
		{
			component: 'KV Cache (B=1)',
			size: '5 GB',
			note: 'Single sequence, 4K tokens',
			color: 'cyan'
		},
		{
			component: 'KV Cache (B=32)',
			size: '160 GB',
			note: '32 concurrent sequences',
			color: 'pink'
		},
		{ component: 'Activations', size: '~1 GB', note: 'Intermediate values', color: 'green' }
	];

	// Batching effects
	const batchingEffects = [
		{
			operation: 'MLP Layers',
			withoutBatch: 'Intensity: T',
			withBatch: 'Intensity: B*T',
			effect: 'Linear improvement',
			helps: true,
			icon: '📈'
		},
		{
			operation: 'Attention',
			withoutBatch: 'Intensity: S*T/(S+T)',
			withBatch: 'Intensity: S*T/(S+T)',
			effect: 'No improvement!',
			helps: false,
			icon: '📉'
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
	<!-- Hero Section -->
	<div
		class="rounded-2xl border border-red-600/30 bg-gradient-to-br from-red-600/20 to-[var(--color-primary)]/20 p-8"
	>
		<div class="flex items-start gap-4">
			<div class="text-5xl">🔥</div>
			<div>
				<h2 class="mb-3 text-2xl font-bold text-[var(--color-text)] md:text-3xl">
					The Memory Wall: KV Cache & Bottlenecks
				</h2>
				<p class="max-w-3xl text-lg leading-relaxed text-[var(--color-muted)]">
					During generation, the <span class="font-semibold text-red-400">KV cache</span> dominates
					memory usage. For a 70B model with batch size 32, the KV cache can be
					<span class="font-semibold text-red-400">larger than the model itself</span>. This
					fundamentally limits how many concurrent requests we can serve.
				</p>
				<div class="mt-4 flex flex-wrap gap-3">
					<span class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-sm text-red-400">
						KV Cache grows with B*S*L
					</span>
					<span class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-sm text-red-400">
						Memory-Limited Generation
					</span>
					<span
						class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-sm text-[var(--color-accent)]"
					>
						Batching Helps MLP Only
					</span>
				</div>
			</div>
		</div>
	</div>

	<!-- KV Cache Explained -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>🔑</span> Understanding KV Cache
		</h2>
		<p class="mb-6 text-[var(--color-muted)]">
			Attention requires access to all previous tokens. Rather than recomputing K and V for every
			token, we cache them - but this cache grows with every generated token.
		</p>

		<div class="grid gap-6 md:grid-cols-2">
			<div class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-5">
				<h3 class="mb-3 font-bold text-[var(--color-text)]">Why Cache K and V?</h3>
				<div class="space-y-3 text-sm text-[var(--color-muted)]">
					<p>In autoregressive generation, attention computes:</p>
					<div class="rounded-lg bg-[var(--color-secondary)] p-3 font-mono text-xs">
						<div>Attention(Q, K, V) = softmax(Q @ K.T) @ V</div>
					</div>
					<p>For each new token, Q changes but K and V for previous tokens stay the same.</p>
					<p class="text-[var(--color-accent)]">Caching avoids O(S) recomputation per token!</p>
				</div>
			</div>

			<div class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-5">
				<h3 class="mb-3 font-bold text-[var(--color-text)]">KV Cache Size Formula</h3>
				<div class="mb-3 rounded-lg bg-[var(--color-secondary)] p-3 font-mono text-xs">
					<div class="text-[var(--color-accent)]"># Per sequence KV cache</div>
					<div>kv_size = 2 * L * K * H * S * bytes</div>
					<div class="mt-2 text-[var(--color-muted)]"># Where:</div>
					<div class="text-[var(--color-muted)]"># L = layers, K = kv_heads</div>
					<div class="text-[var(--color-muted)]"># H = head_dim, S = seq_length</div>
				</div>
				<div class="space-y-1 text-xs text-[var(--color-muted)]">
					<div class="flex justify-between">
						<span>Total memory:</span>
						<span class="font-mono text-[var(--color-text)]">B * kv_size + params</span>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- KV Cache Size Examples -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>📏</span> KV Cache Size in Practice
		</h2>

		<div class="overflow-x-auto">
			<table class="w-full text-sm">
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
							<td class="py-3 text-xs text-[var(--color-muted)]">{ex.note}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<div class="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
			<p class="text-sm text-red-200">
				<span class="font-semibold">Warning:</span> With 128K context, a single sequence's KV cache (160
				GB) exceeds the model parameters (140 GB)! This severely limits batch sizes for long-context models.
			</p>
		</div>
	</div>

	<!-- Memory Breakdown Visualization -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>💾</span> Memory Breakdown (LLaMA-70B)
		</h2>

		<div class="space-y-3">
			{#each memoryBreakdown as item (item.component)}
				<div class="flex items-center gap-4">
					<div class="w-32 text-sm text-[var(--color-text)]">{item.component}</div>
					<div class="h-8 flex-1 overflow-hidden rounded-full bg-[var(--color-bg)]">
						<div
							class="flex h-full items-center px-3 font-mono text-xs text-white {item.color ===
							'purple'
								? 'bg-purple-500'
								: item.color === 'cyan'
									? 'bg-cyan-500'
									: item.color === 'pink'
										? 'bg-pink-500'
										: 'bg-green-500'}"
							style="width: {item.size === '140 GB'
								? '45%'
								: item.size === '160 GB'
									? '50%'
									: item.size === '5 GB'
										? '3%'
										: '1%'}"
						>
							{item.size}
						</div>
					</div>
					<div class="w-48 text-xs text-[var(--color-muted)]">{item.note}</div>
				</div>
			{/each}
		</div>

		<p class="mt-4 text-sm text-[var(--color-muted)]">
			With batch size 32, the KV cache dominates memory. Total: ~300 GB for a single 70B model!
		</p>
	</div>

	<!-- Compute vs Memory Bound -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>⚖️</span> Compute vs Memory Bound
		</h2>
		<p class="mb-6 text-[var(--color-muted)]">
			Whether an operation is compute or memory bound depends on batch size and sequence length.
			H100 threshold: 295 FLOPs/byte.
		</p>

		<div class="overflow-x-auto">
			<table class="w-full text-sm">
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
									class="rounded px-2 py-0.5 text-xs {s.bound === 'Memory'
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

		<div class="mt-4 rounded-lg border-l-4 border-[var(--color-primary)] bg-[var(--color-bg)] p-4">
			<p class="text-sm text-[var(--color-muted)]">
				<span class="font-semibold text-[var(--color-accent)]">Generation (B=1, S=1):</span> Only 0.3%
				GPU utilization! We load the entire model weights for a single matrix-vector product.
			</p>
		</div>
	</div>

	<!-- Batching Analysis -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>📦</span> Does Batching Help?
		</h2>
		<p class="mb-6 text-[var(--color-muted)]">
			Batching multiple requests together can improve efficiency, but not uniformly across all
			operations.
		</p>

		<div class="grid gap-6 md:grid-cols-2">
			{#each batchingEffects as effect (effect.operation)}
				<div
					class="rounded-lg border-2 bg-[var(--color-bg)] p-5 {effect.helps
						? 'border-green-500/30'
						: 'border-red-500/30'}"
				>
					<div class="mb-3 flex items-center gap-3">
						<span class="text-3xl">{effect.icon}</span>
						<h3 class="font-bold text-[var(--color-text)]">{effect.operation}</h3>
					</div>
					<div class="space-y-2 text-sm">
						<div class="flex justify-between">
							<span class="text-[var(--color-muted)]">Without batching:</span>
							<span class="font-mono text-[var(--color-accent)]">{effect.withoutBatch}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-[var(--color-muted)]">With batching:</span>
							<span class="font-mono text-[var(--color-accent)]">{effect.withBatch}</span>
						</div>
						<div
							class="mt-3 rounded p-2 {effect.helps
								? 'bg-green-500/10 text-green-400'
								: 'bg-red-500/10 text-red-400'} text-xs"
						>
							{effect.effect}
						</div>
					</div>
				</div>
			{/each}
		</div>

		<div class="mt-6 rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-5">
			<h3 class="mb-3 font-bold text-[var(--color-text)]">Why Attention Doesn't Benefit</h3>
			<div class="grid gap-4 md:grid-cols-2">
				<div>
					<div class="mb-2 text-sm text-[var(--color-muted)]">MLP intensity formula:</div>
					<div
						class="rounded bg-[var(--color-secondary)] p-2 font-mono text-xs text-[var(--color-accent)]"
					>
						intensity = B * T
					</div>
					<p class="mt-2 text-xs text-[var(--color-muted)]">
						Batch size B directly multiplies intensity
					</p>
				</div>
				<div>
					<div class="mb-2 text-sm text-[var(--color-muted)]">Attention intensity formula:</div>
					<div
						class="rounded bg-[var(--color-secondary)] p-2 font-mono text-xs text-[var(--color-accent)]"
					>
						intensity = S * T / (S + T)
					</div>
					<p class="mt-2 text-xs text-[var(--color-muted)]">No dependence on batch size B!</p>
				</div>
			</div>
		</div>
	</div>

	<!-- The Fundamental Problem -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>🎯</span> The Fundamental Problem
		</h2>

		<div class="grid gap-4 md:grid-cols-3">
			<div class="rounded-lg border border-red-500/30 bg-[var(--color-bg)] p-5">
				<div class="mb-2 text-3xl">🐌</div>
				<h3 class="mb-2 font-bold text-red-400">Sequential Generation</h3>
				<p class="text-sm text-[var(--color-muted)]">
					Each token depends on all previous tokens. Can't parallelize like training.
				</p>
			</div>

			<div class="rounded-lg border border-red-500/30 bg-[var(--color-bg)] p-5">
				<div class="mb-2 text-3xl">💾</div>
				<h3 class="mb-2 font-bold text-red-400">Memory Bandwidth</h3>
				<p class="text-sm text-[var(--color-muted)]">
					Must load model weights and KV cache for each token. GPU compute sits idle.
				</p>
			</div>

			<div class="rounded-lg border border-red-500/30 bg-[var(--color-bg)] p-5">
				<div class="mb-2 text-3xl">📈</div>
				<h3 class="mb-2 font-bold text-red-400">Growing KV Cache</h3>
				<p class="text-sm text-[var(--color-muted)]">
					Cache grows linearly with sequence length, limiting batch sizes for long contexts.
				</p>
			</div>
		</div>

		<div
			class="mt-6 rounded-lg border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 p-4"
		>
			<h3 class="mb-2 font-bold text-[var(--color-text)]">Solutions Preview</h3>
			<div class="grid gap-4 text-sm text-[var(--color-muted)] sm:grid-cols-2">
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
		</div>
	</div>

	<!-- Key Takeaways -->
	<div
		class="rounded-xl border border-red-600/20 bg-gradient-to-br from-red-600/10 to-[var(--color-primary)]/10 p-6"
	>
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-text)]">
			<span>💡</span> Key Takeaways
		</h2>
		<div class="grid gap-4 sm:grid-cols-2">
			<div class="flex items-start gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 text-sm font-bold text-red-400"
				>
					1
				</div>
				<p class="text-sm text-[var(--color-muted)]">
					<span class="font-semibold text-[var(--color-text)]">KV cache can exceed model size.</span
					>
					With long contexts and batching, memory is dominated by cached KV states.
				</p>
			</div>
			<div class="flex items-start gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 text-sm font-bold text-red-400"
				>
					2
				</div>
				<p class="text-sm text-[var(--color-muted)]">
					<span class="font-semibold text-[var(--color-text)]">Generation wastes 99%+ of GPU.</span>
					Arithmetic intensity ~1 vs GPU's 295 means severe underutilization.
				</p>
			</div>
			<div class="flex items-start gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 text-sm font-bold text-red-400"
				>
					3
				</div>
				<p class="text-sm text-[var(--color-muted)]">
					<span class="font-semibold text-[var(--color-text)]"
						>Batching helps MLP, not attention.</span
					>
					Attention intensity is independent of batch size - a fundamental limitation.
				</p>
			</div>
			<div class="flex items-start gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 text-sm font-bold text-red-400"
				>
					4
				</div>
				<p class="text-sm text-[var(--color-muted)]">
					<span class="font-semibold text-[var(--color-text)]">Long context is expensive.</span>
					128K context makes single-sequence KV cache larger than 70B model weights.
				</p>
			</div>
		</div>
	</div>
</div>
