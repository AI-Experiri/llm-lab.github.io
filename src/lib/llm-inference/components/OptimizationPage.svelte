<script>
	// Number formats
	const numberFormats = [
		{
			format: 'fp32',
			bits: 32,
			bytes: 4,
			range: '±3.4e38',
			precision: '~7 digits',
			use: 'Training default'
		},
		{
			format: 'bf16',
			bits: 16,
			bytes: 2,
			range: '±3.4e38',
			precision: '~3 digits',
			use: 'Training/Inference'
		},
		{
			format: 'fp16',
			bits: 16,
			bytes: 2,
			range: '±65504',
			precision: '~3 digits',
			use: 'Inference'
		},
		{
			format: 'fp8',
			bits: 8,
			bytes: 1,
			range: '±448',
			precision: '~2 digits',
			use: 'H100+ training'
		},
		{
			format: 'int8',
			bits: 8,
			bytes: 1,
			range: '-128 to 127',
			precision: 'Integer',
			use: 'PTQ inference'
		},
		{
			format: 'int4',
			bits: 4,
			bytes: 0.5,
			range: '-8 to 7',
			precision: 'Integer',
			use: 'Aggressive PTQ'
		}
	];

	// Quantization methods
	const quantizationMethods = [
		{
			name: 'Quantization-Aware Training (QAT)',
			description: 'Train with simulated quantization, model learns to be robust',
			pros: ['Best accuracy', 'Model adapts to quantization'],
			cons: ['Requires full training', 'Expensive'],
			icon: '🎓'
		},
		{
			name: 'Post-Training Quantization (PTQ)',
			description: 'Quantize pre-trained model without retraining',
			pros: ['Fast to apply', 'No training cost'],
			cons: ['May lose accuracy', 'Outliers problematic'],
			icon: '⚡'
		},
		{
			name: 'LLM.int8()',
			description: 'Mixed-precision: extract outliers to fp16, rest in int8',
			pros: ['Handles outliers', 'Good accuracy'],
			cons: ['Slower than pure int8', 'Complex implementation'],
			icon: '🎯'
		},
		{
			name: 'Activation-Aware (AWQ/GPTQ)',
			description: 'Keep 0.1-1% of weights in high precision based on activation magnitude',
			pros: ['int3/int4 viable', '4x memory reduction'],
			cons: ['Requires calibration data', 'Per-model tuning'],
			icon: '📊'
		}
	];

	// Pruning approaches
	const pruningApproaches = [
		{
			name: 'Layer Pruning',
			description: 'Remove entire layers that contribute least to output',
			metric: 'Layer importance on calibration set',
			reduction: '~30% layers removable',
			icon: '🗂️'
		},
		{
			name: 'Head Pruning',
			description: 'Remove attention heads with low importance scores',
			metric: 'Head contribution to attention',
			reduction: '~50% heads removable',
			icon: '👤'
		},
		{
			name: 'Structured Pruning',
			description: 'Remove entire rows/columns for hardware efficiency',
			metric: 'Weight magnitude + activation',
			reduction: 'Variable, hardware-friendly',
			icon: '📐'
		}
	];

	// Speculative decoding
	const speculativeSteps = [
		{ step: 1, action: 'Draft model generates k tokens', detail: 'Fast, small model (e.g., 1B)' },
		{
			step: 2,
			action: 'Target model evaluates all k tokens in parallel',
			detail: 'Single forward pass'
		},
		{
			step: 3,
			action: 'Compare probabilities using rejection sampling',
			detail: 'Accept if draft ≤ target probability'
		},
		{
			step: 4,
			action: 'Accept valid prefix, resample rejected tokens',
			detail: 'Guaranteed exact target distribution'
		}
	];

	// Speculative configurations
	const speculativeConfigs = [
		{ target: '70B', draft: '8B', speedup: '2-2.5x', note: 'Common production setup' },
		{ target: '8B', draft: '1B', speedup: '2x', note: 'Smaller model setup' },
		{ target: 'Any', draft: 'Medusa heads', speedup: '2-3x', note: 'Single model, multiple heads' },
		{ target: 'Any', draft: 'EAGLE', speedup: '3x', note: 'Uses target features' }
	];

	// Memory/speed tradeoffs
	const quantizationResults = [
		{ model: 'LLaMA-70B', format: 'fp16', memory: '140 GB', speedup: '1x', accuracy: '100%' },
		{ model: 'LLaMA-70B', format: 'int8', memory: '70 GB', speedup: '1.5x', accuracy: '~99%' },
		{ model: 'LLaMA-70B', format: 'int4', memory: '35 GB', speedup: '2.5x', accuracy: '~95%' },
		{ model: 'LLaMA-70B', format: 'int3 (AWQ)', memory: '26 GB', speedup: '3.2x', accuracy: '~93%' }
	];
