# Leon 的两个功能：运行与验收

这份代码基于你提供的 Leon 分支，完成 #72 平局加赛和 #73 单人练习。

## 先打开软件

1. 把压缩包解压到新文件夹，在 VS Code 打开里面的 QuickQuiz 文件夹。
2. 确保 VS Code 终端位于 package.json 所在目录。使用 Node.js 22.12 或更新版本。
3. 在终端依次运行：

```bash
npm install
npm run dev
```

4. 打开终端显示的网址。不要直接双击 index.html。
5. 登录邮箱：demo@quickquiz.com；密码：demo123。

## #73 单人练习（验收者：Tim）

Dashboard → Solo Practice → 任意分类 → 回答三道题 → 每题反馈后继续 → Your practice results。

检查：全程只有 Player 1；每题有 15 秒倒计时；超时算错且按钮锁定；没有交接设备页面；结果显示个人分数和正确率；Back to dashboard 返回后，历史标记为 Practice，刷新后仍保留。

## #72 平局加赛（验收者：Hafsa）

Dashboard → Start New Quiz → 选择分类 → 两人各答三题 → 第二名玩家选择下一分类 → 两人再各答三题。

要快速触发加赛，可以让两人正常比赛的所有题都故意答错。第二组结束后点击 Continue，总分 0:0，会进入 Sudden death。

加赛检查：

- 两人回答同一道题，每人独立计时 15 秒。
- Player 1 答完后，点击 Continue，再交接给 Player 2；双方答完前，正确答案和分数都隐藏。
- 一人答对、一人答错：出现最终结果，显示答对的玩家获胜。
- 两人都对或都错：出现 Still tied，再点击 Next sudden-death question 继续加赛。
- 超时按答错处理。

正常比赛总分不相同时，应直接显示获胜结果。

## 检查代码

```bash
npm test
npm run build
npm run lint
```

当前单元测试有 27 项。实际验证记录在 docs/features/verification.json。

## 交给团队

让 Hafsa 和 Tim 按上面步骤验收，并记录通过或问题。通过后按团队 Definition of Done 更新卡片，再把改动合并到团队最终 Release 分支。此包是你提供版本的功能完成副本，合并时保留队友后续改动。

加赛采用“两人同题、结果相同则继续”的规则；请将这一实现规则交给 PO 确认。这里没有代填队友验收或 TA 签核。
