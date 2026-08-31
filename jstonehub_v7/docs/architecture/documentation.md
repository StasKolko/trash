# Documentation Principles

These rules apply to all documentation, code comments, and any written
material that a human reads to understand the system.

---

## Core Rules

### One file = one concept

Each documentation file covers **one topic**. A reader should fully
understand that topic without opening other files. Cross-references
to other files are allowed only for **deeper details**, not for
completing the core understanding.

```
✅ "Data Lists" — everything about lists in one file
✅ "Performance" — everything about performance in one file
❌ "Data Lists Part 1" + "Data Lists Part 2" — split concept
❌ "Performance: Caching" separate from "Performance: Indexes" — fragmented
```

### 3–4 abstractions at a time

A human can hold **3–4 complex abstractions** in working memory
simultaneously. Each section within a file should introduce no more
than that before providing a concrete example or summary.

If a section requires understanding 5+ new concepts at once — split
it into subsections, each introducing 1–2 concepts with examples.

### General to specific

Every file, every section follows the same structure:

```
1. What is this? (one sentence)
2. Why does it matter? (motivation)
3. Algorithm (step-by-step decision process)
4. Example (concrete application of the algorithm)
5. Edge cases / exceptions (if any)
```

Never start with implementation details. Never start with exceptions.

### Algorithm → Example

Every decision that a developer must make should have:

1. A **step-by-step algorithm** (flowchart or numbered steps)
   that produces a clear answer
2. A **concrete example** showing the algorithm applied to a real
   case from this project

```
✅ Algorithm: "Step 1: Is data scoped? → Yes → Step 2: Can exceed 1000? ..."
   Example: "User's projects — scoped, < 100 → mode: all"

❌ "Use mode: all for small datasets and mode: cursor for large ones"
   (no algorithm, no clear threshold, no example)
```

---

## No Duplication

### Single source of truth

Every piece of knowledge exists in **exactly one place**:

| Knowledge type | Source of truth | Documentation role |
|---|---|---|
| Type definitions, constants | Code (`@packages/contract`, etc.) | Do not copy into markdown |
| API signatures, function params | Code (the function itself) | Reference files may summarize, never duplicate |
| Architectural decisions | `docs/architecture/*.md` | The canonical source |
| Usage examples for stable packages | `docs/reference/*.md` | Brief snapshot of types and usage |

### When code is the source of truth

If a value, type, or behavior is defined in code — **do not repeat it
in documentation**. Instead:

- Mention that it exists and where to find it
- Describe the **principle** behind it, not the implementation
- Give the file path or import path

```
✅ "Pagination factories live in `@packages/contract/pagination/client`
   and `@packages/contract/pagination/server`"

❌ Copying the full TypeScript type definition into the markdown file
```

### Reference files

Stable, tested packages get a reference file (`docs/reference`)
that provides a **brief snapshot** — function signatures, key behaviors,
usage notes. These are intentionally concise to avoid going stale.

Contracts and frequently-changing code are provided as **code in context**
(included directly when working with AI or reviewing), not as markdown
references.

---

## Formatting Rules

### Algorithms — use flowcharts

Decision processes use ASCII flowcharts, not prose paragraphs:

```
┌─────────────────┐
│ Question?       │
└────┬───────┬────┘
     │ Yes   │ No
     ▼       ▼
┌─────────┐ ┌─────────┐
│ Answer  │ │ Answer  │
└─────────┘ └─────────┘
```

### Data — use tables

Uniform data (comparisons, option lists, mappings) uses tables:

```
| Option | When | Example |
|---|---|---|
| A | condition | ... |
| B | condition | ... |
```

### Code — use fenced blocks

All code examples use fenced code blocks with language annotation.
Examples must be **minimal** — show only what is relevant to the point
being made.

### Prose — use short paragraphs

No paragraph longer than 3–4 sentences. If a paragraph needs more —
it should be split or converted to a list.