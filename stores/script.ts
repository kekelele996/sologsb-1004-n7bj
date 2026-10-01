import { defineStore } from 'pinia'
import type { Exhibit, GuideRelease, Hall, Language, LanguageDraft, Mismatch, PersistedState, RecordingEntry, RecordingStatus, ScriptStatus, Segment, Submission, VersionSnapshot } from '~/types'

export const LANGUAGES: Language[] = [
  { id: 'zh', code: 'zh-CN', label: '简体中文', shortLabel: '中' },
  { id: 'en', code: 'en-US', label: 'English', shortLabel: 'EN' },
  { id: 'ja', code: 'ja-JP', label: '日本語', shortLabel: '日' }
]

const STORAGE_KEY = 'museum-script-studio-v1'
const SCHEMA_VERSION = 2

const segments = (prefix: string, values: Array<[string, string, boolean?]>): Segment[] => values.map(([label, content, locked], index) => ({
  id: `${prefix}-${index + 1}`,
  label,
  content,
  locked: Boolean(locked)
}))

function demoState(): PersistedState {
  const halls: Hall[] = [
    { id: 'hall-ancient', name: '文明肇始厅', description: '史前至先秦文明，共 18 个展项' },
    { id: 'hall-silk', name: '丝路交融厅', description: '丝绸之路上的器物、信仰与生活' },
    { id: 'hall-city', name: '城市记忆厅', description: '近现代城市空间与市民生活' }
  ]
  const exhibits: Exhibit[] = [
    {
      id: 'exhibit-jade', hallId: 'hall-ancient', code: 'A-03', title: '玉琮：沟通天地的礼器', order: 3,
      drafts: [
        {
          id: 'draft-jade-zh', languageId: 'zh', title: '玉琮：沟通天地的礼器',
          narration: '这件玉琮出土于长江下游的良渚遗址。它外方内圆，四角雕刻神人兽面纹，体现了新石器时代晚期精湛的玉器工艺。',
          accessibility: '玉琮为深青色，高约二十厘米。触摸模型可感受方形四角与中央圆孔；圆孔贯穿器身。',
          durationMinutes: 2.5, sources: '《中国玉器全集》第一卷；本馆藏品档案 1987-J-042',
          status: 'approved', updatedAt: '2026-09-23T08:35:00.000Z',
          segments: segments('jade-zh', [
            ['开场定位', '这件玉琮来自距今约五千年的良渚文化。', true],
            ['器物观察', '它外方内圆，四角雕刻神人兽面纹。', true],
            ['文化含义', '玉琮常被看作沟通天地的礼器，也象征权力与身份。'],
            ['参观提示', '请沿展柜顺时针观察，触摸复制品前先使用免洗消毒液。']
          ])
        },
        {
          id: 'draft-jade-en', languageId: 'en', title: 'Jade Cong: A Ritual Object Between Heaven and Earth',
          narration: 'This jade cong was made by the Liangzhu culture. Its square exterior and circular bore embody an early Chinese vision of the cosmos.',
          accessibility: 'The object is dark green. A tactile model shows four corners, carved faces, and a central circular opening.',
          durationMinutes: 2.3, sources: 'Complete Collection of Chinese Jades, Vol. 1; Museum accession 1987-J-042',
          status: 'review', updatedAt: '2026-09-24T02:15:00.000Z',
          segments: segments('jade-en', [
            ['Introduction', 'This jade cong is about five thousand years old.', true],
            ['Visual description', 'Its square body encloses a circular opening, while spirit-and-animal motifs cover the corners.'],
            ['Meaning', 'Jade cong is understood as a ritual link between heaven and earth.']
          ])
        },
        {
          id: 'draft-jade-ja', languageId: 'ja', title: '玉琮：天と地を結ぶ礼器',
          narration: 'こちらは良渚文化の玉琮です。外側は方形、中央は円形で、四隅には神人獣面文が刻まれています。',
          accessibility: '暗い青緑色の玉製です。複製模型では四つの角と中央の円孔を触って確認できます。',
          durationMinutes: 2.6, sources: '『中国玉器全集』第一巻；収蔵資料 1987-J-042',
          status: 'draft', updatedAt: '2026-09-21T06:10:00.000Z',
          segments: segments('jade-ja', [
            ['導入', '約五千年前の良渚文化を代表する玉琮です。'],
            ['観察', '外側は方形、中央は円形で、四隅に精緻な文様があります。'],
            ['意味', '天地を結ぶ礼器として、力と身分を象徴しました。']
          ])
        }
      ]
    },
    {
      id: 'exhibit-bronze', hallId: 'hall-ancient', code: 'A-08', title: '青铜爵与礼制', order: 8,
      drafts: [
        {
          id: 'draft-bronze-zh', languageId: 'zh', title: '青铜爵与礼制',
          narration: '爵是最早的青铜酒器之一。三足稳定器身，长流便于倾倒，柱饰则与商周礼仪密切相关。',
          accessibility: '器物为青铜色，器口一侧有长流，底部三足支撑。复制件配有可触摸的局部纹样。',
          durationMinutes: 3, sources: '《殷周青铜器通论》；展品说明卡 A-08',
          status: 'returned', updatedAt: '2026-09-23T11:20:00.000Z',
          segments: segments('bronze-zh', [
            ['器物介绍', '这是一件商代青铜爵，用于温酒和饮酒。'],
            ['结构说明', '三足使器身稳定，前端的流便于倾倒。'],
            ['礼制背景', '青铜器数量与形制反映了使用者的身份。'],
            ['修改说明', '审校意见：补充“柱饰”的用途，并核对年代。']
          ])
        },
        {
          id: 'draft-bronze-en', languageId: 'en', title: 'Bronze Jue and Ritual Order',
          narration: 'The jue was among the earliest bronze drinking vessels. Its tripod base, pouring spout, and posts were closely tied to Shang and Zhou ritual.',
          accessibility: 'The tactile replica includes the long spout, tripod feet, and raised posts.',
          durationMinutes: 2.8, sources: 'A General Survey of Yin-Zhou Bronzes; Gallery label A-08',
          status: 'draft', updatedAt: '2026-09-22T09:00:00.000Z',
          segments: segments('bronze-en', [['Object', 'This bronze jue dates to the Shang dynasty.'], ['Structure', 'Three legs support the body; the long spout guides the pour.']])
        }
      ]
    },
    {
      id: 'exhibit-silk', hallId: 'hall-silk', code: 'B-02', title: '织机与丝路纹样', order: 2,
      drafts: [{
        id: 'draft-silk-zh', languageId: 'zh', title: '织机与丝路纹样',
        narration: '织机把一根根丝线组织成布匹，也把不同地区的图案与故事连接在一起。',
        accessibility: '体验区提供放大纹样、凸点经纬结构以及可操作的小型织机模型。',
        durationMinutes: 4, sources: '馆内教育活动资料；丝绸之路纺织史专题',
        status: 'draft', updatedAt: '2026-09-20T03:00:00.000Z',
        segments: segments('silk-zh', [['序言', '丝绸不只是一种材料，也是交流的媒介。'], ['互动', '请试着推动梭子，观察经纬线如何交会。']])
      }]
    }
  ]
  // 导览制作侧：演示数据按「已送审」初始化，录制清单与编辑侧当前内容一致
  const guideReleases: GuideRelease[] = exhibits.flatMap(exhibit =>
    exhibit.drafts.map(draft => buildReleaseFromDraft(exhibit.id, draft, 'demo-migration', draft.updatedAt))
  )
  // 演示数据：给部分条目录音，便于制作组侧直接看到「已录制」状态
  for (const release of guideReleases) {
    release.entries.forEach((entry, index) => {
      if (index % 2 === 0) entry.recorded = true
    })
  }
  return {
    schemaVersion: SCHEMA_VERSION,
    halls,
    exhibits,
    versions: [],
    guideReleases,
    submissions: [],
    selectedHallId: halls[0].id,
    selectedExhibitId: exhibits[0].id,
    selectedLanguageId: 'zh',
    lastSavedAt: new Date().toISOString()
  }
}

