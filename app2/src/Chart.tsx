import { Table } from "flowbite-react/components/Table";
import { useEffect, useState } from "react";
import { queryDb } from "./db/db";

const Chart = () => {
  interface ChartData {
    version: string;
    commit_sha: string;
    commit_message: string;
    created_at: string;
  }
  
  const [data, setData] = useState<ChartData[]>([]);

  useEffect(() => {
    queryDb("select * from chart_versions where chart_id = 1").then((result) => {
      console.log(result);
      setData(result as ChartData[]);
    });
  }, []);
  
    return (
      <div className="overflow-x-auto">
      <Table>
        <Table.Head>
          <Table.HeadCell>Version</Table.HeadCell>
          <Table.HeadCell>Commit SHA</Table.HeadCell>
          <Table.HeadCell>Commit Message</Table.HeadCell>
          <Table.HeadCell>Date</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {data.map((row) => (
            <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
              <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                {row.version}
              </Table.Cell>
              <Table.Cell>
                <a href="#" className="font-medium text-cyan-600 hover:underline dark:text-cyan-500">
                  {row.commit_sha}
                </a>
              </Table.Cell>
              <Table.Cell>{row.commit_message}</Table.Cell>
              <Table.Cell>{row.created_at}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
    );
  };
  
  export default Chart;