import './styles/main.css';

const sections = document.querySelectorAll<HTMLElement>('.section');
const navLinks = document.querySelectorAll<HTMLAnchorElement>('.nav a');
const nav = document.querySelector<HTMLElement>('.nav');

function switchTab(targetId: string) {
  sections.forEach((s) => s.classList.remove('active'));
  navLinks.forEach((a) => a.classList.remove('active'));

  const target = document.getElementById(targetId);
  const link = document.querySelector<HTMLAnchorElement>(`.nav a[href="#${targetId}"]`);

  if (target) target.classList.add('active');
  if (link) link.classList.add('active');

  // Scroll to top of content area (just below nav)
  if (nav) {
    window.scrollTo({ top: nav.offsetTop, behavior: 'smooth' });
  }
}

// Nav click handler
navLinks.forEach((link) => {
  link.addEventListener('click', (e: Event) => {
    e.preventDefault();
    const href = link.getAttribute('href');
    if (href) {
      const id = href.replace('#', '');
      switchTab(id);
      history.replaceState(null, '', href);
    }
  });
});

// Initialize: use hash or default to first tab
const hash = window.location.hash.replace('#', '');
const initialId = hash && document.getElementById(hash) ? hash : 'overview';
switchTab(initialId);

// Handle browser back/forward
window.addEventListener('hashchange', () => {
  const id = window.location.hash.replace('#', '');
  if (id && document.getElementById(id)) {
    switchTab(id);
  }
});

// Build bottom pagination for each section
const sectionIds = Array.from(sections).map((s) => s.id);

sections.forEach((section, i) => {
  const pager = document.createElement('div');
  pager.className = 'section-pager';

  if (i > 0) {
    const prev = document.createElement('a');
    prev.href = `#${sectionIds[i - 1]}`;
    prev.className = 'pager-btn';
    prev.innerHTML = `<span class="pager-arrow">\u2190</span> \u4e0a\u4e00\u9875`;
    pager.appendChild(prev);
  } else {
    pager.appendChild(document.createElement('span')); // placeholder
  }

  const home = document.createElement('a');
  home.href = '#overview';
  home.className = 'pager-btn pager-home';
  home.textContent = '\u56de\u9996\u9875';
  pager.appendChild(home);

  if (i < sectionIds.length - 1) {
    const next = document.createElement('a');
    next.href = `#${sectionIds[i + 1]}`;
    next.className = 'pager-btn';
    next.innerHTML = `\u4e0b\u4e00\u9875 <span class="pager-arrow">\u2192</span>`;
    pager.appendChild(next);
  } else {
    pager.appendChild(document.createElement('span')); // placeholder
  }

  // Delegate clicks
  pager.querySelectorAll<HTMLAnchorElement>('a').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const id = a.href.split('#')[1];
      switchTab(id);
      history.replaceState(null, '', `#${id}`);
    });
  });

  section.appendChild(pager);
});

// Animate metric bars when they scroll into view within the active section
const metricObserver = new IntersectionObserver(
  (entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target
          .querySelectorAll<HTMLElement>('.metric-bar-fill')
          .forEach((bar) => {
            bar.style.animationPlayState = 'running';
          });
      }
    });
  },
  { threshold: 0.3 }
);

document
  .querySelectorAll<HTMLElement>('.metric-grid')
  .forEach((el) => metricObserver.observe(el));
