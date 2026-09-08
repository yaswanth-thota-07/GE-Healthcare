/**
 * Hospital Service & Deterministic Ranking Engine
 * Precision Care Challenge 2026 - Hospitality
 *
 * Loads actual hospital dataset from synthetic_pmjay_dataset.csv
 * Uses every supplied dataset row for nationwide policy-aware hospital matching.
 * Keeps synthetic cost/network metadata for demonstration, but preserves source ratings.
 */

const fs = require("fs");
const path = require("path");

// ─── Demonstration Profiles ───────────────────────────────────────────────────
// Fixed array of 25 synthetic profiles repeating across dataset rows:
// index % 25 -> profile (Row 1 -> Profile 1, Row 26 -> Profile 1, Row 51 -> Profile 1...)
const SYNTHETIC_PROFILES = [
  { profileId: 1, syntheticRating: 4.7, networkTier: "Tier 1 Cashless Partner", isNetworkHospital: true, indicativeCost: "₹35,000 - ₹70,000", indicativeCostTier: "Moderate", costScore: 85, roomEligibility: "Single AC Room", cashlessSupport: true, preAuthSpeed: "Fast Track (< 2 hrs)" },
  { profileId: 2, syntheticRating: 3.8, networkTier: "Standard Network", isNetworkHospital: true, indicativeCost: "₹28,000 - ₹55,000", indicativeCostTier: "Budget-Friendly", costScore: 95, roomEligibility: "Shared Ward", cashlessSupport: true, preAuthSpeed: "Standard (4-6 hrs)" },
  { profileId: 3, syntheticRating: 4.4, networkTier: "Tier 1 Cashless Partner", isNetworkHospital: true, indicativeCost: "₹45,000 - ₹90,000", indicativeCostTier: "Moderate-High", costScore: 75, roomEligibility: "Twin Sharing", cashlessSupport: true, preAuthSpeed: "Fast Track (< 2 hrs)" },
  { profileId: 4, syntheticRating: 4.9, networkTier: "Tier 1 Premium Network", isNetworkHospital: true, indicativeCost: "₹75,000 - ₹1,50,000", indicativeCostTier: "Premium", costScore: 60, roomEligibility: "Deluxe Private Suite", cashlessSupport: true, preAuthSpeed: "Fast Track (< 1 hr)" },
  { profileId: 5, syntheticRating: 3.5, networkTier: "Reimbursement Only", isNetworkHospital: false, indicativeCost: "₹25,000 - ₹45,000", indicativeCostTier: "Budget-Friendly", costScore: 98, roomEligibility: "General Ward", cashlessSupport: false, preAuthSpeed: "Manual Reimbursement" },
  { profileId: 6, syntheticRating: 4.1, networkTier: "Standard Network", isNetworkHospital: true, indicativeCost: "₹38,000 - ₹75,000", indicativeCostTier: "Moderate", costScore: 80, roomEligibility: "Twin Sharing", cashlessSupport: true, preAuthSpeed: "Standard (3-4 hrs)" },
  { profileId: 7, syntheticRating: 4.6, networkTier: "Tier 1 Cashless Partner", isNetworkHospital: true, indicativeCost: "₹55,000 - ₹1,10,000", indicativeCostTier: "Moderate-High", costScore: 70, roomEligibility: "Single AC Room", cashlessSupport: true, preAuthSpeed: "Fast Track (< 2 hrs)" },
  { profileId: 8, syntheticRating: 3.9, networkTier: "Standard Network", isNetworkHospital: true, indicativeCost: "₹32,000 - ₹65,000", indicativeCostTier: "Budget-Friendly", costScore: 90, roomEligibility: "Shared Ward", cashlessSupport: true, preAuthSpeed: "Standard (4-6 hrs)" },
  { profileId: 9, syntheticRating: 4.8, networkTier: "Tier 1 Cashless Partner", isNetworkHospital: true, indicativeCost: "₹65,000 - ₹1,25,000", indicativeCostTier: "High", costScore: 65, roomEligibility: "Deluxe Private Suite", cashlessSupport: true, preAuthSpeed: "Fast Track (< 1 hr)" },
  { profileId: 10, syntheticRating: 3.7, networkTier: "Reimbursement Only", isNetworkHospital: false, indicativeCost: "₹30,000 - ₹55,000", indicativeCostTier: "Budget-Friendly", costScore: 92, roomEligibility: "General Ward", cashlessSupport: false, preAuthSpeed: "Manual Reimbursement" },
  { profileId: 11, syntheticRating: 4.3, networkTier: "Standard Network", isNetworkHospital: true, indicativeCost: "₹40,000 - ₹80,000", indicativeCostTier: "Moderate", costScore: 78, roomEligibility: "Twin Sharing", cashlessSupport: true, preAuthSpeed: "Standard (2-4 hrs)" },
  { profileId: 12, syntheticRating: 4.0, networkTier: "Standard Network", isNetworkHospital: true, indicativeCost: "₹35,000 - ₹70,000", indicativeCostTier: "Moderate", costScore: 82, roomEligibility: "Shared Ward", cashlessSupport: true, preAuthSpeed: "Standard (4-6 hrs)" },
  { profileId: 13, syntheticRating: 4.9, networkTier: "Tier 1 Cashless Partner", isNetworkHospital: true, indicativeCost: "₹80,000 - ₹1,50,000", indicativeCostTier: "Premium", costScore: 55, roomEligibility: "Deluxe Private Suite", cashlessSupport: true, preAuthSpeed: "Fast Track (< 1 hr)" },
  { profileId: 14, syntheticRating: 3.4, networkTier: "Reimbursement Only", isNetworkHospital: false, indicativeCost: "₹25,000 - ₹42,000", indicativeCostTier: "Low-Cost", costScore: 100, roomEligibility: "General Ward", cashlessSupport: false, preAuthSpeed: "Manual Reimbursement" },
  { profileId: 15, syntheticRating: 4.5, networkTier: "Tier 1 Cashless Partner", isNetworkHospital: true, indicativeCost: "₹50,000 - ₹1,00,000", indicativeCostTier: "Moderate-High", costScore: 72, roomEligibility: "Single AC Room", cashlessSupport: true, preAuthSpeed: "Fast Track (< 2 hrs)" },
  { profileId: 16, syntheticRating: 3.6, networkTier: "Standard Network", isNetworkHospital: true, indicativeCost: "₹30,000 - ₹60,000", indicativeCostTier: "Budget-Friendly", costScore: 94, roomEligibility: "Shared Ward", cashlessSupport: true, preAuthSpeed: "Standard (4-6 hrs)" },
  { profileId: 17, syntheticRating: 4.2, networkTier: "Standard Network", isNetworkHospital: true, indicativeCost: "₹42,000 - ₹85,000", indicativeCostTier: "Moderate", costScore: 76, roomEligibility: "Twin Sharing", cashlessSupport: true, preAuthSpeed: "Standard (3-5 hrs)" },
  { profileId: 18, syntheticRating: 4.8, networkTier: "Tier 1 Cashless Partner", isNetworkHospital: true, indicativeCost: "₹70,000 - ₹1,35,000", indicativeCostTier: "High", costScore: 62, roomEligibility: "Single AC Room", cashlessSupport: true, preAuthSpeed: "Fast Track (< 1 hr)" },
  { profileId: 19, syntheticRating: 3.3, networkTier: "Reimbursement Only", isNetworkHospital: false, indicativeCost: "₹28,000 - ₹48,000", indicativeCostTier: "Low-Cost", costScore: 97, roomEligibility: "General Ward", cashlessSupport: false, preAuthSpeed: "Manual Reimbursement" },
  { profileId: 20, syntheticRating: 4.6, networkTier: "Tier 1 Cashless Partner", isNetworkHospital: true, indicativeCost: "₹58,000 - ₹1,15,000", indicativeCostTier: "Moderate-High", costScore: 68, roomEligibility: "Single AC Room", cashlessSupport: true, preAuthSpeed: "Fast Track (< 2 hrs)" },
  { profileId: 21, syntheticRating: 4.0, networkTier: "Standard Network", isNetworkHospital: true, indicativeCost: "₹35,000 - ₹68,000", indicativeCostTier: "Moderate", costScore: 84, roomEligibility: "Shared Ward", cashlessSupport: true, preAuthSpeed: "Standard (4-6 hrs)" },
  { profileId: 22, syntheticRating: 3.9, networkTier: "Standard Network", isNetworkHospital: true, indicativeCost: "₹32,000 - ₹62,000", indicativeCostTier: "Budget-Friendly", costScore: 88, roomEligibility: "Twin Sharing", cashlessSupport: true, preAuthSpeed: "Standard (3-5 hrs)" },
  { profileId: 23, syntheticRating: 4.7, networkTier: "Tier 1 Cashless Partner", isNetworkHospital: true, indicativeCost: "₹52,000 - ₹1,05,000", indicativeCostTier: "Moderate-High", costScore: 73, roomEligibility: "Single AC Room", cashlessSupport: true, preAuthSpeed: "Fast Track (< 2 hrs)" },
  { profileId: 24, syntheticRating: 3.5, networkTier: "Reimbursement Only", isNetworkHospital: false, indicativeCost: "₹25,000 - ₹45,000", indicativeCostTier: "Low-Cost", costScore: 96, roomEligibility: "General Ward", cashlessSupport: false, preAuthSpeed: "Manual Reimbursement" },
  { profileId: 25, syntheticRating: 4.4, networkTier: "Standard Network", isNetworkHospital: true, indicativeCost: "₹45,000 - ₹90,000", indicativeCostTier: "Moderate", costScore: 77, roomEligibility: "Twin Sharing", cashlessSupport: true, preAuthSpeed: "Standard (2-4 hrs)" }
];