// 由编辑侧文稿生成一份导览录制清单（送审成功后调用；迁移旧数据时同样适用）
function buildReleaseFromDraft(exhibitId: string, draft: LanguageDraft, submissionId: string, submittedAt: string): GuideRelease {
  return {
    exhibitId,
    languageId: draft.languageId,
    submissionId,
    submittedAt,
    entries: draft.segments.map(segment => ({
      id: `entry-${segment.id}`,
      segmentId: segment.id,
      label: segment.label,
      narration: segment.content,
      accessibility: draft.accessibility,
      sources: draft.sources,
      recorded: false,
      decision: 'pending' as const,
      updatedAt: submittedAt
    }))
  }
}

// 模拟送审网络请求：前端无真实接口，用延时 + 概率失败演示「失败留本地等重试」
function simulateSubmission(): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.25) reject(new Error('网络异常，送审未送达导览制作组'))
      else resolve()
    }, 500 + Math.random() * 700)
  })
}

// 对账：按展项和语言列出两边对不上的地方（独立函数，供 getter 与 action 复用）
function computeMismatches(exhibit: Exhibit, languageId: string, guideReleases: GuideRelease[]): Mismatch[] {
  const draft = exhibit.drafts.find(item => item.languageId === languageId)
  const release = guideReleases.find(item => item.exhibitId === exhibit.id && item.languageId === languageId)
  const mismatches: Mismatch[] = []
  if (!draft) return mismatches
  if (!release) {
    for (const segment of draft.segments) {
      mismatches.push({ type: 'not-submitted', segmentId: segment.id, label: segment.label || '未命名段落' })
    }
    return mismatches
  }
  const guideIds = new Set(release.entries.map(item => item.segmentId))
  const editorIds = new Set(draft.segments.map(item => item.id))
  for (const segment of draft.segments) {
    if (!guideIds.has(segment.id)) {
      mismatches.push({ type: 'added', segmentId: segment.id, label: segment.label || '未命名段落' })
      continue
    }
    const entry = release.entries.find(item => item.segmentId === segment.id)!
    if (segment.label !== entry.label) {
      mismatches.push({ type: 'label-changed', segmentId: segment.id, label: segment.label || '未命名段落', detail: `导览侧为「${entry.label}」` })
    }
    if (segment.content !== entry.narration) {
      mismatches.push({ type: 'narration-changed', segmentId: segment.id, label: segment.label || '未命名段落', detail: '讲解词已更新' })
    }
  }
  for (const entry of release.entries) {
    if (!editorIds.has(entry.segmentId)) {
      mismatches.push({ type: 'removed', segmentId: entry.segmentId, label: entry.label || '未命名段落' })
    }
  }
  if (release.entries.length) {
    if (draft.accessibility !== release.entries[0].accessibility) {
      mismatches.push({ type: 'accessibility-changed', label: '无障碍描述', detail: '编辑侧已更新，导览清单仍为旧版' })
    }
    if (draft.sources !== release.entries[0].sources) {
      mismatches.push({ type: 'sources-changed', label: '资料来源', detail: '编辑侧已更新，导览清单仍为旧版' })
    }
  }
  return mismatches
}

