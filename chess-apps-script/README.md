Chess.com Sheets Importer (Google Apps Script)

Setup

1) Create a new Google Sheet. Open Extensions → Apps Script.
2) In Apps Script, create files from this folder (`*.gs`) and set `appsscript.json` timezone to America/New_York.
3) Reload the spreadsheet. The "Chess Importer" menu will appear.
4) Menu → Set Username.
5) Menu → Check Archives to list months in `archives`.

Usage

- Process Current Month: append new games for the current month, honoring caching.
- Process Specific Month Range: pick start/end months (YYYY-MM) for chunked backfills.
- Smart Update (All Known Months): scan all months in `archives` and append new games.
- Append Player Stats Snapshot: appends ratings and W/L/D to `player_stats`.
- Maintenance → Detect Duplicates: find duplicate game URLs in `games`.
- Maintenance → Rebuild Last-Seen Pointer: rebuild `last_seen_*` in `archives` from `games`.

Notes

- Append-only with fixed headers.
- HTTP caching (ETag/Last-Modified). 304s skip downloads.
- Batched writes (default 500). Change via document properties.
- Dates stored as UTC date-times; sheet timezone is New York.

