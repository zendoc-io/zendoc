export default function MobileTableWarning() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
      <div className="max-w-md rounded-lg border border-gray-700 bg-gray-800 p-8 text-center">
        <div className="mb-6 flex justify-center">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            className="text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="2"
              y="3"
              width="20"
              height="14"
              rx="2"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path d="M8 21h8" stroke="currentColor" strokeWidth="2" />
            <path d="M12 17v4" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <h2 className="mb-3 text-xl font-semibold">
          Table View Not Available
        </h2>
        <p className="text-gray-500">
          This table cannot be displayed on small screens. Please open this
          page on a desktop or tablet device for the best experience.
        </p>
      </div>
    </div>
  );
}
