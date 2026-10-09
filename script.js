(function () {
  'use strict';
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const root = document.documentElement;
  const GH = 'https://github.com/nikhilthk/';
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------- Data ---------- */
  const projects = [
    {
      task: 'Task 3', repo: 'terraform-docker-demo',
      title: 'Terraform + Docker container',
      summary: 'Defined a Docker image and an nginx container as code with Terraform.',
      tags: ['Terraform', 'Docker', 'Codespaces'],
      points: [
        'Described the image and the container in a Terraform configuration',
        'Worked inside GitHub Codespaces',
        'terraform plan previewed the changes (2 to add)',
        'terraform destroy cleaned everything up (2 destroyed)'
      ]
    },
    {
      task: 'Task 4', repo: 'devops-git-project',
      title: 'Version-controlled DevOps project',
      summary: 'A full Git workflow with branches, pull requests, a tag and documentation.',
      tags: ['Git', 'GitHub'],
      points: [
        'Created main, dev and feature branches',
        'Merged changes through pull requests',
        'Added a README, a Node .gitignore and the v1.0.0 tag',
        'Documented each step with screenshots'
      ]
    },
    {
      task: 'Task 6', repo: 'github-pages-demo',
      title: 'Static website on GitHub Pages',
      summary: 'This website, deployed for free from the main branch.',
      tags: ['GitHub Pages', 'HTML/CSS/JS'],
      points: [
        'Built with plain HTML, CSS and JavaScript',
        'Deployed from the main branch and root folder',
        'Every commit to main republishes the site',
        'Live link is also shown in the repo About box'
      ]
    }
  ];
  const allTags = Array.from(new Set(projects.reduce((a, p) => a.concat(p.tags), [])));

  /* ---------- Toast ---------- */
  const toast = $('#toast');
  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  }

  /* ---------- Theme ---------- */
  const themeBtn = $('#themeToggle');
  const currentTheme = () => root.getAttribute('data-theme') || 'light';
  function setTheme(t) {
    root.setAttribute('data-theme', t);
    themeBtn.textContent = t === 'dark' ? '☀️' : '🌙';
    try { localStorage.setItem('theme', t); } catch (e) {}
  }
  function toggleTheme() { setTheme(currentTheme() === 'dark' ? 'light' : 'dark'); }
  let saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) {}
  setTheme(saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  themeBtn.addEventListener('click', toggleTheme);

  /* ---------- Mobile menu ---------- */
  const menuBtn = $('#menuBtn');
  const navLinks = $('#navLinks');
  function closeMenu() { navLinks.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }
  menuBtn.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  $$('#navLinks a').forEach((a) => a.addEventListener('click', closeMenu));

  /* ---------- Typing effect ---------- */
  const words = ['Git and GitHub', 'Terraform', 'Docker containers', 'GitHub Pages'];
  const typed = $('#typed');
  let w = 0, c = 0, deleting = false;
  function type() {
    const word = words[w];
    typed.textContent = word.slice(0, c);
    if (!deleting && c < word.length) { c++; setTimeout(type, 90); }
    else if (!deleting) { deleting = true; setTimeout(type, 1300); }
    else if (c > 0) { c--; setTimeout(type, 45); }
    else { deleting = false; w = (w + 1) % words.length; setTimeout(type, 300); }
  }
  type();

  /* ---------- Counters ---------- */
  function countUp(el, target) {
    const dur = 1200;
    const start = performance.now();
    function step(now) {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * p);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  countUp($('#statProjects'), projects.length);
  countUp($('#statTools'), allTags.length);
  countUp($('#statTags'), 1);

  /* ---------- Projects: filters, cards, modal ---------- */
  const filtersEl = $('#filters');
  const gridEl = $('#projectGrid');
  const modal = $('#modal');
  let lastFocus = null;

  function openModal(p) {
    lastFocus = document.activeElement;
    $('#mBadge').textContent = p.task;
    $('#mTitle').textContent = p.title;
    $('#mDesc').textContent = p.summary;
    const list = $('#mList');
    list.innerHTML = '';
    p.points.forEach((pt) => { const li = document.createElement('li'); li.textContent = pt; list.appendChild(li); });
    const tags = $('#mTags');
    tags.innerHTML = '';
    p.tags.forEach((t) => { const s = document.createElement('span'); s.textContent = t; tags.appendChild(s); });
    $('#mLink').href = GH + p.repo;
    modal.hidden = false;
    $('#modalClose').focus();
  }
  function closeModal() {
    modal.hidden = true;
    if (lastFocus) lastFocus.focus();
  }
  $('#modalClose').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  function renderProjects(filter) {
    gridEl.innerHTML = '';
    projects
      .filter((p) => filter === 'All' || p.tags.indexOf(filter) !== -1)
      .forEach((p) => {
        const card = document.createElement('article');
        card.className = 'card';
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        card.innerHTML =
          '<div class="card-top"><span class="badge">' + p.task + '</span><span class="repo">' + p.repo + '</span></div>' +
          '<h3>' + p.title + '</h3><p>' + p.summary + '</p>' +
          '<div class="tags">' + p.tags.map((t) => '<span>' + t + '</span>').join('') + '</div>' +
          '<span class="more">Details →</span>';
        card.addEventListener('click', () => openModal(p));
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(p); }
        });
        gridEl.appendChild(card);
      });
  }
  ['All'].concat(allTags).forEach((tag, i) => {
    const b = document.createElement('button');
    b.className = 'chip' + (i === 0 ? ' active' : '');
    b.textContent = tag;
    b.addEventListener('click', () => {
      $$('.chip', filtersEl).forEach((x) => x.classList.remove('active'));
      b.classList.add('active');
      renderProjects(tag);
    });
    filtersEl.appendChild(b);
  });
  renderProjects('All');

  /* ---------- Interactive terminal ---------- */
  const termBody = $('#termBody');
  const termForm = $('#termForm');
  const termInput = $('#termInput');
  const history = [];
  let hIdx = 0;

  function tPrint(text, cls) {
    const d = document.createElement('div');
    if (cls) d.className = cls;
    d.textContent = text;
    termBody.appendChild(d);
    termBody.scrollTop = termBody.scrollHeight;
  }

  const commands = {
    'help': () => [
      'Available commands:',
      '  whoami              who am I',
      '  projects            list my projects',
      '  ls / pwd            look around',
      '  git log             commit history of my Git project',
      '  git branch          branches in my Git project',
      '  git tag             release tags',
      '  terraform plan      preview from my Terraform task',
      '  terraform destroy   cleanup from my Terraform task',
      '  theme               switch dark / light',
      '  date                current date and time',
      '  clear               clear the screen'
    ],
    'whoami': () => ['nikhilthk', 'DevOps intern learning Git, Terraform, Docker and GitHub Pages'],
    'ls': () => ['README.md  index.html  screenshots  script.js  style.css'],
    'pwd': () => ['/home/nikhilthk/github-pages-demo'],
    'projects': () => projects.map((p) => p.task + '  ' + p.repo + '  (' + p.tags.join(', ') + ')'),
    'git log': () => [
      'e4f8f3c (HEAD -> main, tag: v1.0.0) Merge pull request #2 from nikhilthk/dev',
      '285f38f Merge pull request #1 from nikhilthk/feature/readme-update',
      'bd80cca docs: add project overview to README',
      '820c672 Initial commit',
      '(snapshot of the history of devops-git-project)'
    ],
    'git branch': () => ['  dev', '  feature/add-docs', '  feature/readme-update', '* main'],
    'git tag': () => ['v1.0.0'],
    'terraform plan': () => [
      'Terraform will perform the following actions:',
      '  + Docker image (nginx)',
      '  + Docker container',
      'Plan: 2 to add, 0 to change, 0 to destroy.'
    ],
    'terraform destroy': () => ['Destroy complete! Resources: 2 destroyed.'],
    'date': () => [new Date().toString()]
  };
  commands['git log --oneline'] = commands['git log'];

  function runCommand(raw) {
    const cmd = raw.trim().replace(/\s+/g, ' ');
    if (!cmd) return;
    tPrint('$ ' + cmd, 't-cmd');
    history.push(cmd);
    hIdx = history.length;
    const key = cmd.toLowerCase();
    if (key === 'clear') { termBody.textContent = ''; return; }
    if (key === 'theme') { toggleTheme(); tPrint('Theme switched to ' + currentTheme(), 't-dim'); return; }
    if (commands[key]) { commands[key]().forEach((l) => tPrint(l)); }
    else { tPrint('command not found: ' + cmd + '. Type "help" to see what works.', 't-err'); }
  }
  termForm.addEventListener('submit', (e) => {
    e.preventDefault();
    runCommand(termInput.value);
    termInput.value = '';
  });
  termInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && hIdx > 0) { e.preventDefault(); hIdx--; termInput.value = history[hIdx]; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (hIdx < history.length - 1) { hIdx++; termInput.value = history[hIdx]; }
      else { hIdx = history.length; termInput.value = ''; }
    }
  });
  termBody.addEventListener('click', () => termInput.focus());
  tPrint('Welcome to my portfolio terminal.', 't-dim');
  tPrint('Type "help" to see the commands, or tap a shortcut below.', 't-dim');
  ['help', 'whoami', 'projects', 'git log', 'git branch', 'terraform plan', 'theme', 'clear'].forEach((cmd) => {
    const b = document.createElement('button');
    b.className = 'chip';
    b.textContent = cmd;
    b.addEventListener('click', () => runCommand(cmd));
    $('#quick').appendChild(b);
  });

  /* ---------- Pipeline simulator ---------- */
  const stageEls = $$('#stages .stage');
  const runBtn = $('#runBtn');
  const failToggle = $('#failToggle');
  const pipeStatus = $('#pipeStatus');
  const logEl = $('#log');
  const steps = [
    { name: 'Commit', ms: 900, lines: ['git add . && git commit -m "update website"', 'git push origin main'] },
    { name: 'Build', ms: 1100, lines: ['No dependencies to install (static site)', 'Packaging index.html, style.css, script.js'] },
    { name: 'Test', ms: 1100, lines: ['Checking HTML structure...', 'Checking links...'] },
    { name: 'Deploy', ms: 1200, lines: ['Uploading artifact to GitHub Pages...'] },
    { name: 'Live', ms: 700, lines: ['Site is live: https://nikhilthk.github.io/github-pages-demo/'] }
  ];
  function log(text, cls) {
    const t = new Date().toLocaleTimeString([], { hour12: false });
    const d = document.createElement('div');
    if (cls) d.className = cls;
    d.textContent = '[' + t + '] ' + text;
    logEl.appendChild(d);
    logEl.scrollTop = logEl.scrollHeight;
  }
  function setStatus(text, cls) {
    pipeStatus.textContent = text;
    pipeStatus.className = 'status' + (cls ? ' ' + cls : '');
  }
  runBtn.addEventListener('click', async () => {
    runBtn.disabled = true;
    failToggle.disabled = true;
    logEl.textContent = '';
    stageEls.forEach((s) => s.classList.remove('active', 'done', 'fail'));
    setStatus('Running...');
    for (let i = 0; i < steps.length; i++) {
      const st = steps[i];
      stageEls[i].classList.add('active');
      log('▶ ' + st.name, 'dim');
      for (const line of st.lines) { log(line); await sleep(st.ms / (st.lines.length + 1)); }
      await sleep(st.ms / (st.lines.length + 1));
      if (st.name === 'Test' && failToggle.checked) {
        stageEls[i].classList.replace('active', 'fail');
        log('✖ 1 test failed: broken link in index.html', 'bad');
        log('Pipeline stopped. Nothing was deployed.', 'bad');
        setStatus('Failed at Test', 'bad');
        runBtn.textContent = 'Fix and push again';
        failToggle.checked = false;
        runBtn.disabled = false;
        failToggle.disabled = false;
        return;
      }
      stageEls[i].classList.replace('active', 'done');
      log('✔ ' + st.name + ' passed', 'ok');
    }
    setStatus('Deployed successfully', 'ok');
    runBtn.textContent = 'Run again';
    runBtn.disabled = false;
    failToggle.disabled = false;
  });

  /* ---------- Contact form ---------- */
  const form = $('#contactForm');
  const cMsg = $('#cMsg');
  cMsg.addEventListener('input', () => { $('#cCount').textContent = cMsg.value.length; });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#cName').value.trim();
    const email = $('#cEmail').value.trim();
    const msg = cMsg.value.trim();
    const eName = name.length < 2 ? 'Please enter your name.' : '';
    const eEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'Please enter a valid email.';
    const eMsg = msg.length < 10 ? 'Message must be at least 10 characters.' : '';
    $('#eName').textContent = eName;
    $('#eEmail').textContent = eEmail;
    $('#eMsg').textContent = eMsg;
    if (eName || eEmail || eMsg) { showToast('Please fix the highlighted fields'); return; }
    form.reset();
    $('#cCount').textContent = '0';
    showToast('Thanks ' + name + '! (Demo form: nothing was sent)');
  });

  /* ---------- Scroll effects ---------- */
  const bar = $('#scrollBar');
  const nav = $('#nav');
  const toTop = $('#toTop');
  let ticking = false;
  function onScroll() {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    nav.classList.toggle('scrolled', window.scrollY > 10);
    toTop.hidden = window.scrollY < 500;
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  if ('IntersectionObserver' in window) {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); revealObs.unobserve(en.target); } });
    }, { threshold: 0.12 });
    $$('.reveal').forEach((el) => revealObs.observe(el));

    const links = $$('#navLinks a');
    const navObs = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    ['home', 'projects', 'terminal', 'pipeline', 'contact'].forEach((id) => navObs.observe($('#' + id)));
  } else {
    $$('.reveal').forEach((el) => el.classList.add('in'));
  }

  /* ---------- Keyboard + footer ---------- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { if (!modal.hidden) closeModal(); closeMenu(); }
  });
  $('#year').textContent = new Date().getFullYear();
})();
