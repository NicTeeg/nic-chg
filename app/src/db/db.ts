import { createDbWorker } from "sql.js-httpvfs";
import {
  Repository,
  Chart,
  ChartVersion,
  ChartVersionPromotion,
} from "./types";

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

export async function getAllCharts(): Promise<Chart[]> {
  const result = await queryDb(`SELECT * FROM charts`);
  if (result.length === 0) {
    return [];
  }

  const charts: Chart[] = result.map((row) => {
    return {
      id: row.id,
      name: row.name,
      repository: row.repository,
      lob: row.line_of_business,
      registryPath: row.registry_path,
    };
  });

  return charts;
}

export async function getChartsByRepositories(
  repositories: string[],
): Promise<Chart[]> {
  const query = `
  SELECT
    * 
  FROM
    charts 
  WHERE
    repository IN (${repositories.map(() => "?").join(",")})
  `;
  const result = await queryDb(query, ...repositories);
  if (result.length === 0) {
    return [];
  }

  const charts: Chart[] = result.map((row) => {
    return {
      id: row.id,
      name: row.name,
      repository: row.repository,
      lob: row.line_of_business,
      registryPath: row.registry_path,
    };
  });

  return charts;
}

export async function getChartByRepoAndName(
  repository: string,
  name: string,
): Promise<Chart | null> {
  const result = await queryDb(
    `SELECT * FROM charts WHERE repository = ? AND name = ?`,
    repository,
    name,
  );
  if (result.length === 0) {
    return null;
  }

  const chartData = result[0];
  const chart: Chart = {
    id: chartData.id,
    name: chartData.name,
    repository: chartData.repository,
    lob: chartData.line_of_business,
    registryPath: chartData.registry_path,
  };

  return chart;
}

export async function getChartVersions(
  chartId: string,
  releaseChannel: string = "",
  activeOnly: boolean = false,
): Promise<ChartVersion[] | null> {
  const query = `
  SELECT
    cvp.id AS promotion_id,
    cvp.chart_version_id,
    cvp.release_channel,
    cvp.promoted_at,
    cvp.active,
    cv.id AS version_id,
    cv.version,
    cv.commit_sha,
    cv.commit_message,
    cv.created_at
  FROM
    chart_version_promotions cvp
  JOIN
    chart_versions cv ON cvp.chart_version_id = cv.id
  WHERE
    cvp.chart_id = ?
    ${activeOnly ? "AND cvp.active = 1" : ""}
    ${releaseChannel.length > 0 ? `AND cvp.release_channel = ?` : ""}
  ORDER BY cv.created_at DESC
  `;
  const params = [chartId];
  if (releaseChannel.length > 0) {
    params.push(releaseChannel);
  }
  const result = await queryDb(query, ...params);
  if (result.length === 0) {
    return [];
  }

  const versionMap = new Map<number, ChartVersion>();

  result.forEach((row) => {
    const promotion: ChartVersionPromotion = {
      releaseChannel: row.release_channel,
      promotedAt: row.promoted_at,
      active: row.active,
    };

    if (versionMap.has(row.version_id)) {
      versionMap.get(row.version_id)!.promotions.push(promotion);
    } else {
      const chartVersion: ChartVersion = {
        id: row.version_id,
        version: row.version,
        commitSHA: row.commit_sha,
        commitMessage: row.commit_message,
        createdAt: row.created_at,
        promotions: [promotion],
      };
      versionMap.set(row.version_id, chartVersion);
    }
  });

  return Array.from(versionMap.values());
}

const workerUrl = new URL(
  "sql.js-httpvfs/dist/sqlite.worker.js",
  import.meta.url,
);
const wasmUrl = new URL("sql.js-httpvfs/dist/sql-wasm.wasm", import.meta.url);
let dbWorker: any = null;
async function getDbWorker() {
  if (!dbWorker) {
    dbWorker = await createDbWorker(
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
  }
  return dbWorker;
}

async function queryDb(query: string, ...params: string[]): Promise<any[]> {
  const worker = await getDbWorker();
  const result = await worker.db.query(query, params);
  return result;
}
