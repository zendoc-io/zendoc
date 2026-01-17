export type CellType = "text" | "link" | "box" | "os";

export interface TableHeader {
  key: string;
  name: string;
  sort: "asc" | "desc" | null;
  show: boolean;
  type: CellType;
}

export interface BoxValue {
  text: string | number;
  color: string;
}

export interface OsValue {
  text: string | number;
  type: string;
}

export interface LinkValue {
  text: string | number;
  link: string;
}

export type CellValue =
  | { text: string | number }
  | { text: string | number; link: string }
  | { text: string | number; color: string }
  | { text: string | number; type: string };
