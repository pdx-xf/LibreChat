## 环境

```bash
# 安装 node、 mongodb、meilisearch
```

## 开启配置

```bash
cp .env.example .env # 修改配置

cp docker-compose.override.yml.example docker-compose.override.yml # 修改配置

cp librechat.example.yaml librechat.yaml # 修改配置

# 视情况修改配置内容
...
```

## npm

```bash


# 安装依赖
npm ci

# 本地开发
npm frontend:ci

npm run backend:dev

npm run frontend:dev

# 打包
npm run backend

npm run frontend
```

## Docker

```bash
# 开发环境，打包后端镜像
docker build -t librechat:dev .
# 开发环境，只启动后端服务
cp docker-compose.yml docker-compose-dev.yml
# 修改 docker-compose-dev.yml
sed -i '' 's/# *image: ghcr.io\/danny-avila\/librechat-dev:latest/image: librechat:dev/' docker-compose-dev.yml
# 运行 docker-compose-dev.yml
docker compose -f docker-compose-dev.yml -f docker-compose.override.yml up -d

# 生产环境，打包前后端镜像
docker build -f Dockerfile.multi -t librechat:latest .
# 生产环境，前后端都部署
cp deploy-compose.yml docker-compose-prod.yml
# 修改 docker-compose-prod.yml
sed -i '' 's/# *image: ghcr.io\/danny-avila\/librechat-dev-api:latest/image: librechat:latest/' docker-compose-prod.yml
# 运行 docker-compose-prod.yml
docker compose -f docker-compose-prod.yml -f docker-compose.override.yml up -d
```

## 修改 LibreChat 有关的内容 （修改后需要重新打包docker）

```html
<!-- 网页标题与icon设置 client\index.html -->
<meta
  name="description"
  content="LibreChat - An open source chat application with support for multiple AI models"
/>
<title>LibreChat</title>
<link rel="shortcut icon" href="#" />
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png" />
<link rel="apple-touch-icon" href="/assets/apple-touch-icon-180x180.png" />
```

```bash
# 登陆页面 logo
client/src/components/Auth/AuthLayout.tsx
assets/logo.svg

# 自定义文案
.env (CUSTOM_FOOTER、APP_TITLE、HELP_AND_FAQ_URL)
librechat.yaml

# 多语言 LibreChat
vscode 搜索（包含locales）

# 主题颜色设置
client\src\style.css

```

## 左侧菜单

```bash
client\src\components\Nav\Nav.tsx 在代码中搜索 MenuSettings
client\src\components\Nav\MenuSettings.tsx
```
