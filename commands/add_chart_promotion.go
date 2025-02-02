package commands

import (
	"encoding/json"
	"fmt"
	"nic-chg/repo"
	"time"
)

// AddChartPromotion inserts a chart version promotion into the database.
func AddChartPromotion(r *repo.Repo, promotionData string) error {
	var input struct {
		ChartName      string `json:"chart_name"`
		Repository     string `json:"repository"`
		Version        string `json:"version"`
		ReleaseChannel string `json:"release_channel"`
		PromotedAt     string `json:"promoted_at"`
	}
	if err := json.Unmarshal([]byte(promotionData), &input); err != nil {
		return fmt.Errorf("error parsing promotion data: %w", err)
	}

	// Retrieve the chart by name and repository
	chart, err := r.GetChartByNameAndRepository(input.ChartName, input.Repository)
	if err != nil {
		return fmt.Errorf("error retrieving chart: %w", err)
	}

	if chart == nil {
		return fmt.Errorf("chart not found: %s/%s", input.ChartName, input.Repository)
	}

	// Retrieve the chart version by chart ID and version
	chartVersion, err := r.GetChartVersionByChartIDAndVersion(chart.ID, input.Version)
	if err != nil {
		return fmt.Errorf("error retrieving chart version: %w", err)
	}

	if chartVersion == nil {
		return fmt.Errorf("chart version not found: %s/%s:%s", input.ChartName, input.Repository, input.Version)
	}

	// Deactivate the previous promotion for the same release channel
	if err := r.DeactivatePreviousPromotion(chart.ID, input.ReleaseChannel); err != nil {
		return fmt.Errorf("error deactivating previous promotion: %w", err)
	}

	// Parse the promoted_at timestamp
	promotedAt, err := time.Parse(time.RFC3339, input.PromotedAt)
	if err != nil {
		return fmt.Errorf("error parsing promoted_at timestamp: %w", err)
	}

	// Insert the chart version promotion
	promotion := repo.ChartVersionPromotion{
		ChartID:        chart.ID,
		ChartVersionID: chartVersion.ID,
		ReleaseChannel: input.ReleaseChannel,
		PromotedAt:     promotedAt,
		Active:         true,
	}

	if _, err := r.InsertChartVersionPromotion(promotion); err != nil {
		return fmt.Errorf("error inserting chart version promotion: %w", err)
	}

	return nil
}
