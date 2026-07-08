Rõ rồi. Với clarification này thì mình sẽ chỉnh lại recommendation như sau:

> **Repo boilerplate gốc được phép có Harness/internal build tooling. Project được generate từ CLI thì phải clean.**
> Vậy không cần cleanup source repo ngay; cần thiết kế `init` command đủ tốt để strip toàn bộ thứ không thuộc reusable app.

Trong file hiện tại đúng là có cả `scripts/schema/*`, `scripts/check-boundaries.ts`, `template-catalog.ts`, `templates/*`, `AGENTS.md`, `release-manifest.json`, `.env.example`, `.env.test.example`, `Dockerfile`, `playwright.config.ts`, `turbo.json`… nên hướng CLI init là hợp lý hơn việc xóa tay khỏi boilerplate source. 

## Roadmap mới sau khi update theo ý bạn

### P0 — việc nên làm tiếp theo

```txt id="m2fm29"
1. Build CLI init command
2. Strengthen boundary checker
3. Tighten Turbo/env config
4. Upgrade API contract layer
5. Remove duplicate permission config
6. Add real E2E smoke tests
```

### P1 — production hardening

```txt id="dad7rp"
1. Tách Docker target cho app/web/api
2. Add DB index/idempotency hardening
3. Add provider status interfaces
4. Add DB-backed jobs adapter
5. Add API client/hooks
```

### P2 — làm khi bắt đầu project thật

```txt id="pj7k2n"
1. Education domain modules
2. Dev tools/file conversion modules
3. Shopify addon/public app adapter
4. Billing provider thật
5. CMS/i18n sâu hơn
```

Templates specific như `education`, `dev-tools`, `shopify-addon`, `shopify-public-app` mình đồng ý là **chưa nên implement thành scaffold engine**. Hiện repo có các folder template đó, nhưng nếu chúng chủ yếu là project-specific notes thì cứ giữ trong source/harness layer hoặc bỏ khỏi generated project. 

---

# 1. CLI init nên là trọng tâm

Mình đề xuất CLI tên kiểu:

```sh id="joftzp"
pnpm boilerplate:init ../my-new-app
```

hoặc nếu publish/internal global:

```sh id="0j3cmc"
wizloft init my-new-app
```

## CLI init nên làm 5 phase

```txt id="6ryg6s"
Phase 1: Copy repository
Phase 2: Clean internal artifacts
Phase 3: Rename project/package/app metadata
Phase 4: Select apps/features
Phase 5: Validate generated project
```

## Clean list cho generated project

CLI nên remove mặc định:

```txt id="umjsfc"
scripts/schema/
scripts/bin/
release-manifest.json
AGENTS.md
docs/                  # nếu đây là Harness docs, không phải boilerplate docs
templates/             # nếu chưa support template scaffold
.harness/
.symphony/
.agents/
.claude/
.codex/
.history/
harness.db*
```

`.gitignore` hiện có nhiều entry liên quan Harness/Symphony như `harness.db`, `scripts/bin/harness-cli`, `.symphony`, `.harness`, `.agents`, `.claude`, `.codex`, `.history`. Nếu project generate ra không dùng Harness thì CLI nên rewrite `.gitignore` thành bản clean. 

## Đừng hard-code clean list trong code

Nên tạo manifest riêng:

```txt id="ltrrkz"
boilerplate.init.json
```

Ví dụ:

```json id="9l25di"
{
  "remove": [
    "scripts/schema",
    "scripts/bin",
    "release-manifest.json",
    "AGENTS.md",
    "docs",
    "templates",
    ".harness",
    ".symphony",
    ".agents",
    ".claude",
    ".codex",
    ".history",
    "harness.db",
    "harness.db-wal",
    "harness.db-shm"
  ],
  "rewrite": {
    "packageName": true,
    "repoName": true,
    "appName": true,
    "envExamples": true,
    "gitignore": true,
    "readme": true
  },
  "defaultApps": ["app", "web", "api", "email", "storybook"],
  "optionalApps": ["docs"],
  "defaultFeatures": ["auth", "database", "design-system", "mail", "storage", "jobs"],
  "optionalFeatures": ["billing", "analytics", "cms", "i18n", "observability", "flags"]
}
```

Như vậy sau này bạn đổi rule cleanup không cần sửa CLI logic.

---

# 2. CLI init nên support chọn app surfaces

Vì boilerplate có nhiều app: `apps/api`, `apps/app`, `apps/docs`, `apps/email`, `apps/storybook`, `apps/web`. 

