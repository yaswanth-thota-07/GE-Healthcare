/**
 * Insurance Policy Analyzer & Structured Extractor
 * Precision Care Challenge 2026 - Hospitality
 *
 * Extracts structured policy JSON from raw insurance policy PDF text.
 * Isolated AI provider interface + robust deterministic fallback parser.
 * Generates human-readable summary and safety disclaimers.
 */

const fs = require("fs");

/**
 * Standard Schema Definition for Extracted Insurance Information
 */
function createEmptyPolicySchema() {
  return {
    executiveSummary: null,
    coveredBenefits: [],
    insurer: null,
    policyType: null,
    policyNumber: null,
    sumInsured: null,
    roomEligibility: null,
    networkRequirement: null,
    cashlessAvailable: null,
    preHospitalizationDays: null,
    postHospitalizationDays: null,
    exclusions: [],
    waitingPeriods: [],
    importantClauses: [],
    financialConditions: [],
    claimRequirements: [],
    verificationItems: [],
  };
}

/**
 * Rule-Based Deterministic Fallback Parser
 * Parses raw text from insurance policy PDFs using normalized regex and string matching
 */
function parsePolicyDeterministic(text) {
  const result = createEmptyPolicySchema();
  if (!text || typeof text !== "string") return result;

  const normalizedText = text
    .replace(/\b(Sum\s*Insured|Sum\s*Assured|Annual\s*Coverage|Coverage\s*Limit|Premium|Coverage)n(?=\d)/gi, "$1 ")
    .replace(/[ \t\r]+/g, " ")
    .replace(/\n+/g, "\n")
    .trim();
  const lines = normalizedText.split("\n").map((l) => l.trim()).filter(Boolean);
  const lowerText = normalizedText.toLowerCase();
  const extractLinesContaining = (patterns, limit = 8) => lines
    .filter((line) => patterns.some((pattern) => pattern.test(line)))
    .slice(0, limit);

  // 1. Insurer Detection
  const insurerPatterns = [
    /(ayushman\s+bharat[^\n,]*)/i,
    /(pradhan\s+mantri\s+jan\s+arogya\s+yojana\s*(?:\(pm-jay\))?)/i,
    /(?:insurer\s*\/\s*scheme\s*name|scheme\s*name|insurer|insurance\s+company)\s*[:\s]+([^\n,]+)/i,
    /(star\s+health[^\n,]*)/i,
    /(hdfc\s+ergo[^\n,]*)/i,
    /(niva\s+bupa[^\n,]*)/i,
    /(care\s+health[^\n,]*)/i,
    /(icici\s+lombard[^\n,]*)/i,
    /(aditya\s+birla[^\n,]*)/i,
    /(bajaj\s+allianz[^\n,]*)/i,
    /(united\s+india[^\n,]*)/i,
    /(new\s+india\s+assurance[^\n,]*)/i,
    /(oriental\s+insurance[^\n,]*)/i,
    /(national\s+insurance[^\n,]*)/i,
  ];
  for (const pat of insurerPatterns) {
    const match = normalizedText.match(pat);
    if (match && match[1]) {
      result.insurer = match[1].trim();
      break;
    }
  }

  // 2. Policy Type Detection
  const policyTypeMatch = normalizedText.match(/policy\s+type\s*:?\s*([A-Za-z ]+?)(?=\s+(?:coverage|policy\s+start|policy\s+end|status)|$)/i) ||
    normalizedText.match(/(comprehensive\s+health[^\n,.]*|family\s+floater[^\n,.]*|individual\s+health[^\n,.]*|senior\s+citizen[^\n,.]*|government[- ]?sponsored[^\n,.]*|government[- ]?funded[^\n,.]*)/i);
  if (policyTypeMatch && policyTypeMatch[1]) {
    result.policyType = policyTypeMatch[1].trim();
  }

  // 3. Policy Number
  const policyNumMatch = normalizedText.match(/policy\s*(?:number|no|#)\s*:?\s*([A-Z0-9\/-]{5,25})/i) ||
    normalizedText.match(/beneficiary\s*id\s*:?\s*([A-Z0-9-]{5,30})/i) ||
    normalizedText.match(/family\s*id\s*:?\s*([A-Z0-9-]{5,30})/i);
  if (policyNumMatch && policyNumMatch[1]) {
    result.policyNumber = policyNumMatch[1].trim();
  }

  // 4. Sum Insured (Extract integer value)
  const sumInsuredMatch = normalizedText.match(
    /(?:sum\s*insured|sum\s*assured|annual\s*coverage|coverage\s*limit)\s*:?\s*(?:up\s*to\s*)?(?:rs\.?|inr|₹|n)?\s*([\d,]+)/i
  );
  if (sumInsuredMatch && sumInsuredMatch[1]) {
    const cleanNum = parseInt(sumInsuredMatch[1].replace(/,/g, ""), 10);
    if (!isNaN(cleanNum)) {
      result.sumInsured = cleanNum;
    }
  }

  // 5. Room Eligibility
  const roomMatch = normalizedText.match(/room\s*(?:eligibility|category|rent\s*limit|type)\s*:?\s*([^\n,.]+)/i);
  if (roomMatch && roomMatch[1]) {
    result.roomEligibility = roomMatch[1].trim();
  } else {
    if (lowerText.includes("single private ac room") || lowerText.includes("single room")) {
      result.roomEligibility = "Single Private AC Room";
    } else if (lowerText.includes("shared room") || lowerText.includes("twin sharing")) {
      result.roomEligibility = "Twin Sharing / Shared Room";
    } else if (lowerText.includes("no cap") || lowerText.includes("no room rent capping")) {
      result.roomEligibility = "No Capping on Room Category";
    }
  }

  // 6. Network Requirement
  if (lowerText.includes("network hospital required") || lowerText.includes("network hospital only")) {
    result.networkRequirement = true;
  } else if (lowerText.includes("any hospital") || lowerText.includes("no network restriction")) {
    result.networkRequirement = false;
  } else if (lowerText.includes("empanelled") || lowerText.includes("network")) {
    result.networkRequirement = true;
  }

  // 7. Cashless Availability
  if (lowerText.includes("cashless facility available") || lowerText.includes("cashless available") || lowerText.includes("cashless treatment")) {
    result.cashlessAvailable = true;
  } else if (lowerText.includes("reimbursement only") || lowerText.includes("no cashless")) {
    result.cashlessAvailable = false;
  }

  // 8. Pre-Hospitalization Days
  const preMatch = normalizedText.match(/pre[\s-]*hospitali[zs]ation\s*(?:period|coverage)?\s*:?\s*(\d+)\s*days?/i);
  if (preMatch && preMatch[1]) {
    result.preHospitalizationDays = parseInt(preMatch[1], 10);
  }

  // 9. Post-Hospitalization Days
  const postMatch = normalizedText.match(/post[\s-]*hospitali[zs]ation\s*(?:period|coverage)?\s*:?\s*(\d+)\s*days?/i);
  if (postMatch && postMatch[1]) {
    result.postHospitalizationDays = parseInt(postMatch[1], 10);
  }

  // 10. Exclusions
  const exclusions = [];
  lines.forEach((line) => {
    const cleaned = line.replace(/^[-•*]\s*/, "").trim();
    if (cleaned.endsWith(":")) return;
    if (
      line.match(/^(?:exclusion|not covered|excluded|permanent exclusion)/i) ||
      (line.startsWith("-") && line.toLowerCase().includes("exclude"))
    ) {
      exclusions.push(cleaned);
    }
  });
  // Also extract bullet points following "Exclusions" header if any
  const exclusionSectionMatch = text.match(/(?:exclusions|what\s+is\s+not\s+covered)\s*[:\n]+([\s\S]*?)(?:\n\n|\n[A-Z][a-z]+:|$)/i);
  if (exclusionSectionMatch && exclusionSectionMatch[1]) {
    const items = exclusionSectionMatch[1]
      .split("\n")
      .map((i) => i.replace(/^[-•*]\s*/, "").trim())
      .filter((i) => i.length > 5 && i.length < 150 && !i.endsWith(":"));
    items.forEach((item) => {
      if (!exclusions.includes(item)) exclusions.push(item);
    });
  }
  result.exclusions = exclusions.slice(0, 10);

  // 11. Waiting Periods
  const waitingPeriods = [];
  lines.forEach((line) => {
    const cleaned = line.replace(/^[-•*]\s*/, "").trim();
    if (cleaned.endsWith(":")) return;
    if (line.toLowerCase().includes("waiting period") || line.toLowerCase().includes("initial waiting")) {
      waitingPeriods.push(cleaned);
    }
  });
  result.waitingPeriods = waitingPeriods.slice(0, 5);

  // 12. Important Clauses
  const clauses = [];
  lines.forEach((line) => {
    const cleaned = line.replace(/^[-•*]\s*/, "").trim();
    if (cleaned.endsWith(":")) return;
    if (
      line.toLowerCase().includes("co-pay") ||
      line.toLowerCase().includes("sub-limit") ||
      line.toLowerCase().includes("deductible") ||
      line.toLowerCase().includes("clause")
    ) {
      clauses.push(cleaned);
    }
  });
  result.importantClauses = clauses.slice(0, 5);

  result.coveredBenefits = extractLinesContaining([
    /hospitalization/i,
    /day[- ]?care/i,
    /ambulance/i,
    /maternity/i,
    /covered/i,
  ]).filter((line) => !/pre-existing|waiting|excluded|not covered/i.test(line));
  result.financialConditions = extractLinesContaining([
    /sum insured/i,
    /premium/i,
    /co[- ]?pay/i,
    /deductible/i,
    /sub[- ]?limit/i,
    /room rent/i,
  ]);
  result.claimRequirements = extractLinesContaining([
    /claim/i,
    /pre[- ]?authori[sz]/i,
    /cashless/i,
    /network hospital/i,
    /documents?/i,
  ]);
  result.verificationItems = [
    ...result.waitingPeriods,
    ...result.importantClauses,
    ...result.exclusions,
  ].slice(0, 8);
  const insurerText = result.insurer || "an insurer not clearly specified";
  const sumInsuredText = result.sumInsured
    ? `₹${result.sumInsured.toLocaleString("en-IN")}`
    : "an amount not specified";
  const roomText = result.roomEligibility || "a room category not specified";
  const networkText = result.networkRequirement === true
    ? "a network hospital requirement"
    : result.networkRequirement === false
    ? "no strict network hospital restriction"
    : "no clearly stated network restriction";
  const cashlessText = result.cashlessAvailable === true
    ? "cashless treatment availability"
    : result.cashlessAvailable === false
    ? "reimbursement-only processing"
    : "cashless availability that is not clearly specified";
  const preDaysText = result.preHospitalizationDays
    ? `${result.preHospitalizationDays} days of pre-hospitalization coverage`
    : "pre-hospitalization coverage not specified";
  const postDaysText = result.postHospitalizationDays
    ? `${result.postHospitalizationDays} days of post-hospitalization coverage`
    : "post-hospitalization coverage not specified";
  const exclusionText = result.exclusions.length > 0
    ? `${result.exclusions.length} exclusion${result.exclusions.length === 1 ? "" : "s"} identified`
    : "no explicit exclusions identified in the extracted text";
  const waitingText = result.waitingPeriods.length > 0
    ? `${result.waitingPeriods.length} waiting-period item${result.waitingPeriods.length === 1 ? "" : "s"} identified`
    : "no waiting period clearly identified";
  const claimText = result.claimRequirements.length > 0
    ? "claim and admission requirements are listed for review"
    : "claim and admission requirements are not clearly specified";

  result.executiveSummary = `This policy is associated with ${insurerText}, with sum insured ${sumInsuredText}. Terms include ${roomText}, ${networkText}, and ${cashlessText}. It provides ${preDaysText} and ${postDaysText}. It lists ${exclusionText} and ${waitingText}; these conditions may affect reimbursement. ${claimText}. Before admission, confirm network status, room eligibility, exclusions, waiting periods, documents, and payable amount with the insurer and hospital.`;

  return result;
}

/**
 * Gemini API Extraction Handler
 * Calls Google Gemini API with responseMimeType: application/json
 */
async function callGeminiAPI(rawText, apiKey) {
  const prompt = `You are a specialized health insurance policy analyzer. Analyze the following policy document text and return a detailed, user-friendly JSON briefing.

DOCUMENT TEXT:
${rawText}

OUTPUT SCHEMA (Return ONLY valid JSON matching this exact structure):
{
  "executiveSummary": "65-80 word plain-language briefing grounded only in the document",
  "coveredBenefits": ["explicitly covered benefits or services"],
  "insurer": "string or null",
  "policyType": "string or null",
  "policyNumber": "string or null",
  "sumInsured": number_or_null,
  "roomEligibility": "string or null",
  "networkRequirement": boolean_or_null,
  "cashlessAvailable": boolean_or_null,
  "preHospitalizationDays": number_or_null,
  "postHospitalizationDays": number_or_null,
  "exclusions": ["array of exclusion strings"],
  "waitingPeriods": ["array of waiting period strings"],
  "importantClauses": ["array of important clause strings"],
  "financialConditions": ["co-pay, deductible, sub-limit, premium, room-rent, or sum-insured conditions"],
  "claimRequirements": ["claim, pre-authorization, network, cashless, or document requirements"],
  "verificationItems": ["specific things the policyholder should verify before treatment or admission"]
}

RULES:
1. Only extract information explicitly mentioned in the text.
2. If a field is missing, set its value to null (or empty array for lists). Do NOT invent or hallucinate data.
3. Return raw JSON object only.
4. Never infer that a benefit exists just because it is common in insurance. Use null or an empty array when the document does not state it.
5. Keep verificationItems practical and policy-specific; do not give medical advice or guarantee claim approval.`;

  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Gemini API returned HTTP ${response.status}: ${errBody}`);
  }

  const data = await response.json();
  const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textContent) throw new Error("Empty content returned from Gemini API");

  const parsed = JSON.parse(textContent);
  return {
    ...createEmptyPolicySchema(),
    ...parsed,
  };
}

/**
 * Isolated AI Extraction Handler
 * Uses Google Gemini API if GEMINI_API_KEY is present in environment,
 * otherwise safely delegates to deterministic parser.
 */
async function extractPolicyWithAI(rawText) {
  const geminiKey = process.env.GEMINI_API_KEY;

  if (geminiKey && geminiKey.trim().length > 0 && geminiKey !== "your_gemini_api_key_here") {
    try {
      console.log("🤖 Invoking Google Gemini AI API for structured policy extraction...");
      return await callGeminiAPI(rawText, geminiKey.trim());
    } catch (err) {
      console.warn("⚠️ Gemini AI Extraction failed/fallback:", err.message);
      console.log("🔄 Using deterministic insurance policy parser...");
      return parsePolicyDeterministic(rawText);
    }
  }

  // No Gemini API key provided — use deterministic fallback parser
  return parsePolicyDeterministic(rawText);
}

/**
 * Generate Human-Readable Policy Summary with Strict Disclaimers
 */
function generatePolicySummary(structuredPolicy) {
  const p = structuredPolicy;
  const lines = [];

  lines.push(p.executiveSummary || "The uploaded document was analyzed for explicit coverage terms. Review the details below and confirm unclear conditions with the insurer.");
  lines.push("");

  lines.push(`• Insurer: ${p.insurer || "Not specified / Unknown"}`);
  lines.push(`• Policy Type: ${p.policyType || "Not specified / Unknown"}`);
  lines.push(`• Policy Number: ${p.policyNumber || "Not specified / Unknown"}`);
  lines.push(`• Sum Insured: ${p.sumInsured ? `₹${p.sumInsured.toLocaleString("en-IN")}` : "Not specified / Unknown"}`);
  lines.push(`• Room Eligibility: ${p.roomEligibility || "Not specified / Unknown"}`);

  if (p.networkRequirement === true) {
    lines.push("• Network Requirement: Network hospital required for cashless claims");
  } else if (p.networkRequirement === false) {
    lines.push("• Network Requirement: No strict network hospital restriction");
  } else {
    lines.push("• Network Requirement: Not specified / Unknown");
  }

  if (p.cashlessAvailable === true) {
    lines.push("• Cashless Availability: Cashless facility available at empanelled network hospitals");
  } else if (p.cashlessAvailable === false) {
    lines.push("• Cashless Availability: Reimbursement basis only (Cashless not available)");
  } else {
    lines.push("• Cashless Availability: Not specified / Unknown");
  }

  lines.push(`• Pre-Hospitalization Coverage: ${p.preHospitalizationDays ? `${p.preHospitalizationDays} days` : "Not specified"}`);
  lines.push(`• Post-Hospitalization Coverage: ${p.postHospitalizationDays ? `${p.postHospitalizationDays} days` : "Not specified"}`);

  if (p.exclusions && p.exclusions.length > 0) {
    lines.push("\nImportant Exclusions Identified:");
    p.exclusions.forEach((ex) => lines.push(`  - ${ex}`));
  } else {
    lines.push("\nImportant Exclusions: None explicitly identified in sample text.");
  }

  if (p.waitingPeriods && p.waitingPeriods.length > 0) {
    lines.push("\nWaiting Periods:");
    p.waitingPeriods.forEach((wp) => lines.push(`  - ${wp}`));
  }

  if (p.importantClauses && p.importantClauses.length > 0) {
    lines.push("\nKey Policy Clauses:");
    p.importantClauses.forEach((cl) => lines.push(`  - ${cl}`));
  }

  if (p.financialConditions && p.financialConditions.length > 0) {
    lines.push("\nFinancial Conditions:");
    p.financialConditions.forEach((item) => lines.push(`  - ${item}`));
  }

  if (p.claimRequirements && p.claimRequirements.length > 0) {
    lines.push("\nClaim and Admission Requirements:");
    p.claimRequirements.forEach((item) => lines.push(`  - ${item}`));
  }

  if (p.verificationItems && p.verificationItems.length > 0) {
    lines.push("\nVerify Before Treatment:");
    p.verificationItems.forEach((item) => lines.push(`  - ${item}`));
  }

  const summaryText = lines.join("\n");

  const disclaimerText =
    "NOTICE & SAFETY DISCLAIMER:\n" +
    "Your uploaded policy states the above extracted parameters. This system provides informational policy intelligence and DOES NOT provide medical diagnosis, treatment recommendations, medical decisions, guaranteed insurance coverage, or binding insurance advice. Please verify all details directly with your insurer and hospital prior to hospital admission.";

  return {
    summaryText,
    disclaimerText,
  };
}

/**
 * Main Entry Point for Policy Analysis
 * @param {string} rawText - Text extracted from uploaded PDF
 * @returns {object} - { structuredPolicy, summaryText, disclaimerText, rawTextLength, nullFields }
 */
async function analyzePolicy(rawText) {
  const structuredPolicy = await extractPolicyWithAI(rawText);
  const { summaryText, disclaimerText } = generatePolicySummary(structuredPolicy);

  // Audit null / unavailable fields
  const nullFields = Object.keys(structuredPolicy).filter((key) => {
    const val = structuredPolicy[key];
    if (val === null) return true;
    if (Array.isArray(val) && val.length === 0) return true;
    return false;
  });

  return {
    structuredPolicy,
    summaryText,
    disclaimerText,
    rawTextLength: rawText ? rawText.length : 0,
    nullFields,
  };
}

module.exports = {
  analyzePolicy,
  parsePolicyDeterministic,
  generatePolicySummary,
  createEmptyPolicySchema,
};
