<!-- ABOUTME: Visualizes T5 bucketed relative position bias -->
<!-- ABOUTME: Shows logarithmic bucketing and scalar bias addition -->

<script>
	import { Section } from './layouts';
</script>

<div class="space-y-4">
	<!-- Header -->
	<section class="rounded-lg bg-[#16213e] p-4">
		<div class="mb-2 flex items-center gap-4">
			<h2 class="font-bold text-[#e94560] text-[var(--text-h1)]">
				T5: Bucketed Relative Position Bias
			</h2>
			<a
				href="https://arxiv.org/abs/1910.10683"
				target="_blank"
				class="text-[var(--text-small)] text-gray-400 hover:text-white"
			>
				Raffel et al., 2020 ↗
			</a>
		</div>

		<!-- Core Summary -->
		<div class="mb-3 rounded bg-[#0f3460] p-3">
			<p class="text-[var(--text-body)] text-gray-300">
				<strong class="text-white">Core idea:</strong> Not all position differences are equally
				important.
				<strong class="text-yellow-400">Nearby tokens</strong> need precise distance info — "1 vs 2
				tokens apart" determines if something is an adjective or a verb.
				<strong class="text-gray-500">Distant tokens</strong> just need "roughly how far" — at 50 tokens
				away, you're retrieving context, not parsing grammar.
			</p>
		</div>

		<p class="text-[var(--text-small)] text-gray-400">
			T5 uses 32 learned scalar biases with logarithmic bucketing — fine-grained near,
			coarse-grained far.
		</p>
	</section>

	<!-- 1. The Problem -->
	<section class="rounded-lg bg-[#16213e] p-4">
		<h3 class="mb-2 font-semibold text-[#e94560] text-[var(--text-h2)]">
			1. The Problem: Too Many Position Parameters
		</h3>
		<p class="mb-3 text-[var(--text-body)] text-gray-300">
			Previous methods (Sinusoidal, Transformer-XL) gave every distance unique treatment. But is the
			difference between "50 tokens apart" and "51 tokens apart" really meaningful?
		</p>
		<div class="mb-3 rounded bg-[#0f3460] p-3">
			<div class="flex items-center gap-2 overflow-x-auto pb-2 font-mono text-[var(--text-small)]">
				<span class="text-gray-500">distance:</span>
				<span class="rounded border border-green-500/50 bg-green-900/30 px-2 py-1 text-green-300"
					>1</span
				>
				<span class="rounded border border-green-500/50 bg-green-900/30 px-2 py-1 text-green-300"
					>2</span
				>
				<span class="text-gray-500">...</span>
				<span class="rounded bg-gray-700/30 px-2 py-1 text-gray-400">50</span>
				<span class="rounded bg-gray-700/30 px-2 py-1 text-gray-400">51</span>
				<span class="text-gray-500">...</span>
				<span class="rounded bg-gray-700/30 px-2 py-1 text-gray-400">100</span>
				<span class="rounded bg-gray-700/30 px-2 py-1 text-gray-400">101</span>
			</div>
			<p class="text-[var(--text-small)] text-gray-500">
				Each distance gets unique treatment — but is this necessary?
			</p>
		</div>

		<div class="rounded border border-amber-500/30 bg-[#1a1a2e] p-3">
			<p class="text-[var(--text-small)] text-gray-300">
				<strong class="text-amber-400">The question:</strong> Does exact distance always matter, or can
				we group similar distances together?
			</p>
		</div>
	</section>

	<!-- 2. Local vs Long-Range -->
	<section class="rounded-lg bg-[#16213e] p-4">
		<h3 class="mb-2 font-semibold text-[#e94560] text-[var(--text-h2)]">
			2. Why Local Precision Matters More
		</h3>
		<p class="mb-3 text-[var(--text-body)] text-gray-300">
			Language has two types of dependencies, and they have very different distance patterns:
		</p>

		<div class="mb-4 grid gap-4 md:grid-cols-2">
			<!-- Syntactic -->
			<div class="rounded bg-[#0f3460] p-4">
				<p class="mb-2 font-semibold text-[var(--text-body)] text-green-400">
					Syntactic Dependencies: LOCAL
				</p>
				<p class="mb-2 text-[var(--text-small)] text-gray-300">
					Grammar operates on adjacent or near-adjacent tokens:
				</p>
				<div class="space-y-2 text-[var(--text-small)]">
					<div class="rounded bg-[#1a1a2e] p-2">
						<p class="mb-1 text-gray-400">
							<strong class="text-white">Subject-verb agreement:</strong>
						</p>
						<p class="font-mono">
							"The <span class="text-cyan-400">cat</span> <span class="text-green-400">sits</span>"
							— <span class="text-green-300">1 token apart</span>
						</p>
					</div>
					<div class="rounded bg-[#1a1a2e] p-2">
						<p class="mb-1 text-gray-400"><strong class="text-white">Adjective-noun:</strong></p>
						<p class="font-mono">
							"<span class="text-cyan-400">Big</span> <span class="text-green-400">dog</span>" —
							<span class="text-green-300">adjacent</span>
						</p>
					</div>
					<div class="rounded bg-[#1a1a2e] p-2">
						<p class="mb-1 text-gray-400">
							<strong class="text-white">Preposition phrase:</strong>
						</p>
						<p class="font-mono">
							"on the <span class="text-green-400">mat</span>" —
							<span class="text-green-300">1-2 tokens</span>
						</p>
					</div>
				</div>
				<p class="mt-3 font-semibold text-[var(--text-small)] text-green-400">
					✓ Here, 1 vs 2 tokens = different grammatical role
				</p>
			</div>

			<!-- Semantic -->
			<div class="rounded bg-[#0f3460] p-4">
				<p class="mb-2 font-semibold text-[var(--text-body)] text-amber-400">
					Semantic Dependencies: LONG-RANGE
				</p>
				<p class="mb-2 text-[var(--text-small)] text-gray-300">
					Meaning connections span across sentences:
				</p>
				<div class="space-y-2 text-[var(--text-small)]">
					<div class="rounded bg-[#1a1a2e] p-2">
						<p class="mb-1 text-gray-400"><strong class="text-white">Coreference:</strong></p>
						<p class="font-mono">
							"The <span class="text-amber-400">cat</span>... 50 tokens...
							<span class="text-amber-400">it</span> sat"
						</p>
						<p class="mt-1 text-gray-500">Just need "far back", not exactly how far</p>
					</div>
					<div class="rounded bg-[#1a1a2e] p-2">
						<p class="mb-1 text-gray-400"><strong class="text-white">Topic tracking:</strong></p>
						<p class="text-gray-500">Knowing "this was mentioned earlier" is sufficient</p>
					</div>
				</div>
				<p class="mt-3 font-semibold text-[var(--text-small)] text-amber-400">
					≈ Here, 50 vs 51 tokens = same relationship
				</p>
			</div>
		</div>

		<!-- The insight box -->
		<div class="rounded border border-yellow-500/50 bg-[#1a1a2e] p-3">
			<p class="mb-1 font-semibold text-[var(--text-body)] text-white">The Insight</p>
			<p class="mb-2 text-[var(--text-small)] text-gray-300">
				<strong class="text-green-400">"1 vs 2 tokens apart"</strong> = likely different syntactic
				role (adjective vs verb).
				<strong class="text-gray-500">"50 vs 51 tokens apart"</strong> = same semantic relationship (both
				are "context from earlier").
			</p>
			<p class="text-[var(--text-small)] text-gray-300">
				<strong class="text-yellow-400">So:</strong> Give nearby distances their own unique encoding (distance
				1 ≠ distance 2). But for far distances, group them together (distances 50-60 can share one encoding)
				— saves parameters without losing useful information.
			</p>
		</div>
	</section>

	<!-- 3. T5's Solution -->
	<section class="rounded-lg bg-[#16213e] p-4">
		<h3 class="mb-2 font-semibold text-[#e94560] text-[var(--text-h2)]">
			3. T5's Solution: Logarithmic Bucketing
		</h3>
		<p class="mb-3 text-[var(--text-body)] text-gray-300">
			Instead of unique embeddings for every possible distance, T5 learns only <strong
				class="text-yellow-400">32 embedding vectors</strong
			>. Relative positions (distances between tokens) are mapped to these 32 embeddings using
			logarithmic bucketing:
		</p>

		<div class="mb-4 rounded bg-[#0f3460] p-4">
			<div class="space-y-3">
				<!-- Close distances -->
				<div>
					<p class="mb-2 font-semibold text-[var(--text-body)] text-green-400">
						Close distances (0-15): Exact buckets
					</p>
					<div
						class="flex items-center gap-3 overflow-x-auto pb-4 font-mono text-[var(--text-small)]"
					>
						<span
							class="relative rounded border border-green-500/30 bg-green-900/40 px-3 py-1.5 text-green-300"
							>0<sub class="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-green-500"
								>b0</sub
							></span
						>
						<span
							class="relative rounded border border-green-500/30 bg-green-900/40 px-3 py-1.5 text-green-300"
							>1<sub class="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-green-500"
								>b1</sub
							></span
						>
						<span
							class="relative rounded border border-green-500/30 bg-green-900/40 px-3 py-1.5 text-green-300"
							>2<sub class="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-green-500"
								>b2</sub
							></span
						>
						<span
							class="relative rounded border border-green-500/30 bg-green-900/40 px-3 py-1.5 text-green-300"
							>3<sub class="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-green-500"
								>b3</sub
							></span
						>
						<span class="text-gray-500">...</span>
						<span
							class="relative rounded border border-green-500/30 bg-green-900/40 px-3 py-1.5 text-green-300"
							>14<sub
								class="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-green-500"
								>b14</sub
							></span
						>
						<span
							class="relative rounded border border-green-500/30 bg-green-900/40 px-3 py-1.5 text-green-300"
							>15<sub
								class="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-green-500"
								>b15</sub
							></span
						>
					</div>
					<p class="text-[var(--text-small)] text-gray-500">
						Each distance gets its own bucket = maximum precision where it matters
					</p>
				</div>

				<!-- Far distances -->
				<div>
					<p class="mb-2 font-semibold text-[var(--text-body)] text-amber-400">
						Far distances (16-128): Logarithmic buckets
					</p>
					<div
						class="flex items-center gap-3 overflow-x-auto pb-4 font-mono text-[var(--text-small)]"
					>
						<span
							class="relative rounded border border-amber-500/30 bg-amber-900/40 px-2 py-1.5 text-amber-300"
							>16-18<sub
								class="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-amber-500"
								>b16</sub
							></span
						>
						<span
							class="relative rounded border border-amber-500/30 bg-amber-900/40 px-2 py-1.5 text-amber-300"
							>19-23<sub
								class="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-amber-500"
								>b17</sub
							></span
						>
						<span
							class="relative rounded border border-amber-500/30 bg-amber-900/40 px-2 py-1.5 text-amber-300"
							>24-31<sub
								class="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-amber-500"
								>b18</sub
							></span
						>
						<span
							class="relative rounded border border-amber-500/30 bg-amber-900/40 px-2 py-1.5 text-amber-300"
							>32-47<sub
								class="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-amber-500"
								>b19</sub
							></span
						>
						<span class="text-gray-500">...</span>
						<span
							class="relative rounded border border-amber-500/30 bg-amber-900/40 px-2 py-1.5 text-amber-300"
							>97-128<sub
								class="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-amber-500"
								>b25</sub
							></span
						>
					</div>
					<p class="text-[var(--text-small)] text-gray-500">
						Bucket sizes grow exponentially = "roughly how far" is enough
					</p>
				</div>

				<!-- Beyond 128 -->
				<div>
					<p class="mb-2 font-semibold text-[var(--text-body)] text-gray-400">
						Beyond 128: Same bucket
					</p>
					<div class="flex items-center gap-3 pb-4 font-mono text-[var(--text-small)]">
						<span
							class="relative rounded border border-gray-500/30 bg-gray-700/40 px-2 py-1.5 text-gray-400"
							>129, 130, 200, 500, 1000...<sub
								class="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-gray-500"
								>b31</sub
							></span
						>
						<span class="text-gray-500">→ all map to bucket 31</span>
					</div>
					<p class="text-[var(--text-small)] text-gray-500">
						T5 stops distinguishing — relies on layer stacking for long-range
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- 4. How It Works -->
	<section class="rounded-lg bg-[#16213e] p-4">
		<h3 class="mb-2 font-semibold text-[#e94560] text-[var(--text-h2)]">
			4. How It Works: Scalar Bias Addition
		</h3>
		<p class="mb-3 text-[var(--text-body)] text-gray-300">
			T5 radically simplifies position encoding compared to previous approaches:
		</p>

		<div class="mb-4 grid gap-4 md:grid-cols-2">
			<div class="rounded bg-[#0f3460] p-4">
				<p class="mb-2 font-semibold text-[var(--text-body)] text-gray-400">
					Previous (Transformer-XL)
				</p>
				<code class="mb-2 block font-mono text-[var(--text-body)] text-gray-300"
					>score += Q · R(i-j)ᵀ</code
				>
				<p class="text-[var(--text-small)] text-gray-500">
					Dot product with position vectors (expensive)
				</p>
			</div>
			<div class="rounded border border-yellow-500/30 bg-[#0f3460] p-4">
				<p class="mb-2 font-semibold text-[var(--text-body)] text-yellow-400">T5</p>
				<code class="mb-2 block font-mono text-[var(--text-body)] text-yellow-300"
					>score += b[bucket(i-j)]</code
				>
				<p class="text-[var(--text-small)] text-gray-500">Just add a learned scalar (cheap!)</p>
			</div>
		</div>

		<!-- What is b? -->
		<div class="mb-4 rounded border border-yellow-500/30 bg-[#1a1a2e] p-4">
			<p class="mb-2 font-semibold text-[var(--text-body)] text-yellow-400">
				What is <code class="rounded bg-yellow-900/30 px-1">b</code>?
			</p>
			<div class="space-y-2 text-[var(--text-small)] text-gray-300">
				<p>
					<strong class="text-white">A lookup table of 32 learned scalars</strong> — one scalar per bucket,
					learned during training.
				</p>
				<div class="rounded bg-[#0f3460] p-3 font-mono text-[var(--text-small)]">
					<span class="text-gray-500">b = [</span>
					<span class="text-yellow-300">-0.12</span><span class="text-gray-500">,</span>
					<span class="text-yellow-300"> 0.08</span><span class="text-gray-500">,</span>
					<span class="text-yellow-300"> 0.15</span><span class="text-gray-500">,</span>
					<span class="text-yellow-300"> 0.22</span><span class="text-gray-500"
						>, ... (32 scalars total)</span
					>
					<span class="text-gray-500">]</span>
				</div>
				<div class="mt-2 flex gap-2">
					<span class="text-green-400">✓</span>
					<p>
						<strong class="text-white">Each attention head</strong> has its own independent set of 32
						biases
					</p>
				</div>
				<div class="flex gap-2">
					<span class="text-green-400">✓</span>
					<p>
						<strong class="text-white">Shared across all layers</strong> — unlike Shaw et al. which learns
						per-layer embeddings
					</p>
				</div>
				<div class="flex gap-2">
					<span class="text-green-400">✓</span>
					<p>
						<strong class="text-white">Not a d-dimensional vector</strong> — just a single number added
						to the attention logit
					</p>
				</div>
			</div>
		</div>

		<!-- Example -->
		<div class="rounded bg-[#0f3460] p-4">
			<p class="mb-3 font-semibold text-[var(--text-body)] text-white">
				Example: Query at position 50
			</p>
			<div class="rounded bg-[#1a1a2e] p-3">
				<div class="space-y-2 font-mono text-[var(--text-small)]">
					<div class="flex flex-nowrap items-center gap-3">
						<span class="whitespace-nowrap text-gray-500">attending to 49:</span>
						<span class="whitespace-nowrap text-white">dist = 1</span>
						<span class="text-gray-500">→</span>
						<span class="whitespace-nowrap text-green-400">embedding #1</span>
						<span class="text-gray-500">(unique)</span>
					</div>
					<div class="flex flex-nowrap items-center gap-3">
						<span class="whitespace-nowrap text-gray-500">attending to 45:</span>
						<span class="whitespace-nowrap text-white">dist = 5</span>
						<span class="text-gray-500">→</span>
						<span class="whitespace-nowrap text-green-400">embedding #5</span>
						<span class="text-gray-500">(unique)</span>
					</div>
					<div class="flex flex-nowrap items-center gap-3">
						<span class="whitespace-nowrap text-gray-500">attending to 30:</span>
						<span class="whitespace-nowrap text-white">dist = 20</span>
						<span class="text-gray-500">→</span>
						<span class="whitespace-nowrap text-amber-400">embedding #17</span>
						<span class="text-gray-500">(shared 19-23)</span>
					</div>
					<div class="flex flex-nowrap items-center gap-3">
						<span class="whitespace-nowrap text-gray-500">attending to 0:</span>
						<span class="whitespace-nowrap text-white">dist = 50</span>
						<span class="text-gray-500">→</span>
						<span class="whitespace-nowrap text-amber-400">embedding #24</span>
						<span class="text-gray-500">(shared 45-63)</span>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- 5. The 128-Token Boundary -->
	<section class="rounded-lg bg-[#16213e] p-4">
		<h3 class="mb-2 font-semibold text-[#e94560] text-[var(--text-h2)]">
			5. The 128-Token Boundary
		</h3>
		<p class="mb-3 text-[var(--text-body)] text-gray-300">
			A single attention layer can only distinguish positions up to 128 tokens apart. But this isn't
			a limitation — it's a design choice:
		</p>

		<div class="mb-4 rounded border border-yellow-500/50 bg-[#1a1a2e] p-4">
			<p class="mb-2 font-semibold text-[var(--text-body)] text-white">From the Paper</p>
			<blockquote
				class="border-l-2 border-yellow-500 pl-3 text-[var(--text-small)] text-gray-400 italic"
			>
				"We use <strong class="text-yellow-400">32 embeddings</strong> for all of our models with
				ranges that increase in size logarithmically up to an offset of
				<strong class="text-yellow-400">128</strong>
				beyond which we assign all relative positions to the same embedding. Note that a given layer is
				insensitive to relative position beyond 128 tokens, but
				<strong class="text-yellow-400"
					>subsequent layers can build a sensitivity to larger offsets</strong
				>
				by combining local information from previous layers."
				<span class="mt-2 block text-gray-500">— Raffel et al., Section 3.3</span>
			</blockquote>
		</div>
	</section>

	<!-- 6. Layer Composition -->
	<section class="rounded-lg bg-[#16213e] p-4">
		<h3 class="mb-2 font-semibold text-[#e94560] text-[var(--text-h2)]">
			6. How Layers Build Long-Range Sensitivity
		</h3>
		<p class="mb-3 text-[var(--text-body)] text-gray-300">
			Each layer only "sees" 128 tokens of relative position. But stacking layers creates global
			reach:
		</p>

		<div class="mb-4 rounded bg-[#0f3460] p-4">
			<div class="space-y-4 text-[var(--text-body)]">
				<div class="flex items-start gap-3">
					<span
						class="rounded bg-yellow-900/40 px-3 py-1 font-semibold text-[var(--text-small)] text-yellow-300"
						>Layer 1</span
					>
					<div>
						<p class="text-gray-300">Token at position 500 learns about positions 372-628</p>
						<p class="text-[var(--text-small)] text-gray-500">
							Direct attention within ±128 token window
						</p>
					</div>
				</div>

				<div class="flex items-start gap-3">
					<span
						class="rounded bg-yellow-900/40 px-3 py-1 font-semibold text-[var(--text-small)] text-yellow-300"
						>Layer 2</span
					>
					<div>
						<p class="text-gray-300">Now attends to enriched representations from Layer 1</p>
						<p class="text-[var(--text-small)] text-gray-500">
							Each neighbor carries info from <em>their</em> 128-token windows
						</p>
					</div>
				</div>

				<div class="flex items-start gap-3">
					<span
						class="rounded bg-yellow-900/40 px-3 py-1 font-semibold text-[var(--text-small)] text-yellow-300"
						>Layer 3+</span
					>
					<div>
						<p class="text-gray-300">Information propagates further with each layer</p>
						<p class="text-[var(--text-small)] text-gray-500">
							By layer N, token 500 has indirect access to the entire sequence
						</p>
					</div>
				</div>
			</div>
		</div>

		<div class="rounded border border-green-500/30 bg-[#1a1a2e] p-3">
			<p class="mb-1 font-semibold text-[var(--text-body)] text-white">Key Insight</p>
			<p class="text-[var(--text-small)] text-gray-300">
				Each layer doesn't need global reach. By combining <strong class="text-yellow-400"
					>local information from previous layers</strong
				>, the model builds sensitivity to larger offsets through composition. This is more
				parameter-efficient than explicit long-range position encodings.
			</p>
		</div>
	</section>

	<!-- Summary -->
	<Section title="Summary">
		<div class="mb-4 rounded bg-[#1a1a2e] p-4">
			<p class="mb-3 font-semibold text-[var(--text-small)] text-amber-400">Key Takeaways</p>
			<ul class="space-y-2 text-[var(--text-small)] text-gray-300">
				<li class="flex gap-2">
					<span class="text-amber-400">1.</span>
					<span
						>T5 uses learned scalar biases — one value per bucket, added directly to attention
						scores</span
					>
				</li>
				<li class="flex gap-2">
					<span class="text-amber-400">2.</span>
					<span
						>Logarithmic bucketing — fine-grained for nearby tokens, coarse-grained for distant ones</span
					>
				</li>
				<li class="flex gap-2">
					<span class="text-amber-400">3.</span>
					<span>32 buckets total — 16 for exact positions (0-15), 16 logarithmic (16-128+)</span>
				</li>
				<li class="flex gap-2">
					<span class="text-amber-400">4.</span>
					<span>Only 32 parameters per head — vs hundreds of vectors in previous methods</span>
				</li>
				<li class="flex gap-2">
					<span class="text-amber-400">5.</span>
					<span>Long-range via layer stacking — each layer extends effective receptive field</span>
				</li>
				<li class="flex gap-2">
					<span class="text-amber-400">6.</span>
					<span>Relative not absolute — like Transformer-XL but simpler (scalars vs vectors)</span>
				</li>
				<li class="flex gap-2">
					<span class="text-amber-400">7.</span>
					<span>Bucketing prevents overfitting — generalizes better than exact distance lookup</span
					>
				</li>
			</ul>
		</div>

		<div class="rounded border border-emerald-500/50 bg-[#1a1a2e] p-3">
			<p class="mb-1 font-semibold text-[var(--text-small)] text-emerald-400">The Bottom Line</p>
			<p class="text-[var(--text-small)] text-gray-300">
				T5's key insight: you don't need complex position embeddings — a small learned lookup table
				with logarithmic bucketing captures the linguistic intuition that nearby tokens matter more
				precisely than distant ones.
			</p>
		</div>
	</Section>

	<!-- What happened next -->
	<section
		class="mb-4 rounded-lg border-2 border-cyan-400 bg-gradient-to-br from-cyan-600/30 via-blue-700/20 to-purple-800/20 p-4 shadow-lg shadow-cyan-500/20"
	>
		<h3 class="mb-2 font-semibold text-[var(--text-h2)] text-cyan-300">💡 What happened next</h3>

		<p class="mb-4 text-[var(--text-small)] text-gray-300">
			T5's scalar biases were simple and effective, but still required a learned lookup table.
			Researchers wondered...
		</p>

		<div class="mb-4 space-y-3 text-[var(--text-small)]">
			<div class="flex gap-2">
				<span class="text-cyan-400">?</span>
				<div>
					<p class="text-gray-300">
						<strong class="text-white"
							>Can we get relative positions without any lookup table?</strong
						>
					</p>
					<p class="text-gray-500">What if the math itself encoded relative distance?</p>
				</div>
			</div>
			<div class="flex gap-2">
				<span class="text-cyan-400">?</span>
				<div>
					<p class="text-gray-300">
						<strong class="text-white">What if position lived in the geometry of vectors?</strong>
					</p>
					<p class="text-gray-500">
						Rotating Q and K vectors so their dot product naturally encodes distance?
					</p>
				</div>
			</div>
			<div class="flex gap-2">
				<span class="text-cyan-400">?</span>
				<div>
					<p class="text-gray-300">
						<strong class="text-white"
							>Could we combine the elegance of sinusoids with relative positioning?</strong
						>
					</p>
					<p class="text-gray-500">
						Use continuous functions, but make them encode relative distance in the attention
						computation?
					</p>
				</div>
			</div>
		</div>

		<!-- Teaser for RoPE -->
		<div class="rounded border border-[#e94560]/50 bg-[#e94560]/20 p-3">
			<p class="text-[var(--text-small)] text-gray-300">
				<strong class="text-[#e94560]">RoPE (2021)</strong> found an elegant answer:
				<strong class="text-white">rotate Q and K vectors by their position</strong>. When you
				compute Q·K, the rotation angles subtract — giving you relative position for free.
			</p>
			<p class="mt-2 text-[var(--text-small)] text-gray-500">
				→ See the <strong class="text-orange-400">RoPE</strong> tab
			</p>
		</div>
	</section>
</div>
