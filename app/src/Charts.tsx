import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getAllRepositories,
  getChartsByRepositories,
  getChartVersions,
} from "./db/db";
import { Repository, Chart, ChartVersion } from "./db/types";
import { Menu, Button } from "@material-tailwind/react";
import { NavArrowDown } from "iconoir-react";
import { Link } from "react-router-dom";

const SpannedCell = ({ content, rowSpan }: { content: React.ReactNode; rowSpan: number }) => (
  <td
    className="p-2 whitespace-nowrap align-top bg-white dark:bg-gray-800"
    rowSpan={rowSpan}
  >
    {content}
  </td>
);

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

      // Load initial repository from URL or localStorage
      const params = new URLSearchParams(location.search);
      const repoFromUrl = params.get("repository");

      if (!repoFromUrl) {
        const savedRepo = localStorage.getItem("selectedRepository");
        if (savedRepo) {
          const foundRepo = result.find((r) => r.name === savedRepo);
          if (foundRepo) {
            handleRepositorySelect(foundRepo);
          }
        }
      }
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
      getChartsByRepositories([selectedRepository]).then((result) => {
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
    localStorage.setItem("selectedRepository", repository.name);
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
                "Created At"
              ].map((header) => (
                <th 
                  key={header} 
                  className={`px-2.5 py-2 text-start font-medium ${
                    header === "Release Channels" ? "w-min whitespace-nowrap" : ""
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
                        versionIndex % 2 === 1 ? 'bg-surface-light dark:bg-surface-dark' : ''
                      }`}
                    >
                      {versionIndex === 0 ? (
                        <>
                          <SpannedCell content={chart.lob} rowSpan={versions.length} />
                          <SpannedCell content={chart.repository} rowSpan={versions.length} />
                          <SpannedCell
                            content={
                              <Link
                                to={`/changelog?repository=${chart.repository}&chart=${chart.name}`}
                                className="text-blue-600 font-bold hover:underline"
                              >
                                {chart.name}
                              </Link>
                            }
                            rowSpan={versions.length}
                          />
                        </>
                      ) : null}
                      <td className="p-2 w-min">
                        <div className="flex flex-wrap gap-1">
                          {version.promotions
                            .filter((promotion) => promotion.active)
                            .map((promotion, index) => (
                              <span
                                key={index}
                                title={`Promoted at: ${new Date(
                                  promotion.promotedAt
                                ).toLocaleString()}`}
                                className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 whitespace-nowrap"
                              >
                                {promotion.releaseChannel}
                              </span>
                            ))}
                        </div>
                      </td>
                      <td className="p-2 whitespace-nowrap font-bold">
                        {version.version}
                      </td>
                      <td className="p-2 max-w-md">
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
                      <td className="p-2 whitespace-nowrap text-gray-600 dark:text-gray-400">
                        {new Date(version.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        })}
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
  );
};

export default Charts;
