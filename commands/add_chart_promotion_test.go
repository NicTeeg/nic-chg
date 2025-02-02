package commands

import (
	"errors"
	"testing"
	"time"

	"nic-chg/repo"

	"github.com/stretchr/testify/assert"
)

func TestAddChartPromotion(t *testing.T) {
	input := AddChartPromotionInput{
		ChartName:      "test-chart",
		Repository:     "test-repo",
		Version:        "1.0.0",
		ReleaseChannel: "stable",
		PromotedAt:     "2025-02-01T12:34:56Z",
	}

	chart := &repo.Chart{
		ID:         1,
		Name:       input.ChartName,
		Repository: input.Repository,
	}

	chartVersion := &repo.ChartVersion{
		ID:      1,
		ChartID: chart.ID,
		Version: input.Version,
	}

	promotedAt, _ := time.Parse(time.RFC3339, input.PromotedAt)

	promotion := repo.ChartVersionPromotion{
		ChartID:        chart.ID,
		ChartVersionID: chartVersion.ID,
		ReleaseChannel: input.ReleaseChannel,
		PromotedAt:     promotedAt,
		Active:         true,
	}

	t.Run("Add chart promotion successfully", func(t *testing.T) {
		mockRepo := new(repo.MockRepo)
		mockRepo.On("GetChartByNameAndRepository", input.ChartName, input.Repository).Return(chart, nil)
		mockRepo.On("GetChartVersionByChartIDAndVersion", chart.ID, input.Version).Return(chartVersion, nil)
		mockRepo.On("DeactivatePreviousPromotion", chart.ID, input.ReleaseChannel).Return(nil)
		mockRepo.On("InsertChartVersionPromotion", promotion).Return(int64(1), nil)

		err := AddChartPromotion(mockRepo, input)
		assert.NoError(t, err)

		mockRepo.AssertExpectations(t)
	})

	t.Run("Error retrieving chart", func(t *testing.T) {
		mockRepo := new(repo.MockRepo)
		mockRepo.On("GetChartByNameAndRepository", input.ChartName, input.Repository).Return(nil, errors.New("db error"))

		err := AddChartPromotion(mockRepo, input)
		assert.Error(t, err)
		assert.Equal(t, "error retrieving chart: db error", err.Error())

		mockRepo.AssertExpectations(t)
	})

	t.Run("Chart not found", func(t *testing.T) {
		mockRepo := new(repo.MockRepo)
		mockRepo.On("GetChartByNameAndRepository", input.ChartName, input.Repository).Return(nil, nil)

		err := AddChartPromotion(mockRepo, input)
		assert.Error(t, err)
		assert.Equal(t, "chart not found: test-chart/test-repo", err.Error())

		mockRepo.AssertExpectations(t)
	})

	t.Run("Error retrieving chart version", func(t *testing.T) {
		mockRepo := new(repo.MockRepo)
		mockRepo.On("GetChartByNameAndRepository", input.ChartName, input.Repository).Return(chart, nil)
		mockRepo.On("GetChartVersionByChartIDAndVersion", chart.ID, input.Version).Return(nil, errors.New("db error"))

		err := AddChartPromotion(mockRepo, input)
		assert.Error(t, err)
		assert.Equal(t, "error retrieving chart version: db error", err.Error())

		mockRepo.AssertExpectations(t)
	})

	t.Run("Chart version not found", func(t *testing.T) {
		mockRepo := new(repo.MockRepo)
		mockRepo.On("GetChartByNameAndRepository", input.ChartName, input.Repository).Return(chart, nil)
		mockRepo.On("GetChartVersionByChartIDAndVersion", chart.ID, input.Version).Return(nil, nil)

		err := AddChartPromotion(mockRepo, input)
		assert.Error(t, err)
		assert.Equal(t, "chart version not found: test-chart/test-repo:1.0.0", err.Error())

		mockRepo.AssertExpectations(t)
	})

	t.Run("Error deactivating previous promotion", func(t *testing.T) {
		mockRepo := new(repo.MockRepo)
		mockRepo.On("GetChartByNameAndRepository", input.ChartName, input.Repository).Return(chart, nil)
		mockRepo.On("GetChartVersionByChartIDAndVersion", chart.ID, input.Version).Return(chartVersion, nil)
		mockRepo.On("DeactivatePreviousPromotion", chart.ID, input.ReleaseChannel).Return(errors.New("db error"))

		err := AddChartPromotion(mockRepo, input)
		assert.Error(t, err)
		assert.Equal(t, "error deactivating previous promotion: db error", err.Error())

		mockRepo.AssertExpectations(t)
	})

	t.Run("Error inserting chart version promotion", func(t *testing.T) {
		mockRepo := new(repo.MockRepo)
		mockRepo.On("GetChartByNameAndRepository", input.ChartName, input.Repository).Return(chart, nil)
		mockRepo.On("GetChartVersionByChartIDAndVersion", chart.ID, input.Version).Return(chartVersion, nil)
		mockRepo.On("DeactivatePreviousPromotion", chart.ID, input.ReleaseChannel).Return(nil)
		mockRepo.On("InsertChartVersionPromotion", promotion).Return(int64(0), errors.New("insert error"))

		err := AddChartPromotion(mockRepo, input)
		assert.Error(t, err)
		assert.Equal(t, "error inserting chart version promotion: insert error", err.Error())

		mockRepo.AssertExpectations(t)
	})
}
