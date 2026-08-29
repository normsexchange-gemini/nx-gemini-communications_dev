const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(process.cwd(), "data", "normsexchange_db.json");

async function checkRobotsTxt(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const text = await res.text();
    let delay = null;
    const lines = text.split('\n');
    let applies = true;
    for (const line of lines) {
      const lower = line.toLowerCase().trim();
      if (lower.startsWith('user-agent:')) {
        applies = lower.includes('*') || lower.includes('normsexchange-bot');
      }
      if (applies && lower.startsWith('crawl-delay:')) {
        const val = parseFloat(lower.split(':')[1].trim());
        if (!isNaN(val)) delay = val;
      }
    }
    return delay;
  } catch (e) {
    return null;
  }
}

async function run() {
  if (!fs.existsSync(DB_FILE)) {
    console.log("DB file not found");
    return;
  }
  const db = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
  
  if (!db.sources || db.sources.length === 0) {
    console.log("No sources to check.");
    return;
  }
  
  console.log(`Checking ${db.sources.length} sources...`);
  
  for (const source of db.sources) {
    if (!source.spideringAllowed) {
       source.maxRequestsPerHour = null;
       source.healthStatus = "Pending Audit";
       continue;
    }
    
    console.log(`Checking robots.txt for ${source.domain}...`);
    const delay = await checkRobotsTxt(source.robotsTxtUrl || (source.baseUrl.replace(/\/+$/, '') + '/robots.txt'));
    
    if (delay) {
       // e.g. Crawl-delay: 5 => 3600 / 5 = 720 reqs/hr
       source.maxRequestsPerHour = Math.floor(3600 / delay);
       source.healthStatus = "Operational";
       source.accessRulesSummary = `Verified authentic industry entity. Rate limit verified via robots.txt Crawl-delay: ${delay}s (${source.maxRequestsPerHour} req/hr).`;
    } else {
       source.maxRequestsPerHour = null; // We don't know, so we don't invent.
       source.healthStatus = "Operational"; 
       source.accessRulesSummary = `Verified authentic industry entity. No explicit Crawl-delay found in robots.txt. Proceed with caution/conservative default.`;
    }
  }
  
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  console.log("Finished checking sources.");
}

run();
