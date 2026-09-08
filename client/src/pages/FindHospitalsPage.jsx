/**
 * Page 3: Find Suitable Hospitals
 * SehatSure - Policy-Integrated Care Planning
 * Search form for care specialty category across the nationwide PM-JAY dataset.
 */

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";
import WorkflowStepper from "../components/WorkflowStepper";

export default function FindHospitalsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const policyIdFromUrl = searchParams.get("policyId") || "";
  const [policyId, setPolicyId] = useState(policyIdFromUrl);
  const [userPolicies, setUserPolicies] = useState([]);
  const [locations, setLocations] = useState([]);
  const [specialties, setSpecialties] = useState([
    "Oncology",
    "Cardiology",
    "Orthopaedics",
    "General Medicine",
    "General Surgery",
    "ENT",
    "Paediatrics",
    "Obstetrics & Gynaecology",
    "Neurology",
    "Critical Care",
  ]);

  const [selectedSpecialty, setSelectedSpecialty] = useState("Oncology");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch available policies and specialties
    const fetchData = async () => {
      try {
        const [polRes, specRes, locationRes] = await Promise.allSettled([
          api.get("/policy/history"),
          api.get("/hospitals/specialties"),
          api.get("/hospitals/locations"),
        ]);

        if (polRes.status === "fulfilled" && polRes.value.data?.policies) {
          const pols = polRes.value.data.policies;
          setUserPolicies(pols);
          if (!policyId && pols.length > 0) {
            setPolicyId(pols[0]._id);
          }
        }

        if (specRes.status === "fulfilled" && specRes.value.data?.specialties) {
          if (specRes.value.data.specialties.length > 0) {
            setSpecialties(specRes.value.data.specialties);
          }
        }

        if (locationRes.status === "fulfilled" && locationRes.value.data?.locations) {
          setLocations(locationRes.value.data.locations);
        }
      } catch (err) {
        console.error("Fetch search parameters error:", err);
      }
    };

    fetchData();
  }, [policyId]);

  const handleSearch = (e) => {
    e.preventDefault();

    if (!policyId) {
      toast.error("Please select or upload an insurance policy first");
      return;
    }

    setLoading(true);

    const queryParams = new URLSearchParams({
      policyId,
      specialty: selectedSpecialty,
    });
    if (selectedLocation) {
      const [state, district] = selectedLocation.split("::");
      queryParams.set("state", state);
      queryParams.set("district", district);
    }

    navigate(`/hospital-results?${queryParams.toString()}`);
  };

  return (
    <div>
      <WorkflowStepper currentStep={3} policyId={policyId} />
      <div className="page-container max-w-2xl py-10">
        {/* Header */}
        <div className="mb-8">
          <p className="eyebrow">Step 3 of 5 · Hospital Matching Criteria</p>
          <h1 className="page-title mt-2">Find suitable hospitals</h1>
          <p className="page-desc">
            Search the complete PM-JAY hospital dataset using your policy and
            required medical care category.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSearch} className="card space-y-6 p-6 sm:p-8">
          {/* Active policy */}
          <div>
            <label className="label" htmlFor="policy-id-select">
              Active insurance policy document <span className="text-primary-dark">*</span>
            </label>
            {userPolicies.length > 0 ? (
              <select
                id="policy-id-select"
                value={policyId}
                onChange={(e) => setPolicyId(e.target.value)}
                className="select"
              >
                {userPolicies.map((pol) => (
                  <option key={pol._id} value={pol._id}>
                    {pol.fileName} — Insurer: {pol.structuredPolicy?.insurer || "Extracted Policy"} (Sum: ₹{pol.structuredPolicy?.sumInsured ? pol.structuredPolicy.sumInsured.toLocaleString("en-IN") : "N/A"})
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-sm text-amber-800">
                  No uploaded policies found in your session.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/upload")}
                  className="btn-link whitespace-nowrap"
                >
                  + Upload Policy
                </button>
              </div>
            )}
          </div>

          {/* Specialty */}
          <div>
            <label className="label" htmlFor="specialty-input">
              Required medical care / specialty <span className="text-primary-dark">*</span>
            </label>
            <input
              id="specialty-input"
              list="hospital-specialty-options"
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              placeholder="Type a specialty, for example Dermatology"
              autoComplete="off"
              required
              className="input"
            />
            <datalist id="hospital-specialty-options">
              {specialties.map((spec) => (
                <option key={spec} value={spec} />
              ))}
            </datalist>
          </div>

          {/* Location */}
          <div>
            <label className="label" htmlFor="location-select">
              Hospital city / district
            </label>
            <select
              id="location-select"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="select"
            >
              <option value="">All cities and districts</option>
              {locations.map((location) => (
                <option
                  key={`${location.state}::${location.district}`}
                  value={`${location.state}::${location.district}`}
                >
                  {location.district}, {location.state}
                </option>
              ))}
            </select>
            <p className="form-hint">
              Choose a location to see one result per hospital in that city or
              district.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !policyId}
            className="btn-primary w-full"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Finding hospitals that fit your selected criteria...
              </>
            ) : (
              <>
                <svg
                  className="h-4 w-4 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                Find Suitable Hospitals
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}