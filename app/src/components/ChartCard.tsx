import React from "react";
import { Link } from "react-router-dom";
import { Chart } from "../db/types";

interface ChartCardProps {
  chart: Chart;
}

const ChartCard: React.FC<ChartCardProps> = ({ chart }) => {
  return (
    <div className="w-[250px] rounded-lg border bg-white p-2 shadow-md dark:bg-gray-800">
      <div className="flex flex-col items-start">
      <Link
          to={`/charts?repository=${chart.repository}`}
          className="text-sm font-medium text-gray-600 dark:text-gray-300"
        >
          {chart.lob} / {chart.repository}
        </Link>
      </div>
      <div className="mt-2">
        <Link
          to={`/changelog?repository=${chart.repository}&chart=${chart.name}`}
          className="text-lg font-bold text-black dark:text-white hover:underline"
        >
          {chart.name}
        </Link>
      </div>
    </div>
  );
};

export default ChartCard;
