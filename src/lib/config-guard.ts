type SiteConfig = { name: string; tagline: string; bio: string; url: string; links: Record<string, string> };

/** Fields that still hold placeholder text or an empty link. Empty array = ready to deploy. */
export function configProblems(s: SiteConfig): string[] {
  const problems: string[] = [];
  for (const key of ['tagline', 'bio'] as const) {
    if (/<[^>]*>/.test(s[key])) problems.push(`${key} is still a placeholder: ${s[key]}`);
  }
  for (const [key, value] of Object.entries(s.links)) {
    if (value === '') problems.push(`links.${key} is empty (fill it in or remove the key)`);
  }
  return problems;
}
