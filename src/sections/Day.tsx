import { BulletList } from '../components/BulletList'
import { Callout } from '../components/Callout'
import { faApple, faGooglePlay } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GroupRates } from '../components/GroupRates'
import { MapPill } from '../components/MapPill'
import { Pill } from '../components/Pill'
import { Section } from '../components/Section'
import { links, saturday as s } from '../content'

// Saturday daytime: skiing/snowboarding and alternative activities.
export function Day() {
  // Split the planning text around its {whatsapp} placeholder so the link pill can sit inline
  const [beforeWhatsApp, afterWhatsApp] = s.alternatives.planning.split('{whatsapp}')

  return (
    <Section id="day" title="Day Activities">
      <p className="section-intro">{s.intro}</p>
      <div className="subsection">
        <h3 className="subsection-title">{s.skiing.title}</h3>

        <h4>{s.lodges.title}</h4>
        <div className="lodge-cards">
          {s.lodges.list.map((lodge) => (
            <div key={lodge.name} className="lodge-card">
              <span className="lodge-name">{lodge.name}</span>
              {lodge.note && <span className="lodge-note">{lodge.note}</span>}
              <span className="lodge-maps">
                <MapPill provider="apple" url={links[lodge.apple]} variant="white" />
                <MapPill provider="google" url={links[lodge.google]} variant="white" />
              </span>
            </div>
          ))}
        </div>

        <h4>{s.groupRates.title}</h4>
        <p>{s.groupRates.body}</p>
        {s.groupRates.deadlines.map((deadline) => (
          <Callout key={deadline} type="deadline">{deadline}</Callout>
        ))}
        {/* What's offered and prices, before the phone number and booking ID */}
        <GroupRates />
        <p>
          <strong>Phone:</strong> {s.groupRates.phone}{' '}
          <a href={s.groupRates.phoneUrl} className="pill">Call</a>
          <br />
          <strong>UCLA Anderson booking ID:</strong> {s.groupRates.bookingId}
        </p>
        <BulletList items={s.groupRates.rules} />

        <h4>{s.ikon.title}</h4>
        <p>{s.ikon.body}</p>
        <p className="tip-note">
          💡 Tip: {s.ikon.tip}{' '}
          {/* Same pill style as the Apple / Google Maps pills */}
          <Pill url={links.ikonAppApple} label="Ikon Pass app on the App Store">
            <FontAwesomeIcon icon={faApple} className="pill-icon pill-icon-apple" />App Store
          </Pill>{' '}
          <Pill url={links.ikonAppGoogle} label="Ikon Pass app on Google Play">
            <FontAwesomeIcon icon={faGooglePlay} className="pill-icon" />Google Play
          </Pill>
        </p>
      </div>

      {/* id is the target of the FAQ link ("see Day Activities > Alternative Activities") */}
      <div id="alternative-activities" className="subsection">
        <h3 className="subsection-title">{s.alternatives.title}</h3>
        <p>{s.alternatives.intro}</p>
        <div className="activity-cards">
          {s.alternatives.activities.map((activity) => (
            <div key={activity.name} className="activity-card">
              <FontAwesomeIcon icon={activity.icon} className="activity-icon" />
              <span className="activity-name">{activity.name}</span>
              <Pill url={links[activity.linkKey]} variant="white">Learn more</Pill>
            </div>
          ))}
        </div>
        <p>{beforeWhatsApp}<Pill url={links.whatsappCommunity}>WhatsApp community</Pill>{afterWhatsApp}</p>
      </div>
    </Section>
  )
}
