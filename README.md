# ChinaCare — 国际患者来华医疗 Demo

独立项目，原工作区中的其他项目未修改。技术栈：Next.js App Router、React、TypeScript、Tailwind CSS、Supabase Auth/PostgreSQL/Private Storage。

## 本地运行

需要 Node.js 22+（已在 Node 24 验证）。

```sh
cd "/Users/yongqizhang/Documents/New project/china-care"
npm ci
npm run dev
```

打开 http://127.0.0.1:3100 。默认英文，顶部切换中文。没有 Supabase 环境变量时自动进入本地演示模式，无需配置数据库即可注册、登录、填写病例、上传测试文件、确认授权、提交病例及查看后台。新账号自行注册，密码至少 10 位。

**演示限制**：仅用于虚构测试资料；账号、病例、文件暂存服务端内存，重启清空，不发送给医院；无真实邮件发送；只允许本机请求。请勿在此模式上传真实病历。浏览器只存语言偏好和 HttpOnly 会话 Cookie，不使用 localStorage 保存患者信息。

未登录点击“申请病历评估”可查看三步交互预览：资料填写、示例文件、复核与授权。预览仅使用虚构数据，不选择真实文件、不保存或提交；实际病例与文件操作仍需登录。

管理员演示：访问 `/admin`，点击“切换为本地演示协调员”。仅本地未配置 Supabase 时提供此入口。先用患者账号提交病例，再切换协调员即可查看。协调员不能访问未授权的草稿。

## 已实现的页面

- `/`、`/why-china`：英文优先首页、医疗资源介绍。
- `/hospitals`、`/hospitals/[id]`：6 家医院目录及详情、搜索和专科筛选。
- `/doctors`、`/doctors/[id]`：12 位明确标注的虚构专家及详情。
- `/treatments`、`/treatments/[id]`：10 个方向（保留原有 8 个，新增女性健康、先进诊断检查），相关医院与专家、流程和提交入口。
- `/patient-journey`：13 步旅程，明确患者自行办理签证和行程。
- `/patient-stories`：明显标注的蒙古国心血管诊疗示意旅程，无真实患者或治疗结果。
- `/register`、`/login`、`/forgot-password`、`/reset-password`：认证页面。
- `/dashboard`、`/dashboard/cases/new`、`/dashboard/cases/[id]`：患者工作台、资料填写、文件管理、审核与单独授权提交。
- `/admin`：已提交病例列表、筛选、状态更新、仅管理员可见的内部备注。
- `/privacy`、`/terms`、`/about`、`/contact`：隐私说明、服务边界与咨询表单。

路径通过 `src/app/[[...slug]]/page.tsx` 分发；未知路径返回 404。无需为每个目录重复路由逻辑。

## Supabase 接入

1. 新建 Supabase 项目，在 SQL Editor 依次执行 `supabase/migrations/001_initial.sql` 和 `supabase/migrations/002_coordination_details.sql`。脚本包括数据表、RLS、私有 `medical-records` bucket、注册触发器、原子提交授权函数、管理员更新函数。001 仅用于空白数据库的首次迁移。已有 001 的项目只需执行 002，再部署新版本；002 增加结构化病例字段及扩展状态/文件分类，保留旧数据与状态。
2. 复制 `.env.example` 为 `.env.local`，填入项目 URL 和 anon key。不要将 service-role key 放入本项目。
3. 设置 `APP_URL` 为完整访问来源（本地可用 `http://127.0.0.1:3100`；生产必须 HTTPS）。请求来源必须与其一致。
4. 在 Supabase Auth 的 URL Configuration 中将 Site URL 设为 `APP_URL`，添加 `<APP_URL>/auth/callback` 和 `<APP_URL>/auth/callback?next=/reset-password` 到重定向白名单，启用邮件确认并配置邮件发送服务。
5. 重新运行应用。首次注册需要按邮件链接确认。找回密码邮件回到 `/auth/callback`，交换 PKCE code 后进入重置页面。
6. 用 Supabase 管理端向受信任账号的 `app_metadata` 写入 `{"role":"admin"}`（使用可信管理端或 Admin API），重新登录后可访问后台。不要用用户可编辑的 `user_metadata` 授予权限。

正式模式无需浏览器 Supabase 客户端；认证与文件请求经服务端处理。会话 token 只保存在 HttpOnly Cookie。服务端用 `auth.getUser()` 校验身份，数据库与 Storage 继续使用该用户身份执行 RLS；不使用绕过 RLS 的密钥。

### 文件与数据权限

- 私有 bucket，文件路径为 `用户 UUID / 病例 UUID / 随机 UUID.扩展名`。
- `/api/files/[id]` 每次校验身份和归属，通过受授权的后端响应文件；不生成公开链接。
- PDF/图片支持预览；DOC/DOCX/ZIP 提供下载。DICOM ZIP 作为压缩文件保管，不在浏览器执行解压或医学影像解读。
- 单文件最多 20 MB，每病例最多 10 个文件。上传接口检查扩展名、MIME、字节签名和大小；不把上传原文件名用于存储路径。
- 用户只能查看自己的病例、个人资料和文件。管理员仅能查看已授权提交病例；提交后患者不能通过接口修改文件。
- 提交函数锁定草稿，校验文件及版本化同意，原子写入授权时间并更新状态。文件删除先标记 pending_delete，移除 Storage 对象，再完成元数据删除；提交会拒绝任何未完成的删除，避免并发删文件和提交之间的数据丢失。失败的删除可以重试。
- 状态更新通过受限制的数据库函数执行；客户端不能直接把草稿改成已提交或伪造授权记录。
- 备注在独立表中，只向管理员开放，不出现在患者响应。
- 防跨站来源校验、会话过期、基础进程内限流、禁止缓存敏感响应。正式多实例运行应将限流替换为统一网关或共享存储。
- 无诊断功能、无医疗信息分析埋点、无患者正文日志。

