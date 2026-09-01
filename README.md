# QuickQuiz

QuickQuiz is a local two-player quiz application for the COMP602 group project.
This repository contains the initial React structure for Sprint 1.

## Sprint 1 flow

1. The active player selects a colour-coded category.
2. The application loads a timed question.
3. The player submits an answer or the timer reaches zero.
4. Correct or incorrect feedback is shown. A missed answer reveals the correct answer.
5. The active player alternates after each round.
6. Both scores and performance statistics are shown after four rounds.

## UML mapping

- `src/models`: GameSession, Player, Category, QuizRound, Question and AnswerRecord.
- `src/components`: Category Selection View, Quiz View, Answer Feedback View and Results View.
- `src/controllers`: Turn and Category Controller and Quiz and Timer Controller.
- `src/repositories`: Category and Question Repository.
- `src/services`: Player Results and Results Service.

## Run locally

```bash
npm install
npm run dev
```

Use the local URL shown in the terminal, normally `http://localhost:5173`.

## Check before pushing

```bash
npm run lint
npm run build
```
