(() => {
  "use strict";

  const normalize = (value) => value.trim().toLocaleLowerCase("uk-UA").normalize("NFC");

  const levenshtein = (first, second) => {
    let previousRow = Array.from({ length: second.length + 1 }, (_, index) => index);

    for (let firstIndex = 1; firstIndex <= first.length; firstIndex += 1) {
      const currentRow = [firstIndex];

      for (let secondIndex = 1; secondIndex <= second.length; secondIndex += 1) {
        const substitutionCost = first[firstIndex - 1] === second[secondIndex - 1] ? 0 : 1;
        currentRow[secondIndex] = Math.min(
          currentRow[secondIndex - 1] + 1,
          previousRow[secondIndex] + 1,
          previousRow[secondIndex - 1] + substitutionCost
        );
      }

      previousRow = currentRow;
    }

    return previousRow[second.length];
  };

  const checkAnswer = (input, correctAnswer, maxDistance = 1) => {
    const normalizedInput = normalize(input);
    const normalizedAnswer = normalize(correctAnswer);

    if (!normalizedInput || Math.abs(normalizedInput.length - normalizedAnswer.length) > maxDistance) {
      return false;
    }

    return levenshtein(normalizedInput, normalizedAnswer) <= maxDistance;
  };

  const caseFile = document.querySelector("[data-correct-answer]");

  if (!caseFile) {
    return;
  }

  const form = document.getElementById("quest-form");
  const answer = document.getElementById("answer");
  const submit = document.getElementById("submit");
  const error = document.getElementById("error");
  const result = document.getElementById("result");
  const digit = document.getElementById("digit");
  const progressWarning = document.getElementById("progress-warning");
  const currentStage = Number.parseInt(document.documentElement.dataset.questStage, 10);
  const stageNames = ["", "перший", "другий", "третій"];

  const updateStageNavigation = () => {
    document.querySelectorAll("[data-stage-link]").forEach((item) => {
      const stage = Number.parseInt(item.dataset.stageLink, 10);
      const isCurrent = stage === currentStage;
      const isSolved = window.QuestAccess?.isSolved(stage) === true;
      const isVisited = window.QuestAccess?.isVisited(stage) === true;
      const canOpen = window.QuestAccess?.canAccess(stage) === true;
      const stageNumber = String(stage).padStart(2, "0");

      item.classList.toggle("is-complete", isSolved);
      item.classList.toggle("is-visited", isVisited);
      item.classList.toggle("is-active", isCurrent);

      if (isCurrent) {
        item.setAttribute("aria-current", "step");
      } else {
        item.removeAttribute("aria-current");
      }

      item.replaceChildren();

      if (isVisited && canOpen) {
        const link = document.createElement("a");
        link.href = `/case/${stage}/`;
        link.setAttribute("aria-label", `Відкрити ${stageNames[stage]} слід`);
        link.textContent = stageNumber;
        item.append(link);
      } else {
        const number = document.createElement("span");
        number.className = "stage-list__number";
        number.textContent = stageNumber;
        item.append(number);
      }
    });
  };

  const showSolvedResult = ({ focus = false, hideForm = true } = {}) => {
    result.hidden = false;
    form.hidden = hideForm;
    caseFile.classList.add("is-solved");
    answer.disabled = hideForm;
    submit.disabled = hideForm;

    if (focus) {
      result.focus();
    }
  };

  updateStageNavigation();

  if (window.QuestAccess?.isSolved(currentStage)) {
    progressWarning.hidden = true;
    showSolvedResult();
  }

  answer.addEventListener("input", () => {
    error.hidden = true;
    progressWarning.hidden = true;
    answer.removeAttribute("aria-invalid");
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!checkAnswer(answer.value, caseFile.dataset.correctAnswer)) {
      result.hidden = true;
      error.hidden = false;
      answer.setAttribute("aria-invalid", "true");
      answer.focus();
      return;
    }

    const progressSaved = window.QuestAccess?.markSolved(currentStage) ?? false;

    if (progressSaved) {
      updateStageNavigation();
    }

    error.hidden = true;
    answer.removeAttribute("aria-invalid");
    progressWarning.hidden = progressSaved;
    showSolvedResult({ focus: true, hideForm: progressSaved });
  });
})();
