package commands

import (
	"errors"
	"testing"

	"nic-chg/repo"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestUpsertChart(t *testing.T) {
	input := UpsertChartInput{
		ChartName:      "test-chart",
		Repository:     "test-repo",
		LineOfBusiness: "test-lob",
		RegistryPath:   "test-path",
	}

	chart := repo.Chart{
		Name:           input.ChartName,
		Repository:     input.Repository,
		LineOfBusiness: input.LineOfBusiness,
		RegistryPath:   input.RegistryPath,
	}

	t.Run("Insert new chart", func(t *testing.T) {
		mockRepo := new(repo.MockRepo)
		mockRepo.On("GetChartByNameAndRepository", chart.Name, chart.Repository).Return(nil, nil)
		mockRepo.On("InsertChart", chart).Return(int64(1), nil)

		err := UpsertChart(mockRepo, input)
		assert.NoError(t, err)

		mockRepo.AssertExpectations(t)
	})

	t.Run("Update existing chart", func(t *testing.T) {
		existingChart := &repo.Chart{
			ID:             1,
			Name:           chart.Name,
			Repository:     chart.Repository,
			LineOfBusiness: "old-lob",
			RegistryPath:   "old-path",
		}
		mockRepo := new(repo.MockRepo)
		mockRepo.On("GetChartByNameAndRepository", chart.Name, chart.Repository).Return(existingChart, nil)
		mockRepo.On("UpdateChart", mock.MatchedBy(func(c repo.Chart) bool {
			return c.ID == existingChart.ID && c.LineOfBusiness == chart.LineOfBusiness && c.RegistryPath == chart.RegistryPath
		})).Return(nil)

		err := UpsertChart(mockRepo, input)
		assert.NoError(t, err)

		mockRepo.AssertExpectations(t)
	})

	t.Run("Error checking if chart exists", func(t *testing.T) {
		mockRepo := new(repo.MockRepo)
		mockRepo.On("GetChartByNameAndRepository", chart.Name, chart.Repository).Return(nil, errors.New("db error"))

		err := UpsertChart(mockRepo, input)
		assert.Error(t, err)
		assert.Equal(t, "error checking if chart exists: db error", err.Error())

		mockRepo.AssertExpectations(t)
	})

	t.Run("Error inserting chart", func(t *testing.T) {
		mockRepo := new(repo.MockRepo)
		mockRepo.On("GetChartByNameAndRepository", chart.Name, chart.Repository).Return(nil, nil)
		mockRepo.On("InsertChart", chart).Return(int64(0), errors.New("insert error"))

		err := UpsertChart(mockRepo, input)
		assert.Error(t, err)
		assert.Equal(t, "error inserting chart: insert error", err.Error())

		mockRepo.AssertExpectations(t)
	})

	t.Run("Error updating chart", func(t *testing.T) {
		existingChart := &repo.Chart{
			ID:             1,
			Name:           chart.Name,
			Repository:     chart.Repository,
			LineOfBusiness: "old-lob",
			RegistryPath:   "old-path",
		}
		mockRepo := new(repo.MockRepo)
		mockRepo.On("GetChartByNameAndRepository", chart.Name, chart.Repository).Return(existingChart, nil)
		mockRepo.On("UpdateChart", mock.MatchedBy(func(c repo.Chart) bool {
			return c.ID == existingChart.ID && c.LineOfBusiness == chart.LineOfBusiness && c.RegistryPath == chart.RegistryPath
		})).Return(errors.New("update error"))

		err := UpsertChart(mockRepo, input)
		assert.Error(t, err)
		assert.Equal(t, "error updating chart: update error", err.Error())

		mockRepo.AssertExpectations(t)
	})
}
