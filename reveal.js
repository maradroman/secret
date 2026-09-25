(() => {
  "use strict";

  const revealAt = Date.UTC(2026, 9, 24, 21, 0, 0);

  const redirectIfRevealed = () => {
    if (Date.now() >= revealAt) {
      window.location.replace("home.html");
    }
  };

  redirectIfRevealed();
  window.setInterval(redirectIfRevealed, 30000);
})();
