<script setup lang="ts">
import { LANGUAGES, useScriptStore } from '~/stores/script'
import type { ReconcileIssue } from '~/types'

const store = useScriptStore()
const activeTab = ref('recordings')
const listFilter = ref('')

const pkg = computed(() => store.selectedPackage)
const exhibit = computed(() => store.selectedExhibit)
const pendingDecisions = computed(() => store.pendingDecisions)
const issues = computed(() => store.unacknowledgedIssues)
const acknowledgedRows = computed(() =>
  store.reconcileIssues.filter(issue => store.acknowledgedIssues.includes(issue.key))
)

const activeEntries = computed(() => pkg.value?.entries.filter(item => !item.orphan) ?? [])
const orphanEntries = computed(() => pkg.value?.entries.filter(item => item.orphan) ?? [])
const filteredEntries = computed(() => {
  const keyword = listFilter.value.trim().toLowerCase()
  if (!keyword) return activeEntries.value
  return activeEntries.value.filter(item => `${item.label} ${item.text}`.toLowerCase().includes(keyword))
})
const recordedCount = computed(() => activeEntries.value.filter(item => item.status === 'recorded').length)
const progress = computed(() => activeEntries.value.length ? Math.round(recordedCount.value / activeEntries.value.length * 100) : 0)

function formatTime(value?: string) {
  return value ? new Date(value).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }) : '—'
}
function jumpTo(issue: ReconcileIssue) {
  if (issue.kind === 'draft-missing') return
  store.selectHall(store.halls.find(hall => hall.id === store.exhibits.find(item => item.id === issue.exhibitId)?.hallId)?.id || store.selectedHallId)
  store.selectExhibit(issue.exhibitId)
  store.selectLanguage(issue.languageId)
  activeTab.value = issue.kind === 'orphan-entry' ? 'recordings' : 'reconcile'
}
</script>

