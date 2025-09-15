function readArchiveMeta_(monthId) {
  var sheet = getOrCreateSheet_(CONFIG.sheetNames.archives);
  ensureHeaders_(sheet, SHEET_HEADERS.archives);
  var rowIdx = findArchiveRowByMonth_(sheet, monthId);
  if (rowIdx < 0) return { rowIdx: -1 };
  var row = sheet.getRange(rowIdx, 1, 1, SHEET_HEADERS.archives.length).getValues()[0];
  return {
    rowIdx: rowIdx,
    lastSeenEndTime: row[SHEET_HEADERS.archives.indexOf('last_seen_end_time')] || '',
    lastSeenUrl: row[SHEET_HEADERS.archives.indexOf('last_seen_url')] || '',
    gameCountWritten: Number(row[SHEET_HEADERS.archives.indexOf('game_count_written')] || 0) || 0
  };
}

function updateArchiveAfterProcess_(monthId, res, appendedCount, lastSeenEndTime, lastSeenUrl) {
  var sheet = getOrCreateSheet_(CONFIG.sheetNames.archives);
  ensureHeaders_(sheet, SHEET_HEADERS.archives);
  var idx = findArchiveRowByMonth_(sheet, monthId);
  var now = now_();
  var headers = res.headers || {};
  var etag = caseInsensitiveHeader_(headers, 'ETag') || '';
  var lastMod = caseInsensitiveHeader_(headers, 'Last-Modified') || '';
  var cacheControl = caseInsensitiveHeader_(headers, 'Cache-Control') || '';
  var status = res.status;
  var existing = { row: [], count: 0 };
  if (idx > 0) {
    existing.row = sheet.getRange(idx, 1, 1, SHEET_HEADERS.archives.length).getValues()[0];
    existing.count = Number(existing.row[SHEET_HEADERS.archives.indexOf('game_count_written')] || 0) || 0;
  }
  var newCount = existing.count + (appendedCount || 0);
  var row = [
    monthId,
    chessApiMonthly_(getUsername_(), parseMonthId_(monthId).year, parseMonthId_(monthId).month),
    etag,
    lastMod,
    cacheControl,
    String(status),
    status === 304 ? 'unchanged' : (status === 200 ? 'ok' : 'error'),
    existing.row[SHEET_HEADERS.archives.indexOf('phase_checked')] || '',
    'yes',
    'yes',
    existing.row[SHEET_HEADERS.archives.indexOf('checked_at')] || '',
    iso_(now),
    iso_(now),
    lastSeenEndTime || existing.row[SHEET_HEADERS.archives.indexOf('last_seen_end_time')] || '',
    lastSeenUrl || existing.row[SHEET_HEADERS.archives.indexOf('last_seen_url')] || '',
    newCount,
    ''
  ];
  upsertArchiveRow_(row);
}

function processMonthsAppendOnly_(monthIds) {
  var username = getUsername_();
  var sheets = ensureAllSheets_();
  var batchSize = getBatchSize_();
  var rowCap = getRowCap_();
  var gamesRows = [];
  var monthsProcessed = [];
  var start = new Date();

  for (var i = 0; i < monthIds.length; i++) {
    var m = monthIds[i];
    var parts = parseMonthId_(m);
    if (!parts) continue;
    var res = fetchMonthlyGames_(username, parts.year, parts.month);
    if (res.status === 304) {
      updateArchiveAfterProcess_(m, res, 0, '', '');
      monthsProcessed.push(m);
      continue;
    }
    var meta = readArchiveMeta_(m);
    var lastSeenT = Number(meta.lastSeenEndTime || 0) || 0;
    var lastSeenUrl = String(meta.lastSeenUrl || '');
    var games = res.games || [];
    games.sort(function(a,b){
      var at = Number(a.end_time||0), bt = Number(b.end_time||0);
      if (at !== bt) return at - bt;
      var au = String(a.url||''), bu = String(b.url||'');
      if (au < bu) return -1; if (au > bu) return 1; return 0;
    });
    var filtered = [];
    for (var g = 0; g < games.length; g++) {
      var gt = Number(games[g].end_time || 0) || 0;
      var gu = String(games[g].url || '');
      var isAfter = gt > lastSeenT || (gt === lastSeenT && gu > lastSeenUrl);
      if (isAfter) filtered.push(games[g]);
    }
    for (var f = 0; f < filtered.length; f++) {
      var row = deriveGameRow_(username, filtered[f]);
      gamesRows.push(row);
    }
    var newLastT = filtered.length ? String(filtered[filtered.length - 1].end_time || '') : '';
    var newLastU = filtered.length ? String(filtered[filtered.length - 1].url || '') : '';
    updateArchiveAfterProcess_(m, res, filtered.length, newLastT, newLastU);
    monthsProcessed.push(m);
  }

  var appended = appendRowsBatched_(sheets.games, SHEET_HEADERS.games, gamesRows, batchSize, rowCap);

  var end = new Date();
  logRun_([
    iso_(end),
    'process_append_only',
    username,
    monthIds.join(','),
    monthsProcessed.join(','),
    appended,
    0,
    Math.round((end - start) / 1000),
    'ok',
    ''
  ]);

  return { monthsProcessed: monthsProcessed, rowsAppended: appended };
}

