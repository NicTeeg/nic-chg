import React from "react";
import { ArrowDown, ArrowUp } from "iconoir-react";

export type SortDirection = "asc" | "desc";

export interface SortConfig<T> {
  field: T | null;
  direction: SortDirection;
  onFieldChange: (field: T | null) => void;
  onDirectionChange: (direction: SortDirection) => void;
}

interface SortableHeaderProps<T> {
  label: string;
  sortKey: T;
  sortConfig: SortConfig<T>;
  disabled?: boolean;
  className?: string;
}

export const SortableHeader = <T extends string>({
  label,
  sortKey,
  sortConfig,
  disabled,
  className,
}: SortableHeaderProps<T>) => {
  const handleSort = () => {
    if (disabled) return;

    if (sortConfig.field === sortKey) {
      sortConfig.onDirectionChange(sortConfig.direction === "asc" ? "desc" : "asc");
    } else {
      sortConfig.onFieldChange(sortKey);
      sortConfig.onDirectionChange("desc");
    }
  };

  return (
    <th className={`px-2.5 py-2 text-start font-medium ${className || ""}`}>
      <div className="flex items-center gap-1">
        {label}
        <button
          onClick={handleSort}
          className={`ml-1 ${disabled ? "text-gray-300" : "text-gray-400 hover:text-gray-600"}`}
          disabled={disabled}
        >
          {sortConfig.field === sortKey ? (
            sortConfig.direction === "asc" ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )
          ) : (
            <ArrowDown className="h-4 w-4 opacity-50" />
          )}
        </button>
      </div>
    </th>
  );
};

interface SimpleHeaderProps {
  label: string;
  className?: string;
}

export const SimpleHeader: React.FC<SimpleHeaderProps> = ({ label, className = "" }) => (
  <th className={`px-2.5 py-2 text-start font-medium ${className}`}>{label}</th>
);
