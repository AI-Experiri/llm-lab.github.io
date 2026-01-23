<script>
	// Home page - evaluation introduction from Stanford CS336 Lecture 12
</script>

<div class="space-y-4">
	<!-- Hero + Why Evaluate -->
	<div class="grid gap-4 lg:grid-cols-2">
		<!-- Hero -->
		<section
			class="rounded-lg border border-[#0f3460] bg-gradient-to-br from-[#16213e] to-[#1a1a2e] p-4"
		>
			<h2 class="mb-2 font-bold text-[var(--color-primary)] text-[var(--text-h2)]">
				Evaluation: How "Good" is a Model?
			</h2>
			<p class="leading-relaxed text-[var(--color-text)] text-[var(--text-small)]">
				Evaluation looks simple but is far from it. Models are evaluated on benchmarks like MMLU,
				MATH, GPQA, and SWE-bench. But what are these benchmarks? What do the numbers actually mean?
			</p>
			<p class="mt-2 text-[var(--color-muted)] text-[var(--text-tiny)] italic">
				Based on Stanford CS336 Lecture 12 - Language Modeling from Scratch
			</p>
		</section>

		<!-- Why Evaluate -->
		<section class="rounded-lg bg-[var(--color-surface)] p-4">
			<h3 class="mb-2 font-semibold text-[var(--color-primary)] text-[var(--text-body)]">
				Why Evaluate? (Different Goals)
			</h3>
			<div class="grid grid-cols-2 gap-2 text-[var(--text-tiny)]">
				<div class="rounded border-l-2 border-blue-500 bg-[var(--color-bg)] p-2">
					<span class="font-medium text-blue-300">Purchase Decision</span>
					<p class="text-[var(--color-muted)]">Which model for my use case?</p>
				</div>
				<div class="rounded border-l-2 border-purple-500 bg-[var(--color-bg)] p-2">
					<span class="font-medium text-purple-300">Scientific Progress</span>
					<p class="text-[var(--color-muted)]">Are we advancing AI capabilities?</p>
				</div>
				<div class="rounded border-l-2 border-green-500 bg-[var(--color-bg)] p-2">
					<span class="font-medium text-green-300">Development Feedback</span>
					<p class="text-[var(--color-muted)]">How to improve the model?</p>
				</div>
				<div class="rounded border-l-2 border-red-500 bg-[var(--color-bg)] p-2">
					<span class="font-medium text-red-300">Policy & Safety</span>
					<p class="text-[var(--color-muted)]">Benefits and harms assessment</p>
				</div>
			</div>
		</section>
	</div>

	<!-- Evaluation Framework -->
	<section class="rounded-lg bg-[var(--color-surface)] p-4">
		<h3 class="mb-3 font-semibold text-[var(--color-primary)] text-[var(--text-body)]">
			Evaluation Framework
		</h3>
		<div class="grid gap-3 text-[var(--text-tiny)] md:grid-cols-4">
			<div
				class="rounded-lg border border-indigo-800/30 bg-gradient-to-br from-indigo-900/30 to-transparent p-3"
			>
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
			</div>
			<div
				class="rounded-lg border border-cyan-800/30 bg-gradient-to-br from-cyan-900/30 to-transparent p-3"
			>
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
			</div>
			<div
				class="rounded-lg border border-amber-800/30 bg-gradient-to-br from-amber-900/30 to-transparent p-3"
			>
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
			</div>
			<div
				class="rounded-lg border border-rose-800/30 bg-gradient-to-br from-rose-900/30 to-transparent p-3"
			>
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
			</div>
		</div>
	</section>

	<!-- Benchmark Categories + Metrics side by side -->
	<div class="grid gap-4 lg:grid-cols-2">
		<!-- Benchmark Categories -->
		<section class="rounded-lg bg-[var(--color-surface)] p-4">
			<h3 class="mb-3 font-semibold text-[var(--color-primary)] text-[var(--text-body)]">
				Benchmark Categories
			</h3>
			<div class="space-y-1.5 text-[var(--text-tiny)]">
				<div
					class="flex items-center gap-2 rounded border-l-2 border-purple-500 bg-gradient-to-r from-purple-900/40 to-transparent px-2 py-1.5"
				>
					<span class="w-24 font-medium text-purple-300">Knowledge</span>
					<span class="text-[var(--color-muted)]">MMLU, MMLU-Pro, TriviaQA - factual recall</span>
				</div>
				<div
					class="flex items-center gap-2 rounded border-l-2 border-blue-500 bg-gradient-to-r from-blue-900/40 to-transparent px-2 py-1.5"
				>
					<span class="w-24 font-medium text-blue-300">Expert-Level</span>
					<span class="text-[var(--color-muted)]">GPQA (PhD-level), Humanity's Last Exam</span>
				</div>
				<div
					class="flex items-center gap-2 rounded border-l-2 border-yellow-500 bg-gradient-to-r from-yellow-900/40 to-transparent px-2 py-1.5"
				>
					<span class="w-24 font-medium text-yellow-300">Math</span>
					<span class="text-[var(--color-muted)]">GSM8K, MATH - problem solving</span>
				</div>
				<div
					class="flex items-center gap-2 rounded border-l-2 border-green-500 bg-gradient-to-r from-green-900/40 to-transparent px-2 py-1.5"
				>
					<span class="w-24 font-medium text-green-300">Coding</span>
					<span class="text-[var(--color-muted)]">HumanEval, MBPP - programming</span>
				</div>
				<div
					class="flex items-center gap-2 rounded border-l-2 border-cyan-500 bg-gradient-to-r from-cyan-900/40 to-transparent px-2 py-1.5"
				>
					<span class="w-24 font-medium text-cyan-300">Instruction</span>
					<span class="text-[var(--color-muted)]">IFEval, AlpacaEval, Chatbot Arena</span>
				</div>
				<div
					class="flex items-center gap-2 rounded border-l-2 border-orange-500 bg-gradient-to-r from-orange-900/40 to-transparent px-2 py-1.5"
				>
					<span class="w-24 font-medium text-orange-300">Agents</span>
					<span class="text-[var(--color-muted)]">SWE-bench, CyBench, MLEBench</span>
				</div>
				<div
					class="flex items-center gap-2 rounded border-l-2 border-red-500 bg-gradient-to-r from-red-900/40 to-transparent px-2 py-1.5"
				>
					<span class="w-24 font-medium text-red-300">Safety</span>
					<span class="text-[var(--color-muted)]">TruthfulQA, HarmBench, AIR-Bench</span>
				</div>
			</div>
		</section>

		<!-- Evaluation Metrics -->
		<section class="rounded-lg bg-[var(--color-surface)] p-4">
			<h3 class="mb-3 font-semibold text-[var(--color-primary)] text-[var(--text-body)]">
				Evaluation Metrics
			</h3>
			<div class="space-y-2">
				<div
					class="rounded-lg border border-orange-800/30 bg-gradient-to-r from-orange-900/30 to-[var(--color-secondary)] p-3"
				>
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
				</div>
				<div
					class="rounded-lg border border-emerald-800/30 bg-gradient-to-r from-emerald-900/30 to-[var(--color-secondary)] p-3"
				>
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
				</div>
			</div>
		</section>
	</div>

	<!-- Perplexity Deep Dive -->
	<section class="rounded-lg bg-[var(--color-surface)] p-4">
		<h3 class="mb-3 font-semibold text-[var(--color-primary)] text-[var(--text-body)]">
			Perplexity: A Deeper Look
		</h3>
		<div class="grid gap-3 lg:grid-cols-2">
			<div class="space-y-2">
				<div
					class="rounded-lg border border-orange-800/30 bg-gradient-to-r from-orange-900/30 to-[var(--color-secondary)] p-3"
				>
					<div class="mb-1 flex items-center gap-2">
						<span class="h-2 w-2 rounded-full bg-orange-500"></span>
						<h4 class="font-medium text-[var(--text-small)] text-orange-300">
							What is Perplexity?
						</h4>
						<span class="ml-auto text-[var(--text-tiny)] text-orange-400">Lower = better</span>
					</div>
					<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">
						Measures model "surprise" at text. PPL of 10 = as uncertain as choosing uniformly from
						10 options. Defined as exp(cross-entropy loss) against a validation set.
					</p>
				</div>
				<div class="rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)] p-3">
					<h4 class="mb-2 font-medium text-[var(--text-small)] text-green-400">Why It's Useful</h4>
					<ul class="space-y-1 text-[var(--color-muted)] text-[var(--text-tiny)]">
						<li>
							<span class="text-green-400">+</span> <strong>Smooth metric</strong> - all scaling laws
							use perplexity because curves fit better than task accuracy
						</li>
						<li>
							<span class="text-green-400">+</span> <strong>Universal</strong> - pays for everything in
							the distribution, not just right/wrong
						</li>
						<li>
							<span class="text-green-400">+</span> <strong>Not gameable</strong> - as long as train/test
							are separate, hard to hack unlike accuracy benchmarks
						</li>
						<li>
							<span class="text-green-400">+</span> <strong>No labels needed</strong> - just need text
							data for evaluation
						</li>
					</ul>
				</div>
			</div>
			<div class="space-y-2">
				<div class="rounded-lg border border-red-900/30 bg-[var(--color-bg)] p-3">
					<h4 class="mb-2 font-medium text-[var(--text-small)] text-red-400">Important Caveats</h4>
					<ul class="space-y-1 text-[var(--color-muted)] text-[var(--text-tiny)]">
						<li>
							<span class="text-red-400">!</span> <strong>Not always correlated with tasks</strong> -
							correlation with downstream performance is "all over the place"
						</li>
						<li>
							<span class="text-red-400">!</span> <strong>Requires deep access</strong> - need logits/probabilities,
							not just API outputs
						</li>
						<li>
							<span class="text-red-400">!</span> <strong>Easy to screw up</strong> - vocabulary/tokenizer
							mismatches make comparison invalid
						</li>
						<li>
							<span class="text-red-400">!</span>
							<strong>Different tokenizers = incomparable</strong> - can't compare PPL across models with
							different vocabularies
						</li>
					</ul>
				</div>
				<div class="rounded-lg border border-blue-900/30 bg-[var(--color-bg)] p-3">
					<h4 class="mb-2 font-medium text-[var(--text-small)] text-blue-400">
						Perplexity-like Tasks (Saturated)
					</h4>
					<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">
						Tasks like <strong>LAMBADA</strong> (predict last word) and <strong>HellaSwag</strong> (choose
						continuation) are essentially perplexity measures and have been "obliterated" by modern LLMs.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Issues & Considerations -->
	<section class="rounded-lg bg-[var(--color-surface)] p-4">
		<h3 class="mb-3 font-semibold text-[var(--color-primary)] text-[var(--text-body)]">
			Key Issues in Evaluation
		</h3>
		<div class="grid gap-2 text-[var(--text-tiny)] sm:grid-cols-2 lg:grid-cols-4">
			<div
				class="rounded-lg border border-red-900/30 bg-gradient-to-br from-red-900/20 to-[var(--color-bg)] p-2.5"
			>
				<span class="font-medium text-red-400">Train-Test Contamination</span>
				<p class="mt-1 text-[var(--color-muted)]">
					Training on web data may include test sets. 13-gram dedup helps but paraphrases slip
					through.
				</p>
			</div>
			<div
				class="rounded-lg border border-yellow-900/30 bg-gradient-to-br from-yellow-900/20 to-[var(--color-bg)] p-2.5"
			>
				<span class="font-medium text-yellow-400">Benchmark Gaming</span>
				<p class="mt-1 text-[var(--color-muted)]">
					Goodhart's Law: once measured, it gets hacked. MMLU may be saturated or gamed.
				</p>
			</div>
			<div
				class="rounded-lg border border-blue-900/30 bg-gradient-to-br from-blue-900/20 to-[var(--color-bg)] p-2.5"
			>
				<span class="font-medium text-blue-400">LLM as Judge Bias</span>
				<p class="mt-1 text-[var(--color-muted)]">
					GPT-4 judging prefers longer responses. AlpacaEval had to add length correction.
				</p>
			</div>
			<div
				class="rounded-lg border border-purple-900/30 bg-gradient-to-br from-purple-900/20 to-[var(--color-bg)] p-2.5"
			>
				<span class="font-medium text-purple-400">Asking vs Quizzing</span>
				<p class="mt-1 text-[var(--color-muted)]">
					Standardized exams = quizzing. Real users ask questions they don't know answers to.
				</p>
			</div>
		</div>
	</section>

	<!-- Key Takeaways -->
	<section class="rounded-lg bg-[var(--color-surface)] p-4">
		<h3 class="mb-3 font-semibold text-[var(--color-primary)] text-[var(--text-body)]">
			Key Takeaways
		</h3>
		<div class="grid gap-2 text-[var(--text-tiny)] sm:grid-cols-2 lg:grid-cols-4">
			<div
				class="rounded-lg border border-pink-900/30 bg-gradient-to-br from-pink-900/20 to-[var(--color-bg)] p-2.5"
			>
				<div class="mb-1 flex items-center gap-2">
					<span
						class="flex h-5 w-5 items-center justify-center rounded bg-pink-600 text-[10px] font-bold text-white"
						>1</span
					>
					<span class="font-medium text-pink-400">No Single Eval</span>
				</div>
				<p class="text-[var(--color-muted)]">Choose based on what you're trying to measure</p>
			</div>
			<div
				class="rounded-lg border border-violet-900/30 bg-gradient-to-br from-violet-900/20 to-[var(--color-bg)] p-2.5"
			>
				<div class="mb-1 flex items-center gap-2">
					<span
						class="flex h-5 w-5 items-center justify-center rounded bg-violet-600 text-[10px] font-bold text-white"
						>2</span
					>
					<span class="font-medium text-violet-400">Look at Instances</span>
				</div>
				<p class="text-[var(--color-muted)]">Aggregate scores hide important details</p>
			</div>
			<div
				class="rounded-lg border border-sky-900/30 bg-gradient-to-br from-sky-900/20 to-[var(--color-bg)] p-2.5"
			>
				<div class="mb-1 flex items-center gap-2">
					<span
						class="flex h-5 w-5 items-center justify-center rounded bg-sky-600 text-[10px] font-bold text-white"
						>3</span
					>
					<span class="font-medium text-sky-400">Multiple Aspects</span>
				</div>
				<p class="text-[var(--color-muted)]">Capabilities + safety + cost. Use Pareto frontiers</p>
			</div>
			<div
				class="rounded-lg border border-teal-900/30 bg-gradient-to-br from-teal-900/20 to-[var(--color-bg)] p-2.5"
			>
				<div class="mb-1 flex items-center gap-2">
					<span
						class="flex h-5 w-5 items-center justify-center rounded bg-teal-600 text-[10px] font-bold text-white"
						>4</span
					>
					<span class="font-medium text-teal-400">Methods vs Systems</span>
				</div>
				<p class="text-[var(--color-muted)]">Define what exactly is being evaluated</p>
			</div>
		</div>
	</section>

	<!-- CTA -->
	<section
		class="rounded-lg border border-[var(--color-primary)]/30 bg-gradient-to-r from-[var(--color-primary)]/20 to-purple-900/20 p-3 text-center"
	>
		<p class="text-[var(--color-text)] text-[var(--text-small)]">
			Go to <span class="font-semibold text-[var(--color-primary)]">Sample Data</span> to explore actual
			evaluation datasets from HuggingFace.
		</p>
	</section>

	<!-- References -->
	<section class="rounded-lg bg-[var(--color-surface)] p-4">
		<h3 class="mb-3 font-semibold text-[var(--color-primary)] text-[var(--text-body)]">
			References
		</h3>
		<ul class="space-y-2 text-[var(--text-tiny)]">
			<li class="flex items-start gap-2">
				<span class="text-[var(--color-primary)]">1.</span>
				<span class="text-[var(--color-muted)]">
					<a
						href="https://www.youtube.com/watch?v=x-R5l2HsXqM&list=PLoROMvodv4rOY23Y0BoGoBGgQ1zmU_MT_&index=13"
						target="_blank"
						rel="noopener noreferrer"
						class="text-[var(--color-primary)] underline transition-colors hover:text-pink-400"
					>
						Stanford CS336: Language Modeling from Scratch | Spring 2025 | Lecture 12: Evaluation
					</a>
				</span>
			</li>
			<li class="flex items-start gap-2">
				<span class="text-[var(--color-primary)]">2.</span>
				<span class="text-[var(--color-muted)]">
					Dataset collection from
					<a
						href="https://www.evidentlyai.com/llm-evaluation-benchmarks-datasets"
						target="_blank"
						rel="noopener noreferrer"
						class="text-[var(--color-primary)] underline transition-colors hover:text-pink-400"
					>
						Evidently AI - 250 LLM Evaluation Benchmarks & Datasets
					</a>
				</span>
			</li>
			<li class="flex items-start gap-2">
				<span class="text-[var(--color-primary)]">3.</span>
				<span class="text-[var(--color-muted)]">
					Sample data obtained from
					<a
						href="https://huggingface.co/docs/datasets-server"
						target="_blank"
						rel="noopener noreferrer"
						class="text-[var(--color-primary)] underline transition-colors hover:text-pink-400"
					>
						HuggingFace Datasets Server API
					</a>
				</span>
			</li>
		</ul>
	</section>
</div>
