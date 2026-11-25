---
name: review
description: Editorial review of a blog draft before publishing (mechanics, clarity, argument, fact-check, voice, audience, share card). Writes research/<slug>.review.md; never edits the post.
argument-hint: "[slug]"
arguments: [slug]
disable-model-invocation: true
context: fork
agent: editor
background: false
---

Run **Job 1: Review a draft** for the post with slug `$slug`.

1. Find the draft: `src/content/blog/$slug.md`, `src/content/blog/$slug.mdx`, `src/content/blog/$slug/index.md(x)`, `drafts/$slug.md`, or `src/content/pages/$slug.md`. If `$slug` is empty or no draft is found, list the drafts you can see (files with `draft: true`, plus anything in `drafts/`) and stop.
2. Read `docs/STYLE.md`, the sources file `research/$slug.md` if it exists, and up to three published posts for voice.
3. Review only the dimensions defined in your instructions. Skip confidentiality.
4. Write the report to `research/$slug.review.md` in the required format.
5. Reply with the path, the verdict, the counts of Blockers / Should fix / Consider, and any sources you couldn't read.

Do not modify the draft or any other file.
