const fs = require('fs');

let fileStr = fs.readFileSync('server/database.ts', 'utf-8');

// Replace DEFAULT_LISTINGS
fileStr = fileStr.replace(/const DEFAULT_LISTINGS: EquipmentListing\[\] = \[([\s\S]*?)\];/m, 'const DEFAULT_LISTINGS: EquipmentListing[] = [];');

// Replace INITIAL_COMBINED_CATALOG
fileStr = fileStr.replace(/export const INITIAL_COMBINED_CATALOG: EquipmentListing\[\] = \[([\s\S]*?)\];/m, 'export const INITIAL_COMBINED_CATALOG: EquipmentListing[] = [];');

// Replace DEFAULT_MARKET_DEPTH
fileStr = fileStr.replace(/const DEFAULT_MARKET_DEPTH: MarketDepthItem\[\] = \[([\s\S]*?)\];/m, 'const DEFAULT_MARKET_DEPTH: MarketDepthItem[] = [];');

fs.writeFileSync('server/database.ts', fileStr);
