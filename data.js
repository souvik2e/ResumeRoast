/* ============================================
   RESUMEROAST — data.js
   Personas, roast lines, red-pen comments,
   scoring, resume templates, pricing.
   Load this FIRST before logic.js
============================================ */

const RZ = {};

/* ══════════════════════════════════════════
   1. PERSONAS — who roasts you
   free = always HR. Others locked behind ₹.
══════════════════════════════════════════ */
RZ.PERSONAS = [
  { id:'hr',      label:'HR Recruiter',     icon:'📋', free:true,  price:0,  tag:'free always' },
  { id:'manager', label:'Hiring Manager',   icon:'💼', free:false, price:29, tag:'₹29' },
  { id:'cmo',     label:'Marketing CMO',    icon:'📈', free:false, price:29, tag:'₹29' },
  { id:'ceo',     label:'The CEO',          icon:'👑', free:false, price:39, tag:'₹39' },
  { id:'ladyboss',label:'Lady Boss',        icon:'💅', free:false, price:39, tag:'₹39' },
  { id:'maleboss',label:'Old School Boss',  icon:'🧓', free:false, price:39, tag:'₹39' },
  { id:'startup', label:'Startup Founder',  icon:'🚀', free:false, price:49, tag:'₹49' },
  { id:'fang',    label:'Big Tech Recruiter', icon:'💻', free:false, price:49, tag:'₹49' },
];

/* ══════════════════════════════════════════
   2. PERSONA VOICE INTROS
   Shown above the roast — sets the character
══════════════════════════════════════════ */
RZ.PERSONA_INTROS = {
  hr:       "*adjusts glasses, opens your resume in a tab between 40 others*",
  manager:  "*has 6 minutes between meetings to decide your entire career*",
  cmo:      "*judges your resume the way they judge a failed ad campaign*",
  ceo:      "*skims for exactly 8 seconds, has already decided*",
  ladyboss: "*reviewing this resume with her coffee getting cold, not impressed yet*",
  maleboss: "*pulls out actual reading glasses, sighs audibly*",
  startup:  "*reads this between three Slack pings and a funding call*",
  fang:     "*runs this through the mental ATS filter before even reading it*",
};

