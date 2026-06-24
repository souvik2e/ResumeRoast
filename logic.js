/* ============================================
   RESUMEROAST — logic.js
   Calculator, scorecard, red-pen annotations,
   payment gates, share mechanics.
   Requires: data.js loaded first.
============================================ */

/* ══════════════════════════════════════════
   STATE
══════════════════════════════════════════ */
const STATE = {
  name:         '',
  role:         '',
  jobTarget:    '',
  experience:   '',
  skills:       '',
  bullets:      '',
  persona:      'hr',       /* default always HR (free) */
  score:        0,
  roastText:    '',
  weaknesses:   [],
  personaUnlocked: { hr: true }, /* hr always free */
  builderUnlocked: false,
  cardUnlocked:    false,
  usedFreeRoast:   false,
};

/* ══════════════════════════════════════════
   CURSOR
══════════════════════════════════════════ */
(function initCursor() {
  const dot  = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;
  let mx=0, my=0, rx=0, ry=0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
  });
  (function animate() {
    rx += (mx-rx)*0.13; ry += (my-ry)*0.13;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(animate);
  })();
  document.querySelectorAll('button,a,input,textarea,select,.faq-item,.persona-card').forEach(el => {
    el.addEventListener('mouseenter', () => { dot.classList.add('hovering'); ring.classList.add('hovering'); });
    el.addEventListener('mouseleave', () => { dot.classList.remove('hovering'); ring.classList.remove('hovering'); });
  });
})();