// Accepted insurance empanelment: a distinct combo per profile (1-25).
// Since dataset rows map via index % 25, hospitals 1-25 get different sets
// and the same 25 combos repeat for rows 26-50, 51-75, ...
const INSURER_POOL = [
  "HDFC ERGO",
  "ICICI Lombard",
  "New India Assurance",
  "National Insurance",
  "Bajaj Allianz",
  "Tata AIG",
  "Star Health",
  "Care Health",
  "Reliance General",
  "Oriental Insurance",
  "United India",
  "Future Generali",
  "Digit Insurance",
  "Aditya Birla Health",
];
const PM_JAY_LABEL = "PM-JAY (Ayushman Bharat)";

(function buildAcceptedInsurers() {
  const seen = new Set();
  SYNTHETIC_PROFILES.forEach((profile) => {
    const count = 3 + (profile.profileId % 4);
    let start = (profile.profileId * 2) % INSURER_POOL.length;
    let combo;
    let comboKey = "";
    let attempts = 0;
    do {
      combo = [];
      for (let i = 0; i < count; i++) {
        combo.push(INSURER_POOL[(start + i * 3) % INSURER_POOL.length]);
      }
      if (profile.isNetworkHospital && !combo.includes(PM_JAY_LABEL)) {
        combo.push(PM_JAY_LABEL);
      }
      comboKey = combo.join("|");
      start += 1;
      attempts += 1;
    } while (seen.has(comboKey) && attempts < 40);
    seen.add(comboKey);
    profile.acceptedInsurers = combo;
  });
})();

