-- ============================================================
-- 初始数据
-- 在创建 schema 后手动执行，或在 Supabase Studio 的 SQL Editor 中粘贴
-- ============================================================

-- 敏感词种子（生产环境请替换为正式词库）
insert into sensitive_words (word) values
  ('傻逼'),
  ('滚蛋'),
  ('垃圾'),
  ('骗子'),
  ('诈骗'),
  ('赌博'),
  ('色情'),
  ('政治敏感词示例')
on conflict (word) do nothing;

-- 系统配置初始项
insert into system_config (key, value) values
  ('announcement', '{"title":"欢迎来到古琴云雅集","content":"琴心一片，云端共鸣","active":false}'::jsonb),
  ('virtual_gifts', '[{"type":"flower","name":"献花","icon":"🌸","cost":0},{"type":"applause","name":"掌声","icon":"👏","cost":0}]'::jsonb),
  ('mini_tools', '[{"key":"tuner","name":"调音器","enabled":true},{"key":"metronome","name":"节拍器","enabled":true},{"key":"score","name":"曲谱查阅","enabled":false}]'::jsonb),
  ('default_quotas', '{"player":5,"audience":50}'::jsonb)
on conflict (key) do nothing;
