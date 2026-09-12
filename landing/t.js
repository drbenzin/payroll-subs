(function () {
  var KEY = "sid";
  var sid;
  try {
    sid = sessionStorage.getItem(KEY);
    if (!sid) { sid = Math.random().toString(36).slice(2, 12); sessionStorage.setItem(KEY, sid); }
  } catch (e) { sid = Math.random().toString(36).slice(2, 12); }
  var sent = {};
  function ev(name) {
    if (sent[name]) return;
    sent[name] = 1;
    var body = JSON.stringify({ ev: name, sid: sid, ref: location.search.slice(0, 200) });
    if (navigator.sendBeacon) navigator.sendBeacon("/e", new Blob([body], { type: "application/json" }));
    else fetch("/e", { method: "POST", body: body, keepalive: true });
  }
  ev("view");
  window.addEventListener("scroll", function () {
    if ((scrollY + innerHeight) / document.documentElement.scrollHeight > 0.5) ev("scroll50");
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
    f1.addEventListener("submit", function () { ev("f1_submit"); });
  }
  if (f2) {
    f2.addEventListener("focusin", function () { ev("f2_focus"); });
    f2.addEventListener("submit", function () { ev("f2_submit"); });
  }
  var t0 = Date.now();
  window.addEventListener("pagehide", function () {
    ev("leave_" + Math.round((Date.now() - t0) / 1000 / 10) * 10 + "s");
  });
})();
