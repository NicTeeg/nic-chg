rm 'tmp/test.db'
rm 'tmp/nic-chg'

./scripts/build-cli.sh

./tmp/nic-chg -db='tmp/test.db' || exit 1

# Populate Charts
charts=(
  'lob1','a-repository-1','some-chart-repo1-1'
  'lob1','a-repository-1','some-chart-repo1-2'
  'lob1','a-repository-1','some-chart-repo1-3'
  'lob1','a-repository-1','some-chart-repo1-4'
  'lob1','a-repository-1','some-chart-repo1-5-a'
  'lob1','a-repository-1','some-chart-repo1-6-ab'
  'lob1','a-repository-1','some-chart-repo1-7-abc'
  'lob1','a-repository-1','some-chart-repo1-8-abcd'
  'lob1','a-repository-1','some-chart-repo1-9-abcde'
  'lob1','a-repository-2','some-chart-repo2-1'
  'lob1','a-repository-2','some-chart-repo2-2'
  'lob1','a-repository-2','some-chart-repo2-3'
  'lob1','a-repository-3','some-chart-repo3-1'
  'lob1','a-repository-3','some-chart-repo3-2'
  'lob1','a-repository-3','some-chart-repo3-3'
  'lob1','a-repository-7','some-chart-repo7-1'
  'lob1','a-repository-8','some-chart-repo8-1'
  'lob1','a-repository-9','some-chart-repo9-1'
  'lob1','a-repository-10-abc','some-chart-repo10-1'
  'lob1','a-repository-11-abcdef','some-chart-repo11-1'
  'lob1','a-repository-12-abcdefghi','some-chart-repo12-1'
  'lob1','a-repository-13-abcdefghiklm','some-chart-repo13-1'
  'lob1','a-repository-14-abcdefghi-klmnop','some-chart-repo14-1'
  'lob1','a-repository-15-abcdefghik-lmnopqrs','some-chart-repo15-1'
  'lob2','a-repository-4','some-chart-repo4-1'
  'lob2','a-repository-4','some-chart-repo4-2'
  'lob2','a-repository-5','some-chart-repo5-1'
  'lob2','a-repository-5','some-chart-repo5-2'
  'lob2','a-repository-5','some-chart-repo5-3'
  'lob3','a-repository-6','some-chart-repo6-1'
)

