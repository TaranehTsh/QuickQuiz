**Changed existing files**

- README.md
- package.json
- src/App.css
- src/App.jsx
- src/components/DashboardView.jsx
- src/components/QuizView.jsx
- src/components/ResultsView.jsx
- src/controllers/QuizAndTimerController.js
- src/models/GameSession.js
- src/services/QuizApiQuestionService.js
- src/services/ResultsService.js

**New code**

- src/createGame.js
- src/models/SuddenDeathRound.js
- src/tests/helpers.js
- src/tests/suddenDeath.test.js
- src/tests/soloPractice.test.js
- src/tests/regression.test.js
- scripts/replay-tdd.mjs
- RUN_FEATURES_ZH.md

The latest feature check also locks answer buttons at timeout, hides sudden-death scores until both answers are recorded, and prevents finishing one player's tie-break turn twice. The suite now has 27 cases; current verification is in docs/features/verification.json.

The docs/tdd folder contains real execution evidence and acceptance/team checklists. Merge changes with the team current branch; do not replace newer teammate work wholesale. Integration and manual acceptance are still required before marking Done.
