package commands

import (
	"errors"
	"testing"

	"nic-chg/repo"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestAddChartVersion(t *testing.T) {
	input := AddChartVersionInput{
		ChartName:     "test-chart",
		Repository:    "test-repo",
		Version:       "1.0.0",
		CommitSHA:     "abc123",
		CommitMessage: "initial commit",
	}

	chart := repo.Chart{
		Name:       input.ChartName,
		Repository: input.Repository,
	}

	t.Run("Insert new chart and version", func(t *testing.T) {
		mockRepo := new(repo.MockRepo)
		mockRepo.On("GetChartByNameAndRepository", chart.Name, chart.Repository).Return(nil, nil)
		mockRepo.On("InsertChart", chart).Return(int64(1), nil)
		mockRepo.On("InsertChartVersion", mock.MatchedBy(func(cv repo.ChartVersion) bool {
			return cv.ChartID == 1 && cv.Version == input.Version && cv.CommitSHA == input.CommitSHA && cv.CommitMessage == input.CommitMessage
		})).Return(int64(1), nil)

		err := AddChartVersion(mockRepo, input)
		assert.NoError(t, err)

		mockRepo.AssertExpectations(t)
	})

	t.Run("Insert version for existing chart", func(t *testing.T) {
		existingChart := &repo.Chart{
			ID:         1,
			Name:       chart.Name,
			Repository: chart.Repository,
		}
		mockRepo := new(repo.MockRepo)
		mockRepo.On("GetChartByNameAndRepository", chart.Name, chart.Repository).Return(existingChart, nil)
		mockRepo.On("InsertChartVersion", mock.MatchedBy(func(cv repo.ChartVersion) bool {
			return cv.ChartID == existingChart.ID && cv.Version == input.Version && cv.CommitSHA == input.CommitSHA && cv.CommitMessage == input.CommitMessage
		})).Return(int64(1), nil)

		err := AddChartVersion(mockRepo, input)
		assert.NoError(t, err)

		mockRepo.AssertExpectations(t)
	})

	t.Run("Error checking if chart exists", func(t *testing.T) {
		mockRepo := new(repo.MockRepo)
		mockRepo.On("GetChartByNameAndRepository", chart.Name, chart.Repository).Return(nil, errors.New("db error"))

		err := AddChartVersion(mockRepo, input)
		assert.Error(t, err)
		assert.Equal(t, "error checking if chart exists: db error", err.Error())

		mockRepo.AssertExpectations(t)
	})

	t.Run("Error inserting chart", func(t *testing.T) {
		mockRepo := new(repo.MockRepo)
		mockRepo.On("GetChartByNameAndRepository", chart.Name, chart.Repository).Return(nil, nil)
		mockRepo.On("InsertChart", chart).Return(int64(0), errors.New("insert error"))

		err := AddChartVersion(mockRepo, input)
		assert.Error(t, err)
		assert.Equal(t, "error inserting chart: insert error", err.Error())

		mockRepo.AssertExpectations(t)
	})

	t.Run("Error inserting chart version", func(t *testing.T) {
		existingChart := &repo.Chart{
			ID:         1,
			Name:       chart.Name,
			Repository: chart.Repository,
		}
		mockRepo := new(repo.MockRepo)
		mockRepo.On("GetChartByNameAndRepository", chart.Name, chart.Repository).Return(existingChart, nil)
		mockRepo.On("InsertChartVersion", mock.MatchedBy(func(cv repo.ChartVersion) bool {
			return cv.ChartID == existingChart.ID && cv.Version == input.Version && cv.CommitSHA == input.CommitSHA && cv.CommitMessage == input.CommitMessage
		})).Return(int64(0), errors.New("insert version error"))

		err := AddChartVersion(mockRepo, input)
		assert.Error(t, err)
		assert.Equal(t, "error inserting chart version: insert version error", err.Error())

		mockRepo.AssertExpectations(t)
	})
}
