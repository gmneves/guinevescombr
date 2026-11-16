// Theme toggle (dark/light) compartilhado entre subdominios
const themeBtn = document.getElementById('theme-btn');
if (themeBtn) {
  const setTheme = (theme) => {
    const host = window.location.hostname;
    const domain = host.includes('guineves.com.br') ? '; domain=.guineves.com.br' : '';
    document.cookie = `site_theme=${theme}; path=/${domain}; max-age=31536000; SameSite=Lax`;
    try { localStorage.setItem('theme', theme); } catch(e) {}
  };

  const updateIcon = () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const icon = themeBtn.querySelector('.theme-icon');
    if (icon) icon.textContent = isLight ? '🌙' : '☀️';
  };
  updateIcon();

  themeBtn.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (isLight) {
      document.documentElement.removeAttribute('data-theme');
      setTheme('dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      setTheme('light');
    }
    updateIcon();
  });
}

// Typing effect in the hero prompt
const cmds = ['whoami', 'cat curriculo.md', 'kubectl get skills', 'sudo make coffee ☕'];
const typed = document.getElementById('typed');
let ci = 0, li = 0, del = false;
(function type() {
  const word = cmds[ci];
  typed.textContent = word.slice(0, li);
  if (!del && li++ === word.length) { del = true; return setTimeout(type, 1600); }
  if (del && li-- === 0) { del = false; ci = (ci + 1) % cmds.length; li = 0; }
  setTimeout(type, del ? 40 : 90);
})();

// Reveal on scroll + counters
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    e.target.querySelectorAll('[data-count]').forEach((el) => {
      const end = +el.dataset.count; let n = 0;
      const step = () => { n += Math.ceil(end / 30); el.textContent = Math.min(n, end); if (n < end) requestAnimationFrame(step); };
      step();
    });
    io.unobserve(e.target);
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 70}ms`;
  io.observe(el);
});

// Dynamic years
const now = new Date().getFullYear();
document.getElementById('year').textContent = now;
document.getElementById('uptime').textContent = `${now - 2000} anos em infraestrutura`;
document.querySelector('[data-count="25"]').dataset.count = now - 2000;
document.querySelector('[data-count="15"]').dataset.count = now - 2010;

// Latest posts from blog.guineves.com.br/posts.json
const postsContainer = document.getElementById('latest-posts');
if (postsContainer) {
  fetch('https://blog.guineves.com.br/posts.json')
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then((posts) => {
      if (!Array.isArray(posts) || !posts.length) return;
      postsContainer.innerHTML = '';
      posts.slice(0, 3).forEach((p) => {
        const card = document.createElement('a');
        card.className = 'post-preview glass reveal in';
        card.href = p.url;
        const meta = document.createElement('span');
        meta.className = 'post-date';
        const rt = p.read_time ? ` · ⏱️ ${p.read_time}` : '';
        const tags = Array.isArray(p.tags) && p.tags.length ? ' · ' + p.tags.slice(0, 3).map((t) => `#${t}`).join(' ') : '';
        meta.textContent = `${p.date}${rt}${tags}`;
        const h3 = document.createElement('h3');
        h3.textContent = p.title;
        const desc = document.createElement('p');
        desc.textContent = p.excerpt;
        const more = document.createElement('em');
        more.textContent = 'ler artigo →';
        card.append(meta, h3, desc, more);
        postsContainer.appendChild(card);
      });
    })
    .catch(() => {});
}
