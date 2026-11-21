// Short share links for tracking where visitors came from.
//
// When the page opens, the site swaps ?r=<code> for the full UTM tags below before analytics loads,
// so Umami records them exactly as if the long link had been shared (see analytics.ts).
//
// To add a link: add a line, then deploy. Codes are case-sensitive; keep them short, lowercase, no spaces.
//   source:   where it was shared (slack, email, whatsapp, qr, ...)
//   campaign: which push it was part of (launch, last-call, ...)
//   content:  optional, which group or post within that (e.g. 29s2)
// An unknown code is left in the address as-is, so the visit still shows up in Umami under ?r=<code>.

export interface ShortLink {
  source?: string
  campaign: string
  content?: string
}

// source is the primary source. if there's no source probably second visit or forwarded by another person
// e.g. mammderson.github.io/?r=slack29
// mammderson.github.io/?r=<code>
export const shortLinks: Record<string, ShortLink> = {
  slack: { source: 'slack', campaign: 'launch' },
  2027: { campaign: 'launch', content: '2027' },  
  2028: { campaign: 'launch', content: '2028' },
  2029: { source: 'slack', campaign: 'launch', content: '2029' },
  e29s2: { source: 'email', campaign: 'launch', content: '2029s2' },
  s29s2: { source: 'slack', campaign: 'launch', content: '2029s2' },
  oac: { campaign: 'launch', content: 'oac' },
}
