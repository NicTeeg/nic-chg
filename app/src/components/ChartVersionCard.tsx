import React from "react";
import { ChartVersion, Chart } from "../db/types";

interface ChartVersionCardProps {
  chart: Chart;
  version: ChartVersion;
  compact?: boolean;
}

const tagColors: { [key: string]: string } = {
  rtm: "bg-teal-100 text-teal-800",
  beta: "bg-indigo-100 text-indigo-800",
  alpha: "bg-purple-100 text-purple-800",
  "pre-alpha": "bg-blue-100 text-blue-800",
};

const ChartVersionCard: React.FC<ChartVersionCardProps> = ({
  chart,
  version,
  compact = false,
}) => {
  return (
    <div
      className={`${compact && "w-[280px]"} rounded-lg border bg-white p-2 shadow-md dark:bg-gray-800`}
    >
      <div className="flex items-start justify-between">
        <span className="text-lg font-bold">{version.version}</span>
        <div className="flex items-center gap-1">
          {version.promotions.map((promotion, index) => (
            <span
              key={index}
              title={`${new Date(promotion.promotedAt).toLocaleString()}`}
              className={`${
                promotion.active
                  ? tagColors[promotion.releaseChannel] ||
                    "bg-gray-200 text-gray-800"
                  : "bg-gray-50 text-gray-400"
              } rounded px-2 py-1 text-xs font-semibold`}
            >
              {promotion.releaseChannel}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-2">
        <a
          href={`https://github.com/org/${chart.repository}/commit/${version.commitSHA}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {version.commitMessage}
        </a>
      </div>
    </div>
  );
};

export default ChartVersionCard;
