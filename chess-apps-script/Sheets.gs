function getOrCreateSheet_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  return sheet;
}

function ensureHeaders_(sheet, headers) {
  var range = sheet.getRange(1, 1, 1, sheet.getMaxColumns());
  var existing = range.getValues()[0];
  var changed = false;
  var width = headers.length;
  if (sheet.getMaxColumns() < width) sheet.insertColumnsAfter(sheet.getMaxColumns(), width - sheet.getMaxColumns());
  for (var i = 0; i < headers.length; i++) {
    if (existing[i] !== headers[i]) {
      sheet.getRange(1, i + 1).setValue(headers[i]);
      changed = true;
    }
  }
  if (changed) {
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
}

function ensureAllSheets_() {
  ensureSpreadsheetSettings_();
  var names = CONFIG.sheetNames;
  var sheets = {
    games: getOrCreateSheet_(names.games),
    archives: getOrCreateSheet_(names.archives),
    logs: getOrCreateSheet_(names.logs),
    stats: getOrCreateSheet_(names.stats)
  };
  ensureHeaders_(sheets.games, SHEET_HEADERS.games);
  ensureHeaders_(sheets.archives, SHEET_HEADERS.archives);
  ensureHeaders_(sheets.logs, SHEET_HEADERS.logs);
  ensureHeaders_(sheets.stats, SHEET_HEADERS.stats);
  return sheets;
}

function appendRowsBatched_(sheet, headers, rows, batchSize, rowCap) {
  if (!rows || rows.length === 0) return 0;
  var cap = Number(rowCap) || 0;
  var total = rows.length;
  if (cap > 0 && total > cap) rows = rows.slice(0, cap);
  var batch = Math.max(1, Math.min(Number(batchSize) || CONFIG.defaultBatchSize, 20000));
  var startRow = sheet.getLastRow() + 1;
  var appended = 0;
  for (var i = 0; i < rows.length; i += batch) {
    var chunk = rows.slice(i, i + batch);
    var range = sheet.getRange(startRow + appended, 1, chunk.length, headers.length);
    range.setValues(chunk);
    appended += chunk.length;
  }
  return appended;
}

function findArchiveRowByMonth_(sheet, month) {
  var values = sheet.getDataRange().getValues();
  for (var r = 1; r < values.length; r++) {
    if (values[r][0] === month) return r + 1;
  }
  return -1;
}

function upsertArchiveRow_(archiveRow) {
  var sheet = getOrCreateSheet_(CONFIG.sheetNames.archives);
  ensureHeaders_(sheet, SHEET_HEADERS.archives);
  var month = archiveRow[0];
  var rowIndex = findArchiveRowByMonth_(sheet, month);
  if (rowIndex < 0) {
    sheet.appendRow(archiveRow);
  } else {
    sheet.getRange(rowIndex, 1, 1, SHEET_HEADERS.archives.length).setValues([archiveRow]);
  }
}

function logRun_(logRow) {
  var sheet = getOrCreateSheet_(CONFIG.sheetNames.logs);
  ensureHeaders_(sheet, SHEET_HEADERS.logs);
  sheet.appendRow(logRow);
}

