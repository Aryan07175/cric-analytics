const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'cricket.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

db.serialize(() => {
    // Drop existing tables for fresh start during development
    // db.run(`DROP TABLE IF EXISTS ball_by_ball`);
    // db.run(`DROP TABLE IF EXISTS matches`);
    // db.run(`DROP TABLE IF EXISTS players`);
    // db.run(`DROP TABLE IF EXISTS teams`);
    // db.run(`DROP TABLE IF EXISTS tournaments`);

    db.run(`CREATE TABLE IF NOT EXISTS tournaments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        season TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS teams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        team_id INTEGER,
        FOREIGN KEY(team_id) REFERENCES teams(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS matches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tournament_id INTEGER,
        team1_id INTEGER,
        team2_id INTEGER,
        match_date TEXT,
        status TEXT,
        FOREIGN KEY(tournament_id) REFERENCES tournaments(id),
        FOREIGN KEY(team1_id) REFERENCES teams(id),
        FOREIGN KEY(team2_id) REFERENCES teams(id)
    )`);

    // The core of the analytics engine
    db.run(`CREATE TABLE IF NOT EXISTS ball_by_ball (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        match_id INTEGER,
        innings_no INTEGER,
        over_no INTEGER,
        ball_no INTEGER,
        batter_id INTEGER,
        bowler_id INTEGER,
        runs_scored INTEGER DEFAULT 0,
        extras INTEGER DEFAULT 0,
        is_wicket INTEGER DEFAULT 0,
        wicket_type TEXT,
        batter_out_id INTEGER,
        FOREIGN KEY(match_id) REFERENCES matches(id),
        FOREIGN KEY(batter_id) REFERENCES players(id),
        FOREIGN KEY(bowler_id) REFERENCES players(id),
        FOREIGN KEY(batter_out_id) REFERENCES players(id)
    )`);

    console.log('Database tables initialized.');
});

module.exports = db;
