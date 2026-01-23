<!-- ABOUTME: Visualizes DroPE (Dropping Positional Embeddings) from Sakana AI 2024 -->
<!-- ABOUTME: Shows how removing PE after training enables zero-shot context extension -->

<script>
	import { Section } from './layouts';
</script>

<div class="space-y-4">
	<!-- Header -->
	<Section>
		<div class="mb-2 flex flex-wrap items-center gap-4">
			<h2 class="font-bold text-[#e94560] text-[var(--text-h1)]">
				DroPE: Dropping Positional Embeddings
			</h2>
			<div class="flex gap-3 text-[var(--text-small)]">
				<a
					href="https://arxiv.org/abs/2512.12167"
					target="_blank"
					class="text-gray-400 hover:text-white">arXiv ↗</a
				>
				<a
					href="https://pub.sakana.ai/DroPE/"
					target="_blank"
					class="text-gray-400 hover:text-white">Sakana AI ↗</a
				>
				<a
					href="https://github.com/SakanaAI/DroPE"
					target="_blank"
					class="text-gray-400 hover:text-white">GitHub ↗</a
				>
			</div>
		</div>

		<!-- Core Summary -->
		<div class="mb-3 rounded bg-[#0f3460] p-3">
			<p class="text-[var(--text-body)] text-gray-300">
				<strong class="text-white">Core idea:</strong> What if positional embeddings are just
				<strong class="text-emerald-400">training scaffolding</strong>? DroPE discovers that RoPE
				can be <strong class="text-emerald-400">removed entirely</strong> after pretraining,
				followed by brief recalibration. The result:
				<strong class="text-amber-400">zero-shot context extension</strong>
				without the semantic corruption that plagues scaling methods like YaRN.
			</p>
		</div>
	</Section>

	<!-- Section 1: The Big Idea -->
	<Section title="The Big Idea: PE as Scaffolding">
		<p class="mb-4 text-[var(--text-small)] text-gray-300">
			Building construction uses scaffolding — temporary structures that help during building but
			are
			<strong class="text-white">removed when the building is complete</strong>. DroPE proposes that
			positional embeddings work the same way.
		</p>

		<div class="mb-4 grid gap-4 md:grid-cols-2">
			<div class="rounded border border-orange-500/30 bg-[#1a1a2e] p-4">
				<div class="mb-2 flex items-center gap-2">
					<span class="text-2xl">🏗️</span>
					<span class="font-semibold text-[var(--text-small)] text-orange-400"
						>Training with RoPE</span
					>
				</div>
				<p class="text-[var(--text-small)] text-gray-300">
					RoPE provides strong inductive bias that <strong class="text-white"
						>accelerates learning</strong
					>. The model learns positional patterns much faster with explicit position information.
				</p>
				<p class="mt-2 text-[var(--text-small)] text-gray-500">
					Like scaffolding: essential during construction
				</p>
			</div>

			<div class="rounded border border-emerald-500/30 bg-[#1a1a2e] p-4">
				<div class="mb-2 flex items-center gap-2">
					<span class="text-2xl">🏛️</span>
					<span class="font-semibold text-[var(--text-small)] text-emerald-400"
						>Inference without PE</span
					>
				</div>
				<p class="text-[var(--text-small)] text-gray-300">
					After training, positional information is <strong class="text-white"
						>encoded in the weights</strong
					>. The explicit PE becomes unnecessary — and actually
					<strong class="text-red-400">constrains</strong> generalization.
				</p>
				<p class="mt-2 text-[var(--text-small)] text-gray-500">
					Like scaffolding: removed when building is done
				</p>
			</div>
		</div>

		<div class="rounded border border-emerald-500/30 bg-emerald-500/10 p-3">
			<p class="mb-2 font-semibold text-[var(--text-small)] text-emerald-400">Key Insight</p>
			<p class="text-[var(--text-small)] text-gray-300">
				"Positional embeddings accelerate learning but constrain generalization." By removing them
				after training, we get the best of both worlds.
			</p>
		</div>
	</Section>

	<!-- Section 2: Why Scaling Fails -->
	<Section title="Why Scaling Methods Fail">
		<p class="mb-3 text-[var(--text-small)] text-gray-300">
			From the paper: "Popular 'RoPE-scaling' tricks (PI, NTK-aware scaling, YaRN) try to fix this
			by
			<strong class="text-amber-400">compressing low frequencies</strong> to keep phases in range."
		</p>

		<div class="mb-4 rounded bg-[#1a1a2e] p-4">
			<p class="mb-3 text-[var(--text-small)] text-gray-400">The problem with compression:</p>
			<p class="mb-3 text-[var(--text-small)] text-gray-300">
				"That preserves perplexity but quietly <strong class="text-red-400"
					>shifts semantic heads</strong
				>
				— the ones that match content across large distances — so the model behaves as if the context
				were effectively
				<strong class="text-white">cropped to the original length</strong>."
			</p>
			<p class="text-[var(--text-small)] text-gray-500 italic">
				"In practice, you get near-constant perplexity with poor long-range retrieval — exactly what
				long-context tasks need most."
			</p>
		</div>

		<div class="grid gap-4 md:grid-cols-2">
			<div class="rounded border border-amber-500/30 bg-[#1a1a2e] p-3">
				<p class="mb-2 font-semibold text-[var(--text-small)] text-amber-400">
					YaRN Result (from paper)
				</p>
				<p class="text-[var(--text-small)] text-gray-300">
					"YaRN crops effective retrieval context" — maintains perplexity but
					<strong class="text-red-400">fails at retrieval tasks</strong>
				</p>
				<p class="mt-2 text-[var(--text-small)] text-gray-500">
					Performs like cropped input sequences
				</p>
			</div>

			<div class="rounded border border-emerald-500/30 bg-[#1a1a2e] p-3">
				<p class="mb-2 font-semibold text-[var(--text-small)] text-emerald-400">
					DroPE Result (from paper)
				</p>
				<p class="text-[var(--text-small)] text-gray-300">
					Remove PE entirely → <strong class="text-emerald-400">no frequencies to corrupt</strong>
				</p>
				<p class="mt-2 text-[var(--text-small)] text-gray-500">
					"Far outperforms RoPE scaling methods"
				</p>
			</div>
		</div>
	</Section>

	<!-- Section 3: The DroPE Process -->
	<Section title="The DroPE Process">
		<p class="mb-4 text-[var(--text-small)] text-gray-300">
			DroPE is surprisingly simple — three steps:
		</p>

		<div class="mb-4 flex flex-col gap-4 md:flex-row">
			<!-- Step 1 -->
			<div class="flex-1 rounded bg-[#1a1a2e] p-4">
				<div class="mb-2 flex items-center gap-2">
					<span
						class="flex h-8 w-8 items-center justify-center rounded-full bg-orange-600 font-bold text-white"
						>1</span
					>
					<span class="font-semibold text-[var(--text-small)] text-white">Pretrain with RoPE</span>
				</div>
				<p class="text-[var(--text-small)] text-gray-300">
					Train normally using RoPE. Get fast convergence from the positional inductive bias.
				</p>
				<p class="mt-2 font-mono text-[var(--text-small)] text-orange-400">~14B tokens</p>
			</div>

			<!-- Arrow -->
			<div class="hidden items-center md:flex">
				<span class="text-2xl text-gray-500">→</span>
			</div>

			<!-- Step 2 -->
			<div class="flex-1 rounded bg-[#1a1a2e] p-4">
				<div class="mb-2 flex items-center gap-2">
					<span
						class="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 font-bold text-white"
						>2</span
					>
					<span class="font-semibold text-[var(--text-small)] text-white">Drop PE</span>
				</div>
				<p class="text-[var(--text-small)] text-gray-300">
					Simply remove all positional embeddings from the model. No rotation matrices applied.
				</p>
				<p class="mt-2 font-mono text-[var(--text-small)] text-red-400">instant</p>
			</div>

			<!-- Arrow -->
			<div class="hidden items-center md:flex">
				<span class="text-2xl text-gray-500">→</span>
			</div>

			<!-- Step 3 -->
			<div class="flex-1 rounded bg-[#1a1a2e] p-4">
				<div class="mb-2 flex items-center gap-2">
					<span
						class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 font-bold text-white"
						>3</span
					>
					<span class="font-semibold text-[var(--text-small)] text-white">Recalibrate</span>
				</div>
				<p class="text-[var(--text-small)] text-gray-300">
					Brief continued training at original context length to recover performance.
				</p>
				<p class="mt-2 font-mono text-[var(--text-small)] text-emerald-400">~0.5-2% of pretrain</p>
			</div>
		</div>

		<div class="rounded border border-emerald-500/30 bg-emerald-500/10 p-3">
			<p class="mb-2 font-semibold text-[var(--text-small)] text-emerald-400">Result</p>
			<p class="text-[var(--text-small)] text-gray-300">
				Zero-shot context extension: <strong class="text-white">2K → 8K → 32K+</strong> without any long-context
				fine-tuning. The model generalizes to any context length because there are no position-dependent
				rotations to go out of distribution.
			</p>
		</div>
	</Section>

	<!-- Section 4: Actual Results from Paper -->
	<Section title="Actual Results from Paper">
		<p class="mb-4 text-[var(--text-small)] text-gray-300">
			Real benchmark numbers from the DroPE paper (Table 1 & 2):
		</p>

		<!-- NIAH Results -->
		<div class="mb-4 rounded bg-[#1a1a2e] p-4">
			<p class="mb-3 text-[var(--text-small)] text-gray-400">
				NIAH (Needle-in-a-Haystack) at 2× context length:
			</p>
			<div class="overflow-x-auto">
				<table class="w-full text-[var(--text-small)]">
					<thead>
						<tr class="border-b border-gray-700 text-gray-400">
							<th class="py-2 pr-4 text-left">Method</th>
							<th class="px-2 py-2 text-center">Multi-Query</th>
							<th class="px-2 py-2 text-center">Multi-Key</th>
							<th class="px-2 py-2 text-center">Multi-Value</th>
						</tr>
					</thead>
					<tbody class="text-gray-300">
						<tr class="border-b border-gray-700/50">
							<td class="py-2 pr-4 font-semibold text-emerald-400">DroPE</td>
							<td class="px-2 text-center text-emerald-400">28.0%</td>
							<td class="px-2 text-center text-emerald-400">41.6%</td>
							<td class="px-2 text-center text-emerald-400">23.3%</td>
						</tr>
						<tr class="border-b border-gray-700/50">
							<td class="py-2 pr-4">RoPE + YaRN</td>
							<td class="px-2 text-center text-amber-400">17.8%</td>
							<td class="px-2 text-center text-red-400">0.5%</td>
							<td class="px-2 text-center text-amber-400">14.6%</td>
						</tr>
						<tr class="border-b border-gray-700/50">
							<td class="py-2 pr-4">RoPE + NTK</td>
							<td class="px-2 text-center text-amber-400">21.1%</td>
							<td class="px-2 text-center text-amber-400">19.4%</td>
							<td class="px-2 text-center text-amber-400">16.5%</td>
						</tr>
						<tr>
							<td class="py-2 pr-4">NoPE baseline</td>
							<td class="px-2 text-center text-gray-500">9.2%</td>
							<td class="px-2 text-center text-amber-400">36.2%</td>
							<td class="px-2 text-center text-amber-400">21.4%</td>
						</tr>
					</tbody>
				</table>
			</div>
			<p class="mt-2 text-[var(--text-small)] text-gray-500">Source: DroPE paper Table 1</p>
		</div>

		<!-- LongBench Results -->
		<div class="mb-4 grid gap-4 md:grid-cols-2">
			<div class="rounded border border-emerald-500/30 bg-[#1a1a2e] p-4">
				<p class="mb-3 font-semibold text-[var(--text-small)] text-emerald-400">
					SmolLM LongBench Average
				</p>
				<div class="space-y-2 text-[var(--text-small)]">
					<div class="flex justify-between">
						<span class="text-emerald-400">DroPE:</span>
						<span class="font-mono text-white">30.52</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-400">YaRN:</span>
						<span class="font-mono text-gray-300">19.94</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-400">NTK:</span>
						<span class="font-mono text-gray-300">17.11</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-400">Base:</span>
						<span class="font-mono text-red-400">2.98</span>
					</div>
				</div>
			</div>

			<div class="rounded border border-emerald-500/30 bg-[#1a1a2e] p-4">
				<p class="mb-3 font-semibold text-[var(--text-small)] text-emerald-400">
					Llama2-7B LongBench Average
				</p>
				<div class="space-y-2 text-[var(--text-small)]">
					<div class="flex justify-between">
						<span class="text-emerald-400">DroPE:</span>
						<span class="font-mono text-white">26.08</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-400">YaRN:</span>
						<span class="font-mono text-gray-300">19.14</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-400">NTK:</span>
						<span class="font-mono text-gray-300">21.88</span>
					</div>
				</div>
				<p class="mt-2 text-[var(--text-small)] text-gray-500">Source: DroPE paper Table 3</p>
			</div>
		</div>

		<!-- Recalibration efficiency -->
		<div class="rounded border border-emerald-500/30 bg-emerald-500/10 p-3">
			<p class="mb-2 font-semibold text-[var(--text-small)] text-emerald-400">
				Recalibration Efficiency
			</p>
			<p class="text-[var(--text-small)] text-gray-300">
				DroPE recovers <strong class="text-white">95% of performance</strong> with less than
				<strong class="text-white">0.8%</strong> of the original training budget. Full recovery achieved
				with 30B-120B additional tokens.
			</p>
		</div>
	</Section>

	<!-- Section 5: The Perplexity Trap (Revisited) -->
	<Section title="The Perplexity Trap (Revisited)">
		<p class="mb-4 text-[var(--text-small)] text-gray-300">
			A key finding from the DroPE paper: <strong class="text-white">perplexity can lie</strong>.
			Methods that maintain good perplexity may still fail on actual tasks.
		</p>

		<div class="mb-4 rounded bg-[#1a1a2e] p-4">
			<div class="overflow-x-auto">
				<table class="w-full text-[var(--text-small)]">
					<thead>
						<tr class="border-b border-gray-700 text-gray-400">
							<th class="py-2 pr-4 text-left">Method @ 2x context</th>
							<th class="px-4 py-2 text-center">Perplexity</th>
							<th class="px-4 py-2 text-center">NIAH Success</th>
							<th class="py-2 pl-4 text-left">What happened?</th>
						</tr>
					</thead>
					<tbody class="text-gray-300">
						<tr class="border-b border-gray-700/50">
							<td class="py-3 pr-4">RoPE (no scaling)</td>
							<td class="px-4 text-center text-red-400">8.0+</td>
							<td class="px-4 text-center text-red-400">~0%</td>
							<td class="pl-4 text-gray-500">Breaks completely</td>
						</tr>
						<tr class="border-b border-gray-700/50">
							<td class="py-3 pr-4">YaRN</td>
							<td class="px-4 text-center text-green-400">~3.0</td>
							<td class="px-4 text-center text-amber-400">~20%</td>
							<td class="pl-4 text-gray-500">Good perplexity, corrupted semantics</td>
						</tr>
						<tr>
							<td class="py-3 pr-4 font-semibold text-emerald-400">DroPE</td>
							<td class="px-4 text-center text-green-400">~3.2</td>
							<td class="px-4 text-center text-green-400">~40%</td>
							<td class="pl-4 text-emerald-400">Semantics preserved</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>

		<div class="rounded border border-amber-500/30 bg-amber-500/10 p-3">
			<p class="mb-2 font-semibold text-[var(--text-small)] text-amber-400">Lesson</p>
			<p class="text-[var(--text-small)] text-gray-300">
				Don't trust perplexity alone for long-context evaluation.
				<strong class="text-white">Always test on downstream tasks</strong> like retrieval (Needle-in-a-Haystack).
			</p>
		</div>
	</Section>

	<!-- Section 6: Counter-Intuitive Findings -->
	<Section title="Surprising Findings">
		<div class="grid gap-4 md:grid-cols-2">
			<div class="rounded border border-purple-500/30 bg-[#1a1a2e] p-4">
				<p class="mb-2 font-semibold text-[var(--text-small)] text-purple-400">
					Can't train without PE from scratch
				</p>
				<p class="text-[var(--text-small)] text-gray-300">
					Models trained <strong class="text-white">without any PE</strong> from the start perform
					<strong class="text-red-400">worse</strong> than DroPE. The PE scaffold is crucial during training,
					even though it's removable after.
				</p>
			</div>

			<div class="rounded border border-cyan-500/30 bg-[#1a1a2e] p-4">
				<p class="mb-2 font-semibold text-[var(--text-small)] text-cyan-400">
					Minimal recalibration needed
				</p>
				<p class="text-[var(--text-small)] text-gray-300">
					Just <strong class="text-white">2K tokens</strong> (0.0125% of 16B pretraining) recovers 95%+
					performance. Position information is deeply encoded in the weights — very little adjustment
					needed.
				</p>
			</div>

			<div class="rounded border border-amber-500/30 bg-[#1a1a2e] p-4">
				<p class="mb-2 font-semibold text-[var(--text-small)] text-amber-400">
					Gradient analysis reveals why
				</p>
				<p class="text-[var(--text-small)] text-gray-300">
					RoPE heads show <strong class="text-white">dramatically higher gradient norms</strong> at initialization.
					The rotations break attention uniformity, enabling faster positional learning.
				</p>
			</div>

			<div class="rounded border border-emerald-500/30 bg-[#1a1a2e] p-4">
				<p class="mb-2 font-semibold text-[var(--text-small)] text-emerald-400">Scales to 7B+</p>
				<p class="text-[var(--text-small)] text-gray-300">
					The method works across <strong class="text-white"
						>model scales up to 7B parameters</strong
					>
					and trillion-token datasets. Not just a small-model phenomenon.
				</p>
			</div>
		</div>
	</Section>

	<!-- Summary -->
	<Section title="Summary">
		<div class="grid gap-4 md:grid-cols-2">
			<!-- Key takeaways -->
			<div class="rounded bg-[#1a1a2e] p-4">
				<p class="mb-3 font-semibold text-[var(--text-small)] text-amber-400">Key Takeaways</p>
				<ul class="space-y-2 text-[var(--text-small)] text-gray-300">
					<li class="flex gap-2">
						<span class="text-amber-400">1.</span>
						<span
							><strong class="text-white">PE is scaffolding</strong> — useful for training, removable
							after</span
						>
					</li>
					<li class="flex gap-2">
						<span class="text-amber-400">2.</span>
						<span
							><strong class="text-white">Scaling corrupts semantics</strong> — there's no free lunch
							with frequency compression</span
						>
					</li>
					<li class="flex gap-2">
						<span class="text-amber-400">3.</span>
						<span
							><strong class="text-white">Dropping works</strong> — 0.5% recalibration → unlimited context</span
						>
					</li>
					<li class="flex gap-2">
						<span class="text-amber-400">4.</span>
						<span
							><strong class="text-white">Perplexity lies</strong> — always test on downstream tasks</span
						>
					</li>
					<li class="flex gap-2">
						<span class="text-amber-400">5.</span>
						<span
							><strong class="text-white">Simple beats clever</strong> — sometimes the best solution is
							removal, not refinement</span
						>
					</li>
				</ul>
			</div>

			<!-- The evolution -->
			<div class="rounded bg-[#1a1a2e] p-4">
				<p class="mb-3 font-semibold text-[var(--text-small)] text-emerald-400">
					The Evolution of Context Extension
				</p>
				<div class="space-y-2 text-[var(--text-small)]">
					<div class="flex items-start gap-2">
						<span class="shrink-0 text-orange-400">RoPE:</span>
						<span class="text-gray-400">"Encode position with rotation"</span>
					</div>
					<div class="flex items-start gap-2">
						<span class="shrink-0 text-amber-400">YaRN:</span>
						<span class="text-gray-400">"Scale the rotations cleverly"</span>
					</div>
					<div class="flex items-start gap-2">
						<span class="shrink-0 text-emerald-400">DroPE:</span>
						<span class="text-white">"Just remove them entirely"</span>
					</div>
				</div>
			</div>
		</div>
	</Section>

	<!-- What happens next -->
	<section
		class="mb-4 rounded-lg border-2 border-cyan-400 bg-gradient-to-br from-cyan-600/30 via-blue-700/20 to-purple-800/20 p-4 shadow-lg shadow-cyan-500/20"
	>
		<h3 class="mb-2 font-semibold text-[var(--text-h2)] text-cyan-300">💡 What happens next</h3>

		<p class="mb-4 text-[var(--text-small)] text-gray-300">
			DroPE suggests position encoding may be training scaffolding, not a permanent necessity. This
			opens new questions...
		</p>

		<div class="mb-4 space-y-3 text-[var(--text-small)]">
			<div class="flex gap-2">
				<span class="text-cyan-400">?</span>
				<div>
					<p class="text-gray-300"><strong class="text-white">What else is scaffolding?</strong></p>
					<p class="text-gray-500">
						Are there other components we add for training that can be removed later?
					</p>
				</div>
			</div>
			<div class="flex gap-2">
				<span class="text-cyan-400">?</span>
				<div>
					<p class="text-gray-300"><strong class="text-white">When should we drop PE?</strong></p>
					<p class="text-gray-500">
						DroPE drops at the end — is there an optimal point during training?
					</p>
				</div>
			</div>
			<div class="flex gap-2">
				<span class="text-cyan-400">?</span>
				<div>
					<p class="text-gray-300">
						<strong class="text-white">Does this work for encoder models?</strong>
					</p>
					<p class="text-gray-500">
						DroPE tested on decoder-only — what about bidirectional attention?
					</p>
				</div>
			</div>
		</div>

		<!-- Research direction -->
		<div class="rounded bg-[#1a1a2e]/80 p-3">
			<p class="text-[var(--text-small)] text-gray-300">
				<strong class="text-emerald-400">Active research area:</strong> DroPE represents the cutting edge
				of context extension. The field is rapidly evolving as researchers explore the boundaries of position
				encoding necessity.
			</p>
		</div>
	</section>
</div>