Mình đề xuất default output:

```txt id="i9w4xs"
apps/
  app        # authenticated product app
  web        # marketing site
  api        # Hono API
  email      # email templates/preview
  storybook  # design-system preview
```

`docs` nên optional:

```sh id="w779te"
wizloft init my-app --with-docs
```

Hoặc interactive:

```txt id="ahefpj"
? Include marketing web app? yes
? Include API app? yes
? Include docs app? no
? Include Storybook? yes
? Include email preview? yes
```

---

# 3. Boundary checker: nên làm ngay sau CLI

Hiện `check-boundaries.ts` mới check rất cơ bản: app không import app khác qua relative path và package không import từ apps. 

Mình sẽ nâng thành rule-set rõ ràng:

```txt id="q2bpyj"
apps/*:
- không import từ apps/*
- chỉ import từ packages/*
- không import package server-only trong client component

packages/*:
- không import từ apps/*
- không circular dependency
- không deep import private source nếu package chưa export

design-system:
- không import database/auth/api/billing/jobs/storage

database:
- không import auth/api/apps

auth:
- được import database/config/logger
- không import api/apps

api:
- được import auth/database/mail/storage/jobs
- không import apps

config:
- không import database/auth/api runtime nặng
```

Đây là phần nên có trong generated project luôn, không chỉ source repo.

---

# 4. Turbo/env: đồng ý tighten, nhưng giữ root `.env.example`

Hiện `turbo.json` đang dùng `.env` và `.env.example` trong `globalDependencies`, đồng thời `envMode: "loose"`. 

Mình chốt lại:

```txt id="q4rz3i"
Source repo:
- có thể giữ loose tạm nếu Harness/dev flow cần

Generated project:
- envMode: strict
- không đưa .env vào globalDependencies
- root .env.example vẫn giữ
- app/package env.ts là source of truth
```

Generated `turbo.json` nên kiểu:

```json id="yght35"
{
  "$schema": "https://turborepo.com/schema.json",
  "globalDependencies": [".env.example", ".env.test.example"],
  "envMode": "strict",
  "ui": "tui",
  "globalEnv": ["NODE_ENV", "SKIP_ENV_VALIDATION"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**", "storybook-static/**", ".react-email/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test:e2e": {
      "cache": false
    },
    "db:push": {
      "cache": false
    },
    "db:migrate:dev": {
      "cache": false
    },
    "db:migrate:deploy": {
      "cache": false
    },
    "db:seed": {
      "cache": false
    }
  }
}
```

---

# 5. API layer: nâng lên oRPC/OpenAPI thật

Mình đồng ý với hướng bạn confirm. Hiện API package đã có Hono app, RPC route, OpenAPI test, routers như files/health/invitations/jobs/organizations. Đây là nền tốt nhưng vẫn nên nâng contract. 

Target nên là:

```txt id="ual7j0"
packages/api/
  src/
    contracts/
      health.ts
      organizations.ts
      invitations.ts
      files.ts
      jobs.ts
    routers/
      health.ts
      organizations.ts
      invitations.ts
      files.ts
      jobs.ts
    client/
      browser.ts
      server.ts
      errors.ts
    openapi.ts
    app.ts
```

Mục tiêu:

```txt id="o30t15"
- input/output schema chung
- frontend không fetch raw thủ công nữa
- OpenAPI generated từ contract
- API client type-safe
- error shape nhất quán
```

---

# 6. Permission config: nên có single source of truth

Đồng ý. Permission catalog không nên duplicate giữa UI và auth/API.

Mình sẽ tạo:

```txt id="18jv5n"
packages/auth/src/permissions/
  catalog.ts
  types.ts
  guards.ts
  index.ts
```

Hoặc nếu muốn tách khỏi auth:

```txt id="cmdadu"
packages/access-control/
  src/catalog.ts
  src/roles.ts
  src/guards.ts
  src/index.ts
```

Mình thích `packages/access-control` hơn nếu sau này permission được dùng bởi API, UI, jobs, billing entitlement.

---

# 7. E2E: thêm test thật, không cần nhiều

Playwright config hiện trỏ `testDir: "./tests/e2e"` và chạy `@repo/api-app` + `@repo/app` dev server.  Script `e2e-with-db.mjs` cũng đã có flow start Postgres, `db:generate`, `db:push`, rồi chạy `test:e2e`. 

Chỉ cần thêm 3 test smoke:

