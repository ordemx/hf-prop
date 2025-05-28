// pages/api/stats.js

export default async function handler(req, res) {
  try {
    const url = "https://pskreporter.info/cgi-bin/pskstats.pl?statistics=1";
    const response = await fetch(url);
    const text = await response.text();

    const jsonStart = text.indexOf('{');
    const rawJson = text.slice(jsonStart);
    const stats = JSON.parse(rawJson);

    res.status(200).json(stats);
  } catch (error) {
    console.error("PSKReporter error:", error);
    res.status(500).json({ error: "Failed to fetch PSKReporter data" });
  }
}
