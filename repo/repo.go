package repo

import (
	"database/sql"
	"fmt"
	"time"
)

// Chart represents a chart record.
type Chart struct {
	ID             int    `json:"id"`
	Name           string `json:"name"`
	Repository     string `json:"repository"`
	LineOfBusiness string `json:"line_of_business"`
	RegistryPath   string `json:"registry_path"`
}

// ChartVersion represents a chart version record.
type ChartVersion struct {
	ID            int    `json:"id"`
	ChartID       int    `json:"chart_id"`
	Version       string `json:"version"`
	CommitSHA     string `json:"commit_sha"`
	CommitMessage string `json:"commit_message"`
	CreatedAt     string `json:"created_at"`
}

// ChartVersionPromotion represents a chart version promotion record.
type ChartVersionPromotion struct {
	ID             int       `json:"id"`
	ChartID        int       `json:"chart_id"`
	ChartVersionID int       `json:"chart_version_id"`
	ReleaseChannel string    `json:"release_channel"`
	PromotedAt     time.Time `json:"promoted_at"`
	Active         bool      `json:"active"`
}

// InsertChart inserts a new chart into the charts table.
func InsertChart(db *sql.DB, chart Chart) (int64, error) {
	result, err := db.Exec("INSERT INTO charts (name, repository, line_of_business, registry_path) VALUES (?, ?, ?, ?)",
		chart.Name, chart.Repository, chart.LineOfBusiness, chart.RegistryPath)
	if err != nil {
		return 0, fmt.Errorf("failed to insert chart: %w", err)
	}
	return result.LastInsertId()
}

// UpdateChart updates an existing chart in the charts table.
func UpdateChart(db *sql.DB, chart Chart) error {
	_, err := db.Exec("UPDATE charts SET line_of_business = ?, registry_path = ? WHERE id = ?",
		chart.LineOfBusiness, chart.RegistryPath, chart.ID)
	if err != nil {
		return fmt.Errorf("failed to update chart: %w", err)
	}
	return nil
}

// GetChartByID retrieves a chart by its ID.
func GetChartByID(db *sql.DB, id int) (*Chart, error) {
	var chart Chart
	err := db.QueryRow("SELECT id, name, repository, line_of_business, registry_path FROM charts WHERE id = ?", id).
		Scan(&chart.ID, &chart.Name, &chart.Repository, &chart.LineOfBusiness, &chart.RegistryPath)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get chart by ID: %w", err)
	}
	return &chart, nil
}

// GetChartByNameAndRepository retrieves a chart by its name and repository.
func GetChartByNameAndRepository(db *sql.DB, name, repository string) (*Chart, error) {
	var chart Chart
	err := db.QueryRow("SELECT id, name, repository, line_of_business, registry_path FROM charts WHERE name = ? AND repository = ?", name, repository).
		Scan(&chart.ID, &chart.Name, &chart.Repository, &chart.LineOfBusiness, &chart.RegistryPath)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get chart by name and repository: %w", err)
	}
	return &chart, nil
}

// InsertChartVersion inserts a new chart version into the chart_versions table.
func InsertChartVersion(db *sql.DB, version ChartVersion) (int64, error) {
	result, err := db.Exec("INSERT INTO chart_versions (chart_id, version, commit_sha) VALUES (?, ?, ?)",
		version.ChartID, version.Version, version.CommitSHA)
	if err != nil {
		return 0, fmt.Errorf("failed to insert chart version: %w", err)
	}
	return result.LastInsertId()
}

// GetChartVersionByID retrieves a chart version by its ID.
func GetChartVersionByID(db *sql.DB, id int) (*ChartVersion, error) {
	var version ChartVersion
	err := db.QueryRow("SELECT id, chart_id, version, commit_sha, created_at FROM chart_versions WHERE id = ?", id).
		Scan(&version.ID, &version.ChartID, &version.Version, &version.CommitSHA, &version.CreatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get chart version by ID: %w", err)
	}
	return &version, nil
}

// GetChartVersionByChartIDAndVersion retrieves a chart version by chart ID and version.
func GetChartVersionByChartIDAndVersion(db *sql.DB, chartID int, version string) (*ChartVersion, error) {
	var chartVersion ChartVersion
	err := db.QueryRow("SELECT id, chart_id, version, commit_sha, created_at FROM chart_versions WHERE chart_id = ? AND version = ?", chartID, version).
		Scan(&chartVersion.ID, &chartVersion.ChartID, &chartVersion.Version, &chartVersion.CommitSHA, &chartVersion.CreatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get chart version by chart ID and version: %w", err)
	}
	return &chartVersion, nil
}

// InsertChartVersionPromotion inserts a new chart version promotion into the chart_version_promotions table.
func InsertChartVersionPromotion(db *sql.DB, promotion ChartVersionPromotion) (int64, error) {
	result, err := db.Exec("INSERT INTO chart_version_promotions (chart_id, chart_version_id, release_channel, promoted_at, active) VALUES (?, ?, ?, ?, ?)",
		promotion.ChartID, promotion.ChartVersionID, promotion.ReleaseChannel, promotion.PromotedAt, promotion.Active)
	if err != nil {
		return 0, fmt.Errorf("failed to insert chart version promotion: %w", err)
	}
	return result.LastInsertId()
}

// GetChartVersionPromotionByID retrieves a chart version promotion by its ID.
func GetChartVersionPromotionByID(db *sql.DB, id int) (*ChartVersionPromotion, error) {
	var promotion ChartVersionPromotion
	err := db.QueryRow("SELECT id, chart_version_id, release_channel, promoted_at, active FROM chart_version_promotions WHERE id = ?", id).
		Scan(&promotion.ID, &promotion.ChartVersionID, &promotion.ReleaseChannel, &promotion.PromotedAt, &promotion.Active)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get chart version promotion by ID: %w", err)
	}
	return &promotion, nil
}

// DeactivatePreviousPromotion deactivates the previous promotion for the given chart version and release channel.
func DeactivatePreviousPromotion(db *sql.DB, chartID int, releaseChannel string) error {
	_, err := db.Exec("UPDATE chart_version_promotions SET active = false WHERE chart_id = ? AND release_channel = ? AND active = true",
		chartID, releaseChannel)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil
		}
		return fmt.Errorf("failed to deactivate previous promotion: %w", err)
	}
	return nil
}
