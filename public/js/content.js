/**
 * ALL GAME COPY + IMAGES LIVE HERE.
 * Edit this file to change questions, answers, info notes, and images.
 * Everything below is placeholder copy — replace with approved content.
 *
 * Each item:
 *   id              unique key (used to track progress)
 *   label           accessible name for the item on the landing page
 *   position        where the item sits on the landing scene, in % of the scene (x = left, y = top)
 *   image           shown on the question screen before answering (and on the landing page)
 *   imageCorrect    swapped in when the player answers correctly
 *   imageIncorrect  swapped in when the player answers incorrectly
 *   question        the quiz question
 *   answers         exactly 4 answers
 *   correctIndex    0–3, which answer in `answers` is correct
 *   info            the note shown under the result (for both correct and incorrect)
 */
export const ITEMS = [
  {
    id: "item-1",
    label: "Item 1",
    position: { x: 25, y: 28 },
    image: "assets/images/items/item-1.svg",
    imageCorrect: "assets/images/items/item-1-correct.svg",
    imageIncorrect: "assets/images/items/item-1-incorrect.svg",
    question: "Question 1 copy goes here?",
    answers: ["Answer A", "Answer B", "Answer C", "Answer D"],
    correctIndex: 0,
    info: "Info note for question 1. Explain why the correct answer is correct.",
  },
  {
    id: "item-2",
    label: "Item 2",
    position: { x: 75, y: 28 },
    image: "assets/images/items/item-2.svg",
    imageCorrect: "assets/images/items/item-2-correct.svg",
    imageIncorrect: "assets/images/items/item-2-incorrect.svg",
    question: "Question 2 copy goes here?",
    answers: ["Answer A", "Answer B", "Answer C", "Answer D"],
    correctIndex: 1,
    info: "Info note for question 2. Explain why the correct answer is correct.",
  },
  {
    id: "item-3",
    label: "Item 3",
    position: { x: 50, y: 50 },
    image: "assets/images/items/item-3.svg",
    imageCorrect: "assets/images/items/item-3-correct.svg",
    imageIncorrect: "assets/images/items/item-3-incorrect.svg",
    question: "Question 3 copy goes here?",
    answers: ["Answer A", "Answer B", "Answer C", "Answer D"],
    correctIndex: 2,
    info: "Info note for question 3. Explain why the correct answer is correct.",
  },
  {
    id: "item-4",
    label: "Item 4",
    position: { x: 25, y: 72 },
    image: "assets/images/items/item-4.svg",
    imageCorrect: "assets/images/items/item-4-correct.svg",
    imageIncorrect: "assets/images/items/item-4-incorrect.svg",
    question: "Question 4 copy goes here?",
    answers: ["Answer A", "Answer B", "Answer C", "Answer D"],
    correctIndex: 3,
    info: "Info note for question 4. Explain why the correct answer is correct.",
  },
  {
    id: "item-5",
    label: "Item 5",
    position: { x: 75, y: 72 },
    image: "assets/images/items/item-5.svg",
    imageCorrect: "assets/images/items/item-5-correct.svg",
    imageIncorrect: "assets/images/items/item-5-incorrect.svg",
    question: "Question 5 copy goes here?",
    answers: ["Answer A", "Answer B", "Answer C", "Answer D"],
    correctIndex: 0,
    info: "Info note for question 5. Explain why the correct answer is correct.",
  },
];

export const HOME = {
  title: "Game Title",
  subtitle: "Tap an item to answer a question. Answer all 5 to finish!",
  background: "assets/images/home-background.svg",
};

export const QUESTION = {
  correctTag: "Correct",
  incorrectTag: "Incorrect",
  backLabel: "Go back to answer the remaining questions",
  finishLabel: "See your results",
};

export const END = {
  title: "You did it!",
  qrImage: "assets/images/end/qr-code.svg",
  qrAlt: "QR code — scan to learn more",
  heading: "Scan to learn more",
  body: "End screen copy goes here. Tell players what they'll find when they scan the QR code.",
  restartLabel: "Start over",
};

export const IDLE = {
  title: "Are you still there?",
  body: "Tap below to keep playing, or the game will restart soon.",
  buttonLabel: "Yes, I'm still playing",
};
