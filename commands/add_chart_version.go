package commands

import (
	"fmt"
	"nic-chg/repo"
)

type AddChartVersionInput struct {
	ChartName     string `json:"chart_name"`
	Repository    string `json:"repository"`
	Version       string `json:"version"`
	CommitSHA     string `json:"commit_sha"`
	CommitMessage string `json:"commit_message"`
}

// AddChartVersion inserts a chart and chart version into the database.
func AddChartVersion(r repo.Repository, input AddChartVersionInput) error {
	// Check if the chart already exists
	existingChart, err := r.GetChartByNameAndRepository(input.ChartName, input.Repository)
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
		chartID, err = r.InsertChart(chart)
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

	if _, err := r.InsertChartVersion(chartVersion); err != nil {
		return fmt.Errorf("error inserting chart version: %w", err)
	}
	return nil
}
