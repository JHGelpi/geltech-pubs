---
title: "Hello, world"
description: "A sample post that exercises code blocks, tables and footnotes. It is a draft and never ships to production."
pubDate: 2026-11-21
tags: [meta]
draft: true
---

This is a sample post. It stays a draft, so it renders in `npm run dev` and never in production.

## Code

```ts
export const greet = (name: string): string => `Hello, ${name}!`;
```

## Table

| Layer | Tool | Notes |
| --- | --- | --- |
| Storage | S3 | Raw and curated zones |
| Query | Trino | Federated access |

## Footnotes and long lines

A claim that needs a source.[^1] Here is a long unbroken URL to check wrapping on phones: https://example.com/a-very-long-path-segment-without-breaks-a-very-long-path-segment-without-breaks-a-very-long-path-segment-without-breaks-a-very-long-path-segment-without-breaks-a-very-long-path-segment-without-breaks-

[^1]: The footnote text.
