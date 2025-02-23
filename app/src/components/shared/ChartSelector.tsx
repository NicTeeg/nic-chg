import React, { useEffect, useState } from "react";
import { NavArrowDown, Filter } from "iconoir-react";
import { Chart } from "../../db/types";
import { getChartsByRepositories } from "../../db/db";

interface ChartSelectorProps {
  repository: string;
  selectedChart?: Chart;
  onChartSelect: (chart: Chart) => void;
}

const ChartSelector: React.FC<ChartSelectorProps> = ({
  repository,
  selectedChart,
  onChartSelect,
}) => {
  const [charts, setCharts] = useState<Chart[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [chartFilter, setChartFilter] = useState("");

  useEffect(() => {
    if (repository) {
      getChartsByRepositories([repository]).then(setCharts);
    } else {
      setCharts([]);
    }
  }, [repository]);

  const filteredCharts = charts.filter((chart) =>
    chart.name.toLowerCase().includes(chartFilter.toLowerCase()),
  );

  return (
    <div className="flex h-full w-60 shrink-0 flex-col bg-white p-3 dark:bg-gray-800">
      <h2 className="mb-4 font-bold">Charts</h2>
      {repository ? (
        <div className="flex flex-col">
          <div className="mb-4 flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-900">
            <Filter className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Filter charts..."
              value={chartFilter}
              onChange={(e) => setChartFilter(e.target.value)}
              className="w-full bg-transparent text-sm placeholder-gray-400 outline-none"
            />
          </div>
          <div className="mb-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex w-full items-center justify-between rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <span className="font-medium">{repository}</span>
              <span className={`transform transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                <NavArrowDown />
              </span>
            </button>
            {(isExpanded || chartFilter.length > 0) && filteredCharts.length > 0 && (
              <div className="ml-2 mt-1 flex flex-col gap-1">
                {filteredCharts.map((chart) => (
                  <button
                    key={chart.id}
                    onClick={() => onChartSelect(chart)}
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-start text-sm ${
                      selectedChart?.id === chart.id
                        ? "bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span className="flex-1 truncate">{chart.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-500">Select a repository to view charts</div>
      )}
    </div>
  );
};

export default ChartSelector;
