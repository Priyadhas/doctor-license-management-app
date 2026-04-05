import { Users, Activity, AlertTriangle } from "lucide-react";

export default function StatsCard({ title, value, type }) {
  const styles = {
    primary: {
      text: "text-blue-700",
      wave: "from-blue-200/60 to-blue-100/20",
      glow: "bg-blue-400/20",
      iconBg: "bg-blue-500/10",
      icon: <Users size={20} />,
    },
    success: {
      text: "text-green-700",
      wave: "from-green-200/60 to-green-100/20",
      glow: "bg-green-400/20",
      iconBg: "bg-green-500/10",
      icon: <Activity size={20} />,
    },
    danger: {
      text: "text-red-600",
      wave: "from-red-200/60 to-red-100/20",
      glow: "bg-red-400/20",
      iconBg: "bg-red-500/10",
      icon: <AlertTriangle size={20} />,
    },
  };

  const current = styles[type] || styles.primary;

  return (
    <div
      className="
        relative overflow-hidden rounded-2xl p-6
        bg-white/60 backdrop-blur-2xl
        border border-white/40

        shadow-lg hover:shadow-2xl
        hover:-translate-y-1

        transition-all duration-300
        group
      "
    >
      <div
        className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl ${current.glow} opacity-50 group-hover:scale-125 transition`}
      />

      <div
        className={`
          absolute bottom-0 left-0 w-full h-24
          bg-gradient-to-r ${current.wave}
          opacity-70
        `}
        style={{
          clipPath:
            "path('M0,40 C150,80 300,0 500,40 L500,100 L0,100 Z')",
        }}
      />

      {/* CONTENT */}
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>

          <h2
            className={`text-4xl font-extrabold tracking-tight ${current.text}`}
          >
            {value}
          </h2>
        </div>

        {/* ICON */}
        <div
          className={`
            p-3 rounded-xl ${current.iconBg} ${current.text}
            backdrop-blur-md border border-white/30

            group-hover:scale-110
            transition
          `}
        >
          {current.icon}
        </div>
      </div>

      {/*  GLASS SHINE */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none rounded-2xl" />
    </div>
  );
}