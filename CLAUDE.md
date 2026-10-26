# Course Calendar

Students use this calendar for deadlines and expected workload, so a wrong date
or link has a real cost. The calendar is edited by changing the
`calendar-<term>.json` files directly. There is no editor UI.

## Where things live

- `calendar-<term>.json`: one file per term (`f26` = Fall 2026, `w26` = Winter
  2026). The term students see is `CURRENT_TERM` in `src/config.ts`.
- `src/`: the React viewer, read-only.
- `docs/`: build output, regenerated and committed by CI. Never edit it by hand.
- `.github/workflows/deploy.yml`: `PUBLISHED_WEEKS: 0-10` decides which weeks
  are published. Weeks outside the range stay private. "Publish week 11" means
  changing it to `0-11`.
- `check-calendar.ts` (`bun run check`): checks the current term's file. CI
  runs it before every deploy.

## Data shape

```json
{
	"weeks": [
		{
			"week": "W08 - OCT 19",
			"startDate": "2026-10-19",
			"class1": [],
			"class2": [],
			"homework": []
		}
	]
}
```

`startDate` is the Monday of that week, and it is used to highlight the current
week. `class1` and `class2` are the week's two class sessions, and `homework` is
the work outside class.

Each activity is `{ type, title, link?, time?, due? }`. Do not add `id`,
`chosen` or `selected`; those came from the old editor.

- `type`: one of `lesson`, `quiz`, `assignment`, `project`, `exercise`,
  `activity`, `note` or `cancelled`. The type sets the color.
  - `note`: a plain announcement, such as a schedule change or a holiday.
    Usually it has only a `title`.
  - `cancelled`: puts stripes on the whole class column. For an async class,
    put `{"type": "cancelled", "title": "Async"}` (or a short instruction)
    first, then the activities students do on their own.
- `time`: the expected effort, written `5m`, `30m`, `1h`, `1h30m` or `2h30m`.
- `due`: **must be ISO `YYYY-MM-DD`**. It displays as `OCT 21`. Free text such
  as `"DUE SEP 02"` or `"DEC 12 @ NOON"` (left over from older terms) shows up
  wrong.
- The viewer ignores any other field, such as `note` on some `cancelled` entries.

## Conventions

- Assignment `A3 - Mario`, quiz `Q3 - Mario (Individual)` and
  `Q3 - Mario (Group)` (always a pair), exercise `E1.1 - Sprites`, peer review
  `A3 Workshop` (type `activity`).
- Graded work that isn't a numbered assignment gets its weight in the title,
  for example `Zelda Tutorial (2%)`.
- Assignments and workshops usually go in `homework` with a `due` date. Quizzes
  go in the class where they are written.
- Links are mostly Moodle (`moodle.johnabbott.qc.ca/mod/...?id=N`) or the course
  site (`game.singh.gg/docs/...`). Moodle IDs change every term: an ID that
  matches the previous term's file is probably stale. Don't guess a link; leave
  `link` out and say so.

## Making a change

1. Edit the JSON. Keep tab indentation and the existing key order; leave the
   rest of the file alone.
2. Check it with `bun run check -- --weeks <PUBLISHED_WEEKS>`. Problems in
   published weeks are errors and block the deploy. Problems in later weeks are
   warnings: report them, but they don't need fixing yet. When publishing more
   weeks, run the check with the new range first.
3. Preview if useful: `bun run dev` serves the viewer at `localhost:3000`.
4. Commit with a short message in the style of the history, e.g.
   `chore: add W11 activities`.
5. Pushing to `main` deploys to students right away. Ask before pushing.
