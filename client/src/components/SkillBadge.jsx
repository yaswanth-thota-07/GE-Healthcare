/**
 * SkillBadge Component
 * Renders a single skill tag with color variants
 */

export default function SkillBadge({ skill, variant = "detected" }) {
  const styles = {
    detected: "border-primary-edge bg-primary-tint text-primary-darker",
    missing: "border-red-200 bg-red-50 text-red-700",
    keyword: "border-blue-200 bg-blue-50 text-blue-800",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium ${styles[variant]}`}
    >
      {variant === "missing" && <span className="mr-1">+</span>}
      {skill}
    </span>
  );
}