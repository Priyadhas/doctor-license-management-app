export default function Badge({ status }) {
  const color =
    status === "Active"
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";

  return (
    <span className={`px-2 py-1 text-xs rounded ${color}`}>
      {status}
    </span>
  );
}