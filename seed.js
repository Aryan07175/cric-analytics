const db = require('./database');

db.serialize(() => {
    // 1. Insert Tournament
    db.run("INSERT INTO tournaments (name, season) VALUES ('Local Premier League', '2026')");

    // 2. Insert Teams
    db.run("INSERT INTO teams (name) VALUES ('Super Kings')");
    db.run("INSERT INTO teams (name) VALUES ('Mighty Titans')");

    // 3. Insert Players (Team 1)
    db.run("INSERT INTO players (name, team_id) VALUES ('Rahul S', 1)");
    db.run("INSERT INTO players (name, team_id) VALUES ('Virat K', 1)");
    // 3. Insert Players (Team 2)
    db.run("INSERT INTO players (name, team_id) VALUES ('Rohit S', 2)");
    db.run("INSERT INTO players (name, team_id) VALUES ('Jasprit B', 2)");

    // 4. Insert Match
    db.run("INSERT INTO matches (tournament_id, team1_id, team2_id, match_date, status) VALUES (1, 1, 2, '2026-03-04', 'ongoing')", function (err) {
        if (err) console.error(err);
        else console.log("Database seeded successfully with initial data.");
    });
});
