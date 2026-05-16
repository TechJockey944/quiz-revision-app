const promptInput = document.getElementById('prompt-input');
const fileInput = document.getElementById('file-input');
const analyzeBtn = document.getElementById('analyze-btn');
const resultArea = document.getElementById('result-area');
const pathwayOutput = document.getElementById('pathway-output');
const essayOutput = document.getElementById('essay-output');
const generateBtn = document.getElementById('generate-btn');
const flashcardToggle = document.getElementById('flashcard-toggle');
const flashcardArea = document.getElementById('flashcard-area');
const flashcardsOutput = document.getElementById('flashcards-output');
const quizArea = document.getElementById('quiz-area');
const quizForm = document.getElementById('quiz-form');
const submitQuizBtn = document.getElementById('submit-quiz-btn');
const feedbackArea = document.getElementById('feedback-area');
const feedbackOutput = document.getElementById('feedback-output');
const timerText = document.getElementById('timer-text');
const questionCountInput = document.getElementById('question-count');
const timeLimitInput = document.getElementById('time-limit');

let studyData = {
  text: '',
  topic: '',
  concepts: [],
  essay: '',
  pathway: [],
  flashcards: [],
  questions: [],
  weakAreas: []
};
let quizTimer = null;
let timeRemaining = 0;

const stopWords = new Set([
  'the','and','to','of','a','in','is','for','it','on','that','with','as','are','this','be','by','or','was','an','from','at','their','which','but','can','have','has','not','will','its','they','we','our','you','your','these','such','also','if','they','was','when'
]);

