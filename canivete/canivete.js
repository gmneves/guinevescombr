/**
 * CANIVETE SUÍÇO OFFLINE — canivete.js
 * 100% Client-Side / Offline Toolkit
 * Autor: Guilherme Neves (guineves.com.br)
 */

(function () {
  'use strict';

  // ==========================================
  // UTILS & CLIPBOARD & TOAST
  // ==========================================
  const toast = document.getElementById('toast-notice');
  let toastTimer = null;

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  function copyToClipboard(text, btn) {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        markCopied(btn);
        showToast('Copiado para a área de transferência! ✓');
      }).catch(() => fallbackCopy(text, btn));
    } else {
      fallbackCopy(text, btn);
    }
  }

  function fallbackCopy(text, btn) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      markCopied(btn);
      showToast('Copiado! ✓');
    } catch (e) {
      alert('Não foi possível copiar automaticamente.');
    }
    document.body.removeChild(ta);
  }

  function markCopied(btn) {
    if (!btn) return;
    const origText = btn.innerHTML;
    btn.classList.add('copied');
    btn.innerHTML = '<span>✓ Copiado!</span>';
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = origText;
    }, 1800);
  }

  // Bind all copy buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.copy-btn');
    if (!btn) return;
    const targetId = btn.getAttribute('data-copy-target');
    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) {
        copyToClipboard(el.textContent || el.value, btn);
      }
    }
  });

  // ==========================================
  // THEME MANAGEMENT (Sincronizado com site)
  // ==========================================
  const themeBtn = document.getElementById('theme-btn');
  if (themeBtn) {
    const setTheme = (theme) => {
      const host = window.location.hostname;
      const domain = host.includes('guineves.com.br') ? '; domain=.guineves.com.br' : '';
      document.cookie = `site_theme=${theme}; path=/${domain}; max-age=31536000; SameSite=Lax`;
      try { localStorage.setItem('theme', theme); } catch (e) {}
    };

    const updateThemeIcon = () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      const icon = themeBtn.querySelector('.theme-icon');
      if (icon) icon.textContent = isLight ? '🌙' : '☀️';
    };
    updateThemeIcon();

    themeBtn.addEventListener('click', () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      if (isLight) {
        document.documentElement.removeAttribute('data-theme');
        setTheme('dark');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        setTheme('light');
      }
      updateThemeIcon();
    });
  }

  // ==========================================
  // SIDEBAR NAVIGATION, SEARCH & FILTER
  // ==========================================
  const toolNavItems = Array.from(document.querySelectorAll('.tool-nav-item'));
  const toolPanels = Array.from(document.querySelectorAll('.tool-panel'));
  const searchInput = document.getElementById('tool-search');
  const catPills = Array.from(document.querySelectorAll('.cat-pill'));
  const sidebar = document.getElementById('tools-sidebar');
  const mobileToggle = document.getElementById('mobile-nav-toggle');

  let activeCategory = 'all';

  function activateTool(toolId, pushState = true) {
    const targetTool = toolNavItems.find(item => item.getAttribute('data-tool') === toolId) || toolNavItems[0];
    if (!targetTool) return;

    const actualId = targetTool.getAttribute('data-tool');

    toolNavItems.forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-tool') === actualId);
    });

    toolPanels.forEach(panel => {
      panel.classList.toggle('active', panel.id === `panel-${actualId}`);
    });

    // Atualizar chips e itens da lista de favoritos
    document.querySelectorAll('.fav-chip').forEach(chip => {
      chip.classList.toggle('active', chip.getAttribute('data-tool') === actualId);
    });
    document.querySelectorAll('#fav-list .tool-nav-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-tool') === actualId);
    });

    if (pushState) {
      history.replaceState(null, '', `#${actualId}`);
    }

    // Fecha sidebar no mobile
    if (sidebar && sidebar.classList.contains('open')) {
      sidebar.classList.remove('open');
    }

    // Scroll top suave
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Click on nav items
  toolNavItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const toolId = item.getAttribute('data-tool');
      activateTool(toolId);
    });
  });

  // Category filter
  catPills.forEach(pill => {
    pill.addEventListener('click', () => {
      catPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.getAttribute('data-cat');
      filterTools();
    });
  });

  // Search input filter
  function filterTools() {
    const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const favs = getFavorites();

    document.querySelectorAll('.category-group').forEach(group => {
      const groupCat = group.getAttribute('data-cat');
      const isFavGroup = group.id === 'fav-group';

      if (activeCategory === 'fav') {
        if (isFavGroup) {
          group.style.display = 'flex';
        } else {
          group.style.display = 'none';
        }
        return;
      }

      if (isFavGroup) {
        // Na categoria "all", a seção de favoritos aparece se não houver busca ativa
        group.style.display = !query ? 'flex' : 'none';
        return;
      }

      let visibleCount = 0;

      group.querySelectorAll('.tool-nav-item').forEach(item => {
        const itemCat = item.getAttribute('data-cat');
        const itemName = item.querySelector('.tool-name').textContent.toLowerCase();
        const itemKeywords = (item.getAttribute('data-keywords') || '').toLowerCase();

        const matchesCat = activeCategory === 'all' || itemCat === activeCategory;
        const matchesQuery = !query || itemName.includes(query) || itemKeywords.includes(query);

        if (matchesCat && matchesQuery) {
          item.style.display = 'flex';
          visibleCount++;
        } else {
          item.style.display = 'none';
        }
      });

      group.style.display = visibleCount > 0 ? 'flex' : 'none';
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterTools);
  }

  // Keyboard shortcut: '/' or 'Ctrl+K' to search, 'Ctrl+B' to toggle sidebar
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      toggleSidebar();
      return;
    }

    if ((e.key === '/' || (e.ctrlKey && e.key.toLowerCase() === 'k')) && document.activeElement !== searchInput) {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      e.preventDefault();
      if (searchInput) {
        if (appContainer && appContainer.classList.contains('sidebar-collapsed')) {
          toggleSidebar(false);
        }
        searchInput.focus();
        searchInput.select();
      }
    } else if (e.key === 'Escape') {
      if (searchInput && document.activeElement === searchInput) {
        searchInput.value = '';
        filterTools();
        searchInput.blur();
      }
      if (sidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
      }
    }
  });

  // Desktop sidebar collapse toggle
  const appContainer = document.querySelector('.app-container');
  const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
  const sidebarCollapseIconBtn = document.getElementById('sidebar-collapse-icon-btn');

  function toggleSidebar(forceState) {
    if (!appContainer) return;
    const isCurrentlyCollapsed = appContainer.classList.contains('sidebar-collapsed');
    const newState = forceState !== undefined ? forceState : !isCurrentlyCollapsed;

    appContainer.classList.toggle('sidebar-collapsed', newState);

    if (sidebarToggleBtn) {
      sidebarToggleBtn.classList.toggle('is-collapsed', newState);
      const icon = sidebarToggleBtn.querySelector('.sidebar-toggle-icon');
      if (icon) icon.textContent = newState ? '▶' : '◀';
      sidebarToggleBtn.setAttribute('title', newState ? 'Expandir menu lateral (Ctrl+B)' : 'Recolher menu lateral (Ctrl+B)');
    }

    try {
      localStorage.setItem('canivete_sidebar_collapsed', newState ? 'true' : 'false');
    } catch (e) {}
  }

  if (sidebarToggleBtn) {
    sidebarToggleBtn.addEventListener('click', () => toggleSidebar());
  }
  if (sidebarCollapseIconBtn) {
    sidebarCollapseIconBtn.addEventListener('click', () => toggleSidebar(true));
  }

  // Restore saved collapse preference on desktop (> 960px)
  try {
    if (window.innerWidth > 960 && localStorage.getItem('canivete_sidebar_collapsed') === 'true') {
      toggleSidebar(true);
    }
  } catch (e) {}

  // Mobile menu toggle
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('open');
    });
  }

  // Fechar sidebar ao clicar fora no mobile
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 960 && sidebar && sidebar.classList.contains('open')) {
      if (!sidebar.contains(e.target) && (!mobileToggle || !mobileToggle.contains(e.target))) {
        sidebar.classList.remove('open');
      }
    }
  });

  // ==========================================
  // SISTEMA DE FAVORITOS (FAVORITES)
  // ==========================================
  const favGroup = document.getElementById('fav-group');
  const favList = document.getElementById('fav-list');
  const favCount = document.getElementById('fav-count');
  const stageFavChips = document.getElementById('stage-fav-chips');

  function getFavorites() {
    try {
      const stored = localStorage.getItem('canivete_favorites');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    // Padrões iniciais demonstrativos
    return ['subnet', 'cron', 'jwt', 'markdown'];
  }

  function saveFavorites(list) {
    try {
      localStorage.setItem('canivete_favorites', JSON.stringify(list));
    } catch (e) {}
    renderFavorites();
  }

  function toggleFavorite(toolId) {
    let favs = getFavorites();
    const idx = favs.indexOf(toolId);
    if (idx !== -1) {
      favs.splice(idx, 1);
      showToast('Removido dos favoritos');
    } else {
      favs.push(toolId);
      showToast('Adicionado aos favoritos! ⭐');
    }
    saveFavorites(favs);
  }

  function renderFavorites() {
    const favs = getFavorites();
    const currentHash = window.location.hash.replace('#', '') || 'subnet';

    // 1. Atualizar contagem
    if (favCount) favCount.textContent = favs.length;

    // 2. Atualizar botões nas barras de título das ferramentas
    document.querySelectorAll('.tool-fav-btn').forEach(btn => {
      const toolId = btn.getAttribute('data-fav-tool');
      const isFav = favs.includes(toolId);
      btn.classList.toggle('is-favorited', isFav);
      const star = btn.querySelector('.fav-star-icon');
      const txt = btn.querySelector('.fav-star-text');
      if (star) star.textContent = isFav ? '★' : '☆';
      if (txt) txt.textContent = isFav ? 'Favoritado' : 'Favoritar';
      btn.setAttribute('title', isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos');
    });

    // 3. Atualizar estrelas na lista da sidebar original
    document.querySelectorAll('.sidebar-groups .category-group:not(.fav-group) .tool-nav-item').forEach(item => {
      const toolId = item.getAttribute('data-tool');
      const star = item.querySelector('.tool-star-btn');
      if (star) {
        const isFav = favs.includes(toolId);
        star.classList.toggle('is-favorited', isFav);
        star.textContent = isFav ? '★' : '☆';
      }
    });

    // 4. Renderizar a lista de favoritos na sidebar
    if (favList) {
      favList.innerHTML = '';
      if (favs.length === 0) {
        favList.innerHTML = '<span class="fav-empty-hint">Nenhuma ferramenta favoritada ainda. Clique na estrela (☆) para fixar atalhos aqui.</span>';
      } else {
        favs.forEach(toolId => {
          const originalItem = document.querySelector(`.sidebar-groups .category-group:not(.fav-group) .tool-nav-item[data-tool="${toolId}"]`);
          if (!originalItem) return;

          const name = originalItem.querySelector('.tool-name').textContent;

          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = `tool-nav-item ${toolId === currentHash ? 'active' : ''}`;
          btn.setAttribute('data-tool', toolId);
          btn.innerHTML = `
            <span class="tool-name">${name}</span>
            <span class="tool-star-btn is-favorited" title="Remover dos favoritos">★</span>
          `;

          btn.addEventListener('click', (e) => {
            e.preventDefault();
            activateTool(toolId);
          });

          btn.querySelector('.tool-star-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            toggleFavorite(toolId);
          });

          favList.appendChild(btn);
        });
      }
    }

    // 5. Renderizar os chips de favoritos no topo do stage
    if (stageFavChips) {
      stageFavChips.innerHTML = '';
      if (favs.length === 0) {
        stageFavChips.innerHTML = '<span class="fav-empty-hint" style="padding:0;">Clique na estrela (☆) de uma ferramenta para fixar um atalho rápido aqui.</span>';
      } else {
        favs.forEach(toolId => {
          const originalItem = document.querySelector(`.sidebar-groups .category-group:not(.fav-group) .tool-nav-item[data-tool="${toolId}"]`);
          if (!originalItem) return;

          const name = originalItem.querySelector('.tool-name').textContent.split('(')[0].trim();

          const chip = document.createElement('button');
          chip.type = 'button';
          chip.className = `fav-chip ${toolId === currentHash ? 'active' : ''}`;
          chip.setAttribute('data-tool', toolId);
          chip.innerHTML = `<span>${name}</span>`;

          chip.addEventListener('click', () => {
            activateTool(toolId);
          });

          stageFavChips.appendChild(chip);
        });
      }
    }
  }

  function initFavorites() {
    // Injetar botões de favoritar nos títulos de todas as ferramentas
    document.querySelectorAll('.tool-panel').forEach(panel => {
      const titleRow = panel.querySelector('.tool-title-row');
      if (!titleRow) return;
      const toolId = panel.id.replace('panel-', '');

      if (!titleRow.querySelector('.tool-fav-btn')) {
        const favBtn = document.createElement('button');
        favBtn.type = 'button';
        favBtn.className = 'tool-fav-btn';
        favBtn.setAttribute('data-fav-tool', toolId);
        favBtn.innerHTML = '<span class="fav-star-icon">☆</span> <span class="fav-star-text">Favoritar</span>';
        favBtn.addEventListener('click', (e) => {
          e.preventDefault();
          toggleFavorite(toolId);
        });
        titleRow.appendChild(favBtn);
      }
    });

    // Injetar estrelas em todos os itens da sidebar original
    document.querySelectorAll('.sidebar-groups .category-group:not(.fav-group) .tool-nav-item').forEach(item => {
      const toolId = item.getAttribute('data-tool');
      if (!item.querySelector('.tool-star-btn')) {
        const star = document.createElement('span');
        star.className = 'tool-star-btn';
        star.innerHTML = '☆';
        star.setAttribute('title', 'Favoritar ferramenta');
        star.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          toggleFavorite(toolId);
        });
        item.appendChild(star);
      }
    });

    renderFavorites();
  }

  // Initial routing via Hash
  function handleHash() {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      activateTool(hash, false);
    } else {
      activateTool('subnet', false);
    }
  }
  window.addEventListener('hashchange', handleHash);

  // Subtabs within tools
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.subtab-btn');
    if (!btn) return;
    const container = btn.closest('.tool-panel');
    if (!container) return;
    const targetTab = btn.getAttribute('data-tab');

    container.querySelectorAll('.subtab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    container.querySelectorAll('.subtab-content').forEach(c => {
      c.style.display = c.getAttribute('data-tab-content') === targetTab ? 'block' : 'none';
    });
  });

  // ==========================================
  // FERRAMENTA 1: CALCULADORA DE SUB-REDES IP
  // ==========================================
  const subnetInput = document.getElementById('subnet-input');
  const subnetMaskSelect = document.getElementById('subnet-mask-select');

  function updateSubnet() {
    const raw = (subnetInput.value || '').trim();
    if (!raw) return;

    if (raw.includes(':')) {
      calcIPv6(raw);
    } else {
      calcIPv4(raw);
    }
  }

  function calcIPv4(raw) {
    document.getElementById('subnet-v4-card').style.display = 'block';
    document.getElementById('subnet-v6-card').style.display = 'none';

    let [ipStr, cidrStr] = raw.split('/');
    let cidr = cidrStr ? parseInt(cidrStr, 10) : parseInt(subnetMaskSelect.value, 10);
    if (isNaN(cidr) || cidr < 0 || cidr > 32) cidr = 24;

    const parts = ipStr.split('.').map(p => parseInt(p, 10));
    if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
      document.getElementById('subnet-v4-results').innerHTML = '<p class="m" style="color:var(--amber);">⚠️ Endereço IPv4 inválido (ex: 192.168.1.50/24)</p>';
      return;
    }

    subnetMaskSelect.value = String(cidr);

    const ip = ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
    const mask = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
    const wildcard = ~mask >>> 0;
    const network = (ip & mask) >>> 0;
    const broadcast = (network | wildcard) >>> 0;

    const numToIp = (num) => [
      (num >>> 24) & 255,
      (num >>> 16) & 255,
      (num >>> 8) & 255,
      num & 255
    ].join('.');

    const totalIps = Math.pow(2, 32 - cidr);
    let usableHosts = 0;
    let firstHost = '-';
    let lastHost = '-';

    if (cidr === 32) {
      usableHosts = 1;
      firstHost = numToIp(ip);
      lastHost = numToIp(ip);
    } else if (cidr === 31) {
      usableHosts = 2; // RFC 3021
      firstHost = numToIp(network);
      lastHost = numToIp(broadcast);
    } else {
      usableHosts = totalIps - 2;
      firstHost = numToIp(network + 1);
      lastHost = numToIp(broadcast - 1);
    }

    // Classe e Tipo
    const firstOctet = parts[0];
    let ipClass = 'A';
    if (firstOctet >= 128 && firstOctet <= 191) ipClass = 'B';
    else if (firstOctet >= 192 && firstOctet <= 223) ipClass = 'C';
    else if (firstOctet >= 224 && firstOctet <= 239) ipClass = 'D (Multicast)';
    else if (firstOctet >= 240) ipClass = 'E (Reservado)';

    let ipScope = 'Público na Internet';
    if (parts[0] === 10) ipScope = 'Privado RFC 1918 (10.0.0.0/8)';
    else if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ipScope = 'Privado RFC 1918 (172.16.0.0/12)';
    else if (parts[0] === 192 && parts[1] === 168) ipScope = 'Privado RFC 1918 (192.168.0.0/16)';
    else if (parts[0] === 127) ipScope = 'Loopback (127.0.0.0/8)';
    else if (parts[0] === 169 && parts[1] === 254) ipScope = 'Link-Local / APIPA (169.254.0.0/16)';
    else if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) ipScope = 'CGNAT (100.64.0.0/10)';

    // Binary breakdown
    const ipBin = parts.map(p => p.toString(2).padStart(8, '0')).join('.');
    const maskParts = numToIp(mask).split('.').map(p => parseInt(p, 10));
    const maskBin = maskParts.map(p => p.toString(2).padStart(8, '0')).join('.');

    const html = `
      <table class="info-table">
        <tr><td class="key">Endereço IP</td><td class="val"><code>${numToIp(ip)}</code> <span class="badge badge-cyan">/${cidr}</span></td></tr>
        <tr><td class="key">Máscara de Rede</td><td class="val"><code>${numToIp(mask)}</code></td></tr>
        <tr><td class="key">Máscara Wildcard (Inversa)</td><td class="val"><code>${numToIp(wildcard)}</code></td></tr>
        <tr><td class="key">Endereço de Rede</td><td class="val"><code>${numToIp(network)}/${cidr}</code></td></tr>
        <tr><td class="key">Primeiro Host Útil</td><td class="val"><code>${firstHost}</code></td></tr>
        <tr><td class="key">Último Host Útil</td><td class="val"><code>${lastHost}</code></td></tr>
        <tr><td class="key">Endereço de Broadcast</td><td class="val"><code>${cidr >= 31 ? 'N/A (Ponto a ponto)' : numToIp(broadcast)}</code></td></tr>
        <tr><td class="key">Total de IPs no Bloco</td><td class="val"><strong>${totalIps.toLocaleString('pt-BR')}</strong></td></tr>
        <tr><td class="key">Hosts Úteis Utilizáveis</td><td class="val"><strong style="color:var(--green);">${usableHosts.toLocaleString('pt-BR')}</strong></td></tr>
        <tr><td class="key">Classe / Categoria</td><td class="val">Classe ${ipClass} · <span class="badge badge-green">${ipScope}</span></td></tr>
        <tr><td class="key">Binário (IP)</td><td class="val"><code style="font-size:0.75rem;">${ipBin}</code></td></tr>
        <tr><td class="key">Binário (Máscara)</td><td class="val"><code style="font-size:0.75rem;">${maskBin}</code></td></tr>
      </table>
    `;
    document.getElementById('subnet-v4-results').innerHTML = html;
  }

  function calcIPv6(raw) {
    document.getElementById('subnet-v4-card').style.display = 'none';
    document.getElementById('subnet-v6-card').style.display = 'block';

    let [ipStr, prefixStr] = raw.split('/');
    let prefix = prefixStr ? parseInt(prefixStr, 10) : 64;
    if (isNaN(prefix) || prefix < 0 || prefix > 128) prefix = 64;

    try {
      // Expand IPv6
      let parts = ipStr.split('::');
      let left = parts[0] ? parts[0].split(':') : [];
      let right = parts[1] ? parts[1].split(':') : [];
      let missing = 8 - (left.length + right.length);
      if (parts.length === 1) missing = 0;
      let full = [...left, ...Array(missing).fill('0'), ...right];
      let expanded = full.map(g => (g || '0').padStart(4, '0')).join(':');

      // Canonical compressed (RFC 5952)
      let hexList = expanded.split(':');
      let hexShort = hexList.map(h => parseInt(h, 16).toString(16));
      let compressed = hexShort.join(':').replace(/(^|:)0(:0)+(:|$)/, '::');

      let scope = 'Global Unicast';
      if (expanded.startsWith('fe80')) scope = 'Link-Local (fe80::/10)';
      else if (expanded.startsWith('fc') || expanded.startsWith('fd')) scope = 'Unique Local / ULA (fc00::/7)';
      else if (expanded === '0000:0000:0000:0000:0000:0000:0000:0001') scope = 'Loopback (::1/128)';
      else if (expanded.startsWith('ff')) scope = 'Multicast (ff00::/8)';

      const totalAddresses = 2n ** BigInt(128 - prefix);

      const html = `
        <table class="info-table">
          <tr><td class="key">IPv6 Comprimido (Canônico)</td><td class="val"><code>${compressed}</code> <span class="badge badge-cyan">/${prefix}</span></td></tr>
          <tr><td class="key">IPv6 Expandido (Full)</td><td class="val"><code style="font-size:0.75rem;">${expanded}</code></td></tr>
          <tr><td class="key">Prefixo CIDR</td><td class="val">/${prefix}</td></tr>
          <tr><td class="key">Escopo / Tipo</td><td class="val"><span class="badge badge-green">${scope}</span></td></tr>
          <tr><td class="key">Total de Endereços</td><td class="val"><strong>${totalAddresses.toString()}</strong></td></tr>
        </table>
      `;
      document.getElementById('subnet-v6-results').innerHTML = html;
    } catch (e) {
      document.getElementById('subnet-v6-results').innerHTML = '<p class="m" style="color:var(--amber);">⚠️ Endereço IPv6 inválido</p>';
    }
  }

  if (subnetInput) {
    subnetInput.addEventListener('input', updateSubnet);
    if (subnetMaskSelect) subnetMaskSelect.addEventListener('change', () => {
      let val = subnetInput.value.split('/')[0];
      subnetInput.value = `${val}/${subnetMaskSelect.value}`;
      updateSubnet();
    });
  }

  // ==========================================
  // FERRAMENTA 2: GERADOR DE REGRAS DE FIREWALL
  // ==========================================
  const fwAction = document.getElementById('fw-action');
  const fwChain = document.getElementById('fw-chain');
  const fwProto = document.getElementById('fw-proto');
  const fwPort = document.getElementById('fw-port');
  const fwSrc = document.getElementById('fw-src');
  const fwDst = document.getElementById('fw-dst');
  const fwInterface = document.getElementById('fw-iface');
  const fwComment = document.getElementById('fw-comment');
  const fwRate = document.getElementById('fw-rate');

  function updateFirewall() {
    const action = fwAction.value; // ACCEPT, DROP, REJECT
    const chain = fwChain.value; // INPUT, OUTPUT, FORWARD
    const proto = fwProto.value; // tcp, udp, icmp, all
    const port = (fwPort.value || '').trim();
    const src = (fwSrc.value || '').trim();
    const dst = (fwDst.value || '').trim();
    const iface = (fwInterface.value || '').trim();
    const comment = (fwComment.value || '').trim();
    const rate = (fwRate.value || '').trim();

    // IPTABLES
    let ipt = `iptables -A ${chain}`;
    if (iface) ipt += ` -i ${iface}`;
    if (proto !== 'all') ipt += ` -p ${proto}`;
    if (src && src !== 'any') ipt += ` -s ${src}`;
    if (dst && dst !== 'any') ipt += ` -d ${dst}`;
    if (port && proto !== 'all' && proto !== 'icmp') {
      if (port.includes(',') || port.includes(':')) {
        ipt += ` -m multiport --dports ${port}`;
      } else {
        ipt += ` --dport ${port}`;
      }
    }
    if (rate) ipt += ` -m limit --limit ${rate}`;
    if (comment) ipt += ` -m comment --comment "${comment.replace(/"/g, '')}"`;
    ipt += ` -j ${action}`;

    // NFTABLES
    let nftChain = chain.toLowerCase();
    let nft = `nft add rule inet filter ${nftChain}`;
    if (iface) nft += ` iif "${iface}"`;
    if (src && src !== 'any') nft += ` ip saddr ${src}`;
    if (dst && dst !== 'any') nft += ` ip daddr ${dst}`;
    if (proto !== 'all') nft += ` ${proto}`;
    if (port && proto !== 'all' && proto !== 'icmp') {
      if (port.includes(',')) nft += ` dport { ${port} }`;
      else if (port.includes(':')) nft += ` dport ${port.replace(':', '-')}`;
      else nft += ` dport ${port}`;
    }
    if (rate) nft += ` limit rate ${rate}`;
    nft += ` ${action.toLowerCase()}`;
    if (comment) nft += ` comment "${comment.replace(/"/g, '')}"`;

    // FIREWALL-CMD (firewalld)
    let fwd = '';
    if (port && !src && !dst && action === 'ACCEPT') {
      fwd = `firewall-cmd --permanent --add-port=${port}/${proto}\nfirewall-cmd --reload`;
    } else {
      let rich = `rule`;
      if (src && src !== 'any') rich += ` family="ipv4" source address="${src}"`;
      if (port && proto !== 'all') rich += ` port port="${port}" protocol="${proto}"`;
      if (proto !== 'all' && !port) rich += ` protocol value="${proto}"`;
      rich += ` ${action.toLowerCase()}`;
      fwd = `firewall-cmd --permanent --add-rich-rule='${rich}'\nfirewall-cmd --reload`;
    }

    // UFW
    let ufwAction = action === 'ACCEPT' ? 'allow' : (action === 'DROP' ? 'deny' : 'reject');
    let ufw = `ufw ${ufwAction}`;
    if (iface) ufw += ` in on ${iface}`;
    if (src && src !== 'any') ufw += ` from ${src}`;
    else ufw += ` from any`;
    if (port) ufw += ` to any port ${port}`;
    if (proto !== 'all') ufw += ` proto ${proto}`;
    if (comment) ufw += ` comment '${comment.replace(/'/g, '')}'`;

    document.getElementById('out-fw-iptables').textContent = ipt;
    document.getElementById('out-fw-nftables').textContent = nft;
    document.getElementById('out-fw-firewalld').textContent = fwd;
    document.getElementById('out-fw-ufw').textContent = ufw;
  }

  [fwAction, fwChain, fwProto, fwPort, fwSrc, fwDst, fwInterface, fwComment, fwRate].forEach(el => {
    if (el) el.addEventListener('input', updateFirewall);
  });

  // ==========================================
  // FERRAMENTA 3: CONVERSOR DE PERMISSÕES LINUX (chmod)
  // ==========================================
  const chmodOctal = document.getElementById('chmod-octal');
  const chmodSymbolic = document.getElementById('chmod-symbolic');

  const chmodBoxes = {
    suid: document.getElementById('chmod-suid'),
    sgid: document.getElementById('chmod-sgid'),
    sticky: document.getElementById('chmod-sticky'),
    ur: document.getElementById('chmod-ur'),
    uw: document.getElementById('chmod-uw'),
    ux: document.getElementById('chmod-ux'),
    gr: document.getElementById('chmod-gr'),
    gw: document.getElementById('chmod-gw'),
    gx: document.getElementById('chmod-gx'),
    or: document.getElementById('chmod-or'),
    ow: document.getElementById('chmod-ow'),
    ox: document.getElementById('chmod-ox')
  };

  function updateChmodFromBoxes() {
    let special = 0;
    if (chmodBoxes.suid && chmodBoxes.suid.checked) special += 4;
    if (chmodBoxes.sgid && chmodBoxes.sgid.checked) special += 2;
    if (chmodBoxes.sticky && chmodBoxes.sticky.checked) special += 1;

    let u = (chmodBoxes.ur.checked ? 4 : 0) + (chmodBoxes.uw.checked ? 2 : 0) + (chmodBoxes.ux.checked ? 1 : 0);
    let g = (chmodBoxes.gr.checked ? 4 : 0) + (chmodBoxes.gw.checked ? 2 : 0) + (chmodBoxes.gx.checked ? 1 : 0);
    let o = (chmodBoxes.or.checked ? 4 : 0) + (chmodBoxes.ow.checked ? 2 : 0) + (chmodBoxes.ox.checked ? 1 : 0);

    const octal3 = `${u}${g}${o}`;
    const octal4 = `${special}${u}${g}${o}`;
    chmodOctal.value = special > 0 ? octal4 : octal3;

    // Symbolic string
    let uStr = (chmodBoxes.ur.checked ? 'r' : '-') + (chmodBoxes.uw.checked ? 'w' : '-') +
      (chmodBoxes.suid && chmodBoxes.suid.checked ? (chmodBoxes.ux.checked ? 's' : 'S') : (chmodBoxes.ux.checked ? 'x' : '-'));
    let gStr = (chmodBoxes.gr.checked ? 'r' : '-') + (chmodBoxes.gw.checked ? 'w' : '-') +
      (chmodBoxes.sgid && chmodBoxes.sgid.checked ? (chmodBoxes.gx.checked ? 's' : 'S') : (chmodBoxes.gx.checked ? 'x' : '-'));
    let oStr = (chmodBoxes.or.checked ? 'r' : '-') + (chmodBoxes.ow.checked ? 'w' : '-') +
      (chmodBoxes.sticky && chmodBoxes.sticky.checked ? (chmodBoxes.ox.checked ? 't' : 'T') : (chmodBoxes.ox.checked ? 'x' : '-'));

    chmodSymbolic.value = `${uStr}${gStr}${oStr}`;

    updateChmodExplanation(u, g, o, special);
  }

  function updateChmodFromOctal() {
    let val = (chmodOctal.value || '').trim();
    if (!/^[0-7]{3,4}$/.test(val)) return;

    let special = 0, u = 0, g = 0, o = 0;
    if (val.length === 4) {
      special = parseInt(val[0], 8);
      u = parseInt(val[1], 8);
      g = parseInt(val[2], 8);
      o = parseInt(val[3], 8);
    } else {
      u = parseInt(val[0], 8);
      g = parseInt(val[1], 8);
      o = parseInt(val[2], 8);
    }

    if (chmodBoxes.suid) chmodBoxes.suid.checked = !!(special & 4);
    if (chmodBoxes.sgid) chmodBoxes.sgid.checked = !!(special & 2);
    if (chmodBoxes.sticky) chmodBoxes.sticky.checked = !!(special & 1);

    chmodBoxes.ur.checked = !!(u & 4);
    chmodBoxes.uw.checked = !!(u & 2);
    chmodBoxes.ux.checked = !!(u & 1);

    chmodBoxes.gr.checked = !!(g & 4);
    chmodBoxes.gw.checked = !!(g & 2);
    chmodBoxes.gx.checked = !!(g & 1);

    chmodBoxes.or.checked = !!(o & 4);
    chmodBoxes.ow.checked = !!(o & 2);
    chmodBoxes.ox.checked = !!(o & 1);

    updateChmodFromBoxes();
  }

  function updateChmodFromSymbolic() {
    let s = (chmodSymbolic.value || '').trim().replace(/^[-dcb]/, ''); // remove file type if any
    if (s.length !== 9) return;

    if (chmodBoxes.ur) chmodBoxes.ur.checked = s[0] === 'r';
    if (chmodBoxes.uw) chmodBoxes.uw.checked = s[1] === 'w';
    if (chmodBoxes.ux) chmodBoxes.ux.checked = s[2] === 'x' || s[2] === 's';
    if (chmodBoxes.suid) chmodBoxes.suid.checked = s[2] === 's' || s[2] === 'S';

    if (chmodBoxes.gr) chmodBoxes.gr.checked = s[3] === 'r';
    if (chmodBoxes.gw) chmodBoxes.gw.checked = s[4] === 'w';
    if (chmodBoxes.gx) chmodBoxes.gx.checked = s[5] === 'x' || s[5] === 's';
    if (chmodBoxes.sgid) chmodBoxes.sgid.checked = s[5] === 's' || s[5] === 'S';

    if (chmodBoxes.or) chmodBoxes.or.checked = s[6] === 'r';
    if (chmodBoxes.ow) chmodBoxes.ow.checked = s[7] === 'w';
    if (chmodBoxes.ox) chmodBoxes.ox.checked = s[8] === 'x' || s[8] === 't';
    if (chmodBoxes.sticky) chmodBoxes.sticky.checked = s[8] === 't' || s[8] === 'T';

    updateChmodFromBoxes();
  }

  function updateChmodExplanation(u, g, o, special) {
    const permText = (val) => {
      let res = [];
      if (val & 4) res.push('ler (r)');
      if (val & 2) res.push('gravar (w)');
      if (val & 1) res.push('executar (x)');
      return res.length ? res.join(', ') : 'sem permissões';
    };

    let exp = `• <strong>Usuário (Owner):</strong> ${permText(u)}.\n`;
    exp += `• <strong>Grupo (Group):</strong> ${permText(g)}.\n`;
    exp += `• <strong>Outros (Others):</strong> ${permText(o)}.\n`;
    if (special > 0) {
      exp += `• <strong>Bits Especiais:</strong> `;
      let s = [];
      if (special & 4) s.push('SUID (executa com privilégios do dono)');
      if (special & 2) s.push('SGID (herda grupo no diretório ou executa com grupo)');
      if (special & 1) s.push('Sticky Bit (somente o dono pode apagar arquivos na pasta)');
      exp += s.join(', ') + '.\n';
    }

    const octalVal = chmodOctal.value;
    const cmdFile = `chmod ${octalVal} arquivo.txt`;
    const cmdRec = `chmod -R ${octalVal} /caminho/pasta`;

    document.getElementById('chmod-explanation').innerHTML = exp;
    document.getElementById('out-chmod-cmd').textContent = `${cmdFile}\n${cmdRec}`;
  }

  Object.values(chmodBoxes).forEach(box => {
    if (box) box.addEventListener('change', updateChmodFromBoxes);
  });
  if (chmodOctal) chmodOctal.addEventListener('input', updateChmodFromOctal);
  if (chmodSymbolic) chmodSymbolic.addEventListener('input', updateChmodFromSymbolic);

  // Chmod Preset chips
  document.querySelectorAll('[data-chmod-preset]').forEach(chip => {
    chip.addEventListener('click', () => {
      chmodOctal.value = chip.getAttribute('data-chmod-preset');
      updateChmodFromOctal();
    });
  });

  // ==========================================
  // FERRAMENTA 4: CALCULADOR DE BANDA E TRANSFERÊNCIA
  // ==========================================
  const bwSizeVal = document.getElementById('bw-size-val');
  const bwSizeUnit = document.getElementById('bw-size-unit');
  const bwSpeedVal = document.getElementById('bw-speed-val');
  const bwSpeedUnit = document.getElementById('bw-speed-unit');
  const bwOverhead = document.getElementById('bw-overhead');

  function updateBandwidth() {
    const size = parseFloat(bwSizeVal.value) || 0;
    const sizeUnit = bwSizeUnit.value;
    const speed = parseFloat(bwSpeedVal.value) || 0;
    const speedUnit = bwSpeedUnit.value;
    const overhead = parseFloat(bwOverhead.value) || 0;

    // Convert file size to Bytes
    const sizeMultipliers = {
      B: 1,
      KB: 1e3,
      MB: 1e6,
      GB: 1e9,
      TB: 1e12,
      KiB: 1024,
      MiB: 1024 ** 2,
      GiB: 1024 ** 3,
      TiB: 1024 ** 4
    };
    const totalBytes = size * (sizeMultipliers[sizeUnit] || 1);
    const totalBits = totalBytes * 8;

    // Convert speed to bits per second
    const speedMultipliers = {
      bps: 1,
      Kbps: 1e3,
      Mbps: 1e6,
      Gbps: 1e9,
      Bps: 8,
      KBps: 8e3,
      MBps: 8e6,
      GBps: 8e9
    };
    const speedBps = speed * (speedMultipliers[speedUnit] || 1);

    if (speedBps <= 0 || totalBits <= 0) {
      document.getElementById('bw-time-result').innerHTML = '<p class="m">Informe valores maiores que zero para calcular.</p>';
      return;
    }

    // Effective speed with overhead
    const effectiveBps = speedBps * (1 - overhead / 100);
    const totalSeconds = totalBits / effectiveBps;

    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    let formatted = [];
    if (days > 0) formatted.push(`${days}d`);
    if (hours > 0 || days > 0) formatted.push(`${hours}h`);
    if (minutes > 0 || hours > 0 || days > 0) formatted.push(`${minutes}min`);
    formatted.push(`${seconds}s`);

    // Speed unit conversions table
    const tableHtml = `
      <div style="font-size:1.6rem; font-weight:800; color:var(--green); margin-bottom:0.75rem;">
        ⏱️ ${formatted.join(' ')}
      </div>
      <table class="info-table">
        <tr><td class="key">Tamanho Total</td><td class="val">${size} ${sizeUnit} (${(totalBytes / 1e9).toFixed(2)} GB / ${(totalBytes / (1024 ** 3)).toFixed(2)} GiB)</td></tr>
        <tr><td class="key">Taxa em MegaBytes/s</td><td class="val"><strong>${(effectiveBps / 8e6).toFixed(2)} MB/s</strong></td></tr>
        <tr><td class="key">Taxa em Megabits/s</td><td class="val">${(effectiveBps / 1e6).toFixed(2)} Mbps</td></tr>
        <tr><td class="key">Overhead descontado</td><td class="val">${overhead}% (${(speedBps / 1e6).toFixed(2)} Mbps nominais)</td></tr>
        <tr><td class="key">Volume por Hora</td><td class="val">${((effectiveBps / 8 * 3600) / 1e9).toFixed(2)} GB / hora</td></tr>
      </table>
    `;
    document.getElementById('bw-time-result').innerHTML = tableHtml;
  }

  [bwSizeVal, bwSizeUnit, bwSpeedVal, bwSpeedUnit, bwOverhead].forEach(el => {
    if (el) el.addEventListener('input', updateBandwidth);
  });

  // ==========================================
  // FERRAMENTA 5: GERADOR E TRADUTOR DE CRON
  // ==========================================
  const cronInput = document.getElementById('cron-input');
  const cronMin = document.getElementById('cron-f-min');
  const cronHour = document.getElementById('cron-f-hour');
  const cronDom = document.getElementById('cron-f-dom');
  const cronMonth = document.getElementById('cron-f-month');
  const cronDow = document.getElementById('cron-f-dow');

  function updateCronFromFields() {
    const expr = `${cronMin.value.trim() || '*'} ${cronHour.value.trim() || '*'} ${cronDom.value.trim() || '*'} ${cronMonth.value.trim() || '*'} ${cronDow.value.trim() || '*'}`;
    cronInput.value = expr;
    translateCron(expr);
  }

  function updateCronFromInput() {
    const parts = cronInput.value.trim().split(/\s+/);
    if (parts.length === 5) {
      cronMin.value = parts[0];
      cronHour.value = parts[1];
      cronDom.value = parts[2];
      cronMonth.value = parts[3];
      cronDow.value = parts[4];
    }
    translateCron(cronInput.value.trim());
  }

  function translateCron(expr) {
    const parts = expr.split(/\s+/);
    if (parts.length !== 5) {
      document.getElementById('cron-translation').innerHTML = '<span style="color:var(--amber);">⚠️ Expressão inválida (requer 5 campos: minuto hora dia mês dia-da-semana)</span>';
      document.getElementById('cron-next-runs').innerHTML = '';
      return;
    }

    const [m, h, dom, mon, dow] = parts;
    let desc = [];

    // Minuto
    if (m === '*') desc.push('A cada minuto');
    else if (m.startsWith('*/')) desc.push(`A cada ${m.slice(2)} minutos`);
    else desc.push(`No minuto ${m}`);

    // Hora
    if (h === '*') {
      if (!m.includes('*')) desc.push('de cada hora');
    } else if (h.startsWith('*/')) {
      desc.push(`a cada ${h.slice(2)} horas`);
    } else if (h.includes('-')) {
      desc.push(`entre as horas ${h}`);
    } else {
      desc.push(`às ${h.padStart(2, '0')}:${m.padStart(2, '0')}h`);
    }

    // Dia do mês
    if (dom !== '*') {
      desc.push(`no dia ${dom} do mês`);
    }

    // Mês
    const monthNames = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    if (mon !== '*') {
      desc.push(`em ${monthNames[parseInt(mon, 10)] || mon}`);
    }

    // Dia da semana
    const dowNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    if (dow === '1-5') desc.push('em dias úteis (segunda a sexta)');
    else if (dow === '0,6' || dow === '6,0') desc.push('nos fins de semana');
    else if (dow !== '*') {
      desc.push(`no(s) dia(s) ${dow.split(',').map(d => dowNames[parseInt(d, 10)] || d).join(', ')}`);
    }

    document.getElementById('cron-translation').innerHTML = `💬 <strong>Tradução:</strong> ${desc.join(' ')}.`;

    // Calcula próximas 5 execuções (estimativa segura)
    calculateNextCronRuns(m, h, dom, mon, dow);
  }

  function calculateNextCronRuns(m, h, dom, mon, dow) {
    const list = [];
    let cur = new Date();
    cur.setSeconds(0);
    cur.setMilliseconds(0);

    // Incrementa 1 minuto para não pegar o atual se já passou
    cur.setMinutes(cur.getMinutes() + 1);

    const matchPart = (val, pattern, max) => {
      if (pattern === '*') return true;
      if (pattern.startsWith('*/')) {
        const step = parseInt(pattern.slice(2), 10);
        return val % step === 0;
      }
      if (pattern.includes(',')) {
        return pattern.split(',').map(Number).includes(val);
      }
      if (pattern.includes('-')) {
        const [start, end] = pattern.split('-').map(Number);
        return val >= start && val <= end;
      }
      return parseInt(pattern, 10) === val;
    };

    let attempts = 0;
    while (list.length < 5 && attempts < 50000) {
      attempts++;
      const minMatch = matchPart(cur.getMinutes(), m, 59);
      const hourMatch = matchPart(cur.getHours(), h, 23);
      const domMatch = matchPart(cur.getDate(), dom, 31);
      const monMatch = matchPart(cur.getMonth() + 1, mon, 12);
      const dowMatch = matchPart(cur.getDay(), dow, 6);

      if (minMatch && hourMatch && domMatch && monMatch && dowMatch) {
        list.push(new Date(cur));
      }
      cur.setMinutes(cur.getMinutes() + 1);
    }

    if (list.length) {
      const items = list.map(d => {
        const dateStr = d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
        const timeStr = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        return `<li>📅 <code>${dateStr} às ${timeStr}</code></li>`;
      }).join('');
      document.getElementById('cron-next-runs').innerHTML = `<ul style="list-style:none; padding-left:0; line-height:1.7;">${items}</ul>`;
    } else {
      document.getElementById('cron-next-runs').innerHTML = '<span class="m">Nenhuma execução encontrada no intervalo de busca.</span>';
    }
  }

  [cronMin, cronHour, cronDom, cronMonth, cronDow].forEach(el => {
    if (el) el.addEventListener('input', updateCronFromFields);
  });
  if (cronInput) cronInput.addEventListener('input', updateCronFromInput);

  // Cron Presets
  document.querySelectorAll('[data-cron-preset]').forEach(chip => {
    chip.addEventListener('click', () => {
      cronInput.value = chip.getAttribute('data-cron-preset');
      updateCronFromInput();
    });
  });

  // ==========================================
  // FERRAMENTA 6: CONSTRUTOR DE FIND E XARGS
  // ==========================================
  const findPath = document.getElementById('find-path');
  const findType = document.getElementById('find-type');
  const findName = document.getElementById('find-name');
  const findSize = document.getElementById('find-size');
  const findTime = document.getElementById('find-time');
  const findPerm = document.getElementById('find-perm');
  const findMaxdepth = document.getElementById('find-maxdepth');
  const findAction = document.getElementById('find-action');
  const findUseXargs = document.getElementById('find-use-xargs');
  const xargsParallel = document.getElementById('xargs-parallel');
  const xargsCmd = document.getElementById('xargs-cmd');

  function updateFindXargs() {
    const path = (findPath.value || '.').trim();
    let parts = ['find', path];

    if (findMaxdepth.value) parts.push(`-maxdepth ${findMaxdepth.value}`);
    if (findType.value) parts.push(`-type ${findType.value}`);
    if (findName.value.trim()) parts.push(`-name "${findName.value.trim()}"`);
    if (findSize.value.trim()) parts.push(`-size ${findSize.value.trim()}`);
    if (findTime.value.trim()) parts.push(`-mtime ${findTime.value.trim()}`);
    if (findPerm.value.trim()) parts.push(`-perm ${findPerm.value.trim()}`);

    const useXargs = findUseXargs.checked;
    let finalCmd = '';

    if (useXargs) {
      parts.push('-print0');
      let xargsParts = ['xargs', '-0'];
      if (xargsParallel.value && xargsParallel.value !== '1') {
        xargsParts.push(`-P ${xargsParallel.value}`);
      }
      const xCmd = (xargsCmd.value || 'rm -f').trim();
      xargsParts.push(xCmd);
      finalCmd = `${parts.join(' ')} | ${xargsParts.join(' ')}`;
    } else {
      if (findAction.value) parts.push(findAction.value);
      finalCmd = parts.join(' ');
    }

    document.getElementById('out-find-cmd').textContent = finalCmd;
  }

  [findPath, findType, findName, findSize, findTime, findPerm, findMaxdepth, findAction, findUseXargs, xargsParallel, xargsCmd].forEach(el => {
    if (el) el.addEventListener('input', updateFindXargs);
  });

  // Presets para Find/Xargs
  document.querySelectorAll('[data-find-preset]').forEach(chip => {
    chip.addEventListener('click', () => {
      const p = chip.getAttribute('data-find-preset');
      if (p === 'old-logs') {
        findPath.value = '/var/log';
        findType.value = 'f';
        findName.value = '*.log';
        findTime.value = '+30';
        findSize.value = '';
        findPerm.value = '';
        findUseXargs.checked = true;
        xargsCmd.value = 'rm -f';
      } else if (p === 'find-777') {
        findPath.value = '.';
        findType.value = 'f';
        findName.value = '';
        findTime.value = '';
        findSize.value = '';
        findPerm.value = '777';
        findUseXargs.checked = false;
        findAction.value = '-ls';
      } else if (p === 'grep-code') {
        findPath.value = '.';
        findType.value = 'f';
        findName.value = '*.js';
        findTime.value = '';
        findSize.value = '';
        findPerm.value = '';
        findUseXargs.checked = true;
        xargsCmd.value = 'grep -in "TODO"';
      }
      updateFindXargs();
    });
  });

  // ==========================================
  // FERRAMENTA 7: GERADOR DE SYSTEMD (.service / .timer)
  // ==========================================
  const sysUnitName = document.getElementById('sys-unit-name');
  const sysDesc = document.getElementById('sys-desc');
  const sysUser = document.getElementById('sys-user');
  const sysGroup = document.getElementById('sys-group');
  const sysWorkDir = document.getElementById('sys-workdir');
  const sysExecStart = document.getElementById('sys-execstart');
  const sysRestart = document.getElementById('sys-restart');
  const sysType = document.getElementById('sys-type');
  const sysHarden = document.getElementById('sys-harden');
  const sysCalendar = document.getElementById('sys-calendar');

  function updateSystemd() {
    const name = (sysUnitName.value || 'meu-servico').trim().replace(/\.service$/, '');
    const desc = (sysDesc.value || 'Meu Serviço Customizado').trim();
    const user = (sysUser.value || 'root').trim();
    const group = (sysGroup.value || 'root').trim();
    const workDir = (sysWorkDir.value || '/opt/meu-servico').trim();
    const execStart = (sysExecStart.value || '/usr/bin/node /opt/meu-servico/index.js').trim();
    const restart = sysRestart.value;
    const type = sysType.value;
    const harden = sysHarden.checked;
    const calendar = (sysCalendar.value || 'daily').trim();

    // SERVICE
    let s = `[Unit]
Description=${desc}
After=network.target

[Service]
Type=${type}
User=${user}
Group=${group}
WorkingDirectory=${workDir}
ExecStart=${execStart}
Restart=${restart}
RestartSec=5s
`;
    if (harden) {
      s += `NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
PrivateTmp=true
`;
    }
    s += `
[Install]
WantedBy=multi-user.target
`;

    // TIMER
    let t = `[Unit]
Description=Timer para ${desc}
Requires=${name}.service

[Timer]
Unit=${name}.service
OnCalendar=${calendar}
Persistent=true
RandomizedDelaySec=60s

[Install]
WantedBy=timers.target
`;

    const cmds = `# 1. Salvar os arquivos de unidade
sudo nano /etc/systemd/system/${name}.service
sudo nano /etc/systemd/system/${name}.timer

# 2. Recarregar o systemd
sudo systemctl daemon-reload

# 3. Ativar e iniciar o serviço
sudo systemctl enable --now ${name}.service

# 4. Verificar status e logs
sudo systemctl status ${name}.service
sudo journalctl -u ${name}.service -f`;

    document.getElementById('out-sys-service').textContent = s;
    document.getElementById('out-sys-timer').textContent = t;
    document.getElementById('out-sys-commands').textContent = cmds;
  }

  [sysUnitName, sysDesc, sysUser, sysGroup, sysWorkDir, sysExecStart, sysRestart, sysType, sysHarden, sysCalendar].forEach(el => {
    if (el) el.addEventListener('input', updateSystemd);
  });

  // ==========================================
  // FERRAMENTA 8: CONSTRUTOR DE TAR E RSYNC
  // ==========================================
  const tarAction = document.getElementById('tar-action');
  const tarCompress = document.getElementById('tar-compress');
  const tarFile = document.getElementById('tar-file');
  const tarSources = document.getElementById('tar-sources');
  const tarExclude = document.getElementById('tar-exclude');
  const tarVerbose = document.getElementById('tar-verbose');

  const rsyncSrc = document.getElementById('rsync-src');
  const rsyncDst = document.getElementById('rsync-dst');
  const rsyncDelete = document.getElementById('rsync-delete');
  const rsyncDryRun = document.getElementById('rsync-dryrun');
  const rsyncProgress = document.getElementById('rsync-progress');
  const rsyncPort = document.getElementById('rsync-port');
  const rsyncBwlimit = document.getElementById('rsync-bwlimit');

  function updateTarRsync() {
    // TAR
    const act = tarAction.value; // c, x, t
    const comp = tarCompress.value; // z, j, J, zst, none
    const file = (tarFile.value || 'backup.tar.gz').trim();
    const src = (tarSources.value || '/var/www').trim();
    const excl = (tarExclude.value || '').trim();
    const verb = tarVerbose.checked ? 'v' : '';

    let flagComp = '';
    if (comp === 'z') flagComp = 'z';
    else if (comp === 'j') flagComp = 'j';
    else if (comp === 'J') flagComp = 'J';
    else if (comp === 'zst') flagComp = ' --zstd';

    let tarCmd = '';
    if (comp === 'zst') {
      tarCmd = `tar -${act}${verb}${flagComp} -f ${file}`;
    } else {
      tarCmd = `tar -${act}${flagComp}${verb}f ${file}`;
    }

    if (excl) {
      tarCmd += ` --exclude='${excl}'`;
    }
    if (act === 'c') {
      tarCmd += ` ${src}`;
    }

    // RSYNC
    const rSrc = (rsyncSrc.value || '/dados/origem/').trim();
    const rDst = (rsyncDst.value || 'user@servidor:/dados/destino/').trim();
    let rFlags = ['-a'];
    rFlags.push('z'); // compress
    if (rsyncProgress.checked) rFlags.push('P'); // progress & partial
    if (rsyncDelete.checked) rFlags.push('--delete');
    if (rsyncDryRun.checked) rFlags.push('-n', '-v');
    if (rsyncBwlimit.value.trim()) rFlags.push(`--bwlimit=${rsyncBwlimit.value.trim()}`);

    let rsyncCmd = `rsync ${rFlags.join('')}`;
    if (rsyncPort.value.trim()) {
      rsyncCmd += ` -e 'ssh -p ${rsyncPort.value.trim()}'`;
    }
    rsyncCmd += ` ${rSrc} ${rDst}`;

    document.getElementById('out-tar-cmd').textContent = tarCmd;
    document.getElementById('out-rsync-cmd').textContent = rsyncCmd;
  }

  [tarAction, tarCompress, tarFile, tarSources, tarExclude, tarVerbose, rsyncSrc, rsyncDst, rsyncDelete, rsyncDryRun, rsyncProgress, rsyncPort, rsyncBwlimit].forEach(el => {
    if (el) el.addEventListener('input', updateTarRsync);
  });

  // ==========================================
  // FERRAMENTA: CONSTRUTOR & CALCULADOR DE ACLs (SETFACL / GETFACL)
  // ==========================================
  const aclTargetPath = document.getElementById('acl-target-path');
  const aclActionType = document.getElementById('acl-action-type');
  const aclOptDir = document.getElementById('acl-opt-dir');
  const aclOptRecursive = document.getElementById('acl-opt-recursive');
  const aclOptPhysical = document.getElementById('acl-opt-physical');
  const aclManualMask = document.getElementById('acl-manual-mask');
  const aclMaskR = document.getElementById('acl-mask-r');
  const aclMaskW = document.getElementById('acl-mask-w');
  const aclMaskX = document.getElementById('acl-mask-x');
  const aclApplyDefault = document.getElementById('acl-apply-default');
  const aclEntriesBody = document.getElementById('acl-entries-body');
  const aclAddUserBtn = document.getElementById('acl-add-user-btn');
  const aclAddGroupBtn = document.getElementById('acl-add-group-btn');

  const aclSimUser = document.getElementById('acl-sim-user');
  const aclSimGroups = document.getElementById('acl-sim-groups');
  const aclSimRunBtn = document.getElementById('acl-sim-run-btn');

  const aclGetfaclInput = document.getElementById('acl-getfacl-input');
  const aclSampleGetfaclBtn = document.getElementById('acl-sample-getfacl-btn');
  const aclParsedSummary = document.getElementById('acl-parsed-summary');

  let aclNamedUsers = [
    { id: 'u_' + Date.now() + '_1', name: 'deploy', r: true, w: true, x: true }
  ];
  let aclNamedGroups = [
    { id: 'g_' + Date.now() + '_2', name: 'devs', r: true, w: false, x: true }
  ];

  function getAclPermStr(r, w, x) {
    return (r ? 'r' : '-') + (w ? 'w' : '-') + (x ? 'x' : '-');
  }

  function calcAclEffective(perm, mask) {
    const r = (perm.includes('r') && mask.includes('r')) ? 'r' : '-';
    const w = (perm.includes('w') && mask.includes('w')) ? 'w' : '-';
    const x = (perm.includes('x') && mask.includes('x')) ? 'x' : '-';
    return r + w + x;
  }

  function getAclBaseUser() {
    const row = document.querySelector('tr[data-entry-type="user-base"]');
    if (!row) return { r: true, w: true, x: true, str: 'rwx' };
    const r = row.querySelector('.cb-r').checked;
    const w = row.querySelector('.cb-w').checked;
    const x = row.querySelector('.cb-x').checked;
    return { r, w, x, str: getAclPermStr(r, w, x) };
  }

  function getAclBaseGroup() {
    const row = document.querySelector('tr[data-entry-type="group-base"]');
    if (!row) return { r: true, w: false, x: true, str: 'r-x' };
    const r = row.querySelector('.cb-r').checked;
    const w = row.querySelector('.cb-w').checked;
    const x = row.querySelector('.cb-x').checked;
    return { r, w, x, str: getAclPermStr(r, w, x) };
  }

  function getAclBaseOther() {
    const row = document.querySelector('tr[data-entry-type="other-base"]');
    if (!row) return { r: false, w: false, x: false, str: '---' };
    const r = row.querySelector('.cb-r').checked;
    const w = row.querySelector('.cb-w').checked;
    const x = row.querySelector('.cb-x').checked;
    return { r, w, x, str: getAclPermStr(r, w, x) };
  }

  function calcAclAutoMask() {
    let r = false, w = false, x = false;
    const gb = getAclBaseGroup();
    if (gb.r) r = true; if (gb.w) w = true; if (gb.x) x = true;

    aclNamedUsers.forEach(u => {
      if (u.r) r = true; if (u.w) w = true; if (u.x) x = true;
    });
    aclNamedGroups.forEach(g => {
      if (g.r) r = true; if (g.w) w = true; if (g.x) x = true;
    });

    return { r, w, x, str: getAclPermStr(r, w, x) };
  }

  function getAclCurrentMask() {
    if (aclManualMask && aclManualMask.checked) {
      const r = aclMaskR ? aclMaskR.checked : true;
      const w = aclMaskW ? aclMaskW.checked : true;
      const x = aclMaskX ? aclMaskX.checked : true;
      return { r, w, x, str: getAclPermStr(r, w, x) };
    }
    return calcAclAutoMask();
  }

  function renderAclDynamicRows() {
    if (!aclEntriesBody) return;

    // Remove existing dynamic rows
    aclEntriesBody.querySelectorAll('tr[data-entry-type="named-user"], tr[data-entry-type="named-group"]').forEach(r => r.remove());

    const mask = getAclCurrentMask();
    const maskRow = aclEntriesBody.querySelector('tr[data-entry-type="mask"]');

    // Insert Named Users before mask row
    aclNamedUsers.forEach(u => {
      const uPerm = getAclPermStr(u.r, u.w, u.x);
      const eff = calcAclEffective(uPerm, mask.str);
      const isBlocked = eff !== uPerm;

      const tr = document.createElement('tr');
      tr.setAttribute('data-entry-type', 'named-user');
      tr.setAttribute('data-id', u.id);
      tr.innerHTML = `
        <td><span class="badge badge-green">user:${escapeHtml(u.name || '?')}</span></td>
        <td>
          <input type="text" class="input-text acl-name-input" value="${escapeHtml(u.name)}" placeholder="usuario" style="padding:0.3rem 0.5rem; font-size:0.8rem; width:140px;">
        </td>
        <td>
          <label class="acl-perm-cb"><input type="checkbox" class="cb-r" ${u.r ? 'checked' : ''}> r</label>
          <label class="acl-perm-cb"><input type="checkbox" class="cb-w" ${u.w ? 'checked' : ''}> w</label>
          <label class="acl-perm-cb"><input type="checkbox" class="cb-x" ${u.x ? 'checked' : ''}> x</label>
        </td>
        <td>
          <span class="acl-eff-badge ${isBlocked ? 'acl-eff-blocked' : 'acl-eff-pass'}">
            ${eff} ${isBlocked ? '⚠️ (restringido)' : ''}
          </span>
        </td>
        <td>
          <button type="button" class="chip-btn acl-del-row-btn" title="Remover usuário" style="padding:0.2rem 0.4rem; color:hsl(0 75% 65%);">✕</button>
        </td>
      `;

      // Bind row inputs
      tr.querySelector('.acl-name-input').addEventListener('input', (e) => {
        u.name = e.target.value.trim();
        updateAclTool();
      });
      tr.querySelector('.cb-r').addEventListener('change', (e) => {
        u.r = e.target.checked;
        updateAclTool();
      });
      tr.querySelector('.cb-w').addEventListener('change', (e) => {
        u.w = e.target.checked;
        updateAclTool();
      });
      tr.querySelector('.cb-x').addEventListener('change', (e) => {
        u.x = e.target.checked;
        updateAclTool();
      });
      tr.querySelector('.acl-del-row-btn').addEventListener('click', () => {
        aclNamedUsers = aclNamedUsers.filter(item => item.id !== u.id);
        renderAclDynamicRows();
        updateAclTool();
      });

      aclEntriesBody.insertBefore(tr, maskRow);
    });

    // Insert Named Groups before mask row
    aclNamedGroups.forEach(g => {
      const gPerm = getAclPermStr(g.r, g.w, g.x);
      const eff = calcAclEffective(gPerm, mask.str);
      const isBlocked = eff !== gPerm;

      const tr = document.createElement('tr');
      tr.setAttribute('data-entry-type', 'named-group');
      tr.setAttribute('data-id', g.id);
      tr.innerHTML = `
        <td><span class="badge badge-cyan">group:${escapeHtml(g.name || '?')}</span></td>
        <td>
          <input type="text" class="input-text acl-name-input" value="${escapeHtml(g.name)}" placeholder="grupo" style="padding:0.3rem 0.5rem; font-size:0.8rem; width:140px;">
        </td>
        <td>
          <label class="acl-perm-cb"><input type="checkbox" class="cb-r" ${g.r ? 'checked' : ''}> r</label>
          <label class="acl-perm-cb"><input type="checkbox" class="cb-w" ${g.w ? 'checked' : ''}> w</label>
          <label class="acl-perm-cb"><input type="checkbox" class="cb-x" ${g.x ? 'checked' : ''}> x</label>
        </td>
        <td>
          <span class="acl-eff-badge ${isBlocked ? 'acl-eff-blocked' : 'acl-eff-pass'}">
            ${eff} ${isBlocked ? '⚠️ (restringido)' : ''}
          </span>
        </td>
        <td>
          <button type="button" class="chip-btn acl-del-row-btn" title="Remover grupo" style="padding:0.2rem 0.4rem; color:hsl(0 75% 65%);">✕</button>
        </td>
      `;

      tr.querySelector('.acl-name-input').addEventListener('input', (e) => {
        g.name = e.target.value.trim();
        updateAclTool();
      });
      tr.querySelector('.cb-r').addEventListener('change', (e) => {
        g.r = e.target.checked;
        updateAclTool();
      });
      tr.querySelector('.cb-w').addEventListener('change', (e) => {
        g.w = e.target.checked;
        updateAclTool();
      });
      tr.querySelector('.cb-x').addEventListener('change', (e) => {
        g.x = e.target.checked;
        updateAclTool();
      });
      tr.querySelector('.acl-del-row-btn').addEventListener('click', () => {
        aclNamedGroups = aclNamedGroups.filter(item => item.id !== g.id);
        renderAclDynamicRows();
        updateAclTool();
      });

      aclEntriesBody.insertBefore(tr, maskRow);
    });

    // Update group base effective badge
    const effGroupCell = document.getElementById('acl-eff-group-base');
    if (effGroupCell) {
      const gbPerm = getAclBaseGroup().str;
      const hasExtended = (aclNamedUsers.length > 0 || aclNamedGroups.length > 0);
      const effGroup = hasExtended ? calcAclEffective(gbPerm, mask.str) : gbPerm;
      const isGbBlocked = hasExtended && effGroup !== gbPerm;
      effGroupCell.innerHTML = `
        <span class="acl-eff-badge ${isGbBlocked ? 'acl-eff-blocked' : 'acl-eff-pass'}">
          ${effGroup} ${isGbBlocked ? '⚠️ (restringido)' : ''}
        </span>
      `;
    }

    // Update mask row display
    const effMaskCell = document.getElementById('acl-eff-mask-val');
    if (effMaskCell) {
      effMaskCell.textContent = mask.str;
    }
  }

  function updateAclTool() {
    const action = aclActionType ? aclActionType.value : '-m';
    const target = (aclTargetPath ? aclTargetPath.value.trim() : '') || '/var/www/site';
    const isDir = aclOptDir ? aclOptDir.checked : true;
    const isRec = aclOptRecursive ? aclOptRecursive.checked : false;
    const isPhys = aclOptPhysical ? aclOptPhysical.checked : false;
    const applyDef = isDir && aclApplyDefault && aclApplyDefault.checked;

    // Toggle default box visibility based on directory option
    const defBox = document.getElementById('acl-default-box');
    if (defBox) defBox.style.display = isDir ? 'block' : 'none';

    // Toggle manual mask inputs disabled state
    const isManual = aclManualMask && aclManualMask.checked;
    if (aclMaskR) aclMaskR.disabled = !isManual;
    if (aclMaskW) aclMaskW.disabled = !isManual;
    if (aclMaskX) aclMaskX.disabled = !isManual;

    if (!isManual) {
      const autoM = calcAclAutoMask();
      if (aclMaskR) aclMaskR.checked = autoM.r;
      if (aclMaskW) aclMaskW.checked = autoM.w;
      if (aclMaskX) aclMaskX.checked = autoM.x;
    }

    const mask = getAclCurrentMask();
    const ub = getAclBaseUser();
    const gb = getAclBaseGroup();
    const ob = getAclBaseOther();

    // Build flags
    const flags = [];
    if (isRec) flags.push('-R');
    if (isPhys && isRec) flags.push('-P');

    let mainCmd = '';
    let checkCmd = `getfacl ${target}`;

    if (action === '-b') {
      mainCmd = `setfacl ${flags.join(' ')} -b ${target}`.replace(/\s+/g, ' ');
    } else if (action === '-k') {
      mainCmd = `setfacl ${flags.join(' ')} -k ${target}`.replace(/\s+/g, ' ');
    } else if (action === '-x') {
      const remEntries = [];
      aclNamedUsers.forEach(u => { if (u.name) remEntries.push(`u:${u.name}`); });
      aclNamedGroups.forEach(g => { if (g.name) remEntries.push(`g:${g.name}`); });
      if (applyDef) {
        aclNamedUsers.forEach(u => { if (u.name) remEntries.push(`d:u:${u.name}`); });
        aclNamedGroups.forEach(g => { if (g.name) remEntries.push(`d:g:${g.name}`); });
      }
      const entryStr = remEntries.join(',') || 'u:usuario';
      mainCmd = `setfacl ${flags.join(' ')} -x ${entryStr} ${target}`.replace(/\s+/g, ' ');
    } else {
      // -m or --set
      const entries = [];
      if (action === '--set') {
        entries.push(`u::${ub.str}`);
        entries.push(`g::${gb.str}`);
        entries.push(`o::${ob.str}`);
      }

      aclNamedUsers.forEach(u => {
        if (u.name) entries.push(`u:${u.name}:${getAclPermStr(u.r, u.w, u.x)}`);
      });
      aclNamedGroups.forEach(g => {
        if (g.name) entries.push(`g:${g.name}:${getAclPermStr(g.r, g.w, g.x)}`);
      });

      // Include mask if manual or if extended entries exist in --set
      if (isManual || (action === '--set' && (aclNamedUsers.length > 0 || aclNamedGroups.length > 0))) {
        entries.push(`m::${mask.str}`);
      }

      // Default entries
      if (applyDef) {
        if (action === '--set') {
          entries.push(`d:u::${ub.str}`);
          entries.push(`d:g::${gb.str}`);
          entries.push(`d:o::${ob.str}`);
        }
        aclNamedUsers.forEach(u => {
          if (u.name) entries.push(`d:u:${u.name}:${getAclPermStr(u.r, u.w, u.x)}`);
        });
        aclNamedGroups.forEach(g => {
          if (g.name) entries.push(`d:g:${g.name}:${getAclPermStr(g.r, g.w, g.x)}`);
        });
        if (isManual || action === '--set') {
          entries.push(`d:m::${mask.str}`);
        }
      }

      const flagStr = flags.length > 0 ? flags.join(' ') + ' ' : '';
      const actFlag = action === '--set' ? '--set' : '-m';
      mainCmd = `setfacl ${flagStr}${actFlag} ${entries.join(',')} ${target}`.replace(/\s+/g, ' ');
    }

    // Set outputs
    const outCmd = document.getElementById('out-acl-cmd');
    if (outCmd) outCmd.textContent = mainCmd;

    const outCheck = document.getElementById('out-acl-check');
    if (outCheck) {
      outCheck.textContent = `# 1. Verificar permissões aplicadas:\n${checkCmd}\n\n# 2. Criar backup das ACLs recursivamente:\ngetfacl -R ${target} > acls_backup.bak\n\n# 3. Restaurar backup de ACLs:\nsetfacl --restore=acls_backup.bak`;
    }

    // Update dynamic rows badges
    renderAclDynamicRows();

    // Run simulator automatically
    runAclSimulator();
  }

  function runAclSimulator() {
    const testUser = (aclSimUser ? aclSimUser.value.trim() : '') || 'deploy';
    const testGroupsRaw = (aclSimGroups ? aclSimGroups.value.trim() : '') || 'devs, users';
    const testGroups = testGroupsRaw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

    const mask = getAclCurrentMask().str;
    const ub = getAclBaseUser().str;
    const gb = getAclBaseGroup().str;
    const ob = getAclBaseOther().str;

    let granted = '---';
    let explanation = '';

    // Simulated owner & owning group
    const simulatedOwner = 'root';
    const simulatedGroup = 'root';

    if (testUser === simulatedOwner) {
      granted = ub;
      explanation = `O usuário "<strong>${escapeHtml(testUser)}</strong>" é o dono do arquivo. Foi concedida a permissão base de dono: <code>${ub}</code>. (A máscara ACL não restringe o dono).`;
    } else {
      // Check named user match
      const matchedUser = aclNamedUsers.find(u => u.name && u.name.toLowerCase() === testUser.toLowerCase());
      if (matchedUser) {
        const declared = getAclPermStr(matchedUser.r, matchedUser.w, matchedUser.x);
        granted = calcAclEffective(declared, mask);
        explanation = `O usuário "<strong>${escapeHtml(testUser)}</strong>" possui entrada específica <code>u:${matchedUser.name}:${declared}</code>. Aplicada a máscara <code>m::${mask}</code>, resultando em: <code>${granted}</code>.`;
      } else {
        // Check groups match (including owning group and named groups)
        const matchingGroupPerms = [];
        if (testGroups.includes(simulatedGroup)) {
          matchingGroupPerms.push({ name: simulatedGroup, perm: gb });
        }
        aclNamedGroups.forEach(g => {
          if (g.name && testGroups.includes(g.name.toLowerCase())) {
            matchingGroupPerms.push({ name: g.name, perm: getAclPermStr(g.r, g.w, g.x) });
          }
        });

        if (matchingGroupPerms.length > 0) {
          let r = false, w = false, x = false;
          matchingGroupPerms.forEach(item => {
            if (item.perm.includes('r')) r = true;
            if (item.perm.includes('w')) w = true;
            if (item.perm.includes('x')) x = true;
          });
          const rawUnion = getAclPermStr(r, w, x);
          granted = calcAclEffective(rawUnion, mask);
          const gNames = matchingGroupPerms.map(i => `g:${i.name}:${i.perm}`).join(', ');
          explanation = `O usuário pertence ao(s) grupo(s) correspondente(s): <code>${escapeHtml(gNames)}</code> (união: <code>${rawUnion}</code>). Aplicada a máscara <code>m::${mask}</code>, resultando em: <code>${granted}</code>.`;
        } else {
          // Fallback to other
          granted = ob;
          explanation = `Nenhum usuário ou grupo coincidiu. Aplicada a permissão de outros: <code>other::${ob}</code>. (A máscara ACL não restringe outros).`;
        }
      }
    }

    // Update status cards
    const rOk = granted.includes('r');
    const wOk = granted.includes('w');
    const xOk = granted.includes('x');

    const cardR = document.getElementById('acl-sim-card-r');
    const cardW = document.getElementById('acl-sim-card-w');
    const cardX = document.getElementById('acl-sim-card-x');
    const statusR = document.getElementById('acl-sim-status-r');
    const statusW = document.getElementById('acl-sim-status-w');
    const statusX = document.getElementById('acl-sim-status-x');

    if (cardR && statusR) {
      cardR.className = 'acl-sim-perm-card ' + (rOk ? 'allowed' : 'denied');
      statusR.textContent = rOk ? 'PERMITIDO ✓' : 'NEGADO ✕';
    }
    if (cardW && statusW) {
      cardW.className = 'acl-sim-perm-card ' + (wOk ? 'allowed' : 'denied');
      statusW.textContent = wOk ? 'PERMITIDO ✓' : 'NEGADO ✕';
    }
    if (cardX && statusX) {
      cardX.className = 'acl-sim-perm-card ' + (xOk ? 'allowed' : 'denied');
      statusX.textContent = xOk ? 'PERMITIDO ✓' : 'NEGADO ✕';
    }

    const expEl = document.getElementById('acl-sim-explanation');
    if (expEl) expEl.innerHTML = explanation;
  }

  // Bind Base Checkboxes
  document.querySelectorAll('tr[data-entry-type="user-base"] input, tr[data-entry-type="group-base"] input, tr[data-entry-type="other-base"] input').forEach(cb => {
    cb.addEventListener('change', updateAclTool);
  });

  // Bind Target inputs
  [aclTargetPath, aclActionType, aclOptDir, aclOptRecursive, aclOptPhysical, aclApplyDefault, aclManualMask, aclMaskR, aclMaskW, aclMaskX].forEach(el => {
    if (el) el.addEventListener('input', updateAclTool);
  });

  // Bind Add Buttons
  if (aclAddUserBtn) {
    aclAddUserBtn.addEventListener('click', () => {
      aclNamedUsers.push({
        id: 'u_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        name: 'novo_usuario',
        r: true,
        w: false,
        x: false
      });
      renderAclDynamicRows();
      updateAclTool();
    });
  }

  if (aclAddGroupBtn) {
    aclAddGroupBtn.addEventListener('click', () => {
      aclNamedGroups.push({
        id: 'g_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        name: 'novo_grupo',
        r: true,
        w: false,
        x: false
      });
      renderAclDynamicRows();
      updateAclTool();
    });
  }

  // Bind Simulator Run Button
  if (aclSimRunBtn) aclSimRunBtn.addEventListener('click', runAclSimulator);
  if (aclSimUser) aclSimUser.addEventListener('input', runAclSimulator);
  if (aclSimGroups) aclSimGroups.addEventListener('input', runAclSimulator);

  // Preset Buttons
  document.querySelectorAll('.acl-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.getAttribute('data-preset');
      if (preset === 'devs') {
        if (aclTargetPath) aclTargetPath.value = '/var/www/site';
        if (aclActionType) aclActionType.value = '-m';
        if (aclOptDir) aclOptDir.checked = true;
        if (aclApplyDefault) aclApplyDefault.checked = true;
        aclNamedUsers = [];
        aclNamedGroups = [{ id: 'g_devs', name: 'devs', r: true, w: true, x: true }];
        showToast('Preset Grupo Devs (rwx) carregado! ✓');
      } else if (preset === 'web') {
        if (aclTargetPath) aclTargetPath.value = '/var/www/app';
        if (aclActionType) aclActionType.value = '-m';
        if (aclOptDir) aclOptDir.checked = true;
        if (aclApplyDefault) aclApplyDefault.checked = true;
        aclNamedUsers = [{ id: 'u_deploy', name: 'deploy', r: true, w: true, x: true }];
        aclNamedGroups = [{ id: 'g_www', name: 'www-data', r: true, w: false, x: true }];
        showToast('Preset Web Server (Nginx + Deploy) carregado! ✓');
      } else if (preset === 'audit') {
        if (aclTargetPath) aclTargetPath.value = '/var/log';
        if (aclActionType) aclActionType.value = '-m';
        aclNamedUsers = [{ id: 'u_auditor', name: 'auditor', r: true, w: false, x: true }];
        aclNamedGroups = [];
        showToast('Preset Auditoria (r-x) carregado! ✓');
      } else if (preset === 'clean') {
        if (aclActionType) aclActionType.value = '-b';
        showToast('Ação definida para Limpar ACLs (-b)! ✓');
      }
      renderAclDynamicRows();
      updateAclTool();
    });
  });

  // Reverse getfacl parser
  function parseGetfaclOutput() {
    if (!aclGetfaclInput || !aclParsedSummary) return;
    const raw = (aclGetfaclInput.value || '').trim();
    if (!raw) {
      aclParsedSummary.innerHTML = '<span class="m">Cole o output do getfacl para visualizar a análise detalhada.</span>';
      return;
    }

    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
    let file = '', owner = '', group = '', flags = '';
    const accessEntries = [];
    const defaultEntries = [];
    let mask = null;

    lines.forEach(line => {
      if (line.startsWith('# file:')) { file = line.replace('# file:', '').trim(); return; }
      if (line.startsWith('# owner:')) { owner = line.replace('# owner:', '').trim(); return; }
      if (line.startsWith('# group:')) { group = line.replace('# group:', '').trim(); return; }
      if (line.startsWith('# flags:')) { flags = line.replace('# flags:', '').trim(); return; }
      if (line.startsWith('#')) return;

      const clean = line.split('#')[0].trim();
      const isDef = clean.startsWith('default:');
      const core = isDef ? clean.slice(8) : clean;
      const parts = core.split(':');
      if (parts.length < 3) return;

      const type = parts[0];
      const name = parts[1];
      const perm = parts[2];

      const item = { type, name, perm, line };
      if (isDef) defaultEntries.push(item);
      else {
        accessEntries.push(item);
        if (type === 'mask') mask = perm;
      }
    });

    let html = `
      <div class="card-box" style="margin-bottom:0.75rem; padding:0.85rem 1rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.6rem;">
          <div style="font-weight:700; font-family:var(--mono); color:var(--cyan);">📊 Diagnóstico de ACL (${file || 'Arquivo'})</div>
          <button type="button" class="chip-btn" id="acl-import-builder-btn">📥 Carregar no Construtor Visual</button>
        </div>
        <table class="info-table">
          <tr><td class="key">Arquivo / Alvo</td><td class="val"><code>${escapeHtml(file || 'Não especificado')}</code></td></tr>
          <tr><td class="key">Dono (Owner)</td><td class="val"><code>${escapeHtml(owner || 'Não especificado')}</code></td></tr>
          <tr><td class="key">Grupo Primário</td><td class="val"><code>${escapeHtml(group || 'Não especificado')}</code></td></tr>
          <tr><td class="key">Máscara Efetiva</td><td class="val"><code style="color:var(--amber);">${escapeHtml(mask || '(não definida)')}</code></td></tr>
          <tr><td class="key">Total de Entradas de Acesso</td><td class="val">${accessEntries.length} entradas</td></tr>
          <tr><td class="key">Entradas Default (Herança)</td><td class="val">${defaultEntries.length} entradas</td></tr>
        </table>
      </div>
    `;

    aclParsedSummary.innerHTML = html;

    // Bind import to builder button
    const importBtn = document.getElementById('acl-import-builder-btn');
    if (importBtn) {
      importBtn.addEventListener('click', () => {
        if (file && aclTargetPath) aclTargetPath.value = file;
        const newUsers = [];
        const newGroups = [];

        accessEntries.forEach(item => {
          if (item.type === 'user' && item.name) {
            newUsers.push({
              id: 'u_' + Math.random().toString(36).substr(2, 6),
              name: item.name,
              r: item.perm.includes('r'),
              w: item.perm.includes('w'),
              x: item.perm.includes('x')
            });
          } else if (item.type === 'group' && item.name) {
            newGroups.push({
              id: 'g_' + Math.random().toString(36).substr(2, 6),
              name: item.name,
              r: item.perm.includes('r'),
              w: item.perm.includes('w'),
              x: item.perm.includes('x')
            });
          }
        });

        aclNamedUsers = newUsers;
        aclNamedGroups = newGroups;

        // Switch to builder tab
        const builderTabBtn = document.querySelector('.subtab-btn[data-tab="acl-builder"]');
        if (builderTabBtn) builderTabBtn.click();

        renderAclDynamicRows();
        updateAclTool();
        showToast('ACL importada para o Construtor Visual com sucesso! ✓');
      });
    }
  }

  if (aclGetfaclInput) aclGetfaclInput.addEventListener('input', parseGetfaclOutput);

  if (aclSampleGetfaclBtn) {
    aclSampleGetfaclBtn.addEventListener('click', () => {
      if (aclGetfaclInput) {
        aclGetfaclInput.value = `# file: /var/www/site
# owner: www-data
# group: www-data
user::rwx
user:deploy:rwx
user:developer:r-x
group::r-x
group:devs:rwx            #effective:r-x
mask::r-x
other::---
default:user::rwx
default:user:deploy:rwx
default:group::r-x
default:mask::rwx
default:other::---`;
        parseGetfaclOutput();
        showToast('Exemplo de getfacl carregado! ✓');
      }
    });
  }

  // Initial render of ACL tool
  renderAclDynamicRows();
  updateAclTool();

  // ==========================================
  // FERRAMENTA 9: CONVERSOR E VALIDADOR JSON / YAML / TOML
  // ==========================================
  const dataInput = document.getElementById('data-input');
  const dataOutFormat = document.getElementById('data-out-format');
  const dataStatus = document.getElementById('data-status');

  // Simple pure JS YAML/JSON helper
  function jsonToYaml(obj, indent = 0) {
    const pad = ' '.repeat(indent);
    if (obj === null) return 'null\n';
    if (typeof obj === 'boolean' || typeof obj === 'number') return `${obj}\n`;
    if (typeof obj === 'string') {
      if (obj.includes('\n')) return `|\n${obj.split('\n').map(l => pad + '  ' + l).join('\n')}\n`;
      if (/[:#\[\]{},&*!|>'"%@`]/.test(obj) || obj === '') return `"${obj.replace(/"/g, '\\"')}"\n`;
      return `${obj}\n`;
    }
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]\n';
      return obj.map(item => {
        const val = jsonToYaml(item, indent + 2).trimStart();
        return `${pad}- ${val}`;
      }).join('');
    }
    if (typeof obj === 'object') {
      const keys = Object.keys(obj);
      if (keys.length === 0) return '{}\n';
      return keys.map(k => {
        const val = obj[k];
        if (typeof val === 'object' && val !== null && !Array.isArray(val) && Object.keys(val).length > 0) {
          return `${pad}${k}:\n${jsonToYaml(val, indent + 2)}`;
        }
        if (Array.isArray(val) && val.length > 0) {
          return `${pad}${k}:\n${jsonToYaml(val, indent + 2)}`;
        }
        return `${pad}${k}: ${jsonToYaml(val, indent + 2).trimStart()}`;
      }).join('');
    }
    return `${obj}\n`;
  }

  // Simple pure JS TOML dumper
  function jsonToToml(obj) {
    let out = '';
    let tables = '';

    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
        tables += `\n[${k}]\n`;
        for (const [subK, subV] of Object.entries(v)) {
          tables += `${subK} = ${JSON.stringify(subV)}\n`;
        }
      } else {
        out += `${k} = ${JSON.stringify(v)}\n`;
      }
    }
    return (out + tables).trim();
  }

  // Simple pure JS YAML parser (basic)
  function yamlToJson(yaml) {
    const lines = yaml.split('\n').filter(l => l.trim() && !l.trim().startsWith('#'));
    const result = {};
    let currentKey = null;

    for (let line of lines) {
      const match = line.match(/^(\s*)([^:]+):\s*(.*)$/);
      if (match) {
        const [, indent, key, val] = match;
        const trimmedKey = key.trim();
        const trimmedVal = val.trim();

        if (!trimmedVal) {
          currentKey = trimmedKey;
          result[currentKey] = {};
        } else {
          let parsedVal = trimmedVal;
          if (trimmedVal === 'true') parsedVal = true;
          else if (trimmedVal === 'false') parsedVal = false;
          else if (!isNaN(Number(trimmedVal))) parsedVal = Number(trimmedVal);
          else if (trimmedVal.startsWith('"') && trimmedVal.endsWith('"')) parsedVal = trimmedVal.slice(1, -1);
          result[trimmedKey] = parsedVal;
        }
      }
    }
    return result;
  }

  function convertData() {
    const raw = (dataInput.value || '').trim();
    if (!raw) {
      document.getElementById('out-data-converted').textContent = '';
      dataStatus.innerHTML = '<span class="m">Aguardando dados...</span>';
      return;
    }

    const targetFormat = dataOutFormat.value;
    let parsedObj = null;

    // Detect format and parse
    try {
      if (raw.startsWith('{') || raw.startsWith('[')) {
        parsedObj = JSON.parse(raw);
      } else {
        parsedObj = yamlToJson(raw);
      }
      dataStatus.innerHTML = '<span class="badge badge-green">✓ Sintaxe válida</span>';
    } catch (e) {
      dataStatus.innerHTML = `<span class="badge badge-red">✗ Erro de sintaxe: ${e.message}</span>`;
      return;
    }

    let output = '';
    if (targetFormat === 'json-pretty') {
      output = JSON.stringify(parsedObj, null, 2);
    } else if (targetFormat === 'json-min') {
      output = JSON.stringify(parsedObj);
    } else if (targetFormat === 'yaml') {
      output = jsonToYaml(parsedObj);
    } else if (targetFormat === 'toml') {
      output = jsonToToml(parsedObj);
    }

    document.getElementById('out-data-converted').textContent = output;
  }

  if (dataInput) dataInput.addEventListener('input', convertData);
  if (dataOutFormat) dataOutFormat.addEventListener('change', convertData);

  document.querySelectorAll('[data-data-sample]').forEach(btn => {
    btn.addEventListener('click', () => {
      const s = {
        app: "canivete-suico",
        version: "2.0.0",
        author: {
          name: "Guilherme Neves",
          site: "https://guineves.com.br"
        },
        features: ["offline", "no-cloud", "fast"],
        limits: {
          max_connections: 500,
          timeout_sec: 30,
          enabled: true
        }
      };
      dataInput.value = JSON.stringify(s, null, 2);
      convertData();
    });
  });

  // ==========================================
  // FERRAMENTA 10: CODIFICADOR / DECODIFICADOR MULTI-FORMATO
  // ==========================================
  const codecInput = document.getElementById('codec-input');
  const codecMode = document.getElementById('codec-mode');

  function updateCodec() {
    const raw = codecInput.value || '';
    const isEncode = codecMode.value === 'encode';

    let b64 = '', b64Url = '', urlEnc = '', htmlEnt = '', hex = '', bin = '';

    try {
      if (isEncode) {
        // Base64 UTF-8 seguro
        const bytes = new TextEncoder().encode(raw);
        let binStr = '';
        bytes.forEach(b => binStr += String.fromCharCode(b));
        b64 = btoa(binStr);
        b64Url = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

        // URL
        urlEnc = encodeURIComponent(raw);

        // HTML Entities
        htmlEnt = raw.replace(/[&<>"']/g, m => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[m]));

        // Hex
        hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(' ');

        // Binary
        bin = Array.from(bytes).map(b => b.toString(2).padStart(8, '0')).join(' ');
      } else {
        // Decode
        try {
          const binStr = atob(raw.replace(/-/g, '+').replace(/_/g, '/'));
          const bytes = Uint8Array.from(binStr, c => c.charCodeAt(0));
          b64 = new TextDecoder().decode(bytes);
        } catch (e) { b64 = 'Inválido para Base64'; }

        try {
          urlEnc = decodeURIComponent(raw);
        } catch (e) { urlEnc = 'Inválido para URL decode'; }

        // HTML Entities Decode
        const doc = new DOMParser().parseFromString(raw, 'text/html');
        htmlEnt = doc.documentElement.textContent;

        // Hex Decode
        try {
          const cleanHex = raw.replace(/\s+/g, '');
          if (/^[0-9a-fA-F]+$/.test(cleanHex) && cleanHex.length % 2 === 0) {
            const arr = [];
            for (let i = 0; i < cleanHex.length; i += 2) {
              arr.push(parseInt(cleanHex.substr(i, 2), 16));
            }
            hex = new TextDecoder().decode(new Uint8Array(arr));
          } else {
            hex = 'Hexadecimal inválido';
          }
        } catch (e) { hex = 'Erro ao decodificar Hex'; }
      }

      document.getElementById('out-codec-base64').textContent = b64;
      document.getElementById('out-codec-base64url').textContent = b64Url;
      document.getElementById('out-codec-url').textContent = urlEnc;
      document.getElementById('out-codec-html').textContent = htmlEnt;
      document.getElementById('out-codec-hex').textContent = hex;
      if (document.getElementById('out-codec-bin')) {
        document.getElementById('out-codec-bin').textContent = bin;
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (codecInput) codecInput.addEventListener('input', updateCodec);
  if (codecMode) codecMode.addEventListener('change', updateCodec);

  // ==========================================
  // FERRAMENTA 11: TESTADOR DE REGEX
  // ==========================================
  const regexPattern = document.getElementById('regex-pattern');
  const regexFlags = document.getElementById('regex-flags');
  const regexText = document.getElementById('regex-text');
  const regexReplaceInput = document.getElementById('regex-replace-input');

  function updateRegex() {
    const pat = regexPattern.value || '';
    const flags = regexFlags.value || 'g';
    const text = regexText.value || '';
    const replaceStr = regexReplaceInput ? regexReplaceInput.value : '';

    if (!pat) {
      document.getElementById('regex-highlight').textContent = text;
      document.getElementById('regex-matches-table').innerHTML = '<span class="m">Nenhum padrão informado.</span>';
      if (document.getElementById('out-regex-replaced')) {
        document.getElementById('out-regex-replaced').textContent = text;
      }
      return;
    }

    try {
      const re = new RegExp(pat, flags);
      const matches = Array.from(text.matchAll(re));

      // Highlights
      let highlighted = '';
      let lastIndex = 0;

      for (let m of matches) {
        highlighted += escapeHtml(text.slice(lastIndex, m.index));
        highlighted += `<mark class="regex-match-mark">${escapeHtml(m[0])}</mark>`;
        lastIndex = m.index + m[0].length;
      }
      highlighted += escapeHtml(text.slice(lastIndex));
      document.getElementById('regex-highlight').innerHTML = highlighted;

      // Matches table
      if (matches.length === 0) {
        document.getElementById('regex-matches-table').innerHTML = '<span class="badge badge-amber">Nenhuma correspondência encontrada.</span>';
      } else {
        const rows = matches.map((m, idx) => {
          const groups = m.length > 1 ? Array.from(m).slice(1).map((g, gi) => `\$${gi + 1}: "${escapeHtml(g)}"`).join(', ') : '—';
          return `<tr>
            <td class="key">#${idx + 1} (${m.index}..${m.index + m[0].length})</td>
            <td class="val"><code>${escapeHtml(m[0])}</code></td>
            <td class="val"><small>${groups}</small></td>
          </tr>`;
        }).join('');
        document.getElementById('regex-matches-table').innerHTML = `
          <div style="margin-bottom:0.4rem;"><span class="badge badge-green">✓ ${matches.length} correspondência(s)</span></div>
          <table class="info-table">
            <thead><tr style="text-align:left; color:var(--muted);"><th style="padding:0.4rem;">Posição</th><th style="padding:0.4rem;">Match</th><th style="padding:0.4rem;">Grupos</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        `;
      }

      // Replace preview
      if (document.getElementById('out-regex-replaced')) {
        const replaced = text.replace(re, replaceStr);
        document.getElementById('out-regex-replaced').textContent = replaced;
      }
    } catch (e) {
      document.getElementById('regex-highlight').textContent = text;
      document.getElementById('regex-matches-table').innerHTML = `<span class="badge badge-red">Erro no Regex: ${e.message}</span>`;
    }
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }

  [regexPattern, regexFlags, regexText, regexReplaceInput].forEach(el => {
    if (el) el.addEventListener('input', updateRegex);
  });

  document.querySelectorAll('[data-regex-preset]').forEach(chip => {
    chip.addEventListener('click', () => {
      regexPattern.value = chip.getAttribute('data-regex-preset');
      updateRegex();
    });
  });

  // ==========================================
  // FERRAMENTA 12: COMPARADOR DE TEXTO / DIFF CHECKER
  // ==========================================
  const diffOriginal = document.getElementById('diff-original');
  const diffModified = document.getElementById('diff-modified');
  const diffIgnoreWs = document.getElementById('diff-ignore-ws');

  function computeLcsDiff(origLines, modLines, ignoreWs = false) {
    const normalize = s => (ignoreWs ? s.trim() : s);
    const n = origLines.length;
    const m = modLines.length;

    // LCS Matrix
    const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        if (normalize(origLines[i]) === normalize(modLines[j])) {
          dp[i + 1][j + 1] = dp[i][j] + 1;
        } else {
          dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
        }
      }
    }

    // Backtrack to get diff actions
    let i = n, j = m;
    const diff = [];
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && normalize(origLines[i - 1]) === normalize(modLines[j - 1])) {
        diff.unshift({ type: 'same', text: origLines[i - 1], lineOrig: i, lineMod: j });
        i--; j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        diff.unshift({ type: 'add', text: modLines[j - 1], lineMod: j });
        j--;
      } else if (i > 0) {
        diff.unshift({ type: 'del', text: origLines[i - 1], lineOrig: i });
        i--;
      }
    }
    return diff;
  }

  function updateDiff() {
    const origText = diffOriginal.value || '';
    const modText = diffModified.value || '';
    const ignoreWs = diffIgnoreWs.checked;

    const origLines = origText.split('\n');
    const modLines = modText.split('\n');
    const diff = computeLcsDiff(origLines, modLines, ignoreWs);

    let addedCount = 0;
    let removedCount = 0;

    let splitOrigHtml = '';
    let splitModHtml = '';
    let unifiedHtml = '';

    diff.forEach(item => {
      const esc = escapeHtml(item.text);
      if (item.type === 'same') {
        splitOrigHtml += `<div class="diff-line"><span class="line-num">${item.lineOrig}</span> ${esc}</div>`;
        splitModHtml += `<div class="diff-line"><span class="line-num">${item.lineMod}</span> ${esc}</div>`;
        unifiedHtml += `<div class="diff-line"><span class="line-num">${item.lineMod}</span>   ${esc}</div>`;
      } else if (item.type === 'add') {
        addedCount++;
        splitModHtml += `<div class="diff-line added"><span class="line-num">${item.lineMod}</span>+ ${esc}</div>`;
        unifiedHtml += `<div class="diff-line added"><span class="line-num">${item.lineMod}</span>+ ${esc}</div>`;
      } else if (item.type === 'del') {
        removedCount++;
        splitOrigHtml += `<div class="diff-line removed"><span class="line-num">${item.lineOrig}</span>- ${esc}</div>`;
        unifiedHtml += `<div class="diff-line removed"><span class="line-num">${item.lineOrig}</span>- ${esc}</div>`;
      }
    });

    document.getElementById('diff-stats').innerHTML = `
      <span class="badge badge-green">+${addedCount} adições</span>
      <span class="badge badge-red">-${removedCount} remoções</span>
    `;

    document.getElementById('diff-view-orig').innerHTML = splitOrigHtml || '<span class="m">Vazio</span>';
    document.getElementById('diff-view-mod').innerHTML = splitModHtml || '<span class="m">Vazio</span>';
    document.getElementById('diff-view-unified').innerHTML = unifiedHtml || '<span class="m">Vazio</span>';
  }

  [diffOriginal, diffModified, diffIgnoreWs].forEach(el => {
    if (el) el.addEventListener('input', updateDiff);
  });

  const diffSwapBtn = document.getElementById('diff-swap-btn');
  if (diffSwapBtn) {
    diffSwapBtn.addEventListener('click', () => {
      const tmp = diffOriginal.value;
      diffOriginal.value = diffModified.value;
      diffModified.value = tmp;
      updateDiff();
    });
  }

  // ==========================================
  // FERRAMENTA 13: DECODIFICADOR DE JWT
  // ==========================================
  const jwtInput = document.getElementById('jwt-input');

  function decodeBase64Url(str) {
    let clean = str.replace(/-/g, '+').replace(/_/g, '/');
    while (clean.length % 4) clean += '=';
    const bin = atob(clean);
    const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  function updateJwt() {
    const raw = (jwtInput.value || '').trim();
    if (!raw) {
      document.getElementById('jwt-header-box').textContent = '';
      document.getElementById('jwt-payload-box').textContent = '';
      document.getElementById('jwt-signature-box').textContent = '';
      document.getElementById('jwt-claims-info').innerHTML = '<span class="m">Cole um token JWT para decodificar.</span>';
      return;
    }

    const parts = raw.split('.');
    if (parts.length < 2) {
      document.getElementById('jwt-claims-info').innerHTML = '<span class="badge badge-red">Formato JWT inválido (esperado header.payload.signature)</span>';
      return;
    }

    try {
      const headerJson = JSON.parse(decodeBase64Url(parts[0]));
      const payloadJson = JSON.parse(decodeBase64Url(parts[1]));
      const signature = parts[2] || '';

      document.getElementById('jwt-header-box').textContent = JSON.stringify(headerJson, null, 2);
      document.getElementById('jwt-payload-box').textContent = JSON.stringify(payloadJson, null, 2);
      document.getElementById('jwt-signature-box').textContent = signature;

      // Semantic Claims Inspection
      let claimsHtml = '<table class="info-table">';

      if (headerJson.alg) {
        const isWeak = headerJson.alg === 'none';
        claimsHtml += `<tr><td class="key">Algoritmo (alg)</td><td class="val">${headerJson.alg} ${isWeak ? '<span class="badge badge-red">ALERTA: alg=none inseguro!</span>' : '<span class="badge badge-cyan">OK</span>'}</td></tr>`;
      }

      if (payloadJson.exp) {
        const expDate = new Date(payloadJson.exp * 1000);
        const now = new Date();
        const diffMs = expDate - now;
        const isExpired = diffMs < 0;

        let statusText = '';
        if (isExpired) {
          const hoursAgo = Math.abs(Math.round(diffMs / (1000 * 3600)));
          statusText = `<span class="badge badge-red">EXPIRADO (há ~${hoursAgo}h)</span>`;
        } else {
          const hoursLeft = Math.round(diffMs / (1000 * 3600));
          statusText = `<span class="badge badge-green">VÁLIDO (~${hoursLeft}h restantes)</span>`;
        }

        claimsHtml += `<tr><td class="key">Expiração (exp)</td><td class="val"><code>${expDate.toLocaleString('pt-BR')}</code> ${statusText}</td></tr>`;
      }

      if (payloadJson.iat) {
        const iatDate = new Date(payloadJson.iat * 1000);
        claimsHtml += `<tr><td class="key">Emitido em (iat)</td><td class="val"><code>${iatDate.toLocaleString('pt-BR')}</code></td></tr>`;
      }

      if (payloadJson.iss) claimsHtml += `<tr><td class="key">Emissor (iss)</td><td class="val">${escapeHtml(payloadJson.iss)}</td></tr>`;
      if (payloadJson.sub) claimsHtml += `<tr><td class="key">Sujeito (sub)</td><td class="val"><code>${escapeHtml(payloadJson.sub)}</code></td></tr>`;
      if (payloadJson.aud) claimsHtml += `<tr><td class="key">Audiência (aud)</td><td class="val">${escapeHtml(String(payloadJson.aud))}</td></tr>`;

      claimsHtml += '</table>';
      document.getElementById('jwt-claims-info').innerHTML = claimsHtml;

    } catch (e) {
      document.getElementById('jwt-claims-info').innerHTML = `<span class="badge badge-red">Erro ao decodificar JSON do token: ${e.message}</span>`;
    }
  }

  if (jwtInput) jwtInput.addEventListener('input', updateJwt);

  // ==========================================
  // FERRAMENTA 14: GERADOR DE HASHES (SHA & MD5)
  // ==========================================
  const hashInput = document.getElementById('hash-text-input');
  const hashFileInput = document.getElementById('hash-file-input');
  const hashCompareInput = document.getElementById('hash-compare-input');

  // Pure JS MD5 Implementation (fast & self-contained)
  function md5(string) {
    function rotateLeft(lValue, iShiftBits) {
      return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    }
    function addUnsigned(lX, lY) {
      let lX4 = (lX & 0x40000000);
      let lY4 = (lY & 0x40000000);
      let lX8 = (lX & 0x80000000);
      let lY8 = (lY & 0x80000000);
      let lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
      if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
      if (lX4 | lY4) {
        if (lResult & 0x40000000) return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
        else return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
      } else return (lResult ^ lX8 ^ lY8);
    }
    function F(x, y, z) { return (x & y) | ((~x) & z); }
    function G(x, y, z) { return (x & z) | (y & (~z)); }
    function H(x, y, z) { return (x ^ y ^ z); }
    function I(x, y, z) { return (y ^ (x | (~z))); }
    function FF(a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    }
    function GG(a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    }
    function HH(a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    }
    function II(a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    }

    let x = [];
    let k, AA, BB, CC, DD, a, b, c, d;
    let S11 = 7, S12 = 12, S13 = 17, S14 = 22;
    let S21 = 5, S22 = 9, S23 = 14, S24 = 20;
    let S31 = 4, S32 = 11, S33 = 16, S34 = 23;
    let S41 = 6, S42 = 10, S43 = 15, S44 = 21;

    let str = new TextEncoder().encode(string);
    let strLen = str.length;

    let nwords = (((strLen + 8) >>> 6) + 1) * 16;
    for (let i = 0; i < nwords; i++) x[i] = 0;
    for (let i = 0; i < strLen; i++) {
      x[i >>> 2] |= (str[i] & 255) << ((i % 4) * 8);
    }
    x[strLen >>> 2] |= 0x80 << ((strLen % 4) * 8);
    x[nwords - 2] = (strLen * 8) & 0xFFFFFFFF;
    x[nwords - 1] = Math.floor((strLen * 8) / 0x100000000);

    a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;

    for (k = 0; k < nwords; k += 16) {
      AA = a; BB = b; CC = c; DD = d;
      a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
      d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
      c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
      b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
      a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
      d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
      c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
      b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
      a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
      d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
      c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
      b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
      a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
      d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
      c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
      b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);

      a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
      d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
      c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
      b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
      a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
      d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
      c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
      b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
      a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
      d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
      c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
      b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
      a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
      d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
      c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
      b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);

      a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
      d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
      c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
      b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
      a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
      d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
      c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
      b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
      a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
      d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
      c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
      b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
      a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
      d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
      c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
      b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);

      a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
      d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
      c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
      b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
      a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
      d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
      c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
      b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
      a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
      d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
      c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
      b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
      a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
      d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
      c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
      b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);

      a = addUnsigned(a, AA);
      b = addUnsigned(b, BB);
      c = addUnsigned(c, CC);
      d = addUnsigned(d, DD);
    }

    const wordToHex = lValue => {
      let wordToHexValue = '', wordToHexValueTemp = '', lByte, lCount;
      for (lCount = 0; lCount <= 3; lCount++) {
        lByte = (lValue >>> (lCount * 8)) & 255;
        wordToHexValueTemp = '0' + lByte.toString(16);
        wordToHexValue += wordToHexValueTemp.substr(wordToHexValueTemp.length - 2, 2);
      }
      return wordToHexValue;
    };
    return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
  }

  async function computeHashes(buffer) {
    const hex = (buf) => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');

    const sha1Buf = await crypto.subtle.digest('SHA-1', buffer);
    const sha256Buf = await crypto.subtle.digest('SHA-256', buffer);
    const sha384Buf = await crypto.subtle.digest('SHA-384', buffer);
    const sha512Buf = await crypto.subtle.digest('SHA-512', buffer);

    const text = new TextDecoder().decode(buffer);
    const md5Val = md5(text);

    const s1 = hex(sha1Buf);
    const s256 = hex(sha256Buf);
    const s384 = hex(sha384Buf);
    const s512 = hex(sha512Buf);

    document.getElementById('out-hash-md5').textContent = md5Val;
    document.getElementById('out-hash-sha1').textContent = s1;
    document.getElementById('out-hash-sha256').textContent = s256;
    document.getElementById('out-hash-sha384').textContent = s384;
    document.getElementById('out-hash-sha512').textContent = s512;

    checkHashMatch([md5Val, s1, s256, s384, s512]);
  }

  function checkHashMatch(generatedList) {
    const compare = (hashCompareInput.value || '').trim().toLowerCase();
    const resultEl = document.getElementById('hash-compare-result');
    if (!compare) {
      resultEl.innerHTML = '';
      return;
    }
    const match = generatedList.find(h => h.toLowerCase() === compare);
    if (match) {
      resultEl.innerHTML = '<span class="badge badge-green">✓ Hash correspondente encontrado! Integridade verificada.</span>';
    } else {
      resultEl.innerHTML = '<span class="badge badge-red">✗ Nenhum hash gerado corresponde ao informado.</span>';
    }
  }

  function updateHashesFromText() {
    const text = hashInput.value || '';
    const buf = new TextEncoder().encode(text);
    computeHashes(buf);
  }

  if (hashInput) hashInput.addEventListener('input', updateHashesFromText);
  if (hashCompareInput) hashCompareInput.addEventListener('input', updateHashesFromText);

  if (hashFileInput) {
    hashFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        computeHashes(evt.target.result);
      };
      reader.readAsArrayBuffer(file);
    });
  }

  // ==========================================
  // FERRAMENTA 15: GERADOR DE SENHAS & PASSPHRASES
  // ==========================================
  const pwdLength = document.getElementById('pwd-length');
  const pwdLengthVal = document.getElementById('pwd-length-val');
  const pwdUpper = document.getElementById('pwd-upper');
  const pwdLower = document.getElementById('pwd-lower');
  const pwdNumbers = document.getElementById('pwd-numbers');
  const pwdSymbols = document.getElementById('pwd-symbols');
  const pwdNoAmbiguous = document.getElementById('pwd-no-ambiguous');
  const pwdOut = document.getElementById('pwd-out');
  const pwdEntropy = document.getElementById('pwd-entropy');

  const phraseCount = document.getElementById('phrase-count');
  const phraseSep = document.getElementById('phrase-sep');
  const phraseCapitalize = document.getElementById('phrase-capitalize');
  const phraseOut = document.getElementById('phrase-out');

  // Wordlist para Passphrase Diceware em Português
  const wordlistPT = [
    'sol', 'lua', 'mar', 'rio', 'serra', 'vento', 'fogo', 'pedra', 'floresta', 'estrela',
    'porto', 'ponte', 'barco', 'navio', 'trem', 'estrada', 'caminho', 'farol', 'nuvem', 'chuva',
    'tempo', 'relogio', 'noite', 'tarde', 'aurora', 'inverno', 'verao', 'outono', 'primavera',
    'chave', 'cofre', 'livro', 'papel', 'carta', 'selo', 'tinta', 'pena', 'mapa', 'bussola',
    'janela', 'porta', 'parede', 'teto', 'chao', 'sala', 'torre', 'castelo', 'jardim', 'campo',
    'cafe', 'pao', 'mel', 'fruta', 'trigo', 'vinho', 'azeite', 'agua', 'sal', 'folha',
    'amigo', 'leao', 'lobo', 'aguia', 'falcao', 'urso', 'tigre', 'corvo', 'golfinho', 'baleia'
  ];

  function generateSecureRandomInt(max) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] % max;
  }

  function generatePassword() {
    const len = parseInt(pwdLength.value, 10);
    pwdLengthVal.textContent = len;

    let chars = '';
    let poolSize = 0;

    if (pwdLower.checked) { chars += 'abcdefghijklmnopqrstuvwxyz'; poolSize += 26; }
    if (pwdUpper.checked) { chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; poolSize += 26; }
    if (pwdNumbers.checked) { chars += '0123456789'; poolSize += 10; }
    if (pwdSymbols.checked) { chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'; poolSize += 27; }

    if (pwdNoAmbiguous.checked) {
      chars = chars.replace(/[0O1lI|]/g, '');
      poolSize = chars.length;
    }

    if (!chars) {
      pwdOut.value = 'Selecione ao menos um tipo de caractere';
      pwdEntropy.textContent = '0 bits';
      return;
    }

    let pass = '';
    for (let i = 0; i < len; i++) {
      pass += chars[generateSecureRandomInt(chars.length)];
    }
    pwdOut.value = pass;

    // Entropy calculation
    const entropy = Math.round(len * Math.log2(poolSize));
    let strength = 'Fraca';
    let badgeClass = 'badge-red';
    if (entropy >= 80) { strength = 'Muitíssimo Forte'; badgeClass = 'badge-green'; }
    else if (entropy >= 60) { strength = 'Forte'; badgeClass = 'badge-green'; }
    else if (entropy >= 45) { strength = 'Média'; badgeClass = 'badge-amber'; }

    pwdEntropy.innerHTML = `<span class="badge ${badgeClass}">${strength} · ${entropy} bits de entropia</span>`;
  }

  function generatePassphrase() {
    const count = parseInt(phraseCount.value, 10);
    const sep = phraseSep.value;
    const capitalize = phraseCapitalize.checked;

    let words = [];
    for (let i = 0; i < count; i++) {
      let w = wordlistPT[generateSecureRandomInt(wordlistPT.length)];
      if (capitalize) w = w.charAt(0).toUpperCase() + w.slice(1);
      words.push(w);
    }
    phraseOut.value = words.join(sep);
  }

  function generateRandomTokens() {
    // Hex 32 bytes (256 bits)
    const b32 = new Uint8Array(32);
    crypto.getRandomValues(b32);
    const hex32 = Array.from(b32).map(b => b.toString(16).padStart(2, '0')).join('');

    // Base64 URL token 32 bytes
    let binStr = '';
    b32.forEach(b => binStr += String.fromCharCode(b));
    const b64 = btoa(binStr).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    // UUID v4
    const uuid = crypto.randomUUID ? crypto.randomUUID() : 'N/A';

    document.getElementById('out-token-hex').textContent = hex32;
    document.getElementById('out-token-b64').textContent = b64;
    document.getElementById('out-token-uuid').textContent = uuid;
  }

  if (pwdLength) pwdLength.addEventListener('input', generatePassword);
  [pwdUpper, pwdLower, pwdNumbers, pwdSymbols, pwdNoAmbiguous].forEach(el => {
    if (el) el.addEventListener('change', generatePassword);
  });
  const pwdGenBtn = document.getElementById('pwd-gen-btn');
  if (pwdGenBtn) pwdGenBtn.addEventListener('click', generatePassword);

  if (phraseCount) phraseCount.addEventListener('input', generatePassphrase);
  if (phraseSep) phraseSep.addEventListener('input', generatePassphrase);
  if (phraseCapitalize) phraseCapitalize.addEventListener('change', generatePassphrase);
  const phraseGenBtn = document.getElementById('phrase-gen-btn');
  if (phraseGenBtn) phraseGenBtn.addEventListener('click', generatePassphrase);

  const tokenGenBtn = document.getElementById('token-gen-btn');
  if (tokenGenBtn) tokenGenBtn.addEventListener('click', generateRandomTokens);

  // ==========================================
  // FERRAMENTA 16: INSPETOR DE CERTIFICADOS X.509 (PEM)
  // Com Suporte a Cadeia (Chain), Subject/Issuer Detalhados, Propriedades Estendidas
  // e Validação Estrita de Ordem de Servidor (RFC 5280)
  // ==========================================
  const x509Input = document.getElementById('x509-input');
  let x509State = {
    certs: [],
    activeIdx: 0,
    chainLinks: [],
    chainStatus: null,
    orderValidation: null
  };

  const X509_SAMPLE_LEAF = `-----BEGIN CERTIFICATE-----
MIIEEjCCAvqgAwIBAgIUFt5fLW8VjcChkkSMX4qBzVhgtjgwDQYJKoZIhvcNAQEL
BQAwTDELMAkGA1UEBhMCQlIxGjAYBgNVBAoMEUNhbml2ZXRlIFNlY3VyaXR5MSEw
HwYDVQQDDBhDYW5pdmV0ZSBJbnRlcm1lZGlhdGUgQ0EwHhcNMjYxMTEyMTQwMDA2
WhcNMjcxMTEyMTQwMDA2WjBuMQswCQYDVQQGEwJCUjELMAkGA1UECAwCU1AxEjAQ
BgNVBAcMCVNhbyBQYXVsbzEXMBUGA1UECgwOR3VpIE5ldmVzIENvcnAxCzAJBgNV
BAsMAklUMRgwFgYDVQQDDA9ndWluZXZlcy5jb20uYnIwggEiMA0GCSqGSIb3DQEB
AQUAA4IBDwAwggEKAoIBAQDF6xJqsDgkzCIdo58GVrlkxTO6PYPNplWBABFHyPU6
0o2EkLQVTT/ljrlZKCo4On+yE36T3iTVFOs7mIXPfVifflRF287mGEDAJ99A8j7U
u7CxMhvkX4esl9Ss1z5bmydLKOtJNeMuNLiTxgxWDlwx2jAPFDdnwzTr2tLtzD8W
6POR0c34m1hBiJ/UiHFxoBcu2e6DYtXbrRue2hQiK8G1cA3V1K11L07P3D8EY5j+
EN8UHdXAHSzmfKIRaIqvMkv2GT4XLdGHHlPIQEg0Z6GYH5WQln0I6or9th+fBAPi
tD2Dek2CkC0c/6AjefaBa7WwwafuabuHUyp4P3XaXMv7AgMBAAGjgckwgcYwCQYD
VR0TBAIwADALBgNVHQ8EBAMCBaAwHQYDVR0lBBYwFAYIKwYBBQUHAwEGCCsGAQUF
BwMCME0GA1UdEQRGMESCD2d1aW5ldmVzLmNvbS5icoIRKi5ndWluZXZlcy5jb20u
YnKCGGNhbml2ZXRlLmd1aW5ldmVzLmNvbS5icocEfwAAATAdBgNVHQ4EFgQUPXIB
4DmXDPPWtmt8C57k083mDG4wHwYDVR0jBBgwFoAUKZ87F1zX3wFYoBfnyQwYlV/w
6lEwDQYJKoZIhvcNAQELBQADggEBAIuVj+td1+mlf3VZPvPUGRrOsZTN0dR0dhKc
7Vq+bmBpapQNaVHRlzwO3viLywAJmCsrWY8meRTaxH3TrFlJxvHXd+6B0llYHP+s
z5r57aYcqad/a5ziS7KkZpPY5UvYK8t8HCVoef87XEIWBapemIA5Z/mUqU3b4jGV
nRUXzfrcU55THaBrDW2AdsvctokhLM0iDk29lJ3ah3fxcKnHJlpSqkgd8mhnHepC
fuOZSzI0/pITqS4NcguoJbXQkNGrNoo3HqAY76IBoslbptYjVwPlXqR+KNelLJHe
j1eLkBUV2X+hdjdf0z1XspOs1Cyfey3eR76dRsiMDgpmZ8kaLz4=
-----END CERTIFICATE-----`;

  const X509_SAMPLE_INTER = `-----BEGIN CERTIFICATE-----
MIIDhDCCAmygAwIBAgIUK00bmxlRbYo1gCxIXXlTP/T61WYwDQYJKoZIhvcNAQEL
BQAwRDELMAkGA1UEBhMCQlIxGjAYBgNVBAoMEUNhbml2ZXRlIFNlY3VyaXR5MRkw
FwYDVQQDDBBDYW5pdmV0ZSBSb290IENBMB4XDTI2MTExMjE0MDAwNloXDTMxMTEx
MTE0MDAwNlowTDELMAkGA1UEBhMCQlIxGjAYBgNVBAoMEUNhbml2ZXRlIFNlY3Vy
aXR5MSEwHwYDVQQDDBhDYW5pdmV0ZSBJbnRlcm1lZGlhdGUgQ0EwggEiMA0GCSqG
SIb3DQEBAQUAA4IBDwAwggEKAoIBAQDLHZ/R4vYW+cfrGfBnfeqxiqpY/D84eHEE
4NJr+VZcnjQIOg7/blNFt9KMHzs+BQoOvElz3gql8D+7HLmaH0Su4boXg1gyZTR1
z35ZHDi+eNiKpP+dEQSTm37pRojSviH3czvVgiHoy9FQqngxFUK7/e+mlPMuv+Kg
1wSFrw2ct7Z4m9VgCMK/V9vToxZMIlRqUF4sbGucn/UxeUBgJe9CC+XZS1N5g4lk
4xAgvVzeWzBbFN9o2UawytISo9WYgtEGkHqZEyNvirDo4pFQpgv8TD6hg1+gGo3D
mrS0pKJypmJj5BQs2JyTOCbM+bJ88dEeh1Gw1aOSekjSSFg0X4YBAgMBAAGjZjBk
MBIGA1UdEwEB/wQIMAYBAf8CAQAwDgYDVR0PAQH/BAQDAgEGMB0GA1UdDgQWBBQp
nzsXXNffAVigF+fJDBiVX/DqUTAfBgNVHSMEGDAWgBR9q5RD83sX75AKokK7QxcS
9fDXPDANBgkqhkiG9w0BAQsFAAOCAQEAD+i92Ant11ykhLPwlPsuynu1rX76NDU8
QDV3g4w4mIxn7tJkGBT5cJisC7f/HpgzYkW1U0u/IPsOVG+gYhH/VhTwvzpM7fny
LcN4FBCRlS1OkUMoWXYE62uV9MKzZCBjNklyqf/n2rTLo4mA3ZodjNlxA0ksnV6b
lU/UYcdFwJzINhAtmuy2VuMp+QrwjpQO4iwq4mEtj5kuz5hHwB+ye/kUC2b/qyhG
KziXCliolWfgWubD+VERuF0UjX6Xky96Ltv2K75E+K9UDq5wCYXJWKE3OAdvZSwu
5BxkZsGcBywLHY6C+1k8lhTGFSlw57EcpJTqI+pjMNKzhYEwgsypIQ==
-----END CERTIFICATE-----`;

  const X509_SAMPLE_ROOT = `-----BEGIN CERTIFICATE-----
MIIDWDCCAkCgAwIBAgIUQ7yrLlz6YZbYD0f/WTgm/+9zpQ0wDQYJKoZIhvcNAQEL
BQAwRDELMAkGA1UEBhMCQlIxGjAYBgNVBAoMEUNhbml2ZXRlIFNlY3VyaXR5MRkw
FwYDVQQDDBBDYW5pdmV0ZSBSb290IENBMB4XDTI2MTExMjE0MDAwNloXDTM2MTEw
OTE0MDAwNlowRDELMAkGA1UEBhMCQlIxGjAYBgNVBAoMEUNhbml2ZXRlIFNlY3Vy
aXR5MRkwFwYDVQQDDBBDYW5pdmV0ZSBSb290IENBMIIBIjANBgkqhkiG9w0BAQEF
AAOCAQ8AMIIBCgKCAQEAyrFNEulbtQGXaaE9lvAk7N5DegmmiXSWqG1gm/JReRHY
q7YdA5YMZybf6K4J6OtMCxxiTd0lUoPupEvfv82Rf4LOL0sUCyC7pO11XxrJoC1Q
ghuynVKfxu5GTm35vKWt1C2LgUMhecYDE72AeQAx0r4gSZ1fB5FZf1NbEkcH0cmF
wxOO5KEQOW5OuCEMg7Vj/HQ8yQ1xom72h+Itg2p84BjJFm+HYP6ZDuAbzScHGUB7
zSpn3HcVBJssz/KMAbKJKcUe9cQZqnV07iIUfEGm8xl2J1V7JXZw9dV2t8Pz/+ON
OKzcf1IKuXZkdb97nCGcSu8Yx+5MEhL0a7wIso1ewwIDAQABo0IwQDAdBgNVHQ4E
FgQUfauUQ/N7F++QCqJCu0MXEvXw1zwwDwYDVR0TAQH/BAUwAwEB/zAOBgNVHQ8B
Af8EBAMCAQYwDQYJKoZIhvcNAQELBQADggEBAFGdGRHKJWM/vRGwVQNji2FGz9h+
/YOGzBu4jq6H1BIsCgdT52fqJUBZ1mGhNT2DPFgfux2BiyBGF6jZ1EMsKKWOG4DK
ADivAd5ISPy4HmTu3N7CPIRGlW0AsLyVFCBfhYdRLOqx2Lw3sOzrJy64FNnhummI
Eonp77aId8Sdi/0owsrvKJ4Fk9zFC0Xxjdwbu9c7o8RtqmR/nqXGxQ6djjZVXC+w
p1R2nIuvMB0r12SWQ65JvUD0CekVhGWHn9K/+Ccj9ZcK0bP0tbFkxv7G68flpGUo
obYMXANyDfPkYl+u4iaagrmXqpmf5yriyjJ1sKQ5lFitPY5/TYHLnJESi8s=
-----END CERTIFICATE-----`;

  const X509_OID_NAMES = {
    '2.5.4.3': 'CN',
    '2.5.4.6': 'C',
    '2.5.4.7': 'L',
    '2.5.4.8': 'ST',
    '2.5.4.10': 'O',
    '2.5.4.11': 'OU',
    '2.5.4.5': 'serialNumber',
    '1.2.840.113549.1.9.1': 'emailAddress',
    '1.2.840.113549.1.1.1': 'RSA Encryption',
    '1.2.840.113549.1.1.5': 'SHA-1 with RSA',
    '1.2.840.113549.1.1.11': 'SHA-256 with RSA',
    '1.2.840.113549.1.1.12': 'SHA-384 with RSA',
    '1.2.840.113549.1.1.13': 'SHA-512 with RSA',
    '1.2.840.10045.2.1': 'EC Public Key',
    '1.2.840.10045.4.3.2': 'ECDSA with SHA-256',
    '1.2.840.10045.4.3.3': 'ECDSA with SHA-384',
    '1.2.840.10045.3.1.7': 'secp256r1 (P-256)',
    '1.3.132.0.34': 'secp384r1 (P-384)',
    '2.5.29.14': 'Subject Key Identifier (SKI)',
    '2.5.29.15': 'Key Usage',
    '2.5.29.17': 'Subject Alternative Name (SAN)',
    '2.5.29.19': 'Basic Constraints',
    '2.5.29.31': 'CRL Distribution Points',
    '2.5.29.32': 'Certificate Policies',
    '2.5.29.35': 'Authority Key Identifier (AKI)',
    '2.5.29.37': 'Extended Key Usage (EKU)',
    '1.3.6.1.5.5.7.1.1': 'Authority Info Access (AIA)'
  };

  const X509_RDN_LABELS = {
    'CN': 'Common Name (Nome Comum)',
    'O': 'Organization (Organização)',
    'OU': 'Organizational Unit (Unidade Org.)',
    'C': 'Country (País)',
    'ST': 'State / Province (Estado)',
    'L': 'Locality / City (Cidade / Localidade)',
    'serialNumber': 'Número de Série',
    'emailAddress': 'E-mail'
  };

  const X509_EKU_NAMES = {
    '1.3.6.1.5.5.7.3.1': 'Autenticação de Servidor TLS / Web Server (serverAuth)',
    '1.3.6.1.5.5.7.3.2': 'Autenticação de Cliente TLS (clientAuth)',
    '1.3.6.1.5.5.7.3.3': 'Assinatura de Código (codeSigning)',
    '1.3.6.1.5.5.7.3.4': 'Proteção de E-mail / S-MIME (emailProtection)',
    '1.3.6.1.5.5.7.3.8': 'Carimbo de Data/Hora (timeStamping)',
    '1.3.6.1.5.5.7.3.9': 'Assinatura de Resposta OCSP (OCSPSigning)'
  };

  function x509ParseAsn1(bytes) {
    let offset = 0;
    function readByte() {
      if (offset >= bytes.length) throw new Error('Fim inesperado dos dados ASN.1');
      return bytes[offset++];
    }
    function readLength() {
      let len = readByte();
      if (len & 0x80) {
        const numBytes = len & 0x7F;
        len = 0;
        for (let i = 0; i < numBytes; i++) {
          len = (len << 8) | readByte();
        }
      }
      return len;
    }
    const nodes = [];
    while (offset < bytes.length) {
      const nodeStart = offset;
      const tag = readByte();
      const len = readLength();
      const valStart = offset;
      const valEnd = offset + len;
      if (valEnd > bytes.length) throw new Error('Comprimento ASN.1 excede os limites');
      offset = valEnd;
      nodes.push({ tag, len, bytes: bytes.slice(valStart, valEnd), rawBytes: bytes.slice(nodeStart, valEnd) });
    }
    return nodes;
  }

  function x509ParseOid(bytes) {
    const parts = [];
    if (!bytes || bytes.length === 0) return '';
    const first = bytes[0];
    parts.push(Math.floor(first / 40));
    parts.push(first % 40);

    let val = 0;
    for (let i = 1; i < bytes.length; i++) {
      const b = bytes[i];
      val = (val << 7) | (b & 0x7F);
      if ((b & 0x80) === 0) {
        parts.push(val);
        val = 0;
      }
    }
    return parts.join('.');
  }

  function x509DecodeString(tag, bytes) {
    if (tag === 0x1E) return new TextDecoder('utf-16be').decode(bytes);
    if (tag === 0x0C) return new TextDecoder('utf-8').decode(bytes);
    return new TextDecoder('latin1').decode(bytes);
  }

  function x509ParseRDN(bytes) {
    const sets = x509ParseAsn1(bytes);
    const result = [];
    for (const setNode of sets) {
      const seqs = x509ParseAsn1(setNode.bytes);
      for (const seq of seqs) {
        const parts = x509ParseAsn1(seq.bytes);
        if (parts.length >= 2 && parts[0].tag === 0x06) {
          const oid = x509ParseOid(parts[0].bytes);
          const valStr = x509DecodeString(parts[1].tag, parts[1].bytes);
          const name = X509_OID_NAMES[oid] || oid;
          result.push({ oid, name, value: valStr });
        }
      }
    }
    return result;
  }

  function x509RdnToString(rdns) {
    return rdns.map(r => `${r.name}=${r.value}`).join(', ');
  }

  function x509ParseDate(str) {
    let y, m, d, h, min, s;
    if (str.length <= 13) {
      let yr = parseInt(str.substr(0, 2), 10);
      y = yr < 50 ? 2000 + yr : 1900 + yr;
      m = parseInt(str.substr(2, 2), 10) - 1;
      d = parseInt(str.substr(4, 2), 10);
      h = parseInt(str.substr(6, 2), 10);
      min = parseInt(str.substr(8, 2), 10);
      s = parseInt(str.substr(10, 2), 10);
    } else {
      y = parseInt(str.substr(0, 4), 10);
      m = parseInt(str.substr(4, 2), 10) - 1;
      d = parseInt(str.substr(6, 2), 10);
      h = parseInt(str.substr(8, 2), 10);
      min = parseInt(str.substr(10, 2), 10);
      s = parseInt(str.substr(12, 2), 10);
    }
    return new Date(Date.UTC(y, m, d, h, min, s));
  }

  function x509DerToP1363(derSig, keySize = 32) {
    try {
      const parts = x509ParseAsn1(derSig);
      const seq = x509ParseAsn1(parts[0].bytes);
      function toFixed(b) {
        let raw = b;
        while (raw.length > keySize && raw[0] === 0) raw = raw.slice(1);
        if (raw.length > keySize) raw = raw.slice(raw.length - keySize);
        const out = new Uint8Array(keySize);
        out.set(raw, keySize - raw.length);
        return out;
      }
      const r = toFixed(seq[0].bytes);
      const s = toFixed(seq[1].bytes);
      const res = new Uint8Array(keySize * 2);
      res.set(r, 0);
      res.set(s, keySize);
      return res;
    } catch (e) {
      return derSig;
    }
  }

  async function parseSingleX509(pem, index) {
    const b64 = pem
      .replace(/-----BEGIN CERTIFICATE-----/, '')
      .replace(/-----END CERTIFICATE-----/, '')
      .replace(/\s+/g, '');
    const binStr = atob(b64);
    const bytes = Uint8Array.from(binStr, c => c.charCodeAt(0));

    const certSeq = x509ParseAsn1(bytes)[0];
    const certParts = x509ParseAsn1(certSeq.bytes);
    const tbs = certParts[0];
    const sigAlgNode = certParts[1];
    const sigValNode = certParts[2];

    let tbsParts = x509ParseAsn1(tbs.bytes);
    let pIdx = 0;
    let version = 1;
    if (tbsParts[0].tag === 0xA0) {
      const vNode = x509ParseAsn1(tbsParts[0].bytes)[0];
      version = (vNode.bytes[0] || 0) + 1;
      pIdx++;
    }
    const serialNode = tbsParts[pIdx++];
    const serialHex = Array.from(serialNode.bytes).map(b => b.toString(16).padStart(2, '0')).join(':').toUpperCase();

    const algSeq = x509ParseAsn1(tbsParts[pIdx++].bytes);
    const sigAlgOid = x509ParseOid(algSeq[0].bytes);
    const sigAlgName = X509_OID_NAMES[sigAlgOid] || sigAlgOid;

    const issuerNode = tbsParts[pIdx++];
    const issuerRdn = x509ParseRDN(issuerNode.bytes);
    const issuerDN = x509RdnToString(issuerRdn);

    const validitySeq = x509ParseAsn1(tbsParts[pIdx++].bytes);
    const nbStr = new TextDecoder().decode(validitySeq[0].bytes);
    const naStr = new TextDecoder().decode(validitySeq[1].bytes);
    const notBefore = x509ParseDate(nbStr);
    const notAfter = x509ParseDate(naStr);

    const subjectNode = tbsParts[pIdx++];
    const subjectRdn = x509ParseRDN(subjectNode.bytes);
    const subjectDN = x509RdnToString(subjectRdn);

    const spkiNode = tbsParts[pIdx++];
    const spkiParts = x509ParseAsn1(spkiNode.bytes);
    const spkiAlgSeq = x509ParseAsn1(spkiParts[0].bytes);
    const spkiOid = x509ParseOid(spkiAlgSeq[0].bytes);
    let spkiAlgName = X509_OID_NAMES[spkiOid] || spkiOid;
    let keyBitLength = 0;

    if (spkiOid === '1.2.840.113549.1.1.1') { // RSA
      try {
        const rsaKeySeq = x509ParseAsn1(spkiParts[1].bytes.slice(1))[0];
        const rsaModulus = x509ParseAsn1(rsaKeySeq.bytes)[0];
        keyBitLength = (rsaModulus.bytes[0] === 0 ? rsaModulus.bytes.length - 1 : rsaModulus.bytes.length) * 8;
        spkiAlgName = `RSA (${keyBitLength} bits)`;
      } catch (err) {
        spkiAlgName = 'RSA';
      }
    } else if (spkiOid === '1.2.840.10045.2.1') { // EC
      if (spkiAlgSeq.length > 1 && spkiAlgSeq[1].tag === 0x06) {
        const curveOid = x509ParseOid(spkiAlgSeq[1].bytes);
        spkiAlgName = `ECC (${X509_OID_NAMES[curveOid] || curveOid})`;
      } else {
        spkiAlgName = 'ECC (Curva Elíptica)';
      }
    }

    // Parse Extensions
    const extensions = [];
    let isCA = false;
    let pathLen = null;
    let sans = [];
    let keyUsages = [];
    let ekus = [];
    let ski = null;
    let aki = null;
    let ocspUrls = [];
    let caIssuersUrls = [];
    let crlUrls = [];

    while (pIdx < tbsParts.length) {
      const cur = tbsParts[pIdx++];
      if (cur.tag === 0xA3) { // [3] Extensions
        const extSeq = x509ParseAsn1(cur.bytes)[0];
        const extItems = x509ParseAsn1(extSeq.bytes);
        for (const ext of extItems) {
          const parts = x509ParseAsn1(ext.bytes);
          const oid = x509ParseOid(parts[0].bytes);
          const name = X509_OID_NAMES[oid] || oid;
          let isCrit = false;
          let octetNode = parts[parts.length - 1];
          if (parts.length >= 3 && parts[1].tag === 0x01) {
            isCrit = parts[1].bytes[0] !== 0;
          }

          const innerBytes = octetNode.bytes;
          let details = null;

          if (oid === '2.5.29.19') { // Basic Constraints
            try {
              const bc = x509ParseAsn1(innerBytes)[0];
              if (bc) {
                const bcParts = x509ParseAsn1(bc.bytes);
                bcParts.forEach(b => {
                  if (b.tag === 0x01) isCA = b.bytes[0] !== 0;
                  if (b.tag === 0x02) pathLen = b.bytes[0];
                });
              }
              details = `CA: ${isCA ? 'SIM' : 'NÃO'}${pathLen !== null ? `, PathLen: ${pathLen}` : ''}`;
            } catch (e) {}
          } else if (oid === '2.5.29.15') { // Key Usage
            try {
              const parsed = x509ParseAsn1(innerBytes)[0];
              if (parsed && parsed.tag === 0x03) {
                const b0 = parsed.bytes[1] || 0;
                const b1 = parsed.bytes[2] || 0;
                if (b0 & 0x80) keyUsages.push('digitalSignature (Assinatura)');
                if (b0 & 0x40) keyUsages.push('nonRepudiation (Não-repúdio)');
                if (b0 & 0x20) keyUsages.push('keyEncipherment (Cifra de Chaves)');
                if (b0 & 0x10) keyUsages.push('dataEncipherment (Cifra de Dados)');
                if (b0 & 0x08) keyUsages.push('keyAgreement (Acordo de Chaves)');
                if (b0 & 0x04) keyUsages.push('keyCertSign (Assinar Certificados)');
                if (b0 & 0x02) keyUsages.push('cRLSign (Assinar CRL)');
                if (b0 & 0x01) keyUsages.push('encipherOnly');
                if (b1 & 0x80) keyUsages.push('decipherOnly');
              }
              details = keyUsages.join(', ');
            } catch (e) {}
          } else if (oid === '2.5.29.37') { // EKU
            try {
              const parsed = x509ParseAsn1(innerBytes)[0];
              if (parsed) {
                const items = x509ParseAsn1(parsed.bytes);
                ekus = items.map(it => {
                  const ekuOid = x509ParseOid(it.bytes);
                  return X509_EKU_NAMES[ekuOid] || X509_OID_NAMES[ekuOid] || ekuOid;
                });
              }
              details = ekus.join(', ');
            } catch (e) {}
          } else if (oid === '2.5.29.17') { // SAN
            try {
              const parsed = x509ParseAsn1(innerBytes)[0];
              if (parsed) {
                const items = x509ParseAsn1(parsed.bytes);
                sans = items.map(it => {
                  const tag = it.tag;
                  if (tag === 0x82) return `DNS:${new TextDecoder().decode(it.bytes)}`;
                  if (tag === 0x81) return `Email:${new TextDecoder().decode(it.bytes)}`;
                  if (tag === 0x86) return `URI:${new TextDecoder().decode(it.bytes)}`;
                  if (tag === 0x87) {
                    if (it.bytes.length === 4) return `IP:${Array.from(it.bytes).join('.')}`;
                    if (it.bytes.length === 16) {
                      const p = [];
                      for (let k = 0; k < 16; k += 2) p.push(((it.bytes[k] << 8) | it.bytes[k + 1]).toString(16));
                      return `IP:${p.join(':')}`;
                    }
                  }
                  return `Tag(0x${tag.toString(16)}):${Array.from(it.bytes).map(b => b.toString(16).padStart(2, '0')).join('')}`;
                });
              }
              details = sans.join(', ');
            } catch (e) {}
          } else if (oid === '2.5.29.14') { // SKI
            try {
              const parsed = x509ParseAsn1(innerBytes)[0];
              const oct = (parsed && parsed.tag === 0x04) ? parsed.bytes : innerBytes;
              ski = Array.from(oct).map(b => b.toString(16).padStart(2, '0')).join(':').toUpperCase();
              details = ski;
            } catch (e) {}
          } else if (oid === '2.5.29.35') { // AKI
            try {
              const parsed = x509ParseAsn1(innerBytes)[0];
              if (parsed) {
                const items = x509ParseAsn1(parsed.bytes);
                items.forEach(it => {
                  if (it.tag === 0x80) {
                    aki = Array.from(it.bytes).map(b => b.toString(16).padStart(2, '0')).join(':').toUpperCase();
                  }
                });
              }
              details = aki;
            } catch (e) {}
          } else if (oid === '1.3.6.1.5.5.7.1.1') { // AIA
            try {
              const parsed = x509ParseAsn1(innerBytes)[0];
              if (parsed) {
                const items = x509ParseAsn1(parsed.bytes);
                items.forEach(item => {
                  const desc = x509ParseAsn1(item.bytes);
                  if (desc.length >= 2) {
                    const methOid = x509ParseOid(desc[0].bytes);
                    const uri = new TextDecoder().decode(desc[1].bytes);
                    if (methOid === '1.3.6.1.5.5.7.48.1') ocspUrls.push(uri);
                    if (methOid === '1.3.6.1.5.5.7.48.2') caIssuersUrls.push(uri);
                  }
                });
              }
              details = [...ocspUrls.map(u => `OCSP: ${u}`), ...caIssuersUrls.map(u => `CA: ${u}`)].join(', ');
            } catch (e) {}
          } else if (oid === '2.5.29.31') { // CRL
            try {
              const parsed = x509ParseAsn1(innerBytes)[0];
              if (parsed) {
                const items = x509ParseAsn1(parsed.bytes);
                items.forEach(it => {
                  const inSeq = x509ParseAsn1(it.bytes);
                  inSeq.forEach(inIt => {
                    const crlUri = new TextDecoder().decode(inIt.bytes);
                    if (crlUri.startsWith('http')) crlUrls.push(crlUri);
                  });
                });
              }
              details = crlUrls.join(', ');
            } catch (e) {}
          }

          extensions.push({
            oid,
            name,
            critical: isCrit,
            details: details || 'Presente'
          });
        }
      }
    }

    // Fingerprints
    const sha256Buf = await crypto.subtle.digest('SHA-256', bytes);
    const fp256 = Array.from(new Uint8Array(sha256Buf)).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(':');

    const sha1Buf = await crypto.subtle.digest('SHA-1', bytes);
    const fp1 = Array.from(new Uint8Array(sha1Buf)).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(':');

    const now = new Date();
    const isExpired = now > notAfter;
    const isNotYetValid = now < notBefore;
    const daysLeft = Math.round((notAfter - now) / (1000 * 3600 * 24));
    const isSelfSigned = issuerDN === subjectDN;

    const subjectCN = (subjectRdn.find(r => r.name === 'CN') || {}).value || subjectDN || `Certificado #${index + 1}`;
    const issuerCN = (issuerRdn.find(r => r.name === 'CN') || {}).value || issuerDN;

    return {
      index,
      rawPem: pem.trim(),
      bytes,
      tbsRaw: tbs.rawBytes,
      spkiRaw: spkiNode.rawBytes,
      spkiOid,
      sigAlgOid,
      sigBytes: sigValNode.bytes.slice(1),
      version,
      serialHex,
      sigAlgName,
      issuerDN,
      issuerRdn,
      issuerCN,
      subjectDN,
      subjectRdn,
      subjectCN,
      notBefore,
      notAfter,
      isExpired,
      isNotYetValid,
      daysLeft,
      spkiAlgName,
      isSelfSigned,
      isCA,
      pathLen,
      sans,
      keyUsages,
      ekus,
      ski,
      aki,
      ocspUrls,
      caIssuersUrls,
      crlUrls,
      extensions,
      fp256,
      fp1
    };
  }

  async function verifyX509Signature(child, parent) {
    try {
      let algParams = null;
      let verifyAlg = null;
      let sigData = child.sigBytes;

      if (child.sigAlgOid.startsWith('1.2.840.113549.1.1.')) { // RSA PKCS#1 v1.5
        let hash = 'SHA-256';
        if (child.sigAlgOid === '1.2.840.113549.1.1.12') hash = 'SHA-384';
        else if (child.sigAlgOid === '1.2.840.113549.1.1.13') hash = 'SHA-512';
        else if (child.sigAlgOid === '1.2.840.113549.1.1.5') hash = 'SHA-1';
        algParams = { name: 'RSASSA-PKCS1-v1_5', hash };
        verifyAlg = 'RSASSA-PKCS1-v1_5';
      } else if (child.sigAlgOid.startsWith('1.2.840.10045.4.3.')) { // ECDSA
        let hash = 'SHA-256';
        let namedCurve = 'P-256';
        let keySize = 32;
        if (child.sigAlgOid === '1.2.840.10045.4.3.3') {
          hash = 'SHA-384';
          namedCurve = 'P-384';
          keySize = 48;
        }
        algParams = { name: 'ECDSA', namedCurve };
        verifyAlg = { name: 'ECDSA', hash: { name: hash } };
        sigData = x509DerToP1363(child.sigBytes, keySize);
      } else {
        return { ok: null, msg: 'Algoritmo de assinatura não suportado nativamente pelo WebCrypto nativo' };
      }

      const key = await crypto.subtle.importKey('spki', parent.spkiRaw, algParams, false, ['verify']);
      const ok = await crypto.subtle.verify(verifyAlg, key, sigData, child.tbsRaw);
      return { ok, msg: ok ? 'Assinatura digital criptograficamente válida (WebCrypto)' : 'Assinatura digital inválida / rejeitada' };
    } catch (err) {
      return { ok: false, msg: `Erro ao verificar assinatura: ${err.message}` };
    }
  }

  async function analyzeCertificateChain(certs) {
    if (certs.length === 0) return { ordered: [], links: [], status: 'empty' };

    // Order chain starting from leaf
    // A leaf is typically a cert that is not the issuer of any other cert in the bundle
    const isIssuerOfOthers = certs.map(c => certs.some(other => other !== c && other.issuerDN === c.subjectDN));
    let leafIdx = isIssuerOfOthers.indexOf(false);
    if (leafIdx === -1) leafIdx = 0;

    const ordered = [];
    const used = new Set();
    let current = certs[leafIdx];
    ordered.push(current);
    used.add(current);

    while (current) {
      if (current.isSelfSigned) break; // Reached self-signed root
      const parent = certs.find(c => !used.has(c) && (c.subjectDN === current.issuerDN || (current.aki && c.ski === current.aki)));
      if (parent) {
        ordered.push(parent);
        used.add(parent);
        current = parent;
      } else {
        break; // Missing parent in bundle
      }
    }

    // Append any remaining disconnected certs from bundle
    certs.forEach(c => {
      if (!used.has(c)) ordered.push(c);
    });

    // Validate each link
    const links = [];
    let allValid = true;
    let isComplete = false;

    for (let i = 0; i < ordered.length; i++) {
      const cur = ordered[i];
      if (cur.isSelfSigned) {
        // Self-signed root validation
        const rootVerify = await verifyX509Signature(cur, cur);
        const link = {
          type: 'root',
          cert: cur,
          parent: cur,
          isSelfSigned: true,
          sigResult: rootVerify,
          caValid: cur.isCA,
          keyUsageValid: cur.keyUsages.length === 0 || cur.keyUsages.some(u => u.includes('keyCertSign')),
          timeValid: !cur.isExpired && !cur.isNotYetValid
        };
        links.push(link);
        if (rootVerify.ok === true && link.timeValid) {
          isComplete = true;
        } else {
          allValid = false;
        }
      } else {
        // Look for issuer
        const parent = ordered.find(c => c !== cur && (c.subjectDN === cur.issuerDN || (cur.aki && c.ski === cur.aki)));
        if (parent) {
          const sigResult = await verifyX509Signature(cur, parent);
          const skiAkiMatch = !cur.aki || !parent.ski || cur.aki === parent.ski;
          const dnMatch = cur.issuerDN === parent.subjectDN;
          const link = {
            type: 'link',
            cert: cur,
            parent,
            dnMatch,
            skiAkiMatch,
            sigResult,
            caValid: parent.isCA,
            keyUsageValid: parent.keyUsages.length === 0 || parent.keyUsages.some(u => u.includes('keyCertSign')),
            timeValid: !cur.isExpired && !cur.isNotYetValid
          };
          links.push(link);
          if (sigResult.ok !== true || !dnMatch || !link.timeValid) {
            allValid = false;
          }
        } else {
          // Missing parent
          links.push({
            type: 'missing-parent',
            cert: cur,
            expectedIssuer: cur.issuerCN || cur.issuerDN,
            timeValid: !cur.isExpired && !cur.isNotYetValid
          });
          allValid = false;
        }
      }
    }

    let status = 'valid';
    if (ordered.length === 1 && !ordered[0].isSelfSigned) {
      status = 'single-leaf';
    } else if (isComplete && allValid) {
      status = 'complete';
    } else if (allValid && !isComplete) {
      status = 'partial';
    } else {
      status = 'invalid';
    }

    return { ordered, links, status };
  }

  function checkChainOrder(inputCerts, ordered) {
    if (inputCerts.length <= 1) {
      return {
        isMulti: false,
        isCorrect: true,
        type: 'single',
        currentOrderStr: '',
        expectedOrderStr: '',
        orderedCerts: ordered
      };
    }

    const inputSerials = inputCerts.map(c => c.serialHex);
    const orderedSerials = ordered.map(c => c.serialHex);

    const isExact = inputSerials.length === orderedSerials.length &&
      inputSerials.every((s, i) => s === orderedSerials[i]);
    const isReversed = inputSerials.length === orderedSerials.length &&
      inputSerials.every((s, i) => s === orderedSerials[orderedSerials.length - 1 - i]);

    function getRoleLabel(c) {
      if (c.isSelfSigned) return `Raiz (${c.subjectCN})`;
      if (c.isCA) return `Intermediária (${c.subjectCN})`;
      return `Folha (${c.subjectCN})`;
    }

    const currentOrderStr = inputCerts.map((c, i) => `${i + 1}º ${getRoleLabel(c)}`).join(' ➔ ');
    const expectedOrderStr = ordered.map((c, i) => `${i + 1}º ${getRoleLabel(c)}`).join(' ➔ ');

    let type = 'correct';
    if (!isExact) {
      type = isReversed ? 'reversed' : 'shuffled';
    }

    return {
      isMulti: true,
      isCorrect: isExact,
      type,
      currentOrderStr,
      expectedOrderStr,
      orderedCerts: ordered
    };
  }

  function renderX509Results() {
    const { certs, activeIdx, chainLinks, chainStatus, orderValidation } = x509State;
    const resEl = document.getElementById('x509-results');
    if (!resEl) return;

    if (!certs || certs.length === 0) {
      resEl.innerHTML = '<span class="m">Cole um certificado em formato PEM para inspecionar.</span>';
      return;
    }

    const cur = certs[activeIdx] || certs[0];

    // Status badge for active cert
    let curStatusBadge = '<span class="badge badge-green">✓ Válido</span>';
    if (cur.isExpired) curStatusBadge = '<span class="badge badge-red">✗ Expirado!</span>';
    else if (cur.isNotYetValid) curStatusBadge = '<span class="badge badge-amber">⚠️ Não ativo ainda</span>';

    // Role badge
    let roleBadge = '<span class="cert-role-badge cert-role-leaf">Folha (Leaf)</span>';
    if (cur.isSelfSigned) roleBadge = '<span class="cert-role-badge cert-role-root">Raiz (Root CA)</span>';
    else if (cur.isCA) roleBadge = '<span class="cert-role-badge cert-role-inter">Intermediária (CA)</span>';

    // 1. Chain Flow Header (Breadcrumbs)
    let flowHtml = '';
    if (certs.length > 1) {
      flowHtml = `
        <div class="card-box" style="margin-bottom:1rem; padding:0.85rem 1rem;">
          <div style="font-size:0.75rem; color:var(--muted); font-weight:700; text-transform:uppercase; margin-bottom:0.5rem; letter-spacing:0.05em;">
            Cadeia de Certificados (${certs.length} nós detectados - clique para inspecionar):
          </div>
          <div class="cert-chain-flow">
            ${certs.map((c, i) => {
              let rClass = 'cert-role-leaf';
              let rName = 'Folha';
              if (c.isSelfSigned) { rClass = 'cert-role-root'; rName = 'Raiz'; }
              else if (c.isCA) { rClass = 'cert-role-inter'; rName = 'Intermediária'; }
              const isCur = i === activeIdx;
              return `
                <div class="cert-node ${isCur ? 'active' : ''}" data-cert-idx="${i}">
                  <span class="cert-role-badge ${rClass}">${rName}</span>
                  <span style="font-weight:600;">${escapeHtml(c.subjectCN)}</span>
                </div>
                ${i < certs.length - 1 ? '<span class="cert-node-arrow">➔</span>' : ''}
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    // 2. Chain Order Validation Box
    let orderHtml = '';
    if (orderValidation && orderValidation.isMulti) {
      if (orderValidation.isCorrect) {
        orderHtml = `
          <div class="chain-order-box order-pass">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.35rem;">
              <div style="font-weight:700; font-size:0.85rem; display:flex; align-items:center; gap:0.4rem;">
                <span>✅</span>
                <span>Ordem da Cadeia no Pacote PEM:</span>
                <span class="badge badge-green">Sequência Correta (RFC 5280)</span>
              </div>
            </div>
            <div style="font-size:0.78rem; line-height:1.5; color:var(--muted);">
              A ordem dos blocos PEM no arquivo está ideal para servidores web (Nginx, Apache, Traefik, HAProxy, etc.):
              <code style="color:var(--green);">${escapeHtml(orderValidation.expectedOrderStr)}</code>.
            </div>
          </div>
        `;
      } else {
        orderHtml = `
          <div class="chain-order-box order-warn">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.35rem;">
              <div style="font-weight:700; font-size:0.85rem; display:flex; align-items:center; gap:0.4rem;">
                <span>⚠️</span>
                <span>Ordem da Cadeia no Pacote PEM:</span>
                <span class="badge badge-amber">${orderValidation.type === 'reversed' ? 'Ordem Invertida!' : 'Ordem Incorreta / Desordenada!'}</span>
              </div>
              <button type="button" class="btn btn-sm btn-primary" id="x509-fix-order-btn" style="padding:0.25rem 0.65rem; font-size:0.75rem;">
                🔄 Corrigir e Reordenar PEM
              </button>
            </div>
            <div style="font-size:0.78rem; line-height:1.5;">
              <div style="color:var(--amber); margin-bottom:0.3rem;">
                ${orderValidation.type === 'reversed' 
                  ? 'Os certificados foram colados na <strong>ordem inversa</strong> (Raiz primeiro, Folha por último). Servidores web como Nginx, Apache e Traefik exigem que o <strong>Certificado Folha seja o 1º bloco</strong>.' 
                  : 'A sequência dos certificados no arquivo não segue a hierarquia contínua exigida por clientes e servidores TLS.'}
              </div>
              <div style="font-family:var(--mono); font-size:0.75rem; color:var(--muted);">
                <div>Ordem atual no texto: <code style="color:hsl(0 75% 65%);">${escapeHtml(orderValidation.currentOrderStr)}</code></div>
                <div style="margin-top:0.25rem;">Ordem correta esperada: <code style="color:var(--green);">${escapeHtml(orderValidation.expectedOrderStr)}</code></div>
              </div>
            </div>
          </div>
        `;
      }
    }

    // 3. Chain Validation Card
    let chainReportHtml = '';
    if (certs.length > 1 || (certs.length === 1 && certs[0].isSelfSigned)) {
      let bannerBadge = '';
      if (chainStatus === 'complete') {
        bannerBadge = '<span class="badge badge-green">✓ Cadeia Completa &amp; Criptograficamente Válida</span>';
      } else if (chainStatus === 'partial') {
        bannerBadge = '<span class="badge badge-amber">⚠️ Cadeia Parcial (Falta Raiz / Intermediária para fechar âncora)</span>';
      } else {
        bannerBadge = '<span class="badge badge-red">✗ Cadeia Incompleta ou Inválida</span>';
      }

      chainReportHtml = `
        <div class="chain-report-card">
          <div class="chain-report-header">
            <h4>⛓️ Validação da Cadeia de Confiança (PKI)</h4>
            <div>${bannerBadge}</div>
          </div>
          <div class="chain-step-list">
            ${chainLinks.map(link => {
              if (link.type === 'root') {
                const sigPass = link.sigResult && link.sigResult.ok === true;
                return `
                  <div class="chain-step-item">
                    <div class="chain-step-title">
                      <span>🛡️ Âncora de Confiança Raiz: <code>${escapeHtml(link.cert.subjectCN)}</code></span>
                      <span class="badge ${sigPass ? 'badge-green' : 'badge-amber'}">${sigPass ? 'Auto-assinado Verificado' : 'Auto-assinatura pendente'}</span>
                    </div>
                    <div class="chain-check-row ${sigPass ? 'pass' : 'fail'}">
                      <span>${sigPass ? '✓' : '✗'}</span>
                      <span>Assinatura Digital Raiz: ${escapeHtml((link.sigResult && link.sigResult.msg) || 'Verificada')}</span>
                    </div>
                    <div class="chain-check-row ${link.caValid ? 'pass' : 'fail'}">
                      <span>${link.caValid ? '✓' : '✗'}</span>
                      <span>Basic Constraints CA: ${link.caValid ? 'TRUE (Autoridade Raiz)' : 'FALSE'}</span>
                    </div>
                    <div class="chain-check-row ${link.timeValid ? 'pass' : 'fail'}">
                      <span>${link.timeValid ? '✓' : '✗'}</span>
                      <span>Validade Temporal: Válido até ${link.cert.notAfter.toLocaleDateString('pt-BR')} (${link.cert.daysLeft} dias restantes)</span>
                    </div>
                  </div>
                `;
              } else if (link.type === 'link') {
                const sigPass = link.sigResult && link.sigResult.ok === true;
                return `
                  <div class="chain-step-item">
                    <div class="chain-step-title">
                      <span>🔗 Elo: <code>${escapeHtml(link.cert.subjectCN)}</code> ➔ Emissor: <code>${escapeHtml(link.parent.subjectCN)}</code></span>
                      <span class="badge ${sigPass ? 'badge-green' : 'badge-red'}">${sigPass ? 'Assinatura Válida' : 'Assinatura Falhou'}</span>
                    </div>
                    <div class="chain-check-row ${link.dnMatch ? 'pass' : 'fail'}">
                      <span>${link.dnMatch ? '✓' : '✗'}</span>
                      <span>Hierarquia DN: Issuer do certificado coincide com o Subject do emissor</span>
                    </div>
                    ${link.cert.aki && link.parent.ski ? `
                      <div class="chain-check-row ${link.skiAkiMatch ? 'pass' : 'fail'}">
                        <span>${link.skiAkiMatch ? '✓' : '✗'}</span>
                        <span>Identificador de Chave: AKI filho coincide com SKI do pai (${link.cert.aki.slice(0, 17)}...)</span>
                      </div>
                    ` : ''}
                    <div class="chain-check-row ${link.caValid ? 'pass' : 'warn'}">
                      <span>${link.caValid ? '✓' : '⚠️'}</span>
                      <span>Atributos de CA do Emissor: ${link.caValid ? 'BasicConstraints CA=TRUE' : 'CA não declarada'}</span>
                    </div>
                    <div class="chain-check-row ${sigPass ? 'pass' : 'fail'}">
                      <span>${sigPass ? '✓' : '✗'}</span>
                      <span>Criptografia: ${escapeHtml((link.sigResult && link.sigResult.msg) || 'Assinatura OK')}</span>
                    </div>
                    <div class="chain-check-row ${link.timeValid ? 'pass' : 'fail'}">
                      <span>${link.timeValid ? '✓' : '✗'}</span>
                      <span>Validade Temporal: Válido até ${link.cert.notAfter.toLocaleDateString('pt-BR')} (${link.cert.daysLeft} dias)</span>
                    </div>
                  </div>
                `;
              } else {
                return `
                  <div class="chain-step-item" style="border-color:hsl(40 95% 62% / 0.3);">
                    <div class="chain-step-title" style="color:var(--amber);">
                      <span>⚠️ Elo Incompleto: <code>${escapeHtml(link.cert.subjectCN)}</code></span>
                      <span class="badge badge-amber">Emissor Ausente</span>
                    </div>
                    <div class="chain-check-row warn">
                      <span>⚠️</span>
                      <span>Emitido por: <code>${escapeHtml(link.expectedIssuer)}</code> (não encontrado neste pacote PEM)</span>
                    </div>
                  </div>
                `;
              }
            }).join('')}
          </div>
        </div>
      `;
    } else if (certs.length === 1 && !certs[0].isSelfSigned) {
      chainReportHtml = `
        <div class="chain-report-card" style="border-color:hsl(215 28% 22%);">
          <div class="chain-report-header">
            <h4>⛓️ Validação da Cadeia</h4>
            <div><span class="badge badge-cyan">Certificado Individual</span></div>
          </div>
          <p style="font-size:0.8rem; color:var(--muted); margin:0;">
            Este é um certificado individual assinado por <strong>${escapeHtml(cur.issuerCN)}</strong>.
            Para validar a cadeia completa de confiança e assinaturas criptográficas até a raiz, cole também os certificados intermediários e a autoridade raiz neste campo.
          </p>
        </div>
      `;
    }

    // 4. Subject Card
    const subjectRdnsHtml = cur.subjectRdn.map(r => `
      <div class="rdn-item">
        <span class="rdn-tag">${escapeHtml(r.name)}</span>
        <span class="rdn-val" title="${escapeHtml(X509_RDN_LABELS[r.name] || r.name)}">${escapeHtml(r.value)}</span>
      </div>
    `).join('');

    // 5. Issuer Card
    const issuerRdnsHtml = cur.issuerRdn.map(r => `
      <div class="rdn-item">
        <span class="rdn-tag">${escapeHtml(r.name)}</span>
        <span class="rdn-val" title="${escapeHtml(X509_RDN_LABELS[r.name] || r.name)}">${escapeHtml(r.value)}</span>
      </div>
    `).join('');

    // 6. Extensions Card
    let extensionsHtml = '';
    if (cur.extensions.length > 0) {
      // SAN tags
      let sansHtml = '—';
      if (cur.sans && cur.sans.length > 0) {
        sansHtml = `
          <div class="ext-badge-list">
            ${cur.sans.map(s => {
              const isWild = s.includes('*');
              return `<span class="san-tag ${isWild ? 'wildcard' : ''}">${escapeHtml(s)}</span>`;
            }).join('')}
          </div>
        `;
      }

      // Key Usage tags
      let kuHtml = '—';
      if (cur.keyUsages && cur.keyUsages.length > 0) {
        kuHtml = `
          <div class="ext-badge-list">
            ${cur.keyUsages.map(u => `<span class="ext-badge ext-badge-green">${escapeHtml(u)}</span>`).join('')}
          </div>
        `;
      }

      // EKU tags
      let ekuHtml = '—';
      if (cur.ekus && cur.ekus.length > 0) {
        ekuHtml = `
          <div class="ext-badge-list">
            ${cur.ekus.map(u => `<span class="ext-badge ext-badge-cyan">${escapeHtml(u)}</span>`).join('')}
          </div>
        `;
      }

      extensionsHtml = `
        <div class="card-box" style="margin-top:1.25rem;">
          <div class="card-title">🧩 Propriedades Estendidas (X.509 v3 Extensions)</div>
          <table class="info-table">
            <tr>
              <td class="key">Subject Alternative Name (SAN)</td>
              <td class="val">${sansHtml}</td>
            </tr>
            <tr>
              <td class="key">Basic Constraints</td>
              <td class="val">
                <span class="badge ${cur.isCA ? 'badge-green' : 'badge-cyan'}">${cur.isCA ? 'CA: SIM (Autoridade)' : 'CA: NÃO (Entidade Final)'}</span>
                ${cur.pathLen !== null ? `<span style="margin-left:0.5rem; color:var(--muted);">PathLen Constraint: <code>${cur.pathLen}</code></span>` : ''}
              </td>
            </tr>
            <tr>
              <td class="key">Uso da Chave (Key Usage)</td>
              <td class="val">${kuHtml}</td>
            </tr>
            <tr>
              <td class="key">Uso Estendido (Extended Key Usage)</td>
              <td class="val">${ekuHtml}</td>
            </tr>
            ${cur.ski ? `
              <tr>
                <td class="key">Subject Key Identifier (SKI)</td>
                <td class="val"><code style="font-size:0.75rem;">${cur.ski}</code></td>
              </tr>
            ` : ''}
            ${cur.aki ? `
              <tr>
                <td class="key">Authority Key Identifier (AKI)</td>
                <td class="val"><code style="font-size:0.75rem;">${cur.aki}</code></td>
              </tr>
            ` : ''}
            ${cur.ocspUrls.length > 0 || cur.caIssuersUrls.length > 0 ? `
              <tr>
                <td class="key">Authority Info Access (AIA)</td>
                <td class="val">
                  ${cur.ocspUrls.map(u => `<div><span style="color:var(--muted);">OCSP:</span> <code>${escapeHtml(u)}</code></div>`).join('')}
                  ${cur.caIssuersUrls.map(u => `<div><span style="color:var(--muted);">CA Issuers:</span> <code>${escapeHtml(u)}</code></div>`).join('')}
                </td>
              </tr>
            ` : ''}
            ${cur.crlUrls.length > 0 ? `
              <tr>
                <td class="key">Pontos de Distribuição CRL</td>
                <td class="val">
                  ${cur.crlUrls.map(u => `<div><code>${escapeHtml(u)}</code></div>`).join('')}
                </td>
              </tr>
            ` : ''}
          </table>
        </div>
      `;
    }

    resEl.innerHTML = `
      ${flowHtml}
      ${orderHtml}
      ${chainReportHtml}

      <div class="card-box" style="margin-bottom:1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.85rem; padding-bottom:0.5rem; border-bottom:1px solid var(--border);">
          <div style="font-family:var(--mono); font-size:1rem; font-weight:700; display:flex; align-items:center; gap:0.5rem;">
            <span>📜 Detalhes do Certificado Selecionado:</span>
            <code style="color:var(--cyan);">${escapeHtml(cur.subjectCN)}</code>
          </div>
          <div>${roleBadge} ${curStatusBadge}</div>
        </div>

        <!-- SUBJECT SECTION -->
        <div class="dn-box">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
            <span style="color:var(--green); font-weight:700; text-transform:uppercase; font-size:0.75rem; letter-spacing:0.05em;">👤 Subject (Entidade / Titular)</span>
            <button type="button" class="chip-btn x509-copy-btn" data-copy-val="${escapeHtml(cur.subjectDN)}">Copiar DN</button>
          </div>
          <div class="dn-full-string">${escapeHtml(cur.subjectDN)}</div>
          <div class="rdn-grid">${subjectRdnsHtml}</div>
        </div>

        <!-- ISSUER SECTION -->
        <div class="dn-box">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
            <span style="color:var(--cyan); font-weight:700; text-transform:uppercase; font-size:0.75rem; letter-spacing:0.05em;">🏢 Issuer (Autoridade Emissora)</span>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              ${cur.isSelfSigned ? '<span class="badge badge-amber" style="font-size:0.68rem;">Auto-assinado</span>' : ''}
              <button type="button" class="chip-btn x509-copy-btn" data-copy-val="${escapeHtml(cur.issuerDN)}">Copiar DN</button>
            </div>
          </div>
          <div class="dn-full-string">${escapeHtml(cur.issuerDN)}</div>
          <div class="rdn-grid">${issuerRdnsHtml}</div>
        </div>

        <!-- VALIDITY & SPECS TABLE -->
        <table class="info-table" style="margin-top:1rem;">
          <tr>
            <td class="key">Status de Validade</td>
            <td class="val">${curStatusBadge} ${!cur.isExpired ? `(${cur.daysLeft} dias restantes)` : `(expirou há ${Math.abs(cur.daysLeft)} dias)`}</td>
          </tr>
          <tr>
            <td class="key">Válido De (Not Before)</td>
            <td class="val"><code>${cur.notBefore.toLocaleString('pt-BR')}</code> <span style="color:var(--muted); font-size:0.75rem;">(${cur.notBefore.toISOString()})</span></td>
          </tr>
          <tr>
            <td class="key">Válido Até (Not After)</td>
            <td class="val"><code style="color:${cur.isExpired ? 'hsl(0,75%,65%)' : 'var(--green)'};">${cur.notAfter.toLocaleString('pt-BR')}</code> <span style="color:var(--muted); font-size:0.75rem;">(${cur.notAfter.toISOString()})</span></td>
          </tr>
          <tr>
            <td class="key">Número de Série</td>
            <td class="val">
              <div style="display:flex; align-items:center; justify-content:space-between; gap:0.5rem;">
                <code style="font-size:0.75rem;">${cur.serialHex}</code>
                <button type="button" class="chip-btn x509-copy-btn" data-copy-val="${cur.serialHex}">Copiar</button>
              </div>
            </td>
          </tr>
          <tr>
            <td class="key">Algoritmo de Assinatura</td>
            <td class="val"><code>${escapeHtml(cur.sigAlgName)}</code> <span style="color:var(--muted); font-size:0.75rem;">(${cur.sigAlgOid})</span></td>
          </tr>
          <tr>
            <td class="key">Chave Pública (SPKI)</td>
            <td class="val"><code>${escapeHtml(cur.spkiAlgName)}</code></td>
          </tr>
          <tr>
            <td class="key">Fingerprint SHA-256</td>
            <td class="val">
              <div style="display:flex; align-items:center; justify-content:space-between; gap:0.5rem;">
                <code style="font-size:0.75rem;">${cur.fp256}</code>
                <button type="button" class="chip-btn x509-copy-btn" data-copy-val="${cur.fp256}">Copiar</button>
              </div>
            </td>
          </tr>
          <tr>
            <td class="key">Fingerprint SHA-1</td>
            <td class="val">
              <div style="display:flex; align-items:center; justify-content:space-between; gap:0.5rem;">
                <code style="font-size:0.75rem;">${cur.fp1}</code>
                <button type="button" class="chip-btn x509-copy-btn" data-copy-val="${cur.fp1}">Copiar</button>
              </div>
            </td>
          </tr>
          <tr>
            <td class="key">Tamanho dos Bytes DER</td>
            <td class="val">${cur.bytes.length} bytes</td>
          </tr>
        </table>
      </div>

      ${extensionsHtml}
    `;

    // Bind certificate flow switch clicks
    resEl.querySelectorAll('.cert-node').forEach(node => {
      node.addEventListener('click', () => {
        const idx = parseInt(node.dataset.certIdx, 10);
        if (!isNaN(idx) && idx >= 0 && idx < x509State.certs.length) {
          x509State.activeIdx = idx;
          renderX509Results();
        }
      });
    });

    // Bind fix order button
    const fixOrderBtn = resEl.querySelector('#x509-fix-order-btn');
    if (fixOrderBtn) {
      fixOrderBtn.addEventListener('click', () => {
        if (x509State.orderValidation && x509State.orderValidation.orderedCerts) {
          x509Input.value = x509State.orderValidation.orderedCerts.map(c => c.rawPem).join('\n\n');
          parseX509Pem();
          showToast('Cadeia reordenada com sucesso no padrão RFC 5280! ✓');
        }
      });
    }

    // Bind copy buttons inside results
    resEl.querySelectorAll('.x509-copy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const val = btn.dataset.copyVal;
        if (val) copyToClipboard(val, btn);
      });
    });
  }

  async function parseX509Pem() {
    const raw = (x509Input.value || '').trim();
    if (!raw.includes('-----BEGIN CERTIFICATE-----')) {
      x509State = { certs: [], activeIdx: 0, chainLinks: [], chainStatus: null, orderValidation: null };
      renderX509Results();
      return;
    }

    try {
      const blocks = raw.match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g) || [];
      if (blocks.length === 0) {
        document.getElementById('x509-results').innerHTML = '<span class="badge badge-amber">Nenhum bloco de certificado PEM válido encontrado.</span>';
        return;
      }

      const parsedList = await Promise.all(blocks.map((b, i) => parseSingleX509(b, i)));
      const chainAnalysis = await analyzeCertificateChain(parsedList);
      const orderValidation = checkChainOrder(parsedList, chainAnalysis.ordered);

      x509State = {
        certs: chainAnalysis.ordered,
        activeIdx: 0,
        chainLinks: chainAnalysis.links,
        chainStatus: chainAnalysis.status,
        orderValidation
      };

      renderX509Results();
    } catch (e) {
      document.getElementById('x509-results').innerHTML = `<span class="badge badge-red">Erro ao processar certificado: ${escapeHtml(e.message)}</span>`;
    }
  }

  if (x509Input) x509Input.addEventListener('input', parseX509Pem);

  // Sample Buttons
  const x509SampleChainBtn = document.getElementById('x509-sample-chain-btn');
  if (x509SampleChainBtn) {
    x509SampleChainBtn.addEventListener('click', () => {
      // Cadeia TLS completa de 3 níveis: Folha (guineves.com.br) + Intermediária + Raiz Auto-assinada
      x509Input.value = `${X509_SAMPLE_LEAF}\n\n${X509_SAMPLE_INTER}\n\n${X509_SAMPLE_ROOT}`;
      parseX509Pem();
      showToast('Cadeia completa (ordem correta) carregada! ✓');
    });
  }

  const x509SampleInvBtn = document.getElementById('x509-sample-inv-btn');
  if (x509SampleInvBtn) {
    x509SampleInvBtn.addEventListener('click', () => {
      // Ordem Invertida para teste: Raiz -> Intermediária -> Folha
      x509Input.value = `${X509_SAMPLE_ROOT}\n\n${X509_SAMPLE_INTER}\n\n${X509_SAMPLE_LEAF}`;
      parseX509Pem();
      showToast('Cadeia com ordem invertida carregada para teste! ⚠️');
    });
  }

  const x509SampleLeafBtn = document.getElementById('x509-sample-leaf-btn');
  if (x509SampleLeafBtn) {
    x509SampleLeafBtn.addEventListener('click', () => {
      // Certificado Folha individual guineves.com.br
      x509Input.value = X509_SAMPLE_LEAF;
      parseX509Pem();
      showToast('Certificado folha carregado! ✓');
    });
  }

  const x509ClearBtn = document.getElementById('x509-clear-btn');
  if (x509ClearBtn) {
    x509ClearBtn.addEventListener('click', () => {
      x509Input.value = '';
      x509State = { certs: [], activeIdx: 0, chainLinks: [], chainStatus: null, orderValidation: null };
      renderX509Results();
      showToast('Limpo! ✓');
    });
  }

  // ==========================================
  // FERRAMENTA 17: CONVERSOR DE TIMESTAMP (EPOCH)
  // ==========================================
  const tsInput = document.getElementById('ts-input');
  const tsLiveClock = document.getElementById('ts-live-clock');
  const tsDateInput = document.getElementById('ts-date-input');
  const tsTimeInput = document.getElementById('ts-time-input');

  let tsRunning = true;
  setInterval(() => {
    if (tsRunning && tsLiveClock) {
      tsLiveClock.textContent = Math.floor(Date.now() / 1000);
    }
  }, 1000);

  function updateTimestampFromEpoch() {
    let raw = (tsInput.value || '').trim();
    if (!raw) return;

    let num = parseInt(raw, 10);
    if (isNaN(num)) return;

    // Se for 10 dígitos -> segundos. Se for 13 dígitos -> milissegundos.
    let ms = raw.length <= 10 ? num * 1000 : num;
    const d = new Date(ms);

    if (isNaN(d.getTime())) {
      document.getElementById('ts-results').innerHTML = '<span class="badge badge-red">Data inválida</span>';
      return;
    }

    const html = `
      <table class="info-table">
        <tr><td class="key">Horário Local (Navegador)</td><td class="val"><strong style="color:var(--green);">${d.toLocaleString('pt-BR')}</strong></td></tr>
        <tr><td class="key">Horário UTC / GMT</td><td class="val"><code>${d.toUTCString()}</code></td></tr>
        <tr><td class="key">ISO 8601</td><td class="val"><code>${d.toISOString()}</code></td></tr>
        <tr><td class="key">Timestamp em Segundos</td><td class="val"><code>${Math.floor(ms / 1000)}</code></td></tr>
        <tr><td class="key">Timestamp em Milissegundos</td><td class="val"><code>${ms}</code></td></tr>
      </table>
    `;
    document.getElementById('ts-results').innerHTML = html;
  }

  function updateTimestampFromCalendar() {
    const dVal = tsDateInput.value;
    const tVal = tsTimeInput.value || '00:00';
    if (!dVal) return;

    const dt = new Date(`${dVal}T${tVal}:00`);
    const sec = Math.floor(dt.getTime() / 1000);
    const ms = dt.getTime();

    document.getElementById('out-ts-from-cal-sec').textContent = sec;
    document.getElementById('out-ts-from-cal-ms').textContent = ms;
  }

  if (tsInput) tsInput.addEventListener('input', updateTimestampFromEpoch);
  if (tsDateInput) tsDateInput.addEventListener('input', updateTimestampFromCalendar);
  if (tsTimeInput) tsTimeInput.addEventListener('input', updateTimestampFromCalendar);

  const tsNowBtn = document.getElementById('ts-now-btn');
  if (tsNowBtn) {
    tsNowBtn.addEventListener('click', () => {
      tsInput.value = Math.floor(Date.now() / 1000);
      updateTimestampFromEpoch();
    });
  }

  // ==========================================
  // FERRAMENTA 18: CONVERSOR DE BASES & UNIDADES DE DADOS
  // ==========================================
  const baseDec = document.getElementById('base-dec');
  const baseHex = document.getElementById('base-hex');
  const baseOct = document.getElementById('base-oct');
  const baseBin = document.getElementById('base-bin');
  const baseAscii = document.getElementById('base-ascii');

  function updateBases(source) {
    let big = 0n;
    try {
      if (source === 'dec') {
        let v = (baseDec.value || '0').trim();
        big = BigInt(v || 0);
      } else if (source === 'hex') {
        let v = (baseHex.value || '0').trim().replace(/^0x/i, '');
        big = BigInt('0x' + (v || '0'));
      } else if (source === 'oct') {
        let v = (baseOct.value || '0').trim().replace(/^0o/i, '');
        big = BigInt('0o' + (v || '0'));
      } else if (source === 'bin') {
        let v = (baseBin.value || '0').trim().replace(/\s+/g, '').replace(/^0b/i, '');
        big = BigInt('0b' + (v || '0'));
      } else if (source === 'ascii') {
        let v = baseAscii.value || '';
        if (v.length > 0) {
          big = BigInt(v.charCodeAt(0));
        }
      }

      if (source !== 'dec') baseDec.value = big.toString(10);
      if (source !== 'hex') baseHex.value = big.toString(16).toUpperCase();
      if (source !== 'oct') baseOct.value = big.toString(8);
      if (source !== 'bin') {
        let b = big.toString(2);
        // Formata em blocos de 4 bits
        while (b.length % 4) b = '0' + b;
        baseBin.value = b.match(/.{1,4}/g).join(' ');
      }
      if (source !== 'ascii') {
        if (big >= 32n && big <= 126n) {
          baseAscii.value = String.fromCharCode(Number(big));
        } else {
          baseAscii.value = '';
        }
      }
    } catch (e) {
      // Valor incompleto durante digitação
    }
  }

  if (baseDec) baseDec.addEventListener('input', () => updateBases('dec'));
  if (baseHex) baseHex.addEventListener('input', () => updateBases('hex'));
  if (baseOct) baseOct.addEventListener('input', () => updateBases('oct'));
  if (baseBin) baseBin.addEventListener('input', () => updateBases('bin'));
  if (baseAscii) baseAscii.addEventListener('input', () => updateBases('ascii'));

  // Data units conversion (SI vs IEC)
  const dataVal = document.getElementById('unit-data-val');
  const dataUnit = document.getElementById('unit-data-select');

  function updateDataUnits() {
    const val = parseFloat(dataVal.value) || 0;
    const unit = dataUnit.value;

    const toBytes = {
      B: 1,
      KB: 1e3,
      MB: 1e6,
      GB: 1e9,
      TB: 1e12,
      PB: 1e15,
      KiB: 1024,
      MiB: 1024 ** 2,
      GiB: 1024 ** 3,
      TiB: 1024 ** 4,
      PiB: 1024 ** 5
    };

    const bytes = val * (toBytes[unit] || 1);

    const html = `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; margin-top:1rem;">
        <div>
          <h4 style="color:var(--cyan); margin-bottom:0.5rem; font-family:var(--mono);">Padrão Decimal SI (10ⁿ)</h4>
          <table class="info-table">
            <tr><td class="key">Bytes</td><td class="val">${bytes.toLocaleString('pt-BR')} B</td></tr>
            <tr><td class="key">Kilobytes (KB)</td><td class="val">${(bytes / 1e3).toLocaleString('pt-BR', { maximumFractionDigits: 3 })} KB</td></tr>
            <tr><td class="key">Megabytes (MB)</td><td class="val">${(bytes / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 3 })} MB</td></tr>
            <tr><td class="key">Gigabytes (GB)</td><td class="val"><strong>${(bytes / 1e9).toLocaleString('pt-BR', { maximumFractionDigits: 3 })} GB</strong></td></tr>
            <tr><td class="key">Terabytes (TB)</td><td class="val">${(bytes / 1e12).toLocaleString('pt-BR', { maximumFractionDigits: 4 })} TB</td></tr>
          </table>
        </div>
        <div>
          <h4 style="color:var(--green); margin-bottom:0.5rem; font-family:var(--mono);">Padrão Binário IEC (2ⁿ)</h4>
          <table class="info-table">
            <tr><td class="key">Bytes</td><td class="val">${bytes.toLocaleString('pt-BR')} B</td></tr>
            <tr><td class="key">Kibibytes (KiB)</td><td class="val">${(bytes / 1024).toLocaleString('pt-BR', { maximumFractionDigits: 3 })} KiB</td></tr>
            <tr><td class="key">Mebibytes (MiB)</td><td class="val">${(bytes / (1024 ** 2)).toLocaleString('pt-BR', { maximumFractionDigits: 3 })} MiB</td></tr>
            <tr><td class="key">Gibibytes (GiB)</td><td class="val"><strong style="color:var(--green);">${(bytes / (1024 ** 3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 })} GiB</strong></td></tr>
            <tr><td class="key">Tebibytes (TiB)</td><td class="val">${(bytes / (1024 ** 4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 })} TiB</td></tr>
          </table>
        </div>
      </div>
    `;
    document.getElementById('data-units-result').innerHTML = html;
  }

  if (dataVal) dataVal.addEventListener('input', updateDataUnits);
  if (dataUnit) dataUnit.addEventListener('change', updateDataUnits);

  // ==========================================
  // FERRAMENTA: VISUALIZADOR DE MARKDOWN SIDE-BY-SIDE
  // ==========================================
  const mdInput = document.getElementById('md-input-text');
  const mdPreview = document.getElementById('md-preview-content');
  const mdStatWords = document.getElementById('md-stat-words');
  const mdStatChars = document.getElementById('md-stat-chars');
  const mdStatLines = document.getElementById('md-stat-lines');
  const mdStatReading = document.getElementById('md-stat-reading');

  function renderMarkdown(md) {
    if (!md) return '<p class="m" style="font-style:italic;">O preview aparecerá aqui conforme você digita...</p>';

    // 1. Sanitizar scripts inseguros
    let text = md.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // 2. Extrair blocos de código com cercas (```)
    const codeBlocks = [];
    text = text.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const placeholder = `%%CODE_BLOCK_${codeBlocks.length}%%`;
      const escapedCode = escapeHtml(code.trimEnd());
      const blockHtml = `
        <pre class="md-code-block">
          <div class="md-code-header">
            <span>${lang || 'texto'}</span>
          </div>
          <code class="language-${lang || 'text'}">${escapedCode}</code>
        </pre>
      `;
      codeBlocks.push(blockHtml);
      return placeholder;
    });

    // 3. Extrair código inline (`code`)
    const inlineCodes = [];
    text = text.replace(/`([^`\n]+)`/g, (match, code) => {
      const placeholder = `%%INLINE_CODE_${inlineCodes.length}%%`;
      inlineCodes.push(`<code class="md-inline-code">${escapeHtml(code)}</code>`);
      return placeholder;
    });

    // 4. Alertas do GitHub (> [!NOTE], > [!TIP], > [!WARNING], > [!IMPORTANT], > [!CAUTION])
    text = text.replace(/^>[ ]?\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ ]*\n((?:^>[ ].*\n?)+)/gim, (match, type, content) => {
      const cleanContent = content.replace(/^>[ ]?/gm, '');
      const icons = {
        NOTE: 'ℹ️ Nota',
        TIP: '💡 Dica',
        IMPORTANT: '❗ Importante',
        WARNING: '⚠️ Atenção',
        CAUTION: '🛑 Cuidado'
      };
      return `<div class="md-alert md-alert-${type.toLowerCase()}"><div class="md-alert-title">${icons[type.toUpperCase()] || type}</div><div>${renderMarkdown(cleanContent)}</div></div>\n\n`;
    });

    // 5. Citações / Blockquotes (> ...)
    text = text.replace(/^((?:^>[ ].*\n?)+)/gm, (match) => {
      const clean = match.replace(/^>[ ]?/gm, '');
      return `<blockquote>${renderMarkdown(clean)}</blockquote>\n\n`;
    });

    // 6. Tabelas Markdown (| col | col |)
    text = text.replace(/^(\|.+?\|\n\|[-:| ]+?\|\n(?:\|.+?\|\n?)+)/gm, (match) => {
      const lines = match.trim().split('\n');
      if (lines.length < 2) return match;
      const headerCols = lines[0].split('|').slice(1, -1).map(c => c.trim());
      const alignCols = lines[1].split('|').slice(1, -1).map(c => {
        const trimmed = c.trim();
        if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'center';
        if (trimmed.endsWith(':')) return 'right';
        return 'left';
      });
      let thead = '<thead><tr>' + headerCols.map((c, i) => `<th style="text-align:${alignCols[i] || 'left'}">${renderInline(c)}</th>`).join('') + '</tr></thead>';
      let tbody = '<tbody>';
      for (let r = 2; r < lines.length; r++) {
        const cols = lines[r].split('|').slice(1, -1).map(c => c.trim());
        tbody += '<tr>' + cols.map((c, i) => `<td style="text-align:${alignCols[i] || 'left'}">${renderInline(c)}</td>`).join('') + '</tr>';
      }
      tbody += '</tbody>';
      return `<table class="md-table">${thead}${tbody}</table>\n\n`;
    });

    // 7. Títulos (H1 a H6)
    text = text.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
    text = text.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
    text = text.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    text = text.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    text = text.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    text = text.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // 8. Linhas horizontais (--- ou ***)
    text = text.replace(/^(?:---|\*\*\*|___)\s*$/gim, '<hr class="md-hr">');

    // 9. Listas com Tarefas / Checklists e Listas não ordenadas
    text = text.replace(/^((?:^[-*+][ ].*\n?)+)/gm, (match) => {
      const items = match.trim().split('\n').map(line => {
        let content = line.replace(/^[-*+][ ]/, '');
        if (/^\[ \][ ]/.test(content)) {
          return `<li class="task-list-item"><input type="checkbox" disabled> ${renderInline(content.replace(/^\[ \][ ]/, ''))}</li>`;
        }
        if (/^\[[xX]\][ ]/.test(content)) {
          return `<li class="task-list-item"><input type="checkbox" checked disabled> <del>${renderInline(content.replace(/^\[[xX]\][ ]/, ''))}</del></li>`;
        }
        return `<li>${renderInline(content)}</li>`;
      }).join('');
      return `<ul class="md-list">${items}</ul>\n\n`;
    });

    // 10. Listas numeradas (1. 2. 3.)
    text = text.replace(/^((?:^\d+\.[ ].*\n?)+)/gm, (match) => {
      const items = match.trim().split('\n').map(line => {
        const content = line.replace(/^\d+\.[ ]/, '');
        return `<li>${renderInline(content)}</li>`;
      }).join('');
      return `<ol class="md-list">${items}</ol>\n\n`;
    });

    // 11. Parágrafos separados por linhas duplas
    const blocks = text.split(/\n{2,}/);
    text = blocks.map(block => {
      block = block.trim();
      if (!block) return '';
      if (/^<(h[1-6]|ul|ol|table|blockquote|div|pre|hr)/i.test(block)) {
        return block;
      }
      return `<p>${renderInline(block)}</p>`;
    }).join('\n\n');

    // 12. Restaurar inline code e blocos de código
    inlineCodes.forEach((codeHtml, idx) => {
      text = text.replace(new RegExp(`%%INLINE_CODE_${idx}%%`, 'g'), codeHtml);
    });
    codeBlocks.forEach((blockHtml, idx) => {
      text = text.replace(new RegExp(`%%CODE_BLOCK_${idx}%%`, 'g'), blockHtml);
    });

    return text;
  }

  function renderInline(str) {
    if (!str) return '';
    return str
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="md-img" loading="lazy">')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/__([^_]+)__/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/_([^_]+)_/g, '<em>$1</em>')
      .replace(/~~([^~]+)~~/g, '<del>$1</del>')
      .replace(/\n/g, '<br>');
  }

  function updateMarkdown() {
    if (!mdInput || !mdPreview) return;
    const raw = mdInput.value || '';

    // Render HTML
    mdPreview.innerHTML = renderMarkdown(raw);

    // Compute stats
    const chars = raw.length;
    const words = raw.trim() ? raw.trim().split(/\s+/).length : 0;
    const lines = raw ? raw.split('\n').length : 0;
    const readingMin = Math.max(1, Math.ceil(words / 200));

    if (mdStatWords) mdStatWords.textContent = `${words.toLocaleString('pt-BR')} palavra(s)`;
    if (mdStatChars) mdStatChars.textContent = `${chars.toLocaleString('pt-BR')} caractere(s)`;
    if (mdStatLines) mdStatLines.textContent = `${lines.toLocaleString('pt-BR')} linha(s)`;
    if (mdStatReading) mdStatReading.textContent = `⏱️ ~${readingMin} min de leitura`;
  }

  function insertMarkdown(before, after = '', defaultText = '') {
    if (!mdInput) return;
    const start = mdInput.selectionStart;
    const end = mdInput.selectionEnd;
    const val = mdInput.value;
    const selected = val.substring(start, end) || defaultText;
    const replacement = before + selected + after;
    mdInput.value = val.substring(0, start) + replacement + val.substring(end);
    mdInput.focus();
    mdInput.setSelectionRange(start + before.length, start + before.length + selected.length);
    updateMarkdown();
  }

  // Bind toolbar actions
  document.querySelectorAll('[data-md-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const act = btn.getAttribute('data-md-action');
      if (act === 'bold') insertMarkdown('**', '**', 'texto em negrito');
      else if (act === 'italic') insertMarkdown('*', '*', 'texto em itálico');
      else if (act === 'heading') insertMarkdown('### ', '\n', 'Título');
      else if (act === 'strike') insertMarkdown('~~', '~~', 'texto tachado');
      else if (act === 'quote') insertMarkdown('> ', '\n', 'Citação importante');
      else if (act === 'code') insertMarkdown('`', '`', 'código_inline()');
      else if (act === 'codeblock') insertMarkdown('```bash\n', '\n```\n', '#!/usr/bin/env bash\necho "Executando..."');
      else if (act === 'ul') insertMarkdown('- ', '\n', 'Item da lista');
      else if (act === 'task') insertMarkdown('- [ ] ', '\n', 'Tarefa a realizar');
      else if (act === 'table') insertMarkdown('\n| Item | Descrição | Status |\n| :--- | :--- | :---: |\n| 1 | Configuração do servidor | Concluído |\n| 2 | Teste de conectividade | Pendente |\n\n');
      else if (act === 'link') insertMarkdown('[', '](https://exemplo.com)', 'Nome do Link');
    });
  });

  // View toggles (Split / Editor / Preview)
  const mdWorkspace = document.getElementById('md-workspace');
  document.querySelectorAll('[data-md-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-md-view]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const view = btn.getAttribute('data-md-view');
      if (mdWorkspace) {
        mdWorkspace.classList.remove('view-editor', 'view-preview');
        if (view === 'editor') mdWorkspace.classList.add('view-editor');
        if (view === 'preview') mdWorkspace.classList.add('view-preview');
      }
    });
  });

  // Sample template
  const mdSampleBtn = document.getElementById('md-sample-btn');
  if (mdSampleBtn) {
    mdSampleBtn.addEventListener('click', () => {
      mdInput.value = `# 📝 Guia de Infraestrutura & SRE