// Default Configurable Scoring Weights (Must sum to 1.0)
const DEFAULT_WEIGHTS = {
  specialty: 0.30,
  insurance: 0.25,
  cost: 0.20,
  rating: 0.25,
};

let cachedHospitals = null;

/**
 * Custom CSV parser handling quoted multiline specialty strings
 */
function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentVal = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      currentRow.push(currentVal.trim());
      currentVal = "";
    } else if ((char === "\r" || char === "\n") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i++;
      }
      currentRow.push(currentVal.trim());
      if (currentRow.some((cell) => cell.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentVal = "";
    } else {
      currentVal += char;
    }
  }
  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    rows.push(currentRow);
  }
  return rows;
}

/**
 * Clean & normalize specialty text array
 */
function cleanSpecialties(rawSpecialtiesStr) {
  if (!rawSpecialtiesStr) return [];
  const seen = new Set();
  return rawSpecialtiesStr
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter((specialty) => {
      const normalized = specialty.toLowerCase();
      if (!specialty || seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });
}

function normalizeHospitalKeyPart(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function createHospitalKey(hospitalName, district, state) {
  return [hospitalName, district, state]
    .map(normalizeHospitalKeyPart)
    .join("|");
}

function parseRegistryCoordinates(value) {
  if (!value) return { latitude: null, longitude: null };
  const values = String(value).split(",").map((part) => Number.parseFloat(part.trim()));
  const [latitude, longitude] = values;
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 || latitude > 90 ||
    longitude < -180 || longitude > 180
  ) {
    return { latitude: null, longitude: null };
  }
  return { latitude, longitude };
}

function getStableProfileIndex(hospitalKey) {
  let hash = 0;
  for (const character of hospitalKey) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }
  return hash % SYNTHETIC_PROFILES.length;
}

