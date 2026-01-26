<!-- ABOUTME: Optimization techniques page for GPU Lab -->
<!-- ABOUTME: Focuses on precision, fusion, recomputation, branches (coalescing/tiling detailed in Memory tab) -->

<script>
	import { HeroSection, Section, ContentBox, KeyTakeaway, ComparisonGrid } from '$lib/shared';

	const techniques = [
		{
			title: '1. Lower Precision',
			color: 'pink',
			points: ['FP32 → BF16 → FP8', '2× throughput per step', 'Half memory bandwidth']
		},
		{
			title: '2. Operator Fusion',
			color: 'cyan',
			points: ['Combine multiple ops', 'Reduce memory traffic', 'One kernel instead of many']
		},
		{
			title: '3. Recomputation',
			color: 'green',
			points: [
				'Trade compute for memory',
				'Recompute vs store activations',
				'Essential for long sequences'
			]
		},
		{
			title: '4. Avoid Branches',
			color: 'amber',
			points: ['Warp divergence is costly', 'Use predication/masking', 'Uniform control flow']
		},
		{
			title: '5. Memory Coalescing',
			color: 'blue',
			points: [
				'Adjacent thread → adjacent memory',
				'Fewer memory transactions',
				'See Memory tab for details'
			]
		},
		{
			title: '6. Tiling',
			color: 'purple',
			points: ['Load tile to shared memory', 'Reuse data within tile', 'See Memory tab for details']
		}
	];
</script>

<div class="space-y-6">
	<HeroSection icon="⚡" title="Optimization Techniques">
		<p class="max-w-3xl leading-relaxed text-[var(--color-muted)] text-[var(--text-body)]">
			Key techniques to make GPU code fast. Most optimizations reduce memory traffic—because compute
			has scaled 100× faster than bandwidth, memory is almost always the bottleneck. Coalescing and
			tiling are covered in detail on the Memory tab.
		</p>
	</HeroSection>

	<!-- Overview Grid -->
	<Section title="The Six Techniques">
		<ComparisonGrid columns={3} items={techniques} />
	</Section>

	<!-- 1. Lower Precision -->
	<Section title="1. Lower Precision" titleColor="#f472b6">
		<ContentBox variant="dark" class="border-l-4 border-pink-500">
			<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
				Using smaller data types reduces memory bandwidth and increases throughput. Modern tensor
				cores are specifically designed for low-precision operations.
			</p>
		</ContentBox>

		<ContentBox variant="dark" class="mt-4">
			<h4 class="mb-3 font-medium text-[var(--color-muted)] text-[var(--text-small)]">
				Precision Comparison (H100)
			</h4>
			<div class="overflow-x-auto">
				<table class="w-full font-mono text-[var(--text-tiny)]">
					<thead>
						<tr class="border-b border-[var(--color-muted)]/30">
							<th class="px-2 py-2 text-left text-[var(--color-muted)]">Format</th>
							<th class="px-2 py-2 text-right text-[var(--color-muted)]">Bytes</th>
							<th class="px-2 py-2 text-right text-[var(--color-muted)]">TFLOP/s</th>
							<th class="px-2 py-2 text-left text-[var(--color-muted)]">Effective BW</th>
						</tr>
					</thead>
					<tbody>
						<tr class="border-b border-[var(--color-muted)]/10">
							<td class="px-2 py-2 text-red-400">FP32</td>
							<td class="px-2 py-2 text-right text-[var(--color-text)]">4</td>
							<td class="px-2 py-2 text-right text-[var(--color-text)]">67</td>
							<td class="px-2 py-2 text-[var(--color-muted)]">3.35 TB/s (baseline)</td>
						</tr>
						<tr class="border-b border-[var(--color-muted)]/10">
							<td class="px-2 py-2 text-yellow-400">TF32</td>
							<td class="px-2 py-2 text-right text-[var(--color-text)]">4</td>
							<td class="px-2 py-2 text-right text-[var(--color-text)]">~500</td>
							<td class="px-2 py-2 text-[var(--color-muted)]">3.35 TB/s (tensor core)</td>
						</tr>
						<tr class="border-b border-[var(--color-muted)]/10">
							<td class="px-2 py-2 text-green-400">BF16</td>
							<td class="px-2 py-2 text-right text-[var(--color-text)]">2</td>
							<td class="px-2 py-2 text-right text-[var(--color-text)]">990</td>
							<td class="px-2 py-2 text-green-400">6.7 TB/s effective</td>
						</tr>
						<tr class="border-b border-[var(--color-muted)]/10">
							<td class="px-2 py-2 text-cyan-400">FP16</td>
							<td class="px-2 py-2 text-right text-[var(--color-text)]">2</td>
							<td class="px-2 py-2 text-right text-[var(--color-text)]">990</td>
							<td class="px-2 py-2 text-[var(--color-muted)]">6.7 TB/s effective</td>
						</tr>
						<tr>
							<td class="px-2 py-2 text-pink-400">FP8</td>
							<td class="px-2 py-2 text-right text-[var(--color-text)]">1</td>
							<td class="px-2 py-2 text-right text-[var(--color-text)]">1979</td>
							<td class="px-2 py-2 text-pink-400">13.4 TB/s effective</td>
						</tr>
					</tbody>
				</table>
			</div>
			<p class="mt-3 text-center text-[var(--color-primary)] text-[var(--text-tiny)]">
				Each halving of precision ≈ 2× effective bandwidth!
			</p>
		</ContentBox>

		<div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
			<ContentBox variant="dark" class="border border-green-500/30">
				<h4 class="mb-2 font-semibold text-green-400">BF16: The Sweet Spot</h4>
				<ul class="space-y-1 text-[var(--color-muted)] text-[var(--text-tiny)]">
					<li>• Same exponent range as FP32 (8 bits)</li>
					<li>• No loss scaling needed</li>
					<li>• Drop-in replacement for most training</li>
					<li>• 2× throughput, 0.5× memory</li>
				</ul>
			</ContentBox>
			<ContentBox variant="dark" class="border border-pink-500/30">
				<h4 class="mb-2 font-semibold text-pink-400">FP8: The Frontier</h4>
				<ul class="space-y-1 text-[var(--color-muted)] text-[var(--text-tiny)]">
					<li>• Per-tensor scaling required</li>
					<li>• Transformer Engine handles it</li>
					<li>• 2× over BF16 for matmuls</li>
					<li>• H100+ only</li>
				</ul>
			</ContentBox>
		</div>
	</Section>

	<!-- 2. Operator Fusion -->
	<Section title="2. Operator Fusion" titleColor="#22d3ee">
		<ContentBox variant="dark" class="border-l-4 border-cyan-500">
			<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
				Combine multiple operations into a single kernel to avoid intermediate memory reads/writes.
				This is the core idea behind FlashAttention and torch.compile.
			</p>
		</ContentBox>

		<ContentBox variant="dark" class="mt-4">
			<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<div class="rounded border border-red-500/30 bg-[var(--color-bg)] p-4">
					<h5 class="mb-3 font-medium text-red-400">Unfused (3 kernels)</h5>
					<div class="font-mono text-[var(--text-tiny)]">
						<pre class="text-[var(--color-text)]">
