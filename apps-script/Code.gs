// Points Bank: reads the sheet for the telly and writes new rows from the grown ups page.
// 1. Change FAMILY_CODE to something only you two know.
// 2. Deploy > New deployment > Web app. Execute as: Me. Who has access: Anyone.
// 3. Copy the URL ending in /exec into DATA_URL at the top of index.html.

const FAMILY_CODE = 'CHANGE_ME';   // the real code lives only in the Apps Script editor, never commit it
const CALENDAR_NAME = 'Family';   // the one calendar shown on the telly. Set to '' to hide the week.

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action === 'check') return json({ ok: codeOk(p.key) });
  if (p.action === 'add') return json(add(p));
  return json(read());
}

function codeOk(key) {
  return FAMILY_CODE !== 'CHANGE_ME' && key === FAMILY_CODE;
}

function read() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tab = name => {
    const sheet = ss.getSheetByName(name);
    return sheet ? sheet.getDataRange().getDisplayValues() : [];
  };
  return { transactions: tab('Transactions'), jobs: tab('Jobs'), events: week() };
}

function week() {
  if (!CALENDAR_NAME) return null;
  const cal = CalendarApp.getCalendarsByName(CALENDAR_NAME)[0];
  if (!cal) return [];
  // From today to the end of next week (Monday to Sunday weeks)
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const dow = (start.getDay() + 6) % 7;   // Monday is 0
  const end = new Date(start); end.setDate(end.getDate() + 14 - dow);
  const tz = Session.getScriptTimeZone();
  const f = d => Utilities.formatDate(d, tz, "yyyy-MM-dd'T'HH:mm");
  return cal.getEvents(start, end).slice(0, 150).map(ev => ({
    title: ev.getTitle(), start: f(ev.getStartTime()), end: f(ev.getEndTime()), allDay: ev.isAllDayEvent()
  }));
}

function add(p) {
  if (!codeOk(p.key)) return { ok: false, error: 'code' };
  const text = s => {
    s = String(s || '').slice(0, 120);
    return /^[=+@-]/.test(s) ? "'" + s : s;   // stop typed text being read as a formula
  };
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    if (p.type === 'job') {
      ss.getSheetByName('Jobs').appendRow(
        [text(p.date), text(p.child), text(p.job), Number(p.points) || 0, text(p.id), p.status === 'removed' ? 'removed' : 'added']);
    } else {
      ss.getSheetByName('Transactions').appendRow(
        [text(p.date), text(p.child), text(p.label), Number(p.points) || 0, text(p.id), text(p.job)]);
    }
  } finally {
    lock.releaseLock();
  }
  return { ok: true };
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
