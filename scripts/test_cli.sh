../bin/nic-chg

../bin/nic-chg -upsert-chart='{
  "chart_name": "example-chart",
  "repository": "example-repo",
  "line_of_business": "example-lob",
  "registry_path": "example/path"
}'

../bin/nic-chg -add-chart-version='{
  "chart_name": "example-chart",
  "repository": "example-repo",
  "version": "1.0.0",
  "commit_sha": "abc123",
  "commit_message": "example commit message"
}'

../bin/nic-chg -add-chart-promotion='{
  "chart_name": "example-chart",
  "repository": "example-repo",
  "version": "1.0.1",
  "release_channel": "pre-alpha",
  "promoted_at": "2025-02-01T12:34:56Z"
}'