# Each op reads/writes to HBM

y = matmul(x, W)     <span class="text-red-400"># Read x,W; Write y</span>
z = gelu(y)          <span class="text-red-400"># Read y; Write z</span>
out = dropout(z)     <span class="text-red-400"># Read z; Write out</span>

<span class="text-[var(--color-muted)]">Memory traffic: 6 HBM round trips</span>
						</pre>
					</div>
				</div>

				<div class="rounded border border-green-500/30 bg-[var(--color-bg)] p-4">
					<h5 class="mb-3 font-medium text-green-400">Fused (1 kernel)</h5>
					<div class="font-mono text-[var(--text-tiny)]">
						<pre class="text-[var(--color-text)]">
# All ops in one kernel

out = fused_matmul_gelu_dropout(x, W)
    # Read x, W from HBM
    # Compute matmul → registers
    # Apply gelu → registers
    # Apply dropout → registers
    # Write out to HBM

<span class="text-[var(--color-muted)]">Memory traffic: 2 HBM round trips</span>
<span class="text-green-400">→ 3× less memory traffic!</span>
						</pre>
					</div>
				</div>
			</div>
		</ContentBox>

		<ContentBox variant="dark" class="mt-4">
			<h4 class="mb-3 font-medium text-[var(--color-text)]">Common Fusion Patterns</h4>
			<div class="grid grid-cols-2 gap-3 md:grid-cols-4">
				<div class="rounded border border-cyan-500/30 bg-[var(--color-bg)] p-3">
					<p class="font-mono text-[var(--text-small)] text-cyan-400">MatMul + Bias</p>
					<p class="mt-1 text-[var(--color-muted)] text-[var(--text-tiny)]">Linear layer output</p>
				</div>
				<div class="rounded border border-cyan-500/30 bg-[var(--color-bg)] p-3">
					<p class="font-mono text-[var(--text-small)] text-cyan-400">MatMul + GELU</p>
					<p class="mt-1 text-[var(--color-muted)] text-[var(--text-tiny)]">FFN activation</p>
				</div>
				<div class="rounded border border-cyan-500/30 bg-[var(--color-bg)] p-3">
					<p class="font-mono text-[var(--text-small)] text-cyan-400">LayerNorm + Add</p>
					<p class="mt-1 text-[var(--color-muted)] text-[var(--text-tiny)]">Residual connection</p>
				</div>
				<div class="rounded border border-cyan-500/30 bg-[var(--color-bg)] p-3">
					<p class="font-mono text-[var(--text-small)] text-cyan-400">Softmax + Dropout</p>
					<p class="mt-1 text-[var(--color-muted)] text-[var(--text-tiny)]">Attention scores</p>
				</div>
			</div>
		</ContentBox>
	</Section>

	<!-- 3. Recomputation -->
	<Section title="3. Recomputation (Activation Checkpointing)" titleColor="#4ade80">
		<ContentBox variant="dark" class="border-l-4 border-green-500">
			<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
				Instead of storing all activations for the backward pass, recompute them on-the-fly. This
				trades compute for memory—essential for training large models or long sequences.
			</p>
		</ContentBox>

		<ContentBox variant="dark" class="mt-4">
			<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<div class="rounded border border-red-500/30 bg-[var(--color-bg)] p-4">
					<h5 class="mb-3 font-medium text-red-400">Standard Training</h5>
					<div class="font-mono text-[var(--text-tiny)]">
						<pre class="text-[var(--color-text)]">
