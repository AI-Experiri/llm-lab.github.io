<!-- ABOUTME: Systems page for LLM Inference covering batching and memory management -->
<!-- ABOUTME: Covers continuous batching, PagedAttention, vLLM optimizations -->

<script>
	import { HeroSection, Section, ContentBox, KeyTakeaway, ProsConsCard } from '$lib/shared';

	// Batching comparison
	const batchingTypes = [
		{
			name: 'Static Batching',
			description: 'Wait for batch to fill, process together, return all at once',
			pros: ['Simple implementation', 'Predictable latency'],
			cons: ['Wasted compute on short sequences', 'High latency for fast requests']
		},
		{
			name: 'Continuous Batching',
			description: 'Add/remove requests at each iteration, never wait',
			pros: ['Better throughput', 'Lower latency', 'Higher GPU utilization'],
			cons: ['Complex scheduling', 'Variable batch composition']
		}
	];

	// Memory fragmentation types
	const fragmentationTypes = [
		{
			type: 'Internal Fragmentation',
			description: 'Pre-allocate max_seq_len for each request',
			problem: 'Most sequences shorter than max, wasted space',
			example: 'Allocate 4K tokens, use only 500 → 87.5% waste'
		},
		{
			type: 'External Fragmentation',
			description: 'Free blocks scattered across memory',
			problem: "Can't allocate contiguous space even if total free > needed",
			example: "100 free slots in 10 blocks, can't fit 15 contiguous"
		}
	];

	// PagedAttention benefits
	const pagedBenefits = [
		{
			benefit: 'No internal fragmentation',
			description: 'Allocate exact blocks needed',
			impact: '~3x memory efficiency'
		},
		{
			benefit: 'No external fragmentation',
			description: 'Non-contiguous blocks are fine',
			impact: 'Higher batch sizes'
		},
		{
			benefit: 'KV cache sharing',
			description: 'System prompts, beam search',
			impact: '~2x for shared prompts'
		},
		{ benefit: 'Copy-on-write', description: 'Share until modified', impact: 'Efficient forking' }
	];

	// vLLM optimizations
	const vllmOptimizations = [
		{
			name: 'Paged Attention',
			description: 'OS-style virtual memory for KV cache',
			category: 'Memory'
		},
		{
			name: 'Continuous Batching',
			description: 'Dynamic request scheduling',
			category: 'Scheduling'
		},
		{
			name: 'Fused Kernels',
			description: 'Combine operations to reduce memory traffic',
			category: 'Compute'
		},
		{ name: 'CUDA Graphs', description: 'Pre-compile GPU execution graph', category: 'Compute' },
		{ name: 'FlashAttention', description: 'IO-aware attention algorithm', category: 'Compute' },
		{ name: 'Speculative Decoding', description: 'Draft-verify parallelism', category: 'Algorithm' }
	];

	// Performance comparison
	const performanceNumbers = [
		{ system: 'Naive Implementation', throughput: '1x', latency: 'High', memory: 'Poor' },
		{ system: 'Static Batching', throughput: '4x', latency: 'Medium', memory: 'Poor' },
		{ system: 'Continuous Batching', throughput: '8x', latency: 'Low', memory: 'Poor' },
		{ system: 'vLLM (PagedAttn)', throughput: '24x', latency: 'Low', memory: 'Excellent' }
	];
</script>

