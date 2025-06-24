import { useState, useEffect } from 'react'
import './App.css'
import axios from 'axios'
import BetScreen from './BetScreen'
import PendingWagers from './PendingWagers'
import { PendingWagersWithLoss, DeficitPage } from './Deficits';

function App() {
  const [array, setArray] = useState([]);
  const [selectedSport, setSelectedSport] = useState(null);
  const [showPending, setShowPending] = useState(false);
  const [wagers, setWagers] = useState([]);
  const [losses, setLosses] = useState([]);

  const fetchAPI = async () => {
    const response = await axios.get('http://localhost:8080/api');
    setArray(response.data.sports);
    console.log(response.data.sports);
  };

  useEffect(() => {
    fetchAPI();
  }, []);

  // Handler to add a wager to the pending wagers list
  const handlePlaceBet = (wager) => {
    setWagers(prev => [...prev, wager]);
    setSelectedSport(null);
    setShowPending(true); // Optionally show pending wagers after placing a bet
  };

  const handleLoss = (wager) => {
    setWagers(prev => prev.filter(w => w !== wager));
    setLosses(prev => [...prev, wager]);
  };

  return (
    <>
      <h1>Guap Market Live</h1>
      <button
        onClick={() => setShowPending(true)}
        style={{ margin: '8px', padding: "10px 20px" }}
      >
        Pending
      </button>
      <div className="card" style={{ marginBottom: "24px" }}>
        {array.map((sport, index) => (
          <button
            key={index}
            style={{ margin: '8px', padding: "10px 20px" }}
            onClick={() => {
              setSelectedSport(sport);
              setShowPending(false);
            }}
          >
            {sport}
          </button>
        ))}
      </div>
      {showPending ? (
        <PendingWagers wagers={wagers} onLoss={handleLoss} />
      ) : selectedSport ? (
        <BetScreen
          sport={selectedSport}
          onBack={() => setSelectedSport(null)}
          onPlaceBet={handlePlaceBet}
        />
      ) : null}
    </>
  )
}

export default App
