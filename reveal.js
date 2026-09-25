(() => {
  "use strict";

  const revealAt = Date.UTC(2026, 9, 24, 21, 0, 0);
  let isChecking = false;

  const redirectIfRevealed = async () => {
    if (isChecking) {
      return;
    }

    isChecking = true;

    try {
      const response = await fetch("/healthz", {
        cache: "no-store",
        method: "HEAD"
      });

      if (!response.ok) {
        return;
      }

      const serverTime = Date.parse(response.headers.get("Date") || "");

      if (Number.isFinite(serverTime) && serverTime >= revealAt) {
        window.location.replace("/home/");
      }
    } catch {
      return;
    } finally {
      isChecking = false;
    }
  };

  redirectIfRevealed();
  window.setInterval(redirectIfRevealed, 30000);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      redirectIfRevealed();
    }
  });
})();
