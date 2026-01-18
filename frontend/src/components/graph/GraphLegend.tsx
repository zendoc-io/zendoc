export default function GraphLegend() {
  return (
    <div className="absolute bottom-40 left-4 z-10 rounded-lg border border-gray-700 bg-gray-800/90 p-4 shadow-xl backdrop-blur-sm">
      <h4 className="mb-3 text-xs font-semibold tracking-wide text-gray-300 uppercase">
        Legend
      </h4>

      {/* Entity Types */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-blue-500"></div>
          <span className="text-xs text-gray-300">Server</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-purple-500"></div>
          <span className="text-xs text-gray-300">Virtual Machine</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
          <span className="text-xs text-gray-300">Service</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-orange-500"></div>
          <span className="text-xs text-gray-300">Subnet</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
          <span className="text-xs text-gray-300">Role</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-gray-500"></div>
          <span className="text-xs text-gray-300">OS</span>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="border-t border-gray-700 pt-3">
        <h5 className="mb-2 text-xs font-medium text-gray-400">Status</h5>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-400">
              Active/Running/Healthy
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
            <span className="text-xs text-gray-400">Warning/Degraded</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-500"></div>
            <span className="text-xs text-gray-400">Error/Unhealthy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-gray-500"></div>
            <span className="text-xs text-gray-400">Stopped/Inactive</span>
          </div>
        </div>
      </div>
    </div>
  );
}
