<!-- ABOUTME: Evaluation overview page with framework, benchmarks, and metrics -->
<!-- ABOUTME: Refactored to use shared components for consistent styling -->

<script>
	import { Section, ContentBox, KeyTakeaway, HeroSection, CategoryList } from '$lib/shared';

	const benchmarkCategories = [
		{
			label: 'Knowledge',
			description: 'MMLU, MMLU-Pro, TriviaQA - factual recall',
			color: 'purple'
		},
		{ label: 'Expert-Level', description: "GPQA (PhD-level), Humanity's Last Exam", color: 'blue' },
		{ label: 'Math', description: 'GSM8K, MATH - problem solving', color: 'yellow' },
		{ label: 'Coding', description: 'HumanEval, MBPP - programming', color: 'green' },
		{ label: 'Instruction', description: 'IFEval, AlpacaEval, Chatbot Arena', color: 'cyan' },
		{ label: 'Agents', description: 'SWE-bench, CyBench, MLEBench', color: 'orange' },
		{ label: 'Safety', description: 'TruthfulQA, HarmBench, AIR-Bench', color: 'red' }
	];
</script>

<div class="space-y-6">
	<HeroSection title="Evaluation is How We Understand Models">
		<p class="max-w-3xl leading-relaxed text-[var(--color-muted)] text-[var(--text-body)]">
			Without evaluation, we're flying blind.
			<span class="font-semibold text-[var(--color-primary)]"
				>How do we know if a model is "good"?</span
			>
			Evaluation provides the framework, benchmarks, and metrics for measuring LLM capabilities across
			knowledge, reasoning, coding, and safety.
		</p>
		<div class="mt-4 flex flex-wrap gap-3">
			<span
				class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-[var(--color-accent)] text-[var(--text-small)]"
			>
				Purchase Decisions
			</span>
			<span
				class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-[var(--color-accent)] text-[var(--text-small)]"
			>
				Scientific Progress
			</span>
			<span
				class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-[var(--color-accent)] text-[var(--text-small)]"
			>
				Development Feedback
			</span>
			<span
				class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-[var(--color-accent)] text-[var(--text-small)]"
			>
				Policy & Safety
			</span>
		</div>
	</HeroSection>

	<!-- Why Evaluation Matters -->
	<Section title="Why Evaluation Matters">
		<p class="mb-6 text-[var(--color-muted)] text-[var(--text-small)]">
			Different stakeholders need evaluation for different reasons.
		</p>
		<div class="grid gap-4 md:grid-cols-4">
			<ContentBox variant="dark" class="transition-colors hover:border-blue-500/50">
				<div class="mb-3 flex items-center gap-3">
					<span class="text-3xl">🛒</span>
					<h3 class="font-bold text-blue-300">Purchase Decision</h3>
				</div>
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">
					Which model is best for my use case? Compare capabilities vs cost.
				</p>
			</ContentBox>
			<ContentBox variant="dark" class="transition-colors hover:border-purple-500/50">
				<div class="mb-3 flex items-center gap-3">
					<span class="text-3xl">🔬</span>
					<h3 class="font-bold text-purple-300">Scientific Progress</h3>
				</div>
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">
					Are we actually advancing AI capabilities? Track progress over time.
				</p>
			</ContentBox>
			<ContentBox variant="dark" class="transition-colors hover:border-green-500/50">
				<div class="mb-3 flex items-center gap-3">
					<span class="text-3xl">🔧</span>
					<h3 class="font-bold text-green-300">Development Feedback</h3>
				</div>
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">
					How can we improve the model? Identify weaknesses and guide training.
				</p>
			</ContentBox>
			<ContentBox variant="dark" class="transition-colors hover:border-red-500/50">
				<div class="mb-3 flex items-center gap-3">
					<span class="text-3xl">⚖️</span>
					<h3 class="font-bold text-red-300">Policy & Safety</h3>
				</div>
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">
					What are the benefits and harms? Inform regulations and deployment.
				</p>
			</ContentBox>
		</div>
	</Section>

	<!-- Evaluation Framework -->
	<Section title="Evaluation Framework">
		<div class="grid gap-3 text-[var(--text-tiny)] md:grid-cols-4">
			<ContentBox variant="dark" class="border border-indigo-800/30">
				<div class="mb-1 flex items-center gap-2">
					<span
						class="flex h-5 w-5 items-center justify-center rounded bg-indigo-600 text-[10px] font-bold text-white"
						>1</span
					>
					<span class="font-medium text-indigo-300">Inputs</span>
				</div>
				<p class="text-[var(--color-muted)]">
					Where do prompts come from? What use cases are covered? Tail distribution?
				</p>
			</ContentBox>
			<ContentBox variant="dark" class="border border-cyan-800/30">
				<div class="mb-1 flex items-center gap-2">
					<span
						class="flex h-5 w-5 items-center justify-center rounded bg-cyan-600 text-[10px] font-bold text-white"
						>2</span
					>
					<span class="font-medium text-cyan-300">Calling Model</span>
				</div>
				<p class="text-[var(--color-muted)]">
					Zero-shot vs few-shot? Chain of thought? Tool use or RAG?
				</p>
			</ContentBox>
			<ContentBox variant="dark" class="border border-amber-800/30">
				<div class="mb-1 flex items-center gap-2">
					<span
						class="flex h-5 w-5 items-center justify-center rounded bg-amber-600 text-[10px] font-bold text-white"
						>3</span
					>
					<span class="font-medium text-amber-300">Outputs</span>
				</div>
				<p class="text-[var(--color-muted)]">
					Reference outputs clean? What metrics - pass@1, pass@10? Cost factored?
				</p>
			</ContentBox>
			<ContentBox variant="dark" class="border border-rose-800/30">
				<div class="mb-1 flex items-center gap-2">
					<span
						class="flex h-5 w-5 items-center justify-center rounded bg-rose-600 text-[10px] font-bold text-white"
						>4</span
					>
					<span class="font-medium text-rose-300">Interpretation</span>
				</div>
				<p class="text-[var(--color-muted)]">
					Does 91% mean it's good enough? Train-test overlap? Method vs system?
				</p>
			</ContentBox>
		</div>
	</Section>

	<!-- Benchmark Categories + Metrics side by side -->
	<div class="grid gap-4 lg:grid-cols-2">
		<!-- Benchmark Categories -->
		<Section title="Benchmark Categories">
			<CategoryList items={benchmarkCategories} />
		</Section>

		<!-- Evaluation Metrics -->
		<Section title="Evaluation Metrics">
			<div class="space-y-2">
				<ContentBox variant="dark" class="border border-orange-800/30">
					<div class="mb-1 flex items-center gap-2">
						<span class="h-2 w-2 rounded-full bg-orange-500"></span>
						<h4 class="font-medium text-[var(--text-small)] text-orange-300">Perplexity</h4>
						<span class="ml-auto text-[var(--text-tiny)] text-orange-400">Lower = better</span>
					</div>
					<p class="mb-1.5 text-[var(--color-muted)] text-[var(--text-tiny)]">
						Measures model "surprise" at text. PPL of 10 = as uncertain as choosing from 10 options.
						All scaling laws use perplexity.
					</p>
					<div class="flex flex-wrap gap-2 text-[var(--text-tiny)]">
						<span><span class="text-green-400">+</span> Smooth, universal</span>
						<span><span class="text-red-400">-</span> Not task-specific</span>
					</div>
				</ContentBox>
				<ContentBox variant="dark" class="border border-emerald-800/30">
					<div class="mb-1 flex items-center gap-2">
						<span class="h-2 w-2 rounded-full bg-emerald-500"></span>
						<h4 class="font-medium text-[var(--text-small)] text-emerald-300">Accuracy</h4>
						<span class="ml-auto text-[var(--text-tiny)] text-emerald-400">Higher = better</span>
					</div>
					<p class="mb-1.5 text-[var(--color-muted)] text-[var(--text-tiny)]">
						Fraction correct. Multiple-choice, exact match, or pass/fail code execution. Can get
						correct for wrong reasons if benchmark is gameable.
					</p>
					<div class="flex flex-wrap gap-2 text-[var(--text-tiny)]">
						<span><span class="text-green-400">+</span> Easy to interpret</span>
						<span><span class="text-red-400">-</span> Prompt sensitive</span>
					</div>
				</ContentBox>
			</div>
		</Section>
	</div>

	<!-- Perplexity Deep Dive -->
	<Section title="Perplexity: A Deeper Look">
		<div class="space-y-2">
			<ContentBox variant="dark" class="border border-[var(--color-secondary)]">
				<h4 class="mb-2 font-medium text-[var(--text-small)] text-green-400">Why It's Useful</h4>
				<div
					class="grid grid-cols-2 gap-x-6 gap-y-1 text-[var(--color-muted)] text-[var(--text-tiny)]"
				>
					<span
						><span class="text-green-400">+</span> <strong>Smooth metric</strong> - scaling laws use it
						because curves fit better</span
					>
					<span
						><span class="text-green-400">+</span> <strong>Universal</strong> - pays for everything in
						the distribution</span
					>
					<span
						><span class="text-green-400">+</span> <strong>Not gameable</strong> - hard to hack unlike
						accuracy benchmarks</span
					>
					<span
						><span class="text-green-400">+</span> <strong>No labels needed</strong> - just need text
						data</span
					>
				</div>
			</ContentBox>
			<ContentBox variant="dark" class="border border-red-900/30">
				<h4 class="mb-2 font-medium text-[var(--text-small)] text-red-400">Important Caveats</h4>
				<div
					class="grid grid-cols-2 gap-x-6 gap-y-1 text-[var(--color-muted)] text-[var(--text-tiny)]"
				>
					<span
						><span class="text-red-400">!</span> <strong>Not always correlated with tasks</strong> - correlation
						is "all over the place"</span
					>
					<span
						><span class="text-red-400">!</span> <strong>Requires deep access</strong> - need logits/probabilities</span
					>
					<span
						><span class="text-red-400">!</span> <strong>Easy to screw up</strong> - tokenizer mismatches
						make comparison invalid</span
					>
					<span
						><span class="text-red-400">!</span>
						<strong>Different tokenizers = incomparable</strong></span
					>
				</div>
			</ContentBox>
			<ContentBox variant="dark" class="border border-blue-900/30">
				<h4 class="mb-2 font-medium text-[var(--text-small)] text-blue-400">
					Perplexity-like Tasks (Saturated)
				</h4>
				<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">
					Tasks like <strong>LAMBADA</strong> (predict last word) and <strong>HellaSwag</strong> (choose
					continuation) are essentially perplexity measures and have been "obliterated" by modern LLMs.
				</p>
			</ContentBox>
		</div>
	</Section>

	<!-- Issues & Considerations -->
	<Section title="Key Issues in Evaluation">
		<div class="grid gap-2 text-[var(--text-tiny)] sm:grid-cols-2 lg:grid-cols-4">
			<ContentBox variant="dark" class="border border-red-900/30">
				<span class="font-medium text-red-400">Train-Test Contamination</span>
				<p class="mt-1 text-[var(--color-muted)]">
					Training on web data may include test sets. 13-gram dedup helps but paraphrases slip
					through.
				</p>
			</ContentBox>
			<ContentBox variant="dark" class="border border-yellow-900/30">
				<span class="font-medium text-yellow-400">Benchmark Gaming</span>
				<p class="mt-1 text-[var(--color-muted)]">
					Goodhart's Law: once measured, it gets hacked. MMLU may be saturated or gamed.
				</p>
			</ContentBox>
			<ContentBox variant="dark" class="border border-blue-900/30">
				<span class="font-medium text-blue-400">LLM as Judge Bias</span>
				<p class="mt-1 text-[var(--color-muted)]">
					GPT-4 judging prefers longer responses. AlpacaEval had to add length correction.
				</p>
			</ContentBox>
			<ContentBox variant="dark" class="border border-purple-900/30">
				<span class="font-medium text-purple-400">Asking vs Quizzing</span>
				<p class="mt-1 text-[var(--color-muted)]">
					Standardized exams = quizzing. Real users ask questions they don't know answers to.
				</p>
			</ContentBox>
		</div>
	</Section>

	<!-- Key Takeaways -->
	<Section title="Key Takeaways">
		<div class="grid gap-2 text-[var(--text-tiny)] sm:grid-cols-2 lg:grid-cols-4">
			<ContentBox variant="dark" class="border border-pink-900/30">
				<div class="mb-1 flex items-center gap-2">
					<span
						class="flex h-5 w-5 items-center justify-center rounded bg-pink-600 text-[10px] font-bold text-white"
						>1</span
					>
					<span class="font-medium text-pink-400">No Single Eval</span>
				</div>
				<p class="text-[var(--color-muted)]">Choose based on what you're trying to measure</p>
			</ContentBox>
			<ContentBox variant="dark" class="border border-violet-900/30">
				<div class="mb-1 flex items-center gap-2">
					<span
						class="flex h-5 w-5 items-center justify-center rounded bg-violet-600 text-[10px] font-bold text-white"
						>2</span
					>
					<span class="font-medium text-violet-400">Look at Instances</span>
				</div>
				<p class="text-[var(--color-muted)]">Aggregate scores hide important details</p>
			</ContentBox>
			<ContentBox variant="dark" class="border border-sky-900/30">
				<div class="mb-1 flex items-center gap-2">
					<span
						class="flex h-5 w-5 items-center justify-center rounded bg-sky-600 text-[10px] font-bold text-white"
						>3</span
					>
					<span class="font-medium text-sky-400">Multiple Aspects</span>
				</div>
				<p class="text-[var(--color-muted)]">Capabilities + safety + cost. Use Pareto frontiers</p>
			</ContentBox>
			<ContentBox variant="dark" class="border border-teal-900/30">
				<div class="mb-1 flex items-center gap-2">
					<span
						class="flex h-5 w-5 items-center justify-center rounded bg-teal-600 text-[10px] font-bold text-white"
						>4</span
					>
					<span class="font-medium text-teal-400">Methods vs Systems</span>
				</div>
				<p class="text-[var(--color-muted)]">Define what exactly is being evaluated</p>
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
					<span class="text-[var(--color-muted)]"> — Lecture 12: Evaluation</span>
				</div>
			</li>
			<li class="flex items-start gap-3">
				<span class="font-medium text-[var(--color-primary)]">2.</span>
				<div>
					<a
						href="https://www.evidentlyai.com/llm-evaluation-benchmarks-datasets"
						target="_blank"
						rel="noopener noreferrer external"
						class="text-[var(--color-accent)] hover:underline"
					>
						Evidently AI - 250 LLM Evaluation Benchmarks & Datasets
					</a>
				</div>
			</li>
			<li class="flex items-start gap-3">
				<span class="font-medium text-[var(--color-primary)]">3.</span>
				<div>
					<a
						href="https://huggingface.co/docs/datasets-server"
						target="_blank"
						rel="noopener noreferrer external"
						class="text-[var(--color-accent)] hover:underline"
					>
						HuggingFace Datasets Server API
					</a>
				</div>
			</li>
		</ul>
	</Section>

	<KeyTakeaway title="Next Step">
		<p>
			Go to <span class="font-semibold text-[var(--color-primary)]">Sample Data</span> to explore actual
			evaluation datasets from HuggingFace.
		</p>
	</KeyTakeaway>
</div>
