import initSqlJs, { Database, SqlJsStatic } from 'sql.js';

let db: Database | null = null;
let SQL: SqlJsStatic | null = null;

export async function initMaternalDB() {
  if (!SQL) SQL = await initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}` });
  if (!db) {
    db = new SQL.Database();
    db.run(`CREATE TABLE IF NOT EXISTS checks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT,
      symptoms TEXT,
      risk TEXT,
      advice TEXT,
      severity TEXT,
      confidence INTEGER,
      language TEXT,
      pregnancy_week INTEGER,
      weight REAL,
      blood_pressure TEXT,
      notes TEXT
    );`);
    db.run(`CREATE TABLE IF NOT EXISTS pregnancy_info (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      due_date TEXT,
      last_period_date TEXT,
      pregnancy_week INTEGER,
      trimester INTEGER,
      created_at TEXT
    );`);
    db.run(`CREATE TABLE IF NOT EXISTS milestones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT,
      milestone_type TEXT,
      description TEXT,
      notes TEXT,
      completed BOOLEAN
    );`);
  }
  return db;
}

export async function addCheck(
  date: string, 
  symptoms: string, 
  risk: string, 
  advice: string, 
  severity: string = 'low',
  confidence: number = 80,
  language: string = 'en',
  pregnancy_week?: number,
  weight?: number,
  blood_pressure?: string,
  notes?: string
) {
  await initMaternalDB();
  db!.run(
    `INSERT INTO checks (date, symptoms, risk, advice, severity, confidence, language, pregnancy_week, weight, blood_pressure, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [date, symptoms, risk, advice, severity, confidence, language, pregnancy_week || null, weight || null, blood_pressure || null, notes || null]
  );
}

export async function getChecks() {
  await initMaternalDB();
  const res = db!.exec('SELECT * FROM checks ORDER BY date DESC;');
  if (res.length === 0) return [];
  return res[0].values.map(row => ({
    id: row[0],
    date: row[1],
    symptoms: row[2],
    risk: row[3],
    advice: row[4],
    severity: row[5] || 'low',
    confidence: row[6] || 80,
    language: row[7] || 'en',
    pregnancy_week: row[8] || null,
    weight: row[9] || null,
    blood_pressure: row[10] || null,
    notes: row[11] || null,
  }));
}

export async function addPregnancyInfo(due_date: string, last_period_date: string, pregnancy_week: number, trimester: number) {
  await initMaternalDB();
  db!.run(
    `INSERT INTO pregnancy_info (due_date, last_period_date, pregnancy_week, trimester, created_at) VALUES (?, ?, ?, ?, ?);`,
    [due_date, last_period_date, pregnancy_week, trimester, new Date().toISOString()]
  );
}

export async function getPregnancyInfo() {
  await initMaternalDB();
  const res = db!.exec('SELECT * FROM pregnancy_info ORDER BY created_at DESC LIMIT 1;');
  if (res.length === 0) return null;
  const row = res[0].values[0];
  return {
    id: row[0],
    due_date: row[1],
    last_period_date: row[2],
    pregnancy_week: row[3],
    trimester: row[4],
    created_at: row[5],
  };
}

export async function addMilestone(date: string, milestone_type: string, description: string, notes?: string, completed: boolean = false) {
  await initMaternalDB();
  db!.run(
    `INSERT INTO milestones (date, milestone_type, description, notes, completed) VALUES (?, ?, ?, ?, ?);`,
    [date, milestone_type, description, notes || null, completed]
  );
}

export async function getMilestones() {
  await initMaternalDB();
  const res = db!.exec('SELECT * FROM milestones ORDER BY date DESC;');
  if (res.length === 0) return [];
  return res[0].values.map(row => ({
    id: row[0],
    date: row[1],
    milestone_type: row[2],
    description: row[3],
    notes: row[4] || null,
    completed: row[5] === 1,
  }));
}

export async function updateMilestone(id: number, completed: boolean) {
  await initMaternalDB();
  db!.run('UPDATE milestones SET completed = ? WHERE id = ?;', [completed, id]);
} 