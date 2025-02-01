CREATE TABLE charts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    repository TEXT NOT NULL,
    line_of_business TEXT NOT NULL,
    registry_path TEXT NOT NULL,
    UNIQUE(name, repository)
);

CREATE TABLE chart_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chart_id INTEGER NOT NULL,
    version TEXT NOT NULL,
    commit_sha TEXT NOT NULL,
    commit_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(chart_id) REFERENCES charts(id),
    UNIQUE(chart_id, version)
);

CREATE TABLE chart_version_promotions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chart_id INTEGER NOT NULL,
    chart_version_id INTEGER NOT NULL,
    release_channel TEXT NOT NULL,
    promoted_at TIMESTAMP,
    active BOOLEAN NOT NULL DEFAULT 1,
    FOREIGN KEY(chart_id) REFERENCES charts(id),
    FOREIGN KEY(chart_version_id) REFERENCES chart_versions(id)
);

CREATE INDEX idx_charts_repository_and_name ON charts(repository, name);
CREATE INDEX idx_charts_line_of_business ON charts(line_of_business);
CREATE INDEX idx_chart_versions_chart_id_and_version ON chart_versions(chart_id, version);
CREATE INDEX idx_chart_versions_commit_sha ON chart_versions(commit_sha);
CREATE INDEX idx_chart_version_promotions_chart_version_id_and_release_channel ON chart_version_promotions(chart_version_id, release_channel);