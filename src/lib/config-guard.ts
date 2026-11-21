type SiteConfig = { name: string; tagline: string; bio: string; url: string; links: Record<string, string> };

// Short forms the CV headings don't contain, checked only in tagline/bio (FR-0a).
// Not used for post bodies: "SAS" is also a language Wes may write about.
export const EMPLOYER_ALIASES = ['SAS', 'Fitch'];

export const mentions = (text: string, name: string): boolean =>
  new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text);

/** Placeholder text, employer names in tagline/bio, or empty links. Empty array = ready to deploy. */
export function configProblems(s: SiteConfig, employers: string[] = []): string[] {
  const problems: string[] = [];
  for (const key of ['tagline', 'bio'] as const) {
    if (/<[^>]*>/.test(s[key])) problems.push(`${key} is still a placeholder: ${s[key]}`);
    for (const name of [...employers, ...EMPLOYER_ALIASES]) {
      if (mentions(s[key], name)) problems.push(`${key} names an employer (${name}); keep it generic (FR-0a)`);
    }
  }
  for (const [key, value] of Object.entries(s.links)) {
    if (value === '') problems.push(`links.${key} is empty (fill it in or remove the key)`);
  }
  return problems;
}
