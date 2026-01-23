<script>
	// Historical timeline of inference improvements
	const inferenceTimeline = [
		{
			year: '2017',
			name: 'Attention Is All You Need',
			contribution: 'Transformer architecture with Multi-Head Attention',
			tokens: 'Foundation',
			icon: '🔬',
			link: 'https://arxiv.org/abs/1706.03762'
		},
		{
			year: '2019',
			name: 'Grouped-Query Attention',
			contribution: 'Share KV heads across query heads to reduce KV cache',
			tokens: 'N/K reduction',
			icon: '🎯',
			link: 'https://arxiv.org/abs/1911.02150'
		},
		{
			year: '2020',
			name: 'GPT-3 / Scaling Laws',
			contribution: 'Established compute-optimal training, inference at scale',
			tokens: '175B params',
			icon: '📈',
			link: 'https://arxiv.org/abs/2005.14165'
		},
		{
			year: '2022',
			name: 'FlashAttention',
			contribution: 'IO-aware exact attention, tiling for memory efficiency',
			tokens: '2-4x speedup',
			icon: '⚡',
			link: 'https://arxiv.org/abs/2205.14135'
		},
		{
			year: '2023',
			name: 'LLM.int8()',
			contribution: 'Mixed-precision quantization with outlier handling',
			tokens: 'fp16→int8',
			icon: '🔢',
			link: 'https://arxiv.org/abs/2208.07339'
		},
		{
			year: '2023',
			name: 'Speculative Decoding',
			contribution: 'Use draft model to predict, verify in parallel',
			tokens: '2-3x speedup',
			icon: '🚀',
			link: 'https://arxiv.org/abs/2302.01318'
		},
		{
			year: '2023',
			name: 'vLLM / PagedAttention',
			contribution: 'OS-style paging for KV cache, continuous batching',
			tokens: '24x throughput',
			icon: '📄',
			link: 'https://arxiv.org/abs/2309.06180'
		},
		{
			year: '2024',
			name: 'Mamba / State Space',
			contribution: 'Linear-time sequence modeling as Transformer alternative',
			tokens: 'O(n) complexity',
			icon: '🐍',
			link: 'https://arxiv.org/abs/2312.00752'
		},
		{
			year: '2024',
			name: 'Multi-Head Latent Attention',
			contribution: 'Project KV to lower dimension (DeepSeek v2)',
			tokens: '32x reduction',
			icon: '🎭',
			link: 'https://arxiv.org/abs/2405.04434'
		},
		{
			year: '2024',
			name: 'EAGLE / Medusa',
			contribution: 'Multi-token speculative decoding with learned draft',
			tokens: '3x speedup',
			icon: '🦅',
			link: 'https://arxiv.org/abs/2401.15077'
		},
		{
			year: '2025',
			name: 'Diffusion LLMs',
			contribution: 'Parallel token generation via diffusion process',
			tokens: '10x faster coding',
			icon: '🌊',
			link: 'https://arxiv.org/abs/2502.09992'
		}
	];

	// Key metrics
	const keyMetrics = [
		{
			name: 'TTFT',
			fullName: 'Time to First Token',
			description: 'How long until the first token is generated',
			importance: 'Critical for interactive applications',
			icon: '⏱️'
		},
		{
			name: 'Latency',
			fullName: 'Seconds per Token',
			description: 'Time to generate each subsequent token',
			importance: 'Determines perceived speed',
			icon: '🏃'
		},
		{
			name: 'Throughput',
			fullName: 'Tokens per Second',
			description: 'Total tokens generated across all requests',
			importance: 'Determines serving cost',
			icon: '📊'
		}
	];

	// Inference contexts
	const inferenceContexts = [
		{ context: 'Chatbots & Assistants', desc: 'Interactive Q&A, code completion', icon: '💬' },
		{ context: 'Model Evaluation', desc: 'Running benchmarks, perplexity calculation', icon: '📋' },
		{ context: 'Test-Time Compute', desc: 'Chain-of-thought, self-consistency', icon: '🧠' },
		{ context: 'RL Training', desc: 'Sampling from policy during RLHF', icon: '🎮' }
	];

	// Arithmetic intensity analysis
	const arithmeticIntensity = [
		{
			operation: 'Matrix-Matrix (Training)',
			intensity: 'B*T (high)',
			bound: 'Compute-limited',
			color: 'green'
		},
		{
			operation: 'Matrix-Vector (Generation)',
			intensity: '~1 (low)',
			bound: 'Memory-limited',
			color: 'red'
		},
		{
			operation: 'MLP (batch B)',
			intensity: 'B*T',
			bound: 'Can improve with batching',
			color: 'yellow'
		},
		{
			operation: 'Attention (seq S)',
			intensity: 'S*T/(S+T)',
			bound: "Batching doesn't help",
			color: 'red'
		}
	];
