<!-- ABOUTME: Foundations page for LLM Evaluation with historical timeline -->
<!-- ABOUTME: Provides overview and evolution of evaluation methods -->

<script>
	import { Timeline, HeroSection, KeyTakeaway } from '$lib/shared';

	const timeline = [
		{
			year: '2018',
			title: 'GLUE Benchmark',
			description:
				'General Language Understanding Evaluation. Multi-task benchmark for NLU including sentiment, entailment, and similarity tasks.',
			badge: 'Wang et al.',
			link: 'https://arxiv.org/abs/1804.07461'
		},
		{
			year: '2019',
			title: 'SuperGLUE',
			description:
				'Harder successor to GLUE after models saturated original benchmark. More challenging tasks requiring reasoning.',
			badge: 'Wang et al.',
			link: 'https://arxiv.org/abs/1905.00537'
		},
		{
			year: '2020',
			title: 'MMLU',
			description:
				'Massive Multitask Language Understanding. 57 subjects from STEM to humanities. Became the de facto knowledge benchmark.',
			badge: 'Hendrycks et al.',
			link: 'https://arxiv.org/abs/2009.03300'
		},
		{
			year: '2021',
			title: 'HumanEval',
			description:
				'Code generation benchmark with 164 hand-written Python problems. Introduced pass@k metric for sampling-based evaluation.',
			badge: 'Chen et al.',
			link: 'https://arxiv.org/abs/2107.03374'
		},
		{
			year: '2021',
			title: 'TruthfulQA',
			description:
				'Tests whether models generate truthful answers. Measures tendency to reproduce common misconceptions.',
			badge: 'Lin et al.',
			link: 'https://arxiv.org/abs/2109.07958'
		},
		{
			year: '2022',
			title: 'BIG-bench',
			description:
				'Beyond the Imitation Game. 204 tasks contributed by 450+ authors. Designed to probe diverse capabilities.',
			badge: 'Srivastava et al.',
			link: 'https://arxiv.org/abs/2206.04615'
		},
		{
			year: '2023',
			title: 'GPQA',
			description:
				'Graduate-level Google-Proof Q&A. PhD-level questions where experts score ~65%. Tests deep domain knowledge.',
			badge: 'Rein et al.',
			link: 'https://arxiv.org/abs/2311.12022'
		},
		{
			year: '2023',
			title: 'SWE-bench',
			description:
				'Real GitHub issues requiring code changes. Tests agentic coding ability on actual software engineering tasks.',
			badge: 'Jimenez et al.',
			link: 'https://arxiv.org/abs/2310.06770'
		},
		{
			year: '2024',
			title: 'Chatbot Arena',
			description:
				'Human preference-based evaluation. Users vote between anonymous model outputs. ELO rating system.',
			badge: 'LMSYS',
			link: 'https://arxiv.org/abs/2403.04132'
		}
	];
</script>

<div class="space-y-4">
	<HeroSection title="Evolution of LLM Evaluation">
		<p class="mt-2 leading-relaxed text-[var(--color-text)] text-[var(--text-small)]">
			How evaluation benchmarks have evolved as models improved - from early NLU tasks to PhD-level
			reasoning and agentic coding.
		</p>
	</HeroSection>

	<Timeline events={timeline} />

	<KeyTakeaway
		items={[
			'Evaluation is a moving target. As models improve, benchmarks saturate and new ones emerge.',
			'GLUE → SuperGLUE → MMLU → GPQA shows this progression of increasing difficulty.',
			'Always consider what exactly is being measured, and whether it matters for your use case.',
			'Human evaluation (like Chatbot Arena) captures nuances that automated benchmarks miss.'
		]}
	/>
</div>
