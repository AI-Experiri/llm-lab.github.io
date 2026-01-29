<!-- ABOUTME: Overview page for LLM Inference fundamentals -->
<!-- ABOUTME: Covers why inference matters, key metrics, and compute analysis -->

<script>
	import { HeroSection, Section, ContentBox, KeyTakeaway } from '$lib/shared';

	// Key metrics
	const keyMetrics = [
		{
			name: 'TTFT',
			fullName: 'Time to First Token',
			description: 'How long until the first token is generated',
			importance: 'Critical for interactive applications'
		},
		{
			name: 'Latency',
			fullName: 'Seconds per Token',
			description: 'Time to generate each subsequent token',
			importance: 'Determines perceived speed'
		},
		{
			name: 'Throughput',
			fullName: 'Tokens per Second',
			description: 'Total tokens generated across all requests',
			importance: 'Determines serving cost'
		}
	];

	// Inference contexts
	const inferenceContexts = [
		{ context: 'Chatbots & Assistants', desc: 'Interactive Q&A, code completion' },
		{ context: 'Model Evaluation', desc: 'Running benchmarks, perplexity calculation' },
		{ context: 'Test-Time Compute', desc: 'Chain-of-thought, self-consistency' },
		{ context: 'RL Training', desc: 'Sampling from policy during RLHF' }
	];
</script>

