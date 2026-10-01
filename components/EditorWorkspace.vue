<script setup lang="ts">
import type { DeviceKind, DiffLine, LanguageDraft, ScriptStatus, Segment } from '~/types'
import { LANGUAGES, useScriptStore } from '~/stores/script'

const store = useScriptStore()
const activeTab = ref('script')
const device = ref<DeviceKind>('desktop')
const versionDialog = ref(false)
const versionName = ref('')
const deleteTarget = ref<string | null>(null)

const statusOptions: Array<{ value: ScriptStatus; label: string; color: string }> = [
  { value: 'draft', label: '草稿', color: 'grey' },
  { value: 'review', label: '待审', color: 'warning' },
  { value: 'returned', label: '退回', color: 'error' },
  { value: 'approved', label: '已定稿', color: 'success' }
]
const deviceOptions: Array<{ value: DeviceKind; label: string }> = [
  { value: 'desktop', label: '桌面大屏' },
  { value: 'tablet', label: '平板导览' },
  { value: 'mobile', label: '手机导览' },
  { value: 'kiosk', label: '馆内触摸屏' }
]

const draft = computed(() => store.selectedDraft)
const exhibit = computed(() => store.selectedExhibit)
const currentLanguage = computed(() => LANGUAGES.find(item => item.id === store.selectedLanguageId))
const currentStatus = computed(() => statusOptions.find(item => item.value === draft.value?.status) || statusOptions[0])
const versions = computed(() => store.versions.filter(item => item.exhibitId === store.selectedExhibitId && item.languageId === store.selectedLanguageId))
const changes = computed(() => store.draftChanges)
const pending = computed(() => store.pendingForSelection)
const compareA = ref('')
const compareB = ref('')

const selectedVersionA = computed(() => versions.value.find(item => item.id === compareA.value))
const selectedVersionB = computed(() => versions.value.find(item => item.id === compareB.value))
const diffLines = computed<DiffLine[]>(() => buildDiff(selectedVersionA.value?.draft.narration || '', selectedVersionB.value?.draft.narration || ''))

watch(versions, syncCompareSelection)
onMounted(syncCompareSelection)

function syncCompareSelection() {
  if (!versions.value.some(item => item.id === compareA.value)) compareA.value = versions.value[1]?.id || versions.value[0]?.id || ''
  if (!versions.value.some(item => item.id === compareB.value)) compareB.value = versions.value[0]?.id || ''
}
function saveDraftField(field: 'title' | 'narration' | 'accessibility' | 'durationMinutes' | 'sources', event: Event) {
  const value = (event.target as HTMLInputElement | HTMLTextAreaElement).value
  store.updateDraft({ [field]: field === 'durationMinutes' ? Number(value) : value } as Partial<LanguageDraft>)
}
function saveSegment(id: string, field: 'label' | 'content', event: Event) {
  store.updateSegment(id, { [field]: (event.target as HTMLInputElement | HTMLTextAreaElement).value })
}
function submitVersion() {
  store.createVersion(versionName.value.trim() || undefined)
  versionName.value = ''
  versionDialog.value = false
}
function confirmDelete() {
  if (deleteTarget.value) store.removeSegment(deleteTarget.value)
  deleteTarget.value = null
}
function buildDiff(before: string, after: string): DiffLine[] {
  const a = before.split(/(?<=[。！？.!?])\s*/).filter(Boolean)
  const b = after.split(/(?<=[。！？.!?])\s*/).filter(Boolean)
  const rows = Array.from({ length: a.length + 1 }, () => Array<number>(b.length + 1).fill(0))
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) rows[i][j] = a[i] === b[j] ? rows[i + 1][j + 1] + 1 : Math.max(rows[i + 1][j], rows[i][j + 1])
  }
  const result: DiffLine[] = []
  let i = 0, j = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { result.push({ type: 'same', text: a[i] }); i++; j++ }
    else if (rows[i + 1][j] >= rows[i][j + 1]) { result.push({ type: 'remove', text: a[i] }); i++ }
    else { result.push({ type: 'add', text: b[j] }); j++ }
  }
  while (i < a.length) result.push({ type: 'remove', text: a[i++] })
  while (j < b.length) result.push({ type: 'add', text: b[j++] })
  return result
}
function formatTime(value: string) {
  return new Date(value).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
}
function segmentLabel(segment: Segment) { return segment.label || '未命名段落' }
function segmentChange(segmentId: string) {
  return changes.value.segments.find(item => item.segmentId === segmentId)?.kind
}
</script>

