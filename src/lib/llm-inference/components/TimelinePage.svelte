<!-- ABOUTME: Historical timeline of LLM inference optimization evolution -->
<!-- ABOUTME: Shows progression from Transformers to modern techniques -->

<script>
	import { HeroSection, Timeline } from '$lib/shared';

	// Historical timeline of inference improvements - mapped to Timeline component format
	const timelineEvents = [
		{
			year: '2017',
			title: 'Attention Is All You Need',
			description: 'Transformer architecture with Multi-Head Attention',
			badge: 'Foundation',
			link: 'https://arxiv.org/abs/1706.03762'
		},
		{
			year: '2019',
			title: 'Grouped-Query Attention',
			description: 'Share KV heads across query heads to reduce KV cache',
			badge: 'N/K reduction',
			link: 'https://arxiv.org/abs/1911.02150'
		},
		{
			year: '2020',
			title: 'GPT-3 / Scaling Laws',
			description: 'Established compute-optimal training, inference at scale',
			badge: '175B params',
			link: 'https://arxiv.org/abs/2005.14165'
		},
		{
			year: '2022',
			title: 'FlashAttention',
			description: 'IO-aware exact attention, tiling for memory efficiency',
			badge: '2-4x speedup',
			link: 'https://arxiv.org/abs/2205.14135'
		},
		{
			year: '2023',
			title: 'LLM.int8()',
			description: 'Mixed-precision quantization with outlier handling',
			badge: 'fp16→int8',
			link: 'https://arxiv.org/abs/2208.07339'
		},
		{
			year: '2023',
			title: 'Speculative Decoding',
			description: 'Use draft model to predict, verify in parallel',
			badge: '2-3x speedup',
			link: 'https://arxiv.org/abs/2302.01318'
		},
		{
			year: '2023',
			title: 'vLLM / PagedAttention',
			description: 'OS-style paging for KV cache, continuous batching',
			badge: '24x throughput',
			link: 'https://arxiv.org/abs/2309.06180'
		},
		{
			year: '2024',
			title: 'Mamba / State Space',
			description: 'Linear-time sequence modeling as Transformer alternative',
			badge: 'O(n) complexity',
			link: 'https://arxiv.org/abs/2312.00752'
		},
		{
			year: '2024',
			title: 'Multi-Head Latent Attention',
			description: 'Project KV to lower dimension (DeepSeek v2)',
			badge: '32x reduction',
			link: 'https://arxiv.org/abs/2405.04434'
		},
		{
			year: '2024',
			title: 'EAGLE / Medusa',
			description: 'Multi-token speculative decoding with learned draft',
			badge: '3x speedup',
			link: 'https://arxiv.org/abs/2401.15077'
		},
		{
			year: '2025',
			title: 'Diffusion LLMs',
			description: 'Parallel token generation via diffusion process',
			badge: '10x faster coding',
			link: 'https://arxiv.org/abs/2502.09992'
		}
	];
</script>

<div class="space-y-4">
	<HeroSection title="Inference Optimization Timeline">
		<p class="mt-2 leading-relaxed text-[var(--color-muted)] text-[var(--text-small)]">
			The evolution of LLM inference optimization from the original Transformer to modern
			techniques. Each advancement addresses memory, compute, or latency bottlenecks.
		</p>
	</HeroSection>

	<Timeline events={timelineEvents} />
</div>
