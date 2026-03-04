const express = require('express');
const router = express.Router();
const db = require('./database');

// GET all tournaments
router.get('/tournaments', (req, res) => {
    db.all('SELECT * FROM tournaments', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET all teams
router.get('/teams', (req, res) => {
    db.all('SELECT * FROM teams', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET players for a team
router.get('/teams/:teamId/players', (req, res) => {
    db.all('SELECT * FROM players WHERE team_id = ?', [req.params.teamId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET all matches
router.get('/matches', (req, res) => {
    const query = `
        SELECT m.*, t1.name as team1_name, t2.name as team2_name, tourn.name as tournament_name
        FROM matches m
        JOIN teams t1 ON m.team1_id = t1.id
        JOIN teams t2 ON m.team2_id = t2.id
        JOIN tournaments tourn ON m.tournament_id = tourn.id
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET scorecard for a match
router.get('/matches/:id/scorecard', (req, res) => {
    // Basic scorecard: total runs, wickets, overs played for each innings
    const matchId = req.params.id;
    const query = `
        SELECT 
            innings_no,
            SUM(runs_scored + extras) as total_runs,
            SUM(is_wicket) as wickets,
            COUNT(ball_no) as total_balls
        FROM ball_by_ball
        WHERE match_id = ?
        GROUP BY innings_no
    `;
    db.all(query, [matchId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST ball-by-ball data
router.post('/ball-by-ball', (req, res) => {
    const {
        match_id, innings_no, over_no, ball_no,
        batter_id, bowler_id, runs_scored, extras,
        is_wicket, wicket_type, batter_out_id
    } = req.body;

    const query = `
        INSERT INTO ball_by_ball (
            match_id, innings_no, over_no, ball_no, 
            batter_id, bowler_id, runs_scored, extras, 
            is_wicket, wicket_type, batter_out_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [
        match_id, innings_no, over_no, ball_no,
        batter_id, bowler_id, runs_scored || 0, extras || 0,
        is_wicket || 0, wicket_type || null, batter_out_id || null
    ], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: 'Ball recorded successfully' });
    });
});

// --- COMPLEX ANALYTICS QUERIES ---

// GET Batter Analytics (Total Runs, Highest Score, Average, Strike Rate)
router.get('/analytics/batter/:id', (req, res) => {
    const playerId = req.params.id;

    const query = `
        WITH MatchScores AS (
            SELECT match_id, SUM(runs_scored) as runs
            FROM ball_by_ball
            WHERE batter_id = ?
            GROUP BY match_id
        ),
        Dismissals AS (
            SELECT COUNT(*) as times_out
            FROM ball_by_ball
            WHERE batter_out_id = ? AND is_wicket = 1
        ),
        TotalStats AS (
            SELECT 
                SUM(runs_scored) as total_runs,
                COUNT(ball_no) as balls_faced
            FROM ball_by_ball
            WHERE batter_id = ? AND extras = 0 -- Assuming wides don't count as balls faced, etc. Just simplifying: total valid balls
        )
        SELECT 
            p.name,
            COALESCE(ts.total_runs, 0) as total_runs,
            COALESCE(ts.balls_faced, 0) as balls_faced,
            COALESCE(MAX(ms.runs), 0) as highest_score,
            CASE WHEN d.times_out > 0 THEN CAST(ts.total_runs AS FLOAT) / d.times_out ELSE ts.total_runs END as average,
            CASE WHEN ts.balls_faced > 0 THEN (CAST(ts.total_runs AS FLOAT) / ts.balls_faced) * 100 ELSE 0 END as strike_rate
        FROM players p
        LEFT JOIN MatchScores ms ON 1=1
        LEFT JOIN TotalStats ts ON 1=1
        LEFT JOIN Dismissals d ON 1=1
        WHERE p.id = ?
        GROUP BY p.id
    `;

    db.get(query, [playerId, playerId, playerId, playerId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Player not found' });

        // Round numbers to 2 decimal places
        if (row.average) row.average = parseFloat(row.average).toFixed(2);
        if (row.strike_rate) row.strike_rate = parseFloat(row.strike_rate).toFixed(2);

        res.json(row);
    });
});

// GET Bowler Analytics (Total Wickets, Best Bowling, Economy Rate)
router.get('/analytics/bowler/:id', (req, res) => {
    const playerId = req.params.id;

    const query = `
        SELECT 
            p.name,
            SUM(is_wicket) as total_wickets,
            SUM(runs_scored + extras) as runs_conceded,
            COUNT(ball_no) as balls_bowled,
            CASE WHEN COUNT(ball_no) > 0 THEN (CAST(SUM(runs_scored + extras) AS FLOAT) / (COUNT(ball_no) / 6.0)) ELSE 0 END as economy_rate
        FROM players p
        LEFT JOIN ball_by_ball b ON p.id = b.bowler_id
        WHERE p.id = ?
        GROUP BY p.id
    `;

    db.get(query, [playerId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Player not found' });

        if (row.economy_rate) row.economy_rate = parseFloat(row.economy_rate).toFixed(2);
        res.json(row);
    });
});

// GET Leaderboards (Top run scorers)
router.get('/leaderboards/batting', (req, res) => {
    const query = `
        SELECT 
            p.id, p.name, t.name as team_name,
            SUM(b.runs_scored) as total_runs,
            COUNT(b.ball_no) as balls_faced,
            CASE WHEN COUNT(b.ball_no) > 0 THEN (CAST(SUM(b.runs_scored) AS FLOAT) / COUNT(b.ball_no)) * 100 ELSE 0 END as strike_rate
        FROM players p
        JOIN teams t ON p.team_id = t.id
        JOIN ball_by_ball b ON p.id = b.batter_id
        GROUP BY p.id
        ORDER BY total_runs DESC
        LIMIT 10
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        rows.forEach(r => { if (r.strike_rate) r.strike_rate = parseFloat(r.strike_rate).toFixed(2); });
        res.json(rows);
    });
});

module.exports = router;
