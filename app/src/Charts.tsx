import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getAllRepositories,
  getChartsByRepositories,
  getChartVersions,
} from "./db/db";
import { Repository, Chart, ChartVersion } from "./db/types";
import { Checkbox, Typography } from "@material-tailwind/react";
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

const RepositoryGroup = ({ 
  lob, 
  repositories, 
  selectedRepositories, 
  onSelect 
}: { 
  lob: string;
  repositories: Repository[];
  selectedRepositories: string[];
  onSelect: (repository: Repository) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <span className="font-medium">{lob}</span>
        <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          <NavArrowDown />
        </span>
      </button>
      {isExpanded && (
        <div className="ml-2 mt-1 flex flex-col gap-1">
          {repositories.map((repository) => (
      <div className="flex items-center gap-2">
      <Checkbox id={repository.name}
       color="secondary"
                      checked={selectedRepositories.includes(repository.name)}
                      onChange={() => onSelect(repository)}>
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
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepositories, setSelectedRepositories] = useState<string[]>([]);
  const [charts, setCharts] = useState<Chart[]>([]);
  const [activeVersions, setActiveVersions] = useState<{
    [key: string]: ChartVersion[];
  }>({});

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    getAllRepositories().then((result) => {
      setRepositories(result);

      const params = new URLSearchParams(location.search);
      const repoParam = params.get("repositories");

      if (!repoParam) {
        const savedRepos = localStorage.getItem("selectedRepositories");
        if (savedRepos) {
          const parsed = JSON.parse(savedRepos);
          setSelectedRepositories(parsed);
        }
      }
    });
  }, []);

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

  const handleRepositorySelect = (repository: Repository) => {
    const isSelected = selectedRepositories.includes(repository.name);
    let newSelected: string[];
    
    if (isSelected) {
      newSelected = selectedRepositories.filter(name => name !== repository.name);
    } else {
      newSelected = [...selectedRepositories, repository.name];
    }
    
    setSelectedRepositories(newSelected);
    localStorage.setItem("selectedRepositories", JSON.stringify(newSelected));
    
    // Update URL with raw comma-separated repositories
    if (newSelected.length > 0) {
      navigate(`?repositories=${newSelected.join(',')}`);
    } else {
      navigate('');
    }
  };

  const groupedRepositories = repositories.reduce((groups, repo) => {
    const group = groups[repo.lob] || [];
    group.push(repo);
    groups[repo.lob] = group;
    return groups;
  }, {} as Record<string, Repository[]>);

  return (
    <div className="flex gap-4 p-4">
      <div className="w-64 shrink-0 rounded-lg border border-surface bg-white p-4 dark:bg-gray-800">
        <h2 className="mb-4 font-bold">Repositories</h2>
        <div className="flex flex-col">
          {Object.entries(groupedRepositories).map(([lob, repos]) => (
            <RepositoryGroup
              key={lob}
              lob={lob}
              repositories={repos}
              selectedRepositories={selectedRepositories}
              onSelect={handleRepositorySelect}
            />
          ))}
        </div>
      </div>
      
      <div className="flex-1 overflow-x-auto">
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
    </div>
  );
};

export default Charts;
