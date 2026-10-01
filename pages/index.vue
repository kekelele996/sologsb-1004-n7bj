<script setup lang="ts">
import { LANGUAGES, useScriptStore } from '~/stores/script'
import EditorWorkspace from '~/components/EditorWorkspace.vue'
import StudioWorkspace from '~/components/StudioWorkspace.vue'

const store = useScriptStore()
const leftFilter = ref('')
const helpDialog = ref(false)

const exhibit = computed(() => store.selectedExhibit)
const draft = computed(() => store.selectedDraft)
const currentLanguage = computed(() => LANGUAGES.find(item => item.id === store.selectedLanguageId))
const filteredExhibits = computed(() => store.hallExhibits.filter(item => !leftFilter.value || `${item.code} ${item.title}`.toLowerCase().includes(leftFilter.value.toLowerCase())))
const issueCount = computed(() => store.unacknowledgedIssues.length)
const decisionCount = computed(() => store.pendingDecisions.length)

onMounted(() => {
  store.hydrate()
  window.addEventListener('keydown', handleKeydown)
})
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))

function handleKeydown(event: KeyboardEvent) {
  const modifier = event.metaKey || event.ctrlKey
  if (!modifier) return
  const key = event.key.toLowerCase()
  if (key === 'z') {
    event.preventDefault()
    event.shiftKey ? store.redo() : store.undo()
  }
  if (key === 'y') {
    event.preventDefault()
    store.redo()
  }
  // Ctrl/⌘+S：编辑侧存版本快照，导览侧无意义
  if (key === 's' && store.side === 'editor') {
    event.preventDefault()
    store.createVersion('键盘快捷保存')
  }
}
function formatTime(value?: string) {
  return value ? new Date(value).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }) : ''
}
</script>