上传接口的签名校验不是病毒扫描；正式接收外部文件前需接入恶意文件扫描和隔离队列。直接调用 Supabase Storage 的认证客户端仍受 bucket MIME/大小和 RLS 控制，但不经过应用层字节签名校验；生产可收紧到专用上传服务并配置存储事件扫描。

### 数据模型

`users`、`patient_profiles`、`medical_cases`、`medical_files`、`consents`、`hospitals`、`doctors`，另有 `coordinator_notes` 与 `inquiries`。

公共目录当前从 `src/lib/content.ts` 读取演示内容，数据库中的 hospitals/doctors 表为未来经验证资料预留。更换正式目录时将内容读取改为这两张表；不要把当前演示医院专科映射和虚构医生当作事实。

联系表单在 Supabase 模式写入 inquiries，演示模式仅校验表单并明确提示“未发送”。当前不自动发邮件或 WhatsApp 消息。联系人均为占位信息。

## 测试

```sh
npm test
node tests/database.mjs
npm run typecheck
npm run build
# 在另一个终端启动 npm run dev 后：
node tests/integration.mjs
# 生产编译结果可本地运行：
npm run start
```

单元测试覆盖所有权、文件类型/签名/大小、独立授权、密码散列、会话过期。HTTP 集成测试用两个虚构患者和演示协调员验证注册、病例/文件隔离、未经授权拒绝提交、上传/下载/删除、内部备注隔离、退出和跨站请求拒绝。集成脚本仅用于无 Supabase 配置的本地演示。

本地 PGlite PostgreSQL 测试执行了迁移及 59 项权限/流程断言（使用仿真的 Supabase auth/storage 结构，不等于云端测试或多连接并发测试）。已完成桌面与 390px 移动端浏览器检查、语言切换、医院搜索及注册→填写→上传 PDF→授权→提交的完整交互。实际 Supabase 云端、确认邮件、密码恢复邮件及云端 RLS 集成尚未连接验证，因为未提供项目凭据；SQL 与应用接入代码已经交付，不能将本地测试视为云端验证。

## 维护位置

- `src/components/site-shell.tsx`：导航、Footer、语言上下文。
- `src/components/public-pages.tsx`：首页、目录与详情、说明页面。
- `src/components/forms.tsx`：认证与联系表单、通用反馈。
- `src/components/patient-portal.tsx`：患者和协调员交互。
- `src/lib/content.ts`：医院/专家/方向及双语内容。
- `src/lib/security.ts`：文件策略、授权版本、服务状态。
- `src/lib/store.ts`：本地演示会话及内存数据。
- `src/lib/supabase.ts`：服务端 Supabase 客户端。
- `src/app/api/[...path]/route.ts`：认证、病例、文件、咨询接口。
- `supabase/migrations/001_initial.sql`：生产数据库结构及权限。

目前 locale 为 `en | zh`，展示数据用 `Localized` 与 `tx()`，交互文案统一走语言上下文；增加俄语、蒙古语、越南语、阿拉伯语时扩展类型与翻译资源、语言选择器，并为阿拉伯语增加 RTL 样式。语言偏好 Cookie 与医疗数据分离。

## 正式运营边界

这是一版可运行的功能演示，不是已上线运营的医疗服务。正式使用前需要确认运营主体、真实医院和医生资料、联系方式、数据保留与删除规则，并按实际业务及数据处理地区完成隐私和跨境数据要求审核。全量数据导出、账号删除和资料删除申请的自动执行属于后续版本；当前页面明确说明可向团队提出申请，不显示未实现的成功操作。

医院名称仅作目录演示，专科映射、设备和国际服务不作真实性保证。医生全为虚构人物；Unsplash 图片为示意素材，加载需要网络，不代表图中人物与医院或平台的关系。

技术参考：[Next.js Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers)、[Supabase Private Storage](https://supabase.com/docs/guides/storage/buckets/fundamentals)、[Storage RLS](https://supabase.com/docs/guides/storage/security/access-control)。

## 本次增量增强

新增病历先行、适宜性、资源匹配、三方职责、费用构成、家属与恢复支持、可选文化体验和回国随访。保持现有页面、品牌样式、认证和上传架构。表单新增持续时间、既往手术、就医目标；状态兼容 Under Review / Completed，分类兼容 Medical Report / Lab Test。详情见 `docs/enhancement-report.md`。

## 首页分类导览

首页收敛为原有品牌首屏、简短病历先行提示及四类入口：医疗资源、来华前评估、服务与费用、隐私与支持。新增 `/care-planning` 与 `/services` 复用已有详细内容；各分类支持直达相关段落。医院、医生、诊疗方向、患者故事和其他原有页面继续可用。

## GitHub Pages 公开参考版

仓库发布到 `Jennifer288/china-care-demo`。公开网站使用纯静态导出，只提供公开页面和虚构病例申请预览。注册、登录、后台、咨询发送及真实病历上传不会运行，不连接 Supabase，也不携带任何本地环境变量。

```sh
npm ci
npm run build:share
```

`out/` 为输出目录。构建脚本仅复制源文件到临时目录，在该副本排除 API 和认证回调，原项目的服务端功能保持不变。默认子路径为 `/china-care-demo`；更改仓库名时请修改 workflow 的 `NEXT_PUBLIC_BASE_PATH`。主分支推送后 GitHub Actions 自动构建并发布 GitHub Pages。

GitHub Pages 不支持 Next.js 自定义响应头或服务端功能。需要真实注册、医疗资料存储和医院对接时，使用原 Next.js 服务端部署并配置 Supabase，按前文执行数据库迁移。
