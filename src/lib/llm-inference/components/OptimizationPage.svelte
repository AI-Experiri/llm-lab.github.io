<!-- ABOUTME: Optimization page for LLM Inference covering lossy optimization techniques -->
<!-- ABOUTME: Covers quantization, pruning, and speculative decoding -->

<script>
	import {
		HeroSection,
		Section,
		ContentBox,
		KeyTakeaway,
		ProsConsCard,
		NumberedSteps,
		DataTable
	} from '$lib/shared';

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
			cons: ['Requires full training', 'Expensive']
		},
		{
			name: 'Post-Training Quantization (PTQ)',
			description: 'Quantize pre-trained model without retraining',
			pros: ['Fast to apply', 'No training cost'],
			cons: ['May lose accuracy', 'Outliers problematic']
		},
		{
			name: 'LLM.int8()',
			description: 'Mixed-precision: extract outliers to fp16, rest in int8',
			pros: ['Handles outliers', 'Good accuracy'],
			cons: ['Slower than pure int8', 'Complex implementation']
		},
		{
			name: 'Activation-Aware (AWQ/GPTQ)',
			description: 'Keep 0.1-1% of weights in high precision based on activation magnitude',
			pros: ['int3/int4 viable', '4x memory reduction'],
			cons: ['Requires calibration data', 'Per-model tuning']
		}
	];

	// Pruning approaches
	const pruningApproaches = [
		{
			name: 'Layer Pruning',
			description: 'Remove entire layers that contribute least to output',
			metric: 'Layer importance on calibration set',
			reduction: '~30% layers removable'
		},
		{
			name: 'Head Pruning',
			description: 'Remove attention heads with low importance scores',
			metric: 'Head contribution to attention',
			reduction: '~50% heads removable'
		},
		{
			name: 'Structured Pruning',
			description: 'Remove entire rows/columns for hardware efficiency',
			metric: 'Weight magnitude + activation',
			reduction: 'Variable, hardware-friendly'
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

	const quantizationResultsColumns = [
		{ key: 'model', header: 'Model', color: 'text' },
		{ key: 'format', header: 'Format', mono: true, color: 'accent' },
		{ key: 'memory', header: 'Memory', mono: true, color: 'amber' },
		{ key: 'speedup', header: 'Speedup', mono: true, color: 'emerald' },
		{ key: 'accuracy', header: 'Accuracy', mono: true, color: 'text' }
	];

	const numberFormatsColumns = [
		{ key: 'format', header: 'Format', mono: true, color: 'accent' },
		{ key: 'bits', header: 'Bits', mono: true, color: 'text' },
		{ key: 'bytes', header: 'Bytes', mono: true, color: 'text' },
		{ key: 'range', header: 'Range', color: 'muted' },
		{ key: 'precision', header: 'Precision', color: 'muted' },
		{ key: 'use', header: 'Use Case', color: 'muted' }
	];

	const speculativeConfigsColumns = [
		{ key: 'target', header: 'Target Model', mono: true, color: 'text' },
		{ key: 'draft', header: 'Draft Model', mono: true, color: 'accent' },
		{ key: 'speedup', header: 'Speedup', mono: true, color: 'emerald' },
		{ key: 'note', header: 'Note', color: 'muted' }
	];
</script>

<div class="space-y-6">
	<HeroSection title="Taking Shortcuts: Lossy Optimizations">
		<p class="max-w-3xl leading-relaxed text-[var(--color-muted)] text-[var(--text-body)]">
			When architectural changes aren't enough, we can <span class="font-semibold text-amber-400"
				>trade accuracy for speed</span
			>. Quantization reduces precision, pruning removes parameters, and speculative decoding
			exploits the asymmetry between generation and verification.
		</p>
		<div class="mt-4 flex flex-wrap gap-3">
			<span
				class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-[var(--text-small)] text-amber-400"
			>
				Quantization: 2-4x memory reduction
			</span>
			<span
				class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-[var(--text-small)] text-amber-400"
			>
				Pruning: 30-50% parameter reduction
			</span>
			<span
				class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-[var(--color-accent)] text-[var(--text-small)]"
			>
				Speculative: 2-3x speedup
			</span>
		</div>
	</HeroSection>

	<!-- Number Formats -->
	<Section title="Number Formats for Inference">
		<p class="mb-6 text-[var(--color-muted)] text-[var(--text-small)]">
			Lower precision means less memory and faster computation, but reduced numerical range and
			accuracy.
		</p>

		<DataTable columns={numberFormatsColumns} data={numberFormats} keyField="format" />

		<KeyTakeaway title="Key insight" class="mt-4">
			<p>
				Going from fp16 to int4 gives 4x memory reduction and ~2.5x speedup, with only ~5% accuracy
				loss using modern techniques.
			</p>
		</KeyTakeaway>
	</Section>

	<!-- Quantization Methods -->
	<Section title="Quantization Methods">
		<div class="grid gap-4 md:grid-cols-2">
			{#each quantizationMethods as method (method.name)}
				<ProsConsCard
					title={method.name}
					description={method.description}
					pros={method.pros}
					cons={method.cons}
				/>
			{/each}
		</div>
	</Section>

	<!-- LLM.int8() Deep Dive -->
	<Section title="LLM.int8(): Handling Outliers">
		<div class="grid gap-6 md:grid-cols-2">
			<ContentBox variant="dark" class="">
				<h3 class="mb-3 font-semibold text-[var(--color-primary)]">The Problem</h3>
				<p class="mb-3 text-[var(--color-muted)] text-[var(--text-small)]">
					LLMs have activation outliers - a few features with values 10-100x larger than others.
					Standard quantization clips these, causing huge accuracy loss.
				</p>
				<div class="rounded bg-[var(--color-secondary)] p-2 font-mono text-[var(--text-tiny)]">
					<div class="text-[var(--color-muted)]"># Typical activation distribution</div>
					<div>Normal features: [-1, 1]</div>
					<div class="text-red-400">Outliers: [-100, 100] (0.1% of features)</div>
				</div>
			</ContentBox>

			<ContentBox variant="dark" class="">
				<h3 class="mb-3 font-semibold text-[var(--color-primary)]">The Solution</h3>
				<ol class="space-y-2 text-[var(--color-muted)] text-[var(--text-small)]">
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
			</ContentBox>
		</div>
	</Section>

	<!-- Quantization Results -->
	<Section title="Quantization Results (LLaMA-70B)">
		<DataTable columns={quantizationResultsColumns} data={quantizationResults} keyField="format" />
	</Section>

	<!-- Model Pruning -->
	<Section title="Model Pruning">
		<p class="mb-6 text-[var(--color-muted)] text-[var(--text-small)]">
			Remove parameters that contribute least to model output. Requires careful selection and often
			distillation to recover accuracy.
		</p>

		<div class="grid gap-4 md:grid-cols-3">
			{#each pruningApproaches as approach (approach.name)}
				<ContentBox variant="dark">
					<h3 class="mb-3 font-bold text-[var(--color-primary)]">{approach.name}</h3>
					<p class="mb-3 text-[var(--color-muted)] text-[var(--text-small)]">
						{approach.description}
					</p>
					<div class="space-y-2 text-[var(--text-tiny)]">
						<div class="flex justify-between">
							<span class="text-[var(--color-muted)]">Metric:</span>
							<span class="text-[var(--color-accent)]">{approach.metric}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-[var(--color-muted)]">Typical:</span>
							<span class="text-amber-400">{approach.reduction}</span>
						</div>
					</div>
				</ContentBox>
			{/each}
		</div>

		<div class="mt-4 grid gap-4 md:grid-cols-2">
			<ContentBox variant="dark">
				<h4 class="mb-2 font-semibold text-[var(--color-primary)]">Pruning Recipe</h4>
				<ol class="space-y-1 text-[var(--color-muted)] text-[var(--text-tiny)]">
					<li>1. Identify important layers/heads on calibration set</li>
					<li>2. Remove unimportant components</li>
					<li>3. Distill from original model to recover accuracy</li>
				</ol>
			</ContentBox>
			<ContentBox variant="dark">
				<h4 class="mb-2 font-semibold text-[var(--color-primary)]">From-Scratch Recipe</h4>
				<ol class="space-y-1 text-[var(--color-muted)] text-[var(--text-tiny)]">
					<li>1. Define faster architecture (fewer layers/heads)</li>
					<li>2. Initialize with pruned original weights</li>
					<li>3. Train with distillation from original</li>
				</ol>
			</ContentBox>
		</div>
	</Section>

	<!-- Speculative Decoding Header -->
	<HeroSection title="Speculative Decoding: Lossless Speedup">
		<p class="max-w-3xl leading-relaxed text-[var(--color-muted)] text-[var(--text-body)]">
			Unlike quantization and pruning, speculative decoding is <span
				class="font-semibold text-cyan-400">mathematically exact</span
			>. It exploits the fact that
			<span class="font-semibold text-cyan-400">verification is faster than generation</span>:
			checking k tokens in parallel is faster than generating them one by one.
		</p>
	</HeroSection>

	<!-- Speculative Decoding Steps -->
	<Section title="How Speculative Decoding Works">
		<NumberedSteps steps={speculativeSteps} />

		<KeyTakeaway title="Modified Rejection Sampling" class="mt-6">
			<p>
				Accept token if <code class="text-[var(--color-accent)]"
					>draft_prob(token) ≤ target_prob(token)</code
				>. If rejected, resample from adjusted distribution. This guarantees samples from the exact
				target distribution!
			</p>
		</KeyTakeaway>
	</Section>

	<!-- Speculative Configurations -->
	<Section title="Speculative Decoding Configurations">
		<DataTable columns={speculativeConfigsColumns} data={speculativeConfigs} keyField="draft" />
	</Section>

	<!-- Advanced Speculative Methods -->
	<Section title="Advanced Speculative Methods">
		<div class="grid gap-4 md:grid-cols-2">
			<ProsConsCard
				title="Medusa"
				description="Add multiple 'draft heads' to the target model itself. Each head predicts a future token position."
				pros={['No separate draft model needed', 'Single model deployment']}
				cons={['Requires fine-tuning the heads']}
				reference={{ text: 'Cai et al., ICML 2024', url: 'https://arxiv.org/abs/2401.10774' }}
			/>
			<ProsConsCard
				title="EAGLE"
				description="Draft model uses features from the target model, enabling better draft quality."
				pros={['Higher acceptance rate (~3x speedup)', "Uses target's hidden states"]}
				cons={['More complex integration']}
				reference={{ text: 'Li et al., ICML 2024', url: 'https://arxiv.org/abs/2401.15077' }}
			/>
		</div>
	</Section>

	<!-- Key Takeaways -->
	<div
		class="rounded-xl border border-amber-600/20 bg-gradient-to-br from-amber-600/10 to-[var(--color-primary)]/10 p-6"
	>
		<h2 class="mb-4 text-xl font-bold text-[var(--color-text)]">Key Takeaways</h2>
		<div class="grid gap-4 sm:grid-cols-2">
			<div class="flex items-start gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 font-bold text-[var(--text-small)] text-amber-400"
				>
					1
				</div>
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">
					<span class="font-semibold text-[var(--color-text)]">int4 is practical.</span>
					With AWQ/GPTQ, 4-bit quantization achieves ~95% accuracy with 4x memory savings.
				</p>
			</div>
			<div class="flex items-start gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 font-bold text-[var(--text-small)] text-amber-400"
				>
					2
				</div>
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">
					<span class="font-semibold text-[var(--color-text)]">Outliers need special handling.</span
					>
					LLM.int8() and activation-aware methods handle the 0.1% of outlier features.
				</p>
			</div>
			<div class="flex items-start gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 font-bold text-[var(--text-small)] text-amber-400"
				>
					3
				</div>
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">
					<span class="font-semibold text-[var(--color-text)]">Speculative decoding is exact.</span>
					2-3x speedup with mathematically identical outputs using modified rejection sampling.
				</p>
			</div>
			<div class="flex items-start gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 font-bold text-[var(--text-small)] text-amber-400"
				>
					4
				</div>
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">
					<span class="font-semibold text-[var(--color-text)]">Pruning requires distillation.</span>
					Simply removing parameters loses too much accuracy; distillation recovers it.
				</p>
			</div>
		</div>
	</div>
</div>
