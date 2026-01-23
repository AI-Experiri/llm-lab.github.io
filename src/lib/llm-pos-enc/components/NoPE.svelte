<!-- ABOUTME: Visualizes NoPE (No Positional Encoding) approach -->
<!-- ABOUTME: Shows how causal mask provides implicit position information -->

<script>
	import { Section } from './layouts';
</script>

<div class="space-y-4">
	<!-- Header -->
	<section class="rounded-lg bg-[#16213e] p-4">
		<div class="mb-2 flex items-center gap-4">
			<h2 class="font-bold text-[var(--text-h1)] text-pink-500">NoPE: No Positional Encoding</h2>
			<a
				href="https://arxiv.org/abs/2305.19466"
				target="_blank"
				class="text-[var(--text-small)] text-gray-400 hover:text-white"
			>
				Kazemnejad et al., 2023 ↗
			</a>
		</div>

		<!-- Core Summary -->
		<div class="mb-3 rounded bg-[#0f3460] p-3">
			<p class="text-[var(--text-body)] text-gray-300">
				<strong class="text-white">Core idea:</strong>
				<strong class="text-pink-400">Remove PE entirely</strong>. The causal attention mask already
				provides <strong class="text-emerald-400">implicit position info</strong> — each token knows
				how many came before it. This forces the model to learn
				<strong class="text-amber-400">position-invariant patterns</strong> that generalize to any sequence
				length.
			</p>
		</div>

		<p class="text-[var(--text-small)] text-gray-400">
			"The Impact of Positional Encoding on Length Generalisation in Transformers"
		</p>
	</section>

	<!-- 1. The Problem -->
	<section class="rounded-lg bg-[#16213e] p-4">
		<h3 class="mb-2 font-semibold text-[#e94560] text-[var(--text-h2)]">1. The Question</h3>
		<p class="mb-3 text-[var(--text-body)] text-gray-300">
			Every PE method so far assumes position information is <strong class="text-white"
				>necessary</strong
			>. But is it?
		</p>

		<div class="mb-3 rounded bg-[#0f3460] p-3">
			<p class="text-[var(--text-small)] text-gray-300">
				In decoder-only models, token at position 5 can only attend to positions 1-5. This <strong
					class="text-white">triangular mask pattern</strong
				> implicitly encodes position — each token has a unique "attention horizon."
			</p>
		</div>

		<div class="rounded border border-pink-500/30 bg-[#1a1a2e] p-3">
			<p class="text-[var(--text-small)] text-gray-300">
				<strong class="text-pink-400">The question:</strong> What if the causal attention mask already
				provides all the position information the model needs?
			</p>
		</div>
	</section>

	<!-- 2. Key Finding -->
	<section class="rounded-lg bg-[#16213e] p-4">
		<h3 class="mb-2 font-semibold text-[#e94560] text-[var(--text-h2)]">2. The Key Finding</h3>

		<div class="mb-3 rounded border border-pink-500/30 bg-[#0f3460] p-4">
			<p class="mb-2 font-semibold text-[var(--text-body)] text-pink-400">
				Removing PE entirely can improve length generalization
			</p>
			<p class="text-[var(--text-small)] text-gray-300">
				On algorithmic tasks (copying, reversing, addition), NoPE generalizes better to longer
				sequences than sinusoidal, RoPE, or ALiBi — because there's no position encoding to break at
				unseen lengths.
			</p>
		</div>

		<div class="grid gap-3 md:grid-cols-2">
			<div class="rounded bg-[#0f3460] p-3">
				<p class="mb-2 font-semibold text-[var(--text-small)] text-red-400">With PE</p>
				<p class="text-[var(--text-small)] text-gray-300">
					Model learns position-dependent patterns that break at unseen lengths
				</p>
			</div>
			<div class="rounded bg-[#0f3460] p-3">
				<p class="mb-2 font-semibold text-[var(--text-small)] text-green-400">Without PE (NoPE)</p>
				<p class="text-[var(--text-small)] text-gray-300">
					Model forced to learn position-invariant algorithms that generalize
				</p>
			</div>
		</div>
	</section>

	<!-- 3. How It Works -->
	<section class="rounded-lg bg-[#16213e] p-4">
		<h3 class="mb-2 font-semibold text-[#e94560] text-[var(--text-h2)]">
			3. How Position is Inferred
		</h3>
		<p class="mb-3 text-[var(--text-body)] text-gray-300">
			Without explicit PE, the model infers position from the causal mask:
		</p>

		<div class="mb-3 rounded bg-[#0f3460] p-3">
			<div class="space-y-2 font-mono text-[var(--text-small)]">
				<div class="flex items-center gap-2">
					<span class="text-pink-400">Token 1:</span>
					<span class="text-gray-300">can attend to [1]</span>
					<span class="text-gray-500">→ knows it's first</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="text-pink-400">Token 3:</span>
					<span class="text-gray-300">can attend to [1, 2, 3]</span>
					<span class="text-gray-500">→ knows 2 tokens came before</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="text-pink-400">Token N:</span>
					<span class="text-gray-300">can attend to [1, ..., N]</span>
					<span class="text-gray-500">→ knows N-1 tokens came before</span>
				</div>
			</div>
		</div>

		<p class="text-[var(--text-small)] text-gray-500">
			The number of tokens a position can attend to uniquely identifies its position.
		</p>
	</section>

	<!-- Summary -->
	<Section title="Summary">
		<div class="mb-4 rounded bg-[#1a1a2e] p-4">
			<p class="mb-3 font-semibold text-[var(--text-small)] text-amber-400">Key Takeaways</p>
			<ul class="space-y-2 text-[var(--text-small)] text-gray-300">
				<li class="flex gap-2">
					<span class="text-amber-400">1.</span>
					<span>No position encoding at all — remove PE entirely from the model</span>
				</li>
				<li class="flex gap-2">
					<span class="text-amber-400">2.</span>
					<span>Causal mask provides implicit position — each token knows how many came before</span
					>
				</li>
				<li class="flex gap-2">
					<span class="text-amber-400">3.</span>
					<span>Forces position-invariant learning — model can't rely on absolute positions</span>
				</li>
				<li class="flex gap-2">
					<span class="text-amber-400">4.</span>
					<span>Better length generalization — nothing to break at unseen sequence lengths</span>
				</li>
				<li class="flex gap-2">
					<span class="text-amber-400">5.</span>
					<span>Decoder-only — requires causal attention mask to work</span>
				</li>
				<li class="flex gap-2">
					<span class="text-amber-400">6.</span>
					<span>Task-dependent — excels at algorithmic tasks, less clear for natural language</span>
				</li>
				<li class="flex gap-2">
					<span class="text-amber-400">7.</span>
					<span
						>No relative distance — knows "how many before me" but not "how far apart are two
						tokens"</span
					>
				</li>
			</ul>
		</div>

		<div class="rounded border border-emerald-500/50 bg-[#1a1a2e] p-3">
			<p class="mb-1 font-semibold text-[var(--text-small)] text-emerald-400">The Bottom Line</p>
			<p class="text-[var(--text-small)] text-gray-300">
				NoPE's provocative finding: position encoding may be unnecessary for some tasks. The causal
				mask already encodes position implicitly, and removing explicit PE forces the model to learn
				generalizable, position-invariant algorithms.
			</p>
		</div>
	</Section>

	<!-- What happened next -->
	<section
		class="mb-4 rounded-lg border-2 border-cyan-400 bg-gradient-to-br from-cyan-600/30 via-blue-700/20 to-purple-800/20 p-4 shadow-lg shadow-cyan-500/20"
	>
		<h3 class="mb-2 font-semibold text-[var(--text-h2)] text-cyan-300">💡 What happened next</h3>

		<p class="mb-4 text-[var(--text-small)] text-gray-300">
			NoPE showed that explicit position encoding isn't always necessary. This opened new
			questions...
		</p>

		<div class="mb-4 space-y-3 text-[var(--text-small)]">
			<div class="flex gap-2">
				<span class="text-cyan-400">?</span>
				<div>
					<p class="text-gray-300">
						<strong class="text-white">When do we actually need position encoding?</strong>
					</p>
					<p class="text-gray-500">
						Algorithmic tasks work without PE, but what about natural language?
					</p>
				</div>
			</div>
			<div class="flex gap-2">
				<span class="text-cyan-400">?</span>
				<div>
					<p class="text-gray-300">
						<strong class="text-white">Can we get the best of both worlds?</strong>
					</p>
					<p class="text-gray-500">
						Position-invariant learning with optional position hints when needed?
					</p>
				</div>
			</div>
		</div>

		<!-- Research direction -->
		<div class="rounded bg-[#1a1a2e]/80 p-3">
			<p class="text-[var(--text-small)] text-gray-300">
				<strong class="text-pink-400">Active research area:</strong> Understanding when and why position
				encoding helps — and when simpler approaches like NoPE or ALiBi are sufficient.
			</p>
		</div>
	</section>
</div>
