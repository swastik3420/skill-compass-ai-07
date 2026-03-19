import { motion } from "framer-motion";
import { Fingerprint } from "lucide-react";

interface SkillResult {
  skill: string;
  score: number;
  level: string;
}

interface SkillFingerprintProps {
  results: SkillResult[];
}

const SkillFingerprint = ({ results }: SkillFingerprintProps) => {
  const numSkills = results.length;
  const angleStep = (2 * Math.PI) / numSkills;
  const maxRadius = 120;
  const centerX = 160;
  const centerY = 160;

  // Build the polygon path for the skill scores
  const points = results.map((r, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const radius = (r.score / 100) * maxRadius;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });

  const polygonPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  // Background grid circles
  const gridLevels = [25, 50, 75, 100];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "hsl(var(--success))";
    if (score >= 60) return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-card rounded-2xl shadow-lg p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <Fingerprint className="w-6 h-6 text-accent" />
        <h3 className="text-xl font-semibold text-foreground">Skill Fingerprint</h3>
      </div>

      <div className="flex justify-center">
        <svg viewBox="0 0 320 320" className="w-full max-w-[320px]">
          {/* Grid circles */}
          {gridLevels.map((level) => (
            <circle
              key={level}
              cx={centerX}
              cy={centerY}
              r={(level / 100) * maxRadius}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity={0.5}
            />
          ))}

          {/* Axis lines and labels */}
          {results.map((r, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const endX = centerX + maxRadius * Math.cos(angle);
            const endY = centerY + maxRadius * Math.sin(angle);
            const labelX = centerX + (maxRadius + 28) * Math.cos(angle);
            const labelY = centerY + (maxRadius + 28) * Math.sin(angle);

            return (
              <g key={r.skill}>
                <line
                  x1={centerX}
                  y1={centerY}
                  x2={endX}
                  y2={endY}
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                  opacity={0.4}
                />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-muted-foreground"
                  fontSize="9"
                  fontWeight="500"
                >
                  {r.skill.length > 12 ? r.skill.slice(0, 11) + "…" : r.skill}
                </text>
              </g>
            );
          })}

          {/* Filled polygon */}
          <motion.path
            d={polygonPath}
            fill="hsl(var(--primary) / 0.15)"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
            style={{ transformOrigin: `${centerX}px ${centerY}px` }}
          />

          {/* Data points */}
          {points.map((p, i) => (
            <motion.circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="5"
              fill={getScoreColor(results[i].score)}
              stroke="hsl(var(--card))"
              strokeWidth="2"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + i * 0.05 }}
            />
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {results.map((r) => (
          <div key={r.skill} className="flex items-center gap-2 text-xs">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: getScoreColor(r.score) }}
            />
            <span className="text-muted-foreground truncate">{r.skill}</span>
            <span className="font-semibold text-foreground ml-auto">{r.score}%</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default SkillFingerprint;