<template>
  <div>
    <v-alert v-if="pending" class="mb-4" color="error" variant="tonal" icon="mdi-sync-alert">
      <div class="d-flex flex-wrap align-center ga-3">
        <div class="flex-grow-1">
          <div class="font-weight-bold">送审失败，改动只留在编辑本地</div>
          <div class="text-body-2 mt-1">{{ pending.lastError }}</div>
          <div class="text-caption mt-1">上次尝试：{{ formatTime(pending.attemptedAt) }} · 导览制作侧清单未受影响</div>
        </div>
        <div class="d-flex ga-2">
          <v-btn color="error" variant="tonal" prepend-icon="mdi-refresh" @click="store.retryPending(exhibit!.id, pending.languageId)">立即重试</v-btn>
          <v-btn variant="text" @click="store.cancelPending(exhibit!.id, pending.languageId)">撤下送审</v-btn>
        </div>
      </div>
    </v-alert>

    <v-alert v-else-if="changes.changed" class="mb-4" color="warning" variant="tonal" icon="mdi-pencil-outline">
      <div class="d-flex flex-wrap align-center ga-3">
        <div class="flex-grow-1">
          <span class="font-weight-bold">编辑稿与上次送审版有差异，导览制作侧仍按旧版录制。</span>
          <span class="text-body-2">
            变化：
            <template v-if="!changes.hasPackage">尚未送审过</template>
            <template v-else>
              <v-chip v-if="changes.narrationChanged || changes.segments.length" size="small" color="error" variant="tonal" class="me-1">讲解词/段落</v-chip>
              <v-chip v-if="changes.accessibilityChanged" size="small" variant="tonal" class="me-1">无障碍描述</v-chip>
              <v-chip v-if="changes.sourcesChanged" size="small" variant="tonal" class="me-1">资料来源</v-chip>
              <v-chip v-if="changes.titleChanged" size="small" variant="tonal" class="me-1">标题</v-chip>
              <v-chip v-if="changes.durationChanged" size="small" variant="tonal">时长</v-chip>
            </template>
          </span>
        </div>
        <v-btn color="primary" variant="tonal" prepend-icon="mdi-send-outline" @click="store.submitForReview">送审给导览制作组</v-btn>
      </div>
    </v-alert>
    <v-alert v-else class="mb-4" color="success" variant="tonal" icon="mdi-check-circle-outline" density="compact">
      编辑稿与上次送审版一致，导览制作侧使用的就是当前内容。
    </v-alert>

    <v-tabs v-model="activeTab" color="primary" bg-color="surface" rounded="lg" class="mb-4 px-2">
      <v-tab value="script">脚本编辑</v-tab>
      <v-tab value="versions">版本比较</v-tab>
      <v-tab value="preview">设备预览</v-tab>
      <v-tab value="sources">资料核对</v-tab>
    </v-tabs>

    <div v-if="draft">
      <v-window v-model="activeTab" :touch="false">
        <v-window-item value="script">
          <v-row>
            <v-col cols="12" lg="8">
              <v-card class="script-card pa-4 pa-md-6">
                <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-5">
                  <div>
                    <div class="section-title">展陈编辑侧 · 工作稿</div>
                    <div class="text-h6 font-weight-bold mt-1">{{ currentLanguage?.label }}</div>
                  </div>
                  <div class="d-flex flex-wrap ga-2">
                    <v-select
                      :model-value="draft.status"
                      :items="statusOptions"
                      item-title="label"
                      item-value="value"
                      label="审校状态"
                      hide-details
                      style="min-width:150px"
                      @update:model-value="store.setStatus"
                    />
                    <v-btn color="primary" variant="tonal" prepend-icon="mdi-plus" @click="store.addSegment">新增段落</v-btn>
                  </div>
                </div>

                <v-text-field label="展项标题" :model-value="draft.title" hint="面向观众的主标题" persistent-hint @change="saveDraftField('title', $event)" />
                <v-row class="mt-2">
                  <v-col cols="12" md="5">
                    <v-text-field label="预计朗读时长（分钟）" type="number" min="0" step="0.5" :model-value="draft.durationMinutes" @change="saveDraftField('durationMinutes', $event)" />
                  </v-col>
                  <v-col cols="12" md="7">
                    <v-text-field label="资料来源" :model-value="draft.sources" hint="书籍、档案号或专家核验记录" persistent-hint @change="saveDraftField('sources', $event)" />
                  </v-col>
                </v-row>

                <div class="section-title mt-6 mb-2">
                  完整讲解词
                  <v-chip v-if="changes.narrationChanged" size="x-small" color="error" variant="tonal" class="ms-2">相对送审版已改 · 送审后需重录</v-chip>
                </div>
                <v-textarea label="讲解词" rows="7" auto-grow counter :model-value="draft.narration" @change="saveDraftField('narration', $event)" />

                <div class="section-title mt-6 mb-2">
                  无障碍描述
                  <v-chip v-if="changes.accessibilityChanged" size="x-small" variant="tonal" class="ms-2">相对送审版已改 · 已录音条目交制作组定夺</v-chip>
                </div>
                <v-textarea label="无障碍描述" rows="4" auto-grow hint="描述尺寸、材质、色彩与可触摸特征，避免只依赖视觉" persistent-hint :model-value="draft.accessibility" @change="saveDraftField('accessibility', $event)" />
              </v-card>

              <v-card class="script-card pa-4 pa-md-6 mt-5">
                <div class="d-flex align-center justify-space-between mb-4">
                  <div>
                    <div class="section-title">分段校对</div>
                    <div class="text-body-2 text-medium-emphasis mt-1">锁定段落不会被编辑；删段不会动导览侧，送审后进对账。</div>
                  </div>
                  <v-chip variant="tonal">{{ draft.segments.filter(item => item.locked).length }}/{{ draft.segments.length }} 已锁定</v-chip>
                </div>
                <div class="d-flex flex-column ga-3">
                  <div v-for="(segment, index) in draft.segments" :key="segment.id" class="segment-row" :class="{ locked: segment.locked }">
                    <div class="d-flex align-center ga-2">
                      <v-btn icon size="small" variant="text" :aria-label="segment.locked ? '解锁段落' : '锁定段落'" @click="store.toggleLock(segment.id)">
                        {{ segment.locked ? '🔒' : '🔓' }}
                      </v-btn>
                      <v-text-field :model-value="segment.label" density="compact" hide-details variant="plain" :readonly="segment.locked" :aria-label="`第 ${index + 1} 段标题`" @change="saveSegment(segment.id, 'label', $event)" />
                      <v-chip v-if="segmentChange(segment.id) === 'changed'" color="error" size="small" variant="tonal">讲解词已改</v-chip>
                      <v-chip v-else-if="segmentChange(segment.id) === 'new'" color="warning" size="small" variant="tonal">新增段落</v-chip>
                      <v-chip v-if="segment.locked" color="success" size="small" variant="tonal">已确认</v-chip>
                      <v-btn icon="mdi-delete-outline" size="small" variant="text" color="error" :disabled="segment.locked" :aria-label="`删除第 ${index + 1} 段`" @click="deleteTarget = segment.id" />
                    </div>
                    <v-textarea class="mt-2" :model-value="segment.content" rows="2" auto-grow hide-details :readonly="segment.locked" :aria-label="segmentLabel(segment)" @change="saveSegment(segment.id, 'content', $event)" />
                  </div>
                </div>
              </v-card>
            </v-col>

            <v-col cols="12" lg="4">
              <v-card class="script-card pa-5">
                <div class="section-title mb-4">同展项语言进度</div>
                <div v-for="lang in LANGUAGES" :key="lang.id" class="d-flex align-center ga-3 mb-4">
                  <v-progress-circular :model-value="store.completionFor(exhibit!, lang.id)" size="52" width="5" :color="lang.id === store.selectedLanguageId ? 'primary' : 'secondary'">
                    {{ store.completionFor(exhibit!, lang.id) }}
                  </v-progress-circular>
                  <div class="flex-grow-1">
                    <div class="font-weight-medium">{{ lang.label }}</div>
                    <div class="text-caption text-medium-emphasis">
                      {{ exhibit?.drafts.find(item => item.languageId === lang.id) ? store.statusLabel(exhibit!.drafts.find(item => item.languageId === lang.id)!.status) : '尚未创建' }}
                    </div>
                  </div>
                  <v-btn size="small" variant="text" :disabled="lang.id === store.selectedLanguageId" @click="store.selectLanguage(lang.id)">切换</v-btn>
                </div>
              </v-card>
              <v-card class="script-card pa-5 mt-5">
                <div class="section-title mb-3">审校检查</div>
                <v-list density="compact" class="bg-transparent">
                  <v-list-item :prepend-icon="draft.narration.length > 80 ? 'mdi-check-circle' : 'mdi-alert-circle'" :title="`讲解词 ${draft.narration.length} 字`" />
                  <v-list-item :prepend-icon="draft.accessibility.length > 30 ? 'mdi-check-circle' : 'mdi-alert-circle'" :title="`无障碍描述 ${draft.accessibility.length} 字`" />
                  <v-list-item :prepend-icon="draft.sources ? 'mdi-check-circle' : 'mdi-alert-circle'" :title="draft.sources ? '资料来源已填写' : '缺少资料来源'" />
                </v-list>
                <v-alert class="mt-3" type="info" variant="tonal" density="compact">
                  估算语速约 {{ Math.max(1, Math.round(draft.narration.length / 220 * 10) / 10) }} 分钟，请与目标时长核对。
                </v-alert>
              </v-card>
              <v-card v-if="store.selectedPackage" class="script-card pa-5 mt-5">
                <div class="section-title mb-2">导览制作侧当前版本</div>
                <div class="text-body-2">{{ store.selectedPackage.submitName }}</div>
                <div class="text-caption text-medium-emphasis mt-1">送审于 {{ formatTime(store.selectedPackage.submittedAt) }}，编辑侧的未送审改动不会出现在这里。</div>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>

        <v-window-item value="versions">
          <v-card class="script-card pa-4 pa-md-6">
            <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-5">
              <div>
                <div class="section-title">编辑稿版本比较</div>
                <div class="text-h6 font-weight-bold mt-1">版本快照只属于展陈编辑侧，不影响导览制作清单</div>
              </div>
              <v-btn color="primary" prepend-icon="mdi-content-save-plus-outline" @click="versionDialog = true">保存当前版本</v-btn>
            </div>
            <v-alert v-if="versions.length < 2" type="info" variant="tonal">至少保存两个版本后即可比较。当前有 {{ versions.length }} 个版本。</v-alert>
            <template v-else>
              <v-row>
                <v-col cols="12" md="6"><v-select v-model="compareA" :items="versions" item-title="name" item-value="id" label="基准版本" /></v-col>
                <v-col cols="12" md="6"><v-select v-model="compareB" :items="versions" item-title="name" item-value="id" label="目标版本" /></v-col>
              </v-row>
              <div class="d-flex ga-4 text-caption text-medium-emphasis mb-2">
                <span><span class="status-dot" style="background:#9b2c25" /> 删除</span>
                <span><span class="status-dot" style="background:#2f6b45" /> 新增</span>
              </div>
              <div class="rounded-lg border pa-3 bg-white">
                <p v-for="(line, index) in diffLines" :key="index" class="diff-line" :class="`diff-${line.type}`">{{ line.text }}</p>
                <div v-if="!diffLines.length" class="text-medium-emphasis pa-4">所选版本内容一致。</div>
              </div>
              <v-list class="mt-4 bg-transparent">
                <v-list-item v-for="version in versions" :key="version.id" :title="version.name" :subtitle="formatTime(version.createdAt)">
                  <template #append><v-btn variant="outlined" size="small" @click="store.restoreVersion(version.id)">恢复此版</v-btn></template>
                </v-list-item>
              </v-list>
            </template>
          </v-card>
        </v-window-item>

        <v-window-item value="preview">
          <v-card class="script-card pa-4 pa-md-6">
            <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-5">
              <div>
                <div class="section-title">设备排版预览（编辑工作稿）</div>
                <div class="text-h6 font-weight-bold mt-1">以展项实际阅读顺序预览</div>
              </div>
              <v-btn-toggle v-model="device" mandatory variant="outlined" divided>
                <v-btn v-for="item in deviceOptions" :key="item.value" :value="item.value">{{ item.label }}</v-btn>
              </v-btn-toggle>
            </div>
            <div class="preview-frame" :class="device">
              <div class="preview-content">
                <div class="text-overline text-medium-emphasis">{{ exhibit?.code }} · {{ currentLanguage?.label }}</div>
                <h2 class="text-h4 font-weight-bold mt-2">{{ draft.title }}</h2>
                <p class="text-body-1 mt-6" style="line-height:1.9;white-space:pre-wrap">{{ draft.narration }}</p>
                <v-divider class="my-6" />
                <div class="section-title">无障碍描述</div>
                <p class="text-body-2 mt-2" style="line-height:1.8;white-space:pre-wrap">{{ draft.accessibility }}</p>
                <div class="mt-7 text-caption text-medium-emphasis">预计讲解 {{ draft.durationMinutes }} 分钟</div>
              </div>
            </div>
          </v-card>
        </v-window-item>

        <v-window-item value="sources">
          <v-row>
            <v-col cols="12" md="7">
              <v-card class="script-card pa-5">
                <div class="section-title mb-3">来源与核验记录（编辑侧）</div>
                <v-textarea :model-value="draft.sources" rows="8" @change="saveDraftField('sources', $event)" />
                <v-alert class="mt-4" type="warning" variant="tonal">来源改动在送审后才同步到导览制作侧；只改来源不会要求重录，已录音条目会列入“待制作组决定”。</v-alert>
              </v-card>
            </v-col>
            <v-col cols="12" md="5">
              <v-card class="script-card pa-5">
                <div class="section-title mb-3">段落锁定概况</div>
                <v-timeline density="compact" side="end">
                  <v-timeline-item v-for="segment in draft.segments" :key="segment.id" :dot-color="segment.locked ? 'success' : 'grey'" size="small">
                    <div class="font-weight-medium">{{ segment.label }}</div>
                    <div class="text-caption text-medium-emphasis">{{ segment.locked ? '已锁定，审校确认' : '编辑中' }}</div>
                  </v-timeline-item>
                </v-timeline>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>
      </v-window>
    </div>
    <v-empty-state v-else icon="mdi-script-text-outline" title="尚未选择展项" text="请从左侧选择一个展厅和展项。" />

    <v-dialog v-model="versionDialog" max-width="520">
      <v-card class="pa-3">
        <v-card-title>保存版本快照</v-card-title>
        <v-card-text>
          <p class="mb-4 text-medium-emphasis">将当前“{{ draft?.title }}”的编辑工作稿保存为只读版本。</p>
          <v-text-field v-model="versionName" label="版本名称（可选）" autofocus @keyup.enter="submitVersion" />
        </v-card-text>
        <v-card-actions><v-spacer /><v-btn @click="versionDialog = false">取消</v-btn><v-btn color="primary" @click="submitVersion">保存快照</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog :model-value="Boolean(deleteTarget)" max-width="440" @update:model-value="deleteTarget = null">
      <v-card class="pa-3">
        <v-card-title>删除这个段落？</v-card-title>
        <v-card-text>只从编辑稿删除，导览制作侧条目保留并在送审后进入对账，等人工确认。操作可撤销。</v-card-text>
        <v-card-actions><v-spacer /><v-btn @click="deleteTarget = null">取消</v-btn><v-btn color="error" @click="confirmDelete">删除</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