Forward pass:
  Layer 1 → <span class="text-red-400">save activation</span> → Layer 2 →
  <span class="text-red-400">save activation</span> → Layer 3 → ...

Backward pass:
  Use saved activations for gradients

<span class="text-[var(--color-muted)]">Memory: O(num_layers × seq_len × hidden)</span>
<span class="text-red-400">For 70B model: hundreds of GB!</span>
						</pre>
					</div>
				</div>

				<div class="rounded border border-green-500/30 bg-[var(--color-bg)] p-4">
					<h5 class="mb-3 font-medium text-green-400">With Recomputation</h5>
					<div class="font-mono text-[var(--text-tiny)]">
						<pre class="text-[var(--color-text)]">
Forward pass:
  Layer 1 → Layer 2 → Layer 3 → ...
  <span class="text-green-400">Only save checkpoints every N layers</span>

Backward pass:
  <span class="text-green-400">Recompute activations from checkpoint</span>
  Then compute gradients

<span class="text-[var(--color-muted)]">Memory: O(sqrt(num_layers) × ...)</span>
<span class="text-green-400">Trade: ~33% more compute for ~3× less memory</span>
						</pre>
					</div>
				</div>
			</div>
		</ContentBox>
	</Section>

	<!-- 4. Avoid Branches -->
	<Section title="4. Avoid Divergent Branches" titleColor="#fbbf24">
		<ContentBox variant="dark" class="border-l-4 border-amber-500">
			<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
				When threads in a warp take different branches, execution serializes. Both paths run, with
				inactive threads masked off—worst case is 50% throughput.
			</p>
		</ContentBox>

		<ContentBox variant="dark" class="mt-4">
			<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<div class="rounded border border-red-500/30 bg-[var(--color-bg)] p-4">
					<h5 class="mb-3 font-medium text-red-400">Divergent (Bad)</h5>
					<p class="mb-2 text-[var(--color-muted)] text-[var(--text-tiny)]">
						threadIdx varies per-thread, splitting the warp
					</p>
					<div class="font-mono text-[var(--text-tiny)]">
						<pre class="text-[var(--color-text)]">
<span class="text-red-400">if (threadIdx.x % 2 == 0)</span> {'{'}
    // Even threads: 16 active
    result = expensive_func_A();
} else {'{'}
    // Odd threads: 16 active
    result = expensive_func_B();
}

<span class="text-[var(--color-muted)]">Both paths execute serially</span>
<span class="text-red-400">→ 2× slower than uniform</span>
						</pre>
					</div>
				</div>

				<div class="rounded border border-green-500/30 bg-[var(--color-bg)] p-4">
					<h5 class="mb-3 font-medium text-green-400">Uniform (Good)</h5>
					<p class="mb-2 text-[var(--color-muted)] text-[var(--text-tiny)]">
						blockIdx is same for all threads in a block
					</p>
					<div class="font-mono text-[var(--text-tiny)]">
						<pre class="text-[var(--color-text)]">
<span class="text-green-400">if (blockIdx.x % 2 == 0)</span> {'{'}
    // All threads in block take same path
    result = expensive_func_A();
} else {'{'}
    // Or all threads take this path
    result = expensive_func_B();
}

<span class="text-[var(--color-muted)]">Only one path executes</span>
<span class="text-green-400">→ Full throughput</span>
						</pre>
					</div>
				</div>
			</div>
		</ContentBox>
	</Section>

	<KeyTakeaway
		items={[
			'Lower precision (BF16/FP8) doubles effective bandwidth for free',
			'Operator fusion reduces memory round-trips—combine ops into single kernel',
			'Recomputation trades compute for memory—essential for large models',
			'Avoid warp divergence—uniform control flow within warps'
		]}
	/>
</div>
