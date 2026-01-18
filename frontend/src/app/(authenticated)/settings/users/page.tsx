"use client";
import BaseInput from "@/components/inputs/BaseInput";
import SearchIcon from "@/../public/icons/search.svg";
import FilterIcon from "@/../public/icons/filter.svg";
import BaseButton from "@/components/BaseButton";
import ChevronIcon from "@/../public/icons/chevron.svg";
import TableViewIcon from "@/../public/icons/table-view.svg";
import PencilIcon from "@/../public/icons/pencil.svg";
import { useState } from "react";
import { CellValue, TableHeader } from "@/components/Table/Table";
import EditViewModal from "@/components/modal/EditViewModal";
import BaseTable from "@/components/Table/BaseTable";
import MobileTableWarning from "@/components/MobileTableWarning";

export default function UserPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tableHeaders, setTableHeaders] = useState<TableHeader[]>([
    {
      key: "id",
      name: "ID",
      sort: null,
      show: false,
      type: "text",
    },
    {
      key: "username",
      name: "Username",
      sort: "asc",
      show: true,
      type: "link",
    },
    {
      key: "role",
      name: "Role",
      sort: null,
      show: true,
      type: "box",
    },
    {
      key: "firstName",
      name: "First name",
      sort: null,
      show: true,
      type: "text",
    },
    {
      key: "lastName",
      name: "Last name",
      sort: null,
      show: true,
      type: "text",
    },
    {
      key: "lastSession",
      name: "Last session",
      sort: null,
      show: true,
      type: "text",
    },
  ]);

  const initialTableData: CellValue[][] = [
    [
      { text: 1 },
      {
        text: "TimWitzdam",
        link: "/settings/users/1",
      },
      {
        text: "Administrator",
        color: "green",
      },
      { text: "Tim" },
      { text: "Witzdam" },
      {
        text: "2023-10-01 12:00",
        type: "datetime",
      },
    ],
  ];

  return (
    <div className="p-3">
      {isModalOpen && (
        <EditViewModal
          tableHeaders={tableHeaders}
          onClose={() => setIsModalOpen(false)}
          setTableHeaders={setTableHeaders}
        />
      )}
      <h1 className="mb-6 text-2xl">Users</h1>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BaseInput
            placeholder="Search"
            leftIcon={<SearchIcon width={12} />}
            className="h-10"
          />
          <BaseButton
            icon={<FilterIcon width={12} />}
            type="icon"
            className="h-10 text-gray-500"
          >
            Filter
          </BaseButton>
          <div className="relative flex items-center gap-3">
            <span className="absolute -top-5 left-0 text-xs">
              Quick filters:
            </span>
            <BaseButton
              icon={<ChevronIcon width={12} />}
              type="icon"
              iconPosition="right"
              className="h-10 text-gray-500"
            >
              Role
            </BaseButton>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <BaseButton
            icon={<ChevronIcon width={12} />}
            type="icon"
            iconPosition="right"
            className="h-10"
          >
            <TableViewIcon width={16} />
          </BaseButton>
          <BaseButton
            icon={<PencilIcon width={12} />}
            type="icon"
            className="h-10 text-gray-500"
            onClick={() => setIsModalOpen(true)}
          >
            Edit view
          </BaseButton>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <div className="rounded-lg border border-gray-700">
          <BaseTable
            data={initialTableData}
            headers={tableHeaders}
            setTableHeaders={setTableHeaders}
          />
        </div>
      </div>

      {/* Mobile Warning */}
      <div className="md:hidden">
        <MobileTableWarning />
      </div>
    </div>
  );
}
