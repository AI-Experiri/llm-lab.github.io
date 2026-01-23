<!-- ABOUTME: Visualizes Shaw et al. 2018 relative position encoding -->
<!-- ABOUTME: Shows how relative PE is added in attention computation -->

<script>
	import { Section } from './layouts';
	import RelativePE_AttnDiagram from './RelativePE_AttnDiagram.svelte';
</script>

<!-- Header -->
<Section>
	<div class="mb-2 flex items-center gap-4">
		<h2 class="font-bold text-[#e94560] text-[var(--text-h1)]">Relative Position Encoding</h2>
		<a
			href="https://arxiv.org/abs/1803.02155"
			target="_blank"
			class="text-[var(--text-small)] text-gray-400 hover:text-white"
		>
			Shaw et al., 2018 ↗
		</a>
	</div>

	<div class="mb-3 rounded bg-[#0f3460] p-3">
		<p class="text-[var(--text-body)] text-gray-300">
			<strong class="text-white">Core idea:</strong> Instead of adding position to input embeddings,
			inject <strong class="text-blue-400">relative distance</strong> directly into the attention computation
			via learned embeddings aᴷ and aⱽ.
		</p>
	</div>

	<p class="text-[var(--text-small)] text-gray-400">
		Learned embeddings for each relative distance. Better length generalization via clipping.
	</p>
</Section>

<!-- 1. The Problem with Absolute PE -->
<Section>
	<h3 class="mb-2 font-semibold text-[#e94560] text-[var(--text-h2)]">
		1. The Problem with Absolute Positional Encoding
	</h3>

	<p class="mb-3 text-[var(--text-small)] text-gray-300">
		Sinusoidal PE adds position information to the <strong class="text-white"
			>input embeddings</strong
		>, before attention even happens:
	</p>

	<div class="mb-3 rounded bg-[#1a1a2e] p-3">
		<code class="text-[var(--text-small)] text-purple-300"
			>input = token_embedding + PE(absolute_position)</code
		>
	</div>

	<p class="mb-3 text-[var(--text-small)] text-gray-300">But this has limitations:</p>

	<div class="space-y-2 text-[var(--text-small)] text-gray-300">
		<div class="flex gap-2">
			<span class="font-bold text-red-400">1.</span>
			<p>
				<strong class="text-white">Attention cares about relative distance:</strong> When "sat" attends
				to "cat", what matters is "1 token apart", not "positions 2 and 1".
			</p>
		</div>
		<div class="flex gap-2">
			<span class="font-bold text-red-400">2.</span>
			<p>
				<strong class="text-white">Poor length generalization:</strong> Model trained on 512 tokens struggles
				with 1024 tokens — it's never seen position 513's encoding.
			</p>
		</div>
		<div class="flex gap-2">
			<span class="font-bold text-red-400">3.</span>
			<p>
				<strong class="text-white">Position info gets diluted:</strong> After multiple layers, the position
				signal mixed into embeddings may weaken.
			</p>
		</div>
	</div>

	<div class="mt-3 rounded border border-amber-500/30 bg-[#1a1a2e] p-3">
		<p class="text-[var(--text-small)] text-gray-300">
			<strong class="text-amber-400">The question:</strong> What if we told the attention mechanism
			<em>how far apart</em> tokens are, instead of where each one sits absolutely?
		</p>
	</div>
</Section>

<!-- 2. The Key Insight -->
<Section>
	<h3 class="mb-2 font-semibold text-[#e94560] text-[var(--text-h2)]">2. The Key Insight</h3>

	<div class="mb-3 rounded border border-blue-500/30 bg-[#1a1a2e] p-3">
		<p class="mb-2 font-semibold text-[var(--text-body)] text-white">
			Position information belongs in the attention computation, not the input.
		</p>
		<p class="text-[var(--text-small)] text-gray-400">
			Instead of telling each token "you are at position 5", tell the attention mechanism "these two
			tokens are 3 apart".
		</p>
	</div>

	<div class="grid gap-4 md:grid-cols-2">
		<div class="rounded border border-purple-500/30 bg-[#1a1a2e] p-3">
			<p class="mb-2 font-semibold text-[var(--text-small)] text-purple-400">Sinusoidal (2017)</p>
			<p class="mb-2 text-[var(--text-small)] text-gray-300">Position added to input:</p>
			<code
				class="block rounded bg-purple-900/30 px-2 py-1 text-[var(--text-small)] text-purple-300"
				>x = embed + PE(pos)</code
			>
			<code
				class="mt-1 block rounded bg-purple-900/30 px-2 py-1 text-[var(--text-small)] text-purple-300"
				>attn = softmax(QKᵀ/√d)</code
			>
			<p class="mt-2 text-[var(--text-small)] text-gray-500">
				Position baked into x, attention is position-unaware
			</p>
		</div>
		<div class="rounded border border-blue-500/30 bg-[#1a1a2e] p-3">
			<p class="mb-2 font-semibold text-[var(--text-small)] text-blue-400">Shaw et al. (2018)</p>
			<p class="mb-2 text-[var(--text-small)] text-gray-300">Position added in attention:</p>
			<code class="block rounded bg-blue-900/30 px-2 py-1 text-[var(--text-small)] text-blue-300"
				>x = embed</code
			>
			<code
				class="mt-1 block rounded bg-blue-900/30 px-2 py-1 text-[var(--text-small)] text-blue-300"
				>attn = softmax((QKᵀ + Q·aᴷ)/√d)</code
			>
			<code
				class="mt-1 block rounded bg-blue-900/30 px-2 py-1 text-[var(--text-small)] text-blue-300"
				>out = attn · (V + aⱽ)</code
			>
			<p class="mt-2 text-[var(--text-small)] text-gray-500">
				Attention directly sees relative distance
			</p>
		</div>
	</div>
