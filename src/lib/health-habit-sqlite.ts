import initSqlJs, { Database, SqlJsStatic } from 'sql.js';

let db: Database | null = null;
let SQL: SqlJsStatic | null = null;

// Initialize the database (in-memory for now, can persist to localStorage if needed)
export async function initHabitDB() {
  if (!SQL) SQL = await initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}` });
  if (!db) {
    db = new SQL.Database();
    db.run(`CREATE TABLE IF NOT EXISTS challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT,
      mood TEXT,
      symptoms TEXT,
      challenge1 TEXT,
      challenge2 TEXT,
      challenge3 TEXT,
      progress INTEGER DEFAULT 0
    );`);
  }
  return db;
}

export async function addChallenge(date: string, mood: string, symptoms: string, challenges: string[]) {
  await initHabitDB();
  db!.run(
    `INSERT INTO challenges (date, mood, symptoms, challenge1, challenge2, challenge3, progress) VALUES (?, ?, ?, ?, ?, ?, 0);`,
    [date, mood, symptoms, challenges[0], challenges[1], challenges[2]]
  );
}

export async function getChallenges() {
  await initHabitDB();
  const res = db!.exec('SELECT * FROM challenges ORDER BY id DESC;');
  if (res.length === 0) return [];
  return res[0].values.map(row => ({
    id: row[0],
    date: row[1],
    mood: row[2],
    symptoms: row[3],
    challenges: [row[4], row[5], row[6]],
    progress: row[7],
  }));
}

export async function updateChallengeProgress(id: number, progress: number) {
  await initHabitDB();
  db!.run('UPDATE challenges SET progress = ? WHERE id = ?;', [progress, id]);
} 