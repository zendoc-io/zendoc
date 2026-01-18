"use client";

import BaseInput from "@/components/inputs/BaseInput";
import SearchIcon from "@/../public/icons/search.svg";
import PlusIcon from "@/../public/icons/plus.svg";
import BaseButton from "@/components/BaseButton";
import ChevronIcon from "@/../public/icons/chevron.svg";
import TableViewIcon from "@/../public/icons/table-view.svg";
import PencilIcon from "@/../public/icons/pencil.svg";
import { useState, useMemo } from "react";
import { CellValue, TableHeader } from "@/components/Table/Table";
import EditViewModal from "@/components/modal/EditViewModal";
import BaseTable from "@/components/Table/BaseTable";
import MobileTableWarning from "@/components/MobileTableWarning";
import FilterDropdown from "@/components/FilterDropdown";
import VMModal from "@/components/modal/VMModal";
import { useVMs } from "@/hooks/useVMs";
import { VM_STATUS_OPTIONS, useServerOptions } from "@/hooks/useFilterOptions";
import { vmToTableRow } from "@/utils/tableUtils";

export default function VirtualMachinesPage() {
  const [isEditViewModalOpen, setIsEditViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [hostFilter, setHostFilter] = useState<string[]>([]);

  const { options: serverOptions } = useServerOptions();

  const [tableHeaders, setTableHeaders] = useState<TableHeader[]>([
    { key: "id", name: "ID", sort: null, show: false, type: "text" },
    { key: "name", name: "Name", sort: "asc", show: true, type: "link" },
    { key: "status", name: "Status", sort: null, show: true, type: "box" },
    { key: "host", name: "Host Server", sort: null, show: true, type: "link" },
    { key: "vcpu", name: "vCPU", sort: null, show: true, type: "text" },
    { key: "ram", name: "RAM", sort: null, show: true, type: "text" },
    { key: "disk", name: "Disk", sort: null, show: true, type: "text" },
    { key: "os", name: "OS", sort: null, show: true, type: "os" },
    { key: "services", name: "Services", sort: null, show: true, type: "link" },
  ]);

  // Build filters object
  const filters = useMemo(() => {
    const f: Record<string, string> = {};
    if (searchQuery) f.name = searchQuery;
    if (statusFilter.length === 1) f.status = statusFilter[0];
    if (hostFilter.length === 1) f.hostId = hostFilter[0];
    return f;
  }, [searchQuery, statusFilter, hostFilter]);

  const { vms, isLoading, mutate } = useVMs({
    ...filters,
    sortBy: tableHeaders.find((h) => h.sort !== null)?.key,
    sortOrder: tableHeaders.find((h) => h.sort !== null)?.sort || "asc",
  });

  const tableData = useMemo(() => vms.map(vmToTableRow), [vms]);

  const hasActiveFilters = statusFilter.length > 0 || hostFilter.length > 0;

  const clearAllFilters = () => {
    setStatusFilter([]);
    setHostFilter([]);
  };

  const initialTableData: CellValue[][] = [];

  return (
    <div className="p-3">
      {isEditViewModalOpen && (
        <EditViewModal
          tableHeaders={tableHeaders}
          onClose={() => setIsEditViewModalOpen(false)}
          setTableHeaders={setTableHeaders}
        />
      )}
      {isCreateModalOpen && (
        <VMModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => mutate()}
        />
      )}

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl">Virtual Machines</h1>
        <BaseButton
          icon={<PlusIcon width={14} />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Add VM
        </BaseButton>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BaseInput
            placeholder="Search"
            leftIcon={<SearchIcon width={12} />}
            className="h-10"
            value={searchQuery}
            onChange={setSearchQuery}
          />

          <div className="relative flex items-center gap-3">
            <span className="absolute -top-5 left-0 text-xs text-gray-400">
              Filters:
            </span>
            <FilterDropdown
              label="Status"
              options={VM_STATUS_OPTIONS.map((opt) => ({
                value: opt.id,
                label: opt.name,
              }))}
              selected={statusFilter}
              onChange={setStatusFilter}
            />
            <FilterDropdown
              label="Host Server"
              options={serverOptions.map((opt) => ({
                value: opt.id,
                label: opt.name,
              }))}
              selected={hostFilter}
              onChange={setHostFilter}
            />
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-400 hover:text-white"
              >
                Clear all
              </button>
            )}
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
            onClick={() => setIsEditViewModalOpen(true)}
          >
            Edit view
          </BaseButton>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <div className="rounded-lg border border-gray-700">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : (
            <BaseTable
              data={tableData.length > 0 ? tableData : initialTableData}
              headers={tableHeaders}
              setTableHeaders={setTableHeaders}
            />
          )}
        </div>
      </div>

      {/* Mobile Warning */}
      <div className="md:hidden">
        <MobileTableWarning />
      </div>
    </div>
  );
}