function normalizeText(text) {
  return text
    .replace(/\r\n/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/[“”«»‘’]/g, "'")
    .replace(/[^\w\s'-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTopics(text) {
  const normalized = normalizeText(text.toLowerCase());
  const words = normalized.split(' ').filter(Boolean);
  const counts = {};
  const phrases = {};

  for (let i = 0; i < words.length; i += 1) {
    const word = words[i];
    if (word.length < 4 || stopWords.has(word) || /^\d+$/.test(word)) continue;
    counts[word] = (counts[word] || 0) + 1;

    if (i < words.length - 1) {
      const next = words[i + 1];
      if (next.length >= 4 && !stopWords.has(next)) {
        const phrase = `${word} ${next}`;
        phrases[phrase] = (phrases[phrase] || 0) + 1;
      }
    }
  }

  const sortedPhrases = Object.entries(phrases)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([phrase]) => phrase);

  const sortedWords = Object.entries(counts)
    .sort((a, b) => (b[1] - a[1]) || a[0].localeCompare(b[0]))
    .slice(0, 10)
    .map(([word]) => word);

  const chosen = [...new Set([...sortedPhrases, ...sortedWords])].slice(0, 6);
  return chosen.length ? chosen : ['core concept'];
}

function buildPathway(concepts, weakAreas = []) {
  const base = concepts.length ? concepts : ['the topic'];
  const weakMention = weakAreas.length ? ` Focus next on ${weakAreas.join(', ')}.` : '';

  return [
    `Start by understanding the main idea: ${base.slice(0, 3).join(', ')}.`,
    `Learn the key terms and simple definitions for each idea so you can explain them in your own words.`,
    `Practice with short examples and questions about ${base.slice(0, 2).join(', ')}.${weakMention}`,
    `Review the pathway daily, especially the parts that felt hardest or the concepts you missed.`
  ];
}

function createEssay(concepts, text) {
  const topicPhrase = concepts.slice(0, 3).join(', ');
  const summary = `This topic is about ${topicPhrase}. The lesson starts with the basic ideas and then breaks them into smaller pieces. ${concepts.length > 1 ? `It explains ${concepts.slice(0, 2).join(', ')} clearly.` : 'It explains the main idea clearly.'} The goal is to help you remember the main ideas, practice using them, and feel confident when you check your answers.`;
  const detail = `When you study, focus on the simplest meaning. Use examples, compare new ideas to what you already know, and repeat the information in your own words. If there are difficult parts, make notes of each one and build your understanding step by step.`;
  const next = `This essay keeps the language simple and direct so you can start with easy ideas first. After you understand the basics, the pathway and quiz help you find the weaker areas and keep learning until you feel ready.`;

  const wordCount = 210 + Math.min(600, Math.max(0, Math.floor(text.length / 10)));
  const filler = ` ${detail.repeat(2)} ${next}`;
  return summary + filler.slice(0, Math.max(0, Math.min(filler.length, wordCount - summary.split(' ').length)));
}

function buildFlashcards(concepts) {
  return concepts.map((concept, index) => ({
    question: `What is ${concept}?`,
    answer: `A simple explanation of ${concept} in this topic, using easy words and a clear example.`,
    id: index + 1
  }));
}

function buildQuestions(concepts, count) {
  const questions = [];
  const choicesPool = [
    'A main idea that explains the subject',
    'A simple example that shows how it works',
    'An idea that should be memorized first',
    'A detail that is only sometimes important',
    'A tool for understanding the subject better',
    'A weak area to focus on next time'
  ];

  const safeCount = Math.max(1, Math.min(20, count));
  for (let i = 0; i < safeCount; i += 1) {
    const concept = concepts[i % concepts.length];
    const rightAnswer = `A simple meaning of ${concept} in this topic.`;
    const wrongAnswers = choicesPool
      .filter((text) => !text.includes(concept))
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    questions.push({
      id: i + 1,
      concept,
      text: `What is the best description of ${concept}?`,
      options: [rightAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5),
      answer: rightAnswer
    });
  }
  return questions;
}

function showPathway(pathway) {
  pathwayOutput.innerHTML = `<ul>${pathway.map((step) => `<li>${step}</li>`).join('')}</ul>`;
}

function showEssay(essay) {
  essayOutput.textContent = essay;
}

function showFlashcards(cards) {
  if (!cards.length) return;
  flashcardsOutput.innerHTML = `<ul>${cards.map(card => `<li><strong>${card.question}</strong><br>${card.answer}</li>`).join('')}</ul>`;
}

function showQuiz(questions) {
  quizForm.innerHTML = questions.map((question) => {
    const optionsHtml = question.options.map((option, index) => `
      <label class="option-label">
        <input type="radio" name="question-${question.id}" value="${option}" />
        ${option}
      </label>
    `).join('');

    return `<div class="question-block">
      <h3>Q${question.id}. ${question.text}</h3>
      ${optionsHtml}
    </div>`;
  }).join('');
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  timerText.textContent = `Time left: ${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function startTimer(limitMinutes) {
  clearInterval(quizTimer);
  if (!limitMinutes || limitMinutes <= 0) {
    timerText.textContent = 'No time limit set.';
    return;
  }

  timeRemaining = limitMinutes * 60;
  updateTimerDisplay();
  quizTimer = setInterval(() => {
    timeRemaining -= 1;
    if (timeRemaining <= 0) {
      clearInterval(quizTimer);
      timerText.textContent = 'Time is up. Submit the quiz now.';
    } else {
      updateTimerDisplay();
    }
  }, 1000);
}

function evaluateQuiz(questions) {
  const answers = new Map();
  const feedback = [];
  let correct = 0;
  const missedConcepts = new Set();

  questions.forEach((question) => {
    const selected = quizForm.querySelector(`input[name="question-${question.id}"]:checked`);
    const chosen = selected ? selected.value : null;
    if (chosen === question.answer) {
      correct += 1;
    } else {
      missedConcepts.add(question.concept);
      feedback.push(`Question ${question.id} missed: correct answer was "${question.answer}".`);
    }
    answers.set(question.id, chosen);
  });

  const score = Math.round((correct / questions.length) * 100);
  const weakAreas = [...missedConcepts].slice(0, 4);
  const nextPathway = buildPathway(studyData.concepts, weakAreas);

  feedbackOutput.innerHTML = `
    <p><strong>Score:</strong> ${score}% (${correct} of ${questions.length})</p>
    <p><strong>Weak areas:</strong> ${weakAreas.length ? weakAreas.join(', ') : 'None — good work!'}</p>
    <div>${feedback.length ? `<p>${feedback.join('</p><p>')}</p>` : '<p>Well done! Keep reviewing the main ideas.</p>'}</div>
    <h3>Adaptive learning pathway</h3>
    <ul>${nextPathway.map((step) => `<li>${step}</li>`).join('')}</ul>
  `;

  studyData.weakAreas = weakAreas;
  studyData.pathway = nextPathway;
  showPathway(nextPathway);
  feedbackArea.classList.remove('hidden');
}

function readFiles(files) {
  const reads = Array.from(files).map((file) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => resolve('');
    reader.readAsText(file);
  }));

  return Promise.all(reads).then((values) => values.filter(Boolean).join(' '));
}

async function analyzeContent() {
  const promptText = promptInput.value.trim();
  const files = Array.from(fileInput.files);
  const uploadedText = files.length ? await readFiles(files) : '';
  const content = [promptText, uploadedText].filter(Boolean).join(' ');

  if (!content) {
    alert('Please enter a prompt or upload at least one text file.');
    return;
  }

  studyData.text = content;
  studyData.concepts = extractTopics(content);
  studyData.essay = createEssay(studyData.concepts, content);
  studyData.pathway = buildPathway(studyData.concepts);
  studyData.flashcards = buildFlashcards(studyData.concepts);

  resultArea.classList.remove('hidden');
  flashcardArea.classList.add('hidden');
  quizArea.classList.add('hidden');
  feedbackArea.classList.add('hidden');

  showPathway(studyData.pathway);
  showEssay(studyData.essay);
}

function generateStudyMaterials() {
  if (!studyData.concepts.length) {
    alert('Analyze your content first.');
    return;
  }

  const questionCount = parseInt(questionCountInput.value, 10) || 5;
  const timeLimit = parseInt(timeLimitInput.value, 10) || 0;

  studyData.questions = buildQuestions(studyData.concepts, questionCount);
  showQuiz(studyData.questions);
  quizArea.classList.remove('hidden');
  feedbackArea.classList.add('hidden');

  if (flashcardToggle.checked) {
    showFlashcards(studyData.flashcards);
    flashcardArea.classList.remove('hidden');
  } else {
    flashcardArea.classList.add('hidden');
  }

  startTimer(timeLimit);
}

analyzeBtn.addEventListener('click', (event) => {
  event.preventDefault();
  analyzeContent();
});

generateBtn.addEventListener('click', (event) => {
  event.preventDefault();
  generateStudyMaterials();
});

submitQuizBtn.addEventListener('click', () => {
  if (!studyData.questions.length) return;
  clearInterval(quizTimer);
  evaluateQuiz(studyData.questions);
});
