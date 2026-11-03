"""Render the three buildless supporting pages and the shared homepage header.

Run from the repository root with Python 3. No packages or build step are needed
to serve the generated HTML. Edit the page copy here before regenerating.
"""
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[2]


def header(current=""):
    home = "" if current == "home" else "index.html"
    destinations = [("resources", "Resources"),
                    ("entrepreneurship-in-nc", "Entrepreneurship in NC"),
                    ("past-events", "Past Events")]
    links = "".join(f'<a href="{slug}.html"' + (' aria-current="page"' if current == slug else '') + f'>{label}</a>' for slug, label in destinations)
    return f'''<header class="site-header">
    <a class="brand" href="{home}#top" aria-label="SMathHacks 2027 home"><img src="assets/logo/smathhacks-full-color.svg" alt="SMathHacks 2027, Bits and Bites" width="1772" height="884"></a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation" hidden>Menu</button>
    <nav class="site-nav" id="primary-navigation" aria-label="Primary navigation">
      <a href="{home}#tracks">Tracks</a><a href="{home}#details">Join</a><a href="{home}#schedule">Schedule</a><a href="{home}#faq">FAQ</a><a href="{home}#sponsors">Sponsors</a>
      <details class="explore-menu"><summary>Explore</summary><div class="explore-panel">{links}</div></details>
    </nav>
    <div class="header-status" data-register="header"><a href="{home}#updates">Interest form soon</a></div>
  </header>'''


def footer():
    return '''<footer class="support-footer"><div class="support-footer-inner">
    <div><p>Made with ❤️ by SMathHacks 2027</p><p>Bits &amp; Bites · NCSSM</p></div>
    <nav aria-label="Footer navigation"><a href="index.html">Back to the hillside</a><a href="resources.html">Resources</a><a href="past-events.html">Past Events</a><a href="mailto:smathhacks@ncssm.edu">Contact us</a></nav>
  </div></footer>'''


def illustration(character, prop, extra=""):
    return f'''<div class="hero-illustration {extra}" aria-hidden="true"><img class="hero-character" src="assets/hillside/{character}.webp" alt=""><img class="hero-prop" src="assets/hillside/{prop}.webp" alt=""></div>'''


def archive_album(year):
    records = json.loads((ROOT / "archive-photos.json").read_text())
    groups = {}
    for photo in records:
        if photo["year"] == year:
            groups.setdefault(photo["campus"], []).append(photo)
    albums = []
    for campus, photos in groups.items():
        images = "".join(f'<a href="{p["src"]}" aria-label="View full photo: {p["alt"]}"><img src="{p["src"]}" alt="{p["alt"]}" width="{p["width"]}" height="{p["height"]}" loading="lazy"></a>' for p in photos)
        label = campus if campus != "Event" else f"{year} event"
        albums.append(f'<details><summary>{label} · {len(photos)} photos</summary><div class="album-grid">{images}</div></details>')
    return f'<div class="archive-albums" id="photos-{year}">' + "".join(albums) + '</div>'


def page(slug, title, description, eyebrow, intro, art, sections, body):
    index = "".join(f'<a href="#{anchor}">{label}</a>' for anchor, label in sections)
    html = f'''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#F8F4EA">
  <meta name="description" content="{description}">
  <title>{title} | SMathHacks 2027</title>
  <link rel="icon" type="image/svg+xml" href="assets/logo/smathhacks-full-color.svg">
  <link rel="stylesheet" href="hillside.css">
  <link rel="stylesheet" href="navigation.css">
  <link rel="stylesheet" href="support.css">
</head>
<body class="support-page">
  <a class="skip-link" href="#main">Skip to content</a>
  {header(slug)}
  <main id="main">
    <div class="page-hero"><div class="page-hero-inner"><div>
      <p class="eyebrow">{eyebrow}</p>
      <h1{' class="long-title"' if slug == 'entrepreneurship-in-nc' else ''}>{title}</h1>
      <p class="page-intro">{intro}</p>
      <a class="back-to-trail" href="index.html">← Back to the hillside</a>
    </div>{art}</div></div>
    <div class="reading-layout">
      <aside class="page-index"><p>On this page</p><nav aria-label="On this page">{index}</nav></aside>
      <div class="page-content">{body}</div>
    </div>
  </main>
  {footer()}
  <script type="module" src="navigation.js"></script>
  <script type="module" src="event.js"></script>
</body>
</html>
'''
    (ROOT / f"{slug}.html").write_text(html)