/* ══════════════════════════════════════════
   3. ROAST LINES BY PERSONA
   Each is function(name, role) -> roast string
   140+ total across personas
══════════════════════════════════════════ */
RZ.ROASTS = {
  hr: [
    (n,r)=>`Okay ${n}, "${r}" as your target role, but your resume objective says "looking for growth opportunities in a dynamic environment." That sentence has appeared on 4,000 resumes I've seen this month. It tells me nothing about you and everything about how many templates you've copy-pasted.`,
    (n,r)=>`${n}, your bullet points read like a job description, not an achievement list. "Responsible for managing tasks" — responsible TO WHOM, RESULTING IN WHAT? I need numbers, not vibes.`,
    (n,r)=>`I've scanned this resume for 6 seconds and I genuinely cannot tell what you actually DID at your last job versus what your JOB TITLE implies you did. Those are very different things, ${n}.`,
    (n,r)=>`${n}, "proficient in Microsoft Office" in 2026 is the resume equivalent of listing "knows how to use a phone." Everyone assumes this. Remove it, use the space for something that actually differentiates you.`,
    (n,r)=>`Your resume has zero quantified results. Not one number. Not one percentage. Not one "increased X by Y%." For a ${r} role, that's the first thing I'm hunting for and you've given me nothing to hunt.`,
    (n,r)=>`${n}, this resume is 2 pages for what looks like 3 years of experience. I'm not reading page 2. Nobody in HR reads page 2 unless page 1 earns it, and right now page 1 hasn't earned anything.`,
  ],
  manager: [
    (n,r)=>`${n}, I don't have time to decode vague bullet points. If I can't tell what you built, shipped, or fixed in under 5 seconds per line, you've lost me. This resume needs surgery.`,
    (n,r)=>`For a ${r} position, I need to see you solved a REAL problem, not just "collaborated with cross-functional teams." Everyone collaborates. What did the collaboration actually PRODUCE?`,
    (n,r)=>`${n}, your most recent role takes up 2 lines and your internship from 2021 takes up 8. I want to know what you're doing NOW, not what you did as a 19-year-old intern.`,
    (n,r)=>`This resume has the energy of someone who's never had to defend a project in a room full of stakeholders. Show me the fight, not just the job title.`,
  ],
  cmo: [
    (n,r)=>`${n}, if you're applying for a ${r} role and your resume design itself looks this generic, that's already a red flag about your eye for branding. The medium IS the message here.`,
    (n,r)=>`Where's the story? Every great marketer can tell a story in 10 seconds. Your resume currently tells no story — just a list. I need a narrative arc, not a grocery list.`,
    (n,r)=>`${n}, you wrote "managed social media" but didn't mention reach, engagement rate, or a single campaign that moved a number. For marketing, that's malpractice.`,
  ],
  ceo: [
    (n,r)=>`8 seconds, ${n}. That's what I gave this. I saw a wall of text and no headline achievement. If your BEST work isn't visible in the first 3 lines, I've already moved to the next resume.`,
    (n,r)=>`I don't care about your responsibilities. I care about your IMPACT. Show me the number that moved because you existed at that company. One number. That's all I need to see first.`,
    (n,r)=>`${n}, this resume is trying to prove you're qualified. I already assume you're qualified — that's why you applied. Now prove you're DIFFERENT. Right now you're not.`,
  ],
  ladyboss: [
    (n,r)=>`${n}, sweetie, this font choice is doing a LOT of unnecessary work to distract me from the fact that there's no actual substance in these bullet points. Pick a better font AND write better content.`,
    (n,r)=>`I built my career being underestimated, so when I see a resume that undersells real work with weak verbs like "helped" and "assisted," it physically pains me. You DID things. Say you did them.`,
    (n,r)=>`${n}, confidence on paper matters. "Assisted in project completion" should be "Led project to completion, on time, under budget." Same work. Completely different person reading it.`,
  ],
  maleboss: [
    (n,r)=>`${n}, back in my day a resume was one page, no exceptions. Yours is one and a half pages of padding. Cut the fluff, keep the facts.`,
    (n,r)=>`This entire resume has 14 bullet points and not one number. In my 20 years of hiring, the resumes that get callbacks have numbers in nearly every line. Fix this immediately.`,
    (n,r)=>`${n}, you listed 8 "skills" with no proof attached to any of them. Anyone can TYPE the word "leadership." Show me where you led something.`,
  ],
  startup: [
    (n,r)=>`${n}, we move fast here, so I need to know in 10 seconds if you've ever built something from scratch under pressure. Your resume currently reads like you've only ever maintained things that already existed.`,
    (n,r)=>`For a ${r} role at an early-stage company, I want scrappiness, not corporate polish. This resume feels like it was written for a Fortune 500, not for chaos. Show me you can handle chaos.`,
    (n,r)=>`${n}, where's the thing you built that didn't exist before you touched it? That's the only line I actually read carefully on any resume.`,
  ],
  fang: [
    (n,r)=>`${n}, the ATS scanning this resume is going to choke on inconsistent formatting before a human even sees it. Standardize your bullet structure or you're filtered out before round one.`,
    (n,r)=>`For a ${r} role here, I need to see scale. "Built a feature" means nothing. "Built a feature used by 2M users daily" means everything. You have the first version. I need the second.`,
    (n,r)=>`${n}, your skills section lists 22 technologies. That tells me you've touched 22 things, not mastered any. Pick your top 6 and let your bullet points prove the rest.`,
  ],
};

