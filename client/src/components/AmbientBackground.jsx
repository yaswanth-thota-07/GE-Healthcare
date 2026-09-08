/**
 * AmbientBackground Component
 * SehatSure - Policy-Integrated Care Planning
 * Fixed full-viewport ambient pastel liquid video layer with a soft white
 * wash scrim so page content stays bright and readable. Purely decorative.
 */

import { useCallback, useEffect, useRef } from "react";

const VIDEO_SRC =
  "https://zxdefgavgwfxastwmmjm.supabase.co/storage/v1/object/public/assets/flux.mp4";

export default function AmbientBackground() {
  const videoRef = useRef(null);

  const kickPlay = useCallback(() => {
    const video = videoRef.current;
    if (video && typeof video.play === "function") {
      video.play().catch(() => {});
    }
  }, []);

  useEffect(() => {
    kickPlay();
    window.addEventListener("load", kickPlay);
    return () => window.removeEventListener("load", kickPlay);
  }, [kickPlay]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <video
        ref={videoRef}
        src={VIDEO_SRC}
        autoPlay
        muted
        loop
        playsInline
        onCanPlay={kickPlay}
        className="ambient-video absolute inset-0 h-full w-full scale-[1.06] object-cover blur-[2px] saturate-[1.06]"
        aria-hidden="true"
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 44%, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.80) 30%, rgba(255,255,255,0.46) 58%, rgba(255,255,255,0.20) 100%)",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 18%, rgba(255,255,255,0) 82%, rgba(255,255,255,0.90) 100%)",
        }}
      />

      <div
        className="absolute"
        style={{
          left: "50%",
          top: "46%",
          width: "640px",
          height: "640px",
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(circle, rgba(124,108,255,0.10) 0%, transparent 62%)",
          filter: "blur(40px)",
        }}
        aria-hidden="true"
      />
    </div>
  );
}