/**
 * Load ALL hospital rows from synthetic_pmjay_dataset.csv
 * Retains every CSV row and attaches only supplemental demo metadata.
 */
function loadAllHospitals() {
  if (cachedHospitals) return cachedHospitals;

  const syntheticPath = path.join(__dirname, "../synthetic_pmjay_dataset.csv");
  const registryPath = path.join(__dirname, "../hospital.csv");
  const syntheticRows = parseCSV(fs.readFileSync(syntheticPath, "utf-8"));
  const registryRows = fs.existsSync(registryPath)
    ? parseCSV(fs.readFileSync(registryPath, "utf-8"))
    : [];

  if (syntheticRows.length <= 1 || registryRows.length <= 1) {
    throw new Error("Hospital datasets appear to be empty");
  }

  const syntheticHeaders = syntheticRows[0].map((header) => header.toLowerCase());
  const registryHeaders = registryRows[0].map((header) => header.toLowerCase());
  const syntheticIndex = (name) => syntheticHeaders.indexOf(name);
  const registryIndex = (name) => registryHeaders.indexOf(name.toLowerCase());

  const syntheticHospitals = syntheticRows.slice(1).map((row, index) => {
    const hospitalName = row[syntheticIndex("hospital_name")] || "Unknown Hospital";
    const state = row[syntheticIndex("state")] || "";
    const district = row[syntheticIndex("district")] || "";
    const latitude = Number.parseFloat(row[syntheticIndex("latitude")]);
    const longitude = Number.parseFloat(row[syntheticIndex("longitude")]);
    const ratingValue = Number.parseFloat(row[syntheticIndex("rating")]);
    const specialties = cleanSpecialties(row[syntheticIndex("specialties")]);
    const hospitalKey = createHospitalKey(hospitalName, district, state);

    return {
      rowIndex: index,
      source: "synthetic_pmjay_dataset",
      hospitalName,
      state,
      district,
      latitude: Number.isFinite(latitude) ? latitude : null,
      longitude: Number.isFinite(longitude) ? longitude : null,
      rating: Number.isFinite(ratingValue) ? ratingValue : null,
      specialties,
      hospitalKey,
    };
  });

  const registryHospitals = registryRows.slice(1).map((row, index) => {
    const hospitalName = row[registryIndex("hospital_name")] || "Unknown Hospital";
    const state = row[registryIndex("state")] || "";
    const district = row[registryIndex("district")] || "";
    const coordinates = parseRegistryCoordinates(row[registryIndex("location_coordinates")]);
    const hospitalKey = createHospitalKey(hospitalName, district, state);

    return {
      rowIndex: index,
      source: "hospital_registry",
      hospitalName,
      state,
      district,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      rating: null,
      specialties: cleanSpecialties(row[registryIndex("specialties")]),
      hospitalKey,
    };
  });

  const mergedHospitals = new Map();
  for (const hospital of [...syntheticHospitals, ...registryHospitals]) {
    const existing = mergedHospitals.get(hospital.hospitalKey);
    if (!existing) {
      mergedHospitals.set(hospital.hospitalKey, { ...hospital });
      continue;
    }

    const specialties = [...existing.specialties, ...hospital.specialties];
    existing.specialties = cleanSpecialties(specialties.join("\n"));
    existing.source = existing.source === hospital.source
      ? existing.source
      : "synthetic_pmjay_dataset+hospital_registry";
    if (existing.rating === null && hospital.rating !== null) existing.rating = hospital.rating;
    if (existing.latitude === null && hospital.latitude !== null) existing.latitude = hospital.latitude;
    if (existing.longitude === null && hospital.longitude !== null) existing.longitude = hospital.longitude;
    if (existing.source === "hospital_registry" && hospital.source === "synthetic_pmjay_dataset") {
      existing.hospitalName = hospital.hospitalName;
      existing.state = hospital.state;
      existing.district = hospital.district;
    }
  }

  const hospitals = Array.from(mergedHospitals.values()).map((hospital, index) => ({
    ...hospital,
    rowIndex: index,
    syntheticProfile: SYNTHETIC_PROFILES[getStableProfileIndex(hospital.hospitalKey)],
  }));

  cachedHospitals = hospitals;
  return hospitals;
}

