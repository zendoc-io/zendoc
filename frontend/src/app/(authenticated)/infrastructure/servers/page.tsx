"use client";
import BaseInput from "@/components/BaseInput";
import SearchIcon from "@/../public/icons/search.svg";
import FilterIcon from "@/../public/icons/filter.svg";
import Link from "next/link";
import BaseButton from "@/components/BaseButton";
import ChevronIcon from "@/../public/icons/chevron.svg";
import TableViewIcon from "@/../public/icons/table-view.svg";
import PencilIcon from "@/../public/icons/pencil.svg";
import FilledChevronIcon from "@/../public/icons/filled-chevron.svg";
import { useState } from "react";
import TableHeader from "@/components/Table/TableHeader";
import TableRowLink from "@/components/Table/TableRowLink";
import TableRowBox from "@/components/Table/TableRowBox";

export default function ServerPage() {
  const [tableHeaders, setTableHeaders] = useState([
    {
      name: "Name",
      sort: "asc",
    },
    {
      name: "Status",
      sort: null,
    },
    {
      name: "IP",
      sort: null,
    },
    {
      name: "Role",
      sort: null,
    },
    {
      name: "OS",
      sort: null,
    },
    {
      name: "VMs",
      sort: null,
    },
    {
      name: "Services",
      sort: null,
    },
  ]);

  function handleSort(index: number) {
    const newTableHeaders = tableHeaders.map((header, i) => {
      if (i === index) {
        if (header.sort === "asc") {
          return {
            ...header,
            sort: "desc",
          };
        } else {
          return {
            ...header,
            sort: "asc",
          };
        }
      } else {
        return {
          ...header,
          sort: null,
        };
      }
    });

    setTableHeaders(newTableHeaders);
  }

  const tableData = [
    {
      name: "Server 1",
      status: {
        name: "Online",
        color: "green",
      },
      ip: "192.168.1.42",
      role: {
        name: "Application server",
        color: "#FF9F0A",
      },
      os: {
        name: "Ubuntu 22.04 LTS",
        type: "linux",
      },
      vms: 1,
      services: 4,
    },
  ];

  return (
    <div className="p-3">
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
          >
            Edit view
          </BaseButton>
        </div>
      </div>
      <div className="rounded-lg border border-gray-700">
        <table className="w-full text-left">
          <thead className="border-b border-gray-700">
            <tr>
              <th className="p-3">
                <input type="checkbox" className="h-4 w-4" />
              </th>
              {tableHeaders.map((header, index) => (
                <TableHeader
                  key={index}
                  index={index}
                  name={header.name}
                  sort={header.sort}
                  handleSort={handleSort}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((data, index) => (
              <tr
                key={index}
                className={`${index + 1 !== tableData.length && "border-b"} border-gray-700`}
              >
                <td className="p-3">
                  <input type="checkbox" className="h-4 w-4" />
                </td>
                <td className="p-3">
                  <TableRowLink
                    href="/app/infrastructure/servers"
                    name={data.name}
                  />
                </td>
                <td className="p-3">
                  <TableRowBox
                    backgroundColor={data.status.color}
                    name={data.status.name}
                  />
                </td>
                <td className="p-3">{data.ip}</td>
                <td className="p-3">
                  <TableRowBox
                    backgroundColor={data.role.color}
                    name={data.role.name}
                  />
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <img
                      src={`/icons/os/${data.os.type}.svg`}
                      alt={data.os.name}
                      className="w-4"
                    />
                    {data.os.name}
                  </div>
                </td>
                <td className="p-3">
                  <TableRowLink
                    href="/app/infrastructure/vms"
                    name={data.vms}
                  />
                </td>
                <td className="p-3">
                  <TableRowLink
                    href="/app/infrastructure/vms"
                    name={data.services}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
