<!-- ABOUTME: Visualizes ALiBi (Attention with Linear Biases) -->
<!-- ABOUTME: Shows linear distance penalty for length extrapolation -->

<script>
	import { Section } from './layouts';
</script>

<div class="space-y-4">
	<!-- Header -->
	<section class="rounded-lg bg-[#16213e] p-4">
		<div class="mb-2 flex items-center gap-4">
			<h2 class="font-bold text-[var(--text-h1)] text-cyan-500">
				ALiBi: Attention with Linear Biases
			</h2>
			<a
				href="https://arxiv.org/abs/2108.12409"
				target="_blank"
				class="text-[var(--text-small)] text-gray-400 hover:text-white"
			>
				Press et al., 2022 ↗
			</a>
		</div>

		<!-- Core Summary -->
		<div class="mb-3 rounded bg-[#0f3460] p-3">
			<p class="text-[var(--text-body)] text-gray-300">
				<strong class="text-white">Core idea:</strong>
				<strong class="text-cyan-400">Subtract</strong>
				a penalty proportional to distance from attention scores:
				<code class="text-cyan-300">score = QK<sup>T</sup> − m·|i−j|</code>.
				<strong class="text-emerald-400">No learned parameters</strong> — just a fixed linear bias
				that naturally
				<strong class="text-amber-400">extrapolates to any length</strong>.
			</p>
		</div>

		<p class="text-[var(--text-small)] text-gray-400">
			"Train Short, Test Long" — models trained on 1024 tokens generalize to 10K+ tokens without
			fine-tuning.
		</p>
	</section>

	<!-- 1. The Problem -->
	<section class="rounded-lg bg-[#16213e] p-4">
		<h3 class="mb-2 font-semibold text-[#e94560] text-[var(--text-h2)]">
			1. The Problem: Length Extrapolation
		</h3>
		<p class="mb-3 text-[var(--text-body)] text-gray-300">
			Previous position encoding methods hit a wall when sequences exceed training length:
		</p>

		<div class="grid gap-3 md:grid-cols-2">
			<div class="rounded bg-[#0f3460] p-3">
				<p class="mb-2 font-semibold text-[var(--text-small)] text-red-400">
					Learned position embeddings
				</p>
				<p class="text-[var(--text-small)] text-gray-300">
					Models trained on 1024 tokens fail at 2048 — they've never seen those position embeddings.
					The embedding table simply doesn't have entries beyond training length.
				</p>
			</div>
			<div class="rounded bg-[#0f3460] p-3">
				<p class="mb-2 font-semibold text-[var(--text-small)] text-red-400">Sinusoidal and RoPE</p>
				<p class="text-[var(--text-small)] text-gray-300">
					While theoretically generalizable, models still degrade on longer sequences. The attention
					patterns learned during training don't transfer well to unseen lengths.
				</p>
			</div>
		</div>

		<div class="mt-3 rounded border border-amber-500/30 bg-[#1a1a2e] p-3">
			<p class="text-[var(--text-small)] text-gray-300">
				<strong class="text-amber-400">The question:</strong> Can we design position encoding that
				<em>naturally</em> works at any length, without needing scaling tricks or fine-tuning?
			</p>
		</div>
	</section>

	<!-- 2. Key Insight -->
	<section class="rounded-lg bg-[#16213e] p-4">
		<h3 class="mb-2 font-semibold text-[#e94560] text-[var(--text-h2)]">
			2. The Key Insight: Simpler is Better
		</h3>
		<p class="mb-3 text-[var(--text-body)] text-gray-300">
			What's the simplest position signal that could work?
		</p>

		<div class="mb-3 rounded border border-cyan-500/30 bg-[#0f3460] p-4">
			<p class="mb-2 font-semibold text-[var(--text-body)] text-cyan-400">
				Just subtract distance from attention scores
			</p>
			<p class="mb-3 text-[var(--text-small)] text-gray-300">
				No learned parameters. No sinusoids. No rotation matrices. Just: <strong class="text-white"
					>closer tokens get higher attention, farther tokens get lower</strong
				>.
			</p>
			<div class="rounded bg-[#1a1a2e] p-3">
				<code class="block text-center text-[var(--text-body)] text-cyan-300"
					>attention_score = Q·K<sup>T</sup> - m·|i - j|</code
				>
				<p class="mt-2 text-center text-[var(--text-small)] text-gray-500">
					where m is a head-specific slope (fixed, not learned)
				</p>
			</div>
		</div>

		<div class="rounded border border-emerald-500/30 bg-[#1a1a2e] p-3">
			<p class="mb-1 font-semibold text-[var(--text-small)] text-emerald-400">
				Why this works for extrapolation
			</p>
			<p class="text-[var(--text-small)] text-gray-300">
				The linear penalty <code class="text-cyan-300">-m·|i-j|</code> produces the same pattern at any
				length. Position 1000 is penalized the same way as position 100 — there's no "out of distribution"
				problem.
			</p>
		</div>
	</section>

	<!-- 3. How It Works -->
	<section class="rounded-lg bg-[#16213e] p-4">
		<h3 class="mb-2 font-semibold text-[#e94560] text-[var(--text-h2)]">
			3. How It Works: Multi-Slope Attention
		</h3>
		<p class="mb-3 text-[var(--text-small)] text-gray-300">
			Each attention head gets a different slope m. Steep slopes focus locally; gentle slopes attend
			globally.
		</p>

		<div class="mb-3 rounded bg-[#0f3460] p-3">
			<p class="mb-2 text-[var(--text-small)] text-gray-400">
				<strong class="text-white">Example with 8 heads:</strong>
			</p>
			<div class="space-y-1 font-mono text-[var(--text-small)]">
				<div class="flex items-center gap-2">
					<span class="w-16 text-cyan-400">Head 1:</span>
					<span class="text-gray-300">m = 1/2</span>
					<span class="text-gray-500">→ steep decay, very local</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="w-16 text-cyan-400">Head 2:</span>
					<span class="text-gray-300">m = 1/4</span>
					<span class="text-gray-500">→ moderate decay</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="w-16 text-cyan-400">...</span>
					<span class="text-gray-300">...</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="w-16 text-cyan-400">Head 8:</span>
					<span class="text-gray-300">m = 1/256</span>
					<span class="text-gray-500">→ gentle decay, global attention</span>
				</div>
			</div>
			<p class="mt-2 text-[var(--text-small)] text-gray-500">
				Slopes form a geometric sequence: m = 2<sup>-8/n</sup> for head n
			</p>
		</div>

		<div class="rounded bg-[#0f3460] p-3">
			<p class="mb-2 text-[var(--text-small)] text-gray-400">
				<strong class="text-white">Attention bias matrix:</strong>
			</p>
			<div class="text-center font-mono text-[var(--text-small)] text-cyan-300">
				<p>[ 0, -1, -2, -3, ... ]</p>
				<p>[ 0, 0, -1, -2, ... ] × m</p>
				<p>[ 0, 0, 0, -1, ... ]</p>
			</div>
			<p class="mt-2 text-center text-[var(--text-small)] text-gray-500">
				Lower triangular distance matrix, multiplied by head-specific slope m
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
					<span>No position embeddings — just subtract m × distance from attention scores</span>
				</li>
				<li class="flex gap-2">
					<span class="text-amber-400">2.</span>
					<span>Linear penalty — farther tokens get lower attention scores (recency bias)</span>
				</li>
				<li class="flex gap-2">
					<span class="text-amber-400">3.</span>
					<span>Per-head slopes (m) — different heads attend at different distance scales</span>
				</li>
				<li class="flex gap-2">
					<span class="text-amber-400">4.</span>
					<span>Zero learned parameters — nothing to overfit to training length</span>
				</li>
				<li class="flex gap-2">
					<span class="text-amber-400">5.</span>
					<span>Train short, test long — models trained on 1K tokens work on 10K+ tokens</span>
				</li>
				<li class="flex gap-2">
					<span class="text-amber-400">6.</span>
					<span>Geometric slope sequence — heads cover local to global attention ranges</span>
				</li>
				<li class="flex gap-2">
					<span class="text-amber-400">7.</span>
					<span>Production proven — BLOOM, MPT, Falcon use ALiBi for length generalization</span>
				</li>
			</ul>
		</div>

		<div class="rounded border border-emerald-500/50 bg-[#1a1a2e] p-3">
			<p class="mb-1 font-semibold text-[var(--text-small)] text-emerald-400">The Bottom Line</p>
			<p class="text-[var(--text-small)] text-gray-300">
				ALiBi's radical insight: you don't need position embeddings at all. A simple linear distance
				penalty captures the recency bias inherent in language and generalizes to any sequence
				length.
			</p>
		</div>
	</Section>

	<!-- What happened next -->
	<section
		class="mb-4 rounded-lg border-2 border-cyan-400 bg-gradient-to-br from-cyan-600/30 via-blue-700/20 to-purple-800/20 p-4 shadow-lg shadow-cyan-500/20"
	>
		<h3 class="mb-2 font-semibold text-[var(--text-h2)] text-cyan-300">💡 What happened next</h3>

		<p class="mb-4 text-[var(--text-small)] text-gray-300">
			ALiBi showed that simpler position encoding works. This raised a radical question...
		</p>

		<div class="mb-4 space-y-3 text-[var(--text-small)]">
			<div class="flex gap-2">
				<span class="text-cyan-400">?</span>
				<div>
					<p class="text-gray-300">
						<strong class="text-white">Do we need position encoding at all?</strong>
					</p>
					<p class="text-gray-500">ALiBi is simple, but it still adds explicit position bias...</p>
				</div>
			</div>
			<div class="flex gap-2">
				<span class="text-cyan-400">?</span>
				<div>
					<p class="text-gray-300"><strong class="text-white">Is causal masking enough?</strong></p>
					<p class="text-gray-500">
						The mask already tells you "this token can only see tokens before it"
					</p>
				</div>
			</div>
			<div class="flex gap-2">
				<span class="text-cyan-400">?</span>
				<div>
					<p class="text-gray-300">
						<strong class="text-white">Can position emerge from content and context?</strong>
					</p>
					<p class="text-gray-500">
						Maybe the model can learn position implicitly from patterns in the data?
					</p>
				</div>
			</div>
		</div>

		<!-- Teaser for NoPE -->
		<div class="rounded border border-[#e94560]/50 bg-[#e94560]/20 p-3">
			<p class="text-[var(--text-small)] text-gray-300">
				<strong class="text-[#e94560]">NoPE (2023)</strong> tested the extreme:
				<strong class="text-white">remove position encoding entirely</strong>. Just causal masking —
				and surprisingly, it works for many tasks.
			</p>
			<p class="mt-2 text-[var(--text-small)] text-gray-500">
				→ See the <strong class="text-pink-400">NoPE</strong> tab
			</p>
		</div>
	</section>
</div>
