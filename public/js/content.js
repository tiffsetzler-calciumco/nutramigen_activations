/**
 * ALL GAME COPY + IMAGES LIVE HERE.  (Layout follows the Figma "Wireframe" page.)
 * Copy marked "Lorem" is placeholder — replace with approved content.
 *
 * Each item is one ornament on the mobile:
 *   id            unique key (used to track progress)
 *   label         accessible name for the ornament
 *   position      where the ornament hangs on the mobile, in % of the scene (x = left, y = top)
 *   before        the "problem" ornament (shown on the mobile + on the question screen)
 *   after         the "flipped" ornament (shown after answering, and on the mobile once answered)
 *                 Incorrect answers show `after` in black & white automatically.
 *   question      the quiz question
 *   answers       exactly 4 answers (A–D letters are added automatically)
 *   correctIndex  0–3, which answer is correct (0 = A)
 *   info          the Nutramigen statement shown under the result
 *
 * Optional per-item overrides if design supplies separate artwork:
 *   questionImage, correctImage, incorrectImage
 */
export const ITEMS = [
  {
    id: "milk",
    label: "Milk carton ornament",
    position: { x: 50, y: 50 },
    before: "assets/images/ornaments/milk-carton.svg",
    after: "assets/images/ornaments/ice-cream.svg",
    question: "What is the most common food allergy among infants and children younger than age 3?",
    answers: [
      "Cow’s milk protein allergy",
      "Lorem ipsum dolor sit amet",
      "Lorem ipsum dolor sit amet",
      "Lorem ipsum dolor sit amet",
    ],
    correctIndex: 0,
    info: "Only Nutramigen has been clinically shown to help babies relieve CMPA symptoms, outgrow CMPA, and disrupt the atopic march!",
  },
  {
    id: "sock",
    label: "Sock ornament",
    position: { x: 24, y: 44 },
    before: "assets/images/ornaments/sock.svg",
    after: "assets/images/ornaments/cleat.svg",
    question: "Lorem ipsum dolor sit amet, consectetur adipiscing elit?",
    answers: [
      "Lorem ipsum dolor sit amet",
      "Lorem ipsum dolor sit amet",
      "Lorem ipsum dolor sit amet",
      "Lorem ipsum dolor sit amet",
    ],
    correctIndex: 1,
    info: "Nutramigen statement lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    id: "peanut",
    label: "Peanut ornament",
    position: { x: 24, y: 66 },
    before: "assets/images/ornaments/peanut.svg",
    after: "assets/images/ornaments/peanut-butter.svg",
    question: "Lorem ipsum dolor sit amet, consectetur adipiscing elit?",
    answers: [
      "Lorem ipsum dolor sit amet",
      "Lorem ipsum dolor sit amet",
      "Lorem ipsum dolor sit amet",
      "Lorem ipsum dolor sit amet",
    ],
    correctIndex: 2,
    info: "Nutramigen statement lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    id: "baby",
    label: "Baby face ornament",
    position: { x: 76, y: 44 },
    before: "assets/images/ornaments/baby-crying.svg",
    after: "assets/images/ornaments/baby-happy.svg",
    question: "Lorem ipsum dolor sit amet, consectetur adipiscing elit?",
    answers: [
      "Lorem ipsum dolor sit amet",
      "Lorem ipsum dolor sit amet",
      "Lorem ipsum dolor sit amet",
      "Lorem ipsum dolor sit amet",
    ],
    correctIndex: 3,
    info: "Nutramigen statement lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    id: "tissues",
    label: "Tissue box ornament",
    position: { x: 76, y: 66 },
    before: "assets/images/ornaments/tissues.svg",
    after: "assets/images/ornaments/puppy.svg",
    question: "Lorem ipsum dolor sit amet, consectetur adipiscing elit?",
    answers: [
      "Lorem ipsum dolor sit amet",
      "Lorem ipsum dolor sit amet",
      "Lorem ipsum dolor sit amet",
      "Lorem ipsum dolor sit amet",
    ],
    correctIndex: 2,
    info: "Nutramigen statement lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
];

/** Opening screen — "Tap anywhere to begin". */
export const ATTRACT = {
  title: "Is your CMPA knowledge ahead of what comes next?",
  subtitle: "or is the risk of future allergic manifestations going unrecognized?",
  cta: "Tap anywhere to begin",
  background: "assets/images/backgrounds/attract.svg",
};

/** The mobile with the 5 ornaments. */
export const HOME = {
  titleBold: "FLIP",
  titleLight: "THE MOBILE",
  subtitle: "Can you flip their CMPA story?",
  cta: "Tap an ornament to reveal a question",
  background: "assets/images/backgrounds/mobile.svg",
};

export const QUESTION = {
  selectPrompt: "Select an answer below:",
  yourAnswer: "Your answer:",
  correctAnswer: "Correct answer:",
  correctTitle: "Your answer is correct!",
  incorrectTitle: "Your answer is incorrect!",
  nextLabel: "Select another ornament",
  finishLabel: "See my score",
};

export const END = {
  title: "Congratulations!",
  /** {score} and {total} are filled in automatically. */
  score: "You have scored a {score}/{total}.",
  background: "assets/images/backgrounds/attract.svg",
  qrImage: "assets/images/end/qr-code.svg",
  qrAlt: "QR code — scan to share your score",
  intro: "Keep learning to support your CMPA patients.",
  heading: "Share your score!",
  body: "Challenge other HCPs and see who knows CMPA best.",
  hashtag: "#FlipthemobileCMPA",
};

export const FOOTER = {
  returnLabel: "Return to start",
  exitLabel: "Exit and return to start",
};

export const IDLE = {
  heading: "Keep playing to flip the mobile and learn more about CMPA.",
  body: "Lorem ipsum dolor sit amet",
  question: "Are you still there?",
  buttonLabel: "Yes, keep playing",
};
