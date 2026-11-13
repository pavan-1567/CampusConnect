/**
 * CampusConnect Rule-Based Matching Engine
 * Weights:
 * - Item Name: 30%
 * - Category: 20%
 * - Location: 25%
 * - Date Proximity: 15%
 * - Description: 10%
 */

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'is', 'it', 'my', 'was', 'near', 'beside', 'around', 'about', 'some', 'has', 'have'
]);

const tokenize = (text = '') => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
};

const calculateTokenSimilarity = (str1 = '', str2 = '') => {
  const tokens1 = new Set(tokenize(str1));
  const tokens2 = new Set(tokenize(str2));

  if (tokens1.size === 0 || tokens2.size === 0) return 0;

  let intersectionCount = 0;
  for (const t of tokens1) {
    if (tokens2.has(t)) {
      intersectionCount++;
    }
  }

  const unionCount = new Set([...tokens1, ...tokens2]).size;
  return unionCount === 0 ? 0 : intersectionCount / unionCount;
};

const calculateDateProximityScore = (date1, date2) => {
  if (!date1 || !date2) return 0;
  const d1 = new Date(date1).getTime();
  const d2 = new Date(date2).getTime();
  const diffDays = Math.abs(d1 - d2) / (1000 * 60 * 60 * 24);

  if (diffDays <= 1) return 100;
  if (diffDays <= 3) return 85;
  if (diffDays <= 7) return 65;
  if (diffDays <= 14) return 40;
  if (diffDays <= 30) return 20;
  return 5;
};

const calculateMatchScore = (lostItem, foundItem) => {
  if (!lostItem || !foundItem) {
    return { score: 0, factors: {} };
  }

  // 1. Item Name (30%)
  const nameSim = calculateTokenSimilarity(lostItem.itemName, foundItem.itemName);
  // Also check if one contains the other as a substring
  const subMatch =
    lostItem.itemName.toLowerCase().includes(foundItem.itemName.toLowerCase()) ||
    foundItem.itemName.toLowerCase().includes(lostItem.itemName.toLowerCase());
  const nameScore = Math.min(100, Math.round((subMatch ? Math.max(nameSim, 0.8) : nameSim) * 100));

  // 2. Category Match (20%)
  const categoryScore =
    lostItem.category && foundItem.category && lostItem.category === foundItem.category ? 100 : 0;

  // 3. Location Similarity (25%)
  const locSim = calculateTokenSimilarity(lostItem.lastSeenLocation, foundItem.foundLocation);
  const locSub =
    lostItem.lastSeenLocation.toLowerCase().includes(foundItem.foundLocation.toLowerCase()) ||
    foundItem.foundLocation.toLowerCase().includes(lostItem.lastSeenLocation.toLowerCase());
  const locationScore = Math.min(100, Math.round((locSub ? Math.max(locSim, 0.75) : locSim) * 100));

  // 4. Date Proximity (15%)
  const dateScore = calculateDateProximityScore(lostItem.lostDate, foundItem.foundDate);

  // 5. Description Similarity (10%)
  const descSim = calculateTokenSimilarity(lostItem.description, foundItem.description);
  const descriptionScore = Math.min(100, Math.round(descSim * 100));

  // Weighted Total
  const weightedTotal =
    nameScore * 0.3 +
    categoryScore * 0.2 +
    locationScore * 0.25 +
    dateScore * 0.15 +
    descriptionScore * 0.1;

  const totalScore = Math.round(weightedTotal);

  return {
    score: totalScore,
    factors: {
      nameScore,
      categoryScore,
      locationScore,
      dateScore,
      descriptionScore,
    },
  };
};

module.exports = {
  calculateMatchScore,
  calculateTokenSimilarity,
  calculateDateProximityScore,
};

