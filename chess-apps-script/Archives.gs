function listArchivesAndRecord_() {
  var username = getUsername_();
  if (!username) throw new Error('Username is not set. Use the menu to set it.');
  var sheets = ensureAllSheets_();
  var archives = fetchArchivesList_(username);
  var months = [];
  var seenMonths = {};
  var seenUrls = {};
  for (var i = 0; i < archives.length; i++) {
    var url = String(archives[i] || '');
    if (!url || seenUrls[url]) continue;
    var parts = url.split('/');
    var year = Number(parts[parts.length - 2]);
    var month = Number(parts[parts.length - 1]);
    var monthId = year + '-' + (month < 10 ? '0' + month : month);
    if (seenMonths[monthId]) continue;
    months.push({ monthId: monthId, url: url });
    seenMonths[monthId] = true;
    seenUrls[url] = true;
  }
  months.sort(function(a,b){ return a.monthId < b.monthId ? -1 : (a.monthId > b.monthId ? 1 : 0); });

  // Update archives sheet entries with just the archive_url and month if missing
  for (var j = 0; j < months.length; j++) {
    var m = months[j];
    var row = [
      m.monthId,
      m.url,
      '', '', '', '', '',
      '', '',
      '', '', '',
      '', '',
      0,
      ''
    ];
    upsertArchiveRow_(row);
  }

  return months.map(function(m){ return m.monthId; });
}

function checkMonth_(monthId) {
  var username = getUsername_();
  var parts = parseMonthId_(monthId);
  if (!parts) throw new Error('Invalid monthId ' + monthId);
  var res = fetchMonthlyGames_(username, parts.year, parts.month);
  var headers = res.headers || {};
  var etag = caseInsensitiveHeader_(headers, 'ETag') || '';
  var lastMod = caseInsensitiveHeader_(headers, 'Last-Modified') || '';
  var cacheControl = caseInsensitiveHeader_(headers, 'Cache-Control') || '';
  var now = new Date();
  var status = res.status;
  var row = [
    monthId,
    chessApiMonthly_(username, parts.year, parts.month),
    etag,
    lastMod,
    cacheControl,
    String(status),
    status === 304 ? 'unchanged' : (status === 200 ? 'ok' : 'error'),
    'yes',
    '',
    '',
    iso_(now),
    '',
    '',
    '',
    '',
    '',
    ''
  ];
  upsertArchiveRow_(row);
  return { monthId: monthId, status: status, headers: headers, games: res.games };
}