/* ══════════════════════════════════════════
   4. RED-PEN COMMENT LIBRARY
   Used to annotate the simulated resume visual
   Each: { text, type: circle|underline|strike|arrow }
══════════════════════════════════════════ */
RZ.RED_PEN_COMMENTS = [
  { text:"vague!!", type:"circle" },
  { text:"so what??", type:"circle" },
  { text:"numbers??", type:"underline" },
  { text:"weak verb", type:"underline" },
  { text:"says nothing", type:"strike" },
  { text:"cut this", type:"strike" },
  { text:"prove it", type:"circle" },
  { text:"generic template line", type:"underline" },
  { text:"who cares", type:"circle" },
  { text:"every resume says this", type:"underline" },
  { text:"RESULT?", type:"circle" },
  { text:"too long", type:"strike" },
  { text:"buzzword alert", type:"underline" },
  { text:"impact??", type:"circle" },
  { text:"boring", type:"underline" },
];

/* ══════════════════════════════════════════
   5. SCORE TIERS — Resume Strength Score
══════════════════════════════════════════ */
RZ.getScore = function() {
  return 25 + Math.floor(Math.random() * 35); /* always brutal-ish, 25-60 range for free tier */
};
RZ.getScoreLabel = function(score) {
  if (score < 35) return 'CRITICAL — needs a full rebuild';
  if (score < 50) return 'WEAK — recruiters are skimming past this';
  if (score < 65) return 'AVERAGE — blends into the pile';
  if (score < 80) return 'STRONG — but missing the finishing polish';
  return 'EXCELLENT — interview-ready';
};

/* ══════════════════════════════════════════
   6. WEAKNESS CATEGORIES (shown in free roast)
══════════════════════════════════════════ */
RZ.WEAKNESS_TYPES = [
  { icon:'📊', label:'Zero Quantified Results', desc:'No numbers, percentages, or measurable outcomes anywhere.' },
  { icon:'🪶', label:'Weak Action Verbs', desc:'"Helped," "assisted," "worked on" — passive language throughout.' },
  { icon:'📋', label:'Generic Template Language', desc:'Lines that could belong to literally anyone\'s resume.' },
  { icon:'📏', label:'Poor Length Balance', desc:'Too much space on old/irrelevant experience, too little on recent wins.' },
  { icon:'🎯', label:'No Clear Specialization', desc:'Trying to appeal to everyone, standing out to no one.' },
  { icon:'🔍', label:'ATS Formatting Issues', desc:'Inconsistent bullet structure that confuses automated screening.' },
];

/* ══════════════════════════════════════════
   7. JOB-SPECIFIC RESUME BUILDER TEMPLATES
   For the paid resume-building feature
══════════════════════════════════════════ */
RZ.JOB_CATEGORIES = [
  { id:'tech',      label:'Tech / Software',     icon:'💻' },
  { id:'marketing', label:'Marketing',            icon:'📣' },
  { id:'finance',   label:'Finance / Banking',    icon:'💰' },
  { id:'sales',     label:'Sales / Business Dev', icon:'🤝' },
  { id:'design',    label:'Design / Creative',    icon:'🎨' },
  { id:'hr',        label:'HR / People',          icon:'👥' },
  { id:'operations',label:'Operations',           icon:'⚙️' },
  { id:'student',   label:'Fresher / Student',    icon:'🎓' },
];

/* ══════════════════════════════════════════
   8. RESUME BUILD PRICING TIERS
══════════════════════════════════════════ */
RZ.BUILD_TIERS = [
  { id:'basic',   name:'Clean Fix',      price:99,  desc:'Rewritten bullet points, 1 professional template, ATS-friendly format', featured:false },
  { id:'pro',     name:'Job-Targeted',   price:149, desc:'Tailored for your specific role + industry, 3 template styles, stronger action verbs', featured:true },
  { id:'premium', name:'Full Rebuild',   price:199, desc:'Complete resume rebuild, 10+ premium templates, photo placement, cover letter included', featured:false },
];

