# QuickQuiz

QuickQuiz is a local quiz for the COMP602 group project. Two people can share one device and take turns, or one person can use Solo Practice. Accounts are stored in the browser so quiz history can be saved between sessions.

## Run locally

Use Node.js 22.12 or newer.

```bash
npm install
npm run dev
```

Open the URL shown in the terminal, normally `http://localhost:5173`.

### Demo login

| | |
| --- | --- |
| Email | `demo@quickquiz.com` |
| Password | `demo123` |
| Security question | What is the name of this app? |
| Security answer | `QuickQuiz` |

## Play

**Two-player quiz**

1. Log in or sign up, then start a new quiz.
2. The chooser picks a colour-coded category, or uses **Random Category**.
3. Each player answers **3** questions in that category (15 seconds each). Player 2 gets a different set of 3.
4. A missed or timed-out answer shows the correct answer. One hint per round marks two wrong options red.
5. The other player then chooses the next category. A game has **2** sets, so each player chooses once.
6. If the totals are tied, **Sudden Death** starts: both players answer the same question with scores hidden until both have answered. One correct answer wins. If both are right or both are wrong, another question is used. A timeout counts as incorrect.
7. Final scores, ranking, and strengths / weaknesses are shown at the end.

**Solo Practice**

Choose a category and answer three timed questions. There is no opponent, no handoff, and no competitive win. History is labelled Practice.

Questions load from the Open Trivia Database through `/api/questions`. If the API fails, the local bank in `src/data/questions.js` is used instead.

## Accounts

- Sign up stores username, email, password, and a **security question**.
- Log in to open the dashboard (history, win streak, favourite questions).
- **Forgot password?** asks for the registered email, shows that account’s security question, and only resets the password if the answer is correct. Quiz history is kept.
- You can edit your username from the dashboard. There is no change-password screen while logged in.

Accounts live in `localStorage`. This is not a production backend. Passwords and security answers are lightly obfuscated, not encrypted.

## Features

- Colour-coded categories and alternating category choice
- 3 vs 3 per set, two sets per game
- Visual right / wrong feedback and the correct answer after a miss
- 15-second countdown and extra points for faster answers
- Live scores, final ranking, and stats
- Shuffled question and answer order
- Flag a question (40-word comment, current session only)
- How to play on first dashboard visit
- One hint per round
- Favourite questions
- Random category
- Correct / incorrect sound effects
- Forgot password with a security question
- Edit username and logout confirmation
- Solo Practice
- Sudden Death after a tied two-player game

## Project structure

- `src/models`: GameSession, Player, Category, Challenge, QuizRound, SuddenDeathRound, Question, AnswerRecord
- `src/components`: login, sign up, reset password, dashboard, category, quiz, feedback, results
- `src/controllers`: TurnAndCategoryController, QuizAndTimerController
- `src/repositories`: CategoryQuestionRepository
- `src/services`: AuthService, QuizApiQuestionService, PlayerResults, ResultsService, SoundEffectService
- `src/data/questions.js`: local fallback question bank
- `src/tests`: Sudden Death, Solo Practice, and regression tests
- `server/quizApiPlugin.js`: Vite plugin that fetches Open Trivia questions

## Check before pushing

```bash
npm test
npm run lint
npm run build
```

Optional TDD replay:

```bash
npm run test:tdd
npm run test:tdd -- T01
```

`npm test` runs the Node.js built-in test runner (`node:test`). The suite covers Sudden Death, Solo Practice, and regression cases. TDD replay uses temporary directories and leaves the current source intact. RED stages are expected failures; GREEN stages pass. Selectors: T01, T02, T03, S01, S02, S03.
