import React, { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { getChartsByRepositories, getChartVersions } from "../../db/db";
import { Chart, ChartVersion } from "../../db/types";
import { Link } from "react-router-dom";
import RepositorySelector from "../shared/RepositorySelector";
import ReleaseChannelFilter from "../shared/ReleaseChannelFilter";
import { SimpleHeader, SortableHeader, SortDirection } from "../shared/table/Headers";
import { getUniqueReleaseChannels } from "../../utils/releaseChannels";

type ChartSortField = "chartName" | "promotedAt";

const SpannedCell = ({ content, rowSpan }: { content: React.ReactNode; rowSpan: number }) => (
  <td className="whitespace-nowrap bg-white p-2 align-top dark:bg-gray-800" rowSpan={rowSpan}>
    {content}
  </td>
);

interface ChartWithVersions extends Chart {
  versions: ChartVersion[];
}

function Charts() {
  const [selectedRepositories, setSelectedRepositories] = useState<string[]>([]);
  const [selectedReleaseChannel, setSelectedReleaseChannel] = useState<string>("");
  const [charts, setCharts] = useState<Chart[]>([]);
  const [activeVersions, setActiveVersions] = useState<{
    [key: string]: ChartVersion[];
  }>({});
  const [sortField, setSortField] = useState<ChartSortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
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

        const versionPromises = result.map((chart) =>
          getChartVersions(chart.id.toString(), "", true).then((versions) => ({
            chartId: chart.id,
            versions,
          })),
        );

        Promise.all(versionPromises).then((results) => {
          const newVersions = results.reduce(
            (acc, { chartId, versions }) => ({
              ...acc,
              [chartId]: versions,
            }),
            {},
          );
          setActiveVersions(newVersions);
        });
      });
    } else {
      setCharts([]);
      setActiveVersions({});
    }
  }, [selectedRepositories]);

  const releaseChannels = useMemo(
    () => getUniqueReleaseChannels(Object.values(activeVersions).flat()),
    [activeVersions],
  );

  const withFilteredVersions = (chart: Chart): ChartWithVersions => ({
    ...chart,
    versions: (activeVersions[chart.id] || [])
      .filter(
        (version) =>
          !selectedReleaseChannel ||
          version.promotions.some(
            (promotion) => promotion.releaseChannel === selectedReleaseChannel,
          ),
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  });

  const sortedCharts = (a: ChartWithVersions, b: ChartWithVersions): number => {
    if (sortField === "chartName") {
      return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    }
    if (sortField === "promotedAt" && selectedReleaseChannel) {
      const getPromotionDate = (chart: ChartWithVersions) => {
        const latestVersion = chart.versions.find((version) =>
          version.promotions.some(
            (promotion) => promotion.releaseChannel === selectedReleaseChannel,
          ),
        );
        const promotion = latestVersion?.promotions.find(
          (p) => p.releaseChannel === selectedReleaseChannel,
        );
        return promotion ? new Date(promotion.promotedAt).getTime() : 0;
      };

      const comparison = getPromotionDate(b) - getPromotionDate(a);
      return sortDirection === "asc" ? -comparison : comparison;
    }
    return 0;
  };

  const buildChartRow = (chart: ChartWithVersions) => {
    const versions = chart.versions;

    return (
      <React.Fragment key={chart.id}>
        {versions.map((version, versionIndex) => (
          <tr
            key={`${chart.id}-${version.id}`}
            className={`border-b border-gray-200 dark:border-gray-700 ${
              versionIndex % 2 === 1 ? "bg-surface-light dark:bg-surface-dark" : ""
            }`}
          >
            {versionIndex === 0 ? (
              <>
                <SpannedCell content={chart.lob} rowSpan={versions.length} />
                <SpannedCell content={chart.repository} rowSpan={versions.length} />
                <SpannedCell
                  content={
                    <Link
                      to={`/changelog?repositories=${chart.repository}&chart=${chart.name}`}
                      className="font-bold text-blue-600 hover:underline"
                    >
                      {chart.name}
                    </Link>
                  }
                  rowSpan={versions.length}
                />
              </>
            ) : null}
                        <td className="w-min px-4 py-2">
                        <div className="flex flex-wrap gap-1">
                {version.promotions
                  .filter(
                    (promotion) =>
                      !selectedReleaseChannel ||
                      promotion.releaseChannel === selectedReleaseChannel,
                  )
                  .map((promotion, index) => (
                    <span
                    key={index}
                    title={`Promoted at: ${new Date(
                      promotion.promotedAt,
                    ).toLocaleString()}`}
                    className={`whitespace-nowrap rounded px-2 py-0.5 text-xs font-medium ${
                      promotion.active
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-200 text-gray-600"
                    } flex flex-col items-center`}
                  >
                    <span>
                      {promotion.releaseChannel}
                    </span>
                    {selectedReleaseChannel && <span className="mt-1 opacity-75">
                      {new Date(promotion.promotedAt).toLocaleString(undefined, {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>}
                  </span>
                  ))}
              </div>
            </td>
            <td className="whitespace-nowrap px-4 py-2">
              <div className="flex flex-col">
                <span className="font-bold">{version.version}</span>
                <span className="text-xs text-gray-500">
                  (
                  {new Date(version.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                  )
                </span>
              </div>
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
          </tr>
        ))}
      </React.Fragment>
    );
  };

  return (
    <div className="flex h-screen">
      <div className="flex shrink-0 flex-col border-r border-surface">
        <RepositorySelector
          selectedRepositories={selectedRepositories}
          onSelectedRepositoriesChange={setSelectedRepositories}
          allowMultiSelect={true}
        />
      </div>
      <div className="flex-1 overflow-auto p-4">
        <ReleaseChannelFilter
          releaseChannels={releaseChannels}
          selected={selectedReleaseChannel}
          onChange={setSelectedReleaseChannel}
        />
        <div className="w-full overflow-hidden rounded-lg border border-surface">
          <table className="w-full">
            <thead className="border-b border-surface bg-surface-light text-sm font-medium text-foreground dark:bg-surface-dark">
              <tr>
                <SimpleHeader label="LOB" />
                <SimpleHeader label="Repository" />
                <SortableHeader<ChartSortField>
                  label="Chart Name"
                  sortKey="chartName"
                  sortConfig={{
                    field: sortField,
                    direction: sortDirection,
                    onFieldChange: setSortField,
                    onDirectionChange: setSortDirection,
                  }}
                />
                <SortableHeader<ChartSortField>
                  label="Release Channels"
                  sortKey="promotedAt"
                  sortConfig={{
                    field: sortField,
                    direction: sortDirection,
                    onFieldChange: setSortField,
                    onDirectionChange: setSortDirection,
                  }}
                  disabled={!selectedReleaseChannel}
                />
                <SimpleHeader label="Version" />
                <SimpleHeader label="Description" />
              </tr>
            </thead>
            <tbody className="group text-sm text-black dark:text-white">
              {charts.map(withFilteredVersions).sort(sortedCharts).map(buildChartRow)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Charts;