ARCHIVED_PRIZES = '''<div class="archive-albums"><details id="prizes-2026"><summary>2026 prizes &amp; special awards</summary><div class="archived-prize-details"><div id="prize-table-2026" aria-labelledby="prizes-2026-title">
        <h3 id="prizes-2026-title">From the 2026 prize table</h3>
        <p class="section-intro">A look back at Under the Sea. These are historical awards, not the 2027 prize lineup.</p>
        <table class="prize-table"><caption class="sr-only">Archived SMathHacks 2026 track prizes</caption><thead><tr><th scope="col">2026 track</th><th scope="col">Grand prize</th><th scope="col">Runner-up prize</th></tr></thead><tbody>
          <tr><th scope="row">Interface Design</th><td>Wacom Intuos Graphics Drawing Tablet</td><td>Amazon Echo Pop</td></tr>
          <tr><th scope="row">Hardware</th><td>FHD 1080P Portable Monitor</td><td>Mini Drone</td></tr>
          <tr><th scope="row">Data Science</th><td>Sony Headphones</td><td>JBL Speaker</td></tr>
          <tr><th scope="row">AI &amp; Machine Learning</th><td>Magcubic Mini Projector</td><td>AULA Keyboard</td></tr>
        </tbody></table>
        <p class="quiet-note">In 2026, each winning team received one track prize per team member.</p>
        <div class="inline-links"><a href="https://docs.google.com/document/d/1O5W5R62sP-288H4_ejHX49mINS7m3eDJJb0hTgUiyIo/edit?usp=sharing">2026 track guide ↗</a></div>
      </div>
<div id="special-awards" aria-labelledby="special-awards-title">
        <h3 id="special-awards-title">2026 special awards</h3>
        <div class="award-list"><div><h4>Ingenuity Award</h4><strong>Up to 4 NVIDIA SHIELDs</strong><p>Recognized an innovative, feasible response to an ocean-related need, with evidence of its potential impact.</p></div><div><h4>Best Climate Aware Solution</h4><strong>Up to 4 NVIDIA SHIELDs</strong><p>Recognized a project addressing an environmental need with a detailed solution and potential climate impact.</p></div></div>
        <p class="quiet-note">These 2026 special awards could be won alongside a track prize.</p>
        <p class="archive-source">Archived from the <a href="https://smathhacks.ncssm.edu/tracks-prizes">2026 Tracks &amp; Prizes page</a>.</p>
      </div></div></details></div>'''


def resource(title, text, url=None, state=None, key=None):
    arrow = '↗' if url and url.startswith('http') else '→'
    heading = f'<a href="{url}">{title} {arrow}</a>' if url else title
    data = f' data-resource="{key}"' if key else ''
    return f'<li{data}><div><h3>{heading}</h3><p>{text}</p></div>' + (f'<span class="resource-state">{state}</span>' if state else '') + '</li>'


