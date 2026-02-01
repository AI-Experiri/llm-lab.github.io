<!-- ABOUTME: Notation page explaining attention head dimensions and key symbols -->
<!-- ABOUTME: Covers query heads, KV heads, head dimension, and why they matter for inference -->

<script>
	import { HeroSection, Section, ContentBox, KeyTakeaway } from '$lib/shared';
	import AttentionFlow from './AttentionFlow.svelte';

	// Dimension notation reference
	const dimensionNotation = [
		{ symbol: 'B', name: 'Batch size', description: 'Number of sequences processed together' },
		{ symbol: 'T', name: 'Sequence length (query)', description: 'Tokens being generated/queried' },
		{ symbol: 'S', name: 'Sequence length (KV)', description: 'Tokens in KV cache (context)' },
		{
			symbol: 'D',
			name: 'Model dimension',
			description: 'd_model, embedding size (e.g., 768, 4096)'
		},
		{ symbol: 'F', name: 'MLP hidden dim', description: 'FFN intermediate size (typically 4×D)' },
		{ symbol: 'N', name: 'Query heads', description: 'Number of attention query heads' },
		{ symbol: 'K', name: 'KV heads', description: 'Number of key/value heads (K ≤ N)' },
		{ symbol: 'H', name: 'Head dimension', description: 'Dimension per head (D = N×H)' },
		{ symbol: 'L', name: 'Layers', description: 'Number of transformer layers' }
	];
</script>

