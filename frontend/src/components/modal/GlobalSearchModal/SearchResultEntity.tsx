import Link from "next/link";

type Props = {
  name: string;
  description: string;
  link: string;
  icon: React.ReactNode;
};

export default function SearchResultEntity({
  name,
  description,
  link,
  icon,
}: Props) {
  return (
    <Link
      href={link}
      className="flex w-full items-center gap-2 rounded-lg p-3 transition-colors duration-100 hover:bg-gray-700"
    >
      <div className="flex aspect-square h-10 w-10 items-center justify-center rounded-full bg-gray-600">
        {icon}
      </div>
      <div>
        <p>{name}</p>
        <span className="text-sm text-gray-500">{description}</span>
      </div>
    </Link>
  );
}
