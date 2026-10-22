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

  // WhatsApp links carry the page they came from, so the clinic knows which page brought the contact
  document.querySelectorAll("[data-wa]").forEach(function (a) {
    var page = a.getAttribute("data-wa") || document.title;
    a.href = waLink("Olá! Vim pelo site (página: " + page + ") e gostaria de agendar uma avaliação.");
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
      if (!nome || !tel) {
        err.hidden = false;
        err.textContent = "Preencha seu nome e telefone para enviarmos o pedido.";
        (nome ? form.querySelector("#f-telefone") : form.querySelector("#f-nome")).focus();
        return;
      }
      err.hidden = true;
      var periodos = Array.prototype.map.call(form.querySelectorAll("input[name=periodo]:checked"), function (c) { return c.value; });
      var primeira = form.querySelector("input[name=primeira]:checked");
      var msg = form.querySelector("#f-mensagem").value.trim();
      var lines = [
        "Olá! Quero agendar uma avaliação na Clínica Ichiban.",
        "",
        "Nome: " + nome,
        "Telefone: " + tel,
        "Interesse: " + (sel ? sel.value : "Avaliação"),
        "Melhor período: " + (periodos.length ? periodos.join(", ") : "Qualquer horário"),
        "Primeira consulta: " + (primeira ? primeira.value : "Não informado")
      ];
      if (msg) lines.push("Mensagem: " + msg);
      lines.push("", "(Pré-agendamento pelo site" + (origem ? ", página: " + origem : "") + ")");
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
  if (banner && !consent) {
    banner.hidden = false;
    banner.querySelector("[data-accept]").addEventListener("click", function () {
      try { localStorage.setItem(CONSENT_KEY, "sim"); } catch (e) {}
      banner.hidden = true; loadGTM();
    });
    banner.querySelector("[data-decline]").addEventListener("click", function () {
      try { localStorage.setItem(CONSENT_KEY, "nao"); } catch (e) {}
      banner.hidden = true;
    });
  }

  var y = document.getElementById("ano");
  if (y) y.textContent = new Date().getFullYear();
})();
