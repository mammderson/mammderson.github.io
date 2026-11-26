import { useEffect } from 'react'
import { trackSectionViews } from './analytics'
import { Bears } from './components/Bears'
import { Countdown } from './components/Countdown'
import { ExternalLink } from './components/ExternalLink'
import { FooterTitle } from './components/FooterTitle'
import { Nav } from './components/Nav'
import { PromoVideo } from './components/PromoVideo'
import { Ridge } from './components/Ridge'
import { Snowfall } from './components/Snowfall'
import { event, links } from './content'
import { Accommodations } from './sections/Accommodations'
import { Faq } from './sections/Faq'
import { Questions } from './sections/Questions'
import { Day } from './sections/Day'
import { Night } from './sections/Night'
import { Swag } from './sections/Swag'
import { WhatsApp } from './sections/WhatsApp'

// Build date, shown in Pacific time, e.g. "Nov 19, 2026"
const lastUpdated = new Date(__LAST_UPDATED__).toLocaleDateString('en-US', {
  timeZone: 'America/Los_Angeles',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

export default function App() {
  // Start watching which sections people scroll to, once the sections are on the page
  useEffect(() => trackSectionViews(), [])

  // Opening the page with a #section link (e.g. /?r=e29s2#pj-party): the browser scrolls before the images above
  // have loaded, which pushes the section down and leaves the visitor in the wrong place. Wait for load, then jump.
  // #group-rates links are handled by GroupRates itself (it also opens the box and picks the tab).
  useEffect(() => {
    const scrollToHash = () => {
      const id = decodeURIComponent(location.hash.slice(1))
      if (!id || id.startsWith('group-rates')) return
      document.getElementById(id)?.scrollIntoView({ behavior: 'instant', block: 'start' })
    }
    if (document.readyState === 'complete') scrollToHash()
    else window.addEventListener('load', scrollToHash, { once: true })
    return () => window.removeEventListener('load', scrollToHash)
  }, [])

  return (
    <>
      <Nav />

      <header id="top" className="hero">
        <Snowfall />
        <p className="presented-by">{event.presentedBy}</p>
        <p className="hero-emoji" aria-hidden="true">⛷️ 🏂 ❄️ 🎿 🍻</p>
        <h1>
          <span className="title-main">Mammderson</span>
          <span className="title-year">2027</span>
        </h1>
        <p className="date">
          <span>{event.dateDisplay}</span>
          <span className="date-location">{event.location}</span>
        </p>
        <Countdown target={event.countdownTarget} />
        {/* Trailer and ticket buttons: part of the first impression, so neither should need a scroll */}
        <div className="hero-cta">
          <PromoVideo placement="hero" />
          <ExternalLink url={links.campusGroupsPjParty} variant="button" className="button-tickets">
            🎟️ Get PJ Party tickets now!
          </ExternalLink>
        </div>
        <p className="tagline">{event.tagline}</p>
        <p className="intro">{event.intro}</p>
        <Ridge className="hero-ridge" />
        <Bears />
      </header>

      <main>
        <Accommodations />
        <WhatsApp />
        <Day />
        <Night />
        <Swag />
        <Faq />
        <Questions />
      </main>

      <footer className="footer">
        <FooterTitle organization={event.organization} eventName={event.name} />
        <span className="footer-updated">Last updated {lastUpdated}</span>
      </footer>
    </>
  )
}