<template>
  <div>
    <v-alert class="mb-4" color="secondary" variant="tonal" density="compact" icon="mdi-clipboard-text-clock-outline">
      导览制作侧只按<b>上次送审版本</b>组织录音；展陈编辑侧的未送审改动不会出现在清单里。讲解词未变的条目不重录。
    </v-alert>

    <v-tabs v-model="activeTab" color="secondary" bg-color="surface" rounded="lg" class="mb-4 px-2">
      <v-tab value="recordings">
        录制清单
        <v-chip v-if="pkg" size="x-small" variant="tonal" class="ms-2">{{ recordedCount }}/{{ activeEntries.length }}</v-chip>
      </v-tab>
      <v-tab value="decisions">
        待制作组定夺
        <v-chip v-if="pendingDecisions.length" size="x-small" color="warning" variant="tonal" class="ms-2">{{ pendingDecisions.length }}</v-chip>
      </v-tab>
      <v-tab value="reconcile">
        两边对账
        <v-chip v-if="issues.length" size="x-small" color="error" variant="tonal" class="ms-2">{{ issues.length }}</v-chip>
      </v-tab>
    </v-tabs>

    <v-window v-model="activeTab" :touch="false">
      <!-- 录制清单 -->
      <v-window-item value="recordings">
        <v-card v-if="pkg" class="script-card pa-4 pa-md-6">
          <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4">
            <div>
              <div class="section-title">录制条目（按上次送审版）</div>
              <div class="text-body-2 mt-1">
                {{ exhibit?.code }} · {{ exhibit?.title }} ·
                {{ LANGUAGES.find(item => item.id === pkg?.languageId)?.label }}
              </div>
              <div class="text-caption text-medium-emphasis mt-1">{{ pkg.submitName }} · 送审于 {{ formatTime(pkg.submittedAt) }}</div>
            </div>
            <div class="text-right">
              <v-progress-circular :model-value="progress" size="56" width="6" color="secondary">{{ progress }}%</v-progress-circular>
            </div>
          </div>

          <v-alert v-if="orphanEntries.length" type="warning" variant="tonal" class="mb-4">
            有 {{ orphanEntries.length }} 个条目在送审版里已找不到对应段落，录音文件保留，请到“两边对账”确认。
          </v-alert>

          <v-text-field v-model="listFilter" density="compact" hide-details prepend-inner-icon="mdi-magnify" placeholder="筛选条目文本" aria-label="筛选录制条目" class="mb-3" />

          <v-row>
            <v-col v-for="item in filteredEntries" :key="item.segmentId" cols="12" md="6">
              <v-card variant="tonal" class="pa-4 entry-card" :class="item.status">
                <div class="d-flex align-center ga-2 mb-2">
                  <v-icon :color="item.status === 'recorded' ? 'success' : 'warning'">{{ item.status === 'recorded' ? 'mdi-microphone-check' : 'mdi-microphone-off' }}</v-icon>
                  <div class="font-weight-medium flex-grow-1">{{ item.label }}</div>
                  <v-chip size="small" :color="item.status === 'recorded' ? 'success' : 'warning'" variant="tonal">
                    {{ item.status === 'recorded' ? '已录音' : '待录' }}
                  </v-chip>
                </div>
                <p class="text-body-2 mb-3" style="line-height:1.8;white-space:pre-wrap">{{ item.text }}</p>
                <div class="text-caption text-medium-emphasis mb-2">
                  {{ item.status === 'recorded' ? `录音时间 ${formatTime(item.recordedAt)}` : '尚未录音' }}
                </div>
                <div class="d-flex ga-2">
                  <v-btn v-if="item.status === 'pending'" size="small" color="secondary" variant="tonal" prepend-icon="mdi-check" @click="store.setEntryRecorded(exhibit!.id, pkg!.languageId, item.segmentId, true)">标记已录音</v-btn>
                  <v-btn v-else size="small" variant="outlined" prepend-icon="mdi-undo" @click="store.setEntryRecorded(exhibit!.id, pkg!.languageId, item.segmentId, false)">退回待录</v-btn>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <v-divider class="my-5" />
          <div class="section-title mb-3">本次送审版随附资料（不触发重录）</div>
          <v-row>
            <v-col cols="12" md="6">
              <div class="text-caption text-medium-emphasis mb-1">无障碍描述</div>
              <p class="text-body-2" style="white-space:pre-wrap;line-height:1.8">{{ pkg.accessibility }}</p>
            </v-col>
            <v-col cols="12" md="6">
              <div class="text-caption text-medium-emphasis mb-1">资料来源</div>
              <p class="text-body-2" style="white-space:pre-wrap;line-height:1.8">{{ pkg.sources }}</p>
              <div class="text-caption text-medium-emphasis mt-2">预计时长 {{ pkg.durationMinutes }} 分钟</div>
            </v-col>
          </v-row>
        </v-card>
        <v-empty-state v-else icon="mdi-clipboard-text-off-outline" title="该展项语言还没有送审版本" text="录制清单会在展陈编辑侧送审后自动生成；编辑本地的未送审改动不会出现。" />
      </v-window-item>

      <!-- 待制作组定夺 -->
      <v-window-item value="decisions">
        <v-card class="script-card pa-4 pa-md-6">
          <div class="section-title mb-1">讲解词没变、只是无障碍描述或资料来源变了</div>
          <div class="text-body-2 text-medium-emphasis mb-4">这些条目已有录音。请制作组逐条决定保留原音还是重录；讲解词变动的条目不会出现在这里，而是直接退回待录。</div>
          <v-alert v-if="!pendingDecisions.length" type="success" variant="tonal" icon="mdi-check-circle-outline">暂无待决定条目。</v-alert>
          <v-row v-else>
            <v-col v-for="row in pendingDecisions" :key="`${row.pkg.exhibitId}-${row.languageId}-${row.entry.segmentId}`" cols="12" md="6">
              <v-card class="pa-4 decision-card">
                <div class="text-caption text-medium-emphasis mb-1">
                  {{ store.exhibitCode(row.pkg.exhibitId) }} · {{ row.exhibit?.title || '展项已删除' }} · {{ store.languageLabel(row.languageId) }}
                </div>
                <div class="d-flex align-center ga-2 mb-2">
                  <v-icon color="warning">mdi-help-circle-outline</v-icon>
                  <div class="font-weight-medium">{{ row.entry.label }}</div>
                </div>
                <p class="text-body-2 mb-2" style="line-height:1.8;white-space:pre-wrap">{{ row.entry.text }}</p>
                <div class="text-caption text-medium-emphasis mb-3">录音时间：{{ formatTime(row.entry.recordedAt) }}</div>
                <v-alert type="info" variant="tonal" density="compact" class="mb-3">讲解词与送审版逐字一致；请参考新版无障碍描述与资料来源判断原音是否仍适用。</v-alert>
                <div class="d-flex ga-2">
                  <v-btn size="small" color="secondary" variant="tonal" prepend-icon="mdi-archive-check-outline" @click="store.resolveDecision(row.pkg.exhibitId, row.languageId, row.entry.segmentId, 'keep')">保留原音</v-btn>
                  <v-btn size="small" variant="outlined" prepend-icon="mdi-microphone" @click="store.resolveDecision(row.pkg.exhibitId, row.languageId, row.entry.segmentId, 'rerecord')">安排重录</v-btn>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-window-item>

      <!-- 两边对账 -->
      <v-window-item value="reconcile">
        <v-card class="script-card pa-4 pa-md-6">
          <div class="section-title mb-1">按展项和语言列出对不上的账</div>
          <div class="text-body-2 text-medium-emphasis mb-4">差异只摆出、不自动处理，等相关人员逐条确认。</div>

          <div v-if="!issues.length" class="pa-4 text-center text-medium-emphasis">
            <v-icon icon="mdi-file-check-outline" size="40" color="success" />
            <div class="mt-2">当前没有待确认的差异。</div>
          </div>

          <v-list v-else lines="two" class="bg-transparent">
            <v-list-item v-for="issue in issues" :key="issue.key" class="issue-row mb-2 rounded-lg">
              <template #prepend>
                <v-icon :color="issue.kind === 'submission-failed' ? 'error' : 'warning'" class="mt-1">
                  {{ issue.kind === 'submission-failed' ? 'mdi-sync-alert' : 'mdi-alert-outline' }}
                </v-icon>
              </template>
              <v-list-item-title class="font-weight-medium">
                {{ store.exhibitCode(issue.exhibitId) }} · {{ store.exhibitTitle(issue.exhibitId) }} · {{ store.languageLabel(issue.languageId) }}
                <v-chip v-if="issue.entryLabel" size="x-small" variant="tonal" class="ms-2">{{ issue.entryLabel }}</v-chip>
              </v-list-item-title>
              <v-list-item-subtitle class="mt-1">{{ issue.detail }}</v-list-item-subtitle>
              <template #append>
                <div class="d-flex ga-2 flex-wrap justify-end">
                  <v-btn v-if="issue.kind === 'orphan-entry'" size="small" variant="text" @click="jumpTo(issue)">去看条目</v-btn>
                  <v-btn v-if="issue.kind === 'orphan-entry' && issue.segmentId" size="small" variant="outlined" @click="store.removeOrphanEntry(issue.exhibitId, issue.languageId, issue.segmentId)">移除孤立条目</v-btn>
                  <v-btn v-if="issue.kind === 'draft-missing'" size="small" variant="outlined" @click="store.removePackage(issue.exhibitId, issue.languageId)">归档整个录制包</v-btn>
                  <v-btn v-if="issue.kind === 'submission-failed'" size="small" color="error" variant="tonal" @click="store.retryPending(issue.exhibitId, issue.languageId)">重试送审</v-btn>
                  <v-btn size="small" color="secondary" variant="tonal" @click="store.acknowledgeIssue(issue.key)">人工确认</v-btn>
                </div>
              </template>
            </v-list-item>
          </v-list>

          <template v-if="acknowledgedRows.length">
            <v-divider class="my-5" />
            <div class="section-title mb-3">已确认（{{ acknowledgedRows.length }}）</div>
            <v-list density="compact" class="bg-transparent">
              <v-list-item v-for="row in acknowledgedRows" :key="row.key" :title="`${store.exhibitCode(row.exhibitId)} · ${store.exhibitTitle(row.exhibitId)} · ${store.languageLabel(row.languageId)}`" :subtitle="row.detail">
                <template #append>
                  <v-btn size="small" variant="text" @click="store.unacknowledgeIssue(row.key)">撤销确认</v-btn>
                </template>
              </v-list-item>
            </v-list>
          </template>
        </v-card>
      </v-window-item>
    </v-window>
  </div>
</template>