<div class="space-y-6">
	<HeroSection title="Systems Optimizations: Batching & Memory">
		<p class="max-w-3xl leading-relaxed text-[var(--color-muted)] text-[var(--text-body)]">
			Even with perfect algorithms, naive implementations waste resources.
			<span class="font-semibold text-blue-400">Continuous batching</span> and
			<span class="font-semibold text-blue-400">paged attention</span> provide
			<span class="font-semibold text-blue-400">24x throughput improvement</span> through careful systems
			engineering.
		</p>
		<div class="mt-4 flex flex-wrap gap-3">
			<span
				class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-[var(--text-small)] text-blue-400"
			>
				vLLM: PagedAttention
			</span>
			<span
				class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-[var(--text-small)] text-blue-400"
			>
				Continuous Batching
			</span>
			<span
				class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-[var(--color-accent)] text-[var(--text-small)]"
			>
				FlashAttention
			</span>
		</div>
	</HeroSection>

	<!-- The Batching Problem -->
	<Section title="The Batching Problem">
		<p class="mb-6 text-[var(--color-muted)] text-[var(--text-small)]">
			Training operates on dense, rectangular batches. Inference is fundamentally different:
			requests arrive continuously, have varying lengths, and finish at different times.
		</p>

		<div class="grid gap-6 md:grid-cols-2">
			<ContentBox variant="dark" class="border border-red-500/30">
				<h3 class="mb-3 font-bold text-red-400">Training Batches</h3>
				<div class="space-y-3 text-[var(--color-muted)] text-[var(--text-small)]">
					<p>Fixed batch size, fixed sequence length:</p>
					<div class="rounded bg-[var(--color-secondary)] p-3 font-mono text-[var(--text-tiny)]">
						<div class="text-[var(--color-accent)]"># Dense rectangular tensor</div>
						<div>batch = [B, S, H]</div>
						<div>all_same_length = True</div>
						<div>all_start_together = True</div>
					</div>
				</div>
			</ContentBox>

			<ContentBox variant="dark" class="border border-amber-500/30">
				<h3 class="mb-3 font-bold text-amber-400">Inference Reality</h3>
				<div class="space-y-3 text-[var(--color-muted)] text-[var(--text-small)]">
					<p>Ragged arrays, continuous arrival:</p>
					<div class="rounded bg-[var(--color-secondary)] p-3 font-mono text-[var(--text-tiny)]">
						<div class="text-[var(--color-accent)]"># Ragged sequences</div>
						<div>req1: [100 tokens] → done</div>
						<div>req2: [500 tokens] → generating...</div>
						<div>req3: [50 tokens] → just arrived</div>
					</div>
				</div>
			</ContentBox>
		</div>
	</Section>

	<!-- Static vs Continuous Batching -->
	<Section title="Static vs Continuous Batching">
		<div class="grid gap-4 md:grid-cols-2">
			{#each batchingTypes as type (type.name)}
				<ProsConsCard
					title={type.name}
					description={type.description}
					pros={type.pros}
					cons={type.cons}
				/>
			{/each}
		</div>

		<!-- Continuous Batching Visualization -->
		<ContentBox variant="dark" class="mt-6">
			<h3 class="mb-4 font-bold text-[var(--color-primary)]">Iteration-Level Scheduling</h3>
			<div class="space-y-3">
				<div class="flex items-center gap-2">
					<span class="w-20 text-[var(--color-muted)] text-[var(--text-tiny)]">Iter 1:</span>
					<div class="flex gap-1">
						<span class="rounded bg-blue-500/30 px-2 py-1 text-[var(--text-tiny)]">A</span>
						<span class="rounded bg-green-500/30 px-2 py-1 text-[var(--text-tiny)]">B</span>
						<span class="rounded bg-purple-500/30 px-2 py-1 text-[var(--text-tiny)]">C</span>
					</div>
				</div>
				<div class="flex items-center gap-2">
					<span class="w-20 text-[var(--color-muted)] text-[var(--text-tiny)]">Iter 2:</span>
					<div class="flex gap-1">
						<span class="rounded bg-blue-500/30 px-2 py-1 text-[var(--text-tiny)]">A</span>
						<span class="rounded bg-green-500/30 px-2 py-1 text-[var(--text-tiny)]">B ✓</span>
						<span class="rounded bg-purple-500/30 px-2 py-1 text-[var(--text-tiny)]">C</span>
						<span class="rounded bg-amber-500/30 px-2 py-1 text-[var(--text-tiny)]">D (new)</span>
					</div>
				</div>
				<div class="flex items-center gap-2">
					<span class="w-20 text-[var(--color-muted)] text-[var(--text-tiny)]">Iter 3:</span>
					<div class="flex gap-1">
						<span class="rounded bg-blue-500/30 px-2 py-1 text-[var(--text-tiny)]">A</span>
						<span class="rounded bg-purple-500/30 px-2 py-1 text-[var(--text-tiny)]">C ✓</span>
						<span class="rounded bg-amber-500/30 px-2 py-1 text-[var(--text-tiny)]">D</span>
						<span class="rounded bg-pink-500/30 px-2 py-1 text-[var(--text-tiny)]">E (new)</span>
					</div>
				</div>
			</div>
			<p class="mt-3 text-[var(--color-muted)] text-[var(--text-tiny)]">
				Requests join and leave the batch dynamically. No waiting for the slowest request.
			</p>
		</ContentBox>
	</Section>

	<!-- Memory Fragmentation -->
	<Section title="The Memory Fragmentation Problem">
		<p class="mb-6 text-[var(--color-muted)] text-[var(--text-small)]">
			Traditional KV cache allocation wastes memory through fragmentation, limiting batch sizes.
		</p>

		<div class="grid gap-6 md:grid-cols-2">
			{#each fragmentationTypes as frag (frag.type)}
				<ContentBox variant="dark" class="border border-red-500/30">
					<h3 class="mb-3 font-bold text-red-400">{frag.type}</h3>
					<p class="mb-2 text-[var(--color-muted)] text-[var(--text-small)]">{frag.description}</p>
					<p class="mb-2 text-[var(--color-text)] text-[var(--text-small)]">
						<strong>Problem:</strong>
						{frag.problem}
					</p>
					<div
						class="rounded bg-[var(--color-secondary)] p-2 text-[var(--color-muted)] text-[var(--text-tiny)]"
					>
						<strong>Example:</strong>
						{frag.example}
					</div>
				</ContentBox>
			{/each}
		</div>
	</Section>

	<!-- PagedAttention Header -->
	<HeroSection title="PagedAttention: OS-Inspired Memory Management">
		<p class="max-w-3xl leading-relaxed text-[var(--color-muted)] text-[var(--text-body)]">
			Inspired by virtual memory in operating systems, PagedAttention divides the KV cache into
			fixed-size blocks that <span class="font-semibold text-emerald-400"
				>don't need to be contiguous</span
			>. A page table maps logical to physical blocks, eliminating fragmentation.
		</p>
	</HeroSection>

	<!-- How PagedAttention Works -->
	<Section title="How PagedAttention Works">
		<div class="grid gap-6 md:grid-cols-2">
			<ContentBox variant="dark">
				<h3 class="mb-3 font-semibold text-[var(--color-primary)]">Traditional Allocation</h3>
				<div class="space-y-2 font-mono text-[var(--text-tiny)]">
					<div class="text-[var(--color-accent)]"># Pre-allocate max_seq_len</div>
					<div>kv_cache = allocate(max_seq_len)</div>
					<div class="text-red-400"># If actual_len &lt;&lt; max_seq_len</div>
					<div class="text-red-400"># Wasted memory!</div>
					<div class="mt-2 text-[var(--color-muted)]"># Plus: must be contiguous</div>
				</div>
			</ContentBox>

			<ContentBox variant="dark">
				<h3 class="mb-3 font-semibold text-[var(--color-primary)]">Paged Allocation</h3>
				<div class="space-y-2 font-mono text-[var(--text-tiny)]">
					<div class="text-[var(--color-accent)]"># Allocate blocks on demand</div>
					<div>block_size = 16 tokens</div>
					<div>blocks = allocate_blocks(as_needed)</div>
					<div class="text-emerald-400"># Non-contiguous OK</div>
					<div class="text-emerald-400"># No wasted memory!</div>
					<div class="mt-2 text-[var(--color-muted)]"># Page table maps logical → physical</div>
				</div>
			</ContentBox>
		</div>

		<!-- Memory Layout Visualization -->
		<ContentBox variant="dark" class="mt-6">
			<h3 class="mb-4 font-semibold text-[var(--color-primary)]">Memory Layout Comparison</h3>
			<div class="grid gap-6 md:grid-cols-2">
				<div>
					<div class="mb-2 text-[var(--color-muted)] text-[var(--text-small)]">
						Traditional (contiguous):
					</div>
					<div class="flex gap-1">
						<div
							class="flex h-8 w-8 items-center justify-center rounded bg-blue-500/50 text-[var(--text-tiny)]"
						>
							A
						</div>
						<div
							class="flex h-8 w-8 items-center justify-center rounded bg-blue-500/50 text-[var(--text-tiny)]"
						>
							A
						</div>
						<div
							class="flex h-8 w-8 items-center justify-center rounded bg-blue-500/30 text-[var(--color-muted)] text-[var(--text-tiny)]"
						>
							-
						</div>
						<div
							class="flex h-8 w-8 items-center justify-center rounded bg-blue-500/30 text-[var(--color-muted)] text-[var(--text-tiny)]"
						>
							-
						</div>
						<div
							class="flex h-8 w-8 items-center justify-center rounded bg-green-500/50 text-[var(--text-tiny)]"
						>
							B
						</div>
						<div
							class="flex h-8 w-8 items-center justify-center rounded bg-green-500/30 text-[var(--color-muted)] text-[var(--text-tiny)]"
						>
							-
						</div>
						<div
							class="flex h-8 w-8 items-center justify-center rounded bg-green-500/30 text-[var(--color-muted)] text-[var(--text-tiny)]"
						>
							-
						</div>
						<div
							class="flex h-8 w-8 items-center justify-center rounded bg-green-500/30 text-[var(--color-muted)] text-[var(--text-tiny)]"
						>
							-
						</div>
					</div>
					<div class="mt-1 text-[var(--text-tiny)] text-red-400">
						50% wasted (pre-allocated but unused)
					</div>
				</div>
				<div>
					<div class="mb-2 text-[var(--color-muted)] text-[var(--text-small)]">
						Paged (non-contiguous):
					</div>
					<div class="flex gap-1">
						<div
							class="flex h-8 w-8 items-center justify-center rounded bg-blue-500/50 text-[var(--text-tiny)]"
						>
							A
						</div>
						<div
							class="flex h-8 w-8 items-center justify-center rounded bg-green-500/50 text-[var(--text-tiny)]"
						>
							B
						</div>
						<div
							class="flex h-8 w-8 items-center justify-center rounded bg-blue-500/50 text-[var(--text-tiny)]"
						>
							A
						</div>
						<div
							class="flex h-8 w-8 items-center justify-center rounded bg-purple-500/50 text-[var(--text-tiny)]"
						>
							C
						</div>
						<div
							class="flex h-8 w-8 items-center justify-center rounded bg-amber-500/50 text-[var(--text-tiny)]"
						>
							D
						</div>
						<div
							class="flex h-8 w-8 items-center justify-center rounded bg-[var(--color-secondary)] text-[var(--color-muted)] text-[var(--text-tiny)]"
						>
							free
						</div>
						<div
							class="flex h-8 w-8 items-center justify-center rounded bg-[var(--color-secondary)] text-[var(--color-muted)] text-[var(--text-tiny)]"
						>
							free
						</div>
						<div
							class="flex h-8 w-8 items-center justify-center rounded bg-[var(--color-secondary)] text-[var(--color-muted)] text-[var(--text-tiny)]"
						>
							free
						</div>
					</div>
					<div class="mt-1 text-[var(--text-tiny)] text-emerald-400">
						~100% utilized (allocate only what's needed)
					</div>
				</div>
			</div>
		</ContentBox>
	</Section>

	<!-- PagedAttention Benefits -->
	<Section title="PagedAttention Benefits">
		<div class="grid gap-4 md:grid-cols-2">
			{#each pagedBenefits as benefit (benefit.benefit)}
				<ContentBox variant="dark">
					<div class="mb-2 flex items-start justify-between">
						<h3 class="font-bold text-[var(--color-primary)]">{benefit.benefit}</h3>
						<span
							class="rounded bg-emerald-500/20 px-2 py-0.5 text-[var(--text-tiny)] text-emerald-400"
							>{benefit.impact}</span
						>
					</div>
					<p class="text-[var(--color-muted)] text-[var(--text-small)]">{benefit.description}</p>
				</ContentBox>
			{/each}
		</div>
	</Section>

	<!-- KV Cache Sharing -->
	<Section title="KV Cache Sharing">
		<p class="mb-6 text-[var(--color-muted)] text-[var(--text-small)]">
			PagedAttention enables efficient sharing of KV cache across requests.
		</p>

		<div class="grid gap-4 md:grid-cols-3">
			<ContentBox variant="dark">
				<h3 class="mb-3 font-bold text-[var(--color-primary)]">System Prompts</h3>
				<p class="mb-3 text-[var(--color-muted)] text-[var(--text-small)]">
					Same system prompt across all requests can share KV cache.
				</p>
				<div class="text-[var(--color-accent)] text-[var(--text-tiny)]">
					100 requests × 1000 token prompt → share 1 copy
				</div>
			</ContentBox>

			<ContentBox variant="dark">
				<h3 class="mb-3 font-bold text-[var(--color-primary)]">Parallel Sampling</h3>
				<p class="mb-3 text-[var(--color-muted)] text-[var(--text-small)]">
					Multiple samples from same prompt share the prompt's KV cache.
				</p>
				<div class="text-[var(--color-accent)] text-[var(--text-tiny)]">
					5 samples per prompt → 5x memory savings on prompt
				</div>
			</ContentBox>

			<ContentBox variant="dark">
				<h3 class="mb-3 font-bold text-[var(--color-primary)]">Beam Search</h3>
				<p class="mb-3 text-[var(--color-muted)] text-[var(--text-small)]">
					Beams share prefix KV cache, copy-on-write when they diverge.
				</p>
				<div class="text-[var(--color-accent)] text-[var(--text-tiny)]">
					Beam width 5 → share most of KV cache
				</div>
			</ContentBox>
		</div>
	</Section>

	<!-- vLLM Optimizations -->
	<Section title="vLLM: Full Optimization Stack">
		<p class="mb-6 text-[var(--color-muted)] text-[var(--text-small)]">
			vLLM combines multiple optimizations for production-grade inference serving.
		</p>

		<div class="grid gap-3 md:grid-cols-3">
			{#each vllmOptimizations as opt (opt.name)}
				<ContentBox variant="dark">
					<div class="mb-2 flex items-center justify-between">
						<h3 class="font-bold text-[var(--color-primary)] text-[var(--text-small)]">
							{opt.name}
						</h3>
						<span
							class="rounded bg-[var(--color-secondary)] px-2 py-0.5 text-[var(--color-accent)] text-[var(--text-tiny)]"
							>{opt.category}</span
						>
					</div>
					<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">{opt.description}</p>
				</ContentBox>
			{/each}
		</div>
	</Section>

	<!-- FlashAttention & CUDA Graphs -->
	<Section title="Compute Optimizations">
		<div class="grid gap-6 md:grid-cols-2">
			<ContentBox variant="dark">
				<h3 class="mb-3 font-bold text-[var(--color-primary)]">FlashAttention</h3>
				<p class="mb-3 text-[var(--color-muted)] text-[var(--text-small)]">
					IO-aware exact attention that reduces memory traffic through tiling.
				</p>
				<ul class="space-y-2 text-[var(--color-muted)] text-[var(--text-tiny)]">
					<li class="flex items-start gap-2">
						<span class="text-emerald-400">+</span>
						<span>Computes attention in tiles that fit in SRAM</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-emerald-400">+</span>
						<span>Never materializes full attention matrix</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-emerald-400">+</span>
						<span>2-4x faster than naive implementation</span>
					</li>
				</ul>
				<div class="mt-3 rounded bg-[var(--color-secondary)] p-2 text-[var(--text-tiny)]">
					<span class="text-[var(--color-accent)]">FlashDecoding:</span> Optimized for generation (short
					query)
				</div>
			</ContentBox>

			<ContentBox variant="dark">
				<h3 class="mb-3 font-bold text-[var(--color-primary)]">CUDA Graphs</h3>
				<p class="mb-3 text-[var(--color-muted)] text-[var(--text-small)]">
					Pre-compile the entire forward pass into a single GPU execution graph.
				</p>
				<ul class="space-y-2 text-[var(--color-muted)] text-[var(--text-tiny)]">
					<li class="flex items-start gap-2">
						<span class="text-emerald-400">+</span>
						<span>Eliminates CPU-GPU launch overhead</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-emerald-400">+</span>
						<span>Single kernel launch for entire forward pass</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-amber-400">-</span>
						<span>Fixed shapes (need multiple graphs)</span>
					</li>
				</ul>
				<div class="mt-3 rounded bg-[var(--color-secondary)] p-2 text-[var(--text-tiny)]">
					<span class="text-[var(--color-accent)]">Impact:</span> Significant for small batch sizes where
					launch overhead dominates
				</div>
			</ContentBox>
		</div>
	</Section>

	<!-- Performance Comparison -->
	<Section title="Performance Comparison">
		<div class="overflow-x-auto">
			<table class="w-full text-[var(--text-small)]">
				<thead>
					<tr class="border-b border-[var(--color-muted)]/20 text-left text-[var(--color-muted)]">
						<th class="pr-4 pb-3">System</th>
						<th class="pr-4 pb-3">Throughput</th>
						<th class="pr-4 pb-3">Latency</th>
						<th class="pb-3">Memory Efficiency</th>
					</tr>
				</thead>
				<tbody>
					{#each performanceNumbers as perf (perf.system)}
						<tr class="border-b border-[var(--color-muted)]/10">
							<td class="py-3 pr-4 text-[var(--color-text)]">{perf.system}</td>
							<td class="py-3 pr-4 font-mono text-emerald-400">{perf.throughput}</td>
							<td
								class="py-3 pr-4 {perf.latency === 'Low'
									? 'text-emerald-400'
									: perf.latency === 'Medium'
										? 'text-amber-400'
										: 'text-red-400'}">{perf.latency}</td
							>
							<td class="py-3 {perf.memory === 'Excellent' ? 'text-emerald-400' : 'text-red-400'}"
								>{perf.memory}</td
							>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<KeyTakeaway title="vLLM achievement" class="mt-4">
			<p>
				vLLM achieves <span class="font-semibold text-emerald-400">24x throughput</span> over naive implementation
				through the combination of continuous batching, paged attention, and fused kernels.
			</p>
		</KeyTakeaway>
	</Section>

	<!-- Key Takeaways -->
	<div
		class="rounded-xl border border-blue-600/20 bg-gradient-to-br from-blue-600/10 to-[var(--color-primary)]/10 p-6"
	>
		<h2 class="mb-4 text-xl font-bold text-[var(--color-text)]">Key Takeaways</h2>
		<div class="grid gap-4 sm:grid-cols-2">
			<div class="flex items-start gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 font-bold text-[var(--text-small)] text-blue-400"
				>
					1
				</div>
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">
					<span class="font-semibold text-[var(--color-text)]"
						>Continuous batching is essential.</span
					>
					Dynamic request scheduling prevents head-of-line blocking and maximizes GPU utilization.
				</p>
			</div>
			<div class="flex items-start gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 font-bold text-[var(--text-small)] text-blue-400"
				>
					2
				</div>
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">
					<span class="font-semibold text-[var(--color-text)]"
						>PagedAttention eliminates fragmentation.</span
					>
					OS-style virtual memory for KV cache enables ~3x memory efficiency.
				</p>
			</div>
			<div class="flex items-start gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 font-bold text-[var(--text-small)] text-blue-400"
				>
					3
				</div>
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">
					<span class="font-semibold text-[var(--color-text)]">KV cache sharing is powerful.</span>
					System prompts, parallel sampling, and beam search benefit from copy-on-write.
				</p>
			</div>
			<div class="flex items-start gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 font-bold text-[var(--text-small)] text-blue-400"
				>
					4
				</div>
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">
					<span class="font-semibold text-[var(--color-text)]"
						>Stack all optimizations together.</span
					>
					vLLM combines batching, paging, FlashAttention, and CUDA graphs for 24x throughput.
				</p>
			</div>
		</div>
	</div>
</div>
