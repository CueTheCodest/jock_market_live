import React, { useState } from "react";

// Helper to group wagers by sport, both teams, and date (so Dog/Fav order doesn't matter)
function groupWagersByGame(wagers) {
  const games = {};
  wagers.forEach(wager => {
    // Find all teams for this game (by sport and date)
    const sameGameWagers = wagers.filter(
      w =>
        w.sport === wager.sport &&
        w.date === wager.date
    );
    // Get unique teams for this game
    const teams = Array.from(new Set(sameGameWagers.map(w => w.team))).sort();
    // Only group if there are exactly 2 teams
    if (teams.length === 2) {
      const key = `${wager.sport}:${teams.join("|")}:${wager.date || ""}`;
      if (!games[key]) games[key] = [];
      // Only add each wager once
      if (!games[key].includes(wager)) {
        games[key].push(wager);
      }
    }
  });
  return games;
}

const PendingWagers = ({ wagers }) => {
  const [clicked, setClicked] = useState({}); // { [gameKey]: wager.type }
  const [showDetails, setShowDetails] = useState({}); // { [gameKey]: boolean }

  if (!wagers || wagers.length === 0) {
    return <div>No pending wagers.</div>;
  }

  // Calculate total risked
  const totalRisked = wagers.reduce((sum, wager) => sum + Number(wager.risk || 0), 0);
  // Calculate total to win
  const totalToWin = wagers.reduce((sum, wager) => sum + Number(wager.toWin || 0), 0);

  // Group wagers by game (only games with 2 teams)
  const grouped = groupWagersByGame(wagers);

  return (
    <div>
      <h3>Pending Wagers</h3>
      <div style={{ marginBottom: "12px", fontWeight: "bold" }}>
        Total Risked: ${totalRisked.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} &nbsp;|&nbsp; 
        Total To Win: ${totalToWin.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      {Object.entries(grouped).map(([gameKey, gameWagers]) => {
        // Get the two teams for this game
        const teams = Array.from(new Set(gameWagers.map(w => w.team))).sort();
        // Find the Fav and Dog wager for each team (if present)
        const favWager = gameWagers.find(w => w.type === "Fav");
        const dogWager = gameWagers.find(w => w.type === "Dog");
        return (
          <div
            key={gameKey}
            style={{
              border: "2px solid #1976d2",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "20px",
              background: "#f5faff",
              boxShadow: "0 2px 8px rgba(25, 118, 210, 0.07)",
              color: "#111"
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
              {gameWagers[0].sport}: {teams.join(" vs ")}
              {gameWagers[0].date ? ` (${gameWagers[0].date})` : ""}
              <button
                style={{
                  marginLeft: 16,
                  fontSize: "0.9em",
                  padding: "2px 10px",
                  borderRadius: "4px",
                  border: "1px solid #1976d2",
                  background: showDetails[gameKey] ? "#1976d2" : "#fff",
                  color: showDetails[gameKey] ? "#fff" : "#1976d2",
                  cursor: "pointer"
                }}
                onClick={() =>
                  setShowDetails(prev => ({
                    ...prev,
                    [gameKey]: !prev[gameKey]
                  }))
                }
              >
                {showDetails[gameKey] ? "Hide Details" : "Show Details"}
              </button>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Team</th>
                  <th>Risk</th>
                  <th>To Win</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <span
                      style={{
                        cursor: favWager ? "pointer" : "default",
                        color:
                          clicked[gameKey] === "Fav"
                            ? "red"
                            : clicked[gameKey] === "Dog"
                            ? "green"
                            : "#1976d2",
                        fontWeight: "bold"
                      }}
                      onClick={() => {
                        if (favWager) {
                          setClicked(prev => ({ ...prev, [gameKey]: "Fav" }));
                          console.log("Deficit:", favWager);
                        }
                      }}
                    >
                      Fav
                    </span>
                  </td>
                  <td>{teams[0]}</td>
                  <td>{favWager ? favWager.risk : ""}</td>
                  <td>{favWager ? favWager.toWin : ""}</td>
                </tr>
                <tr>
                  <td>
                    <span
                      style={{
                        cursor: dogWager ? "pointer" : "default",
                        color:
                          clicked[gameKey] === "Dog"
                            ? "red"
                            : clicked[gameKey] === "Fav"
                            ? "green"
                            : "#1976d2",
                        fontWeight: "bold"
                      }}
                      onClick={() => {
                        if (dogWager) {
                          setClicked(prev => ({ ...prev, [gameKey]: "Dog" }));
                          console.log("Deficit:", dogWager);
                        }
                      }}
                    >
                      Dog
                    </span>
                  </td>
                  <td>{teams[1]}</td>
                  <td>{dogWager ? dogWager.risk : ""}</td>
                  <td>{dogWager ? dogWager.toWin : ""}</td>
                </tr>
              </tbody>
            </table>
            {/* Toggle wager details */}
            {showDetails[gameKey] && (
              <div style={{ marginTop: "10px", fontSize: "0.95em", color: "#444" }}>
                <b>Wager Details:</b>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {gameWagers.map((w, i) => (
                    <li key={i}>
                      {w.type} on {w.team} &mdash; Risk: ${Number(w.risk).toFixed(2)}, To Win: ${Number(w.toWin).toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default PendingWagers;