// Emoji Picker for idcrypt (GitHub Pages version)
(function () {

  // PENTING: Path untuk GitHub Pages
  const RAW = '../data/emoji.json';

  const grid = document.getElementById('grid');
  const q = document.getElementById('q');
  const cat = document.getElementById('cat');
  const toast = document.getElementById('toast');
  const loading = document.getElementById('loading');
  const clearBtn = document.getElementById('clear');

  let emojis = [];

  // Convert unified hex → emoji char
  function unifiedToChar(unified) {
    try {
      return unified
        .split('-')
        .map(u => parseInt(u, 16))
        .map(cp => String.fromCodePoint(cp))
        .join('');
    } catch (e) {
      return '';
    }
  }

  // Build simplified list
  function buildList(raw) {
    return raw.map(e => {
      const char = e.char || (e.codes ? unifiedToChar(e.codes) : '');
      return {
        char,
        name: e.name || '',
        category: (e.category || 'other').toLowerCase()
      };
    }).filter(x => x.char);
  }

  // Get category options
  function uniqueCategories(list) {
    return [...new Set(list.map(i => i.category))].sort();
  }

  // Show toast
  function showToast(text) {
    toast.textContent = text || 'Copied ✓';
    toast.style.display = 'block';
    clearTimeout(window.__to);
    window.__to = setTimeout(() => toast.style.display = 'none', 1200);
  }

  // Copy fallback
  function fallback(t) {
    try {
      const ta = document.createElement('textarea');
      ta.value = t;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      showToast('Copied ✓');
    } catch (e) {
      console.error(e);
      showToast('Copy failed');
    }
  }

  // Copy handler
  function copyText(t) {
    if (!t) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(t)
        .then(() => showToast('Copied ✓'))
        .catch(() => fallback(t));
    } else {
      fallback(t);
    }
  }

  // Render emoji grid
  function render(list) {
    grid.innerHTML = '';

    if (!list.length) {
      grid.innerHTML = '<div class="loading">No emojis found</div>';
      return;
    }

    const frag = document.createDocumentFragment();

    list.forEach(i => {
      const card = document.createElement('div');
      card.className = 'card';
      card.setAttribute('role', 'listitem');

      const ch = document.createElement('div');
      ch.className = 'char';
      ch.textContent = i.char;

      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.type = 'button';
      btn.textContent = 'Copy';
      btn.addEventListener('click', () => {
        copyText(i.char);
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy', 700);
      });

      const sm = document.createElement('div');
      sm.className = 'small';
      sm.textContent = i.name;

      card.appendChild(ch);
      card.appendChild(btn);
      card.appendChild(sm);
      frag.appendChild(card);
    });

    grid.appendChild(frag);
  }

  // Filter search + category
  function applyFilters() {
    const qv = (q.value || '').toLowerCase().trim();
    const cv = (cat.value || 'all');

    const out = emojis.filter(i => {
      if (cv !== 'all' && i.category !== cv) return false;
      if (!qv) return true;
      return (
        i.name.toLowerCase().includes(qv) ||
        (i.char || '').includes(qv)
      );
    });

    render(out);
  }

  // Init main
  async function init() {
    loading.style.display = 'block';

    try {
      const res = await fetch(RAW);
      if (!res.ok) throw new Error('Failed to fetch emoji.json');

      const raw = await res.json();
      emojis = buildList(raw);

      // Build categories
      const cats = uniqueCategories(emojis);
      cat.innerHTML =
        '<option value="all">All</option>' +
        cats.map(c => `<option value="${c}">${c}</option>`).join('');

      applyFilters();

    } catch (e) {
      console.error(e);
      grid.innerHTML = `
        <div class="loading" style="color:#d33">
          Failed to load emoji data.<br>
          Ensure <strong>data/emoji.json</strong> exists.
        </div>`;
    }

    loading.style.display = 'none';
  }

  // Events
  q.addEventListener('input', applyFilters);
  cat.addEventListener('change', applyFilters);
  clearBtn.addEventListener('click', () => {
    q.value = '';
    cat.value = 'all';
    applyFilters();
  });

  init();

})();
