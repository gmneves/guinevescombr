/**
 * CHEAT SHEETS (tldr) — cheatsheets.js
 * Mural interativo de post-its com comandos estilo tldr
 * Autor: Guilherme Neves (guineves.com.br)
 */

(function () {
  'use strict';

  const CATEGORIES = [
    { id: 'linux', label: '🐧 Linux & Shell', short: 'Linux' },
    { id: 'net', label: '🌐 Redes & Segurança', short: 'Redes' },
    { id: 'devops', label: '🐳 Containers, Git & Infra', short: 'DevOps' },
    { id: 'data', label: '🗄️ Editores, Dados & SQL', short: 'Dados' }
  ];

  // ==========================================
  // BASE DE CHEAT SHEETS (ESTILO TLDR)
  // ==========================================
  const SHEETS = [
    {
      id: 'bash',
      cat: 'linux',
      title: 'Bash & Produtividade',
      desc: 'Atalhos, expansões de chaves/parâmetros, redirecionamento e truques rápidos no shell.',
      keywords: 'bash shell terminal atalhos ctrl+r redirecionamento tee loop history expansao brace parameter timestamp date mv cp backup diff',
      entries: [
        { d: 'Buscar comandos anteriores interativamente no histórico', c: 'Ctrl+R <termo>' },
        { d: 'Ir para o início / fim da linha atual', c: ['Ctrl+A', 'Ctrl+E'] },
        { d: 'Executar o último comando novamente com sudo', c: 'sudo !!' },
        { d: 'Fazer backup rápido ou renomear com timestamp usando brace expansion', c: ['cp <arquivo.conf>{,.bak}', 'mv <arquivo.log>{,.$(date +%Y%m%d_%H%M%S)}'] },
        { d: 'Mover arquivo adicionando Unix timestamp ou data ISO no nome', c: ['mv <arquivo.log>{,.$(date +%s)}', 'mv <app.log> <app>.$(date +%F).log'] },
        { d: 'Criar árvore de diretórios ou sequência de arquivos com brace expansion', c: ['mkdir -p <app>/{src,tests,docs}', 'touch <item>-{01..05}.txt'] },
        { d: 'Expansão de parâmetros: trocar extensão, extrair basename ou valor padrão', c: ['arq="nota.txt"; echo "${arq%.txt}.md"', 'caminho="/var/log/syslog"; echo "${caminho##*/}"', 'echo "${VAR:-padrao}"'] },
        { d: 'Comparar a saída de dois comandos direto no diff (process substitution)', c: 'diff -u <(<comando1>) <(<comando2>)' },
        { d: 'Redirecionar stdout e stderr para o mesmo arquivo', c: '<comando> > <arquivo.log> 2>&1' },
        { d: 'Exibir saída no terminal e gravar em arquivo simultaneamente', c: '<comando> | tee -a <arquivo.log>' },
        { d: 'Executar um comando em loop para uma lista de itens', c: 'for h in <srv1 srv2 srv3>; do ssh "$h" "<uptime>"; done' },
        { d: 'Substituir texto do comando anterior e rodar de novo', c: '^<antigo>^<novo>^' }
      ]
    },
    {
      id: 'processos',
      cat: 'linux',
      title: 'Processos & Sistema',
      desc: 'Inspecionar portas abertas, processos, uso de disco, memória e logs.',
      keywords: 'processos ss lsof ps df du lsblk memoria disco portas',
      entries: [
        { d: 'Listar todas as portas TCP/UDP escutando com PID e processo', c: 'sudo ss -tulpn' },
        { d: 'Ver qual processo está usando uma porta específica', c: 'sudo lsof -i :<porta>' },
        { d: 'Listar os 10 processos que mais consomem memória RAM', c: 'ps aux --sort=-%mem | head -n 11' },
        { d: 'Listar os 10 processos que mais consomem CPU', c: 'ps aux --sort=-%cpu | head -n 11' },
        { d: 'Ver tamanho resumido das pastas no diretório atual', c: 'du -sh * | sort -h' },
        { d: 'Verificar uso de espaço em disco e tipo de filesystem', c: 'df -hT' },
        { d: 'Listar discos, partições e pontos de montagem', c: 'lsblk -f' }
      ]
    },
    {
      id: 'texto',
      cat: 'linux',
      title: 'Texto & Filtros (grep/awk/jq)',
      desc: 'Extrair, filtrar, contar e transformar texto ou JSON direto no terminal.',
      keywords: 'grep awk sed jq sort uniq xargs texto filtros json',
      entries: [
        { d: 'Buscar padrão recursivamente exibindo arquivo e número da linha', c: 'grep -rn "<padrao>" <diretorio>' },
        { d: 'Contar ocorrências únicas ordenadas da mais frequente para a menos', c: 'sort <arquivo> | uniq -c | sort -nr' },
        { d: 'Imprimir colunas específicas delimitadas por espaço ou separador', c: 'awk -F"<:>" \'{print $1, $3}\' <arquivo>' },
        { d: 'Substituir texto in-place em um arquivo com sed', c: 'sed -i \'s/<antigo>/<novo>/g\' <arquivo>' },
        { d: 'Formatar JSON e extrair um campo específico com jq', c: 'cat <dados.json> | jq \'.<campo>.<subcampo>\'' },
        { d: 'Filtrar array JSON por condição com jq', c: 'jq \'.[] | select(.<status> == "error")\' <logs.json>' },
        { d: 'Executar comando em paralelo para arquivos encontrados pelo find', c: 'find <dir> -name "*.log" -print0 | xargs -0 -P4 -I{} gzip "{}"' }
      ]
    },
    {
      id: 'rede',
      cat: 'net',
      title: 'Diagnóstico de Rede',
      desc: 'Inspecionar interfaces, rotas, DNS, HTTP e pacotes com tcpdump.',
      keywords: 'rede ip dig curl mtr tcpdump ping dns rota pacotes',
      entries: [
        { d: 'Exibir endereços IP e interfaces de rede resumidos com cor', c: 'ip -c -br a' },
        { d: 'Exibir tabela de roteamento IPv4', c: 'ip -c r' },
        { d: 'Consultar registros DNS (A, MX, TXT) de forma limpa', c: 'dig +short <dominio.com> <A|MX|TXT>' },
        { d: 'Testar requisição HTTP exibindo headers e handshake TLS', c: 'curl -Ikv https://<dominio.com>' },
        { d: 'Medir latência e perda de pacotes salto a salto', c: 'mtr -rwzbc 20 <host_ou_ip>' },
        { d: 'Capturar tráfego de uma porta específica na interface com tcpdump', c: 'sudo tcpdump -i <eth0> -nn port <443>' },
        { d: 'Salvar captura de pacotes em arquivo .pcap para abrir no Wireshark', c: 'sudo tcpdump -i any -w <captura.pcap> host <ip>' }
      ]
    },
    {
      id: 'ssh',
      cat: 'net',
      title: 'SSH & Túneis',
      desc: 'Port forwarding local/remoto, SOCKS proxy, bastion host e chaves.',
      keywords: 'ssh tunel port forwarding proxyjump ssh-keygen authorized_keys scp',
      entries: [
        { d: 'Expor serviço remoto na sua máquina local (Local Forwarding)', c: 'ssh -N -L <8080>:127.0.0.1:<80> <usuario>@<servidor>' },
        { d: 'Expor serviço local no servidor remoto (Remote Forwarding)', c: 'ssh -N -R <9000>:127.0.0.1:<3000> <usuario>@<servidor>' },
        { d: 'Criar proxy SOCKS5 local através de um servidor SSH', c: 'ssh -N -D <1080> <usuario>@<servidor>' },
        { d: 'Conectar a um host interno passando por um bastion (Jump Host)', c: 'ssh -J <usuario>@<bastion> <usuario>@<host_interno>' },
        { d: 'Gerar par de chaves Ed25519 moderno', c: 'ssh-keygen -t ed25519 -C "<seu@email.com>"' },
        { d: 'Copiar chave pública para servidor remoto', c: 'ssh-copy-id -i ~/.ssh/<id_ed25519.pub> <usuario>@<servidor>' },
        { d: 'Transferir diretório comprimido preservando atributos via SSH', c: 'rsync -avzP <origem/> <usuario>@<servidor>:<destino/>' }
      ]
    },
    {
      id: 'openssl',
      cat: 'net',
      title: 'OpenSSL & Certificados TLS',
      desc: 'Inspecionar certificados remotos/locais, gerar chaves e converter formatos.',
      keywords: 'openssl tls ssl certificado pem pfx csr x509 validade san',
      entries: [
        { d: 'Inspecionar certificado TLS e cadeia de um servidor remoto', c: 'openssl s_client -connect <dominio.com>:443 -servername <dominio.com> -showcerts' },
        { d: 'Ver datas de validade, Subject, Issuer e SANs de um arquivo PEM', c: 'openssl x509 -in <cert.pem> -noout -text | grep -E "Subject:|Issuer:|Not Before|Not After|DNS:"' },
        { d: 'Gerar chave privada RSA 2048 + CSR para solicitar certificado', c: 'openssl req -new -newkey rsa:2048 -nodes -keyout <site.key> -out <site.csr>' },
        { d: 'Gerar certificado autoassinado rápido para desenvolvimento (365 dias)', c: 'openssl req -x509 -newkey rsa:2048 -nodes -keyout <dev.key> -out <dev.crt> -days 365' },
        { d: 'Converter certificado + chave PEM para pacote PKCS#12 (.pfx)', c: 'openssl pkcs12 -export -out <cert.pfx> -inkey <priv.key> -in <cert.pem> -certfile <chain.pem>' },
        { d: 'Verificar se chave privada e certificado correspondem (mesmo módulo)', c: 'openssl x509 -noout -modulus -in <cert.pem> | md5sum && openssl rsa -noout -modulus -in <priv.key> | md5sum' }
      ]
    },
    {
      id: 'http',
      cat: 'net',
      title: 'HTTP Status & Headers',
      desc: 'Referência rápida dos principais códigos HTTP e cabeçalhos de segurança/cache.',
      keywords: 'http status codes 200 301 401 403 404 429 502 503 504 headers cors cache',
      entries: [
        { d: '2xx Sucesso: OK / Criado / Sem conteúdo', c: '200 OK | 201 Created | 204 No Content' },
        { d: '3xx Redirecionamento: Permanente (preserva método) / Temporário', c: '301 Moved | 308 Permanent (preserva POST) | 302/307 Temp' },
        { d: '4xx Cliente: Inválido / Sem auth / Proibido / Não encontrado / Rate limit', c: '400 Bad Req | 401 Unauth | 403 Forbidden | 404 | 429 Too Many' },
        { d: '5xx Servidor: Erro interno / Bad Gateway / Indisponível / Timeout', c: '500 Internal | 502 Bad Gateway | 503 Unavailable | 504 Timeout' },
        { d: 'Headers essenciais de segurança HTTP', c: 'Strict-Transport-Security | X-Content-Type-Options: nosniff | Content-Security-Policy' },
        { d: 'Headers de cache e revalidação', c: 'Cache-Control: public, max-age=<3600> | ETag | Last-Modified' },
        { d: 'Headers mínimos de CORS no servidor', c: 'Access-Control-Allow-Origin: <origem> | Access-Control-Allow-Methods' }
      ]
    },
    {
      id: 'git',
      cat: 'devops',
      title: 'Git Essencial & Resgate',
      desc: 'Rebase interativo, reflog, cherry-pick, worktrees e desfazer erros sem pânico.',
      keywords: 'git rebase cherry-pick reflog reset stash bisect worktree commit',
      entries: [
        { d: 'Desfazer último commit mantendo alterações prontas na stage', c: 'git reset --soft HEAD~1' },
        { d: 'Alterar mensagem ou arquivos do último commit (antes de push)', c: 'git commit --amend' },
        { d: 'Aplicar um commit específico de outra branch na branch atual', c: 'git cherry-pick <hash_commit>' },
        { d: 'Reorganizar, unir (squash) ou editar os últimos N commits', c: 'git rebase -i HEAD~<N>' },
        { d: 'Recuperar commits perdidos após reset/rebase pelo histórico local', c: ['git reflog', 'git checkout -b <resgate> <HEAD@{n}>'] },
        { d: 'Guardar alterações locais com descrição e restaurar depois', c: ['git stash push -m "<descricao>"', 'git stash pop'] },
        { d: 'Abrir outra branch simultaneamente em diretório paralelo', c: 'git worktree add ../<pasta-hotfix> <branch>' }
      ]
    },
    {
      id: 'docker',
      cat: 'devops',
      title: 'Docker & Compose',
      desc: 'Gerenciar containers, logs, shell interativo, redes e limpeza de disco.',
      keywords: 'docker compose ps logs exec stats prune volume network',
      entries: [
        { d: 'Listar containers ativos em formato resumido', c: 'docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"' },
        { d: 'Acompanhar logs em tempo real exibindo últimas 100 linhas', c: 'docker logs -f --tail 100 <container>' },
        { d: 'Abrir shell interativo dentro de um container em execução', c: 'docker exec -it <container> <sh|bash>' },
        { d: 'Monitorar consumo de CPU, RAM e rede dos containers ao vivo', c: 'docker stats' },
        { d: 'Subir stack do Compose em background reconstruindo imagens', c: 'docker compose up -d --build' },
        { d: 'Remover containers parados, redes e imagens não utilizadas', c: 'docker system prune -af' },
        { d: 'Verificar quanto espaço imagens, containers e volumes ocupam', c: 'docker system df' }
      ]
    },
    {
      id: 'kubectl',
      cat: 'devops',
      title: 'Kubernetes (kubectl)',
      desc: 'Inspecionar pods, eventos, logs, port-forward e rollouts no cluster.',
      keywords: 'kubernetes k8s kubectl pods logs exec describe port-forward rollout',
      entries: [
        { d: 'Listar pods de todos os namespaces com nó e IP', c: 'kubectl get pods -A -o wide' },
        { d: 'Inspecionar eventos e motivo de falha/CrashLoop de um pod', c: 'kubectl describe pod <pod> -n <namespace>' },
        { d: 'Ver logs em tempo real (ou do container anterior que caiu)', c: 'kubectl logs -f <pod> -n <namespace> [--previous]' },
        { d: 'Abrir shell dentro de um pod/container', c: 'kubectl exec -it <pod> -n <namespace> -- <sh|bash>' },
        { d: 'Encaminhar porta local para um pod ou service do cluster', c: 'kubectl port-forward svc/<servico> <8080>:<80> -n <namespace>' },
        { d: 'Reiniciar um Deployment sem downtime (rolling restart)', c: 'kubectl rollout restart deployment/<nome> -n <namespace>' },
        { d: 'Listar eventos ordenados por data para investigar incidentes', c: 'kubectl get events -n <namespace> --sort-by=.lastTimestamp' }
      ]
    },
    {
      id: 'systemd',
      cat: 'devops',
      title: 'systemd & Journal',
      desc: 'Controlar daemons, recarregar units e filtrar logs no journald.',
      keywords: 'systemd systemctl journalctl service timer logs daemon boot',
      entries: [
        { d: 'Habilitar serviço na inicialização e iniciar imediatamente', c: 'sudo systemctl enable --now <servico>' },
        { d: 'Recarregar configurações do systemd após editar arquivo .service', c: 'sudo systemctl daemon-reload' },
        { d: 'Listar todas as units com status de falha no sistema', c: 'systemctl --failed' },
        { d: 'Acompanhar logs de um serviço em tempo real', c: 'sudo journalctl -u <servico> -f' },
        { d: 'Filtrar logs de um serviço desde hoje ou última 1 hora', c: 'sudo journalctl -u <servico> --since "<1 hour ago>" --no-pager' },
        { d: 'Ver logs de erro do boot anterior', c: 'sudo journalctl -b -1 -p err' },
        { d: 'Limpar logs antigos do journald mantendo apenas últimos 200 MB', c: 'sudo journalctl --vacuum-size=200M' }
      ]
    },
    {
      id: 'vim',
      cat: 'data',
      title: 'Vim / Neovim',
      desc: 'Navegação rápida, edição por objetos de texto, busca/substituição e splits.',
      keywords: 'vim nvim neovim editor atalhos buscar substituir split macro',
      entries: [
        { d: 'Salvar arquivo e sair / sair descartando alterações', c: [':wq', ':q!'] },
        { d: 'Ir para o início / fim do arquivo ou linha N', c: ['gg', 'G', ':<N>'] },
        { d: 'Alterar tudo dentro de aspas, parênteses ou chaves (change inside)', c: ['ci"', 'ci(', 'ci{'] },
        { d: 'Substituir todas as ocorrências no arquivo com confirmação', c: ':%s/<antigo>/<novo>/gc' },
        { d: 'Abrir split vertical / horizontal e alternar entre janelas', c: [':vsp <arq>', ':sp <arq>', 'Ctrl+W w'] },
        { d: 'Comentar ou indentar múltiplas linhas em bloco visual', c: ['Ctrl+V <selecionar> I# <Esc>', '>>  /  <<'] },
        { d: 'Gravar macro no registrador a e reproduzir', c: 'qa <comandos> q  ->  @a (ou @@ para repetir)' }
      ]
    },
    {
      id: 'psql',
      cat: 'data',
      title: 'PostgreSQL (psql & SQL)',
      desc: 'Meta-comandos do psql, plano de execução e queries de diagnóstico.',
      keywords: 'postgres postgresql psql sql explain analyze locks conexoes',
      entries: [
        { d: 'Conectar ao banco via psql', c: 'psql -h <host> -U <usuario> -d <banco>' },
        { d: 'Listar tabelas, descrever colunas e ativar saída expandida', c: ['\\dt', '\\d+ <tabela>', '\\x'] },
        { d: 'Analisar plano de execução real e tempo de uma query', c: 'EXPLAIN (ANALYZE, BUFFERS) <SELECT ...>;' },
        { d: 'Listar queries em execução e tempo decorrido', c: 'SELECT pid, now() - query_start AS dur, state, query FROM pg_stat_activity WHERE state <> \'idle\' ORDER BY dur DESC;' },
        { d: 'Verificar locks bloqueando outras sessões', c: 'SELECT pid, pg_blocking_pids(pid) AS blocked_by, query FROM pg_stat_activity WHERE cardinality(pg_blocking_pids(pid)) > 0;' },
        { d: 'Encerrar uma sessão travada com segurança (ou forçar)', c: 'SELECT pg_cancel_backend(<pid>);  -- ou pg_terminate_backend(<pid>)' },
        { d: 'Ver tamanho das maiores tabelas do banco', c: 'SELECT relname, pg_size_pretty(pg_total_relation_size(relid)) FROM pg_catalog.pg_statio_user_tables ORDER BY pg_total_relation_size(relid) DESC LIMIT 10;' }
      ]
    },
    {
      id: 'regex',
      cat: 'data',
      title: 'Regex Quick Reference',
      desc: 'Âncoras, quantificadores, grupos nomeados e lookarounds mais usados.',
      keywords: 'regex expressao regular lookahead lookbehind grupos quantificador',
      entries: [
        { d: 'Âncoras: início/fim de linha e limite de palavra', c: '^início   fim$   \\bpalavra\\b' },
        { d: 'Classes comuns: dígito, palavra (alfa+_), espaço e negação', c: '\\d  \\w  \\s   |   \\D  \\W  \\S' },
        { d: 'Quantificadores: 0+, 1+, 0 ou 1, exato ou faixa (e modo lazy ?)', c: '*   +   ?   {n}   {n,m}   |   .*? (lazy)' },
        { d: 'Grupo de captura, não-captura e grupo nomeado', c: '(abc)   (?:abc)   (?<nome>abc)' },
        { d: 'Lookahead positivo e negativo (verifica à frente sem consumir)', c: '(?=padrao)   (?!padrao)' },
        { d: 'Lookbehind positivo e negativo (verifica atrás sem consumir)', c: '(?<=padrao)   (?<!padrao)' },
        { d: 'Alternância e conjunto de caracteres negado', c: '(foo|bar)   [^,\\n]+' }
      ]
    }
  ];

  // ==========================================
  // HELPERS
  // ==========================================
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function highlightCmd(cmd) {
    const escaped = escapeHtml(cmd);
    return escaped.replace(/(&lt;[^&]+?&gt;)/g, '<span class="tldr-placeholder">$1</span>');
  }

  function asCmdList(c) {
    return Array.isArray(c) ? c : [c];
  }

  const toast = document.getElementById('toast-notice');
  let toastTimer = null;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  function copyText(text, btn, customMsg) {
    if (!text) return;
    const done = () => {
      if (btn) {
        const orig = btn.textContent;
        btn.classList.add('copied');
        btn.textContent = '✓ Copiado';
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.textContent = orig;
        }, 1600);
      }
      showToast(customMsg || 'Comando copiado! ✓');
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else {
      fallbackCopy(text, done);
    }
  }

  function fallbackCopy(text, cb) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      if (cb) cb();
    } catch (e) {}
    document.body.removeChild(ta);
  }

  // ==========================================
  // THEME SYNC
  // ==========================================
  const themeBtn = document.getElementById('theme-btn');
  if (themeBtn) {
    const setTheme = (theme) => {
      const host = window.location.hostname;
      const domain = host.includes('guineves.com.br') ? '; domain=.guineves.com.br' : '';
      document.cookie = `site_theme=${theme}; path=/${domain}; max-age=31536000; SameSite=Lax`;
      try { localStorage.setItem('theme', theme); } catch (e) {}
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

  // ==========================================
  // PINNED (FAVORITES) IN LOCALSTORAGE
  // ==========================================
  const PIN_STORAGE_KEY = 'cheatsheets_pinned';
  function getPinned() {
    try {
      const raw = localStorage.getItem(PIN_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return ['bash', 'git', 'rede'];
  }

  function savePinned(list) {
    try {
      localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  function isPinned(id) {
    return getPinned().includes(id);
  }

  function togglePin(id) {
    let list = getPinned();
    if (list.includes(id)) {
      list = list.filter(x => x !== id);
      showToast('Post-it desafixado');
    } else {
      list.unshift(id);
      showToast('Post-it fixado no topo! 📌');
    }
    savePinned(list);
    renderAll();
    if (currentSpotlightId === id) {
      updateSpotlightPinBtn(id);
    }
  }

  // ==========================================
  // STATE & RENDERING
  // ==========================================
  let currentCat = 'all';
  let currentQuery = '';
  let currentSpotlightId = null;

  const gridEl = document.getElementById('postits-grid');
  const emptyEl = document.getElementById('board-empty');
  const statsEl = document.getElementById('board-stats');
  const dynamicNavEl = document.getElementById('dynamic-nav-groups');
  const pinGroupEl = document.getElementById('pin-group');
  const pinListEl = document.getElementById('pin-list');
  const pinCountEl = document.getElementById('pin-count');
  const searchInput = document.getElementById('cs-search');
  const sidebar = document.getElementById('cs-sidebar');

  function getFilteredSheets() {
    const q = currentQuery.trim().toLowerCase();
    return SHEETS.filter(s => {
      const catOk = currentCat === 'all' || s.cat === currentCat;
      if (!catOk) return false;
      if (!q) return true;
      const hay = [
        s.title,
        s.desc,
        s.keywords,
        ...s.entries.map(e => `${e.d} ${asCmdList(e.c).join(' ')}`)
      ].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }

  function renderSidebar() {
    const pinned = getPinned();
    if (pinCountEl) pinCountEl.textContent = pinned.length;

    if (pinListEl) {
      pinListEl.innerHTML = '';
      if (pinned.length === 0) {
        pinListEl.innerHTML = '<span class="pin-empty-hint">Clique no 📌 de um post-it para fixá-lo aqui.</span>';
      } else {
        pinned.forEach(id => {
          const sheet = SHEETS.find(s => s.id === id);
          if (!sheet) return;
          pinListEl.appendChild(createNavItem(sheet, true));
        });
      }
    }
    if (pinGroupEl) {
      pinGroupEl.classList.toggle('hidden', currentQuery.trim().length > 0 && currentCat !== 'all');
    }

    if (!dynamicNavEl) return;
    dynamicNavEl.innerHTML = '';
    const filteredIds = new Set(getFilteredSheets().map(s => s.id));

    CATEGORIES.forEach(cat => {
      if (currentCat !== 'all' && currentCat !== cat.id) return;
      const items = SHEETS.filter(s => s.cat === cat.id && filteredIds.has(s.id));
      if (items.length === 0) return;

      const group = document.createElement('div');
      group.className = 'category-group';
      group.setAttribute('data-cat', cat.id);
      group.innerHTML = `
        <div class="category-title">
          <span>${cat.label}</span>
          <span class="category-count">${items.length}</span>
        </div>
      `;
      items.forEach(sheet => group.appendChild(createNavItem(sheet, false)));
      dynamicNavEl.appendChild(group);
    });
  }

  function createNavItem(sheet, isPinList) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `cs-nav-item ${currentSpotlightId === sheet.id ? 'active' : ''}`;
    btn.setAttribute('data-id', sheet.id);

    const pinned = isPinned(sheet.id);
    btn.innerHTML = `
      <span class="cs-nav-name">${escapeHtml(sheet.title)}</span>
      <span class="cs-pin-mini ${pinned ? 'pinned' : ''}" title="${pinned ? 'Desafixar' : 'Fixar'}">${pinned ? '📌' : '·'}</span>
    `;

    btn.addEventListener('click', (e) => {
      if (e.target.closest('.cs-pin-mini')) {
        e.stopPropagation();
        togglePin(sheet.id);
        return;
      }
      openSpotlight(sheet.id);
      if (window.innerWidth <= 960 && sidebar) {
        sidebar.classList.remove('open');
      }
    });

    return btn;
  }

  function renderGrid() {
    if (!gridEl) return;
    const filtered = getFilteredSheets();
    const pinnedSet = new Set(getPinned());

    // Pinned items appear first in the mural when not searching
    const sorted = [...filtered].sort((a, b) => {
      const ap = pinnedSet.has(a.id) ? 0 : 1;
      const bp = pinnedSet.has(b.id) ? 0 : 1;
      return ap - bp;
    });

    gridEl.innerHTML = '';
    if (statsEl) {
      statsEl.textContent = `${sorted.length} ${sorted.length === 1 ? 'post-it' : 'post-its'}`;
    }
    if (emptyEl) {
      emptyEl.hidden = sorted.length > 0;
    }

    sorted.forEach(sheet => {
      const catInfo = CATEGORIES.find(c => c.id === sheet.cat);
      const pinned = pinnedSet.has(sheet.id);
      const previewItems = sheet.entries.slice(0, 3);
      const remaining = Math.max(0, sheet.entries.length - 3);

      const card = document.createElement('article');
      card.className = `postit-card ${currentSpotlightId === sheet.id ? 'is-highlighted' : ''}`;
      card.setAttribute('data-cat', sheet.cat);
      card.setAttribute('data-id', sheet.id);
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `Ampliar cheat sheet ${sheet.title}`);

      card.innerHTML = `
        <div class="postit-top">
          <span class="postit-cat-label">${catInfo ? catInfo.label : sheet.cat}</span>
          <button type="button" class="postit-pin-btn ${pinned ? 'pinned' : ''}" title="${pinned ? 'Desafixar post-it' : 'Fixar post-it no topo'}" aria-label="Fixar post-it">📌</button>
        </div>
        <h2 class="postit-title">${escapeHtml(sheet.title)}</h2>
        <p class="postit-desc">${escapeHtml(sheet.desc)}</p>
        <div class="postit-preview">
          ${previewItems.map(item => `
            <div class="postit-preview-item">
              <div class="postit-preview-desc">${escapeHtml(item.d)}</div>
              ${asCmdList(item.c).map(cmd => `<code class="postit-preview-cmd">${highlightCmd(cmd)}</code>`).join('')}
            </div>
          `).join('')}
        </div>
        <div class="postit-footer">
          <span>${sheet.entries.length} comandos${remaining > 0 ? ` (+${remaining})` : ''}</span>
          <span class="postit-open-hint">Ampliar ↗</span>
        </div>
      `;

      card.addEventListener('click', (e) => {
        if (e.target.closest('.postit-pin-btn')) {
          e.stopPropagation();
          togglePin(sheet.id);
          return;
        }
        openSpotlight(sheet.id);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openSpotlight(sheet.id);
        }
      });

      gridEl.appendChild(card);
    });
  }

  function renderAll() {
    renderSidebar();
    renderGrid();
  }

  // ==========================================
  // SPOTLIGHT MODAL (POST-IT AMPLIADO)
  // ==========================================
  const spotlightModal = document.getElementById('spotlight-modal');
  const spotlightCard = document.getElementById('spotlight-card');
  const spotlightCat = document.getElementById('spotlight-cat');
  const spotlightCount = document.getElementById('spotlight-count');
  const spotlightTitle = document.getElementById('spotlight-title');
  const spotlightDesc = document.getElementById('spotlight-desc');
  const spotlightEntries = document.getElementById('spotlight-entries');
  const spotlightPinBtn = document.getElementById('spotlight-pin-btn');
  const spotlightLinkBtn = document.getElementById('spotlight-link-btn');
  const spotlightPrevBtn = document.getElementById('spotlight-prev-btn');
  const spotlightNextBtn = document.getElementById('spotlight-next-btn');
  const spotlightCloseBtn = document.getElementById('spotlight-close-btn');

  function updateSpotlightPinBtn(id) {
    if (!spotlightPinBtn) return;
    const pinned = isPinned(id);
    spotlightPinBtn.classList.toggle('pinned', pinned);
    spotlightPinBtn.textContent = pinned ? '📌 Fixado' : '📌 Fixar';
  }

  function openSpotlight(id, pushHash = true) {
    const sheet = SHEETS.find(s => s.id === id);
    if (!sheet || !spotlightModal || !spotlightCard) return;

    currentSpotlightId = id;
    const catInfo = CATEGORIES.find(c => c.id === sheet.cat);

    spotlightCard.setAttribute('data-cat', sheet.cat);
    if (spotlightCat) spotlightCat.textContent = catInfo ? catInfo.label : sheet.cat;
    if (spotlightCount) spotlightCount.textContent = `${sheet.entries.length} comandos`;
    if (spotlightTitle) spotlightTitle.textContent = sheet.title;
    if (spotlightDesc) spotlightDesc.textContent = sheet.desc;
    updateSpotlightPinBtn(id);

    if (spotlightEntries) {
      spotlightEntries.innerHTML = sheet.entries.map((entry, idx) => {
        const cmds = asCmdList(entry.c);
        return `
          <div class="tldr-entry">
            <div class="tldr-desc"><span class="tldr-bullet">›</span><span>${escapeHtml(entry.d)}</span></div>
            ${cmds.map((cmd, subIdx) => `
              <div class="tldr-cmd-row">
                <code class="tldr-cmd">${highlightCmd(cmd)}</code>
                <button type="button" class="tldr-copy-btn" data-cmd-idx="${idx}" data-sub-idx="${subIdx}">Copiar</button>
              </div>
            `).join('')}
          </div>
        `;
      }).join('');

      spotlightEntries.querySelectorAll('.tldr-copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = Number(btn.getAttribute('data-cmd-idx'));
          const subIdx = Number(btn.getAttribute('data-sub-idx'));
          const entry = sheet.entries[idx];
          if (!entry) return;
          const cmd = asCmdList(entry.c)[subIdx];
          if (cmd) copyText(cmd, btn);
        });
      });
    }

    spotlightModal.hidden = false;
    spotlightModal.setAttribute('aria-hidden', 'false');
    if (pushHash) {
      history.replaceState(null, '', `#${id}`);
    }
    renderAll();
    if (spotlightCloseBtn) spotlightCloseBtn.focus();
  }

  function closeSpotlight() {
    if (!spotlightModal) return;
    spotlightModal.hidden = true;
    spotlightModal.setAttribute('aria-hidden', 'true');
    currentSpotlightId = null;
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname);
    }
    renderAll();
  }

  function navigateSpotlight(delta) {
    const list = getFilteredSheets();
    if (list.length === 0) return;
    const idx = list.findIndex(s => s.id === currentSpotlightId);
    const nextIdx = idx === -1 ? 0 : (idx + delta + list.length) % list.length;
    openSpotlight(list[nextIdx].id);
  }

  if (spotlightCloseBtn) spotlightCloseBtn.addEventListener('click', closeSpotlight);
  if (spotlightPinBtn) {
    spotlightPinBtn.addEventListener('click', () => {
      if (currentSpotlightId) togglePin(currentSpotlightId);
    });
  }
  if (spotlightLinkBtn) {
    spotlightLinkBtn.addEventListener('click', () => {
      if (!currentSpotlightId) return;
      const url = `${window.location.origin}${window.location.pathname}#${currentSpotlightId}`;
      copyText(url, spotlightLinkBtn, 'Link direto copiado! ✓');
    });
  }
  if (spotlightPrevBtn) spotlightPrevBtn.addEventListener('click', () => navigateSpotlight(-1));
  if (spotlightNextBtn) spotlightNextBtn.addEventListener('click', () => navigateSpotlight(1));
  if (spotlightModal) {
    spotlightModal.addEventListener('click', (e) => {
      if (e.target === spotlightModal) closeSpotlight();
    });
  }

  // ==========================================
  // SEARCH, CATEGORY PILLS & SIDEBAR TOGGLE
  // ==========================================
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      currentQuery = searchInput.value;
      renderAll();
    });
  }

  document.querySelectorAll('.cat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCat = pill.getAttribute('data-cat') || 'all';
      renderAll();
    });
  });

  const appContainer = document.querySelector('.app-container');
  const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
  const sidebarCollapseIconBtn = document.getElementById('sidebar-collapse-icon-btn');
  const mobileToggle = document.getElementById('mobile-nav-toggle');

  function toggleSidebar(forceState) {
    if (!appContainer) return;
    const isCollapsed = appContainer.classList.contains('sidebar-collapsed');
    const nextState = forceState !== undefined ? forceState : !isCollapsed;
    appContainer.classList.toggle('sidebar-collapsed', nextState);
    if (sidebarToggleBtn) {
      const icon = sidebarToggleBtn.querySelector('.sidebar-toggle-icon');
      if (icon) icon.textContent = nextState ? '▶' : '◀';
    }
    try { localStorage.setItem('cs_sidebar_collapsed', nextState ? 'true' : 'false'); } catch (e) {}
  }

  if (sidebarToggleBtn) sidebarToggleBtn.addEventListener('click', () => toggleSidebar());
  if (sidebarCollapseIconBtn) sidebarCollapseIconBtn.addEventListener('click', () => toggleSidebar(true));
  try {
    if (window.innerWidth > 960 && localStorage.getItem('cs_sidebar_collapsed') === 'true') {
      toggleSidebar(true);
    }
  } catch (e) {}

  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 960 && sidebar.classList.contains('open')) {
        if (!sidebar.contains(e.target) && !mobileToggle.contains(e.target)) {
          sidebar.classList.remove('open');
        }
      }
    });
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      if (window.innerWidth > 960) {
        e.preventDefault();
        toggleSidebar();
      }
      return;
    }

    if (e.key === '/' && document.activeElement !== searchInput && spotlightModal && spotlightModal.hidden) {
      const tag = document.activeElement ? document.activeElement.tagName : '';
      if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
        if (searchInput) searchInput.focus();
      }
      return;
    }

    if (e.key === 'Escape') {
      if (pixModal && !pixModal.hidden) {
        closePixModal();
        return;
      }
      if (spotlightModal && !spotlightModal.hidden) {
        closeSpotlight();
        return;
      }
      if (searchInput && document.activeElement === searchInput) {
        searchInput.value = '';
        currentQuery = '';
        searchInput.blur();
        renderAll();
      }
      if (sidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
      }
      return;
    }

    if (spotlightModal && !spotlightModal.hidden) {
      if (e.key === 'ArrowLeft') navigateSpotlight(-1);
      if (e.key === 'ArrowRight') navigateSpotlight(1);
    }
  });

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

  if (pixCoffeeBtn) pixCoffeeBtn.addEventListener('click', openPixModal);
  if (pixModalClose) pixModalClose.addEventListener('click', closePixModal);
  if (pixModal) {
    pixModal.addEventListener('click', (e) => {
      if (e.target === pixModal) closePixModal();
    });
    pixModal.querySelectorAll('.pix-copy-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-copy-target');
        const targetEl = targetId ? document.getElementById(targetId) : null;
        if (!targetEl) return;
        const customMsg = btn.getAttribute('data-copy-msg');
        copyText(targetEl.textContent.trim(), btn, customMsg);
      });
    });
  }

  // ==========================================
  // INIT
  // ==========================================
  renderAll();
  const initialHash = window.location.hash.replace('#', '');
  if (initialHash && SHEETS.some(s => s.id === initialHash)) {
    openSpotlight(initialHash, false);
  }
})();
