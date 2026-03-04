const API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Fetch Leaderboards on load
    fetchLeaderboards();

    // 2. Fetch Players to populate dropdown
    fetchPlayersForDropdown();

    // 3. Fetch Matches to populate dropdown
    fetchMatchesDropdown();

    // Event Listeners
    document.getElementById('player-select').addEventListener('change', (e) => {
        if (e.target.value) {
            fetchPlayerAnalytics(e.target.value);
        } else {
            document.getElementById('player-stats-container').classList.add('hidden');
        }
    });

    document.getElementById('match-select').addEventListener('change', (e) => {
        if (e.target.value) {
            fetchMatchScorecard(e.target.value);
        } else {
            document.getElementById('scorecard-container').innerHTML = '<div class="text-center text-muted py-md">Select a match to view its scorecard.</div>';
        }
    });
});

async function fetchLeaderboards() {
    try {
        const res = await fetch(`${API_URL}/leaderboards/batting`);
        const data = await res.json();

        const container = document.getElementById('batting-leaderboard');

        if (data.length === 0) {
            container.innerHTML = '<div class="text-center text-muted py-md">No data available yet.</div>';
            return;
        }

        let html = '<ul class="leaderboard-list">';
        data.forEach((player, index) => {
            html += `
                <li class="leaderboard-item">
                    <span class="lb-rank">#${index + 1}</span>
                    <div class="lb-name">
                        ${player.name}
                        <div class="lb-team">${player.team_name}</div>
                    </div>
                    <div class="lb-score">${player.total_runs} <span style="font-size:0.7em; color:var(--text-muted); font-weight:normal;">Runs</span></div>
                </li>
            `;
        });
        html += '</ul>';
        container.innerHTML = html;

    } catch (err) {
        console.error('Failed to fetch leaderboards:', err);
        document.getElementById('batting-leaderboard').innerHTML = '<div class="text-danger">Failed to load leaderboard.</div>';
    }
}

async function fetchPlayersForDropdown() {
    try {
        // First get teams
        const teamsRes = await fetch(`${API_URL}/teams`);
        const teams = await teamsRes.json();

        const select = document.getElementById('player-select');
        select.innerHTML = '<option value="">Select a Player...</option>';

        // Then get players for each team
        for (const team of teams) {
            const playersRes = await fetch(`${API_URL}/teams/${team.id}/players`);
            const players = await playersRes.json();

            if (players.length > 0) {
                const optgroup = document.createElement('optgroup');
                optgroup.label = team.name;

                players.forEach(p => {
                    const opt = document.createElement('option');
                    opt.value = p.id;
                    opt.textContent = p.name;
                    optgroup.appendChild(opt);
                });
                select.appendChild(optgroup);
            }
        }
    } catch (err) {
        console.error('Error fetching players:', err);
    }
}

async function fetchPlayerAnalytics(playerId) {
    try {
        const res = await fetch(`${API_URL}/analytics/batter/${playerId}`);
        const data = await res.json();

        // Update UI
        document.getElementById('stat-runs').textContent = data.total_runs || 0;
        document.getElementById('stat-highest').textContent = data.highest_score || 0;
        document.getElementById('stat-avg').textContent = data.average || '0.00';
        document.getElementById('stat-sr').textContent = data.strike_rate || '0.00';

        // Show container with a slight animation
        const container = document.getElementById('player-stats-container');
        container.classList.remove('hidden');
        container.classList.remove('animate-fade-in-up');
        void container.offsetWidth; // trigger reflow
        container.classList.add('animate-fade-in-up');

    } catch (err) {
        console.error('Failed to fetch analytics:', err);
    }
}

async function fetchMatchesDropdown() {
    try {
        const res = await fetch(`${API_URL}/matches`);
        const matches = await res.json();

        const select = document.getElementById('match-select');
        select.innerHTML = '<option value="">Select a Match to view scores...</option>';

        matches.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = `${m.team1_name} vs ${m.team2_name} (${m.tournament_name})`;
            select.appendChild(opt);
        });
    } catch (err) {
        console.error('Error fetching matches:', err);
    }
}

async function fetchMatchScorecard(matchId) {
    try {
        const res = await fetch(`${API_URL}/matches/${matchId}/scorecard`);
        const data = await res.json();

        const container = document.getElementById('scorecard-container');

        if (!data || data.length === 0) {
            container.innerHTML = '<div class="text-center text-muted py-md">No scorecard data available for this match yet.</div>';
            return;
        }

        let html = '<div class="stats-container">';
        data.forEach(innings => {
            const overs = Math.floor(innings.total_balls / 6);
            const extraBalls = innings.total_balls % 6;
            const oversStr = `${overs}.${extraBalls}`;

            html += `
                <div class="stat-box" style="text-align: left;">
                    <h3 class="text-h3 text-accent mb-sm">Innings ${innings.innings_no}</h3>
                    <div style="font-size: 2rem; font-weight: 700;">${innings.total_runs}/${innings.wickets}</div>
                    <div class="text-muted" style="font-size: 0.9rem;">Overs: ${oversStr}</div>
                </div>
            `;
        });
        html += '</div>';

        container.innerHTML = html;
        container.classList.remove('animate-fade-in-up');
        void container.offsetWidth;
        container.classList.add('animate-fade-in-up');

    } catch (err) {
        console.error('Error fetching scorecard:', err);
        document.getElementById('scorecard-container').innerHTML = '<div class="text-danger">Failed to load scorecard.</div>';
    }
}