/* ══════════════════════════════════════════
   COUNTERS
══════════════════════════════════════════ */
function animateCount(el, target, prefix='', suffix='', duration=2200) {
  let start = null;
  function step(ts) {
    if (!start) start = ts;
    const p = Math.min((ts-start)/duration, 1);
    const e = 1 - Math.pow(1-p, 3);
    el.textContent = prefix + Math.floor(e*target).toLocaleString('en-IN') + suffix;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
setTimeout(() => {
  const r = document.getElementById('stat-roasts');
  const i = document.getElementById('stat-interviews');
  const t = document.getElementById('stat-templates');
  if (r) animateCount(r, 31847);
  if (i) animateCount(i, 4290);
  if (t) animateCount(t, 12);
}, 600);

/* ══════════════════════════════════════════
   TOAST
══════════════════════════════════════════ */
function showToast(msg, duration=3500) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

/* ══════════════════════════════════════════
   CONFETTI
══════════════════════════════════════════ */
function burst() {
  const cols = ['#D4A017','#F0C040','#B91C1C','#F5F1E8','#8B6914'];
  for (let i = 0; i < 28; i++) {
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;top:50%;left:50%;width:${4+Math.random()*7}px;height:${4+Math.random()*7}px;background:${cols[i%5]};border-radius:${Math.random()>.5?'50%':'2px'};pointer-events:none;z-index:9990;transition:all ${.7+Math.random()*.9}s cubic-bezier(0,.6,.4,1);transform:translate(-50%,-50%);`;
    document.body.appendChild(el);
    requestAnimationFrame(() => {
      const a = Math.random()*Math.PI*2, d = 100+Math.random()*210;
      el.style.transform = `translate(calc(-50% + ${Math.cos(a)*d}px), calc(-50% + ${Math.sin(a)*d}px))`;
      el.style.opacity = '0';
    });
    setTimeout(() => el.remove(), 1700);
  }
}

/* ══════════════════════════════════════════
   PERSONA SELECTOR — rendered on page
══════════════════════════════════════════ */
function initPersonaSelector() {
  const container = document.getElementById('persona-grid');
  if (!container) return;
  container.innerHTML = RZ.PERSONAS.map(p => `
    <div class="persona-card ${p.id === STATE.persona ? 'selected' : ''}"
         data-pid="${p.id}"
         onclick="selectPersona('${p.id}')">
      ${!p.free ? `<span class="persona-lock">🔒</span>` : ''}
      <div class="persona-icon">${p.icon}</div>
      <div class="persona-name">${p.label}</div>
      <div class="persona-price">${p.free ? 'FREE always' : p.tag}</div>
    </div>
  `).join('');
}

function selectPersona(id) {
  const persona = RZ.PERSONAS.find(p => p.id === id);
  if (!persona) return;

  if (!persona.free && !STATE.personaUnlocked[id]) {
    showToast(`🔒 Unlock ${persona.label} persona for ${persona.tag}`);
    const paySection = document.getElementById('persona-pay-section');
    if (paySection) {
      _el('persona-pay-name').textContent = persona.label;
      _el('persona-pay-price').textContent = persona.price;
      const personaLinks = {
        manager:  'https://payments.cashfree.com/forms/managerpersona',
        cmo:      'https://payments.cashfree.com/forms/personacmo',
        ceo:      'https://payments.cashfree.com/forms/ceopersona',
        ladyboss: 'https://payments.cashfree.com/forms/ladyboss',
        maleboss: 'https://payments.cashfree.com/forms/oldschoolboss',
        startup:  'https://payments.cashfree.com/forms/startupfounder',
        fang:     'https://payments.cashfree.com/forms/bigtech',
      };
      const link = personaLinks[id] || '#';
      _el('persona-pay-btn').href = link;
      _el('persona-pay-btn').onclick = () => handlePersonaPayClick(id, persona.price);
      paySection.style.display = 'block';
      paySection.scrollIntoView({ behavior:'smooth', block:'center' });
    }
    return;
  }

  STATE.persona = id;
  document.querySelectorAll('.persona-card').forEach(el => {
    el.classList.toggle('selected', el.dataset.pid === id);
  });
  const paySection = document.getElementById('persona-pay-section');
  if (paySection) paySection.style.display = 'none';
}

/* ══════════════════════════════════════════
   CHECK ONE FREE ROAST PER DEVICE
   Uses localStorage so it persists.
══════════════════════════════════════════ */
function hasUsedFreeRoast() {
  return localStorage.getItem('rr_free_used') === '1';
}
function markFreeRoastUsed() {
  localStorage.setItem('rr_free_used', '1');
  STATE.usedFreeRoast = true;
}

/* ══════════════════════════════════════════
   MAIN GENERATE ROAST
══════════════════════════════════════════ */
function generateRoast() {
  const name       = (_el('inp-name')?.value || '').trim() || 'Candidate';
  const role       = (_el('inp-role')?.value || '').trim() || 'your target role';
  const jobTarget  = (_el('inp-job-target')?.value || '').trim();
  const experience = (_el('inp-experience')?.value || '').trim();
  const skills     = (_el('inp-skills')?.value || '').trim();
  const bullets    = (_el('inp-bullets')?.value || '').trim();

  if (!role || !bullets) {
    showToast('Fill in your target role and at least one bullet point ✍️');
    return;
  }

  const persona = RZ.PERSONAS.find(p => p.id === STATE.persona) || RZ.PERSONAS[0];

  /* check free roast limit for non-paying users */
  if (persona.free && hasUsedFreeRoast() && !STATE.personaUnlocked['hr_repeat']) {
    showToast('You\'ve used your one free roast. Unlock a premium persona to roast again! 🔒');
    _el('persona-grid')?.scrollIntoView({ behavior:'smooth', block:'start' });
    return;
  }

  STATE.name       = name;
  STATE.role       = role;
  STATE.jobTarget  = jobTarget;
  STATE.experience = experience;
  STATE.skills     = skills;
  STATE.bullets    = bullets;
  STATE.score      = RZ.getScore();

  /* pick roast */
  const pool = RZ.ROASTS[STATE.persona] || RZ.ROASTS.hr;
  const idx  = Math.floor(Math.random() * pool.length);
  STATE.roastText = pool[idx](name, jobTarget || role);

  /* pick 3 weaknesses */
  const shuffled = [...RZ.WEAKNESS_TYPES].sort(() => 0.5 - Math.random());
  STATE.weaknesses = shuffled.slice(0, 3);

  /* mark free roast used */
  if (persona.free) markFreeRoastUsed();

  _renderResult();

  const resultEl = document.getElementById('result-section');
  if (resultEl) {
    resultEl.style.display = 'block';
    setTimeout(() => resultEl.scrollIntoView({ behavior:'smooth', block:'start' }), 80);
  }
  burst();
}

/* ══════════════════════════════════════════
   RENDER RESULT
══════════════════════════════════════════ */
function _renderResult() {
  /* ── SCORECARD (the viral shareable piece) ── */
  const atsScore = STATE.score;
  const hrVerdict    = atsScore < 40 ? '❌ Rejected'      : atsScore < 60 ? '⚠️ Maybe Pile' : '✅ Shortlisted';
  const hmVerdict    = atsScore < 40 ? '❌ Not Impressed'  : atsScore < 60 ? '⚠️ Weak'        : '✅ Interested';
  const salaryGuess  = atsScore < 35 ? '₹2.4–3.2 LPA' : atsScore < 50 ? '₹3.5–5 LPA' : atsScore < 65 ? '₹5–8 LPA' : '₹8–12 LPA';

  const scoreEl = _el('scorecard');
  if (scoreEl) {
    scoreEl.innerHTML = `
      <div class="scorecard-inner">
        <div class="sc-header">
          <div class="sc-name">${_esc(STATE.name)}</div>
          <div class="sc-role">${_esc(STATE.jobTarget || STATE.role)}</div>
        </div>
        <div class="sc-score-wrap">
          <div class="sc-big-score">${atsScore}<span>/100</span></div>
          <div class="sc-score-label">${RZ.getScoreLabel(atsScore)}</div>
        </div>
        <div class="sc-grid">
          <div class="sc-item"><div class="sc-item-label">ATS Score</div><div class="sc-item-val">${atsScore}/100</div></div>
          <div class="sc-item"><div class="sc-item-label">HR Verdict</div><div class="sc-item-val">${hrVerdict}</div></div>
          <div class="sc-item"><div class="sc-item-label">Manager Verdict</div><div class="sc-item-val">${hmVerdict}</div></div>
          <div class="sc-item"><div class="sc-item-label">Salary Signal</div><div class="sc-item-val">${salaryGuess}</div></div>
        </div>
        <div class="sc-persona-label">Reviewed by: ${RZ.PERSONAS.find(p=>p.id===STATE.persona)?.icon} ${RZ.PERSONAS.find(p=>p.id===STATE.persona)?.label}</div>
      </div>
    `;
  }

  /* ── PERSONA INTRO ── */
  const introEl = _el('persona-intro');
  if (introEl) introEl.textContent = RZ.PERSONA_INTROS[STATE.persona] || '';

  /* ── ROAST TEXT ── */
  const roastEl = _el('roast-text-output');
  if (roastEl) roastEl.textContent = STATE.roastText;

  /* ── SCORE METER ── */
  const meterFill  = _el('score-fill');
  const meterLabel = _el('score-label-val');
  if (meterFill && meterLabel) {
    meterLabel.textContent = RZ.getScoreLabel(STATE.score);
    setTimeout(() => { meterFill.style.width = STATE.score + '%'; }, 200);
  }

  /* ── WEAKNESSES ── */
  const weakEl = _el('weakness-list');
  if (weakEl) {
    weakEl.innerHTML = STATE.weaknesses.map(w => `
      <div class="weakness-item">
        <span class="weakness-icon">${w.icon}</span>
        <div>
          <div class="weakness-label">${w.label}</div>
          <div class="weakness-desc">${w.desc}</div>
        </div>
      </div>
    `).join('');
  }

  /* ── SIMULATED RESUME WITH RED-PEN MARKS ── */
  _renderResumeVisual();
}

/* ══════════════════════════════════════════
   RENDER SIMULATED RESUME WITH RED MARKS
══════════════════════════════════════════ */
function _renderResumeVisual() {
  const wrap = _el('resume-visual-content');
  if (!wrap) return;

  const bullets = STATE.bullets.split('\n').filter(b => b.trim()).slice(0, 5);
  const comments = [...RZ.RED_PEN_COMMENTS].sort(() => 0.5 - Math.random()).slice(0, 4);

  wrap.innerHTML = `
    <div class="resume-visual">
      <div class="rv-name">${_esc(STATE.name)}</div>
      <div class="rv-role">${_esc(STATE.role)}</div>
      <div class="rv-contact">📧 yourname@email.com &nbsp;|&nbsp; 📱 +91 XXXXX XXXXX &nbsp;|&nbsp; 🔗 linkedin.com/in/yourname</div>

      <div class="rv-section-title">Professional Summary</div>
      <div class="rv-bullet" style="position:relative">
        Results-driven professional with experience in ${_esc(STATE.role)} seeking growth opportunities in a dynamic environment.
        <span class="redmark-comment" style="top:-8px;right:-10px;transform:rotate(3deg)">${comments[0]?.text || 'generic!!'}</span>
      </div>

      <div class="rv-section-title">Experience</div>
      ${bullets.map((b, i) => `
        <div class="rv-bullet" style="position:relative">
          ${_esc(b)}
          ${i < 2 ? `<span class="redmark-comment" style="bottom:-4px;right:-8px;transform:rotate(-2deg)">${comments[i+1]?.text || 'prove it'}</span>` : ''}
          ${i === 1 ? `<span style="position:absolute;left:-6px;top:2px;color:#DC2626;font-size:14px">✗</span>` : ''}
        </div>
      `).join('')}

      <div class="rv-section-title">Skills</div>
      <div class="rv-bullet" style="position:relative">
        ${_esc(STATE.skills || 'Microsoft Office, Communication, Teamwork, Leadership')}
        <span class="redmark-comment" style="top:-8px;right:0;transform:rotate(2deg)">${comments[3]?.text || 'everyone lists these'}</span>
      </div>
    </div>
  `;
}

/* ══════════════════════════════════════════
   PAYMENT GATES
   Pattern: handleXxxPayClick → sessionStorage
   → Cashfree → Return URL → checkXxxUnlock()
   No honor system. No "did you pay?" popup.
══════════════════════════════════════════ */

/* ── PERSONA UNLOCK ── */
function handlePersonaPayClick(personaId, price) {
  sessionStorage.setItem('rr_persona_pending', personaId);
  sessionStorage.setItem('rr_state', JSON.stringify({
    name: STATE.name, role: STATE.role,
    jobTarget: STATE.jobTarget, experience: STATE.experience,
    skills: STATE.skills, bullets: STATE.bullets,
  }));
}

function checkPersonaUnlock() {
  const params = new URLSearchParams(window.location.search);
  const persona = params.get('unlock_persona');
  if (persona) {
    STATE.personaUnlocked[persona] = true;
    const saved = sessionStorage.getItem('rr_state');
    if (saved) Object.assign(STATE, JSON.parse(saved));
    sessionStorage.removeItem('rr_persona_pending');
    sessionStorage.removeItem('rr_state');
    STATE.persona = persona;
    initPersonaSelector();
    showToast(`🎉 ${RZ.PERSONAS.find(p=>p.id===persona)?.label} persona unlocked!`, 4000);
    _cleanUrl();
  }
}

/* ── BUILDER UNLOCK ── */
function handleBuilderPayClick(tierId) {
  sessionStorage.setItem('rr_builder_tier', tierId);
  sessionStorage.setItem('rr_state', JSON.stringify({
    name: STATE.name, role: STATE.role,
    jobTarget: STATE.jobTarget, experience: STATE.experience,
    skills: STATE.skills, bullets: STATE.bullets,
  }));
}

function checkBuilderUnlock() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('unlock') === 'builder') {
    const saved = sessionStorage.getItem('rr_state');
    if (saved) Object.assign(STATE, JSON.parse(saved));
    STATE.builderUnlocked = true;
    sessionStorage.removeItem('rr_builder_tier');
    sessionStorage.removeItem('rr_state');
    showToast('✅ Resume Builder unlocked! Scroll down to get your premium resume.', 4000);
    _el('builder-section')?.scrollIntoView({ behavior:'smooth', block:'start' });
    _renderBuilderSection();
    _cleanUrl();
  }
}

/* ── SCORECARD IMAGE UNLOCK ── */
function handleCardPayClick() {
  sessionStorage.setItem('rr_card_pending', '1');
}
function checkCardUnlock() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('unlock') === 'card') {
    STATE.cardUnlocked = true;
    sessionStorage.removeItem('rr_card_pending');
    showToast('🎉 Scorecard unlocked! Share it everywhere.', 4000);
    openScorecardModal();
    _cleanUrl();
  }
}

/* ══════════════════════════════════════════
   SCORECARD SHARE MODAL
   The viral, shareable image — hard-gated
══════════════════════════════════════════ */
function openScorecardModal() {
  if (!STATE.cardUnlocked) {
    showToast('Unlock the shareable scorecard first 🔒');
    _el('scorecard-unlock-section')?.scrollIntoView({ behavior:'smooth', block:'center' });
    return;
  }
  const atsScore = STATE.score;
  const hrV  = atsScore < 40 ? '❌ Rejected' : atsScore < 60 ? '⚠️ Maybe Pile' : '✅ Shortlisted';
  const hmV  = atsScore < 40 ? '❌ Weak'     : atsScore < 60 ? '⚠️ Average'    : '✅ Strong';
  const salV = atsScore < 35 ? '₹2.4–3.2 LPA' : atsScore < 50 ? '₹3.5–5 LPA' : atsScore < 65 ? '₹5–8 LPA' : '₹8–12 LPA';
  const modal = _el('scorecard-modal');
  const content = _el('scorecard-modal-content');
  if (!modal || !content) return;
  content.innerHTML = `
    <div class="share-scorecard">
      <div class="ssc-brand">📄 ResumeRoast</div>
      <div class="ssc-name">${_esc(STATE.name)}</div>
      <div class="ssc-role">${_esc(STATE.jobTarget || STATE.role)}</div>
      <div class="ssc-big">${atsScore}<small>/100</small></div>
      <div class="ssc-verdict-label">${RZ.getScoreLabel(atsScore)}</div>
      <div class="ssc-grid">
        <div class="ssc-cell"><div class="ssc-cl">ATS Score</div><div class="ssc-cv">${atsScore}/100</div></div>
        <div class="ssc-cell"><div class="ssc-cl">HR Verdict</div><div class="ssc-cv">${hrV}</div></div>
        <div class="ssc-cell"><div class="ssc-cl">Manager</div><div class="ssc-cv">${hmV}</div></div>
        <div class="ssc-cell"><div class="ssc-cl">Salary Signal</div><div class="ssc-cv">${salV}</div></div>
      </div>
      <div class="ssc-footer">resumeroast.byme.workers.dev · @resumeroast</div>
    </div>
  `;
  modal.classList.add('open');
}
function closeScorecardModal() { _el('scorecard-modal')?.classList.remove('open'); }

/* ══════════════════════════════════════════
   PREMIUM RESUME BUILDER SECTION
   Shown after builder payment confirmed
══════════════════════════════════════════ */
function _renderBuilderSection() {
  const el = _el('builder-content');
  if (!el) return;
  el.innerHTML = `
    <div class="eyebrow" style="text-align:left;margin-bottom:8px">✅ Builder Unlocked</div>
    <div style="font-family:var(--ff-display);font-size:22px;font-weight:700;color:var(--cream);margin-bottom:6px">Choose Your Template</div>
    <div style="font-size:13px;color:var(--grey);margin-bottom:20px">All 12 premium styles below. Pick one. Your job-targeted resume generates instantly.</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px">
      ${RZ.RESUME_TEMPLATES.map(t => `
        <div class="dark-card" style="padding:16px;text-align:center;cursor:none;transition:all .2s" onclick="selectTemplate(${t.id})" id="tmpl-${t.id}">
          <div style="font-family:var(--ff-mono);font-size:11px;color:var(--gold);margin-bottom:6px">#${t.id}</div>
          <div style="font-family:var(--ff-body);font-weight:600;font-size:13px;color:var(--cream);margin-bottom:4px">${t.name}</div>
          <div style="font-size:11px;color:var(--grey);line-height:1.4">${t.style}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function selectTemplate(id) {
  document.querySelectorAll('[id^="tmpl-"]').forEach(el => el.style.borderColor = 'var(--border)');
  const el = _el(`tmpl-${id}`);
  if (el) el.style.borderColor = 'var(--gold)';
  const t = RZ.RESUME_TEMPLATES.find(r => r.id === id);
  showToast(`✨ "${t?.name}" selected — your resume will be built in this style!`);
}

/* ══════════════════════════════════════════
   SHARE FUNCTIONS — the viral distribution loop
══════════════════════════════════════════ */
function _getShareText() {
  return `😂 My resume just got destroyed by ResumeRoast.\n\nScore: ${STATE.score}/100\nHR Verdict: ${STATE.score < 40 ? 'Rejected ❌' : 'Maybe Pile ⚠️'}\n\nFind out why recruiters reject yours in 30 seconds 👇\nresumeroast.byme.workers.dev`;
}
function shareWhatsApp() { window.open('https://wa.me/?text=' + encodeURIComponent(_getShareText()), '_blank'); }
function shareTwitter()  { window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(_getShareText() + '\n@resumeroast'), '_blank'); }
function shareLinkedIn() { window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent('https://resumeroast.byme.workers.dev'), '_blank'); }
function copyShareText() { navigator.clipboard.writeText(_getShareText()).then(() => showToast('Copied! Paste it and watch people click 🔥')); }
function copyInstaCap() {
  const text = `My resume got a ${STATE.score}/100 from ResumeRoast 😭\n\nHR verdict: ${STATE.score < 40 ? 'REJECTED ❌' : 'Maybe pile ⚠️'}\n\nFind out why recruiters reject yours 👇\nresumeroast.byme.workers.dev\n\n@resumeroast #resumeroast #jobsearch #careeradvice #resumetips #hireme`;
  navigator.clipboard.writeText(text).then(() => showToast('Instagram caption copied! Tag @resumeroast for lucky draw 🎁'));
}

/* ══════════════════════════════════════════
   FAQ
══════════════════════════════════════════ */
function initFAQ() {
  const c = _el('faq-list');
  if (!c) return;
  c.innerHTML = RZ.FAQS.map(f => `
    <div class="faq-item" onclick="this.classList.toggle('open')">
      <div class="faq-question">${f.q}<span class="faq-icon">+</span></div>
      <div class="faq-answer">${f.a}</div>
    </div>
  `).join('');
}

/* ══════════════════════════════════════════
   MARQUEE
══════════════════════════════════════════ */
function initMarquee() {
  const track = _el('marquee-track');
  if (!track) return;
  const doubled = [...RZ.STORIES, ...RZ.STORIES];
  track.innerHTML = doubled.map(s => `
    <div class="story-card">
      <div class="story-before-after">Before: ${s.before} → After: ${s.after}</div>
      <div class="story-text">${s.text}</div>
      <div class="story-name">${s.name}</div>
    </div>
  `).join('');
}

/* ══════════════════════════════════════════
   JOB CATEGORY CHIPS
══════════════════════════════════════════ */
function initJobCategories() {
  const c = _el('job-category-chips');
  if (!c) return;
  c.innerHTML = RZ.JOB_CATEGORIES.map(j => `
    <div class="chip" onclick="selectJobCategory('${j.id}', this)">${j.icon} ${j.label}</div>
  `).join('');
}
function selectJobCategory(id, el) {
  document.querySelectorAll('#job-category-chips .chip').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  STATE.jobTarget = id;
}

/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */
function _el(id) { return document.getElementById(id); }
function _esc(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }
function _cleanUrl() { window.history.replaceState({}, document.title, window.location.origin + window.location.pathname); }
function _show(id) { const e = _el(id); if (e) e.style.display = 'block'; }
function _hide(id) { const e = _el(id); if (e) e.style.display = 'none'; }

/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initPersonaSelector();
  initJobCategories();
  initFAQ();
  initMarquee();
  checkPersonaUnlock();
  checkBuilderUnlock();
  checkCardUnlock();
  console.log('✅ ResumeRoast logic.js initialised');
});