Bem-vindo ao **Canivete Suíço Offline**! Este visualizador de Markdown roda **100% no seu navegador**, sem enviar nenhum dado para servidores externos.

> [!TIP]
> Use a barra de ferramentas acima para adicionar formatações rápidas, ou arraste um arquivo \`.md\` direto do seu computador.

---

### 🚀 Checklist de Deploy

- [x] Testes unitários e linters executados
- [x] Imagem de container buildada com tag semântica
- [ ] Backup do banco de dados antes da migração
- [ ] Atualização do manifesto Kubernetes em homologação

---

### 📊 Comparativo de Ambientes

| Ambiente | Host / Cluster | CPU | Memória | Status |
| :--- | :--- | :---: | :---: | :---: |
| Produção | \`k8s-prod-01\` | 64 cores | 256 GB | **Ativo** |
| Homologação | \`k8s-hml-01\` | 16 cores | 64 GB | **Ativo** |
| Desenvolvimento | \`docker-dev\` | 8 cores | 32 GB | *Pendente* |

---

### 💻 Exemplo de Shell Script

\`\`\`bash
#!/usr/bin/env bash
set -euo pipefail

echo "==> Verificando status dos serviços..."
systemctl is-active --quiet nginx && echo "Nginx: OK" || echo "Nginx: FALHA"
systemctl is-active --quiet docker && echo "Docker: OK" || echo "Docker: FALHA"
\`\`\`

> [!WARNING]
> Nunca execute comandos destrutivos sem validação em modo simulação (\`--dry-run\`).

Criado com carinho por [Guilherme Neves](https://guineves.com.br).
`;
      updateMarkdown();
    });
  }

  // Clear button
  const mdClearBtn = document.getElementById('md-clear-btn');
  if (mdClearBtn) {
    mdClearBtn.addEventListener('click', () => {
      mdInput.value = '';
      updateMarkdown();
      mdInput.focus();
    });
  }

  // Copy HTML button
  const mdCopyHtmlBtn = document.getElementById('md-copy-html-btn');
  if (mdCopyHtmlBtn) {
    mdCopyHtmlBtn.addEventListener('click', () => {
      if (mdPreview) {
        copyToClipboard(mdPreview.innerHTML, mdCopyHtmlBtn);
      }
    });
  }

  // Download rendered HTML
  const mdDownloadHtmlBtn = document.getElementById('md-download-html-btn');
  if (mdDownloadHtmlBtn) {
    mdDownloadHtmlBtn.addEventListener('click', () => {
      if (!mdPreview) return;
      const htmlDoc = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Documento Markdown Renderizado</title>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; max-width: 860px; margin: 2rem auto; padding: 0 1.5rem; color: #1f2328; }
h1, h2, h3, h4 { color: #0969da; border-bottom: 1px solid #d0d7de; padding-bottom: 0.3em; margin-top: 1.5em; }
code { font-family: monospace; background: #afb8c133; padding: 0.2em 0.4em; border-radius: 4px; font-size: 85%; }
pre { background: #f6f8fa; padding: 1rem; border-radius: 6px; overflow-x: auto; border: 1px solid #d0d7de; }
pre code { background: none; padding: 0; }
blockquote { border-left: 4px solid #0969da; margin: 1em 0; padding: 0.5em 1em; background: #f6f8fa; color: #57606a; }
table { border-collapse: collapse; width: 100%; margin: 1em 0; }
th, td { border: 1px solid #d0d7de; padding: 6px 13px; }
th { background: #f6f8fa; }
hr { border: none; border-top: 1px solid #d0d7de; margin: 2em 0; }
a { color: #0969da; }
ul, ol { padding-left: 2em; }
</style>
</head>
<body>
${mdPreview.innerHTML}
</body>
</html>`;
      const blob = new Blob([htmlDoc], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'documento.html';
      a.click();
      URL.revokeObjectURL(url);
      showToast('Arquivo HTML baixado com sucesso! ✓');
    });
  }

  // File upload input
  const mdFileInput = document.getElementById('md-file-input');
  if (mdFileInput) {
    mdFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        mdInput.value = evt.target.result;
        updateMarkdown();
        showToast('Arquivo .md carregado com sucesso! ✓');
      };
      reader.readAsText(file);
    });
  }

  // Scroll synchronization between Editor and Preview
  if (mdInput) {
    let isSyncingEditor = false;
    let isSyncingPreview = false;

    mdInput.addEventListener('input', updateMarkdown);

    mdInput.addEventListener('scroll', () => {
      if (isSyncingEditor) { isSyncingEditor = false; return; }
      isSyncingPreview = true;
      const pct = mdInput.scrollTop / (mdInput.scrollHeight - mdInput.clientHeight || 1);
      const previewPane = document.getElementById('md-preview-pane');
      if (previewPane) {
        previewPane.scrollTop = pct * (previewPane.scrollHeight - previewPane.clientHeight);
      }
    });

    const previewPane = document.getElementById('md-preview-pane');
    if (previewPane) {
      previewPane.addEventListener('scroll', () => {
        if (isSyncingPreview) { isSyncingPreview = false; return; }
        isSyncingEditor = true;
        const pct = previewPane.scrollTop / (previewPane.scrollHeight - previewPane.clientHeight || 1);
        mdInput.scrollTop = pct * (mdInput.scrollHeight - mdInput.clientHeight);
      });
    }
  }

  // ==========================================
  // FERRAMENTA: SERVIDORES WEB (NGINX / APACHE HTTPD)
  // ==========================================
  const wsServerRadios = document.querySelectorAll('input[name="ws-server-type"]');
  const wsDomain = document.getElementById('ws-domain');
  const wsAliases = document.getElementById('ws-aliases');
  const wsAppMode = document.getElementById('ws-app-mode');
  const wsTargetVal = document.getElementById('ws-target-val');
  const wsTargetLabel = document.getElementById('ws-target-label');

  const wsProxyOptions = document.getElementById('ws-proxy-options');
  const wsOptWebsocket = document.getElementById('ws-opt-websocket');
  const wsOptFwdHeaders = document.getElementById('ws-opt-fwd-headers');
  const wsOptBuffering = document.getElementById('ws-opt-buffering');

  const wsStaticOptions = document.getElementById('ws-static-options');
  const wsOptSpaFallback = document.getElementById('ws-opt-spa-fallback');
  const wsOptAutoindex = document.getElementById('ws-opt-autoindex');

  const wsPhpOptions = document.getElementById('ws-php-options');
  const wsOptPhpTryfiles = document.getElementById('ws-opt-php-tryfiles');
  const wsOptPhpIntercept = document.getElementById('ws-opt-php-intercept');

  const wsOptSsl = document.getElementById('ws-opt-ssl');
  const wsOptForceHttps = document.getElementById('ws-opt-force-https');
  const wsOptHttp2 = document.getElementById('ws-opt-http2');
  const wsOptHsts = document.getElementById('ws-opt-hsts');
  const wsCertPath = document.getElementById('ws-cert-path');
  const wsKeyPath = document.getElementById('ws-key-path');
  const wsGroupSslPaths = document.getElementById('ws-group-ssl-paths');

  const wsOptSecHeaders = document.getElementById('ws-opt-sec-headers');
  const wsOptHideTokens = document.getElementById('ws-opt-hide-tokens');
  const wsOptBlockHidden = document.getElementById('ws-opt-block-hidden');
  const wsOptCors = document.getElementById('ws-opt-cors');
  const wsMaxBody = document.getElementById('ws-max-body');
  const wsLogName = document.getElementById('ws-log-name');

  const wsOptGzip = document.getElementById('ws-opt-gzip');
  const wsOptCacheAssets = document.getElementById('ws-opt-cache-assets');

  const outWsConfig = document.getElementById('out-ws-config');
  const outWsCmd = document.getElementById('out-ws-cmd');
  const wsOutTitle = document.getElementById('ws-out-title');
  const wsDownloadBtn = document.getElementById('ws-download-btn');

  const wsLinterInput = document.getElementById('ws-linter-input');
  const wsLinterRunBtn = document.getElementById('ws-linter-run-btn');
  const wsLinterSampleBtn = document.getElementById('ws-linter-sample-btn');
  const wsLinterClearBtn = document.getElementById('ws-linter-clear-btn');
  const wsLinterResults = document.getElementById('ws-linter-results');
  const wsLinterBadge = document.getElementById('ws-linter-badge');
  const wsLinterIssues = document.getElementById('ws-linter-issues');

  function getSelectedWebServer() {
    let selected = 'nginx';
    wsServerRadios.forEach(r => {
      if (r.checked) selected = r.value;
    });
    return selected;
  }

  function updateWebServerTool() {
    if (!wsDomain || !outWsConfig) return;

    const serverType = getSelectedWebServer();
    const isNginx = serverType === 'nginx';
    const domain = (wsDomain.value || '').trim() || 'app.exemplo.com.br';
    const aliases = (wsAliases.value || '').trim();
    const appMode = wsAppMode ? wsAppMode.value : 'proxy';
    const targetVal = (wsTargetVal.value || '').trim();

    // Atualiza rótulo e visibilidade das caixas condicionais
    if (wsTargetLabel) {
      if (appMode === 'proxy') wsTargetLabel.textContent = 'Endereço de Destino (Upstream URL):';
      else if (appMode === 'static') wsTargetLabel.textContent = 'Diretório Raiz dos Arquivos (DocumentRoot):';
      else if (appMode === 'php') wsTargetLabel.textContent = 'Diretório Raiz do Projeto (DocumentRoot):';
      else if (appMode === 'redirect') wsTargetLabel.textContent = 'URL de Destino do Redirecionamento 301:';
    }

    if (wsProxyOptions) wsProxyOptions.style.display = (appMode === 'proxy') ? 'block' : 'none';
    if (wsStaticOptions) wsStaticOptions.style.display = (appMode === 'static') ? 'block' : 'none';
    if (wsPhpOptions) wsPhpOptions.style.display = (appMode === 'php') ? 'block' : 'none';

    const enableSsl = wsOptSsl ? wsOptSsl.checked : true;
    if (wsGroupSslPaths) wsGroupSslPaths.style.display = enableSsl ? 'grid' : 'none';

    const forceHttps = (wsOptForceHttps && wsOptForceHttps.checked) && enableSsl;
    const enableHttp2 = wsOptHttp2 ? wsOptHttp2.checked : true;
    const enableHsts = wsOptHsts ? wsOptHsts.checked : true;
    const certPath = (wsCertPath.value || '').trim() || `/etc/letsencrypt/live/${domain}/fullchain.pem`;
    const keyPath = (wsKeyPath.value || '').trim() || `/etc/letsencrypt/live/${domain}/privkey.pem`;

    const secHeaders = wsOptSecHeaders ? wsOptSecHeaders.checked : true;
    const hideTokens = wsOptHideTokens ? wsOptHideTokens.checked : true;
    const blockHidden = wsOptBlockHidden ? wsOptBlockHidden.checked : true;
    const cors = wsOptCors ? wsOptCors.checked : false;
    const maxBody = (wsMaxBody.value || '').trim() || '25M';
    const logName = (wsLogName.value || '').trim() || domain;

    const gzip = wsOptGzip ? wsOptGzip.checked : true;
    const cacheAssets = wsOptCacheAssets ? wsOptCacheAssets.checked : true;

    const wsSupport = wsOptWebsocket ? wsOptWebsocket.checked : true;
    const fwdHeaders = wsOptFwdHeaders ? wsOptFwdHeaders.checked : true;
    const bufferingOff = wsOptBuffering ? wsOptBuffering.checked : false;

    const spaFallback = wsOptSpaFallback ? wsOptSpaFallback.checked : true;
    const autoindex = wsOptAutoindex ? wsOptAutoindex.checked : false;

    const phpTryFiles = wsOptPhpTryfiles ? wsOptPhpTryfiles.checked : true;
    const phpIntercept = wsOptPhpIntercept ? wsOptPhpIntercept.checked : false;

    const lines = [];

    if (isNginx) {
      if (wsOutTitle) wsOutTitle.textContent = 'Configuração Gerada (Nginx Server Block)';

      lines.push('# ===========================================================');
      lines.push(`# NGINX Server Block — ${domain}`);
      lines.push('# Gerado pelo Canivete Suíço Offline (guineves.com.br/canivete)');
      lines.push('# ===========================================================');
      lines.push('');

      const serverNames = aliases ? `${domain} ${aliases}` : domain;

      // Bloco Porta 80
      lines.push('server {');
      lines.push('    listen 80;');
      lines.push('    listen [::]:80;');
      lines.push(`    server_name ${serverNames};`);
      lines.push('');

      if (forceHttps) {
        lines.push('    # Redirecionamento permanente para HTTPS');
        lines.push('    return 301 https://$host$request_uri;');
        lines.push('}');
        lines.push('');

        // Bloco Porta 443
        lines.push('server {');
        const http2Str = enableHttp2 ? ' http2' : '';
        lines.push(`    listen 443 ssl${http2Str};`);
        lines.push(`    listen [::]:443 ssl${http2Str};`);
        lines.push(`    server_name ${serverNames};`);
        lines.push('');

        lines.push('    # Certificados SSL / TLS');
        lines.push(`    ssl_certificate ${certPath};`);
        lines.push(`    ssl_certificate_key ${keyPath};`);
        lines.push('    ssl_protocols TLSv1.2 TLSv1.3;');
        lines.push('    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;');
        lines.push('    ssl_prefer_server_ciphers off;');
        lines.push('    ssl_session_cache shared:SSL:10m;');
        lines.push('    ssl_session_timeout 1d;');
        lines.push('    ssl_session_tickets off;');
        lines.push('');

        if (enableHsts) {
          lines.push('    # HSTS (HTTP Strict Transport Security)');
          lines.push('    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;');
          lines.push('');
        }
      }

      // Hardening
      if (secHeaders) {
        lines.push('    # Cabeçalhos de Segurança (Hardening)');
        lines.push('    add_header X-Frame-Options "SAMEORIGIN" always;');
        lines.push('    add_header X-Content-Type-Options "nosniff" always;');
        lines.push('    add_header Referrer-Policy "strict-origin-when-cross-origin" always;');
        lines.push('    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;');
        lines.push('');
      }

      if (hideTokens) {
        lines.push('    # Ocultar versão do Nginx');
        lines.push('    server_tokens off;');
        lines.push('');
      }

      if (cors) {
        lines.push('    # Cabeçalhos CORS');
        lines.push('    add_header Access-Control-Allow-Origin "*" always;');
        lines.push('    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, PATCH, OPTIONS" always;');
        lines.push('    add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;');
        lines.push('');
      }

      if (maxBody) {
        lines.push(`    # Limite máximo de corpo da requisição`);
        lines.push(`    client_max_body_size ${maxBody};`);
        lines.push('');
      }

      lines.push('    # Logs de Acesso e Erro');
      lines.push(`    access_log /var/log/nginx/${logName}.access.log combined;`);
      lines.push(`    error_log /var/log/nginx/${logName}.error.log warn;`);
      lines.push('');

      if (gzip) {
        lines.push('    # Compressão Gzip');
        lines.push('    gzip on;');
        lines.push('    gzip_vary on;');
        lines.push('    gzip_proxied any;');
        lines.push('    gzip_comp_level 6;');
        lines.push('    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;');
        lines.push('');
      }

      if (blockHidden) {
        lines.push('    # Bloquear acesso a pastas e arquivos ocultos (.git, .env, .htaccess)');
        lines.push('    location ~ /\\.(?!well-known) {');
        lines.push('        deny all;');
        lines.push('        return 404;');
        lines.push('    }');
        lines.push('');
      }

      if (appMode === 'proxy') {
        lines.push('    # Proxy Reverso para aplicação');
        lines.push('    location / {');
        lines.push(`        proxy_pass ${targetVal || 'http://127.0.0.1:3000'};`);
        lines.push('        proxy_http_version 1.1;');
        if (wsSupport) {
          lines.push('        proxy_set_header Upgrade $http_upgrade;');
          lines.push('        proxy_set_header Connection $connection_upgrade;');
        }
        if (fwdHeaders) {
          lines.push('        proxy_set_header Host $host;');
          lines.push('        proxy_set_header X-Real-IP $remote_addr;');
          lines.push('        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;');
          lines.push('        proxy_set_header X-Forwarded-Proto $scheme;');
        }
        if (bufferingOff) {
          lines.push('        proxy_buffering off;');
        }
        lines.push('        proxy_connect_timeout 60s;');
        lines.push('        proxy_send_timeout 60s;');
        lines.push('        proxy_read_timeout 60s;');
        lines.push('    }');
      } else if (appMode === 'static') {
        lines.push('    # Servir arquivos estáticos / SPA');
        lines.push(`    root ${targetVal || '/var/www/html'};`);
        lines.push('    index index.html index.htm;');
        lines.push('');
        lines.push('    location / {');
        if (spaFallback) {
          lines.push('        try_files $uri $uri/ /index.html;');
        } else {
          lines.push('        try_files $uri $uri/ =404;');
        }
        if (autoindex) {
          lines.push('        autoindex on;');
        }
        lines.push('    }');
      } else if (appMode === 'php') {
        lines.push('    # Servir aplicação PHP-FPM');
        lines.push(`    root ${targetVal || '/var/www/html'};`);
        lines.push('    index index.php index.html;');
        lines.push('');
        lines.push('    location / {');
        lines.push('        try_files $uri $uri/ /index.php?$args;');
        lines.push('    }');
        lines.push('');
        lines.push('    location ~ \\.php$ {');
        if (phpTryFiles) {
          lines.push('        try_files $uri =404;');
        }
        lines.push('        include fastcgi_params;');
        lines.push('        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;');
        lines.push('        fastcgi_pass unix:/run/php/php8.2-fpm.sock;');
        if (phpIntercept) {
          lines.push('        fastcgi_intercept_errors on;');
        }
        lines.push('    }');
      } else if (appMode === 'redirect') {
        lines.push(`    # Redirecionamento 301 Permanente`);
        lines.push(`    return 301 ${targetVal || 'https://destino.com.br$request_uri'};`);
      }

      if (cacheAssets && appMode !== 'redirect') {
        lines.push('');
        lines.push('    # Cache de assets estáticos');
        lines.push('    location ~* \\.(?:ico|css|js|gif|jpe?g|png|webp|svg|woff2?|ttf|eot)$ {');
        lines.push('        expires 30d;');
        lines.push('        add_header Cache-Control "public, max-age=2592000, immutable";');
        lines.push('        access_log off;');
        lines.push('    }');
      }

      lines.push('}');

      if (outWsCmd) {
        outWsCmd.textContent = `# 1. Salvar configuração no Ubuntu/Debian:
sudo nano /etc/nginx/sites-available/${domain}.conf
sudo ln -s /etc/nginx/sites-available/${domain}.conf /etc/nginx/sites-enabled/

# 2. Testar sintaxe e recarregar sem downtime:
sudo nginx -t && sudo systemctl reload nginx`;
      }

    } else {
      // Apache HTTPD
      if (wsOutTitle) wsOutTitle.textContent = 'Configuração Gerada (Apache HTTPD VirtualHost)';

      lines.push('# ===========================================================');
      lines.push(`# APACHE HTTPD VirtualHost — ${domain}`);
      lines.push('# Gerado pelo Canivete Suíço Offline (guineves.com.br/canivete)');
      lines.push('# ===========================================================');
      lines.push('');

      lines.push('<VirtualHost *:80>');
      lines.push(`    ServerName ${domain}`);
      if (aliases) {
        lines.push(`    ServerAlias ${aliases}`);
      }
      lines.push('');

      if (forceHttps) {
        lines.push('    # Redirecionamento forçado para HTTPS');
        lines.push('    RewriteEngine On');
        lines.push('    RewriteCond %{HTTPS} off');
        lines.push('    RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]');
        lines.push('</VirtualHost>');
        lines.push('');

        lines.push('<VirtualHost *:443>');
        lines.push(`    ServerName ${domain}`);
        if (aliases) {
          lines.push(`    ServerAlias ${aliases}`);
        }
        if (enableHttp2) {
          lines.push('    Protocols h2 http/1.1');
        }
        lines.push('');

        lines.push('    # Certificados SSL / TLS');
        lines.push('    SSLEngine on');
        lines.push(`    SSLCertificateFile ${certPath}`);
        lines.push(`    SSLCertificateKeyFile ${keyPath}`);
        lines.push('    SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1');
        lines.push('    SSLCipherSuite ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384');
        lines.push('    SSLHonorCipherOrder off');
        lines.push('');

        if (enableHsts) {
          lines.push('    # HSTS');
          lines.push('    Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"');
          lines.push('');
        }
      }

      if (secHeaders) {
        lines.push('    # Cabeçalhos de Segurança');
        lines.push('    Header always set X-Frame-Options "SAMEORIGIN"');
        lines.push('    Header always set X-Content-Type-Options "nosniff"');
        lines.push('    Header always set Referrer-Policy "strict-origin-when-cross-origin"');
        lines.push('');
      }

      if (hideTokens) {
        lines.push('    # Ocultar versão do Apache');
        lines.push('    ServerSignature Off');
        lines.push('');
      }

      if (cors) {
        lines.push('    # Cabeçalhos CORS');
        lines.push('    Header always set Access-Control-Allow-Origin "*"');
        lines.push('    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, PATCH, OPTIONS"');
        lines.push('    Header always set Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization"');
        lines.push('');
      }

      lines.push('    # Logs de Acesso e Erro');
      lines.push(`    CustomLog /var/log/apache2/${logName}_access.log combined`);
      lines.push(`    ErrorLog /var/log/apache2/${logName}_error.log`);
      lines.push('');

      if (gzip) {
        lines.push('    # Compressão Deflate / Gzip');
        lines.push('    <IfModule mod_deflate.c>');
        lines.push('        AddOutputFilterByType DEFLATE text/plain text/html text/xml text/css application/json application/javascript image/svg+xml');
        lines.push('    </IfModule>');
        lines.push('');
      }

      if (blockHidden) {
        lines.push('    # Bloquear arquivos ocultos (.git, .env, .htaccess)');
        lines.push('    <FilesMatch "^\\.(?!well-known)">');
        lines.push('        Require all denied');
        lines.push('    </FilesMatch>');
        lines.push('');
      }

      if (appMode === 'proxy') {
        lines.push('    # Proxy Reverso');
        lines.push('    ProxyPreserveHost On');
        lines.push('    ProxyRequests Off');
        const proxyUrl = targetVal || 'http://127.0.0.1:3000';
        const formattedUrl = proxyUrl.endsWith('/') ? proxyUrl : proxyUrl + '/';
        if (wsSupport) {
          lines.push('    RewriteEngine On');
          lines.push('    RewriteCond %{HTTP:Upgrade} websocket [NC]');
          lines.push('    RewriteCond %{HTTP:Connection} upgrade [NC]');
          const wsTarget = formattedUrl.replace(/^http:\/\//, 'ws://').replace(/^https:\/\//, 'wss://');
          lines.push(`    RewriteRule ^/?(.*) ${wsTarget}$1 [P,L]`);
        }
        lines.push(`    ProxyPass / ${formattedUrl}`);
        lines.push(`    ProxyPassReverse / ${formattedUrl}`);
      } else if (appMode === 'static') {
        const rootPath = targetVal || '/var/www/html';
        lines.push(`    DocumentRoot "${rootPath}"`);
        lines.push(`    <Directory "${rootPath}">`);
        lines.push('        Options -Indexes +FollowSymLinks');
        lines.push('        AllowOverride All');
        lines.push('        Require all granted');
        if (spaFallback) {
          lines.push('        # Fallback de SPA para /index.html');
          lines.push('        FallbackResource /index.html');
        }
        lines.push('    </Directory>');
      } else if (appMode === 'php') {
        const rootPath = targetVal || '/var/www/html';
        lines.push(`    DocumentRoot "${rootPath}"`);
        lines.push(`    <Directory "${rootPath}">`);
        lines.push('        Options -Indexes +FollowSymLinks');
        lines.push('        AllowOverride All');
        lines.push('        Require all granted');
        lines.push('    </Directory>');
        lines.push('    # PHP-FPM Handler');
        lines.push('    <FilesMatch \\.php$>');
        lines.push('        SetHandler "proxy:unix:/run/php/php8.2-fpm.sock|fcgi://localhost/"');
        lines.push('    </FilesMatch>');
      } else if (appMode === 'redirect') {
        lines.push(`    Redirect permanent / ${targetVal || 'https://destino.com.br/'}`);
      }

      lines.push('</VirtualHost>');

      if (outWsCmd) {
        outWsCmd.textContent = `# 1. Salvar configuração no Ubuntu/Debian:
sudo nano /etc/apache2/sites-available/${domain}.conf
sudo a2ensite ${domain}.conf

# 2. Habilitar módulos comuns se necessário:
sudo a2enmod ssl rewrite proxy proxy_http headers deflate

# 3. Testar sintaxe e recarregar:
sudo apachectl configtest && sudo systemctl reload apache2`;
      }
    }

    outWsConfig.textContent = lines.join('\n');
  }

  // Presets do Servidor Web
  document.querySelectorAll('.ws-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ws-preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const preset = btn.getAttribute('data-preset');

      if (preset === 'proxy') {
        if (wsAppMode) wsAppMode.value = 'proxy';
        if (wsTargetVal) wsTargetVal.value = 'http://127.0.0.1:3000';
        if (wsOptWebsocket) wsOptWebsocket.checked = true;
      } else if (preset === 'spa') {
        if (wsAppMode) wsAppMode.value = 'static';
        if (wsTargetVal) wsTargetVal.value = '/var/www/app/dist';
        if (wsOptSpaFallback) wsOptSpaFallback.checked = true;
      } else if (preset === 'php') {
        if (wsAppMode) wsAppMode.value = 'php';
        if (wsTargetVal) wsTargetVal.value = '/var/www/wordpress';
        if (wsOptPhpTryfiles) wsOptPhpTryfiles.checked = true;
      } else if (preset === 'redirect') {
        if (wsAppMode) wsAppMode.value = 'redirect';
        if (wsTargetVal) wsTargetVal.value = 'https://novodominio.com.br$request_uri';
      }

      updateWebServerTool();
      showToast(`Preset "${btn.textContent.trim()}" carregado! ✓`);
    });
  });

  // Download do arquivo de configuração
  if (wsDownloadBtn) {
    wsDownloadBtn.addEventListener('click', () => {
      const configText = outWsConfig ? outWsConfig.textContent : '';
      if (!configText) return;
      const domain = (wsDomain ? wsDomain.value : '').trim() || 'webserver';
      const blob = new Blob([configText], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${domain}.conf`;
      a.click();
      URL.revokeObjectURL(a.href);
      showToast(`Arquivo ${domain}.conf baixado! ✓`);
    });
  }

  // Linter de Configuração Nginx / Apache
  function runWebServerLinter() {
    if (!wsLinterInput || !wsLinterResults || !wsLinterBadge || !wsLinterIssues) return;
    const text = wsLinterInput.value.trim();
    if (!text) {
      wsLinterResults.style.display = 'none';
      return;
    }

    const issues = [];
    const isApache = text.includes('<VirtualHost') || text.includes('</VirtualHost>') || text.includes('DocumentRoot') || text.includes('ServerName');
    const lines = text.split('\n');

    let braceCount = 0;
    let vhostOpen = 0;
    let dirOpen = 0;

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      if (!isApache) {
        // Nginx checks
        for (const ch of trimmed) {
          if (ch === '{') braceCount++;
          if (ch === '}') braceCount--;
        }

        // Ponto e vírgula faltante no final de diretivas Nginx
        if (!trimmed.endsWith(';') && !trimmed.endsWith('{') && !trimmed.endsWith('}') && !trimmed.startsWith('#')) {
          issues.push({
            line: lineNum,
            type: 'error',
            message: `Possível ponto e vírgula (\`;\`) faltante na diretiva: "${trimmed.slice(0, 45)}"`,
            tip: 'Diretivas no Nginx devem ser finalizadas com ponto e vírgula (;).'
          });
        }

        // if is evil pattern
        if (/^if\s*\(/.test(trimmed)) {
          issues.push({
            line: lineNum,
            type: 'warning',
            message: `Uso de "if" detectado: "${trimmed.slice(0, 45)}"`,
            tip: 'No Nginx, diretivas "if" dentro de blocos location têm comportamento imprevisível ("If is Evil"). Prefira try_files ou return.'
          });
        }
      } else {
        // Apache checks
        if (/<VirtualHost\b/i.test(trimmed)) vhostOpen++;
        if (/<\/VirtualHost>/i.test(trimmed)) vhostOpen--;
        if (/<Directory\b/i.test(trimmed)) dirOpen++;
        if (/<\/Directory>/i.test(trimmed)) dirOpen--;
      }

      // Checagem de protocolos inseguros (ambos)
      if (/ssl_protocols\s+.*(?:SSLv[23]|TLSv1(?:\.0|\.1)?\b)/i.test(trimmed) || /SSLProtocol\s+.*(?:SSLv[23]|TLSv1(?:\.0|\.1)?\b)/i.test(trimmed)) {
        issues.push({
          line: lineNum,
          type: 'error',
          message: `Protocolo TLS/SSL obsoleto detectado: "${trimmed}"`,
          tip: 'Desative SSLv3, TLSv1.0 e TLSv1.1 por conterem vulnerabilidades conhecidas (POODLE, BEAST). Use apenas TLSv1.2 e TLSv1.3.'
        });
      }

      // Verificação de ciphers fracos (MD5, RC4, DES)
      if (/(?:MD5|RC4|DES|3DES)/i.test(trimmed) && (trimmed.includes('ssl_ciphers') || trimmed.includes('SSLCipherSuite'))) {
        issues.push({
          line: lineNum,
          type: 'error',
          message: `Ciphers criptográficos fracos detectados: "${trimmed.slice(0, 45)}"`,
          tip: 'Remova ciphers legados baseados em RC4, DES ou MD5.'
        });
      }
    });

    if (!isApache && braceCount !== 0) {
      issues.push({
        line: 0,
        type: 'error',
        message: `Chaves desbalanceadas: ${braceCount > 0 ? braceCount + ' chave(s) "{" abertas sem fechamento' : Math.abs(braceCount) + ' chave(s) "}" fechadas a mais'}.`,
        tip: 'Verifique os fechamentos de cada bloco server { ... } e location { ... }.'
      });
    }

    if (isApache) {
      if (vhostOpen !== 0) {
        issues.push({
          line: 0,
          type: 'error',
          message: `Tags <VirtualHost> desbalanceadas no Apache (${vhostOpen > 0 ? vhostOpen + ' tag(s) sem fechamento </VirtualHost>' : 'fechamentos extras'}).`,
          tip: 'Todo bloco <VirtualHost ...> deve ser fechado com </VirtualHost>.'
        });
      }
      if (dirOpen !== 0) {
        issues.push({
          line: 0,
          type: 'error',
          message: `Tags <Directory> desbalanceadas no Apache (${dirOpen > 0 ? dirOpen + ' tag(s) sem fechamento </Directory>' : 'fechamentos extras'}).`,
          tip: 'Todo bloco <Directory ...> deve ser fechado com </Directory>.'
        });
      }
    }

    // Alertas de boas práticas
    if (!text.includes('nosniff')) {
      issues.push({
        line: 0,
        type: 'warning',
        message: 'Falta do cabeçalho "X-Content-Type-Options: nosniff".',
        tip: 'Evita que navegadores tentem adivinhar o tipo MIME de arquivos carregados (MIME sniffing).'
      });
    }

    if (!text.includes('server_tokens off') && !text.includes('ServerSignature Off') && !text.includes('ServerTokens Prod')) {
      issues.push({
        line: 0,
        type: 'warning',
        message: 'Versão do servidor exposta em cabeçalhos HTTP.',
        tip: 'Adicione "server_tokens off;" (Nginx) ou "ServerSignature Off" (Apache) para dificultar reconhecimento do sistema por atacantes.'
      });
    }

    // Renderiza resultados
    wsLinterResults.style.display = 'block';
    const errors = issues.filter(i => i.type === 'error');
    const warnings = issues.filter(i => i.type === 'warning');

    if (errors.length === 0 && warnings.length === 0) {
      wsLinterBadge.className = 'ws-status-card valid';
      wsLinterBadge.textContent = '✅ Configuração válida! Nenhum erro de sintaxe ou violação de boas práticas detectada.';
      wsLinterIssues.innerHTML = '';
    } else if (errors.length > 0) {
      wsLinterBadge.className = 'ws-status-card invalid';
      wsLinterBadge.textContent = `❌ ${errors.length} erro(s) de sintaxe encontrado(s) e ${warnings.length} aviso(s).`;
    } else {
      wsLinterBadge.className = 'ws-status-card warning';
      wsLinterBadge.textContent = `⚠️ Sintaxe estrutural correta, mas com ${warnings.length} aviso(s) de segurança/boas práticas.`;
    }

    if (issues.length > 0) {
      wsLinterIssues.innerHTML = issues.map(iss => `
        <div class="ws-issue-item">
          <div class="ws-issue-head">
            <span class="ws-issue-badge ${iss.type}">${iss.type === 'error' ? 'Erro' : 'Aviso'}</span>
            ${iss.line > 0 ? `<span class="ws-issue-line">Linha ${iss.line}</span>` : '<span class="ws-issue-line">Global</span>'}
          </div>
          <div class="ws-issue-desc"><strong>${escapeHtml(iss.message)}</strong></div>
          <div style="font-size:0.75rem; color:var(--muted);">${escapeHtml(iss.tip)}</div>
        </div>
      `).join('');
    }
  }

  if (wsLinterRunBtn) wsLinterRunBtn.addEventListener('click', runWebServerLinter);
  if (wsLinterClearBtn) {
    wsLinterClearBtn.addEventListener('click', () => {
      if (wsLinterInput) wsLinterInput.value = '';
      if (wsLinterResults) wsLinterResults.style.display = 'none';
    });
  }
  if (wsLinterSampleBtn) {
    wsLinterSampleBtn.addEventListener('click', () => {
      if (wsLinterInput) {
        wsLinterInput.value = `server {
    listen 80
    server_name meu-site.com.br
    ssl_protocols TLSv1.0 TLSv1.2;

    location / {
        proxy_pass http://127.0.0.1:8080
    }

    location /upload {
        if ($request_method = POST) {
            return 200;
        }
    }
`;
        runWebServerLinter();
        showToast('Exemplo com falhas de sintaxe carregado! ✓');
      }
    });
  }

  // Eventos de entrada do Servidor Web
  wsServerRadios.forEach(r => r.addEventListener('change', updateWebServerTool));
  [wsDomain, wsAliases, wsAppMode, wsTargetVal, wsOptWebsocket, wsOptFwdHeaders, wsOptBuffering, wsOptSpaFallback, wsOptAutoindex, wsOptPhpTryfiles, wsOptPhpIntercept, wsOptSsl, wsOptForceHttps, wsOptHttp2, wsOptHsts, wsCertPath, wsKeyPath, wsOptSecHeaders, wsOptHideTokens, wsOptBlockHidden, wsOptCors, wsMaxBody, wsLogName, wsOptGzip, wsOptCacheAssets].forEach(el => {
    if (el) {
      el.addEventListener('input', updateWebServerTool);
      el.addEventListener('change', updateWebServerTool);
    }
  });

  // ==========================================
  // FERRAMENTA: TESTADOR & CONSTRUTOR GROK
  // ==========================================
  const GROK_BUILTIN_PATTERNS = {
    "USERNAME": "[a-zA-Z0-9._-]+",
    "USER": "(?:[a-zA-Z0-9._-]+)",
    "INT": "(?:[+-]?(?:[0-9]+))",
    "BASE10NUM": "(?<![0-9.+-])(?:[+-]?(?:(?:[0-9]+(?:\\.[0-9]+)?)|(?:\\.[0-9]+)))",
    "NUMBER": "(?:(?<![0-9.+-])(?:[+-]?(?:(?:[0-9]+(?:\\.[0-9]+)?)|(?:\\.[0-9]+))))",
    "POSINT": "\\b(?:[1-9][0-9]*)\\b",
    "NONNEGINT": "\\b(?:[0-9]+)\\b",
    "WORD": "\\b\\w+\\b",
    "NOTSPACE": "\\S+",
    "SPACE": "\\s*",
    "DATA": ".*?",
    "GREEDYDATA": ".*",
    "QUOTEDSTRING": "(?:\"(?:[^\"\\\\]|\\\\.)*\"|'(?:[^'\\\\]|\\\\.)*')",
    "IPV4": "(?<![0-9])(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?![0-9])",
    "IPV6": "((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3})|:)))",
    "IP": "(?:((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3})|:)))|(?<![0-9])(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?![0-9]))",
    "HOSTNAME": "\\b[0-9A-Za-z](?:[0-9A-Za-z-]{0,62}[0-9A-Za-z])?(?:\\.[0-9A-Za-z](?:[0-9A-Za-z-]{0,62}[0-9A-Za-z])?)*\\b",
    "IPORHOST": "(?:(?:((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3})|:)))|(?<![0-9])(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?![0-9]))|\\b[0-9A-Za-z](?:[0-9A-Za-z-]{0,62}[0-9A-Za-z])?(?:\\.[0-9A-Za-z](?:[0-9A-Za-z-]{0,62}[0-9A-Za-z])?)*\\b)",
    "MONTH": "\\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\\b",
    "MONTHNUM": "(?:0?[1-9]|1[0-2])",
    "MONTHDAY": "(?:(?:0[1-9])|(?:[12][0-9])|(?:3[01])|[1-9])",
    "YEAR": "(?:\\d\\d){1,2}",
    "HOUR": "(?:2[0123]|[01]?[0-9])",
    "MINUTE": "(?:[0-5][0-9])",
    "SECOND": "(?:(?:[0-5]?[0-9]|60)(?:[.,][0-9]+)?)",
    "TIME": "(?:(?:2[0123]|[01]?[0-9]):(?:[0-5][0-9])(?::(?:(?:[0-5]?[0-9]|60)(?:[.,][0-9]+)?))?)",
    "ISO8601_TIMEZONE": "(?:Z|[+-](?:2[0123]|[01]?[0-9])(?::?(?:[0-5][0-9])))",
    "TIMESTAMP_ISO8601": "(?:(?:\\d\\d){1,2}-(?:0?[1-9]|1[0-2])-(?:(?:0[1-9])|(?:[12][0-9])|(?:3[01])|[1-9])[T ](?:2[0123]|[01]?[0-9]):?(?:[0-5][0-9])(?::?(?:(?:[0-5]?[0-9]|60)(?:[.,][0-9]+)?))?(?:Z|[+-](?:2[0123]|[01]?[0-9])(?::?(?:[0-5][0-9])))?)",
    "HTTPDATE": "(?:(?:(?:0[1-9])|(?:[12][0-9])|(?:3[01])|[1-9])/(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)/(?:\\d\\d){1,2}:(?:(?:2[0123]|[01]?[0-9]):(?:[0-5][0-9])(?::(?:(?:[0-5]?[0-9]|60)(?:[.,][0-9]+)?))?) (?:Z|[+-](?:2[0123]|[01]?[0-9])(?::?(?:[0-5][0-9]))))",
    "LOGLEVEL": "(?:[Aa]lert|ALERT|[Tt]race|TRACE|[Dd]ebug|DEBUG|[Nn]otice|NOTICE|[Ii]nfo|INFO|[Ww]arn?(?:ing)?|WARN?(?:ING)?|[Ee]rr?(?:or)?|ERR?(?:OR)?|[Cc]rit?(?:ical)?|CRIT?(?:ICAL)?|[Ff]atal|FATAL|[Ss]ev(?:ere)?|SEV(?:ERE)?|[Ee]merg(?:ency)?|EMERG(?:ENCY)?)",
    "QS": "(?:\"(?:[^\"\\\\]|\\\\.)*\"|'(?:[^'\\\\]|\\\\.)*')",

    // Syslog
    "SYSLOGTIMESTAMP": "(?:%{MONTH} +%{MONTHDAY} %{TIME})",
    "PROG": "[\\w._-]+",
    "SYSLOGPROG": "(?:%{PROG:program}(?:\\[%{POSINT:pid}\\])?)",
    "SYSLOGHOST": "%{IPORHOST}",
    "SYSLOGFACILITY": "<%{NONNEGINT:syslog_facility}>",
    "SYSLOGSEVERITY": "<%{NONNEGINT:syslog_severity}>",
    "SYSLOGBASE": "(?:%{SYSLOGTIMESTAMP:timestamp} (?:%{SYSLOGFACILITY} )?%{SYSLOGHOST:logsource} %{SYSLOGPROG}:)",
    "SYSLOGLINE": "(?:%{SYSLOGBASE} %{GREEDYDATA:message})",

    // Paths, URIs & Identifiers
    "PATH": "(?:(?:/[A-Za-z0-9._-]+)+|(?:[A-Za-z]:\\\\[A-Za-z0-9._-]+(?:\\.[A-Za-z0-9]+)?))",
    "UNIXPATH": "(?:/[A-Za-z0-9._-]+)+",
    "WINPATH": "(?:[A-Za-z]:\\\\(?:[A-Za-z0-9._-]+\\\\?)*)",
    "URIPROTO": "[A-Za-z]+(\\+[A-Za-z+]+)?",
    "URIHOST": "%{IPORHOST}(?::%{POSINT:port})?",
    "URIPATH": "(?:/[A-Za-z0-9$.+!*'(){},~:;=@#%_\\-]*)+",
    "URIPARAM": "\\?[A-Za-z0-9$.+!*'(){},~#%&/=:;@_~\\[\\]-]*",
    "URIPATHPARAM": "%{URIPATH}(?:%{URIPARAM})?",
    "URI": "%{URIPROTO}://(?:%{USER}(?::[^@]*)?@)?(?:%{URIHOST})?(?:%{URIPATHPARAM})?",
    "UUID": "[A-Fa-f0-9]{8}-(?:[A-Fa-f0-9]{4}-){3}[A-Fa-f0-9]{12}",
    "MAC": "(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}",
    "EMAILADDRESS": "[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+",

    // Apache / Nginx
    "COMMONAPACHELOG": "(?<clientip>(?:(?:((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3})|:)))|(?<![0-9])(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?![0-9]))|\\b[0-9A-Za-z](?:[0-9A-Za-z-]{0,62}[0-9A-Za-z])?(?:\\.[0-9A-Za-z](?:[0-9A-Za-z-]{0,62}[0-9A-Za-z])?)*\\b)) (?<ident>(?:[a-zA-Z0-9._-]+)) (?<auth>(?:[a-zA-Z0-9._-]+)) \\[(?<timestamp>(?:(?:(?:0[1-9])|(?:[12][0-9])|(?:3[01])|[1-9])/(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)/(?:\\d\\d){1,2}:(?:(?:2[0123]|[01]?[0-9]):(?:[0-5][0-9])(?::(?:(?:[0-5]?[0-9]|60)(?:[.,][0-9]+)?))?) (?:Z|[+-](?:2[0123]|[01]?[0-9])(?::?(?:[0-5][0-9])))))\\] \"(?:(?<verb>\\b\\w+\\b) (?<request>\\S+)(?: HTTP/(?<httpversion>(?:(?<![0-9.+-])(?:[+-]?(?:(?:[0-9]+(?:\\.[0-9]+)?)|(?:\\.[0-9]+))))))?|(?<rawrequest>.*?))\" (?<response>(?:(?<![0-9.+-])(?:[+-]?(?:(?:[0-9]+(?:\\.[0-9]+)?)|(?:\\.[0-9]+))))) (?<bytes>(?:(?<![0-9.+-])(?:[+-]?(?:(?:[0-9]+(?:\\.[0-9]+)?)|(?:\\.[0-9]+)))|-))",
    "COMBINEDAPACHELOG": "(?<clientip>(?:(?:((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3})|:)))|(?<![0-9])(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?![0-9]))|\\b[0-9A-Za-z](?:[0-9A-Za-z-]{0,62}[0-9A-Za-z])?(?:\\.[0-9A-Za-z](?:[0-9A-Za-z-]{0,62}[0-9A-Za-z])?)*\\b)) (?<ident>(?:[a-zA-Z0-9._-]+)) (?<auth>(?:[a-zA-Z0-9._-]+)) \\[(?<timestamp>(?:(?:(?:0[1-9])|(?:[12][0-9])|(?:3[01])|[1-9])/(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)/(?:\\d\\d){1,2}:(?:(?:2[0123]|[01]?[0-9]):(?:[0-5][0-9])(?::(?:(?:[0-5]?[0-9]|60)(?:[.,][0-9]+)?))?) (?:Z|[+-](?:2[0123]|[01]?[0-9])(?::?(?:[0-5][0-9])))))\\] \"(?:(?<verb>\\b\\w+\\b) (?<request>\\S+)(?: HTTP/(?<httpversion>(?:(?<![0-9.+-])(?:[+-]?(?:(?:[0-9]+(?:\\.[0-9]+)?)|(?:\\.[0-9]+))))))?|(?<rawrequest>.*?))\" (?<response>(?:(?<![0-9.+-])(?:[+-]?(?:(?:[0-9]+(?:\\.[0-9]+)?)|(?:\\.[0-9]+))))) (?<bytes>(?:(?<![0-9.+-])(?:[+-]?(?:(?:[0-9]+(?:\\.[0-9]+)?)|(?:\\.[0-9]+)))|-)) (?<referrer>(?:\"(?:[^\"\\\\]|\\\\.)*\"|'(?:[^'\\\\]|\\\\.)*')) (?<agent>(?:\"(?:[^\"\\\\]|\\\\.)*\"|'(?:[^'\\\\]|\\\\.)*'))"
  };

  const grokPatternInput = document.getElementById('grok-pattern-input');
  const grokLogInput = document.getElementById('grok-log-input');
  const grokCustomPatterns = document.getElementById('grok-custom-patterns');
  const grokRunBtn = document.getElementById('grok-run-btn');
  const grokCopyRegexBtn = document.getElementById('grok-copy-regex-btn');

  const grokMatchIndicator = document.getElementById('grok-match-indicator');
  const grokHighlightBox = document.getElementById('grok-highlight-box');
  const grokFieldsCount = document.getElementById('grok-fields-count');
  const grokTableMeta = document.getElementById('grok-table-meta');
  const grokPatternCountBadge = document.getElementById('grok-pattern-count-badge');
  const grokFieldsBody = document.getElementById('grok-fields-body');
  const outGrokJson = document.getElementById('out-grok-json');

  const outGrokLogstash = document.getElementById('out-grok-logstash');
  const outGrokElastic = document.getElementById('out-grok-elastic');
  const outGrokLoki = document.getElementById('out-grok-loki');
  const outGrokVector = document.getElementById('out-grok-vector');

  let lastCompiledGrokRegex = '';
  let lastGrokParsedResult = null;

  function extractGrokPatterns(input) {
    if (!input) return [];
    const trimmed = input.trim();

    // Se o usuário colou sintaxe Logstash (match => [...])
    if (/match\s*=>/i.test(trimmed)) {
      const patterns = [];
      const pairRegex = /["'](?:message|raw_message|log|body)["']\s*,\s*["']([^"'\\]*(?:\\.[^"'\\]*)*)["']/gi;
      let m;
      while ((m = pairRegex.exec(trimmed)) !== null) {
        patterns.push(m[1].replace(/\\"/g, '"').replace(/\\'/g, "'"));
      }
      if (patterns.length > 0) return patterns;

      const arrayMatch = trimmed.match(/match\s*=>\s*(?:\{[^[]*\[|\[)([^\]]+)\]/is);
      if (arrayMatch) {
        const inner = arrayMatch[1];
        const strRegex = /["']([^"'\\]*(?:\\.[^"'\\]*)*)["']/g;
        const candidates = [];
        let sm;
        while ((sm = strRegex.exec(inner)) !== null) {
          if (!/^(?:message|raw_message|log|body)$/i.test(sm[1])) {
            candidates.push(sm[1].replace(/\\"/g, '"').replace(/\\'/g, "'"));
          }
        }
        if (candidates.length > 0) return candidates;
      }
    }

    const lines = trimmed.split(/\r?\n/);
    const patterns = [];
    for (const line of lines) {
      const l = line.trim();
      if (!l || l.startsWith('#')) continue;
      patterns.push(l);
    }
    return patterns;
  }

  function getSelectedGrokJsonMode() {
    const checked = document.querySelector('input[name="grok-json-mode"]:checked');
    return checked ? checked.value : 'pretty';
  }

  function renderGrokJson() {
    if (!outGrokJson) return;
    if (!lastGrokParsedResult || !lastGrokParsedResult.items || lastGrokParsedResult.items.length === 0) {
      outGrokJson.textContent = '{}';
      return;
    }

    const { items } = lastGrokParsedResult;
    const mode = getSelectedGrokJsonMode();

    const matchedItems = items.filter(it => it.matched);
    const matchedObjs = matchedItems.map(it => it.json);

    // Se nenhuma linha deu match, exibe objeto de erro explicativo
    let targetData;
    if (matchedObjs.length > 0) {
      targetData = items.length === 1 ? matchedObjs[0] : matchedObjs;
    } else {
      targetData = items.length === 1 ? items[0].json : items.map(it => it.json);
    }

    if (mode === 'ndjson') {
      if (matchedObjs.length > 0) {
        outGrokJson.textContent = matchedObjs.map(o => JSON.stringify(o)).join('\n');
      } else {
        outGrokJson.textContent = items.map(it => JSON.stringify(it.json)).join('\n');
      }
    } else if (mode === 'compact') {
      outGrokJson.textContent = JSON.stringify(targetData);
    } else {
      // pretty com quebras de linha e indentação de 2 espaços
      outGrokJson.textContent = JSON.stringify(targetData, null, 2);
    }
  }

  function parseGrokCustomPatterns(text) {
    const map = {};
    if (!text) return map;
    const lines = text.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const match = trimmed.match(/^([a-zA-Z0-9_]+)\s+(.+)$/);
      if (match) {
        map[match[1]] = match[2];
      }
    }
    return map;
  }

  function compileGrokPattern(patternStr, customPatterns = {}) {
    const patterns = Object.assign({}, GROK_BUILTIN_PATTERNS, customPatterns);
    const typeMap = {};
    let current = patternStr.trim();

    let maxDepth = 15;
    while (maxDepth-- > 0 && /%\{[a-zA-Z0-9_]+(?::[a-zA-Z0-9_]+(?::[a-zA-Z0-9_]+)?)?\}/.test(current)) {
      current = current.replace(/%\{([a-zA-Z0-9_]+)(?::([a-zA-Z0-9_]+)(?::([a-zA-Z0-9_]+))?)?\}/g, (m, syn, sem, type) => {
        const subPattern = patterns[syn] || patterns[syn.toUpperCase()];
        if (!subPattern) {
          throw new Error(`Padrão Grok não reconhecido: %{${syn}}`);
        }
        if (sem) {
          if (type) typeMap[sem] = type.toLowerCase();
          return `(?<${sem}>${subPattern})`;
        } else {
          return `(?:${subPattern})`;
        }
      });
    }

    lastCompiledGrokRegex = current;
    return { regex: new RegExp(current), rawRegex: current, typeMap };
  }

  function runGrokTest() {
    if (!grokPatternInput || !grokLogInput) return;

    const rawPatternText = (grokPatternInput.value || '').trim();
    const rawPatterns = extractGrokPatterns(rawPatternText);
    const rawInput = grokLogInput.value || '';
    const logLines = rawInput.split(/\r?\n/).filter((l, idx, arr) => l.trim().length > 0 || (arr.length === 1 && l.length > 0));

    if (grokPatternCountBadge) {
      grokPatternCountBadge.textContent = rawPatterns.length <= 1 ? '1 padrão' : `${rawPatterns.length} padrões (lista)`;
    }

    if (rawPatterns.length === 0 || logLines.length === 0 || (logLines.length === 1 && !logLines[0].trim())) {
      if (grokMatchIndicator) {
        grokMatchIndicator.className = 'grok-status-badge';
        grokMatchIndicator.textContent = 'Aguardando padrão e log';
      }
      if (grokHighlightBox) grokHighlightBox.innerHTML = '<span style="color:var(--muted); padding:0.5rem; display:block;">Insira um padrão e linha(s) de log para testar.</span>';
      if (grokFieldsBody) grokFieldsBody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:var(--muted); padding:1rem;">Nenhum match realizado ainda.</td></tr>';
      if (outGrokJson) outGrokJson.textContent = '{}';
      if (grokFieldsCount) grokFieldsCount.textContent = '0 campos';
      if (grokTableMeta) grokTableMeta.textContent = '0 linhas';
      lastGrokParsedResult = null;
      return;
    }

    const customPatterns = parseGrokCustomPatterns(grokCustomPatterns ? grokCustomPatterns.value : '');

    try {
      // Compila cada padrão fornecido na lista
      const compiledList = [];
      const compileErrors = [];
      rawPatterns.forEach((pStr, pIdx) => {
        try {
          const comp = compileGrokPattern(pStr, customPatterns);
          compiledList.push({
            index: pIdx + 1,
            patternStr: pStr,
            ...comp
          });
        } catch (e) {
          compileErrors.push(`Padrão #${pIdx + 1}: ${e.message}`);
        }
      });

      if (compiledList.length === 0) {
        throw new Error(compileErrors.join('\n') || 'Nenhum padrão válido fornecido.');
      }

      // Se houver mais de um regex compilado, guarda união para o botão de copiar regex
      lastCompiledGrokRegex = compiledList.length === 1
        ? compiledList[0].rawRegex
        : compiledList.map(p => `(?:${p.rawRegex})`).join('|');

      const parsedLines = [];
      let maxFieldsDetected = 0;

      logLines.forEach((lineText, lineIdx) => {
        const trimmedLine = lineText.trim();
        if (!trimmedLine) return;

        let lineMatched = false;

        // Testa cada padrão na ordem (estratégia de fallback do Logstash / Elastic)
        for (const p of compiledList) {
          const match = p.regex.exec(trimmedLine);
          if (match) {
            const groups = match.groups || {};
            const fieldKeys = Object.keys(groups);
            const jsonObj = {};
            const fieldsList = [];

            fieldKeys.forEach(key => {
              let rawVal = groups[key];
              if (rawVal === undefined || rawVal === null) return;
              const type = p.typeMap[key] || 'string';
              let typedVal = rawVal;

              if ((typeof rawVal === 'string' && rawVal.startsWith('"') && rawVal.endsWith('"')) || (typeof rawVal === 'string' && rawVal.startsWith("'") && rawVal.endsWith("'"))) {
                rawVal = rawVal.slice(1, -1);
                typedVal = rawVal;
              }

              if (type === 'int' || type === 'integer') {
                typedVal = parseInt(rawVal, 10);
              } else if (type === 'float') {
                typedVal = parseFloat(rawVal);
              } else if (type === 'boolean') {
                typedVal = String(rawVal).toLowerCase() === 'true';
              }

              jsonObj[key] = typedVal;
              fieldsList.push({ key, type, val: typedVal });
            });

            maxFieldsDetected = Math.max(maxFieldsDetected, Object.keys(jsonObj).length);

            parsedLines.push({
              lineIndex: lineIdx + 1,
              matched: true,
              matchedPatternIndex: p.index,
              matchedPatternStr: p.patternStr,
              raw: trimmedLine,
              groups,
              json: jsonObj,
              fields: fieldsList
            });

            lineMatched = true;
            break; // interrompe no primeiro padrão casado (first-match fallback)
          }
        }

        if (!lineMatched) {
          parsedLines.push({
            lineIndex: lineIdx + 1,
            matched: false,
            matchedPatternIndex: null,
            matchedPatternStr: null,
            raw: trimmedLine,
            groups: null,
            json: { _raw: trimmedLine, _error: "Linha não casou com nenhum dos padrões fornecidos" },
            fields: []
          });
        }
      });

      lastGrokParsedResult = {
        items: parsedLines,
        totalFields: maxFieldsDetected
      };

      const matchedLines = parsedLines.filter(p => p.matched);
      const matchedCount = matchedLines.length;
      const totalCount = parsedLines.length;
      const numPatterns = compiledList.length;

      // Status indicator
      if (grokMatchIndicator) {
        if (matchedCount === totalCount && totalCount > 0) {
          grokMatchIndicator.className = 'grok-status-badge match';
          grokMatchIndicator.style.background = '';
          grokMatchIndicator.style.borderColor = '';
          grokMatchIndicator.style.color = '';
          if (totalCount === 1) {
            grokMatchIndicator.textContent = numPatterns > 1
              ? `✅ Match com Padrão #${matchedLines[0].matchedPatternIndex}!`
              : '✅ Match com Sucesso!';
          } else {
            grokMatchIndicator.textContent = `✅ ${matchedCount}/${totalCount} linhas casadas (100%)${numPatterns > 1 ? ` via ${numPatterns} padrões` : ''}`;
          }
        } else if (matchedCount > 0) {
          grokMatchIndicator.className = 'grok-status-badge';
          grokMatchIndicator.style.background = 'hsl(40 95% 62% / 0.15)';
          grokMatchIndicator.style.borderColor = 'hsl(40 95% 62% / 0.35)';
          grokMatchIndicator.style.color = 'var(--amber)';
          grokMatchIndicator.textContent = `⚠️ ${matchedCount}/${totalCount} linhas casadas (${Math.round((matchedCount / totalCount) * 100)}%)`;
        } else {
          grokMatchIndicator.className = 'grok-status-badge nomatch';
          grokMatchIndicator.style.background = '';
          grokMatchIndicator.style.borderColor = '';
          grokMatchIndicator.style.color = '';
          grokMatchIndicator.textContent = '❌ Sem Match (Nenhum padrão correspondeu)';
        }
      }

      if (grokFieldsCount) grokFieldsCount.textContent = `${maxFieldsDetected} campos`;
      if (grokTableMeta) grokTableMeta.textContent = `${matchedCount}/${totalCount} linhas`;

      // 1. Renderiza Saída JSON (formatação escolhida)
      renderGrokJson();

      // 2. Renderiza Tabela Estruturada
      if (grokFieldsBody) {
        if (matchedCount === 0) {
          grokFieldsBody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:hsl(0 75% 65%); padding:1.2rem;">Nenhuma linha de log casou com os padrões Grok fornecidos.</td></tr>';
        } else {
          const rowsHtml = [];
          parsedLines.forEach(item => {
            if (totalCount > 1 || numPatterns > 1) {
              const patternBadge = item.matched && numPatterns > 1
                ? ` · Padrão #${item.matchedPatternIndex}${item.matchedPatternIndex > 1 ? ' (Fallback)' : ''}`
                : '';
              rowsHtml.push(`
                <tr style="background:hsl(225 30% 12% / 0.75);">
                  <td colspan="3" style="font-family:var(--mono); font-weight:700; color:${item.matched ? 'var(--green)' : 'hsl(0 75% 65%)'}; font-size:0.78rem; padding:0.45rem 0.75rem;">
                    Linha #${item.lineIndex}: ${item.matched ? '✅ Match (' + item.fields.length + ' campos)' + patternBadge : '❌ Sem Match'}
                  </td>
                </tr>
              `);
            }
            if (item.matched) {
              item.fields.forEach(f => {
                rowsHtml.push(`
                  <tr>
                    <td><strong style="color:var(--cyan); font-family:var(--mono);">${escapeHtml(f.key)}</strong></td>
                    <td><span class="grok-type-tag">${escapeHtml(f.type)}</span></td>
                    <td style="font-family:var(--mono); white-space:pre-wrap; word-break:break-word;">${escapeHtml(String(f.val))}</td>
                  </tr>
                `);
              });
            } else if (totalCount > 1 || numPatterns > 1) {
              rowsHtml.push(`
                <tr>
                  <td colspan="3" style="font-family:var(--mono); color:hsl(0 75% 65%); font-size:0.8rem; padding:0.4rem 0.75rem; white-space:pre-wrap;">${escapeHtml(item.raw)}</td>
                </tr>
              `);
            }
          });
          grokFieldsBody.innerHTML = rowsHtml.join('');
        }
      }

      // 3. Renderiza Destaque Visual com quebra de linha real por linha de log
      if (grokHighlightBox) {
        const highlightRows = parsedLines.map(item => {
          if (!item.matched) {
            return `
              <div class="grok-line-row nomatch">
                <span class="grok-line-num">${item.lineIndex}</span>
                <div class="grok-line-content">
                  <span class="grok-line-tag nomatch">SEM MATCH</span>${escapeHtml(item.raw)}
                </div>
              </div>
            `;
          }

          let highlighted = escapeHtml(item.raw);
          const groups = item.groups || {};
          const fieldKeys = Object.keys(groups).filter(k => groups[k] !== undefined && String(groups[k]).length > 0)
                                               .sort((a, b) => String(groups[b]).length - String(groups[a]).length);

          fieldKeys.forEach(k => {
            const val = groups[k];
            if (val && String(val).length > 0) {
              const escVal = escapeHtml(String(val));
              const span = `<span class="grok-match-span" title="Campo: ${escapeHtml(k)}">${escVal}</span>`;
              highlighted = highlighted.replace(escVal, span);
            }
          });

          const patternTag = numPatterns > 1
            ? `<span class="grok-line-tag match" title="Casou com o padrão #${item.matchedPatternIndex}">Padrão #${item.matchedPatternIndex}${item.matchedPatternIndex > 1 ? ' (Fallback)' : ''}</span>`
            : '';

          return `
            <div class="grok-line-row">
              <span class="grok-line-num">${item.lineIndex}</span>
              <div class="grok-line-content">${patternTag}${highlighted}</div>
            </div>
          `;
        });

        grokHighlightBox.innerHTML = highlightRows.join('');
      }

      // 4. Renderiza Snippets de Configuração
      if (outGrokLogstash) {
        if (rawPatterns.length === 1) {
          outGrokLogstash.textContent = `filter {
  grok {
    match => { "message" => "${rawPatterns[0].replace(/"/g, '\\"')}" }
  }
}`;
        } else {
          const listFormatted = rawPatterns.map(p => `        "${p.replace(/"/g, '\\"')}"`).join(',\n');
          outGrokLogstash.textContent = `filter {
  grok {
    match => {
      "message" => [
${listFormatted}
      ]
    }
  }
}`;
        }
      }

      if (outGrokElastic) {
        outGrokElastic.textContent = JSON.stringify({
          description: numPatterns > 1
            ? "Pipeline gerado no Canivete Suíço Offline (Lista de Padrões / Fallback)"
            : "Pipeline gerado no Canivete Suíço Offline",
          processors: [
            {
              grok: {
                field: "message",
                patterns: rawPatterns
              }
            }
          ]
        }, null, 2);
      }

      if (outGrokLoki) {
        if (compiledList.length === 1) {
          outGrokLoki.textContent = `pipeline_stages:
  - regex:
      expression: '${compiledList[0].rawRegex.replace(/'/g, "\\'")}'`;
        } else {
          const lokiUnion = compiledList.map(c => `(?:${c.rawRegex})`).join('|');
          outGrokLoki.textContent = `pipeline_stages:
  - regex:
      expression: '${lokiUnion.replace(/'/g, "\\'")}'`;
        }
      }

      if (outGrokVector) {
        if (compiledList.length === 1) {
          outGrokVector.textContent = `[transforms.parse_logs]
type = "remap"
inputs = ["raw_logs"]
source = '''
.parsed = parse_regex!(.message, r'${compiledList[0].rawRegex}')
'''`;
        } else {
          const vectorFallbacks = compiledList.map((c, idx) => {
            const isLast = idx === compiledList.length - 1;
            return isLast
              ? `parse_regex!(.message, r'${c.rawRegex}')`
              : `parse_regex(.message, r'${c.rawRegex}') ??`;
          }).join(' ');
          outGrokVector.textContent = `[transforms.parse_logs]
type = "remap"
inputs = ["raw_logs"]
source = '''
.parsed = ${vectorFallbacks}
'''`;
        }
      }

    } catch (err) {
      if (grokMatchIndicator) {
        grokMatchIndicator.className = 'grok-status-badge nomatch';
        grokMatchIndicator.style.background = '';
        grokMatchIndicator.style.borderColor = '';
        grokMatchIndicator.style.color = '';
        grokMatchIndicator.textContent = `⚠️ Erro de Compilação Grok`;
      }
      if (grokHighlightBox) {
        grokHighlightBox.innerHTML = `<div class="grok-line-row nomatch"><div class="grok-line-content" style="color:hsl(0 75% 65%);">Erro: ${escapeHtml(err.message)}</div></div>`;
      }
      if (outGrokJson) {
        outGrokJson.textContent = JSON.stringify({ error: err.message }, null, 2);
      }
      lastGrokParsedResult = null;
    }
  }

  // Alternância de abas de visualização da saída do Grok
  document.querySelectorAll('button[data-grok-tab]').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      document.querySelectorAll('button[data-grok-tab]').forEach(b => b.classList.remove('active'));
      tabBtn.classList.add('active');
      const targetId = tabBtn.getAttribute('data-grok-tab');
      document.querySelectorAll('.grok-view-pane').forEach(pane => {
        pane.style.display = pane.id === targetId ? 'block' : 'none';
      });
      const jsonControls = document.getElementById('grok-json-controls');
      if (jsonControls) {
        jsonControls.style.display = targetId === 'grok-view-json' ? 'flex' : 'none';
      }
    });
  });

  // Mudança de formato JSON (pretty / ndjson / compact)
  document.querySelectorAll('input[name="grok-json-mode"]').forEach(radio => {
    radio.addEventListener('change', () => {
      renderGrokJson();
    });
  });

  // Download do arquivo JSON gerado
  const grokDownloadJsonBtn = document.getElementById('grok-download-json-btn');
  if (grokDownloadJsonBtn) {
    grokDownloadJsonBtn.addEventListener('click', () => {
      if (!outGrokJson || !outGrokJson.textContent.trim()) {
        showToast('Nenhum JSON gerado para download.');
        return;
      }
      const mode = getSelectedGrokJsonMode();
      const filename = mode === 'ndjson' ? 'logs-grok.ndjson' : 'logs-grok.json';
      const blob = new Blob([outGrokJson.textContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Arquivo "${filename}" baixado com sucesso! ✓`);
    });
  }

  // Presets do Grok
  document.querySelectorAll('.grok-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.grok-preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const preset = btn.getAttribute('data-preset');

      if (preset === 'apache') {
        if (grokPatternInput) grokPatternInput.value = '%{COMBINEDAPACHELOG}';
        if (grokLogInput) grokLogInput.value = '192.168.1.105 - frank [10/Oct/2026:13:55:36 -0300] "GET /api/v1/users?page=2 HTTP/1.1" 200 2326 "https://guineves.com.br" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"';
      } else if (preset === 'syslog') {
        if (grokPatternInput) grokPatternInput.value = '%{SYSLOGTIMESTAMP:syslog_timestamp} %{IPORHOST:hostname} %{WORD:program}\\[%{POSINT:pid:int}\\]: %{GREEDYDATA:message}';
        if (grokLogInput) grokLogInput.value = 'Nov 12 14:15:02 srv-prod-01 sshd[28491]: Failed password for invalid user admin from 203.0.113.45 port 51234 ssh2';
      } else if (preset === 'list') {
        if (grokPatternInput) {
          grokPatternInput.value = `(?<timestamp>.[0-9]{5,}\\s[0-9]{7,})%{SPACE}(?<processid>.{6}) %{DATA:region}   %{DATA:code} %{GREEDYDATA:info}
(?<timestamp>.[0-9]{5,}\\s[0-9]{7,})%{SPACE}%{DATA:code} %{GREEDYDATA:info}`;
        }
        if (grokLogInput) {
          grokLogInput.value = `T12345 1234567 PROC01 REGION_SP   AUTH_OK Usuario autenticado com sucesso via console
T12345 1234567 AUTH_FAIL Falha de credencial direta sem id de processo`;
        }
      } else if (preset === 'app') {
        if (grokPatternInput) grokPatternInput.value = '%{TIMESTAMP_ISO8601:timestamp} \\[%{DATA:thread}\\] %{LOGLEVEL:level}\\s+%{NOTSPACE:logger} - %{GREEDYDATA:message}';
        if (grokLogInput) grokLogInput.value = '2026-11-12T14:22:45.123-03:00 [http-nio-8080-exec-4] INFO  c.g.service.PaymentService - Transação 98745 aprovada com sucesso para cliente 104';
      } else if (preset === 'postgres') {
        if (grokPatternInput) grokPatternInput.value = '%{YEAR:year}-%{MONTHNUM:month}-%{MONTHDAY:day} %{TIME:time} %{WORD:tz} \\[%{NUMBER:pid:int}\\] %{USER:user}@%{DATA:database} LOG:\\s+duration: %{NUMBER:duration_ms:float} ms\\s+statement: %{GREEDYDATA:query}';
        if (grokLogInput) grokLogInput.value = '2026-11-12 14:30:11.456 BRT [14920] app_user@production_db LOG:  duration: 45.120 ms  statement: SELECT * FROM users WHERE active = true ORDER BY created_at DESC LIMIT 50;';
      }

      runGrokTest();
      showToast(`Exemplo "${btn.textContent.trim()}" carregado! ✓`);
    });
  });

  if (grokRunBtn) grokRunBtn.addEventListener('click', runGrokTest);
  if (grokPatternInput) grokPatternInput.addEventListener('input', runGrokTest);
  if (grokLogInput) grokLogInput.addEventListener('input', runGrokTest);
  if (grokCustomPatterns) grokCustomPatterns.addEventListener('input', runGrokTest);

  // Inserção rápida a partir do Cheat Sheet de padrões
  document.querySelectorAll('.grok-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const insertText = pill.getAttribute('data-insert') || pill.textContent.trim();
      if (!grokPatternInput) return;
      const val = grokPatternInput.value.trim();
      grokPatternInput.value = val ? `${val} ${insertText}` : insertText;
      grokPatternInput.focus();
      runGrokTest();
      showToast(`Padrão ${pill.textContent.trim()} inserido! ✓`);
    });
  });

  if (grokCopyRegexBtn) {
    grokCopyRegexBtn.addEventListener('click', () => {
      if (!lastCompiledGrokRegex) {
        showToast('Nenhum regex compilado ainda.');
        return;
      }
      copyToClipboard(lastCompiledGrokRegex, grokCopyRegexBtn);
      showToast('Expressão Regular compilada copiada! ✓');
    });
  }

  // ==========================================
  // INICIALIZAÇÃO GERAL
  // ==========================================
  function initDefaults() {
    initFavorites();
    handleHash();
    updateSubnet();
    updateFirewall();
    updateChmodFromOctal();
    updateBandwidth();
    updateCronFromInput();
    updateFindXargs();
    updateSystemd();
    updateTarRsync();
    updateWebServerTool();
    runGrokTest();
    updateCodec();
    updateRegex();
    updateDiff();
    updateJwt();
    updateHashesFromText();
    generatePassword();
    generatePassphrase();
    generateRandomTokens();
    parseX509Pem();
    updateTimestampFromEpoch();
    updateBases('dec');
    updateDataUnits();

    // Iniciar Markdown com exemplo
    if (mdInput && !mdInput.value.trim() && mdSampleBtn) {
      mdSampleBtn.click();
    } else {
      updateMarkdown();
    }

    // Set today in calendar
    const today = new Date();
    if (tsDateInput) tsDateInput.value = today.toISOString().split('T')[0];
    if (tsTimeInput) tsTimeInput.value = today.toTimeString().split(' ')[0].substring(0, 5);
    updateTimestampFromCalendar();
  }

  // ==========================================
  // MODAL PIX ("PAGAR UM CAFÉ")
  // ==========================================
  const pixCoffeeBtn = document.getElementById('pix-coffee-btn');
  const pixModal = document.getElementById('pix-modal');
  const pixModalClose = document.getElementById('pix-modal-close');

  function openPixModal() {
    if (!pixModal) return;
    pixModal.hidden = false;
    pixModal.setAttribute('aria-hidden', 'false');
    if (pixModalClose) pixModalClose.focus();
  }

  function closePixModal() {
    if (!pixModal) return;
    pixModal.hidden = true;
    pixModal.setAttribute('aria-hidden', 'true');
  }

  if (pixCoffeeBtn) {
    pixCoffeeBtn.addEventListener('click', openPixModal);
  }
  if (pixModalClose) {
    pixModalClose.addEventListener('click', closePixModal);
  }
  if (pixModal) {
    pixModal.addEventListener('click', (e) => {
      if (e.target === pixModal) closePixModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !pixModal.hidden) {
        closePixModal();
      }
    });
    pixModal.querySelectorAll('.pix-copy-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-copy-target');
        const targetEl = targetId ? document.getElementById(targetId) : null;
        if (!targetEl) return;
        copyToClipboard(targetEl.textContent.trim(), btn);
        const customMsg = btn.getAttribute('data-copy-msg');
        if (customMsg) showToast(customMsg);
      });
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDefaults);
  } else {
    initDefaults();
  }

})();