</Section>

<!-- 3. How It Works -->
<Section>
	<h3 class="mb-2 font-semibold text-[#e94560] text-[var(--text-h2)]">
		3. How It Works: Learned Relative Embeddings
	</h3>

	<p class="mb-3 text-[var(--text-small)] text-gray-300">
		Shaw et al. introduce <strong class="text-white">learned embedding vectors</strong> for each relative
		distance:
	</p>

	<div class="mb-4 rounded bg-[#1a1a2e] p-3">
		<p class="mb-2 text-[var(--text-small)] text-gray-400">
			<strong class="text-white">Two learned embedding tables:</strong>
		</p>
		<div class="space-y-2 font-mono text-[var(--text-small)]">
			<div class="flex items-center gap-2">
				<span class="text-blue-400">aᴷ<sub>i-j</sub></span>
				<span class="text-gray-500">— embedding for distance (i-j), added to</span>
				<span class="text-white">Keys</span>
			</div>
			<div class="flex items-center gap-2">
				<span class="text-blue-400">aⱽ<sub>i-j</sub></span>
				<span class="text-gray-500">— embedding for distance (i-j), added to</span>
				<span class="text-white">Values</span>
			</div>
		</div>
		<div class="mt-3 space-y-2 border-t border-gray-700 pt-2">
			<p class="text-[var(--text-small)] text-gray-500">
				<strong class="text-yellow-400">Notation:</strong>
				Superscript <span class="text-blue-400">K</span> = "for Keys",
				<span class="text-blue-400">V</span>
				= "for Values". Don't confuse with <span class="text-orange-400">k</span> (lowercase) = clipping
				range.
			</p>
			<p class="text-[var(--text-small)] text-gray-500">
				<strong class="text-yellow-400">Are aᴷ and aⱽ the same?</strong>
				No — same shape (2k+1, d), but <strong class="text-white">separately learned</strong>. aᴷ
				learns "who to attend to", aⱽ learns "what to extract".
			</p>
		</div>
	</div>

	<!-- Before/After comparison -->
	<div class="mb-4 grid gap-4 md:grid-cols-2">
		<div class="rounded border border-purple-500/30 bg-[#1a1a2e] p-3">
			<p class="mb-2 font-semibold text-[var(--text-small)] text-purple-400">
				Original Attention (Sinusoidal)
			</p>
			<div class="space-y-2 font-mono text-[var(--text-small)]">
				<div>
					<p class="mb-1 text-gray-500">1. Attention score:</p>
					<code class="text-purple-300"
						>e<sub>ij</sub> = (x<sub>i</sub>W<sup>Q</sup>)(x<sub>j</sub>W<sup>K</sup>)ᵀ / √d</code
					>
				</div>
				<div>
					<p class="mb-1 text-gray-500">2. Attention weights:</p>
					<code class="text-purple-300">α<sub>ij</sub> = softmax(e<sub>ij</sub>)</code>
				</div>
				<div>
					<p class="mb-1 text-gray-500">3. Output:</p>
					<code class="text-purple-300"
						>z<sub>i</sub> = Σ α<sub>ij</sub>(x<sub>j</sub>W<sup>V</sup>)</code
					>
				</div>
			</div>
			<p class="mt-2 text-[var(--text-small)] text-gray-500">
				Position was in x (input), not in attention
			</p>
		</div>

		<div class="rounded border border-blue-500/30 bg-[#1a1a2e] p-3">
			<p class="mb-2 font-semibold text-[var(--text-small)] text-blue-400">
				Shaw et al. (Relative PE)
			</p>
			<div class="space-y-2 font-mono text-[var(--text-small)]">
				<div>
					<p class="mb-1 text-gray-500">1. Attention score:</p>
					<code class="text-blue-300"
						>e<sub>ij</sub> = (x<sub>i</sub>W<sup>Q</sup>)(x<sub>j</sub>W<sup>K</sup> +
						<span class="text-blue-400">a<sup>K</sup><sub>i-j</sub></span>)ᵀ / √d</code
					>
				</div>
				<div>
					<p class="mb-1 text-gray-500">2. Attention weights:</p>
					<code class="text-blue-300">α<sub>ij</sub> = softmax(e<sub>ij</sub>)</code>
				</div>
				<div>
					<p class="mb-1 text-gray-500">3. Output:</p>
					<code class="text-blue-300"
						>z<sub>i</sub> = Σ α<sub>ij</sub>(x<sub>j</sub>W<sup>V</sup> +
						<span class="text-blue-400">a<sup>V</sup><sub>i-j</sub></span>)</code
					>
				</div>
			</div>
			<p class="mt-2 text-[var(--text-small)] text-gray-500">
				Position added directly in attention computation
			</p>
		</div>
	</div>

	<div class="rounded bg-[#1a1a2e] p-3">
		<p class="mb-2 text-[var(--text-small)] text-gray-400">
			<strong class="text-white">Example:</strong> "sat" (i=2) attending to "cat" (j=1)
		</p>
		<div class="space-y-1 font-mono text-[var(--text-small)]">
			<p class="text-gray-300">
				Relative distance: i - j = 2 - 1 = <span class="text-blue-400">1</span>
			</p>
			<p class="text-gray-300">
				Look up: aᴷ<sub>1</sub> and aⱽ<sub>1</sub> (embeddings for "1 apart")
			</p>
			<p class="text-gray-300">
				Score: Q("sat") · (K("cat") + <span class="text-blue-400">aᴷ<sub>1</sub></span>)ᵀ
			</p>
			<p class="text-gray-300">
				Output: α · (V("cat") + <span class="text-blue-400">aⱽ<sub>1</sub></span>)
			</p>
		</div>
	</div>
