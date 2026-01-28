import initSqlJs, { Database, SqlJsStatic } from 'sql.js';

let db: Database | null = null;
let SQL: SqlJsStatic | null = null;

export async function initMisinformationDB() {
  if (!SQL) SQL = await initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}` });
  if (!db) {
    db = new SQL.Database();
    db.run(`CREATE TABLE IF NOT EXISTS checks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT,
      claim TEXT,
      verdict TEXT,
      sources TEXT
    );`);
  }
  return db;
}

export async function addCheck(date: string, claim: string, verdict: string, sources: string) {
  await initMisinformationDB();
  db!.run(
    `INSERT INTO checks (date, claim, verdict, sources) VALUES (?, ?, ?, ?);`,
    [date, claim, verdict, sources]
  );
}

export async function getChecks() {
  await initMisinformationDB();
  const res = db!.exec('SELECT * FROM checks ORDER BY date DESC;');
  if (res.length === 0) return [];
  return res[0].values.map(row => ({
    id: row[0],
    date: row[1],
    claim: row[2],
    verdict: row[3],
    sources: row[4],
  }));
} 