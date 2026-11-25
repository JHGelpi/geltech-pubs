---
name: talking-points
description: Turn the sources listed in research/<slug>.md into cited talking points, counterarguments, questions, gaps and a topics-only outline. Writes research/<slug>.talking-points.md; never drafts prose.
argument-hint: "[slug]"
arguments: [slug]
disable-model-invocation: true
context: fork
agent: editor
background: false
---

Run **Job 2: Talking points from sources** for slug `$slug`.

1. Open `research/$slug.md`. If `$slug` is empty or the file doesn't exist, stop and tell Wes to copy `research/_TEMPLATE.md` to `research/$slug.md` and list his sources.
2. Read every source it lists: local files (usually in `research/$slug/`) with Read, and listed URLs with WebFetch. Fetch nothing that isn't listed.
3. Write `research/$slug.talking-points.md` in the required format. Every claim gets a source ID and location; direct quotes go only in the Direct quotes section, verbatim and labeled; the outline is section topics only.
4. Reply with the path, the number of talking points and gaps, and any sources you couldn't read.

Do not write post content, and do not create or modify anything outside `research/`.
