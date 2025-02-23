import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAllRepositories } from "../../db/db";
import { Repository } from "../../db/types";
import { NavArrowDown, Filter } from "iconoir-react";

interface RepositoryGroupProps {
  lob: string;
  repositories: Repository[];
  selectedRepositories: string[];
  filter: string;
  onSelect: (repository: Repository) => void;
  allowMultiSelect: boolean;
}

const RepositoryGroup: React.FC<RepositoryGroupProps> = ({
  lob,
  repositories,
  selectedRepositories,
  filter,
  onSelect,
  allowMultiSelect,
}) => {
  console.log(selectedRepositories);
  const hasSelectedRepository = repositories.some((repo) =>
    selectedRepositories.includes(repo.name),
  );
  const [isExpanded, setIsExpanded] = useState<boolean>(hasSelectedRepository);

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <span className="font-medium">{lob}</span>
        <span className={`transform transition-transform ${isExpanded ? "rotate-180" : ""}`}>
          <NavArrowDown />
        </span>
      </button>
      {(isExpanded || filter.length > 0) && (
        <div className="ml-2 mt-1 flex flex-col gap-1">
          {repositories.map((repository) =>
            repository.name.includes(filter) ? (
              <div key={repository.name} className="flex items-center gap-2 py-0.5">
                <div className="flex shrink-0 items-center">
                  <input
                    type="checkbox"
                    id={repository.name}
                    checked={selectedRepositories.includes(repository.name)}
                    onChange={() => onSelect(repository)}
                  />
                </div>
                <span className="min-w-0 flex-1 text-sm">{repository.name}</span>
              </div>
            ) : null,
          )}
        </div>
      )}
    </div>
  );
};

interface RepositorySelectorProps {
  selectedRepositories: string[];
  onSelectedRepositoriesChange: (repositories: string[]) => void;
  allowMultiSelect?: boolean;
}

const RepositorySelector: React.FC<RepositorySelectorProps> = ({
  selectedRepositories,
  onSelectedRepositoriesChange,
  allowMultiSelect = true,
}) => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [repoFilter, setRepoFilter] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    getAllRepositories().then((result) => {
      setRepositories(result);

      const params = new URLSearchParams(location.search);
      const repoParam = params.get("repositories");

      if (!repoParam) {
        const savedRepos = localStorage.getItem("selectedRepositories");
        if (savedRepos) {
          const selectedRepos = JSON.parse(savedRepos);
          onSelectedRepositoriesChange(selectedRepos);
          navigate(`?repositories=${selectedRepos.join(",")}`);
        }
      }
    });
  }, []);

  const groupedRepositories = useMemo(() => {
    const groups = repositories.reduce(
      (groups, repo) => {
        const group = groups[repo.lob] || [];
        group.push(repo);
        groups[repo.lob] = group;
        return groups;
      },
      {} as Record<string, Repository[]>,
    );

    Object.keys(groups).forEach((lob) => {
      groups[lob].sort((a, b) => a.name.localeCompare(b.name));
    });

    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [repositories]);

  const handleRepositorySelect = (repository: Repository) => {
    const isSelected = selectedRepositories.includes(repository.name);
    let newSelected: string[];

    if (isSelected) {
      newSelected = selectedRepositories.filter((name) => name !== repository.name);
    } else {
      newSelected = allowMultiSelect
        ? [...selectedRepositories, repository.name]
        : [repository.name];
    }

    onSelectedRepositoriesChange(newSelected);
    localStorage.setItem("selectedRepositories", JSON.stringify(newSelected));

    if (newSelected.length > 0) {
      navigate(`?repositories=${newSelected.join(",")}`);
    } else {
      navigate("");
    }
  };

  return (
    <div className="flex h-full w-60 shrink-0 flex-col bg-white p-3 dark:bg-gray-800">
      <h2 className="mb-4 font-bold">Repositories</h2>
      <div className="mb-4 flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-900">
        <Filter className="h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Filter repositories..."
          value={repoFilter}
          onChange={(e) => setRepoFilter(e.target.value)}
          className="w-full bg-transparent text-sm placeholder-gray-400 outline-none"
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col pr-2">
          {groupedRepositories.map(([lob, repos]) => (
            <RepositoryGroup
              key={lob}
              lob={lob}
              repositories={repos}
              selectedRepositories={selectedRepositories}
              filter={repoFilter}
              onSelect={handleRepositorySelect}
              allowMultiSelect={allowMultiSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RepositorySelector;
