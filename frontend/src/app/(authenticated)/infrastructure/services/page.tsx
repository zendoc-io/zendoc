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
import ServiceModal from "@/components/modal/ServiceModal";
import { useServices } from "@/hooks/useServices";
import {
  SERVICE_STATUS_OPTIONS,
  SERVICE_TYPE_OPTIONS,
  SERVICE_HEALTH_OPTIONS,
  HOST_TYPE_OPTIONS,
} from "@/hooks/useFilterOptions";
import { serviceToTableRow } from "@/utils/tableUtils";

export default function ServicesPage() {
  const [isEditViewModalOpen, setIsEditViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [healthFilter, setHealthFilter] = useState<string[]>([]);
  const [hostTypeFilter, setHostTypeFilter] = useState<string[]>([]);

  const [tableHeaders, setTableHeaders] = useState<TableHeader[]>([
    { key: "id", name: "ID", sort: null, show: false, type: "text" },
    { key: "name", name: "Name", sort: "asc", show: true, type: "link" },
    { key: "type", name: "Type", sort: null, show: true, type: "box" },
    { key: "status", name: "Status", sort: null, show: true, type: "box" },
    { key: "host", name: "Host", sort: null, show: true, type: "link" },
    { key: "port", name: "Port", sort: null, show: true, type: "text" },
    { key: "protocol", name: "Protocol", sort: null, show: true, type: "text" },
    { key: "health", name: "Health", sort: null, show: true, type: "box" },
  ]);

  // Build filters object
  const filters = useMemo(() => {
    const f: Record<string, string> = {};
    if (searchQuery) f.name = searchQuery;
    if (statusFilter.length === 1) f.status = statusFilter[0];
    if (typeFilter.length === 1) f.type = typeFilter[0];
    if (hostTypeFilter.length === 1) f.hostType = hostTypeFilter[0];
    return f;
  }, [searchQuery, statusFilter, typeFilter, hostTypeFilter]);

  const { services, isLoading, mutate } = useServices({
    ...filters,
    sortBy: tableHeaders.find((h) => h.sort !== null)?.key,
    sortOrder: tableHeaders.find((h) => h.sort !== null)?.sort || "asc",
  });

  // Filter by health client-side (not in API yet)
  const filteredServices = useMemo(() => {
    if (healthFilter.length === 0) return services;
    return services.filter((s) => healthFilter.includes(s.health));
  }, [services, healthFilter]);

  const tableData = useMemo(
    () => filteredServices.map(serviceToTableRow),
    [filteredServices]
  );

  const hasActiveFilters =
    statusFilter.length > 0 ||
    typeFilter.length > 0 ||
    healthFilter.length > 0 ||
    hostTypeFilter.length > 0;

  const clearAllFilters = () => {
    setStatusFilter([]);
    setTypeFilter([]);
    setHealthFilter([]);
    setHostTypeFilter([]);
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
        <ServiceModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => mutate()}
        />
      )}

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl">Services</h1>
        <BaseButton
          icon={<PlusIcon width={14} />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Add Service
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
              options={SERVICE_STATUS_OPTIONS.map((opt) => ({
                value: opt.id,
                label: opt.name,
              }))}
              selected={statusFilter}
              onChange={setStatusFilter}
            />
            <FilterDropdown
              label="Type"
              options={SERVICE_TYPE_OPTIONS.map((opt) => ({
                value: opt.id,
                label: opt.name,
              }))}
              selected={typeFilter}
              onChange={setTypeFilter}
            />
            <FilterDropdown
              label="Health"
              options={SERVICE_HEALTH_OPTIONS.map((opt) => ({
                value: opt.id,
                label: opt.name,
              }))}
              selected={healthFilter}
              onChange={setHealthFilter}
            />
            <FilterDropdown
              label="Host Type"
              options={HOST_TYPE_OPTIONS.map((opt) => ({
                value: opt.id,
                label: opt.name,
              }))}
              selected={hostTypeFilter}
              onChange={setHostTypeFilter}
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