essentials = resource("Event schedule", "Find the opening ceremony, workshops, and time to build on the hillside.", "index.html#schedule")
essentials += resource("Virtual sessions &amp; help room", "The 2027 meeting link will be shared here when available.", state="Coming for 2027", key="meetingUrl")
essentials += resource("Project submissions", "The 2027 submission platform will be linked here when available.", state="Coming for 2027", key="submissionUrl")
essentials += resource("Submission requirements", "What to include in your final project will be published with the 2027 guidelines.", state="Coming for 2027", key="submissionGuidelinesUrl")
first = resource("First-time hacker guide", "A starting point if this is your first hackathon.", "https://docs.google.com/document/d/1b3o_mWK17DtvlaATyR4Pa60bpLs0pt1tXk8hC2CcoNc/edit?usp=sharing")
first += resource("Technical master document", "The collection of technical resource documents from the previous event.", "https://docs.google.com/document/d/1QADNzT4cQVTAabnF3WhsozRK3GljCU1wT9y0cogYKtI/edit?usp=sharing")
software = resource("Web development, Git &amp; Python", "Learning resources for building and sharing your project.", "https://docs.google.com/document/d/1J-PMEVZxFYhhLRLBCtLiUqNlGAQaSEB4IwvD3mN2BR0/edit?usp=sharing")
hardware = resource("Arduino tutorials", "A starting point for working with microcontrollers and electronics.", "https://docs.google.com/document/d/1NqhFTlCp_D9JLz7-fZPRTrOIZnGr7-csv-sXGBRRvD8/edit?usp=sharing")
hardware += resource("2026 campus hardware inventory", "The previous list of hardware at Durham and Morganton. Equipment availability for 2027 is still to be confirmed.", "https://docs.google.com/spreadsheets/d/1thhU8UsO9wfZdgDC3irR7B8Yg0GJu4SV0pl2mxGRJkQ/edit?usp=sharing", "2026 reference")
page("resources", "Resources", "Hackathon essentials, beginner guides, software resources, and Arduino tutorials for SMathHacks participants.",
     "A helping hand for your hack", "Your place for event links, first steps, and a little help when you get stuck. Pick what you need and get back to building.",
     illustration("amp-master", "toast-breadboard", "resources-art"),
     [("essentials", "Event essentials"), ("first-hackathon", "First hackathon"), ("software", "Software"), ("hardware", "Hardware"), ("keep-building", "Keep building")], f'''
      <section id="essentials" aria-labelledby="essentials-title"><h2 id="essentials-title">Event essentials</h2><p class="section-intro">The practical links for SMathHacks 2027. We’ll add event-day access and submission details as they’re confirmed.</p><ul class="resource-list">{essentials}</ul></section>
      <section id="first-hackathon" aria-labelledby="first-hackathon-title"><h2 id="first-hackathon-title">Your first hackathon?</h2><p class="section-intro">Start here. You don’t need to have it all figured out before you arrive.</p><div class="announcement"><p class="quiet-note">The learning guides below were shared for SMathHacks 2026. They’re here as references; dates, event rules, and equipment details may change for 2027.</p></div><ul class="resource-list">{first}</ul><div class="inline-links"><a href="index.html#faq">Read the FAQs →</a></div></section>
      <section id="software" aria-labelledby="software-title"><h2 id="software-title">Software &amp; development</h2><ul class="resource-list">{software}</ul></section>
      <section id="hardware" aria-labelledby="hardware-title"><h2 id="hardware-title">Hardware &amp; electronics</h2><ul class="resource-list">{hardware}</ul></section>
      <section id="keep-building" aria-labelledby="keep-building-title"><h2 id="keep-building-title">Keep your idea growing.</h2><p>Looking for mentorship, funding, or a next step after the hackathon? Explore the Colopy Entrepreneurship Program at NCSSM.</p><a class="trail-link" href="entrepreneurship-in-nc.html">Entrepreneurship in NC →</a><p class="archive-source">Learning links carried over from the <a href="https://smathhacks.ncssm.edu/resources">2026 Resources page</a>. Need a hand? Email <a href="mailto:smathhacks@ncssm.edu">smathhacks@ncssm.edu</a>.</p></section>''')


