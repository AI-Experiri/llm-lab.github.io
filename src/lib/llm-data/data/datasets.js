// HuggingFace dataset configurations for LLM Data Lab
// Each dataset must have: hf_id, hf_config, hf_split, format, fields

export const hfConfig = {
	// Pre-training datasets (Common Crawl based)
	fineweb: {
		hf_id: 'HuggingFaceFW/fineweb',
		hf_config: 'sample-10BT',
		hf_split: 'train',
		format: 'fineweb',
		fields: { text: 'text', url: 'url', dump: 'dump' }
	},
	fineweb_edu: {
		hf_id: 'HuggingFaceFW/fineweb-edu',
		hf_config: 'sample-10BT',
		hf_split: 'train',
		format: 'fineweb_edu',
		fields: { text: 'text', url: 'url', score: 'score' }
	},
	pile_uncopyrighted: {
		hf_id: 'monology/pile-uncopyrighted',
		hf_config: 'default',
		hf_split: 'train',
		format: 'pile',
		fields: { text: 'text', meta: 'meta' }
	},

	// Raw sources - Wikipedia
	wikipedia: {
		hf_id: 'wikimedia/wikipedia',
		hf_config: '20231101.en',
		hf_split: 'train',
		format: 'wikipedia',
		fields: { text: 'text', title: 'title', url: 'url' }
	},

	// Raw sources - Books
	gutenberg: {
		hf_id: 'emozilla/pg19',
		hf_config: 'default',
		hf_split: 'train',
		format: 'gutenberg',
		fields: { text: 'text', title: 'short_book_title', url: 'url', date: 'publication_date' }
	},

	// Raw sources - Academic Papers
	arxiv: {
		hf_id: 'ccdv/arxiv-summarization',
		hf_config: 'document',
		hf_split: 'train',
		format: 'arxiv',
		fields: { text: 'article', abstract: 'abstract' }
	},

	// Raw sources - Stack Exchange
	stackexchange: {
		hf_id: 'HuggingFaceH4/stack-exchange-preferences',
		hf_config: 'default',
		hf_split: 'train',
		format: 'stackexchange',
		fields: { question: 'question', answers: 'answers', date: 'date', metadata: 'metadata' }
	},

	// Filtered web datasets
	c4: {
		hf_id: 'allenai/c4',
		hf_config: 'en',
		hf_split: 'train',
		format: 'c4',
		fields: { text: 'text', url: 'url', timestamp: 'timestamp' }
	},
	openwebtext: {
		hf_id: 'Skylion007/openwebtext',
		hf_config: 'plain_text',
		hf_split: 'train',
		format: 'openwebtext',
		fields: { text: 'text' }
	},

	// Code datasets
	codeparrot: {
		hf_id: 'codeparrot/codeparrot-clean',
		hf_config: 'default',
		hf_split: 'train',
		format: 'codeparrot',
		fields: {
			content: 'content',
			repo_name: 'repo_name',
			path: 'path',
			license: 'license'
		}
	},
	the_stack_v2: {
		hf_id: 'bigcode/the-stack-v2',
		inaccessible: true,
		reason: 'Gated dataset - requires authentication'
	},
	starcoderdata: {
		hf_id: 'bigcode/starcoderdata',
		inaccessible: true,
		reason: 'Gated dataset - requires authentication'
	},

	// Instruction datasets
	oasst1: {
		hf_id: 'OpenAssistant/oasst1',
		hf_config: 'default',
		hf_split: 'train',
		format: 'oasst',
		fields: { text: 'text', role: 'role', lang: 'lang', message_id: 'message_id' }
	},
	alpaca: {
		hf_id: 'tatsu-lab/alpaca',
		hf_config: 'default',
		hf_split: 'train',
		format: 'alpaca',
		fields: {
			instruction: 'instruction',
			input: 'input',
			output: 'output',
			text: 'text'
		}
	},
	flan: {
		hf_id: 'Muennighoff/flan',
		hf_config: 'default',
		hf_split: 'train',
		format: 'flan',
		fields: { inputs: 'inputs', targets: 'targets', task: 'task' }
	}
};

