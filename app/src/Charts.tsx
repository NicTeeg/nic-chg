import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getChartsByRepositories, getChartVersions } from "./db/db";
import { Chart, ChartVersion } from "./db/types";
import { Link } from "react-router-dom";
import RepositorySelector from "./components/RepositorySelector";
import { ArrowDown, ArrowUp } from "iconoir-react";

type SortDirection = "asc" | "desc";
type SortField = "chartName" | "promotedAt" | null;

interface SortableHeaderProps {
  label: string;
  sortKey: SortField;
  currentSort: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  disabled?: boolean;
  className?: string;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({
  label,
  sortKey,
  currentSort,
  sortDirection,
  onSort,
  disabled,
  className,
}) => (
  <th className={`px-2.5 py-2 text-start font-medium ${className || ""}`}>
    <div className="flex items-center gap-1">
      {label}
      <button
        onClick={() => !disabled && onSort(sortKey)}
        className={`ml-1 ${disabled ? "text-gray-300" : "text-gray-400 hover:text-gray-600"}`}
        disabled={disabled}
      >
        {currentSort === sortKey ? (
          sortDirection === "asc" ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )
        ) : (
          <ArrowDown className="h-4 w-4 opacity-50" />
        )}
      </button>
    </div>
  </th>
);

const SimpleHeader: React.FC<{ label: string; className?: string }> = ({
  label,
  className = "",
}) => <th className={`px-2.5 py-2 text-start font-medium ${className}`}>{label}</th>;

const SpannedCell = ({ content, rowSpan }: { content: React.ReactNode; rowSpan: number }) => (
  <td className="whitespace-nowrap bg-white p-2 align-top dark:bg-gray-800" rowSpan={rowSpan}>
    {content}
  </td>
);

interface ChartWithVersions extends Chart {
  versions: ChartVersion[];
}

const getUniqueReleaseChannels = (activeVersions: { [key: string]: ChartVersion[] }): string[] => {
  const channelPromotions = Object.values(activeVersions)
    .flat()
    .flatMap((version) => version.promotions)
    .filter((promotion) => promotion.active)
    .reduce(
      (acc, promotion) => {
        if (
          !acc[promotion.releaseChannel] ||
          new Date(promotion.promotedAt).getTime() <
            new Date(acc[promotion.releaseChannel]).getTime()
        ) {
          acc[promotion.releaseChannel] = promotion.promotedAt;
        }
        return acc;
      },
      {} as Record<string, string>,
    );

  return Object.entries(channelPromotions)
    .sort(([, dateA], [, dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
    .map(([channel]) => channel);
};

const ReleaseChannelFilter: React.FC<{
  channels: string[];
  selected: string;
  onChange: (channel: string) => void;
}> = ({ channels, selected, onChange }) => (
  <div className="mb-4 flex items-center gap-2">
    <label htmlFor="releaseChannel" className="text-sm font-medium">
      Filter by Release Channel:
    </label>
    <select
      id="releaseChannel"
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-800"
    >
      <option value="">All Channels</option>
      {channels.map((channel) => (
        <option key={channel} value={channel}>
          {channel}
        </option>
      ))}
    </select>
  </div>
);

const Charts = () => {
  const [selectedRepositories, setSelectedRepositories] = useState<string[]>([]);
  const [selectedReleaseChannel, setSelectedReleaseChannel] = useState<string>("");
  const [charts, setCharts] = useState<Chart[]>([]);
  const [activeVersions, setActiveVersions] = useState<{
    [key: string]: ChartVersion[];
  }>({});
  const [sortField, setSortField] = useState<SortField>(null);
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
        result.forEach((chart) => {
          getChartVersions(chart.id.toString(), "", true).then((versions) => {
            setActiveVersions((prev) => ({
              ...prev,
              [chart.id]: versions,
            }));
          });
        });
      });
    } else {
      setCharts([]);
      setActiveVersions({});
    }
  }, [selectedRepositories]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const withVersions = (chart: Chart): ChartWithVersions => ({
    ...chart,
    versions: (activeVersions[chart.id] || []).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
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
    const versions = selectedReleaseChannel
      ? chart.versions.filter((version) =>
          version.promotions.some(
            (promotion) => promotion.releaseChannel === selectedReleaseChannel,
          ),
        )
      : chart.versions;

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
                  .filter(
                    (promotion) =>
                      !selectedReleaseChannel ||
                      promotion.releaseChannel === selectedReleaseChannel,
                  )
                  .map((promotion, index) => (
                    <>
                      <span
                        key={index}
                        title={`Promoted at: ${new Date(promotion.promotedAt).toLocaleString()}`}
                        className="whitespace-nowrap rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
                      >
                        {promotion.releaseChannel}
                      </span>
                      {selectedReleaseChannel && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({new Date(promotion.promotedAt).toLocaleString()})
                        </span>
                      )}
                    </>
                  ))}
              </div>
            </td>
            <td className="whitespace-nowrap p-2">
              <span className="font-bold">{version.version}</span>
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
              {new Date(version.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </td>
          </tr>
        ))}
      </React.Fragment>
    );
  };

  return (
    <div className="flex h-screen">
      <RepositorySelector
        selectedRepositories={selectedRepositories}
        onSelectedRepositoriesChange={setSelectedRepositories}
      />
      <div className="flex-1 overflow-auto p-4">
        <ReleaseChannelFilter
          channels={getUniqueReleaseChannels(activeVersions)}
          selected={selectedReleaseChannel}
          onChange={setSelectedReleaseChannel}
        />
        <div className="w-full overflow-hidden rounded-lg border border-surface">
          <table className="w-full">
            <thead className="border-b border-surface bg-surface-light text-sm font-medium text-foreground dark:bg-surface-dark">
              <tr>
                <SimpleHeader label="LOB" />
                <SimpleHeader label="Repository" />
                <SortableHeader
                  label="Chart Name"
                  sortKey="chartName"
                  currentSort={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Release Channels"
                  sortKey="promotedAt"
                  currentSort={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  disabled={!selectedReleaseChannel}
                  className="w-min whitespace-nowrap"
                />
                <SimpleHeader label="Version" />
                <SimpleHeader label="Description" />
                <SimpleHeader label="Created At" />
              </tr>
            </thead>
            <tbody className="group text-sm text-black dark:text-white">
              {charts
                .map(withVersions)
                .filter(
                  (chart) =>
                    !selectedReleaseChannel ||
                    chart.versions.some((version) =>
                      version.promotions.some(
                        (promotion) => promotion.releaseChannel === selectedReleaseChannel,
                      ),
                    ),
                )
                .sort(sortedCharts)
                .map(buildChartRow)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Charts;
