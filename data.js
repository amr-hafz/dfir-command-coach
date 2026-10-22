/* ============================================================================
   DFIR Command Coach - content model
   All bilingual (EN / AR) content for the Section 04 practical lab lives here.
   Edit this file to change the lab; no need to touch index.html or app.js.
   ========================================================================== */

window.LAB = (function () {
  'use strict';

  const L = (en, ar) => ({ en: en, ar: ar });

  /* ---------------------------------------------------------------- phases */
  const phases = [
    {
      id: 'prepare',
      n: '01',
      label: L('Prepare', 'التحضير'),
      clock: L('0–10 min', '٠–١٠ د'),
      desc: L(
        'Decide the power state, open an elevated shell, and create the case folder before touching any evidence.',
        'حدّد حالة تشغيل الجهاز، وافتح نافذة PowerShell مرتفعة الصلاحية، وأنشئ مجلد القضية قبل لمس أي دليل.'
      )
    },
    {
      id: 'volatile',
      n: '02',
      label: L('Volatile evidence', 'الأدلة المتطايرة'),
      clock: L('10–30 min', '١٠–٣٠ د'),
      desc: L(
        'Collect the fragile evidence first: running processes, live connections, and RAM.',
        'اجمع الأدلة الهشة أولًا: العمليات الجارية، والاتصالات المفتوحة، وذاكرة الوصول العشوائي.'
      )
    },
    {
      id: 'persistent',
      n: '03',
      label: L('Persistent artifacts', 'الآثار الدائمة'),
      clock: L('30–45 min', '٣٠–٤٥ د'),
      desc: L(
        'Collect what survives a reboot: event logs, host identity, drive information, and targeted files.',
        'اجمع ما يبقى بعد إعادة التشغيل: سجلات الأحداث، وهوية الجهاز، ومعلومات الأقراص، وملفات محددة.'
      )
    },
    {
      id: 'preserve',
      n: '04',
      label: L('Preserve & verify', 'الحفظ والتحقق'),
      clock: L('45–55 min', '٤٥–٥٥ د'),
      desc: L(
        'Hash every output, build the collection log, and confirm the bundle another analyst could reproduce.',
        'احسب بصمة (Hash) لكل مخرجات، وأنشئ سجل الجمع، وتأكد أن الحزمة قابلة للتكرار من محلل آخر.'
      )
    },
    {
      id: 'remote',
      n: '05',
      label: L('Remote collection', 'الجمع عن بُعد'),
      clock: L('55–75 min', '٥٥–٧٥ د'),
      desc: L(
        'Repeat the same questions against DFIR-WIN02 with PowerShell Remoting, and record what changes.',
        'كرّر نفس الأسئلة على DFIR-WIN02 باستخدام PowerShell Remoting، وسجّل ما يتغيّر في النتائج.'
      )
    },
    {
      id: 'close',
      n: '06',
      label: L('Deliver & reflect', 'التسليم والمراجعة'),
      clock: L('75–90 min', '٧٥–٩٠ د'),
      desc: L(
        'Package the case, write the limitation note, and answer the self-check questions.',
        'جهّز حزمة القضية، واكتب ملاحظة القيود، وأجب عن أسئلة المراجعة الذاتية.'
      )
    }
  ];

  /* ------------------------------------------------------------------ steps */
  const steps = [
    /* ---- PHASE 1 : PREPARE ------------------------------------------- */
    {
      id: 'power-state',
      phase: 'prepare',
      kind: 'concept',
      volatility: 'concept',
      required: true,
      title: L('Decide the power state first', 'أولًا: حدّد حالة تشغيل الجهاز'),
      intent: L(
        'Before running anything, decide whether the machine is running or powered off.',
        'قبل تشغيل أي أمر، حدّد هل الجهاز يعمل أم أنه مُطفأ.'
      ),
      purpose: L(
        'A running device still holds RAM, open connections and running processes. A powered-off device must not be started casually — booting writes a new operating-system state onto the disk and can destroy the original evidence.',
        'الجهاز العامل ما زال يحمل الذاكرة والاتصالات المفتوحة والعمليات الجارية. أما الجهاز المطفأ فلا يُشغَّل عشوائيًا — فالإقلاع يكتب حالة نظام جديدة على القرص وقد يدمّر الدليل الأصلي.'
      ),
      output: L(
        'Record one line: <code>Power state = ON | OFF</code> plus the reason for the decision.',
        'سجّل سطرًا واحدًا: <code>Power state = ON | OFF</code> مع سبب القرار.'
      ),
      gotchas: [
        L(
          'A photo of the screen is context, not evidence — take it anyway and log it.',
          'صورة الشاشة هي سياق وليس دليلًا — خُذها على أي حال وسجّلها.'
        ),
        L(
          'Log the exact time of the decision, not just the date.',
          'سجّل وقت القرار بدقّة، وليس التاريخ فقط.'
        )
      ],
      teacher: L(
        'Tie this to the deck: "the first question is not which tool is easiest, it is which evidence will disappear first". Have one student state the power state of the lab VM before the session starts.',
        'اربط هذه النقطة بالعرض التقديمي: «السؤال الأول ليس أي أداة هي الأسهل، بل أي دليل سيختفي أولًا». اطلب من طالب أن يذكر حالة تشغيل جهاز اللاب قبل بدء الجلسة.'
      ),
      artifacts: []
    },
    {
      id: 'elevated-shell',
      phase: 'prepare',
      kind: 'concept',
      volatility: 'concept',
      required: true,
      title: L('Open an elevated PowerShell', 'افتح PowerShell بصلاحيات المرشد'),
      intent: L(
        'Most collection commands need administrator rights. Check it once, at the start.',
        'معظم أوامر الجمع تحتاج صلاحيات مدير. تحقق منها مرة واحدة في البداية.'
      ),
      purpose: L(
        'Event log export, RAM capture and WinRM all fail without elevation. Checking once at the start avoids a broken step in the middle of the lab.',
        'تصدير سجلات الأحداث، والتقاط الذاكرة، وWinRM كلها تفشل بدون صلاحيات مرتفعة. التحقق مرة واحدة في البداية يمنع تعطّل خطوة في منتصف اللاب.'
      ),
      output: L(
        'The title bar should read <code>Administrator: Windows PowerShell</code>.',
        'يجب أن يظهر في شريط العنوان <code>Administrator: Windows PowerShell</code>.'
      ),
      gotchas: [
        L(
          'Right-click PowerShell → Run as administrator, then accept the UAC prompt.',
          'كليك يمين على PowerShell ← Run as administrator، ثم اقبل نافذة UAC.'
        ),
        L(
          'If UAC is blocked by policy, ask the instructor instead of guessing.',
          'إذا كانت UAC محجوبة من قّبل سياسات النظام، اسأل المدرّس بدلًا من التخمين.'
        )
      ],
      teacher: L(
        'Verify elevation on every station before you begin. A single misconfigured VM can eat ten minutes of class time.',
        'تأكد من رفع الصلاحية على كل جهاز قبل البدء. جهاز واحد غير مضبوط قد يستهلك عشر دقائق من وقت المحاضرة.'
      ),
      artifacts: []
    },
    {
      id: 'case-context',
      phase: 'prepare',
      kind: 'command',
      volatility: 'context',
      required: true,
      title: L('Create the case folder and record the context', 'أنشئ مجلد القضية وسجّل السياق'),
      intent: L(
        'Every result needs a home and a context line: which machine, which user, which time.',
        'كل نتيجة تحتاج إلى مكان واضح وسطر سياق: أي جهاز، وأي مستخدم، وأي وقت.'
      ),
      purpose: L(
        'A file with no host, analyst and timestamp cannot be tied back to an incident. Creating the case folder first also guarantees that outputs never land on the Desktop or in a temp folder that gets wiped.',
        'الملف الذي لا يحمل اسم الجهاز ولا المحلل ولا الوقت لا يمكن ربطه بحدث. وإنشاء مجلد القضية أولًا يضمن ألا تصل المخرجات إلى سطح المكتب أو مجلد مؤقت يُمحى.'
      ),
      command:
        '$Case = "C:\\DFIR-Lab\\Case01"\n' +
        'New-Item -ItemType Directory -Path $Case -Force | Out-Null\n' +
        '\n' +
        '# Context line for the log\n' +
        'hostname\n' +
        'whoami\n' +
        'Get-Date -Format "yyyy-MM-dd HH:mm:ss K"\n' +
        '\n' +
        '# Optional: save it next to the evidence\n' +
        '"Computer: $(hostname)  User: $(whoami)  Time: $(Get-Date -Format o)" |\n' +
        '  Out-File "$Case\\context.txt"',
      output: L(
        'One computer name, one <code>DOMAIN\\user</code>, one timestamp with a UTC offset.',
        'اسم جهاز واحد، و<code>DOMAIN\\user</code> واحد، وطابع زمني واحد بفارق التوقيت.'
      ),
      gotchas: [
        L(
          '<code>New-Item ... -Force</code> is safe to repeat — it will not delete an existing case folder.',
          '<code>New-Item ... -Force</code> آمن للتكرار — لن يحذف مجلد قضية موجودًا.'
        ),
        L(
          'Use UTC for the log, local time only for display. Mixing them is a common timeline error.',
          'استخدم التوقيت العالمي UTC في السجل، والوقت المحلي للعرض فقط. الخلط بينهما خطأ شائع في بناء الخط الزمني.'
        )
      ],
      teacher: L(
        'Show the difference between $env:USERNAME (local only) and whoami (domain aware). Add "Analyst" to the context line verbally — the collection log needs it.',
        'وضّح الفرق بين $env:USERNAME (محلي فقط) و whoami (يعرف الدومين). أضف اسم "المحلل" إلى سطر السياق شفهيًا — سجل الجمع يحتاجه.'
      ),
      artifacts: ['context.txt']
    },
    {
      id: 'synthetic-activity',
      phase: 'prepare',
      kind: 'command',
      volatility: 'context',
      required: true,
      title: L('Create the synthetic activity', 'أنشئ النشاط التجريبي'),
      intent: L(
        'Make one visible, harmless action that you can later observe and investigate.',
        'أنشئ إجراءً واحدًا مرئيًا وغير ضار يمكنك ملاحظته والتحقيق فيه لاحقًا.'
      ),
      purpose: L(
        'You need a known ground truth. Without something you deliberately created, you cannot tell whether a later output proves anything or only shows what was always on the machine.',
        'تحتاج إلى حقيقة معروفة. بدون شيء أنشأته أنت، لن تستطيع تمييز ما إذا كانت النتيجة اللاحقة دليلًا حقيقيًا أم مجرد عرض لما كان موجودًا أصلًا.'
      ),
      command:
        'Set-Content "$env:USERPROFILE\\Desktop\\lab-note.txt" "Synthetic DFIR lab note"\n' +
        'Start-Process notepad "$env:USERPROFILE\\Desktop\\lab-note.txt"',
      output: L(
        'Notepad opens on the Desktop containing the text <code>Synthetic DFIR lab note</code>. A file now exists on disk and a process is live in RAM.',
        'يفتح Notepad على سطح المكتب ويحتوي على النص <code>Synthetic DFIR lab note</code>. الآن يوجد ملف على القرص وعملية حيّة في الذاكرة.'
      ),
      gotchas: [
        L(
          'Never use real malware in a classroom lab — a text file and Notepad teach the same mechanics safely.',
          'لا تستخدم برامج ضارة حقيقية في لاب الصف — ملف نصي و Notepad يعلّمان نفس الآلية بأمان.'
        ),
        L(
          'Leave Notepad open for now. Step 06 proves live state; closing it proves volatility.',
          'اترك Notepad مفتوحًا الآن. الخطوة ٠٦ تثبت الحالة الحية، وإغلاقها يثبت التطاير.'
        )
      ],
      teacher: L(
        'Ask the class to predict, before the next step, which artifacts will show the file and which will show the process.',
        'اطلب من الصف أن يتوقعوا قبل الخطوة التالية أي المخرجات ستظهر الملف، وأيها ستظهر العملية.'
      ),
      artifacts: ['Desktop\\lab-note.txt']
    },

    /* ---- PHASE 2 : VOLATILE ------------------------------------------ */
    {
      id: 'processes',
      phase: 'volatile',
      kind: 'command',
      volatility: 'volatile',
      required: true,
      title: L('Capture the running process table', 'التقط جدول العمليات الجارية'),
      intent: L(
        'Record what was executing on the host, with CPU time and memory use.',
        'سجّل ما كان يعمل على الجهاز، مع زمن المعالج واستهلاك الذاكرة.'
      ),
      purpose: L(
        'The process table is the classic volatile artifact. It answers "what was running at the time of the incident" — and it changes every second, so it must be collected before anything else.',
        'جدول العمليات هو الدليل المتطاير الكلاسيكي. يجيب على سؤال «ما الذي كان يعمل وقت الحادث»، وهو يتغيّر كل ثانية، لذا يجب جمعه قبل أي شيء آخر.'
      ),
      command:
        'Get-Process | Sort-Object CPU -Descending |\n' +
        '  Select-Object -First 20 ProcessName,Id,CPU,\n' +
        '    @{Name="RAM_MB";Expression={[math]::Round($_.WorkingSet64/1MB,1)}} |\n' +
        '  Export-Csv "$Case\\processes.csv" -NoTypeInformation',
      output: L(
        '<code>processes.csv</code> with 20 rows: process name, PID, CPU seconds and RAM in MB. <code>notepad</code> should appear in the list.',
        'ملف <code>processes.csv</code> بـ ٢٠ صفًا: اسم العملية، وPID، وثواني المعالج، والذاكرة بالميغابايت. ومن المفترض أن تظهر <code>notepad</code> في القائمة.'
      ),
      gotchas: [
        L(
          'Sorting by CPU puts idle-but-large processes out of view. Check the RAM column too.',
          'الترتيب حسب المعالج قد يُخفي عمليات خاملة لكن كبيرة الذاكرة. راجع عمود الذاكرة أيضًا.'
        ),
        L(
          'Adding a <code>StartTime</code> column throws an access-denied error on protected processes. That is normal — keep it out of the class version.',
          'إضافة عمود <code>StartTime</code> تُنتج خطأ "access denied" على عمليات محمية. هذا طبيعي — ابقيه خارج نسخة الصف.'
        )
      ],
      teacher: L(
        'Cross-check: the notepad PID shown here is the same PID you will find in the network connections and in the memory snapshot. One incident, three artifacts, one timeline.',
        'تحقّق متقاطع: معرّف العملية (PID) لـ notepad هنا هو نفسه في الاتصالات المفتوحة وفي لقطة الذاكرة. حادثة واحدة، ثلاثة أدلة، خط زمني واحد.'
      ),
      artifacts: ['processes.csv']
    },
    {
      id: 'network',
      phase: 'volatile',
      kind: 'command',
      volatility: 'volatile',
      required: true,
      title: L('Capture live network connections', 'التقط الاتصالات الشبكية المفتوحة'),
      intent: L(
        'See every TCP connection the host currently has, and which process owns it.',
        'شاهد كل اتصال TCP مفتوح حاليًا على الجهاز، وأي عملية تملكه.'
      ),
      purpose: L(
        'Connections are volatile and they carry the "suspicious connection" from the section scenario. The OwningProcess column links the network back to the process table, which is what turns a list of IPs into an investigation.',
        'الاتصالات أدلة متطايرة، وهي تحمل "الاتصال المشبوه" من سيناريو السكشن. عمود OwningProcess يربط الشبكة بجدول العمليات، وهو ما يحوّل قائمة عناوين IP إلى تحقيق فعلي.'
      ),
      command:
        'Get-NetTCPConnection |\n' +
        '  Select-Object LocalAddress,LocalPort,RemoteAddress,RemotePort,State,OwningProcess |\n' +
        '  Export-Csv "$Case\\network.csv" -NoTypeInformation',
      output: L(
        '<code>network.csv</code> with one row per connection, including <code>State</code> values such as <code>Established</code> and <code>Listen</code>.',
        'ملف <code>network.csv</code> بصف لكل اتصال، ويحتوي على قيم <code>State</code> مثل <code>Established</code> و<code>Listen</code>.'
      ),
      gotchas: [
        L(
          'If <code>Get-NetTCPConnection</code> is not recognised, the NetTCPIP module is missing — use <code>netstat -ano</code> as the fallback and note it.',
          'إذا لم يُتعرَّف على <code>Get-NetTCPConnection</code> فوحدة NetTCPIP غير متوفرة — استخدم <code>netstat -ano</code> كبديل وسجّل ذلك.'
        ),
        L(
          'A busy lab VM shows dozens of connections. Filter first, then record: <code>... | Where-Object State -eq "Established"</code>.',
          'جهاز اللاب المزدحم يعرض عشرات الاتصالات. فلتر أولًا ثم سجّل: <code>... | Where-Object State -eq "Established"</code>.'
        ),
        L(
          'Match <code>OwningProcess</code> against the PID in <code>processes.csv</code>. That match is the analysis exercise of this step.',
          'قارن <code>OwningProcess</code> مع PID في <code>processes.csv</code>. هذه المطابقة هي تمرين التحليل في هذه الخطوة.'
        )
      ],
      teacher: L(
        'Demonstrate the matching live: sort network.csv by OwningProcess, then join mentally with processes.csv. If a class has 2–3 minutes, let students find the PID of the browser.',
          'اعرض المطابقة عمليًا: رتّب network.csv حسب OwningProcess ثم طابقه ذهنيًا مع processes.csv. لو الوقت يسمح، اترك الطلبة دقيقتين أو ثلاثًا للعثور على PID المتصفح.'
      ),
      artifacts: ['network.csv']
    },
    {
      id: 'ram-usage',
      phase: 'volatile',
      kind: 'command',
      volatility: 'volatile',
      required: true,
      title: L('Take a live memory snapshot', 'خذ لقطة حيّة للذاكرة'),
      intent: L(
        'Show which processes are using RAM right now, and prove that closing a program removes it.',
        'اعرض أي العمليات تستهلك الذاكرة الآن، وأثبت أن إغلاق برنامج يزيله من القائمة.'
      ),
      purpose: L(
        'This is a measurement of memory usage, not a forensic memory image. Its teaching value is volatility: run it, close Notepad, run it again, and watch the row disappear. That is order of volatility made visible.',
        'هذه قراءة لاستهلاك الذاكرة، وليست صورة ذاكرة جنائية. قيمتها التعليمية هي التطاير: شغّلها، أغلق Notepad، شغّلها مرة أخرى، وشاهد الصف يختفي. هذا هو ترتيب التطاير made visible.'
      ),
      command:
        'Get-Process |\n' +
        '  Sort-Object WorkingSet64 -Descending |\n' +
        '  Select-Object -First 10 ProcessName,Id,\n' +
        '    @{Name="RAM_MB";Expression={[math]::Round($_.WorkingSet64/1MB,2)}}',
      output: L(
        'Ten rows with a process name, PID and RAM in MB. Close Notepad and run it again — the <code>notepad</code> row is gone.',
        'عشرة صفوف باسم العملية وPID والذاكرة بالميغابايت. أغلق Notepad وشغّلها مرة أخرى — يختفي صف <code>notepad</code>.'
      ),
      gotchas: [
        L(
          'High RAM use is not proof of malware. It is a measurement, not a verdict.',
          'ارتفاع استهلاك الذاكرة ليس دليلًا على برنامج ضار. هذه قراءة وليست حكماً.'
        ),
        L(
          'Windows itself uses a large part of RAM. Compare like with like.',
          'نظام Windows نفسه يستهلك جزءًا كبيرًا من الذاكرة. قارن ما بالمثل.'
        )
      ],
      teacher: L(
        'This is the cheapest volatility demonstration in the lab. Do it live and in front of the class; do not skip it because it looks trivial.',
        'هذه أرخص طريقة لتوضيح التطاير داخل اللاب. نفّذها أمام الصف مباشرة ولا تتخطَّها لأنها تبدو بسيطة.'
      ),
      artifacts: []
    },
    {
      id: 'ram-image',
      phase: 'volatile',
      kind: 'command',
      volatility: 'volatile',
      required: false,
      title: L('Capture a RAM image (optional)', 'التقط صورة ذاكرة (اختياري)'),
      intent: L(
        'Optional instructor step: save the physical memory of the lab host to a file.',
        'خطوة اختيارية للمدرّس: احفظ الذاكرة الفعلية لجهاز اللاب في ملف.'
      ),
      purpose: L(
        'A memory image preserves running memory, which is the most fragile evidence class in the section. It is large, it takes time, and it changes the host — which is exactly the trade-off students must understand.',
        'صورة الذاكرة تحفظ الذاكرة الجارية، وهي أكثر فئات الأدلة هشاشة في السكشن. لكنها كبيرة، وتستغرق وقتًا، وتغيّر حالة الجهاز — وهذا بالضبط هو المفاضلة التي يجب أن يفهمها الطلبة.'
      ),
      command:
        '# Administrator PowerShell, from the folder that holds the verified binary\n' +
        '.\\winpmem_mini_x64.exe "$Case\\memory.raw"\n' +
        '\n' +
        'Get-FileHash "$Case\\memory.raw" -Algorithm SHA256 |\n' +
        '  Tee-Object "$Case\\memory.raw.sha256.txt"',
      output: L(
        '<code>memory.raw</code> the size of the installed RAM, plus a <code>memory.raw.sha256.txt</code> file containing its SHA-256.',
        'ملف <code>memory.raw</code> بحجم الذاكرة المثبّتة، مع ملف <code>memory.raw.sha256.txt</code> يحتوي بصمة SHA-256.'
      ),
      gotchas: [
        L(
          'Download WinPmem only from the official Velocidex GitHub release, and verify the hash of the download itself.',
          'نزّل WinPmem من إصدار GitHub الرسمي لـ Velocidex فقط، وتحقق من بصمة الملف المُنزَّل.'
        ),
        L(
          'Anti-virus may block the memory driver. That is a legitimate limitation to record, not a reason to stop the lab.',
          'قد يحجب مضاد الفيروسات تعريف الذاكرة. هذا قيد مشروع تسجّله، وليس سببًا لإيقاف اللاب.'
        ),
        L(
          'Never run RAM capture on a production endpoint — it is a memory acquisition.',
          'لا تُشغّل التقاط الذاكرة على جهاز إنتاج — هذه عملية اقتناء ذاكرة.'
        )
      ],
      teacher: L(
        'If RAM capture is unavailable in the lab, this becomes a discussion: students record the failure as a limitation and continue with live triage. The limitation note is graded.',
        'إذا تعذّر التقاط الذاكرة في اللاب، تتحوّل الخطوة إلى نقاش: يسجّل الطلبة الفشل كقيد ويكملون بالجمع الحي. ملاحظة القيود تحت التقييم.'
      ),
      artifacts: ['memory.raw', 'memory.raw.sha256.txt']
    },

    /* ---- PHASE 3 : PERSISTENT ---------------------------------------- */
    {
      id: 'event-logs',
      phase: 'persistent',
      kind: 'command',
      volatility: 'persistent',
      required: true,
      title: L('Export Windows event logs', 'صدّر سجلات أحداث ويندوز'),
      intent: L(
        'Save the System and Application event logs in their native .evtx format.',
        'احفظ سجلات أحداث System و Application بصيغتها الأصلية ‎.evtx‎.'
      ),
      purpose: L(
        'Event logs are persistent evidence: they survive a reboot and reconstruct what happened over time. Exporting to native .evtx keeps them parseable by standard tools, which a text dump would lose.',
        'سجلات الأحداث أدلة دائمة: تصمد أمام إعادة التشغيل وتعيد بناء ما حدث عبر الزمن. التصدير إلى صيغة ‎.evtx‎ الأصلية يحافظ على قابليتها للقراءة بالأدوات المعيارية، وهو ما يفقده التصدير النصي.'
      ),
      command:
        'wevtutil epl System "$Case\\System.evtx"\n' +
        'wevtutil epl Application "$Case\\Application.evtx"',
      output: L(
        'Two files appear in the case folder: <code>System.evtx</code> and <code>Application.evtx</code>, both non-empty.',
        'ملفان يظهران في مجلد القضية: <code>System.evtx</code> و<code>Application.evtx</code>، وكلاهما غير فارغ.'
      ),
      gotchas: [
        L(
          'Requires administrator. A failure here means the shell is not elevated, not that the log is empty.',
          'يتطلب صلاحيات مدير. فشل هنا يعني أن النافذة ليست مرتفعة الصلاحية، لا أن السجل فارغ.'
        ),
        L(
          'The Security log often fails to export. Use System and Application for the class and record Security as a limitation.',
          'سجل Security غالبًا يفشل في التصدير. استخدم System و Application في الصف وسجّل Security كقيد.'
        ),
        L(
          'Try opening the exported file in Event Viewer → Saved Logs to prove it is valid.',
          'جرّب فتح الملف المُصدَّر في Event Viewer ← Saved Logs لإثبات صلاحيته.'
        )
      ],
      teacher: L(
        'Ask the class what they can learn from a System log that they cannot learn from a process list — for example, an unexpected service start or a shutdown record.',
        'اسأل الصف ما يمكن تعلّمه من سجل System ولا يمكن تعلّمه من قائمة العمليات — مثل تشغيل خدمة غير متوقّع أو سجل إيقاف.'
      ),
      artifacts: ['System.evtx', 'Application.evtx']
    },
    {
      id: 'system-info',
      phase: 'persistent',
      kind: 'command',
      volatility: 'persistent',
      required: true,
      title: L('Record host and system information', 'سجّل معلومات الجهاز والنظام'),
      intent: L(
        'Capture the identity of the machine: OS build, installation time, serial, hardware.',
        'التقط هوية الجهاز: إصدار النظام، وقت التثبيت، الرقم التسلسلي، والمواصفات.'
      ),
      purpose: L(
        'System information connects an artifact to a host and a user. Without it, a process list or an event log cannot be attributed to a specific machine in a multi-device investigation.',
        'معلومات النظام تربط الأثر بجهاز ومستخدم محددين. بدونها لا يمكن نسب قائمة عمليات أو سجل أحداث إلى جهاز بعينه في تحقيق متعدد الأجهزة.'
      ),
      command:
        'Get-ComputerInfo | Out-File "$Case\\computerinfo.txt" -Width 200\n' +
        '\n' +
        '# Faster subset if the full command is slow\n' +
        'Get-CimInstance Win32_ComputerSystem |\n' +
        '  Select-Object Manufacturer,Model,TotalPhysicalMemory |\n' +
        '  Format-List | Out-File "$Case\\computerinfo-summary.txt"',
      output: L(
        '<code>computerinfo.txt</code> containing the OS build, install date, host name, manufacturer and serial number.',
        'ملف <code>computerinfo.txt</code> يحتوي إصدار النظام وتاريخ التثبيت واسم الجهاز والشركة المصنّعة والرقم التسلسلي.'
      ),
      gotchas: [
        L(
          '<code>Get-ComputerInfo</code> can take 10–30 seconds. That delay is normal — do not cancel it.',
          'قد يستغرق <code>Get-ComputerInfo</code> من ١٠ إلى ٣٠ ثانية. هذا التأخير طبيعي — لا تلغِ الأمر.'
        ),
        L(
          'Without elevation some fields return empty. Use the CIM subset as a fallback and note it.',
          'بدون رفع الصلاحية قد تعود بعض الحقول فارغة. استخدم جزء CIM كبديل وسجّل ذلك.'
        )
      ],
      teacher: L(
        'Point out the installation date: on a re-imaged lab VM it can be the most interesting field in the file.',
        'أشر إلى تاريخ التثبيت: على جهاز لاب أُعيد تثبيته قد يكون أكثر الحقول إثارة للاهتمام في الملف.'
      ),
      artifacts: ['computerinfo.txt', 'computerinfo-summary.txt']
    },
    {
      id: 'volume-info',
      phase: 'persistent',
      kind: 'command',
      volatility: 'persistent',
      required: false,
      title: L('Record drive and volume information', 'سجّل معلومات الأقراص ووحدات التخزين'),
      intent: L(
        'Describe the storage of the host: volumes, filesystem, free space, health.',
        'صِف تخزين الجهاز: الوحدات ونظام الملفات والمساحة الحرة والحالة.'
      ),
      purpose: L(
        'Step 7 of the section workflow is "record hard-drive information". It tells the next analyst what media existed, how much space was free, and whether the disk looks healthy.',
        'الخطوة ٧ من مسار السكشن هي «تسجيل معلومات القرص الصلب». فهي تخبر المحلل التالي بوحدات التخزين الموجودة، وكم المساحة الحرة، وهل يبدو القرص سليمًا.'
      ),
      command:
        'Get-Volume | Select-Object DriveLetter,FileSystemLabel,FileSystem,HealthStatus,\n' +
        '  @{Name="SizeGB";E={[math]::Round($_.Size/1GB,1)}},\n' +
        '  @{Name="FreeGB";E={[math]::Round($_.SizeRemaining/1GB,1)}} |\n' +
        '  Format-Table | Out-File "$Case\\volumes.txt"\n' +
        '\n' +
        '# Fallback if Get-Volume is unavailable\n' +
        'Get-PSDrive -PSProvider FileSystem |\n' +
        '  Select-Object Name,Root,Used,Free | Format-Table | Out-File "$Case\\drives.txt"',
      output: L(
        '<code>volumes.txt</code> showing drive letters, filesystem type, health status and size in GB.',
        'ملف <code>volumes.txt</code> يوضح حروف الأقراص ونوع نظام الملفات وحالة السلامة والحجم بالجيغابايت.'
      ),
      gotchas: [
        L(
          '<code>Get-Volume</code> needs elevation. If it fails, run the <code>Get-PSDrive</code> fallback and record the limitation.',
          '<code>Get-Volume</code> يتطلب رفع الصلاحية. عند الفشل استخدم بديل <code>Get-PSDrive</code> وسجّل القيد.'
        )
      ],
      teacher: L(
        'Tie this to the workflow slide: this is the cheap digital equivalent of "photograph identifiers and record the drive before packaging it".',
        'اربطها بشريحة المسار: هذه هي النسخة الرقمية الرخيصة من «صوّر المعرّفات وسجّل القرص قبل التغليف».'
      ),
      artifacts: ['volumes.txt']
    },
    {
      id: 'targeted-files',
      phase: 'persistent',
      kind: 'command',
      volatility: 'persistent',
      required: true,
      title: L('List targeted files, not the whole disk', 'سرد ملفات محددة بدل القرص كاملًا'),
      intent: L(
        'Record the metadata of the file you created, in a form you can attach to the case.',
        'سجّل البيانات الوصفية للملف الذي أنشأته، بصيغة يمكن إرفاقها بالقضية.'
      ),
      purpose: L(
        'This is the difference between triage and full imaging. A focused listing gives the timeline facts you need in seconds; a full disk image needs hours and dedicated hardware. Students must learn to choose the right depth.',
        'هذا هو الفرق بين الفرز (Triage) والتصوير الكامل. السرد المركّز يعطيك حقائق الخط الزمني في ثوانٍ، بينما تصوير القرص كاملًا يحتاج ساعات وجهازًا مخصّصًا. على الطلبة أن يتعلموا اختيار العمق المناسب.'
      ),
      command:
        'Get-ChildItem "$env:USERPROFILE\\Desktop" -Force |\n' +
        '  Select-Object Name,Length,CreationTime,LastWriteTime |\n' +
        '  Export-Csv "$Case\\desktop-listing.csv" -NoTypeInformation',
      output: L(
        '<code>desktop-listing.csv</code> with a row for <code>lab-note.txt</code> showing its size, creation time and last write time.',
        'ملف <code>desktop-listing.csv</code> فيه صف لـ <code>lab-note.txt</code> يوضح الحجم ووقت الإنشاء وآخر تعديل.'
      ),
      gotchas: [
        L(
          '<code>-Force</code> reveals hidden and system files. Without it you may miss the artifact that matters.',
          'الخيار <code>-Force</code> يكشف الملفات المخفية والنظامية. بدونه قد يفوتك الأثر المهم.'
        ),
        L(
          'Times shown are local time. The <code>CreationTime</code> is what you compare against the event logs.',
          'الأوقات المعروضة بالتوقيت المحلي. <code>CreationTime</code> هو ما تقارنه بسجلات الأحداث.'
        )
      ],
      teacher: L(
        'Ask: what would change if we had imaged the whole 120 GB drive for one text file? This is the cost-of-depth conversation the section is really about.',
        'اسأل: ما الذي كان سيختلف لو صوّرنا قرصًا كاملًا بحجم ١٢٠ جيجا لملف نصي واحد؟ هذه هي محادثة «كلفة العمق» الحقيقية للسكشن.'
      ),
      artifacts: ['desktop-listing.csv']
    },

    /* ---- PHASE 4 : PRESERVE ------------------------------------------ */
    {
      id: 'hash-all',
      phase: 'preserve',
      kind: 'command',
      volatility: 'preserve',
      required: true,
      title: L('Hash every artifact', 'احسب بصمة (Hash) لكل الأثر'),
      intent: L(
        'Generate a SHA-256 fingerprint for each file you collected.',
        'أنشئ بصمة SHA-256 لكل ملف قمت بجمعه.'
      ),
      purpose: L(
        'The hash is the fingerprint that proves the file has not changed since collection. Re-hashing the bundle later must produce identical values — that is what makes the evidence defensible rather than merely a set of files.',
        'البصمة هي الدليل على أن الملف لم يتغيّر منذ الجمع. إعادة الحساب لاحقًا يجب أن تُعطي نفس القيم بالضبط — وهذا ما يجعل الدليل قابلًا للدفاع عنه وليس مجرد ملفات.'
      ),
      command:
        'Get-ChildItem $Case -File -Exclude hashes.csv |\n' +
        '  Get-FileHash -Algorithm SHA256 |\n' +
        '  Export-Csv "$Case\\hashes.csv" -NoTypeInformation\n' +
        '\n' +
        '# Prove it later — the values must match exactly\n' +
        'Get-ChildItem $Case -File -Exclude hashes.csv |\n' +
        '  Get-FileHash -Algorithm SHA256 | Format-Table',
      output: L(
        '<code>hashes.csv</code> with one 64-character hex hash per file. Re-running the command produces identical hashes.',
        'ملف <code>hashes.csv</code> فيه بصمة hex من ٦٤ خانة لكل ملف. إعادة تشغيل الأمر تُنتج نفس البصمات تمامًا.'
      ),
      gotchas: [
        L(
          'Exclude <code>hashes.csv</code> from its own hash list, otherwise the file hashes itself and the values never match.',
          'استثنِ <code>hashes.csv</code> من قائمة بصماتها، وإلا أصبحت البصمة للملف نفسه ولن تتطابق القيم أبدًا.'
        ),
        L(
          'SHA-256 is the expected default in a case. MD5 is only acceptable for legacy compatibility.',
          '‏SHA-256 هو الخيار الافتراضي المتوقع في القضية. أما MD5 فمقبول فقط للتوافق مع أنظمة قديمة.'
        ),
        L(
          'Record the hash of the file you transferred, not only the file on the source drive.',
          'سجّل بصمة الملف المنقول، وليس بصمة الملف على القرص المصدر فقط.'
        )
      ],
      teacher: L(
        'This is the step students forget when they are tired. Make the re-hash demonstration a habit: collect, hash, then hash again and show the identical output on the projector.',
        'هذه الخطوة ينساها الطلبة حين يتعبون. اجعل إعادة الحساب عادة: اجمع، احسب البصمة، ثم أعد الحساب وأظهر تطابق النتيجة على جهاز العرض.'
      ),
      artifacts: ['hashes.csv']
    },
    {
      id: 'collection-log',
      phase: 'preserve',
      kind: 'command',
      volatility: 'preserve',
      required: true,
      title: L('Build the collection log', 'أنشئ سجل الجمع'),
      intent: L(
        'Write one row per action: when, who, which host, which command, which output, which hash, which limitation.',
        'اكتب صفًا لكل إجراء: متى، من، أي جهاز، أي أمر، أي مخرج، أي بصمة، أي قيد.'
      ),
      purpose: L(
        'The log is what turns a folder of files into evidence. It is the answer to "how do you know this came from that machine at that time?" Without it, the bundle is unattributable no matter how well it was collected.',
        'السجل هو ما يحوّل مجلد ملفات إلى دليل. إنه الإجابة عن سؤال «كيف تعرف أن هذا جاء من ذلك الجهاز في تلك اللحظة؟». بدونه تبقى الحزمة بلا نسبة حتى لو اجُمعت بإتقان.'
      ),
      command:
        '$Entry = [pscustomobject]@{\n' +
        '  timestamp   = (Get-Date).ToUniversalTime().ToString("o")\n' +
        '  analyst     = "$env:USERDOMAIN\\$env:USERNAME"\n' +
        '  host        = $env:COMPUTERNAME\n' +
        '  command     = "Get-Process ... Export-Csv processes.csv"\n' +
        '  output      = "processes.csv"\n' +
        '  hash        = (Get-FileHash "$Case\\processes.csv" -Algorithm SHA256).Hash\n' +
        '  limitation  = ""\n' +
        '}\n' +
        '$Entry | Export-Csv "$Case\\collection-log.csv" -Append -NoTypeInformation',
      output: L(
        '<code>collection-log.csv</code> grows by one row each time you run the template for an artifact.',
        'يكبر ملف <code>collection-log.csv</code> بصف واحد كلما شغّلت القالب لأحد الأثر.'
      ),
      gotchas: [
        L(
          'The limitation field is not optional decoration. "Security.evtx could not be exported" is a professional entry; a blank cell is a weak one.',
          'حقل القيود ليس زينة اختيارية. عبارة «تعذّر تصدير Security.evtx» مُدخل احترافي، أما الفراغ فهو مُدخل ضعيف.'
        ),
        L(
          'Copy the template and change the <code>command</code>, <code>output</code> and <code>hash</code> values for every artifact — do not overwrite the row.',
          'انسخ القالب وغيّر قيم <code>command</code> و<code>output</code> و<code>hash</code> لكل أثر — ولا تستبدل الصف.'
        ),
        L(
          'UTC in the log, local time in your notes. Never mix the two inside one column.',
          'UTC في السجل، والوقت المحلي في ملاحظاتك. لا تخلط بينهما داخل نفس العمود.'
        )
      ],
      teacher: L(
        'The exported CSV from this website uses exactly these seven columns, so students can build the log here and keep it in the case folder.',
        'ملف CSV المُصدَّر من هذا الموقع يستخدم نفس الأعمدة السبعة بالضبط، فيستطيع الطلبة بناء السجل هنا والاحتفاظ به داخل مجلد القضية.'
      ),
      artifacts: ['collection-log.csv']
    },
    {
      id: 'verify-bundle',
      phase: 'preserve',
      kind: 'command',
      volatility: 'preserve',
      required: true,
      title: L('Open and verify the case folder', 'افتح مجلد القضية وتحقق منه'),
      intent: L(
        'Show the bundle on screen so the class can see exactly what was collected.',
        'اعرض الحزمة على الشاشة حتى يرى الصف بالضبط ما تم جمعه.'
      ),
      purpose: L(
        'Verification is the last local action and the first proof of quality: names, sizes and timestamps must match what the log says. A mismatch here is cheaper to fix now than after submission.',
        'التحقق هو آخر إجراء محلي وأول إثبات للجودة: يجب أن تتطابق الأسماء والأحجام والأوقات مع ما يقوله السجل. أي تعارض هنا أرخص في إصلاحه الآن من بعد التسليم.'
      ),
      command:
        'explorer "$Case"\n' +
        '\n' +
        'Get-ChildItem $Case |\n' +
        '  Select-Object Name,Length,LastWriteTime |\n' +
        '  Sort-Object Name | Format-Table -AutoSize',
      output: L(
        'File Explorer opens the case folder, and the table lists every artifact with its size and timestamp.',
        'يفتح File Explorer مجلد القضية، وتعرض القائمة كل أثر مع حجمه ووقته.'
      ),
      gotchas: [
        L(
          'If a file is missing here, it was never written — check the command output, not the Explorer window.',
          'إذا كان ملف ناقصًا هنا، فلم يُكتب أصلًا — راجع مخرجات الأمر لا نافذة Explorer.'
        ),
        L(
          'Do not rename or reorganise the files after hashing. The hash list and the folder must stay in sync.',
          'لا تُعِد تسمية الملفات أو إعادة تنظيمها بعد حساب البصمات. قائمة البصمات والمجلد يجب أن يبقيا متطابقين.'
        )
      ],
      teacher: L(
        'Compare the Explorer view with the collection log row by row. Let students find any mismatch themselves — it is faster than you pointing it out.',
        'قارن نافذة Explorer بسجل الجمع سطرًا بسطر. دع الطلبة يجدون أي تعارض بأنفسهم — أسرع من أن تدلّهم عليه.'
      ),
      artifacts: []
    },

    /* ---- PHASE 5 : REMOTE -------------------------------------------- */
    {
      id: 'enable-remoting',
      phase: 'remote',
      kind: 'command',
      volatility: 'remote',
      required: true,
      title: L('Enable remoting on the target host', 'فعّل الـ Remoting على الجهاز الهدف'),
      intent: L(
        'One-time setup, run on DFIR-WIN02 only, inside the isolated lab network.',
        'إعداد لمرة واحدة، يُنفَّذ على DFIR-WIN02 فقط، داخل شبكة اللاب المعزولة.'
      ),
      purpose: L(
        'PowerShell Remoting is built into Windows, so no third-party agent is needed for the remote part of the lab. This command starts the WinRM service and creates the firewall rules that let the instructor machine connect.',
        '‏PowerShell Remoting مدمج في ويندوز، فلا حاجة لوسيط خارجي في الجزء البعيد من اللاب. هذا الأمر يشغّل خدمة WinRM وينشئ قواعد الجدار الناري التي تسمح لجهاز المدرّس بالاتصال.'
      ),
      command:
        '# On DFIR-WIN02, as Administrator\n' +
        'Enable-PSRemoting -Force\n' +
        '\n' +
        '# Verify it is listening\n' +
        'Get-Service WinRM | Select-Object Status,StartType\n' +
        'Test-WSMan -ComputerName DFIR-WIN02',
      output: L(
        'WinRM reports <code>Running</code> and <code>Test-WSMan</code> returns the WSMan version of the target.',
        'تعرض خدمة WinRM الحالة <code>Running</code> ويعيد <code>Test-WSMan</code> إصدار WSMan للهدف.'
      ),
      gotchas: [
        L(
          'Run this on the TARGET only, once. Never enable it on a production machine.',
          'نفّذ هذا على الهدف فقط، مرة واحدة. لا تفعّله على أي جهاز إنتاج.'
        ),
        L(
          'If the lab network blocks 5985/5986, nothing on the analyst side will work. Test early, before the class starts.',
          'إذا كانت شبكة اللاب تحجب المنفذين ٥٩٨٥/٥٩٨٦ فلن ينجح شيء من جهة المدرّس. اختبر مبكرًا قبل بدء الصف.'
        ),
        L(
          'To undo on the lab VM: <code>Disable-PSRemoting -Force</code>.',
          'للتراجع على جهاز اللاب: <code>Disable-PSRemoting -Force</code>.'
        )
      ],
      teacher: L(
        'Do this before the session starts, not during it. The 10 minutes it can cost are better spent on the volatility discussion.',
        'نفّذ هذا قبل بدء الجلسة لا أثناءها. الوقت الذي قد يلتهمه (١٠ دقائق) أفضل لمناقشة التطاير.'
      ),
      artifacts: []
    },
    {
      id: 'trusted-hosts',
      phase: 'remote',
      kind: 'command',
      volatility: 'remote',
      required: false,
      title: L('Trust the target in a lab workgroup', 'وثّق الهدف في مجموعة عمل اللاب'),
      intent: L(
        'Optional troubleshooting step for lab networks that are not domain-joined.',
        'خطوة اختيارية لحل المشكلات في شبكات اللاب غير المرتبطة بالدومين.'
      ),
      purpose: L(
        'In a domain, Kerberos authenticates the session automatically. In a workgroup lab, the client refuses the target by design, and the error is a security feature — not a broken tool.',
        'في الدومين تتولى Kerberos مصادقة الجلسة تلقائيًا. أما في مجموعة عمل اللاب فيرفض العميل الهدف بحكم التصميم — والخطأ هنا ميزة أمنية لا أداة معطوبة.'
      ),
      command:
        '# On the ANALYST machine, as Administrator\n' +
        'Set-Item WSMan:\\localhost\\Client\\TrustedHosts -Value DFIR-WIN02\n' +
        'Restart-Service WinRM\n' +
        '\n' +
        '# Revert after the lab\n' +
        'Set-Item WSMan:\\localhost\\Client\\TrustedHosts -Value ""',
      output: L(
        'No output on success. The next <code>Invoke-Command</code> can now authenticate to the target.',
        'لا مخرجات عند النجاح. وبذلك يصبح <code>Invoke-Command</code> التالي قادرًا على المصادقة على الهدف.'
      ),
      gotchas: [
        L(
          'TrustedHosts disables name-based authentication for that entry — acceptable inside an isolated lab, never on a production network.',
          '‏TrustedHosts يعطّل المصادقة بالاسم لهذا المدخل — مقبول داخل لاب معزول، ولا يُستخدم أبدًا على شبكة إنتاج.'
        ),
        L(
          'Always revert the setting when the lab ends, and record that you did.',
          'أعِد الضبط دائمًا عند انتهاء اللاب، وسجّل أنك فعلت ذلك.'
        ),
        L(
          'If the target name still fails, try its IP address instead of the hostname.',
          'إذا فشل اسم الهدف، جرّب عنوان IP بدل اسم الجهاز.'
        )
      ],
      teacher: L(
        'Only needed when the lab is a workgroup. Check with the room technician in advance — the two classic errors, access denied and cannot connect, have different causes.',
        'مطلوب فقط إذا كان اللاب مجموعة عمل. تحقق مسبقًا مع فني القاعة — الخطآن الكلاسيكان، "access denied" و"cannot connect"، لهما أسباب مختلفة.'
      ),
      artifacts: []
    },
    {
      id: 'remote-identity',
      phase: 'remote',
      kind: 'command',
      volatility: 'remote',
      required: true,
      title: L('Run the first remote collection', 'نفّذ أول جمع عن بُعد'),
      intent: L(
        'Ask the second lab host for its identity and time, and nothing else.',
        'اطلب من جهاز اللاب الثاني هويته ووقته، ولا شيء غير ذلك.'
      ),
      purpose: L(
        'This is the smallest useful remote command. It proves the connection, the authentication and the direction of the answer — the answer comes from DFIR-WIN02 even though the command ran on your machine.',
        'هذا أصغر أمر بعيد مفيد. يثبت الاتصال والمصادقة واتجاه الإجابة — الإجابة تأتي من DFIR-WIN02 رغم أن الأمر نُفِّذ على جهازك.'
      ),
      command:
        'Invoke-Command -ComputerName DFIR-WIN02 -ScriptBlock {\n' +
        '  hostname\n' +
        '  whoami\n' +
        '  Get-Date -Format "yyyy-MM-dd HH:mm:ss K"\n' +
        '}',
      output: L(
        'The output shows <code>DFIR-WIN02</code>, the remote user account, and the time on the target host.',
        'يظهر المخرج اسم <code>DFIR-WIN02</code> وحساب المستخدم على الهدف والوقت على الجهاز الهدف.'
      ),
      gotchas: [
        L(
          'The answer comes from the target. If it shows your own hostname, you are running a local command by mistake.',
          'الإجابة تأتي من الهدف. إذا ظهر اسم جهازك أنت فأنت تنفّذ أمرًا محليًا بالخطأ.'
        ),
        L(
          '<code>Access denied</code> means authentication; <code>cannot connect</code> means network or WinRM. Diagnose them separately.',
          'رسالة "Access denied" تعني مشكلة مصادقة، و"cannot connect" تعني مشكلة شبكة أو WinRM. شخّصهما منفصلين.'
        ),
        L(
          'If the target is unreachable, do not burn the class time on networking. Use the fallback: the instructor machine becomes the local host and students compare the two approaches theoretically.',
          'إذا تعذّر الوصول للهدف، لا تحرق وقت الصف في مشاكل الشبكة. استخدم البديل: يصبح جهاز المدرّس هو المضيف المحلي ويقارن الطلبة الطريقتين نظريًا.'
        )
      ],
      teacher: L(
        'Point at the hostname in the output. Students must be able to state that the evidence came from the second machine, not from the machine they were typing on.',
        'أشر إلى اسم الجهاز في المخرج. يجب أن يكون الطلبة قادرين على القول إن الدليل جاء من الجهاز الثاني لا من الجهاز الذي يكتبون عليه.'
      ),
      artifacts: []
    },
    {
      id: 'remote-triage',
      phase: 'remote',
      kind: 'command',
      volatility: 'remote',
      required: true,
      title: L('Save the remote triage to a file', 'احفظ نتيجة الفحص البعيد في ملف'),
      intent: L(
        'Collect the same evidence categories from DFIR-WIN02 and write them to the case folder.',
        'اجمع نفس فئات الأدلة من DFIR-WIN02 واكتبها في مجلد القضية.'
      ),
      purpose: L(
        'The same questions, asked remotely. The output is written on the analyst machine, so it survives even if the target is powered off the moment the command finishes.',
        'الأسئلة نفسها، موجَّهة عن بُعد. تُكتب المخرجات على جهاز المحلل، فتبقى حتى لو أُطفئ الهدف فور انتهاء الأمر.'
      ),
      command:
        '$Target = "DFIR-WIN02"\n' +
        '\n' +
        'Invoke-Command -ComputerName $Target -ScriptBlock {\n' +
        '  Get-Date -Format o\n' +
        '  hostname\n' +
        '  whoami\n' +
        '  Get-Process | Sort-Object CPU -Descending |\n' +
        '    Select-Object -First 10 ProcessName,Id,CPU\n' +
        '  Get-NetTCPConnection |\n' +
        '    Select-Object LocalPort,RemoteAddress,RemotePort,State,OwningProcess\n' +
        '} | Out-File "$Case\\remote-triage.txt" -Width 200\n' +
        '\n' +
        'Get-FileHash "$Case\\remote-triage.txt" -Algorithm SHA256 |\n' +
        '  Out-File "$Case\\remote-triage.sha256.txt"',
      output: L(
        '<code>remote-triage.txt</code> with the target identity, ten processes and the connection list, plus a separate hash file.',
        'ملف <code>remote-triage.txt</code> فيه هوية الهدف وعشرة عمليات وقائمة الاتصالات، مع ملف بصمة منفصل.'
      ),
      gotchas: [
        L(
          'The <code>| Out-File</code> must sit OUTSIDE the <code>-ScriptBlock { }</code> braces. Inside them it tries to write on the target.',
          'يجب أن يكون <code>| Out-File</code> خارج أقواس <code>-ScriptBlock { }</code>. لو وضعته بداخلها سيحاول الكتابة على الهدف.'
        ),
        L(
          'The remote host needs its own case folder if you want raw .evtx from the target — remote export writes locally by default.',
          'يحتاج المضيف البعيد إلى مجلد قضية خاص به إذا أردت ملفات ‎.evtx‎ الخام من الهدف — التصدير البعيد يكتب محليًا افتراضيًا.'
        ),
        L(
          'Hash the remote output on the analyst machine — that is the copy you will hand over.',
          'احسب بصمة المخرج البعيد على جهاز المحلل — فهذه هي النسخة التي ستسلّمها.'
        )
      ],
      teacher: L(
        'Open the two files side by side: local process list against remote process list. The columns are the same because the questions are the same. That is the whole point of a standard collection.',
        'افتح الملفين جنبًا إلى جنب: قائمة العمليات المحلية مقابل البعيدة. الأعمدة متطابقة لأن الأسئلة متطابقة. هذه هي فكرة الجمع الموحّد.'
      ),
      artifacts: ['remote-triage.txt', 'remote-triage.sha256.txt']
    },
    {
      id: 'remote-tradeoffs',
      phase: 'remote',
      kind: 'concept',
      volatility: 'remote',
      required: true,
      title: L('Local versus remote: what actually changes', 'المحلي مقابل البعيد: ما الذي يتغيّر فعلًا'),
      intent: L(
        'Compare the two collection paths and state the operational trade-off out loud.',
        'قارن بين مسارَي الجمع واذكر المفاضلة التشغيلية بصوت مسموع.'
      ),
      purpose: L(
        'Remote collection is not automatically more forensic — it is a different operational trade-off. It scales to two hundred endpoints and it reaches cloud hosts, but it usually returns focused artifacts instead of a full image, and it leaves traces of the remote action itself on the network.',
        'الجمع البعيد ليس أخص forensic تلقائيًا — بل هو مفاضلة تشغيلية مختلفة. يتوسّع إلى مئتي جهاز ويصل إلى المضيفات السحابية، لكنه عادةً يعيد آثارًا مركّزة بدل صورة كاملة، ويترك آثارًا للإجراء البعيد نفسه على الشبكة.'
      ),
      output: L(
        'Write one paragraph in your notes answering: what would you collect locally, what remotely, and why.',
        'اكتب فقرة واحدة في ملاحظاتك تجيب فيها: ما الذي تجمعه محليًا، وما تجمعه عن بُعد، ولماذا.'
      ),
      gotchas: [
        L(
          'Remote collection is still acquisition — it changes the host and it must be logged exactly like a local action.',
          'الجمع البعيد يبقى اقتناءً — يغيّر حالة الجهاز ويجب تسجيله تمامًا كأي إجراء محلي.'
        ),
        L(
          'Scaling to a whole estate needs a server/client model such as Velociraptor, or an EDR platform. PowerShell Remoting does not manage hundreds of hosts by itself.',
          'التوسّع إلى كامل البيئة يحتاج نموذج خادم/عميل مثل Velociraptor أو منصة EDR. أما PowerShell Remoting وحده فلا يدير مئات الأجهزة.'
        )
      ],
      teacher: L(
        'Use the class activity from the deck: a running endpoint with a suspicious connection in a 200-device enterprise. The expected answer is volatile first, remote for scale, documentation at every step.',
        'استخدم نشاط الصف من العرض: نقطة نهاية تعمل واتصال مشبوه في شركة فيها ٢٠٠ جهاز. الإجابة المتوقعة: المتطاير أولًا، والبعيد للتوسّع، والتوثيق في كل خطوة.'
      ),
      artifacts: []
    },

    /* ---- PHASE 6 : CLOSE --------------------------------------------- */
    {
      id: 'deliverables',
      phase: 'close',
      kind: 'concept',
      volatility: 'concept',
      required: true,
      title: L('Package and submit the evidence bundle', 'جهّز حزمة الأدلة وقدّمها'),
      intent: L(
        'Produce the three items the instructor expects, in the case folder.',
        'أنتج العناصر الثلاثة التي يتوقعها المدرّس، داخل مجلد القضية.'
      ),
      purpose: L(
        'The submission is graded on the explanation and the log, not on the size of the folder. A small, well-documented bundle beats a large folder with no context.',
        'التسليم يُقيَّم على الشرح والسجل لا على حجم المجلد. حزمة صغيرة موثّقة أفضل من مجلد كبير بلا سياق.'
      ),
      output: L(
        'ZIP of the case folder + <code>collection-log.csv</code> + one page of notes including the limitation note.',
        'ملف ZIP لمجلد القضية + <code>collection-log.csv</code> + صفحة ملاحظات واحدة تتضمن ملاحظة القيود.'
      ),
      gotchas: [
        L(
          'The limitation note is graded. Write at least one real limitation and how you worked around it.',
          'ملاحظة القيود تحت التقييم. اكتب قيدًا حقيقيًا واحدًا على الأقل وكيف تعاملت معه.'
        ),
        L(
          'Keep the hashes file inside the ZIP. It proves the bundle was not edited after collection.',
          'أبقِ ملف البصمات داخل ملف ZIP. فهو يثبت أن الحزمة لم تُعدَّل بعد الجمع.'
        )
      ],
      teacher: L(
        'Collect the ZIPs at the end. A student who submits a bundle with a matching hash list and an honest limitation note has met the outcome, regardless of how many optional steps they reached.',
        'اجمع ملفات ZIP في النهاية. الطالب الذي يقدّم حزمة بها قائمة بصمات مطابقة وملاحظة قيود صادقة يكون قد حقّق الهدف، مهما بلغ عدد الخطوات الاختيارية التي وصل إليها.'
      ),
      artifacts: []
    }
  ];

  /* ------------------------------------------------------- volatility ladder */
  const volatility = [
    {
      label: L('CPU registers', 'سجلات المعالج'),
      note: L('Fastest to change', 'الأسرع تغيّرًا'),
      desc: L(
        'Values inside the CPU itself. Gone the moment the power drops, and no tool in this lab can read them.',
        'القيم داخل المعالج نفسه. تختفي لحظة انقطاع التيار، ولا توجد أداة في هذا اللاب تستطيع قراءتها.'
      ),
      steps: ['power-state']
    },
    {
      label: L('Cache and RAM', 'الذاكرة المخبأة والذاكرة الرئيسية'),
      note: L('Running memory', 'الذاكرة الجارية'),
      desc: L(
        'Holds the process list, open connections and the incident while it is happening. Needs a live acquisition such as WinPmem.',
        'تحتفظ بجدول العمليات والاتصالات المفتوحة والحادثة أثناء وقوعها. تحتاج اقتناءً حيًّا مثل WinPmem.'
      ),
      steps: ['ram-usage', 'ram-image']
    },
    {
      label: L('Network state', 'حالة الشبكة'),
      note: L('Connections and ARP cache', 'الاتصالات وذاكرة ARP'),
      desc: L(
        'Live connections and the ARP cache change with every packet. Capture them before you think about files.',
        'الاتصالات المفتوحة وذاكرة ARP تتغيّر مع كل حزمة. التقطها قبل التفكير في الملفات.'
      ),
      steps: ['network']
    },
    {
      label: L('Processes and system state', 'العمليات وحالة النظام'),
      note: L('What is executing now', 'ما الذي يعمل الآن'),
      desc: L(
        'The process table and live system state. Always volatile — it is only a record of one moment.',
        'جدول العمليات وحالة النظام الحية. متطاير دائمًا — هو 기록 للحظة واحدة فقط.'
      ),
      steps: ['processes', 'ram-usage']
    },
    {
      label: L('Registry and event logs', 'السجل وسجلات الأحداث'),
      note: L('Persistent activity traces', 'آثار النشاط الدائمة'),
      desc: L(
        'Survive a reboot and support timeline analysis. This is where the "what happened earlier" questions get answered.',
        'تصمد أمام إعادة التشغيل وتدعم تحليل الخط الزمني. هنا تُجاب أسئلة "ماذا حدث سابقًا".'
      ),
      steps: ['event-logs']
    },
    {
      label: L('Disk and long-term storage', 'القرص والتخزين طويل الأمد'),
      note: L('Most persistent', 'الأكثر ديمومة'),
      desc: L(
        'Files and drive metadata. The most persistent class, and the most expensive one to collect in full.',
        'الملفات وبيانات الأقراص. أكثر فئات الديمومة، وأكلفها في الجمع الكامل.'
      ),
      steps: ['system-info', 'volume-info', 'targeted-files']
    }
  ];

  /* ------------------------------------------------------------- tool map */
  const tools = [
    {
      name: 'PowerShell',
      role: L('Local + remote live triage', 'فرز حي محلي وبعيد'),
      note: L('Built into Windows. The primary path of this lab.', 'مدمج في ويندوز. المسار الأساسي في هذا اللاب.'),
      tag: 'primary',
      link: 'https://learn.microsoft.com/powershell/'
    },
    {
      name: 'WinPmem',
      role: L('RAM capture on Windows', 'التقاط الذاكرة على ويندوز'),
      note: L('Command-line physical memory acquisition. Optional step 07.', 'اقتناء ذاكرة فعلية من سطر الأوامر. الخطوة ٠٧ الاختيارية.'),
      tag: 'primary',
      link: 'https://github.com/Velocidex/WinPmem'
    },
    {
      name: 'KAPE',
      role: L('Focused artifact extraction', 'استخراج artifacts مركّز'),
      note: L('Kroll artifact parser and extractor. Use on a lab copy or endpoint.', 'محلّل ومستخرج artifacts من Kroll. يُستخدم على نسخة اللاب أو الجهاز.'),
      tag: 'optional',
      link: 'https://www.kroll.com/en/services/cyber/incident-response-recovery/kroll-artifact-parser-and-extractor-kape'
    },
    {
      name: 'FTK Imager',
      role: L('Preview and image workflow', 'عرض ومعاينة ملفات الصور'),
      note: L('GUI demonstration of preview and hash-on-acquisition.', 'عرض توضيحي بالواجهة للمعاينة والحساب عند الاقتناء.'),
      tag: 'optional',
      link: 'https://www.exterro.com/ftk-downloads/ftk-imager-8-3'
    },
    {
      name: 'RamCapturer',
      role: L('Local RAM capture alternative', 'بديل لالتقاط الذاكرة محليًا'),
      note: L('A simpler local alternative when WinPmem is blocked.', 'بديل محلي أبسط عند تعذّر WinPmem.'),
      tag: 'optional',
      link: 'https://www.volatilememory.com/'
    },
    {
      name: 'CyLR',
      role: L('Response and artifact collection', 'الاستجابة وجمع الـ artifacts'),
      note: L('Collects high-value artifacts from a running host.', 'يجمع artifacts عالية القيمة من جهاز يعمل.'),
      tag: 'optional',
      link: 'https://github.com/h4ck3rt3ch/CyLR'
    },
    {
      name: 'Velociraptor',
      role: L('Scalable remote collection', 'جمع بعيد قابل للتوسّع'),
      note: L('Server and client model for many endpoints. Instructor extension.', 'نموذج خادم وعميل لأجهزة كثيرة. امتداد للمدرّس.'),
      tag: 'scale',
      link: 'https://docs.velociraptor.app/'
    },
    {
      name: 'EDR',
      role: L('Monitor, respond, acquire', 'مراقبة واستجابة واقتناء'),
      note: L('A rapid collection layer. It does not replace forensic validation.', 'طبقة جمع سريعة. لكنها لا تُغني عن التحقّق الجنائي.'),
      tag: 'scale',
      link: 'https://learn.microsoft.com/security/endpoint-security/'
    }
  ];

  /* --------------------------------------------------- local vs remote table */
  const comparison = [
    {
      k: L('Access', 'الوصول'),
      local: L('Hands on the host', 'تواصل مباشر مع الجهاز'),
      remote: L('Network and identity required', 'يتطلب شبكة وهوية')
    },
    {
      k: L('Scale', 'التوسّع'),
      local: L('One device at a time', 'جهاز واحد في كل مرة'),
      remote: L('Many clients from one console', 'عملاء متعددون من لوحة واحدة')
    },
    {
      k: L('Depth', 'العمق'),
      local: L('Can image the disk or capture RAM', 'يمكن تصوير القرص أو التقاط الذاكرة'),
      remote: L('Usually focused, high-value artifacts', 'عادةً آثار مركّزة عالية القيمة')
    },
    {
      k: L('Evidence classes', 'فئات الأدلة'),
      local: L('Volatile, persistent, memory', 'متطاير، دائم، ذاكرة'),
      remote: L('The same classes, collected centrally', 'نفس الفئات، تُجمع مركزيًا')
    },
    {
      k: L('Risk', 'المخاطر'),
      local: L('The analyst changes the live host', 'المحلل يغيّر حالة الجهاز الحي'),
      remote: L('Adds network and service traces', 'يضيف آثارًا على الشبكة والخدمات')
    },
    {
      k: L('Documentation', 'التوثيق'),
      local: L('Same collection log', 'نفس سجل الجمع'),
      remote: L('Same collection log, plus the request context', 'نفس سجل الجمع، مع سياق الطلب')
    }
  ];

  /* ------------------------------------------------------------ deliverables */
  const deliverables = [
    L('ZIP of the <code>Case01</code> folder', 'ملف ZIP لمجلد <code>Case01</code>'),
    L('<code>collection-log.csv</code> with one row per action', '<code>collection-log.csv</code> بصف لكل إجراء'),
    L('<code>hashes.csv</code> with a SHA-256 for every artifact', '<code>hashes.csv</code> ببصمة SHA-256 لكل أثر'),
    L('One page of notes: what was volatile, what persisted', 'صفحة ملاحظات: ما كان متطايرًا وما كان دائمًا'),
    L('A limitation note: what failed, and how you worked around it', 'ملاحظة قيود: ما الذي فشل وكيف تعاملت معه')
  ];

  /* ------------------------------------------------------------------ quiz */
  const quiz = [
    {
      q: L(
        'What is the first evidence class you must collect, and why?',
        'ما أول فئة أدلة يجب جمعها، ولماذا؟'
      ),
      a: L(
        'The most volatile class — RAM, live connections and running processes. They are destroyed by a shutdown or a reboot and cannot be recovered afterwards.',
        'أكثر الفئات تطايرًا — الذاكرة والاتصالات المفتوحة والعمليات الجارية. فهي تُدمَّر بالإيقاف أو إعادة التشغيل ولا يمكن استعادتها لاحقًا.'
      )
    },
    {
      q: L(
        'Why is a hash taken on every collected file?',
        'لماذا تُحسب بصمة (Hash) لكل ملف مُجمَع؟'
      ),
      a: L(
        'The SHA-256 is the fingerprint of the file. Re-hashing the bundle later and getting identical values proves the evidence was not modified after collection.',
        '‏SHA-256 هو بصمة الملف (Fingerprint). إعادة حساب البصمات لاحقًا والحصول على نفس القيم يثبت أن الدليل لم يتغيّر بعد الجمع.'
      )
    },
    {
      q: L(
        'A device is found switched off at a scene. Why not simply power it on?',
        'وُجد جهاز مطفأ في مسرح الحادث. لماذا لا نشغّله ببساطة؟'
      ),
      a: L(
        'Booting writes a new operating system state onto the disk and alters the original evidence. The state must be preserved, documented and planned first.',
        'الإقلاع يكتب حالة نظام جديدة على القرص ويغيّر الدليل الأصلي. يجب حفظ الحالة وتوثيقها والتخطيط لها أولًا.'
      )
    },
    {
      q: L(
        'Where does the output of <code>Invoke-Command</code> come from, and where is it written?',
        'من أين تأتي مخرجات <code>Invoke-Command</code>، وأين تُكتب؟'
      ),
      a: L(
        'The command executes on the target and its output comes back to the analyst machine. When you pipe it to <code>Out-File</code> outside the script block, the file is written on the analyst machine.',
        'الأمر يُنفَّذ على الهدف وتعود مخرجاته إلى جهاز المحلل. عند توجيهها إلى <code>Out-File</code> خارج كتلة السكربت، تُكتب الملفات على جهاز المحلل.'
      )
    },
    {
      q: L(
        'Which seven fields does every row of the collection log need?',
        'ما الحقول السبعة التي يحتاجها كل صف في سجل الجمع؟'
      ),
      a: L(
        'Timestamp (UTC), analyst, host, command, output, hash, limitation. The limitation field is mandatory — a failed collection is a professional entry, a blank cell is a weak one.',
        'الوقت (UTC)، والمحلل، والجهاز، والأمر، والمخرج، والبصمة، والقيد. حقل القيود إلزامي — فالجمع الفاشل مُدخل احترافي، أما الفراغ فهو مُدخل ضعيف.'
      )
    }
  ];

  /* ------------------------------------------------------------------ meta */
  const meta = {
    course: L('Digital Forensics & Incident Response', 'التحليل الجنائي الرقمي والاستجابة للحوادث'),
    code: L('CCY3003', 'CCY3003'),
    section: L('Section 04', 'السكشن ٠٤'),
    title: L('Windows Evidence Lab', 'مختبر أدلة ويندوز'),
    subtitle: L(
      'A guided command coach for acquiring evidence locally and remotely.',
      'مرشد أوامر عملي لجمع الأدلة محليًا وعن بُعد.'
    ),
    outcome: L(
      'Collect one small, reproducible evidence bundle from a local host and from a remote lab host, and document every action well enough for another analyst to repeat it.',
      'اجمع حزمة أدلة صغيرة قابلة للتكرار من جهاز محلي وجهاز لاب بعيد، ووثّق كل إجراء بما يكفي ليكرّره محلل آخر.'
    ),
    duration: L('90 minutes', '٩٠ دقيقة'),
    level: L('Beginner friendly', 'مناسب للمبتدئين'),
    shell: L('Windows PowerShell 5.1 or PowerShell 7', 'Windows PowerShell 5.1 أو PowerShell 7')
  };

  const objectives = [
    L(
      'Decide the power state and the order of volatility before touching a host.',
      'تحدّد حالة تشغيل الجهاز وترتيب التطاير قبل لمس أي جهاز.'
    ),
    L(
      'Collect volatile, persistent and memory evidence with built-in tools only.',
      'تجمع أدلة متطايرة ودائمة وذاكرة بأدوات مدمجة فقط.'
    ),
    L(
      'Hash every output and write a collection log another analyst can follow.',
      'تحسب بصمة لكل مخرج وتكتب سجل جمع يستطيع محلل آخر متابعته.'
    ),
    L(
      'Repeat the same collection remotely and explain what the trade-off is.',
      'تكرّر الجمع نفسه عن بُعد وتشرح ما هي المفاضلة.'
    )
  ];

  const plan = [
    { t: L('Power state and order of volatility', 'حالة التشغيل وترتيب التطاير'), m: L('10 min', '١٠ د') },
    { t: L('Create the synthetic activity', 'إنشاء النشاط التجريبي'), m: L('10 min', '١٠ د') },
    { t: L('Local live collection', 'الجمع الحي المحلي'), m: L('20 min', '٢٠ د') },
    { t: L('Preserve and verify the bundle', 'حفظ الحزمة والتحقق منها'), m: L('20 min', '٢٠ د') },
    { t: L('Remote collection on DFIR-WIN02', 'الجمع البعيد على DFIR-WIN02'), m: L('20 min', '٢٠ د') },
    { t: L('Compare, document and submit', 'المقارنة والتوثيق والتسليم'), m: L('10 min', '١٠ د') }
  ];

  return {
    meta: meta,
    phases: phases,
    steps: steps,
    volatility: volatility,
    tools: tools,
    comparison: comparison,
    deliverables: deliverables,
    quiz: quiz,
    objectives: objectives,
    plan: plan
  };
})();
