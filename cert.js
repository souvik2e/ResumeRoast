/* ============================================
   RESUMEROAST — cert.js
   Builds the shareable scorecard image card.
   Requires: data.js loaded first.
============================================ */

RZ.CARD_STYLES = [
  { bg:'#0C0C0E', border:'#D4A017', score:'#F0C040', label:'#8A8780', text:'#F5F1E8', accent:'#B91C1C', name:'Executive Dark' },
  { bg:'#0F172A', border:'#2563EB', score:'#60A5FA', label:'#94A3B8', text:'#F1F5F9', accent:'#DC2626', name:'Corporate Navy' },
  { bg:'#111827', border:'#10B981', score:'#34D399', label:'#6B7280', text:'#F9FAFB', accent:'#F59E0B', name:'Tech Forward' },
  { bg:'#1A0A0A', border:'#DC2626', score:'#F87171', label:'#9CA3AF', text:'#FEF2F2', accent:'#D4A017', name:'Danger Zone' },
  { bg:'#FFFFFF', border:'#1F2937', score:'#1F2937', label:'#6B7280', text:'#111827', accent:'#DC2626', name:'Clean White' },
  { bg:'#FFF8F0', border:'#D4A017', score:'#92400E', label:'#78716C', text:'#1C1917', accent:'#B91C1C', name:'Cream Premium' },
];

let _cardStyleIdx = 0;

function buildScorecardImage(name, role, score, persona) {
  const s = RZ.CARD_STYLES[_cardStyleIdx % RZ.CARD_STYLES.length];
  const atsScore  = score;
  const hrV  = atsScore < 40 ? '❌ Rejected'      : atsScore < 60 ? '⚠️ Maybe Pile' : '✅ Shortlisted';
  const hmV  = atsScore < 40 ? '❌ Not Impressed'  : atsScore < 60 ? '⚠️ Average'    : '✅ Strong';
  const salV = atsScore < 35 ? '₹2.4–3.2 LPA'     : atsScore < 50 ? '₹3.5–5 LPA'   : atsScore < 65 ? '₹5–8 LPA' : '₹8–12 LPA';
  const p = RZ.PERSONAS.find(p => p.id === persona) || RZ.PERSONAS[0];

  return `
  <div class="share-scorecard" style="background:${s.bg};border:2px solid ${s.border};border-radius:20px;padding:28px 24px;font-family:'Inter',sans-serif;max-width:400px;margin:0 auto">

    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px">
      <div style="font-family:'Space Mono',monospace;font-size:11px;color:${s.border};letter-spacing:.1em;text-transform:uppercase">📄 ResumeRoast</div>
      <div style="font-family:'Space Mono',monospace;font-size:10px;color:${s.label};letter-spacing:.05em">Style: ${s.name}</div>
    </div>

    <div style="margin-bottom:16px">
      <div style="font-family:'Playfair Display',serif;font-size:22px;font-weight:700;color:${s.text}">${_escCert(name)}</div>
      <div style="font-size:13px;color:${s.label};margin-top:2px">${_escCert(role)}</div>
    </div>

    <div style="text-align:center;padding:18px 0;border-top:1px solid ${s.border}40;border-bottom:1px solid ${s.border}40;margin-bottom:16px">
      <div style="font-family:'Playfair Display',serif;font-size:64px;font-weight:900;color:${s.score};line-height:1">${atsScore}</div>
      <div style="font-family:'Space Mono',monospace;font-size:11px;color:${s.border};margin-top:2px;letter-spacing:.05em">/ 100 · ${RZ.getScoreLabel(atsScore).toUpperCase()}</div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
      <div style="background:${s.border}15;border-radius:10px;padding:12px">
        <div style="font-family:'Space Mono',monospace;font-size:9px;color:${s.label};letter-spacing:.06em;text-transform:uppercase;margin-bottom:4px">ATS Score</div>
        <div style="font-weight:700;font-size:14px;color:${s.text}">${atsScore}/100</div>
      </div>
      <div style="background:${s.border}15;border-radius:10px;padding:12px">
        <div style="font-family:'Space Mono',monospace;font-size:9px;color:${s.label};letter-spacing:.06em;text-transform:uppercase;margin-bottom:4px">HR Verdict</div>
        <div style="font-weight:700;font-size:13px;color:${s.text}">${hrV}</div>
      </div>
      <div style="background:${s.border}15;border-radius:10px;padding:12px">
        <div style="font-family:'Space Mono',monospace;font-size:9px;color:${s.label};letter-spacing:.06em;text-transform:uppercase;margin-bottom:4px">Manager</div>
        <div style="font-weight:700;font-size:13px;color:${s.text}">${hmV}</div>
      </div>
      <div style="background:${s.border}15;border-radius:10px;padding:12px">
        <div style="font-family:'Space Mono',monospace;font-size:9px;color:${s.label};letter-spacing:.06em;text-transform:uppercase;margin-bottom:4px">Salary Signal</div>
        <div style="font-weight:700;font-size:13px;color:${s.text}">${salV}</div>
      </div>
    </div>

    <div style="background:${s.accent}20;border:1px solid ${s.accent}40;border-radius:10px;padding:10px 14px;margin-bottom:16px;font-family:'Space Mono',monospace;font-size:11px;color:${s.accent}">
      ${p.icon} Reviewed by: ${p.label}
    </div>

    <div style="text-align:center;font-family:'Space Mono',monospace;font-size:9px;color:${s.label};letter-spacing:.06em;text-transform:uppercase">
      resumeroast.pages.dev · @resumeroast · Find out yours in 30 seconds
    </div>
  </div>`;
}

function newCardStyle() {
  _cardStyleIdx++;
  const modal = document.getElementById('scorecard-modal-content');
  if (modal) {
    modal.innerHTML = buildScorecardImage(STATE.name, STATE.jobTarget || STATE.role, STATE.score, STATE.persona);
    showToast('✨ New scorecard style!');
  }
}

function _escCert(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

console.log('✅ RZ cert.js loaded — card styles:', RZ.CARD_STYLES.length);
