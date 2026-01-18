import type { GraphFilters } from "@/types/graph";

export type GraphFiltersProps = {
  filters: GraphFilters;
  onFiltersChange: (filters: GraphFilters) => void;
  isOpen: boolean;
  onToggle: () => void;
};

export default function GraphFiltersPanel({
  filters,
  onFiltersChange,
  isOpen,
  onToggle,
}: GraphFiltersProps) {
  const handleToggleType = (type: keyof GraphFilters) => {
    onFiltersChange({
      ...filters,
      [type]: !filters[type],
    });
  };

  const handleSearchChange = (query: string) => {
    onFiltersChange({
      ...filters,
      searchQuery: query,
    });
  };

  const handleResetFilters = () => {
    onFiltersChange({
      showServers: true,
      showVMs: true,
      showServices: true,
      showSubnets: true,
      showRoles: true,
      showOS: true,
      statusFilter: [],
      searchQuery: "",
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="absolute top-4 left-4 z-10 rounded-lg bg-gray-800 p-3 shadow-lg transition-colors hover:bg-gray-700"
        title="Show Filters"
      >
        <svg
          className="h-5 w-5 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
      </button>
    );
  }

  return (
    <div className="absolute top-4 left-4 z-10 w-80 rounded-lg border border-gray-700 bg-gray-800 shadow-xl">
      <div className="flex items-center justify-between border-b border-gray-700 p-4">
        <h3 className="font-semibold text-white">Filters</h3>
        <button
          onClick={onToggle}
          className="rounded p-1 transition-colors hover:bg-gray-700"
        >
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-4 p-4">
        {/* Search */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Search
          </label>
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name or IP..."
            className="focus:border-primary focus:ring-primary w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:ring-1 focus:outline-none"
          />
        </div>

        {/* Entity Types */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Entity Types
          </label>
          <div className="space-y-2">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={filters.showServers}
                onChange={() => handleToggleType("showServers")}
                className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
              />
              <span className="flex items-center gap-2 text-sm text-gray-300">
                <span className="h-3 w-3 rounded-full bg-blue-500"></span>
                Servers
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={filters.showVMs}
                onChange={() => handleToggleType("showVMs")}
                className="rounded border-gray-600 bg-gray-700 text-purple-500 focus:ring-purple-500"
              />
              <span className="flex items-center gap-2 text-sm text-gray-300">
                <span className="h-3 w-3 rounded-full bg-purple-500"></span>
                Virtual Machines
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={filters.showServices}
                onChange={() => handleToggleType("showServices")}
                className="rounded border-gray-600 bg-gray-700 text-green-500 focus:ring-green-500"
              />
              <span className="flex items-center gap-2 text-sm text-gray-300">
                <span className="h-3 w-3 rounded-full bg-green-500"></span>
                Services
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={filters.showSubnets}
                onChange={() => handleToggleType("showSubnets")}
                className="rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500"
              />
              <span className="flex items-center gap-2 text-sm text-gray-300">
                <span className="h-3 w-3 rounded-full bg-orange-500"></span>
                Subnets
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={filters.showRoles}
                onChange={() => handleToggleType("showRoles")}
                className="rounded border-gray-600 bg-gray-700 text-yellow-500 focus:ring-yellow-500"
              />
              <span className="flex items-center gap-2 text-sm text-gray-300">
                <span className="h-3 w-3 rounded-full bg-yellow-500"></span>
                Roles
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={filters.showOS}
                onChange={() => handleToggleType("showOS")}
                className="rounded border-gray-600 bg-gray-700 text-gray-500 focus:ring-gray-500"
              />
              <span className="flex items-center gap-2 text-sm text-gray-300">
                <span className="h-3 w-3 rounded-full bg-gray-500"></span>
                Operating Systems
              </span>
            </label>
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={handleResetFilters}
          className="w-full rounded-lg bg-gray-700 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-600"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
