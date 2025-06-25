import React, { useEffect, useState } from "react";

const DeficitsList = ({ onBack, onDeficitClick }) => {
  const [deficits, setDeficits] = useState([]);
  const [selected, setSelected] = useState([]);

  // Fetch deficits on mount
  useEffect(() => {
    fetch("http://localhost:8080/api/deficits")
      .then(res => res.json())
      .then(data => setDeficits(data))
      .catch(() => setDeficits([]));
  }, []);

  // Sort deficits by deficit amount, largest to smallest
  const sortedDeficits = [...deficits].sort(
    (a, b) => Number(b.deficit) - Number(a.deficit)
  );

  // Map sorted indices back to original indices for deletion
  const getOriginalIndex = (sortedIdx) => {
    const sortedDeficit = sortedDeficits[sortedIdx];
    return deficits.findIndex(
      d =>
        d.team === sortedDeficit.team &&
        d.type === sortedDeficit.type &&
        d.risk === sortedDeficit.risk &&
        d.toWin === sortedDeficit.toWin &&
        d.deficit === sortedDeficit.deficit &&
        d.gameKey === sortedDeficit.gameKey
    );
  };

  // Delete a single deficit by index
  const handleDelete = (sortedIdx) => {
    const originalIdx = getOriginalIndex(sortedIdx);
    fetch(`http://localhost:8080/api/deficits/${originalIdx}`, { method: "DELETE" })
      .then(res => res.json())
      .then(() => setDeficits(deficits => deficits.filter((_, i) => i !== originalIdx)));
  };

  // Select/unselect for multi-delete
  const handleSelect = (sortedIdx) => {
    setSelected(prev =>
      prev.includes(sortedIdx) ? prev.filter(i => i !== sortedIdx) : [...prev, sortedIdx]
    );
  };

  // Delete selected deficits
  const handleDeleteSelected = () => {
    // Get original indices for all selected
    const originalIndices = selected.map(getOriginalIndex);
    Promise.all(
      originalIndices.map(idx =>
        fetch(`http://localhost:8080/api/deficits/${idx}`, { method: "DELETE" })
      )
    ).then(() => {
      setDeficits(deficits =>
        deficits.filter((_, i) => !originalIndices.includes(i))
      );
      setSelected([]);
    });
  };

  // Delete all deficits
  const handleDeleteAll = () => {
    fetch("http://localhost:8080/api/deficits", { method: "DELETE" })
      .then(res => res.json())
      .then(() => {
        setDeficits([]);
        setSelected([]);
      });
  };

  const handleDeficitClick = (deficit, idx) => {
    if (onDeficitClick) onDeficitClick(deficit.deficit);
    handleDelete(idx);
  };

  return (
    <div>
      <h2 style={{ color: "gray" }}>Deficits</h2>
      <button onClick={onBack} style={{ marginBottom: 16 }}>Back</button>
      <button
        onClick={handleDeleteAll}
        style={{ marginBottom: 16, marginLeft: 8, background: "#d32f2f", color: "#fff", border: "none", borderRadius: 4, padding: "8px 16px" }}
        disabled={deficits.length === 0}
      >
        Delete All
      </button>
      <button
        onClick={handleDeleteSelected}
        style={{ marginBottom: 16, marginLeft: 8, background: "#f57c00", color: "#fff", border: "none", borderRadius: 4, padding: "8px 16px" }}
        disabled={selected.length === 0}
      >
        Delete Selected
      </button>
      {sortedDeficits.length === 0 ? (
        <div style={{ color: "red" }}>No deficits found.</div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {sortedDeficits.map((deficit, idx) => (
            <li key={idx} style={{
              border: "1px solid #1976d2",
              borderRadius: 8,
              marginBottom: 12,
              padding: 12,
              background: "#fff",
              color: "red",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div>
                <input
                  type="checkbox"
                  checked={selected.includes(idx)}
                  onChange={() => handleSelect(idx)}
                  style={{ marginRight: 8 }}
                  title="Select for multi-delete"
                />
                <b>Team:</b> {deficit.team} &nbsp;
                <b>Type:</b> {deficit.type} &nbsp;
                <b>Risk:</b> {deficit.risk} &nbsp;
                <b>To Win:</b> {deficit.toWin} &nbsp;
                <b>Deficit:</b>{" "}
                <span
                  style={{ textDecoration: "underline", cursor: "pointer", color: "#1976d2" }}
                  onClick={() => handleDeficitClick(deficit, idx)}
                  title="Click to use this amount for Dog To Win"
                >
                  {deficit.deficit}
                </span>
              </div>
              <button
                onClick={() => handleDelete(idx)}
                style={{ background: "#d32f2f", color: "#fff", border: "none", borderRadius: 4, padding: "6px 12px", marginLeft: 16 }}
                title="Delete this deficit"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DeficitsList;