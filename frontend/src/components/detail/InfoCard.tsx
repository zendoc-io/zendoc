import Link from "next/link";

type InfoItem = {
  label: string;
  value:
    | string
    | number
    | boolean
    | Date
    | Record<string, unknown>
    | unknown[]
    | undefined
    | null;
  link?: string;
};

type Props = {
  title: string;
  items: InfoItem[];
  className?: string;
};

const formatValue = (value: InfoItem["value"]) => {
  if (value === null || value === undefined) return "—";
  if (value instanceof Date) return value.toLocaleString();
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

export default function InfoCard({ title, items, className = "" }: Props) {
  return (
    <div
      className={`rounded-lg border border-gray-700 bg-gray-800 p-6 ${className}`}
    >
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item, idx) => {
          const displayValue = formatValue(item.value);

          return (
            <div key={idx}>
              <p className="mb-1 text-xs text-gray-400">{item.label}</p>
              {item.link ? (
                <Link
                  href={item.link}
                  className="text-sm text-blue-400 hover:underline"
                >
                  {displayValue}
                </Link>
              ) : (
                <p className="text-sm text-white">{displayValue}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