<div class="space-y-6">
	<HeroSection title="Why Inference Efficiency Matters">
		<p class="max-w-3xl leading-relaxed text-[var(--color-muted)] text-[var(--text-body)]">
			Training a model is a
			<span class="font-semibold text-[var(--color-primary)]">one-time cost</span>. Inference
			happens
			<span class="font-semibold text-[var(--color-primary)]">every time</span> someone uses the model.
			A model trained once may be queried billions of times - making inference optimization critical for
			cost and latency.
		</p>
		<div class="mt-4 flex flex-wrap gap-3">
			<span
				class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-[var(--color-accent)] text-[var(--text-small)]"
			>
				Training: Parallelizable
			</span>
			<span
				class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-[var(--color-accent)] text-[var(--text-small)]"
			>
				Inference: Sequential
			</span>
			<span
				class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-[var(--color-accent)] text-[var(--text-small)]"
			>
				Generation: Memory-Limited
			</span>
		</div>
	</HeroSection>

	<!-- Where Inference Happens -->
	<Section title="Where Inference Happens">
		<p class="mb-6 text-[var(--color-muted)] text-[var(--text-small)]">
			Inference isn't just chatbots - it appears throughout the ML pipeline in surprising places.
		</p>
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{#each inferenceContexts as ctx (ctx.context)}
				<ContentBox
					title={ctx.context}
					variant="dark"
					class="transition-colors hover:border-[var(--color-primary)]/50"
				>
					<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">{ctx.desc}</p>
				</ContentBox>
			{/each}
		</div>
	</Section>

	<!-- Key Performance Metrics -->
	<Section title="Key Performance Metrics">
		<div class="grid gap-4 md:grid-cols-3">
			{#each keyMetrics as metric (metric.name)}
				<ContentBox variant="dark" class="transition-colors hover:border-[var(--color-primary)]/50">
					<div class="mb-3">
						<h3 class="font-bold text-[var(--color-primary)]">{metric.name}</h3>
						<span class="text-[var(--color-muted)] text-[var(--text-tiny)]">{metric.fullName}</span>
					</div>
					<p class="mb-2 text-[var(--color-muted)] text-[var(--text-small)]">
						{metric.description}
					</p>
					<div
						class="rounded bg-[var(--color-secondary)] px-2 py-1 text-[var(--color-text)]/70 text-[var(--text-tiny)]"
					>
						{metric.importance}
					</div>
				</ContentBox>
			{/each}
		</div>
	</Section>

	<!-- Two Stages of Inference -->
	<Section title="Two Stages of Inference">
		<p class="mb-6 text-[var(--color-muted)] text-[var(--text-small)]">
			Inference has fundamentally different compute characteristics depending on the stage.
		</p>
		<div class="grid gap-6 md:grid-cols-2">
			<ContentBox variant="dark" class="border-2 border-green-500/30">
				<div class="mb-3">
					<h3 class="font-bold text-green-400">Prefill Stage</h3>
					<span class="text-[var(--color-muted)] text-[var(--text-tiny)]"
						>Processing the prompt</span
					>
				</div>
				<ul class="space-y-2 text-[var(--color-muted)] text-[var(--text-small)]">
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
				<div class="mt-3 rounded bg-[var(--color-secondary)] p-2 text-[var(--text-tiny)]">
					<span class="text-[var(--color-muted)]">Arithmetic Intensity:</span>
					<span class="font-mono text-[var(--color-accent)]">S/2</span>
					<span class="text-[var(--color-muted)]">(high for long prompts)</span>
				</div>
			</ContentBox>

			<ContentBox variant="dark" class="border-2 border-red-500/30">
				<div class="mb-3">
					<h3 class="font-bold text-red-400">Generation Stage</h3>
					<span class="text-[var(--color-muted)] text-[var(--text-tiny)]"
						>Producing output tokens</span
					>
				</div>
				<ul class="space-y-2 text-[var(--color-muted)] text-[var(--text-small)]">
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
				<div class="mt-3 rounded bg-[var(--color-secondary)] p-2 text-[var(--text-tiny)]">
					<span class="text-[var(--color-muted)]">Arithmetic Intensity:</span>
					<span class="font-mono text-[var(--color-accent)]">&lt;1</span>
					<span class="text-[var(--color-muted)]">(very low!)</span>
				</div>
			</ContentBox>
		</div>
	</Section>

	<!-- References -->
	<Section title="References">
		<ul class="space-y-2 text-[var(--text-small)]">
			<li class="flex items-start gap-3">
				<span class="font-medium text-[var(--color-primary)]">1.</span>
				<div>
					<a
						href="https://stanford-cs336.github.io/spring2025/"
						target="_blank"
						rel="noopener noreferrer external"
						class="text-[var(--color-accent)] hover:underline"
					>
						Stanford CS336: Language Modeling from Scratch
					</a>
					<span class="text-[var(--color-muted)]"> — Lecture 10: Inference</span>
				</div>
			</li>
			<li class="flex items-start gap-3">
				<span class="font-medium text-[var(--color-primary)]">2.</span>
				<div>
					<a
						href="https://arxiv.org/abs/2309.06180"
						target="_blank"
						rel="noopener noreferrer external"
						class="text-[var(--color-accent)] hover:underline"
					>
						Efficient Memory Management for Large Language Model Serving with PagedAttention
					</a>
					<span class="text-[var(--color-muted)]"> — Kwon et al. (2023)</span>
				</div>
			</li>
			<li class="flex items-start gap-3">
				<span class="font-medium text-[var(--color-primary)]">3.</span>
				<div>
					<a
						href="https://arxiv.org/abs/2205.14135"
						target="_blank"
						rel="noopener noreferrer external"
						class="text-[var(--color-accent)] hover:underline"
					>
						FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness
					</a>
					<span class="text-[var(--color-muted)]"> — Dao et al. (2022)</span>
				</div>
			</li>
			<li class="flex items-start gap-3">
				<span class="font-medium text-[var(--color-primary)]">4.</span>
				<div>
					<a
						href="https://arxiv.org/abs/2302.01318"
						target="_blank"
						rel="noopener noreferrer external"
						class="text-[var(--color-accent)] hover:underline"
					>
						Fast Inference from Transformers via Speculative Decoding
					</a>
					<span class="text-[var(--color-muted)]"> — Leviathan et al. (2023)</span>
				</div>
			</li>
		</ul>
	</Section>

	<KeyTakeaway
		items={[
			'Training is one-time, inference is forever. Optimization effort at inference has multiplicative returns.',
			'Generation is memory-limited. Matrix-vector products have arithmetic intensity ~1, wasting GPU compute.',
			'Prefill vs Generation are different. Prefill is parallelizable and compute-limited; generation is sequential and memory-limited.',
			'Batching helps MLP but not attention. Attention intensity depends on sequence length, not batch size.'
		]}
	/>
</div>
