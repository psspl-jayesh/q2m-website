# Backup: old home page and old service page design

Saved on 12 Nov 2026, before the smart-glasses home page redesign (branch `new-home-page`) and any service-page template redesign.

| Backup | Name | Points to |
|---|---|---|
| Branch | `backup-old-design` | `9bab8cc` (main after release 2026-11-12-3) |
| Tag | `backup-old-home-and-service-2026-11-12` | the same commit |

Both are pushed to GitHub. **Never delete, move, rebase or commit to them.** The tag is the permanent reference. The branch is there so the old design is easy to browse on GitHub.

## Files that make up the old home page

| File | What it holds |
|---|---|
| `src/pages/HomeFolder.tsx` | The home page layout and sections (hero, Our Global Clients, BTS 2026 card, See the work, Services, Industries, Results, About, How we work, Principles, Technology, 30-minute session, From The Team, FAQ, Book a session) |
| `src/App.tsx` | Routing. The line `import Home from '@/pages/HomeFolder'` makes it the home page |
| `src/data/home.json` | All home page text (hero, work tiles, services, industries, approach, principles, technology, session, FAQ, BTS card) |
| `src/content/shared/home-images.json` | Which image goes with each work tile, service, industry and approach step |
| `src/content/shared/stats.json` | The Results counters |
| `src/content/sections/bts-wording.json` | Neutral BTS wording used while `BTS.liveDemos` is false |
| `src/components/BookingForm.tsx` | The Book a session form |
| `src/components/DotField.tsx`, `src/components/DotPanel.tsx` | Hero dot field and the dot panel image placeholders |
| `src/components/Cards.tsx` | `PostCard` (From The Team) |
| `src/config/bts.ts` | BTS dates, `liveDemos` flag, auto-hide after the event |
| `src/styles/index.css` | Shared tokens and layout classes (`.split`, `.section`, `.display-*`, theme colours) |

`src/pages/Home.tsx` is an older, unrouted backup of the live-structure home. Keep it.

## Files that make up the old service page template

| File | What it holds |
|---|---|
| `src/pages/ServicePage.tsx` | The template for every service/solution page (`PageBody`, `SectionBlock`, hero, outline panel, logo tiles, FAQ, final CTA). `src/App.tsx` sends every page without its own template here |
| `src/components/ui.tsx` | Shared pieces it uses: `Breadcrumbs`, `Button`, `HeroImage`, `SiteFrame`, `SiteImage`, `Reveal`, `SectionHead`, `Accordion`, `Stagger*` |
| `src/components/DotArrow.tsx` | The dot-field arrow |
| `src/lib/content.ts`, `src/lib/images.ts`, `src/lib/topicImages.ts` | How page text is split into sections and matched with images |
| `src/content/shared/ctas.json`, `src/content/shared/ui.json` | Button and label text |
| `src/styles/index.css` | `.split`, `.split--lead`, `.split--media`, `.split--toc` and the theme tokens |

The page text itself lives in `src/content/pages/**` and is not part of the design. A restore does not need it.

## How to restore

Work on `dev` (or a new branch), never on the backup branch. Run every command from the project folder.

### Restore the old home page

If `src/pages/HomeFolder.tsx` is still in the project (the redesign adds a new file and leaves it in place), change one line in `src/App.tsx` back:

```
import Home from '@/pages/HomeFolder'
```

If any of the files above were changed or removed since the backup, bring back the old versions:

```
git checkout backup-old-home-and-service-2026-11-12 -- src/pages/HomeFolder.tsx src/App.tsx src/data/home.json src/content/shared/home-images.json src/content/shared/stats.json src/content/sections/bts-wording.json src/components/BookingForm.tsx src/components/DotField.tsx src/components/DotPanel.tsx
```

Then run `npm run build`, check `/` at 360, 768 and 1440 px in light and dark, and commit ("home: restore old design from backup").

### Restore the old service page template

```
git checkout backup-old-home-and-service-2026-11-12 -- src/pages/ServicePage.tsx src/components/DotArrow.tsx
```

If the shared components or styles were also changed for the new template, restore them as well. Restoring them also undoes any later fixes in them, so compare first with `git diff backup-old-home-and-service-2026-11-12 -- src/components/ui.tsx src/styles/index.css`:

```
git checkout backup-old-home-and-service-2026-11-12 -- src/components/ui.tsx src/styles/index.css
```

Then run `npm run build`, check one service page (for example `/ai-development-services/`), and commit.

### See the old design without restoring

```
git worktree add ../q2m-old-design backup-old-home-and-service-2026-11-12
cd ../q2m-old-design
npm install
npm run build
npm run preview
```

Remove the folder afterwards with `git worktree remove ../q2m-old-design`. This removes only the folder, never the tag or the branch.
