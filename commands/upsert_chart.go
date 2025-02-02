package commands

import (
	"fmt"
	"nic-chg/repo"
)

type UpsertChartInput struct {
	ChartName      string `json:"chart_name"`
	Repository     string `json:"repository"`
	LineOfBusiness string `json:"line_of_business"`
	RegistryPath   string `json:"registry_path"`
}

// UpsertChart inserts or updates a chart in the database.
func UpsertChart(r repo.Repository, input UpsertChartInput) error {
	// Construct the Chart object
	chart := repo.Chart{
		Name:           input.ChartName,
		Repository:     input.Repository,
		LineOfBusiness: input.LineOfBusiness,
		RegistryPath:   input.RegistryPath,
	}

	// Check if the chart already exists
	existingChart, err := r.GetChartByNameAndRepository(chart.Name, chart.Repository)
	if err != nil {
		return fmt.Errorf("error checking if chart exists: %w", err)
	}

	if existingChart != nil {
		// Update the existing chart
		chart.ID = existingChart.ID
		if err := r.UpdateChart(chart); err != nil {
			return fmt.Errorf("error updating chart: %w", err)
		}
	} else {
		// Insert the new chart
		if _, err := r.InsertChart(chart); err != nil {
			return fmt.Errorf("error inserting chart: %w", err)
		}
	}

	return nil
}
