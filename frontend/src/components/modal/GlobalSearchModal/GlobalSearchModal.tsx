import BaseInput from "../../inputs/BaseInput";
import BaseModal from ".././BaseModal";
import SearchIcon from "@/../public/icons/search.svg";
import ToggleButton from "../../inputs/ToggleButton";
import React from "react";
import ServerIcon from "@/../public/icons/server.svg";
import VmIcon from "@/../public/icons/vm.svg";
import DockerIcon from "@/../public/icons/docker.svg";
import PodmanIcon from "@/../public/icons/podman.svg";
import SearchResultEntity from "./SearchResultEntity";
import SearchResultCategory from "./SearchResultCategory";

type Props = {
  onClose: () => void;
};

export default function GlobalSearchModal({ onClose }: Props) {
  const [categories, setCategories] = React.useState([
    {
      name: "Servers",
      selected: true,
    },
    {
      name: "VM",
      selected: true,
    },
    {
      name: "Service",
      selected: true,
    },
  ]);
  const searchBarRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (searchBarRef.current) {
      searchBarRef.current.focus();
    }
  }, []);

  const searchResults = [
    {
      name: "Server",
      results: [
        {
          name: "application-server",
          description: "192.168.69.42",
          icon: "server",
          link: "/infrastructure/servers/application-server",
        },
      ],
    },
    {
      name: "VM",
      results: [
        {
          name: "application-vm",
          description: "192.168.69.43",
          icon: "vm",
          link: "/infrastructure/servers/application-server",
        },
      ],
    },
    {
      name: "Service",
      results: [
        {
          name: "prod-mongo-db",
          description: "Container on 192.168.69.43",
          icon: "docker",
          link: "/infrastructure/servers/application-server",
        },
        {
          name: "prod-postgres-db",
          description: "Container on 192.168.69.43",
          icon: "podman",
          link: "/infrastructure/servers/application-server",
        },
      ],
    },
  ];

  return (
    <BaseModal onClose={onClose}>
      <div className="h-[50vh] w-[75vw] overflow-y-scroll rounded-lg border border-gray-700 p-4">
        <BaseInput
          ref={searchBarRef}
          placeholder="Search"
          leftIcon={<SearchIcon width={12} />}
        />
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
                    ) : result.icon === "docker" ? (
                      <DockerIcon width={16} />
                    ) : (
                      <PodmanIcon width={16} />
                    )
                  }
                  link={result.link}
                />
              ))}
            </SearchResultCategory>
          ))}
        </div>
      </div>
    </BaseModal>
  );
}
