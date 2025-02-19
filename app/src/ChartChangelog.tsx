import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getAllCharts,
  getChartByName,
  getChartVersions,
} from "./db/db";
import { Chart, ChartVersion } from "./db/types";
import { Menu, Button } from "@material-tailwind/react";
import { NavArrowDown } from "iconoir-react";
import ChartVersionCard from "./components/ChartVersionCard";

const ChartChangelog = () => {
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
      getChartByName(chart).then((result) => {
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
      <Menu>
        <Menu.Trigger
          as={Button}
          size="lg"
          variant="ghost"
          className="flex items-center gap-1"
        >
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
      {""}
      {selectedChart &&
        chartVersions.map((version) => (
          <div key={version.id} className="mb-2">
            <ChartVersionCard
              key={version.id}
              chart={selectedChart}
              version={version}
              compact={false}
            />
          </div>
        ))}
    </div>
  );
};

export default ChartChangelog;
