## Git workflow (lightweight — follow in every task)

Branches
- `main` = stable. Only updated when I say "release" (or "merge to main").
- `dev` = the one working branch. All everyday work happens here.
- Do NOT create a new branch per task. Do NOT rename branches. Do NOT
  create tags per task.
- Only create a separate branch if I explicitly ask for one (e.g. for a
  risky experiment).

During a task
- At the start: one quick `git status`. If there are uncommitted
  changes you didn't make, tell me before continuing.
- Commit once at the END of each task (or at most 2–3 commits for a big
  task), not after every small step. Clear message, e.g.
  "footer: compact layout + remove Google badge".
- Run `npm run build` once before the final commit, not before every
  commit. Never commit a broken build.
- Push to origin/dev after the final commit.

Release to main (ONLY when I say "release")
- `npm run build` must pass.
- git checkout main → git pull → git merge --no-ff dev → build again →
  push → create ONE tag `release-YYYY-MM-DD` → push the tag →
  git checkout dev → git merge main (fast-forward) → push dev.
- On merge conflicts or a failing build: stop and ask me.

Testing (to save time and tokens)
- Test only the pages affected by the task, at 360, 768 and 1440px in
  light and dark. Not the whole site.
- Full-site sweep and Lighthouse only when I ask, or before a release.
- Reuse existing QA scripts; don't rewrite them.

Reports (keep them short)
- End every task with a short report: what changed (max ~10 bullets),
  files changed (`git diff --stat`), test result in one line, and
  anything waiting on me.
- Don't repeat earlier context, don't paste long tables unless asked,
  and don't re-read large files you've already read in this session.

Always
- Never force push, never `git reset --hard`, never rewrite history.
- Never commit secrets, .env, node_modules, build output, screenshots.
- Never delete backups (docs/_prev/, HomeFolder.tsx) without my OK.
- One AI session per project folder at a time.

## One session per folder
- Only one Claude session works in this folder at a time.
- Before starting any work, run `git status` and `git log -3`, and tell me if there are commits you did not make.