/**
 * Haversine formula distance calculation in kilometers
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Specialty matching score (0 to 100) with string normalization
 */
function calculateSpecialtyMatch(hospitalSpecialties, requiredSpecialty) {
  if (!requiredSpecialty || requiredSpecialty.trim() === "") {
    return { score: 100, matchedTerm: "All Specialties" };
  }

  const queryNorm = requiredSpecialty.toLowerCase().trim();
  let bestMatchScore = 0;
  let matchedTerm = null;

  for (const spec of hospitalSpecialties) {
    const specNorm = spec.toLowerCase().trim();
    if (specNorm === queryNorm) {
      bestMatchScore = 100;
      matchedTerm = spec;
      break;
    } else if (specNorm.includes(queryNorm) || queryNorm.includes(specNorm)) {
      if (bestMatchScore < 90) {
        bestMatchScore = 90;
        matchedTerm = spec;
      }
    } else {
      // Partial keyword token overlap check
      const queryTokens = queryNorm.split(/\s+/);
      const specTokens = specNorm.split(/\s+/);
      const matches = queryTokens.filter((t) => t.length > 2 && specTokens.includes(t));
      if (matches.length > 0) {
        const tokenScore = 70;
        if (tokenScore > bestMatchScore) {
          bestMatchScore = tokenScore;
          matchedTerm = spec;
        }
      }
    }
  }

  return { score: bestMatchScore, matchedTerm };
}

