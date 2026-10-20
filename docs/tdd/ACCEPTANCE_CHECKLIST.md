**Acceptance checks for Leon's Sprint 2 stories**

Automated checks are recorded separately. Manual acceptance by Hafsa/Tim and TA sign-off remain pending.

| Story | Given / When / Then | Manual tester | Status |
| --- | --- | --- | --- |
| #72 | Given both normal sets end in a draw, when final results would normally open, then a sudden-death question opens | Hafsa | Awaiting manual acceptance |
| #72 | Given exactly one player answers correctly, when both finish, then final results display that winner | Hafsa | Awaiting manual acceptance |
| #72 | Given both players have the same result, when the tie-break ends, then another question can start | Hafsa | Awaiting manual acceptance |
| #72 | Given only player one has answered, when passing the device, then the correct answer remains hidden | Hafsa | Awaiting manual acceptance |
| #73 | Given the dashboard, when choosing Solo Practice, then there is one player and no handoff | Tim | Awaiting manual acceptance |
| #73 | Given a practice category is selected, when questions start, then category, timer and feedback work normally | Tim | Awaiting manual acceptance |
| #73 | Given three practice answers are complete, when continuing, then personal results appear and history identifies Practice | Tim | Awaiting manual acceptance |

Additional implemented choices: identical tie-break outcomes repeat; timeout is incorrect; answers stay private until both answer; practice is separate from competitive win/loss status. Confirm with the Product Owner.

**Stories where Leon is the tester**

| Story | Developer | Checks after integration | Supplied-branch status |
| --- | --- | --- | --- |
| #84 Sound | Will | Agreed events and sound feedback in agreed practice/tie-break cases | Implementation absent; not marked passed |
| #75 Win streak | Taraneh | Increment/reset, persistence, final tie-break result and agreed practice handling | Implementation absent; not marked passed |
| #80 Favourites | Tim | Save/list/duplicates and persistence/removal if agreed | Implementation absent; not marked passed |

Record version, steps, expected/actual result, Pass/Fail, screenshot, defect and retest. The supplied branch also lacks the previously mentioned Add Friends implementation. Obtain the relevant team branch before that release regression.