a-repository-abcdef-12
a-repository-abcdefghi-13
a-repository-abcdefghi-klmnop-15
a-repository-abcdefghik-lmnopqrs-16
a-repository-abcdefghiklm-14
a-repository-abcdefghiklmnop-qrstuv-17
a-repository-abcdefghiklmnop-qrstuvwxyz-18

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
  'a-repository-1','some-chart-repo1-1','1.0.0','abc123','feat(ui): example commit message','2025-01-01T12:34:56Z'
  'a-repository-1','some-chart-repo1-1','1.0.1','def476','fix(some): another message','2025-01-02T12:34:56Z'
  'a-repository-1','some-chart-repo1-1','1.0.2','cfa596','fix(service): yet another message','2025-01-03T12:34:56Z'
  'a-repository-1','some-chart-repo1-1','1.0.3','bde234','fix(db): still another message','2025-01-04T12:34:56Z'
  'a-repository-1','some-chart-repo1-1','1.0.4','ffc467','fix(some): and another message','2025-01-05T12:34:56Z'
  'a-repository-1','some-chart-repo1-1','1.1.0','bed879','feat(ui): new version','2025-01-06T12:34:56Z'
  'a-repository-1','some-chart-repo1-1','1.1.1','cde234','fix(other): another new version','2025-01-07T12:34:56Z'
  'a-repository-1','some-chart-repo1-1','1.2.0','fde234','feat(dash): yet another new version','2025-01-08T12:34:56Z'
  'a-repository-1','some-chart-repo1-1','1.3.0','bde234','feat(board): still another new version','2025-01-09T12:34:56Z'
  'a-repository-1','some-chart-repo1-1','1.4.0','ffc467','feat(search): another new version with a longer commit message (#10)','2025-01-10T12:34:56Z'
  'a-repository-1','some-chart-repo1-2','1.0.0','bce396','feat(na): example commit message','2025-01-01T12:34:56Z'
  'a-repository-1','some-chart-repo1-2','1.1.0','aaf799','feat(cmop): another message','2025-01-02T12:34:56Z'
  'a-repository-1','some-chart-repo1-2','1.2.0','dfd514','feat(check): yet another message','2025-01-03T12:34:56Z'
  'a-repository-1','some-chart-repo1-2','1.2.1','dfa518','feat(checkfix): yet another message','2025-01-15T12:34:56Z'
  'a-repository-1','some-chart-repo1-3','1.0.0','aae478','feat(test): yet another message','2025-01-01T12:35:56Z'
  'a-repository-1','some-chart-repo1-4','1.0.0','fdb475','feat(test): yet another message','2025-01-01T12:36:56Z'
  'a-repository-1','some-chart-repo1-5-a','1.0.0','add389','feat(test): yet another message','2025-01-01T12:37:56Z'
  'a-repository-1','some-chart-repo1-6-ab','1.0.0','fed836','feat(test): yet another message','2025-01-01T12:37:56Z'
  'a-repository-1','some-chart-repo1-7-abc','1.0.0','ddd498','feat(test): yet another message','2025-01-01T12:37:56Z'
  'a-repository-1','some-chart-repo1-8-abcd','1.0.0','aff993','feat(test): yet another message','2025-01-01T12:37:56Z'
  'a-repository-1','some-chart-repo1-9-abcde','1.0.0','afd132','feat(test): yet another message','2025-01-01T12:37:56Z'
  'a-repository-2','some-chart-repo2-1','1.0.0','fed893','feat(ui): example commit message','2025-01-01T12:34:56Z'
  'a-repository-2','some-chart-repo2-2','1.0.0','def029','feat(service): example commit message','2025-01-02T12:34:56Z'
  'a-repository-2','some-chart-repo2-3','1.0.0','ffe000','feat(test): example commit message','2025-01-03T12:34:56Z'
  'a-repository-3','some-chart-repo3-1','1.0.0','dde433','feat(ui): example commit message','2025-01-01T12:34:56Z'
  'a-repository-3','some-chart-repo3-2','1.0.0','bbc839','feat(ui): example commit message','2025-01-01T12:34:56Z'
  'a-repository-3','some-chart-repo3-3','1.0.0','feb278','feat(ui): example commit message','2025-01-01T12:34:56Z'
  'a-repository-4','some-chart-repo4-1','1.0.0','afb476','feat(ui): example commit message','2025-01-01T12:34:56Z'
  'a-repository-4','some-chart-repo4-2','1.0.0','abd387','feat(ui): example commit message','2025-01-01T12:34:56Z'
  'a-repository-5','some-chart-repo5-1','1.0.0','ffa399','feat(ui): example commit message','2025-01-01T12:34:56Z'
  'a-repository-5','some-chart-repo5-2','1.0.0','bed369','feat(ui): example commit message','2025-01-01T12:34:56Z'
  'a-repository-5','some-chart-repo5-3','1.0.0','daa375','feat(ui): example commit message','2025-01-01T12:34:56Z'
  'a-repository-6','some-chart-repo6-1','1.0.0','abc874','feat(ui): example commit message','2025-01-01T12:34:56Z'
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
  'a-repository-1','some-chart-repo1-1','1.0.0','pre-alpha','2025-01-01T12:34:56Z'
  'a-repository-1','some-chart-repo1-1','1.0.0','alpha','2025-01-01T13:34:56Z'
  'a-repository-1','some-chart-repo1-1','1.0.1','pre-alpha','2025-01-02T12:34:56Z'
  'a-repository-1','some-chart-repo1-1','1.0.2','pre-alpha','2025-01-03T12:34:56Z'
  'a-repository-1','some-chart-repo1-1','1.0.3','pre-alpha','2025-01-04T12:34:56Z'
  'a-repository-1','some-chart-repo1-1','1.0.3','alpha','2025-01-04T13:34:56Z'
  'a-repository-1','some-chart-repo1-1','1.0.4','pre-alpha','2025-01-05T12:34:56Z'
  'a-repository-1','some-chart-repo1-1','1.0.4','alpha','2025-01-05T14:34:56Z'
  'a-repository-1','some-chart-repo1-1','1.0.4','beta','2025-01-05T16:34:56Z'
  'a-repository-1','some-chart-repo1-1','1.0.4','rtm','2025-01-05T18:34:56Z'
  'a-repository-1','some-chart-repo1-1','1.1.0','pre-alpha','2025-01-06T12:34:56Z'
  'a-repository-1','some-chart-repo1-1','1.1.0','alpha','2025-01-06T13:34:56Z'
  'a-repository-1','some-chart-repo1-1','1.1.1','pre-alpha','2025-01-07T12:34:56Z'
  'a-repository-1','some-chart-repo1-1','1.1.1','alpha','2025-01-07T14:34:56Z'
  'a-repository-1','some-chart-repo1-1','1.1.1','beta','2025-01-07T16:34:56Z'
  'a-repository-1','some-chart-repo1-1','1.1.1','rtm','2025-01-07T18:34:56Z'
  'a-repository-1','some-chart-repo1-1','1.2.0','pre-alpha','2025-01-08T12:34:56Z'
  'a-repository-1','some-chart-repo1-1','1.2.0','alpha','2025-01-08T13:34:56Z'
  'a-repository-1','some-chart-repo1-1','1.2.0','beta','2025-01-08T15:34:56Z'
  'a-repository-1','some-chart-repo1-1','1.3.0','pre-alpha','2025-01-09T12:34:56Z'
  'a-repository-1','some-chart-repo1-1','1.3.0','alpha','2025-01-09T13:34:56Z'
  'a-repository-1','some-chart-repo1-1','1.4.0','pre-alpha','2025-01-10T12:34:56Z'
  'a-repository-1','some-chart-repo1-2','1.0.0','pre-alpha','2025-01-01T12:34:56Z'
  'a-repository-1','some-chart-repo1-2','1.1.0','pre-alpha','2025-01-02T12:34:56Z'
  'a-repository-1','some-chart-repo1-2','1.1.0','alpha','2025-01-02T12:34:56Z'
  'a-repository-1','some-chart-repo1-2','1.1.0','beta','2025-01-02T13:34:56Z'
  'a-repository-1','some-chart-repo1-2','1.1.0','rtm','2025-01-02T14:34:56Z'
  'a-repository-1','some-chart-repo1-2','1.2.0','pre-alpha','2025-01-03T12:34:59Z'
  'a-repository-1','some-chart-repo1-2','1.2.1','pre-alpha','2025-01-15T12:34:59Z'
  'a-repository-1','some-chart-repo1-3','1.0.0','pre-alpha','2025-01-01T12:35:59Z'
  'a-repository-1','some-chart-repo1-3','1.0.0','alpha','2025-01-01T13:35:59Z'
  'a-repository-1','some-chart-repo1-3','1.0.0','beta','2025-01-01T14:35:59Z'
  'a-repository-1','some-chart-repo1-3','1.0.0','rtm','2025-01-01T15:35:59Z'
  'a-repository-1','some-chart-repo1-4','1.0.0','pre-alpha','2025-01-01T12:36:59Z'
  'a-repository-1','some-chart-repo1-5-a','1.0.0','pre-alpha','2025-01-01T12:37:59Z'
  'a-repository-1','some-chart-repo1-6-ab','1.0.0','pre-alpha','2025-01-01T12:37:59Z'
  'a-repository-1','some-chart-repo1-7-abc','1.0.0','pre-alpha','2025-01-01T12:37:59Z'
  'a-repository-1','some-chart-repo1-8-abcd','1.0.0','pre-alpha','2025-01-01T12:37:59Z'
  'a-repository-1','some-chart-repo1-9-abcde','1.0.0','pre-alpha','2025-01-01T12:37:59Z'
  'a-repository-2','some-chart-repo2-1','1.0.0','pre-alpha','2025-01-01T12:35:56Z'
  'a-repository-2','some-chart-repo2-1','1.0.0','alpha','2025-01-01T13:35:56Z'
  'a-repository-2','some-chart-repo2-1','1.0.0','beta','2025-01-01T14:35:56Z'
  'a-repository-2','some-chart-repo2-1','1.0.0','rtm','2025-01-01T15:35:56Z'
  'a-repository-2','some-chart-repo2-2','1.0.0','pre-alpha','2025-01-01T12:35:56Z'
  'a-repository-2','some-chart-repo2-3','1.0.0','pre-alpha','2025-01-01T12:35:56Z'
  'a-repository-3','some-chart-repo3-1','1.0.0','pre-alpha','2025-01-01T12:35:56Z'
  'a-repository-3','some-chart-repo3-2','1.0.0','pre-alpha','2025-01-01T12:35:56Z'
  'a-repository-3','some-chart-repo3-3','1.0.0','pre-alpha','2025-01-01T12:35:56Z'
  'a-repository-4','some-chart-repo4-1','1.0.0','pre-alpha','2025-01-01T12:35:56Z'
  'a-repository-4','some-chart-repo4-2','1.0.0','pre-alpha','2025-01-01T12:35:56Z'
  'a-repository-5','some-chart-repo5-1','1.0.0','pre-alpha','2025-01-01T12:35:56Z'
  'a-repository-5','some-chart-repo5-2','1.0.0','pre-alpha','2025-01-01T12:35:56Z'
  'a-repository-5','some-chart-repo5-3','1.0.0','pre-alpha','2025-01-01T12:35:56Z'
  'a-repository-6','some-chart-repo6-1','1.0.0','pre-alpha','2025-01-01T12:35:56Z'
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