<script>
	import { HeroSection, Section, ContentBox, DataTable, ProsConsCard } from '$lib/shared';

	// Filtering algorithms overview
	const filteringAlgorithms = [
		{
			name: 'KenLM (N-gram Models)',
			description: 'N-gram language model with Kneser-Ney smoothing for perplexity-based filtering',
			pros: ['Extremely fast', 'Simple to implement', 'No training required'],
			cons: ['Only captures local context', 'Crude quality signal'],
			useCase: 'CCNet, LLaMA data filtering'
		},
		{
			name: 'fastText Classifier',
			description: 'Linear classifier with bag of n-grams for binary classification (good vs bad)',
			pros: ['Fast inference', 'Works well for language ID', 'Off-the-shelf models available'],
			cons: ['Requires labeled data', 'May introduce bias'],
			useCase: 'Language ID (176 languages), quality filtering, toxicity detection'
		},
		{
			name: 'DSIR (Importance Resampling)',
			description:
				'Data Selection via Importance Resampling using ratio of target/raw distributions',
			pros: ['More principled approach', 'Better diversity', 'Captures distribution matching'],
			cons: ['Slightly more complex', 'Requires both target and raw data'],
			useCase: 'Domain-specific data curation'
		}
	];

	// Filtering framework
	const filteringFramework = {
		generative: {
			name: 'Generative (KenLM)',
			score: 'score(x) = p_T(x)',
			action: 'Keep if score >= threshold'
		},
		discriminative: {
			name: 'Discriminative (fastText)',
			score: 'score(x) = p(T | x)',
			action: 'Keep if score >= threshold'
		},
		importance: {
			name: 'Importance Sampling (DSIR)',
			score: 'score(x) = p_T(x) / p_R(x)',
			action: 'Resample proportional to score'
		}
	};

	// Filtering applications
	const filteringApplications = [
		{
			type: 'Language Identification',
			icon: '🌐',
			description: 'Classify text by language (e.g., English, German, Japanese)',
			tool: 'fastText lid.176.bin',
			stats: '176 languages supported',
			example: 'Dolma: keep pages with p(English) >= 0.5'
		},
		{
			type: 'Quality Filtering',
			icon: '✨',
			description: 'Keep high-quality, educational content',
			tool: 'KenLM perplexity, fastText classifier',
			stats: 'GPT-3, LLaMA, phi-1 all use quality filtering',
			example: 'phi-1: GPT-4 labels 100K examples, train random forest'
		},
		{
			type: 'Toxicity Filtering',
			icon: '🛡️',
			description: 'Remove toxic, NSFW, or harmful content',
			tool: 'fastText trained on Jigsaw dataset',
			stats: 'Labels: toxic, obscene, threat, insult, identity_hate',
			example: 'Dolma: hate classifier + NSFW classifier'
		}
	];

	// Deduplication design space
	const dedupDesignSpace = [
		{
			question: 'What is an item?',
			options: ['Sentence', 'Paragraph', 'Document', '3-sentence span']
		},
		{
			question: 'How to match?',
			options: ['Exact match', 'Jaccard similarity', 'Fraction of common n-grams']
		},
		{ question: 'What action?', options: ['Remove all', 'Remove all but one', 'Keep weighted'] }
	];

	// Hash function types
	const hashTypes = [
		{
			name: 'SHA-256',
			type: 'Cryptographic',
			speed: 'Slow',
			collision: 'Resistant',
			use: 'Security (Bitcoin)'
		},
		{
			name: 'MurmurHash',
			type: 'Non-crypto',
			speed: 'Fast',
			collision: 'Possible',
			use: 'Hash tables, dedup'
		},
		{
			name: 'MinHash',
			type: 'LSH',
			speed: 'Fast',
			collision: 'Controlled',
			use: 'Similarity estimation'
		}
	];

	const realWorldExamplesColumns = [
		{ key: 'paper', header: 'Paper/Dataset', color: 'accent' },
		{ key: 'filtering', header: 'Filtering Approach', color: 'muted' },
		{ key: 'dedup', header: 'Deduplication', color: 'muted' }
	];

	// Processing pipeline stages
	const pipelineStages = [
		{ name: 'Text Extraction', desc: 'HTML to text (Trafilatura)', icon: '📄' },
		{ name: 'URL Filtering', desc: 'Block/allow lists', icon: '🔗' },
		{ name: 'Language ID', desc: 'fastText classifier', icon: '🌍' },
		{ name: 'Quality Filter', desc: 'Perplexity/classifier', icon: '✨' },
		{ name: 'Toxicity Filter', desc: 'Safety classifiers', icon: '🛡️' },
		{ name: 'Deduplication', desc: 'Bloom filter + MinHash LSH', icon: '🔄' }
	];

	// Real-world examples
	const realWorldExamples = [
		{
			paper: 'CCNet / LLaMA',
			filtering: 'KenLM perplexity on paragraphs, keep top 1/3',
			dedup: 'Paragraph-level dedup'
		},
		{
			paper: 'C4',
			filtering: 'Rule-based (sentence heuristics)',
			dedup: '3-sentence span exact match'
		},
		{
			paper: 'Dolma',
			filtering: 'fastText language ID + toxicity, p(English) >= 0.5',
			dedup: 'Bloom filter (FPR 1e-15) on paragraphs'
		},
		{
			paper: 'phi-1',
			filtering: 'GPT-4 labels -> random forest classifier',
			dedup: 'Not specified'
		}
	];
