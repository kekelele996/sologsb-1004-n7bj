export type ScriptStatus = 'draft' | 'review' | 'returned' | 'approved'
export type DeviceKind = 'desktop' | 'tablet' | 'mobile' | 'kiosk'
export type WorkspaceSide = 'editor' | 'studio'

export interface Hall {
  id: string
  name: string
  description: string
}

export interface Segment {
  id: string
  label: string
  content: string
  locked: boolean
}

/** 展陈编辑侧的工作稿：讲解词、无障碍描述、资料来源都归编辑管 */
export interface LanguageDraft {
  id: string
  languageId: string
  title: string
  narration: string
  accessibility: string
  durationMinutes: number
  sources: string
  status: ScriptStatus
  segments: Segment[]
  updatedAt: string
}

export interface Exhibit {
  id: string
  hallId: string
  code: string
  title: string
  order: number
  drafts: LanguageDraft[]
}

export interface Language {
  id: string
  code: string
  label: string
  shortLabel: string
}

/** 导览制作侧：录制条目按段落一一对应 */
export interface RecordingEntry {
  segmentId: string
  label: string
  /** 送审快照里的讲解词文本，录音以此为准 */
  text: string
  status: 'pending' | 'recorded'
  /** 制作组的处理决定；pending 表示只有无障碍/来源变化，正等制作组定夺 */
  decision?: 'pending' | 'keep' | 'rerecord'
  /** 上次制作组决定时对应的“无障碍+来源”签名，相同则不再重复提示 */
  decisionMeta?: string
  /** 送审快照里已找不到对应段落（编辑侧删除了段落），等人工对账确认 */
  orphan?: boolean
  recordedAt?: string
}

/** 导览制作侧持有的“上次送审版本”，编辑改稿不影响它 */
export interface GuidePackage {
  exhibitId: string
  languageId: string
  title: string
  narration: string
  accessibility: string
  sources: string
  durationMinutes: number
  entries: RecordingEntry[]
  submittedAt: string
  submitName: string
}

/** 送审失败时只挂在编辑侧的本地待办，导览侧不动 */
export interface PendingSubmission {
  exhibitId: string
  languageId: string
  submitName: string
  attemptedAt: string
  lastError: string
  /** 送审时希望流转到的状态 */
  targetStatus: ScriptStatus
}

export type ReconcileKind =
  | 'missing-package'
  | 'orphan-entry'
  | 'draft-missing'
  | 'submission-failed'

export interface ReconcileIssue {
  key: string
  kind: ReconcileKind
  exhibitId: string
  languageId: string
  detail: string
  entryLabel?: string
  segmentId?: string
}

export interface VersionSnapshot {
  id: string
  exhibitId: string
  languageId: string
  name: string
  createdAt: string
  draft: LanguageDraft
}

export interface PersistedState {
  schemaVersion: 2
  halls: Hall[]
  exhibits: Exhibit[]
  packages: GuidePackage[]
  pendingSubmissions: PendingSubmission[]
  acknowledgedIssues: string[]
  versions: VersionSnapshot[]
  selectedHallId: string
  selectedExhibitId: string
  selectedLanguageId: string
  side: WorkspaceSide
  simulateSubmitFailure: boolean
  lastSavedAt: string
}

export interface DiffLine {
  type: 'same' | 'add' | 'remove'
  text: string
}
