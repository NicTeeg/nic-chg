import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getAllRepositories,
  getChartsByRepository,
  getChartVersions,
} from "./db/db";
import { Repository, Chart, ChartVersion } from "./db/types";
import { Menu, Button } from "@material-tailwind/react";
import { NavArrowDown } from "iconoir-react";
import ChartVersionCard from "./components/ChartVersionCard";
import ChartCard from "./components/ChartCard";

const Charts = () => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepository, setSelectedRepository] = useState<string>("");
  const [selectedRepoDisplay, setSelectedRepoDisplay] = useState<string>("");
  const [charts, setCharts] = useState<Chart[]>([]);
  const [activeVersions, setActiveVersions] = useState<{
    [key: string]: ChartVersion[];
  }>({});

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    getAllRepositories().then((result) => {
      setRepositories(result);
    });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const repo = params.get("repository");
    if (repo) {
      setSelectedRepository(repo);
      setSelectedRepoDisplay(repo);
    }
  }, [location.search]);

  useEffect(() => {
    if (selectedRepository) {
      getChartsByRepository(selectedRepository).then((result) => {
        setCharts(result);
        result.forEach((chart) => {
          getChartVersions(chart.id.toString(), true).then((versions) => {
            if (versions) {
              setActiveVersions((prev) => ({
                ...prev,
                [chart.id]: versions,
              }));
            }
          });
        });
      });
    }
  }, [selectedRepository]);

  const handleRepositorySelect = (repository: Repository) => {
    setSelectedRepository(repository.name);
    setSelectedRepoDisplay(repository.lob + " / " + repository.name);
    navigate(`?repository=${repository.name}`);
  };

  return (
    <div className="overflow-x-auto">
      <Menu>
        <Menu.Trigger
          as={Button}
          size="lg"
          variant="ghost"
          className="flex items-center gap-1"
        >
          {selectedRepoDisplay || "Select repository"}{" "}
          <NavArrowDown className="size-3.5 stroke-2 group-data-[open=true]:rotate-180" />
        </Menu.Trigger>
        <Menu.Content>
          {repositories.map((repository) => (
            <Menu.Item
              key={repository.name}
              onClick={() => handleRepositorySelect(repository)}
            >
              {repository.lob} / {repository.name}
            </Menu.Item>
          ))}
        </Menu.Content>
      </Menu>
      {""}
      <div className="w-full overflow-hidden rounded-lg border border-surface">
        <table className="w-full">
          <thead className="border-b border-surface bg-surface-light text-sm font-medium text-foreground dark:bg-surface-dark">
            <tr>
              {["Chart", "Active Versions"].map((head) => (
                <th key={head} className="px-2.5 py-2 text-start font-medium">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="group text-sm text-black dark:text-white">
            {charts.map((chart, index) => {
              return (
                <tr
                  key={index}
                  className="border-b border-gray-200 even:bg-surface-light dark:border-gray-700"
                >
                  <td className="w-[260px] p-2">
                    <ChartCard chart={chart} />
                  </td>
                  <td className="p-2">
                    <div className="flex flex-wrap gap-2">
                      {activeVersions[chart.id] &&
                        activeVersions[chart.id].map((version) => (
                          <ChartVersionCard
                            key={version.id}
                            chart={chart}
                            version={version}
                            compact={true}
                          />
                        ))}
                    </div>
                  </td>
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