photo_alts = {
    2: "Students in red GrepBeat shirts gathered together at an entrepreneurship event.",
    3: "Four students in formal attire standing together behind a presentation table.",
    4: "A student in a red shirt presenting beside a projected slide.",
    5: "Students presenting a project to an audience in a classroom.",
    6: "Two students smiling and holding up medals.",
    7: "A speaker presenting a slide about the startup ecosystem.",
    8: "A student holding a DECA award in a large event venue.",
    9: "Students seated around tables for a speaker session at NCSSM.",
}
photos = "".join(f'<a href="assets/entrepreneurship/program-{i:02d}.webp" aria-label="View full photo: {alt}"><img src="assets/entrepreneurship/program-{i:02d}.webp" alt="{alt}" width="800" height="600" loading="lazy"></a>' for i, alt in photo_alts.items() if i != 2)
page("entrepreneurship-in-nc", "Entrepreneurship in NC", "Keep building after SMathHacks with NCSSM’s Colopy Entrepreneurship Program, mentorship, and grant resources.",
     "Keep your idea growing", "A hackathon can be the beginning of something bigger. Find people, programs, and resources to help you take the next step.",
     illustration("bit-master", "leaf-solar-charger"),
     [("colopy-program", "The Colopy program"), ("next-steps", "Funding &amp; mentorship"), ("program-moments", "Program moments")], f'''
      <section id="colopy-program" aria-labelledby="colopy-title"><h2 id="colopy-title">The Colopy Entrepreneurship Program at NCSSM</h2><p>Established in 2024 through a gift from the Colopy family, the program helps students explore entrepreneurship through hands-on learning, mentorship, and support for their ideas.</p><p>It brings business principles together with creative problem-solving, helping students develop ventures that respond to real needs in their communities.</p><div class="inline-links"><a href="https://entrepreneurship.ncssm.edu/">Explore the Colopy program ↗</a></div><figure class="program-photo"><img src="assets/entrepreneurship/program-02.webp" alt="{photo_alts[2]}" width="1280" height="884" loading="lazy"><figcaption>From the Colopy program’s student community.</figcaption></figure></section>
      <section id="next-steps" aria-labelledby="next-steps-title"><h2 id="next-steps-title">Take the next step.</h2><div class="program-opportunities"><div><h3>Find funding for your idea</h3><p>The program’s Grants &amp; Resources page explains Accelerator Grants and shares a funding toolkit. Check the program’s current process and eligibility before applying.</p><a class="trail-link" href="https://entrepreneurship.ncssm.edu/grants-resources">Explore grants &amp; resources ↗</a></div><div><h3>Learn with people who’ve done it</h3><p>Explore educational programming and mentorship to develop your idea beyond its first prototype.</p><a class="trail-link" href="https://entrepreneurship.ncssm.edu/">Meet the program ↗</a></div><div><h3>Talk through your next move</h3><p>For questions about the program, mentorship, or funding, contact <a href="mailto:entrepreneurship@ncssm.edu">entrepreneurship@ncssm.edu</a>.</p></div></div></section>
      <section id="program-moments" aria-labelledby="program-moments-title"><h2 id="program-moments-title">Ideas out in the world.</h2><p>Presentations, conversations, and celebrations from the program.</p><div class="program-photos">{photos}</div><p class="photo-note">Select a photo to view it in full. Photos carried over from the <a href="https://smathhacks.ncssm.edu/entrepreneurship-in-nc">previous Entrepreneurship in NC page</a>.</p></section>''')


def winner_links(entries):
    return '<ul class="winner-links">' + ''.join(f'<li><a href="https://devpost.com/software/{slug}">{name} ↗</a></li>' for slug, name in entries) + '</ul>'


