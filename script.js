(function () {
  "use strict";

  /* ---------- safe storage (falls back to in-memory) ---------- */
  var memory = {};
  var storage = {
    get: function (k) {
      try { var v = window.localStorage.getItem(k); return v === null ? memory[k] : v; }
      catch (e) { return memory[k]; }
    },
    set: function (k, v) {
      memory[k] = v;
      try { window.localStorage.setItem(k, v); } catch (e) { /* ignore */ }
    }
  };

  var root = document.documentElement;
  var body = document.body;

  /* ---------- theme ---------- */
  function systemTheme() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function applyTheme(t) {
    root.setAttribute("data-theme", t);
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", t === "dark" ? "true" : "false");
    });
  }
  var savedTheme = storage.get("xokitty-theme");
  applyTheme(savedTheme || systemTheme());

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-theme-toggle]");
    if (!btn) return;
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    storage.set("xokitty-theme", next);
  });

  /* ---------- compact view ---------- */
  function applyCompact(on) {
    body.classList.toggle("is-compact", on);
    document.querySelectorAll("[data-compact-toggle]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }
  var savedCompact = storage.get("xokitty-compact");
  var initialCompact = savedCompact !== null ? savedCompact === "1" : window.innerWidth < 640;
  applyCompact(initialCompact);

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-compact-toggle]");
    if (!btn) return;
    var on = !body.classList.contains("is-compact");
    applyCompact(on);
    storage.set("xokitty-compact", on ? "1" : "0");
  });

  /* ---------- mobile nav ---------- */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-nav-toggle]");
    if (!btn) return;
    var links = document.querySelector(".nav-links");
    if (!links) return;
    var open = links.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });

  /* ---------- liquid glass cursor shine ---------- */
  if (window.matchMedia && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.addEventListener("pointermove", function (e) {
      var el = e.target.closest(".glass");
      if (!el) return;
      var shine = el.querySelector(".glass-shine");
      if (!shine) return;
      var r = el.getBoundingClientRect();
      shine.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
      shine.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
    });
  }

  /* ---------- season tabs (episodes page) ---------- */
  var tabs = document.querySelectorAll("[data-season-tab]");
  if (tabs.length) {
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var target = tab.getAttribute("data-season-tab");
        tabs.forEach(function (t) { t.setAttribute("aria-selected", t === tab ? "true" : "false"); });
        document.querySelectorAll("[data-season-panel]").forEach(function (panel) {
          panel.classList.toggle("is-active", panel.getAttribute("data-season-panel") === target);
        });
        storage.set("xokitty-season", target);
      });
    });
    var savedSeason = storage.get("xokitty-season");
    if (savedSeason) {
      var savedTab = document.querySelector('[data-season-tab="' + savedSeason + '"]');
      if (savedTab) savedTab.click();
    }
  }
})();
