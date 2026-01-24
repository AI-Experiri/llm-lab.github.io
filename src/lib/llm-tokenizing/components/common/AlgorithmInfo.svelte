<!-- ABOUTME: Displays algorithm info card with paper link, title, problem/solution -->
<!-- ABOUTME: Uses HeroSection for consistent styling across all visualizers -->
<script>
	import { HeroSection } from '$lib/shared';
	let { algorithm = 'bpe', expanded = $bindable(false) } = $props();

	const algorithmInfo = {
		wordpiece: {
			name: 'WordPiece',
			year: '2012',
			tagline: 'Score-based selection',
			color: 'from-green-600 to-emerald-600',
			icon: '÷',
			paper:
				'https://static.googleusercontent.com/media/research.google.com/en//pubs/archive/37842.pdf',
			problem: 'Frequent chars like "e" dominate merges',
			solution: 'Normalize by individual frequencies',
			formula: 'score = count(ab) / (count(a) × count(b))',
			diff: 'vs BPE: Uses score instead of raw frequency',
			description: [
				'WordPiece improves on BPE by using a likelihood-based scoring function instead of raw frequency. This prevents common characters from dominating the merge decisions.',
				'The score normalizes pair frequency by dividing by individual token frequencies, favoring pairs that appear together more often than expected by chance. Used in BERT and related models.'
			],
			pseudocode: `vocab = all unique characters
for i in 1..num_merges:
  pairs = count_adjacent_pairs(corpus)
  for each pair (a,b):
    score[a,b] = count(a,b) / (count(a) × count(b))
  best = argmax(pairs, key=score)
  new_token = merge(best.left, best.right)
  vocab.add(new_token)
return vocab`
		},
		bpe: {
			name: 'Standard BPE',
			year: '2016',
			tagline: 'The foundation',
			color: 'from-purple-600 to-blue-600',
			icon: '📄',
			paper: 'https://arxiv.org/abs/1508.07909',
			problem: 'Need efficient subword vocabulary',
			solution: 'Iteratively merge most frequent pairs',
			formula: 'merge = argmax(frequency)',
			diff: 'Published in data compression literature 1994',
			description: [
				'Byte Pair Encoding (BPE) builds a vocabulary by starting with individual characters and iteratively merging the most frequent adjacent pairs. This creates a balance between character-level and word-level tokenization.',
				'The algorithm learns common subwords like prefixes, suffixes, and roots naturally from the data. It handles rare words by breaking them into known subword units, eliminating out-of-vocabulary issues.'
			],
			pseudocode: `vocab = all unique characters
for i in 1..num_merges:
  pairs = count_adjacent_pairs(corpus)
  best = argmax(pairs, key=frequency)
  new_token = merge(best.left, best.right)
  vocab.add(new_token)
  corpus = replace_all(corpus, best, new_token)
return vocab`
		},
		scaffold: {
			name: 'Scaffold-BPE',
			year: '2024',
			tagline: 'Remove wasteful tokens',
			color: 'from-orange-600 to-amber-600',
			icon: '🏗',
			paper: 'https://arxiv.org/abs/2404.17808',
			problem: 'Intermediate tokens waste vocabulary space',
			solution: 'Detect & demolish "scaffold" tokens',
			formula: 'scaffold if: remainingFreq < nextPairFreq',
			diff: 'vs BPE: Demolishes rarely-used intermediate tokens',
			description: [
				'Scaffold-BPE identifies "scaffold" tokens - intermediate tokens created during BPE that are rarely used in the final tokenization. These waste vocabulary space.',
				'After each merge, it checks if the remaining frequency of constituent tokens is less than the next merge frequency. If so, the token is marked as scaffold and can be "demolished" (paper terminology) - broken back into non-scaffold components.',
				'With Demolish OFF, tokenization is identical to standard BPE (scaffolds are just highlighted). With Demolish ON, scaffold tokens are removed from vocabulary.'
			],
			pseudocode: `vocab = run_standard_bpe(corpus, num_merges)
for each token t in vocab:
  remaining_freq = count(t) - times_used_in_merges(t)
  if remaining_freq < next_merge_freq:
    mark_as_scaffold(t)
for each scaffold token:
  demolish(t)  // remove from vocab
return cleaned_vocab`
		},
		adaptive: {
			name: 'AdaptBPE',
			year: '2024',
			tagline: 'Domain vocabulary',
			color: 'from-cyan-600 to-teal-600',
			icon: '🎯',
			paper: 'https://arxiv.org/abs/2410.03258',
			problem: 'Domain terms get fragmented',
			solution: 'Longest substring matching first',
			formula: 'match(domainVocab) → then BPE on rest',
			diff: 'vs BPE: Preserves domain terms before splitting',
			description: [
				'AdaptBPE addresses the problem of domain-specific terms being fragmented by standard BPE. Medical terms, code identifiers, or technical jargon often get split unnecessarily.',
				'It first matches the longest substrings from a domain vocabulary, preserving important terms intact. Then standard BPE is applied to the remaining text, combining the benefits of both approaches.'
			],
			pseudocode: `domain_vocab = load_domain_terms()
for each word in text:
  matches = longest_substring_match(word, domain_vocab)
  preserved = extract_matches(word, matches)
  remainder = word - preserved
  tokens = preserved + bpe_tokenize(remainder)
return all_tokens`
		},
		boundless: {
			name: 'BoundlessBPE',
			year: '2025',
			tagline: 'Cross-boundary merges',
			color: 'from-fuchsia-600 to-pink-600',
			icon: '⊕',
			paper: 'https://arxiv.org/abs/2504.00178',
			problem: 'Pre-tokenization blocks useful merges',
			solution: 'Supermerges combine adjacent pretokens',
			formula: 'if both single tokens → can supermerge',
			diff: 'vs BPE: Tokens can span word boundaries',
			description: [
				'BoundlessBPE removes the limitation that tokens cannot span pre-token boundaries. Standard BPE pre-tokenizes on whitespace/punctuation, preventing useful cross-word merges.',
				'When two adjacent pre-tokens each consist of a single token, they can be "supermerged" into one token. This allows learning patterns like common word pairs or phrases as single tokens.',
				'Key difference: Standard BPE only needs pretoken counts, but Boundless needs the pretoken sequence to count how often pretokens appear adjacent to each other.'
			],
			pseudocode: `pretokens = pretokenize(text)
vocab = run_bpe_within_pretokens(pretokens)
for each adjacent pair (pt1, pt2):
  if len(tokens(pt1)) == 1 and len(tokens(pt2)) == 1:
    candidate = pt1 + pt2
    if freq(candidate) > threshold:
      supermerge(pt1, pt2)
      vocab.add(candidate)
return vocab`
		},
		morph: {
			name: 'MorphBPE',
			year: '2025',
			tagline: 'Morpheme-aware',
			color: 'from-teal-600 to-rose-600',
			icon: '🌿',
			paper: 'https://arxiv.org/abs/2502.00894',
			problem: 'BPE creates linguistically arbitrary tokens',
			solution: 'Use external morphological analysis to constrain merges',
			formula: 'merge crosses morpheme boundary → block it',
			diff: 'vs BPE: Requires external morphological data',
			description: [
				'MorphBPE uses external morphological segmentation data (e.g., SIGMORPHON datasets, Lemlat analyzer) to guide tokenization. It does NOT identify morphemes itself—it relies on linguistic resources.',
				'Two modes exist: Pre-tokenize splits words at morpheme boundaries before BPE runs; Seeding adds known morphemes (suffixes, prefixes) to the initial vocabulary.',
				'Demo note: This visualization uses simplified pattern matching, not a real morphological analyzer. Real MorphBPE requires curated linguistic data for each language.'
			],
			pseudocode: `# Requires external morphological data!
morpheme_data = load_external_segmentation()

if mode == "pretokenize":
  corpus = presegment_at_morpheme_boundaries(corpus)
else:  # seeding mode
  vocab = morphemes + characters

for i in 1..num_merges:
  pairs = count_adjacent_pairs(corpus)
  pairs = filter(p => !crosses_boundary(p))
  best = argmax(pairs, key=frequency)
  vocab.add(merge(best))
return vocab`
		},
		agbpe: {
			name: 'AG-BPE',
			year: '2025',
			tagline: 'Attention-guided',
			color: 'from-indigo-600 to-cyan-600',
			icon: '🧠',
			paper:
				'https://huggingface.co/blog/RDTvlokip/ag-bpe-exploring-a-new-direction-in-tokenization',
			problem: 'Frequency ≠ semantic importance',
			solution: 'Hybrid frequency + attention score',
			formula: 'score = α×freq + (1-α)×attention',
			diff: 'vs BPE: Considers semantic relationships',
			description: [
				'AG-BPE (Attention-Guided BPE) recognizes that frequency alone does not capture semantic importance. Real AG-BPE uses a ContextAnalyzer (3-layer Transformer, 8 heads, 512 dim) operating at character-level to compute attention between adjacent characters, then aggregates scores across the corpus.',
				'The mixing parameter α controls the balance: α ≥ 0.9 ≈ Standard BPE (frequency dominates); α ≤ 0.1 ≈ Pure attention (semantic focus); α ≥ 0.6 = Frequency-biased with attention influence; α ≤ 0.4 = Attention-biased with frequency influence; otherwise balanced.',
				'Demo note: We simulate attention with co-occurrence ratio: pairFreq / min(count₁, count₂). High ratio = tokens almost always appear together = strong bond.'
			],
			pseudocode: `model = load_pretrained_model()
α = 0.5  // mixing parameter
for i in 1..num_merges:
  pairs = count_adjacent_pairs(corpus)
  attention = get_attention_scores(model, pairs)
  for each pair p:
    score[p] = α × freq[p] + (1-α) × attention[p]
  best = argmax(pairs, key=score)
  vocab.add(merge(best))
return vocab`
		}
	};

	let info = $derived(algorithmInfo[algorithm] || algorithmInfo.bpe);
