/* Clínica Ichiban — small site behaviours (no dependencies). */
(function () {
  var WA = "5543999372253";
  var GTM = "GTM-55CPB77Q";
  var CONSENT_KEY = "ichiban-cookies";

  function waLink(text) {
    return "https://wa.me/" + WA + "?text=" + encodeURIComponent(text);
  }

  // Header border after scrolling
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Mobile menu
  var menuBtn = document.querySelector(".menu-btn");
  var mobileNav = document.getElementById("mobile-nav");
  if (menuBtn && mobileNav) {
    var closeBtn = mobileNav.querySelector(".close");
    var open = function () {
      mobileNav.hidden = false; menuBtn.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden"; closeBtn.focus();
    };
    var close = function () {
      mobileNav.hidden = true; menuBtn.setAttribute("aria-expanded", "false");
      document.body.style.overflow = ""; menuBtn.focus();
    };
    menuBtn.addEventListener("click", open);
    closeBtn.addEventListener("click", close);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !mobileNav.hidden) close(); });
  }

  // WhatsApp links carry the page they came from and a message that matches the button's intent
  var WA_TEXT = {
    duvida: function (p) { return "Olá! Vim pelo site e gostaria de esclarecer uma dúvida sobre " + p + "."; },
    agendar: function (p) { return "Olá! Vim pelo site (página: " + p + ") e gostaria de solicitar um agendamento."; },
    falar: function (p) { return "Olá! Vim pelo site (página: " + p + ") e gostaria de falar com a recepção."; }
  };
  document.querySelectorAll("[data-wa]").forEach(function (a) {
    var page = a.getAttribute("data-wa") || document.title;
    var make = WA_TEXT[a.getAttribute("data-wa-intent")] || WA_TEXT.falar;
    a.href = waLink(make(page));
    a.target = "_blank"; a.rel = "noopener";
  });

  // Pre-booking form → WhatsApp message
  var form = document.getElementById("pre-agendamento");
  if (form) {
    var params = new URLSearchParams(location.search);
    var t = params.get("tratamento");
    var origem = params.get("origem") || "";
    var sel = form.querySelector("#f-tratamento");
    if (t && sel) {
      for (var i = 0; i < sel.options.length; i++) {
        if (sel.options[i].getAttribute("data-slug") === t) { sel.selectedIndex = i; break; }
      }
    }
    var err = form.querySelector(".error");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var nome = form.querySelector("#f-nome").value.trim();
      var tel = form.querySelector("#f-telefone").value.trim();
      if (!nome) {
        err.hidden = false;
        err.textContent = "Preencha seu nome para enviarmos a solicitação.";
        form.querySelector("#f-nome").focus();
        return;
      }
      err.hidden = true;
      var periodos = Array.prototype.map.call(form.querySelectorAll("input[name=periodo]:checked"), function (c) { return c.value; });
      var primeira = form.querySelector("input[name=primeira]:checked");
      var msg = form.querySelector("#f-mensagem").value.trim();
      var lines = [
        "Olá! Gostaria de solicitar um agendamento na Clínica Ichiban.",
        "",
        "Nome: " + nome
      ];
      if (tel) lines.push("Outro telefone: " + tel);
      lines = lines.concat([
        "Interesse: " + (sel ? sel.value : "Avaliação"),
        "Melhor período: " + (periodos.length ? periodos.join(", ") : "Qualquer horário"),
        "Primeira consulta: " + (primeira ? primeira.value : "Não informado")
      ]);
      if (msg) lines.push("Mensagem: " + msg);
      lines.push("", "(Solicitação enviada pelo site" + (origem ? ", página: " + origem : "") + ")");
      var url = waLink(lines.join("\n"));
      if (window.dataLayer) window.dataLayer.push({ event: "pre_agendamento", tratamento: sel ? sel.value : "", origem: origem });
      var w = window.open(url, "_blank", "noopener");
      if (!w) location.href = url;
      form.querySelector(".sent").hidden = false;
    });
  }

  // Cookie consent (LGPD): analytics only load after the visitor accepts
  function loadGTM() {
    if (window.__gtmLoaded) return; window.__gtmLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    var s = document.createElement("script"); s.async = true;
    s.src = "https://www.googletagmanager.com/gtm.js?id=" + GTM;
    document.head.appendChild(s);
  }
  var consent = null;
  try { consent = localStorage.getItem(CONSENT_KEY); } catch (e) {}
  if (consent === "sim") loadGTM();
  var banner = document.getElementById("cookie");
  if (banner) {
    if (!consent) banner.hidden = false;
    banner.querySelector("[data-accept]").addEventListener("click", function () {
      try { localStorage.setItem(CONSENT_KEY, "sim"); } catch (e) {}
      consent = "sim"; banner.hidden = true; loadGTM();
    });
    banner.querySelector("[data-decline]").addEventListener("click", function () {
      try { localStorage.setItem(CONSENT_KEY, "nao"); } catch (e) {}
      banner.hidden = true;
      // analytics already running on this page: reload so it stops
      if (window.__gtmLoaded) location.reload();
      consent = "nao";
    });
    // footer link reopens the choice at any time
    document.querySelectorAll("[data-cookie-prefs]").forEach(function (b) {
      b.addEventListener("click", function () {
        banner.hidden = false;
        var f = banner.querySelector("[data-accept]"); if (f) f.focus();
      });
    });
  }

  var y = document.getElementById("ano");
  if (y) y.textContent = new Date().getFullYear();

  // ---------------- motion: reveal on scroll + counters (skipped for reduced motion)
  var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (calm || !("IntersectionObserver" in window)) return;

  var SELECTOR = [
    ".section-head", ".reviews-head", ".statement", ".pillars li", ".feature-card", ".need", ".tech",
    ".mosaic figure", ".lead-doctor > *", ".team-strip a", ".quote", ".single-quote", ".journey li",
    ".post-card", ".t-card", ".member", ".support-grid > div", ".gallery figure", ".split > *",
    ".block", ".checklist li", ".faq details", ".mini-member", ".cta-band > *", ".contact-list li",
    ".need-section", ".az li", ".article-aside", ".footer-grid > div"
  ].join(",");

  var vh = window.innerHeight || 800;
  var targets = Array.prototype.filter.call(document.querySelectorAll(SELECTOR), function (el) {
    // never hide what is already on screen, and never nest reveals
    return el.getBoundingClientRect().top > vh * 0.92 && !el.parentElement.closest(".reveal");
  });

  function done(el) {
    el.classList.remove("reveal", "in");
    el.style.removeProperty("--d");
  }

  // keyboard focus or printing never meets hidden content
  document.addEventListener("focusin", function (ev) {
    var el = ev.target.closest && ev.target.closest(".reveal");
    if (el) { io.unobserve(el); done(el); }
  });
  window.addEventListener("beforeprint", function () {
    Array.prototype.forEach.call(document.querySelectorAll(".reveal"), function (el) { io.unobserve(el); done(el); });
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target;
      io.unobserve(el);
      el.classList.add("in");
      var delay = parseFloat(el.style.getPropertyValue("--d")) || 0;
      setTimeout(function () { done(el); }, 1000 + delay * 1000);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

  targets.forEach(function (el) {
    // stagger siblings that enter together (cards in a row, list items)
    var sibs = Array.prototype.filter.call(el.parentElement.children, function (c) { return targets.indexOf(c) > -1; });
    var i = sibs.indexOf(el);
    if (i > 0) el.style.setProperty("--d", (Math.min(i, 6) * 0.08).toFixed(2) + "s");
    el.classList.add("reveal");
    io.observe(el);
  });

  // count the hero numbers up
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    var finals = Array.prototype.map.call(counters, function (c) { return c.textContent; });
    counters.forEach(function (c) { c.textContent = "0"; });
    setTimeout(function () {
      var t0 = null, dur = 1500;
      var ends = Array.prototype.map.call(counters, function (c) { return parseInt(c.getAttribute("data-count"), 10) || 0; });
      function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur), k = 1 - Math.pow(1 - p, 3);
        counters.forEach(function (c, n) { c.textContent = Math.round(ends[n] * k); });
        if (p < 1) requestAnimationFrame(step);
        else counters.forEach(function (c, n) { c.textContent = finals[n]; });
      }
      requestAnimationFrame(step);
    }, 600);
  }
})();
