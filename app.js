/* ==========================================================================
   DFIR Command Coach - application logic
   Renders the bilingual lab, tracks progress, and exports the collection log.
   No dependencies, no network calls, no build step.
   ========================================================================== */
(function () {
  'use strict';

  var LAB = window.LAB;
  var STORE_KEY = 'dfir-coach-v1';

  /* ------------------------------------------------------------- state */
  var state = {
    lang: 'en',
    theme: 'dark',
    query: '',
    activePhase: 'all',
    done: {},          // stepId -> ISO timestamp
    notes: {},         // stepId -> { output, hash, limitation }
    analyst: '',
    host: '',
    target: 'DFIR-WIN02'
  };

  var STEP_BY_ID = {};
  LAB.steps.forEach(function (s) { STEP_BY_ID[s.id] = s; });

  /* --------------------------------------------------------- utilities */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function t(obj) {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[state.lang] !== undefined ? obj[state.lang] : (obj.en || '');
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /* The data contains a small amount of trusted inline markup (<code>). */
  function rich(str) {
    return esc(str).replace(/&lt;code&gt;/g, '<code>').replace(/&lt;\/code&gt;/g, '</code>');
  }

  function toast(msg) {
    var el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () { el.classList.remove('show'); }, 2000);
  }

  /* ------------------------------------------------------- persistence */
  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return;
      var saved = JSON.parse(raw);
      Object.keys(state).forEach(function (k) {
        if (saved[k] !== undefined && saved[k] !== null) state[k] = saved[k];
      });
    } catch (e) { /* storage unavailable — run without persistence */ }
  }

  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch (e) { /* ignore */ }
  }

  /* -------------------------------------------- PowerShell highlighting */
  var PS_RE = new RegExp([
    '(?<com>#[^\\n]*)',
    '(?<str>"(?:[^"\\\\\\n]|\\\\.)*"|\'(?:[^\'\\\\\\n]|\\\\.)*\')',
    '(?<var>\\$\\$?|\\$[A-Za-z_][\\w:]*)',
    '(?<cmd>\\b(?:Get|Set|New|Start|Stop|Invoke|Sort|Select|Export|Out|Enable|Disable|Import|Where|Measure|Test|Write|Read|Remove|Copy|Compress|Expand|Format|Tee|Add|Show|Convert|Resolve|Register|Unregister|Enter|Exit|Install|Update|Group|Compare|Clear|Rename|Move|Split|Join|Save|Search|Boot|Shutdown)-[A-Za-z][\\w]*)',
    '(?<key>\\b(?:if|else|elseif|foreach|for|while|switch|function|return|param|try|catch|finally|in|do|until|begin|process|end|true|false|null)\\b)',
    '(?<num>\\b\\d+(?:\\.\\d+)?\\b)',
    '(?<op>[-+*/%]=?|!=|==|\\||\\{|\\})'
  ].join('|'), 'g');

  function highlightPS(src) {
    var out = '';
    var last = 0;
    var m;
    PS_RE.lastIndex = 0;
    while ((m = PS_RE.exec(src)) !== null) {
      if (m.index === PS_RE.lastIndex) { PS_RE.lastIndex++; continue; }
      out += esc(src.slice(last, m.index));
      var cls = 'op';
      if (m.groups.com) cls = 'com';
      else if (m.groups.str) cls = 'str';
      else if (m.groups.var) cls = 'var';
      else if (m.groups.cmd) cls = 'cmd';
      else if (m.groups.key) cls = 'key';
      else if (m.groups.num) cls = 'num';
      out += '<span class="tok-' + cls + '">' + esc(m[0]) + '</span>';
      last = PS_RE.lastIndex;
    }
    out += esc(src.slice(last));
    return out;
  }

  /* --------------------------------------------------------- clipboard */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      try {
        var ok = document.execCommand('copy');
        area.remove();
        ok ? resolve() : reject();
      } catch (e) {
        area.remove();
        reject(e);
      }
    });
  }

  /* --------------------------------------------------------- rendering */
  function renderChrome() {
    document.documentElement.lang = state.lang;
    document.documentElement.dir = state.lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('data-theme', state.theme);

    $('#courseLabel').textContent = t(LAB.meta.course);
    $('#siteTitle').textContent = t(LAB.meta.title);
    $('#courseCode').textContent = t(LAB.meta.code);
    $('#sectionChip').textContent = t(LAB.meta.section);
    $('#modeChip').textContent = state.lang === 'ar' ? 'وضع اللاب' : 'Lab mode';
    $('#printLabel').textContent = state.lang === 'ar' ? 'طباعة' : 'Print';
    $('#printBtn').setAttribute('aria-label', state.lang === 'ar'
      ? 'طباعة ورشة العمل'
      : 'Print the lab worksheet');
    $('#themeLabel').textContent = state.theme === 'dark'
      ? (state.lang === 'ar' ? 'فاتح' : 'Light')
      : (state.lang === 'ar' ? 'داكن' : 'Dark');
    $('#themeBtn').setAttribute('aria-label', state.lang === 'ar'
      ? 'تبديل السمة إلى ' + (state.theme === 'dark' ? 'فاتح' : 'داكن')
      : 'Switch theme to ' + (state.theme === 'dark' ? 'Light' : 'Dark'));
    $('#langBtn').textContent = state.lang === 'ar' ? 'English' : 'العربية';
    $('#langBtn').setAttribute('aria-label', state.lang === 'ar'
      ? 'تبديل اللغة إلى English'
      : 'Switch language to العربية');

    $('#heroEyebrow').textContent = state.lang === 'ar' ? 'تطبيق عملي موجّه' : 'Guided practical';
    $('#heroTitle').textContent = state.lang === 'ar'
      ? 'اجمع دليلًا واحدًا واضحًا في كل مرة'
      : 'Collect one clear piece of evidence at a time';
    $('#heroOutcome').textContent = t(LAB.meta.outcome);

    $('#planTitle').textContent = state.lang === 'ar' ? 'خطة الحصة' : 'Session plan';
    $('#planTotal').textContent = t(LAB.meta.duration);

    $('#progressLabel').textContent = state.lang === 'ar' ? 'التقدّم' : 'Progress';
    $('#principleTitle').textContent = state.lang === 'ar' ? 'مبدأ الجمع' : 'Collection principle';
    $('#principleText').textContent = state.lang === 'ar'
      ? 'ابدأ بما قد يختفي أولًا. اجعل كل نتيجة صغيرة بما يكفي لشرحها.'
      : 'Start with what can disappear first. Keep every result small enough to explain.';

    $('#noticeTitle').textContent = state.lang === 'ar' ? 'حدود اللاب:' : 'Lab boundary:';
    $('#noticeText').textContent = state.lang === 'ar'
      ? 'استخدم جهازًا افتراضيًا أو جهاز اختبار مخصص. خطوات الجمع البعيد تفترض وجود جهاز ويندوز ثانٍ يجهّزه المدرّس. لا تُشغّل هذه الأوامر على أجهزة إنتاج أبدًا.'
      : 'Use a VM or a dedicated test machine. The remote steps assume a second Windows VM prepared by the instructor. Never run these commands on production devices.';

    $('#volatilityTitle').textContent = state.lang === 'ar' ? 'ترتيب التطاير' : 'Order of volatility';
    $('#volatilityNote').textContent = state.lang === 'ar'
      ? 'اجمع من أكثر الأدلة هشاشة إلى أكثرها ديمومة. اختر أي مستوى للانتقال إلى الخطوات التي تغطّيه.'
      : 'Collect from the most fragile evidence to the most persistent. Select a tier to jump to the steps that cover it.';

    $('#toolsTitle').textContent = state.lang === 'ar'
      ? 'أدوات قليلة تغطي العرض كله'
      : 'A small toolset covers the whole demonstration';
    $('#toolsNote').textContent = state.lang === 'ar'
      ? 'التزم بمسار أساسي واحد، ولا تقدّم الأدوات الاختيارية إلا بعد أن يعمل المسار الأساسي بنجاح.'
      : 'Keep one primary path and introduce optional tools only after the core workflow works.';

    $('#compareTitle').textContent = state.lang === 'ar'
      ? 'المحلي والبعيد يجيبان على أسئلة مختلفة'
      : 'Local and remote answer different questions';
    $('#compareNote').textContent = state.lang === 'ar'
      ? 'فئات الأدلة تبقى كما هي. القيود التشغيلية هي ما يتغيّر.'
      : 'The evidence categories stay the same. The operating constraints change.';

    $('#cmpHeadKey').textContent = state.lang === 'ar' ? 'البُعد' : 'Dimension';
    $('#cmpHeadLocal').textContent = state.lang === 'ar' ? 'الجمع المحلي' : 'Local collection';
    $('#cmpHeadRemote').textContent = state.lang === 'ar' ? 'الجمع البعيد' : 'Remote collection';

    $('#bundleTitle').textContent = state.lang === 'ar' ? 'أنشئ سجل الجمع' : 'Build the collection log';
    $('#bundleNote').textContent = state.lang === 'ar'
      ? 'كل صف يحتاج وقتًا ومحللًا وجهازًا وأمرًا ومخرجًا وبصمة وقيدًا. املأ الحقول أدناه، ضع علامة على كل خطوة تنتهي منها، ثم صدّر ملف CSV مباشرة إلى مجلد القضية.'
      : 'Every row needs a timestamp, an analyst, a host, a command, an output, a hash and a limitation. Fill the fields below, tick the steps as you finish them, then export the CSV straight into your case folder.';

    $('#analystLabel').textContent = state.lang === 'ar' ? 'المحلل' : 'Analyst';
    $('#hostLabel').textContent = state.lang === 'ar' ? 'الجهاز المحلي' : 'Local host';
    $('#targetLabel').textContent = state.lang === 'ar' ? 'الهدف البعيد' : 'Remote target';
    $('#thTime').textContent = state.lang === 'ar' ? 'الوقت (UTC)' : 'Timestamp (UTC)';
    $('#thOutput').textContent = state.lang === 'ar' ? 'المخرج' : 'Output';
    $('#thHash').textContent = state.lang === 'ar' ? 'SHA-256' : 'SHA-256';
    $('#thLimit').textContent = state.lang === 'ar' ? 'القيد' : 'Limitation';
    $('#exportLabel').textContent = state.lang === 'ar' ? 'صدّر collection-log.csv' : 'Export collection-log.csv';
    $('#copyCsv').textContent = state.lang === 'ar' ? 'انسخ السجل' : 'Copy log';
    $('#resetBtn').textContent = state.lang === 'ar' ? 'أعد ضبط التقدّم' : 'Reset progress';

    $('#deliverTitle').textContent = state.lang === 'ar' ? 'قدّم حزمة أدلة قابلة للدفاع عنها' : 'Submit a defensible evidence bundle';
    $('#deliverNote').textContent = state.lang === 'ar'
      ? 'التسليم يُقيَّم على الشرح والسجل، لا على حجم مجلد المخرجات.'
      : 'The submission is graded on the explanation and the log, not on the size of the output folder.';
    $('#quizTitle').textContent = state.lang === 'ar' ? 'مراجعة ذاتية' : 'Self-check';

    $('#footLeft').textContent = state.lang === 'ar' ? 'مرشد أوامر DFIR' : 'DFIR Command Coach';
    $('#footRight').textContent = state.lang === 'ar'
      ? 'لاب محلي • Windows PowerShell • مناسب للمبتدئين'
      : 'Local lab • Windows PowerShell • Beginner friendly';
  }

  function renderObjectives() {
    $('#objectives').innerHTML = LAB.objectives.map(function (o) {
      return '<li><span>' + rich(t(o)) + '</span></li>';
    }).join('');
  }

  function renderPlan() {
    $('#planList').innerHTML = LAB.plan.map(function (p, i) {
      return '<li><span class="i">' + String(i + 1).padStart(2, '0') + '</span>' +
             '<span>' + rich(t(p.t)) + '</span>' +
             '<span class="m">' + esc(t(p.m)) + '</span></li>';
    }).join('');

    $('#heroFacts').innerHTML =
      '<div><dt>' + (state.lang === 'ar' ? 'المدة' : 'Duration') + '</dt><dd>' + esc(t(LAB.meta.duration)) + '</dd></div>' +
      '<div><dt>' + (state.lang === 'ar' ? 'المستوى' : 'Level') + '</dt><dd>' + esc(t(LAB.meta.level)) + '</dd></div>' +
      '<div><dt>' + (state.lang === 'ar' ? 'البيئة' : 'Environment') + '</dt><dd>' + esc(t(LAB.meta.shell)) + '</dd></div>';
  }

  function renderLadder() {
    $('#ladder').innerHTML = LAB.volatility.map(function (v, i) {
      var ids = (v.steps || []).map(function (id) { return 'data-jump="' + id + '"'; }).join(' ');
      return '<li>' +
        '<button type="button" class="ladder-btn" ' + ids + '>' +
          '<span class="tier">' + (i + 1) + '</span>' +
          '<span class="body"><span class="name">' + esc(t(v.label)) + '</span>' +
          '<span class="note"> — ' + esc(t(v.note)) + '</span></span>' +
          '<span class="jump">' + (state.lang === 'ar' ? 'الخطوات ←' : 'steps →') + '</span>' +
          '<span class="desc">' + esc(t(v.desc)) + '</span>' +
        '</button>' +
        '</li>';
    }).join('');

    $$('#ladder .ladder-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-jump');
        if (!id) return;
        var target = document.getElementById('step-' + id);
        if (!target) return;
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.classList.remove('flash');
        void target.offsetWidth;
        target.classList.add('flash');
      });
    });
  }

  function renderTools() {
    $('#toolGrid').innerHTML = LAB.tools.map(function (tool) {
      var tagCls = tool.tag === 'primary' ? 't-tag-primary' : tool.tag === 'scale' ? 't-tag-scale' : 't-tag-optional';
      return '<article class="tool">' +
        '<div class="t-top"><span class="t-name">' + esc(tool.name) + '</span>' +
        '<span class="t-tag ' + tagCls + '">' + esc(tool.tag) + '</span></div>' +
        '<div class="t-role">' + esc(t(tool.role)) + '</div>' +
        '<div class="t-note">' + esc(t(tool.note)) + '</div>' +
        '<a href="' + esc(tool.link) + '" target="_blank" rel="noopener noreferrer">Official reference ↗</a>' +
        '</article>';
    }).join('');
  }

  function renderCompare() {
    $('#compareBody').innerHTML = LAB.comparison.map(function (row) {
      return '<tr><th scope="row">' + esc(t(row.k)) + '</th>' +
             '<td>' + esc(t(row.local)) + '</td>' +
             '<td>' + esc(t(row.remote)) + '</td></tr>';
    }).join('');
  }

  function renderDeliverables() {
    $('#deliverList').innerHTML = LAB.deliverables.map(function (d) {
      return '<li><span>' + rich(t(d)) + '</span></li>';
    }).join('');

    $('#quizList').innerHTML = LAB.quiz.map(function (q, i) {
      return '<details class="quiz-item"><summary><span class="q-n">Q' + (i + 1) + '</span>' +
             '<span>' + rich(t(q.q)) + '</span></summary>' +
             '<div class="a">' + rich(t(q.a)) + '</div></details>';
    }).join('');
  }

  /* ------------------------------------------------------- step cards */
  var VOL_LABEL = {
    volatile: { en: 'Volatile', ar: 'متطاير' },
    persistent: { en: 'Persistent', ar: 'دائم' },
    preserve: { en: 'Preserve', ar: 'حفظ' },
    remote: { en: 'Remote', ar: 'بعيد' },
    context: { en: 'Context', ar: 'سياق' },
    concept: { en: 'Concept', ar: 'مفهوم' }
  };

  function stepCard(step, index) {
    var n = String(index + 1).padStart(2, '0');
    var vol = step.volatility || 'concept';
    var volLabel = t(VOL_LABEL[vol] || VOL_LABEL.concept);

    var commandBlock = '';
    if (step.command) {
      commandBlock =
        '<div class="cmd">' +
          '<div class="cmd-bar">' +
            '<span class="lang">PowerShell</span>' +
            '<span class="spacer"></span>' +
            '<button type="button" class="mini" data-copy="' + step.id + '">Copy</button>' +
          '</div>' +
          '<pre><code>' + highlightPS(step.command) + '</code></pre>' +
        '</div>';
    }

    var expectBlock = '';
    if (step.output) {
      expectBlock =
        '<details class="expect"><summary>' +
        (state.lang === 'ar' ? 'المتوقّع من النتيجة' : 'Expected result') +
        '</summary><div class="inner">' + rich(t(step.output)) + '</div></details>';
    }

    var gotchasBlock = '';
    if (step.gotchas && step.gotchas.length) {
      gotchasBlock =
        '<div class="gotchas"><h4>' + (state.lang === 'ar' ? 'انتبه' : 'Watch out') + '</h4><ul>' +
        step.gotchas.map(function (g) { return '<li>' + rich(t(g)) + '</li>'; }).join('') +
        '</ul></div>';
    }

    var teacherBlock = '';
    if (step.teacher) {
      teacherBlock =
        '<details class="teacher"><summary>' +
        (state.lang === 'ar' ? 'ملاحظة للمدرّس' : 'Instructor note') +
        '</summary><div class="inner">' + rich(t(step.teacher)) + '</div></details>';
    }

    var artBlock = '';
    if (step.artifacts && step.artifacts.length) {
      artBlock = '<div class="artifacts">' + step.artifacts.map(function (a) {
        return '<span>' + esc(a) + '</span>';
      }).join('') + '</div>';
    }

    var logBlock =
      '<details class="logit"><summary>' + (state.lang === 'ar' ? 'سجّل هذا الإجراء' : 'Log this action') +
      '</summary><div class="inner">' +
        '<label class="row"><span>' + (state.lang === 'ar' ? 'ملف المخرج' : 'Output file') + '</span>' +
        '<input type="text" data-note="output" data-id="' + step.id + '" placeholder="' +
        esc((step.artifacts && step.artifacts[0]) || (state.lang === 'ar' ? 'مثال: processes.csv' : 'e.g. processes.csv')) + '"></label>' +
        '<label class="row"><span>' + (state.lang === 'ar' ? 'بصمة SHA-256' : 'SHA-256') + '</span>' +
        '<input type="text" data-note="hash" data-id="' + step.id + '" placeholder="' +
        (state.lang === 'ar' ? 'اختياري' : 'optional') + '"></label>' +
        '<label class="row"><span>' + (state.lang === 'ar' ? 'القيد' : 'Limitation') + '</span>' +
        '<input type="text" data-note="limitation" data-id="' + step.id + '" placeholder="' +
        (state.lang === 'ar' ? 'مثال: تعذّر تصدير Security.evtx' : 'e.g. Security.evtx could not be exported') + '"></label>' +
      '</div></details>';

    return '' +
      '<article class="step" id="step-' + step.id + '" data-id="' + step.id + '" data-phase="' + step.phase + '" data-vol="' + vol + '">' +
        '<div class="step-head">' +
          '<div>' +
            '<div class="step-eyebrow">' +
              '<span class="step-num">STEP ' + n + '</span>' +
              '<span class="vol-badge vol-' + vol + '">' + esc(volLabel) + '</span>' +
              (step.required === false ? '<span class="step-opt">' + (state.lang === 'ar' ? 'اختياري' : 'optional') + '</span>' : '') +
            '</div>' +
            '<h3 class="step-title">' + esc(t(step.title)) + '</h3>' +
            '<p class="step-intent">' + rich(t(step.intent)) + '</p>' +
          '</div>' +
          '<label class="done-toggle">' +
            '<input type="checkbox" data-done="' + step.id + '">' +
            '<span class="box" aria-hidden="true"></span>' +
            '<span>' + (state.lang === 'ar' ? 'تم' : 'Done') + '</span>' +
          '</label>' +
        '</div>' +
        '<div class="step-body">' +
          '<div class="why"><h4>' + (state.lang === 'ar' ? 'لماذا يهمّ' : 'Why this matters') + '</h4>' +
            '<p>' + rich(t(step.purpose)) + '</p></div>' +
          commandBlock +
          artBlock +
          expectBlock +
          gotchasBlock +
          teacherBlock +
          logBlock +
        '</div>' +
      '</article>';
  }

  function renderPhases() {
    var root = $('#phaseRoot');
    var html = '';
    var index = 0;
    LAB.phases.forEach(function (phase) {
      var steps = LAB.steps.filter(function (s) { return s.phase === phase.id; });
      if (!steps.length) return;
      html +=
        '<section class="phase-block" id="phase-' + phase.id + '" data-phase="' + phase.id + '">' +
          '<div class="phase-head">' +
            '<span class="n">' + phase.n + '</span>' +
            '<h2>' + esc(t(phase.label)) + '</h2>' +
            '<span class="clock">' + esc(t(phase.clock)) + '</span>' +
            '<p class="desc">' + esc(t(phase.desc)) + '</p>' +
          '</div>' +
          '<div class="step-grid">' + steps.map(function (s) { return stepCard(s, index++); }).join('') + '</div>' +
        '</section>';
    });
    root.innerHTML = html;
  }

  function renderNav() {
    var html = '<button type="button" class="nav-item active" data-nav="all">' +
      '<span class="n">00</span><span class="t">' + (state.lang === 'ar' ? 'كل الخطوات' : 'All steps') + '</span>' +
      '<span class="c" data-navcount="all"></span></button>';

    LAB.phases.forEach(function (phase) {
      var steps = LAB.steps.filter(function (s) { return s.phase === phase.id; });
      html += '<button type="button" class="nav-item" data-nav="' + phase.id + '">' +
        '<span class="n">' + phase.n + '</span>' +
        '<span class="t">' + esc(t(phase.label)) + '</span>' +
        '<span class="c" data-navcount="' + phase.id + '"></span></button>';
    });
    $('#phaseNav').innerHTML = html;

    $$('#phaseNav .nav-item').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.activePhase = btn.dataset.nav;
        $$('#phaseNav .nav-item').forEach(function (b) { b.classList.toggle('active', b === btn); });
        applyFilter();
      });
    });
  }

  /* -------------------------------------------------------- filtering */
  function matches(step) {
    if (state.activePhase !== 'all' && step.phase !== state.activePhase) return false;
    if (!state.query) return true;

    var q = state.query.toLowerCase();
    var haystack = [
      t(step.title), t(step.intent), t(step.purpose), t(step.output),
      step.command || '', (step.artifacts || []).join(' '), step.id
    ].join(' ').toLowerCase();

    return haystack.indexOf(q) !== -1;
  }

  function applyFilter() {
    var visible = 0;
    LAB.steps.forEach(function (step) {
      var el = document.getElementById('step-' + step.id);
      if (!el) return;
      var ok = matches(step);
      el.classList.toggle('hidden', !ok);
      if (ok) visible++;
    });

    $$('.phase-block').forEach(function (block) {
      var any = $$('.step', block).some(function (s) { return !s.classList.contains('hidden'); });
      block.style.display = any ? '' : 'none';
    });

    var counter = $('#searchCount');
    if (counter) {
      counter.textContent = state.query ? visible + '/' + LAB.steps.length : '';
    }
  }

  /* ---------------------------------------------------------- progress */
  function updateProgress() {
    var total = LAB.steps.length;
    var doneCount = LAB.steps.filter(function (s) { return !!state.done[s.id]; }).length;
    var pct = total ? Math.round((doneCount / total) * 100) : 0;

    var circumference = 119.4;
    $('#ringFill').style.strokeDashoffset = String(circumference - (pct / 100) * circumference);
    $('#ringPct').textContent = pct + '%';
    $('#progressRing').setAttribute('aria-valuenow', String(pct));
    $('#progressCount').textContent = doneCount + ' / ' + total;

    LAB.phases.forEach(function (phase) {
      var steps = LAB.steps.filter(function (s) { return s.phase === phase.id; });
      var d = steps.filter(function (s) { return !!state.done[s.id]; }).length;
      var badge = $('[data-navcount="' + phase.id + '"]');
      if (badge) badge.textContent = d + '/' + steps.length;
      var nav = $('[data-nav="' + phase.id + '"]');
      if (nav) nav.classList.toggle('done', d === steps.length && steps.length > 0);
    });
    var allBadge = $('[data-navcount="all"]');
    if (allBadge) allBadge.textContent = doneCount + '/' + total;
  }

  /* -------------------------------------------------------- log export */
  function flattenCommand(src) {
    var lines = String(src || '')
      .split('\n')
      .map(function (line) { return line.trim(); })
      .filter(function (line) { return line && !line.startsWith('#'); });

    var out = '';
    lines.forEach(function (line, i) {
      if (i === 0) { out = line; return; }
      // A trailing pipe means the statement continues, so join with a space.
      // Otherwise it is a separate statement, so join with a semicolon.
      var continues = /\|\s*$/.test(out);
      out += (continues ? ' ' : ' ; ') + line;
    });
    return out;
  }

  function logRows() {
    return LAB.steps
      .filter(function (s) { return !!state.done[s.id]; })
      .map(function (s) {
        var note = state.notes[s.id] || {};
        var isRemote = s.phase === 'remote';
        return {
          timestamp: state.done[s.id] || '',
          analyst: state.analyst || '',
          host: isRemote ? (state.target || 'DFIR-WIN02') : (state.host || ''),
          command: flattenCommand(s.command),
          output: note.output || (s.artifacts || []).join('; '),
          hash: note.hash || '',
          limitation: note.limitation || ''
        };
      });
  }

  function renderLog() {
    var rows = logRows();
    var body = $('#logBody');

    if (!rows.length) {
      body.innerHTML = '<tr><td colspan="5" class="muted-cell">' +
        (state.lang === 'ar'
          ? 'لم تُحدَّد أي خطوة بعد. ضع علامة على الخطوات التي أنجزتها لتظهر هنا.'
          : 'No steps marked yet. Tick the steps you have completed and they will appear here.') +
        '</td></tr>';
    } else {
      body.innerHTML = rows.map(function (r, i) {
        var hash = r.hash
          ? '<span class="hash-cell">' + esc(r.hash) + '</span>'
          : '<span class="muted-cell">' + (state.lang === 'ar' ? 'لم يُسجَّل' : 'not recorded') + '</span>';
        var limit = r.limitation
          ? esc(r.limitation)
          : '<span class="muted-cell">' + (state.lang === 'ar' ? '—' : '—') + '</span>';
        return '<tr>' +
          '<td>' + (i + 1) + '</td>' +
          '<td class="muted-cell">' + esc(r.timestamp) + '</td>' +
          '<td>' + esc(r.output) + '</td>' +
          '<td>' + hash + '</td>' +
          '<td>' + limit + '</td>' +
          '</tr>';
      }).join('');
    }

    $('#bundleMeta').textContent = (state.lang === 'ar' ? 'عدد الصفوف: ' : 'Rows: ') + rows.length;
  }

  function toCSV(rows) {
    var headers = ['timestamp', 'analyst', 'host', 'command', 'output', 'hash', 'limitation'];
    function cell(v) {
      var s = String(v === undefined || v === null ? '' : v);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    }
    var lines = [headers.join(',')];
    rows.forEach(function (r) {
      lines.push(headers.map(function (h) { return cell(r[h]); }).join(','));
    });
    return lines.join('\r\n');
  }

  function exportCSV() {
    var rows = logRows();
    if (!rows.length) {
      toast(state.lang === 'ar' ? 'حدّد خطوة واحدة على الأقل أولًا' : 'Mark at least one step first');
      return;
    }
    var csv = '\ufeff' + toCSV(rows);   // BOM keeps Excel happy with UTF-8
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'collection-log.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    toast(state.lang === 'ar' ? 'تم تنزيل collection-log.csv' : 'collection-log.csv downloaded');
  }

  /* ------------------------------------------------------------ events */
  function wireEvents() {
    /* copy buttons */
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-copy]');
      if (!btn) return;
      var step = STEP_BY_ID[btn.dataset.copy];
      if (!step) return;
      copyText(step.command).then(function () {
        btn.textContent = state.lang === 'ar' ? 'تم النسخ ✓' : 'Copied ✓';
        btn.classList.add('ok');
        setTimeout(function () {
          btn.textContent = 'Copy';
          btn.classList.remove('ok');
        }, 1600);
      }).catch(function () {
        toast(state.lang === 'ar' ? 'تعذّر النسخ' : 'Copy failed');
      });
    });

    /* step completion */
    document.addEventListener('change', function (e) {
      var box = e.target.closest('[data-done]');
      if (box) {
        var id = box.dataset.done;
        if (box.checked) {
          state.done[id] = new Date().toISOString();
          box.closest('.step').classList.add('done');
        } else {
          delete state.done[id];
          box.closest('.step').classList.remove('done');
        }
        save();
        updateProgress();
        renderLog();
        return;
      }

      var note = e.target.closest('[data-note]');
      if (note) {
        var sid = note.dataset.id;
        var field = note.dataset.note;
        state.notes[sid] = state.notes[sid] || { output: '', hash: '', limitation: '' };
        state.notes[sid][field] = note.value;
        save();
        renderLog();
      }
    });

    /* note fields also save while typing, so nothing is lost if the student
       clicks Export straight after entering a hash */
    document.addEventListener('input', function (e) {
      var note = e.target.closest('[data-note]');
      if (!note) return;
      var sid = note.dataset.id;
      var field = note.dataset.note;
      state.notes[sid] = state.notes[sid] || { output: '', hash: '', limitation: '' };
      state.notes[sid][field] = note.value;
      save();
      renderLog();
    });

    /* identity fields */
    [['#analyst', 'analyst'], ['#host', 'host'], ['#target', 'target']].forEach(function (pair) {
      var input = $(pair[0]);
      input.value = state[pair[1]] || '';
      input.addEventListener('input', function () {
        state[pair[1]] = input.value;
        save();
        renderLog();
      });
    });

    /* export + copy the collection log */
    $('#exportCsv').addEventListener('click', exportCSV);

    $('#copyCsv').addEventListener('click', function () {
      var rows = logRows();
      if (!rows.length) {
        toast(state.lang === 'ar' ? 'حدّد خطوة واحدة على الأقل أولًا' : 'Mark at least one step first');
        return;
      }
      copyText(toCSV(rows)).then(function () {
        toast(state.lang === 'ar' ? 'تم نسخ السجل' : 'Collection log copied');
      }).catch(function () {
        toast(state.lang === 'ar' ? 'تعذّر النسخ' : 'Copy failed');
      });
    });

    /* language */
    $('#langBtn').addEventListener('click', function () {
      state.lang = state.lang === 'en' ? 'ar' : 'en';
      save();
      renderAll();
      toast(state.lang === 'ar' ? 'تم التبديل إلى العربية' : 'Switched to English');
    });

    /* theme */
    $('#themeBtn').addEventListener('click', function () {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      save();
      renderChrome();
    });

    /* print */
    $('#printBtn').addEventListener('click', function () { window.print(); });

    /* reset */
    $('#resetBtn').addEventListener('click', function () {
      if (!window.confirm(state.lang === 'ar'
        ? 'سيتم مسح كل التقدّم والملاحظات. هل تريد المتابعة؟'
        : 'This clears all progress and notes. Continue?')) return;
      state.done = {};
      state.notes = {};
      save();
      $$('[data-done]').forEach(function (b) { b.checked = false; b.closest('.step').classList.remove('done'); });
      $$('[data-note]').forEach(function (i) { i.value = ''; });
      updateProgress();
      renderLog();
      toast(state.lang === 'ar' ? 'تم إعادة الضبط' : 'Progress reset');
    });

    /* search */
    var search = $('#search');
    search.addEventListener('input', function () {
      state.query = search.value.trim();
      applyFilter();
    });

    /* keyboard shortcuts */
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && document.activeElement !== search) {
        e.preventDefault();
        search.focus();
        search.select();
      }
      if ((e.key === 'p' || e.key === 'P') && !e.metaKey && !e.ctrlKey &&
          document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        window.print();
      }
      if (e.key === 'Escape' && document.activeElement === search) {
        search.value = '';
        state.query = '';
        applyFilter();
        search.blur();
      }
    });
  }

  /* ---------------------------------------------------------- restore */
  function restoreUI() {
    $$('[data-done]').forEach(function (box) {
      if (state.done[box.dataset.done]) {
        box.checked = true;
        box.closest('.step').classList.add('done');
      }
    });
    $$('[data-note]').forEach(function (input) {
      var note = state.notes[input.dataset.id];
      if (note) input.value = note[input.dataset.note] || '';
    });
  }

  /* ------------------------------------------------------------- boot */
  function renderAll() {
    renderChrome();
    renderObjectives();
    renderPlan();
    renderLadder();
    renderTools();
    renderCompare();
    renderDeliverables();
    renderPhases();
    renderNav();
    restoreUI();
    updateProgress();
    renderLog();
    applyFilter();
  }

  function boot() {
    load();
    if (!state.lang) state.lang = 'en';
    if (!state.theme) state.theme = 'dark';
    // Bind first: a rendering error must never leave the page inert.
    wireEvents();
    try {
      renderAll();
    } catch (err) {
      console.error('Render failed:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
