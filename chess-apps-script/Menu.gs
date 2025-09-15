function onOpen() {
  ensureAllSheets_();
  SpreadsheetApp.getUi()
    .createMenu('Chess Importer')
    .addItem('Set Username', 'menuSetUsername_')
    .addSeparator()
    .addItem('Check Archives (list months)', 'menuCheckArchives_')
    .addItem('Process Current Month', 'menuProcessCurrentMonth_')
    .addItem('Process Specific Month Range', 'menuProcessMonthRange_')
    .addItem('Smart Update (All Known Months)', 'menuSmartUpdate_')
    .addSeparator()
    .addItem('Append Player Stats Snapshot', 'menuAppendStats_')
    .addSeparator()
    .addItem('Maintenance: Detect Duplicates', 'menuDetectDuplicates_')
    .addItem('Maintenance: Rebuild Last-Seen Pointer', 'menuRebuildLastSeen_')
    .addToUi();
}

function menuSetUsername_() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt('Chess.com Username', 'Enter the username to track (single user):', ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() === ui.Button.OK) {
    var name = response.getResponseText().trim();
    if (!name) return;
    setUsername_(name);
    ui.alert('Username set to: ' + name);
  }
}

function menuCheckArchives_() {
  var months = listArchivesAndRecord_();
  SpreadsheetApp.getUi().alert('Found ' + months.length + ' months. See the archives sheet.');
}

function getCurrentMonthId_() {
  var now = new Date();
  return Utilities.formatDate(now, 'Etc/UTC', 'yyyy-MM');
}

function menuProcessCurrentMonth_() {
  var m = getCurrentMonthId_();
  var res = processMonthsAppendOnly_([m]);
  SpreadsheetApp.getUi().alert('Processed ' + res.monthsProcessed.length + ' month(s). Appended ' + res.rowsAppended + ' rows.');
}

function menuProcessMonthRange_() {
  var ui = SpreadsheetApp.getUi();
  var months = listArchivesAndRecord_();
  if (months.length === 0) { ui.alert('No archives found.'); return; }
  var startRes = ui.prompt('Start month (YYYY-MM)', 'Earliest available is ' + months[0] + '. Enter start month:', ui.ButtonSet.OK_CANCEL);
  if (startRes.getSelectedButton() !== ui.Button.OK) return;
  var endRes = ui.prompt('End month (YYYY-MM)', 'Latest available is ' + months[months.length - 1] + '. Enter end month:', ui.ButtonSet.OK_CANCEL);
  if (endRes.getSelectedButton() !== ui.Button.OK) return;
  var startM = startRes.getResponseText().trim();
  var endM = endRes.getResponseText().trim();
  var range = monthRangeInclusive_(startM, endM);
  if (range.length === 0) { ui.alert('Invalid range.'); return; }
  var res = processMonthsAppendOnly_(range);
  ui.alert('Processed ' + res.monthsProcessed.length + ' month(s). Appended ' + res.rowsAppended + ' rows.');
}

function menuSmartUpdate_() {
  var months = listArchivesAndRecord_();
  var res = processMonthsAppendOnly_(months);
  SpreadsheetApp.getUi().alert('Smart update processed ' + res.monthsProcessed.length + ' month(s). Appended ' + res.rowsAppended + ' rows.');
}

function menuAppendStats_() {
  appendPlayerStatsSnapshot_();
}

function menuDetectDuplicates_() {
  detectDuplicates_();
}

function menuRebuildLastSeen_() {
  rebuildLastSeen_();
}

