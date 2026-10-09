(function () {
  'use strict';
  const $ = (s, e) => (e || document).querySelector(s);
  const $$ = (s, e) => Array.from((e || document).querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const REPO = 'https://github.com/nikhilthk/github-pages-demo';

  /* Newest first, like git log. Hashes are real only where shown. */
  const branches = [
    {
      name: 'feature/github-pages', color: '#D1432A', soft: 'rgba(209,67,42,.22)',
      mergeTitle: 'Merge Task 6: a static website on GitHub Pages',
      mergeText: 'Task 6 asked for a live HTML site and a repo. This page is the result: hand-written HTML, CSS and JavaScript, published for free.',
      commits: [
        { msg: 'Redraw the portfolio as a git graph', text: 'You are looking at it. Each task is a branch, each step is a commit, and the site is still plain files with no framework and no build step.' },
        { msg: 'Put the live link on the repository', text: `In the repo's About box, "Use your GitHub Pages website" shows the live address next to the code, so a reviewer finds both in one place.` },
        { msg: 'Enable GitHub Pages from main, root folder', text: 'After saving the setting the site was live within a minute. Every later commit to main republishes it the same way.', code: 'Settings → Pages → Deploy from a branch\nBranch: main    Folder: / (root)' },
        { msg: 'Add index.html, style.css and script.js', text: 'index.html is the file GitHub Pages serves by default. The CSS and JavaScript sit in their own files so each can change on its own.' },
        { msg: 'Create a public repository', text: 'Free GitHub Pages needs a public repository, so github-pages-demo is public and has its own README.' }
      ]
    },
    {
      name: 'feature/git-workflow', color: '#0E7A6E', soft: 'rgba(14,122,110,.22)', tag: 'v1.0.0',
      mergeTitle: 'Merge Task 4: branches, pull requests and a tag',
      mergeText: 'Task 4 was about working the way teams do: never commit straight to main, merge through pull requests, and mark releases with tags.',
      commits: [
        { msg: 'Add screenshots and fix the README formatting', text: 'Every step has a screenshot. The first version of the README section was indented by mistake, which turns it into a code block on GitHub, so a follow-up commit fixed it.' },
        { msg: 'Merge pull request #2 from nikhilthk/dev', hash: 'e4f8f3c', text: 'dev went into main through a second pull request. main was then tagged v1.0.0.', code: 'git tag -a v1.0.0 -m "First release: README and branching workflow"\ngit push origin v1.0.0' },
        { msg: 'Merge pull request #1 from nikhilthk/feature/readme-update', hash: '285f38f', text: 'The feature branch went into dev through a pull request, not a direct push.' },
        { msg: 'docs: add project overview to README', hash: 'bd80cca', text: 'The first real change, made on feature/readme-update, which was branched off dev.' },
        { msg: 'Create dev and feature branches', text: 'main stays stable. dev collects finished work. Each change gets its own feature branch.', code: 'git checkout -b dev\ngit push -u origin dev' },
        { msg: 'Initial commit', hash: '820c672', text: 'GitHub created the repository with a README and a Node .gitignore.' }
      ]
    },
    {
      name: 'feature/terraform-docker', color: '#6C4DF5', soft: 'rgba(108,77,245,.22)',
      mergeTitle: 'Merge Task 3: a Docker container, described with Terraform',
      mergeText: 'Task 3 used infrastructure as code: instead of typing Docker commands by hand, the image and the container are written in a Terraform file.',
      commits: [
        { msg: 'terraform apply, then terraform destroy', text: 'apply created the resources and destroy removed them again. The destroy summary said 2 destroyed, matching the 2 that were added.', code: 'Destroy complete! Resources: 2 destroyed.' },
        { msg: 'terraform plan: 2 to add', text: 'plan previews what Terraform will do before it changes anything. Here it listed the image and the container.', code: 'Plan: 2 to add, 0 to change, 0 to destroy.' },
        { msg: 'Describe the nginx image and container', text: 'The configuration declares one Docker image and one container that uses it. Running it again gives the same result.' },
        { msg: 'Open a Codespace for terraform-docker-demo', text: 'The work happened in GitHub Codespaces, a cloud editor and terminal, so there was nothing to install locally.' }
      ]
    }
  ];

  /* ---------- Render the graph ---------- */
  function commitHTML(c, bi, ci) {
    const id = 'd-' + bi + '-' + ci;
    return '<div class="commit">' +
      '<button class="c-btn" aria-expanded="false" aria-controls="' + id + '">' +
        '<span class="c-msg">' + c.msg + '</span>' +
        (c.hash ? '<span class="c-hash">' + c.hash + '</span>' : '') +
        '<span class="c-plus" aria-hidden="true">+</span>' +
      '</button>' +
      '<div class="c-detail" id="' + id + '"><div>' +
        '<p>' + c.text + '</p>' +
        (c.code ? '<pre><code>' + c.code + '</code></pre>' : '') +
      '</div></div>' +
    '</div>';
  }
  function branchHTML(b, i) {
    return '<article class="branch" style="--c:' + b.color + ';--soft:' + b.soft + ';--i:' + i + '" data-i="' + i + '">' +
      '<div class="merge-row"><h2>' + b.mergeTitle + '</h2><p>' + b.mergeText + '</p>' +
        (b.tag ? '<span class="tagpill">tag: ' + b.tag + '</span>' : '') + '</div>' +
      '<svg class="curve" viewBox="0 0 84 52" aria-hidden="true"><path pathLength="1" d="M18 0 C18 28 54 24 54 52"/></svg>' +
      '<div class="commits">' +
        '<div class="tip-row"><button class="bname" data-i="' + i + '" aria-pressed="false" title="git checkout ' + b.name + '"><span class="hd">HEAD -&gt;</span>' + b.name + '</button></div>' +
        b.commits.map((c, j) => commitHTML(c, i, j)).join('') +
      '</div>' +
      '<svg class="curve" viewBox="0 0 84 52" aria-hidden="true"><path pathLength="1" d="M54 0 C54 28 18 24 18 52"/></svg>' +
    '</article>';
  }
  const host = $('#branches');
  host.insertAdjacentHTML('beforeend', branches.map(branchHTML).join(''));

  /* ---------- Toast ---------- */
  const toastEl = $('#toast');
  let toastTimer;
  function toast(text) {
    toastEl.textContent = text;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
  }

  /* ---------- Expand commits and check out branches ---------- */
  const resetBtn = $('#resetBtn');
  let focused = null;

  function setOpen(commit, open) {
    commit.classList.toggle('open', open);
    $('.c-btn', commit).setAttribute('aria-expanded', String(open));
  }
  function clearFocus() {
    focused = null;
    delete document.body.dataset.focus;
    $$('.branch').forEach((b) => {
      b.classList.remove('focus');
      $('.bname', b).setAttribute('aria-pressed', 'false');
    });
    resetBtn.hidden = true;
  }
  function checkout(i) {
    if (focused === i) { clearFocus(); toast("Switched to branch 'main'"); return; }
    focused = i;
    document.body.dataset.focus = String(i);
    const all = $$('.branch');
    all.forEach((b, k) => {
      b.classList.toggle('focus', k === i);
      $('.bname', b).setAttribute('aria-pressed', String(k === i));
    });
    resetBtn.hidden = false;
    setOpen($('.commit', all[i]), true);
    toast("Switched to branch '" + branches[i].name + "'");
    all[i].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  }
  host.addEventListener('click', (e) => {
    const btn = e.target.closest('.c-btn');
    if (btn) {
      const c = btn.closest('.commit');
      setOpen(c, !c.classList.contains('open'));
      return;
    }
    const chip = e.target.closest('.bname');
    if (chip) checkout(Number(chip.dataset.i));
  });
  resetBtn.addEventListener('click', () => { clearFocus(); toast("Switched to branch 'main'"); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && focused !== null) { clearFocus(); toast("Switched to branch 'main'"); }
  });

  /* ---------- Highlight the commit at the middle of the screen ---------- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => en.target.classList.toggle('current', en.isIntersecting));
    }, { rootMargin: '-42% 0px -50% 0px' });
    $$('.commit').forEach((c) => io.observe(c));
  }

  /* ---------- git log view ---------- */
  function buildLog() {
    const out = ['<span class="dim">$ git log --graph --format=%s</span>'];
    branches.forEach((b, i) => {
      const label = i === 0 ? '(HEAD -> main) ' : (b.tag ? '(tag: ' + b.tag + ') ' : '');
      out.push('<span class="k">*</span> ' + label + b.mergeTitle);
      out.push('<span class="k">|\\</span>');
      b.commits.forEach((c, j) => {
        const tip = j === 0 ? '(' + b.name + ') ' : '';
        out.push('<span class="k">|</span> <span style="color:' + b.color + ';font-weight:600">*</span> ' + tip + c.msg);
      });
      out.push('<span class="k">|/</span>');
    });
    out.push('<span class="dim">...</span>');
    $('#logView').innerHTML = out.join('\n');
  }
  buildLog();

  const vGraph = $('#vGraph');
  const vLog = $('#vLog');
  function setView(view) {
    const log = view === 'log';
    $('#history').hidden = log;
    $('#logView').hidden = !log;
    vGraph.setAttribute('aria-pressed', String(!log));
    vLog.setAttribute('aria-pressed', String(log));
  }
  vGraph.addEventListener('click', () => setView('graph'));
  vLog.addEventListener('click', () => setView('log'));

  /* ---------- Contact form: opens a pre-filled GitHub issue ---------- */
  const form = $('#issueForm');
  const subject = $('#fSubject');
  const message = $('#fMsg');
  subject.addEventListener('input', () => { $('#fCount').textContent = subject.value.length + '/50'; });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const s = subject.value.trim();
    const m = message.value.trim();
    $('#eSubject').textContent = s.length < 3 ? 'Write a subject of at least 3 characters.' : '';
    $('#eMsg').textContent = m.length < 10 ? 'Write a message of at least 10 characters.' : '';
    if (s.length < 3 || m.length < 10) return;

    const title = $('#fType').value + ': ' + s;
    const url = REPO + '/issues/new?title=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(m);
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = 'Open the issue on GitHub';
    link.click();

    const note = $('#fNote');
    note.textContent = 'GitHub should have opened in a new tab. Sign in there and press Submit new issue to send it. If nothing opened: ';
    const again = link.cloneNode(true);
    note.appendChild(again);
  });
})();