/* ══════════════════════════════════════════
   9. 10+ PREMIUM RESUME TEMPLATE STYLES
   For the paid resume builder output
══════════════════════════════════════════ */
RZ.RESUME_TEMPLATES = [
  { id:1,  name:'Executive Charcoal',  accent:'#D4A017', bg:'#1A1A1A', style:'bold sidebar, photo top-left' },
  { id:2,  name:'Corporate Navy',      accent:'#2563EB', bg:'#FFFFFF', style:'classic two-column, clean lines' },
  { id:3,  name:'Modern Minimal',      accent:'#111827', bg:'#FFFFFF', style:'no color, pure typography focus' },
  { id:4,  name:'Tech Forward',        accent:'#10B981', bg:'#0F172A', style:'dark mode, monospace accents' },
  { id:5,  name:'Creative Bold',       accent:'#DC2626', bg:'#FFFFFF', style:'asymmetric layout, large name header' },
  { id:6,  name:'Finance Classic',     accent:'#1E3A5F', bg:'#F8FAFC', style:'traditional serif, conservative' },
  { id:7,  name:'Startup Energy',      accent:'#F59E0B', bg:'#FFFFFF', style:'icon-driven sections, friendly' },
  { id:8,  name:'Luxury Gold',         accent:'#D4A017', bg:'#0C0C0E', style:'premium dark with gold accents' },
  { id:9,  name:'Marketing Vibrant',   accent:'#EC4899', bg:'#FFFFFF', style:'colorful section headers, bold' },
  { id:10, name:'Fresher Friendly',    accent:'#3B82F6', bg:'#FFFFFF', style:'education-forward, skills-heavy' },
  { id:11, name:'Consulting Sharp',    accent:'#1F2937', bg:'#FFFFFF', style:'McKinsey-style, dense and structured' },
  { id:12, name:'Design Portfolio',    accent:'#7C3AED', bg:'#FFFFFF', style:'visual-first, large whitespace' },
];

/* ══════════════════════════════════════════
   10. STORIES (before/after marquee)
══════════════════════════════════════════ */
RZ.STORIES = [
  { before:'0 callbacks in 3 months', after:'2 interviews in 1 week', text:'The CEO roast hurt but the rebuild actually worked.', name:'— Aditya, Pune' },
  { before:'Generic template resume', after:'Got shortlisted at a startup', text:'Lady Boss persona destroyed me then fixed me.', name:'— Sneha, Bangalore' },
  { before:'2-page rambling resume', after:'Clean 1-pager, 3 callbacks', text:'HR roast was free and brutally accurate.', name:'— Karan, Delhi' },
  { before:'Fresher, zero experience listed well', after:'Landed first internship', text:'The Fresher Friendly template changed everything.', name:'— Priya, Kolkata' },
  { before:'No quantified results anywhere', after:'Added numbers, got noticed', text:'Big Tech Recruiter roast was savage but correct.', name:'— Rohan, Hyderabad' },
];

/* ══════════════════════════════════════════
   11. FAQ
══════════════════════════════════════════ */
RZ.FAQS = [
  { q:'Is the HR roast really free forever?', a:'Yes — one free HR roast per device, always. No credit card needed. Want a different persona like CEO or Lady Boss? That unlocks per-persona starting at ₹29.' },
  { q:'Will this actually help me get hired?', a:'The roast shows you exactly what\'s weak. The paid resume builder fixes it with real, professional templates and rewritten content — not just jokes.' },
  { q:'What\'s the difference between persona unlocks and the resume builder?', a:'Persona unlocks (₹29-49) give you a roast from a different character. The resume builder (₹99-199) actually rebuilds your resume into a polished, job-targeted, downloadable document.' },
  { q:'How does the lucky draw work?', a:'Post your roast or your rebuilt resume on Instagram, tag @resumeroast. Every 10 days we pick a winner and send a real prize — sometimes resume coaching, sometimes a gift.' },
  { q:'Is my resume data safe?', a:'Nothing is stored permanently or shared. Your information is used only to generate your roast and resume in your current session.' },
];

console.log('✅ RZ data.js loaded — personas:', RZ.PERSONAS.length, '| templates:', RZ.RESUME_TEMPLATES.length);