grand = winner_links([("tide-tracking-and-intelligence-for-dive-expeditions", "TIDE: Tracking and Intelligence for Dive Expeditions"), ("u-halk-ultrasonic-harmful-algae-killer", "U-HALK: Ultrasonic Harmful Algae Killer"), ("plasticflow", "PlasticFlow"), ("pale-watch", "Pale Watch")])
runners = winner_links([("soundscape-wnlqdv", "SoundScape"), ("sens-pod-submersible-environmental-networked-system", "SENS Pod: Submersible Environmental Networked System"), ("scuda-scuba-sign-capturing-user-interface-data-analysis", "SCUDA: Scuba-sign Capturing User-interface Data Analysis"), ("ai-carbon-sink-predictor", "AI Carbon Sink Predictor")])
special = winner_links([("grime-garbage-river-interception-modeling-engine", "Climate Grand Award · GRIME"), ("okeanos", "Ingenuity Grand Award · Okeanos")])
memory = '''<figure class="hero-memory"><img src="assets/gallery/smathhacks-staircase.webp" alt="SMathHacks participants in blue shirts gathered on a staircase in Morganton." width="1920" height="1280"><figcaption>A whole lot of possibility.</figcaption></figure>'''
page("past-events", "Past Events", "Explore SMathHacks and UniHacks from 2020 through 2026, with project galleries, winning hacks, and event memories.",
     "From the scrapbook", "Different themes. New ideas. The same curiosity. Take a look at the projects and people who’ve made this event what it is.",
     memory, [("event-2026", "2026"), ("event-2025", "2025"), ("event-2024", "2024"), ("earlier-events", "2020–2023")], f'''
      <section id="event-2026" aria-labelledby="event-2026-title"><div class="archive-year-header"><h2 id="event-2026-title">2026</h2><p>Under the Sea</p></div><p>March 14–15, 2026. Thank you to everyone who built, learned, and explored with us.</p><div class="inline-links"><a href="https://smathhacks-2026.devpost.com/">Explore all 2026 projects ↗</a><a href="#prizes-2026">2026 prizes →</a></div><div class="archive-photos"><figure><a href="assets/gallery/closing-ceremony-2026.webp"><img src="assets/gallery/closing-ceremony-2026.webp" alt="Participants gathered in an auditorium for the SMathHacks 2026 closing ceremony." width="1920" height="1440" loading="lazy"></a><figcaption>Closing ceremony · 2026</figcaption></figure><figure><a href="assets/gallery/smathhacks-staircase.webp"><img src="assets/gallery/smathhacks-staircase.webp" alt="Participants in blue event shirts gathered on a staircase in Morganton." width="1920" height="1280" loading="lazy"></a><figcaption>The Morganton crew</figcaption></figure></div><div class="winners"><h3>Track grand prize winners</h3>{grand}<h3>Track runners-up</h3>{runners}<h3>Special award winners</h3>{special}</div>{ARCHIVED_PRIZES}</section>
      <section id="event-2025" aria-labelledby="event-2025-title"><div class="archive-year-header"><h2 id="event-2025-title">2025</h2><p>SMathHacks</p></div><p>Revisit the projects, workshops, and team-building from another year of hacking at Durham and Morganton.</p><div class="inline-links"><a href="https://sites.google.com/ncssm.edu/smathhacks2025">2025 website ↗</a><a href="https://smathhacks-2025.devpost.com/">2025 projects ↗</a></div>{archive_album(2025)}</section>
      <section id="event-2024" aria-labelledby="event-2024-title"><div class="archive-year-header"><h2 id="event-2024-title">2024</h2><p>SMathHacks</p></div><p>Explore the event website and the projects students brought to life.</p><div class="inline-links"><a href="https://sites.google.com/ncssm.edu/smathhacks-2024">2024 website ↗</a><a href="https://smathhacks-2024.devpost.com/">2024 projects ↗</a></div>{archive_album(2024)}</section>
      <section id="earlier-events" aria-labelledby="earlier-events-title"><h2 id="earlier-events-title">The UniHacks years</h2><p class="section-intro">Where the story began. Browse the original project galleries and the 2023 event website.</p><div class="earlier-year"><h3>2023</h3><div class="inline-links"><a href="https://sites.google.com/ncssm.edu/unihacks-2023">2023 website ↗</a><a href="https://unihacks-2023.devpost.com/">2023 projects ↗</a></div>{archive_album(2023)}</div><div class="earlier-year"><h3>2022</h3><div class="inline-links"><a href="https://unihacks-2022.devpost.com/">2022 projects ↗</a></div>{archive_album(2022)}</div><ul class="archive-earlier"><li><h3>2021</h3><div class="inline-links"><a href="https://unihacks-2021.devpost.com/">Projects ↗</a></div></li><li><h3>2020</h3><div class="inline-links"><a href="https://unihacks.devpost.com/">Projects ↗</a></div></li></ul><p class="archive-source">Earlier event links come from the <a href="https://smathhacks.ncssm.edu/past-events">original Past Events archive</a>. The 2026 winners are recorded on the <a href="https://smathhacks.ncssm.edu/">2026 event website</a>.</p></section>''')

home_path = ROOT / "index.html"
home = home_path.read_text()
home = re.sub(r'<header class="site-header">.*?</header>', header("home"), home, count=1, flags=re.S)
home_path.write_text(home)
print("Rendered three supporting pages and synchronized the homepage header.")
