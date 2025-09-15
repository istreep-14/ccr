var CONFIG = {
  timezone: 'America/New_York',
  sheetNames: {
    games: 'games',
    archives: 'archives',
    logs: 'logs',
    stats: 'player_stats'
  },
  defaultBatchSize: 500,
  defaultAppendOnly: true,
  fixedHeaders: true
};

var PROPERTY_KEYS = {
  username: 'username',
  appendOnly: 'append_only',
  batchSize: 'batch_size',
  rowCap: 'row_cap'
};

function getDocProps_() {
  return PropertiesService.getDocumentProperties();
}

function getUsername_() {
  return getDocProps_().getProperty(PROPERTY_KEYS.username) || '';
}

function setUsername_(username) {
  getDocProps_().setProperty(PROPERTY_KEYS.username, (username || '').trim().toLowerCase());
}

function getAppendOnly_() {
  var val = getDocProps_().getProperty(PROPERTY_KEYS.appendOnly);
  if (val === null || val === undefined || val === '') return CONFIG.defaultAppendOnly;
  return String(val) === 'true';
}

function setAppendOnly_(flag) {
  getDocProps_().setProperty(PROPERTY_KEYS.appendOnly, String(!!flag));
}

function getBatchSize_() {
  var val = Number(getDocProps_().getProperty(PROPERTY_KEYS.batchSize));
  return isFinite(val) && val > 0 ? Math.floor(val) : CONFIG.defaultBatchSize;
}

function setBatchSize_(n) {
  var val = Number(n);
  if (isFinite(val) && val > 0) getDocProps_().setProperty(PROPERTY_KEYS.batchSize, String(Math.floor(val)));
}

function getRowCap_() {
  var val = Number(getDocProps_().getProperty(PROPERTY_KEYS.rowCap));
  return isFinite(val) && val > 0 ? Math.floor(val) : 0;
}

function setRowCap_(n) {
  var val = Number(n);
  if (isFinite(val) && val >= 0) getDocProps_().setProperty(PROPERTY_KEYS.rowCap, String(Math.floor(val)));
}

function ensureSpreadsheetSettings_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return;
  try {
    ss.setSpreadsheetTimeZone(CONFIG.timezone);
  } catch (e) {}
}

var SHEET_HEADERS = {
  games: [
    'month',
    'key_url',
    'username',
    'user_color',
    'user_rating',
    'opponent',
    'opponent_color',
    'opponent_rating',
    'result',
    'termination',
    'time_class',
    'game_type',
    'format',
    'rated',
    'rules',
    'time_control',
    'eco',
    'eco_url',
    'utc_start',
    'utc_end',
    'duration_seconds'
  ],
  archives: [
    'month',
    'archive_url',
    'etag',
    'last_modified',
    'cache_control',
    'http_status_last',
    'status',
    'phase_checked',
    'phase_processed',
    'phase_written',
    'checked_at',
    'processed_at',
    'written_at',
    'last_seen_end_time',
    'last_seen_url',
    'game_count_written',
    'note'
  ],
  logs: [
    'timestamp',
    'action',
    'username',
    'months_considered',
    'months_processed',
    'rows_appended',
    'rows_updated',
    'duration_seconds',
    'status',
    'note'
  ],
  stats: [
    'timestamp',
    'username',
    'source',
    'bullet_rating', 'bullet_rd', 'bullet_w', 'bullet_l', 'bullet_d',
    'blitz_rating', 'blitz_rd', 'blitz_w', 'blitz_l', 'blitz_d',
    'rapid_rating', 'rapid_rd', 'rapid_w', 'rapid_l', 'rapid_d',
    'daily_rating', 'daily_rd', 'daily_w', 'daily_l', 'daily_d'
  ]
};