</script>

<div class="space-y-6">
	<HeroSection title="Data Processing: Filtering & Deduplication">
		<p class="max-w-3xl leading-relaxed text-[var(--color-muted)] text-[var(--text-body)]">
			Raw web data requires extensive processing before training. This involves
			<span class="font-semibold text-[var(--color-primary)]">filtering algorithms</span> to select
			high-quality content and
			<span class="font-semibold text-[var(--color-primary)]">deduplication</span> to remove redundant
			data. The key challenge: process billions of documents in linear time.
		</p>
		<div class="mt-4 flex flex-wrap gap-3">
			<span
				class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-[var(--color-accent)] text-[var(--text-small)]"
			>
				KenLM
			</span>
			<span
				class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-[var(--color-accent)] text-[var(--text-small)]"
			>
				fastText
			</span>
			<span
				class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-[var(--color-accent)] text-[var(--text-small)]"
			>
				MinHash LSH
			</span>
			<span
				class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-[var(--color-accent)] text-[var(--text-small)]"
			>
				Bloom Filters
			</span>
		</div>
	</HeroSection>

	<Section title="📊 Data Processing Pipeline">
		<p class="mb-6 text-[var(--color-muted)] text-[var(--text-small)]">
			From raw HTML to training-ready data: each stage filters or transforms the content.
		</p>

		<!-- Pipeline Visualization -->
		<div class="relative">
			<div class="flex flex-wrap justify-center gap-2 md:gap-0">
				{#each pipelineStages as stage, i (stage.name)}
					<div class="flex items-center">
						<ContentBox
							variant="dark"
							class="min-w-[100px] border border-[var(--color-muted)]/20 p-3 text-center transition-colors hover:border-[var(--color-primary)]/50 md:min-w-[120px] md:p-4"
						>
							<div class="mb-1 text-2xl">{stage.icon}</div>
							<div
								class="font-semibold text-[var(--color-text)] text-[var(--text-tiny)] md:text-[var(--text-small)]"
							>
								{stage.name}
							</div>
							<div class="hidden text-[var(--color-muted)] text-[var(--text-tiny)] md:block">
								{stage.desc}
							</div>
						</ContentBox>
						{#if i < pipelineStages.length - 1}
							<div class="px-1 text-lg text-[var(--color-primary)] md:px-2">→</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>

		<div class="mt-4 rounded-lg border-l-4 border-[var(--color-primary)] bg-[var(--color-bg)] p-3">
			<p class="text-[var(--color-muted)] text-[var(--text-small)]">
				<span class="font-semibold text-[var(--color-accent)]">Key insight:</span> Each stage must
				be
				<span class="text-[var(--color-text)]">extremely fast</span> since we process the entire web.
				A slow filter is worse than not filtering at all.
			</p>
		</div>
	</Section>

	<!-- Core Filtering Problem -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>🎯</span> The Filtering Problem
		</h2>

		<div class="grid gap-6 md:grid-cols-2">
			<!-- Problem Statement -->
			<div class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-5">
				<h3 class="mb-3 font-bold text-[var(--color-text)]">Problem Setup</h3>
				<div class="space-y-3">
					<div class="flex items-start gap-3">
						<div class="mt-1.5 h-3 w-3 rounded-full bg-emerald-500"></div>
						<div>
							<span class="font-semibold text-[var(--color-text)]">Target data T</span>
							<span class="text-[var(--color-muted)]"> - Small set of high-quality examples</span>
						</div>
					</div>
					<div class="flex items-start gap-3">
						<div class="mt-1.5 h-3 w-3 rounded-full bg-red-500"></div>
						<div>
							<span class="font-semibold text-[var(--color-text)]">Raw data R</span>
							<span class="text-[var(--color-muted)]">
								- Large set (Common Crawl, ~240T tokens)</span
							>
						</div>
					</div>
					<div class="flex items-start gap-3">
						<div class="mt-1.5 h-3 w-3 rounded-full bg-[var(--color-primary)]"></div>
						<div>
							<span class="font-semibold text-[var(--color-text)]">Goal: Find T'</span>
							<span class="text-[var(--color-muted)]"> - Subset of R similar to T</span>
						</div>
					</div>
				</div>

				<!-- Visual Diagram -->
				<div class="mt-4 flex justify-center">
					<svg viewBox="0 0 200 100" class="h-24 w-48">
						<!-- Raw data R (large circle) -->
						<ellipse
							cx="80"
							cy="50"
							rx="70"
							ry="40"
							fill="rgba(239, 68, 68, 0.2)"
							stroke="rgb(239, 68, 68)"
							stroke-width="1.5"
						/>
						<text x="50" y="35" fill="currentColor" class="text-[var(--text-tiny)]" font-size="10"
							>Raw data R</text
						>

						<!-- T' subset -->
						<ellipse
							cx="80"
							cy="55"
							rx="30"
							ry="20"
							fill="rgba(139, 92, 246, 0.3)"
							stroke="rgb(139, 92, 246)"
							stroke-width="1.5"
						/>
						<text x="65" y="58" fill="currentColor" class="text-[var(--text-tiny)]" font-size="8"
							>T'</text
						>

						<!-- Target T (small circle) -->
						<ellipse
							cx="170"
							cy="30"
							rx="25"
							ry="18"
							fill="rgba(16, 185, 129, 0.3)"
							stroke="rgb(16, 185, 129)"
							stroke-width="1.5"
						/>
						<text x="155" y="33" fill="currentColor" class="text-[var(--text-tiny)]" font-size="8"
							>Target T</text
						>

						<!-- Arrow -->
						<path
							d="M145 35 L115 45"
							stroke="rgb(139, 92, 246)"
							stroke-width="1.5"
							fill="none"
							marker-end="url(#arrowhead)"
						/>
						<defs>
							<marker
								id="arrowhead"
								markerWidth="10"
								markerHeight="7"
								refX="9"
								refY="3.5"
								orient="auto"
							>
								<polygon points="0 0, 10 3.5, 0 7" fill="rgb(139, 92, 246)" />
							</marker>
						</defs>
					</svg>
				</div>
			</div>

			<!-- Desiderata -->
			<div class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-5">
				<h3 class="mb-3 font-bold text-[var(--color-text)]">Requirements</h3>
				<div class="space-y-4">
					<div class="flex items-start gap-3">
						<span class="text-xl">🎯</span>
						<div>
							<span class="font-semibold text-[var(--color-text)]">Generalize from T</span>
							<p class="text-[var(--color-muted)] text-[var(--text-small)]">
								T' should be different from T (you already have T)
							</p>
						</div>
					</div>
					<div class="flex items-start gap-3">
						<span class="text-xl">⚡</span>
						<div>
							<span class="font-semibold text-[var(--color-text)]">Extremely fast</span>
							<p class="text-[var(--color-muted)] text-[var(--text-small)]">
								Must run on all of R - if slow, might as well just train
							</p>
						</div>
					</div>
					<div class="flex items-start gap-3">
						<span class="text-xl">📊</span>
						<div>
							<span class="font-semibold text-[var(--color-text)]">Scalable</span>
							<p class="text-[var(--color-muted)] text-[var(--text-small)]">
								Linear time algorithms only - quadratic is impossible
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Filtering Algorithms -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>🧮</span> Filtering Algorithms
		</h2>
		<p class="mb-6 text-[var(--color-muted)]">
			Three main approaches to implement filtering, each with different tradeoffs.
		</p>

		<div class="grid gap-4 md:grid-cols-3">
			{#each filteringAlgorithms as algo (algo.name)}
				<ProsConsCard
					title={algo.name}
					description="{algo.description} Used in: {algo.useCase}"
					pros={algo.pros}
					cons={algo.cons}
				/>
			{/each}
		</div>
	</div>

	<!-- KenLM Deep Dive -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>📈</span> KenLM: N-gram Perplexity Filtering
		</h2>

		<div class="grid gap-6 md:grid-cols-2">
			<div>
				<h3 class="mb-3 font-semibold text-[var(--color-text)]">How It Works</h3>
				<div class="space-y-3 text-[var(--color-muted)] text-[var(--text-small)]">
					<p>N-gram models estimate probability of text based on local word sequences:</p>
					<div class="rounded-lg bg-[var(--color-bg)] p-3">
						<div class="text-[var(--color-muted)]"># Maximum likelihood estimation</div>
						<div class="font-mono text-[var(--color-accent)]">
							p(in | the cat) = count("the cat in") / count("the cat")
						</div>
					</div>
					<p>
						<span class="font-semibold text-[var(--color-text)]">Problem:</span> Sparse counts for rare
						n-grams
					</p>
					<p>
						<span class="font-semibold text-[var(--color-text)]">Solution:</span> Kneser-Ney smoothing
						backs off to lower-order n-grams
					</p>
				</div>
			</div>

			<div>
				<h3 class="mb-3 font-semibold text-[var(--color-text)]">Perplexity Scoring</h3>
				<div class="rounded-lg bg-[var(--color-bg)] p-4">
					<div class="space-y-2 text-[var(--text-small)]">
						<div class="text-[var(--color-muted)]"># Compute perplexity</div>
						<div class="font-mono text-[var(--color-accent)]">log_prob = model.score(content)</div>
						<div class="font-mono text-[var(--color-accent)]">num_tokens = len(tokens)</div>
						<div class="font-mono text-[var(--color-accent)]">
							perplexity = exp(-log_prob / num_tokens)
						</div>
					</div>
					<div class="mt-4 space-y-2 text-[var(--text-small)]">
						<div class="flex justify-between">
							<span class="text-[var(--color-muted)]">"Stanford University was founded..."</span>
							<span class="font-mono text-green-400">PPL: 187</span>
						</div>
						<div class="flex justify-between">
							<span class="text-[var(--color-muted)]">"asdf asdf asdf asdf"</span>
							<span class="font-mono text-red-400">PPL: high</span>
						</div>
					</div>
				</div>
				<p class="mt-2 text-[var(--color-muted)] text-[var(--text-small)]">
					<span class="text-[var(--color-accent)]">CCNet:</span> Sort paragraphs by perplexity, keep top
					1/3
				</p>
			</div>
		</div>
	</div>

	<!-- fastText Deep Dive -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>🏷️</span> fastText: Linear Classification
		</h2>

		<div class="grid gap-6 md:grid-cols-2">
			<div>
				<h3 class="mb-3 font-semibold text-[var(--color-text)]">Architecture</h3>
				<div class="space-y-2 rounded-lg bg-[var(--color-bg)] p-4 text-[var(--text-small)]">
					<div class="text-[var(--color-muted)]"># Bag of word embeddings</div>
					<div class="font-mono text-[var(--color-accent)]">
						V = 8192 <span class="text-[var(--color-muted)]"># Vocab size</span>
					</div>
					<div class="font-mono text-[var(--color-accent)]">
						H = 16 <span class="text-[var(--color-muted)]"># Hidden dim</span>
					</div>
					<div class="font-mono text-[var(--color-accent)]">
						K = 2 <span class="text-[var(--color-muted)]"># Classes (good/bad)</span>
					</div>
					<div class="mt-2 font-mono text-[var(--color-accent)]">W = Embedding(V, H)</div>
					<div class="font-mono text-[var(--color-accent)]">U = Linear(H, K)</div>
					<div class="font-mono text-[var(--color-accent)]">y = softmax(U(W(x).mean()))</div>
					<div class="mt-2 text-[var(--color-muted)]"># Only H*(V + K) parameters!</div>
				</div>
				<p class="mt-2 text-[var(--color-muted)] text-[var(--text-small)]">
					Uses hashing trick for n-grams: ~10M bins instead of unbounded vocab
				</p>
			</div>

			<div>
				<h3 class="mb-3 font-semibold text-[var(--color-text)]">Language Identification</h3>
				<div class="rounded-lg bg-[var(--color-bg)] p-4">
					<div class="mb-3 text-[var(--color-muted)] text-[var(--text-small)]">
						Off-the-shelf model: <code class="font-mono text-[var(--color-accent)]"
							>lid.176.bin</code
						>
					</div>
					<div class="space-y-2 text-[var(--text-small)]">
						<div class="flex items-center justify-between">
							<span class="text-[var(--color-muted)]">"The quick brown fox..."</span>
							<span class="rounded bg-green-500/20 px-2 py-0.5 font-mono text-green-400"
								>EN 0.71</span
							>
						</div>
						<div class="flex items-center justify-between">
							<span class="text-[var(--color-muted)]">"Auf dem Wasser zu singen"</span>
							<span class="rounded bg-blue-500/20 px-2 py-0.5 font-mono text-blue-400">DE 0.99</span
							>
						</div>
						<div class="flex items-center justify-between">
							<span class="text-[var(--color-muted)]">"Bonjour!"</span>
							<span class="rounded bg-pink-500/20 px-2 py-0.5 font-mono text-pink-400">FR 0.98</span
							>
						</div>
						<div class="flex items-center justify-between">
							<span class="text-[var(--color-muted)]">"for (int i = 0; ...)"</span>
							<span class="rounded bg-amber-500/20 px-2 py-0.5 font-mono text-amber-400"
								>RU? 0.3</span
							>
						</div>
					</div>
					<p class="mt-3 text-[var(--color-muted)] text-[var(--text-small)]">
						Caveats: struggles with short text, code, similar languages, dialects
					</p>
				</div>
			</div>
		</div>
	</div>

	<!-- DSIR Deep Dive -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>🎲</span> DSIR: Importance Resampling
		</h2>

		<div class="grid gap-6 md:grid-cols-2">
			<div>
				<h3 class="mb-3 font-semibold text-[var(--color-text)]">Importance Sampling Intuition</h3>
				<div class="space-y-3 text-[var(--color-muted)] text-[var(--text-small)]">
					<p>Want samples from target distribution p, but only have samples from proposal q:</p>
					<div class="rounded-lg bg-[var(--color-bg)] p-3">
						<ol class="space-y-2">
							<li class="flex items-start gap-2">
								<span class="font-bold text-[var(--color-primary)]">1.</span>
								Sample from q (raw data)
							</li>
							<li class="flex items-start gap-2">
								<span class="font-bold text-[var(--color-primary)]">2.</span>
								Compute weights:
								<span class="font-mono text-[var(--color-accent)]">w = p(x) / q(x)</span>
							</li>
							<li class="flex items-start gap-2">
								<span class="font-bold text-[var(--color-primary)]">3.</span>
								Resample proportional to weights
							</li>
						</ol>
					</div>
					<p>Result: samples distributed like p, not q!</p>
				</div>
			</div>

			<div>
				<h3 class="mb-3 font-semibold text-[var(--color-text)]">Hashed N-grams Solution</h3>
				<div class="space-y-2 rounded-lg bg-[var(--color-bg)] p-4 text-[var(--text-small)]">
					<div class="text-[var(--color-muted)]"># Hash n-grams to fixed bins</div>
					<div class="font-mono text-[var(--color-accent)]">num_bins = 10_000_000</div>
					<div class="font-mono text-[var(--color-accent)]">ngrams = text.split(" ")</div>
					<div class="font-mono text-[var(--color-accent)]">
						hashed = [hash(ng) % num_bins for ng in ngrams]
					</div>
					<div class="mt-2 text-[var(--color-muted)]"># Estimate probabilities</div>
					<div class="font-mono text-[var(--color-accent)]">
						probs = count(hashed) / len(hashed)
					</div>
					<div class="mt-2 text-[var(--color-muted)]"># Score = p_target / p_raw</div>
					<div class="font-mono text-[var(--color-accent)]">
						score = prod(p_T[h] / p_R[h] for h in hashed)
					</div>
				</div>
				<p class="mt-2 text-[var(--color-muted)] text-[var(--text-small)]">
					More principled than classification - captures distribution matching
				</p>
			</div>
		</div>
	</div>

	<!-- General Filtering Framework -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>🔧</span> General Filtering Framework
		</h2>
		<p class="mb-6 text-[var(--color-muted)]">
			All three methods follow the same pattern: estimate a scoring function, then filter based on
			scores.
		</p>

		<div class="grid gap-4 md:grid-cols-3">
			{#each Object.values(filteringFramework) as method (method.name)}
				<div class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-4">
					<h3 class="mb-3 font-bold text-[var(--color-text)]">{method.name}</h3>
					<div class="space-y-2">
						<div class="rounded bg-[var(--color-secondary)] p-2">
							<span class="text-[var(--color-muted)] text-[var(--text-tiny)]">Score:</span>
							<div class="font-mono text-[var(--color-accent)] text-[var(--text-small)]">
								{method.score}
							</div>
						</div>
						<div class="rounded bg-[var(--color-secondary)] p-2">
							<span class="text-[var(--color-muted)] text-[var(--text-tiny)]">Action:</span>
							<div class="text-[var(--color-text)] text-[var(--text-small)]">{method.action}</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Filtering Applications -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>🎯</span> Filtering Applications
		</h2>

		<div class="grid gap-4 md:grid-cols-3">
			{#each filteringApplications as app (app.type)}
				<div
					class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-5 transition-colors hover:border-[var(--color-primary)]/40"
				>
					<div class="mb-3 flex items-center gap-3">
						<span class="text-3xl">{app.icon}</span>
						<h3 class="font-bold text-[var(--color-text)]">{app.type}</h3>
					</div>
					<p class="mb-3 text-[var(--color-muted)] text-[var(--text-small)]">{app.description}</p>
					<div class="space-y-2 text-[var(--text-tiny)]">
						<div class="flex items-start gap-2">
							<span class="text-[var(--color-accent)]">Tool:</span>
							<span class="text-[var(--color-muted)]">{app.tool}</span>
						</div>
						<div class="flex items-start gap-2">
							<span class="text-[var(--color-accent)]">Stats:</span>
							<span class="text-[var(--color-muted)]">{app.stats}</span>
						</div>
						<div class="mt-2 rounded bg-[var(--color-secondary)] p-2">
							<span class="text-[var(--color-muted)]">{app.example}</span>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Deduplication Section -->
	<div
		class="rounded-2xl border border-cyan-600/30 bg-gradient-to-br from-cyan-600/20 to-[var(--color-primary)]/20 p-8"
	>
		<div class="flex items-start gap-4">
			<div class="text-5xl">🔄</div>
			<div>
				<h2 class="mb-3 text-2xl font-bold text-[var(--color-text)] md:text-3xl">
					Deduplication: Removing Redundancy
				</h2>
				<p class="max-w-3xl text-lg leading-relaxed text-[var(--color-muted)]">
					The web contains massive amounts of duplicate content. A single product description was
					found
					<span class="font-semibold text-cyan-400">61,036 times in C4</span>. Deduplication makes
					training more efficient and reduces memorization risks.
				</p>
			</div>
		</div>
	</div>

	<!-- Why Deduplicate -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>❓</span> Why Deduplicate?
		</h2>

		<div class="grid gap-6 md:grid-cols-2">
			<div class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-5">
				<h3 class="mb-3 flex items-center gap-2 font-bold text-[var(--color-text)]">
					<span class="text-green-400">+</span> Benefits
				</h3>
				<ul class="space-y-2 text-[var(--color-muted)] text-[var(--text-small)]">
					<li class="flex items-start gap-2">
						<span class="text-green-400">1.</span>
						<span
							><span class="text-[var(--color-text)]">Train more efficiently</span> - fewer tokens, same
							information</span
						>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-green-400">2.</span>
						<span
							><span class="text-[var(--color-text)]">Avoid memorization</span> - reduces copyright/privacy
							risks</span
						>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-green-400">3.</span>
						<span
							><span class="text-[var(--color-text)]">Better generalization</span> - less overfitting
							to repeated content</span
						>
					</li>
				</ul>
			</div>

			<div class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-5">
				<h3 class="mb-3 flex items-center gap-2 font-bold text-[var(--color-text)]">
					<span class="text-amber-400">!</span> Duplicate Sources
				</h3>
				<ul class="space-y-2 text-[var(--color-muted)] text-[var(--text-small)]">
					<li class="flex items-start gap-2">
						<span class="text-amber-400">*</span>
						<span
							><span class="text-[var(--color-text)]">Mirror sites</span> - Project Gutenberg across many
							URLs</span
						>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-amber-400">*</span>
						<span
							><span class="text-[var(--color-text)]">Terms/Licenses</span> - MIT license copy-pasted
							everywhere</span
						>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-amber-400">*</span>
						<span
							><span class="text-[var(--color-text)]">Template content</span> - slot-filled product descriptions</span
						>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-amber-400">*</span>
						<span
							><span class="text-[var(--color-text)]">Copy-paste errors</span> - missing commas, formatting
							changes</span
						>
					</li>
				</ul>
			</div>
		</div>
	</div>

	<!-- Deduplication Design Space -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>🎨</span> Deduplication Design Space
		</h2>

		<div class="grid gap-4 md:grid-cols-3">
			{#each dedupDesignSpace as item (item.question)}
				<div class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-4">
					<h3 class="mb-3 font-bold text-[var(--color-text)]">{item.question}</h3>
					<div class="flex flex-wrap gap-2">
						{#each item.options as option, i (i)}
							<span
								class="rounded bg-[var(--color-secondary)] px-2 py-1 text-[var(--color-accent)] text-[var(--text-tiny)]"
							>
								{option}
							</span>
						{/each}
					</div>
				</div>
			{/each}
		</div>

		<div class="mt-4 rounded-lg border-l-4 border-amber-500 bg-[var(--color-bg)] p-4">
			<p class="text-[var(--color-muted)] text-[var(--text-small)]">
				<span class="font-semibold text-amber-400">Key challenge:</span> Deduplication is
				fundamentally
				<span class="text-[var(--color-text)]">pairwise</span> - comparing items to other items. With
				billions of documents, quadratic algorithms are impossible. Need linear time solutions.
			</p>
		</div>
	</div>

	<!-- Hash Functions -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>#️⃣</span> Hash Functions: The Building Block
		</h2>
		<p class="mb-4 text-[var(--color-muted)]">
			Hashing converts pairwise comparisons into unary operations, enabling linear-time algorithms.
		</p>

		<div class="overflow-x-auto">
			<table class="w-full text-[var(--text-small)]">
				<thead>
					<tr class="border-b border-[var(--color-muted)]/20 text-left text-[var(--color-muted)]">
						<th class="pr-4 pb-3">Hash</th>
						<th class="pr-4 pb-3">Type</th>
						<th class="pr-4 pb-3">Speed</th>
						<th class="pr-4 pb-3">Collisions</th>
						<th class="pb-3">Use Case</th>
					</tr>
				</thead>
				<tbody>
					{#each hashTypes as hash (hash.name)}
						<tr class="border-b border-[var(--color-muted)]/10">
							<td class="py-3 pr-4 font-mono text-[var(--color-accent)]">{hash.name}</td>
							<td class="py-3 pr-4 text-[var(--color-text)]">{hash.type}</td>
							<td class="py-3 pr-4">
								<span
									class="rounded px-2 py-0.5 text-[var(--text-tiny)] {hash.speed === 'Fast'
										? 'bg-green-500/20 text-green-400'
										: 'bg-amber-500/20 text-amber-400'}"
								>
									{hash.speed}
								</span>
							</td>
							<td class="py-3 pr-4 text-[var(--color-muted)]">{hash.collision}</td>
							<td class="py-3 text-[var(--color-muted)]">{hash.use}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Exact Deduplication -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>1️⃣</span> Exact Deduplication
		</h2>

		<div class="grid gap-6 md:grid-cols-2">
			<div>
				<h3 class="mb-3 font-semibold text-[var(--color-text)]">Simple Hash-Based Approach</h3>
				<div
					class="space-y-2 rounded-lg bg-[var(--color-bg)] p-4 font-mono text-[var(--text-tiny)]"
				>
					<div class="text-[var(--color-accent)]"># MapReduce style deduplication</div>
					<div>items = ["hello", "world", "hello", "hi"]</div>
					<div class="mt-2 text-[var(--color-accent)]"># Group by hash</div>
					<div>hash_items = groupby(items, key=hash)</div>
					<div class="mt-2 text-[var(--color-accent)]"># Keep one from each group</div>
					<div>deduped = [next(group) for h, group in hash_items]</div>
					<div class="mt-2 text-[var(--color-muted)]"># Result: ["hello", "world", "hi"]</div>
				</div>
				<p class="mt-2 text-[var(--color-muted)] text-[var(--text-tiny)]">
					Simple, clear semantics, high precision. Used in C4 for 3-sentence spans.
				</p>
			</div>

			<div>
				<h3 class="mb-3 font-semibold text-[var(--color-text)]">Bloom Filters</h3>
				<div class="rounded-lg bg-[var(--color-bg)] p-4">
					<p class="mb-3 text-[var(--color-muted)] text-[var(--text-small)]">
						Memory-efficient probabilistic set membership:
					</p>
					<ul class="space-y-2 text-[var(--color-muted)] text-[var(--text-tiny)]">
						<li class="flex items-start gap-2">
							<span class="text-green-400">+</span>
							<span>If returns "no" → definitely not in set</span>
						</li>
						<li class="flex items-start gap-2">
							<span class="text-amber-400">!</span>
							<span>If returns "yes" → probably in set (small false positive rate)</span>
						</li>
					</ul>
					<div class="mt-3 rounded bg-[var(--color-secondary)] p-2">
						<span class="text-[var(--color-accent)] text-[var(--text-tiny)]">Dolma:</span>
						<span class="text-[var(--color-muted)] text-[var(--text-tiny)]">
							FPR = 10^-15, paragraph-level</span
						>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Bloom Filter Deep Dive -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>🌸</span> Bloom Filter Deep Dive
		</h2>

		<div class="grid gap-6 md:grid-cols-2">
			<div>
				<h3 class="mb-3 font-semibold text-[var(--color-text)]">How It Works</h3>
				<div
					class="space-y-2 rounded-lg bg-[var(--color-bg)] p-4 font-mono text-[var(--text-tiny)]"
				>
					<div class="text-[var(--color-accent)]"># Initialize bit array</div>
					<div>m = 1000 <span class="text-[var(--color-muted)]"># Number of bins</span></div>
					<div>
						k = 10 <span class="text-[var(--color-muted)]"># Number of hash functions</span>
					</div>
					<div>table = bitarray(m)</div>
					<div class="mt-2 text-[var(--color-accent)]"># Insert: set k bits</div>
					<div>for seed in range(k):</div>
					<div>h = hash(item, seed) % m</div>
					<div>table[h] = 1</div>
					<div class="mt-2 text-[var(--color-accent)]"># Query: check all k bits</div>
					<div>in_set = all(table[hash(item, s) % m] for s in range(k))</div>
				</div>
			</div>

			<div>
				<h3 class="mb-3 font-semibold text-[var(--color-text)]">False Positive Analysis</h3>
				<div class="rounded-lg bg-[var(--color-bg)] p-4">
					<div class="space-y-3 text-[var(--color-muted)] text-[var(--text-small)]">
						<p>For m bins, k hash functions, n items:</p>
						<div class="rounded bg-[var(--color-secondary)] p-2 font-mono text-[var(--text-tiny)]">
							f = (1 - (1 - 1/m)^(kn))^k
						</div>
						<p>Optimal k (given m/n ratio):</p>
						<div class="rounded bg-[var(--color-secondary)] p-2 font-mono text-[var(--text-tiny)]">
							k = ln(2) * m / n
						</div>
						<p>Resulting false positive rate:</p>
						<div class="rounded bg-[var(--color-secondary)] p-2 font-mono text-[var(--text-tiny)]">
							f = 0.5^k <span class="text-[var(--color-muted)]">(exponential decrease!)</span>
						</div>
					</div>
				</div>
				<p class="mt-2 text-[var(--color-muted)] text-[var(--text-tiny)]">
					Key insight: more hash functions exponentially reduces false positives
				</p>
			</div>
		</div>
	</div>

	<!-- Near Deduplication -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>2️⃣</span> Near Deduplication: MinHash + LSH
		</h2>
		<p class="mb-6 text-[var(--color-muted)]">
			Exact dedup misses documents that differ by a few tokens. Near dedup uses Jaccard similarity.
		</p>

		<div class="grid gap-6 md:grid-cols-2">
			<div>
				<h3 class="mb-3 font-semibold text-[var(--color-text)]">Jaccard Similarity</h3>
				<div class="rounded-lg bg-[var(--color-bg)] p-4">
					<div class="mb-3 font-mono text-[var(--text-tiny)]">
						Jaccard(A, B) = |A ∩ B| / |A ∪ B|
					</div>
					<div class="space-y-2 text-[var(--color-muted)] text-[var(--text-tiny)]">
						<div>A = {'{'}1, 2, 3, 4}</div>
						<div>B = {'{'}1, 2, 3, 5}</div>
						<div class="mt-2">
							<span class="text-[var(--color-text)]">Intersection:</span>
							{'{'}1, 2, 3} = 3 items
						</div>
						<div>
							<span class="text-[var(--color-text)]">Union:</span>
							{'{'}1, 2, 3, 4, 5} = 5 items
						</div>
						<div class="mt-2 font-semibold text-[var(--color-accent)]">Jaccard = 3/5 = 0.6</div>
					</div>
				</div>
				<p class="mt-2 text-[var(--color-muted)] text-[var(--text-tiny)]">
					Two documents are near-duplicates if Jaccard >= threshold (often 0.8-0.99)
				</p>
			</div>

			<div>
				<h3 class="mb-3 font-semibold text-[var(--color-text)]">MinHash Magic</h3>
				<div class="rounded-lg bg-[var(--color-bg)] p-4">
					<p class="mb-3 text-[var(--color-muted)] text-[var(--text-small)]">
						MinHash: a hash where <span class="text-[var(--color-text)]"
							>collision probability = Jaccard similarity</span
						>
					</p>
					<div class="space-y-2 font-mono text-[var(--text-tiny)]">
						<div class="text-[var(--color-accent)]"># MinHash definition</div>
						<div>def minhash(S, seed):</div>
						<div>return min(hash(x, seed) for x in S)</div>
						<div class="mt-2 text-[var(--color-accent)]"># Key property:</div>
						<div>P[minhash(A) == minhash(B)] = Jaccard(A, B)</div>
					</div>
					<p class="mt-3 text-[var(--color-muted)] text-[var(--text-tiny)]">
						Converts pairwise similarity to unary hash - enables linear time!
					</p>
				</div>
			</div>
		</div>
	</div>

	<!-- LSH Deep Dive -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>📐</span> Locality Sensitive Hashing (LSH)
		</h2>

		<div class="grid gap-6 md:grid-cols-2">
			<div>
				<h3 class="mb-3 font-semibold text-[var(--color-text)]">The Problem</h3>
				<p class="mb-3 text-[var(--color-muted)] text-[var(--text-small)]">
					With MinHash, P[collision] = Jaccard. But we want:
				</p>
				<ul class="space-y-2 text-[var(--color-muted)] text-[var(--text-small)]">
					<li>If Jaccard > threshold → high collision probability</li>
					<li>If Jaccard &lt; threshold → low collision probability</li>
				</ul>
				<p class="mt-3 text-[var(--color-muted)] text-[var(--text-small)]">
					Need to "sharpen" the probability curve around the threshold.
				</p>
			</div>

			<div>
				<h3 class="mb-3 font-semibold text-[var(--color-text)]">Band/Row Structure</h3>
				<div
					class="space-y-2 rounded-lg bg-[var(--color-bg)] p-4 font-mono text-[var(--text-tiny)]"
				>
					<div>n = 9000 <span class="text-[var(--color-muted)]"># Total hash functions</span></div>
					<div>b = 20 <span class="text-[var(--color-muted)]"># Number of bands</span></div>
					<div>r = 450 <span class="text-[var(--color-muted)]"># Rows per band</span></div>
					<div class="mt-2 text-[var(--color-accent)]">
						# Collision if ANY band has ALL matching
					</div>
					<div>threshold = (1/b)^(1/r) = 0.99</div>
				</div>
				<p class="mt-2 text-[var(--color-muted)] text-[var(--text-tiny)]">
					AND-OR structure: must match all r hashes in some band
				</p>
			</div>
		</div>

		<!-- LSH Curve Visualization -->
		<div class="mt-6 rounded-lg bg-[var(--color-bg)] p-4">
			<h3 class="mb-3 font-semibold text-[var(--color-text)]">Probability Curve Sharpening</h3>
			<div class="grid gap-4 text-[var(--text-tiny)] md:grid-cols-3">
				<div class="rounded bg-[var(--color-secondary)] p-3">
					<div class="mb-2 text-[var(--color-accent)]">Increasing r (rows)</div>
					<p class="text-[var(--color-muted)]">
						Sharpens threshold, moves curve right (harder to match)
					</p>
				</div>
				<div class="rounded bg-[var(--color-secondary)] p-3">
					<div class="mb-2 text-[var(--color-accent)]">Increasing b (bands)</div>
					<p class="text-[var(--color-muted)]">Moves curve left (easier to match)</p>
				</div>
				<div class="rounded bg-[var(--color-secondary)] p-3">
					<div class="mb-2 text-[var(--color-accent)]">At threshold</div>
					<p class="text-[var(--color-muted)]">P[collision] converges to 1 - 1/e ≈ 0.63</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Real-World Examples -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>📋</span> Real-World Pipeline Examples
		</h2>

		<DataTable columns={realWorldExamplesColumns} data={realWorldExamples} keyField="paper" />
	</div>

	<!-- Key Takeaways -->
	<div
		class="rounded-xl border border-[var(--color-primary)]/20 bg-gradient-to-br from-[var(--color-primary)]/10 to-emerald-600/10 p-6"
	>
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-text)]">
			<span>💡</span> Key Takeaways
		</h2>
		<div class="grid gap-4 sm:grid-cols-2">
			<div class="flex items-start gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)]/20 font-bold text-[var(--color-primary)] text-[var(--text-small)]"
				>
					1
				</div>
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">
					<span class="font-semibold text-[var(--color-text)]">Filtering framework:</span>
					Target T + Raw R → Score function → Keep high-scoring examples
				</p>
			</div>
			<div class="flex items-start gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)]/20 font-bold text-[var(--color-primary)] text-[var(--text-small)]"
				>
					2
				</div>
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">
					<span class="font-semibold text-[var(--color-text)]">Three tools:</span>
					KenLM (perplexity), fastText (classification), DSIR (importance sampling)
				</p>
			</div>
			<div class="flex items-start gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)]/20 font-bold text-[var(--color-primary)] text-[var(--text-small)]"
				>
					3
				</div>
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">
					<span class="font-semibold text-[var(--color-text)]">Hashing is key:</span>
					Enables linear-time dedup by converting pairwise to unary operations
				</p>
			</div>
			<div class="flex items-start gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)]/20 font-bold text-[var(--color-primary)] text-[var(--text-small)]"
				>
					4
				</div>
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">
					<span class="font-semibold text-[var(--color-text)]">MinHash + LSH:</span>
					Approximate Jaccard similarity with controllable precision via bands/rows
				</p>
			</div>
		</div>
	</div>
</div>