const RECOMMENDATION_SENTENCES = [
  (facts) => `${facts.name} is a strong option because it offers a direct ${facts.specialty} match, a ${facts.network} profile for your policy to verify, and an indicative cost of ${facts.cost}.`,
  (facts) => `Your selected ${facts.specialty} department matches the services listed for ${facts.name}; the ${facts.network} profile may support policy access, subject to insurer confirmation, with costs estimated at ${facts.cost}.`,
  (facts) => `${facts.name} stands out for the requested ${facts.specialty} care and its policy-relevant ${facts.network} profile; plan for the indicative price range of ${facts.cost}.`,
  (facts) => `The listed ${facts.specialty} capability makes ${facts.name} a favorable comparison, while its ${facts.network} status should be checked before admission; the indicative range is ${facts.cost}.`,
  (facts) => `${facts.name} scores well for this search because the hospital lists ${facts.specialty}; confirm whether the ${facts.network} arrangement applies to your policy and review the ${facts.cost} estimate.`,
  (facts) => `For ${facts.specialty} care, ${facts.name} combines a relevant department with a ${facts.network} profile; insurance eligibility still needs confirmation, and the indicative cost is ${facts.cost}.`,
  (facts) => `${facts.name} is recommended as a high-fit option for ${facts.specialty}, with policy compatibility to verify through its ${facts.network} profile and an indicative range of ${facts.cost}.`,
  (facts) => `The match is favorable for ${facts.name} because its listed care includes ${facts.specialty}; verify cashless eligibility and final billing under the ${facts.network} profile, with ${facts.cost} shown as the estimate.`,
  (facts) => `${facts.name} is a reasonable ${facts.specialty} comparison with a ${facts.network} profile and an indicative cost of ${facts.cost}; confirm the policy terms before choosing it.`,
  (facts) => `This result places ${facts.name} among the practical ${facts.specialty} options; its ${facts.network} status and the ${facts.cost} estimate both require direct confirmation.`,
  (facts) => `${facts.name} may fit your selected ${facts.specialty} requirement, with a ${facts.network} profile to check against the policy and an indicative range of ${facts.cost}.`,
  (facts) => `The available data makes ${facts.name} worth comparing for ${facts.specialty}; ask the insurer about the ${facts.network} arrangement and use ${facts.cost} only as an indicative estimate.`,
  (facts) => `${facts.name} offers the requested ${facts.specialty} category in this comparison, while its ${facts.network} details and indicative cost of ${facts.cost} should be verified before admission.`,
  (facts) => `Consider ${facts.name} for ${facts.specialty} care after checking whether its ${facts.network} profile supports your policy and whether the ${facts.cost} estimate fits your expected budget.`,
  (facts) => `${facts.name} is included as a balanced ${facts.specialty} option; policy access through its ${facts.network} profile is not guaranteed, and the listed indicative range is ${facts.cost}.`,
  (facts) => `The comparison identifies ${facts.name} for ${facts.specialty}, but you should confirm its ${facts.network} status, coverage conditions, and the ${facts.cost} indicative range with the hospital.`,
  (facts) => `${facts.name} has the requested ${facts.specialty} listing, though the ${facts.network} policy fit needs verification; the current indicative cost is ${facts.cost}.`,
  (facts) => `Before considering ${facts.name} for ${facts.specialty}, verify the ${facts.network} relationship with your insurer and request a final estimate instead of relying only on ${facts.cost}.`,
  (facts) => `${facts.name} is a possible ${facts.specialty} choice, but its policy-network suitability is still a checkpoint; the comparison currently shows ${facts.cost} as an indicative range.`,
  (facts) => `The ${facts.specialty} match at ${facts.name} is useful for comparison, while insurance approval, ${facts.network} status, and the ${facts.cost} estimate remain subject to confirmation.`,
  (facts) => `${facts.name} should be reviewed carefully for ${facts.specialty}: verify whether the ${facts.network} profile applies to your policy and whether the indicative cost of ${facts.cost} is acceptable.`,
  (facts) => `This lower-fit comparison lists ${facts.name} for ${facts.specialty}, but network eligibility and final pricing need extra checking; the current indicative range is ${facts.cost}.`,
  (facts) => `${facts.name} may not be the strongest fit for your ${facts.specialty} search, so confirm the ${facts.network} policy position and obtain a final quote beyond the ${facts.cost} estimate.`,
  (facts) => `Use ${facts.name} as a backup ${facts.specialty} option only after checking insurer authorization, the ${facts.network} profile, and the likely difference between final billing and ${facts.cost}.`,
  (facts) => `${facts.name} has a weaker comparison position for ${facts.specialty}; verify insurance access and network status carefully before relying on the ${facts.cost} indicative range.`,
];

