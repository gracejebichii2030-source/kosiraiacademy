(function () {
  const LS_KEY = "AIC_KOSIRAI_SMS_DB_V1";
  const SESSION_KEY = "AIC_SMS_SESSION";
  const THEME_KEY = "AIC_SMS_THEME";
  const app = document.getElementById("app");

  function uid(prefix){
    return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
  }

  function loadDB(){
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
    const seed = window.AIC_SMS_SEED;
    localStorage.setItem(LS_KEY, JSON.stringify(seed));
    return JSON.parse(JSON.stringify(seed));
  }

  function saveDB(db){
    localStorage.setItem(LS_KEY, JSON.stringify(db));
  }

  function getSession(){
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  function setSession(session){
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  function clearSession(){
    localStorage.removeItem(SESSION_KEY);
  }

  function getTheme(){
    return localStorage.getItem(THEME_KEY) || "dark";
  }

  function setTheme(mode){
    const root = document.documentElement;
    if (mode === "light") root.setAttribute("data-theme", "light");
    else root.removeAttribute("data-theme");
    localStorage.setItem(THEME_KEY, mode);
  }

  function toggleTheme(){
    const current = getTheme();
    setTheme(current === "light" ? "dark" : "light");
    render();
  }

  function gradeFromMark(mark){
    if (mark >= 80) return "A";
    if (mark >= 70) return "B";
    if (mark >= 60) return "C";
    if (mark >= 50) return "D";
    return "E";
  }

  function meanFromMarks(marks){
    const arr = Object.values(marks || {});
    if (!arr.length) return 0;
    const sum = arr.reduce((a,b)=>a+b,0);
    return Math.round((sum / arr.length) * 10) / 10;
  }

  function fmtDate(ts){
    const d = new Date(ts);
    return d.toLocaleString();
  }

  function escapeHtml(str){
    return (str ?? "")
      .toString()
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function mount(html){
    app.innerHTML = html;
  }

  function wrapTables(html){
    return html.replace(/<table class="table">[\s\S]*?<\/table>/g, (m) => {
      return `<div class="table-wrap">${m}</div>`;
    });
  }

  function topbarView(session, opts){
    const role = session?.role || "";
    const name = session?.fullName || "";
    const pill = role === "teacher" ? "teacher" : "student";
    const roleLabel = role === "teacher" ? "Teacher Portal" : "Student Portal";

    const showAuth = !!session;
    const showMobileMenu = !!opts?.showMobileMenu;

    return `
      <div class="topbar">
        <div class="brand">
          ${showMobileMenu ? `<button class="btn icon mobileOnly" id="openDrawerBtn" aria-label="Open menu">☰</button>` : ""}
          <div class="logo" aria-hidden="true"></div>
          <div>
            <h1>AIC KOSIRAI ACADEMY</h1>
            <p>School Management System</p>
          </div>
        </div>

        <div class="userchip">
          ${showAuth ? `<span class="pill ${pill}">${roleLabel}</span>` : ""}
          ${showAuth ? `<span class="small">${escapeHtml(name)}</span>` : `<span class="small">Demo access. Password for all users: 1234</span>`}
          <button class="btn icon" id="themeBtn" aria-label="Toggle theme">${getTheme() === "light" ? "☀" : "🌙"}</button>
          ${showAuth ? `<button class="btn" id="logoutBtn">Sign out</button>` : ""}
        </div>
      </div>
    `;
  }

  function drawerView(session, navItems, activeKey){
    const roleLabel = session.role === "teacher" ? "Teacher Menu" : "Student Menu";
    const navButtons = navItems.map(n => `
      <button class="${n.key === activeKey ? "active" : ""}" data-nav="${n.key}">
        <span>${escapeHtml(n.label)}</span>
        <span class="small">${escapeHtml(n.hint || "")}</span>
      </button>
    `).join("");

    return `
      <div class="drawer mobileOnly" id="drawer">
        <div class="overlay" id="drawerOverlay"></div>
        <div class="panel" role="dialog" aria-modal="true" aria-label="${escapeHtml(roleLabel)}">
          <div class="drawerHeader">
            <div>
              <p class="drawerTitle">${escapeHtml(roleLabel)}</p>
              <div class="small">${escapeHtml(session.fullName || "")}</div>
            </div>
            <button class="btn icon" id="closeDrawerBtn" aria-label="Close menu">✕</button>
          </div>

          <div class="sidebar" style="margin-top:12px;">
            <div class="hero">
              <img src="assets/school.jpg" alt="AIC Kosirai Academy" />
              <div class="herotext">
                <h2>${escapeHtml(session.role === "teacher" ? "Teacher Workspace" : "Student Workspace")}</h2>
                <p>${escapeHtml(session.role === "teacher" ? "Plan, teach, assess, publish." : "Learn, submit, track progress.")}</p>
              </div>
            </div>
            <div class="nav" id="drawerNav">
              ${navButtons}
            </div>
          </div>

          <div class="drawerFooter">
            <button class="btn" id="themeBtnMobile">${getTheme() === "light" ? "Switch to dark" : "Switch to light"}</button>
            <button class="btn danger" id="logoutBtnMobile">Sign out</button>
          </div>
        </div>
      </div>
    `;
  }

  function openDrawer(){
    const el = document.getElementById("drawer");
    if (!el) return;
    el.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeDrawer(){
    const el = document.getElementById("drawer");
    if (!el) return;
    el.classList.remove("open");
    document.body.style.overflow = "";
  }

  function bindDrawerEvents(){
    const openBtn = document.getElementById("openDrawerBtn");
    const closeBtn = document.getElementById("closeDrawerBtn");
    const overlay = document.getElementById("drawerOverlay");
    const themeBtnMobile = document.getElementById("themeBtnMobile");
    const logoutBtnMobile = document.getElementById("logoutBtnMobile");
    const drawerNav = document.getElementById("drawerNav");

    if (openBtn) openBtn.onclick = openDrawer;
    if (closeBtn) closeBtn.onclick = closeDrawer;
    if (overlay) overlay.onclick = closeDrawer;

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeDrawer();
    });

    if (themeBtnMobile) themeBtnMobile.onclick = () => {
      toggleTheme();
    };

    if (logoutBtnMobile) logoutBtnMobile.onclick = () => {
      clearSession();
      closeDrawer();
      loginView("");
    };

    if (drawerNav){
      drawerNav.querySelectorAll("button[data-nav]").forEach(btn => {
        btn.onclick = () => {
          closeDrawer();
          routeTo(btn.getAttribute("data-nav"));
        };
      });
    }
  }

  function loginView(errMsg){
    mount(`
      <div class="container">
        ${topbarView(null, { showMobileMenu: false })}

        <div class="grid" style="grid-template-columns: 1fr 1fr;">
          <div class="main">
            <div class="header">
              <div>
                <h3>Welcome</h3>
                <p>Choose a role, then sign in.</p>
              </div>
              <div class="row" style="margin-top:0;">
                <span class="badge">Password: 1234</span>
              </div>
            </div>

            <div class="content">
              <div class="notice">
                School photo loads from assets/school.jpg. Save the photo with that name.
              </div>

              <div class="form" style="margin-top:14px;">
                <div class="field">
                  <label>Role</label>
                  <select id="role">
                    <option value="teacher">Teacher</option>
                    <option value="student">Student</option>
                  </select>
                </div>

                <div class="field">
                  <label>Username</label>
                  <input id="username" placeholder="teacher or student" />
                </div>

                <div class="field" style="grid-column: 1 / -1;">
                  <label>Password</label>
                  <input id="password" type="password" placeholder="1234" />
                </div>
              </div>

              ${errMsg ? `<div class="notice" style="border-color: rgba(239,68,68,.35); color: var(--text)">${escapeHtml(errMsg)}</div>` : ""}

              <div class="row">
                <button class="btn primary" id="signInBtn">Sign in</button>
                <button class="btn" id="resetBtn">Reset demo data</button>
              </div>

              <div class="notice">
                Demo stores data in the browser only.
              </div>
            </div>
          </div>

          <div class="sidebar desktopOnly">
            <div class="hero">
              <img src="assets/school.jpg" alt="AIC Kosirai Academy" />
              <div class="herotext">
                <h2>Administration Block</h2>
                <p>Teacher tools, student learning, school communication.</p>
              </div>
            </div>
            <div class="content">
              <div class="cards">
                <div class="card">
                  <h4>Teacher workspace</h4>
                  <p>Materials, lesson plans, timetable, assignments, results, announcements.</p>
                </div>
                <div class="card">
                  <h4>Student workspace</h4>
                  <p>Results, assignments, timetable, activities, announcements.</p>
                </div>
                <div class="card">
                  <h4>Subjects</h4>
                  <p>Mathematics, English, Kiswahili, CRE, Social Studies, Creative Arts and Sports, Integrated Science, Pre technical Studies, Agriculture.</p>
                </div>
              </div>
            </div>
          </div>

          <div class="sidebar mobileOnly">
            <div class="hero">
              <img src="assets/school.jpg" alt="AIC Kosirai Academy" />
              <div class="herotext">
                <h2>Administration Block</h2>
                <p>Mobile ready and fast.</p>
              </div>
            </div>
            <div class="content">
              <div class="notice">Tip: Use teacher / student with password 1234.</div>
            </div>
          </div>
        </div>
      </div>
    `);

    document.getElementById("themeBtn").onclick = toggleTheme;

    document.getElementById("signInBtn").onclick = () => {
      const db = loadDB();
      const role = document.getElementById("role").value;
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value;

      const u = db.users[role];
      const okUser = u && u.username === username && u.password === password;
      if (!okUser) return loginView("Wrong login details.");

      setSession({ role: u.role, username: u.username, fullName: u.fullName, className: u.className || "" });
      routeTo(role === "teacher" ? "t_dashboard" : "s_dashboard");
    };

    document.getElementById("resetBtn").onclick = () => {
      localStorage.removeItem(LS_KEY);
      clearSession();
      loginView("Demo data reset done.");
    };
  }

  function layoutView(session, navItems, activeKey, headerTitle, headerSub, bodyHtml){
    const navButtons = navItems.map(n => `
      <button class="${n.key === activeKey ? "active" : ""}" data-nav="${n.key}">
        <span>${escapeHtml(n.label)}</span>
        <span class="small">${escapeHtml(n.hint || "")}</span>
      </button>
    `).join("");

    const body = wrapTables(bodyHtml);

    mount(`
      <div class="container">
        ${topbarView(session, { showMobileMenu: true })}
        ${drawerView(session, navItems, activeKey)}

        <div class="grid">
          <div class="sidebar desktopOnly">
            <div class="hero">
              <img src="assets/school.jpg" alt="AIC Kosirai Academy" />
              <div class="herotext">
                <h2>${escapeHtml(session.role === "teacher" ? "Teacher Workspace" : "Student Workspace")}</h2>
                <p>${escapeHtml(session.role === "teacher" ? "Plan, teach, assess, publish." : "Learn, submit, track progress.")}</p>
              </div>
            </div>
            <div class="nav" id="nav">
              ${navButtons}
            </div>
          </div>

          <div class="main">
            <div class="header">
              <div>
                <h3>${escapeHtml(headerTitle)}</h3>
                <p>${escapeHtml(headerSub)}</p>
              </div>
              <div class="row" style="margin-top:0;">
                <span class="badge ${session.role === "teacher" ? "warn" : "good"}">${escapeHtml(session.role === "teacher" ? "Teacher Access" : "Student Access")}</span>
                ${session.role === "student" ? `<span class="badge">${escapeHtml(session.className || "")}</span>` : ""}
              </div>
            </div>

            <div class="content">
              ${body}
            </div>
          </div>
        </div>
      </div>
    `);

    document.getElementById("themeBtn").onclick = toggleTheme;

    document.getElementById("logoutBtn").onclick = () => {
      clearSession();
      loginView("");
    };

    const nav = document.getElementById("nav");
    if (nav){
      nav.querySelectorAll("button[data-nav]").forEach(btn => {
        btn.onclick = () => routeTo(btn.getAttribute("data-nav"));
      });
    }

    bindDrawerEvents();
  }

  function teacherNav(){
    return [
      { key:"t_dashboard", label:"Dashboard", hint:"Overview" },
      { key:"t_materials", label:"Course Materials", hint:"Upload" },
      { key:"t_plans", label:"Lesson Plans", hint:"Weekly" },
      { key:"t_timetable", label:"Timetables", hint:"Publish" },
      { key:"t_assignments", label:"Assignments", hint:"Create" },
      { key:"t_submissions", label:"Submissions", hint:"Grade" },
      { key:"t_results", label:"Results", hint:"Report cards" },
      { key:"t_announcements", label:"Announcements", hint:"Notices" }
    ];
  }

  function studentNav(){
    return [
      { key:"s_dashboard", label:"Dashboard", hint:"Today" },
      { key:"s_assignments", label:"Assignments", hint:"Submit" },
      { key:"s_results", label:"Results", hint:"Report" },
      { key:"s_timetable", label:"Timetable", hint:"Weekly" },
      { key:"s_activities", label:"Activities", hint:"Clubs" },
      { key:"s_announcements", label:"Announcements", hint:"Notices" }
    ];
  }

  function teacherDashboard(db, session){
    const pending = db.assignments.length;
    const submissions = db.submissions.length;
    const publishedResults = db.results.filter(r => r.published).length;

    const recentA = [...db.announcements]
      .sort((a,b)=>b.createdAt-a.createdAt)
      .slice(0,4)
      .map(a => `<tr><td>${escapeHtml(a.title)}</td><td>${a.pinned ? `<span class="badge warn">Pinned</span>` : `<span class="badge">Normal</span>`}</td><td>${escapeHtml(fmtDate(a.createdAt))}</td></tr>`)
      .join("");

    const body = `
      <div class="cards">
        <div class="card"><h4>Assignments</h4><p>Active tasks</p><div class="kpi">${pending}</div></div>
        <div class="card"><h4>Submissions</h4><p>Received work</p><div class="kpi">${submissions}</div></div>
        <div class="card"><h4>Published results</h4><p>Visible to students</p><div class="kpi">${publishedResults}</div></div>
      </div>

      <div class="split" style="margin-top:12px;">
        <div class="card">
          <h4>Quick actions</h4>
          <p>Post, upload, publish fast.</p>
          <div class="row">
            <button class="btn primary" data-go="t_assignments">New assignment</button>
            <button class="btn good" data-go="t_results">Publish results</button>
            <button class="btn" data-go="t_materials">Upload material</button>
          </div>
          <div class="notice">Demo data stays inside the browser.</div>
        </div>

        <div class="card">
          <h4>School subjects</h4>
          <p>Available subjects list.</p>
          <div class="notice">${db.subjects.map(s=>escapeHtml(s)).join(" | ")}</div>
        </div>
      </div>

      <table class="table">
        <thead><tr><th>Recent announcements</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${recentA || `<tr><td colspan="3" class="small">No announcements.</td></tr>`}</tbody>
      </table>
    `;

    layoutView(session, teacherNav(), "t_dashboard",
      "Teacher Dashboard",
      "Manage learning content, assessment, and communication.",
      body
    );

    document.querySelectorAll("button[data-go]").forEach(b=>{
      b.onclick = () => routeTo(b.getAttribute("data-go"));
    });
  }

  function teacherMaterials(db, session){
    const rows = [...db.materials]
      .sort((a,b)=>b.createdAt-a.createdAt)
      .map(m => `
        <tr>
          <td>${escapeHtml(m.title)}</td>
          <td>${escapeHtml(m.subject)}</td>
          <td>${escapeHtml(m.className)}</td>
          <td>${escapeHtml(m.fileName)}</td>
          <td>${escapeHtml(fmtDate(m.createdAt))}</td>
        </tr>
      `).join("");

    const subjectOptions = db.subjects.map(s=>`<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join("");
    const classOptions = db.classes.map(c=>`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");

    const body = `
      <div class="card">
        <h4>Upload course material</h4>
        <p>Stores the file name and details for demo use.</p>

        <div class="form">
          <div class="field">
            <label>Subject</label>
            <select id="m_subject">${subjectOptions}</select>
          </div>
          <div class="field">
            <label>Class</label>
            <select id="m_class">${classOptions}</select>
          </div>
          <div class="field" style="grid-column: 1 / -1;">
            <label>Title</label>
            <input id="m_title" placeholder="Example: Algebra Week 2 Notes" />
          </div>
          <div class="field" style="grid-column: 1 / -1;">
            <label>Description</label>
            <textarea id="m_desc" placeholder="Short description"></textarea>
          </div>
          <div class="field" style="grid-column: 1 / -1;">
            <label>File</label>
            <input id="m_file" type="file" />
          </div>
        </div>

        <div class="row">
          <button class="btn primary" id="m_add">Save material</button>
          <button class="btn danger" id="m_clear">Clear all materials</button>
        </div>
        <div class="notice">GitHub Pages has no backend storage. Demo uses local storage.</div>
      </div>

      <table class="table">
        <thead><tr><th>Title</th><th>Subject</th><th>Class</th><th>File</th><th>Created</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="5" class="small">No materials.</td></tr>`}</tbody>
      </table>
    `;

    layoutView(session, teacherNav(), "t_materials",
      "Course Materials",
      "Upload and organize learning content by subject and class.",
      body
    );

    document.getElementById("m_add").onclick = () => {
      const title = document.getElementById("m_title").value.trim();
      const desc = document.getElementById("m_desc").value.trim();
      const subject = document.getElementById("m_subject").value;
      const className = document.getElementById("m_class").value;
      const file = document.getElementById("m_file").files[0];

      if (!title) return routeTo("t_materials");

      db.materials.unshift({
        id: uid("mat"),
        subject,
        className,
        title,
        description: desc,
        fileName: file ? file.name : "no_file",
        createdAt: Date.now()
      });

      saveDB(db);
      routeTo("t_materials");
    };

    document.getElementById("m_clear").onclick = () => {
      db.materials = [];
      saveDB(db);
      routeTo("t_materials");
    };
  }

  function teacherPlans(db, session){
    db.lessonPlans = db.lessonPlans || [];

    const subjectOptions = db.subjects.map(s=>`<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join("");
    const classOptions = db.classes.map(c=>`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");

    const rows = [...db.lessonPlans]
      .sort((a,b)=>b.createdAt-a.createdAt)
      .map(p => `
        <tr>
          <td>${escapeHtml(p.week)}</td>
          <td>${escapeHtml(p.subject)}</td>
          <td>${escapeHtml(p.className)}</td>
          <td>${escapeHtml(p.topic)}</td>
          <td>${escapeHtml(fmtDate(p.createdAt))}</td>
        </tr>
      `).join("");

    const body = `
      <div class="card">
        <h4>Create lesson plan</h4>
        <p>Write objectives, activities, resources, and homework.</p>

        <div class="form">
          <div class="field">
            <label>Week</label>
            <input id="p_week" placeholder="Example: Week 3" />
          </div>
          <div class="field">
            <label>Subject</label>
            <select id="p_subject">${subjectOptions}</select>
          </div>
          <div class="field">
            <label>Class</label>
            <select id="p_class">${classOptions}</select>
          </div>
          <div class="field">
            <label>Topic</label>
            <input id="p_topic" placeholder="Example: Fractions" />
          </div>
          <div class="field" style="grid-column: 1 / -1;">
            <label>Objectives</label>
            <textarea id="p_obj" placeholder="Learning objectives"></textarea>
          </div>
          <div class="field" style="grid-column: 1 / -1;">
            <label>Activities</label>
            <textarea id="p_act" placeholder="Class activities"></textarea>
          </div>
          <div class="field" style="grid-column: 1 / -1;">
            <label>Resources</label>
            <textarea id="p_res" placeholder="Books, worksheets, lab items"></textarea>
          </div>
          <div class="field" style="grid-column: 1 / -1;">
            <label>Homework</label>
            <textarea id="p_hw" placeholder="Homework tasks"></textarea>
          </div>
        </div>

        <div class="row">
          <button class="btn primary" id="p_add">Save plan</button>
          <button class="btn danger" id="p_clear">Clear all plans</button>
        </div>
      </div>

      <table class="table">
        <thead><tr><th>Week</th><th>Subject</th><th>Class</th><th>Topic</th><th>Created</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="5" class="small">No lesson plans.</td></tr>`}</tbody>
      </table>
    `;

    layoutView(session, teacherNav(), "t_plans",
      "Lesson Plans",
      "Plan weekly instruction and store a professional record.",
      body
    );

    document.getElementById("p_add").onclick = () => {
      const week = document.getElementById("p_week").value.trim();
      const subject = document.getElementById("p_subject").value;
      const className = document.getElementById("p_class").value;
      const topic = document.getElementById("p_topic").value.trim();
      const objectives = document.getElementById("p_obj").value.trim();
      const activities = document.getElementById("p_act").value.trim();
      const resources = document.getElementById("p_res").value.trim();
      const homework = document.getElementById("p_hw").value.trim();

      if (!week || !topic) return routeTo("t_plans");

      db.lessonPlans.unshift({
        id: uid("plan"),
        week, subject, className, topic,
        objectives, activities, resources, homework,
        createdAt: Date.now()
      });

      saveDB(db);
      routeTo("t_plans");
    };

    document.getElementById("p_clear").onclick = () => {
      db.lessonPlans = [];
      saveDB(db);
      routeTo("t_plans");
    };
  }

  function teacherTimetable(db, session){
    const classOptions = db.classes.map(c=>`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
    const subjectOptions = db.subjects.map(s=>`<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join("");
    const dayOptions = ["Monday","Tuesday","Wednesday","Thursday","Friday"].map(d=>`<option value="${d}">${d}</option>`).join("");

    const rows = [...db.timetable].map(t=>`
      <tr>
        <td>${escapeHtml(t.className)}</td>
        <td>${escapeHtml(t.day)}</td>
        <td>${escapeHtml(t.slot)}</td>
        <td>${escapeHtml(t.subject)}</td>
      </tr>
    `).join("");

    const body = `
      <div class="card">
        <h4>Timetable entry</h4>
        <p>Add lessons by class, day, and time slot.</p>

        <div class="form">
          <div class="field">
            <label>Class</label>
            <select id="tt_class">${classOptions}</select>
          </div>
          <div class="field">
            <label>Day</label>
            <select id="tt_day">${dayOptions}</select>
          </div>
          <div class="field">
            <label>Time slot</label>
            <input id="tt_slot" placeholder="Example: 10:00 - 10:40" />
          </div>
          <div class="field">
            <label>Subject</label>
            <select id="tt_subject">${subjectOptions}</select>
          </div>
        </div>

        <div class="row">
          <button class="btn primary" id="tt_add">Add lesson</button>
          <button class="btn danger" id="tt_clear">Clear timetable</button>
        </div>
      </div>

      <table class="table">
        <thead><tr><th>Class</th><th>Day</th><th>Time</th><th>Subject</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="4" class="small">No timetable entries.</td></tr>`}</tbody>
      </table>
    `;

    layoutView(session, teacherNav(), "t_timetable",
      "Timetables",
      "Build timetables and publish to student view.",
      body
    );

    document.getElementById("tt_add").onclick = () => {
      const className = document.getElementById("tt_class").value;
      const day = document.getElementById("tt_day").value;
      const slot = document.getElementById("tt_slot").value.trim();
      const subject = document.getElementById("tt_subject").value;
      if (!slot) return routeTo("t_timetable");

      db.timetable.push({ id: uid("tt"), className, day, slot, subject });
      saveDB(db);
      routeTo("t_timetable");
    };

    document.getElementById("tt_clear").onclick = () => {
      db.timetable = [];
      saveDB(db);
      routeTo("t_timetable");
    };
  }

  function teacherAssignments(db, session){
    const classOptions = db.classes.map(c=>`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
    const subjectOptions = db.subjects.map(s=>`<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join("");

    const rows = [...db.assignments]
      .sort((a,b)=>b.createdAt-a.createdAt)
      .map(a=>`
        <tr>
          <td>${escapeHtml(a.title)}</td>
          <td>${escapeHtml(a.subject)}</td>
          <td>${escapeHtml(a.className)}</td>
          <td>${escapeHtml(new Date(a.dueAt).toLocaleDateString())}</td>
        </tr>
      `).join("");

    const body = `
      <div class="card">
        <h4>Create assignment</h4>
        <p>Set title, instructions, due date, and attachment.</p>

        <div class="form">
          <div class="field">
            <label>Subject</label>
            <select id="a_subject">${subjectOptions}</select>
          </div>
          <div class="field">
            <label>Class</label>
            <select id="a_class">${classOptions}</select>
          </div>
          <div class="field" style="grid-column: 1 / -1;">
            <label>Title</label>
            <input id="a_title" placeholder="Example: Fractions Worksheet" />
          </div>
          <div class="field" style="grid-column: 1 / -1;">
            <label>Instructions</label>
            <textarea id="a_inst" placeholder="Assignment details"></textarea>
          </div>
          <div class="field">
            <label>Due date</label>
            <input id="a_due" type="date" />
          </div>
          <div class="field">
            <label>Attachment</label>
            <input id="a_file" type="file" />
          </div>
        </div>

        <div class="row">
          <button class="btn primary" id="a_add">Save assignment</button>
          <button class="btn danger" id="a_clear">Clear assignments</button>
        </div>
      </div>

      <table class="table">
        <thead><tr><th>Title</th><th>Subject</th><th>Class</th><th>Due</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="4" class="small">No assignments.</td></tr>`}</tbody>
      </table>
    `;

    layoutView(session, teacherNav(), "t_assignments",
      "Assignments",
      "Create and publish assignments for student submission.",
      body
    );

    document.getElementById("a_add").onclick = () => {
      const subject = document.getElementById("a_subject").value;
      const className = document.getElementById("a_class").value;
      const title = document.getElementById("a_title").value.trim();
      const instructions = document.getElementById("a_inst").value.trim();
      const dueStr = document.getElementById("a_due").value;
      const file = document.getElementById("a_file").files[0];

      if (!title || !dueStr) return routeTo("t_assignments");

      db.assignments.unshift({
        id: uid("as"),
        subject,
        className,
        title,
        instructions,
        dueAt: new Date(dueStr + "T23:59:00").getTime(),
        fileName: file ? file.name : "no_file",
        createdAt: Date.now()
      });

      saveDB(db);
      routeTo("t_assignments");
    };

    document.getElementById("a_clear").onclick = () => {
      db.assignments = [];
      db.submissions = [];
      saveDB(db);
      routeTo("t_assignments");
    };
  }

  function teacherSubmissions(db, session){
    const rows = [...db.submissions]
      .sort((a,b)=>b.submittedAt-a.submittedAt)
      .map(s=>{
        const asg = db.assignments.find(x=>x.id===s.assignmentId);
        const title = asg ? asg.title : "Unknown assignment";
        const grade = typeof s.grade === "number" ? `${s.grade}% (${gradeFromMark(s.grade)})` : "Not graded";
        return `
          <tr>
            <td>${escapeHtml(title)}</td>
            <td>${escapeHtml(s.student)}</td>
            <td>${escapeHtml(s.fileName)}</td>
            <td>${escapeHtml(fmtDate(s.submittedAt))}</td>
            <td>${escapeHtml(grade)}</td>
          </tr>
        `;
      }).join("");

    const assignmentOptions = db.assignments
      .map(a=>`<option value="${a.id}">${escapeHtml(a.title)} | ${escapeHtml(a.className)} | ${escapeHtml(a.subject)}</option>`)
      .join("");

    const body = `
      <div class="card">
        <h4>Grade submission</h4>
        <p>Select an assignment. Save a grade and feedback.</p>

        <div class="form">
          <div class="field" style="grid-column: 1 / -1;">
            <label>Assignment</label>
            <select id="g_asg">${assignmentOptions || `<option value="">No assignments</option>`}</select>
          </div>
          <div class="field">
            <label>Student username</label>
            <input id="g_student" value="student" />
          </div>
          <div class="field">
            <label>Mark percent</label>
            <input id="g_mark" type="number" min="0" max="100" placeholder="Example: 78" />
          </div>
          <div class="field" style="grid-column: 1 / -1;">
            <label>Feedback</label>
            <textarea id="g_feedback" placeholder="Feedback text"></textarea>
          </div>
        </div>

        <div class="row">
          <button class="btn primary" id="g_save">Save grade</button>
        </div>
      </div>

      <table class="table">
        <thead><tr><th>Assignment</th><th>Student</th><th>File</th><th>Submitted</th><th>Grade</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="5" class="small">No submissions.</td></tr>`}</tbody>
      </table>
    `;

    layoutView(session, teacherNav(), "t_submissions",
      "Submissions and Grading",
      "View submissions and store grades with feedback.",
      body
    );

    document.getElementById("g_save").onclick = () => {
      const assignmentId = document.getElementById("g_asg").value;
      const student = document.getElementById("g_student").value.trim() || "student";
      const markRaw = document.getElementById("g_mark").value;
      const feedback = document.getElementById("g_feedback").value.trim();

      if (!assignmentId) return routeTo("t_submissions");

      const mark = Number(markRaw);
      let sub = db.submissions.find(x => x.assignmentId === assignmentId && x.student === student);
      if (!sub){
        sub = {
          id: uid("sub"),
          assignmentId,
          student,
          fileName: "submission_file",
          note: "Teacher graded entry.",
          submittedAt: Date.now()
        };
        db.submissions.unshift(sub);
      }
      sub.grade = Number.isFinite(mark) ? Math.max(0, Math.min(100, mark)) : undefined;
      sub.feedback = feedback;

      saveDB(db);
      routeTo("t_submissions");
    };
  }

  function teacherResults(db, session){
    const termOptions = ["Term 1 2026","Term 2 2026","Term 3 2026"].map(t=>`<option value="${t}">${t}</option>`).join("");
    const classOptions = db.classes.map(c=>`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");

    const subjectFields = db.subjects.map(s=>`
      <div class="field">
        <label>${escapeHtml(s)} mark</label>
        <input data-mark="${escapeHtml(s)}" type="number" min="0" max="100" placeholder="0 to 100" />
      </div>
    `).join("");

    const rows = [...db.results]
      .sort((a,b)=>b.createdAt-a.createdAt)
      .map(r=>{
        const mean = meanFromMarks(r.marks);
        return `
          <tr>
            <td>${escapeHtml(r.student)}</td>
            <td>${escapeHtml(r.className)}</td>
            <td>${escapeHtml(r.term)}</td>
            <td>${escapeHtml(mean)}</td>
            <td>${r.published ? `<span class="badge good">Published</span>` : `<span class="badge warn">Draft</span>`}</td>
          </tr>
        `;
      }).join("");

    const body = `
      <div class="card">
        <h4>Upload results</h4>
        <p>Enter marks, then publish to student report view.</p>

        <div class="form">
          <div class="field">
            <label>Student username</label>
            <input id="r_student" value="student" />
          </div>
          <div class="field">
            <label>Class</label>
            <select id="r_class">${classOptions}</select>
          </div>
          <div class="field" style="grid-column: 1 / -1;">
            <label>Term</label>
            <select id="r_term">${termOptions}</select>
          </div>

          ${subjectFields}
        </div>

        <div class="row">
          <button class="btn primary" id="r_save">Save draft</button>
          <button class="btn good" id="r_publish">Save and publish</button>
          <button class="btn danger" id="r_clear">Clear all results</button>
        </div>
      </div>

      <table class="table">
        <thead><tr><th>Student</th><th>Class</th><th>Term</th><th>Mean</th><th>Status</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="5" class="small">No results.</td></tr>`}</tbody>
      </table>
    `;

    layoutView(session, teacherNav(), "t_results",
      "Results and Report Cards",
      "Store marks per subject, compute mean, publish to students.",
      body
    );

    function collectMarks(){
      const marks = {};
      document.querySelectorAll("input[data-mark]").forEach(inp=>{
        const s = inp.getAttribute("data-mark");
        const v = Number(inp.value);
        if (Number.isFinite(v)) marks[s] = Math.max(0, Math.min(100, v));
      });
      return marks;
    }

    function saveResult(publish){
      const student = document.getElementById("r_student").value.trim() || "student";
      const className = document.getElementById("r_class").value;
      const term = document.getElementById("r_term").value;
      const marks = collectMarks();

      if (!Object.keys(marks).length) return routeTo("t_results");

      db.results.unshift({
        id: uid("res"),
        term,
        student,
        className,
        marks,
        published: !!publish,
        createdAt: Date.now()
      });

      saveDB(db);
      routeTo("t_results");
    }

    document.getElementById("r_save").onclick = () => saveResult(false);
    document.getElementById("r_publish").onclick = () => saveResult(true);
    document.getElementById("r_clear").onclick = () => {
      db.results = [];
      saveDB(db);
      routeTo("t_results");
    };
  }

  function teacherAnnouncements(db, session){
    const rows = [...db.announcements]
      .sort((a,b)=>b.createdAt-a.createdAt)
      .map(a=>`
        <tr>
          <td>${escapeHtml(a.title)}</td>
          <td>${a.pinned ? `<span class="badge warn">Pinned</span>` : `<span class="badge">Normal</span>`}</td>
          <td>${escapeHtml(fmtDate(a.createdAt))}</td>
        </tr>
      `).join("");

    const body = `
      <div class="card">
        <h4>Post announcement</h4>
        <p>Send notices to all students.</p>

        <div class="form">
          <div class="field" style="grid-column: 1 / -1;">
            <label>Title</label>
            <input id="n_title" placeholder="Example: Parents Meeting" />
          </div>
          <div class="field" style="grid-column: 1 / -1;">
            <label>Message</label>
            <textarea id="n_body" placeholder="Announcement text"></textarea>
          </div>
          <div class="field">
            <label>Pin</label>
            <select id="n_pin">
              <option value="no">Normal</option>
              <option value="yes">Pinned</option>
            </select>
          </div>
        </div>

        <div class="row">
          <button class="btn primary" id="n_add">Post</button>
          <button class="btn danger" id="n_clear">Clear announcements</button>
        </div>
      </div>

      <table class="table">
        <thead><tr><th>Title</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="3" class="small">No announcements.</td></tr>`}</tbody>
      </table>
    `;

    layoutView(session, teacherNav(), "t_announcements",
      "Announcements",
      "Publish school notices and pin urgent messages.",
      body
    );

    document.getElementById("n_add").onclick = () => {
      const title = document.getElementById("n_title").value.trim();
      const body = document.getElementById("n_body").value.trim();
      const pinned = document.getElementById("n_pin").value === "yes";
      if (!title || !body) return routeTo("t_announcements");

      db.announcements.unshift({ id: uid("ann"), title, body, pinned, createdAt: Date.now() });
      saveDB(db);
      routeTo("t_announcements");
    };

    document.getElementById("n_clear").onclick = () => {
      db.announcements = [];
      saveDB(db);
      routeTo("t_announcements");
    };
  }

  function studentDashboard(db, session){
    const cls = session.className || "JSS 2";
    const today = new Date().toLocaleDateString(undefined, { weekday: "long" });
    const todayRows = db.timetable.filter(t => t.className === cls && t.day === today).slice(0,6);

    const aCards = [...db.announcements]
      .sort((a,b)=>b.createdAt-a.createdAt)
      .slice(0,3)
      .map(a=>`
        <div class="card">
          <h4>${escapeHtml(a.title)} ${a.pinned ? `<span class="badge warn">Pinned</span>` : ""}</h4>
          <p>${escapeHtml(a.body)}</p>
          <div class="small">${escapeHtml(fmtDate(a.createdAt))}</div>
        </div>
      `).join("");

    const upcoming = [...db.assignments]
      .filter(a=>a.className===cls)
      .sort((a,b)=>a.dueAt-b.dueAt)
      .slice(0,4)
      .map(a=>{
        const sub = db.submissions.find(s=>s.assignmentId===a.id && s.student===session.username);
        const status = sub ? "Submitted" : "Pending";
        const badge = sub ? "good" : "warn";
        return `
          <tr>
            <td>${escapeHtml(a.title)}</td>
            <td>${escapeHtml(a.subject)}</td>
            <td>${escapeHtml(new Date(a.dueAt).toLocaleDateString())}</td>
            <td><span class="badge ${badge}">${status}</span></td>
          </tr>
        `;
      }).join("");

    const latestResult = db.results.find(r => r.student === session.username && r.published);
    const mean = latestResult ? meanFromMarks(latestResult.marks) : 0;

    const body = `
      <div class="cards">
        <div class="card"><h4>Class</h4><p>Current class</p><div class="kpi">${escapeHtml(cls)}</div></div>
        <div class="card"><h4>Latest mean</h4><p>Published result</p><div class="kpi">${latestResult ? mean : "-"}</div></div>
        <div class="card"><h4>Grade</h4><p>Based on mean</p><div class="kpi">${latestResult ? gradeFromMark(mean) : "-"}</div></div>
      </div>

      <div class="split" style="margin-top:12px;">
        <div class="card">
          <h4>Upcoming assignments</h4>
          <p>Due dates and status.</p>
          <table class="table">
            <thead><tr><th>Title</th><th>Subject</th><th>Due</th><th>Status</th></tr></thead>
            <tbody>${upcoming || `<tr><td colspan="4" class="small">No assignments.</td></tr>`}</tbody>
          </table>
        </div>

        <div class="card">
          <h4>Today timetable</h4>
          <p>${escapeHtml(today)} for ${escapeHtml(cls)}</p>
          <table class="table">
            <thead><tr><th>Time</th><th>Subject</th></tr></thead>
            <tbody>
              ${todayRows.map(r=>`<tr><td>${escapeHtml(r.slot)}</td><td>${escapeHtml(r.subject)}</td></tr>`).join("") || `<tr><td colspan="2" class="small">No lessons for today.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>

      <div style="margin-top:12px;">
        <div class="header" style="border:0;padding:0 0 10px 0;">
          <div>
            <h3 style="margin:0;font-size:14px;">Announcements</h3>
            <p style="margin:6px 0 0;color:var(--muted);font-size:12px;">School updates and notices.</p>
          </div>
        </div>
        <div class="cards">
          ${aCards || `<div class="notice">No announcements.</div>`}
        </div>
      </div>
    `;

    layoutView(session, studentNav(), "s_dashboard",
      "Student Dashboard",
      "View timetable, assignments, announcements, and results.",
      body
    );
  }

  function studentAssignments(db, session){
    const cls = session.className || "JSS 2";

    const rows = [...db.assignments]
      .filter(a=>a.className===cls)
      .sort((a,b)=>a.dueAt-b.dueAt)
      .map(a=>{
        const sub = db.submissions.find(s=>s.assignmentId===a.id && s.student===session.username);
        const status = sub ? `<span class="badge good">Submitted</span>` : `<span class="badge warn">Pending</span>`;
        return `
          <tr>
            <td>${escapeHtml(a.title)}</td>
            <td>${escapeHtml(a.subject)}</td>
            <td>${escapeHtml(new Date(a.dueAt).toLocaleDateString())}</td>
            <td>${status}</td>
          </tr>
        `;
      }).join("");

    const options = db.assignments
      .filter(a=>a.className===cls)
      .map(a=>`<option value="${a.id}">${escapeHtml(a.title)} | ${escapeHtml(a.subject)} | Due ${escapeHtml(new Date(a.dueAt).toLocaleDateString())}</option>`)
      .join("");

    const body = `
      <div class="card">
        <h4>Submit assignment</h4>
        <p>Upload your work and add a note.</p>

        <div class="form">
          <div class="field" style="grid-column: 1 / -1;">
            <label>Assignment</label>
            <select id="sa_asg">${options || `<option value="">No assignments</option>`}</select>
          </div>
          <div class="field" style="grid-column: 1 / -1;">
            <label>Work file</label>
            <input id="sa_file" type="file" />
          </div>
          <div class="field" style="grid-column: 1 / -1;">
            <label>Note</label>
            <textarea id="sa_note" placeholder="Short note to the teacher"></textarea>
          </div>
        </div>

        <div class="row">
          <button class="btn primary" id="sa_submit">Submit</button>
        </div>

        <div class="notice">Demo stores submission record in local storage.</div>
      </div>

      <table class="table">
        <thead><tr><th>Title</th><th>Subject</th><th>Due</th><th>Status</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="4" class="small">No assignments.</td></tr>`}</tbody>
      </table>
    `;

    layoutView(session, studentNav(), "s_assignments",
      "Assignments",
      "View assignments and submit work before due date.",
      body
    );

    document.getElementById("sa_submit").onclick = () => {
      const assignmentId = document.getElementById("sa_asg").value;
      const file = document.getElementById("sa_file").files[0];
      const note = document.getElementById("sa_note").value.trim();

      if (!assignmentId) return routeTo("s_assignments");

      let sub = db.submissions.find(x => x.assignmentId === assignmentId && x.student === session.username);
      if (!sub){
        sub = { id: uid("sub"), assignmentId, student: session.username };
        db.submissions.unshift(sub);
      }
      sub.fileName = file ? file.name : "no_file";
      sub.note = note || "Submitted.";
      sub.submittedAt = Date.now();

      saveDB(db);
      routeTo("s_assignments");
    };
  }

  function studentResults(db, session){
    const published = db.results
      .filter(r => r.student === session.username && r.published)
      .sort((a,b)=>b.createdAt-a.createdAt);

    const latest = published[0];

    const body = latest ? (() => {
      const marksRows = Object.entries(latest.marks)
        .map(([sub, mark])=>{
          const g = gradeFromMark(mark);
          return `<tr><td>${escapeHtml(sub)}</td><td>${escapeHtml(mark)}</td><td>${escapeHtml(g)}</td></tr>`;
        }).join("");

      const mean = meanFromMarks(latest.marks);

      return `
        <div class="cards">
          <div class="card"><h4>Term</h4><p>Report period</p><div class="kpi">${escapeHtml(latest.term)}</div></div>
          <div class="card"><h4>Mean</h4><p>Average mark</p><div class="kpi">${escapeHtml(mean)}</div></div>
          <div class="card"><h4>Grade</h4><p>Based on mean</p><div class="kpi">${escapeHtml(gradeFromMark(mean))}</div></div>
        </div>

        <table class="table">
          <thead><tr><th>Subject</th><th>Mark</th><th>Grade</th></tr></thead>
          <tbody>${marksRows}</tbody>
        </table>

        <div class="notice">Students see published reports only.</div>
      `;
    })() : `
      <div class="notice">No published results yet.</div>
    `;

    layoutView(session, studentNav(), "s_results",
      "Results",
      "View published report cards and subject marks.",
      body
    );
  }

  function studentTimetable(db, session){
    const cls = session.className || "JSS 2";
    const days = ["Monday","Tuesday","Wednesday","Thursday","Friday"];

    const dayBlocks = days.map(day=>{
      const rows = db.timetable
        .filter(t => t.className === cls && t.day === day)
        .sort((a,b)=>a.slot.localeCompare(b.slot));

      return `
        <div class="card">
          <h4>${day}</h4>
          <p>${escapeHtml(cls)} timetable</p>
          <table class="table">
            <thead><tr><th>Time</th><th>Subject</th></tr></thead>
            <tbody>
              ${rows.map(r=>`<tr><td>${escapeHtml(r.slot)}</td><td>${escapeHtml(r.subject)}</td></tr>`).join("") || `<tr><td colspan="2" class="small">No lessons.</td></tr>`}
            </tbody>
          </table>
        </div>
      `;
    }).join("");

    layoutView(session, studentNav(), "s_timetable",
      "Timetable",
      "View weekly class timetable.",
      `<div class="cards" style="grid-template-columns: 1fr; gap:12px;">${dayBlocks}</div>`
    );
  }

  function studentActivities(db, session){
    const rows = [...db.activities].map(a=>`
      <tr>
        <td>${escapeHtml(a.title)}</td>
        <td>${escapeHtml(a.day)}</td>
        <td>${escapeHtml(a.time)}</td>
        <td>${escapeHtml(a.venue)}</td>
      </tr>
    `).join("");

    layoutView(session, studentNav(), "s_activities",
      "Activities",
      "Clubs, sports, and school programs.",
      `
        <div class="card">
          <h4>Weekly activities</h4>
          <p>Join a club and build skills.</p>
          <table class="table">
            <thead><tr><th>Activity</th><th>Day</th><th>Time</th><th>Venue</th></tr></thead>
            <tbody>${rows || `<tr><td colspan="4" class="small">No activities.</td></tr>`}</tbody>
          </table>
        </div>
      `
    );
  }

  function studentAnnouncements(db, session){
    const items = [...db.announcements]
      .sort((a,b)=> (b.pinned - a.pinned) || (b.createdAt - a.createdAt))
      .map(a=>`
        <div class="card">
          <h4>${escapeHtml(a.title)} ${a.pinned ? `<span class="badge warn">Pinned</span>` : ""}</h4>
          <p>${escapeHtml(a.body)}</p>
          <div class="small">${escapeHtml(fmtDate(a.createdAt))}</div>
        </div>
      `).join("");

    layoutView(session, studentNav(), "s_announcements",
      "Announcements",
      "Read pinned notices and school updates.",
      `<div class="cards">${items || `<div class="notice">No announcements.</div>`}</div>`
    );
  }

  function routeTo(key){
    location.hash = "#" + key;
    render();
  }

  function render(){
    setTheme(getTheme());

    const db = loadDB();
    const session = getSession();

    if (!session) return loginView("");

    const key = (location.hash || "").replace("#","");
    const isTeacher = session.role === "teacher";
    const isStudent = session.role === "student";

    if (isTeacher){
      if (!key || !key.startsWith("t_")) return routeTo("t_dashboard");
      if (key === "t_dashboard") return teacherDashboard(db, session);
      if (key === "t_materials") return teacherMaterials(db, session);
      if (key === "t_plans") return teacherPlans(db, session);
      if (key === "t_timetable") return teacherTimetable(db, session);
      if (key === "t_assignments") return teacherAssignments(db, session);
      if (key === "t_submissions") return teacherSubmissions(db, session);
      if (key === "t_results") return teacherResults(db, session);
      if (key === "t_announcements") return teacherAnnouncements(db, session);
      return routeTo("t_dashboard");
    }

    if (isStudent){
      if (!key || !key.startsWith("s_")) return routeTo("s_dashboard");
      if (key === "s_dashboard") return studentDashboard(db, session);
      if (key === "s_assignments") return studentAssignments(db, session);
      if (key === "s_results") return studentResults(db, session);
      if (key === "s_timetable") return studentTimetable(db, session);
      if (key === "s_activities") return studentActivities(db, session);
      if (key === "s_announcements") return studentAnnouncements(db, session);
      return routeTo("s_dashboard");
    }

    loginView("");
  }

  window.addEventListener("hashchange", render);
  render();
})();
