
# Local Cricket League Analytics & Draft Engine 🏏

A powerful platform designed for local cricket tournament organizers and players. It tracks match data ball-by-ball and provides real-time, deep analytics including strike rates, economy, and moving averages.

## Features

* **Organizer Dashboard:** A dedicated UI for tournament organizers to input ball-by-ball match data, including runs, extras, and wickets.
* **Player Dashboard:** A dynamic UI for players to view live scorecards, access player insights, and see the tournament run-scorers leaderboard.
* **Deep Analytics:** Powered by complex SQL queries using `GROUP BY`, `JOIN`, and aggregate functions to calculate player metrics on the fly.
* **Premium Aesthetics:** Dark mode, glassmorphism, smooth animations, and modern typography for a stunning user experience.

## Tech Stack

* **Frontend:** Vanilla JavaScript, HTML5, Vanilla CSS 
* **Backend:** Node.js, Express.js
* **Database:** SQLite3

## Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

## Getting Started

1.  **Clone or Download the Repository:**
    Navigate to the project directory in your terminal:
    ```bash
    cd "c:\Users\Lenovo\Desktop\full stack project\cricket-analytics"
    ```

2.  **Install Dependencies:**
    Install the required Node packages (`express`, `sqlite3`, `cors`):
    ```bash
    npm install
    ```

3.  **Seed the Database (Optional but Recommended):**
    Populate the SQLite database with some initial mock data (Tournaments, Teams, Players, and a Match) to test the UI immediately:
    ```bash
    node seed.js
    ```

4.  **Start the Server:**
    Run the Express server:
    ```bash
    node server.js
    ```
    The server will start running at `http://localhost:3000`.

5.  **Access the Application:**
    *   **Player Dashboard:** Open your browser and go to `http://localhost:3000`
    *   **Organizer Dashboard:** Open your browser and go to `http://localhost:3000/organizer.html`

## Project Structure

```text
cricket-analytics/
├── public/                 # Frontend assets (Static files served by Express)
│   ├── css/
│   │   └── style.css       # Premium styling, animations, and glassmorphism
│   ├── js/
│   │   ├── app.js          # Player dashboard logic (fetching stats, leaderboards)
│   │   └── organizer.js    # Organizer input logic (recording ball-by-ball data)
│   ├── index.html          # Player Dashboard View
│   └── organizer.html      # Organizer Input View
├── database.js             # SQLite database connection and schema initialization
├── routes.js               # Express API endpoints and complex SQL analytics queries
├── seed.js                 # Script to inject initial mock data into the database
├── server.js               # Main Express server configuration
└── package.json            # Node project dependencies and metadata
```

## API Endpoints Overview

The backend provides several RESTful endpoints:
*   `GET /api/tournaments` - List all tournaments.
*   `GET /api/teams` - List all teams.
*   `GET /api/teams/:teamId/players` - List players for a specific team.
*   `GET /api/matches` - List all active/past matches.
*   `GET /api/matches/:id/scorecard` - Get the current scorecard for a match.
*   `POST /api/ball-by-ball` - Record a new ball bowled.
*   `GET /api/analytics/batter/:id` - Get detailed batting stats for a player.
*   `GET /api/analytics/bowler/:id` - Get detailed bowling stats for a player.
*   `GET /api/leaderboards/batting` - Get the top run-scorers.

## License

This project is licensed under the ISC License.
=======
# cric-analytics

