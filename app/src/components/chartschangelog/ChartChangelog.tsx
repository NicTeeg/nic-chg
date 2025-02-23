import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAllCharts, getChartByRepoAndName, getChartVersions } from "../../db/db";
import { Chart, ChartVersion } from "../../db/types";
import { Menu, Button, Tabs } from "@material-tailwind/react";
import { NavArrowDown } from "iconoir-react";
import PromotionTimeline from "../shared/PromotionTimeline";
import ChartSelector from "../shared/ChartSelector";
import RepositorySelector from "../shared/RepositorySelector";
import { SimpleHeader } from "../shared/table/Headers";

function ChartChangelog() {
  const [charts, setCharts] = useState<Chart[]>([]);
  const [selectedChart, setSelectedChart] = useState<Chart>();
  const [chartVersions, setChartVersions] = useState<ChartVersion[]>([]);
  const [selectedRepository, setSelectedRepository] = useState<string[]>([]);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const repo = params.get("repositories");
    const chart = params.get("chart");
    if (repo) {
      setSelectedRepository([repo]);
      if (chart) {
        getChartByRepoAndName(repo, chart).then((result) => {
          result && setSelectedChart(result);
        });
      }
    }
  }, [location.search]);

  useEffect(() => {
    if (selectedChart) {
      getChartVersions(selectedChart.id.toString()).then((result) => {
        setChartVersions(result || []);
      });
    }
  }, [selectedChart]);

  const handleChartSelect = (chart: Chart) => {
    setSelectedChart(chart);
    navigate(`?repositories=${chart.repository}&chart=${chart.name}`);
  };

  return (
    <div className="flex h-screen">
      <div className="flex shrink-0 flex-col border-r border-surface">
        <div className="max-h-[320px] overflow-hidden border-b border-surface">
          <RepositorySelector
            selectedRepositories={selectedRepository}
            onSelectedRepositoriesChange={setSelectedRepository}
            allowMultiSelect={false}
          />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ChartSelector
            repository={selectedRepository[0] || ""}
            selectedChart={selectedChart}
            onChartSelect={handleChartSelect}
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <Tabs defaultValue="versions">
          <Tabs.List className="rounded-none border-b border-secondary-dark bg-transparent py-0">
            <Tabs.Trigger value="versions">Versions</Tabs.Trigger>
            <Tabs.Trigger value="promotions">Promotions</Tabs.Trigger>
            <Tabs.TriggerIndicator className="rounded-none border-b-2 border-primary bg-transparent shadow-none" />
          </Tabs.List>
          <Tabs.Panel value="versions">
            {selectedChart && chartVersions.length > 0 && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead className="border-b border-surface bg-surface-light text-sm font-medium text-foreground dark:bg-surface-dark">
                    <tr>
                      <SimpleHeader label="Version" />
                      <SimpleHeader label="Description" />
                      <SimpleHeader label="Release Channels" />
                    </tr>
                  </thead>
                  <tbody>
                    {chartVersions.map((version, index) => (
                      <tr
                        key={version.id}
                        className={`border-b border-gray-200 dark:border-gray-700 ${
                          index % 2 === 1 ? "bg-surface-light dark:bg-surface-dark" : ""
                        }`}
                      >
                        <td className="whitespace-nowrap px-4 py-2 font-bold">{version.version}</td>
                        <td className="max-w-md px-4 py-2">
                          <a
                            href={`https://github.com/org/${selectedChart.repository}/commit/${version.commitSHA}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                            title={version.commitMessage}
                          >
                            {version.commitMessage}
                          </a>
                        </td>
                        <td className="w-min px-4 py-2">
                          <div className="flex flex-wrap gap-1">
                            {version.promotions.map((promotion, index) => (
                              <span
                                key={index}
                                title={`Promoted at: ${new Date(
                                  promotion.promotedAt,
                                ).toLocaleString()}`}
                                className={`whitespace-nowrap rounded px-2 py-1 text-xs font-medium ${
                                  promotion.active
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-200 text-gray-600"
                                } flex flex-col items-center`}
                              >
                                <span>{promotion.releaseChannel}</span>
                                <span className="mt-1  opacity-75">
                                  {new Date(promotion.promotedAt).toLocaleString(undefined, {
                                    dateStyle: "short",
                                    timeStyle: "short",
                                  })}
                                </span>
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Tabs.Panel>
          <Tabs.Panel value="promotions" className="scrollbar overflow-x-scroll">
            {selectedChart && chartVersions.length > 0 && (
              <div className="mt-4">
                <PromotionTimeline chart={selectedChart} versions={chartVersions} />
              </div>
            )}
          </Tabs.Panel>
        </Tabs>
      </div>
    </div>
  );
}

export default ChartChangelog;
