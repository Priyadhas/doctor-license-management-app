export default function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
}