/**
 * Generate one of 25 deterministic, grounded "Why this hospital?" explanations.
 * The cycle contains 8 favorable, 10 balanced, and 7 cautionary messages.
 */
function generateWhyRecommended(hospital, breakdown, matchedTerm, cycleIndex) {
  const profile = hospital.syntheticProfile;
  const specialty = matchedTerm
    ? matchedTerm
    : "is available for nationwide comparison";
  const network = profile.isNetworkHospital
    ? profile.networkTier
    : "non-network/reimbursement profile";
  const sentence = RECOMMENDATION_SENTENCES[cycleIndex % RECOMMENDATION_SENTENCES.length];
  return sentence({
    name: hospital.hospitalName,
    specialty,
    network,
    cost: profile.indicativeCost,
    score: breakdown.total,
  });
}

/**
 * Search and rank eligible hospitals nationwide, deduplicated by hospital location.
 *
 * @param {object} searchParams
 * @param {object} [customWeights]
 * @returns {Array<object>} Ranked array of unique hospital results
 */
function searchAndRankHospitals(searchParams = {}, customWeights = {}) {
  const allHospitals = loadAllHospitals();
  const weights = { ...DEFAULT_WEIGHTS, ...customWeights };

  const {
    requiredSpecialty,
    district,
    state,
    policyConstraints,
  } = searchParams;
  const resultsMap = new Map();
  const hasLocationFilter = Boolean(state || district);
  const localHospitals = hasLocationFilter
    ? allHospitals.filter((hospital) => {
        const matchesState = !state || hospital.state.toLowerCase() === state.toLowerCase();
        const matchesDistrict = !district || hospital.district.toLowerCase() === district.toLowerCase();
        return matchesState && matchesDistrict;
      })
    : [];
  const localKeys = new Set(
    localHospitals.map((hospital) =>
      `${hospital.hospitalName.toLowerCase().trim()}_${hospital.district.toLowerCase().trim()}_${hospital.state.toLowerCase().trim()}`
    )
  );
  const candidateHospitals = hasLocationFilter && localKeys.size < 10
    ? [...localHospitals, ...allHospitals.filter((hospital) => {
        const key = `${hospital.hospitalName.toLowerCase().trim()}_${hospital.district.toLowerCase().trim()}_${hospital.state.toLowerCase().trim()}`;
        return !localKeys.has(key);
      })]
    : hasLocationFilter
    ? localHospitals
    : allHospitals;

  for (const hospital of candidateHospitals) {
    // 1. Specialty Match Score (0 to 100)
    const { score: specMatchScore, matchedTerm } = calculateSpecialtyMatch(
      hospital.specialties,
      requiredSpecialty
    );

    // City searches show all local hospitals, while nationwide searches stay specialty-specific.
    if (!hasLocationFilter && requiredSpecialty && requiredSpecialty.trim().length > 0 && specMatchScore === 0) {
      continue;
    }

    // 2. Insurance/Network Score (0 to 100)
    const profile = hospital.syntheticProfile;
    let insuranceScore = profile.isNetworkHospital ? 100 : 40;
    if (policyConstraints && policyConstraints.networkRequired && !profile.isNetworkHospital) {
      insuranceScore = 20; // Reduced score if network strictly required by policy
    }

    // 3. Indicative Cost Score (0 to 100)
    const costScore = profile.costScore;

    // 4. Rating Score (0 to 100)
    const ratingScore = hospital.rating === null
      ? 50
      : Math.round((hospital.rating / 5.0) * 100);

    // Final Weighted Score (0 to 100)
    const weightedSpecialty = specMatchScore * weights.specialty;
    const weightedInsurance = insuranceScore * weights.insurance;
    const weightedCost = costScore * weights.cost;
    const weightedRating = ratingScore * weights.rating;

    const totalScore = Math.round(
      weightedSpecialty + weightedInsurance + weightedCost + weightedRating
    );

    const scoreBreakdown = {
      specialty: Math.round(weightedSpecialty),
      specialtyMax: Math.round(100 * weights.specialty),
      insurance: Math.round(weightedInsurance),
      insuranceMax: Math.round(100 * weights.insurance),
      cost: Math.round(weightedCost),
      costMax: Math.round(100 * weights.cost),
      rating: Math.round(weightedRating),
      ratingMax: Math.round(100 * weights.rating),
      total: totalScore,
    };

    const resultItem = {
      rowIndex: hospital.rowIndex,
      hospitalName: hospital.hospitalName,
      state: hospital.state,
      district: hospital.district,
      latitude: hospital.latitude,
      longitude: hospital.longitude,
      rating: hospital.rating,
      specialties: hospital.specialties,
      matchedSpecialty: matchedTerm,
      distanceKm: null,
      indicativeCost: profile.indicativeCost,
      matchScore: totalScore,
      scoreBreakdown,
      syntheticProfile: profile,
      whyRecommended: "",
      isBestMatch: false,
      isSelectedLocation: localKeys.has(`${hospital.hospitalName.toLowerCase().trim()}_${hospital.district.toLowerCase().trim()}_${hospital.state.toLowerCase().trim()}`),
    };
    const uniqueKey = `${hospital.hospitalName.toLowerCase().trim()}_${hospital.district.toLowerCase().trim()}_${hospital.state.toLowerCase().trim()}`;
    const existing = resultsMap.get(uniqueKey);
    if (!existing || resultItem.rating > existing.rating) {
      resultsMap.set(uniqueKey, resultItem);
    }
  }

  const results = Array.from(resultsMap.values());

  // Rank by the policy-aware score in every geographic scope. Location remains metadata,
  // not an unconditional boost over a stronger match elsewhere.
  results.sort((a, b) =>
    b.matchScore - a.matchScore ||
    b.rating - a.rating ||
    a.rowIndex - b.rowIndex
  );

  // Assign ranks, recommendationLabels, and BEST MATCH badge
  results.forEach((h, idx) => {
    h.whyRecommended = generateWhyRecommended(
      h,
      h.scoreBreakdown,
      h.matchedSpecialty,
      idx
    );
    h.rank = idx + 1;
    if (idx === 0) {
      h.isBestMatch = true;
      h.recommendationLabel = "BEST MATCH";
    } else if (idx === 1) {
      h.recommendationLabel = "STRONG ALTERNATIVE";
    } else if (idx === 2) {
      h.recommendationLabel = "VIABLE ALTERNATIVE";
    } else {
      h.recommendationLabel = "CARE OPTION";
    }
  });

  return results;
}

/**
 * Get sorted list of all unique specialties present in the hospital dataset
 */
function getAllSpecialties() {
  const hospitals = loadAllHospitals();
  const specSet = new Set();
  hospitals.forEach((h) => {
    h.specialties.forEach((s) => specSet.add(s));
  });
  return Array.from(specSet).sort();
}

function getHospitalLocations() {
  const hospitals = loadAllHospitals();
  const locations = new Map();
  hospitals.forEach((hospital) => {
    const key = `${hospital.state}::${hospital.district}`;
    if (!locations.has(key)) {
      locations.set(key, { state: hospital.state, district: hospital.district });
    }
  });
  return Array.from(locations.values()).sort((a, b) =>
    `${a.state} ${a.district}`.localeCompare(`${b.state} ${b.district}`)
  );
}

module.exports = {
  loadAllHospitals,
  getSyntheticProfiles: () => SYNTHETIC_PROFILES,
  searchAndRankHospitals,
  calculateHaversineDistance,
  getAllSpecialties,
  getHospitalLocations,
  DEFAULT_WEIGHTS,
};
