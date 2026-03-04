const API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    // UI Interactions
    const runButtons = document.querySelectorAll('.btn-run');
    const runsInput = document.getElementById('runs-scored');
    const isWicketCheckbox = document.getElementById('is-wicket');
    const wicketDetails = document.getElementById('wicket-details');

    // Select runs
    runButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            runButtons.forEach(b => b.classList.remove('selected'));
            e.target.classList.add('selected');
            runsInput.value = e.target.getAttribute('data-runs');
        });
    });

    // Toggle wicket details
    isWicketCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
            wicketDetails.classList.remove('hidden');
        } else {
            wicketDetails.classList.add('hidden');
        }
    });

    // Populate data
    fetchMatchesForOrganizer();
    fetchPlayersForSelection();

    // Handle Form Submission
    document.getElementById('organizer-form').addEventListener('submit', handleBallSubmission);
});

async function fetchMatchesForOrganizer() {
    try {
        const res = await fetch(`${API_URL}/matches`);
        const matches = await res.json();

        const select = document.getElementById('org-match-select');
        select.innerHTML = '<option value="">Select an Active Match</option>';

        matches.forEach(m => {
            if (m.status === 'ongoing') {
                const opt = document.createElement('option');
                opt.value = m.id;
                opt.textContent = `${m.team1_name} vs ${m.team2_name} (${m.tournament_name})`;
                select.appendChild(opt);
            }
        });
    } catch (err) {
        console.error('Error fetching matches:', err);
    }
}

async function fetchPlayersForSelection() {
    try {
        const teamsRes = await fetch(`${API_URL}/teams`);
        const teams = await teamsRes.json();

        const batterSelect = document.getElementById('batter-id');
        const bowlerSelect = document.getElementById('bowler-id');
        const batterOutSelect = document.getElementById('batter-out-id');

        batterSelect.innerHTML = '<option value="">Select Batter</option>';
        bowlerSelect.innerHTML = '<option value="">Select Bowler</option>';
        batterOutSelect.innerHTML = '<option value="">Select Batter Out</option>';

        for (const team of teams) {
            const playersRes = await fetch(`${API_URL}/teams/${team.id}/players`);
            const players = await playersRes.json();

            if (players.length > 0) {
                const bOptGroup = document.createElement('optgroup');
                const boOptGroup = document.createElement('optgroup');
                const obOptGroup = document.createElement('optgroup');

                bOptGroup.label = team.name;
                boOptGroup.label = team.name;
                obOptGroup.label = team.name;

                players.forEach(p => {
                    const opt1 = document.createElement('option');
                    opt1.value = p.id;
                    opt1.textContent = p.name;
                    bOptGroup.appendChild(opt1);

                    const opt2 = document.createElement('option');
                    opt2.value = p.id;
                    opt2.textContent = p.name;
                    boOptGroup.appendChild(opt2);

                    const opt3 = document.createElement('option');
                    opt3.value = p.id;
                    opt3.textContent = p.name;
                    obOptGroup.appendChild(opt3);
                });

                batterSelect.appendChild(bOptGroup);
                bowlerSelect.appendChild(boOptGroup);
                batterOutSelect.appendChild(obOptGroup);
            }
        }
    } catch (err) {
        console.error('Error fetching players:', err);
    }
}

async function handleBallSubmission(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Saving...';
    btn.disabled = true;

    const payload = {
        match_id: document.getElementById('org-match-select').value,
        innings_no: document.getElementById('innings-no').value,
        over_no: document.getElementById('over-no').value,
        ball_no: document.getElementById('ball-no').value,
        batter_id: document.getElementById('batter-id').value,
        bowler_id: document.getElementById('bowler-id').value,
        runs_scored: document.getElementById('runs-scored').value,
        extras: document.getElementById('extras').value,
        is_wicket: document.getElementById('is-wicket').checked ? 1 : 0,
        wicket_type: document.getElementById('wicket-type').value,
        batter_out_id: document.getElementById('batter-out-id').value
    };

    try {
        const res = await fetch(`${API_URL}/ball-by-ball`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        const statusMsg = document.getElementById('status-message');
        if (res.ok) {
            statusMsg.innerHTML = '<span class="text-accent">Ball recorded successfully!</span>';
            // Auto-increment logic simple version
            let currentBall = parseInt(payload.ball_no);
            let currentOver = parseInt(payload.over_no);
            if (currentBall >= 6) {
                document.getElementById('ball-no').value = 1;
                document.getElementById('over-no').value = currentOver + 1;
            } else {
                document.getElementById('ball-no').value = currentBall + 1;
            }

            // Reset wicket & runs
            document.querySelectorAll('.btn-run').forEach(b => b.classList.remove('selected'));
            document.getElementById('runs-scored').value = 0;
            document.getElementById('extras').value = 0;
            document.getElementById('is-wicket').checked = false;
            document.getElementById('wicket-details').classList.add('hidden');

            setTimeout(() => { statusMsg.innerHTML = ''; }, 3000);
        } else {
            statusMsg.innerHTML = `<span class="text-danger">Error: ${data.error}</span>`;
        }
    } catch (err) {
        console.error(err);
        document.getElementById('status-message').innerHTML = '<span class="text-danger">Server connection failed.</span>';
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}
