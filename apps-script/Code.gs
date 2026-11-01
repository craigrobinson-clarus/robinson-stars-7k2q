// Points Bank: reads the sheet for the telly and writes new rows from the grown ups page.
// The family code is NOT in this file. Set it once in Project Settings > Script properties:
//   Property: FAMILY_CODE   Value: your code
// That way pasting a new copy of this file never wipes it.
// Deploy: Manage deployments > pencil > New version > Deploy (keeps the same /exec link).

const CALENDAR_NAME = 'Family';   // the one calendar shown on the telly. Set to '' to hide the week.

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action === 'check') return json({ ok: codeOk(p.key), codeSet: !!familyCode() });
  if (p.action === 'add') return json(add(p));
  return json(read());
}

function familyCode() {
  return String(PropertiesService.getScriptProperties().getProperty('FAMILY_CODE') || '').trim();
}

function codeOk(key) {
  const code = familyCode();
  return !!code && String(key || '').trim() === code;
}

function read() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tab = name => {
    const sheet = ss.getSheetByName(name);
    return sheet ? sheet.getDataRange().getDisplayValues() : [];
  };
  // A calendar problem should never stop the points loading. The reason goes back as calendarError so it can be checked.
  let events = null, calendarError = null;
  try { events = week(); } catch (err) { calendarError = String((err && err.message) || err); }
  return { transactions: tab('Transactions'), jobs: tab('Jobs'), events: events, calendarError: calendarError };
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
