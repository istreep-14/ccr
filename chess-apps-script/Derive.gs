function deriveGameRow_(username, game) {
  var white = game.white || {};
  var black = game.black || {};
  var url = game.url || game.pgnUrl || game.pgn || '';
  var rules = game.rules || 'chess';
  var rated = !!game.rated;
  var timeClass = game.time_class || '';
  var timeControl = game.time_control || '';
  var eco = (game.opening && game.opening.eco) || '';
  var ecoUrl = (game.opening && game.opening.url) || '';
  var utcStart = game.start_time ? new Date(game.start_time * 1000) : null;
  var utcEnd = game.end_time ? new Date(game.end_time * 1000) : null;
  var duration = (game.end_time && game.start_time) ? Math.max(0, Number(game.end_time) - Number(game.start_time)) : '';

  var userIsWhite = (white.username || '').toLowerCase() === username.toLowerCase();
  var userIsBlack = (black.username || '').toLowerCase() === username.toLowerCase();
  var userColor = userIsWhite ? 'white' : (userIsBlack ? 'black' : '');

  var opponent = userIsWhite ? (black.username || '') : (white.username || '');
  var userRating = userIsWhite ? nullIfFalsy_(white.rating) : nullIfFalsy_(black.rating);
  var opponentRating = userIsWhite ? nullIfFalsy_(black.rating) : nullIfFalsy_(white.rating);

  var result = '';
  var termination = (game.end_time && game.black && game.white && game.black.result) ? '' : '';
  var userObj = userIsWhite ? white : (userIsBlack ? black : null);
  if (userObj) {
    var r = (userObj.result || '').toLowerCase();
    if (r === 'win' || r === 'checkmated' || r === 'timeout' || r === 'resigned') {
      // Chess.com result is from player's perspective; for user it is r
    }
  }
  // Simplify: Use user's result directly if present
  if (userObj && userObj.result) {
    var ur = String(userObj.result).toLowerCase();
    if (ur === 'win') result = 'win';
    else if (ur === 'checkmated' || ur === 'timeout' || ur === 'resigned' || ur === 'lose' || ur === 'stalemated') result = 'loss';
    else if (ur === 'agreed' || ur === 'repetition' || ur === 'timevsinsufficient' || ur === 'insufficient' || ur === '50move' || ur === 'draw') result = 'draw';
    else result = ur;
  }

  var terminationClean = '';
  if (game.termination) {
    terminationClean = String(game.termination).replace(/_/g, ' ');
  }

  var gameType = (timeClass === 'daily') ? 'daily' : 'live';
  var format = rules === 'chess' ? ('chess_' + timeClass) : (rules + '_' + timeClass);

  var month = utcEnd ? Utilities.formatDate(utcEnd, 'Etc/UTC', 'yyyy-MM') : '';

  return [
    month,
    url,
    username,
    userColor,
    userRating,
    opponent,
    userIsWhite ? 'black' : (userIsBlack ? 'white' : ''),
    opponentRating,
    result,
    terminationClean,
    timeClass,
    gameType,
    format,
    rated,
    rules,
    timeControl,
    eco,
    ecoUrl,
    utcStart ? utcStart : '',
    utcEnd ? utcEnd : '',
    duration || ''
  ];
}

