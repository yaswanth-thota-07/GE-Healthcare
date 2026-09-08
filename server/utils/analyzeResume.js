/**
 * Resume Analysis Utility
 * Extracts skills, keywords, calculates ATS score, and suggests missing skills
 * This is a rule-based analyzer — no external AI API needed
 */

// ─── Skill Database ───────────────────────────────────────────────────────────

// Common technical skills grouped by category
const SKILL_DATABASE = {
  languages: [
    "javascript", "python", "java", "c++", "c#", "typescript", "ruby",
    "php", "swift", "kotlin", "go", "rust", "scala", "r", "matlab",
    "html", "css", "sql", "bash", "shell",
  ],
  frameworks: [
    "react", "angular", "vue", "next.js", "nuxt", "express", "django",
    "flask", "spring", "laravel", "rails", "fastapi", "nestjs", "svelte",
    "tailwind", "bootstrap", "material ui", "chakra ui",
  ],
  databases: [
    "mongodb", "mysql", "postgresql", "sqlite", "redis", "firebase",
    "dynamodb", "cassandra", "oracle", "mssql", "elasticsearch",
  ],
  cloud: [
    "aws", "azure", "gcp", "google cloud", "heroku", "vercel", "netlify",
    "docker", "kubernetes", "terraform", "jenkins", "ci/cd", "github actions",
  ],
  tools: [
    "git", "github", "gitlab", "bitbucket", "jira", "confluence",
    "figma", "postman", "linux", "agile", "scrum", "rest api", "graphql",
    "webpack", "vite", "npm", "yarn",
  ],
  soft: [
    "communication", "teamwork", "leadership", "problem solving",
    "critical thinking", "time management", "collaboration",
  ],
};

// Flatten all skills into one array for easy lookup
const ALL_SKILLS = Object.values(SKILL_DATABASE).flat();

// Skills that are highly valued and commonly expected in tech roles
const HIGH_VALUE_SKILLS = [
  "git", "docker", "rest api", "sql", "javascript", "python",
  "react", "node", "aws", "typescript", "agile",
];

// ─── Keyword Extraction ───────────────────────────────────────────────────────

/**
 * Extract important keywords from resume text
 * Filters out common stop words and short words
 */
const extractKeywords = (text) => {
  const stopWords = new Set([
    "the", "and", "for", "with", "this", "that", "have", "from",
    "are", "was", "were", "been", "has", "had", "will", "would",
    "could", "should", "may", "might", "shall", "can", "not",
    "but", "or", "nor", "so", "yet", "both", "either", "neither",
    "each", "few", "more", "most", "other", "some", "such", "than",
    "too", "very", "just", "also", "into", "onto", "upon", "about",
    "above", "after", "before", "between", "during", "through",
    "under", "while", "where", "when", "how", "what", "which", "who",
    "whom", "whose", "why", "all", "any", "both", "each", "every",
    "its", "our", "their", "your", "his", "her", "they", "them",
    "these", "those", "then", "than", "there", "here", "now",
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ") // Remove special characters
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.has(word));

  // Count word frequency
  const freq = {};
  words.forEach((word) => {
    freq[word] = (freq[word] || 0) + 1;
  });

  // Return top 20 most frequent meaningful words
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);
};

// ─── Skill Detection ──────────────────────────────────────────────────────────

/**
 * Detect which skills from our database appear in the resume text
 */
const detectSkills = (text) => {
  const lowerText = text.toLowerCase();
  return ALL_SKILLS.filter((skill) => lowerText.includes(skill));
};

// ─── ATS Score Calculation ────────────────────────────────────────────────────

/**
 * Calculate an ATS (Applicant Tracking System) compatibility score
 * Based on: skills found, keywords, resume length, and structure
 */
const calculateATSScore = (text, detectedSkills, keywords) => {
  let score = 0;

  // 1. Skills score (up to 40 points)
  const skillScore = Math.min(40, detectedSkills.length * 2);
  score += skillScore;

  // 2. High-value skills bonus (up to 20 points)
  const lowerText = text.toLowerCase();
  const highValueFound = HIGH_VALUE_SKILLS.filter((skill) =>
    lowerText.includes(skill)
  );
  const highValueScore = Math.min(20, highValueFound.length * 4);
  score += highValueScore;

  // 3. Resume length score (up to 15 points)
  // Ideal resume: 300–800 words
  const wordCount = text.split(/\s+/).length;
  if (wordCount >= 300 && wordCount <= 800) {
    score += 15;
  } else if (wordCount >= 150) {
    score += 8;
  } else {
    score += 3;
  }

  // 4. Keywords diversity (up to 15 points)
  const keywordScore = Math.min(15, keywords.length);
  score += keywordScore;

  // 5. Structure check — does it have common resume sections? (up to 10 points)
  const sections = ["experience", "education", "skills", "projects", "summary", "objective"];
  const foundSections = sections.filter((s) => lowerText.includes(s));
  score += Math.min(10, foundSections.length * 2);

  return Math.min(100, Math.round(score)); // Cap at 100
};

// ─── Missing Skills Suggestion ────────────────────────────────────────────────

/**
 * Suggest important skills that are missing from the resume
 */
const suggestMissingSkills = (detectedSkills) => {
  const detected = new Set(detectedSkills.map((s) => s.toLowerCase()));

  // Find high-value skills that are not in the resume
  const missing = HIGH_VALUE_SKILLS.filter((skill) => !detected.has(skill));

  // Also suggest some common framework/tool skills if missing
  const commonMissing = ["docker", "kubernetes", "typescript", "graphql", "redis"]
    .filter((skill) => !detected.has(skill));

  // Combine and deduplicate, return top 8
  const allMissing = [...new Set([...missing, ...commonMissing])];
  return allMissing.slice(0, 8);
};

// ─── Generate Feedback ────────────────────────────────────────────────────────

/**
 * Generate a short human-readable feedback summary
 */
const generateFeedback = (atsScore, detectedSkills, missingSkills, wordCount) => {
  let feedback = "";

  if (atsScore >= 80) {
    feedback = "Excellent resume! Strong ATS compatibility with a great mix of skills and keywords.";
  } else if (atsScore >= 60) {
    feedback = "Good resume with solid skills coverage. A few improvements can boost your ATS score.";
  } else if (atsScore >= 40) {
    feedback = "Average resume. Consider adding more relevant technical skills and expanding your experience section.";
  } else {
    feedback = "Resume needs improvement. Add more skills, keywords, and structured sections to improve ATS compatibility.";
  }

  if (wordCount < 200) {
    feedback += " Your resume seems too short — consider adding more detail to your experience and projects.";
  }

  if (missingSkills.length > 0) {
    feedback += ` Consider adding: ${missingSkills.slice(0, 4).join(", ")}.`;
  }

  return feedback;
};

// ─── Main Analyzer Function ───────────────────────────────────────────────────

/**
 * Main function that runs all analysis on extracted resume text
 * @param {string} text - Raw text extracted from the PDF
 * @returns {object} - Full analysis result
 */
const analyzeResume = (text) => {
  const detectedSkills = detectSkills(text);
  const keywords = extractKeywords(text);
  const missingSkills = suggestMissingSkills(detectedSkills);
  const atsScore = calculateATSScore(text, detectedSkills, keywords);
  const wordCount = text.split(/\s+/).length;
  const feedback = generateFeedback(atsScore, detectedSkills, missingSkills, wordCount);

  return {
    detectedSkills,
    keywords,
    missingSkills,
    atsScore,
    feedback,
    wordCount,
  };
};

module.exports = analyzeResume;
