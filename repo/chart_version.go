package repo

// ChartVersion represents a chart version record.
type ChartVersion struct {
	ID            int    `json:"id"`
	ChartID       int    `json:"chart_id"`
	Version       string `json:"version"`
	CommitSHA     string `json:"commit_sha"`
	CommitMessage string `json:"commit_message"`
	CreatedAt     string `json:"created_at"`
}
