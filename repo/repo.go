package repo

import (
	"database/sql"
	"fmt"
)

// Repository defines the methods that any repository implementation must have.
type Repository interface {
	InsertChart(chart Chart) (int64, error)
	UpdateChart(chart Chart) error
	GetChartByID(id int) (*Chart, error)
	GetChartByNameAndRepository(name, repository string) (*Chart, error)
	InsertChartVersion(version ChartVersion) (int64, error)
	GetChartVersionByID(id int) (*ChartVersion, error)
	GetChartVersionByChartIDAndVersion(chartID int, version string) (*ChartVersion, error)
	InsertChartVersionPromotion(promotion ChartVersionPromotion) (int64, error)
	GetChartVersionPromotionByID(id int) (*ChartVersionPromotion, error)
	DeactivatePreviousPromotion(chartID int, releaseChannel string) error
}

type Repo struct {
	DB *sql.DB
}

// NewRepo creates a new Repo instance with the given database connection.
func NewRepo(db *sql.DB) *Repo {
	return &Repo{DB: db}
}

// InsertChart inserts a new chart into the charts table.
func (r *Repo) InsertChart(chart Chart) (int64, error) {
	if chart.Name == "" || chart.Repository == "" {
		return 0, fmt.Errorf("name and repository cannot be empty")
	}
	result, err := r.DB.Exec("INSERT INTO charts (name, repository, line_of_business, registry_path) VALUES (?, ?, ?, ?)",
		chart.Name, chart.Repository, chart.LineOfBusiness, chart.RegistryPath)
	if err != nil {
		return 0, fmt.Errorf("failed to insert chart: %w", err)
	}
	return result.LastInsertId()
}

// UpdateChart updates an existing chart in the charts table.
func (r *Repo) UpdateChart(chart Chart) error {
	_, err := r.DB.Exec("UPDATE charts SET line_of_business = ?, registry_path = ? WHERE id = ?",
		chart.LineOfBusiness, chart.RegistryPath, chart.ID)
	if err != nil {
		return fmt.Errorf("failed to update chart: %w", err)
	}
	return nil
}

// GetChartByID retrieves a chart by its ID.
func (r *Repo) GetChartByID(id int) (*Chart, error) {
	var chart Chart
	err := r.DB.QueryRow("SELECT id, name, repository, line_of_business, registry_path FROM charts WHERE id = ?", id).
		Scan(&chart.ID, &chart.Name, &chart.Repository, &chart.LineOfBusiness, &chart.RegistryPath)
	if err != nil {
		return nil, fmt.Errorf("failed to get chart by ID: %w", err)
	}
	return &chart, nil
}

// GetChartByNameAndRepository retrieves a chart by its name and repository.
func (r *Repo) GetChartByNameAndRepository(name, repository string) (*Chart, error) {
	var chart Chart
	err := r.DB.QueryRow("SELECT id, name, repository, line_of_business, registry_path FROM charts WHERE name = ? AND repository = ?", name, repository).
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
func (r *Repo) InsertChartVersion(version ChartVersion) (int64, error) {
	if version.Version == "" || version.CommitSHA == "" {
		return 0, fmt.Errorf("version and commit SHA cannot be empty")
	}
	result, err := r.DB.Exec("INSERT INTO chart_versions (chart_id, version, commit_sha) VALUES (?, ?, ?)",
		version.ChartID, version.Version, version.CommitSHA)
	if err != nil {
		return 0, fmt.Errorf("failed to insert chart version: %w", err)
	}
	return result.LastInsertId()
}

// GetChartVersionByID retrieves a chart version by its ID.
func (r *Repo) GetChartVersionByID(id int) (*ChartVersion, error) {
	var version ChartVersion
	err := r.DB.QueryRow("SELECT id, chart_id, version, commit_sha, created_at FROM chart_versions WHERE id = ?", id).
		Scan(&version.ID, &version.ChartID, &version.Version, &version.CommitSHA, &version.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to get chart version by ID: %w", err)
	}
	return &version, nil
}

// GetChartVersionByChartIDAndVersion retrieves a chart version by chart ID and version.
func (r *Repo) GetChartVersionByChartIDAndVersion(chartID int, version string) (*ChartVersion, error) {
	var chartVersion ChartVersion
	err := r.DB.QueryRow("SELECT id, chart_id, version, commit_sha, created_at FROM chart_versions WHERE chart_id = ? AND version = ?", chartID, version).
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
func (r *Repo) InsertChartVersionPromotion(promotion ChartVersionPromotion) (int64, error) {
	// error if release channel is empty or promoted at is zero
	if promotion.ReleaseChannel == "" {
		return 0, fmt.Errorf("release channel cannot be empty")
	}
	result, err := r.DB.Exec("INSERT INTO chart_version_promotions (chart_id, chart_version_id, release_channel, promoted_at, active) VALUES (?, ?, ?, ?, ?)",
		promotion.ChartID, promotion.ChartVersionID, promotion.ReleaseChannel, promotion.PromotedAt, promotion.Active)
	if err != nil {
		return 0, fmt.Errorf("failed to insert chart version promotion: %w", err)
	}
	return result.LastInsertId()
}

// GetChartVersionPromotionByID retrieves a chart version promotion by its ID.
func (r *Repo) GetChartVersionPromotionByID(id int) (*ChartVersionPromotion, error) {
	var promotion ChartVersionPromotion
	err := r.DB.QueryRow("SELECT id, chart_version_id, release_channel, promoted_at, active FROM chart_version_promotions WHERE id = ?", id).
		Scan(&promotion.ID, &promotion.ChartVersionID, &promotion.ReleaseChannel, &promotion.PromotedAt, &promotion.Active)
	if err != nil {
		return nil, fmt.Errorf("failed to get chart version promotion by ID: %w", err)
	}
	return &promotion, nil
}

// DeactivatePreviousPromotion deactivates the previous promotion for the given chart version and release channel.
func (r *Repo) DeactivatePreviousPromotion(chartID int, releaseChannel string) error {
	_, err := r.DB.Exec("UPDATE chart_version_promotions SET active = false WHERE chart_id = ? AND release_channel = ? AND active = true",
		chartID, releaseChannel)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil
		}
		return fmt.Errorf("failed to deactivate previous promotion: %w", err)
	}
	return nil
}
