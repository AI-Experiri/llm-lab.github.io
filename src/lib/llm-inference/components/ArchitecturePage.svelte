<script>
	// KV Cache reduction techniques
	const kvReductionTechniques = [
		{
			name: 'Grouped-Query Attention (GQA)',
			description: 'Share K/V heads across multiple query heads',
			reduction: 'N/K factor',
			tradeoff: 'Minimal accuracy loss',
			used: 'LLaMA 2, LLaMA 3, Mistral',
			icon: '🎯',
			link: 'https://arxiv.org/abs/1911.02150'
		},
		{
			name: 'Multi-Head Latent Attention (MLA)',
			description: 'Project K/V from N*H to C dimensions via learned projection',
			reduction: '32x (DeepSeek)',
			tradeoff: 'Better accuracy than GQA at same cost',
			used: 'DeepSeek v2',
			icon: '🎭',
			link: 'https://arxiv.org/abs/2405.04434'
		},
		{
			name: 'Cross-Layer Attention (CLA)',
			description: 'Share KV cache across layers (like GQA shares across heads)',
			reduction: 'Layer-independent',
			tradeoff: 'Frontier of accuracy vs KV size',
			used: 'Research',
			icon: '🔗',
			link: 'https://arxiv.org/abs/2405.12981'
		},
		{
			name: 'Local Attention',
			description: 'Only attend to nearby tokens within a window',
			reduction: 'O(window) vs O(seq)',
			tradeoff: 'May hurt long-range reasoning',
			used: 'character.ai, Longformer',
			icon: '📍',
			link: 'https://arxiv.org/abs/2004.05150'
		}
	];

	// Alternative architectures
	const alternativeArchitectures = [
		{
			name: 'S4 (Structured State Space)',
			year: '2021',
			description: 'Classic state space models for sub-quadratic attention',
			pros: ['O(n) complexity', 'Great for continuous signals'],
			cons: ['Poor at associative recall', 'Struggles with in-context learning'],
			icon: '📐',
			link: 'https://arxiv.org/abs/2111.00396'
		},
		{
			name: 'Mamba',
			year: '2023',
			description: 'Input-dependent SSM parameters, matches Transformers at 1B',
			pros: ['O(n) complexity', 'Good generation speed', 'Hardware-efficient'],
			cons: ["Doesn't scale as well to larger models"],
			icon: '🐍',
			link: 'https://arxiv.org/abs/2312.00752'
		},
		{
			name: 'Jamba',
			year: '2024',
			description: 'Hybrid Transformer-Mamba layers (1:7 ratio) with 52B MoE',
			pros: ['Best of both worlds', 'Production-ready'],
			cons: ['Complexity of two systems'],
			icon: '🔀',
			link: 'https://arxiv.org/abs/2403.19887'
		},
		{
			name: 'BASED',
			year: '2024',
			description: 'Linear attention + local sliding window attention',
			pros: ['Simple combination', 'Retains recall ability'],
			cons: ['Still needs some quadratic attention'],
			icon: '🧱',
			link: 'https://arxiv.org/abs/2402.18668'
		},
		{
			name: 'MiniMax-01',
			year: '2024',
			description: 'Linear attention + full attention, 456B MoE with 4M context',
			pros: ['SOTA long context', 'Production scale'],
			cons: ['Massive compute requirements'],
			icon: '🚀',
			link: 'https://arxiv.org/abs/2501.08313'
		},
		{
			name: 'Diffusion LLMs',
			year: '2025',
			description: 'Generate all tokens in parallel, refine over diffusion steps',
			pros: ['Parallel generation', '10x faster on coding'],
			cons: ['Different training paradigm', 'Less mature'],
			icon: '🌊',
			link: 'https://arxiv.org/abs/2502.09992'
		}
	];

	// GQA configurations
	const gqaConfigs = [
		{ name: 'Multi-Head (MHA)', queryHeads: 32, kvHeads: 32, ratio: '1:1', kvCache: '100%' },
		{ name: 'Grouped-Query (GQA-8)', queryHeads: 32, kvHeads: 8, ratio: '4:1', kvCache: '25%' },
		{ name: 'Grouped-Query (GQA-4)', queryHeads: 32, kvHeads: 4, ratio: '8:1', kvCache: '12.5%' },
		{ name: 'Multi-Query (MQA)', queryHeads: 32, kvHeads: 1, ratio: '32:1', kvCache: '3.1%' }
	];

	// Local attention patterns
	const localAttentionPatterns = [
		{ name: 'Full attention', pattern: 'All layers', kvCache: 'O(L * S)', longRange: 'Full' },
		{ name: 'Local only', pattern: 'All local', kvCache: 'O(L * W)', longRange: 'None' },
		{
			name: 'Hybrid (char.ai)',
			pattern: '1 global per 6 local',
			kvCache: 'O(L/6 * S + 5L/6 * W)',
			longRange: 'Every 6 layers'
		}
	];
