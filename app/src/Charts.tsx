import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getAllRepositories,
  getChartsByRepositories,
  getChartVersions,
} from "./db/db";
import { Repository, Chart, ChartVersion } from "./db/types";
import { Checkbox } from "@material-tailwind/react";
import { NavArrowDown } from "iconoir-react";
import { Link } from "react-router-dom";
import RepositorySelector from "./components/RepositorySelector";

const SpannedCell = ({
  content,
  rowSpan,
}: {
  content: React.ReactNode;
  rowSpan: number;
}) => (
  <td
    className="whitespace-nowrap bg-white p-2 align-top dark:bg-gray-800"
    rowSpan={rowSpan}
  >
    {content}
  </td>
);

const RepositoryGroup = ({
  lob,
  repositories,
  selectedRepositories,
  onSelect,
}: {
  lob: string;
  repositories: Repository[];
  selectedRepositories: string[];
  onSelect: (repository: Repository) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <span className="font-medium">{lob}</span>
        <span
          className={`transform transition-transform ${isExpanded ? "rotate-180" : ""}`}
        >
          <NavArrowDown />
        </span>
      </button>
      {isExpanded && (
        <div className="ml-2 mt-1 flex flex-col gap-1">
          {repositories.map((repository) => (
            <div className="flex items-center gap-2">
              <Checkbox
                id={repository.name}
                color="secondary"
                checked={selectedRepositories.includes(repository.name)}
                onChange={() => onSelect(repository)}
              >
                <Checkbox.Indicator />
              </Checkbox>
              <span className="text-sm">{repository.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Charts = () => {
  const [selectedRepositories, setSelectedRepositories] = useState<string[]>(
    [],
  );
  const [charts, setCharts] = useState<Chart[]>([]);
  const [activeVersions, setActiveVersions] = useState<{
    [key: string]: ChartVersion[];
  }>({});
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const repoParam = params.get("repositories");
    if (repoParam) {
      const repos = repoParam.split(",");
      setSelectedRepositories(repos);
    }
  }, [location.search]);

  useEffect(() => {
    if (selectedRepositories.length > 0) {
      getChartsByRepositories(selectedRepositories).then((result) => {
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
    } else {
      setCharts([]);
      setActiveVersions({});
    }
  }, [selectedRepositories]);

  return (
    <div className="flex h-screen">
      <RepositorySelector
        selectedRepositories={selectedRepositories}
        onSelectedRepositoriesChange={setSelectedRepositories}
      />
      <div className="flex-1 overflow-auto p-4">
        <div className="w-full overflow-hidden rounded-lg border border-surface">
          <table className="w-full">
            <thead className="border-b border-surface bg-surface-light text-sm font-medium text-foreground dark:bg-surface-dark">
              <tr>
                {[
                  "LOB",
                  "Repository",
                  "Chart Name",
                  "Release Channels",
                  "Version",
                  "Description",
                  "Created At",
                ].map((header) => (
                  <th
                    key={header}
                    className={`px-2.5 py-2 text-start font-medium ${
                      header === "Release Channels"
                        ? "w-min whitespace-nowrap"
                        : ""
                    }`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="group text-sm text-black dark:text-white">
              {charts.map((chart) => {
                const versions = activeVersions[chart.id] || [];
                return (
                  <React.Fragment key={chart.id}>
                    {versions.map((version, versionIndex) => (
                      <tr
                        key={`${chart.id}-${version.id}`}
                        className={`border-b border-gray-200 dark:border-gray-700 ${
                          versionIndex % 2 === 1
                            ? "bg-surface-light dark:bg-surface-dark"
                            : ""
                        }`}
                      >
                        {versionIndex === 0 ? (
                          <>
                            <SpannedCell
                              content={chart.lob}
                              rowSpan={versions.length}
                            />
                            <SpannedCell
                              content={chart.repository}
                              rowSpan={versions.length}
                            />
                            <SpannedCell
                              content={
                                <Link
                                  to={`/changelog?repository=${chart.repository}&chart=${chart.name}`}
                                  className="font-bold text-blue-600 hover:underline"
                                >
                                  {chart.name}
                                </Link>
                              }
                              rowSpan={versions.length}
                            />
                          </>
                        ) : null}
                        <td className="w-min p-2">
                          <div className="flex flex-wrap gap-1">
                            {version.promotions
                              .filter((promotion) => promotion.active)
                              .map((promotion, index) => (
                                <span
                                  key={index}
                                  title={`Promoted at: ${new Date(
                                    promotion.promotedAt,
                                  ).toLocaleString()}`}
                                  className="whitespace-nowrap rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
                                >
                                  {promotion.releaseChannel}
                                </span>
                              ))}
                          </div>
                        </td>
                        <td className="whitespace-nowrap p-2 font-bold">
                          {version.version}
                        </td>
                        <td className="max-w-md p-2">
                          <a
                            href={`https://github.com/org/${chart.repository}/commit/${version.commitSHA}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                            title={version.commitMessage}
                          >
                            {version.commitMessage}
                          </a>
                        </td>
                        <td className="whitespace-nowrap p-2 text-gray-600 dark:text-gray-400">
                          {new Date(version.createdAt).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            },
                          )}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Charts;