</script>

<div class="space-y-6">
	<!-- Hero Section -->
	<div
		class="rounded-2xl border border-amber-600/30 bg-gradient-to-br from-amber-600/20 to-[var(--color-primary)]/20 p-8"
	>
		<div class="flex items-start gap-4">
			<div class="text-5xl">🔧</div>
			<div>
				<h2 class="mb-3 text-2xl font-bold text-[var(--color-text)] md:text-3xl">
					Taking Shortcuts: Lossy Optimizations
				</h2>
				<p class="max-w-3xl text-lg leading-relaxed text-[var(--color-muted)]">
					When architectural changes aren't enough, we can <span
						class="font-semibold text-amber-400">trade accuracy for speed</span
					>. Quantization reduces precision, pruning removes parameters, and speculative decoding
					exploits the asymmetry between generation and verification.
				</p>
				<div class="mt-4 flex flex-wrap gap-3">
					<span class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-sm text-amber-400">
						Quantization: 2-4x memory reduction
					</span>
					<span class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-sm text-amber-400">
						Pruning: 30-50% parameter reduction
					</span>
					<span
						class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-sm text-[var(--color-accent)]"
					>
						Speculative: 2-3x speedup
					</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Number Formats -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>🔢</span> Number Formats for Inference
		</h2>
		<p class="mb-6 text-[var(--color-muted)]">
			Lower precision means less memory and faster computation, but reduced numerical range and
			accuracy.
		</p>

		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-[var(--color-muted)]/20 text-left text-[var(--color-muted)]">
						<th class="pr-4 pb-3">Format</th>
						<th class="pr-4 pb-3">Bits</th>
						<th class="pr-4 pb-3">Bytes</th>
						<th class="pr-4 pb-3">Range</th>
						<th class="pr-4 pb-3">Precision</th>
						<th class="pb-3">Use Case</th>
					</tr>
				</thead>
				<tbody>
					{#each numberFormats as fmt (fmt.format)}
						<tr class="border-b border-[var(--color-muted)]/10">
							<td class="py-3 pr-4 font-mono text-[var(--color-accent)]">{fmt.format}</td>
							<td class="py-3 pr-4 font-mono text-[var(--color-text)]">{fmt.bits}</td>
							<td class="py-3 pr-4 font-mono text-[var(--color-text)]">{fmt.bytes}</td>
							<td class="py-3 pr-4 text-xs text-[var(--color-muted)]">{fmt.range}</td>
							<td class="py-3 pr-4 text-xs text-[var(--color-muted)]">{fmt.precision}</td>
							<td class="py-3 text-xs text-[var(--color-muted)]">{fmt.use}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<div class="mt-4 rounded-lg border-l-4 border-amber-500 bg-[var(--color-bg)] p-4">
			<p class="text-sm text-[var(--color-muted)]">
				<span class="font-semibold text-amber-400">Key insight:</span> Going from fp16 to int4 gives 4x
				memory reduction and ~2.5x speedup, with only ~5% accuracy loss using modern techniques.
			</p>
		</div>
	</div>

	<!-- Quantization Methods -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>📉</span> Quantization Methods
		</h2>

		<div class="grid gap-4 md:grid-cols-2">
			{#each quantizationMethods as method (method.name)}
				<div
					class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-5 transition-colors hover:border-[var(--color-primary)]/40"
				>
					<div class="mb-3 flex items-center gap-3">
						<span class="text-2xl">{method.icon}</span>
						<h3 class="font-bold text-[var(--color-text)]">{method.name}</h3>
					</div>
					<p class="mb-4 text-sm text-[var(--color-muted)]">{method.description}</p>
					<div class="grid grid-cols-2 gap-3">
						<div>
							<span class="text-xs font-semibold text-green-400">Pros</span>
							<ul class="mt-1 space-y-0.5 text-xs text-[var(--color-muted)]">
								{#each method.pros as pro, i (i)}
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
								{#each method.cons as con, i (i)}
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
	</div>

	<!-- LLM.int8() Deep Dive -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>🎯</span> LLM.int8(): Handling Outliers
		</h2>

		<div class="grid gap-6 md:grid-cols-2">
			<div>
				<h3 class="mb-3 font-semibold text-[var(--color-text)]">The Problem</h3>
				<div class="rounded-lg bg-[var(--color-bg)] p-4">
					<p class="mb-3 text-sm text-[var(--color-muted)]">
						LLMs have activation outliers - a few features with values 10-100x larger than others.
						Standard quantization clips these, causing huge accuracy loss.
					</p>
					<div class="rounded bg-[var(--color-secondary)] p-2 font-mono text-xs">
						<div class="text-[var(--color-muted)]"># Typical activation distribution</div>
						<div>Normal features: [-1, 1]</div>
						<div class="text-red-400">Outliers: [-100, 100] (0.1% of features)</div>
					</div>
				</div>
			</div>

			<div>
				<h3 class="mb-3 font-semibold text-[var(--color-text)]">The Solution</h3>
				<div class="rounded-lg bg-[var(--color-bg)] p-4">
					<ol class="space-y-2 text-sm text-[var(--color-muted)]">
						<li class="flex items-start gap-2">
							<span class="font-bold text-[var(--color-primary)]">1.</span>
							<span>Identify outlier columns (magnitude > threshold)</span>
						</li>
						<li class="flex items-start gap-2">
							<span class="font-bold text-[var(--color-primary)]">2.</span>
							<span>Extract outliers to separate fp16 matrix</span>
						</li>
						<li class="flex items-start gap-2">
							<span class="font-bold text-[var(--color-primary)]">3.</span>
							<span>Quantize remaining 99.9% to int8</span>
						</li>
						<li class="flex items-start gap-2">
							<span class="font-bold text-[var(--color-primary)]">4.</span>
							<span>Compute both parts, add results</span>
						</li>
					</ol>
				</div>
			</div>
		</div>
	</div>

	<!-- Quantization Results -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>📊</span> Quantization Results (LLaMA-70B)
		</h2>

		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-[var(--color-muted)]/20 text-left text-[var(--color-muted)]">
						<th class="pr-4 pb-3">Model</th>
						<th class="pr-4 pb-3">Format</th>
						<th class="pr-4 pb-3">Memory</th>
						<th class="pr-4 pb-3">Speedup</th>
						<th class="pb-3">Accuracy</th>
					</tr>
				</thead>
				<tbody>
					{#each quantizationResults as result (result.format)}
						<tr class="border-b border-[var(--color-muted)]/10">
							<td class="py-3 pr-4 text-[var(--color-text)]">{result.model}</td>
							<td class="py-3 pr-4 font-mono text-[var(--color-accent)]">{result.format}</td>
							<td class="py-3 pr-4 font-mono text-amber-400">{result.memory}</td>
							<td class="py-3 pr-4 font-mono text-emerald-400">{result.speedup}</td>
							<td class="py-3 font-mono text-[var(--color-text)]">{result.accuracy}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Model Pruning -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>✂️</span> Model Pruning
		</h2>
		<p class="mb-6 text-[var(--color-muted)]">
			Remove parameters that contribute least to model output. Requires careful selection and often
			distillation to recover accuracy.
		</p>

		<div class="grid gap-4 md:grid-cols-3">
			{#each pruningApproaches as approach (approach.name)}
				<div class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-5">
					<div class="mb-3 flex items-center gap-3">
						<span class="text-2xl">{approach.icon}</span>
						<h3 class="font-bold text-[var(--color-text)]">{approach.name}</h3>
					</div>
					<p class="mb-3 text-sm text-[var(--color-muted)]">{approach.description}</p>
					<div class="space-y-2 text-xs">
						<div class="flex justify-between">
							<span class="text-[var(--color-muted)]">Metric:</span>
							<span class="text-[var(--color-accent)]">{approach.metric}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-[var(--color-muted)]">Typical:</span>
							<span class="text-amber-400">{approach.reduction}</span>
						</div>
					</div>
				</div>
			{/each}
		</div>

		<div class="mt-4 grid gap-4 md:grid-cols-2">
			<div class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-4">
				<h4 class="mb-2 font-semibold text-[var(--color-text)]">Pruning Recipe</h4>
				<ol class="space-y-1 text-xs text-[var(--color-muted)]">
					<li>1. Identify important layers/heads on calibration set</li>
					<li>2. Remove unimportant components</li>
					<li>3. Distill from original model to recover accuracy</li>
				</ol>
			</div>
			<div class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-4">
				<h4 class="mb-2 font-semibold text-[var(--color-text)]">From-Scratch Recipe</h4>
				<ol class="space-y-1 text-xs text-[var(--color-muted)]">
					<li>1. Define faster architecture (fewer layers/heads)</li>
					<li>2. Initialize with pruned original weights</li>
					<li>3. Train with distillation from original</li>
				</ol>
			</div>
		</div>
	</div>

	<!-- Speculative Decoding -->
	<div
		class="rounded-2xl border border-cyan-600/30 bg-gradient-to-br from-cyan-600/20 to-[var(--color-primary)]/20 p-8"
	>
		<div class="flex items-start gap-4">
			<div class="text-5xl">🚀</div>
			<div>
				<h2 class="mb-3 text-2xl font-bold text-[var(--color-text)] md:text-3xl">
					Speculative Decoding: Lossless Speedup
				</h2>
				<p class="max-w-3xl text-lg leading-relaxed text-[var(--color-muted)]">
					Unlike quantization and pruning, speculative decoding is <span
						class="font-semibold text-cyan-400">mathematically exact</span
					>. It exploits the fact that
					<span class="font-semibold text-cyan-400">verification is faster than generation</span>:
					checking k tokens in parallel is faster than generating them one by one.
				</p>
			</div>
		</div>
	</div>

	<!-- Speculative Decoding Steps -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>📋</span> How Speculative Decoding Works
		</h2>

		<div class="space-y-4">
			{#each speculativeSteps as step, i (i)}
				<div class="flex items-start gap-4">
					<div
						class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/20 font-bold text-[var(--color-primary)]"
					>
						{step.step}
					</div>
					<div
						class="flex-1 rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-4"
					>
						<h3 class="mb-1 font-bold text-[var(--color-text)]">{step.action}</h3>
						<p class="text-sm text-[var(--color-muted)]">{step.detail}</p>
					</div>
				</div>
			{/each}
		</div>

		<div class="mt-6 rounded-lg border-l-4 border-cyan-500 bg-[var(--color-bg)] p-4">
			<h4 class="mb-2 font-semibold text-cyan-400">Key Insight: Modified Rejection Sampling</h4>
			<p class="text-sm text-[var(--color-muted)]">
				Accept token if <code class="text-[var(--color-accent)]"
					>draft_prob(token) ≤ target_prob(token)</code
				>. If rejected, resample from adjusted distribution. This guarantees samples from the exact
				target distribution!
			</p>
		</div>
	</div>

	<!-- Speculative Configurations -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>⚙️</span> Speculative Decoding Configurations
		</h2>

		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-[var(--color-muted)]/20 text-left text-[var(--color-muted)]">
						<th class="pr-4 pb-3">Target Model</th>
						<th class="pr-4 pb-3">Draft Model</th>
						<th class="pr-4 pb-3">Speedup</th>
						<th class="pb-3">Note</th>
					</tr>
				</thead>
				<tbody>
					{#each speculativeConfigs as config (config.draft)}
						<tr class="border-b border-[var(--color-muted)]/10">
							<td class="py-3 pr-4 font-mono text-[var(--color-text)]">{config.target}</td>
							<td class="py-3 pr-4 font-mono text-[var(--color-accent)]">{config.draft}</td>
							<td class="py-3 pr-4 font-mono text-emerald-400">{config.speedup}</td>
							<td class="py-3 text-xs text-[var(--color-muted)]">{config.note}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Advanced Speculative Methods -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>🦅</span> Advanced Speculative Methods
		</h2>

		<div class="grid gap-6 md:grid-cols-2">
			<div class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-5">
				<h3 class="mb-3 font-bold text-[var(--color-text)]">Medusa</h3>
				<p class="mb-3 text-sm text-[var(--color-muted)]">
					Add multiple "draft heads" to the target model itself. Each head predicts a future token
					position.
				</p>
				<ul class="space-y-2 text-xs text-[var(--color-muted)]">
					<li class="flex items-start gap-2">
						<span class="text-green-400">+</span>
						<span>No separate draft model needed</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-green-400">+</span>
						<span>Single model deployment</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-amber-400">-</span>
						<span>Requires fine-tuning the heads</span>
					</li>
				</ul>
			</div>

			<div class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-5">
				<h3 class="mb-3 font-bold text-[var(--color-text)]">EAGLE</h3>
				<p class="mb-3 text-sm text-[var(--color-muted)]">
					Draft model uses features from the target model, enabling better draft quality.
				</p>
				<ul class="space-y-2 text-xs text-[var(--color-muted)]">
					<li class="flex items-start gap-2">
						<span class="text-green-400">+</span>
						<span>Higher acceptance rate (~3x speedup)</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-green-400">+</span>
						<span>Uses target's hidden states</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-amber-400">-</span>
						<span>More complex integration</span>
					</li>
				</ul>
			</div>
		</div>
	</div>

	<!-- Key Takeaways -->
	<div
		class="rounded-xl border border-amber-600/20 bg-gradient-to-br from-amber-600/10 to-[var(--color-primary)]/10 p-6"
	>
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-text)]">
			<span>💡</span> Key Takeaways
		</h2>
		<div class="grid gap-4 sm:grid-cols-2">
			<div class="flex items-start gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 text-sm font-bold text-amber-400"
				>
					1
				</div>
				<p class="text-sm text-[var(--color-muted)]">
					<span class="font-semibold text-[var(--color-text)]">int4 is practical.</span>
					With AWQ/GPTQ, 4-bit quantization achieves ~95% accuracy with 4x memory savings.
				</p>
			</div>
			<div class="flex items-start gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 text-sm font-bold text-amber-400"
				>
					2
				</div>
				<p class="text-sm text-[var(--color-muted)]">
					<span class="font-semibold text-[var(--color-text)]">Outliers need special handling.</span
					>
					LLM.int8() and activation-aware methods handle the 0.1% of outlier features.
				</p>
			</div>
			<div class="flex items-start gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 text-sm font-bold text-amber-400"
				>
					3
				</div>
				<p class="text-sm text-[var(--color-muted)]">
					<span class="font-semibold text-[var(--color-text)]">Speculative decoding is exact.</span>
					2-3x speedup with mathematically identical outputs using modified rejection sampling.
				</p>
			</div>
			<div class="flex items-start gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 text-sm font-bold text-amber-400"
				>
					4
				</div>
				<p class="text-sm text-[var(--color-muted)]">
					<span class="font-semibold text-[var(--color-text)]">Pruning requires distillation.</span>
					Simply removing parameters loses too much accuracy; distillation recovers it.
				</p>
			</div>
		</div>
	</div>
</div>
