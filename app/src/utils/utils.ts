import { createDbWorker } from "sql.js-httpvfs";

const workerUrl = new URL(
  "sql.js-httpvfs/dist/sqlite.worker.js",
  import.meta.url
);
const wasmUrl = new URL("sql.js-httpvfs/dist/sql-wasm.wasm", import.meta.url);

export async function load(): Promise<void> {
    const worker = await createDbWorker(
    [
        {
        from: "inline",
        config: {
            serverMode: "full",
            url: "/changelog.db",
            requestChunkSize: 4096,
        },
        },
    ],
    workerUrl.toString(),
    wasmUrl.toString()
    );

    const result = await worker.db.query(`select * from charts`);

  console.log(JSON.stringify(result));
}