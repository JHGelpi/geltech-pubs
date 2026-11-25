# research/

Private working folder for sources and Editor output. **Everything here is git-ignored except this README and `_TEMPLATE.md`**, so sources, notes and reviews never reach the public repo.

## Layout (one set per post, keyed by slug)

```
research/
  <slug>.md                  # your sources list for the post (copy _TEMPLATE.md)
  <slug>/                    # local source files: PDFs, notes, exported transcripts
  <slug>.talking-points.md   # written by /talking-points
  <slug>.review.md           # written by /review
```

The **slug** is the post's file name without extension: `src/content/blog/data-contracts.md` → `research/data-contracts.md`. That shared name is how the post, its sources and its reports are linked, so no reference inside the post is needed.

## Workflow

1. `cp research/_TEMPLATE.md research/<slug>.md` and list your sources.
2. In Claude Code: `/talking-points <slug>`. Read `research/<slug>.talking-points.md`.
3. Write the post yourself (`npm run new-post`).
4. `/review <slug>`. Read `research/<slug>.review.md`, then make your own edits.
5. Re-run `/review` as often as you like; it overwrites the previous report.

## Supported source types

URLs, Markdown, plain text, PDF and images. Convert `.docx` files to PDF or Markdown first; the Editor can't read Word files directly.
