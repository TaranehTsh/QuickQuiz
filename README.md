# QuickQuiz

This React/Vite COMP602 delivery extends the supplied Leon branch with Sudden Death (#72) and Solo Practice (#73).

For a short Chinese setup and feature acceptance guide, open RUN_FEATURES_ZH.md.

## Run

Use Node.js 22.12 or newer and npm. Open the folder containing package.json.

```bash
npm install
npm run dev
```

Open the address printed by Vite. Demo login: demo@quickquiz.com / demo123. Accounts and history retain the existing localStorage implementation.

## Play

- Start New Quiz: two category sets, three questions per player per set, alternating category chooser.
- Solo Practice: choose a category and answer three timed questions. History is labelled Practice, with no opponent or competitive victory.
- Sudden Death: a completed game with tied total scores starts a shared question with a separate timer for each player. Answers and scores stay hidden until both answer. Exactly one correct answer wins; identical outcomes continue with another question. Timeout is incorrect. Confirm these choices with the PO before team acceptance.
- Existing category colours, answer feedback, reporting dialog, login, history and logout confirmation remain available.
- API failure or an eight-second client timeout falls back to the local question bank. Automated UI checks use local-bank fixtures and do not assert live external API availability.

## Tests

Unit tests use Node.js's built-in node:test runner and node:assert. No extra test package is required.

```bash
npm test
npm run build
npm run lint
npm run test:tdd
npm run test:tdd -- T01
```

The final unit suite has 27 cases. Replay uses temporary directories and leaves final source intact. RED stages are expected failures; GREEN stages pass. Selectors: T01, T02, T03, S01, S02, S03. The earlier TDD PDF records the original 26-test verification; the latest feature verification is in docs/features/verification.json.

## Evidence and integration

See START_HERE_ZH.md and docs/tdd for acceptance criteria, captured stage source/output, evidence images, PDF, verification results and team checklist. Records were captured during this assisted development session in the Codex workspace. They are not earlier student-PC execution, historical Git commits, teammate acceptance or TA sign-off. Replay locally for your assessed demonstration and add your own editor/terminal screenshots where required.

Merge into the team's actual repository and final Release branch. Manual testers remain Hafsa (#72) and Tim (#73); meet the DoD before marking Done. The supplied branch lacks Sound, Win Streak, Favourites and the earlier Add Friends implementations. Merge those team branches before claiming them available or tested.

Mapping: src/models for state; src/controllers for practice/tie-break flow; App.jsx and src/components for UI; src/tests for behaviour checks. Existing contributor comments are retained; developer-Leon marks new feature changes.

Framework reference: https://nodejs.org/api/test.html
