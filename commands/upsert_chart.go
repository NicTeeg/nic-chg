package commands

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"nic-chg/repo"
)

// UpsertChart inserts or updates a chart in the database.
func UpsertChart(db *sql.DB, chartData string) error {
	var input struct {
		Name           string `json:"chart_name"`
		Repository     string `json:"repository"`
		LineOfBusiness string `json:"line_of_business"`
		RegistryPath   string `json:"registry_path"`
	}

	if err := json.Unmarshal([]byte(chartData), &input); err != nil {
		return fmt.Errorf("error parsing chart data: %w", err)
	}

	// Construct the Chart object
	chart := repo.Chart{
		Name:           input.Name,
		Repository:     input.Repository,
		LineOfBusiness: input.LineOfBusiness,
		RegistryPath:   input.RegistryPath,
	}

	// Check if the chart already exists
	existingChart, err := repo.GetChartByNameAndRepository(db, chart.Name, chart.Repository)
	if err != nil && err != sql.ErrNoRows {
		return fmt.Errorf("error checking if chart exists: %w", err)
	}

	if existingChart != nil {
		// Update the existing chart
		chart.ID = existingChart.ID
		if err := repo.UpdateChart(db, chart); err != nil {
			return fmt.Errorf("error updating chart: %w", err)
		}
	} else {
		// Insert the new chart
		if _, err := repo.InsertChart(db, chart); err != nil {
			return fmt.Errorf("error inserting chart: %w", err)
		}
	}

	return nil
}
