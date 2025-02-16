rm 'tmp/test.db'
rm 'tmp/nic-chg'

./scripts/build-cli.sh

./tmp/nic-chg -db='tmp/test.db' || exit 1

# Populate Charts
charts=(
  'lob1','a-repository-1','some-chart-1'
  'lob1','a-repository-1','some-chart-2'
  'lob1','a-repository-1','some-chart-3'
  'lob1','a-repository-1','some-chart-4'
  'lob1','a-repository-1','some-chart-5'
  'lob1','a-repository-2','some-chart-1'
  'lob1','a-repository-2','some-chart-2'
  'lob1','a-repository-2','some-chart-3'
  'lob1','a-repository-3','some-chart-1'
  'lob1','a-repository-3','some-chart-2'
  'lob1','a-repository-3','some-chart-3'
  'lob2','a-repository-4','some-chart-1'
  'lob2','a-repository-4','some-chart-2'
  'lob2','a-repository-5','some-chart-1'
  'lob2','a-repository-5','some-chart-2'
  'lob2','a-repository-5','some-chart-3'
  'lob3','a-repository-6','some-chart-1'
)

for chart in "${charts[@]}"; do
  IFS=',' read -r -a chart_data <<< "$chart"

  ./tmp/nic-chg -db='tmp/test.db' -upsert-chart="{
    \"chart_name\": \"${chart_data[2]}\",
    \"repository\": \"${chart_data[1]}\",
    \"line_of_business\": \"${chart_data[0]}\",
    \"registry_path\": \"org/${chart_data[0]}/${chart_data[1]}/${chart_data[2]}\"
  }" || exit 1
done

versions=(
  'a-repository-1','some-chart-1','1.0.0','abc123','feat(ui): example commit message','2025-01-01T12:34:56Z'
  'a-repository-1','some-chart-1','1.0.1','def476','fix(some): another message','2025-01-02T12:34:56Z'
  'a-repository-1','some-chart-1','1.0.2','cfa596','fix(service): yet another message','2025-01-03T12:34:56Z'
  'a-repository-1','some-chart-1','1.0.3','bde234','fix(db): still another message','2025-01-04T12:34:56Z'
  'a-repository-1','some-chart-1','1.0.4','ffc467','fix(some): and another message','2025-01-05T12:34:56Z'
  'a-repository-1','some-chart-1','1.1.0','bed879','feat(ui): new version','2025-01-06T12:34:56Z'
  'a-repository-1','some-chart-1','1.1.1','cde234','fix(other): another new version','2025-01-07T12:34:56Z'
  'a-repository-1','some-chart-1','1.2.0','fde234','feat(dash): yet another new version','2025-01-08T12:34:56Z'
  'a-repository-1','some-chart-1','1.3.0','bde234','feat(board): still another new version','2025-01-09T12:34:56Z'
  'a-repository-1','some-chart-1','1.4.0','ffc467','feat(search): another new version with a longer commit message (#10)','2025-01-10T12:34:56Z'
  'a-repository-1','some-chart-2','1.0.0','bce396','feat(na): example commit message','2025-01-01T12:34:56Z'
  'a-repository-1','some-chart-2','1.1.0','aaf799','feat(cmop): another message','2025-01-02T12:34:56Z'
  'a-repository-1','some-chart-2','1.2.0','dfd514','feat(check): yet another message','2025-01-03T12:34:56Z'
  'a-repository-1','some-chart-3','1.0.0','aae478','feat(test): yet another message','2025-01-01T12:35:56Z'
  'a-repository-1','some-chart-4','1.0.0','fdb475','feat(thing): yet another message','2025-01-01T12:36:56Z'
  'a-repository-1','some-chart-5','1.0.0','add389','feat(stuff): yet another message','2025-01-01T12:37:56Z'
  'a-repository-2','some-chart-1','1.0.0','aec123','feat(ui): example commit message','2025-01-01T12:34:56Z'
)

for version in "${versions[@]}"; do
  IFS=',' read -r -a version_data <<< "$version"

  ./tmp/nic-chg -db='tmp/test.db' -add-chart-version="{
    \"repository\": \"${version_data[0]}\",
    \"chart_name\": \"${version_data[1]}\",
    \"version\": \"${version_data[2]}\",
    \"commit_sha\": \"${version_data[3]}\",
    \"commit_message\": \"${version_data[4]}\",
    \"created_at\": \"${version_data[5]}\"
  }" || exit 1
done

