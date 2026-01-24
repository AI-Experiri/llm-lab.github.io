# Shared Components Design Document

This document describes all shared components in `src/lib/shared/` and their parameters.

---

## Layout Components

### Section

Main content section container with optional title.

| Parameter  | Type    | Default  | Description                                                   |
| ---------- | ------- | -------- | ------------------------------------------------------------- |
| `title`    | string  | `''`     | Optional section title (h3 in `--color-primary` to stand out) |
| `class`    | string  | `''`     | Additional CSS classes                                        |
| `children` | snippet | required | Section content                                               |

**Styling:** Rounded surface background (`--color-surface`), padding. Title uses `--color-primary` (pink/purple) to stand out from paragraph content.

```svelte
<Section title="My Section">
	<p>Content here</p>
</Section>
```

---

### HeroSection

Hero/intro section with gradient border and background. Used for page introductions.

| Parameter     | Type    | Default  | Description                                                 |
| ------------- | ------- | -------- | ----------------------------------------------------------- |
| `title`       | string  | `''`     | Main heading (h2)                                           |
| `subtitle`    | string  | `''`     | Italicized subtitle below title                             |
| `icon`        | string  | `''`     | Emoji or text icon (rendered large)                         |
| `accentColor` | string  | `'pink'` | Gradient accent: `'pink'`, `'emerald'`, `'cyan'`, `'amber'` |
| `class`       | string  | `''`     | Additional CSS classes                                      |
| `children`    | snippet | required | Content below title/subtitle                                |

**Styling:** Gradient background, primary border, rounded corners.

```svelte
<HeroSection title="Welcome" subtitle="Getting started" accentColor="emerald">
	<p>Introduction text</p>
</HeroSection>
```

---

### ContentBox

Inner content box with semantic variants for different purposes. **All styling controlled here - pages only pass variant name and title.**

| Parameter  | Type    | Default     | Description                                                 |
| ---------- | ------- | ----------- | ----------------------------------------------------------- |
| `title`    | string  | `''`        | Optional title (rendered as h3 with variant-specific color) |
| `variant`  | string  | `'default'` | Semantic variant (see below)                                |
| `class`    | string  | `''`        | Additional CSS classes                                      |
| `children` | snippet | required    | Box content                                                 |

**Variants:**

| Variant     | Background               | Border                   | Title Color       | Use Case                         |
| ----------- | ------------------------ | ------------------------ | ----------------- | -------------------------------- |
| `default`   | `--color-secondary`      | none                     | `--color-primary` | General content blocks           |
| `dark`      | `--color-bg`             | `--color-muted` at 20%   | `--color-primary` | Informational content, cards     |
| `warning`   | `--color-bg`             | `red-500` at 30%         | `red-400`         | Problems, challenges, issues     |
| `success`   | `--color-bg`             | `green-500` at 30%       | `green-400`       | Solutions, positive outcomes     |
| `highlight` | `--color-primary` at 10% | `--color-primary` at 30% | `--color-primary` | Key insights, important callouts |

```svelte
<!-- Problem/challenge -->
<ContentBox title="Memory Bottleneck" variant="warning">
	<p>Description of the problem</p>
</ContentBox>

<!-- Solution -->
<ContentBox title="KV Caching" variant="success">
	<p>How it solves the problem</p>
</ContentBox>

<!-- Important concept -->
<ContentBox title="Key Formula" variant="highlight">
	<p>Important information</p>
</ContentBox>

<!-- General info -->
<ContentBox title="Background" variant="dark">
	<p>Explanatory content</p>
</ContentBox>
```

---

## Content Components

### KeyTakeaway

Key takeaways with two modes: numbered list or single callout.

| Parameter  | Type     | Default           | Description                                        |
| ---------- | -------- | ----------------- | -------------------------------------------------- |
| `items`    | string[] | `[]`              | Array of takeaway strings (triggers numbered mode) |
| `title`    | string   | `'Key Takeaways'` | Section title                                      |
| `class`    | string   | `''`              | Additional CSS classes                             |
| `children` | snippet  | -                 | Content for callout mode (when items is empty)     |

**Modes:**

- **Numbered list** (when `items` array provided): 2-column grid with numbered circles
- **Simple callout** (when using children): Bordered box with title