<div class="space-y-6">
	<HeroSection title="Attention Head Notation">
		<p class="max-w-3xl leading-relaxed text-[var(--color-muted)] text-[var(--text-body)]">
			Understanding the dimensions and notation used in attention mechanisms is essential for
			reasoning about <span class="font-semibold text-emerald-400">memory usage</span>,
			<span class="font-semibold text-cyan-400">compute requirements</span>, and
			<span class="font-semibold text-[var(--color-primary)]">inference optimization</span>.
		</p>
	</HeroSection>

	<!-- Understanding Attention Head Dimensions -->
	<Section title="Understanding Attention Head Dimensions">
		<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
			Before diving into inference optimizations, let's establish a mental model of what happens
			inside a single attention head. This diagram shows the data flow and dimensions at each step.
		</p>

		<!-- Attention Flow Diagram -->
		<div class="mb-6 overflow-x-auto">
			<AttentionFlow />
		</div>

		<!-- Dimension Notation Reference -->
		<ContentBox variant="dark" class="border border-[var(--color-muted)]/20">
			<h3 class="mb-4 font-bold text-[var(--color-text)]">Key Dimension Notation</h3>
			<p class="mb-4 text-[var(--color-muted)] text-[var(--text-tiny)]">
				These symbols appear throughout inference math. Understanding them is essential for
				reasoning about memory and compute.
			</p>
			<div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
				{#each dimensionNotation as dim (dim.symbol)}
					<div class="flex items-start gap-3 rounded bg-[var(--color-secondary)] p-3">
						<span class="font-mono text-lg font-bold text-[var(--color-primary)]">{dim.symbol}</span
						>
						<div>
							<div class="font-semibold text-[var(--color-text)] text-[var(--text-tiny)]">
								{dim.name}
							</div>
							<div class="text-[var(--color-muted)] text-[var(--text-tiny)]">{dim.description}</div>
						</div>
					</div>
				{/each}
			</div>
		</ContentBox>

		<!-- Key Relationships -->
		<div class="mt-4 grid gap-4 md:grid-cols-3">
			<ContentBox variant="dark" class="border border-emerald-500/20">
				<h4 class="mb-2 font-semibold text-[var(--text-small)] text-emerald-400">
					Query Heads (N)
				</h4>
				<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">
					Each query head computes attention scores independently. Standard transformers have N
					query heads.
				</p>
				<div class="mt-2 font-mono text-[var(--color-accent)] text-[var(--text-tiny)]">
					Q shape: [B, N, T, H]
				</div>
			</ContentBox>

			<ContentBox variant="dark" class="border border-cyan-500/20">
				<h4 class="mb-2 font-semibold text-[var(--text-small)] text-cyan-400">KV Heads (K)</h4>
				<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">
					In GQA, K &lt; N. Multiple query heads share the same K/V. This is where KV cache savings
					come from.
				</p>
				<div class="mt-2 font-mono text-[var(--color-accent)] text-[var(--text-tiny)]">
					K, V shape: [B, K, S, H]
				</div>
			</ContentBox>

			<ContentBox variant="dark" class="border border-purple-500/20">
				<h4 class="mb-2 font-semibold text-[var(--text-small)] text-purple-400">
					Head Dimension (H)
				</h4>
				<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">
					Each head operates on H dimensions. Total model dimension D = N × H (e.g., 768 = 12 × 64).
				</p>
				<div class="mt-2 font-mono text-[var(--color-accent)] text-[var(--text-tiny)]">
					D = N × H
				</div>
			</ContentBox>
		</div>

		<!-- Why This Matters for Inference -->
		<KeyTakeaway title="Why This Matters for Inference" class="mt-4">
			<p class="text-[var(--text-small)]">
				The KV cache stores <span class="font-mono text-[var(--color-accent)]">[B, K, S, H]</span>
				per layer. Reducing K (fewer KV heads) or H (smaller head dim) directly reduces memory. Since
				inference is <span class="font-semibold text-red-400">memory-limited</span>, smaller KV
				cache = faster generation.
			</p>
		</KeyTakeaway>
	</Section>

	<!-- Relationship Between N and K -->
	<Section title="Relationship Between Query Heads (N) and KV Heads (K)">
		<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
			The ratio between N and K determines the attention variant and KV cache size:
		</p>

		<div class="grid gap-4 md:grid-cols-3">
			<ContentBox variant="dark" class="border border-[var(--color-muted)]/20">
				<h4 class="mb-2 font-semibold text-[var(--color-text)]">N = K (MHA)</h4>
				<p class="mb-2 text-[var(--color-muted)] text-[var(--text-tiny)]">
					Multi-Head Attention: Each query head has its own K/V projection.
				</p>
				<div class="rounded bg-[var(--color-secondary)] p-2 font-mono text-[var(--text-tiny)]">
					<div class="text-[var(--color-accent)]">KV Cache: 100%</div>
					<div class="text-[var(--color-muted)]">Full memory usage</div>
				</div>
			</ContentBox>

			<ContentBox variant="dark" class="border border-emerald-500/20">
				<h4 class="mb-2 font-semibold text-emerald-400">1 &lt; K &lt; N (GQA)</h4>
				<p class="mb-2 text-[var(--color-muted)] text-[var(--text-tiny)]">
					Grouped-Query Attention: Groups of query heads share K/V projections.
				</p>
				<div class="rounded bg-[var(--color-secondary)] p-2 font-mono text-[var(--text-tiny)]">
					<div class="text-emerald-400">KV Cache: K/N</div>
					<div class="text-[var(--color-muted)]">e.g., 8/32 = 25%</div>
				</div>
			</ContentBox>

			<ContentBox variant="dark" class="border border-cyan-500/20">
				<h4 class="mb-2 font-semibold text-cyan-400">K = 1 (MQA)</h4>
				<p class="mb-2 text-[var(--color-muted)] text-[var(--text-tiny)]">
					Multi-Query Attention: All query heads share a single K/V projection.
				</p>
				<div class="rounded bg-[var(--color-secondary)] p-2 font-mono text-[var(--text-tiny)]">
					<div class="text-cyan-400">KV Cache: 1/N</div>
					<div class="text-[var(--color-muted)]">e.g., 1/32 = 3.1%</div>
				</div>
			</ContentBox>
		</div>
	</Section>

	<!-- KV Cache Memory Formula -->
	<Section title="KV Cache Memory Formula">
		<ContentBox variant="dark" class="border border-[var(--color-muted)]/20">
			<h3 class="mb-4 font-bold text-[var(--color-text)]">Memory Per Layer</h3>
			<div class="mb-4 rounded bg-[var(--color-secondary)] p-4 font-mono text-[var(--text-body)]">
				<span class="text-[var(--color-primary)]">KV Cache</span>
				<span class="text-[var(--color-muted)]"> = </span>
				<span class="text-cyan-400">2</span>
				<span class="text-[var(--color-muted)]"> × </span>
				<span class="text-emerald-400">B</span>
				<span class="text-[var(--color-muted)]"> × </span>
				<span class="text-emerald-400">K</span>
				<span class="text-[var(--color-muted)]"> × </span>
				<span class="text-emerald-400">S</span>
				<span class="text-[var(--color-muted)]"> × </span>
				<span class="text-emerald-400">H</span>
				<span class="text-[var(--color-muted)]"> × </span>
				<span class="text-amber-400">bytes_per_element</span>
			</div>
			<div class="grid gap-3 text-[var(--text-tiny)] sm:grid-cols-2">
				<div class="flex items-center gap-2">
					<span class="font-mono text-cyan-400">2</span>
					<span class="text-[var(--color-muted)]">for K and V tensors</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="font-mono text-emerald-400">B</span>
					<span class="text-[var(--color-muted)]">batch size</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="font-mono text-emerald-400">K</span>
					<span class="text-[var(--color-muted)]">number of KV heads</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="font-mono text-emerald-400">S</span>
					<span class="text-[var(--color-muted)]">sequence length (context)</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="font-mono text-emerald-400">H</span>
					<span class="text-[var(--color-muted)]">head dimension</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="font-mono text-amber-400">bytes</span>
					<span class="text-[var(--color-muted)]">2 for fp16/bf16, 1 for int8</span>
				</div>
			</div>
		</ContentBox>

		<ContentBox variant="dark" class="mt-4 border border-[var(--color-muted)]/20">
			<h3 class="mb-4 font-bold text-[var(--color-text)]">Total Memory (All Layers)</h3>
			<div class="rounded bg-[var(--color-secondary)] p-4 font-mono text-[var(--text-body)]">
				<span class="text-[var(--color-primary)]">Total KV</span>
				<span class="text-[var(--color-muted)]"> = </span>
				<span class="text-purple-400">L</span>
				<span class="text-[var(--color-muted)]"> × </span>
				<span class="text-cyan-400">2</span>
				<span class="text-[var(--color-muted)]"> × </span>
				<span class="text-emerald-400">B × K × S × H</span>
				<span class="text-[var(--color-muted)]"> × </span>
				<span class="text-amber-400">bytes</span>
			</div>
			<p class="mt-3 text-[var(--color-muted)] text-[var(--text-tiny)]">
				Where <span class="font-mono text-purple-400">L</span> is the number of transformer layers. For
				a 70B model with L=80 layers, this becomes significant.
			</p>
		</ContentBox>
	</Section>

	<!-- Example Calculations -->
	<Section title="Example: LLaMA 3 70B KV Cache">
		<div class="overflow-x-auto">
			<table class="w-full text-[var(--text-small)]">
				<thead>
					<tr class="border-b border-[var(--color-muted)]/20 text-left text-[var(--color-muted)]">
						<th class="pr-4 pb-3">Parameter</th>
						<th class="pr-4 pb-3">Value</th>
						<th class="pb-3">Notes</th>
					</tr>
				</thead>
				<tbody>
					<tr class="border-b border-[var(--color-muted)]/10">
						<td class="py-2 pr-4 font-mono text-[var(--color-primary)]">L</td>
						<td class="py-2 pr-4 text-[var(--color-text)]">80</td>
						<td class="py-2 text-[var(--color-muted)]">Layers</td>
					</tr>
					<tr class="border-b border-[var(--color-muted)]/10">
						<td class="py-2 pr-4 font-mono text-[var(--color-primary)]">N</td>
						<td class="py-2 pr-4 text-[var(--color-text)]">64</td>
						<td class="py-2 text-[var(--color-muted)]">Query heads</td>
					</tr>
					<tr class="border-b border-[var(--color-muted)]/10">
						<td class="py-2 pr-4 font-mono text-[var(--color-primary)]">K</td>
						<td class="py-2 pr-4 text-[var(--color-text)]">8</td>
						<td class="py-2 text-[var(--color-muted)]">KV heads (GQA with 8:1 ratio)</td>
					</tr>
					<tr class="border-b border-[var(--color-muted)]/10">
						<td class="py-2 pr-4 font-mono text-[var(--color-primary)]">H</td>
						<td class="py-2 pr-4 text-[var(--color-text)]">128</td>
						<td class="py-2 text-[var(--color-muted)]">Head dimension</td>
					</tr>
					<tr class="border-b border-[var(--color-muted)]/10">
						<td class="py-2 pr-4 font-mono text-[var(--color-primary)]">D</td>
						<td class="py-2 pr-4 text-[var(--color-text)]">8192</td>
						<td class="py-2 text-[var(--color-muted)]">Model dimension (N × H = 64 × 128)</td>
					</tr>
				</tbody>
			</table>
		</div>

		<div class="mt-4 grid gap-4 md:grid-cols-2">
			<ContentBox variant="dark" class="border border-amber-500/20">
				<h4 class="mb-2 font-semibold text-amber-400">Per-Token KV (bf16)</h4>
				<div class="font-mono text-[var(--text-small)]">
					<div class="text-[var(--color-muted)]">= L × 2 × K × H × 2 bytes</div>
					<div class="text-[var(--color-muted)]">= 80 × 2 × 8 × 128 × 2</div>
					<div class="text-amber-400">= 327,680 bytes ≈ 320 KB/token</div>
				</div>
			</ContentBox>

			<ContentBox variant="dark" class="border border-red-500/20">
				<h4 class="mb-2 font-semibold text-red-400">8K Context, Batch 1</h4>
				<div class="font-mono text-[var(--text-small)]">
					<div class="text-[var(--color-muted)]">= 320 KB × 8192 tokens</div>
					<div class="text-red-400">= 2.6 GB</div>
					<div class="mt-2 text-[var(--color-muted)] text-[var(--text-tiny)]">
						Without GQA: 2.6 × 8 = 20.8 GB
					</div>
				</div>
			</ContentBox>
		</div>
	</Section>
</div>
