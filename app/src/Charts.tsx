import { useEffect, useState } from "react";
import { getAllRepositories, getChartsByRepository } from "./db/db";
import { Repository, Chart } from "./db/types";
import { Menu, Button } from "@material-tailwind/react";
import { NavArrowDown } from "iconoir-react";

const TABLE_HEAD = ["Repository", "Chart"];

const Charts = () => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepository, setSelectedRepository] = useState<string>("");
  const [charts, setCharts] = useState<Chart[]>([]);

  useEffect(() => {
    getAllRepositories().then((result) => {
      setRepositories(result);
    });
  }, []);

  useEffect(() => {
    if (selectedRepository) {
      getChartsByRepository(selectedRepository).then((result) => {
        setCharts(result);
      });
    }
  }, [selectedRepository]);

  return (
    <div className="overflow-x-auto">
      <Menu>
        <Menu.Trigger
          as={Button}
          size="sm"
          variant="ghost"
          className="flex items-center gap-1"
        >
          Select repository{" "}
          <NavArrowDown className="size-3.5 stroke-2 group-data-[open=true]:rotate-180" />
        </Menu.Trigger>
        <Menu.Content>
          {repositories.map((repository) => (
            <Menu.Item
              key={repository.name}
              onClick={() => setSelectedRepository(repository.name)}
            >
              {repository.lob}/{repository.name}
            </Menu.Item>
          ))}
        </Menu.Content>
      </Menu>
      {""}
      <div className="w-full overflow-hidden rounded-lg border border-surface">
        <table className="w-full">
          <thead className="border-b border-surface bg-surface-light text-sm font-medium text-foreground dark:bg-surface-dark">
            <tr>
              {TABLE_HEAD.map((head) => (
                <th key={head} className="px-2.5 py-2 text-start font-medium">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="group text-sm text-black dark:text-white">
            {charts.map(({ repository, name }, index) => {
              return (
                <tr
                  key={index}
                  className="even:bg-surface-light dark:even:bg-surface-dark"
                >
                  <td className="p-3">{repository}</td>
                  <td className="p-3">{name}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Charts;
