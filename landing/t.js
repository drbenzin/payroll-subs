(function () {
  var KEY = "sid";
  var sid;
  try {
    sid = sessionStorage.getItem(KEY);
    if (!sid) { sid = Math.random().toString(36).slice(2, 12); sessionStorage.setItem(KEY, sid); }
  } catch (e) { sid = Math.random().toString(36).slice(2, 12); }
  var ref = "";
  try {
    ref = sessionStorage.getItem("ref") || "";
    if (location.search) { ref = location.search.slice(0, 200); sessionStorage.setItem("ref", ref); }
  } catch (e) { ref = location.search.slice(0, 200); }
  var pfx = /sample/.test(location.pathname) ? "sample_" : "";
  var sent = {};
  function ev(name) {
    if (sent[name]) return;
    sent[name] = 1;
    var body = JSON.stringify({ ev: name, sid: sid, ref: ref });
    if (navigator.sendBeacon) navigator.sendBeacon("/e", new Blob([body], { type: "application/json" }));
    else fetch("/e", { method: "POST", body: body, keepalive: true });
  }
  if (/preorder-ok/.test(location.pathname)) ev("checkout_complete");
  ev(pfx + "view");
  window.addEventListener("scroll", function () {
    if ((scrollY + innerHeight) / document.documentElement.scrollHeight > 0.5) ev(pfx + "scroll50");
  }, { passive: true });
  var price = document.querySelector(".price");
  if (price && "IntersectionObserver" in window) {
    new IntersectionObserver(function (es, o) {
      if (es.some(function (x) { return x.isIntersecting; })) { ev("price_seen"); o.disconnect(); }
    }).observe(price);
  }
  var f1 = document.getElementById("f1"), f2 = document.getElementById("f2");
  if (f1) {
    f1.addEventListener("focusin", function () { ev("f1_focus"); });
    f1.addEventListener("submit", function () { ev((window.leadMode || "f1") + "_submit"); });
  }
  if (f2) {
    f2.addEventListener("focusin", function () { ev("f2_focus"); });
    f2.addEventListener("submit", function () { ev("f2_submit"); });
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest("#preorder, #notify, #samplelink, #savecard, .shot, .backcta");
    if (!t) return;
    if (t.id === "preorder") ev("pay_click");
    else if (t.id === "savecard") ev("checkout_click");
    else if (t.id === "notify") ev("notify_click");
    else if (t.id === "samplelink") ev("sample_click");
    else if (t.classList.contains("backcta")) ev("sample_to_pricing");
    else ev("mock_zoom");
  });
  var t0 = Date.now();
  window.addEventListener("pagehide", function () {
    ev(pfx + "leave_" + Math.round((Date.now() - t0) / 1000 / 10) * 10 + "s");
  });
})();