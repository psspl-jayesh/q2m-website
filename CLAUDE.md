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
