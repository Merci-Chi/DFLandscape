/* Desert Forest Landscape anonymous website analytics */
(() => {
  "use strict";
  const ENDPOINT = "https://wfxuxrvygyzonkflpwoq.supabase.co/functions/v1/dfl-track-event";
  const VISITOR_KEY = "dfl_analytics_visitor_v1";
  const SESSION_KEY = "dfl_analytics_session_v1";
  const SESSION_TIME_KEY = "dfl_analytics_session_last_v1";
  const SESSION_TIMEOUT = 30 * 60 * 1000;

  if (!window.crypto?.randomUUID) return;
  if (navigator.globalPrivacyControl === true || navigator.doNotTrack === "1") return;

  function getStored(storage, key) {
    try { return storage.getItem(key); } catch { return null; }
  }
  function save(storage, key, value) {
    try { storage.setItem(key, value); } catch { /* Storage may be disabled */ }
  }

  const validId = value => typeof value === "string" && /^[0-9a-f-]{36}$/i.test(value);
  let visitorId = getStored(localStorage, VISITOR_KEY);
  if (!validId(visitorId)) {
    visitorId = crypto.randomUUID();
    save(localStorage, VISITOR_KEY, visitorId);
  }

  let sessionId = getStored(sessionStorage, SESSION_KEY);
  let lastActivity = Number(getStored(sessionStorage, SESSION_TIME_KEY) || 0);
  function refreshSession() {
    const now = Date.now();
    if (!validId(sessionId) || now - lastActivity > SESSION_TIMEOUT) {
      sessionId = crypto.randomUUID();
      save(sessionStorage, SESSION_KEY, sessionId);
    }
    lastActivity = now;
    save(sessionStorage, SESSION_TIME_KEY, String(now));
  }

  function deviceType() {
    const ua = navigator.userAgent || "";
    if (/ipad|tablet/i.test(ua) || (/android/i.test(ua) && !/mobile/i.test(ua))) return "tablet";
    if (/mobi|iphone|ipod|android/i.test(ua)) return "mobile";
    return "desktop";
  }

  function referrerHost() {
    try {
      const host = new URL(document.referrer).hostname.toLowerCase();
      return host && host !== location.hostname ? host.slice(0, 180) : null;
    } catch { return null; }
  }
  function shortText(value, max) {
    return String(value || "").replace(/\\s+/g, " ").trim().slice(0, max);
  }
  function eventName(el) {
    const explicit = el.dataset.analytics;
    if (explicit) return shortText(explicit, 80);
    const href = el.getAttribute("href") || "";
    if (href.startsWith("tel:")) return "call_now";
    if (href.startsWith("mailto:")) return "email_click";
    if (/gallery\\.html/i.test(href)) return "view_all_projects";
    if (href.startsWith("#")) return "navigate_" + shortText(href.slice(1).replace(/[^a-z0-9_-]/gi, "_"), 60);
    if (el.matches('button[type="submit"], input[type="submit"]')) {
      return el.closest(".contact-bottom-form") ? "contact_submit_click" : "form_submit_click";
    }
    if (href.startsWith("https://") || href.startsWith("http://")) {
      try { return "external_" + shortText(new URL(href).hostname.replace(/^www\\./, "").replace(/[^a-z0-9._-]/gi, "_"), 65); } catch {}
    }
    const label = el.getAttribute("aria-label") || el.textContent || el.id || "button";
    return "click_" + shortText(label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""), 70);
  }
  function elementLocation(el) {
    const section = el.closest("section[id], header, footer, nav, main");
    return shortText(section?.id || section?.tagName?.toLowerCase() || "page", 80);
  }

  function track(type, name, locationName = null) {
    refreshSession();
    const payload = {
      event_id: crypto.randomUUID(),
      visitor_id: visitorId,
      session_id: sessionId,
      event_type: type,
      event_name: shortText(name, 80),
      page_path: (location.pathname || "/").slice(0, 180),
      element_location: locationName ? shortText(locationName, 80) : null,
      device_type: deviceType(),
      referrer_host: referrerHost()
    };
    try {
      const body = JSON.stringify(payload);
      // keepalive lets navigation proceed without delaying a user's click.
      fetch(ENDPOINT, {
        method: "POST",
        mode: "cors",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
        body
      }).catch(() => {});
    } catch { /* Never interrupt the website for analytics */ }
  }

  window.DFLAnalytics = Object.freeze({
    trackSuccessfulContactSubmission: () => track("form_submit", "contact_form_success", "contact"),
  });

  track("page_view", location.pathname === "/" ? "homepage_view" : "page_view", "page");

  document.addEventListener("click", event => {
    const target = event.target instanceof Element ? event.target : event.target?.parentElement;
    const el = target?.closest("a[href], button, input[type='submit'], [data-analytics]");
    if (!el || el.hasAttribute("data-no-analytics")) return;
    // Privacy: never collect search terms, input values, message contents or user identities.
    track("click", eventName(el), elementLocation(el));
  }, { capture: true });
})();
