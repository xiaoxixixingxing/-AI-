// 敏感词过滤（本地兜底版本，正式词库由系统管理员在后台维护）
const FALLBACK_WORDS = ['敏感词示例']

export function filterSensitive(text: string, words: string[] = FALLBACK_WORDS): {
  ok: boolean
  hit?: string
} {
  for (const w of words) {
    if (w && text.includes(w)) return { ok: false, hit: w }
  }
  return { ok: true }
}
