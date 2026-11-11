## Git workflow (follow in every task)
- Before starting any task: run `git status`. If there are uncommitted changes, commit them first with message "WIP: before <task name>".
- Work on the main branch unless I ask for a branch.
- Commit after each logical step or numbered section of a task, not one giant commit at the end. Use clear messages, e.g.
  "fix(header): stop CTA button wrapping at 1024px",
  "content: revert counter labels to neutral wording",
  "images: map approved home page images".
- Push to origin after every commit: `git push`.
- Before committing, run `npm run build`. Do not commit a broken build; fix it first or tell me.
- Never commit secrets, .env files, node_modules, or build output.
- Never use `git push --force`, `git reset --hard`, or rewrite history without my explicit permission.
- Never delete backup files or folders (docs/_prev/, HomeFolder.tsx) without my permission.
- At the end of every task, report: the list of commits made (`git log --oneline` for this task), and a short summary of files changed (`git diff --stat` from the starting commit).
- Before any risky or large change, create a tag, e.g. `git tag before-<task-name>`, and push it.

## Branch workflow
- Every task gets its own branch from the latest main, named feature/<short-task-name>.
- All commits for a task go to its branch, never directly to main.
- When the task is done and build + checks pass: merge into main with --no-ff, push main, tag `after-<task-name>`, keep the branch.
- Then create the next branch from the updated main and wait for the next task.
- On merge conflicts or a failing build: stop and ask me.
- Only merge through this workflow (the owner may also merge a pull request on GitHub; pull main before starting).

## One session per folder
- Only one Claude session works in this folder at a time.
- Before starting any work, run `git status` and `git log -3`, and tell me if there are commits you did not make.

