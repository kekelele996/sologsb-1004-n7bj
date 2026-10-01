import { defineStore } from 'pinia'
import type {
  Exhibit, GuidePackage, Hall, Language, LanguageDraft, PendingSubmission,
  PersistedState, RecordingEntry, ReconcileIssue, ScriptStatus, Segment, VersionSnapshot, WorkspaceSide
} from '~/types'

export const LANGUAGES: Language[] = [
  { id: 'zh', code: 'zh-CN', label: '简体中文', shortLabel: '中' },
  { id: 'en', code: 'en-US', label: 'English', shortLabel: 'EN' },
  { id: 'ja', code: 'ja-JP', label: '日本語', shortLabel: '日' }
]

const STORAGE_KEY = 'museum-script-studio-v1'

type SegmentSeed = [string, string, boolean?]
const segments = (prefix: string, values: SegmentSeed[]): Segment[] => values.map(([label, content, locked], index) => ({
  id: `${prefix}-${index + 1}`,
  label,
  content,
  locked: Boolean(locked)
}))

const metaSignature = (accessibility: string, sources: string) => `${accessibility}${sources}`
const pkgKey = (exhibitId: string, languageId: string) => `${exhibitId}::${languageId}`

function entry(segmentId: string, label: string, text: string, status: RecordingEntry['status'], extra: Partial<RecordingEntry> = {}): RecordingEntry {
  return { segmentId, label, text, status, ...extra }
}

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
          accessibility: '玉琮为深青色，高约二十厘米。触摸模型可感受方形四角与中央圆孔；圆孔贯穿器身。展柜旁配有良渚遗址地形浮雕。',
          durationMinutes: 2.5, sources: '《中国玉器全集》第一卷；本馆藏品档案 1987-J-042；2026-09 专家核验：王立新研究员',
          status: 'approved', updatedAt: '2026-09-28T08:35:00.000Z',
          segments: segments('jade-zh', [
            ['开场定位', '这件玉琮来自距今约五千年的良渚文化，出土于长江下游的太湖流域。', true],
            ['器物观察', '它外方内圆，四角雕刻神人兽面纹，孔壁留有细密的旋痕。', true],
            ['文化含义', '玉琮常被看作沟通天地的礼器，也象征权力与身份。'],
            ['参观提示', '请沿展柜顺时针观察，触摸复制品前先使用免洗消毒液。']
          ])
        },
        {
          id: 'draft-jade-en', languageId: 'en', title: 'Jade Cong: A Ritual Object Between Heaven and Earth',
          narration: 'This jade cong was made by the Liangzhu culture. Its square exterior and circular bore embody an early Chinese vision of the cosmos.',
          accessibility: 'The object is dark green. A tactile model shows four corners, carved faces, and a central circular opening.',
          durationMinutes: 2.3, sources: 'Complete Collection of Chinese Jades, Vol. 1; Museum accession 1987-J-042',
          status: 'review', updatedAt: '2026-09-25T02:15:00.000Z',
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
          status: 'returned', updatedAt: '2026-09-29T06:10:00.000Z',
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
          status: 'returned', updatedAt: '2026-09-27T11:20:00.000Z',
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
        status: 'approved', updatedAt: '2026-09-20T03:00:00.000Z',
        segments: segments('silk-zh', [['序言', '丝绸不只是一种材料，也是交流的媒介。'], ['互动', '请试着推动梭子，观察经纬线如何交会。']])
      }]
    }
  ]

  // 导览制作侧：玉琮中文是 09-25 的送审版，编辑此后又改过（演示重录/待决定）
  const jadeZhPkg: GuidePackage = {
    exhibitId: 'exhibit-jade', languageId: 'zh',
    title: '玉琮：沟通天地的礼器',
    narration: '这件玉琮出土于长江下游的良渚遗址。它外方内圆，四角雕刻神人兽面纹，体现了新石器时代晚期精湛的玉器工艺。',
    accessibility: '玉琮为深青色，高约二十厘米。触摸模型可感受方形四角与中央圆孔；圆孔贯穿器身。',
    sources: '《中国玉器全集》第一卷；本馆藏品档案 1987-J-042',
    durationMinutes: 2.5, submittedAt: '2026-09-25T07:00:00.000Z', submitName: '09-25 展陈定稿送审',
    entries: [
      entry('jade-zh-1', '开场定位', '这件玉琮来自距今约五千年的良渚文化。', 'recorded', { recordedAt: '2026-09-25T10:00:00.000Z' }),
      entry('jade-zh-2', '器物观察', '它外方内圆，四角雕刻神人兽面纹。', 'recorded', { recordedAt: '2026-09-25T10:08:00.000Z' }),
      entry('jade-zh-3', '文化含义', '玉琮常被看作沟通天地的礼器，也象征权力与身份。', 'recorded', { recordedAt: '2026-09-25T10:16:00.000Z', decision: 'pending' }),
      entry('jade-zh-4', '参观提示', '请沿展柜顺时针观察，触摸复制品前先使用免洗消毒液。', 'pending')
    ]
  }
  const jadeEnPkg: GuidePackage = {
    exhibitId: 'exhibit-jade', languageId: 'en',
    title: 'Jade Cong: A Ritual Object Between Heaven and Earth',
    narration: 'This jade cong was made by the Liangzhu culture. Its square exterior and circular bore embody an early Chinese vision of the cosmos.',
    accessibility: 'The object is dark green. A tactile model shows four corners, carved faces, and a central circular opening.',
    sources: 'Complete Collection of Chinese Jades, Vol. 1; Museum accession 1987-J-042',
    durationMinutes: 2.3, submittedAt: '2026-09-25T02:15:00.000Z', submitName: '09-25 English submit',
    entries: [
      entry('jade-en-1', 'Introduction', 'This jade cong is about five thousand years old.', 'recorded', { recordedAt: '2026-09-25T09:00:00.000Z' }),
      entry('jade-en-2', 'Visual description', 'Its square body encloses a circular opening, while spirit-and-animal motifs cover the corners.', 'recorded', { recordedAt: '2026-09-25T09:10:00.000Z' }),
      entry('jade-en-3', 'Meaning', 'Jade cong is understood as a ritual link between heaven and earth.', 'recorded', { recordedAt: '2026-09-25T09:18:00.000Z' })
    ]
  }
  // 青铜爵中文：含一个已删除段落的孤立条目，等人工对账
  const bronzeZhPkg: GuidePackage = {
    exhibitId: 'exhibit-bronze', languageId: 'zh',
    title: '青铜爵与礼制',
    narration: '爵是最早的青铜酒器之一。三足稳定器身，长流便于倾倒。',
    accessibility: '器物为青铜色，器口一侧有长流，底部三足支撑。',
    sources: '《殷周青铜器通论》',
    durationMinutes: 3, submittedAt: '2026-09-18T03:30:00.000Z', submitName: '09-18 初审送审',
    entries: [
      entry('bronze-zh-1', '器物介绍', '这是一件商代青铜爵，用于温酒和饮酒。', 'recorded', { recordedAt: '2026-09-18T08:00:00.000Z' }),
      entry('bronze-zh-2', '结构说明', '三足使器身稳定，前端的流便于倾倒。', 'pending'),
      entry('bronze-zh-3', '礼制背景', '青铜器数量与形制反映了使用者的身份。', 'pending'),
      entry('bronze-zh-old', '（已删除段落）柱饰用途补充', '柱饰可能用于悬挂香料，也有观点认为是礼仪装饰。', 'recorded', { recordedAt: '2026-09-18T08:20:00.000Z', orphan: true })
    ]
  }
  // 对不上账：导览侧有日文录制包，但青铜爵展项下已没有日文文稿
  const bronzeJaPkg: GuidePackage = {
    exhibitId: 'exhibit-bronze', languageId: 'ja',
    title: '青銅爵と礼制',
    narration: '爵は最も早い青銅の酒器の一つです。',
    accessibility: '青銅色で、三本の足で支えられています。',
    sources: '殷周青銅器通論',
    durationMinutes: 2.6, submittedAt: '2026-09-10T01:00:00.000Z', submitName: '09-10 旧版送审（日文已撤稿）',
    entries: [
      entry('bronze-ja-1', '概要', 'これは商代の青銅爵です。', 'recorded', { recordedAt: '2026-09-10T05:00:00.000Z', orphan: true })
    ]
  }

  // 玉琮日文：送审失败挂在编辑侧本地，导览侧没有任何日文包
  const pendingSubmissions: PendingSubmission[] = [
    {
      exhibitId: 'exhibit-jade', languageId: 'ja', submitName: '09-29 日文修订送审',
      attemptedAt: '2026-09-29T06:12:00.000Z', lastError: '审校通道超时（HTTP 504），包未送达导览制作侧',
      targetStatus: 'review'
    }
  ]

  return {
    schemaVersion: 2,
    halls,
    exhibits,
    packages: [jadeZhPkg, jadeEnPkg, bronzeZhPkg, bronzeJaPkg],
    pendingSubmissions,
    acknowledgedIssues: [],
    versions: [],
    selectedHallId: halls[0].id,
    selectedExhibitId: exhibits[0].id,
    selectedLanguageId: 'zh',
    side: 'editor',
    simulateSubmitFailure: false,
    lastSavedAt: new Date().toISOString()
  }
}

