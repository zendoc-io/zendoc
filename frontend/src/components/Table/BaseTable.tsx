import React, { useMemo } from "react";
import TableHeader from "./TableHeader";
import { CellValue, TableHeader as ITableHeader } from "./Table";
import TableRowBox from "./TableRowBox";
import TableRowLink from "./TableRowLink";

type Props = {
  headers: ITableHeader[];
  data: CellValue[][];
  setTableHeaders: (headers: ITableHeader[]) => void;
};

export default function BaseTable(props: Props) {
  function handleSort(index: number) {
    const newTableHeaders: ITableHeader[] = props.headers.map((header, i) => {
      if (i === index) {
        if (header.sort === "asc") {
          return {
            ...header,
            sort: "desc",
          };
        } else {
          return {
            ...header,
            sort: "asc",
          };
        }
      } else {
        return {
          ...header,
          sort: null,
        };
      }
    });

    props.setTableHeaders(newTableHeaders);
  }

  const tableData = useMemo<CellValue[][]>(() => {
    const filteredData = [...props.data];

    const sortHeader = props.headers.find((header) => header.sort !== null);

    if (sortHeader) {
      const sortIndex = props.headers.findIndex(
        (h) => h.key === sortHeader.key,
      );
      const sortDirection = sortHeader.sort;

      filteredData.sort((rowA, rowB) => {
        if (sortIndex < 0) return 0;

        const cellA = rowA[sortIndex];
        const cellB = rowB[sortIndex];

        const valueA = cellA.text;
        const valueB = cellB.text;

        if (typeof valueA === "number" && typeof valueB === "number") {
          return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
        } else {
          return sortDirection === "asc"
            ? String(valueA).localeCompare(String(valueB))
            : String(valueB).localeCompare(String(valueA));
        }
      });
    }

    return filteredData;
  }, [props.headers, props.data]);

  const renderTableCell = (header: ITableHeader, cell: CellValue) => {
    switch (header.type) {
      case "text":
        return cell.text;

      case "link":
        if (!("link" in cell)) {
          return String(cell.text);
        }
        return <TableRowLink href={cell.link} name={String(cell.text)} />;

      case "box":
        if (!("color" in cell)) {
          return String(cell.text);
        }
        return (
          <TableRowBox
            backgroundColor={cell.color}
            name={cell.text.toString()}
          />
        );

      case "os":
        if (!("type" in cell)) {
          return String(cell.text);
        }
        return (
          <div className="flex items-center gap-2">
            <img
              src={`/icons/os/${cell.type}.svg`}
              alt={cell.text.toString()}
              className="w-4"
            />
            {cell.text}
          </div>
        );

      default:
        return String(cell.text);
    }
  };

  const visibleHeaders = props.headers.filter((header) => header.show);

  return (
    <table className="w-full text-left">
      <thead className="border-b border-gray-700">
        <tr>
          <th className="p-3">
            <input type="checkbox" className="h-4 w-4" />
          </th>
          {visibleHeaders.map((header, index) => (
            <TableHeader
              key={index}
              index={props.headers.findIndex((h) => h.name === header.name)}
              name={header.name}
              sort={header.sort}
              handleSort={handleSort}
            />
          ))}
        </tr>
      </thead>
      <tbody>
        {tableData.map((row, rowIndex) => (
          <tr
            key={rowIndex}
            className={`${rowIndex + 1 !== tableData.length && "border-b"} border-gray-700`}
          >
            <td className="p-3">
              <input type="checkbox" className="h-4 w-4" />
            </td>
            {visibleHeaders.map((header, colIndex) => {
              const headerIndex = props.headers.findIndex(
                (h) => h.key === header.key,
              );
              if (headerIndex < 0 || headerIndex >= row.length) {
                return (
                  <td key={colIndex} className="p-3">
                    —
                  </td>
                );
              }

              return (
                <td key={colIndex} className="p-3">
                  {renderTableCell(header, row[headerIndex])}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
