import React from "react";

export default function FormInput({
  label,
  type = "text",
  placeholder = "",
  value,
  onChange,
  required = false,
  dataTest,
}) {
  return (
    <div className="flex flex-col gap-1 mb-4">
      <label className="font-medium text-gray-700">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="border rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        data-test={dataTest}
      />
    </div>
  );
}
