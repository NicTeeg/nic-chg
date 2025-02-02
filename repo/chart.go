package repo

// Chart represents a chart record.
type Chart struct {
	ID             int    `json:"id"`
	Name           string `json:"name"`
	Repository     string `json:"repository"`
	LineOfBusiness string `json:"line_of_business"`
	RegistryPath   string `json:"registry_path"`
}