</script>

<HeroSection customGradient={info.color} class="p-3 text-white">
	<!-- Responsive flex layout -->
	<div class="flex flex-wrap items-stretch justify-center gap-2">
		<!-- Card 1: Paper/Year -->
		<a
			href={info.paper}
			target="_blank"
			rel="noopener noreferrer external"
			class="group flex w-16 shrink-0 flex-col items-center justify-center rounded-lg bg-black/20 px-3 py-2 text-center transition-colors hover:bg-black/30"
		>
			<span class="text-2xl transition-transform group-hover:scale-110">📖</span>
			<span class="text-[var(--text-tiny)] opacity-75">{info.year}</span>
		</a>

		<!-- Card 2: Title -->
		<div
			class="flex w-56 shrink-0 flex-col items-center justify-center rounded-lg bg-black/20 px-3 py-2 text-center"
		>
			<h3 class="leading-tight font-bold text-[var(--text-small)]">{info.name}</h3>
			<span class="text-[var(--text-tiny)] opacity-75">{info.tagline}</span>
		</div>

		<!-- Card 3: Toggle Details Button -->
		<button
			onclick={() => (expanded = !expanded)}
			class="flex w-16 shrink-0 cursor-pointer flex-col items-center justify-center rounded-lg bg-black/20 px-3 py-2 text-center transition-colors hover:bg-black/30"
		>
			<span class="text-2xl">{expanded ? '✕' : 'ℹ️'}</span>
			<span class="text-[var(--text-tiny)] opacity-75">{expanded ? 'Close' : 'Details'}</span>
		</button>

		<!-- Card 4: Problem + Solution stacked -->
		<div
			class="flex min-w-[180px] flex-1 flex-col justify-center gap-1 rounded-lg bg-black/20 px-3 py-2 text-[var(--text-small)]"
		>
			<div>
				<span class="tracking-wide text-[var(--text-tiny)] uppercase opacity-60">Problem</span>
				<p class="text-[var(--text-tiny)]">{info.problem}</p>
			</div>
			<div>
				<span class="tracking-wide text-[var(--text-tiny)] uppercase opacity-60">Solution</span>
				<p class="text-[var(--text-tiny)]">{info.solution}</p>
			</div>
		</div>

		<!-- Card 5: Improvement + Formula stacked -->
		<div
			class="flex min-w-[180px] flex-1 flex-col justify-center gap-1 rounded-lg bg-black/20 px-3 py-2 text-[var(--text-small)]"
		>
			<div>
				<span class="tracking-wide text-[var(--text-tiny)] uppercase opacity-60">Improvement</span>
				<p class="text-[var(--text-tiny)]">{info.diff}</p>
			</div>
			<div>
				<span class="tracking-wide text-[var(--text-tiny)] uppercase opacity-60">Formula</span>
				<code class="block font-mono text-[var(--text-tiny)]">{info.formula}</code>
			</div>
		</div>
	</div>
</HeroSection>
