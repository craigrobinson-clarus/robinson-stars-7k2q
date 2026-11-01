# Points Bank

A reward points board for Craig's daughters, Millie (4) and Grace (2). It shows on the living room TV through a Fire Stick running Fully Kiosk, and Craig and his wife update it from their phones.

## How it fits together

- `index.html` is the whole app: one self contained file, no build step. GitHub Pages serves it from the main branch root, so every push to main goes live within a minute or two.
- `apps-script/Code.gs` is a copy of the Google Apps Script bound to the Points Bank Google Sheet. It is the only backend. The page calls it with GET requests:
  - no action or `action=read` returns `{ transactions, jobs, events }` (sheet rows as display values, plus events from today to the end of next week from the "Family" Google Calendar)
  - `action=check&key=` checks the family code
  - `action=add&key=&type=points|job&...` appends a row
- `read()` wraps the calendar call in try/catch, so a calendar problem returns `events: null` (week strip hidden) plus the reason in `calendarError`, instead of breaking the points. Check it by opening the /exec link in a browser.
- `apps-script/appsscript.json` is the script's manifest. It lists the permissions (sheet and calendar read only) so Google always asks for Calendar access. If Code.gs ever needs a new Google service, add its scope there too.
- The Apps Script is NOT deployed from this repo. Changes to Code.gs must be pasted into the Apps Script editor by Craig and redeployed via Manage deployments, then New version (this keeps the same /exec URL).
- The real family code is never committed. It lives in the Apps Script's Script properties (Project Settings) as `FAMILY_CODE`, not in Code.gs, so pasting a new Code.gs never wipes it. `action=check` also returns `codeSet` (true or false) so you can tell whether it's been set without revealing it.
- The live deployment is the one ending `...p_o9/exec`. Update it with Manage deployments, pencil, New version. Don't make new deployments, or DATA_URL has to change.

## Google Sheet

- Transactions: Date, Child, Action, Points, ID, Job (Date column is plain text)
- Jobs: Date (yyyy-mm-dd or "daily"), Child, Job, Points, ID, Status (added or removed, latest row per ID wins)
- Summary: balances per child, for the grown ups only, the page does not read it

## The page

- `CONFIG` at the top of the script holds DATA_URL (the Apps Script /exec link), children (name, theme, colour, emoji, optional photo filename), the ACTIONS list with point values (e.g. "Ate some new food" +20), and REWARDS (Treat 50, Toy shop 200).
- Views: the TV board (default) and the grown ups page. Grown ups is a button bottom right, behind an easy adding sum (11 to 28 plus 3 to 9) (kept in sessionStorage) and then the family code (kept in localStorage per phone).
- Jobs on the board are buttons: tapping one (from a phone or tablet showing the board) writes a `Job: …` points row with the job id, and tapping a done job writes a matching `Undo: Job: …` minus row. Writing needs the family code saved on that device; without it a toast points to Grown ups.
- Grown ups page has tabs: Today (tick off jobs), Points (earn, spend, undo), Plan (jobs for today, tomorrow or every day, for one or both girls).
- Cards are always side by side: Millie left with the "pop" theme (night concert stage, neon, sparkles), Grace right with the "ice" theme (snowy wonderland, crystal trees, falling snow). Both are original designs. Do not use or imitate characters, logos or artwork from any film or franchise.
- The TV refreshes every 30 seconds. `patchBoard()` only replaces the card content and week strip so the animated backgrounds keep running. Keep it that way.
- After each render `fitCards()` checks whether a card's content is taller than the card on the TV and, if so, sets `data-fit` 1 to 5 on it, each step a bit tighter (smaller meter and header, then two column jobs, then hiding the goal line). Keep new card content working with these steps rather than letting it cut off.
- The row under the cards shows the next `EVENT_TILES` (5) calendar events as tiles, soonest on the left, labelled Today, Tomorrow or e.g. "Thu 5". Kids events (title mentions a child's name or a word in `KIDS_WORDS`) are colourful with a star tag, using that child's colour if only one is named. Everything else is a plain "Grown ups" tile. Icons come from the keyword map in `ICONS`, or a leading emoji in the event title.
- `DAILY_JOBS` in CONFIG are built in jobs that turn up on their own: teeth and bed for both girls every day, and Homework (+10) for Millie Monday to Friday. Optional `who` limits them to some children and `days` (0 Sun to 6 Sat) to some days. They are not rows in the sheet, but a "removed" row with the same id hides one, so the Plan tab can still remove them. Every day jobs have ids like `daily-teeth-millie`; set day jobs add the date (`daily-homework-millie-2026-11-02`) so removing one only skips that day.
- Leaving DATA_URL blank runs demo mode with sample data.

## Constraints

- It must run on a Fire Stick browser and an LG webOS TV: keep animations to transform and opacity, avoid heavy filters, no build tooling, no frameworks.
- Respect prefers-reduced-motion.
- The repo and site are public, so nothing private goes in here: no family code, no surnames, no addresses.
- Test layout at 960x540 (what the TV reports) and at phone width.

## Writing style for any text in the app or in messages to Craig

British English. No em dashes and no hyphens in prose. Plain, direct and informal.
