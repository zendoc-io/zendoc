import Link from "next/link";
import React from "react";

type Props = {
  href: string;
  name: string | number;
};

export default function TableRowLink({ href, name }: Props) {
  return (
    <Link href={href} className="text-blue-400 hover:underline">
      {name}
    </Link>
  );
}