/** 旧版（v1）数据第一次打开：按段落归属迁到编辑稿两侧，导览条目一律“待录” */
function migrateV1(raw: unknown): PersistedState | null {
  if (!raw || typeof raw !== 'object') return null
  const old = raw as Partial<PersistedState> & { exhibits?: Exhibit[], versions?: VersionSnapshot[] }
  if (old.schemaVersion === 2 || !Array.isArray(old.exhibits)) return null
  const packages: GuidePackage[] = []
  for (const exhibit of old.exhibits) {
    for (const draft of exhibit.drafts ?? []) {
      packages.push({
        exhibitId: exhibit.id,
        languageId: draft.languageId,
        title: draft.title,
        narration: draft.narration,
        accessibility: draft.accessibility,
        sources: draft.sources,
        durationMinutes: draft.durationMinutes,
        submittedAt: draft.updatedAt,
        submitName: '旧数据迁移（按段落归属生成）',
        entries: draft.segments.map(segment => entry(segment.id, segment.label, segment.content, 'pending'))
      })
    }
  }
  return {
    schemaVersion: 2,
    halls: old.halls ?? [],
    exhibits: old.exhibits,
    packages,
    pendingSubmissions: [],
    acknowledgedIssues: [],
    versions: Array.isArray(old.versions) ? old.versions : [],
    selectedHallId: old.selectedHallId ?? old.halls?.[0]?.id ?? '',
    selectedExhibitId: old.selectedExhibitId ?? old.exhibits[0]?.id ?? '',
    selectedLanguageId: old.selectedLanguageId ?? 'zh',
    side: 'editor',
    simulateSubmitFailure: false,
    lastSavedAt: old.lastSavedAt ?? new Date().toISOString()
  }
}

