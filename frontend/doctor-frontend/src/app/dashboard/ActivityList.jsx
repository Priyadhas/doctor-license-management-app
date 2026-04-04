import { User } from "lucide-react";

const activities = [
  {
    text: "Dr. John Smith’s license renewed",
    color: "blue",
  },
  {
    text: "Dr. Sarah Lee added",
    color: "green",
  },
  {
    text: "Dr. Mark Davis license expired",
    color: "red",
  },
];

export default function ActivityList() {
  return (
    <div
      className="
  rounded-2xl p-6

  bg-white/60 backdrop-blur-2xl border border-white/40   

  shadow-xl hover:shadow-2xl                              

  transition-all duration-300
"
    >
      <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>

      <div className="space-y-4">
        {activities.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-xl

  hover:bg-white/70                                      

  transition-all duration-200"
          >
            {/* LEFT */}
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 flex items-center justify-center rounded-full
                ${
                  item.color === "blue"
                    ? "bg-blue-100 text-blue-600"
                    : item.color === "green"
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-500"
                }`}
              >
                <User size={16} />
              </div>

              <p className="text-sm text-gray-700">{item.text}</p>
            </div>

            {/* RIGHT */}
            <button className="text-sm text-gray-400 hover:text-blue-600">
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
