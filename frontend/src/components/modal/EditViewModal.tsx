import { TableHeader } from "../Table/Table";
import BaseModal from "./BaseModal";

type Props = {
  tableHeaders: TableHeader[];
  setTableHeaders: (headers: TableHeader[]) => void;
  onClose: () => void;
};

export default function EditViewModal({
  tableHeaders,
  setTableHeaders,
  onClose,
}: Props) {
  function toggleShowHeader(index: number): void {
    const newTableHeaders = tableHeaders.map((header, i) => {
      if (i === index) {
        return {
          ...header,
          show: !header.show,
        };
      } else {
        return header;
      }
    });

    setTableHeaders(newTableHeaders);
  }

  return (
    <BaseModal title="Edit view" onClose={onClose}>
      <div>
        {tableHeaders.map((header, index) => (
          <button
            key={index}
            className={`flex w-full cursor-pointer items-center justify-between border-t border-gray-700 p-3 transition-colors duration-50 hover:bg-gray-700 ${index + 1 !== tableHeaders.length && "border-b"}`}
            onClick={() => toggleShowHeader(index)}
          >
            <label className="cursor-pointer">{header.name}</label>
            <input
              type="checkbox"
              className="h-4 w-4 cursor-pointer"
              checked={header.show}
              readOnly
            />
          </button>
        ))}
      </div>
    </BaseModal>
  );
}
