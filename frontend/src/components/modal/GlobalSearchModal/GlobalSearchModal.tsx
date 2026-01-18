import BaseInput from "../../inputs/BaseInput";
import BaseModal from ".././BaseModal";
import SearchIcon from "@/../public/icons/search.svg";
import React from "react";
import ServerIcon from "@/../public/icons/server.svg";
import VmIcon from "@/../public/icons/vm.svg";
import DockerIcon from "@/../public/icons/docker.svg";
import SearchResultEntity from "./SearchResultEntity";
import SearchResultCategory from "./SearchResultCategory";
import { useSearch } from "@/hooks/useSearch";

type Props = {
  onClose: () => void;
};

export default function GlobalSearchModal({ onClose }: Props) {
  const [query, setQuery] = React.useState("");
  const [categories, setCategories] = React.useState([
    {
      name: "Servers",
      key: "servers",
      selected: true,
    },
    {
      name: "VMs",
      key: "vms",
      selected: true,
    },
    {
      name: "Services",
      key: "services",
      selected: true,
    },
  ]);
  const searchBarRef = React.useRef<HTMLInputElement>(null);

  const selectedCategories = categories
    .filter((c) => c.selected)
    .map((c) => c.key);
  const { results, isLoading } = useSearch(query, selectedCategories, 300);

  React.useEffect(() => {
    if (searchBarRef.current) {
      searchBarRef.current.focus();
    }
  }, []);

  const toggleCategory = (categoryName: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.name === categoryName ? { ...cat, selected: !cat.selected } : cat,
      ),
    );
  };

  const searchResults = [
    {
      name: "Servers",
      key: "servers",
      results: results.servers.map((server) => ({
        name: server.name,
        description: server.ip || server.status,
        icon: "server",
        link: `/infrastructure/servers/${server.id}`,
      })),
    },
    {
      name: "VMs",
      key: "vms",
      results: results.vms.map((vm) => ({
        name: vm.name,
        description: vm.hostServerName || vm.ip || vm.status,
        icon: "vm",
        link: `/infrastructure/virtual-machines/${vm.id}`,
      })),
    },
    {
      name: "Services",
      key: "services",
      results: results.services.map((service) => ({
        name: service.name,
        description: `${service.type} on ${service.hostType}`,
        icon: "docker",
        link: `/infrastructure/services/${service.id}`,
      })),
    },
  ].filter((category) => category.results.length > 0);

  return (
    <BaseModal onClose={onClose}>
      <div className="h-[50vh] w-[75vw] overflow-y-scroll rounded-lg border border-gray-700 p-4">
        <BaseInput
          ref={searchBarRef}
          placeholder="Search infrastructure..."
          leftIcon={<SearchIcon width={12} />}
          value={query}
          onChange={(value) => setQuery(value)}
        />
        <div className="mt-4 flex gap-2">
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => toggleCategory(category.name)}
              className={`rounded-lg px-3 py-1 text-sm transition-colors ${
                category.selected
                  ? "bg-primary text-white"
                  : "bg-gray-700 text-gray-400 hover:bg-gray-600"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
        {isLoading && query ? (
          <div className="mt-6 p-4 text-center text-gray-500">
            Searching...
          </div>
        ) : !query ? (
          <div className="mt-6 p-4 text-center text-gray-500">
            Start typing to search...
          </div>
        ) : searchResults.length === 0 ? (
          <div className="mt-6 p-4 text-center text-gray-500">
            No results found
          </div>
        ) : (
          <div className="mt-6 flex justify-between gap-4">
          {searchResults.map((category) => (
            <SearchResultCategory
              key={category.name}
              name={`${category.name} (${category.results.length})`}
            >
              {category.results.map((result) => (
                <SearchResultEntity
                  key={result.name}
                  name={result.name}
                  description={result.description}
                  icon={
                    result.icon === "server" ? (
                      <ServerIcon width={16} />
                    ) : result.icon === "vm" ? (
                      <VmIcon width={16} />
                    ) : (
                      <DockerIcon width={16} />
                    )
                  }
                  link={result.link}
                />
              ))}
            </SearchResultCategory>
          ))}
        </div>
        )}
      </div>
    </BaseModal>
  );
}
