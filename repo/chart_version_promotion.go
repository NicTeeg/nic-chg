package repo

import (
	"time"
)

// ChartVersionPromotion represents a chart version promotion record.
type ChartVersionPromotion struct {
	ID             int       `json:"id"`
	ChartID        int       `json:"chart_id"`
	ChartVersionID int       `json:"chart_version_id"`
	ReleaseChannel string    `json:"release_channel"`
	PromotedAt     time.Time `json:"promoted_at"`
	Active         bool      `json:"active"`
}
