
/**
 * Author: Leslie Brockman | Leslie's Designs | 2026
 * Description: Programming challenges functionality for the lab page.
 */
(() => {
  "use strict";
  const root = document.querySelector(".challenges-page");
  if (!root) return;

  // Question data is independent of the presentation and scoring functions.
  const challenges = [
    {
      title: "Find the Pattern",
      code: "2, 4, 8, 16, ?",
      question: "Select the next number.",
      options: ["18", "24", "32", "64"],
      answer: "32",
      explanation: "Each number doubles the previous number. This is an example of recognizing a pattern in a sequence."
    },
    {
      title: "Conditional Logic",
      code: 'let score = 75;\n\nif (score >= 70) {\n  console.log("Pass");\n} else {\n  console.log("Try again");\n}',
      question: "What will this code display?",
      options: ["Pass", "Try again", "75", "Nothing"],
      answer: "Pass",
      explanation: "The condition checks whether the score is greater than or equal to 70. Since 75 meets that condition, the first branch executes."
    },
    {
      title: "Arrays and Indexes",
      code: 'const colors = ["green", "gold", "turquoise"];\n\nconsole.log(colors[1]);',
      question: "What will appear in the console?",
      options: ["green", "gold", "turquoise", "undefined"],
      answer: "gold",
      explanation: "JavaScript arrays use zero-based indexing. The first element is at index 0, so index 1 refers to the second element."
    }
  ];
  const get = (id) => root.querySelector(`#${id}`);
  const panel = get("challenge-panel"), form = get("challenge-form");
  const progress = get("challenge-progress"), title = get("challenge-title"), code = get("challenge-code");
  const question = get("challenge-question"), choices = get("challenge-choices");
  const submit = get("challenge-submit"), next = get("challenge-next"), feedback = get("challenge-feedback");
  const results = get("challenge-results"), resultTitle = get("challenge-result-title"), scoreText = get("challenge-score");
  const restart = get("challenge-restart");
  let index = 0, score = 0, submitted = false, finished = false;

  function render(focus = false) {
    const challenge = challenges[index];
    submitted = false;
    finished = false;
    panel.hidden = false;
    results.hidden = true;
    feedback.textContent = "";
    progress.textContent = `Challenge ${String(index + 1).padStart(2, "0")} of ${challenges.length}`;
    title.textContent = challenge.title;
    code.textContent = challenge.code;
    question.textContent = challenge.question;
    choices.replaceChildren();
    challenge.options.forEach((option, optionIndex) => {
      const label = document.createElement("label");
      label.className = "challenge-choice";
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "answer";
      radio.value = option;
      radio.id = `answer-${optionIndex}`;
      const text = document.createElement("span");
      text.textContent = option;
      label.append(radio, text);
      choices.append(label);
    });
    submit.disabled = false;
    next.hidden = true;
    next.textContent = index === challenges.length - 1 ? "See Results" : "Next Challenge";
    if (focus) title.focus();
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (submitted || finished) return;
    const selected = choices.querySelector('input[name="answer"]:checked');
    if (!selected) {
      feedback.textContent = "Choose an answer before submitting.";
      choices.querySelector("input").focus();
      return;
    }
    const challenge = challenges[index];
    const correct = selected.value === challenge.answer;
    submitted = true;
    if (correct) score += 1;
    choices.querySelectorAll("input").forEach((input) => { input.disabled = true; });
    feedback.textContent = `${correct ? "Correct!" : `Incorrect. The correct answer is ${challenge.answer}.`} ${challenge.explanation}`;
    submit.disabled = true;
    next.hidden = false;
    // Continue from a usable control after the submitted inputs become disabled.
    next.focus();
  });

  next.addEventListener("click", () => {
    if (!submitted || finished) return;
    if (index < challenges.length - 1) {
      index += 1;
      render(true);
      return;
    }
    finished = true;
    panel.hidden = true;
    results.hidden = false;
    scoreText.textContent = `${score} correct answers out of ${challenges.length} challenges.`;
    resultTitle.focus();
  });

  restart.addEventListener("click", () => {
    index = 0;
    score = 0;
    submitted = false;
    finished = false;
    render(true);
  });
  render();
  get("challenge-loading").hidden = true;
})();
