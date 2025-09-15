function httpFetchWithCache_(url, cacheKey) {
  var props = PropertiesService.getDocumentProperties();
  var etag = props.getProperty(cacheKey + ':etag');
  var lastMod = props.getProperty(cacheKey + ':lastmod');
  var ccPrev = props.getProperty(cacheKey + ':cache_control') || '';
  var tsPrev = Number(props.getProperty(cacheKey + ':ts') || 0) || 0;
  var maxAge = 0;
  var m = ccPrev.match(/max-age\s*=\s*(\d+)/i);
  if (m) maxAge = Number(m[1]) || 0;
  if (maxAge > 0 && tsPrev > 0) {
    var ageMs = Date.now() - tsPrev;
    if (ageMs < maxAge * 1000) {
      return { status: 304, headers: {}, bodyText: '' };
    }
  }

  var headers = {};
  if (etag) headers['If-None-Match'] = etag;
  if (lastMod) headers['If-Modified-Since'] = lastMod;
  var options = {
    method: 'get',
    muteHttpExceptions: true,
    headers: headers,
    followRedirects: true,
    validateHttpsCertificates: true
  };
  var resp = UrlFetchApp.fetch(url, options);
  var code = resp.getResponseCode();
  var respHeaders = resp.getAllHeaders();
  var out = {
    status: code,
    headers: respHeaders,
    bodyText: code === 304 ? '' : resp.getContentText()
  };
  if (code === 200) {
    var newEtag = caseInsensitiveHeader_(respHeaders, 'ETag');
    var newLastMod = caseInsensitiveHeader_(respHeaders, 'Last-Modified');
    if (newEtag) props.setProperty(cacheKey + ':etag', newEtag);
    if (newLastMod) props.setProperty(cacheKey + ':lastmod', newLastMod);
    props.setProperty(cacheKey + ':ts', String(Date.now()));
  }
  var cc = caseInsensitiveHeader_(respHeaders, 'Cache-Control');
  if (cc) props.setProperty(cacheKey + ':cache_control', String(cc));
  props.setProperty(cacheKey + ':status_last', String(code));
  return out;
}

function chessApiUser_(username) {
  username = (username || '').toLowerCase();
  return 'https://api.chess.com/pub/player/' + encodeURIComponent(username);
}

function chessApiArchives_(username) {
  return chessApiUser_(username) + '/games/archives';
}

function chessApiMonthly_(username, year, month) {
  var mm = month < 10 ? '0' + month : String(month);
  return chessApiUser_(username) + '/games/' + year + '/' + mm;
}

function fetchArchivesList_(username) {
  var url = chessApiArchives_(username);
  var cacheKey = 'archives:' + username;
  var resp = httpFetchWithCache_(url, cacheKey);
  if (resp.status === 304) {
    // unchanged; still need a body to know months list; fallback fetch without cond headers once per run
    // but keep lightweight: we rely on 304 path for metadata and separate fetch only when needed during check phase
  }
  if (resp.status === 200) {
    var data = JSON.parse(resp.bodyText);
    var list = data.archives || [];
    PropertiesService.getDocumentProperties().setProperty(cacheKey + ':list', JSON.stringify(list));
    return list;
  }
  if (resp.status === 304) {
    // Get previously cached list if stored
    var cached = PropertiesService.getDocumentProperties().getProperty('archives:' + username + ':list');
    if (cached) return JSON.parse(cached);
    // As a fallback, do an unconditional fetch once
    var resp2 = UrlFetchApp.fetch(url, { method: 'get', muteHttpExceptions: true });
    if (resp2.getResponseCode() === 200) {
      var data2 = JSON.parse(resp2.getContentText());
      return data2.archives || [];
    }
  }
  throw new Error('Failed to fetch archives list: HTTP ' + resp.status);
}

function fetchMonthlyGames_(username, year, month) {
  var url = chessApiMonthly_(username, year, month);
  var cacheKey = 'month:' + username + ':' + year + '-' + (month < 10 ? '0' + month : month);
  var resp = httpFetchWithCache_(url, cacheKey);
  if (resp.status === 200) {
    var data = JSON.parse(resp.bodyText);
    return { status: resp.status, headers: resp.headers, games: data.games || [] };
  }
  if (resp.status === 304) {
    return { status: resp.status, headers: resp.headers, games: null };
  }
  return { status: resp.status, headers: resp.headers, games: [] };
}