</script>

<div class="space-y-6">
	<!-- Hero Section -->
	<div
		class="rounded-2xl border border-emerald-600/30 bg-gradient-to-br from-emerald-600/20 to-[var(--color-primary)]/20 p-8"
	>
		<div class="flex items-start gap-4">
			<div class="text-5xl">🏗️</div>
			<div>
				<h2 class="mb-3 text-2xl font-bold text-[var(--color-text)] md:text-3xl">
					Architectural Solutions for Efficient Inference
				</h2>
				<p class="max-w-3xl text-lg leading-relaxed text-[var(--color-muted)]">
					The Transformer's quadratic attention is a fundamental bottleneck. Modern architectures
					trade off
					<span class="font-semibold text-emerald-400"
						>some accuracy for massive efficiency gains</span
					>: reducing KV cache by 8-32x or achieving O(n) complexity instead of O(n^2).
				</p>
				<div class="mt-4 flex flex-wrap gap-3">
					<span class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-sm text-emerald-400">
						GQA: 4-8x KV reduction
					</span>
					<span class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-sm text-emerald-400">
						MLA: 32x KV reduction
					</span>
					<span
						class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-sm text-[var(--color-accent)]"
					>
						SSMs: O(n) complexity
					</span>
				</div>
			</div>
		</div>
	</div>

	<!-- KV Cache Reduction Techniques -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>🔑</span> KV Cache Reduction Techniques
		</h2>
		<p class="mb-6 text-[var(--color-muted)]">
			These techniques reduce the KV cache size while maintaining most of the model's accuracy.
		</p>

		<div class="space-y-4">
			{#each kvReductionTechniques as tech (tech.name)}
				<a
					href={tech.link}
					target="_blank"
					rel="noopener noreferrer external"
					class="group block rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-5 transition-colors hover:border-[var(--color-primary)]/40"
				>
					<div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
						<div class="flex-1">
							<div class="mb-2 flex items-center gap-3">
								<span class="text-2xl">{tech.icon}</span>
								<h3
									class="font-bold text-[var(--color-text)] transition-colors group-hover:text-[var(--color-primary)]"
								>
									{tech.name}
								</h3>
								<span
									class="text-[var(--color-muted)] transition-colors group-hover:text-[var(--color-primary)]"
									>↗</span
								>
							</div>
							<p class="mb-3 text-sm text-[var(--color-muted)]">{tech.description}</p>
							<div
								class="inline-block rounded bg-[var(--color-secondary)] px-2 py-1 text-xs text-[var(--color-accent)]"
							>
								Used in: {tech.used}
							</div>
						</div>
						<div class="grid grid-cols-2 gap-3 md:w-64">
							<div>
								<span class="text-xs font-semibold text-emerald-400">Reduction</span>
								<div class="mt-1 text-sm text-[var(--color-text)]">{tech.reduction}</div>
							</div>
							<div>
								<span class="text-xs font-semibold text-amber-400">Tradeoff</span>
								<div class="mt-1 text-sm text-[var(--color-muted)]">{tech.tradeoff}</div>
							</div>
						</div>
					</div>
				</a>
			{/each}
		</div>
	</div>

	<!-- GQA Deep Dive -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>🎯</span> Grouped-Query Attention (GQA) Deep Dive
		</h2>

		<div class="grid gap-6 md:grid-cols-2">
			<div>
				<h3 class="mb-3 font-semibold text-[var(--color-text)]">How It Works</h3>
				<div class="rounded-lg bg-[var(--color-bg)] p-4">
					<p class="mb-3 text-sm text-[var(--color-muted)]">
						Instead of each query head having its own K/V, groups of query heads share K/V:
					</p>
					<div class="space-y-2 font-mono text-xs">
						<div class="text-[var(--color-accent)]"># Standard Multi-Head Attention</div>
						<div>
							Q: [B, N, S, H] <span class="text-[var(--color-muted)]"># N query heads</span>
						</div>
						<div>K: [B, N, S, H] <span class="text-[var(--color-muted)]"># N key heads</span></div>
						<div>
							V: [B, N, S, H] <span class="text-[var(--color-muted)]"># N value heads</span>
						</div>
						<div class="mt-2 text-[var(--color-accent)]"># Grouped-Query Attention</div>
						<div>
							Q: [B, N, S, H] <span class="text-[var(--color-muted)]"># N query heads</span>
						</div>
						<div>
							K: [B, K, S, H] <span class="text-[var(--color-muted)]"># K key heads (K &lt; N)</span
							>
						</div>
						<div>
							V: [B, K, S, H] <span class="text-[var(--color-muted)]"># K value heads</span>
						</div>
					</div>
				</div>
			</div>

			<div>
				<h3 class="mb-3 font-semibold text-[var(--color-text)]">Configuration Examples</h3>
				<div class="overflow-x-auto">
					<table class="w-full text-xs">
						<thead>
							<tr
								class="border-b border-[var(--color-muted)]/20 text-left text-[var(--color-muted)]"
							>
								<th class="pr-3 pb-2">Config</th>
								<th class="pr-3 pb-2">Q/KV</th>
								<th class="pr-3 pb-2">Ratio</th>
								<th class="pb-2">KV Cache</th>
							</tr>
						</thead>
						<tbody>
							{#each gqaConfigs as config (config.name)}
								<tr class="border-b border-[var(--color-muted)]/10">
									<td class="py-2 pr-3 text-[var(--color-text)]">{config.name}</td>
									<td class="py-2 pr-3 font-mono text-[var(--color-muted)]"
										>{config.queryHeads}/{config.kvHeads}</td
									>
									<td class="py-2 pr-3 font-mono text-[var(--color-accent)]">{config.ratio}</td>
									<td class="py-2 font-mono text-emerald-400">{config.kvCache}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>

	<!-- MLA Deep Dive -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>🎭</span> Multi-Head Latent Attention (MLA)
		</h2>

		<div class="grid gap-6 md:grid-cols-2">
			<div>
				<h3 class="mb-3 font-semibold text-[var(--color-text)]">Key Innovation</h3>
				<div class="rounded-lg bg-[var(--color-bg)] p-4">
					<p class="mb-3 text-sm text-[var(--color-muted)]">
						Instead of storing full K/V, store a compressed latent and decompress at attention time:
					</p>
					<div class="space-y-2 font-mono text-xs">
						<div class="text-[var(--color-accent)]"># Original dimensions</div>
						<div>KV: [B, L, S, N*H] <span class="text-[var(--color-muted)]"># 16384 dim</span></div>
						<div class="mt-2 text-[var(--color-accent)]"># MLA compression</div>
						<div>Latent: [B, L, S, C] <span class="text-[var(--color-muted)]"># 512 dim</span></div>
						<div>
							KV = W_up @ Latent <span class="text-[var(--color-muted)]"># Decompress</span>
						</div>
					</div>
					<div class="mt-3 rounded bg-[var(--color-secondary)] p-2">
						<span class="text-xs font-semibold text-emerald-400">DeepSeek v2:</span>
						<span class="text-xs text-[var(--color-muted)]"> 16384 → 512 (32x compression)</span>
					</div>
				</div>
			</div>

			<div>
				<h3 class="mb-3 font-semibold text-[var(--color-text)]">Why Better Than GQA?</h3>
				<div class="rounded-lg bg-[var(--color-bg)] p-4">
					<ul class="space-y-3 text-sm text-[var(--color-muted)]">
						<li class="flex items-start gap-2">
							<span class="text-emerald-400">+</span>
							<span
								><span class="text-[var(--color-text)]">Learned compression:</span> Model learns optimal
								latent space</span
							>
						</li>
						<li class="flex items-start gap-2">
							<span class="text-emerald-400">+</span>
							<span
								><span class="text-[var(--color-text)]">Better Pareto frontier:</span> Higher accuracy
								at same KV size</span
							>
						</li>
						<li class="flex items-start gap-2">
							<span class="text-emerald-400">+</span>
							<span
								><span class="text-[var(--color-text)]">Flexible compression:</span> Can tune C for different
								tradeoffs</span
							>
						</li>
						<li class="flex items-start gap-2">
							<span class="text-amber-400">-</span>
							<span
								><span class="text-[var(--color-text)]">More compute:</span> Must decompress at attention
								time</span
							>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</div>

	<!-- Local Attention -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>📍</span> Local Attention
		</h2>
		<p class="mb-6 text-[var(--color-muted)]">
			Language is mostly local - a word typically depends on nearby context. Local attention
			exploits this.
		</p>

		<div class="grid gap-6 md:grid-cols-2">
			<div>
				<h3 class="mb-3 font-semibold text-[var(--color-text)]">Effective Context</h3>
				<div class="rounded-lg bg-[var(--color-bg)] p-4">
					<p class="mb-3 text-sm text-[var(--color-muted)]">
						With window size W and L layers of local attention:
					</p>
					<div class="mb-3 font-mono text-sm text-[var(--color-accent)]">
						Effective context = L * W
					</div>
					<p class="text-xs text-[var(--color-muted)]">
						Information can "hop" W tokens per layer, so L layers gives L*W effective range.
					</p>
				</div>
			</div>

			<div>
				<h3 class="mb-3 font-semibold text-[var(--color-text)]">Hybrid Patterns</h3>
				<div class="overflow-x-auto">
					<table class="w-full text-xs">
						<thead>
							<tr
								class="border-b border-[var(--color-muted)]/20 text-left text-[var(--color-muted)]"
							>
								<th class="pr-3 pb-2">Pattern</th>
								<th class="pr-3 pb-2">KV Cache</th>
								<th class="pb-2">Long Range</th>
							</tr>
						</thead>
						<tbody>
							{#each localAttentionPatterns as pattern (pattern.name)}
								<tr class="border-b border-[var(--color-muted)]/10">
									<td class="py-2 pr-3 text-[var(--color-text)]">{pattern.name}</td>
									<td class="py-2 pr-3 font-mono text-[var(--color-accent)]">{pattern.kvCache}</td>
									<td class="py-2 text-[var(--color-muted)]">{pattern.longRange}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>

		<div class="mt-4 rounded-lg border-l-4 border-emerald-500 bg-[var(--color-bg)] p-4">
			<p class="text-sm text-[var(--color-muted)]">
				<span class="font-semibold text-emerald-400">character.ai approach:</span> 1 global layer every
				6 local layers. KV cache becomes independent of sequence length while maintaining long-range capability.
			</p>
		</div>
	</div>

	<!-- Alternative Architectures -->
	<div
		class="rounded-2xl border border-cyan-600/30 bg-gradient-to-br from-cyan-600/20 to-[var(--color-primary)]/20 p-8"
	>
		<div class="flex items-start gap-4">
			<div class="text-5xl">🔄</div>
			<div>
				<h2 class="mb-3 text-2xl font-bold text-[var(--color-text)] md:text-3xl">
					Beyond Transformers: Alternative Architectures
				</h2>
				<p class="max-w-3xl text-lg leading-relaxed text-[var(--color-muted)]">
					State-space models, linear attention, and diffusion models offer fundamentally different
					approaches to sequence modeling with <span class="font-semibold text-cyan-400"
						>O(n) complexity</span
					>
					instead of the Transformer's O(n^2).
				</p>
			</div>
		</div>
	</div>

	<!-- Alternative Architectures Grid -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>🧬</span> Alternative Architecture Timeline
		</h2>

		<div class="space-y-4">
			{#each alternativeArchitectures as arch (arch.name)}
				<a
					href={arch.link}
					target="_blank"
					rel="noopener noreferrer external"
					class="group block rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-5 transition-colors hover:border-[var(--color-primary)]/40"
				>
					<div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
						<div class="flex-1">
							<div class="mb-2 flex items-center gap-3">
								<span class="text-2xl">{arch.icon}</span>
								<h3
									class="font-bold text-[var(--color-text)] transition-colors group-hover:text-[var(--color-primary)]"
								>
									{arch.name}
								</h3>
								<span
									class="rounded bg-[var(--color-secondary)] px-2 py-0.5 text-xs text-[var(--color-accent)]"
									>{arch.year}</span
								>
								<span
									class="text-[var(--color-muted)] transition-colors group-hover:text-[var(--color-primary)]"
									>↗</span
								>
							</div>
							<p class="text-sm text-[var(--color-muted)]">{arch.description}</p>
						</div>
						<div class="grid grid-cols-2 gap-3 md:w-80">
							<div>
								<span class="text-xs font-semibold text-green-400">Pros</span>
								<ul class="mt-1 space-y-0.5 text-xs text-[var(--color-muted)]">
									{#each arch.pros as pro, i (i)}
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
									{#each arch.cons as con, i (i)}
										<li class="flex items-start gap-1">
											<span class="text-amber-400">-</span>
											{con}
										</li>
									{/each}
								</ul>
							</div>
						</div>
					</div>
				</a>
			{/each}
		</div>
	</div>

	<!-- Diffusion Models Spotlight -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>🌊</span> Diffusion Models for Text
		</h2>
		<p class="mb-6 text-[var(--color-muted)]">
			A promising direction that breaks the sequential generation bottleneck.
		</p>

		<div class="grid gap-6 md:grid-cols-2">
			<div class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-5">
				<h3 class="mb-3 font-bold text-[var(--color-text)]">How It Works</h3>
				<ol class="space-y-2 text-sm text-[var(--color-muted)]">
					<li class="flex items-start gap-2">
						<span class="font-bold text-[var(--color-primary)]">1.</span>
						<span>Start with all tokens as noise/mask</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="font-bold text-[var(--color-primary)]">2.</span>
						<span>Model predicts all tokens in parallel</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="font-bold text-[var(--color-primary)]">3.</span>
						<span>Refine over multiple diffusion steps</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="font-bold text-[var(--color-primary)]">4.</span>
						<span>Final output after T steps (T &lt;&lt; seq length)</span>
					</li>
				</ol>
			</div>

			<div class="rounded-lg border border-emerald-500/30 bg-[var(--color-bg)] p-5">
				<h3 class="mb-3 font-bold text-emerald-400">Results on Coding</h3>
				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<span class="text-sm text-[var(--color-muted)]">Speed vs Autoregressive</span>
						<span class="font-bold text-emerald-400">10x faster</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-sm text-[var(--color-muted)]">Accuracy on benchmarks</span>
						<span class="text-[var(--color-text)]">Competitive</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-sm text-[var(--color-muted)]">Parallelization</span>
						<span class="text-[var(--color-accent)]">Full output parallel</span>
					</div>
				</div>
				<p class="mt-3 text-xs text-[var(--color-muted)]">
					More promising direction than SSMs according to lecture
				</p>
			</div>
		</div>
	</div>

	<!-- Summary Comparison -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>📊</span> Architecture Comparison Summary
		</h2>

		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-[var(--color-muted)]/20 text-left text-[var(--color-muted)]">
						<th class="pr-4 pb-3">Approach</th>
						<th class="pr-4 pb-3">Complexity</th>
						<th class="pr-4 pb-3">KV Cache</th>
						<th class="pr-4 pb-3">Recall</th>
						<th class="pb-3">Maturity</th>
					</tr>
				</thead>
				<tbody>
					<tr class="border-b border-[var(--color-muted)]/10">
						<td class="py-3 pr-4 text-[var(--color-text)]">Full Transformer</td>
						<td class="py-3 pr-4 font-mono text-red-400">O(n²)</td>
						<td class="py-3 pr-4 text-red-400">O(n)</td>
						<td class="py-3 pr-4 text-green-400">Excellent</td>
						<td class="py-3 text-green-400">Production</td>
					</tr>
					<tr class="border-b border-[var(--color-muted)]/10">
						<td class="py-3 pr-4 text-[var(--color-text)]">GQA/MLA</td>
						<td class="py-3 pr-4 font-mono text-amber-400">O(n²)</td>
						<td class="py-3 pr-4 text-emerald-400">O(n/k)</td>
						<td class="py-3 pr-4 text-green-400">Good</td>
						<td class="py-3 text-green-400">Production</td>
					</tr>
					<tr class="border-b border-[var(--color-muted)]/10">
						<td class="py-3 pr-4 text-[var(--color-text)]">Local + Sparse</td>
						<td class="py-3 pr-4 font-mono text-amber-400">O(n·w)</td>
						<td class="py-3 pr-4 text-emerald-400">O(w)</td>
						<td class="py-3 pr-4 text-amber-400">Limited</td>
						<td class="py-3 text-green-400">Production</td>
					</tr>
					<tr class="border-b border-[var(--color-muted)]/10">
						<td class="py-3 pr-4 text-[var(--color-text)]">SSMs (Mamba)</td>
						<td class="py-3 pr-4 font-mono text-green-400">O(n)</td>
						<td class="py-3 pr-4 text-green-400">O(1)</td>
						<td class="py-3 pr-4 text-amber-400">Weak</td>
						<td class="py-3 text-amber-400">Emerging</td>
					</tr>
					<tr class="border-b border-[var(--color-muted)]/10">
						<td class="py-3 pr-4 text-[var(--color-text)]">Hybrids</td>
						<td class="py-3 pr-4 font-mono text-amber-400">O(n + k·n²)</td>
						<td class="py-3 pr-4 text-emerald-400">O(k·n)</td>
						<td class="py-3 pr-4 text-green-400">Good</td>
						<td class="py-3 text-green-400">Production</td>
					</tr>
					<tr class="border-b border-[var(--color-muted)]/10">
						<td class="py-3 pr-4 text-[var(--color-text)]">Diffusion</td>
						<td class="py-3 pr-4 font-mono text-green-400">O(T·n²)</td>
						<td class="py-3 pr-4 text-green-400">None</td>
						<td class="py-3 pr-4 text-[var(--color-muted)]">TBD</td>
						<td class="py-3 text-amber-400">Research</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>

	<!-- Key Takeaways -->
	<div
		class="rounded-xl border border-emerald-600/20 bg-gradient-to-br from-emerald-600/10 to-[var(--color-primary)]/10 p-6"
	>
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-text)]">
			<span>💡</span> Key Takeaways
		</h2>
		<div class="grid gap-4 sm:grid-cols-2">
			<div class="flex items-start gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-400"
				>
					1
				</div>
				<p class="text-sm text-[var(--color-muted)]">
					<span class="font-semibold text-[var(--color-text)]">GQA is now standard.</span>
					LLaMA 2/3, Mistral, and most modern models use grouped-query attention for 4-8x KV reduction.
				</p>
			</div>
			<div class="flex items-start gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-400"
				>
					2
				</div>
				<p class="text-sm text-[var(--color-muted)]">
					<span class="font-semibold text-[var(--color-text)]"
						>MLA beats GQA on Pareto frontier.</span
					>
					Learned compression achieves better accuracy at the same KV cache size.
				</p>
			</div>
			<div class="flex items-start gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-400"
				>
					3
				</div>
				<p class="text-sm text-[var(--color-muted)]">
					<span class="font-semibold text-[var(--color-text)]">Hybrids work best.</span>
					Linear + local + some full attention (MiniMax-01, Jamba) achieves SOTA.
				</p>
			</div>
			<div class="flex items-start gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-400"
				>
					4
				</div>
				<p class="text-sm text-[var(--color-muted)]">
					<span class="font-semibold text-[var(--color-text)]">Diffusion is promising.</span>
					Parallel generation with diffusion models shows 10x speedup on coding tasks.
				</p>
			</div>
		</div>
	</div>
</div>
