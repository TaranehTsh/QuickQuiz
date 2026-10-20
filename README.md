# QuickQuiz

QuickQuiz is a local two-player quiz for the COMP602 group project. Two people share one device, take turns picking a category, and answer timed questions. Accounts are stored in the browser so quiz history can be saved between sessions.

## Play a game

1. Log in or sign up.
2. The chooser picks a colour-coded category, or uses **Random Category**.
3. Each player answers **3** questions in that category (15 seconds each). Player 2 gets a different set of 3.
4. A missed or timed-out answer shows the correct answer. One hint per round marks two wrong options red.
5. The other player then chooses the next category. A game has **2** sets, so each player chooses once.
6. Final scores, ranking, and strengths / weaknesses are shown at the end.

Questions load from the Open Trivia Database through `/api/questions`. If the API is unavailable, the local bank in `src/data/questions.js` is used instead.

## Accounts

- Sign up stores username, email, password, and a **security question**.
- Log in to open the dashboard (history, win streak, favourite questions).
- **Forgot password?** asks for the registered email, shows that account’s security question, and only resets the password if the answer is correct. Quiz history is kept.
- You can edit your username from the dashboard. There is no change-password screen while logged in.

Accounts live in `localStorage`. This is not a production backend. Passwords and security answers are lightly obfuscated, not encrypted.

### Demo login

| | |
| --- | --- |
| Email | `demo@quickquiz.com` |
| Password | `demo123` |
| Security question | What is the name of this app? |
| Security answer | `QuickQuiz` |

## Sprint features

**Sprint 1**

- Colour-coded categories
- Alternating category choice
- 3 vs 3 per set, two sets per game
- Visual right / wrong feedback and the correct answer after a miss
- 15-second countdown
- Live scores, final ranking, and stats
- Shuffled question and answer order
- Flag a question (40-word comment, current session only)

**Sprint 2**

- How to play on first dashboard visit
- One hint per round
- Favourite questions
- Random category
- Correct / incorrect sound effects
- Forgot password with a security question
- Edit username and logout confirmation

## Project structure

Matches the UML split used in the course:

- `src/models`: GameSession, Player, Category, Challenge, QuizRound, Question, AnswerRecord
- `src/components`: login, sign up, reset password, dashboard, category, quiz, feedback, results
- `src/controllers`: TurnAndCategoryController, QuizAndTimerController
- `src/repositories`: CategoryQuestionRepository
- `src/services`: AuthService, QuizApiQuestionService, PlayerResults, ResultsService, SoundEffectService
- `src/data/questions.js`: local fallback question bank
- `server/quizApiPlugin.js`: Vite plugin that fetches Open Trivia questions

## Run locally

```bash
npm install
npm run dev
```

Open the URL shown in the terminal, normally `http://localhost:5173`.

## Check before pushing

```bash
npm run lint
npm run build
```