```svelte
<!-- Numbered list mode -->
<KeyTakeaway items={['First key point', 'Second key point', 'Third key point']} />

<!-- Callout mode -->
<KeyTakeaway title="Key insight">
	<p>Single important point here</p>
</KeyTakeaway>
```

---

### Timeline

Vertical timeline for displaying historical evolution.

| Parameter | Type            | Default  | Description              |
| --------- | --------------- | -------- | ------------------------ |
| `events`  | TimelineEvent[] | required | Array of timeline events |

**TimelineEvent object:**

| Property      | Type   | Required | Description                               |
| ------------- | ------ | -------- | ----------------------------------------- |
| `year`        | string | yes      | Year of the event                         |
| `title`       | string | yes      | Title/name of the milestone               |
| `description` | string | yes      | Description of the event                  |
| `badge`       | string | no       | Optional badge text (e.g., "175B params") |
| `link`        | string | no       | Optional link to paper/resource           |

```svelte
<Timeline
	events={[
		{
			year: '2017',
			title: 'Transformers',
			description: 'Attention mechanism',
			badge: 'Foundation',
			link: 'https://arxiv.org/...'
		},
		{ year: '2020', title: 'GPT-3', description: 'Scaling laws', badge: '175B' }
	]}
/>
```

---

### StepList

Numbered step list for sequential explanations.

| Parameter | Type   | Default  | Description           |
| --------- | ------ | -------- | --------------------- |
| `steps`   | Step[] | required | Array of step objects |

**Step object:**

| Property  | Type   | Required | Description                |
| --------- | ------ | -------- | -------------------------- |
| `title`   | string | no       | Optional step title (bold) |
| `content` | string | yes      | Step content/description   |

```svelte
<StepList
	steps={[
		{ title: 'Tokenize', content: 'Split text into tokens' },
		{ title: 'Embed', content: 'Convert tokens to vectors' },
		{ content: 'Continue processing...' }
	]}
/>
```

---

### ComparisonGrid

Side-by-side comparison layout for contrasting items.

| Parameter | Type             | Default  | Description                         |
| --------- | ---------------- | -------- | ----------------------------------- |
| `items`   | ComparisonItem[] | required | Array of comparison items           |
| `columns` | number           | `2`      | Number of columns: `2`, `3`, or `4` |

**ComparisonItem object:**

| Property | Type     | Required | Description                                        |
| -------- | -------- | -------- | -------------------------------------------------- |
| `title`  | string   | yes      | Item title                                         |
| `color`  | string   | no       | Border/accent color (e.g., `'emerald'`, `'amber'`) |
| `points` | string[] | yes      | List of bullet points                              |

```svelte
<ComparisonGrid
	items={[
		{ title: 'Pros', color: 'emerald', points: ['Fast', 'Simple'] },
		{ title: 'Cons', color: 'red', points: ['Limited', 'Complex setup'] }
	]}
/>
```

---

### CodeBlock

Styled code or formula display block.

| Parameter  | Type    | Default  | Description                          |
| ---------- | ------- | -------- | ------------------------------------ |
| `title`    | string  | `''`     | Optional title above code            |
| `class`    | string  | `''`     | Additional CSS classes               |
| `children` | snippet | required | Code content (rendered in monospace) |

```svelte
<CodeBlock title="Formula">Loss = -log(P(correct_token))</CodeBlock>
```

---

## Feedback Components

### ErrorNotice

Error and warning notice display.

| Parameter  | Type    | Default   | Description                             |
| ---------- | ------- | --------- | --------------------------------------- |
| `title`    | string  | `'Error'` | Notice title                            |
| `message`  | string  | -         | Error message text                      |
| `variant`  | string  | `'error'` | Style variant: `'error'` or `'warning'` |
| `children` | snippet | -         | Additional content below message        |

```svelte
<ErrorNotice
	title="Dataset Unavailable"
	message="This dataset requires authentication"
	variant="warning"
/>
```

---

### LoadingSpinner

Loading spinner with optional message.

| Parameter | Type   | Default        | Description                          |
| --------- | ------ | -------------- | ------------------------------------ |
| `message` | string | `'Loading...'` | Loading message                      |
| `size`    | string | `'md'`         | Spinner size: `'sm'`, `'md'`, `'lg'` |

```svelte
<LoadingSpinner message="Fetching data..." size="lg" />
```

---

## Interactive Components

### GradientButton

Primary action button with gradient styling.

