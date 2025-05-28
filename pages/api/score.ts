import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const wwv = await fetch("https://services.swpc.noaa.gov/text/wwv.txt").then(r => r.text())
  const sfi = parseInt(wwv.match(/Solar flux (\d+)/)?.[1] || "0")
  const k = parseFloat(wwv.match(/K-index.*?(\d+\.\d+)/)?.[1] || "0")
  const a = parseInt(wwv.match(/A-index (\d+)/)?.[1] || "0")

  let score = 50
  score += sfi >= 150 ? 20 : sfi >= 130 ? 15 : sfi >= 110 ? 10 : sfi >= 90 ? 5 : -5
  score += k <= 2 ? 5 : k >= 5 ? -20 : k >= 4 ? -10 : 0
  score += a < 10 ? 5 : a < 20 ? 0 : -10
  score = Math.max(0, Math.min(100, score))

  res.status(200).json({ sfi, k, a, score })
}
