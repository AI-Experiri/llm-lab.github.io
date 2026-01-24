<!-- ABOUTME: Home page with lab cards using shared layout components -->
<!-- ABOUTME: Entry point to all LLM Lab sections -->

<script>
	import { resolve } from '$app/paths';
	import { PageLayout, PageHeader, Footer } from '$lib/layout';
	import { HeroSection } from '$lib/shared';
</script>

<PageLayout>
	<PageHeader
		icon="🔬"
		title="LLM Lab"
		subtitle="Language Modeling from Scratch"
		showHomeLink={false}
	/>

	<HeroSection title="Reference Guide">
		<p class="mt-2 leading-relaxed text-[var(--color-text)] text-[var(--text-small)]">
			A personal reference for training LLMs from scratch. Inspired by Stanford CS336: Language
			Modeling from Scratch (Spring 2025).
		</p>
	</HeroSection>

	<div class="mt-4 grid flex-1 grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		<!-- Tokenizing Lab -->
		<a
			href={resolve('/llm-tokenizing')}
			data-sveltekit-preload-data
			class="group flex flex-col rounded-xl border border-transparent bg-[var(--color-surface)] p-6 transition-all duration-300 hover:border-[var(--color-primary)] hover:bg-[var(--color-secondary)]"
		>
			<div class="mb-4 flex items-center gap-3">
				<div
					class="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-fuchsia-600"
				>
					<svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						/>
					</svg>
				</div>
				<h2
					class="font-semibold text-[var(--color-text)] text-[var(--text-h2)] transition-colors group-hover:text-[var(--color-primary)]"
				>
					Tokenizing Lab
				</h2>
			</div>
			<p class="mb-4 flex-1 text-[var(--color-muted)] text-[var(--text-small)]">
				Visualize BPE, WordPiece, and advanced tokenization algorithms including Scaffold-BPE,
				AdaptBPE, and MorphBPE.
			</p>
			<div class="flex flex-wrap gap-2">
				<span
					class="rounded bg-white/10 px-2 py-1 text-[var(--color-muted)] text-[var(--text-tiny)]"
					>BPE</span
				>
				<span
					class="rounded bg-white/10 px-2 py-1 text-[var(--color-muted)] text-[var(--text-tiny)]"
					>WordPiece</span
				>
				<span
					class="rounded bg-white/10 px-2 py-1 text-[var(--color-muted)] text-[var(--text-tiny)]"
					>MorphBPE</span
				>
			</div>
		</a>

		<!-- Positional Encoding Lab -->
		<a
			href={resolve('/llm-pos-enc')}
			data-sveltekit-preload-data
			class="group flex flex-col rounded-xl border border-transparent bg-[var(--color-surface)] p-6 transition-all duration-300 hover:border-[var(--color-primary)] hover:bg-[var(--color-secondary)]"
		>
			<div class="mb-4 flex items-center gap-3">
				<div
					class="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600"
				>
					<svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
						/>
					</svg>
				</div>
				<h2
					class="font-semibold text-[var(--color-text)] text-[var(--text-h2)] transition-colors group-hover:text-[var(--color-primary)]"
				>
					Positional Encoding
				</h2>
			</div>
			<p class="mb-4 flex-1 text-[var(--color-muted)] text-[var(--text-small)]">
				Explore positional encoding methods from Sinusoidal to RoPE, ALiBi, and modern context
				extension techniques.
			</p>
			<div class="flex flex-wrap gap-2">
				<span
					class="rounded bg-white/10 px-2 py-1 text-[var(--color-muted)] text-[var(--text-tiny)]"
					>RoPE</span
				>
				<span
					class="rounded bg-white/10 px-2 py-1 text-[var(--color-muted)] text-[var(--text-tiny)]"
					>ALiBi</span
				>
				<span
					class="rounded bg-white/10 px-2 py-1 text-[var(--color-muted)] text-[var(--text-tiny)]"
					>YaRN</span
				>
			</div>
		</a>

		<!-- Data Lab -->
		<a
			href={resolve('/llm-data')}
			data-sveltekit-preload-data
			class="group flex flex-col rounded-xl border border-transparent bg-[var(--color-surface)] p-6 transition-all duration-300 hover:border-[var(--color-primary)] hover:bg-[var(--color-secondary)]"
		>
			<div class="mb-4 flex items-center gap-3">
				<div
					class="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-pink-600"
				>
					<svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
						/>
					</svg>
				</div>
				<h2
					class="font-semibold text-[var(--color-text)] text-[var(--text-h2)] transition-colors group-hover:text-[var(--color-primary)]"
				>
					Data Lab
				</h2>
			</div>
			<p class="mb-4 flex-1 text-[var(--color-muted)] text-[var(--text-small)]">
				Explore LLM training datasets, data processing pipelines, and sample data from web crawls,
				curated datasets, and instruction data.
			</p>
			<div class="flex flex-wrap gap-2">
				<span
					class="rounded bg-white/10 px-2 py-1 text-[var(--color-muted)] text-[var(--text-tiny)]"
					>Processing</span
				>
				<span
					class="rounded bg-white/10 px-2 py-1 text-[var(--color-muted)] text-[var(--text-tiny)]"
					>Datasets</span
				>
				<span
					class="rounded bg-white/10 px-2 py-1 text-[var(--color-muted)] text-[var(--text-tiny)]"
					>Samples</span
				>
			</div>
			<div class="mt-4 text-[var(--color-muted)] text-[var(--text-tiny)]">
				CS336 Lectures 13 & 14
			</div>
		</a>

		<!-- Inference Lab -->
		<a
			href={resolve('/llm-inference')}
			data-sveltekit-preload-data
			class="group flex flex-col rounded-xl border border-transparent bg-[var(--color-surface)] p-6 transition-all duration-300 hover:border-[var(--color-primary)] hover:bg-[var(--color-secondary)]"
		>
			<div class="mb-4 flex items-center gap-3">
				<div
					class="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-orange-600 to-amber-600"
				>
					<svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 10V3L4 14h7v7l9-11h-7z"
						/>
					</svg>
				</div>
				<h2
					class="font-semibold text-[var(--color-text)] text-[var(--text-h2)] transition-colors group-hover:text-[var(--color-primary)]"
				>
					Inference Lab
				</h2>
			</div>
			<p class="mb-4 flex-1 text-[var(--color-muted)] text-[var(--text-small)]">
				Deep dive into LLM inference optimization including memory management, KV caching,
				quantization, and speculative decoding.
			</p>
			<div class="flex flex-wrap gap-2">
				<span
					class="rounded bg-white/10 px-2 py-1 text-[var(--color-muted)] text-[var(--text-tiny)]"
					>Optimization</span
				>
				<span
					class="rounded bg-white/10 px-2 py-1 text-[var(--color-muted)] text-[var(--text-tiny)]"
					>Architecture</span
				>
				<span
					class="rounded bg-white/10 px-2 py-1 text-[var(--color-muted)] text-[var(--text-tiny)]"
					>Systems</span
				>
			</div>
			<div class="mt-4 text-[var(--color-muted)] text-[var(--text-tiny)]">CS336 Lecture 10</div>
		</a>

		<!-- Evaluation Lab -->
		<a
			href={resolve('/llm-eval')}
			data-sveltekit-preload-data
			class="group flex flex-col rounded-xl border border-transparent bg-[var(--color-surface)] p-6 transition-all duration-300 hover:border-[var(--color-primary)] hover:bg-[var(--color-secondary)]"
		>
			<div class="mb-4 flex items-center gap-3">
				<div
					class="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600"
				>
					<svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
						/>
					</svg>
				</div>
				<h2
					class="font-semibold text-[var(--color-text)] text-[var(--text-h2)] transition-colors group-hover:text-[var(--color-primary)]"
				>
					Evaluation Lab
				</h2>
			</div>
			<p class="mb-4 flex-1 text-[var(--color-muted)] text-[var(--text-small)]">
				Explore LLM evaluation benchmarks and datasets including MMLU, GSM8K, HumanEval, and safety
				evaluations.
			</p>
			<div class="flex flex-wrap gap-2">
				<span
					class="rounded bg-white/10 px-2 py-1 text-[var(--color-muted)] text-[var(--text-tiny)]"
					>Benchmarks</span
				>
				<span
					class="rounded bg-white/10 px-2 py-1 text-[var(--color-muted)] text-[var(--text-tiny)]"
					>Safety</span
				>
				<span
					class="rounded bg-white/10 px-2 py-1 text-[var(--color-muted)] text-[var(--text-tiny)]"
					>Samples</span
				>
			</div>
			<div class="mt-4 text-[var(--color-muted)] text-[var(--text-tiny)]">CS336 Lecture 12</div>
		</a>

		<!-- Scaling Lab -->
		<a
			href={resolve('/llm-scaling')}
			data-sveltekit-preload-data
			class="group flex flex-col rounded-xl border border-transparent bg-[var(--color-surface)] p-6 transition-all duration-300 hover:border-[var(--color-primary)] hover:bg-[var(--color-secondary)]"
		>
			<div class="mb-4 flex items-center gap-3">
				<div
					class="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-600 to-emerald-600"
				>
					<svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
						/>
					</svg>
				</div>
				<h2
					class="font-semibold text-[var(--color-text)] text-[var(--text-h2)] transition-colors group-hover:text-[var(--color-primary)]"
				>
					Scaling Lab
				</h2>
			</div>
			<p class="mb-4 flex-1 text-[var(--color-muted)] text-[var(--text-small)]">
				Understand LLM scaling laws from Hestness 2017 to Kaplan 2020, Chinchilla, and muP with
				real-world case studies.
			</p>
			<div class="flex flex-wrap gap-2">
				<span
					class="rounded bg-white/10 px-2 py-1 text-[var(--color-muted)] text-[var(--text-tiny)]"
					>Chinchilla</span
				>
				<span
					class="rounded bg-white/10 px-2 py-1 text-[var(--color-muted)] text-[var(--text-tiny)]"
					>muP</span
				>
				<span
					class="rounded bg-white/10 px-2 py-1 text-[var(--color-muted)] text-[var(--text-tiny)]"
					>Case Studies</span
				>
			</div>
			<div class="mt-4 text-[var(--color-muted)] text-[var(--text-tiny)]">
				CS336 Lectures 9 & 11
			</div>
		</a>
	</div>

	<Footer />
</PageLayout>