<template>
  <v-app class="workspace-shell">
    <a class="skip-link" href="#main-workspace">跳到主要内容</a>
    <v-app-bar :color="store.side === 'editor' ? 'surface' : 'secondary'" :flat="true" border>
      <template #prepend><v-app-bar-nav-icon aria-label="打开项目导航" /></template>
      <v-app-bar-title>
        <span class="project-mark" :class="{ 'text-white': store.side === 'studio' }">博物声</span>
        <span class="text-caption ms-3 d-none d-md-inline" :class="store.side === 'studio' ? 'text-white' : 'text-medium-emphasis'">
          {{ store.side === 'editor' ? '展陈编辑工作台' : '语音导览制作工作台' }}
        </span>
      </v-app-bar-title>
      <v-spacer />

      <v-btn-toggle :model-value="store.side" mandatory color="primary" variant="outlined" divided density="compact" class="me-3 d-none d-sm-flex" @update:model-value="store.setSide">
        <v-btn value="editor" prepend-icon="mdi-script-text-outline">展陈编辑</v-btn>
        <v-btn value="studio" prepend-icon="mdi-microphone-outline">
          导览制作
          <v-chip v-if="issueCount + decisionCount" size="x-small" color="error" variant="flat" class="ms-2">{{ issueCount + decisionCount }}</v-chip>
        </v-btn>
      </v-btn-toggle>

      <v-btn variant="text" prepend-icon="mdi-keyboard-outline" class="d-none d-md-flex" :class="{ 'text-white': store.side === 'studio' }" @click="helpDialog = true">快捷键</v-btn>
      <v-btn v-if="store.side === 'editor'" color="primary" prepend-icon="mdi-content-save-outline" @click="store.createVersion()">保存版本</v-btn>
    </v-app-bar>

    <v-navigation-drawer permanent width="320" color="surface" border>
      <div class="pa-4">
        <v-alert :color="store.side === 'editor' ? 'info' : 'secondary'" variant="tonal" density="compact" class="mb-4">
          {{ store.side === 'editor'
            ? '当前为编辑侧：讲解词、无障碍描述、资料来源的改动只在本侧生效，送审后才到导览制作侧。'
            : '当前为导览制作侧：清单按上次送审版本走，编辑侧的新改动要等送审成功才更新。' }}
        </v-alert>
        <div class="section-title mb-2">展厅</div>
        <v-select
          :model-value="store.selectedHallId"
          :items="store.halls"
          item-title="name"
          item-value="id"
          hide-details
          aria-label="选择展厅"
          @update:model-value="store.selectHall"
        />
        <div class="d-flex align-center justify-space-between mt-5 mb-2">
          <div class="section-title">展项</div>
          <v-chip size="x-small" variant="tonal">{{ filteredExhibits.length }} 项</v-chip>
        </div>
        <v-text-field v-model="leftFilter" density="compact" hide-details prepend-inner-icon="mdi-magnify" placeholder="筛选展项" aria-label="筛选展项" />
        <v-list class="mt-2 bg-transparent" nav>
          <v-list-item
            v-for="item in filteredExhibits"
            :key="item.id"
            :active="item.id === store.selectedExhibitId"
            :color="store.side === 'editor' ? 'primary' : 'secondary'"
            rounded="lg"
            @click="store.selectExhibit(item.id)"
          >
            <template #prepend><v-chip size="small" variant="outlined">{{ item.code }}</v-chip></template>
            <v-list-item-title class="font-weight-medium">{{ item.title }}</v-list-item-title>
            <v-list-item-subtitle>{{ item.drafts.length }} 种语言</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </div>
      <v-divider />
      <div class="pa-4">
        <div class="section-title mb-3">多语言完成度</div>
        <div v-for="lang in LANGUAGES" :key="lang.id" class="mb-3">
          <button class="d-flex align-center w-100 border-0 bg-transparent text-left pa-0" :aria-pressed="lang.id === store.selectedLanguageId" @click="store.selectLanguage(lang.id)">
            <v-avatar size="32" :color="lang.id === store.selectedLanguageId ? (store.side === 'editor' ? 'primary' : 'secondary') : 'grey-lighten-2'" :class="lang.id === store.selectedLanguageId ? 'text-white' : ''">{{ lang.shortLabel }}</v-avatar>
            <div class="ms-3 flex-grow-1">
              <div class="text-body-2 font-weight-medium">{{ lang.label }}</div>
              <v-progress-linear class="mt-1" :model-value="exhibit ? store.completionFor(exhibit, lang.id) : 0" :color="lang.id === store.selectedLanguageId ? (store.side === 'editor' ? 'primary' : 'secondary') : 'secondary'" height="5" rounded />
            </div>
            <span class="text-caption ms-3">{{ exhibit ? store.completionFor(exhibit, lang.id) : 0 }}%</span>
          </button>
        </div>
      </div>
      <v-divider />
      <div class="pa-4">
        <v-switch
          :model-value="store.simulateSubmitFailure"
          color="error"
          hide-details
          density="compact"
          label="模拟送审通道失败（演示）"
          @update:model-value="store.setSimulateSubmitFailure(Boolean($event))"
        />
        <div class="text-caption text-medium-emphasis mt-1">打开后送审将失败并只留在编辑本地，可反复重试。</div>
        <div v-if="store.lastSavedAt" class="text-caption text-medium-emphasis mt-3">本地保存：{{ formatTime(store.lastSavedAt) }}</div>
      </div>
    </v-navigation-drawer>

    <v-main id="main-workspace" style="background:#f4f0e8">
      <div class="pa-3 pa-md-6">
        <div class="d-flex flex-wrap align-start justify-space-between ga-4 mb-5">
          <div>
            <div class="text-caption text-medium-emphasis mb-1">{{ store.selectedHall?.name }} / {{ exhibit?.code }}</div>
            <h1 class="text-h4 font-weight-bold project-mark">{{ exhibit?.title || '请选择展项' }}</h1>
            <div class="text-body-2 text-medium-emphasis mt-2">
              当前语言：{{ currentLanguage?.label }}
              <template v-if="store.side === 'editor' && draft?.updatedAt"> · 工作稿最后更新 {{ formatTime(draft.updatedAt) }}</template>
              <template v-if="store.side === 'studio' && store.selectedPackage"> · 录制清单版本 {{ formatTime(store.selectedPackage.submittedAt) }}</template>
            </div>
          </div>
          <div class="d-flex ga-2 d-sm-none">
            <v-btn-toggle :model-value="store.side" mandatory variant="outlined" density="compact" divided @update:model-value="store.setSide">
              <v-btn value="editor" size="small">编辑侧</v-btn>
              <v-btn value="studio" size="small">导览侧</v-btn>
            </v-btn-toggle>
          </div>
          <div class="d-flex ga-2 d-none d-sm-flex">
            <v-btn variant="outlined" prepend-icon="mdi-undo" :disabled="!store.canUndo" @click="store.undo">撤销</v-btn>
            <v-btn variant="outlined" prepend-icon="mdi-redo" :disabled="!store.canRedo" @click="store.redo">重做</v-btn>
          </div>
        </div>

        <v-snackbar :model-value="Boolean(store.notice)" timeout="3200" location="bottom right" color="surface" @update:model-value="store.notice = ''">
          {{ store.notice }}
          <template #actions><v-btn variant="text" @click="store.notice = ''">关闭</v-btn></template>
        </v-snackbar>

        <EditorWorkspace v-if="store.side === 'editor'" />
        <StudioWorkspace v-else />
      </div>
    </v-main>

    <v-dialog v-model="helpDialog" max-width="520">
      <v-card class="pa-3">
        <v-card-title>键盘操作</v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item prepend-icon="mdi-apple-keyboard-command" title="Ctrl / ⌘ + Z" subtitle="撤销上一步编辑" />
            <v-list-item prepend-icon="mdi-redo" title="Ctrl / ⌘ + Shift + Z" subtitle="重做" />
            <v-list-item prepend-icon="mdi-content-save-outline" title="Ctrl / ⌘ + S" subtitle="编辑侧保存版本快照" />
            <v-list-item prepend-icon="mdi-keyboard-tab" title="Tab / Shift + Tab" subtitle="在字段、状态与操作按钮之间移动" />
          </v-list>
        </v-card-text>
        <v-card-actions><v-spacer /><v-btn color="primary" @click="helpDialog = false">知道了</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>
