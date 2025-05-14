FROM node:18-slim

# Pythonのインストール
RUN apt-get update && apt-get install -y \
    python3 python3-pip python3-dev python3-venv \
    build-essential \
    wget gnupg \
    && rm -rf /var/lib/apt/lists/*

# Node.jsとnpmのバージョンを確認
RUN node --version && npm --version

# SupervisorDのインストール
RUN apt-get update && apt-get install -y supervisor \
    && rm -rf /var/lib/apt/lists/*

# 作業ディレクトリを設定
WORKDIR /app

# Python仮想環境の作成とアクティベート
RUN python3 -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"
ENV VIRTUAL_ENV="/app/venv"

# バックエンドの依存関係をインストール
COPY backend/requirements.txt /app/backend/
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r /app/backend/requirements.txt
RUN pip install --no-cache-dir psycopg2-binary uvicorn

# フロントエンドの依存関係をインストール
COPY frontend/package.json frontend/package-lock.json /app/frontend/
WORKDIR /app/frontend
RUN npm ci
WORKDIR /app

# Playwrightのインストール(スクリーンショット機能用)
RUN pip install playwright
RUN python -m playwright install
RUN python -m playwright install-deps

# アプリケーションのソースをコピー
COPY backend /app/backend
COPY frontend /app/frontend

# フロントエンドのビルド
WORKDIR /app/frontend
RUN npm run build
WORKDIR /app

# Supervisorの設定ファイルをコピー
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# 起動スクリプトのコピーと実行権限の付与
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# ポート設定
EXPOSE 3001 8001

# アプリケーションの起動
CMD ["/app/start.sh"]