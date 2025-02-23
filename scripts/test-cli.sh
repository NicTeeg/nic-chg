./tmp/nic-chg -db='tmp/test.db' || exit 1

# Populate Charts
./tmp/nic-chg -db='tmp/test.db' -upsert-chart='{
  "chart_name": "example-chart",
  "repository": "example-repo",
  "line_of_business": "example-lob",
  "registry_path": "org/lob/repo/chart"
}' || exit 1

./tmp/nic-chg -db='tmp/test.db' -upsert-chart='{
  "chart_name": "example-chart2",
  "repository": "example-repo",
  "line_of_business": "example-lob",
  "registry_path": "org/lob/repo/chart2"
}' || exit 1

./tmp/nic-chg -db='tmp/test.db' -upsert-chart='{
  "chart_name": "example-chart3",
  "repository": "example-repo",
  "line_of_business": "example-lob"
}' || exit 1

./tmp/nic-chg -db='tmp/test.db' -upsert-chart='{
  "chart_name": "example-chart",
  "repository": "example-repo2",
  "line_of_business": "example-lob",
  "registry_path": "org/lob/repo2/chart"
}' || exit 1

./tmp/nic-chg -db='tmp/test.db' -upsert-chart='{
  "chart_name": "example-chart",
  "repository": "example-repo3",
  "line_of_business": "example-lob2",
  "registry_path": "org/lob/repo/chart2"
}' || exit 1

./tmp/nic-chg -db='tmp/test.db' -add-chart-version='{
  "chart_name": "example-chart",
  "repository": "example-repo",
  "version": "1.0.0",
  "commit_sha": "abc123",
  "commit_message": "example commit message"
}' || exit 1

./tmp/nic-chg -db='tmp/test.db' -add-chart-promotion='{
  "chart_name": "example-chart",
  "repository": "example-repo",
  "version": "1.0.0",
  "release_channel": "pre-alpha",
  "promoted_at": "2025-02-01T12:34:56Z"
}' || exit 1

./tmp/nic-chg -db='tmp/test.db' -add-chart-promotion='{
  "chart_name": "example-chart",
  "repository": "example-repo",
  "version": "1.0.0",
  "release_channel": "alpha",
  "promoted_at": "2025-02-01T12:34:56Z"
}' || exit 1

./tmp/nic-chg -db='tmp/test.db' -add-chart-version='{
  "chart_name": "example-chart",
  "repository": "example-repo",
  "version": "1.0.1",
  "commit_sha": "abc123",
  "commit_message": "example commit message"
}' || exit 1

./tmp/nic-chg -db='tmp/test.db' -add-chart-promotion='{
  "chart_name": "example-chart",
  "repository": "example-repo",
  "version": "1.0.1",
  "release_channel": "pre-alpha",
  "promoted_at": "2025-02-01T12:34:56Z"
}' || exit 1