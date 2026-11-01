// Event facts and registration state from event-config.json. Independent of the illustration:
// if the hillside fails, the page still shows confirmed details and the right call to action.
import { configureCountdown } from './countdown.js';
import { configureGallery } from './gallery.js';
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

function destination(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value, location.href);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}
function actionLink(label, url) {
  const link = document.createElement('a');
  link.className = 'action-link';
  link.href = url;
  link.textContent = label + ' ↗';
  return link;
}

function updatesForm(endpoint) {
  const form = document.createElement('form');
  form.className = 'updates-form';
  form.innerHTML = '<label for="updates-email">Email address</label><div class="updates-row"><input type="email" id="updates-email" name="email" required autocomplete="email" placeholder="you@example.com"><button class="scene-control" type="submit">Get updates ↗</button></div><p class="form-status" role="status" aria-live="polite"></p>';
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const button = form.querySelector('button'), status = form.querySelector('.form-status');
    button.disabled = true;
    button.textContent = 'Sending…';
    status.textContent = 'Submitting your email…';
    try {
      const result = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.elements.email.value.trim() }),
      });
      if (!result.ok || (await result.json()).success !== true) throw Error('Unconfirmed subscription');
      status.textContent = 'You’re subscribed to event updates.';
      form.reset();
    } catch { status.textContent = 'We couldn’t subscribe you. Please try again.'; }
    finally { button.disabled = false; button.textContent = 'Get updates ↗'; }
  });
  return form;
}

const isEmail = value => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

// Confirmed sponsors only, grouped by `tier` in the order tiers first appear. Each is a logo if
// one is given (its name as alt text), else the name itself; linked when it has a safe URL.
function renderSponsors(config) {
  if (!$('#sponsor-list')) return;
  const entries = Array.isArray(config.sponsors) ? config.sponsors.filter(s => s && typeof s.name === 'string' && s.name.trim()) : [];
  if (entries.length) {
    const list = $('#sponsor-list'), tiers = new Map();
    list.replaceChildren();
    list.hidden = false;
    list.classList.remove('is-placeholder');
    list.removeAttribute('aria-hidden');
    for (const s of entries) {
      const tier = typeof s.tier === 'string' ? s.tier.trim() : '';
      if (!tiers.has(tier)) tiers.set(tier, []);
      tiers.get(tier).push(s);
    }
    for (const [tier, group] of tiers) {
      const block = document.createElement('div'), row = document.createElement('ul');
      block.className = 'sponsor-tier';
      // Match real logos to the same size hierarchy previewed by the placeholder wall.
      const tierName = tier.toLowerCase();
      block.dataset.sponsorLevel = /title|presenting|platinum/.test(tierName) ? 'title'
        : /gold/.test(tierName) ? 'gold'
        : /community|partner|bronze/.test(tierName) ? 'community' : 'silver';
      if (tier) { const heading = document.createElement('h3'); heading.textContent = tier; block.append(heading); }
      for (const s of group) {
        const li = document.createElement('li'), url = destination(s.url), logo = destination(s.logo);
        const tile = document.createElement(url ? 'a' : 'span');
        tile.className = 'sponsor';
        if (url) { tile.href = url; tile.rel = 'noopener'; }
        if (logo) {
          const img = document.createElement('img');
          img.src = logo; img.alt = s.name; img.loading = 'lazy';
          tile.append(img);
        } else tile.textContent = s.name;
        li.append(tile);
        row.append(li);
      }
      block.append(row);
      list.append(block);
    }
    $('#sponsor-status').hidden = true;
    const placeholders = $('[data-sponsor-placeholders]');
    if (placeholders) placeholders.hidden = true;
  }
  const email = isEmail(config.sponsorEmail) ? config.sponsorEmail : isEmail(config.contactEmail) ? config.contactEmail : null;
  if (email) {
    const ask = $('[data-sponsor-ask]');
    ask.hidden = false;
    ask.textContent = entries.length ? 'Want to join them? ' : 'Interested in sponsoring SMathHacks? ';
    ask.append(actionLink('Become a sponsor', 'mailto:' + email));
  }
}

async function applyConfig() {
  const response = await fetch('./event-config.json');
  if (!response.ok) throw Error('Event configuration unavailable');
  const config = await response.json();
  window.eventConfig = config;
  configureCountdown(config);
  configureGallery(config);
  if (typeof config.theme === 'string' && config.theme.trim()) {
    for (const element of $$('[data-event-theme]')) element.textContent = config.theme;
  }

  for (const element of $$('[data-fact]')) {
    const value = config[element.dataset.fact];
    if (typeof value === 'string' && value.trim()) element.textContent = value;
  }

  // Only show an action that actually leads somewhere: register, else updates link, else updates form.
  const registration = destination(config.registrationUrl);
  const updates = destination(config.updatesUrl);
  const endpoint = destination(config.updatesEndpoint);
  if (registration || updates) {
    for (const host of $$('[data-register]')) host.replaceChildren(actionLink(registration ? 'Register' : 'Get updates', registration || updates));
    if (registration) {
      $('[data-application-status]').textContent = 'Applications are open';
      $('[data-application-answer]').textContent = 'Applications are open. Use the Register link to visit the application page.';
    }
  } else if (endpoint) {
    for (const host of $$('[data-register="hero"],[data-register="header"]')) host.replaceChildren(actionLink('Get updates', '#updates'));
    $('[data-register="final"]')?.replaceChildren(updatesForm(endpoint));
  }

  if (Array.isArray(config.schedule)) {
    const list = $('#schedule-list');
    for (const entry of config.schedule) {
      if (typeof entry.time !== 'string' || typeof entry.title !== 'string') continue;
      const item = document.createElement('li'), time = document.createElement('strong'), title = document.createElement('span');
      time.textContent = entry.time;
      title.textContent = entry.title;
      item.append(time, title);
      list.append(item);
    }
    if (list.children.length) { $('#schedule-status').hidden = true; list.hidden = false; }
  }
  if (typeof config.eligibility === 'string' && config.eligibility.trim()) $('[data-eligibility-answer]').textContent = config.eligibility;
  renderSponsors(config);
  if (isEmail(config.contactEmail)) {
    const link = document.createElement('a');
    link.href = 'mailto:' + config.contactEmail;
    link.textContent = 'Contact the organizers';
    $('.site-footer').append(link);
  }
}

applyConfig().catch(error => console.error(error.message));