promotions=(
  'a-repository-1','some-chart-1','1.0.0','pre-alpha','2025-01-01T12:34:56Z'
  'a-repository-1','some-chart-1','1.0.0','alpha','2025-01-01T13:34:56Z'
  'a-repository-1','some-chart-1','1.0.1','pre-alpha','2025-01-02T12:34:56Z'
  'a-repository-1','some-chart-1','1.0.2','pre-alpha','2025-01-03T12:34:56Z'
  'a-repository-1','some-chart-1','1.0.3','pre-alpha','2025-01-04T12:34:56Z'
  'a-repository-1','some-chart-1','1.0.3','alpha','2025-01-04T13:34:56Z'
  'a-repository-1','some-chart-1','1.0.4','pre-alpha','2025-01-05T12:34:56Z'
  'a-repository-1','some-chart-1','1.0.4','alpha','2025-01-05T14:34:56Z'
  'a-repository-1','some-chart-1','1.0.4','beta','2025-01-05T16:34:56Z'
  'a-repository-1','some-chart-1','1.0.4','rtm','2025-01-05T18:34:56Z'
  'a-repository-1','some-chart-1','1.1.0','pre-alpha','2025-01-06T12:34:56Z'
  'a-repository-1','some-chart-1','1.1.0','alpha','2025-01-06T13:34:56Z'
  'a-repository-1','some-chart-1','1.1.1','pre-alpha','2025-01-07T12:34:56Z'
  'a-repository-1','some-chart-1','1.1.1','alpha','2025-01-07T14:34:56Z'
  'a-repository-1','some-chart-1','1.1.1','beta','2025-01-07T16:34:56Z'
  'a-repository-1','some-chart-1','1.1.1','rtm','2025-01-07T18:34:56Z'
  'a-repository-1','some-chart-1','1.2.0','pre-alpha','2025-01-08T12:34:56Z'
  'a-repository-1','some-chart-1','1.2.0','alpha','2025-01-08T13:34:56Z'
  'a-repository-1','some-chart-1','1.2.0','beta','2025-01-08T15:34:56Z'
  'a-repository-1','some-chart-1','1.3.0','pre-alpha','2025-01-09T12:34:56Z'
  'a-repository-1','some-chart-1','1.3.0','alpha','2025-01-09T13:34:56Z'
  'a-repository-1','some-chart-1','1.4.0','pre-alpha','2025-01-10T12:34:56Z'
  'a-repository-1','some-chart-2','1.0.0','pre-alpha','2025-01-01T12:34:56Z'
  'a-repository-1','some-chart-2','1.1.0','pre-alpha','2025-01-02T12:34:56Z'
  'a-repository-1','some-chart-2','1.1.0','alpha','2025-01-02T12:34:56Z'
  'a-repository-1','some-chart-2','1.1.0','beta','2025-01-02T13:34:56Z'
  'a-repository-1','some-chart-2','1.1.0','rtm','2025-01-02T14:34:56Z'
  'a-repository-1','some-chart-2','1.2.0','pre-alpha','2025-01-03T12:34:56Z'
  'a-repository-1','some-chart-3','1.0.0','pre-alpha','2025-01-01T12:35:59Z'
  'a-repository-1','some-chart-3','1.0.0','alpha','2025-01-01T13:35:59Z'
  'a-repository-1','some-chart-3','1.0.0','beta','2025-01-01T14:35:59Z'
  'a-repository-1','some-chart-3','1.0.0','rtm','2025-01-01T15:35:59Z'
  'a-repository-1','some-chart-4','1.0.0','pre-alpha','2025-01-01T12:36:59Z'
  'a-repository-1','some-chart-5','1.0.0','pre-alpha','2025-01-01T12:37:59Z'
  'a-repository-2','some-chart-1','1.0.0','pre-alpha','2025-01-01T12:34:56Z'
  'a-repository-2','some-chart-1','1.0.0','alpha','2025-01-01T13:34:56Z'
  'a-repository-2','some-chart-1','1.0.0','beta','2025-01-01T14:34:56Z'
  'a-repository-2','some-chart-1','1.0.0','rtm','2025-01-01T15:34:56Z'
)

for promotion in "${promotions[@]}"; do
  IFS=',' read -r -a promotion_data <<< "$promotion"

  ./tmp/nic-chg -db='tmp/test.db' -add-chart-promotion="{
    \"repository\": \"${promotion_data[0]}\",
    \"chart_name\": \"${promotion_data[1]}\",
    \"version\": \"${promotion_data[2]}\",
    \"release_channel\": \"${promotion_data[3]}\",
    \"promoted_at\": \"${promotion_data[4]}\"
  }" || exit 1
done

cp 'tmp/test.db' 'app/public/changelog.db'