/**
 * Page 1: Insurance Policy Upload
 * SehatSure - Policy-Integrated Care Planning
 * Clean drag-and-drop PDF upload with progress feedback and policy analysis trigger.
 */

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";
import WorkflowStepper from "../components/WorkflowStepper";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      toast.error("Only PDF policy documents are supported");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB");
      return;
    }

    setFile(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    handleFileSelect(dropped);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select an insurance policy PDF first");
      return;
    }

    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("policy", file);

    try {
      const res = await api.post("/policy/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percent);
        },
      });

      toast.success("Insurance policy analyzed successfully!");
      navigate(`/policy/${res.data.policy.id}`);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Policy upload failed. Please try again."
      );
      setUploading(false);
      setProgress(0);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      <WorkflowStepper currentStep={1} />
      <div className="page-container max-w-2xl py-10">
        {/* Page header */}
        <div className="mb-8">
          <p className="eyebrow">Step 1 of 5 · Policy Analysis</p>
          <h1 className="page-title mt-2">
            Understand your coverage before you choose a hospital
          </h1>
          <p className="page-desc">
            Upload your insurance policy and we will turn complex policy language
            into a simple coverage summary.
          </p>
        </div>

        {/* Upload dropzone */}
        <div className="glass rounded-lg p-4 sm:p-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (!file && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            className={`flex cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors ${
              dragging
                ? "border-primary bg-primary-tint/70"
                : file
                ? "border-primary-edge bg-white/50"
                : "border-line-strong bg-white/40 hover:border-primary/60 hover:bg-white/60"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files[0])}
            />

            {file ? (
              <>
                <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-line bg-white/80">
                  <svg
                    className="h-6 w-6 text-slate-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                    <path d="M14 3v5h5" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-900">{file.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {formatSize(file.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="text-xs font-medium text-slate-500 transition-colors hover:text-red-700"
                >
                  Remove file
                </button>
              </>
            ) : (
              <>
                <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-line bg-white/80">
                  <svg
                    className="h-6 w-6 text-slate-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 16V4m-4 4l4-4 4 4" />
                    <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {dragging
                      ? "Drop your policy PDF to upload"
                      : "Drop your policy PDF here or browse files"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    PDF documents only · Max 10MB
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Upload progress */}
          {uploading && (
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-600">
                <span>
                  {progress < 100
                    ? "Analyzing policy..."
                    : "Extracting coverage details..."}
                </span>
                <span className="tabular-nums">{progress}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {progress === 100 && (
                <p className="mt-2 text-center text-xs text-slate-500">
                  Extracting structured insurance terms and constraints...
                </p>
              )}
            </div>
          )}

          {/* Action */}
          <button
            type="button"
            onClick={handleUpload}
            disabled={!file || uploading}
            className="btn-primary mt-5 w-full"
          >
            {uploading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Processing Policy...
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
                  <path d="M9 12l2 2 4-4" />
                  <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                </svg>
                Analyze Insurance Policy
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}