export default function StatsCard({ title, value, type }) {
  const styles = {
    primary: "text-blue-600",
    success: "text-green-600",
    danger: "text-red-500",
  };

  return (
    <div
      className="
  relative overflow-hidden rounded-2xl p-6

  bg-white/60 backdrop-blur-2xl border border-white/40   

  shadow-xl hover:shadow-2xl                              

  transition-all duration-300 hover:scale-[1.02]          
"
    >
      {/* GRADIENT WAVE */}
      <div
        className="absolute bottom-0 left-0 w-full h-16 
      bg-gradient-to-r from-blue-200/30 to-transparent rounded-b-2xl"
      />

      {/* CONTENT */}
      <p className="text-sm text-gray-500 mb-2">{title}</p>

      <h2 className={`text-3xl font-bold ${styles[type]}`}>{value}</h2>
    </div>
  );
}
