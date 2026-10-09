// Theme toggle
const root = document.documentElement;
const toggle = document.getElementById('themeToggle');
function setTheme(t) {
  root.setAttribute('data-theme', t);
  toggle.textContent = t === 'dark' ? '☀️' : '🌙';
  try { localStorage.setItem('theme', t); } catch (e) {}
}
let saved = null;
try { saved = localStorage.getItem('theme'); } catch (e) {}
setTheme(saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
toggle.addEventListener('click', () => {
  setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

// Typing effect
const words = ['static websites', 'from a Git push', 'for free', 'with GitHub Pages'];
const typed = document.getElementById('typed');
let w = 0, c = 0, deleting = false;
function type() {
  const word = words[w];
  typed.textContent = word.slice(0, c);
  if (!deleting && c < word.length) { c++; setTimeout(type, 90); }
  else if (!deleting) { deleting = true; setTimeout(type, 1200); }
  else if (c > 0) { c--; setTimeout(type, 45); }
  else { deleting = false; w = (w + 1) % words.length; setTimeout(type, 300); }
}
type();

// Pipeline simulator
const stages = document.querySelectorAll('.stage');
const runBtn = document.getElementById('runBtn');
const statusText = document.getElementById('pipeStatus');
const messages = [
  'Commit pushed to main',
  'Building the site...',
  'Deploying to GitHub Pages...',
  'Live! Your site is published 🎉'
];
runBtn.addEventListener('click', () => {
  runBtn.disabled = true;
  stages.forEach(s => s.classList.remove('active', 'done'));
  stages.forEach((s, i) => {
    setTimeout(() => {
      if (i > 0) stages[i - 1].classList.replace('active', 'done');
      s.classList.add('active');
      statusText.textContent = messages[i];
      if (i === stages.length - 1) {
        setTimeout(() => {
          s.classList.replace('active', 'done');
          runBtn.disabled = false;
          runBtn.textContent = 'Run again';
        }, 900);
      }
    }, i * 1200);
  });
});

// Checklist progress
const boxes = document.querySelectorAll('.checklist input');
const bar = document.getElementById('bar');
const pct = document.getElementById('pct');
const doneMsg = document.getElementById('doneMsg');
function updateProgress() {
  const n = [...boxes].filter(b => b.checked).length;
  const p = Math.round((n / boxes.length) * 100);
  bar.style.width = p + '%';
  pct.textContent = p + '%';
  doneMsg.hidden = p < 100;
}
boxes.forEach(b => b.addEventListener('change', updateProgress));
updateProgress();
