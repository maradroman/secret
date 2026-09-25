(() => {
  "use strict";

  const storageKey = "hbd.detective-quest.progress.v1";
  const requiredStages = {
    1: [],
    2: [1],
    3: [1, 2]
  };
  const currentStage = Number.parseInt(document.documentElement.dataset.questStage, 10);

  const getProgress = () => {
    try {
      const storedProgress = window.localStorage.getItem(storageKey);
      const progress = storedProgress ? JSON.parse(storedProgress) : {};

      if (!progress || typeof progress !== "object" || Array.isArray(progress)) {
        return {};
      }

      return progress;
    } catch {
      return {};
    }
  };

  const isSolved = (stage) => getProgress()[`case${stage}Solved`] === true;

  const isVisited = (stage) => {
    const progress = getProgress();
    return progress[`case${stage}Visited`] === true || progress[`case${stage}Solved`] === true;
  };

  const canAccess = (stage) => {
    const prerequisites = requiredStages[stage];
    return Array.isArray(prerequisites) && prerequisites.every(isSolved);
  };

  const saveProgress = (progress) => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(progress));
      return true;
    } catch {
      return false;
    }
  };

  const markVisited = (stage) => {
    if (!Number.isInteger(stage) || !canAccess(stage)) {
      return false;
    }

    const progress = getProgress();

    if (progress[`case${stage}Visited`] === true) {
      return true;
    }

    progress[`case${stage}Visited`] = true;
    return saveProgress(progress);
  };

  const markSolved = (stage) => {
    if (!Number.isInteger(stage) || !canAccess(stage)) {
      return false;
    }

    const progress = getProgress();
    progress[`case${stage}Visited`] = true;
    progress[`case${stage}Solved`] = true;
    return saveProgress(progress);
  };

  const guardCurrentPage = () => {
    if (!Number.isInteger(currentStage)) {
      return;
    }

    if (!canAccess(currentStage)) {
      const deniedUrl = new URL("access-denied.html", window.location.href);
      deniedUrl.searchParams.set("from", String(currentStage));
      window.location.replace(deniedUrl.href);
      return;
    }

    markVisited(currentStage);
  };

  window.QuestAccess = Object.freeze({
    canAccess,
    isSolved,
    isVisited,
    markSolved
  });

  guardCurrentPage();
})();
