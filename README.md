# LLM Lab

Interactive exploration of Large Language Models based on Stanford CS336: Language Modeling from Scratch.

This project provides hands-on visualizations and interactive tools for understanding core LLM concepts:

- **Tokenizing Lab** - Visualize BPE, WordPiece, and advanced tokenization algorithms including Scaffold-BPE, AdaptBPE, and MorphBPE
- **Positional Encoding** - Explore positional encoding methods from Sinusoidal to RoPE, ALiBi, and modern context extension techniques
- **Data Lab** - Explore LLM training datasets, data processing pipelines, and sample data
- **Scaling Lab** - Understand LLM scaling laws from Hestness 2017 to Kaplan 2020, Chinchilla, and muP
- **Inference Lab** - Deep dive into inference optimization including memory management, KV caching, and quantization
- **Evaluation Lab** - Explore LLM evaluation benchmarks including MMLU, GSM8K, HumanEval, and safety evaluations

## Build and Run

### Prerequisites

- Node.js (18+ recommended)

### Install Dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

This starts the development server. Open the URL shown in your terminal (typically http://localhost:5173).

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```