</Section>

<!-- 4. Clipping -->
<Section>
	<h3 class="mb-2 font-semibold text-[#e94560] text-[var(--text-h2)]">4. Distance Clipping</h3>

	<p class="mb-3 text-[var(--text-small)] text-gray-300">
		Instead of learning embeddings for every possible distance, clip to a maximum distance <strong
			class="text-white">k</strong
		> (e.g., k=16):
	</p>

	<div class="mb-3 rounded bg-[#1a1a2e] p-3">
		<code class="block text-[var(--text-small)] text-blue-300">clip(i-j, -k, k)</code>
		<p class="mt-2 text-[var(--text-small)] text-gray-500">
			Only need 2k+1 learned embeddings (e.g., 33 for k=16)
		</p>
	</div>

	<p class="mb-2 text-[var(--text-small)] text-gray-300">
		<strong class="text-white">Why clip?</strong>
	</p>
	<div class="space-y-1 text-[var(--text-small)] text-gray-400">
		<p>• Precise distance matters for nearby tokens (syntax, grammar)</p>
		<p>• Beyond k tokens, "far away" is enough — exact distance less important</p>
		<p>• Enables generalization to longer sequences than seen in training</p>
	</div>
</Section>

<!-- 5. Understanding the a^K Embedding Table -->
<Section>
	<h3 class="mb-2 font-semibold text-[#e94560] text-[var(--text-h2)]">
		5. Understanding the aᴷ Embedding Table
	</h3>

	<p class="mb-3 text-[var(--text-small)] text-gray-300">
		<strong class="text-white">aᴷ is a learned lookup table</strong> — just like word embeddings, but
		indexed by relative distance instead of word ID.
	</p>

	<!-- The embedding table with visual cells -->
	<div class="mb-4 rounded bg-[#0f3460] p-4">
		<p class="mb-3 text-center font-semibold text-[var(--text-body)] text-blue-400">
			aᴷ Embedding Table (k=2, showing 8 of 64 dims)
		</p>
		<div class="flex flex-col items-center gap-3">
			<!-- Distance -2 -->
			<div class="flex items-center gap-2">
				<span class="w-20 text-right font-mono text-[var(--text-small)] text-blue-400">aᴷ[-2]:</span
				>
				<div class="flex gap-0.5">
					{#each [0.1, -0.3, 0.2, 0.7, -0.5, 0.4, 0.8, -0.2] as v, i (i)}
						<div
							class="flex h-8 w-6 items-center justify-center rounded-sm text-[8px] text-white"
							style="background: {v > 0
								? `rgba(59, 130, 246, ${Math.abs(v)})`
								: `rgba(239, 68, 68, ${Math.abs(v)})`}"
						>
							{v.toFixed(1)}
						</div>
					{/each}
					<span class="ml-1 text-[var(--text-small)] text-gray-500">...</span>
				</div>
				<span class="ml-2 text-[var(--text-small)] text-gray-500">2 ahead</span>
			</div>
			<!-- Distance -1 -->
			<div class="flex items-center gap-2">
				<span class="w-20 text-right font-mono text-[var(--text-small)] text-blue-400">aᴷ[-1]:</span
				>
				<div class="flex gap-0.5">
					{#each [0.2, 0.1, -0.1, 0.5, 0.3, -0.4, 0.6, 0.2] as v, i (i)}
						<div
							class="flex h-8 w-6 items-center justify-center rounded-sm text-[8px] text-white"
							style="background: {v > 0
								? `rgba(59, 130, 246, ${Math.abs(v)})`
								: `rgba(239, 68, 68, ${Math.abs(v)})`}"
						>
							{v.toFixed(1)}
						</div>
					{/each}
					<span class="ml-1 text-[var(--text-small)] text-gray-500">...</span>
				</div>
				<span class="ml-2 text-[var(--text-small)] text-gray-500">1 ahead</span>
			</div>
			<!-- Distance 0 -->
			<div class="flex items-center gap-2">
				<span class="w-20 text-right font-mono text-[var(--text-small)] text-green-400">aᴷ[0]:</span
				>
				<div class="flex gap-0.5">
					{#each [0.5, 0.5, 0.4, 0.6, 0.3, 0.7, 0.4, 0.5] as v, i (i)}
						<div
							class="flex h-8 w-6 items-center justify-center rounded-sm text-[8px] text-white"
							style="background: rgba(16, 185, 129, {Math.abs(v)})"
						>
							{v.toFixed(1)}
						</div>
					{/each}
					<span class="ml-1 text-[var(--text-small)] text-gray-500">...</span>
				</div>
				<span class="ml-2 text-[var(--text-small)] text-gray-500">same pos</span>
			</div>
			<!-- Distance +1 -->
			<div class="flex items-center gap-2">
				<span class="w-20 text-right font-mono text-[var(--text-small)] text-orange-400"
					>aᴷ[+1]:</span
				>
				<div class="flex gap-0.5">
					{#each [-0.1, 0.2, 0.3, 0.4, -0.2, 0.5, 0.1, 0.3] as v, i (i)}
						<div
							class="flex h-8 w-6 items-center justify-center rounded-sm text-[8px] text-white"
							style="background: {v > 0
								? `rgba(251, 146, 60, ${Math.abs(v)})`
								: `rgba(239, 68, 68, ${Math.abs(v)})`}"
						>
							{v.toFixed(1)}
						</div>
					{/each}
					<span class="ml-1 text-[var(--text-small)] text-gray-500">...</span>
				</div>
				<span class="ml-2 text-[var(--text-small)] text-gray-500">1 behind</span>
			</div>
			<!-- Distance +2 -->
			<div class="flex items-center gap-2">
				<span class="w-20 text-right font-mono text-[var(--text-small)] text-orange-400"
					>aᴷ[+2]:</span
				>
				<div class="flex gap-0.5">
					{#each [-0.3, 0.1, 0.1, 0.2, 0.6, -0.1, 0.3, 0.4] as v, i (i)}
						<div
							class="flex h-8 w-6 items-center justify-center rounded-sm text-[8px] text-white"
							style="background: {v > 0
								? `rgba(251, 146, 60, ${Math.abs(v)})`
								: `rgba(239, 68, 68, ${Math.abs(v)})`}"
						>
							{v.toFixed(1)}
						</div>
					{/each}
					<span class="ml-1 text-[var(--text-small)] text-gray-500">...</span>
				</div>
				<span class="ml-2 text-[var(--text-small)] text-gray-500">2 behind</span>
			</div>
		</div>
		<p class="mt-3 text-center text-[var(--text-small)] text-gray-500">
			Shape: (2k+1, d_head) = (5, 64). Initialized randomly, <strong class="text-white"
				>learned via backpropagation</strong
			>.
		</p>
	</div>

	<!-- How lookup works -->
	<div class="mb-4 rounded bg-[#1a1a2e] p-3">
		<p class="mb-3 text-[var(--text-small)] text-gray-400">
			<strong class="text-white">How lookup works:</strong> Query i=2 ("sat") attending to all keys
		</p>
		<div class="overflow-x-auto font-mono text-[var(--text-small)]">
			<table class="w-full border-collapse">
				<thead>
					<tr class="border-b border-gray-700 text-gray-400">
						<th class="px-3 py-2 text-left">j</th>
						<th class="px-3 py-2 text-left">Key</th>
						<th class="px-3 py-2 text-center">i - j</th>
						<th class="px-3 py-2 text-center">Distance</th>
						<th class="px-3 py-2 text-left">Lookup</th>
					</tr>
				</thead>
				<tbody class="text-gray-300">
					<tr class="border-b border-gray-800"
						><td class="px-3 py-1.5 text-gray-500">0</td><td class="px-3 py-1.5">"The"</td><td
							class="px-3 py-1.5 text-center text-gray-400">2 - 0</td
						><td class="px-3 py-1.5 text-center font-semibold text-orange-400">+2</td><td
							class="px-3 py-1.5 text-orange-400">aᴷ[+2]</td
						></tr
					>
					<tr class="border-b border-gray-800"
						><td class="px-3 py-1.5 text-gray-500">1</td><td class="px-3 py-1.5">"cat"</td><td
							class="px-3 py-1.5 text-center text-gray-400">2 - 1</td
						><td class="px-3 py-1.5 text-center font-semibold text-orange-400">+1</td><td
							class="px-3 py-1.5 text-orange-400">aᴷ[+1]</td
						></tr
					>
					<tr class="border-b border-gray-800 bg-green-900/20"
						><td class="px-3 py-1.5 text-gray-500">2</td><td class="px-3 py-1.5">"sat"</td><td
							class="px-3 py-1.5 text-center text-gray-400">2 - 2</td
						><td class="px-3 py-1.5 text-center font-semibold text-green-400">0</td><td
							class="px-3 py-1.5 text-green-400">aᴷ[0]</td
						></tr
					>
					<tr class="border-b border-gray-800"
						><td class="px-3 py-1.5 text-gray-500">3</td><td class="px-3 py-1.5">"on"</td><td
							class="px-3 py-1.5 text-center text-gray-400">2 - 3</td
						><td class="px-3 py-1.5 text-center font-semibold text-blue-400">-1</td><td
							class="px-3 py-1.5 text-blue-400">aᴷ[-1]</td
						></tr
					>
					<tr class="border-b border-gray-800"
						><td class="px-3 py-1.5 text-gray-500">4</td><td class="px-3 py-1.5">"the"</td><td
							class="px-3 py-1.5 text-center text-gray-400">2 - 4</td
						><td class="px-3 py-1.5 text-center font-semibold text-blue-400">-2</td><td
							class="px-3 py-1.5 text-blue-400">aᴷ[-2]</td
						></tr
					>
					<tr class="bg-red-900/20"
						><td class="px-3 py-1.5 text-gray-500">5</td><td class="px-3 py-1.5">"mat"</td><td
							class="px-3 py-1.5 text-center text-gray-400">2 - 5</td
						><td class="px-3 py-1.5 text-center"
							><span class="text-gray-500">-3</span> <span class="text-red-400">→ -2</span></td
						><td class="px-3 py-1.5 text-blue-400"
							>aᴷ[-2] <span class="text-[10px] text-red-400">CLIPPED</span></td
						></tr
					>
				</tbody>
			</table>
		</div>
	</div>

	<!-- Distance matrix visualization -->
	<div class="mb-4 rounded bg-[#1a1a2e] p-3">
		<p class="mb-1 text-[var(--text-small)] text-gray-400">
			<strong class="text-white">Relative distance matrix</strong> for "The cat sat on the mat"
		</p>
		<p class="mb-3 text-[var(--text-small)] text-gray-500">
			Using <strong class="text-yellow-400">k=2</strong> for this example (in practice, k=16 or k=64 is
			common)
		</p>
		<div class="overflow-x-auto font-mono text-[var(--text-small)]">
			<table class="border-collapse">
				<thead>
					<tr class="text-gray-400">
						<th class="border-b border-gray-700 px-2 py-1.5"></th>
						<th class="border-b border-gray-700 px-2 py-1.5 text-center">The</th>
						<th class="border-b border-gray-700 px-2 py-1.5 text-center">cat</th>
						<th class="border-b border-gray-700 px-2 py-1.5 text-center">sat</th>
						<th class="border-b border-gray-700 px-2 py-1.5 text-center">on</th>
						<th class="border-b border-gray-700 px-2 py-1.5 text-center">the</th>
						<th class="border-b border-gray-700 px-2 py-1.5 text-center">mat</th>
					</tr>
				</thead>
				<tbody>
					<tr
						><td class="px-2 py-1 font-semibold text-gray-400">The</td><td
							class="px-2 py-1 text-center font-bold text-green-400">0</td
						><td class="px-2 py-1 text-center text-blue-400">-1</td><td
							class="px-2 py-1 text-center text-blue-400">-2</td
						><td class="px-2 py-1 text-center text-red-400/70">-2*</td><td
							class="px-2 py-1 text-center text-red-400/70">-2*</td
						><td class="px-2 py-1 text-center text-red-400/70">-2*</td></tr
					>
					<tr
						><td class="px-2 py-1 font-semibold text-gray-400">cat</td><td
							class="px-2 py-1 text-center text-orange-400">+1</td
						><td class="px-2 py-1 text-center font-bold text-green-400">0</td><td
							class="px-2 py-1 text-center text-blue-400">-1</td
						><td class="px-2 py-1 text-center text-blue-400">-2</td><td
							class="px-2 py-1 text-center text-red-400/70">-2*</td
						><td class="px-2 py-1 text-center text-red-400/70">-2*</td></tr
					>
					<tr
						><td class="px-2 py-1 font-semibold text-gray-400">sat</td><td
							class="px-2 py-1 text-center text-orange-400">+2</td
						><td class="px-2 py-1 text-center text-orange-400">+1</td><td
							class="px-2 py-1 text-center font-bold text-green-400">0</td
						><td class="px-2 py-1 text-center text-blue-400">-1</td><td
							class="px-2 py-1 text-center text-blue-400">-2</td
						><td class="px-2 py-1 text-center text-red-400/70">-2*</td></tr
					>
					<tr
						><td class="px-2 py-1 font-semibold text-gray-400">on</td><td
							class="px-2 py-1 text-center text-red-400/70">+2*</td
						><td class="px-2 py-1 text-center text-orange-400">+2</td><td
							class="px-2 py-1 text-center text-orange-400">+1</td
						><td class="px-2 py-1 text-center font-bold text-green-400">0</td><td
							class="px-2 py-1 text-center text-blue-400">-1</td
						><td class="px-2 py-1 text-center text-blue-400">-2</td></tr
					>
					<tr
						><td class="px-2 py-1 font-semibold text-gray-400">the</td><td
							class="px-2 py-1 text-center text-red-400/70">+2*</td
						><td class="px-2 py-1 text-center text-red-400/70">+2*</td><td
							class="px-2 py-1 text-center text-orange-400">+2</td
						><td class="px-2 py-1 text-center text-orange-400">+1</td><td
							class="px-2 py-1 text-center font-bold text-green-400">0</td
						><td class="px-2 py-1 text-center text-blue-400">-1</td></tr
					>
					<tr
						><td class="px-2 py-1 font-semibold text-gray-400">mat</td><td
							class="px-2 py-1 text-center text-red-400/70">+2*</td
						><td class="px-2 py-1 text-center text-red-400/70">+2*</td><td
							class="px-2 py-1 text-center text-red-400/70">+2*</td
						><td class="px-2 py-1 text-center text-orange-400">+2</td><td
							class="px-2 py-1 text-center text-orange-400">+1</td
						><td class="px-2 py-1 text-center font-bold text-green-400">0</td></tr
					>
				</tbody>
			</table>
		</div>
		<div class="mt-3 space-y-2">
			<p class="text-[var(--text-small)] text-gray-400">
				<span class="text-red-400">*</span> = <strong class="text-white">clipped</strong> — with k=2,
				we only have embeddings for [-2, +2]. Distances like -3, -4, +3 all use aᴷ[-2] or aᴷ[+2].
			</p>
			<p class="text-[var(--text-small)] text-gray-500">
				Notice the <a
					href="https://en.wikipedia.org/wiki/Toeplitz_matrix"
					target="_blank"
					class="text-blue-400 underline hover:text-blue-300">Toeplitz structure</a
				>: each diagonal has the same value (same relative distance).
			</p>
		</div>
	</div>

	<!-- Why clip? -->
	<div class="mb-4 rounded bg-[#0f3460] p-3">
		<p class="mb-2 text-[var(--text-small)] text-gray-400">
			<strong class="text-white">Why not use embeddings for every possible distance?</strong>
		</p>
		<div class="space-y-2 text-[var(--text-small)] text-gray-300">
			<p>
				<span class="font-semibold text-red-400">Problem:</span> A 4096-token sequence would need 8191
				embeddings (distances -4095 to +4095). Too many parameters!
			</p>
			<p>
				<span class="font-semibold text-blue-400">Insight:</span> Does it matter if tokens are 100 vs
				101 apart? For distant tokens, "far away" is enough.
			</p>
			<p>
				<span class="font-semibold text-green-400">Solution:</span> With k=16, only
				<strong class="text-white">33 embeddings</strong> needed. Nearby = precise, distant = shared "far"
				embedding.
			</p>
		</div>
	</div>

	<!-- k is independent of context length -->
	<div class="mb-4 rounded border border-yellow-500/30 bg-[#1a1a2e] p-3">
		<p class="mb-2 font-semibold text-[var(--text-small)] text-yellow-400">
			Key insight: k is independent of context length!
		</p>
		<div class="space-y-1.5 text-[var(--text-small)] text-gray-300">
			<p>
				• <strong class="text-white">k=16</strong> works for 512-token sequences, 2048-token sequences,
				or 100k-token sequences
			</p>
			<p>
				• Context length can grow without adding parameters — all "far" tokens use aᴷ[-k] or aᴷ[+k]
			</p>
			<p>• This is why relative PE generalizes better than absolute PE to longer sequences</p>
		</div>
	</div>

	<!-- How it becomes a bias -->
	<div class="rounded bg-[#0f3460] p-3">
		<p class="mb-2 text-[var(--text-small)] text-gray-400">
			<strong class="text-white">For each cell (i, j) in the attention matrix:</strong>
		</p>
		<div class="space-y-1.5 font-mono text-[var(--text-small)] text-gray-300">
			<p>
				<span class="font-semibold text-blue-400">①</span> Look up aᴷ[i-j] → get d-dimensional embedding
				vector
			</p>
			<p>
				<span class="font-semibold text-blue-400">②</span> Compute Qᵢ · aᴷ[i-j] → dot product gives
				a <strong class="text-white">scalar bias</strong>
			</p>
			<p>
				<span class="font-semibold text-blue-400">③</span> Add bias to QKᵀ[i,j] → position-aware attention
				score
			</p>
		</div>
	</div>
</Section>

<!-- 6. Understanding the a^V Embedding Table -->
<Section>
	<h3 class="mb-2 font-semibold text-[#e94560] text-[var(--text-h2)]">
		6. Understanding the aⱽ Embedding Table
	</h3>

	<p class="mb-3 text-[var(--text-small)] text-gray-300">
		<strong class="text-white">aⱽ is a separate lookup table</strong> — same structure as aᴷ, but
		used for the <strong class="text-purple-400">output</strong> instead of attention scores.
	</p>

	<!-- The embedding table with visual cells -->
	<div class="mb-4 rounded bg-[#0f3460] p-4">
		<p class="mb-3 text-center font-semibold text-[var(--text-body)] text-purple-400">
			aⱽ Embedding Table (k=2, showing 8 of 64 dims)
		</p>
		<div class="flex flex-col items-center gap-3">
			<!-- Distance -2 -->
			<div class="flex items-center gap-2">
				<span class="w-20 text-right font-mono text-[var(--text-small)] text-blue-400">aⱽ[-2]:</span
				>
				<div class="flex gap-0.5">
					{#each [0.3, -0.1, 0.4, 0.2, -0.3, 0.6, 0.1, -0.4] as v, i (i)}
						<div
							class="flex h-8 w-6 items-center justify-center rounded-sm text-[8px] text-white"
							style="background: {v > 0
								? `rgba(168, 85, 247, ${Math.abs(v)})`
								: `rgba(239, 68, 68, ${Math.abs(v)})`}"
						>
							{v.toFixed(1)}
						</div>
					{/each}
					<span class="ml-1 text-[var(--text-small)] text-gray-500">...</span>
				</div>
				<span class="ml-2 text-[var(--text-small)] text-gray-500">2 ahead</span>
			</div>
			<!-- Distance -1 -->
			<div class="flex items-center gap-2">
				<span class="w-20 text-right font-mono text-[var(--text-small)] text-blue-400">aⱽ[-1]:</span
				>
				<div class="flex gap-0.5">
					{#each [0.1, 0.3, -0.2, 0.4, 0.5, -0.1, 0.2, 0.3] as v, i (i)}
						<div
							class="flex h-8 w-6 items-center justify-center rounded-sm text-[8px] text-white"
							style="background: {v > 0
								? `rgba(168, 85, 247, ${Math.abs(v)})`
								: `rgba(239, 68, 68, ${Math.abs(v)})`}"
						>
							{v.toFixed(1)}
						</div>
					{/each}
					<span class="ml-1 text-[var(--text-small)] text-gray-500">...</span>
				</div>
				<span class="ml-2 text-[var(--text-small)] text-gray-500">1 ahead</span>
			</div>
			<!-- Distance 0 -->
			<div class="flex items-center gap-2">
				<span class="w-20 text-right font-mono text-[var(--text-small)] text-green-400">aⱽ[0]:</span
				>
				<div class="flex gap-0.5">
					{#each [0.6, 0.4, 0.5, 0.3, 0.4, 0.6, 0.5, 0.4] as v, i (i)}
						<div
							class="flex h-8 w-6 items-center justify-center rounded-sm text-[8px] text-white"
							style="background: rgba(16, 185, 129, {Math.abs(v)})"
						>
							{v.toFixed(1)}
						</div>
					{/each}
					<span class="ml-1 text-[var(--text-small)] text-gray-500">...</span>
				</div>
				<span class="ml-2 text-[var(--text-small)] text-gray-500">same pos</span>
			</div>
			<!-- Distance +1 -->
			<div class="flex items-center gap-2">
				<span class="w-20 text-right font-mono text-[var(--text-small)] text-orange-400"
					>aⱽ[+1]:</span
				>
				<div class="flex gap-0.5">
					{#each [-0.2, 0.4, 0.1, 0.3, -0.1, 0.2, 0.4, 0.1] as v, i (i)}
						<div
							class="flex h-8 w-6 items-center justify-center rounded-sm text-[8px] text-white"
							style="background: {v > 0
								? `rgba(168, 85, 247, ${Math.abs(v)})`
								: `rgba(239, 68, 68, ${Math.abs(v)})`}"
						>
							{v.toFixed(1)}
						</div>
					{/each}
					<span class="ml-1 text-[var(--text-small)] text-gray-500">...</span>
				</div>
				<span class="ml-2 text-[var(--text-small)] text-gray-500">1 behind</span>
			</div>
			<!-- Distance +2 -->
			<div class="flex items-center gap-2">
				<span class="w-20 text-right font-mono text-[var(--text-small)] text-orange-400"
					>aⱽ[+2]:</span
				>
				<div class="flex gap-0.5">
					{#each [-0.1, 0.2, 0.3, -0.2, 0.4, 0.1, 0.2, 0.3] as v, i (i)}
						<div
							class="flex h-8 w-6 items-center justify-center rounded-sm text-[8px] text-white"
							style="background: {v > 0
								? `rgba(168, 85, 247, ${Math.abs(v)})`
								: `rgba(239, 68, 68, ${Math.abs(v)})`}"
						>
							{v.toFixed(1)}
						</div>
					{/each}
					<span class="ml-1 text-[var(--text-small)] text-gray-500">...</span>
				</div>
				<span class="ml-2 text-[var(--text-small)] text-gray-500">2 behind</span>
			</div>
		</div>
		<p class="mt-3 text-center text-[var(--text-small)] text-gray-500">
			Same shape as aᴷ: (2k+1, d_head) = (5, 64). <strong class="text-white"
				>Different learned values</strong
			>.
		</p>
	</div>

	<!-- How aⱽ is used -->
	<div class="rounded bg-[#0f3460] p-3">
		<p class="mb-2 text-[var(--text-small)] text-gray-400">
			<strong class="text-white">For each output position i:</strong>
		</p>
		<div class="space-y-1.5 font-mono text-[var(--text-small)] text-gray-300">
			<p>
				<span class="font-semibold text-purple-400">①</span> For each j, look up aⱽ[i-j] → get d-dimensional
				embedding vector
			</p>
			<p>
				<span class="font-semibold text-purple-400">②</span> Add to value: Vⱼ + aⱽ[i-j] → position-aware
				value
			</p>
			<p>
				<span class="font-semibold text-purple-400">③</span> Weighted sum: Σ αᵢⱼ · (Vⱼ + aⱽ[i-j]) → output
				includes relative position info
			</p>
		</div>
	</div>
</Section>

<!-- 7. Key Differences from Sinusoidal -->
<Section>
	<h3 class="mb-2 font-semibold text-[#e94560] text-[var(--text-h2)]">
		7. Key Differences from Sinusoidal PE
	</h3>

	<div class="overflow-x-auto">
		<table class="w-full text-[var(--text-small)]">
			<thead>
				<tr class="text-left text-gray-400">
					<th class="pb-2"></th>
					<th class="pb-2 text-purple-400">Sinusoidal (2017)</th>
					<th class="pb-2 text-blue-400">Shaw et al. (2018)</th>
				</tr>
			</thead>
			<tbody class="text-gray-300">
				<tr class="border-t border-gray-700">
					<td class="py-2 text-gray-400">Position type</td>
					<td class="py-2">Absolute (pos = 0, 1, 2...)</td>
					<td class="py-2">Relative (dist = i - j)</td>
				</tr>
				<tr class="border-t border-gray-700">
					<td class="py-2 text-gray-400">Where added</td>
					<td class="py-2">Input embeddings</td>
					<td class="py-2">Attention computation</td>
				</tr>
				<tr class="border-t border-gray-700">
					<td class="py-2 text-gray-400">Learned?</td>
					<td class="py-2">No (fixed sinusoidal)</td>
					<td class="py-2">Yes (learned embeddings)</td>
				</tr>
				<tr class="border-t border-gray-700">
					<td class="py-2 text-gray-400">Length generalization</td>
					<td class="py-2">Poor</td>
					<td class="py-2">Better (via clipping)</td>
				</tr>
			</tbody>
		</table>
	</div>
</Section>

<!-- 8. How PE is Used in the Attention Mechanism -->
<Section>
	<h3 class="mb-2 font-semibold text-[#e94560] text-[var(--text-h2)]">
		8. How PE is Used in the Attention Mechanism
	</h3>

	<p class="mb-4 text-[var(--text-small)] text-gray-300">
		Unlike sinusoidal PE where position is added to the input embeddings, Shaw et al. inject
		relative position information
		<strong class="text-white">directly into the attention computation</strong> via learned embeddings
		aᴷ and aⱽ:
	</p>

	<RelativePE_AttnDiagram />
</Section>

<!-- Summary -->
<Section title="Summary">
	<div class="mb-4 rounded bg-[#1a1a2e] p-4">
		<p class="mb-3 font-semibold text-[var(--text-small)] text-amber-400">Key Takeaways</p>
		<ul class="space-y-2 text-[var(--text-small)] text-gray-300">
			<li class="flex gap-2">
				<span class="text-amber-400">1.</span>
				<span>Relative not absolute — encodes distance (i-j) instead of position (i)</span>
			</li>
			<li class="flex gap-2">
				<span class="text-amber-400">2.</span>
				<span
					>Two learned embedding tables — a<sup>K</sup> for keys (routing), a<sup>V</sup> for values (content)</span
				>
			</li>
			<li class="flex gap-2">
				<span class="text-amber-400">3.</span>
				<span
					>Injected into attention — position affects Q·K scores and weighted values directly</span
				>
			</li>
			<li class="flex gap-2">
				<span class="text-amber-400">4.</span>
				<span>Clipping for generalization — distances beyond ±k share the same embedding</span>
			</li>
			<li class="flex gap-2">
				<span class="text-amber-400">5.</span>
				<span
					>Translation invariant — "the cat sat" has same internal structure at any position</span
				>
			</li>
			<li class="flex gap-2">
				<span class="text-amber-400">6.</span>
				<span
					>Learned (not fixed) — model discovers optimal distance representations during training</span
				>
			</li>
			<li class="flex gap-2">
				<span class="text-amber-400">7.</span>
				<span>Foundation for later work — inspired Transformer-XL, T5, and eventually RoPE</span>
			</li>
		</ul>
	</div>

	<div class="rounded border border-emerald-500/50 bg-[#1a1a2e] p-3">
		<p class="mb-1 font-semibold text-[var(--text-small)] text-emerald-400">The Bottom Line</p>
		<p class="text-[var(--text-small)] text-gray-300">
			Shaw et al.'s key insight: inject position information <em>into</em> attention rather than
			<em>before</em> it. By using relative distances with learned embeddings, the model gains translation
			invariance and better length generalization.
		</p>
	</div>
</Section>

<!-- What happened next - eureka section -->
<section
	class="mb-4 rounded-lg border-2 border-cyan-400 bg-gradient-to-br from-cyan-600/30 via-blue-700/20 to-purple-800/20 p-4 shadow-lg shadow-cyan-500/20"
>
	<h3 class="mb-2 font-semibold text-[var(--text-h2)] text-cyan-300">💡 What happened next</h3>

	<div class="mb-4 rounded bg-[#1a1a2e]/80 p-4">
		<p class="mb-3 text-[var(--text-small)] text-gray-300">
			Shaw et al.'s relative PE was a breakthrough, but researchers had new questions:
		</p>
		<div class="space-y-2 text-[var(--text-small)]">
			<div class="flex gap-2">
				<span class="text-cyan-400">?</span>
				<div>
					<p class="text-gray-300">
						<strong class="text-white">What about very long sequences?</strong> Clipping helps, but can
						we process documents longer than memory allows?
					</p>
					<p class="text-gray-500">Could we use recurrence to handle arbitrarily long contexts?</p>
				</div>
			</div>
			<div class="flex gap-2">
				<span class="text-cyan-400">?</span>
				<div>
					<p class="text-gray-300">
						<strong class="text-white">Per-layer embeddings?</strong> Shaw uses the same aᴷ, aⱽ for all
						layers.
					</p>
					<p class="text-gray-500">
						What if different layers need different position representations?
					</p>
				</div>
			</div>
			<div class="flex gap-2">
				<span class="text-cyan-400">?</span>
				<div>
					<p class="text-gray-300">
						<strong class="text-white">Computation efficiency?</strong> Looking up embeddings for each
						(i,j) pair has overhead.
					</p>
					<p class="text-gray-500">Can we reformulate for better efficiency?</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Teaser for Transformer-XL -->
	<div class="rounded border border-[#e94560]/40 bg-[#e94560]/15 p-4">
		<p class="mb-2 font-semibold text-[#e94560] text-[var(--text-small)]">
			What if we combined relative PE with recurrence?
		</p>
		<p class="text-[var(--text-small)] text-gray-300">
			Transformer-XL introduced <strong class="text-white">segment-level recurrence</strong> to process
			very long documents, with a reformulated relative PE that works across segment boundaries.
		</p>
		<p class="mt-2 text-[var(--text-small)] text-gray-400">
			→ See the <strong class="text-[#e94560]">Transformer-XL</strong> tab
		</p>
	</div>
</section>