// Dataset metadata with display names, categories, size, and last updated
export const datasetMeta = {
	// Pre-training (Common Crawl based)
	fineweb: {
		name: 'FineWeb',
		category: 'pre-training',
		size: '15T tokens',
		lastUpdated: 'May 2024'
	},
	fineweb_edu: {
		name: 'FineWeb-Edu',
		category: 'pre-training',
		size: '1.3T tokens',
		lastUpdated: 'May 2024'
	},
	pile_uncopyrighted: {
		name: 'The Pile (Uncopyrighted)',
		category: 'pre-training',
		size: '210GB',
		lastUpdated: 'Dec 2022'
	},

	// Raw sources - Wikipedia
	wikipedia: {
		name: 'Wikipedia',
		category: 'pre-training',
		size: '21GB (English)',
		lastUpdated: 'Nov 2023'
	},

	// Raw sources - Books
	gutenberg: {
		name: 'Project Gutenberg (PG-19)',
		category: 'pre-training',
		size: '11GB',
		lastUpdated: 'Sep 2019'
	},

	// Raw sources - Academic Papers
	arxiv: {
		name: 'arXiv Papers',
		category: 'pre-training',
		size: '1.1M papers',
		lastUpdated: 'Mar 2023'
	},

	// Raw sources - Stack Exchange
	stackexchange: {
		name: 'Stack Exchange',
		category: 'pre-training',
		size: '10M Q&A pairs',
		lastUpdated: 'Apr 2023'
	},

	// Filtered web
	c4: {
		name: 'C4',
		category: 'curated',
		size: '305GB',
		lastUpdated: 'Apr 2020'
	},
	openwebtext: {
		name: 'OpenWebText',
		category: 'curated',
		size: '38GB',
		lastUpdated: 'Dec 2019'
	},

	// Code
	codeparrot: {
		name: 'CodeParrot',
		category: 'code',
		size: '50GB',
		lastUpdated: 'Mar 2022'
	},
	the_stack_v2: {
		name: 'The Stack v2',
		category: 'inaccessible',
		size: '67TB',
		lastUpdated: 'Mar 2024'
	},
	starcoderdata: {
		name: 'StarCoder Data',
		category: 'inaccessible',
		size: '783GB',
		lastUpdated: 'May 2023'
	},

	// Instruction
	oasst1: {
		name: 'OpenAssistant (OASST1)',
		category: 'instruction',
		size: '66K conversations',
		lastUpdated: 'Apr 2023'
	},
	alpaca: {
		name: 'Alpaca',
		category: 'instruction',
		size: '52K instructions',
		lastUpdated: 'Mar 2023'
	},
	flan: {
		name: 'FLAN',
		category: 'instruction',
		size: '15M examples',
		lastUpdated: 'Oct 2023'
	}
};

// Category definitions
export const categories = [
	{
		id: 'pre-training',
		name: 'Pre-training',
		description: 'Large-scale web crawl data for pre-training LLMs'
	},
	{
		id: 'curated',
		name: 'Curated',
		description: 'High-quality curated text corpora'
	},
	{
		id: 'code',
		name: 'Code',
		description: 'Programming language and code datasets'
	},
	{
		id: 'instruction',
		name: 'Instruction',
		description: 'Instruction-following and fine-tuning datasets'
	},
	{
		id: 'inaccessible',
		name: 'Inaccessible',
		description: 'Gated datasets requiring authentication'
	}
];

/**
 * Fetch a random sample from a HuggingFace dataset
 * @param {string} datasetKey - The key of the dataset in hfConfig
 * @returns {Promise<object|null>} - The sample row or null if failed
 */
export async function fetchRandomSample(datasetKey) {
	const config = hfConfig[datasetKey];
	if (!config || config.inaccessible) {
		return null;
	}

	try {
		// First get the total number of rows
		const infoUrl = `https://datasets-server.huggingface.co/info?dataset=${config.hf_id}&config=${config.hf_config}`;
		const infoRes = await fetch(infoUrl);
		const info = await infoRes.json();

		const total = info?.dataset_info?.splits?.[config.hf_split]?.num_examples || 1000;

		// Pick a random offset (limit to first 10000 for performance)
		const maxOffset = Math.min(total, 10000);
		const offset = Math.floor(Math.random() * maxOffset);

		// Fetch one row at that offset
		const rowsUrl = `https://datasets-server.huggingface.co/rows?dataset=${config.hf_id}&config=${config.hf_config}&split=${config.hf_split}&offset=${offset}&length=1`;
		const rowsRes = await fetch(rowsUrl);
		const data = await rowsRes.json();

		if (data.error) {
			console.error(`Error fetching ${datasetKey}:`, data.error);
			return null;
		}

		return data.rows?.[0]?.row || null;
	} catch (error) {
		console.error(`Failed to fetch sample from ${datasetKey}:`, error);
		return null;
	}
}

/**
 * Get all datasets for a specific category
 * @param {string} categoryId - The category ID
 * @returns {Array} - Array of dataset keys in that category
 */
export function getDatasetsByCategory(categoryId) {
	return Object.entries(datasetMeta)
		.filter(([, meta]) => meta.category === categoryId)
		.map(([key]) => key);
}

/**
 * Get metadata for a specific dataset
 * @param {string} datasetKey - The dataset key
 * @returns {object|null} - The dataset metadata or null
 */
export function getDatasetMeta(datasetKey) {
	return datasetMeta[datasetKey] || null;
}
