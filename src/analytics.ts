// Site analytics with Umami Cloud (cloud.umami.is). No cookies, so no consent banner.
//
// What gets recorded:
//   - Visits and visit length: Umami does this on its own.
//   - Unique devices: each browser gets a random ID (saved in localStorage) that Umami uses as its "distinct ID",
//     so the same phone counts as one visitor across days. Clearing browser data or a private window gives a new ID.
//   - "Link click": every link to another site or app, with the link name, button text and the section it was in.
//     Slack contact names (Still Have Questions?) are named "Slack: <member ID>", e.g. "Slack: U0B5RKF6VV1" (see event.ts for who's who).
//   - "Nav click": every link that jumps within the page (nav bar, logo, FAQ "see ..." links), with where it goes
//     and the section it was clicked in (nav = the nav bar, faq = an FAQ answer).
//   - "Section view": the first time each section reaches the middle of the screen during a visit.
//   - "Video open" / "Video finished": the promo video player was opened / played to the end.
//     The ticket button on its end screen shows up as a "Link click" in section "header".
//   - "Group rates close": the "group rates & options" box was collapsed (Day Activities; it starts expanded).
//     "Group rates tab": a tab was picked (tab = lift, rentals, lessons or kids).
//     "Group rates link": someone arrived through a #group-rates or #group-rates-<tab> link (link = that hash).
//   - "Swag image zoom": the strap wrap teaser image was opened full size.
//
// Where visitors came from: share tagged links. Short ?r=<code> links are listed in content/shortLinks.ts
// and expanded into utm_source / utm_campaign / utm_content before Umami loads.
//
// Excluding your own devices: open the site with ?notrack (e.g. mammderson.github.io/?notrack) once in each
// browser you use. ?notrack=off turns tracking back on. It sets Umami's own "umami.disabled" flag.

import { links } from './content'
import { shortLinks } from './content/shortLinks'

const UMAMI_SCRIPT_URL = 'https://cloud.umami.is/script.js'
const UMAMI_WEBSITE_ID = 'c39d73ae-8c92-468d-9d53-3d6731cdf32c'
const SITE_DOMAIN = 'mammderson.github.io' // visits from anywhere else (e.g. localhost) are not recorded
const DEVICE_ID_KEY = 'mammderson.deviceId'
const OPT_OUT_KEY = 'umami.disabled' // name set by Umami; don't change

type EventData = Record<string, string>

declare global {
  interface Window {
    umami?: { track: (eventName: string, data?: EventData) => void }
  }
}

// localStorage can throw (e.g. blocked storage), so every read and write goes through these
function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    // storage unavailable: nothing to save
  }
}

// ?notrack turns tracking off for this browser, ?notrack=off turns it back on. The parameter is then removed from the address bar.
function handleOptOutLink() {
  const params = new URLSearchParams(location.search)
  if (!params.has('notrack')) return

  const turnOff = params.get('notrack') !== 'off'
  writeStorage(OPT_OUT_KEY, turnOff ? '1' : null)
  alert(turnOff ? 'Tracking is off on this browser.' : 'Tracking is back on for this browser.')

  params.delete('notrack')
  const query = params.toString()
  history.replaceState(null, '', location.pathname + (query ? `?${query}` : '') + location.hash)
}

// ?r=<code> (a short share link, see content/shortLinks.ts) becomes the full UTM tags, before Umami loads,
// so Umami records the source, campaign and content as usual. Unknown codes are left alone.
function expandShortLink() {
  const params = new URLSearchParams(location.search)
  const code = params.get('r')
  const shortLink = code ? shortLinks[code] : undefined
  if (!shortLink) return

  params.delete('r')
  if (shortLink.source) params.set('utm_source', shortLink.source)
  params.set('utm_campaign', shortLink.campaign)
  if (shortLink.content) params.set('utm_content', shortLink.content)
  history.replaceState(null, '', `${location.pathname}?${params.toString()}${location.hash}`)
}

function getDeviceId(): string {
  const saved = readStorage(DEVICE_ID_KEY)
  if (saved) return saved
  const newId = crypto.randomUUID()
  writeStorage(DEVICE_ID_KEY, newId)
  return newId
}

// Events fired before the Umami script finishes loading wait here, then send once it's ready
const pendingEvents: [string, EventData][] = []

// Also used directly for things that aren't links, e.g. the promo video ("Video open", "Video finished")
export function track(eventName: string, data: EventData = {}) {
  if (window.umami) window.umami.track(eventName, data)
  else pendingEvents.push([eventName, data])
}

function loadUmami() {
  const script = document.createElement('script')
  script.defer = true
  script.src = UMAMI_SCRIPT_URL
  script.dataset.websiteId = UMAMI_WEBSITE_ID
  script.dataset.domains = SITE_DOMAIN
  script.dataset.distinctId = getDeviceId()
  script.onload = () => {
    pendingEvents.splice(0).forEach(([eventName, data]) => window.umami?.track(eventName, data))
  }
  document.head.appendChild(script)
}

// Name shown in reports instead of a long URL: the link's data-track attribute if it has one
// (e.g. Slack profile links: "Slack: U0B5RKF6VV1"), otherwise its key in links.ts (e.g. "campusGroupsPjParty")
function linkName(link: HTMLAnchorElement, url: string): string {
  if (link.dataset.track) return link.dataset.track
  const match = Object.entries(links).find(([, linkUrl]) => linkUrl === url)
  return match ? match[0] : url
}

// Innermost tracked area an element sits in: the PJ Party subsection, a section, the nav or the hero
function areaName(element: Element): string {
  const area = element.closest('#pj-party, section[id], nav, header')
  return area?.id || area?.tagName.toLowerCase() || 'other'
}

// One listener for the whole page, so new buttons and links are tracked without tagging each one
function trackClicks() {
  document.addEventListener('click', (clickEvent) => {
    const link = (clickEvent.target as Element).closest('a')
    if (!link) return

    const href = link.getAttribute('href') ?? ''
    const text = (link.textContent ?? '').trim()

    if (href.startsWith('#')) {
      track('Nav click', { to: href.slice(1) || 'top', text, section: areaName(link) })
      return
    }

    // A data-track name replaces the visible text too, so e.g. a person's name on a Slack link is never recorded
    const data: EventData = { link: linkName(link, href), section: areaName(link) }
    if (!link.dataset.track) data.text = text
    track('Link click', data)
  })
}

// Records each section once per visit, the first time it crosses the middle band of the screen
export function trackSectionViews(): () => void {
  const seen = new Set<string>()
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const id = entry.target.id
        if (!entry.isIntersecting || seen.has(id)) continue
        seen.add(id)
        track('Section view', { section: id })
      }
    },
    { rootMargin: '-40% 0px -40% 0px' }, // only the middle 20% of the screen counts, not a section peeking in at an edge
  )
  document.querySelectorAll('section[id], #pj-party').forEach((element) => observer.observe(element))
  return () => observer.disconnect()
}

// Runs once at startup (see main.tsx). Nothing loads during local development.
export function startAnalytics() {
  handleOptOutLink()
  expandShortLink()
  if (!import.meta.env.PROD) return
  loadUmami()
  trackClicks()
}
