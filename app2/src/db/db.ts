import { createDbWorker } from 'sql.js-httpvfs'

const workerUrl = new URL(
  'sql.js-httpvfs/dist/sqlite.worker.js',
  import.meta.url
)
const wasmUrl = new URL('sql.js-httpvfs/dist/sql-wasm.wasm', import.meta.url)

export async function queryDb(query: string) {
    console.log('queryDb')
    const worker = await createDbWorker(
      [
        {
          from: "inline",
          config: {
            serverMode: "full",
            url: "/nic-chg/data.db",
            requestChunkSize: 4096,
          },
        },
      ],
      workerUrl.toString(),
      wasmUrl.toString()
    );
    const result = await worker.db.query(query);
    return result;
  }