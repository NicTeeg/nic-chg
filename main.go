package main

import (
	"database/sql"
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
	upsertChartData := flag.String("upsert-chart", "", "JSON formatted chart data")
	addChartVersionData := flag.String("add-chart-version", "", "JSON formatted chart and chart version data")
	addChartPromotionData := flag.String("add-chart-promotion", "", "JSON formatted chart version promotion data")
	flag.Parse()

	db, err := initializeDatabase()
	if err != nil {
		log.Fatalf("Error initializing database: %v", err)
	}
	defer db.Close()

	// Instantiate the Repo struct
	repo := repo.NewRepo(db)

	if *upsertChartData != "" {
		fmt.Println("Received upsert-chart data:", *upsertChartData)
		if err := commands.UpsertChart(repo, *upsertChartData); err != nil {
			log.Fatalf("Error upserting chart: %v", err)
		}
		fmt.Println("Chart upserted successfully.")
	}

	if *addChartVersionData != "" {
		fmt.Println("Received add-chart-version data:", *addChartVersionData)
		if err := commands.AddChartVersion(repo, *addChartVersionData); err != nil {
			log.Fatalf("Error adding chart version: %v", err)
		}
		fmt.Println("Chart version inserted successfully.")
	}

	if *addChartPromotionData != "" {
		fmt.Println("Received add-chart-promotion data:", *addChartPromotionData)
		if err := commands.AddChartPromotion(repo, *addChartPromotionData); err != nil {
			log.Fatalf("Error adding chart promotion: %v", err)
		}
		fmt.Println("Chart promotion inserted successfully.")
	}
}

// initializeDatabase sets up the SQLite database and ensures migrations are applied.
func initializeDatabase() (*sql.DB, error) {
	// Connect to SQLite database
	db, err := sql.Open("sqlite3", "./db/changelog.db")
	if err != nil {
		return nil, fmt.Errorf("failed to connect to the database: %w", err)
	}

	m, err := migrate.New(
		"file://db/migrations",
		"sqlite3://db/changelog.db?query")
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
