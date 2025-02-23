import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAllCharts, getChartByRepoAndName, getChartVersions } from "../../db/db";
import { Chart, ChartVersion } from "../../db/types";
import { Menu, Button, Tabs } from "@material-tailwind/react";
import { NavArrowDown } from "iconoir-react";
import PromotionTimeline from "../shared/PromotionTimeline";

function ChartChangelog() {
  const [charts, setCharts] = useState<Chart[]>([]);
  const [selectedChart, setSelectedChart] = useState<Chart>();
  const [chartVersions, setChartVersions] = useState<ChartVersion[]>([]);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    getAllCharts().then((result) => {
      setCharts(result);
    });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const repo = params.get("repository");
    const chart = params.get("chart");
    if (repo && chart) {
      getChartByRepoAndName(repo, chart).then((result) => {
        result && setSelectedChart(result);
      });
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
    navigate(`?repository=${chart.repository}&chart=${chart.name}`);
  };

  return (
    <div className="overflow-x-auto">
      {""}
      <Tabs defaultValue="versions">
        <Tabs.List className="rounded-none border-b border-secondary-dark bg-transparent py-0">
          <Menu>
            <Menu.Trigger as={Button} size="lg" variant="ghost" className="flex items-center gap-1">
              {selectedChart?.name || "Select chart"}{" "}
              <NavArrowDown className="size-3.5 stroke-2 group-data-[open=true]:rotate-180" />
            </Menu.Trigger>
            <Menu.Content>
              {charts.map((chart) => (
                <Menu.Item key={chart.id} onClick={() => handleChartSelect(chart)}>
                  {chart.repository} / {chart.name}
                </Menu.Item>
              ))}
            </Menu.Content>
          </Menu>
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
                    <th className="whitespace-nowrap px-4 py-2 text-start font-medium">Version</th>
                    <th className="whitespace-nowrap px-4 py-2 text-start font-medium">
                      Description
                    </th>
                    <th className="whitespace-nowrap px-4 py-2 text-start font-medium">
                      Created At
                    </th>
                    <th className="w-min whitespace-nowrap px-4 py-2 text-start font-medium">
                      Release Channels
                    </th>
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
                      <td className="whitespace-nowrap px-4 py-2 text-gray-600">
                        {new Date(version.createdAt).toLocaleString(undefined, {
                          year: "2-digit",
                          month: "short",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </td>
                      <td className="w-min px-4 py-2">
                        <div className="flex flex-wrap gap-1">
                          {version.promotions.map((promotion, index) => (
                            <span
                              key={index}
                              title={`${promotion.active ? "Promoted" : "Inactive"} at: ${new Date(
                                promotion.promotedAt,
                              ).toLocaleString()}`}
                              className={`whitespace-nowrap rounded px-2 py-1 text-xs font-medium ${
                                promotion.active
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-600"
                              } flex flex-col items-center`}
                            >
                              <span>{promotion.releaseChannel}</span>
                              <span className="mt-0.5 text-[10px] opacity-75">
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
  );
}

export default ChartChangelog;