interface SegmentChange { segmentId: string; label: string; kind: 'changed' | 'new' | 'deleted' }

export const useScriptStore = defineStore('museum-script', {
  state: () => ({
    halls: [] as Hall[],
    exhibits: [] as Exhibit[],
    packages: [] as GuidePackage[],
    pendingSubmissions: [] as PendingSubmission[],
    acknowledgedIssues: [] as string[],
    versions: [] as VersionSnapshot[],
    selectedHallId: '',
    selectedExhibitId: '',
    selectedLanguageId: 'zh',
    side: 'editor' as WorkspaceSide,
    simulateSubmitFailure: false,
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
    selectedPackage(): GuidePackage | undefined {
      return this.packages.find(pkg => pkg.exhibitId === this.selectedExhibitId && pkg.languageId === this.selectedLanguageId)
    },
    pendingForSelection(): PendingSubmission | undefined {
      return this.pendingSubmissions.find(item => item.exhibitId === this.selectedExhibitId && item.languageId === this.selectedLanguageId)
    },
    wordCount(): number {
      return (this.selectedDraft?.narration || '').replace(/\s/g, '').length
    },
    canUndo(state): boolean { return state.past.length > 0 },
    canRedo(state): boolean { return state.future.length > 0 },

    /** 编辑工作稿相对“上次送审版”的差异，只在编辑侧有意义 */
    draftChanges(): {
      hasPackage: boolean
      narrationChanged: boolean
      accessibilityChanged: boolean
      sourcesChanged: boolean
      titleChanged: boolean
      durationChanged: boolean
      segments: SegmentChange[]
      changed: boolean
    } {
      const draft = this.selectedDraft
      const pkg = this.selectedPackage
      if (!draft) {
        return { hasPackage: false, narrationChanged: false, accessibilityChanged: false, sourcesChanged: false, titleChanged: false, durationChanged: false, segments: [], changed: false }
      }
      if (!pkg) {
        return {
          hasPackage: false, narrationChanged: false, accessibilityChanged: false, sourcesChanged: false,
          titleChanged: false, durationChanged: false,
          segments: draft.segments.map(segment => ({ segmentId: segment.id, label: segment.label, kind: 'new' as const })),
          changed: true
        }
      }
      const segmentChanges: SegmentChange[] = []
      for (const segment of draft.segments) {
        const oldEntry = pkg.entries.find(item => item.segmentId === segment.id)
        if (!oldEntry) segmentChanges.push({ segmentId: segment.id, label: segment.label, kind: 'new' })
        else if (oldEntry.text !== segment.content) segmentChanges.push({ segmentId: segment.id, label: segment.label, kind: 'changed' })
      }
      for (const entryItem of pkg.entries) {
        if (entryItem.orphan || !draft.segments.some(segment => segment.id === entryItem.segmentId)) {
          segmentChanges.push({ segmentId: entryItem.segmentId, label: entryItem.label, kind: 'deleted' })
        }
      }
      return {
        hasPackage: true,
        narrationChanged: draft.narration !== pkg.narration,
        accessibilityChanged: draft.accessibility !== pkg.accessibility,
        sourcesChanged: draft.sources !== pkg.sources,
        titleChanged: draft.title !== pkg.title,
        durationChanged: draft.durationMinutes !== pkg.durationMinutes,
        segments: segmentChanges,
        changed: draft.narration !== pkg.narration
          || draft.accessibility !== pkg.accessibility
          || draft.sources !== pkg.sources
          || draft.title !== pkg.title
          || draft.durationMinutes !== pkg.durationMinutes
          || segmentChanges.length > 0
      }
    },

    /** 已录音但这次只有无障碍/来源变化的条目，摆给制作组决定 */
    pendingDecisions(): Array<{ pkg: GuidePackage; exhibit: Exhibit | undefined; languageId: string; entry: RecordingEntry }> {
      const rows: Array<{ pkg: GuidePackage; exhibit: Exhibit | undefined; languageId: string; entry: RecordingEntry }> = []
      for (const pkg of this.packages) {
        const exhibit = this.exhibits.find(item => item.id === pkg.exhibitId)
        for (const entryItem of pkg.entries) {
          if (entryItem.decision === 'pending') rows.push({ pkg, exhibit, languageId: pkg.languageId, entry: entryItem })
        }
      }
      return rows
    },

    /** 两边对账：按展项 + 语言列出对不上的账 */
    reconcileIssues(): ReconcileIssue[] {
      const issues: ReconcileIssue[] = []
      for (const exhibit of this.exhibits) {
        for (const draft of exhibit.drafts) {
          const pkg = this.packages.find(item => item.exhibitId === exhibit.id && item.languageId === draft.languageId)
          if (!pkg && draft.status === 'approved') {
            issues.push({
              key: `missing-package:${pkgKey(exhibit.id, draft.languageId)}`,
              kind: 'missing-package', exhibitId: exhibit.id, languageId: draft.languageId,
              detail: '文稿已定稿，但导览制作侧从未收到送审版本，录制清单为空。'
            })
          }
          if (pkg) {
            for (const entryItem of pkg.entries) {
              if (entryItem.orphan) {
                issues.push({
                  key: `orphan-entry:${pkgKey(exhibit.id, draft.languageId)}:${entryItem.segmentId}`,
                  kind: 'orphan-entry', exhibitId: exhibit.id, languageId: draft.languageId,
                  entryLabel: entryItem.label, segmentId: entryItem.segmentId,
                  detail: `录制条目“${entryItem.label}”在送审版中已无对应段落（编辑侧已删除），录音文件保留待确认。`
                })
              }
            }
          }
        }
      }
      for (const pkg of this.packages) {
        const exhibit = this.exhibits.find(item => item.id === pkg.exhibitId)
        const draft = exhibit?.drafts.find(item => item.languageId === pkg.languageId)
        if (!exhibit || !draft) {
          issues.push({
            key: `draft-missing:${pkgKey(pkg.exhibitId, pkg.languageId)}`,
            kind: 'draft-missing', exhibitId: pkg.exhibitId, languageId: pkg.languageId,
            detail: `导览侧持有“${pkg.submitName}”录制包，但编辑侧已找不到对应文稿（${exhibit ? '该语言已撤稿' : '展项已删除'}）。`
          })
        }
      }
      for (const pending of this.pendingSubmissions) {
        issues.push({
          key: `submission-failed:${pkgKey(pending.exhibitId, pending.languageId)}`,
          kind: 'submission-failed', exhibitId: pending.exhibitId, languageId: pending.languageId,
          detail: `送审失败，改动只留在编辑本地：${pending.lastError}`
        })
      }
      return issues
    },
    unacknowledgedIssues(): ReconcileIssue[] {
      return this.reconcileIssues.filter(issue => !this.acknowledgedIssues.includes(issue.key))
    }
  },
  actions: {
    hydrate() {
      if (this.hydrated || typeof localStorage === 'undefined') return
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          const migrated = migrateV1(parsed)
          if (migrated) {
            this.$patch({ ...migrated, hydrated: true })
            this.ensureSelection()
            this.persist()
            this.notice = `旧版数据已按段落归属迁移：编辑稿留在展陈编辑侧，并为 ${migrated.packages.length} 份文稿在导览制作侧生成了上次送审版（条目均为待录）。`
          } else {
            const data = parsed as PersistedState
            this.$patch({ ...data, hydrated: true })
            if (!this.halls.length || !this.exhibits.length) {
              this.resetDemo()
              return
            }
            this.ensureSelection()
          }
        } catch {
          this.resetDemo()
          return
        }
      } else {
        this.resetDemo()
        return
      }
      this.hydrated = true
    },
    resetDemo() {
      this.$patch({ ...demoState(), hydrated: true, past: [], future: [] })
      this.persist()
      this.notice = '示例数据已就绪：两侧拆分、待决定条目与对账差异均可直接体验。'
    },
    snapshot(): string {
      return JSON.stringify({
        halls: this.halls, exhibits: this.exhibits, packages: this.packages,
        pendingSubmissions: this.pendingSubmissions, acknowledgedIssues: this.acknowledgedIssues,
        versions: this.versions
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
        schemaVersion: 2,
        halls: this.halls, exhibits: this.exhibits, packages: this.packages,
        pendingSubmissions: this.pendingSubmissions, acknowledgedIssues: this.acknowledgedIssues,
        versions: this.versions,
        selectedHallId: this.selectedHallId, selectedExhibitId: this.selectedExhibitId,
        selectedLanguageId: this.selectedLanguageId, side: this.side,
        simulateSubmitFailure: this.simulateSubmitFailure, lastSavedAt: this.lastSavedAt
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
    setSide(side: WorkspaceSide) {
      this.side = side
      this.persist()
    },
    setSimulateSubmitFailure(value: boolean) {
      this.simulateSubmitFailure = value
      this.persist()
    },

    // ---------------- 展陈编辑侧 ----------------
    updateDraft(patch: Partial<Pick<LanguageDraft, 'title' | 'narration' | 'accessibility' | 'durationMinutes' | 'sources'>>) {
      const draft = this.selectedDraft
      if (!draft) return
      this.commit(() => Object.assign(draft, patch, { updatedAt: new Date().toISOString() }))
      this.notice = '改动已保存在展陈编辑侧；未送审前导览制作清单不变。'
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
      this.notice = '段落已从编辑稿删除；导览侧条目保留，将在下次送审后进入对账待确认。'
    },
    setStatus(status: ScriptStatus) {
      const draft = this.selectedDraft
      if (!draft) return
      this.commit(() => { draft.status = status; draft.updatedAt = new Date().toISOString() })
      this.notice = `状态已更新为“${this.statusLabel(status)}”。`
    },

    /** 送审：失败只挂编辑本地等重试，成功才把新快照推给导览制作侧 */
    submitForReview() {
      const draft = this.selectedDraft
      const exhibit = this.selectedExhibit
      if (!draft || !exhibit) return
      const now = new Date()
      const submitName = `送审 ${now.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}`
      if (this.simulateSubmitFailure) {
        this.commit(() => {
          const existing = this.pendingSubmissions.find(item => item.exhibitId === exhibit.id && item.languageId === draft.languageId)
          const pending: PendingSubmission = {
            exhibitId: exhibit.id, languageId: draft.languageId, submitName,
            attemptedAt: now.toISOString(), lastError: '模拟审校通道异常：网关超时（演示用开关触发）', targetStatus: 'review'
          }
          if (existing) Object.assign(existing, pending)
          else this.pendingSubmissions.unshift(pending)
        })
        this.notice = '送审失败：改动只留在编辑本地，导览制作侧未更新，可随时重试。'
        return
      }
      this.commit(() => {
        this.syncPackage(exhibit, draft, submitName, now.toISOString())
        draft.status = 'review'
        draft.updatedAt = now.toISOString()
        this.pendingSubmissions = this.pendingSubmissions.filter(
          item => !(item.exhibitId === exhibit.id && item.languageId === draft.languageId)
        )
      })
      this.notice = '送审成功：导览制作清单已更新到本次送审版。'
    },
    retryPending(exhibitId: string, languageId: string) {
      const pending = this.pendingSubmissions.find(item => item.exhibitId === exhibitId && item.languageId === languageId)
      const exhibit = this.exhibits.find(item => item.id === exhibitId)
      const draft = exhibit?.drafts.find(item => item.languageId === languageId)
      if (!pending || !exhibit || !draft) return
      const now = new Date()
      if (this.simulateSubmitFailure) {
        this.commit(() => {
          pending.attemptedAt = now.toISOString()
          pending.lastError = '模拟审校通道异常：网关超时（演示用开关触发）'
        })
        this.notice = '重试仍失败：继续留在编辑本地，导览制作侧不动。'
        return
      }
      this.commit(() => {
        this.syncPackage(exhibit, draft, pending.submitName, now.toISOString())
        draft.status = pending.targetStatus
        draft.updatedAt = now.toISOString()
        this.pendingSubmissions = this.pendingSubmissions.filter(item => item !== pending)
      })
      this.notice = '重试成功：挂起的送审已送达，导览制作清单已更新。'
    },
    cancelPending(exhibitId: string, languageId: string) {
      this.commit(() => {
        this.pendingSubmissions = this.pendingSubmissions.filter(
          item => !(item.exhibitId === exhibitId && item.languageId === languageId)
        )
      })
      this.notice = '已撤下挂起的送审，改动仍保留在编辑稿中。'
    },
    /** 按上次送审版生成新的录制包：讲解词变了要求重录，只动无障碍/来源则交制作组决定 */
    syncPackage(exhibit: Exhibit, draft: LanguageDraft, submitName: string, submittedAt: string) {
      const old = this.packages.find(item => item.exhibitId === exhibit.id && item.languageId === draft.languageId)
      const metaSig = metaSignature(draft.accessibility, draft.sources)
      const metaChanged = old ? (old.accessibility !== draft.accessibility || old.sources !== draft.sources) : false

      const carried: RecordingEntry[] = draft.segments.map(segment => {
        const previous = old?.entries.find(item => item.segmentId === segment.id)
        if (!previous) return entry(segment.id, segment.label, segment.content, 'pending')
        if (previous.text !== segment.content) {
          // 讲解词变了：无论录没录过都要重录
          return entry(segment.id, segment.label, segment.content, 'pending')
        }
        const next: RecordingEntry = { ...previous, label: segment.label, orphan: false }
        if (metaChanged && next.status === 'recorded' && next.decisionMeta !== metaSig) {
          // 讲解词没动，只是无障碍描述/资料来源变了：摆给制作组定夺
          next.decision = 'pending'
        }
        return next
      })
      const leftovers: RecordingEntry[] = (old?.entries ?? [])
        .filter(oldEntry => !draft.segments.some(segment => segment.id === oldEntry.segmentId))
        .map(oldEntry => ({ ...oldEntry, orphan: true }))

      const pkg: GuidePackage = {
        exhibitId: exhibit.id,
        languageId: draft.languageId,
        title: draft.title,
        narration: draft.narration,
        accessibility: draft.accessibility,
        sources: draft.sources,
        durationMinutes: draft.durationMinutes,
        submittedAt,
        submitName,
        entries: [...carried, ...leftovers]
      }
      this.packages = [pkg, ...this.packages.filter(item => item !== old)]
      // 标记这批待决定条目对应的新元数据签名，制作组处理后据此判断
      for (const item of pkg.entries) {
        if (item.decision === 'pending') item.decisionMeta = metaSig
      }
    },

    // ---------------- 导览制作侧 ----------------
    setEntryRecorded(exhibitId: string, languageId: string, segmentId: string, recorded: boolean) {
      const pkg = this.packages.find(item => item.exhibitId === exhibitId && item.languageId === languageId)
      const target = pkg?.entries.find(item => item.segmentId === segmentId)
      if (!pkg || !target || target.orphan) return
      this.commit(() => {
        target.status = recorded ? 'recorded' : 'pending'
        target.recordedAt = recorded ? new Date().toISOString() : undefined
        if (recorded) { target.decision = undefined; target.decisionMeta = undefined }
      })
      this.notice = recorded ? '条目已标记为录音完成。' : '条目已退回待录。'
    },
    /** 制作组决定：仅无障碍/来源变化时，保留原音或安排重录 */
    resolveDecision(exhibitId: string, languageId: string, segmentId: string, action: 'keep' | 'rerecord') {
      const pkg = this.packages.find(item => item.exhibitId === exhibitId && item.languageId === languageId)
      const target = pkg?.entries.find(item => item.segmentId === segmentId)
      if (!pkg || !target || target.decision !== 'pending') return
      this.commit(() => {
        const sig = metaSignature(pkg.accessibility, pkg.sources)
        if (action === 'keep') {
          target.decision = 'keep'
          target.decisionMeta = sig
        } else {
          target.decision = 'rerecord'
          target.decisionMeta = sig
          target.status = 'pending'
          target.recordedAt = undefined
        }
      })
      this.notice = action === 'keep' ? '已确认保留原录音，本条不再提示。' : '已安排重录，条目退回待录。'
    },
    removeOrphanEntry(exhibitId: string, languageId: string, segmentId: string) {
      const pkg = this.packages.find(item => item.exhibitId === exhibitId && item.languageId === languageId)
      if (!pkg) return
      this.commit(() => {
        pkg.entries = pkg.entries.filter(item => item.segmentId !== segmentId)
      })
      this.notice = '孤立条目已从录制清单移除，对应录音文件请在资产库另行归档。'
    },
    /** 编辑侧已无文稿的整个录制包，对账确认后归档移除 */
    removePackage(exhibitId: string, languageId: string) {
      this.commit(() => {
        this.packages = this.packages.filter(item => !(item.exhibitId === exhibitId && item.languageId === languageId))
      })
      this.notice = '该展项语言的录制包已归档移除。'
    },

    // ---------------- 对账 ----------------
    acknowledgeIssue(key: string) {
      if (this.acknowledgedIssues.includes(key)) return
      this.commit(() => this.acknowledgedIssues.push(key))
      this.notice = '该差异已标记为人工确认，默认不再提示；可在对账页撤销确认。'
    },
    unacknowledgeIssue(key: string) {
      this.commit(() => {
        this.acknowledgedIssues = this.acknowledgedIssues.filter(item => item !== key)
      })
    },

    // ---------------- 版本（只属于编辑侧） ----------------
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
      this.notice = '编辑稿版本快照已保存，可比较或恢复。'
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
      this.notice = '版本已恢复到编辑工作稿（导览侧送审版不受影响），并可撤销。'
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
    completionFor(exhibit: Exhibit, languageId: string): number {
      const draft = exhibit.drafts.find(item => item.languageId === languageId)
      if (!draft) return 0
      const checks = [draft.title, draft.narration, draft.accessibility, draft.sources, draft.segments.length > 0 ? 'segments' : '']
      return Math.round(checks.filter(Boolean).length / checks.length * 100)
    },
    statusLabel(status: ScriptStatus) {
      return ({ draft: '草稿', review: '待审', returned: '退回', approved: '已定稿' })[status]
    },
    languageLabel(languageId: string) {
      return LANGUAGES.find(item => item.id === languageId)?.label || languageId
    },
    exhibitTitle(exhibitId: string) {
      return this.exhibits.find(item => item.id === exhibitId)?.title || '（展项已删除）'
    },
    exhibitCode(exhibitId: string) {
      return this.exhibits.find(item => item.id === exhibitId)?.code || '—'
    }
  }
})
