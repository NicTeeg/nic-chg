import { useState } from "react";
import { ChartVersion } from "./db/types";

const TABLE_HEAD = ["Version", "Commit SHA", "Commit Message", "Date"];

const ChartChangelog = () => {
  const [chartVersions] = useState<ChartVersion[]>([]);

  return (
    <div className="w-full overflow-hidden rounded-lg border border-surface">
      <table className="w-full">
        <thead className="border-b border-surface bg-surface-light text-sm font-medium text-foreground dark:bg-surface-dark">
          <tr>
            {TABLE_HEAD.map((head) => (
              <th key={head} className="px-2.5 py-2 text-start font-medium">
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="group text-sm text-black dark:text-white">
          {chartVersions.map(
            ({ version, commitSHA, commitMessage, createdAt }, index) => {
              return (
                <tr
                  key={index}
                  className="even:bg-surface-light dark:even:bg-surface-dark"
                >
                  <td className="p-3">{version}</td>
                  <td className="p-3">{commitSHA}</td>
                  <td className="p-3">{commitMessage}</td>
                  <td className="p-3">{createdAt}</td>
                </tr>
              );
            },
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ChartChangelog;
