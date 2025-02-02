package main

import (
	"database/sql"
	"encoding/json"
	"flag"
	"fmt"
	"log"

	"github.com/golang-migrate/migrate/v4"

	_ "github.com/golang-migrate/migrate/v4/database/sqlite3"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/mattn/go-sqlite3"

	"nic-chg/commands"
	"nic-chg/repo"
)

func main() {
	// Command line flags
	dbPath := flag.String("db", "db/changelog.db", "The relative path to the SQLite database file")
	upsertChartData := flag.String("upsert-chart", "", "JSON formatted chart data")
	addChartVersionData := flag.String("add-chart-version", "", "JSON formatted chart and chart version data")
	addChartPromotionData := flag.String("add-chart-promotion", "", "JSON formatted chart version promotion data")
	flag.Parse()

	db, err := initializeDatabase(dbPath)
	if err != nil {
		log.Fatalf("Error initializing database: %v", err)
	}
	defer db.Close()

	// Instantiate the Repo struct
	repo := repo.NewRepo(db)

	handleUpsertChart(upsertChartData, repo)
	handleAddChartVersion(addChartVersionData, repo)
	handleAddChartPromotion(addChartPromotionData, repo)
}

func handleUpsertChart(upsertChartData *string, repo *repo.Repo) {
	if *upsertChartData != "" {
		fmt.Println("Received upsert-chart data:", *upsertChartData)
		var input commands.UpsertChartInput
		if err := json.Unmarshal([]byte(*upsertChartData), &input); err != nil {
			log.Fatalf("Error parsing upsert-chart data: %v", err)
		}
		if err := commands.UpsertChart(repo, input); err != nil {
			log.Fatalf("Error upserting chart: %v", err)
		}
		fmt.Println("Chart upserted successfully.")
	}
}

func handleAddChartVersion(addChartVersionData *string, repo *repo.Repo) {
	if *addChartVersionData != "" {
		fmt.Println("Received add-chart-version data:", *addChartVersionData)
		var input commands.AddChartVersionInput
		if err := json.Unmarshal([]byte(*addChartVersionData), &input); err != nil {
			log.Fatalf("Error parsing add-chart-version data: %v", err)
		}
		if err := commands.AddChartVersion(repo, input); err != nil {
			log.Fatalf("Error adding chart version: %v", err)
		}
		fmt.Println("Chart version inserted successfully.")
	}
}

func handleAddChartPromotion(addChartPromotionData *string, repo *repo.Repo) {
	if *addChartPromotionData != "" {
		fmt.Println("Received add-chart-promotion data:", *addChartPromotionData)
		var input commands.AddChartPromotionInput
		if err := json.Unmarshal([]byte(*addChartPromotionData), &input); err != nil {
			log.Fatalf("Error parsing add-chart-promotion data: %v", err)
		}
		if err := commands.AddChartPromotion(repo, input); err != nil {
			log.Fatalf("Error adding chart promotion: %v", err)
		}
		fmt.Println("Chart promotion inserted successfully.")
	}
}

// initializeDatabase sets up the SQLite database and ensures migrations are applied.
func initializeDatabase(dbPath *string) (*sql.DB, error) {
	// Connect to SQLite database
	db, err := sql.Open("sqlite3", fmt.Sprintf("./%s", *dbPath))
	if err != nil {
		return nil, fmt.Errorf("failed to connect to the database: %w", err)
	}

	m, err := migrate.New(
		"file://db/migrations",
		fmt.Sprintf("sqlite3://%s?query", *dbPath))
	if err != nil {
		return nil, fmt.Errorf("failed to initialize db migrations: %w", err)
	}
	err = m.Up()
	if err != nil && err != migrate.ErrNoChange {
		return nil, fmt.Errorf("failed to run db migrations: %w", err)
	}

	fmt.Println("Database initialized successfully.")

	return db, nil
}
