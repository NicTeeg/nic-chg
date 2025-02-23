import React from "react";

interface ReleaseChannelFilterProps {
  releaseChannels: string[];
  selected: string;
  onChange: (channel: string) => void;
}

const ReleaseChannelFilter: React.FC<ReleaseChannelFilterProps> = ({
  releaseChannels,
  selected,
  onChange,
}) => {
  return (
    <div className="mb-4 flex items-center gap-2">
      <label htmlFor="releaseChannel" className="text-sm font-medium">
        Filter by Release Channel:
      </label>
      <select
        id="releaseChannel"
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-800"
      >
        <option value="">All Channels</option>
        {releaseChannels.map((channel) => (
          <option key={channel} value={channel}>
            {channel}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ReleaseChannelFilter;
