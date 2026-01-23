// HuggingFace datasets configuration
// Metadata (description, paper, code, year, license) comes from benchmarks.json

import benchmarksData from './benchmarks.json';

// Create lookup map for benchmark metadata
const benchmarkLookup = new Map();
benchmarksData.forEach((b) => {
	const name = b.Name.toLowerCase();
	benchmarkLookup.set(name, b);
	benchmarkLookup.set(name.replace(/[^a-z0-9]/g, ''), b);
	// Also index by acronym (first word before parentheses)
	const acronym = name.split(/[\s(]/)[0];
	if (acronym && acronym !== name) {
		benchmarkLookup.set(acronym, b);
	}
});

export function getBenchmarkMeta(datasetName) {
	const name = datasetName.toLowerCase();
	return benchmarkLookup.get(name) || benchmarkLookup.get(name.replace(/[^a-z0-9]/g, '')) || null;
}

export const allBenchmarks = benchmarksData;

export const categories = [
	{ id: 'all', label: 'All Datasets' },
	{ id: 'knowledge', label: 'Knowledge' },
	{ id: 'language & reasoning', label: 'Language & Reasoning' },
	{ id: 'argumentation', label: 'Argumentation & Debate' },
	{ id: 'coding', label: 'Coding' },
	{ id: 'math', label: 'Math' },
	{ id: 'safety', label: 'Safety' },
	{ id: 'agents & tools use', label: 'Agents & Tools' },
	{ id: 'information retrieval & RAG', label: 'Information Retrieval & RAG' },
	{ id: 'conversation & chatbots', label: 'Conversation & Chatbots' },
	{ id: 'instruction-following', label: 'Instruction Following' },
	{ id: 'multimodal', label: 'Multimodal' },
	{ id: 'domain-specific', label: 'Domain Specific' },
	{ id: 'bias & ethics', label: 'Bias & Ethics' },
	{ id: 'inaccessible', label: 'Inaccessible (No Public API)' }
];

// HuggingFace download configuration only
// Metadata is fetched from benchmarks.json via getBenchmarkMeta()
const hfConfig = {
	// KNOWLEDGE
	mmlu: {
		hf_id: 'cais/mmlu',
		hf_config: 'all',
		hf_split: 'test',
		format: 'mmlu',
		fields: { question: 'question', choices: 'choices', answer: 'answer' }
	},
	mmlu_pro: {
		hf_id: 'TIGER-Lab/MMLU-Pro',
		hf_config: 'default',
		hf_split: 'test',
		format: 'mmlu_pro',
		fields: { question: 'question', choices: 'options', answer: 'answer' }
	},
	openbookqa: {
		hf_id: 'allenai/openbookqa',
		hf_config: 'main',
		hf_split: 'test',
		format: 'openbookqa',
		fields: { question: 'question_stem', choices: 'choices', answer: 'answerKey' }
	},
	triviaqa: {
		hf_id: 'mandarjoshi/trivia_qa',
		hf_config: 'rc',
		hf_split: 'validation',
		format: 'triviaqa',
		fields: { question: 'question', answer: 'answer' }
	},
	natural_questions: {
		hf_id: 'google-research-datasets/natural_questions',
		hf_config: 'default',
		hf_split: 'validation',
		format: 'natural_questions',
		fields: { question: 'question', answer: 'annotations' }
	},

	// LANGUAGE & REASONING
	arc_challenge: {
		hf_id: 'allenai/ai2_arc',
		hf_config: 'ARC-Challenge',
		hf_split: 'test',
		format: 'arc',
		fields: { question: 'question', choices: 'choices', answer: 'answerKey' }
	},
	arc_easy: {
		hf_id: 'allenai/ai2_arc',
		hf_config: 'ARC-Easy',
		hf_split: 'test',
		format: 'arc',
		fields: { question: 'question', choices: 'choices', answer: 'answerKey' }
	},
	hellaswag: {
		hf_id: 'Rowan/hellaswag',
		hf_config: 'default',
		hf_split: 'validation',
		format: 'hellaswag',
		fields: { context: 'ctx', choices: 'endings', answer: 'label' }
	},
	winogrande: {
		hf_id: 'allenai/winogrande',
		hf_config: 'winogrande_xl',
		hf_split: 'validation',
		format: 'winogrande',
		fields: { sentence: 'sentence', option1: 'option1', option2: 'option2', answer: 'answer' }
	},
	piqa: {
		hf_id: 'baber/piqa',
		hf_config: 'default',
		hf_split: 'validation',
		format: 'piqa',
		fields: { question: 'goal', choices: ['sol1', 'sol2'], answer: 'label' }
	},
	boolq: {
		hf_id: 'google/boolq',
		hf_config: 'default',
		hf_split: 'validation',
		format: 'boolq',
		fields: { question: 'question', passage: 'passage', answer: 'answer' }
	},
	commonsense_qa: {
		hf_id: 'tau/commonsense_qa',
		hf_config: 'default',
		hf_split: 'validation',
		format: 'commonsense_qa',
		fields: { question: 'question', choices: 'choices', answer: 'answerKey' }
	},
	social_iqa: {
		hf_id: 'lighteval/siqa',
		hf_config: 'default',
		hf_split: 'validation',
		format: 'social_iqa',
		fields: {
			context: 'context',
			question: 'question',
			choices: ['answerA', 'answerB', 'answerC'],
			answer: 'label'
		}
	},
	bigbench_hard: {
		hf_id: 'maveriq/bigbenchhard',
		hf_config: 'boolean_expressions',
		hf_split: 'train',
		format: 'bigbench_hard',
		fields: { input: 'input', target: 'target' }
	},
	drop: {
		hf_id: 'ucinlp/drop',
		hf_config: 'default',
		hf_split: 'validation',
		format: 'drop',
		fields: { passage: 'passage', question: 'question', answer: 'answers_spans' }
	},
	anli: {
		hf_id: 'facebook/anli',
		hf_config: 'plain_text',
		hf_split: 'test_r3',
		format: 'anli',
		fields: { premise: 'premise', hypothesis: 'hypothesis', label: 'label' }
	},
	lambada: {
		hf_id: 'cimec/lambada',
		hf_config: 'plain_text',
		hf_split: 'test',
		format: 'lambada',
		fields: { text: 'text' }
	},

	// ARGUMENTATION & DEBATE
	debatesum: {
		hf_id: 'Hellisotherpeople/DebateSum',
		hf_config: 'default',
		hf_split: 'train',
		format: 'debatesum',
		fields: {
			document: 'Full-Document',
			citation: 'Citation',
			extract: 'Extract',
			abstract: 'Abstract',
			tag: 'Tag'
		}
	},
	argument_quality: {
		hf_id: 'ibm-research/argument_quality_ranking_30k',
		hf_config: 'argument_quality_ranking',
		hf_split: 'test',
		format: 'argument_quality',
		fields: {
			argument: 'argument',
			topic: 'topic',
			quality: 'WA',
			stance: 'stance_WA'
		}
	},
	claim_stance: {
		hf_id: 'ibm-research/claim_stance',
		hf_config: 'claim_stance',
		hf_split: 'test',
		format: 'claim_stance',
		fields: {
			topic: 'topicText',
			claim: 'claims.claimCorrectedText',
			stance: 'claims.stance'
		}
	},
	logical_fallacy: {
		hf_id: 'tasksource/logical-fallacy',
		hf_config: 'default',
		hf_split: 'test',
		format: 'logical_fallacy',
		fields: {
			text: 'source_article',
			fallacy: 'logical_fallacies',
			domain: 'config'
		}
	},
	open_debate_evidence: {
		hf_id: 'Yusuf5/OpenCaselist',
		hf_config: 'default',
		hf_split: 'train',
		format: 'open_debate_evidence',
		fields: {
			tag: 'tag',
			cite: 'cite',
			summary: 'summary',
			fulltext: 'fulltext',
			pocket: 'pocket',
			hat: 'hat',
			tournament: 'tournament',
			year: 'year'
		}
	},
	persuasion: {
		hf_id: 'Anthropic/persuasion',
		hf_config: 'default',
		hf_split: 'train',
		format: 'persuasion',
		fields: {
			claim: 'claim',
			argument: 'argument',
			source: 'source',
			rating_initial: 'rating_initial',
			rating_final: 'rating_final',
			persuasiveness: 'persuasiveness_metric'
		}
	},
	args_me: {
		hf_id: 'webis/args_me',
		inaccessible: true,
		reason: 'Requires Python code to load'
	},
	eu_debates: {
		hf_id: 'coastalcph/eu_debates',
		inaccessible: true,
		reason: 'Requires Python code to load'
	},

	// MATH
	gsm8k: {
		hf_id: 'openai/gsm8k',
		hf_config: 'main',
		hf_split: 'test',
		format: 'gsm8k',
		fields: { question: 'question', answer: 'answer' }
	},
	math: {
		hf_id: 'EleutherAI/hendrycks_math',
		hf_config: 'algebra',
		hf_split: 'test',
		format: 'hendrycks_math',
		fields: { question: 'problem', answer: 'solution' }
	},
	aime: {
		hf_id: 'Maxwell-Jia/AIME_2024',
		hf_config: 'default',
		hf_split: 'train',
		format: 'aime',
		fields: { question: 'Problem', answer: 'Solution' }
	},
	theoremqa: {
		hf_id: 'TIGER-Lab/TheoremQA',
		hf_config: 'default',
		hf_split: 'test',
		format: 'theoremqa',
		fields: { question: 'Question', answer: 'Answer' }
	},
	mgsm: {
		hf_id: 'juletxara/mgsm',
		hf_config: 'en',
		hf_split: 'test',
		format: 'mgsm',
		fields: { question: 'question', answer: 'answer_number' }
	},
	svamp: {
		hf_id: 'ChilleD/SVAMP',
		hf_config: 'default',
		hf_split: 'test',
		format: 'svamp',
		fields: { body: 'Body', question: 'Question', equation: 'Equation', answer: 'Answer' }
	},

	// CODING
	humaneval: {
		hf_id: 'openai/openai_humaneval',
		hf_config: 'openai_humaneval',
		hf_split: 'test',
		format: 'humaneval',
		fields: { prompt: 'prompt', solution: 'canonical_solution', tests: 'test' }
	},
	mbpp: {
		hf_id: 'google-research-datasets/mbpp',
		hf_config: 'full',
		hf_split: 'test',
		format: 'mbpp',
		fields: { prompt: 'text', solution: 'code', tests: 'test_list' }
	},
	apps: {
		hf_id: 'codeparrot/apps',
		hf_config: 'all',
		hf_split: 'test',
		format: 'apps',
		fields: { question: 'question', solutions: 'solutions', difficulty: 'difficulty' }
	},
	ds1000: {
		hf_id: 'xlangai/DS-1000',
		hf_config: 'default',
		hf_split: 'test',
		format: 'ds1000',
		fields: { prompt: 'prompt', reference_code: 'reference_code' }
	},
	classeval: {
		hf_id: 'FudanSELab/ClassEval',
		hf_config: 'default',
		hf_split: 'test',
		format: 'classeval',
		fields: { skeleton: 'skeleton', test: 'test' }
	},
	bigcodebench: {
		hf_id: 'bigcode/bigcodebench',
		hf_config: 'default',
		hf_split: 'v0.1.2',
		format: 'bigcodebench',
		fields: { instruct_prompt: 'instruct_prompt', canonical_solution: 'canonical_solution' }
	},

	// SAFETY
	truthfulqa: {
		hf_id: 'truthfulqa/truthful_qa',
		hf_config: 'multiple_choice',
		hf_split: 'validation',
		format: 'truthfulqa',
		fields: { question: 'question', choices: 'mc1_targets' }
	},
	toxigen: {
		hf_id: 'toxigen/toxigen-data',
		hf_config: 'annotated',
		hf_split: 'train',
		format: 'toxigen',
		fields: { text: 'text', label: 'toxicity_human' }
	},
	simpleqa: {
		hf_id: 'basicv8vc/SimpleQA',
		hf_config: 'default',
		hf_split: 'test',
		format: 'simpleqa',
		fields: { question: 'problem', answer: 'answer' }
	},
	halueval: {
		hf_id: 'pminervini/HaluEval',
		hf_config: 'qa_samples',
		hf_split: 'data',
		format: 'halueval',
		fields: { question: 'question', answer: 'answer', hallucination: 'hallucination' }
	},
	realtoxicityprompts: {
		hf_id: 'allenai/real-toxicity-prompts',
		hf_config: 'default',
		hf_split: 'train',
		format: 'realtoxicity',
		fields: { prompt: 'prompt', continuation: 'continuation' }
	},
	xstest: {
		hf_id: 'Bertievidgen/xstest',
		hf_config: 'default',
		hf_split: 'train',
		format: 'xstest',
		inaccessible: true,
		reason: 'Gated dataset - requires authentication'
	},
	donotanswer: {
		hf_id: 'LibrAI/do-not-answer',
		hf_config: 'default',
		hf_split: 'train',
		format: 'donotanswer',
		fields: { question: 'question', risk_area: 'risk_area' }
	},

	// AGENTS & TOOLS
	gaia: {
		hf_id: 'gaia-benchmark/GAIA',
		hf_config: '2023_all',
		hf_split: 'validation',
		format: 'gaia',
		inaccessible: true,
		reason: 'Gated dataset - requires authentication'
	},
	toolqa: {
		hf_id: 'night-chen/ToolQA',
		hf_config: 'default',
		hf_split: 'easy',
		format: 'toolqa',
		inaccessible: true,
		reason: 'Gated dataset - requires authentication'
	},
	t_eval: {
		hf_id: 'lovesnowbest/T-Eval',
		hf_config: 'default',
		hf_split: 'instruct',
		format: 't_eval',
		inaccessible: true,
		reason: 'Dataset generation failed on server'
	},

	// RAG
	frames: {
		hf_id: 'google/frames-benchmark',
		hf_config: 'default',
		hf_split: 'test',
		format: 'frames',
		fields: { Prompt: 'Prompt', Answer: 'Answer', reasoning_types: 'reasoning_types' }
	},
	ragtruth: {
		hf_id: 'wandb/RAGTruth-processed',
		hf_config: 'default',
		hf_split: 'test',
		format: 'ragtruth',
		fields: { question: 'question', response: 'response' }
	},

	// CONVERSATION
	mt_bench: {
		hf_id: 'HuggingFaceH4/mt_bench_prompts',
		hf_config: 'default',
		hf_split: 'train',
		format: 'mt_bench',
		fields: { turns: 'prompt' }
	},
	wildchat: {
		hf_id: 'allenai/WildChat-1M',
		hf_config: 'default',
		hf_split: 'train',
		format: 'wildchat',
		fields: { conversation: 'conversation' }
	},
	lmsys_chat: {
		hf_id: 'lmsys/lmsys-chat-1m',
		hf_config: 'default',
		hf_split: 'train',
		format: 'lmsys_chat',
		inaccessible: true,
		reason: 'Gated dataset - requires authentication'
	},
	arena_hard: {
		hf_id: 'lmarena-ai/arena-hard-auto-v0.1',
		hf_config: 'default',
		hf_split: 'train',
		format: 'arena_hard',
		fields: { turns: 'turns', cluster: 'cluster' }
	},

	// INSTRUCTION FOLLOWING
	ifeval: {
		hf_id: 'wis-k/instruction-following-eval',
		hf_config: 'default',
		hf_split: 'train',
		format: 'ifeval',
		fields: { prompt: 'prompt', instructions: 'instruction_id_list' }
	},
	alpaca_eval: {
		hf_id: 'tatsu-lab/alpaca_eval',
		hf_config: 'alpaca_eval',
		hf_split: 'eval',
		format: 'alpaca_eval',
		inaccessible: true,
		reason: 'Requires Python code to load'
	},
	infobench: {
		hf_id: 'kqsong/InFoBench',
		hf_config: 'default',
		hf_split: 'train',
		format: 'infobench',
		fields: { input: 'input', decomposed_questions: 'decomposed_questions' }
	},

	// MULTIMODAL
	mmmu: {
		hf_id: 'MMMU/MMMU',
		hf_config: 'Art',
		hf_split: 'validation',
		format: 'mmmu',
		fields: { question: 'question', options: 'options', answer: 'answer' }
	},
	scienceqa: {
		hf_id: 'derek-thomas/ScienceQA',
		hf_config: 'default',
		hf_split: 'test',
		format: 'scienceqa',
		fields: { question: 'question', choices: 'choices', answer: 'answer' }
	},
	mme: {
		hf_id: 'lmms-lab/MME',
		hf_config: 'default',
		hf_split: 'test',
		format: 'mme',
		fields: { question: 'question', answer: 'answer' }
	},
	seed_bench: {
		hf_id: 'AILab-CVC/SEED-Bench-2',
		hf_config: 'default',
		hf_split: 'test',
		format: 'seed_bench',
		inaccessible: true,
		reason: 'Requires Python code to load'
	},

	// DOMAIN-SPECIFIC
	legalbench: {
		hf_id: 'nguha/legalbench',
		hf_config: 'abercrombie',
		hf_split: 'test',
		format: 'legalbench',
		inaccessible: true,
		reason: 'Requires Python code to load'
	},
	medqa: {
		hf_id: 'bigbio/med_qa',
		hf_config: 'med_qa_en_source',
		hf_split: 'test',
		format: 'medqa',
		inaccessible: true,
		reason: 'Requires Python code to load'
	},
	medmcqa: {
		hf_id: 'openlifescienceai/medmcqa',
		hf_config: 'default',
		hf_split: 'validation',
		format: 'medmcqa',
		fields: { question: 'question', opa: 'opa', opb: 'opb', opc: 'opc', opd: 'opd', cop: 'cop' }
	},
	finqa: {
		hf_id: 'ibm-research/finqa',
		hf_config: 'default',
		hf_split: 'test',
		format: 'finqa',
		inaccessible: true,
		reason: 'Requires Python code to load'
	},
	cuad: {
		hf_id: 'theatticusproject/cuad-qa',
		hf_config: 'default',
		hf_split: 'test',
		format: 'cuad',
		inaccessible: true,
		reason: 'Requires Python code to load'
	},

	// BIAS & ETHICS
	bbq: {
		hf_id: 'lighteval/bbq_helm',
		hf_config: 'all',
		hf_split: 'test',
		format: 'bbq',
		fields: {
			context: 'context',
			question: 'question',
			choices: ['ans0', 'ans1', 'ans2'],
			answer: 'label'
		}
	},
	crows_pairs: {
		hf_id: 'nyu-mll/crows_pairs',
		hf_config: 'default',
		hf_split: 'test',
		format: 'crows_pairs',
		inaccessible: true,
		reason: 'Requires Python code to load'
	},
	stereoset: {
		hf_id: 'McGill-NLP/stereoset',
		hf_config: 'intersentence',
		hf_split: 'validation',
		format: 'stereoset',
		fields: { context: 'context', sentences: 'sentences', bias_type: 'bias_type' }
	},
	ethics: {
		hf_id: 'hendrycks/ethics',
		hf_config: 'commonsense',
		hf_split: 'test',
		format: 'ethics',
		fields: { input: 'input', label: 'label' }
	},
	bold: {
		hf_id: 'AlexaAI/bold',
		hf_config: 'default',
		hf_split: 'train',
		format: 'bold',
		inaccessible: true,
		reason: 'Dataset has been renamed'
	},

	// INACCESSIBLE (no public API)
	gpqa: {
		hf_id: 'Idavidrein/gpqa',
		inaccessible: true,
		reason: 'Gated dataset - requires authentication'
	}
};

// Dataset display names and categories (minimal info needed for UI)
const datasetMeta = {
	// KNOWLEDGE
	mmlu: { name: 'MMLU', category: 'knowledge' },
	mmlu_pro: { name: 'MMLU-Pro', category: 'knowledge' },
	openbookqa: { name: 'OpenBookQA', category: 'knowledge' },
	triviaqa: { name: 'TriviaQA', category: 'knowledge' },
	natural_questions: { name: 'Natural Questions', category: 'knowledge' },
	// LANGUAGE & REASONING
	arc_challenge: { name: 'ARC Challenge', category: 'language & reasoning' },
	arc_easy: { name: 'ARC Easy', category: 'language & reasoning' },
	hellaswag: { name: 'HellaSwag', category: 'language & reasoning' },
	winogrande: { name: 'WinoGrande', category: 'language & reasoning' },
	piqa: { name: 'PIQA', category: 'language & reasoning' },
	boolq: { name: 'BoolQ', category: 'language & reasoning' },
	commonsense_qa: { name: 'CommonsenseQA', category: 'language & reasoning' },
	social_iqa: { name: 'Social IQA', category: 'language & reasoning' },
	bigbench_hard: { name: 'BigBench Hard', category: 'language & reasoning' },
	drop: { name: 'DROP', category: 'language & reasoning' },
	anli: { name: 'ANLI', category: 'language & reasoning' },
	lambada: { name: 'LAMBADA', category: 'language & reasoning' },
	// ARGUMENTATION & DEBATE
	debatesum: { name: 'DebateSum', category: 'argumentation' },
	argument_quality: { name: 'Argument Quality (IBM)', category: 'argumentation' },
	claim_stance: { name: 'Claim Stance (IBM)', category: 'argumentation' },
	logical_fallacy: { name: 'Logical Fallacy', category: 'argumentation' },
	open_debate_evidence: { name: 'OpenDebateEvidence', category: 'argumentation' },
	persuasion: { name: 'Persuasion (Anthropic)', category: 'argumentation' },
	args_me: { name: 'args.me Corpus', category: 'inaccessible', originalCategory: 'argumentation' },
	eu_debates: {
		name: 'EU Parliament Debates',
		category: 'inaccessible',
		originalCategory: 'argumentation'
	},
	// MATH
	gsm8k: { name: 'GSM8K', category: 'math' },
	math: { name: 'MATH', category: 'math' },
	aime: { name: 'AIME', category: 'math' },
	theoremqa: { name: 'TheoremQA', category: 'math' },
	mgsm: { name: 'MGSM', category: 'math' },
	svamp: { name: 'SVAMP', category: 'math' },
	// CODING
	humaneval: { name: 'HumanEval', category: 'coding' },
	mbpp: { name: 'MBPP', category: 'coding' },
	apps: { name: 'APPS', category: 'coding' },
	ds1000: { name: 'DS-1000', category: 'coding' },
	classeval: { name: 'ClassEval', category: 'coding' },
	bigcodebench: { name: 'BigCodeBench', category: 'coding' },
	// SAFETY
	truthfulqa: { name: 'TruthfulQA', category: 'safety' },
	toxigen: { name: 'ToxiGen', category: 'safety' },
	simpleqa: { name: 'SimpleQA', category: 'safety' },
	halueval: { name: 'HaluEval', category: 'safety' },
	realtoxicityprompts: { name: 'RealToxicityPrompts', category: 'safety' },
	xstest: { name: 'XSTest', category: 'inaccessible', originalCategory: 'safety' },
	donotanswer: { name: 'Do-Not-Answer', category: 'safety' },
	// AGENTS
	gaia: { name: 'GAIA', category: 'inaccessible', originalCategory: 'agents & tools use' },
	toolqa: { name: 'ToolQA', category: 'inaccessible', originalCategory: 'agents & tools use' },
	t_eval: { name: 'T-Eval', category: 'inaccessible', originalCategory: 'agents & tools use' },
	// RAG
	frames: { name: 'FRAMES', category: 'information retrieval & RAG' },
	ragtruth: { name: 'RAGTruth', category: 'information retrieval & RAG' },
	// CONVERSATION
	mt_bench: { name: 'MT-Bench', category: 'conversation & chatbots' },
	wildchat: { name: 'WildChat', category: 'conversation & chatbots' },
	lmsys_chat: {
		name: 'LMSYS-Chat-1M',
		category: 'inaccessible',
		originalCategory: 'conversation & chatbots'
	},
	arena_hard: { name: 'Arena-Hard', category: 'conversation & chatbots' },
	// INSTRUCTION
	ifeval: { name: 'IFEval', category: 'instruction-following' },
	alpaca_eval: {
		name: 'AlpacaEval',
		category: 'inaccessible',
		originalCategory: 'instruction-following'
	},
	infobench: { name: 'InfoBench', category: 'instruction-following' },
	// MULTIMODAL
	mmmu: { name: 'MMMU', category: 'multimodal' },
	scienceqa: { name: 'ScienceQA', category: 'multimodal' },
	mme: { name: 'MME', category: 'multimodal' },
	seed_bench: { name: 'SEED-Bench', category: 'inaccessible', originalCategory: 'multimodal' },
	// DOMAIN
	legalbench: { name: 'LegalBench', category: 'inaccessible', originalCategory: 'domain-specific' },
	medqa: { name: 'MedQA', category: 'inaccessible', originalCategory: 'domain-specific' },
	medmcqa: { name: 'MedMCQA', category: 'domain-specific' },
	finqa: { name: 'FinQA', category: 'inaccessible', originalCategory: 'domain-specific' },
	cuad: { name: 'CUAD', category: 'inaccessible', originalCategory: 'domain-specific' },
	// BIAS
	bbq: { name: 'BBQ', category: 'bias & ethics' },
	crows_pairs: { name: 'CrowS-Pairs', category: 'inaccessible', originalCategory: 'bias & ethics' },
	stereoset: { name: 'StereoSet', category: 'bias & ethics' },
	ethics: { name: 'ETHICS', category: 'bias & ethics' },
	bold: { name: 'BOLD', category: 'inaccessible', originalCategory: 'bias & ethics' },
	// INACCESSIBLE
	gpqa: { name: 'GPQA', category: 'inaccessible', originalCategory: 'knowledge' }
};

// Build datasets array by combining hfConfig and datasetMeta
export const datasets = Object.entries(hfConfig).map(([id, hf]) => ({
	id,
	...datasetMeta[id],
	...hf
}));

export function getDatasetsByCategory(categoryId) {
	if (categoryId === 'all') return datasets;
	return datasets.filter((d) => d.category === categoryId);
}

// HuggingFace API
const HF_API_BASE = 'https://datasets-server.huggingface.co';

export async function fetchRandomSample(dataset, count = 1) {
	try {
		let totalRows = 1000;

		try {
			const sizeUrl = `${HF_API_BASE}/size?dataset=${encodeURIComponent(dataset.hf_id)}`;
			const sizeRes = await fetch(sizeUrl);
			if (sizeRes.ok) {
				const sizeData = await sizeRes.json();
				const splitData = sizeData.size?.splits?.find(
					(s) => s.config === dataset.hf_config && s.split === dataset.hf_split
				);
				if (splitData?.num_rows) totalRows = splitData.num_rows;
			}
		} catch (e) {
			console.warn('Could not fetch size:', e);
		}

		const maxOffset = Math.max(0, totalRows - count);
		const randomOffset = Math.floor(Math.random() * maxOffset);
		const rowsUrl = `${HF_API_BASE}/rows?dataset=${encodeURIComponent(dataset.hf_id)}&config=${encodeURIComponent(dataset.hf_config)}&split=${encodeURIComponent(dataset.hf_split)}&offset=${randomOffset}&length=${count}`;

		const rowsRes = await fetch(rowsUrl);
		if (!rowsRes.ok) {
			const errorText = await rowsRes.text();
			throw new Error(`Failed to fetch rows (${rowsRes.status}): ${errorText.slice(0, 100)}`);
		}

		const data = await rowsRes.json();
		return data.rows?.map((r) => r.row) || [];
	} catch (error) {
		console.error('Error fetching sample:', error);
		throw error;
	}
}
