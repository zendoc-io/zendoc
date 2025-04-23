"use client";
import BaseInput from "@/components/inputs/BaseInput";
import SearchIcon from "@/../public/icons/search.svg";
import FilterIcon from "@/../public/icons/filter.svg";
import BaseButton from "@/components/BaseButton";
import ChevronIcon from "@/../public/icons/chevron.svg";
import TableViewIcon from "@/../public/icons/table-view.svg";
import PencilIcon from "@/../public/icons/pencil.svg";
import { useEffect, useState } from "react";
import { CellValue, TableHeader } from "@/components/Table/Table";
import EditViewModal from "@/components/modal/EditViewModal";
import BaseTable from "@/components/Table/BaseTable";

export default function ServerPage() {
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
      key: "name",
      name: "Name",
      sort: "asc",
      show: true,
      type: "link",
    },
    {
      key: "test",
      name: "Test",
      sort: null,
      show: false,
      type: "text",
    },
    {
      key: "status",
      name: "Status",
      sort: null,
      show: true,
      type: "box",
    },
    {
      key: "ip",
      name: "IP",
      sort: null,
      show: true,
      type: "text",
    },
    {
      key: "role",
      name: "Role",
      sort: null,
      show: true,
      type: "box",
    },
    {
      key: "os",
      name: "OS",
      sort: null,
      show: true,
      type: "os",
    },
    {
      key: "vms",
      name: "VMs",
      sort: null,
      show: true,
      type: "link",
    },
    {
      key: "services",
      name: "Services",
      sort: null,
      show: true,
      type: "link",
    },
  ]);

  const initialTableData: CellValue[][] = [
    [
      { text: 1 },
      {
        text: "Server 1",
        link: "/app/infrastructure/servers",
      },
      { text: "Test" },
      {
        text: "Online",
        color: "green",
      },
      { text: "192.168.1.42" },
      {
        text: "Application server",
        color: "#FF9F0A",
      },
      {
        text: "Ubuntu 22.04 LTS",
        type: "linux",
      },
      {
        text: 3,
        link: "/app/infrastructure/vms",
      },
      {
        text: 5,
        link: "/app/infrastructure/services",
      },
    ],
    [
      { text: 2 },
      {
        text: "Server 2",
        link: "/app/infrastructure/servers",
      },
      { text: "Test" },
      {
        text: "Offline",
        color: "orange",
      },
      { text: "192.168.1.43" },
      {
        text: "Application server",
        color: "#AF00FF",
      },
      {
        text: "Ubuntu 22.04 LTS",
        type: "linux",
      },
      {
        text: 3,
        link: "/app/infrastructure/vms",
      },
      {
        text: 5,
        link: "/app/infrastructure/services",
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
      <h1 className="mb-6 text-2xl">Servers</h1>
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
              Status
            </BaseButton>
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
      <div className="rounded-lg border border-gray-700">
        <BaseTable
          data={initialTableData}
          headers={tableHeaders}
          setTableHeaders={setTableHeaders}
        />
      </div>
    </div>
  );
}
