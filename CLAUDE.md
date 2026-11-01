# Points Bank

A reward points board for Craig's daughters, Millie (4) and Grace (2). It shows on the living room TV through a Fire Stick running Fully Kiosk, and Craig and his wife update it from their phones.

## How it fits together

- `index.html` is the whole app: one self contained file, no build step. GitHub Pages serves it from the main branch root, so every push to main goes live within a minute or two.
- `apps-script/Code.gs` is a copy of the Google Apps Script bound to the Points Bank Google Sheet. It is the only backend. The page calls it with GET requests:
  - no action or `action=read` returns `{ transactions, jobs, events }` (sheet rows as display values, plus events from today to the end of next week from the "Family" Google Calendar)
  - `action=check&key=` checks the family code
  - `action=add&key=&type=points|job&...` appends a row
- `read()` wraps the calendar call in try/catch, so a calendar problem returns `events: null` (week strip hidden) plus the reason in `calendarError`, instead of breaking the points. Check it by opening the /exec link in a browser.
- The Apps Script is NOT deployed from this repo. Changes to Code.gs must be pasted into the Apps Script editor by Craig and redeployed via Manage deployments, then New version (this keeps the same /exec URL).
- The real family code is never committed. Keep `FAMILY_CODE = 'CHANGE_ME'` in this copy.

## Google Sheet

- Transactions: Date, Child, Action, Points, ID, Job (Date column is plain text)
- Jobs: Date (yyyy-mm-dd or "daily"), Child, Job, Points, ID, Status (added or removed, latest row per ID wins)
- Summary: balances per child, for the grown ups only, the page does not read it

## The page

- `CONFIG` at the top of the script holds DATA_URL (the Apps Script /exec link), children (name, theme, colour, emoji, optional photo filename), the ACTIONS list with point values, and REWARDS (Treat 50, Toy shop 200).
- Views: the TV board (default) and the grown ups page. Grown ups is a button bottom right, behind an easy adding sum (11 to 28 plus 3 to 9) (kept in sessionStorage) and then the family code (kept in localStorage per phone).
- Grown ups page has tabs: Today (tick off jobs), Points (earn, spend, undo), Plan (jobs for today, tomorrow or every day, for one or both girls).
- Cards are always side by side: Millie left with the "pop" theme (night concert stage, neon, sparkles), Grace right with the "ice" theme (snowy wonderland, crystal trees, falling snow). Both are original designs. Do not use or imitate characters, logos or artwork from any film or franchise.
- The TV refreshes every 30 seconds. `patchBoard()` only replaces the card content and week strip so the animated backgrounds keep running. Keep it that way.
- After each render `fitCards()` checks whether a card's content is taller than the card on the TV and, if so, sets `data-fit` 1 to 4 on it, each step a bit tighter (smaller meter and header, then two column jobs, then hiding the goal line). Keep new card content working with these steps rather than letting it cut off.
- The week strip under the cards has three columns: Today, This week (the rest of the Monday to Sunday week) and Next week. Up to 3 lines each, ending in "and N more" when there are too many to fit. Icons per event come from the keyword map in `ICONS`, or a leading emoji in the event title.
- Leaving DATA_URL blank runs demo mode with sample data.

## Constraints

- It must run on a Fire Stick browser and an LG webOS TV: keep animations to transform and opacity, avoid heavy filters, no build tooling, no frameworks.
- Respect prefers-reduced-motion.
- The repo and site are public, so nothing private goes in here: no family code, no surnames, no addresses.
- Test layout at 960x540 (what the TV reports) and at phone width.

## Writing style for any text in the app or in messages to Craig

British English. No em dashes and no hyphens in prose. Plain, direct and informal.
