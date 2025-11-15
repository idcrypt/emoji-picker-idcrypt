const q = document.getElementById('q');
const cat = document.getElementById('cat');
const grid = document.getElementById('grid');
const loading = document.getElementById('loading');

let EMOJIS = [];
let CATEGORIES = [];

async function init() {
  try {
    const res = await fetch('./data/emoji.json');
    if (!res.ok) throw new Error('Failed to fetch emoji.json');
    EMOJIS = await res.json();
  } catch (err) {
    loading.textContent = 'Failed to load emoji data.';
    console.error(err);
    return;
  }

  // Get unique categories
  CATEGORIES = [...new Set(EMOJIS.map(e => e.category))];

  // Populate category dropdown
  cat.innerHTML = `<option value="">All</option>` +
    CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('');

  // Render all emojis immediately
  loading.style.display = 'none';
  renderGrid(EMOJIS);

  // Bind search + category events
  q.addEventListener('input', filterGrid);
  cat.addEventListener('change', filterGrid);
  document.getElementById('clear').addEventListener('click', resetFilters);
}

function renderGrid(list) {
  grid.innerHTML = list.map(e => `
    <button class="item" data-char="${e.char}" title="${e.name}">
      <span class="emoji">${e.char}</span>
      <span class="copy">Copy</span>
    </button>
  `).join('');

  // Copy handlers
  document.querySelectorAll('.item').forEach(btn => {
    btn.onclick = () => {
      const char = btn.dataset.char;
      navigator.clipboard.writeText(char);
      showToast();
    };
  });
}

function filterGrid() {
  const text = q.value.toLowerCase();
  const category = cat.value;

  const filtered = EMOJIS.filter(e => {
    const matchText =
      e.name.toLowerCase().includes(text) ||
      (e.keywords && e.keywords.join(' ').toLowerCase().includes(text));

    const matchCat = !category || e.category === category;
    return matchText && matchCat;
  });

  renderGrid(filtered);
}

function resetFilters() {
  q.value = '';
  cat.value = '';
  renderGrid(EMOJIS);
}

function showToast() {
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1200);
}

init();
