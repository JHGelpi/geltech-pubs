// The only place identity lives (CLAUDE.md rule 4). Placeholders in <…> block a deploy build.
export const site = {
  name: "Wes Gelpi",
  tagline: "Engineering Director & Technologist | Turning Enterprise Technology into Business Value | Jenkins MBA Candidate",
  bio: "Wes is a Director of R&D who leads a global R&D organization, working closely with IT, Product, Technical Support, Enablement, and Sales. He's completing an MBA at NC State University. He also has a record of community service: he served on a local nonprofit's (Breakthrough T1D) board of directors and was its president for two years.",
  url: "https://geltech.dev",
  email: "jhgelpi@gmail.com", // shown on /about/ only
  links: {
    linkedin: "https://www.linkedin.com/in/wgelpi",
    github: "https://github.com/JHGelpi",
    x: "https://x.com/wes_gelpi",
    bluesky: "https://bsky.app/profile/lookalive.bsky.social",
  } as Record<string, string>,
};
