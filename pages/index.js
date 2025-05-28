// pages/index.js (або через Canvas / HTML)

import { useEffect, useState } from "react";

export default function Home() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => setStats(data));
  }, []);

  return (
    <div className="p-4 text-white">
      <h1 className="text-xl font-bold mb-4">📡 Global QSO Stats</h1>
      {stats ? (
        <div>
          <p>Total transmissions: {stats.total_tx}</p>
          <p>Modes: {Object.keys(stats.modes).join(", ")}</p>
          <p>Bands: {Object.keys(stats.bands).join(", ")}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
