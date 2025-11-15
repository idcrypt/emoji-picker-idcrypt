// app.js for emoji-picker-idcrypt
// Fetch emoji data, render grid, add copy-to-clipboard + search

const grid = document.getElementById('emoji-grid');
const searchInput = document.getElementById('search');
let allEmojis = [];

async function loadEmojis() {
  try {
    const res = await fetch('../data/emoji.json');
    allEmojis = await res.json();
    renderEmojis(allEmojis);
  } catch (err) {
    console.error('Failed to load emoji.json', err);
  }
}

function renderEmojis(list) {
  grid.innerHTML = '';
  list.forEach(e => {
    const card = document.createElement('div');
    card.className = 'emoji-card';
    card.innerHTML = `${e.char}`;

    card.addEventListener('click', () => copyEmoji(e.char, card));
    grid.appendChild(card);
  });
}

function copyEmoji(char, element) {
  navigator.clipboard.writeText(char).then(() => {
    element.classList.add('copied');
    setTimeout(() => element.classList.remove('copied'), 600);
  });
}

// Debounced search
let debounceTimer;
searchInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const q = searchInput.value.toLowerCase();
    const filtered = allEmojis.filter(e => 
      e.name.toLowerCase().includes(q) || e.char === q
    );
    renderEmojis(filtered);
  }, 220);
});

loadEmojis();
