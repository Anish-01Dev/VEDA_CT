import initSqlJs, { Database, SqlJsStatic } from 'sql.js';

let db: Database | null = null;
let SQL: SqlJsStatic | null = null;

export async function initPeriodDB() {
  try {
    if (!SQL) {
      SQL = await initSqlJs({ 
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}` 
      });
    }
    if (!db) {
      db = new SQL.Database();
      
      // Create cycles table
      db.run(`CREATE TABLE IF NOT EXISTS cycles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        flow TEXT NOT NULL,
        notes TEXT,
        cycle_length INTEGER NOT NULL
      );`);
      
      // Create logs table
      db.run(`CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        symptoms TEXT NOT NULL,
        mood TEXT NOT NULL,
        pain_level INTEGER DEFAULT 0,
        flow_intensity INTEGER DEFAULT 0,
        weight REAL,
        temperature REAL,
        cycle_id INTEGER NOT NULL,
        FOREIGN KEY(cycle_id) REFERENCES cycles(id) ON DELETE CASCADE
      );`);
      
      console.log('Period tracker database initialized successfully');
    }
    return db;
  } catch (error) {
    console.error('Failed to initialize period tracker database:', error);
    throw new Error('Database initialization failed');
  }
}

export async function addCycle(start_date: string, end_date: string, flow: string, notes: string, cycle_length?: number) {
  try {
    await initPeriodDB();
    const calculatedLength = cycle_length || Math.floor((new Date(end_date).getTime() - new Date(start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const stmt = db!.prepare(
      `INSERT INTO cycles (start_date, end_date, flow, notes, cycle_length) VALUES (?, ?, ?, ?, ?);`
    );
    stmt.run([start_date, end_date, flow, notes, calculatedLength]);
    stmt.free();
    
    console.log('Cycle added successfully:', { start_date, end_date, flow, calculatedLength });
  } catch (error) {
    console.error('Error adding cycle:', error);
    throw error;
  }
}

export async function getCycles() {
  try {
    await initPeriodDB();
    const res = db!.exec('SELECT * FROM cycles ORDER BY start_date DESC;');
    if (res.length === 0) return [];
    
    const cycles = res[0].values.map(row => ({
      id: row[0],
      start_date: row[1],
      end_date: row[2],
      flow: row[3],
      notes: row[4] || '',
      cycle_length: row[5] || 0,
    }));
    
    console.log('Retrieved cycles:', cycles.length);
    return cycles;
  } catch (error) {
    console.error('Error getting cycles:', error);
    return [];
  }
}

export async function addLog(date: string, symptoms: string | string[], mood: string, cycle_id: number, pain_level: number = 0, flow_intensity: number = 0, weight?: number, temperature?: number) {
  try {
    await initPeriodDB();
    const symptomsJson = Array.isArray(symptoms) ? JSON.stringify(symptoms) : symptoms;
    
    const stmt = db!.prepare(
      `INSERT INTO logs (date, symptoms, mood, pain_level, flow_intensity, weight, temperature, cycle_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`
    );
    stmt.run([date, symptomsJson, mood, pain_level, flow_intensity, weight || null, temperature || null, cycle_id]);
    stmt.free();
    
    console.log('Log added successfully:', { date, symptoms: symptomsJson, mood, cycle_id });
  } catch (error) {
    console.error('Error adding log:', error);
    throw error;
  }
}

export async function getLogs(cycle_id?: number) {
  try {
    await initPeriodDB();
    let query = 'SELECT * FROM logs';
    let params: any[] = [];
    if (cycle_id !== undefined) {
      query += ' WHERE cycle_id = ?';
      params.push(cycle_id);
    }
    query += ' ORDER BY date DESC;';
    
    const res = db!.exec(query, params);
    if (res.length === 0) return [];
    
    const logs = res[0].values.map(row => {
      let symptoms = [];
      try {
        symptoms = row[2] ? JSON.parse(row[2]) : [];
      } catch (e) {
        console.warn('Failed to parse symptoms JSON:', row[2]);
        symptoms = [];
      }
      
      return {
        id: row[0],
        date: row[1],
        symptoms,
        mood: row[3],
        pain_level: row[4] || 0,
        flow_intensity: row[5] || 0,
        weight: row[6] || undefined,
        temperature: row[7] || undefined,
        cycle_id: row[8],
      };
    });
    
    console.log('Retrieved logs:', logs.length, cycle_id ? `for cycle ${cycle_id}` : 'all');
    return logs;
  } catch (error) {
    console.error('Error getting logs:', error);
    return [];
  }
}

export async function updateCycle(id: number, start_date: string, end_date: string, flow: string, notes: string, cycle_length?: number) {
  await initPeriodDB();
  const calculatedLength = cycle_length || Math.floor((new Date(end_date).getTime() - new Date(start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1;
  db!.run('UPDATE cycles SET start_date = ?, end_date = ?, flow = ?, notes = ?, cycle_length = ? WHERE id = ?;', [start_date, end_date, flow, notes, calculatedLength, id]);
}

export async function updateLog(id: number, symptoms: string | string[], mood: string, pain_level?: number, flow_intensity?: number, weight?: number, temperature?: number) {
  try {
    await initPeriodDB();
    const symptomsJson = Array.isArray(symptoms) ? JSON.stringify(symptoms) : symptoms;
    
    const stmt = db!.prepare('UPDATE logs SET symptoms = ?, mood = ?, pain_level = ?, flow_intensity = ?, weight = ?, temperature = ? WHERE id = ?;');
    stmt.run([symptomsJson, mood, pain_level || 0, flow_intensity || 0, weight || null, temperature || null, id]);
    stmt.free();
    
    console.log('Log updated successfully:', id);
  } catch (error) {
    console.error('Error updating log:', error);
    throw error;
  }
}

export async function clearAllData() {
  try {
    await initPeriodDB();
    
    // Clear logs first (due to foreign key constraint)
    db!.run('DELETE FROM logs;');
    
    // Clear cycles
    db!.run('DELETE FROM cycles;');
    
    console.log('All data cleared successfully');
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
} 