</script>

<div class="space-y-6">
	<!-- Hero Section -->
	<div
		class="rounded-2xl border border-[var(--color-primary)]/30 bg-gradient-to-br from-[var(--color-primary)]/20 to-pink-600/20 p-8"
	>
		<div class="flex items-start gap-4">
			<div class="text-5xl">🚀</div>
			<div>
				<h2 class="mb-3 text-2xl font-bold text-[var(--color-text)] md:text-3xl">
					Why Inference Efficiency Matters
				</h2>
				<p class="max-w-3xl text-lg leading-relaxed text-[var(--color-muted)]">
					Training a model is a <span class="font-semibold text-[var(--color-primary)]"
						>one-time cost</span
					>. Inference happens
					<span class="font-semibold text-[var(--color-primary)]">every time</span> someone uses the model.
					A model trained once may be queried billions of times - making inference optimization critical
					for cost and latency.
				</p>
				<div class="mt-4 flex flex-wrap gap-3">
					<span
						class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-sm text-[var(--color-accent)]"
					>
						Training: Parallelizable
					</span>
					<span
						class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-sm text-[var(--color-accent)]"
					>
						Inference: Sequential
					</span>
					<span
						class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-sm text-[var(--color-accent)]"
					>
						Generation: Memory-Limited
					</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Inference Contexts -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>🎯</span> Where Inference Happens
		</h2>
		<p class="mb-6 text-[var(--color-muted)]">
			Inference isn't just chatbots - it appears throughout the ML pipeline in surprising places.
		</p>
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{#each inferenceContexts as ctx (ctx.context)}
				<div
					class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-4 transition-colors hover:border-[var(--color-primary)]/50"
				>
					<div class="mb-2 text-3xl">{ctx.icon}</div>
					<h3 class="mb-1 text-sm font-bold text-[var(--color-text)]">{ctx.context}</h3>
					<p class="text-xs text-[var(--color-muted)]">{ctx.desc}</p>
				</div>
			{/each}
		</div>
	</div>

	<!-- Key Metrics -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>📊</span> Key Performance Metrics
		</h2>
		<div class="grid gap-4 md:grid-cols-3">
			{#each keyMetrics as metric (metric.name)}
				<div
					class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-5 transition-colors hover:border-[var(--color-primary)]/50"
				>
					<div class="mb-3 flex items-center gap-3">
						<span class="text-3xl">{metric.icon}</span>
						<div>
							<h3 class="font-bold text-[var(--color-accent)]">{metric.name}</h3>
							<span class="text-xs text-[var(--color-muted)]">{metric.fullName}</span>
						</div>
					</div>
					<p class="mb-2 text-sm text-[var(--color-muted)]">{metric.description}</p>
					<div
						class="rounded bg-[var(--color-secondary)] px-2 py-1 text-xs text-[var(--color-text)]/70"
					>
						{metric.importance}
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Two Stages of Inference -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>🔄</span> Two Stages of Inference
		</h2>
		<p class="mb-6 text-[var(--color-muted)]">
			Inference has fundamentally different compute characteristics depending on the stage.
		</p>
		<div class="grid gap-6 md:grid-cols-2">
			<div class="rounded-lg border-2 border-green-500/30 bg-[var(--color-bg)] p-5">
				<div class="mb-3 flex items-center gap-3">
					<span class="text-3xl">📥</span>
					<div>
						<h3 class="font-bold text-green-400">Prefill Stage</h3>
						<span class="text-xs text-[var(--color-muted)]">Processing the prompt</span>
					</div>
				</div>
				<ul class="space-y-2 text-sm text-[var(--color-muted)]">
					<li class="flex items-start gap-2">
						<span class="text-green-400">+</span>
						<span
							>Process all prompt tokens <span class="text-[var(--color-text)]">in parallel</span
							></span
						>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-green-400">+</span>
						<span>Matrix-matrix multiplication (like training)</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-green-400">+</span>
						<span
							><span class="text-[var(--color-text)]">Compute-limited</span> - GPUs utilized well</span
						>
					</li>
				</ul>
				<div class="mt-3 rounded bg-[var(--color-secondary)] p-2 text-xs">
					<span class="text-[var(--color-accent)]">Arithmetic Intensity:</span> S/2 (high for long prompts)
				</div>
			</div>

			<div class="rounded-lg border-2 border-red-500/30 bg-[var(--color-bg)] p-5">
				<div class="mb-3 flex items-center gap-3">
					<span class="text-3xl">📤</span>
					<div>
						<h3 class="font-bold text-red-400">Generation Stage</h3>
						<span class="text-xs text-[var(--color-muted)]">Producing output tokens</span>
					</div>
				</div>
				<ul class="space-y-2 text-sm text-[var(--color-muted)]">
					<li class="flex items-start gap-2">
						<span class="text-red-400">-</span>
						<span>Generate tokens <span class="text-[var(--color-text)]">one at a time</span></span>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-red-400">-</span>
						<span>Matrix-vector multiplication (B=1)</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-red-400">-</span>
						<span
							><span class="text-[var(--color-text)]">Memory-limited</span> - GPU compute wasted</span
						>
					</li>
				</ul>
				<div class="mt-3 rounded bg-[var(--color-secondary)] p-2 text-xs">
					<span class="text-[var(--color-accent)]">Arithmetic Intensity:</span> &lt;1 (very low!)
				</div>
			</div>
		</div>
	</div>

	<!-- Arithmetic Intensity -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>⚡</span> Arithmetic Intensity Analysis
		</h2>
		<p class="mb-4 text-[var(--color-muted)]">
			H100 GPU has arithmetic intensity of <span class="font-mono text-[var(--color-accent)]"
				>295 FLOPs/byte</span
			>. Operations are compute-limited if intensity &gt; 295, memory-limited if &lt; 295.
		</p>

		<div class="mb-4 rounded-lg bg-[var(--color-bg)] p-4">
			<div class="mb-2 font-mono text-sm text-[var(--color-accent)]">
				Arithmetic Intensity = FLOPs / Memory Accesses
			</div>
			<p class="text-xs text-[var(--color-muted)]">
				For matrix multiplication W @ x: FLOPs = 2*m*n*k, Memory = (m*n + n*k + m*k) * bytes
			</p>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-[var(--color-muted)]/20 text-left text-[var(--color-muted)]">
						<th class="pr-4 pb-3">Operation</th>
						<th class="pr-4 pb-3">Intensity</th>
						<th class="pb-3">Bottleneck</th>
					</tr>
				</thead>
				<tbody>
					{#each arithmeticIntensity as item (item.operation)}
						<tr class="border-b border-[var(--color-muted)]/10">
							<td class="py-3 pr-4 text-[var(--color-text)]">{item.operation}</td>
							<td class="py-3 pr-4 font-mono text-[var(--color-accent)]">{item.intensity}</td>
							<td class="py-3">
								<span
									class="rounded px-2 py-0.5 text-xs {item.color === 'green'
										? 'bg-green-500/20 text-green-400'
										: item.color === 'red'
											? 'bg-red-500/20 text-red-400'
											: 'bg-yellow-500/20 text-yellow-400'}"
								>
									{item.bound}
								</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<div class="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
			<p class="text-sm text-amber-200">
				<span class="font-semibold">Key insight:</span> During generation, we do matrix-vector products
				(B=1). With arithmetic intensity ~1 vs GPU's 295 FLOPs/byte, we waste 99%+ of compute capability!
			</p>
		</div>
	</div>

	<!-- Historical Timeline -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>📅</span> Historical Evolution of Inference Optimization
		</h2>
		<p class="mb-6 text-[var(--color-muted)]">
			Key papers and techniques that have improved LLM inference efficiency over time.
		</p>
		<div class="relative">
			<!-- Timeline line -->
			<div
				class="absolute top-0 bottom-0 left-6 w-0.5 bg-gradient-to-b from-[var(--color-primary)] to-pink-600"
			></div>

			<div class="space-y-4">
				{#each inferenceTimeline as item (item.name)}
					<div class="relative flex items-center gap-4 pl-14">
						<!-- Timeline dot -->
						<div
							class="absolute left-4 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--color-primary)] bg-[var(--color-bg)]"
						>
							<div class="h-2 w-2 rounded-full bg-[var(--color-primary)]"></div>
						</div>

						<a
							href={item.link}
							target="_blank"
							rel="noopener noreferrer external"
							class="group flex-1 rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-4 transition-colors hover:border-[var(--color-primary)]/40"
						>
							<div class="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4">
								<!-- Year -->
								<span class="font-mono text-sm text-[var(--color-accent)]">{item.year}</span>
								<!-- Name -->
								<div class="flex items-center gap-2">
									<span class="text-xl">{item.icon}</span>
									<div>
										<span
											class="font-bold text-[var(--color-text)] transition-colors group-hover:text-[var(--color-primary)]"
											>{item.name}</span
										>
										<p class="hidden text-xs text-[var(--color-muted)] sm:block">
											{item.contribution}
										</p>
									</div>
								</div>
								<!-- Impact -->
								<span
									class="rounded bg-[var(--color-primary)]/20 px-2 py-0.5 font-mono text-sm text-[var(--color-primary)]"
								>
									{item.tokens}
								</span>
								<!-- Link arrow -->
								<span
									class="text-[var(--color-muted)] transition-colors group-hover:text-[var(--color-primary)]"
									>↗</span
								>
							</div>
						</a>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Key Takeaways -->
	<div
		class="rounded-xl border border-[var(--color-primary)]/20 bg-gradient-to-br from-[var(--color-primary)]/10 to-pink-600/10 p-6"
	>
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-text)]">
			<span>💡</span> Key Takeaways
		</h2>
		<div class="grid gap-4 sm:grid-cols-2">
			<div class="flex items-start gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)]/20 text-sm font-bold text-[var(--color-primary)]"
				>
					1
				</div>
				<p class="text-sm text-[var(--color-muted)]">
					<span class="font-semibold text-[var(--color-text)]"
						>Training is one-time, inference is forever.</span
					>
					Optimization effort at inference has multiplicative returns.
				</p>
			</div>
			<div class="flex items-start gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)]/20 text-sm font-bold text-[var(--color-primary)]"
				>
					2
				</div>
				<p class="text-sm text-[var(--color-muted)]">
					<span class="font-semibold text-[var(--color-text)]">Generation is memory-limited.</span>
					Matrix-vector products have arithmetic intensity ~1, wasting GPU compute.
				</p>
			</div>
			<div class="flex items-start gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)]/20 text-sm font-bold text-[var(--color-primary)]"
				>
					3
				</div>
				<p class="text-sm text-[var(--color-muted)]">
					<span class="font-semibold text-[var(--color-text)]"
						>Prefill vs Generation are different.</span
					>
					Prefill is parallelizable and compute-limited; generation is sequential and memory-limited.
				</p>
			</div>
			<div class="flex items-start gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)]/20 text-sm font-bold text-[var(--color-primary)]"
				>
					4
				</div>
				<p class="text-sm text-[var(--color-muted)]">
					<span class="font-semibold text-[var(--color-text)]"
						>Batching helps MLP but not attention.</span
					>
					Attention intensity depends on sequence length, not batch size.
				</p>
			</div>
		</div>
	</div>
</div>
