import React from "react";
import { Chart } from "../db/types";

interface ChartCardProps {
  chart: Chart;
}

const ChartCard: React.FC<ChartCardProps> = ({ chart }) => {
  return (
    <div className="w-[250px] rounded-lg border bg-white p-2 shadow-md dark:bg-gray-800">
      <div className="flex flex-col items-start">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
          {chart.lob} / {chart.repository}
        </span>
      </div>
      <div className="mt-2">
        <span className="text-lg font-bold text-black dark:text-white">
          {chart.name}
        </span>
      </div>
    </div>
  );
};

export default ChartCard;
