import { createDbWorker } from "sql.js-httpvfs";
import { Repository, Chart } from "./types";

const workerUrl = new URL(
  "sql.js-httpvfs/dist/sqlite.worker.js",
  import.meta.url,
);
const wasmUrl = new URL("sql.js-httpvfs/dist/sql-wasm.wasm", import.meta.url);

const worker = await createDbWorker(
  [
    {
      from: "inline",
      config: {
        serverMode: "full",
        url: "/nic-chg/changelog.db",
        requestChunkSize: 4096,
      },
    },
  ],
  workerUrl.toString(),
  wasmUrl.toString(),
);

export async function getAllRepositories(): Promise<Repository[]> {
  const result = await queryDb(
    `SELECT DISTINCT repository, line_of_business FROM charts`,
  );
  if (result.length === 0) {
    return [];
  }

  const repositories: Repository[] = result.map((row) => {
    return {
      name: row.repository,
      lob: row.line_of_business,
    };
  });

  return repositories;
}

export async function getChartsByRepository(
  repository: string,
): Promise<Chart[]> {
  const result = await queryDb(
    `SELECT * FROM charts WHERE repository = ?`,
    repository,
  );
  if (result.length === 0) {
    return [];
  }

  const charts: Chart[] = result.map((row) => {
    return {
      name: row.name,
      repository: row.repository,
      lob: row.line_of_business,
      registryPath: row.registry_path,
    };
  });

  return charts;
}

export async function getChartByName(name: string): Promise<Chart | null> {
  const result = await queryDb(`SELECT * FROM charts WHERE name = ?`, name);
  if (result.length === 0) {
    return null;
  }

  const chartData: ChartData = result[0];
  const chart: Chart = {
    name: chartData.name,
    repository: chartData.repository,
    lob: chartData.line_of_business,
    registryPath: chartData.registry_path,
  };

  return chart;
}

async function queryDb(query: string, ...params: string[]): Promise<any[]> {
  console.log("queryDb");
  const result = await worker.db.query(query, params);
  return result;
}

interface ChartData {
  id: number;
  name: string;
  repository: string;
  line_of_business: string;
  registry_path: string;
}

// interface ChartVersionData {
//   id: number;
//   chart_id: number;
//   version: string;
//   commit_sha: string;
//   commit_message: string;
//   created_at: string;
// }

// interface ChartVersionPromotionData {
//   id: number;
//   chart_id: number;
//   chart_version_id: number;
//   release_channel: string;
//   promoted_at: string;
//   active: boolean;
// }
