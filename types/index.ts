export type ScriptStatus = 'draft' | 'review' | 'returned' | 'approved'
export type DeviceKind = 'desktop' | 'tablet' | 'mobile' | 'kiosk'

// 导览制作侧：录制条目状态
// pending 未录制；ok 已录制且与送审版本一致（或制作组决定保留旧录音）；
// rerecord 讲解词已变，必须重录；decision 仅无障碍/资料变化，待制作组决定是否重录
export type RecordingStatus = 'pending' | 'ok' | 'rerecord' | 'decision'
// 制作组对「仅无障碍/资料变化」条目的处理决定
export type RecordingDecision = 'pending' | 'keep' | 'rerecord'

export interface RecordingEntry {
  id: string
  segmentId: string
  label: string
  narration: string
  accessibility: string
  sources: string
  recorded: boolean
  decision: RecordingDecision
  updatedAt: string
}

// 导览制作侧：某个展项某语言的录制清单，按上次成功送审的版本固化
export interface GuideRelease {
  exhibitId: string
  languageId: string
  submissionId: string
  submittedAt: string
  entries: RecordingEntry[]
}

export type SubmissionStatus = 'pending' | 'succeeded' | 'failed'

export interface Submission {
  id: string
  exhibitId: string
  languageId: string
  createdAt: string
  status: SubmissionStatus
  failReason?: string
  // 送审载荷：失败时留本地等重试，导览清单不动
  payload: {
    title: string
    narration: string
    accessibility: string
    durationMinutes: number
    sources: string
    segments: Segment[]
  }
}

export type MismatchType =
  | 'added'
  | 'removed'
  | 'label-changed'
  | 'narration-changed'
  | 'accessibility-changed'
  | 'sources-changed'
  | 'not-submitted'

export interface Mismatch {
  type: MismatchType
  segmentId?: string
  label: string
  detail?: string
}

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

export interface VersionSnapshot {
  id: string
  exhibitId: string
  languageId: string
  name: string
  createdAt: string
  draft: LanguageDraft
}

export interface PersistedState {
  schemaVersion: number
  halls: Hall[]
  exhibits: Exhibit[]
  versions: VersionSnapshot[]
  guideReleases: GuideRelease[]
  submissions: Submission[]
  selectedHallId: string
  selectedExhibitId: string
  selectedLanguageId: string
  lastSavedAt: string
}

export interface DiffLine {
  type: 'same' | 'add' | 'remove'
  text: string
}
