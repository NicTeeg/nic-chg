package repo

import (
	"github.com/stretchr/testify/mock"
)

// MockRepo is a mock implementation of the Repo interface.
type MockRepo struct {
	mock.Mock
}

// InsertChart mocks the InsertChart method.
func (m *MockRepo) InsertChart(chart Chart) (int64, error) {
	args := m.Called(chart)
	return args.Get(0).(int64), args.Error(1)
}

// UpdateChart mocks the UpdateChart method.
func (m *MockRepo) UpdateChart(chart Chart) error {
	args := m.Called(chart)
	return args.Error(0)
}

// GetChartByID mocks the GetChartByID method.
func (m *MockRepo) GetChartByID(id int) (*Chart, error) {
	args := m.Called(id)
	return args.Get(0).(*Chart), args.Error(1)
}

// GetChartByNameAndRepository mocks the GetChartByNameAndRepository method.
func (m *MockRepo) GetChartByNameAndRepository(name, repository string) (*Chart, error) {
	args := m.Called(name, repository)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*Chart), args.Error(1)
}

// InsertChartVersion mocks the InsertChartVersion method.
func (m *MockRepo) InsertChartVersion(version ChartVersion) (int64, error) {
	args := m.Called(version)
	return args.Get(0).(int64), args.Error(1)
}

// GetChartVersionByID mocks the GetChartVersionByID method.
func (m *MockRepo) GetChartVersionByID(id int) (*ChartVersion, error) {
	args := m.Called(id)
	return args.Get(0).(*ChartVersion), args.Error(1)
}

// GetChartVersionByChartIDAndVersion mocks the GetChartVersionByChartIDAndVersion method.
func (m *MockRepo) GetChartVersionByChartIDAndVersion(chartID int, version string) (*ChartVersion, error) {
	args := m.Called(chartID, version)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*ChartVersion), args.Error(1)
}

// InsertChartVersionPromotion mocks the InsertChartVersionPromotion method.
func (m *MockRepo) InsertChartVersionPromotion(promotion ChartVersionPromotion) (int64, error) {
	args := m.Called(promotion)
	return args.Get(0).(int64), args.Error(1)
}

// GetChartVersionPromotionByID mocks the GetChartVersionPromotionByID method.
func (m *MockRepo) GetChartVersionPromotionByID(id int) (*ChartVersionPromotion, error) {
	args := m.Called(id)
	return args.Get(0).(*ChartVersionPromotion), args.Error(1)
}

// DeactivatePreviousPromotion mocks the DeactivatePreviousPromotion method.
func (m *MockRepo) DeactivatePreviousPromotion(chartID int, releaseChannel string) error {
	args := m.Called(chartID, releaseChannel)
	return args.Error(0)
}
