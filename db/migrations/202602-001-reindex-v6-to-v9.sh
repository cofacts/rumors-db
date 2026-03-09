#!/bin/bash
#
# Migrates data from Elasticsearch V6 to V9 via remote reindex.
#
# Usage:
#   SOURCE_HOST="http://db:9200" DEST_HOST="localhost:62223" ./migration.sh
#
# Environment variables:
#   SOURCE_HOST  - V6 ES URL (default: http://db:9200)
#   DEST_HOST    - V9 ES host:port without protocol (default: localhost:62223)
#
# Re-run (已做過一次 migration 後想再跑一次):
# - 若只要修正 alias：直接執行 ./migration.sh，Step 1 會略過已存在的 index 並更新 alias。
# - 若要從 V6 重新完整 reindex：Reindex 使用 op_type: create，已存在的 doc 會被略過，
#   所以需先刪除 V9 的目標 index，再執行本 script。
#   刪除範例（請將 DEST 換成 DEST_HOST，例如 http://localhost:62223）:
#
#   DEST="http://localhost:62223"
#   for idx in articlereplyfeedbacks_v1_2_1 urls_v1_1_1 tags_v1_0_2 categories_v1_1_1 airesponses_v1_0_1 replies_v1_1_1 articlecategoryfeedbacks_v1_1_2 analytics_v1_2_1 badges_v1_0_0 users_v1_2_3 replyrequests_v1_1_2 ydocs_v1_0_2 articles_v1_4_1 cooccurrences_v1_0_1; do curl -sf -X DELETE "${DEST}/${idx}-v9" && echo " deleted ${idx}-v9"; done
#   (-f: 404 時不顯示 "deleted"；tags_v1_0_2-v9 若從未 reindex 過會 404，屬正常)
#
# 再執行: ./migration.sh

# V6 服務連線資訊
SOURCE_HOST="${SOURCE_HOST:-http://db:9200}"

# V9 服務連線資訊 (host:port, without protocol)
DEST_HOST="${DEST_HOST:-localhost:62223}"

# 需要轉移的索引列表
INDICES=(
    articlereplyfeedbacks_v1_2_1
    urls_v1_1_1
    tags_v1_0_2
    categories_v1_1_1
    airesponses_v1_0_1
    replies_v1_1_1
    articlecategoryfeedbacks_v1_1_2
    analytics_v1_2_1
    badges_v1_0_0
    users_v1_2_3
    replyrequests_v1_1_2
    ydocs_v1_0_2
    articles_v1_4_1
    cooccurrences_v1_0_1
)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "--- Step 1: Create V9 indices with correct mapping (keyword, nested, etc.) ---"
echo "  SOURCE_HOST=${SOURCE_HOST}"
echo "  DEST_HOST=${DEST_HOST}"
echo ""
(cd "${SCRIPT_DIR}/../.." && ELASTICSEARCH_URL="http://${DEST_HOST}" npx babel-node --extensions .ts,.js db/migrations/202602-000-create-v9-indices.js) || exit 1
echo ""

echo "--- Step 2: Remote Reindex (V6 -> V9) [async] ---"
echo "請記錄每個任務的 task ID 以便查詢進度。"
echo "=========================================================================================="

for SOURCE_INDEX in "${INDICES[@]}"
do
    DEST_INDEX="${SOURCE_INDEX}-v9" # 新的 V9 物理索引名稱

    echo " > 任務啟動: ${SOURCE_INDEX} -> ${DEST_INDEX}"

    curl -X POST "${DEST_HOST}/_reindex?wait_for_completion=false&pretty" -H 'Content-Type: application/json' -d"
{
  \"source\": {
    \"remote\": {
      \"host\": \"${SOURCE_HOST}\"
    },
    \"index\": \"${SOURCE_INDEX}\",
    \"size\": 50
  },
  \"dest\": {
    \"index\": \"${DEST_INDEX}\",
    \"op_type\": \"create\"
  },
  \"conflicts\": \"proceed\"
}"
    echo ""
done

echo "=========================================================================================="
echo "--- 所有 Reindex 任務已啟動。 ---"
echo "--- 注意: tags 無對應 schema，tags_v1_0_2-v9 會由 Reindex 動態建立 (欄位為 text+.keyword)；alias 由 Step 1 的 202602-create-v9-indices 一併設定。 ---"
echo ""
echo "--- 查詢 Reindex 進度（上方 curl 回傳的 task 欄位即為 task_id）---"
echo "  單一任務: curl -s \"http://${DEST_HOST}/_tasks/<task_id>?pretty\""
echo "  全部 reindex 任務: curl -s \"http://${DEST_HOST}/_tasks?detailed=true&actions=*reindex&pretty\""
echo "  進度看 response 內 task.status.created / task.status.total 等。"
