function toMonthId_(date) {
  var y = date.getUTCFullYear();
  var m = (date.getUTCMonth() + 1);
  return y + '-' + (m < 10 ? '0' + m : m);
}

function parseMonthId_(monthId) {
  var m = String(monthId || '').trim();
  var parts = m.split('-');
  if (parts.length !== 2) return null;
  var y = Number(parts[0]);
  var mm = Number(parts[1]);
  if (!isFinite(y) || !isFinite(mm) || mm < 1 || mm > 12) return null;
  return { year: y, month: mm };
}

function monthRangeInclusive_(startMonth, endMonth) {
  var a = parseMonthId_(startMonth);
  var b = parseMonthId_(endMonth);
  if (!a || !b) return [];
  var curY = a.year, curM = a.month;
  var out = [];
  while (curY < b.year || (curY === b.year && curM <= b.month)) {
    out.push(curY + '-' + (curM < 10 ? '0' + curM : curM));
    curM++;
    if (curM === 13) { curM = 1; curY++; }
  }
  return out;
}

function clamp_(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function nullIfFalsy_(v) { return v ? v : null; }

function safeGet_(obj, key) {
  return obj && Object.prototype.hasOwnProperty.call(obj, key) ? obj[key] : undefined;
}

function now_() { return new Date(); }

function iso_(d) { return Utilities.formatDate(d, 'Etc/UTC', "yyyy-MM-dd'T'HH:mm:ss'Z'"); }

function caseInsensitiveHeader_(headers, key) {
  var keys = Object.keys(headers || {});
  for (var i = 0; i < keys.length; i++) {
    if (keys[i].toLowerCase() === key.toLowerCase()) return headers[keys[i]];
  }
  return undefined;
}

function sleepMs_(ms) { Utilities.sleep(clamp_(ms, 0, 60000)); }