export const useScriptStore = defineStore('museum-script', {
  state: () => ({
    schemaVersion: SCHEMA_VERSION,
    halls: [] as Hall[],
    exhibits: [] as Exhibit[],
    versions: [] as VersionSnapshot[],
    guideReleases: [] as GuideRelease[],
    submissions: [] as Submission[],
    selectedHallId: '',
    selectedExhibitId: '',
    selectedLanguageId: 'zh',
    lastSavedAt: '',
    hydrated: false,
    past: [] as string[],
    future: [] as string[],
    notice: ''
  }),
  getters: {
    selectedHall(state): Hall | undefined {
      return state.halls.find(hall => hall.id === state.selectedHallId)
    },
    hallExhibits(state): Exhibit[] {
      return state.exhibits.filter(exhibit => exhibit.hallId === state.selectedHallId).sort((a, b) => a.order - b.order)
    },
    selectedExhibit(state): Exhibit | undefined {
      return state.exhibits.find(exhibit => exhibit.id === state.selectedExhibitId)
    },
    selectedDraft(): LanguageDraft | undefined {
      return this.selectedExhibit?.drafts.find(draft => draft.languageId === this.selectedLanguageId)
    },
    wordCount(): number {
      return (this.selectedDraft?.narration || '').replace(/\s/g, '').length
    },
    canUndo(state): boolean { return state.past.length > 0 },
    canRedo(state): boolean { return state.future.length > 0 },
    // 导览制作侧：当前展项、语言的录制清单（按上次成功送审版本）
    selectedGuideRelease(state): GuideRelease | undefined {
      return state.guideReleases.find(release => release.exhibitId === state.selectedExhibitId && release.languageId === state.selectedLanguageId)
    },
    // 当前展项、语言的送审记录（新的在前）
    selectedSubmissions(state): Submission[] {
      return state.submissions
        .filter(item => item.exhibitId === state.selectedExhibitId && item.languageId === state.selectedLanguageId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    },
    // 所有未成功的送审（待重试）
    pendingSubmissions(state): Submission[] {
      return state.submissions.filter(item => item.status !== 'succeeded')
    },
    // 对账：按展厅分组的全部展项 × 语言差异
    reconciliationRows(): Array<{ hall: Hall; exhibit: Exhibit; languageId: string; mismatches: Mismatch[] }> {
      const rows: Array<{ hall: Hall; exhibit: Exhibit; languageId: string; mismatches: Mismatch[] }> = []
      for (const hall of this.halls) {
        for (const exhibit of this.exhibits.filter(item => item.hallId === hall.id).sort((a, b) => a.order - b.order)) {
          for (const draft of exhibit.drafts) {
            rows.push({ hall, exhibit, languageId: draft.languageId, mismatches: computeMismatches(exhibit, draft.languageId, this.guideReleases) })
          }
        }
      }
      return rows
    }
  },
  actions: {
    hydrate() {
      if (this.hydrated || typeof localStorage === 'undefined') return
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          const data = JSON.parse(saved) as PersistedState
          if (!data.schemaVersion || data.schemaVersion < SCHEMA_VERSION) {
            this.migrateToV2(data)
          }
          this.$patch({ ...data, hydrated: true })
          if (!this.halls.length || !this.exhibits.length) this.resetDemo()
        } catch {
          this.resetDemo()
        }
      } else {
        this.resetDemo()
      }
      this.ensureSelection()
      this.hydrated = true
    },
    // 旧数据第一次打开：按段落归属迁移到编辑侧 + 导览侧，再启用
    migrateToV2(data: PersistedState) {
      data.schemaVersion = SCHEMA_VERSION
      data.guideReleases = []
      data.submissions = []
      for (const exhibit of data.exhibits) {
        for (const draft of exhibit.drafts) {
          data.guideReleases.push(buildReleaseFromDraft(exhibit.id, draft, 'migrated', draft.updatedAt))
        }
      }
    },
    resetDemo() {
      this.$patch({ ...demoState(), hydrated: true, past: [], future: [] })
      this.persist()
      this.notice = '示例数据已就绪，可直接开始编辑。'
    },
    snapshot(): string {
      return JSON.stringify({
        halls: this.halls, exhibits: this.exhibits, versions: this.versions,
        guideReleases: this.guideReleases, submissions: this.submissions
      })
    },
    commit(mutator: () => void) {
      this.past.push(this.snapshot())
      if (this.past.length > 50) this.past.shift()
      this.future = []
      mutator()
      this.lastSavedAt = new Date().toISOString()
      this.persist()
    },
    persist() {
      if (typeof localStorage === 'undefined') return
      const data: PersistedState = {
        schemaVersion: this.schemaVersion,
        halls: this.halls, exhibits: this.exhibits, versions: this.versions,
        guideReleases: this.guideReleases, submissions: this.submissions,
        selectedHallId: this.selectedHallId, selectedExhibitId: this.selectedExhibitId,
        selectedLanguageId: this.selectedLanguageId, lastSavedAt: this.lastSavedAt
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    },
    ensureSelection() {
      if (!this.halls.some(hall => hall.id === this.selectedHallId)) this.selectedHallId = this.halls[0]?.id || ''
      const inHall = this.exhibits.filter(exhibit => exhibit.hallId === this.selectedHallId)
      if (!inHall.some(exhibit => exhibit.id === this.selectedExhibitId)) this.selectedExhibitId = inHall[0]?.id || ''
      const exhibit = this.selectedExhibit
      if (!exhibit?.drafts.some(draft => draft.languageId === this.selectedLanguageId)) this.selectedLanguageId = exhibit?.drafts[0]?.languageId || 'zh'
    },
    selectHall(id: string) {
      this.selectedHallId = id
      const exhibit = this.exhibits.find(item => item.hallId === id)
      this.selectedExhibitId = exhibit?.id || ''
      this.ensureSelection()
      this.persist()
    },
    selectExhibit(id: string) {
      this.selectedExhibitId = id
      this.ensureSelection()
      this.persist()
    },
    selectLanguage(id: string) {
      this.selectedLanguageId = id
      this.persist()
    },
    updateDraft(patch: Partial<Pick<LanguageDraft, 'title' | 'narration' | 'accessibility' | 'durationMinutes' | 'sources'>>) {
      const draft = this.selectedDraft
      if (!draft) return
      this.commit(() => Object.assign(draft, patch, { updatedAt: new Date().toISOString() }))
      this.notice = '改动已自动保存到浏览器。'
    },
    updateSegment(id: string, patch: Partial<Pick<Segment, 'label' | 'content'>>) {
      const segment = this.selectedDraft?.segments.find(item => item.id === id)
      if (!segment || segment.locked) return
      this.commit(() => Object.assign(segment, patch))
    },
    toggleLock(id: string) {
      const segment = this.selectedDraft?.segments.find(item => item.id === id)
      if (!segment) return
      this.commit(() => { segment.locked = !segment.locked })
      this.notice = segment.locked ? '段落已锁定，避免误改。' : '段落已解锁。'
    },
    addSegment() {
      const draft = this.selectedDraft
      if (!draft) return
      this.commit(() => draft.segments.push({ id: `segment-${Date.now()}`, label: `新段落 ${draft.segments.length + 1}`, content: '', locked: false }))
    },
    removeSegment(id: string) {
      const draft = this.selectedDraft
      const segment = draft?.segments.find(item => item.id === id)
      if (!draft || !segment || segment.locked) return
      this.commit(() => { draft.segments = draft.segments.filter(item => item.id !== id) })
    },
    setStatus(status: ScriptStatus) {
      const draft = this.selectedDraft
      if (!draft) return
      this.commit(() => { draft.status = status; draft.updatedAt = new Date().toISOString() })
      this.notice = `状态已更新为“${this.statusLabel(status)}”。`
    },
    statusLabel(status: ScriptStatus) {
      return ({ draft: '草稿', review: '待审', returned: '退回', approved: '已定稿' })[status]
    },
    createVersion(name?: string) {
      const draft = this.selectedDraft
      if (!draft) return
      const version: VersionSnapshot = {
        id: `version-${Date.now()}`,
        exhibitId: this.selectedExhibitId,
        languageId: this.selectedLanguageId,
        name: name || `${new Date().toLocaleString('zh-CN', { hour12: false })} 快照`,
        createdAt: new Date().toISOString(),
        draft: JSON.parse(JSON.stringify(draft))
      }
      this.commit(() => this.versions.unshift(version))
      this.notice = '已保存当前版本，可在版本页比较或恢复。'
    },
    restoreVersion(id: string) {
      const version = this.versions.find(item => item.id === id)
      if (!version) return
      this.commit(() => {
        const exhibit = this.exhibits.find(item => item.id === version.exhibitId)
        if (!exhibit) return
        const index = exhibit.drafts.findIndex(item => item.languageId === version.languageId)
        const restored = JSON.parse(JSON.stringify(version.draft)) as LanguageDraft
        if (index >= 0) exhibit.drafts[index] = restored
        else exhibit.drafts.push(restored)
      })
      this.selectedExhibitId = version.exhibitId
      this.selectedLanguageId = version.languageId
      this.notice = '版本已恢复，并作为一次可撤销操作保存。'
    },
    undo() {
      const state = this.past.pop()
      if (!state) return
      this.future.push(this.snapshot())
      this.$patch(JSON.parse(state))
      this.lastSavedAt = new Date().toISOString()
      this.ensureSelection()
      this.persist()
      this.notice = '已撤销上一步。'
    },
    redo() {
      const state = this.future.pop()
      if (!state) return
      this.past.push(this.snapshot())
      this.$patch(JSON.parse(state))
      this.lastSavedAt = new Date().toISOString()
      this.ensureSelection()
      this.persist()
      this.notice = '已重做。'
    },
    // ── 导览制作侧 ──────────────────────────────────────────────
    // 送审：编辑侧发起，模拟网络请求；成功才更新导览清单，失败留本地等重试
    async submitForReview() {
      const draft = this.selectedDraft
      if (!draft) return
      const submission: Submission = {
        id: `submission-${Date.now()}`,
        exhibitId: this.selectedExhibitId,
        languageId: this.selectedLanguageId,
        createdAt: new Date().toISOString(),
        status: 'pending',
        payload: {
          title: draft.title,
          narration: draft.narration,
          accessibility: draft.accessibility,
          durationMinutes: draft.durationMinutes,
          sources: draft.sources,
          segments: JSON.parse(JSON.stringify(draft.segments))
        }
      }
      this.submissions.unshift(submission)
      this.persist()
      this.notice = '正在送审…'
      try {
        await simulateSubmission()
        submission.status = 'succeeded'
        submission.failReason = undefined
        this.commit(() => {
          this.applyRelease(submission)
          draft.status = 'review'
          draft.updatedAt = new Date().toISOString()
        })
        this.notice = '送审成功，导览录制清单已按本次版本更新。'
      } catch (error) {
        submission.status = 'failed'
        submission.failReason = error instanceof Error ? error.message : '送审失败'
        this.persist()
        this.notice = '送审失败，已留本地等重试；导览清单未变动。'
      }
    },
    // 重试失败的送审：成功前导览清单不动
    async retrySubmission(id: string) {
      const submission = this.submissions.find(item => item.id === id)
      if (!submission || submission.status === 'succeeded') return
      submission.status = 'pending'
      submission.failReason = undefined
      this.persist()
      this.notice = '正在重新送审…'
      try {
        await simulateSubmission()
        submission.status = 'succeeded'
        const draft = this.exhibits
          .find(item => item.id === submission.exhibitId)
          ?.drafts.find(item => item.languageId === submission.languageId)
        this.commit(() => {
          this.applyRelease(submission)
          if (draft) { draft.status = 'review'; draft.updatedAt = new Date().toISOString() }
        })
        this.notice = '重试成功，导览录制清单已更新。'
      } catch (error) {
        submission.status = 'failed'
        submission.failReason = error instanceof Error ? error.message : '送审失败'
        this.persist()
        this.notice = '重试仍失败，已留本地等下次重试。'
      }
    },
    // 送审成功后，用载荷重建导览录制清单；保留制作组已录状态与处理决定
    applyRelease(submission: Submission) {
      const { exhibitId, languageId, payload, id, createdAt } = submission
      const prev = this.guideReleases.find(item => item.exhibitId === exhibitId && item.languageId === languageId)
      const prevEntries = new Map((prev?.entries || []).map(entry => [entry.segmentId, entry]))
      const release: GuideRelease = {
        exhibitId,
        languageId,
        submissionId: id,
        submittedAt: createdAt,
        entries: payload.segments.map(segment => {
          const prevEntry = prevEntries.get(segment.id)
          return {
            id: prevEntry?.id || `entry-${segment.id}`,
            segmentId: segment.id,
            label: segment.label,
            narration: segment.content,
            accessibility: payload.accessibility,
            sources: payload.sources,
            recorded: prevEntry?.recorded ?? false,
            decision: prevEntry?.decision ?? 'pending',
            updatedAt: createdAt
          }
        })
      }
      const index = this.guideReleases.findIndex(item => item.exhibitId === exhibitId && item.languageId === languageId)
      if (index >= 0) this.guideReleases[index] = release
      else this.guideReleases.push(release)
    },
    // 录制条目状态：讲解词已变→必须重录；仅无障碍/资料变化→待制作组决定
    entryState(entry: RecordingEntry): { status: RecordingStatus; narrationChanged: boolean; accessibilityChanged: boolean; sourcesChanged: boolean; labelChanged: boolean } {
      const draft = this.exhibits
        .find(item => item.id === this.selectedExhibitId)
        ?.drafts.find(item => item.languageId === this.selectedLanguageId)
      const segment = draft?.segments.find(item => item.id === entry.segmentId)
      const narrationChanged = !!segment && segment.content !== entry.narration
      const labelChanged = !!segment && segment.label !== entry.label
      const accessibilityChanged = !!draft && draft.accessibility !== entry.accessibility
      const sourcesChanged = !!draft && draft.sources !== entry.sources
      let status: RecordingStatus = 'pending'
      if (entry.recorded) {
        if (narrationChanged) status = 'rerecord'
        else if (accessibilityChanged || sourcesChanged) {
          if (entry.decision === 'keep') status = 'ok'
          else if (entry.decision === 'rerecord') status = 'rerecord'
          else status = 'decision'
        } else status = 'ok'
      }
      return { status, narrationChanged, accessibilityChanged, sourcesChanged, labelChanged }
    },
    markRecorded(entryId: string) {
      const entry = this.selectedGuideRelease?.entries.find(item => item.id === entryId)
      if (!entry) return
      this.commit(() => { entry.recorded = true; entry.updatedAt = new Date().toISOString() })
      this.notice = '已标记为录制完成。'
    },
    unmarkRecorded(entryId: string) {
      const entry = this.selectedGuideRelease?.entries.find(item => item.id === entryId)
      if (!entry) return
      this.commit(() => { entry.recorded = false; entry.decision = 'pending'; entry.updatedAt = new Date().toISOString() })
      this.notice = '已取消录制标记。'
    },
    // 制作组决定：讲解词没变，仅无障碍/资料变化 → 保留旧录音，不重录
    keepRecording(entryId: string) {
      const entry = this.selectedGuideRelease?.entries.find(item => item.id === entryId)
      if (!entry) return
      this.commit(() => { entry.decision = 'keep'; entry.updatedAt = new Date().toISOString() })
      this.notice = '已决定保留旧录音，不重录。'
    },
    // 制作组决定重录（配合必须重录流程）
    decideRerecord(entryId: string) {
      const entry = this.selectedGuideRelease?.entries.find(item => item.id === entryId)
      if (!entry) return
      this.commit(() => { entry.decision = 'rerecord'; entry.updatedAt = new Date().toISOString() })
      this.notice = '已标记为重录，录制完成后请更新快照。'
    },
    // 重录完成：用当前编辑侧内容刷新条目快照
    markRerecordDone(entryId: string) {
      const entry = this.selectedGuideRelease?.entries.find(item => item.id === entryId)
      const draft = this.selectedDraft
      const segment = draft?.segments.find(item => item.id === entry?.segmentId)
      if (!entry || !draft || !segment) return
      this.commit(() => {
        entry.narration = segment.content
        entry.label = segment.label
        entry.accessibility = draft.accessibility
        entry.sources = draft.sources
        entry.recorded = true
        entry.decision = 'pending'
        entry.updatedAt = new Date().toISOString()
      })
      this.notice = '重录完成，条目快照已更新为当前版本。'
    },
    // 对账：按展项和语言列出两边对不上的地方
    reconcileFor(exhibit: Exhibit, languageId: string): Mismatch[] {
      return computeMismatches(exhibit, languageId, this.guideReleases)
    },
    completionFor(exhibit: Exhibit, languageId: string): number {
      const draft = exhibit.drafts.find(item => item.languageId === languageId)
      if (!draft) return 0
      const checks = [draft.title, draft.narration, draft.accessibility, draft.sources, draft.segments.length > 0 ? 'segments' : '']
      return Math.round(checks.filter(Boolean).length / checks.length * 100)
    }
  }
})
