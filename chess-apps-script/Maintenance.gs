function detectDuplicates_() {
  var sheet = getOrCreateSheet_(CONFIG.sheetNames.games);
  ensureHeaders_(sheet, SHEET_HEADERS.games);
  var data = sheet.getDataRange().getValues();
  var idxUrl = SHEET_HEADERS.games.indexOf('key_url');
  var seen = {};
  var dups = [];
  for (var r = 1; r < data.length; r++) {
    var url = data[r][idxUrl];
    if (!url) continue;
    if (seen[url]) {
      dups.push(r + 1);
    } else {
      seen[url] = true;
    }
  }
  SpreadsheetApp.getUi().alert(dups.length ? ('Duplicate rows at lines: ' + dups.join(', ')) : 'No duplicates detected.');
}

function rebuildLastSeen_() {
  var aSheet = getOrCreateSheet_(CONFIG.sheetNames.archives);
  ensureHeaders_(aSheet, SHEET_HEADERS.archives);
  var gSheet = getOrCreateSheet_(CONFIG.sheetNames.games);
  ensureHeaders_(gSheet, SHEET_HEADERS.games);
  var archives = aSheet.getDataRange().getValues();
  var games = gSheet.getDataRange().getValues();
  var idxMonthGames = SHEET_HEADERS.games.indexOf('month');
  var idxUrlGames = SHEET_HEADERS.games.indexOf('key_url');
  var idxEndGames = SHEET_HEADERS.games.indexOf('utc_end');

  var maxByMonth = {};
  for (var r = 1; r < games.length; r++) {
    var m = games[r][idxMonthGames];
    var u = games[r][idxUrlGames];
    var d = games[r][idxEndGames];
    if (!m || !u) continue;
    var t = (d instanceof Date) ? Math.floor(d.getTime() / 1000) : 0;
    if (!maxByMonth[m] || t > maxByMonth[m].t || (t === maxByMonth[m].t && String(u) > String(maxByMonth[m].u))) {
      maxByMonth[m] = { t: t, u: u };
    }
  }

  for (var ar = 1; ar < archives.length; ar++) {
    var month = archives[ar][0];
    if (!month) continue;
    var max = maxByMonth[month];
    var lastUrl = max ? max.u : '';
    var lastT = max ? max.t : '';
    aSheet.getRange(ar + 1, SHEET_HEADERS.archives.indexOf('last_seen_url') + 1).setValue(lastUrl);
    aSheet.getRange(ar + 1, SHEET_HEADERS.archives.indexOf('last_seen_end_time') + 1).setValue(lastT);
  }
  SpreadsheetApp.getUi().alert('Rebuilt last-seen URLs for months with data.');
}

