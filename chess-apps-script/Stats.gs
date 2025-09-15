function appendPlayerStatsSnapshot_() {
  var username = getUsername_();
  if (!username) throw new Error('Username is not set. Use the menu to set it.');
  var url = chessApiUser_(username) + '/stats';
  var cacheKey = 'stats:' + username;
  var resp = httpFetchWithCache_(url, cacheKey);
  if (resp.status !== 200) {
    SpreadsheetApp.getUi().alert('Failed to fetch stats: HTTP ' + resp.status);
    return;
  }
  var data = JSON.parse(resp.bodyText);
  var sheet = getOrCreateSheet_(CONFIG.sheetNames.stats);
  ensureHeaders_(sheet, SHEET_HEADERS.stats);
  var t = iso_(new Date());
  function mode(m) { return data[m] || {}; }
  function val(m, k) { var o = mode(m); return o && o.last && o.last[k] != null ? o.last[k] : ''; }
  function wld(m, k) { var o = mode(m); return o && o.record && o.record[k] != null ? o.record[k] : ''; }
  var row = [
    t,
    username,
    'chess.com',
    val('chess_bullet', 'rating'), val('chess_bullet', 'rd'), wld('chess_bullet', 'win'), wld('chess_bullet', 'loss'), wld('chess_bullet', 'draw'),
    val('chess_blitz', 'rating'), val('chess_blitz', 'rd'), wld('chess_blitz', 'win'), wld('chess_blitz', 'loss'), wld('chess_blitz', 'draw'),
    val('chess_rapid', 'rating'), val('chess_rapid', 'rd'), wld('chess_rapid', 'win'), wld('chess_rapid', 'loss'), wld('chess_rapid', 'draw'),
    val('chess_daily', 'rating'), val('chess_daily', 'rd'), wld('chess_daily', 'win'), wld('chess_daily', 'loss'), wld('chess_daily', 'draw')
  ];
  sheet.appendRow(row);
  SpreadsheetApp.getUi().alert('Appended stats snapshot for ' + username + '.');
}

