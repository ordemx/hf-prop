// pages/api/score.ts
import type { NextApiRequest, NextApiResponse } from 'next'

function interpretScore(score: number): string {
  if (score >= 85) return "Wide Open"
  if (score >= 70) return "Open"
  if (score >= 50) return "Spotty"
  if (score >= 30) return "Weak"
  return "Closed"
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Львів (фіксовані координати)
  const latitude = 49.84
  const longitude = 24.03
  const now = new Date()

  // NOAA sources
  const wwvRaw = await fetch("https://services.swpc.noaa.gov/text/wwv.txt").then(r => r.text())
  const sfi = parseFloat((wwvRaw.match(/Solar flux (\d+)/) || [])[1] || "0")
  const k = parseFloat((wwvRaw.match(/K-index.*?(\d+\.\d+)/) || [])[1] || "0")
  const a = parseFloat((wwvRaw.match(/A-index (\d+)/) || [])[1] || "0")

  let xray = "", bz = "0", vsw = "0"
  try {
    const j = await fetch("https://services.swpc.noaa.gov/json/goes/primary/xray-flares-latest.json").then(r => r.json())
    xray = j?.[0]?.current_class || ""
  } catch {}
  try {
    const j = await fetch("https://services.swpc.noaa.gov/products/solar-wind/mag-7-day.json").then(r => r.json())
    bz = parseFloat(j.at(-1)?.[2] || "0").toFixed(2)
  } catch {}
  try {
    const j = await fetch("https://services.swpc.noaa.gov/products/solar-wind/plasma-7-day.json").then(r => r.json())
    vsw = parseFloat(j.at(-1)?.[2] || "0").toFixed(0)
  } catch {}

  const sfiVal = sfi
  const kVal = k
  const x = xray.toUpperCase()
  const bzVal = parseFloat(bz)
  const vswVal = parseFloat(vsw)
  const solarCycleFactor = 0.9

  const hour = now.getUTCHours()

  function bandScore(band: string): number {
    let score = 50 * solarCycleFactor

    if (sfiVal >= 150) score += 20
    else if (sfiVal >= 130) score += 15
    else if (sfiVal >= 110) score += 10
    else if (sfiVal >= 90) score += 5
    else score -= 5

    if (kVal >= 5) score -= 20
    else if (kVal >= 4) score -= 10
    else if (kVal <= 2) score += 5

    if (x.startsWith("X")) score -= 25
    else if (x.startsWith("M")) score -= 15
    else if (x.startsWith("C")) score -= 5

    if (bzVal < -5) score -= 10
    else if (bzVal < 0) score -= 5
    else score += 5

    if (vswVal > 600) score -= 5
    else if (vswVal < 400) score += 5

    if (band === "80m") score += hour < 7 || hour > 19 ? 15 : -10
    if (band === "40m") score += hour < 7 || hour > 19 ? 10 : 0
    if (band === "20m") score += hour >= 7 && hour <= 17 ? 10 : 0
    if (band === "15m") score += hour >= 8 && hour <= 18 ? 15 : -5
    if (band === "10m") score += hour >= 9 && hour <= 17 ? 10 : -15

    if ((band === "10m" || band === "15m") && (hour < 9 || hour > 19)) score -= 25

    return Math.max(0, Math.min(100, score))
  }

  const bands = ["80m", "40m", "20m", "15m", "10m"].map(b => {
    const score = bandScore(b)
    return { band: b, score, level: interpretScore(score) }
  })

  res.status(200).json({ time: now.toISOString(), bands })
}
