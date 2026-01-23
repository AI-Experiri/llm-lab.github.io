<script>
	// Batching comparison
	const batchingTypes = [
		{
			name: 'Static Batching',
			description: 'Wait for batch to fill, process together, return all at once',
			pros: ['Simple implementation', 'Predictable latency'],
			cons: ['Wasted compute on short sequences', 'High latency for fast requests'],
			icon: '📦'
		},
		{
			name: 'Continuous Batching',
			description: 'Add/remove requests at each iteration, never wait',
			pros: ['Better throughput', 'Lower latency', 'Higher GPU utilization'],
			cons: ['Complex scheduling', 'Variable batch composition'],
			icon: '🔄'
		}
	];

	// Memory fragmentation types
	const fragmentationTypes = [
		{
			type: 'Internal Fragmentation',
			description: 'Pre-allocate max_seq_len for each request',
			problem: 'Most sequences shorter than max, wasted space',
			example: 'Allocate 4K tokens, use only 500 → 87.5% waste',
			icon: '📊'
		},
		{
			type: 'External Fragmentation',
			description: 'Free blocks scattered across memory',
			problem: "Can't allocate contiguous space even if total free > needed",
			example: "100 free slots in 10 blocks, can't fit 15 contiguous",
			icon: '🧩'
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
	<!-- Hero Section -->
	<div
		class="rounded-2xl border border-blue-600/30 bg-gradient-to-br from-blue-600/20 to-[var(--color-primary)]/20 p-8"
	>
		<div class="flex items-start gap-4">
			<div class="text-5xl">⚙️</div>
			<div>
				<h2 class="mb-3 text-2xl font-bold text-[var(--color-text)] md:text-3xl">
					Systems Optimizations: Batching & Memory
				</h2>
				<p class="max-w-3xl text-lg leading-relaxed text-[var(--color-muted)]">
					Even with perfect algorithms, naive implementations waste resources.
					<span class="font-semibold text-blue-400">Continuous batching</span> and
					<span class="font-semibold text-blue-400">paged attention</span> provide
					<span class="font-semibold text-blue-400">24x throughput improvement</span> through careful
					systems engineering.
				</p>
				<div class="mt-4 flex flex-wrap gap-3">
					<span class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-sm text-blue-400">
						vLLM: PagedAttention
					</span>
					<span class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-sm text-blue-400">
						Continuous Batching
					</span>
					<span
						class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-sm text-[var(--color-accent)]"
					>
						FlashAttention
					</span>
				</div>
			</div>
		</div>
	</div>

	<!-- The Batching Problem -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>📦</span> The Batching Problem
		</h2>
		<p class="mb-6 text-[var(--color-muted)]">
			Training operates on dense, rectangular batches. Inference is fundamentally different:
			requests arrive continuously, have varying lengths, and finish at different times.
		</p>

		<div class="grid gap-6 md:grid-cols-2">
			<div class="rounded-lg border border-red-500/30 bg-[var(--color-bg)] p-5">
				<h3 class="mb-3 flex items-center gap-2 font-bold text-red-400">
					<span>❌</span> Training Batches
				</h3>
				<div class="space-y-3 text-sm text-[var(--color-muted)]">
					<p>Fixed batch size, fixed sequence length:</p>
					<div class="rounded bg-[var(--color-secondary)] p-3 font-mono text-xs">
						<div class="text-[var(--color-accent)]"># Dense rectangular tensor</div>
						<div>batch = [B, S, H]</div>
						<div>all_same_length = True</div>
						<div>all_start_together = True</div>
					</div>
				</div>
			</div>

			<div class="rounded-lg border border-amber-500/30 bg-[var(--color-bg)] p-5">
				<h3 class="mb-3 flex items-center gap-2 font-bold text-amber-400">
					<span>⚠️</span> Inference Reality
				</h3>
				<div class="space-y-3 text-sm text-[var(--color-muted)]">
					<p>Ragged arrays, continuous arrival:</p>
					<div class="rounded bg-[var(--color-secondary)] p-3 font-mono text-xs">
						<div class="text-[var(--color-accent)]"># Ragged sequences</div>
						<div>req1: [100 tokens] → done</div>
						<div>req2: [500 tokens] → generating...</div>
						<div>req3: [50 tokens] → just arrived</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Static vs Continuous Batching -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>🔄</span> Static vs Continuous Batching
		</h2>

		<div class="grid gap-6 md:grid-cols-2">
			{#each batchingTypes as type (type.name)}
				<div class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-5">
					<div class="mb-3 flex items-center gap-3">
						<span class="text-2xl">{type.icon}</span>
						<h3 class="font-bold text-[var(--color-text)]">{type.name}</h3>
					</div>
					<p class="mb-4 text-sm text-[var(--color-muted)]">{type.description}</p>
					<div class="grid grid-cols-2 gap-3">
						<div>
							<span class="text-xs font-semibold text-green-400">Pros</span>
							<ul class="mt-1 space-y-0.5 text-xs text-[var(--color-muted)]">
								{#each type.pros as pro, i (i)}
									<li class="flex items-start gap-1">
										<span class="text-green-400">+</span>
										{pro}
									</li>
								{/each}
							</ul>
						</div>
						<div>
							<span class="text-xs font-semibold text-amber-400">Cons</span>
							<ul class="mt-1 space-y-0.5 text-xs text-[var(--color-muted)]">
								{#each type.cons as con, i (i)}
									<li class="flex items-start gap-1">
										<span class="text-amber-400">-</span>
										{con}
									</li>
								{/each}
							</ul>
						</div>
					</div>
				</div>
			{/each}
		</div>

		<!-- Continuous Batching Visualization -->
		<div class="mt-6 rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-5">
			<h3 class="mb-4 font-bold text-[var(--color-text)]">Iteration-Level Scheduling</h3>
			<div class="space-y-3">
				<div class="flex items-center gap-2">
					<span class="w-20 text-xs text-[var(--color-muted)]">Iter 1:</span>
					<div class="flex gap-1">
						<span class="rounded bg-blue-500/30 px-2 py-1 text-xs">A</span>
						<span class="rounded bg-green-500/30 px-2 py-1 text-xs">B</span>
						<span class="rounded bg-purple-500/30 px-2 py-1 text-xs">C</span>
					</div>
				</div>
				<div class="flex items-center gap-2">
					<span class="w-20 text-xs text-[var(--color-muted)]">Iter 2:</span>
					<div class="flex gap-1">
						<span class="rounded bg-blue-500/30 px-2 py-1 text-xs">A</span>
						<span class="rounded bg-green-500/30 px-2 py-1 text-xs">B ✓</span>
						<span class="rounded bg-purple-500/30 px-2 py-1 text-xs">C</span>
						<span class="rounded bg-amber-500/30 px-2 py-1 text-xs">D (new)</span>
					</div>
				</div>
				<div class="flex items-center gap-2">
					<span class="w-20 text-xs text-[var(--color-muted)]">Iter 3:</span>
					<div class="flex gap-1">
						<span class="rounded bg-blue-500/30 px-2 py-1 text-xs">A</span>
						<span class="rounded bg-purple-500/30 px-2 py-1 text-xs">C ✓</span>
						<span class="rounded bg-amber-500/30 px-2 py-1 text-xs">D</span>
						<span class="rounded bg-pink-500/30 px-2 py-1 text-xs">E (new)</span>
					</div>
				</div>
			</div>
			<p class="mt-3 text-xs text-[var(--color-muted)]">
				Requests join and leave the batch dynamically. No waiting for the slowest request.
			</p>
		</div>
	</div>

	<!-- Memory Fragmentation -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>🧩</span> The Memory Fragmentation Problem
		</h2>
		<p class="mb-6 text-[var(--color-muted)]">
			Traditional KV cache allocation wastes memory through fragmentation, limiting batch sizes.
		</p>

		<div class="grid gap-6 md:grid-cols-2">
			{#each fragmentationTypes as frag (frag.type)}
				<div class="rounded-lg border border-red-500/30 bg-[var(--color-bg)] p-5">
					<div class="mb-3 flex items-center gap-3">
						<span class="text-2xl">{frag.icon}</span>
						<h3 class="font-bold text-red-400">{frag.type}</h3>
					</div>
					<p class="mb-2 text-sm text-[var(--color-muted)]">{frag.description}</p>
					<p class="mb-2 text-sm text-[var(--color-text)]">
						<strong>Problem:</strong>
						{frag.problem}
					</p>
					<div class="rounded bg-[var(--color-secondary)] p-2 text-xs text-[var(--color-muted)]">
						<strong>Example:</strong>
						{frag.example}
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- PagedAttention -->
	<div
		class="rounded-2xl border border-emerald-600/30 bg-gradient-to-br from-emerald-600/20 to-[var(--color-primary)]/20 p-8"
	>
		<div class="flex items-start gap-4">
			<div class="text-5xl">📄</div>
			<div>
				<h2 class="mb-3 text-2xl font-bold text-[var(--color-text)] md:text-3xl">
					PagedAttention: OS-Inspired Memory Management
				</h2>
				<p class="max-w-3xl text-lg leading-relaxed text-[var(--color-muted)]">
					Inspired by virtual memory in operating systems, PagedAttention divides the KV cache into
					fixed-size blocks that <span class="font-semibold text-emerald-400"
						>don't need to be contiguous</span
					>. A page table maps logical to physical blocks, eliminating fragmentation.
				</p>
			</div>
		</div>
	</div>

	<!-- How PagedAttention Works -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>🔧</span> How PagedAttention Works
		</h2>

		<div class="grid gap-6 md:grid-cols-2">
			<div>
				<h3 class="mb-3 font-semibold text-[var(--color-text)]">Traditional Allocation</h3>
				<div class="rounded-lg bg-[var(--color-bg)] p-4">
					<div class="space-y-2 font-mono text-xs">
						<div class="text-[var(--color-accent)]"># Pre-allocate max_seq_len</div>
						<div>kv_cache = allocate(max_seq_len)</div>
						<div class="text-red-400"># If actual_len &lt;&lt; max_seq_len</div>
						<div class="text-red-400"># Wasted memory!</div>
						<div class="mt-2 text-[var(--color-muted)]"># Plus: must be contiguous</div>
					</div>
				</div>
			</div>

			<div>
				<h3 class="mb-3 font-semibold text-[var(--color-text)]">Paged Allocation</h3>
				<div class="rounded-lg bg-[var(--color-bg)] p-4">
					<div class="space-y-2 font-mono text-xs">
						<div class="text-[var(--color-accent)]"># Allocate blocks on demand</div>
						<div>block_size = 16 tokens</div>
						<div>blocks = allocate_blocks(as_needed)</div>
						<div class="text-emerald-400"># Non-contiguous OK</div>
						<div class="text-emerald-400"># No wasted memory!</div>
						<div class="mt-2 text-[var(--color-muted)]"># Page table maps logical → physical</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Memory Layout Visualization -->
		<div class="mt-6 rounded-lg bg-[var(--color-bg)] p-5">
			<h3 class="mb-4 font-semibold text-[var(--color-text)]">Memory Layout Comparison</h3>
			<div class="grid gap-6 md:grid-cols-2">
				<div>
					<div class="mb-2 text-sm text-[var(--color-muted)]">Traditional (contiguous):</div>
					<div class="flex gap-1">
						<div class="flex h-8 w-8 items-center justify-center rounded bg-blue-500/50 text-xs">
							A
						</div>
						<div class="flex h-8 w-8 items-center justify-center rounded bg-blue-500/50 text-xs">
							A
						</div>
						<div
							class="flex h-8 w-8 items-center justify-center rounded bg-blue-500/30 text-xs text-[var(--color-muted)]"
						>
							-
						</div>
						<div
							class="flex h-8 w-8 items-center justify-center rounded bg-blue-500/30 text-xs text-[var(--color-muted)]"
						>
							-
						</div>
						<div class="flex h-8 w-8 items-center justify-center rounded bg-green-500/50 text-xs">
							B
						</div>
						<div
							class="flex h-8 w-8 items-center justify-center rounded bg-green-500/30 text-xs text-[var(--color-muted)]"
						>
							-
						</div>
						<div
							class="flex h-8 w-8 items-center justify-center rounded bg-green-500/30 text-xs text-[var(--color-muted)]"
						>
							-
						</div>
						<div
							class="flex h-8 w-8 items-center justify-center rounded bg-green-500/30 text-xs text-[var(--color-muted)]"
						>
							-
						</div>
					</div>
					<div class="mt-1 text-xs text-red-400">50% wasted (pre-allocated but unused)</div>
				</div>
				<div>
					<div class="mb-2 text-sm text-[var(--color-muted)]">Paged (non-contiguous):</div>
					<div class="flex gap-1">
						<div class="flex h-8 w-8 items-center justify-center rounded bg-blue-500/50 text-xs">
							A
						</div>
						<div class="flex h-8 w-8 items-center justify-center rounded bg-green-500/50 text-xs">
							B
						</div>
						<div class="flex h-8 w-8 items-center justify-center rounded bg-blue-500/50 text-xs">
							A
						</div>
						<div class="flex h-8 w-8 items-center justify-center rounded bg-purple-500/50 text-xs">
							C
						</div>
						<div class="flex h-8 w-8 items-center justify-center rounded bg-amber-500/50 text-xs">
							D
						</div>
						<div
							class="flex h-8 w-8 items-center justify-center rounded bg-[var(--color-secondary)] text-xs text-[var(--color-muted)]"
						>
							free
						</div>
						<div
							class="flex h-8 w-8 items-center justify-center rounded bg-[var(--color-secondary)] text-xs text-[var(--color-muted)]"
						>
							free
						</div>
						<div
							class="flex h-8 w-8 items-center justify-center rounded bg-[var(--color-secondary)] text-xs text-[var(--color-muted)]"
						>
							free
						</div>
					</div>
					<div class="mt-1 text-xs text-emerald-400">
						~100% utilized (allocate only what's needed)
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- PagedAttention Benefits -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>✨</span> PagedAttention Benefits
		</h2>

		<div class="grid gap-4 md:grid-cols-2">
			{#each pagedBenefits as benefit (benefit.benefit)}
				<div class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-4">
					<div class="mb-2 flex items-start justify-between">
						<h3 class="font-bold text-[var(--color-text)]">{benefit.benefit}</h3>
						<span class="rounded bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400"
							>{benefit.impact}</span
						>
					</div>
					<p class="text-sm text-[var(--color-muted)]">{benefit.description}</p>
				</div>
			{/each}
		</div>
	</div>

	<!-- KV Cache Sharing -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>🔗</span> KV Cache Sharing
		</h2>
		<p class="mb-6 text-[var(--color-muted)]">
			PagedAttention enables efficient sharing of KV cache across requests.
		</p>

		<div class="grid gap-4 md:grid-cols-3">
			<div class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-5">
				<h3 class="mb-3 font-bold text-[var(--color-text)]">System Prompts</h3>
				<p class="mb-3 text-sm text-[var(--color-muted)]">
					Same system prompt across all requests can share KV cache.
				</p>
				<div class="text-xs text-[var(--color-accent)]">
					100 requests × 1000 token prompt → share 1 copy
				</div>
			</div>

			<div class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-5">
				<h3 class="mb-3 font-bold text-[var(--color-text)]">Parallel Sampling</h3>
				<p class="mb-3 text-sm text-[var(--color-muted)]">
					Multiple samples from same prompt share the prompt's KV cache.
				</p>
				<div class="text-xs text-[var(--color-accent)]">
					5 samples per prompt → 5x memory savings on prompt
				</div>
			</div>

			<div class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-5">
				<h3 class="mb-3 font-bold text-[var(--color-text)]">Beam Search</h3>
				<p class="mb-3 text-sm text-[var(--color-muted)]">
					Beams share prefix KV cache, copy-on-write when they diverge.
				</p>
				<div class="text-xs text-[var(--color-accent)]">Beam width 5 → share most of KV cache</div>
			</div>
		</div>
	</div>

	<!-- vLLM Optimizations -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>🚀</span> vLLM: Full Optimization Stack
		</h2>
		<p class="mb-6 text-[var(--color-muted)]">
			vLLM combines multiple optimizations for production-grade inference serving.
		</p>

		<div class="grid gap-3 md:grid-cols-3">
			{#each vllmOptimizations as opt (opt.name)}
				<div class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-4">
					<div class="mb-2 flex items-center justify-between">
						<h3 class="text-sm font-bold text-[var(--color-text)]">{opt.name}</h3>
						<span
							class="rounded bg-[var(--color-secondary)] px-2 py-0.5 text-xs text-[var(--color-accent)]"
							>{opt.category}</span
						>
					</div>
					<p class="text-xs text-[var(--color-muted)]">{opt.description}</p>
				</div>
			{/each}
		</div>
	</div>

	<!-- FlashAttention & CUDA Graphs -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>⚡</span> Compute Optimizations
		</h2>

		<div class="grid gap-6 md:grid-cols-2">
			<div class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-5">
				<h3 class="mb-3 font-bold text-[var(--color-text)]">FlashAttention</h3>
				<p class="mb-3 text-sm text-[var(--color-muted)]">
					IO-aware exact attention that reduces memory traffic through tiling.
				</p>
				<ul class="space-y-2 text-xs text-[var(--color-muted)]">
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
				<div class="mt-3 rounded bg-[var(--color-secondary)] p-2 text-xs">
					<span class="text-[var(--color-accent)]">FlashDecoding:</span> Optimized for generation (short
					query)
				</div>
			</div>

			<div class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-5">
				<h3 class="mb-3 font-bold text-[var(--color-text)]">CUDA Graphs</h3>
				<p class="mb-3 text-sm text-[var(--color-muted)]">
					Pre-compile the entire forward pass into a single GPU execution graph.
				</p>
				<ul class="space-y-2 text-xs text-[var(--color-muted)]">
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
				<div class="mt-3 rounded bg-[var(--color-secondary)] p-2 text-xs">
					<span class="text-[var(--color-accent)]">Impact:</span> Significant for small batch sizes where
					launch overhead dominates
				</div>
			</div>
		</div>
	</div>

	<!-- Performance Comparison -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>📊</span> Performance Comparison
		</h2>

		<div class="overflow-x-auto">
			<table class="w-full text-sm">
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

		<div class="mt-4 rounded-lg border-l-4 border-emerald-500 bg-[var(--color-bg)] p-4">
			<p class="text-sm text-[var(--color-muted)]">
				<span class="font-semibold text-emerald-400">vLLM achieves 24x throughput</span> over naive implementation
				through the combination of continuous batching, paged attention, and fused kernels.
			</p>
		</div>
	</div>

	<!-- Key Takeaways -->
	<div
		class="rounded-xl border border-blue-600/20 bg-gradient-to-br from-blue-600/10 to-[var(--color-primary)]/10 p-6"
	>
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-text)]">
			<span>💡</span> Key Takeaways
		</h2>
		<div class="grid gap-4 sm:grid-cols-2">
			<div class="flex items-start gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-sm font-bold text-blue-400"
				>
					1
				</div>
				<p class="text-sm text-[var(--color-muted)]">
					<span class="font-semibold text-[var(--color-text)]"
						>Continuous batching is essential.</span
					>
					Dynamic request scheduling prevents head-of-line blocking and maximizes GPU utilization.
				</p>
			</div>
			<div class="flex items-start gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-sm font-bold text-blue-400"
				>
					2
				</div>
				<p class="text-sm text-[var(--color-muted)]">
					<span class="font-semibold text-[var(--color-text)]"
						>PagedAttention eliminates fragmentation.</span
					>
					OS-style virtual memory for KV cache enables ~3x memory efficiency.
				</p>
			</div>
			<div class="flex items-start gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-sm font-bold text-blue-400"
				>
					3
				</div>
				<p class="text-sm text-[var(--color-muted)]">
					<span class="font-semibold text-[var(--color-text)]">KV cache sharing is powerful.</span>
					System prompts, parallel sampling, and beam search benefit from copy-on-write.
				</p>
			</div>
			<div class="flex items-start gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-sm font-bold text-blue-400"
				>
					4
				</div>
				<p class="text-sm text-[var(--color-muted)]">
					<span class="font-semibold text-[var(--color-text)]"
						>Stack all optimizations together.</span
					>
					vLLM combines batching, paging, FlashAttention, and CUDA graphs for 24x throughput.
				</p>
			</div>
		</div>
	</div>
</div>