| Parameter  | Type     | Default  | Description             |
| ---------- | -------- | -------- | ----------------------- |
| `onclick`  | function | required | Click handler           |
| `disabled` | boolean  | `false`  | Disabled state          |
| `loading`  | boolean  | `false`  | Shows spinner when true |
| `children` | snippet  | required | Button label            |

```svelte
<GradientButton onclick={handleClick} loading={isLoading}>Fetch Sample</GradientButton>
```

---

### DatasetSelector

Dataset selector with category and dataset dropdowns.

| Parameter               | Type     | Default       | Description                               |
| ----------------------- | -------- | ------------- | ----------------------------------------- |
| `categories`            | array    | required      | Array of category objects `{ id, label }` |
| `datasets`              | array    | required      | Filtered datasets for selected category   |
| `selectedCategory`      | string   | required      | Currently selected category ID            |
| `selectedDataset`       | string   | required      | Currently selected dataset ID             |
| `onCategoryChange`      | function | required      | Category change handler                   |
| `onDatasetChange`       | function | required      | Dataset change handler                    |
| `getCategoryCount`      | function | -             | Returns count for category ID             |
| `getDatasetLabel`       | function | -             | Returns display label for dataset         |
| `isDatasetInaccessible` | function | `() => false` | Returns true if dataset is inaccessible   |

---

## Link Components

### PillLink

Colored pill-style link or badge.

| Parameter  | Type    | Default  | Description                                                                                  |
| ---------- | ------- | -------- | -------------------------------------------------------------------------------------------- |
| `href`     | string  | `''`     | Link URL (renders as span if empty)                                                          |
| `color`    | string  | `'gray'` | Color: `'red'`, `'green'`, `'yellow'`, `'blue'`, `'cyan'`, `'purple'`, `'emerald'`, `'gray'` |
| `title`    | string  | `''`     | Tooltip text                                                                                 |
| `children` | snippet | required | Link/badge text                                                                              |

```svelte
<PillLink href="https://arxiv.org/..." color="red">Paper</PillLink>
<PillLink color="cyan">1.5TB</PillLink>
```

---

### ReferenceLink

Consistent paper/source reference link styling.

| Parameter  | Type    | Default  | Description               |
| ---------- | ------- | -------- | ------------------------- |
| `href`     | string  | required | Link URL                  |
| `number`   | number  | `null`   | Optional reference number |
| `children` | snippet | -        | Optional text before link |

**Note:** Must be used inside a `<ul>` element.

```svelte
<ul>
	<ReferenceLink href="https://arxiv.org/..." number={1}>Attention Is All You Need</ReferenceLink>
</ul>
```

---

### DatasetInfoCard

Dataset information card with metadata and links.

| Parameter       | Type    | Default  | Description                                                                          |
| --------------- | ------- | -------- | ------------------------------------------------------------------------------------ |
| `name`          | string  | required | Dataset name                                                                         |
| `category`      | string  | required | Category badge text                                                                  |
| `categoryColor` | string  | `'gray'` | Badge color: `'purple'`, `'blue'`, `'green'`, `'amber'`, `'red'`, `'cyan'`, `'gray'` |
| `description`   | string  | `''`     | Dataset description                                                                  |
| `year`          | string  | `''`     | Publication year                                                                     |
| `size`          | string  | `''`     | Dataset size                                                                         |
| `hfUrl`         | string  | `''`     | HuggingFace URL                                                                      |
| `paperUrl`      | string  | `''`     | Paper URL                                                                            |
| `codeUrl`       | string  | `''`     | Code repository URL                                                                  |
| `license`       | string  | `''`     | License text                                                                         |
| `children`      | snippet | -        | Additional content (e.g., action buttons)                                            |

```svelte
<DatasetInfoCard
	name="The Pile"
	category="General"
	categoryColor="purple"
	description="800GB diverse text dataset"
	year="2020"
	size="800GB"
	paperUrl="https://arxiv.org/..."
	hfUrl="https://huggingface.co/..."
/>
```

---

## Import

All components are exported from `$lib/shared`:

```svelte
<script>
	import {
		Section,
		HeroSection,
		ContentBox,
		KeyTakeaway,
		Timeline,
		StepList,
		ComparisonGrid,
		CodeBlock,
		ErrorNotice,
		LoadingSpinner,
		GradientButton,
		DatasetSelector,
		PillLink,
		ReferenceLink,
		DatasetInfoCard
	} from '$lib/shared';
</script>
```
