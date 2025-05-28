// pages/index.tsx
import { useEffect, useState } from 'react'

interface BandScore {
  band: string
  score: number
  level: string
}

export default function HomePage() {
  const [bands, setBands] = useState<BandScore[]>([])
  const [time, setTime] = useState<string>("")

  useEffect(() => {
    fetch("/api/score")
      .then(res => res.json())
      .then(data => {
        setBands(data.bands)
        setTime(new Date(data.time).toLocaleTimeString())
      })
  }, [])

  const getColor = (level: string) => {
    if (level.includes("Wide")) return "text-green-400"
    if (level.includes("Open")) return "text-green-300"
    if (level.includes("Spotty")) return "text-yellow-400"
    if (level.includes("Weak")) return "text-orange-400"
    if (level.includes("Closed")) return "text-red-500"
    return "text-gray-300"
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-800 text-white p-6">
      <h1 className="text-3xl font-bold mb-4">HF Propagation Dashboard</h1>
      <div className="bg-black bg-opacity-30 rounded-xl p-4 shadow-md w-full max-w-md">
        {bands.map(({ band, score, level }) => (
          <div key={band} className="flex justify-between py-1 text-lg">
            <span className="text-gray-200">{band}</span>
            <span className={getColor(level)}>{score} / {level}</span>
          </div>
        ))}
      </div>
      <p className="text-gray-400 mt-4 text-sm">Last updated: {time}</p>
    </div>
  )
}
