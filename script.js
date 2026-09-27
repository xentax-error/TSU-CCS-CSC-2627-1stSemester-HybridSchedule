(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     Theme (identical behavior to the exam-schedule site, kept in sync
     on purpose so switching between the two sites feels the same).
     --------------------------------------------------------------------- */
  const THEME_KEY = "ccs-theme-preference";
  const root = document.documentElement;
  const themeLightBtn = document.getElementById("themeLightBtn");
  const themeDarkBtn = document.getElementById("themeDarkBtn");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)");

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    themeLightBtn.setAttribute("aria-pressed", String(theme === "light"));
    themeDarkBtn.setAttribute("aria-pressed", String(theme === "dark"));
  }
  function getStoredTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  }
  function storeTheme(theme) {
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* ignore */ }
  }
  function initTheme() {
    const stored = getStoredTheme();
    if (stored === "dark" || stored === "light") applyTheme(stored);
    else applyTheme(systemPrefersDark.matches ? "dark" : "light");
  }
  themeLightBtn.addEventListener("click", function () { applyTheme("light"); storeTheme("light"); });
  themeDarkBtn.addEventListener("click", function () { applyTheme("dark"); storeTheme("dark"); });
  systemPrefersDark.addEventListener("change", function (e) {
    if (!getStoredTheme()) applyTheme(e.matches ? "dark" : "light");
  });
  initTheme();

  /* ---------------------------------------------------------------------
     Filter state + rendering
     --------------------------------------------------------------------- */
  const state = { program: "all", year: "all" };

  const programSelect = document.getElementById("programSelect");
  const yearSelect = document.getElementById("yearSelect");
  const clearFiltersBtn = document.getElementById("clearFilters");
  const scheduleDaysEl = document.getElementById("scheduleDays");
  const scheduleStatusEl = document.getElementById("scheduleStatus");
  const statusResetBtn = document.getElementById("statusReset");
  const unconfirmedNoteEl = document.getElementById("unconfirmedNote");

  function matchesFilter(entry, program, year) {
    const noFilter = program === "all" && year === "all";

    if (entry.kind === "regular") {
      if (noFilter) return true;
      const programOk = program === "all" || entry.program === program;
      const yearOk = year === "all" || entry.year === Number(year);
      return programOk && yearOk;
    }

    if (entry.kind === "free") {
      if (noFilter) return true;
      return entry.programs.some(function (p) {
        const programOk = program === "all" || p.program === program;
        const yearOk = year === "all" || p.year === null || p.year === Number(year);
        return programOk && yearOk;
      });
    }

    // Unknown-format codes: only surface them in the fully unfiltered
    // view so a data typo never silently disappears, but also never
    // clutters a filtered result the way it can't actually match.
    return noFilter;
  }

  function chipForRegular(entry) {
    const chip = document.createElement("span");
    chip.className = "slot-chip";
    chip.setAttribute("data-program", entry.program || "unknown");
    const dot = document.createElement("span");
    dot.className = "program-dot";
    dot.setAttribute("aria-hidden", "true");
    chip.appendChild(dot);
    chip.appendChild(document.createTextNode(entry.raw));
    return chip;
  }

  function chipForFree(entry) {
    const chip = document.createElement("span");
    chip.className = "slot-chip is-free";
    if (!entry.confirmed) chip.classList.add("is-unconfirmed");
    chip.appendChild(document.createTextNode(entry.raw));

    return chip;
  }

  function chipForUnknown(entry) {
    const chip = document.createElement("span");
    chip.className = "slot-chip is-free is-unconfirmed";
    chip.textContent = entry.raw + " (unrecognized format \u2014 check data.js)";
    return chip;
  }

  function render() {
    scheduleDaysEl.innerHTML = "";
    let anyRendered = false;
    let anyUnconfirmedShown = false;

    F2F_DAYS.forEach(function (dayName) {
      const rawList = F2F_SCHEDULE[dayName] || [];
      const parsed = rawList.map(parseScheduleCode);
      const matched = parsed.filter(function (e) { return matchesFilter(e, state.program, state.year); });

      if (matched.length === 0) return;
      anyRendered = true;

      const regular = matched.filter(function (e) { return e.kind === "regular"; });
      const free = matched.filter(function (e) { return e.kind === "free"; });
      const unknown = matched.filter(function (e) { return e.kind === "unknown"; });

      const section = document.createElement("section");
      section.className = "day-block";

      const heading = document.createElement("h2");
      heading.className = "day-heading";
      heading.innerHTML = '<span class="day-heading-index">' + dayName + '</span>';
      section.appendChild(heading);

      if (regular.length > 0) {
        const group = document.createElement("div");
        group.className = "slot-group";
        const title = document.createElement("p");
        title.className = "slot-group-title";
        title.textContent = "Regular sections";
        group.appendChild(title);
        const wrap = document.createElement("div");
        wrap.className = "slot-chip-wrap";
        regular
          .sort(function (a, b) { return a.raw.localeCompare(b.raw); })
          .forEach(function (e) { wrap.appendChild(chipForRegular(e)); });
        group.appendChild(wrap);
        section.appendChild(group);
      }

      if (free.length > 0 || unknown.length > 0) {
        const group = document.createElement("div");
        group.className = "slot-group";
        const title = document.createElement("p");
        title.className = "slot-group-title";
        title.textContent = "Free sections";
        group.appendChild(title);
        const wrap = document.createElement("div");
        wrap.className = "slot-chip-wrap";
        free
          .sort(function (a, b) { return a.raw.localeCompare(b.raw); })
          .forEach(function (e) {
            wrap.appendChild(chipForFree(e));
            if (!e.confirmed) anyUnconfirmedShown = true;
          });
        unknown.forEach(function (e) { wrap.appendChild(chipForUnknown(e)); });
        group.appendChild(wrap);
        section.appendChild(group);
      }

      scheduleDaysEl.appendChild(section);
    });

    scheduleStatusEl.hidden = anyRendered;
    scheduleDaysEl.hidden = !anyRendered;
    unconfirmedNoteEl.hidden = !anyUnconfirmedShown;
  }

  programSelect.addEventListener("change", function () { state.program = programSelect.value; render(); });
  yearSelect.addEventListener("change", function () { state.year = yearSelect.value; render(); });
  clearFiltersBtn.addEventListener("click", resetFilters);
  statusResetBtn.addEventListener("click", resetFilters);

  function resetFilters() {
    state.program = "all";
    state.year = "all";
    programSelect.value = "all";
    yearSelect.value = "all";
    render();
  }

  render();

  /* ---------------------------------------------------------------------
     Suggestions / Concerns form.
     A static page can't send email on its own, so this builds a
     mailto: link (opens the visitor's own email app, prefilled, for
     them to hit send) with a "copy instead" fallback for devices with
     no email app configured. If the council wants true one-tap sending
     with no email app required, the easiest no-code swap is pointing
     this form at a Google Form instead (Forms already emails/logs to
     a linked Gmail account).
     --------------------------------------------------------------------- */
  const COUNCIL_EMAIL = "tsu.ccssc@gmail.com";
  const form = document.getElementById("suggestionForm");
  const typeSelect = document.getElementById("suggestType");
  const nameInput = document.getElementById("suggestName");
  const programYearInput = document.getElementById("suggestProgramYear");
  const messageInput = document.getElementById("suggestMessage");
  const copyBtn = document.getElementById("suggestCopy");
  const formNote = document.getElementById("formNote");

  function buildMessage() {
    const name = nameInput.value.trim() || "Anonymous";
    const programYear = programYearInput.value.trim() || "Not specified";
    const message = messageInput.value.trim();
    return "From: " + name + "\nProgram/Year: " + programYear + "\n\n" + message;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!messageInput.value.trim()) {
      messageInput.focus();
      return;
    }
    const subject = "[CCS Hybrid Schedule] " + typeSelect.value;
    const body = buildMessage();
    const mailtoUrl =
      "mailto:" + COUNCIL_EMAIL +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);
    window.location.href = mailtoUrl;
  });

  copyBtn.addEventListener("click", function () {
    if (!messageInput.value.trim()) {
      messageInput.focus();
      return;
    }
    const fullText =
      "To: " + COUNCIL_EMAIL +
      "\nSubject: [CCS Hybrid Schedule] " + typeSelect.value +
      "\n\n" + buildMessage();

    const done = function () {
      const original = formNote.textContent;
      formNote.textContent = "Copied! Paste it into Gmail, Messenger, or wherever's easiest.";
      setTimeout(function () { formNote.textContent = original; }, 4000);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(fullText).then(done).catch(function () {
        formNote.textContent = "Couldn't copy automatically \u2014 please select and copy the message manually.";
      });
    } else {
      formNote.textContent = "Copy isn't supported on this browser \u2014 please select and copy the message manually.";
    }
  });
})();
