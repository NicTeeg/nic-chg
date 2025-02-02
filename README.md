# Project: Helm Chart and Version Management

This project is designed to manage Helm charts and their versions. It provides a way to store and retrieve information about Helm charts and their versions in a SQLite database. The project includes functionality to initialize and migrate the database schema, as well as insert and query chart data via command-line interface (CLI) commands.

## Purpose

The main purpose of this project is to:

- Store Helm chart metadata, including name, repository, line of business, and registry path.
- Store Helm chart version information, including version number, commit SHA, and creation timestamp.
- Provide a CLI interface to insert and manage Helm chart data.

## Database Schema

The database schema consists of two tables:

- `charts`: Stores metadata about Helm charts.
- `chart_versions`: Stores version information for Helm charts.

## Example CLI Commands

### Add or Update Chart

To insert or updatea Helm chart into the database, use the -upsert-chart flag with JSON formatted input:

```sh
nic-chg -upsert-chart='{
  "chart_name": "example-chart",
  "repository": "example-repo",
  "line_of_business": "example-lob",
  "registry_path": "example/path"
}'
```

### Add Chart Version

To insert a Helm chart version into the database, use the -add-chart-version flag with JSON formatted input:

```sh
nic-chg -add-chart-version='{
  "chart_name": "example-chart",
  "repository": "example-repo",
  "version": "1.0.1",
  "commit_sha": "abc124",
  "commit_message": "example commit message"
}'
```

A Chart will also be inserted if it does not exist.

### Add Chart Promotion

To insert a Helm chart promotion into the database, use the -add-chart-promotion flag with JSON formatted input:

```sh
nic-chg -add-chart-promotion='{
  "chart_name": "example-chart",
  "repository": "example-repo",
  "version": "1.0.1",
  "release_channel": "pre-alpha",
  "promoted_at": "2025-02-01T12:34:56Z"
}'
```
