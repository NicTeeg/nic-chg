package commands

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"nic-chg/repo"
)

// AddChartVersion inserts a chart and chart version into the database.
func AddChartVersion(db *sql.DB, chartData string) error {
	var input struct {
		ChartName     string `json:"chart_name"`
		Repository    string `json:"repository"`
		Version       string `json:"version"`
		CommitSHA     string `json:"commit_sha"`
		CommitMessage string `json:"commit_message"`
	}

	if err := json.Unmarshal([]byte(chartData), &input); err != nil {
		return fmt.Errorf("error parsing chart data: %w", err)
	}

	// Check if the chart already exists
	existingChart, err := repo.GetChartByNameAndRepository(db, input.ChartName, input.Repository)
	if err != nil {
		return fmt.Errorf("error checking if chart exists: %w", err)
	}

	var chartID int64
	if existingChart != nil {
		chartID = int64(existingChart.ID)
	} else {
		// Insert the new chart
		chart := repo.Chart{
			Name:       input.ChartName,
			Repository: input.Repository,
		}
		chartID, err = repo.InsertChart(db, chart)
		if err != nil {
			return fmt.Errorf("error inserting chart: %w", err)
		}
	}

	chartVersion := repo.ChartVersion{
		ChartID:       int(chartID),
		Version:       input.Version,
		CommitSHA:     input.CommitSHA,
		CommitMessage: input.CommitMessage,
	}

	if _, err := repo.InsertChartVersion(db, chartVersion); err != nil {
		return fmt.Errorf("error inserting chart version: %w", err)
	}
	return nil
}
