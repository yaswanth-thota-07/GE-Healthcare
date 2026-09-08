/**
 * Hospital Controller
 * Precision Care Challenge 2026 - Hospitality
 *
 * Connects uploaded insurance policy constraints with deterministic hospital ranking engine
 */

const mongoose = require("mongoose");
const Policy = require("../models/Policy");
const { searchAndRankHospitals } = require("../utils/hospitalService");

/**
 * GET /api/hospitals/search
 * Search & rank nationwide hospitals based on specialty and policy constraints
 */
const searchHospitals = async (req, res) => {
  try {
    const {
      policyId,
      specialty,
      requiredSpecialty,
      state,
      district,
    } = req.query;

    // 1. Validate policyId presence
    if (!policyId) {
      return res.status(400).json({
        message: "policyId is required to run policy-aware hospital matching",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(policyId)) {
      return res.status(400).json({
        message: "Invalid policyId format",
      });
    }

    // 2. Fetch Policy from MongoDB or in-memory map
    let policyDoc = null;
    if (mongoose.connection.readyState === 1) {
      try {
        policyDoc = await Policy.findById(policyId);
      } catch (err) {}
    }

    if (!policyDoc) {
      const { inMemoryPoliciesMap } = require("./policyController");
      if (inMemoryPoliciesMap && inMemoryPoliciesMap.has(policyId)) {
        policyDoc = inMemoryPoliciesMap.get(policyId);
      } else {
        // Construct default active policy doc for query
        policyDoc = {
          _id: policyId,
          structuredPolicy: {
            insurer: "Star Health & Allied Insurance Co Ltd",
            policyType: "Comprehensive Health Policy",
            sumInsured: 1000000,
            roomEligibility: "Single Private AC Room",
            networkRequirement: true,
            cashlessAvailable: true,
          },
        };
      }
    }

    const structuredPolicy = policyDoc.structuredPolicy || {};

    // 3. Extract policy constraints
    const policyConstraints = {
      networkRequired: structuredPolicy.networkRequirement,
      roomEligibility: structuredPolicy.roomEligibility,
      cashlessAvailable: structuredPolicy.cashlessAvailable,
      sumInsured: structuredPolicy.sumInsured,
    };

    // 4. Build nationwide search params. Coordinates are intentionally ignored.
    const reqSpec = requiredSpecialty || specialty || "";

    const searchParams = {
      requiredSpecialty: reqSpec,
      state: state || null,
      district: district || null,
      policyConstraints,
    };

    // 5. Run nationwide hospital search and ranking.
    const results = searchAndRankHospitals(searchParams);
    const localResultCount = results.filter((result) => result.isSelectedLocation).length;
    const nationwideAlternativeCount = results.length - localResultCount;

    // 6. Build structured API response
    return res.json({
      searchContext: {
        specialty: reqSpec || "All Specialties",
        state: state || null,
        district: district || null,
        geographicScope: district || state ? "Selected city/district" : "Nationwide",
        localResultCount,
        nationwideAlternativeCount,
      },
      policyContext: {
        policyId: policyDoc._id,
        insurer: structuredPolicy.insurer || "Unknown",
        policyType: structuredPolicy.policyType || "Unknown",
        roomEligibility: structuredPolicy.roomEligibility || "Not specified",
        networkRequirement: structuredPolicy.networkRequirement !== null ? structuredPolicy.networkRequirement : "Neutral",
        cashlessAvailable: structuredPolicy.cashlessAvailable !== null ? structuredPolicy.cashlessAvailable : "Unknown",
        sumInsured: structuredPolicy.sumInsured || null,
      },
      syntheticDataNotice:
        "DATA NOTICE: Hospital names, locations, specialties, and ratings come from the supplied PM-JAY dataset. Network compatibility, indicative costs, and room options are comparison estimates and must be verified with the hospital and insurer.",
      safetyDisclaimer:
        "SAFETY DISCLAIMER: This system provides policy-integrated decision support intelligence and DOES NOT provide medical diagnosis, treatment recommendations, medical decisions, guaranteed insurance coverage, or binding reimbursement commitments. Please confirm network status and coverage directly with your insurer and hospital prior to admission.",
      totalFound: results.length,
      results,
    });
  } catch (error) {
    console.error("Hospital search error:", error.message);
    return res.status(500).json({
      message: "Failed to perform hospital search",
      error: error.message,
    });
  }
};

/**
 * GET /api/hospitals/specialties
 * Return all unique specialties extracted from the dataset
 */
const getSpecialties = async (req, res) => {
  try {
    const { getAllSpecialties } = require("../utils/hospitalService");
    const specialties = getAllSpecialties();
    res.json({ specialties });
  } catch (error) {
    console.error("Specialties fetch error:", error.message);
    res.status(500).json({ message: "Failed to fetch specialties" });
  }
};

const getLocations = async (req, res) => {
  try {
    const { getHospitalLocations } = require("../utils/hospitalService");
    res.json({ locations: getHospitalLocations() });
  } catch (error) {
    console.error("Hospital locations fetch error:", error.message);
    res.status(500).json({ message: "Failed to fetch hospital locations" });
  }
};

module.exports = {
  searchHospitals,
  getSpecialties,
  getLocations,
};
