**Leon 的完成版代码与 TDD 材料**

此包基于你上传的 QuickQuiz(2).zip，完成你的平局加赛和单人练习。原有双人流程、分类颜色、登录和退出确认继续使用。

现在先验收功能，请打开 RUN_FEATURES_ZH.md，里面有两项功能的点击步骤。

1. 解压到新文件夹，在 VS Code 中打开包含 package.json 的 QuickQuiz 文件夹。
2. 使用 Node.js 22.12 或更新版本，首次执行 npm install。
3. 执行 npm test，最终版本有 27 个测试。
4. 执行 npm run dev，在浏览器打开终端显示的地址。
5. Demo 登录：demo@quickquiz.com / demo123。

**你的两个功能**

- Solo Practice：Dashboard → Solo Practice → 分类 → 三道题和计时 → 反馈 → 个人结果 → Dashboard。历史显示 Practice，不记作对战获胜。
- Sudden Death：正常两组比赛结束后总分相同，自动加赛。两人回答同题，每人独立计时；双方答完前隐藏正确答案。一人答对则获胜，结果相同则继续新题，超时算错误。
- 这些加赛补充规则已经实现，需要向 PO 说明并确认。队友验收和 TA 签核仍须实际进行。

**TDD 是否需要替所有人做**

Assessment 2 的团队最低要求是至少一个故事的 TDD 证据。Lab 08 要求每名成员至少一个故事、三个测试。你负责自己的开发证据，按组内安排汇总其他人的真实材料。没有提供证据的成员不能署名为已经完成。

此包有两个 Leon 故事，各三个真实 Red-Green 开发阶段。其他人的材料见 docs/tdd/TEAM_EVIDENCE_CHECKLIST.md。

**本地复现**

全部：npm run test:tdd
单个：npm run test:tdd -- T01
编号：T01、T02、T03（加赛）；S01、S02、S03（练习）。

每个阶段先输出 RED 失败，再输出 GREEN 通过。程序使用临时目录，不覆盖最终 src。结束显示 Unexpected stage results: 0，表示阶段按预期复现。红色失败是开发阶段的预期结果，最终代码用 npm test 检查。

原始阶段代码、日志、时间在 docs/tdd/stages；图片在 docs/tdd/evidence；PDF 在 docs/tdd。PDF 的代码与日志图片由真实记录生成，界面图片来自自动浏览器检查。这是本次 Codex 环境执行记录，不能当成你以前的个人电脑执行或 Git 提交历史。

原 TDD PDF 保留当时的 26 项测试记录。本次功能检查补上连续结算保护、加赛隐藏分数和超时锁定按钮；最新验证记录在 docs/features/verification.json，当前有 27 项测试。

按 Lab 的要求，在 VS Code 查看测试代码，运行上述阶段，保存自己的终端截图用于现场展示。理解每个失败原因和实现变化；如果更改规则或代码，应更新测试和证据。

**你还要做的操作**

- TDD PDF 放到 Documentation 的 Test-Driven Development 卡，本周 Week 12 Lab 向 TA 展示。
- Hafsa 验收 #72、Tim 验收 #73，满足 DoD 后移入 Done。
- 将代码和测试集成到团队 Release；给 README、UML、Completed Features 提供自己的改动信息。
- 当前上传分支没有音效、连胜、收藏及之前的好友实现，待队友代码合入后验收；本包没有把它们标为通过。
- 个人反思、Canvas 互评与 Week 13 展示仍须你参加和提交。

本次没有向 GitHub 或 Trello 写入内容，交付的是可运行、检查及集成的代码副本。

