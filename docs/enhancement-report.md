# 2026-09-24 增量增强交付

保留 Next.js / React / Tailwind / Supabase 架构、原页面、原视觉样式、医院与虚构专家数据、免登录三步预览，以及认证、上传、授权、工作台和后台功能。

## 文件清单

- `src/components/coordination-sections.tsx`（新增）：病历先行七步、适宜性、匹配依据、职责、费用、抵达/家属/恢复/回国支持、可选文化体验、故事示例及隐私补充。使用原有样式类和双语上下文。
- `src/components/public-pages.tsx`：在原首页段落之间插入模块；增强原旅程、医院/专家详情、隐私页；新增方向无匹配资料时明确说明。
- `src/components/site-shell.tsx`：页脚新增患者旅程示例入口。
- `src/components/patient-portal.tsx`：新增结构化字段与就医目标选择、状态中文显示、复核显示；修复中文后台状态筛选值。
- `src/components/case-preview.tsx`：免登录预览加入新字段的虚构示例。
- `src/lib/content.ts`：保留八个原方向并新增女性健康、先进诊断检查；扩展十三步旅程及谨慎的医疗优势文案。
- `src/lib/security.ts`：文件分类、新状态和就医目标选项；保留旧状态/分类。
- `src/lib/types.ts`：结构化字段类型，兼容旧病例。
- `src/app/[[...slug]]/page.tsx`：新增 `/patient-stories` 分发。
- `src/app/api/[...path]/route.ts`：新字段验证、目标枚举及旧请求默认值。
- `supabase/migrations/002_coordination_details.sql`（新增）：增量字段、插入列权限、状态和文件分类约束，不修改原 RLS 或私有存储策略。
- `tests/database.mjs`：执行两份迁移，验证新增字段权限/约束、分类、状态及原有隔离策略。
- `tests/integration.mjs`：旧请求兼容、新字段保存、非法目标拒绝、新旧状态与原有授权流程回归。
- `README.md`：功能、数据库新建/升级说明。
- `docs/enhancement-report.md`（本文件）：本次变更和验证记录。

## 已可用

中英文内容与新增故事页面；免登录三步流程预览；登录后填写新字段、保存草稿、分类上传、文件预览/下载/草稿删除、独立授权提交、患者查询和管理员状态管理。原有身份校验、受控文件接口、私有存储与 RLS 架构保留。

状态增加 Case Preparation、Ready for Hospital Review、Treatment Completed、Follow-up、Closed；兼容 Under Review、Completed。文件分类增加 Diagnosis、Blood Test、Surgical Record，保留 Medical Report、Lab Test 等旧值。

协调服务、医院评估、签证材料、线下支持及随访属于流程和服务范围展示，目前不会真的向医院发送病例或安排服务。医疗决定和建议始终由医生/医院提供。费用不规定固定价格或付款路径。

## Mock 与待接入

医院名称沿用目录演示；科室映射、服务能力和接诊情况未核实，不声称正式合作。12 位医生继续是虚构演示人物，图片为示意素材。蒙古国心血管故事为清晰标注的虚构流程，无真实姓名、评价、疗效或患者照片。

后续需要真实医院/医生授权及核实资料、专科和手术范围、国际患者/语言服务、预约时间、实际费用范围、真实联系方式，以及经过授权的真实患者故事。

本地演示只在服务端内存暂存虚构测试数据，重启清空。正式 Supabase、邮件、医院对接、线上删除请求处理及自动账户删除未进行云端验证/接入。文件目前通过鉴权接口提供，无公开永久链接；尚未使用签名 URL，不声称已实现该机制。

新数据库依次执行 001、002；已有 001 的数据库只执行 002，然后部署新版代码。

## 验证

- `npm install --ignore-scripts --offline`：成功，使用现有缓存依赖，未新增依赖。
- `npm test`：4 项通过。
- `node tests/database.mjs`：59 项断言通过（本地 PGlite 仿真 Supabase schemas，不等同真实云端验证）。
- `node tests/integration.mjs`：通过，包括权限、授权、文件与新字段/状态回归。
- `npm run typecheck`：通过。
- `npm run build`：通过。
- 19 个公开/患者/管理员页面路由返回 200，未知路径返回 404。
- 390、430、768、1280px 下检查首页、患者旅程、故事、医院/医生/诊疗目录，以及加载后的病例表单、上传页、含病例的工作台，没有检测到页面横向溢出。
- 浏览器实际完成虚构账号登录、新字段填写、目标选择、保存草稿及新分类显示检查；检查了移动端预览、流程卡片、费用卡片、桌面职责卡片、平板故事视觉。测试后已退出账号并恢复默认视口。
- 项目无 lint 脚本，未新增或声称运行 ESLint。