```txt id="2k6ydv"
tests/e2e/auth.spec.ts
tests/e2e/organizations.spec.ts
tests/e2e/invitations.spec.ts
```

Đây nên là P0 vì CLI init xong mà E2E pass thì bạn tự tin generated project thật sự usable.

---

# 8. Docker/deployment: tách generated target

Đồng ý. Mình sẽ tách tư duy:

```txt id="o58aj4"
Source boilerplate repo:
- có thể dùng Dockerfile generic phục vụ dev/build source

Generated project:
- Dockerfile.app
- Dockerfile.api
- Dockerfile.web optional
```

Nếu muốn đơn giản hơn:

```txt id="n2lq3w"
deployment/
  Dockerfile.next
  Dockerfile.api
  compose.production.example.yml
```

API app không nên production-start bằng `tsx`. Nên build ra `dist` rồi chạy `node dist/index.js`.

---

# 9. Database hardening

Đồng ý. Nên làm sau permission/API, nhưng trước khi dùng cho app thật.

Add/chỉnh các nhóm:

```txt id="4evyyl"
WebhookEvent:
- provider + externalId unique
- status + receivedAt index

Invitation:
- status + expiresAt index

AuditLog:
- organizationId + createdAt index
- actorId + createdAt index

FileAsset:
- organizationId + createdAt index
- bucket/key unique nếu dùng object storage

JobRun:
- status + createdAt index
- name + idempotencyKey unique

IntegrationConnection:
- organizationId + provider + externalId unique
```

---

# 10. Optional provider shells: giữ, nhưng thêm status contract

Đồng ý. Mỗi provider nên có:

```ts id="ty27at"
export type ProviderStatus = {
  name: string;
  configured: boolean;
  healthy?: boolean;
  message?: string;
};
```

Áp dụng cho:

```txt id="tj4xry"
mail.getStatus()
storage.getStatus()
billing.getStatus()
analytics.getStatus()
observability.getStatus()
jobs.getStatus()
```

Sau đó `/ready` có thể trả:

```json id="ne1kfp"
{
  "ok": true,
  "database": "ok",
  "providers": {
    "mail": { "configured": false },
    "storage": { "configured": true, "healthy": true },
    "jobs": { "configured": true, "healthy": true }
  }
}
```

---

# 11. Templates/docs: mình đồng ý bỏ khỏi scope hiện tại

Với clarification của bạn, mình sẽ đổi recommendation cũ:

```txt id="b8q162"
Không cần implement reusable templates lúc này.
Không cần thêm root docs nếu docs/ đang dành cho Harness.
Không cần biến templates/* thành scaffold thật.
```

Thay vào đó, CLI init chỉ generate **clean base structure**. Domain-specific structure sẽ làm khi bắt đầu project thật.

Nhưng mình vẫn khuyên giữ một file rất ngắn trong generated project:

```txt id="352bs3"
README.md
SPEC.md hoặc ARCHITECTURE.md
```

Không cần folder docs.

---

## Priority cụ thể mình khuyên làm tiếp

### Step 1 — Build CLI init

```txt id="vtq3xt"
- copy source repo
- apply boilerplate.init.json cleanup
- rewrite package.json name
- rewrite README
- rewrite .gitignore clean
- remove templates/docs/harness artifacts
- optionally remove apps/docs
- reset git
- run pnpm install/check-types/test
```

### Step 2 — Make generated project pass

```txt id="acpb0g"
pnpm install
pnpm check
pnpm check-types
pnpm test
pnpm e2e:with-db
pnpm build
```

### Step 3 — Harden core repo

```txt id="f8q1dp"
- boundary checker v2
- turbo strict env for generated output
- API contract upgrade
- permission catalog single source
- E2E smoke tests
```

### Step 4 — Production readiness

```txt id="fohgo4"
- Docker split
- DB indexes/migrations
- provider status
- DB-backed jobs
```

---

## Chốt lại

Những decision của bạn hợp lý. Mình sẽ không coi Harness artifacts là “lỗi repo” nữa; nó là **source tooling**. Nhưng CLI init phải đảm bảo generated project sạch hoàn toàn.

Thiết kế đúng nên là:

```txt id="78aegt"
wizloft-boilerplate-source
  = full internal repo with Harness, release manifest, internal docs, init tooling

generated-project
  = clean SaaS app foundation with no Harness artifacts, no templates noise, no agent runtime files
```

Đây là hướng tốt hơn việc cố làm source repo “sạch tuyệt đối”, vì source repo của bạn vừa là boilerplate vừa là factory để generate project mới.
