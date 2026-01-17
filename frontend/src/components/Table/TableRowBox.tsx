import React from "react";

type Props = {
  backgroundColor: string;
  name: string;
};

export default function TableRowBox({ backgroundColor, name }: Props) {
  return (
    <div className="w-fit rounded-lg p-2 px-4" style={{ backgroundColor }}>
      {name}
    </div>
  );
}
