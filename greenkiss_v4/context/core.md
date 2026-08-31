.env.development

```
# <===== CLIENT =====>
NEXT_PUBLIC_ICON="💚"

# <===== SERVER =====>
# DB
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"

# AUTH
AUTH_SECRET="LEeJ081QiG0vFGoZ2ZM6upnCStel3FIHBCQedwsj/0I="
AUTH_TRUST_HOST=true
AUTH_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"

AUTH_YANDEX_ID="83745f43d4e14766aaceb586ab9d78d6"
AUTH_YANDEX_SECRET="c84731ffb00d4c1d9ac84b1703789df8"

ADMIN_EMAILS="b2bstas@yandex.ru"
MANAGER_EMAILS="skv13@bk.ru"

# S3
S3_ENDPOINT="https://s3.twcstorage.ru"
S3_BUCKET="8911d74e-38904af6-4ec5-4ea5-8fdc-49a1c7b410ed"
S3_ACCESS_KEY="VRUDNZ1YKX27BR22Y3RJ"
S3_SECRET_KEY="BjdUBIBN4C8WuHHerEoBglXNol4vCBHkFAmeB7mg"
S3_REGION="ru-1"
S3_FORCE_PATH_STYLE="false"
CDN_BASE_URL="https://cdn.greenkiss.ru/8911d74e-38904af6-4ec5-4ea5-8fdc-49a1c7b410ed"
NEXT_PUBLIC_CDN_BASE_URL="https://cdn.greenkiss.ru/8911d74e-38904af6-4ec5-4ea5-8fdc-49a1c7b410ed"
```

.github\workflows\main-deploy.yml

```
name: Docker Deploy

on:
  push:
    branches:
      - main

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  build:
    uses: ./.github/workflows/reusable-build-push-cleanup.yml
    with:
      registry: ${{ vars.REGISTRY }}
      image_name: ${{ vars.IMAGE_NAME }}
      cdn_base_url: ${{ vars.CDN_BASE_URL }}
    secrets:
      dockerhub_username: ${{ vars.DOCKERHUB_USERNAME }}
      dockerhub_token: ${{ secrets.DOCKERHUB_TOKEN }}
      registry_username: ${{ vars.REGISTRY_USERNAME }}
      registry_token: ${{ secrets.REGISTRY_TOKEN }}

  # Шаг 2: Развертывание на сервере
  deploy:
    needs: build
    uses: ./.github/workflows/reusable-deploy.yml
    with:
      # Входные данные для развертывания
      ssh_host: ${{ vars.SSH_HOST }}
      ssh_port: ${{ vars.SSH_PORT }}
      ssh_username: ${{ vars.SSH_USERNAME }}
      deploy_dir: ${{ vars.DEPLOY_DIR }}
      domain: ${{ vars.DOMAIN }}
      traefik_host: ${{ vars.TRAEFIK_HOST }}
      acme_email: ${{ vars.ACME_EMAIL }}
      registry: ${{ vars.REGISTRY }}
      image_name: ${{ vars.IMAGE_NAME }}
      image_tag: ${{ needs.build.outputs.image_tag }}
      # Переменные для приложения
      auth_yandex_id: ${{ vars.AUTH_YANDEX_ID }}
      admin_emails: ${{ vars.ADMIN_EMAILS }}
      manager_emails: ${{ vars.MANAGER_EMAILS }}
      s3_endpoint: ${{ vars.S3_ENDPOINT }}
      s3_bucket: ${{ vars.S3_BUCKET }}
      s3_region: ${{ vars.S3_REGION }}
      s3_force_path_style: ${{ vars.S3_FORCE_PATH_STYLE }}
      cdn_base_url: ${{ vars.CDN_BASE_URL }}
    secrets:
      # Секреты для подключения и настройки
      ssh_private_key: ${{ secrets.SSH_PRIVATE_KEY }}
      ssh_passphrase: ${{ secrets.SSH_PASSPHRASE }}
      registry_token: ${{ secrets.REGISTRY_TOKEN }}
      registry_username: ${{ vars.REGISTRY_USERNAME }}
      dockerhub_token: ${{ secrets.DOCKERHUB_TOKEN }}
      dockerhub_username: ${{ vars.DOCKERHUB_USERNAME }}
      # Секреты для приложения
      regru_username: ${{ secrets.REGRU_USERNAME }}
      regru_password: ${{ secrets.REGRU_PASSWORD }}
      auth_secret: ${{ secrets.AUTH_SECRET }}
      auth_yandex_secret: ${{ secrets.AUTH_YANDEX_SECRET }}
      database_url: ${{ secrets.DATABASE_URL }}
      s3_access_key: ${{ secrets.S3_ACCESS_KEY }}
      s3_secret_key: ${{ secrets.S3_SECRET_KEY }}
```

.github\workflows\reusable-build-push-cleanup.yml

```
name: Reusable - Build, Push and Cleanup

on:
  workflow_call:
    inputs:
      registry:
        required: true
        type: string
      image_name:
        required: true
        type: string
      cdn_base_url:
        required: true
        type: string
    secrets:
      dockerhub_username:
        required: true
      dockerhub_token:
        required: true
      registry_username:
        required: true
      registry_token:
        required: true
    outputs:
      image_tag:
        description: "The generated short SHA image tag"
        value: ${{ jobs.build-and-push.outputs.image_tag }}
      image_digest:
        description: "The digest of the pushed image"
        value: ${{ jobs.build-and-push.outputs.image_digest }}

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    outputs:
      image_tag: ${{ steps.tag.outputs.image_tag }}
      image_digest: ${{ steps.build.outputs.digest }}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Common environment variables
        run: |
          # <===== CLIENT =====>
          echo "NEXT_PUBLIC_ICON=💚" >> .env.local
          echo "NEXT_PUBLIC_CDN_BASE_URL=${inputs.cdn_base_url}" >> .env.local
          # <===== SERVER =====>
          echo "DATABASE_URL=postgresql://u:p@l:5432/mydb" >> .env.local
          echo "AUTH_SECRET=devsecret" >> .env.local
          echo "AUTH_TRUST_HOST=true" >> .env.local
          echo "AUTH_URL=http://localhost:3000" >> .env.local
          echo "NEXTAUTH_URL=http://localhost:3000" >> .env.local
          echo "AUTH_YANDEX_ID=dummy" >> .env.local
          echo "AUTH_YANDEX_SECRET=dummy" >> .env.local
          echo "ADMIN_EMAILS=dummy@example.com" >> .env.local
          echo "MANAGER_EMAILS=manager@example.com" >> .env.local
          # NEW: S3/CDN placeholders for local build
          echo "S3_ENDPOINT=http://minio.local:9000" >> .env.local
          echo "S3_BUCKET=greenkiss" >> .env.local
          echo "S3_ACCESS_KEY=minioadmin" >> .env.local
          echo "S3_SECRET_KEY=minioadmin" >> .env.local
          echo "S3_REGION=ru-1" >> .env.local
          echo "S3_FORCE_PATH_STYLE=true" >> .env.local
          echo "CDN_BASE_URL=https://cdn.example.com" >> .env.local

      - name: Compute short sha tag
        id: tag
        run: echo "image_tag=sha-${GITHUB_SHA::7}" >> "$GITHUB_OUTPUT"

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.dockerhub_username }}
          password: ${{ secrets.dockerhub_token }}

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ inputs.registry }}
          username: ${{ secrets.registry_username }}
          password: ${{ secrets.registry_token }}

      - name: Extract metadata (tags, labels) for Docker (sha only)
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ inputs.registry }}/${{ inputs.image_name }}
          tags: |
            type=raw,value=${{ steps.tag.outputs.image_tag }}

      - name: Build and push Docker image
        id: build
        uses: docker/build-push-action@v6
        with:
          context: .
          file: ./Dockerfile
          push: true
          pull: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Install regctl + jq
        run: |
          set -e
          sudo apt-get update
          sudo apt-get install -y jq
          curl -L https://github.com/regclient/regclient/releases/latest/download/regctl-linux-amd64 -o regctl
          chmod +x regctl
          sudo mv regctl /usr/local/bin/regctl
          regctl version

      - name: Keep last 5 sha-* tags; delete older
        env:
          REGISTRY: ${{ inputs.registry }}
          REPO: ${{ inputs.image_name }}
          KEEP: "5"
          REGISTRY_USERNAME: ${{ secrets.registry_username }}
          REGISTRY_TOKEN: ${{ secrets.registry_token }}
        run: |
          set -euo pipefail

          FULL_REPO="$REGISTRY/$REPO"
          echo "Logging into registry: $REGISTRY"
          regctl registry login "$REGISTRY" --user "$REGISTRY_USERNAME" --pass "$REGISTRY_TOKEN"

          echo "Fetching tags for $FULL_REPO"
          mapfile -t SHA_TAGS < <(regctl tag ls "$FULL_REPO" | grep -E '^sha-' || true)
          echo "Found ${#SHA_TAGS[@]} sha-* tags"

          if (( ${#SHA_TAGS[@]} <= KEEP )); then
            echo "Nothing to prune (<= $KEEP sha tags present)."
            exit 0
          fi

          TMP="$(mktemp)"
          for t in "${SHA_TAGS[@]}"; do
            CREATED="$(regctl image inspect "$FULL_REPO:$t" | jq -r '.config.created // .created // .manifest.config.created // empty')"
            if [[ -z "$CREATED" ]]; then
              EPOCH="$(date +%s)"
            else
              EPOCH="$(date -d "$CREATED" +%s || date +%s)"
            fi
            DIGEST="$(regctl image digest "$FULL_REPO:$t")"
            printf "%s %s %s\n" "$EPOCH" "$t" "$DIGEST" >> "$TMP"
          done

          mapfile -t TO_KEEP_LINES < <(sort -nr "$TMP" | head -n "$KEEP")
          rm -f "$TMP"

          TO_KEEP_TAGS=()
          KEEP_DIGESTS_SET=" "
          for line in "${TO_KEEP_LINES[@]}"; do
            tag="$(awk '{print $2}' <<< "$line")"
            digest="$(awk '{print $3}' <<< "$line")"
            TO_KEEP_TAGS+=("$tag")
            KEEP_DIGESTS_SET+="$digest "
          done

          echo "Will keep tags: ${TO_KEEP_TAGS[*]}"
          echo "Protected digests: $KEEP_DIGESTS_SET"

          declare -A DELETE_DIGESTS=()

          for t in "${SHA_TAGS[@]}"; do
            if printf ' %s ' "${TO_KEEP_TAGS[@]}" | grep -q " $t "; then
              continue
            fi

            d="$(regctl image digest "$FULL_REPO:$t" || true)"
            if [[ -z "$d" ]]; then
              echo "Skip '$t' (no digest resolved)"
              continue
            fi

            if [[ " $KEEP_DIGESTS_SET " == *" $d "* ]]; then
              echo "Skip tag $t (digest kept: $d)"
              continue
            fi

            DELETE_DIGESTS["$d"]=1
          done

          if (( ${#DELETE_DIGESTS[@]} == 0 )); then
            echo "No digests to delete."
            exit 0
          fi

          echo "Will delete ${#DELETE_DIGESTS[@]} old digest(s):"
          for d in "${!DELETE_DIGESTS[@]}"; do
            echo " - $d"
          done

          for d in "${!DELETE_DIGESTS[@]}"; do
            echo "Deleting $FULL_REPO@$d"
            if ! regctl image rm "$FULL_REPO@$d"; then
              echo "Warning: failed to delete $FULL_REPO@$d"
            fi
          done
          
          echo "Cleanup finished."
```

.github\workflows\reusable-deploy.yml

```
name: Reusable - Deploy to Server

on:
  workflow_call:
    inputs:
      ssh_host: { required: true, type: string }
      ssh_port: { required: true, type: string }
      ssh_username: { required: true, type: string }
      deploy_dir: { required: true, type: string }
      domain: { required: true, type: string }
      traefik_host: { required: true, type: string }
      acme_email: { required: true, type: string }
      registry: { required: true, type: string }
      image_name: { required: true, type: string }
      image_tag: { required: true, type: string }
      # App vars
      auth_yandex_id: { required: true, type: string }
      admin_emails: { required: true, type: string }
      manager_emails: { required: true, type: string }
      s3_endpoint: { required: true, type: string }
      s3_bucket: { required: true, type: string }
      s3_region: { required: true, type: string }
      s3_force_path_style: { required: true, type: string }
      cdn_base_url: { required: true, type: string }
    secrets:
      ssh_private_key: { required: true }
      ssh_passphrase: { required: true }
      registry_token: { required: true }
      registry_username: { required: true }
      dockerhub_token: { required: true }
      dockerhub_username: { required: true }
      # App secrets
      regru_username: { required: true }
      regru_password: { required: true }
      auth_secret: { required: true }
      auth_yandex_secret: { required: true }
      database_url: { required: true }
      s3_access_key: { required: true }
      s3_secret_key: { required: true }

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server (2 replicas behind Traefik)
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ inputs.ssh_host }}
          port: ${{ inputs.ssh_port }}
          username: ${{ inputs.ssh_username }}
          passphrase: ${{ secrets.ssh_passphrase }}
          key: ${{ secrets.ssh_private_key }}
          script: |
            set -Eeuo pipefail

            # --- Preconditions: Docker logins ---
            echo "${{ secrets.registry_token }}" | docker login ${{ inputs.registry }} -u ${{ secrets.registry_username }} --password-stdin
            echo "${{ secrets.dockerhub_token }}" | docker login docker.io -u ${{ secrets.dockerhub_username }} --password-stdin

            # --- Paths & constants ---
            DEPLOY_DIR="/home/${{ inputs.ssh_username }}/${{ inputs.deploy_dir }}"
            mkdir -p "$DEPLOY_DIR"
            cd "$DEPLOY_DIR"

            TRAEFIK_COMPOSE="$DEPLOY_DIR/docker-compose.traefik.yml"
            TRAEFIK_ENV="$DEPLOY_DIR/.env"
            LETSENCRYPT_DIR="$DEPLOY_DIR/letsencrypt"

            # --- Prepare volumes for Traefik ACME storage ---
            mkdir -p "$LETSENCRYPT_DIR"
            touch "$LETSENCRYPT_DIR/acme.json"
            chmod 600 "$LETSENCRYPT_DIR/acme.json"

            # --- Ensure .env for compose exists and has required keys ---
            create_or_update_env() {
              local file="$1" key="$2" value="$3"
              if grep -qE "^${key}=.*" "$file" 2>/dev/null; then
                sed -i -E "s|^${key}=.*|${key}=${value}|" "$file"
              else
                printf "%s=%s\n" "$key" "$value" >> "$file"
              fi
            }

            if [[ ! -f "$TRAEFIK_ENV" ]]; then
              umask 077
              {
                echo "# Autogenerated by CI at $(date -u +'%Y-%m-%dT%H:%M:%SZ')"
                echo "DOMAIN=${{ inputs.domain }}"
                echo "TRAEFIK_HOST=${{ inputs.traefik_host }}"
                echo "ACME_EMAIL=${{ inputs.acme_email }}"
                echo "REGRU_USERNAME=${{ secrets.regru_username }}"
                echo "REGRU_PASSWORD=${{ secrets.regru_password }}"
              } > "$TRAEFIK_ENV"
              chmod 600 "$TRAEFIK_ENV"
            else
              create_or_update_env "$TRAEFIK_ENV" "DOMAIN" "${{ inputs.domain }}"
              create_or_update_env "$TRAEFIK_ENV" "TRAEFIK_HOST" "${{ inputs.traefik_host }}"
              create_or_update_env "$TRAEFIK_ENV" "ACME_EMAIL" "${{ inputs.acme_email }}"
              create_or_update_env "$TRAEFIK_ENV" "REGRU_USERNAME" "${{ secrets.regru_username }}"
              create_or_update_env "$TRAEFIK_ENV" "REGRU_PASSWORD" "${{ secrets.regru_password }}"
            fi

            # --- Desired docker-compose for Traefik ---
            TMP_COMPOSE="$(mktemp)"
            cat > "$TMP_COMPOSE" <<'YAML'
            services:
              traefik:
                image: "traefik:v3.6.1"
                container_name: "traefik"
                restart: unless-stopped
                environment:
                  - ACME_EMAIL=${ACME_EMAIL}
                  - TRAEFIK_HOST=${TRAEFIK_HOST}
                  - DOMAIN=${DOMAIN}
                  - REGRU_USERNAME=${REGRU_USERNAME}
                  - REGRU_PASSWORD=${REGRU_PASSWORD}
                networks:
                  - proxy
                command:
                  - "--log.level=DEBUG"
                  - "--accesslog=true"
                  - "--api.insecure=false"
                  - "--api.dashboard=true"
                  - "--providers.docker=true"
                  - "--providers.docker.exposedbydefault=false"
                  - "--providers.docker.network=proxy"
                  - "--entrypoints.web.address=:80"
                  - "--entrypoints.websecure.address=:443"
                  - "--certificatesresolvers.letsencrypt.acme.dnschallenge=true"
                  - "--certificatesresolvers.letsencrypt.acme.dnschallenge.provider=regru"
                  - "--certificatesresolvers.letsencrypt.acme.email=${ACME_EMAIL}"
                  - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
                  - "--entrypoints.web.http.redirections.entryPoint.to=websecure"
                  - "--entrypoints.web.http.redirections.entryPoint.scheme=https"
                ports:
                  - "80:80"
                  - "443:443"
                  - "8080:8080"
                volumes:
                  - "./letsencrypt:/letsencrypt"
                  - "/var/run/docker.sock:/var/run/docker.sock:ro"
                labels:
                  - "traefik.enable=true"
                  - "traefik.http.routers.dashboard.rule=Host(`${TRAEFIK_HOST}`)"
                  - "traefik.http.routers.dashboard.entrypoints=websecure"
                  - "traefik.http.routers.dashboard.tls=true"
                  - "traefik.http.routers.dashboard.tls.certresolver=letsencrypt"
                  - "traefik.http.routers.dashboard.service=api@internal"
                  - "traefik.http.routers.dashboard.tls.domains[0].main=${DOMAIN}"
                  - "traefik.http.routers.dashboard.tls.domains[0].sans=*.${DOMAIN}"

            networks:
              proxy:
                name: proxy
                driver: bridge
            YAML

            NEW_HASH="$(sha256sum "$TMP_COMPOSE" | awk '{print $1}')"
            OLD_HASH=""
            if [[ -f "$TRAEFIK_COMPOSE" ]]; then
              OLD_HASH="$(sha256sum "$TRAEFIK_COMPOSE" | awk '{print $1}')"
            fi

            if [[ "$NEW_HASH" != "$OLD_HASH" ]]; then
              mv "$TMP_COMPOSE" "$TRAEFIK_COMPOSE"
              echo "Traefik compose changed (or first deploy), applying..."
            else
              rm -f "$TMP_COMPOSE"
              echo "Traefik compose unchanged."
            fi

            docker compose -f "$TRAEFIK_COMPOSE" --env-file "$TRAEFIK_ENV" pull traefik || true
            docker compose -f "$TRAEFIK_COMPOSE" --env-file "$TRAEFIK_ENV" up -d traefik

            # --- Deploy application, 2 replicas behind Traefik (zero-downtime) ---
            IMAGE="${{ inputs.registry }}/${{ inputs.image_name }}:${{ inputs.image_tag }}"
            docker pull "$IMAGE"

            # <===== НОВЫЙ БЛОК: ЗАПУСК МИГРАЦИЙ =====>
            echo "--- Running database migrations ---"
            MIGRATION_ENV_FILE=$(mktemp)
            echo "DATABASE_URL=${{ secrets.database_url }}" > "$MIGRATION_ENV_FILE"
            
            # Запускаем миграцию в одноразовом контейнере
            docker run --rm --env-file "$MIGRATION_ENV_FILE" "$IMAGE" bun run db:migrate

            rm "$MIGRATION_ENV_FILE"
            echo "--- Migrations completed ---"
            # <===== КОНЕЦ НОВОГО БЛОКА =====>

            APP_REPO="${{ inputs.image_name }}"
            APP_NAME="${APP_REPO##*/}"
            ROUTER="${APP_REPO//\//-}"

            BASE_NAME="${APP_NAME}-${{ github.ref_name }}"
            REPLICAS=2

            mapfile -t OLD_NEW < <(docker ps -a --format '{{.Names}}' | grep -E "^${BASE_NAME}-new-[0-9]+$" || true)
            for c in "${OLD_NEW[@]}"; do
              docker rm -f "$c" || true
            done

            run_replica() {
              local idx="$1"
              local name="${BASE_NAME}-new-${idx}"
              
              args=(
                -d
                --name "$name"
                --restart unless-stopped
                --network proxy

                --cpus "1"
                --memory "768m"

                --env AUTH_TRUST_HOST=true
                --env AUTH_URL=https://${{ inputs.domain }}
                --env NEXTAUTH_URL=https://${{ inputs.domain }}

                --env "AUTH_SECRET=${{ secrets.auth_secret }}"
                --env "AUTH_YANDEX_ID=${{ inputs.auth_yandex_id }}"
                --env "AUTH_YANDEX_SECRET=${{ secrets.auth_yandex_secret }}"
                --env "ADMIN_EMAILS=${{ inputs.admin_emails }}"
                --env "MANAGER_EMAILS=${{ inputs.manager_emails }}"
                --env "DATABASE_URL=${{ secrets.database_url }}"

                --env "S3_ENDPOINT=${{ inputs.s3_endpoint }}"
                --env "S3_BUCKET=${{ inputs.s3_bucket }}"
                --env "S3_ACCESS_KEY=${{ secrets.s3_access_key }}"
                --env "S3_SECRET_KEY=${{ secrets.s3_secret_key }}"
                --env "S3_REGION=${{ inputs.s3_region }}"
                --env "S3_FORCE_PATH_STYLE=${{ inputs.s3_force_path_style }}"
                --env "CDN_BASE_URL=${{ inputs.cdn_base_url }}"
                
                --label "traefik.enable=true"
                --label "traefik.docker.network=proxy"
                --label "traefik.http.services.${ROUTER}.loadbalancer.server.port=3000"
                --label "traefik.http.services.${ROUTER}.loadbalancer.healthcheck.path=/api/health"
                --label "traefik.http.services.${ROUTER}.loadbalancer.healthcheck.interval=3s"
              )

              if [[ "$idx" -eq 1 ]]; then
                args+=(
                  --label "traefik.http.routers.${ROUTER}.rule=Host(\`${{ inputs.domain }}\`)"
                  --label "traefik.http.routers.${ROUTER}.entrypoints=websecure"
                  --label "traefik.http.routers.${ROUTER}.tls=true"
                  --label "traefik.http.routers.${ROUTER}.tls.certresolver=letsencrypt"
                  --label "traefik.http.routers.${ROUTER}.service=${ROUTER}"
                  --label "traefik.http.routers.${ROUTER}-www.rule=Host(\`www.${{ inputs.domain }}\`)"
                  --label "traefik.http.routers.${ROUTER}-www.entrypoints=websecure"
                  --label "traefik.http.routers.${ROUTER}-www.tls=true"
                  --label "traefik.http.routers.${ROUTER}-www.tls.certresolver=letsencrypt"
                  --label "traefik.http.routers.${ROUTER}-www.service=${ROUTER}"
                )
              fi
              docker run "${args[@]}" "$IMAGE"
            }
            wait_healthy() {
              local name="$1"
              echo "Waiting for $name to become healthy..."
              for i in $(seq 1 30); do
                status="$(docker inspect -f '{{.State.Health.Status}}' "$name" 2>/dev/null || true)"
                if [[ "$status" == "healthy" ]]; then
                  echo "$name is healthy."
                  return 0
                fi
                if [[ "$status" == "unhealthy" ]]; then
                  echo "$name reported unhealthy."
                  break
                fi
                sleep 2
              done
              echo "Container $name did not become healthy (status: ${status:-unknown})." >&2
              docker logs "$name" || true
              return 1
            }
            for i in $(seq 1 "$REPLICAS"); do
              run_replica "$i"
            done
            for i in $(seq 1 "$REPLICAS"); do
              wait_healthy "${BASE_NAME}-new-${i}" || {
                for j in $(seq 1 "$REPLICAS"); do
                  docker rm -f "${BASE_NAME}-new-${j}" || true
                done
                exit 1
              }
            done
            if docker ps -a --format '{{.Names}}' | grep -qx "$BASE_NAME"; then
              docker stop "$BASE_NAME" || true
              docker rm "$BASE_NAME" || true
            fi
            mapfile -t OLD_REPLICAS < <(docker ps -a --format '{{.Names}}' | grep -E "^${BASE_NAME}-[0-9]+$" || true)
            for c in "${OLD_REPLICAS[@]}"; do
              docker stop "$c" || true
              docker rm "$c" || true
            done
            for i in $(seq 1 "$REPLICAS"); do
              docker rename "${BASE_NAME}-new-${i}" "${BASE_NAME}-${i}" || true
            done
            # --- Safe cleanup section ---
            echo "Starting safe cleanup..."
            CURRENT_IMAGE_ID=$(docker inspect "${BASE_NAME}-1" --format='{{.Image}}' 2>/dev/null || echo "")
            mapfile -t STALE_NEWS < <(docker ps -a --format '{{.Names}}' | grep -E "^${APP_NAME}-.*-new(-[0-9]+)?$" || true)
            for c in "${STALE_NEWS[@]}"; do
              [[ -n "$c" ]] || continue
              docker rm -f "$c" || true
            done
            docker image prune -f || true
            docker container prune -f || true
            docker volume ls -qf dangling=true | while read -r vol; do
              if [[ "$vol" != *"letsencrypt"* && "$vol" != *"traefik"* ]]; then
                docker volume rm "$vol" || true
              fi
            done
            docker builder prune -f --keep-storage=2GB || true
            REPO_PREFIX="${{ inputs.registry }}/${{ inputs.image_name }}"
            mapfile -t APP_IMAGES < <(
              docker images --format '{{.Repository}}:{{.Tag}}|{{.ID}}|{{.CreatedAt}}' \
                | grep -E "^${REPO_PREFIX}:sha-[0-9a-f]{7}\|" \
                | sort -rk3
            )
            if (( ${#APP_IMAGES[@]} > 3 )); then
              for img_line in "${APP_IMAGES[@]:3}"; do
                img="${img_line%%|*}"
                rest="${img_line#*|}"
                img_id="${rest%%|*}"
                if [[ "$img_id" != "$CURRENT_IMAGE_ID" ]]; then
                  echo "Removing old image: $img"
                  docker image rm -f "$img" || true
                else
                  echo "Keeping image in use: $img"
                fi
              done
            fi
            if [[ ! -f "$LETSENCRYPT_DIR/acme.json" ]]; then
              echo "ERROR: acme.json was deleted!" >&2
              touch "$LETSENCRYPT_DIR/acme.json"
              chmod 600 "$LETSENCRYPT_DIR/acme.json"
            fi
            echo "Cleanup completed safely."
```

Dockerfile

```
# syntax=docker/dockerfile:1.7

FROM oven/bun:1 AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lock ./
RUN --mount=type=cache,target=/root/.cache/bun \
    bun install --frozen-lockfile

FROM base AS builder
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

ENV SKIP_ENV_VALIDATION=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN if grep -q '"build"' package.json; then \
      bun run build; \
    else \
      bunx --bun next build; \
    fi

FROM oven/bun:1 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder --chown=bun:bun /app/public ./public
COPY --from=builder --chown=bun:bun /app/.next/standalone ./
COPY --from=builder --chown=bun:bun /app/.next/static ./.next/static

COPY --from=builder --chown=bun:bun /app/drizzle ./drizzle
COPY --from=builder --chown=bun:bun /app/drizzle.config.ts ./drizzle.config.ts

USER bun
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

HEALTHCHECK --interval=10s --timeout=3s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["bun", "server.js"]

```

package.json

```
{
  "name": "greenkiss",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "build:context": "bun scripts/context-builder/index.ts",
    "start": "next start",
    "format": "biome format --write",
    "lint": "biome lint --write",
    "check": "biome check --write",
    "typecheck": "tsc --noEmit",
    "prepare": "husky",
    "docker:up": "docker compose up -d",
    "docker:down": "docker compose down",
    "docker:clean": "docker compose down -v",
    "db:studio": "drizzle-kit studio --config=drizzle.config.ts",
    "db:generate": "drizzle-kit generate --config=drizzle.config.ts",
    "db:push": "drizzle-kit push --config=drizzle.config.ts",
    "db:migrate": "drizzle-kit migrate --config=drizzle.config.ts",
    "db:reset": "bun docker:down && bun docker:clean && bun docker:up && bun run scripts/wait-and-clean-drizzle.ts && bun db:generate && bun db:migrate"
  },
  "dependencies": {
    "@auth/drizzle-adapter": "^1.11.1",
    "@aws-sdk/client-s3": "^3.933.0",
    "@hookform/resolvers": "^5.2.2",
    "@radix-ui/react-accordion": "^1.2.12",
    "@radix-ui/react-alert-dialog": "^1.1.15",
    "@radix-ui/react-aspect-ratio": "^1.1.8",
    "@radix-ui/react-avatar": "^1.1.11",
    "@radix-ui/react-checkbox": "^1.3.3",
    "@radix-ui/react-collapsible": "^1.1.12",
    "@radix-ui/react-context-menu": "^2.2.16",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-hover-card": "^1.1.15",
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-menubar": "^1.1.16",
    "@radix-ui/react-navigation-menu": "^1.2.14",
    "@radix-ui/react-popover": "^1.1.15",
    "@radix-ui/react-progress": "^1.1.8",
    "@radix-ui/react-radio-group": "^1.3.8",
    "@radix-ui/react-scroll-area": "^1.2.10",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-separator": "^1.1.8",
    "@radix-ui/react-slider": "^1.3.6",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-switch": "^1.2.6",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-toggle": "^1.1.10",
    "@radix-ui/react-toggle-group": "^1.1.11",
    "@radix-ui/react-tooltip": "^1.2.8",
    "@t3-oss/env-nextjs": "^0.13.8",
    "browser-image-compression": "^2.0.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "date-fns": "^4.1.0",
    "drizzle-orm": "^0.44.7",
    "embla-carousel-react": "^8.6.0",
    "input-otp": "^1.4.2",
    "lucide-react": "^0.554.0",
    "nanoid": "^5.1.6",
    "next": "16.0.3",
    "next-auth": "^5.0.0-beta.30",
    "next-themes": "^0.4.6",
    "postgres": "^3.4.7",
    "react": "19.2.0",
    "react-day-picker": "^9.11.1",
    "react-dom": "19.2.0",
    "react-hook-form": "^7.66.1",
    "react-hot-toast": "^2.6.0",
    "react-image-crop": "^11.0.10",
    "react-resizable-panels": "^3.0.6",
    "recharts": "2.15.4",
    "server-only": "^0.0.1",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.4.0",
    "vaul": "^1.1.2",
    "zod": "^4.1.12",
    "zustand": "^5.0.8"
  },
  "devDependencies": {
    "@biomejs/biome": "2.2.0",
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "dotenv": "^17.2.3",
    "drizzle-kit": "^0.31.7",
    "husky": "^9.1.7",
    "tailwindcss": "^4",
    "tw-animate-css": "^1.4.0",
    "typescript": "^5"
  }
}

```

scripts\wait-and-clean-drizzle.ts

```
import "dotenv/config";
import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import postgres from "postgres";

const __dirname = dirname(new URL(import.meta.url).pathname);

const MAX_ATTEMPTS = 60;
const DELAY_MS = 1000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error(
      "[wait-for-db] DATABASE_URL не задан. Убедись, что .env загружен.",
    );
    process.exit(1);
  }

  console.log(`[wait-for-db] Ожидание PostgreSQL по ${databaseUrl}...`);

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const sql = postgres(databaseUrl, { max: 1, idle_timeout: 1 });

    try {
      await sql`select 1`;
      await sql.end({ timeout: 1 });
      console.log("[wait-for-db] PostgreSQL полностью готов к запросам.");
      return;
    } catch {
      await sql.end({ timeout: 1 }).catch(() => {});
      console.log(`[wait-for-db] ещё не готов (попытка ${attempt})`);
      await sleep(DELAY_MS);
    }
  }

  console.error("[wait-for-db] PostgreSQL так и не стал готов к запросам :(");
  process.exit(1);
}

async function cleanDrizzle() {
  const target = join(__dirname, "..", "drizzle");

  if (!existsSync(target)) {
    console.log("[clean-drizzle] Папка 'drizzle' не найдена, пропускаю.");
    return;
  }

  try {
    await rm(target, { recursive: true, force: true });
    console.log("[clean-drizzle] Папка 'drizzle' удалена.");
  } catch (err) {
    console.error("[clean-drizzle] Ошибка при удалении папки 'drizzle':", err);
    process.exit(1);
  }
}

async function main() {
  await waitForDb();
  await cleanDrizzle();
}

main().catch((err) => {
  console.error("[wait-and-clean-drizzle] Неожиданная ошибка:", err);
  process.exit(1);
});

```

src\app\(shop)\layout.tsx

```
import type { ReactNode } from "react";
import { CartButton } from "@/services/cart";
import { FavoritesButton } from "@/services/favorites";
import { SearchBar } from "@/services/search";
import { UserProfileButton } from "@/services/user-profile";
import { Header } from "@/shared/ui/kit/header";
import { Logo } from "@/shared/ui/kit/logo";
import { Menu } from "@/shared/ui/menu";
import { ModeToggle } from "@/shared/ui/theme";

export default function ShopLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="min-h-screen max-w-screen-2xl mx-auto relative">
      <Header>
        <Logo href="/" className="hidden md:inline-block" />
        <Menu triggerName="Каталог" title="Каталог товаров">
          Бытовая техника
        </Menu>
        <SearchBar />
        <FavoritesButton />
        <CartButton />
        <ModeToggle />
        <UserProfileButton />
      </Header>
      {children}
    </div>
  );
}

```

src\app\(shop)\page.tsx

```
export default async function ShopPage() {
  return <div>123</div>;
}

```

src\app\admin\brands\page.tsx

```
export default function AdminBrandsPage() {
  return (
    <div>
      <h1>AdminBrandsPage</h1>
    </div>
  );
}

```

src\app\admin\categories\page.tsx

```
import { AdminCategoriesPage as AdminCategories } from "@/features/categories/server";

type SearchParams = {
  search?: string;
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function AdminCategoriesPage({ searchParams }: PageProps) {
  // ВАЖНО: searchParams теперь Promise — его надо await'ить
  const sp = await searchParams;
  const search =
    typeof sp.search === "string" && sp.search.length > 0 ? sp.search : "";

  return <AdminCategories search={search} />;
}

```

src\app\admin\layout.tsx

```
import type { ReactNode } from "react";

import { UserProfileButton } from "@/services/user-profile";
import { AdminNav } from "@/shared/ui/admin-kit";
import { Header } from "@/shared/ui/kit/header";
import { Logo } from "@/shared/ui/kit/logo";
import { Menu } from "@/shared/ui/menu";
import { ModeToggle } from "@/shared/ui/theme";

export default function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="min-h-screen max-w-screen-2xl mx-auto relative">
      <Header>
        <Logo href="/admin" className="hidden md:inline-block" />
        <Menu
          triggerClassName="lg:hidden"
          title="Админ навигация"
          triggerName="Навигация"
        >
          <AdminNav />
        </Menu>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <UserProfileButton />
        </div>
      </Header>

      <main className="h-[calc(100vh-3rem-1px)] md:h-[calc(100vh-3.5rem-1px)] grid lg:grid-cols-[auto_1fr]">
        <aside className="hidden w-50 xl:w-60 lg:block border-r">
          <AdminNav />
        </aside>
        {children}
      </main>
    </div>
  );
}

```

src\app\admin\page.tsx

```
export default async function AdminCategoriesPage() {
  return (
    <div>
      <h1>Admin</h1>
    </div>
  );
}

```

src\app\api\auth\[...nextauth]\route.ts

```
import { handlers } from "@/shared/lib/auth/server";
export const { GET, POST } = handlers;

```

src\app\api\health\db\route.ts

```
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/shared/api/db";

export async function GET() {
  const startedAt = Date.now();
  try {
    await db.execute(sql`select 1`);
    const ms = Date.now() - startedAt;
    return NextResponse.json(
      {
        status: "ok",
        db: "reachable",
        latency_ms: ms,
        timestamp: new Date().toISOString(),
        service: "greenkiss-web",
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    const ms = Date.now() - startedAt;
    return NextResponse.json(
      {
        status: "degraded",
        db: "unreachable",
        latency_ms: ms,
        error: err instanceof Error ? err.message : "unknown",
        timestamp: new Date().toISOString(),
        service: "greenkiss-web",
      },
      { status: 503 },
    );
  }
}

```

src\app\api\health\route.ts

```
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "greenkiss-web",
    },
    { status: 200 },
  );
}

```

src\app\layout.tsx

```
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "@/shared/lib/auth";
import { ThemeProvider } from "@/shared/ui/theme";

import "./_styles/globals.css";

export const metadata: Metadata = {
  title: "Green Kiss",
  description: "Интернет-магазин одежды Green Kiss",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
          enableSystem={false}
        >
          <SessionProvider>
            {children}
            <Toaster />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

```

src\app\login\page.tsx

```
import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginPageContent } from "./_ui/login-page-content";

export const metadata: Metadata = {
  title: "Вход | Green Kiss",
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  );
}

```

src\app\login\_ui\login-page-content.tsx

```
"use client";

import { AlertCircle, Loader2, LogOut, User as UserIcon } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  getAuthErrorMessage,
  signIn,
  signOut,
  useSession,
} from "@/shared/lib/auth";
import { Button } from "@/shared/ui/kit/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/kit/card";
import { Separator } from "@/shared/ui/kit/separator";

export const LoginPageContent = () => {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSigninLoading, setIsSigninLoading] = useState(false);
  const [isSignoutLoading, setIsSignoutLoading] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") || "/";

  // Читаем и приводим к человеку‑читаемому тексту параметр ?error=...
  useEffect(() => {
    const rawError = searchParams.get("error");
    const message = getAuthErrorMessage(rawError);
    setErrorMessage(message);
  }, [searchParams]);

  const handleSignIn = useCallback(async () => {
    try {
      setIsSigninLoading(true);
      await signIn("yandex", {
        redirectTo: callbackUrl,
      });
      // дальше управление возьмёт next-auth (редирект)
    } finally {
      setIsSigninLoading(false);
    }
  }, [callbackUrl]);

  const handleSignOut = useCallback(async () => {
    try {
      setIsSignoutLoading(true);
      await signOut({
        redirectTo: "/",
      });
    } finally {
      setIsSignoutLoading(false);
    }
  }, []);

  const isLoadingSession = status === "loading";
  const isAuthenticated = !!session?.user;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-xl font-semibold">
            {isAuthenticated ? "Ваш аккаунт" : "Вход в аккаунт"}
          </CardTitle>
          {errorMessage && (
            <div className="flex items-start gap-2 rounded-md border border-destructive-foreground bg-destructive px-3 py-2 text-sm text-destructive-foreground">
              <AlertCircle className="h-8 w-8" />
              <span>{errorMessage}</span>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {isLoadingSession ? (
            <div className="flex items-center justify-center py-4 text-sm text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Загружаем данные сессии...
            </div>
          ) : isAuthenticated ? (
            <>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary">
                  {session.user.image ? (
                    <Image
                      alt={session.user.name || ""}
                      className="h-11 w-11 rounded-full object-cover"
                      src={session.user.image}
                    />
                  ) : (
                    <UserIcon className="h-6 w-6" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">
                    {session.user.name || "Пользователь"}
                  </p>
                  {session.user.email && (
                    <p className="text-xs text-muted-foreground">
                      {session.user.email}
                    </p>
                  )}
                  {session.user.role && session.user.role !== "USER" && (
                    <p className="text-xs text-primary">
                      {session.user.role === "ADMIN"
                        ? "Администратор"
                        : "Менеджер"}
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Button
                  className="w-full flex items-center justify-center gap-2"
                  variant="default"
                  size="sm"
                  onClick={() => router.push(callbackUrl || "/")}
                >
                  Перейти{" "}
                  {callbackUrl && callbackUrl !== "/"
                    ? "по ссылке"
                    : "на главную"}
                </Button>

                <Button
                  className="w-full flex items-center justify-center gap-2"
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/")}
                >
                  На главную магазина
                </Button>

                <Button
                  className="w-full flex items-center justify-center gap-2"
                  variant="destructive"
                  size="sm"
                  onClick={handleSignOut}
                  disabled={isSignoutLoading}
                >
                  {isSignoutLoading && (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  )}
                  <LogOut className="h-4 w-4" />
                  Выйти из аккаунта
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Войдите через Яндекс, чтобы оформлять заказы, видеть историю
                покупок, управлять избранным и адресами доставки.
              </p>

              <div className="space-y-3">
                <Button
                  className="w-full flex items-center justify-center gap-2"
                  size="sm"
                  onClick={handleSignIn}
                  disabled={isSigninLoading}
                >
                  {isSigninLoading && (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  )}
                  {/* Если нет иконки Яндекса – оставьте только текст */}
                  {/* <YandexLogo className="h-4 w-4" /> */}
                  Войти через Яндекс
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Нажимая «Войти через Яндекс», вы соглашаетесь с условиями
                  использования сервиса.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

```

src\app\not-found.tsx

```
import { AlertTriangle, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/ui/kit/button";

export default function ShopNotFound() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
      <div className="mx-auto max-w-xl text-center space-y-6">
        <div className="inline-flex items-center justify-center rounded-full bg-amber-500/10 px-4 py-1 text-xs text-amber-500 font-bold ring-1 ring-amber-500/30">
          <AlertTriangle className="mr-2 h-4 w-4" />
          Страница не найдена
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
          Упс! Такой страницы нет
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
          Похоже, вы перешли по несуществующему адресу. Возможно, ссылка
          устарела или страница была удалена. Но у нас есть много классной
          одежды, которая уже ждёт вас.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button asChild className="gap-2" size="lg">
            <Link href="/">
              <Home className="h-4 w-4" />
              На главную магазина
            </Link>
          </Button>

          <Button
            asChild
            className="gap-2 text-muted-foreground"
            size="lg"
            variant="outline"
          >
            <Link href="/?sort=newest">
              <ArrowLeft className="h-4 w-4" />К новинкам
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

```

src\app\_types\index.d.ts

```
declare module "*.css";

```

src\app\_types\next-auth.d.ts

```
import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

type Role = "USER" | "ADMIN" | "MANAGER";

declare module "next-auth" {
  interface Session {
    user: {
      role?: Role;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role?: Role;
  }
}

```

src\features\categories\index.ts

```

```

src\features\categories\server.ts

```
export { createCategory, createTestCategories } from "./_actions/create";
export {
  deleteAllCategories,
  deleteAllTestCategories,
  deleteCategoryById,
} from "./_actions/delete";
export { getAdminCategories, getAllCategories } from "./_actions/read";
export { updateCategory } from "./_actions/update";
export { AdminCategoriesPage } from "./_ui/page";

```

src\features\categories\_actions\create.ts

```
"use server";

import { eq } from "drizzle-orm";
import { db } from "@/shared/api/db";
import { type Category, categories } from "@/shared/api/db/schemas/categories";
import {
  createErrorResponse,
  createSuccessResponse,
  mapAuthErrorToApiResponse,
  mapInternalErrorToApiResponse,
} from "@/shared/api/response";
import { AuthError } from "@/shared/lib/auth/errors";
import { requireAdminOrManager } from "@/shared/lib/auth/server";

type CreateCategoryResponse = Category;
type CreateTestCategoriesResponse = Category[];

type CreateCategoryInput = {
  name: string;
  parentId?: string | null;
  isTest?: boolean;
};

export async function createCategory(input: CreateCategoryInput) {
  const rawName = input.name;

  if (!rawName || !rawName.trim()) {
    return createErrorResponse({
      error: {
        code: "VALIDATION",
        httpStatus: 400,
        userMessage: "Некорректные данные для создания категории",
        devMessage: "name is missing/empty",
        fields: [
          {
            field: "name",
            message: "Название категории обязательно",
          },
        ],
      },
    });
  }

  try {
    await requireAdminOrManager();

    const trimmedName = rawName.trim();
    const isTest = input.isTest ?? false;

    let parentId: string | null = null;

    if (typeof input.parentId === "string") {
      const trimmedParentId = input.parentId.trim();

      if (trimmedParentId.length > 0) {
        const [parent] = await db
          .select({ id: categories.id })
          .from(categories)
          .where(eq(categories.id, trimmedParentId))
          .limit(1);

        if (!parent) {
          return createErrorResponse({
            error: {
              code: "VALIDATION",
              httpStatus: 400,
              userMessage: "Указанная родительская категория не найдена",
              devMessage: `Parent category with id=${trimmedParentId} not found`,
              fields: [
                {
                  field: "parentId",
                  message: "Родительская категория не найдена",
                },
              ],
            },
          });
        }

        parentId = parent.id;
      }
    }

    const [created]: Category[] = await db
      .insert(categories)
      .values({
        name: trimmedName,
        searchName: trimmedName.toLowerCase(),
        isTest,
        parentId,
      })
      .returning();

    return createSuccessResponse<CreateCategoryResponse>({
      data: created,
      message: "Категория успешно создана",
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return mapAuthErrorToApiResponse(e);
    }

    console.error("createCategory error", e);

    return mapInternalErrorToApiResponse(e, {
      userMessage: "Не удалось создать категорию",
      devPrefix: "createCategory",
    });
  }
}

export async function createTestCategories(count: number) {
  if (!Number.isFinite(count) || count <= 0) {
    return createErrorResponse({
      error: {
        code: "VALIDATION",
        httpStatus: 400,
        userMessage: "Некорректное количество категорий",
        devMessage: `Invalid count: ${count}`,
        fields: [
          {
            field: "count",
            message: "Количество категорий должно быть положительным числом",
          },
        ],
      },
    });
  }

  try {
    await requireAdminOrManager();

    const values = Array.from({ length: count }, (_, i) => {
      const name = `Test category ${i + 1}`;
      return {
        name,
        searchName: name.trim().toLowerCase(),
        isTest: true,
      };
    });

    const created: Category[] = await db
      .insert(categories)
      .values(values)
      .returning();

    return createSuccessResponse<CreateTestCategoriesResponse>({
      data: created,
      message: "Тестовые категории успешно созданы",
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return mapAuthErrorToApiResponse(e);
    }

    console.error("createTestCategories error", e);

    return mapInternalErrorToApiResponse(e, {
      userMessage: "Не удалось создать тестовые категории",
      devPrefix: "createTestCategories",
    });
  }
}

```

src\features\categories\_actions\delete.ts

```
"use server";

import { eq, sql } from "drizzle-orm";
import { db } from "@/shared/api/db";
import { categories } from "@/shared/api/db/schemas/categories";
import {
  createErrorResponse,
  createSuccessResponse,
  mapAuthErrorToApiResponse,
  mapInternalErrorToApiResponse,
} from "@/shared/api/response";
import { AuthError } from "@/shared/lib/auth/errors";
import { requireAdminOrManager } from "@/shared/lib/auth/server";

type DeleteCategoryByIdResponse = { id: string; deletedCount: number };
type DeleteAllCategoriesResponse = { deletedCount: number };
type DeleteAllTestCategoriesResponse = { deletedCount: number };

export async function deleteCategoryById(id: string) {
  try {
    await requireAdminOrManager();

    const trimmedId = id.trim();

    if (!trimmedId) {
      return createErrorResponse({
        error: {
          code: "VALIDATION",
          httpStatus: 400,
          userMessage: "Некорректные данные для удаления категории",
          devMessage: "id is missing/empty",
          fields: [
            {
              field: "id",
              message: "Идентификатор категории обязателен",
            },
          ],
        },
      });
    }

    const existing = await db
      .select()
      .from(categories)
      .where(eq(categories.id, trimmedId))
      .limit(1);

    if (!existing.length) {
      return createErrorResponse({
        error: {
          code: "NOT_FOUND",
          httpStatus: 404,
          userMessage: "Категория не найдена",
          devMessage: `Category with id=${trimmedId} not found`,
        },
      });
    }

    const result = await db.execute(
      sql<{
        id: string;
      }>`
        WITH RECURSIVE subtree AS (
          SELECT id
          FROM categories
          WHERE id = ${trimmedId}
          UNION ALL
          SELECT c.id
          FROM categories c
          JOIN subtree s ON c.parent_id = s.id
        )
        DELETE FROM categories
        WHERE id IN (SELECT id FROM subtree)
        RETURNING id;
      `,
    );

    const rows =
      "rows" in result && Array.isArray(result.rows)
        ? (result.rows as { id: string }[])
        : [];

    const deletedCount = rows.length;

    return createSuccessResponse<DeleteCategoryByIdResponse>({
      data: { id: trimmedId, deletedCount },
      message: "Категория и вложенные категории успешно удалены",
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return mapAuthErrorToApiResponse(e);
    }

    return mapInternalErrorToApiResponse(e, {
      userMessage: "Не удалось удалить категорию",
      devPrefix: "deleteCategoryById",
    });
  }
}

export async function deleteAllCategories() {
  try {
    await requireAdminOrManager();

    const deleted = await db
      .delete(categories)
      .returning({ id: categories.id });

    return createSuccessResponse<DeleteAllCategoriesResponse>({
      data: { deletedCount: deleted.length },
      message: "Все категории успешно удалены",
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return mapAuthErrorToApiResponse(e);
    }

    return mapInternalErrorToApiResponse(e, {
      userMessage: "Не удалось удалить все категории",
      devPrefix: "deleteAllCategories",
    });
  }
}

export async function deleteAllTestCategories() {
  try {
    await requireAdminOrManager();

    const deleted = await db
      .delete(categories)
      .where(eq(categories.isTest, true))
      .returning({ id: categories.id });

    return createSuccessResponse<DeleteAllTestCategoriesResponse>({
      data: { deletedCount: deleted.length },
      message: "Все тестовые категории успешно удалены",
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return mapAuthErrorToApiResponse(e);
    }

    return mapInternalErrorToApiResponse(e, {
      userMessage: "Не удалось удалить тестовые категории",
      devPrefix: "deleteAllTestCategories",
    });
  }
}

```

src\features\categories\_actions\read.ts

```
"use server";

import { asc, ilike } from "drizzle-orm";
import { db } from "@/shared/api/db";
import { type Category, categories } from "@/shared/api/db/schemas/categories";
import {
  createSuccessResponse,
  mapAuthErrorToApiResponse,
  mapInternalErrorToApiResponse,
} from "@/shared/api/response";
import { AuthError } from "@/shared/lib/auth/errors";
import { requireAdminOrManager } from "@/shared/lib/auth/server";

type GetAllCategoriesResponse = Category[];
type GetAdminCategoriesResponse = Category[];

export async function getAllCategories() {
  try {
    const rows: Category[] = await db
      .select()
      .from(categories)
      .orderBy(asc(categories.name));

    return createSuccessResponse<GetAllCategoriesResponse>({
      data: rows,
      message: "Категории успешно получены",
    });
  } catch (e) {
    return mapInternalErrorToApiResponse(e, {
      userMessage: "Не удалось получить категории",
      devPrefix: "getAllCategories",
    });
  }
}

export async function getAdminCategories(options?: { search?: string }) {
  const searchRaw = options?.search ?? "";
  const search = searchRaw.trim();

  try {
    await requireAdminOrManager();

    let rows: Category[];

    if (search) {
      const normalized = search.toLowerCase();

      rows = await db
        .select()
        .from(categories)
        .where(ilike(categories.searchName, `%${normalized}%`)) // ← без and()
        .orderBy(asc(categories.name));
    } else {
      rows = await db.select().from(categories).orderBy(asc(categories.name));
    }

    return createSuccessResponse<GetAdminCategoriesResponse>({
      data: rows,
      message: "Категории для админки успешно получены",
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return mapAuthErrorToApiResponse(e);
    }

    return mapInternalErrorToApiResponse(e, {
      userMessage: "Не удалось получить категории для админки",
      devPrefix: "getAdminCategories",
    });
  }
}

```

src\features\categories\_actions\update.ts

```
"use server";

import { eq, sql } from "drizzle-orm";
import { db } from "@/shared/api/db";
import { type Category, categories } from "@/shared/api/db/schemas/categories";
import {
  createErrorResponse,
  createSuccessResponse,
  mapAuthErrorToApiResponse,
  mapInternalErrorToApiResponse,
} from "@/shared/api/response";
import { AuthError } from "@/shared/lib/auth/errors";
import { requireAdminOrManager } from "@/shared/lib/auth/server";

type UpdateCategoryInput = {
  id: string;
  name?: string;
  parentId?: string | null;
};

type UpdateCategoryResponse = Category;

export async function updateCategory(input: UpdateCategoryInput) {
  const { id } = input;

  if (!id || !id.trim()) {
    return createErrorResponse({
      error: {
        code: "VALIDATION",
        httpStatus: 400,
        userMessage: "Некорректные данные для обновления категории",
        devMessage: "id is missing/empty",
        fields: [
          {
            field: "id",
            message: "Идентификатор категории обязателен",
          },
        ],
      },
    });
  }

  const hasNameUpdate = typeof input.name === "string";
  const hasParentUpdate = Object.hasOwn(input, "parentId");

  if (!hasNameUpdate && !hasParentUpdate) {
    return createErrorResponse({
      error: {
        code: "VALIDATION",
        httpStatus: 400,
        userMessage: "Не указаны изменения для категории",
        devMessage: "Neither name nor parentId provided for update",
      },
    });
  }

  let trimmedName: string | undefined;
  if (hasNameUpdate && input.name !== undefined) {
    trimmedName = input.name.trim();
    if (!trimmedName) {
      return createErrorResponse({
        error: {
          code: "VALIDATION",
          httpStatus: 400,
          userMessage: "Некорректные данные для обновления категории",
          devMessage: "name is missing/empty",
          fields: [
            {
              field: "name",
              message: "Название категории обязательно",
            },
          ],
        },
      });
    }
  }

  try {
    await requireAdminOrManager();

    const [existing] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id.trim()))
      .limit(1);

    if (!existing) {
      return createErrorResponse({
        error: {
          code: "NOT_FOUND",
          httpStatus: 404,
          userMessage: "Категория не найдена",
          devMessage: `Category with id=${id} not found`,
        },
      });
    }

    let nextParentId: string | null | undefined;

    if (hasParentUpdate) {
      if (
        input.parentId === null ||
        input.parentId === undefined ||
        input.parentId === ""
      ) {
        nextParentId = null;
      } else {
        const newParentId = input.parentId.trim();

        if (newParentId === existing.id) {
          return createErrorResponse({
            error: {
              code: "VALIDATION",
              httpStatus: 400,
              userMessage:
                "Категорию нельзя сделать дочерней самой себе. Выберите другую родительскую категорию.",
              devMessage: `Attempt to set parentId=${newParentId} equal to id=${existing.id}`,
              fields: [
                {
                  field: "parentId",
                  message: "Нельзя выбрать эту же категорию как родительскую",
                },
              ],
            },
          });
        }

        const [parent] = await db
          .select({ id: categories.id })
          .from(categories)
          .where(eq(categories.id, newParentId))
          .limit(1);

        if (!parent) {
          return createErrorResponse({
            error: {
              code: "VALIDATION",
              httpStatus: 400,
              userMessage: "Указанная родительская категория не найдена",
              devMessage: `Parent category with id=${newParentId} not found`,
              fields: [
                {
                  field: "parentId",
                  message: "Родительская категория не найдена",
                },
              ],
            },
          });
        }

        const result = await db.execute(
          sql<{
            id: string;
          }>`
            WITH RECURSIVE subtree AS (
              SELECT id, parent_id
              FROM categories
              WHERE id = ${existing.id}
              UNION ALL
              SELECT c.id, c.parent_id
              FROM categories c
              JOIN subtree s ON c.parent_id = s.id
            )
            SELECT id FROM subtree WHERE id = ${newParentId} LIMIT 1;
          `,
        );

        const rows =
          "rows" in result && Array.isArray(result.rows)
            ? (result.rows as { id: string }[])
            : [];

        if (rows.length > 0) {
          return createErrorResponse({
            error: {
              code: "CONFLICT",
              httpStatus: 409,
              userMessage:
                "Нельзя сделать дочернюю категорию родительской. Выберите другую родительскую категорию.",
              devMessage: `Attempt to set parentId=${newParentId} which is a descendant of id=${existing.id}`,
              fields: [
                {
                  field: "parentId",
                  message:
                    "Нельзя выбрать потомка этой категории как родительскую категорию",
                },
              ],
            },
          });
        }

        nextParentId = newParentId;
      }
    }

    const updateData: Partial<typeof categories.$inferInsert> = {};

    if (trimmedName !== undefined) {
      updateData.name = trimmedName;
      updateData.searchName = trimmedName.toLowerCase();
    }

    if (hasParentUpdate) {
      updateData.parentId = nextParentId ?? null;
    }

    const [updated]: Category[] = await db
      .update(categories)
      .set(updateData)
      .where(eq(categories.id, existing.id))
      .returning();

    if (!updated) {
      return createErrorResponse({
        error: {
          code: "NOT_FOUND",
          httpStatus: 404,
          userMessage: "Категория не найдена",
          devMessage: `Category with id=${id} not found after update`,
        },
      });
    }

    return createSuccessResponse<UpdateCategoryResponse>({
      data: updated,
      message: "Категория успешно обновлена",
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return mapAuthErrorToApiResponse(e);
    }

    return mapInternalErrorToApiResponse(e, {
      userMessage: "Не удалось обновить категорию",
      devPrefix: "updateCategory",
    });
  }
}

```

src\features\categories\_lib\build-category-tree.ts

```
import type { Category } from "@/shared/api/db/schemas/categories";

export type CategoryTreeNode = {
  category: Category;
  children: CategoryTreeNode[];
  depth: number;
};

export function buildCategoryTree(categories: Category[]): CategoryTreeNode[] {
  const nodeMap: Map<string, CategoryTreeNode> = new Map();
  const roots: CategoryTreeNode[] = [];

  for (const category of categories) {
    nodeMap.set(category.id, {
      category,
      children: [],
      depth: 0,
    });
  }

  for (const node of nodeMap.values()) {
    const parentId = node.category.parentId;
    if (!parentId) {
      roots.push(node);
      continue;
    }

    const parentNode = nodeMap.get(parentId);
    if (!parentNode) {
      roots.push(node);
      continue;
    }

    parentNode.children.push(node);
  }

  const stack: CategoryTreeNode[] = [...roots];
  while (stack.length > 0) {
    const node = stack.pop() as CategoryTreeNode;
    for (const child of node.children) {
      child.depth = node.depth + 1;
      stack.push(child);
    }
  }

  return roots;
}

export function collectDescendantIds(root: CategoryTreeNode): Set<string> {
  const result = new Set<string>();
  const stack: CategoryTreeNode[] = [root];

  while (stack.length > 0) {
    const node = stack.pop() as CategoryTreeNode;
    for (const child of node.children) {
      result.add(child.category.id);
      stack.push(child);
    }
  }

  return result;
}

```

src\features\categories\_ui\category-create-dialog.tsx

```
"use client";

import { useState } from "react";
import type { Category } from "@/shared/api/db/schemas/categories";
import { Button } from "@/shared/ui/kit/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/kit/dialog";
import { Input } from "@/shared/ui/kit/input";
import { Label } from "@/shared/ui/kit/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/kit/select";
import { createCategory } from "../_actions/create";
import { buildCategoryTree } from "../_lib/build-category-tree";

type AdminCategoryCreateDialogProps = {
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (created: Category) => void;
};

export const AdminCategoryCreateDialog = ({
  categories,
  open,
  onOpenChange,
  onCreated,
}: AdminCategoryCreateDialogProps) => {
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setName("");
      setParentId(null);
      setErrorMessage(null);
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async () => {
    const trimmed = name.trim();

    if (!trimmed) {
      setErrorMessage("Название категории обязательно");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await createCategory({
        name: trimmed,
        parentId,
      });

      if (response.status === "error") {
        console.error(response.error.devMessage ?? response.error.userMessage);
        setErrorMessage(response.error.userMessage);
        return;
      }

      if (onCreated) {
        onCreated(response.data);
      }

      handleClose(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tree = buildCategoryTree(categories);

  type FlatOption = {
    id: string;
    label: string;
  };

  const options: FlatOption[] = [];

  const stack = [...tree].reverse();
  while (stack.length > 0) {
    const node = stack.pop()!;
    const indent = "— ".repeat(node.depth);
    options.push({
      id: node.category.id,
      label: `${indent}${node.category.name}`,
    });
    for (let i = node.children.length - 1; i >= 0; i -= 1) {
      stack.push(node.children[i]);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Создание категории</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="create-category-name">Название категории</Label>
            <Input
              id="create-category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите название категории"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="create-category-parent">
              Родительская категория
            </Label>
            <Select
              value={parentId ?? ""}
              onValueChange={(value) => {
                if (value === "") {
                  setParentId(null);
                } else {
                  setParentId(value);
                }
              }}
              disabled={isSubmitting}
            >
              <SelectTrigger id="create-category-parent">
                <SelectValue placeholder="Без родительской категории" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Без родительской категории</SelectItem>
                {options.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {errorMessage && (
            <div className="text-sm text-destructive">{errorMessage}</div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleClose(false)}
            disabled={isSubmitting}
          >
            Отмена
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            Создать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

```

src\features\categories\_ui\category-edit-dialog.tsx

```
"use client";

import { useMemo, useState } from "react";
import type { Category } from "@/shared/api/db/schemas/categories";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/kit/alert-dialog";
import { Button } from "@/shared/ui/kit/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/kit/dialog";
import { Input } from "@/shared/ui/kit/input";
import { Label } from "@/shared/ui/kit/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/kit/select";
import { deleteCategoryById } from "../_actions/delete";
import { updateCategory } from "../_actions/update";
import {
  buildCategoryTree,
  type CategoryTreeNode,
  collectDescendantIds,
} from "../_lib/build-category-tree";

type AdminCategoryEditDialogProps = {
  categories: Category[];
  category: Category | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: (updated: Category) => void;
  onDeleted?: (deletedId: string) => void;
};

export const AdminCategoryEditDialog = ({
  categories,
  category,
  open,
  onOpenChange,
  onUpdated,
  onDeleted,
}: AdminCategoryEditDialogProps) => {
  const [name, setName] = useState<string>(category?.name ?? "");
  const [parentId, setParentId] = useState<string | null>(
    category?.parentId ?? null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const selectedCategoryId = category?.id ?? null;

  const { options, forbiddenParentIds } = useMemo(() => {
    const tree = buildCategoryTree(categories);
    const nodeMap = new Map<string, CategoryTreeNode>();

    const stackForMap = [...tree];
    while (stackForMap.length > 0) {
      const node = stackForMap.pop()!;
      nodeMap.set(node.category.id, node);
      for (const child of node.children) {
        stackForMap.push(child);
      }
    }

    const forbidden = new Set<string>();
    if (selectedCategoryId) {
      forbidden.add(selectedCategoryId);
      const rootNode = nodeMap.get(selectedCategoryId);
      if (rootNode) {
        const descendants = collectDescendantIds(rootNode);
        for (const id of descendants) {
          forbidden.add(id);
        }
      }
    }

    type FlatOption = {
      id: string;
      label: string;
    };

    const flatOptions: FlatOption[] = [];
    const stack = [...tree].reverse();
    while (stack.length > 0) {
      const node = stack.pop()!;
      if (!forbidden.has(node.category.id)) {
        const indent = "— ".repeat(node.depth);
        flatOptions.push({
          id: node.category.id,
          label: `${indent}${node.category.name}`,
        });
      }
      for (let i = node.children.length - 1; i >= 0; i -= 1) {
        stack.push(node.children[i]);
      }
    }

    return {
      options: flatOptions,
      forbiddenParentIds: forbidden,
    };
  }, [categories, selectedCategoryId]);

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setName(category?.name ?? "");
      setParentId(category?.parentId ?? null);
      setErrorMessage(null);
    }
    onOpenChange(nextOpen);
  };

  const handleSave = async () => {
    if (!category) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage("Название категории обязательно");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await updateCategory({
        id: category.id,
        name: trimmedName,
        parentId,
      });

      if (response.status === "error") {
        console.error(response.error.devMessage ?? response.error.userMessage);
        setErrorMessage(response.error.userMessage);
        return;
      }

      if (onUpdated) {
        onUpdated(response.data);
      }

      handleDialogOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!category) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await deleteCategoryById(category.id);

      if (response.status === "error") {
        console.error(response.error.devMessage ?? response.error.userMessage);
        setErrorMessage(response.error.userMessage);
        setDeleteDialogOpen(false);
        return;
      }

      if (onDeleted) {
        onDeleted(category.id);
      }

      setDeleteDialogOpen(false);
      handleDialogOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!category) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактирование категории</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="edit-category-name">Название категории</Label>
              <Input
                id="edit-category-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="edit-category-parent">
                Родительская категория
              </Label>
              <Select
                value={parentId ?? ""}
                onValueChange={(value) => {
                  if (value === "") {
                    setParentId(null);
                  } else {
                    setParentId(value);
                  }
                }}
                disabled={isSubmitting}
              >
                <SelectTrigger id="edit-category-parent">
                  <SelectValue placeholder="Без родительской категории" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Без родительской категории</SelectItem>
                  {options.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {errorMessage && (
              <div className="text-sm text-destructive">{errorMessage}</div>
            )}

            <div className="mt-2 border-t pt-3">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={isSubmitting}
              >
                Удалить категорию
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleDialogOpenChange(false)}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button type="button" onClick={handleSave} disabled={isSubmitting}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить категорию?</AlertDialogTitle>
            <AlertDialogDescription>
              Категория и все вложенные категории будут удалены без возможности
              восстановления. Вы уверены, что хотите продолжить?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
              disabled={isSubmitting}
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

```

src\features\categories\_ui\filters.tsx

```
import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";

type AdminCategoriesFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onCreateClick: () => void;
};

export const AdminCategoriesFilters = ({
  search,
  onSearchChange,
  onCreateClick,
}: AdminCategoriesFiltersProps) => {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-1">
        <label
          htmlFor="categories-search"
          className="text-sm font-medium text-muted-foreground"
        >
          Поиск категорий
        </label>
        <Input
          id="categories-search"
          type="search"
          placeholder="Введите название категории..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full md:w-80"
        />
      </div>

      <div className="flex items-center justify-end">
        <Button type="button" onClick={onCreateClick}>
          Добавить категорию
        </Button>
      </div>
    </div>
  );
};

```

src\features\categories\_ui\manager.tsx

```
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Category } from "@/shared/api/db/schemas/categories";
import { debounce } from "@/shared/lib/timing";
import { AdminCategoryCreateDialog } from "./category-create-dialog";
import { AdminCategoryEditDialog } from "./category-edit-dialog";
import { AdminCategoriesFilters } from "./filters";
import { AdminCategoriesTable } from "./table";

type AdminCategoriesManagerProps = {
  initialCategories: Category[];
};

export const AdminCategoriesManager = ({
  initialCategories,
}: AdminCategoriesManagerProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlSearch = searchParams.get("search") ?? "";

  const [inputValue, setInputValue] = useState(urlSearch);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  useEffect(() => {
    setInputValue(urlSearch);
  }, [urlSearch]);

  const debouncedUpdateUrl = useMemo(
    () =>
      debounce((value: string) => {
        const trimmed = value.trim();
        const params = new URLSearchParams(searchParams.toString());

        if (trimmed) {
          params.set("search", trimmed);
        } else {
          params.delete("search");
        }

        const query = params.toString();
        router.replace(query ? `${pathname}?${query}` : pathname);
        router.refresh();
      }, 600),
    [pathname, router, searchParams.toString()],
  );

  useEffect(
    () => () => {
      debouncedUpdateUrl.cancel();
    },
    [debouncedUpdateUrl],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setInputValue(value);
      debouncedUpdateUrl(value);
    },
    [debouncedUpdateUrl],
  );

  const handleRowClick = useCallback((category: Category) => {
    setSelectedCategory(category);
    setIsEditDialogOpen(true);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <AdminCategoriesFilters
        search={inputValue}
        onSearchChange={handleSearchChange}
        onCreateClick={() => setIsCreateDialogOpen(true)}
      />

      <AdminCategoriesTable
        categories={categories}
        onRowClick={handleRowClick}
      />

      <AdminCategoryCreateDialog
        categories={categories}
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreated={() => {
          router.refresh();
        }}
      />

      <AdminCategoryEditDialog
        categories={categories}
        category={selectedCategory}
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setSelectedCategory(null);
          }
        }}
        onUpdated={() => {
          router.refresh();
        }}
        onDeleted={() => {
          router.refresh();
        }}
      />
    </div>
  );
};

```

src\features\categories\_ui\page.tsx

```
import { AdminContainer } from "@/shared/ui/admin-kit";
import { OnlyDevCard } from "@/shared/ui/only-dev-card";
import { getAdminCategories } from "../_actions/read";
import { AdminCategoriesManager } from "./manager";
import { AdminTestCategories } from "./test-categories";

export const AdminCategoriesPage = async ({ search }: { search?: string }) => {
  const trimmed = search?.trim() ?? "";
  console.log("AdminCategoriesPage search:", trimmed); // временно, для проверки
  const res = await getAdminCategories(
    trimmed ? { search: trimmed } : undefined,
  );
  const initialCategories = res.status === "success" ? res.data : [];

  return (
    <AdminContainer title="Категории">
      <OnlyDevCard title="Управление тестовыми категориями">
        <AdminTestCategories />
      </OnlyDevCard>

      {/* временно, чтобы видно было */}
      <div className="text-xs text-muted-foreground">
        current search: "{trimmed}"
      </div>

      <AdminCategoriesManager initialCategories={initialCategories} />
    </AdminContainer>
  );
};

```

src\features\categories\_ui\table.tsx

```
"use client";

import { memo, useMemo } from "react";
import type { Category } from "@/shared/api/db/schemas/categories";
import { cn } from "@/shared/lib/css";
import { useRenderLogger } from "@/shared/lib/react";
import { Badge } from "@/shared/ui/kit/badge";
import { ScrollArea } from "@/shared/ui/kit/scroll-area";
import {
  buildCategoryTree,
  type CategoryTreeNode,
} from "../_lib/build-category-tree";

type AdminCategoriesTableProps = {
  categories: Category[];
  className?: string;
  onRowClick?: (category: Category) => void;
};

type FlatRow = {
  category: Category;
  depth: number;
  hasChildren: boolean;
};

const AdminCategoriesTableInner = ({
  categories,
  className,
  onRowClick,
}: AdminCategoriesTableProps) => {
  useRenderLogger("AdminCategoriesTable");

  const flatRows: FlatRow[] = useMemo(() => {
    if (!categories.length) {
      return [];
    }

    const roots = buildCategoryTree(categories);
    const result: FlatRow[] = [];

    const stack: CategoryTreeNode[] = [...roots].reverse();
    while (stack.length > 0) {
      const node = stack.pop() as CategoryTreeNode;
      result.push({
        category: node.category,
        depth: node.depth,
        hasChildren: node.children.length > 0,
      });
      for (let i = node.children.length - 1; i >= 0; i -= 1) {
        stack.push(node.children[i]);
      }
    }

    return result;
  }, [categories]);

  if (!flatRows.length) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)}>
        Категории не найдены.
      </div>
    );
  }

  return (
    <ScrollArea className={cn("w-full", className)}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b bg-muted/50 text-left">
            <th className="px-3 py-2 font-medium">ID</th>
            <th className="px-3 py-2 font-medium">Название</th>
            <th className="px-3 py-2 font-medium">Тестовая</th>
          </tr>
        </thead>
        <tbody>
          {flatRows.map(({ category, depth, hasChildren }) => (
            <tr
              key={category.id}
              className={cn(
                "border-b last:border-0 hover:bg-muted/50",
                onRowClick && "cursor-pointer",
              )}
              onClick={() => {
                if (onRowClick) {
                  onRowClick(category);
                }
              }}
            >
              <td className="px-3 py-2 align-top font-mono text-xs text-muted-foreground">
                {category.id}
              </td>
              <td className="px-3 py-2 align-top">
                <div className="flex items-center">
                  <div
                    className="inline-flex items-center"
                    style={{ marginLeft: depth * 16 }}
                  >
                    <span
                      className={cn(
                        "mr-2 inline-block h-2 w-2 rounded-full",
                        hasChildren ? "bg-primary" : "bg-muted-foreground/40",
                      )}
                    />
                  </div>
                  <span>{category.name}</span>
                </div>
              </td>
              <td className="px-3 py-2 align-top">
                {category.isTest ? (
                  <Badge variant="outline" className="text-[10px] uppercase">
                    test
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollArea>
  );
};

export const AdminCategoriesTable = memo(
  AdminCategoriesTableInner,
  (prev, next) => {
    if (prev.categories.length !== next.categories.length) return false;
    if (prev.onRowClick !== next.onRowClick) return false;
    return prev.categories === next.categories;
  },
);

```

src\features\categories\_ui\test-categories.tsx

```
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { createTestCategories } from "../_actions/create";
import { deleteAllTestCategories } from "../_actions/delete";

export const AdminTestCategories = () => {
  const [count, setCount] = useState<number>(10);
  const [loadingAction, setLoadingAction] = useState<"add" | "delete" | null>(
    null,
  );
  const router = useRouter();

  const isLoading = loadingAction !== null;

  async function handleAdd() {
    setLoadingAction("add");
    try {
      const res = await createTestCategories(count);

      if (res.status === "error") {
        console.error(res.error.devMessage ?? res.error.userMessage);
        return;
      }

      router.refresh();
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleDeleteAllTest() {
    setLoadingAction("delete");
    try {
      const res = await deleteAllTestCategories();

      if (res.status === "error") {
        console.error(res.error.devMessage ?? res.error.userMessage);
        return;
      }

      router.refresh();
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium" htmlFor="test-count">
          Количество тестовых категорий
        </label>
        <Input
          id="test-count"
          type="number"
          min={1}
          value={count}
          onChange={(e) => {
            const value = Number(e.target.value);
            setCount(value);
          }}
          className="w-32"
          disabled={isLoading}
        />
      </div>

      <Button
        type="button"
        onClick={handleAdd}
        disabled={isLoading || count <= 0}
      >
        {isLoading && loadingAction === "add" ? "Добавление..." : "Добавить"}
      </Button>

      <Button
        type="button"
        variant="destructive"
        onClick={handleDeleteAllTest}
        disabled={isLoading}
      >
        {isLoading && loadingAction === "delete"
          ? "Удаление..."
          : "Удалить все тестовые"}
      </Button>
    </div>
  );
};

```

src\proxy.ts

```
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { env } from "@/shared/config/env";

const ADMIN_PREFIX = "/admin";

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (!pathname.startsWith(ADMIN_PREFIX)) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: env.AUTH_SECRET,
  });

  const url = req.nextUrl.clone();
  const callbackUrl = `${pathname}${search || ""}`;

  if (!token) {
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", callbackUrl);
    url.searchParams.set("error", "AccessDenied");
    return NextResponse.redirect(url);
  }

  const role = token?.role;
  if (role !== "ADMIN" && role !== "MANAGER") {
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", callbackUrl);
    url.searchParams.set("error", "AccessDenied");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

```

src\services\cart\index.ts

```
export { CartButton } from "./_ui/cart-button";

```

src\services\cart\_ui\cart-button.tsx

```
"use client";

import { ShoppingCart } from "lucide-react";
import { Badge } from "@/shared/ui/kit/badge";
import { Button } from "@/shared/ui/kit/button";

export const CartButton = () => {
  // TODO: Добавить логику подсчета товаров в корзине
  const cartItemsCount = 2;

  return (
    <Button className="relative" size="icon" variant="ghost">
      <ShoppingCart className="h-5 w-5" />
      {cartItemsCount > 0 && (
        <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
          {cartItemsCount}
        </Badge>
      )}
    </Button>
  );
};

```

src\services\favorites\index.ts

```
export { FavoritesButton } from "./_ui/favorites-button";

```

src\services\favorites\_ui\favorites-button.tsx

```
"use client";

import { Heart } from "lucide-react";
import { Badge } from "@/shared/ui/kit/badge";
import { Button } from "@/shared/ui/kit/button";

export const FavoritesButton = () => {
  // TODO: Добавить логику подсчета избранных товаров
  const favoritesCount = 3;

  return (
    <Button className="relative" size="icon" variant="ghost">
      <Heart className="h-5 w-5" />
      {favoritesCount > 0 && (
        <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
          {favoritesCount}
        </Badge>
      )}
    </Button>
  );
};

```

src\services\search\index.ts

```
export { SearchBar } from "./_ui/search-bar";

```

src\services\search\_ui\search-bar.tsx

```
import { Search } from "lucide-react";
import { Input } from "@/shared/ui/kit/input";

export const SearchBar = () => {
  return (
    <div className="hidden w-full md:flex items-center relative">
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
      <Input
        className="w-full pl-10 bg-secondary/50"
        placeholder="Поиск товаров..."
      />
    </div>
  );
};

```

src\services\user-profile\index.ts

```
export { UserProfileButton } from "./_ui/user-profile-button";

```

src\services\user-profile\_ui\user-avatar.tsx

```
"use client";

import { User } from "lucide-react";
import { useSession } from "@/shared/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/kit/avatar";
import { Skeleton } from "@/shared/ui/kit/skeleton";

export const UserAvatar = ({ className }: { className?: string }) => {
  const { data: session, status } = useSession();
  const isAuthenticated = !!session;
  const userInitials =
    session?.user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  if (status === "loading") return <Skeleton className="h-full w-full" />;
  if (!isAuthenticated) return <User className="h-full w-full" />;

  return (
    <Avatar className={className}>
      <AvatarImage
        alt={session?.user?.name || ""}
        src={session?.user?.image || ""}
      />
      <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
    </Avatar>
  );
};

```

src\services\user-profile\_ui\user-popover-content.tsx

```
"use client";

import { signIn, signOut, useSession } from "@/shared/lib/auth";
import { PopoverContent } from "@/shared/ui/kit/popover";
import { UserProfilePopoverAuthenticated } from "./user-profile-popover-authenticated";
import { UserProfilePopoverGuest } from "./user-profile-popover-guest";

export const UserPopoverContent = () => {
  const { data: session } = useSession();

  const handleSignIn = async () => {
    await signIn("yandex", { redirectTo: "/" });
  };

  const handleSignOut = async () => {
    await signOut({ redirectTo: "/" });
  };

  const isAuthenticated = !!session;

  return (
    <PopoverContent align="end" className="w-80">
      {isAuthenticated ? (
        <UserProfilePopoverAuthenticated
          onSignOut={handleSignOut}
          user={session?.user}
        />
      ) : (
        <UserProfilePopoverGuest onSignIn={handleSignIn} />
      )}
    </PopoverContent>
  );
};

```

src\services\user-profile\_ui\user-profile-button.tsx

```
import { Button } from "@/shared/ui/kit/button";
import { Popover, PopoverTrigger } from "@/shared/ui/kit/popover";

import { UserAvatar } from "./user-avatar";
import { UserPopoverContent } from "./user-popover-content";

export const UserProfileButton = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="relative" size="icon" variant="ghost">
          <UserAvatar className="h-8 w-8" />
        </Button>
      </PopoverTrigger>

      <UserPopoverContent />
    </Popover>
  );
};

```

src\services\user-profile\_ui\user-profile-popover-authenticated.tsx

```
"use client";

import {
  CreditCard,
  Heart,
  HelpCircle,
  LogOut,
  MapPin,
  Package,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/ui/kit/button";
import { Separator } from "@/shared/ui/kit/separator";
import { UserAvatar } from "./user-avatar";

type Role = "ADMIN" | "MANAGER" | "USER";

export const UserProfilePopoverAuthenticated = ({
  user,
  onSignOut,
}: {
  user:
    | {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        role?: Role | null;
      }
    | null
    | undefined;
  onSignOut: () => void | Promise<void>;
}) => {
  return (
    <div className="space-y-4">
      {/* Информация о пользователе */}
      <div className="flex items-center gap-3">
        <UserAvatar className="h-12 w-12" />
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium leading-none">
            {user?.name || "Пользователь"}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {user?.email}
          </p>
          {user?.role && user.role !== "USER" && (
            <div className="flex items-center gap-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {user.role === "ADMIN" ? "Администратор" : "Менеджер"}
              </span>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Навигационные ссылки */}
      <div className="space-y-1">
        <Link href="/profile" passHref>
          <Button className="w-full justify-start" size="sm" variant="ghost">
            <Settings className="mr-2 h-4 w-4" />
            Личный кабинет
          </Button>
        </Link>
        <Link href="/orders" passHref>
          <Button className="w-full justify-start" size="sm" variant="ghost">
            <Package className="mr-2 h-4 w-4" />
            Мои заказы
          </Button>
        </Link>
        <Link href="/favorites" passHref>
          <Button className="w-full justify-start" size="sm" variant="ghost">
            <Heart className="mr-2 h-4 w-4" />
            Избранное
          </Button>
        </Link>
        <Link href="/addresses" passHref>
          <Button className="w-full justify-start" size="sm" variant="ghost">
            <MapPin className="mr-2 h-4 w-4" />
            Адреса доставки
          </Button>
        </Link>
        <Link href="/payment-methods" passHref>
          <Button className="w-full justify-start" size="sm" variant="ghost">
            <CreditCard className="mr-2 h-4 w-4" />
            Способы оплаты
          </Button>
        </Link>

        {/* Ссылки для админов/менеджеров */}
        {(user?.role === "ADMIN" || user?.role === "MANAGER") && (
          <>
            <Separator className="my-2" />
            <Link href="/admin" passHref>
              <Button
                className="w-full justify-start"
                size="sm"
                variant="ghost"
              >
                <Settings className="mr-2 h-4 w-4" />
                Панель управления
              </Button>
            </Link>
          </>
        )}
      </div>

      <Separator />

      {/* Дополнительные действия */}
      <div className="flex flex-col gap-3">
        <Link href="#">
          <Button className="w-full justify-start" size="sm" variant="ghost">
            <HelpCircle className="mr-2 h-4 w-4" />
            Помощь и поддержка
          </Button>
        </Link>

        <Separator />

        <Button
          className="w-full"
          onClick={onSignOut}
          size="sm"
          variant="destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Выйти
        </Button>
      </div>
    </div>
  );
};

```

src\services\user-profile\_ui\user-profile-popover-guest.tsx

```
import { Button } from "@/shared/ui/kit/button";

export const UserProfilePopoverGuest = ({
  onSignIn,
}: {
  onSignIn: () => void | Promise<void>;
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Добро пожаловать!</h4>
        <p className="text-sm text-muted-foreground">
          Войдите в свой аккаунт, чтобы получить доступ ко всем функциям
          магазина
        </p>
      </div>
      <div className="space-y-2">
        <Button className="w-full" onClick={onSignIn}>
          Войти через Яндекс
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          Нажимая "Войти", вы соглашаетесь с условиями использования
        </p>
      </div>
    </div>
  );
};

```

src\shared\api\db\index.ts

```
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/shared/config/env";
import { categories } from "./schemas/categories";
import {
  accounts,
  authenticators,
  sessions,
  userRoleEnum,
  users,
  verificationTokens,
} from "./schemas/users";

const client = postgres(env.DATABASE_URL);

export const db = drizzle(client, {
  schema: {
    // USERS
    accounts,
    authenticators,
    sessions,
    users,
    verificationTokens,
    userRoleEnum,

    // CATEGORIES
    categories,
  },
});

```

src\shared\api\db\schemas\categories.ts

```
import type { InferSelectModel } from "drizzle-orm";
import type { AnyPgColumn, PgTableWithColumns } from "drizzle-orm/pg-core";
import { boolean, index, pgTable, text } from "drizzle-orm/pg-core";
import { createId } from "@/shared/lib/id";

export const categories: PgTableWithColumns<any> = pgTable(
  "categories",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text("name").notNull(),
    searchName: text("search_name").notNull(),
    isTest: boolean("is_test").notNull().default(false),
    parentId: text("parent_id").references(() => categories.id as AnyPgColumn, {
      onDelete: "set null",
    }),
  },
  (table) => [
    index("categories_search_name_idx").on(table.searchName),
    index("categories_parent_id_idx").on(table.parentId),
  ],
);

export type Category = InferSelectModel<typeof categories>;

```

src\shared\api\db\schemas\users.ts

```
import type { AdapterAccountType } from "@auth/core/adapters";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createId } from "@/shared/lib/id";

export const userRoleEnum = pgEnum("user_role", ["USER", "ADMIN", "MANAGER"]);

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  role: userRoleEnum("role").notNull().default("USER"),
  isBanned: boolean("isBanned").notNull().default(false),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ],
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    {
      compositePk: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
      }),
    },
  ],
);

export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => [
    {
      compositePK: primaryKey({
        columns: [authenticator.userId, authenticator.credentialID],
      }),
    },
  ],
);

```

src\shared\api\response\index.ts

```
export {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "./_lib/builders";

export {
  mapAuthErrorToApiResponse,
  mapInternalErrorToApiResponse,
} from "./_lib/helpers";

export type {
  ApiErrorCode,
  ApiErrorDetail,
  ApiErrorDetailField,
  ApiResponse,
  ApiResponseError,
  ApiResponseMeta,
  ApiResponseMetaPagination,
  ApiResponseStatus,
  ApiResponseSuccess,
} from "./_model/types";

```

src\shared\api\response\server.ts

```
export {
  createNextErrorResponse,
  createNextResponseFromApi,
  createNextSuccessResponse,
} from "./_lib/next-response";

```

src\shared\api\response\_lib\builders.ts

```
import type {
  ApiResponseError,
  ApiResponseMetaPagination,
  ApiResponseSuccess,
} from "../_model/types";

export const createSuccessResponse = <TData>(
  options: Omit<ApiResponseSuccess<TData>, "status">,
): ApiResponseSuccess<TData> => {
  return {
    ...options,
    status: "success",
  };
};

export const createErrorResponse = (
  options: Omit<ApiResponseError, "status">,
): ApiResponseError => {
  return {
    ...options,
    status: "error",
  };
};

export const createPaginatedResponse = <TData>(
  options: Omit<ApiResponseSuccess<TData>, "status" | "meta"> & {
    meta: { pagination: ApiResponseMetaPagination };
  },
): ApiResponseSuccess<TData> => {
  return {
    ...options,
    status: "success",
  };
};

```

src\shared\api\response\_lib\helpers.ts

```
import type { AuthError } from "@/shared/lib/auth/errors";
import type { ApiResponseError } from "../_model/types";
import { createErrorResponse } from "./builders";

export function mapAuthErrorToApiResponse(e: AuthError) {
  return createErrorResponse({
    error: {
      code: e.code,
      httpStatus: e.httpStatus,
      userMessage:
        e.code === "AUTH_REQUIRED"
          ? "Требуется авторизация"
          : "Недостаточно прав для выполнения операции",
      devMessage: e.message,
    },
  });
}

export function mapInternalErrorToApiResponse(
  e: unknown,
  options?: {
    userMessage?: string;
    devPrefix?: string;
  },
): ApiResponseError {
  const userMessage =
    options?.userMessage ?? "Произошла внутренняя ошибка сервера";

  const devMessageBase =
    e instanceof Error
      ? e.message
      : typeof e === "string"
        ? e
        : "Unknown error";

  const devMessage = options?.devPrefix
    ? `${options.devPrefix}: ${devMessageBase}`
    : devMessageBase;

  return createErrorResponse({
    error: {
      code: "INTERNAL",
      httpStatus: 500,
      userMessage,
      devMessage,
    },
  });
}

```

src\shared\api\response\_lib\next-response.ts

```
import { NextResponse } from "next/server";
import type {
  ApiResponse,
  ApiResponseError,
  ApiResponseMeta,
  ApiResponseSuccess,
} from "../_model/types";
import { createErrorResponse, createSuccessResponse } from "./builders";

export const createNextSuccessResponse = <TData>(
  options: {
    data: TData;
    message?: string;
    meta?: ApiResponseMeta;
  } & { httpStatus?: number },
): NextResponse<ApiResponseSuccess<TData>> => {
  const statusCode = options.httpStatus ?? 200;

  const body = createSuccessResponse<TData>({
    data: options.data,
    message: options.message,
    meta: options.meta,
  });

  return NextResponse.json<ApiResponseSuccess<TData>>(body, {
    status: statusCode,
  });
};

export const createNextErrorResponse = (
  options: Omit<ApiResponseError, "status">,
): NextResponse<ApiResponseError> => {
  const body = createErrorResponse(options);

  return NextResponse.json<ApiResponseError>(body, {
    status: body.error.httpStatus,
  });
};

export const createNextResponseFromApi = <TData>(
  response: ApiResponse<TData>,
): NextResponse<ApiResponse<TData>> => {
  const statusCode =
    response.status === "error" ? response.error.httpStatus : 200;

  return NextResponse.json<ApiResponse<TData>>(response, {
    status: statusCode,
  });
};

```

src\shared\api\response\_model\types.ts

```
export type ApiResponse<TData> = ApiResponseSuccess<TData> | ApiResponseError;

export type ApiResponseSuccess<TData> = {
  status: "success";
  data: TData;
  // optional user-facing message (RU), e.g. "Профиль обновлён"
  message?: string;
  meta?: ApiResponseMeta;
};

export type ApiResponseError = {
  status: "error";
  error: ApiErrorDetail;
  meta?: ApiResponseMeta;
};

export type ApiResponseMeta = {
  pagination?: ApiResponseMetaPagination;
  // extend here with other metadata if needed
};

export type ApiResponseMetaPagination = {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
};

export type ApiErrorDetail = {
  code: ApiErrorCode;
  httpStatus: number;
  // userMessage is displayed to user (RU)
  userMessage: string;
  // devMessage is for logs / debugging (EN)
  devMessage?: string;
  // optional validation or domain-level field errors
  fields?: ApiErrorDetailField[];
};

export type ApiErrorCode =
  | "UNKNOWN"
  | "VALIDATION"
  | "AUTH_REQUIRED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL"
  | "EXTERNAL_SERVICE";

export type ApiErrorDetailField = {
  field: string;
  message: string; // Russian, user-friendly
};

export type ApiResponseStatus = "success" | "error";

```

src\shared\config\env.ts

```
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: postgresUrl("DATABASE_URL"),
    AUTH_SECRET: requiredString("AUTH_SECRET"),
    AUTH_TRUST_HOST: z.coerce.boolean(),
    AUTH_URL: requiredString("AUTH_URL"),
    NEXTAUTH_URL: requiredString("NEXTAUTH_URL"),

    AUTH_YANDEX_ID: requiredString("AUTH_YANDEX_ID"),
    AUTH_YANDEX_SECRET: requiredString("AUTH_YANDEX_SECRET"),

    ADMIN_EMAILS: emailList("ADMIN_EMAILS"),
    MANAGER_EMAILS: emailList("MANAGER_EMAILS"),

    S3_ENDPOINT: z.url("S3_ENDPOINT must be a valid URL"),
    S3_BUCKET: requiredString("S3_BUCKET"),
    S3_ACCESS_KEY: requiredString("S3_ACCESS_KEY"),
    S3_SECRET_KEY: requiredString("S3_SECRET_KEY"),
    S3_REGION: requiredString("S3_REGION"),
    S3_FORCE_PATH_STYLE: z.coerce.boolean(),
    CDN_BASE_URL: z.url("CDN_BASE_URL must be a valid URL"),
  },
  client: {
    NEXT_PUBLIC_ICON: requiredString("NEXT_PUBLIC_ICON"),
    NEXT_PUBLIC_CDN_BASE_URL: requiredString("NEXT_PUBLIC_CDN_BASE_URL"),
  },
  runtimeEnv: {
    NEXT_PUBLIC_ICON: process.env.NEXT_PUBLIC_ICON,
    NEXT_PUBLIC_CDN_BASE_URL: process.env.NEXT_PUBLIC_CDN_BASE_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
    AUTH_URL: process.env.AUTH_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    AUTH_YANDEX_ID: process.env.AUTH_YANDEX_ID,
    AUTH_YANDEX_SECRET: process.env.AUTH_YANDEX_SECRET,
    ADMIN_EMAILS: process.env.ADMIN_EMAILS,
    MANAGER_EMAILS: process.env.MANAGER_EMAILS,
    S3_ENDPOINT: process.env.S3_ENDPOINT,
    S3_BUCKET: process.env.S3_BUCKET,
    S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
    S3_SECRET_KEY: process.env.S3_SECRET_KEY,
    S3_REGION: process.env.S3_REGION,
    S3_FORCE_PATH_STYLE: process.env.S3_FORCE_PATH_STYLE,
    CDN_BASE_URL: process.env.CDN_BASE_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});

function emailList(key: string) {
  return z
    .string()
    .min(1, `${key} is required`)
    .transform((raw) =>
      raw
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
    )
    .pipe(
      z
        .array(z.string().email(`Invalid email in ${key}`))
        .min(1, `${key} cannot be empty`),
    );
}

function postgresUrl(key: string) {
  return z
    .string()
    .trim()
    .regex(/^postgres(ql)?:\/\//, `Invalid Postgres URL for ${key}`);
}
function requiredString(key: string) {
  return z.string().min(1, `${key} is required`);
}

```

src\shared\lib\auth\errors.ts

```
export class AuthError extends Error {
  code: "AUTH_REQUIRED" | "FORBIDDEN";
  httpStatus: number;

  constructor(params: {
    code: "AUTH_REQUIRED" | "FORBIDDEN";
    httpStatus: number;
    message?: string;
  }) {
    super(params.message ?? params.code);
    this.code = params.code;
    this.httpStatus = params.httpStatus;
  }
}

export function getAuthErrorMessage(
  raw: string | null | undefined,
): string | null {
  if (!raw) return null;

  const clean = String(raw).trim();

  if (!clean) return null;

  // next-auth передаёт строго такие коды
  if (clean in AUTH_ERROR_MESSAGES) {
    return AUTH_ERROR_MESSAGES[clean as AuthErrorCode];
  }

  // Вдруг придёт что‑то своё — отдаём дефолтный текст
  return AUTH_ERROR_MESSAGES.Default;
}

export type AuthErrorCode =
  | "Configuration"
  | "AccessDenied"
  | "Verification"
  | "Default";

export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  Configuration:
    "Произошла ошибка конфигурации сервера авторизации. Попробуйте позже или обратитесь к поддержке.",
  AccessDenied:
    "Доступ запрещён. У вас нет прав для просмотра этой страницы или выполнения этого действия.",
  Verification:
    "Ссылка для входа недействительна или уже была использована. Запросите новую ссылку и попробуйте ещё раз.",
  Default: "Произошла ошибка при входе. Попробуйте ещё раз немного позже.",
};

```

src\shared\lib\auth\index.ts

```
"use client";

export { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
export { getAuthErrorMessage } from "./errors";

```

src\shared\lib\auth\server.ts

```
import "server-only";

import { cache } from "react";
import { AuthError } from "./errors";
import { auth, handlers, signIn, signOut } from "./src/build-next-auth";

export const getSession = cache(auth);

export async function requireAdmin() {
  const session = await getSession();

  if (!session || !session.user) {
    throw new AuthError({
      code: "AUTH_REQUIRED",
      httpStatus: 401,
      message: "Authentication is required",
    });
  }

  const role = session.user.role;

  if (role !== "ADMIN") {
    throw new AuthError({
      code: "FORBIDDEN",
      httpStatus: 403,
      message: "Access is allowed only for administrator",
    });
  }

  return session;
}

export async function requireAdminOrManager() {
  const session = await getSession();

  if (!session || !session.user) {
    throw new AuthError({
      code: "AUTH_REQUIRED",
      httpStatus: 401,
      message: "Authentication is required",
    });
  }

  const role = session.user.role;

  if (role !== "ADMIN" && role !== "MANAGER") {
    throw new AuthError({
      code: "FORBIDDEN",
      httpStatus: 403,
      message: "Access is allowed only for administrator or manager",
    });
  }

  return session;
}

export { handlers, signIn, signOut };

```

src\shared\lib\auth\src\build-adapter.ts

```
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import type { NextAuthConfig } from "next-auth";
import { db } from "@/shared/api/db";
import {
  accounts,
  authenticators,
  sessions,
  users,
  verificationTokens,
} from "@/shared/api/db/schemas/users";
import { env } from "@/shared/config/env";
import { createId } from "@/shared/lib/id";
import type { Role } from "./types";

const ADMIN_EMAILS = new Set(env.ADMIN_EMAILS);
const MANAGER_EMAILS = new Set(env.MANAGER_EMAILS);

export const buildAdapter = (): NonNullable<NextAuthConfig["adapter"]> => ({
  ...DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    authenticatorsTable: authenticators,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  async createUser(data) {
    try {
      const email = data.email.toLowerCase().trim();

      if (!email) {
        throw new Error("Email is required");
      }

      let role: Role = "USER";
      if (ADMIN_EMAILS.has(email)) {
        role = "ADMIN";
      } else if (MANAGER_EMAILS.has(email)) {
        role = "MANAGER";
      }

      const [inserted] = await db
        .insert(users)
        .values({
          ...data,
          id: createId(),
          role,
          email,
        })
        .returning();

      return {
        ...inserted,
        email,
      };
    } catch (error) {
      console.error("Failed to create user:", error);
      throw error;
    }
  },
});

```

src\shared\lib\auth\src\build-next-auth.ts

```
import NextAuth from "next-auth";
import { buildAdapter } from "./build-adapter";
import { buildProviders } from "./build-providers";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: buildAdapter(),
  providers: buildProviders(),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    session({ session, token }) {
      if (!session.user) session.user = {} as typeof session.user;
      session.user.role = token.role;
      return session;
    },
  },
});

```

src\shared\lib\auth\src\build-providers.ts

```
import type { NextAuthConfig } from "next-auth";
import Yandex from "next-auth/providers/yandex";
import { env } from "@/shared/config/env";

type Providers = NextAuthConfig["providers"];

export const buildProviders = (): Providers => [
  Yandex({
    clientId: env.AUTH_YANDEX_ID,
    clientSecret: env.AUTH_YANDEX_SECRET,
  }),
];

```

src\shared\lib\auth\src\types.ts

```
export type Role = "USER" | "ADMIN" | "MANAGER";

```

src\shared\lib\s3.ts

```
import "server-only";
import {
  type _Object,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { env } from "@/shared/config/env";

export const s3 = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT,
  forcePathStyle: env.S3_FORCE_PATH_STYLE,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY,
    secretAccessKey: env.S3_SECRET_KEY,
  },
});

export async function s3PutObject(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string,
  cacheControl = "public, max-age=31536000, immutable",
) {
  await s3.send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      ACL: "public-read",
      CacheControl: cacheControl,
    }),
  );
}

export async function s3DeleteObject(key: string) {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
    }),
  );
}

export async function s3DeletePrefix(prefix: string): Promise<void> {
  const normalized = prefix.replace(/^\/+/, "");
  let continuationToken: string | undefined;

  do {
    const resp = await s3.send(
      new ListObjectsV2Command({
        Bucket: env.S3_BUCKET,
        Prefix: normalized,
        ContinuationToken: continuationToken,
      }),
    );

    const contents: _Object[] = resp.Contents ?? [];
    const keys: string[] = contents
      .map((c) => c.Key)
      .filter((k): k is string => typeof k === "string" && k.length > 0);

    if (keys.length > 0) {
      await s3.send(
        new DeleteObjectsCommand({
          Bucket: env.S3_BUCKET,
          Delete: {
            Objects: keys.map((k) => ({ Key: k })),
            Quiet: true,
          },
        }),
      );
    }

    continuationToken = resp.IsTruncated
      ? resp.NextContinuationToken
      : undefined;
  } while (continuationToken);
}

export function s3PublicUrl(key: string) {
  return `${env.CDN_BASE_URL.replace(/\/+$/, "")}/${key.replace(/^\/+/, "")}`;
}

```

src\shared\lib\timing.ts

```
export type Procedure<Args extends unknown[], Return> = (
  ...args: Args
) => Return;

export type Cancelable = {
  cancel: () => void;
};

export type DebouncedFunction<Args extends unknown[]> = Procedure<Args, void> &
  Cancelable;

export type ThrottledFunction<Args extends unknown[]> = Procedure<Args, void> &
  Cancelable;

export function debounce<Args extends unknown[], Return>(
  fn: Procedure<Args, Return>,
  wait: number,
): DebouncedFunction<Args> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Args) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      timeoutId = null;
      fn(...args);
    }, wait);
  };

  debounced.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}

export function throttle<Args extends unknown[], Return>(
  fn: Procedure<Args, Return>,
  wait: number,
): ThrottledFunction<Args> {
  let lastCallTime: number | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Args | null = null;

  const invoke = (time: number, args: Args) => {
    lastCallTime = time;
    fn(...args);
  };

  const throttled = (...args: Args) => {
    const now = Date.now();

    if (lastCallTime === null) {
      // Первый вызов — сразу
      invoke(now, args);
      return;
    }

    const remaining = wait - (now - lastCallTime);

    // Можно вызывать сразу — прошёл интервал
    if (remaining <= 0) {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      invoke(now, args);
      return;
    }

    // Иначе планируем trailing‑вызов с последними аргументами
    lastArgs = args;
    if (timeoutId === null) {
      timeoutId = setTimeout(() => {
        timeoutId = null;
        if (lastArgs) {
          invoke(Date.now(), lastArgs);
          lastArgs = null;
        }
      }, remaining);
    }
  };

  throttled.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastArgs = null;
    lastCallTime = null;
  };

  return throttled;
}

```

src\shared\lib\transliterate.ts

```
export function toSlug(value: string): string {
  const transliterated = transliterateForSlug(value);

  return transliterated
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function transliterateForSlug(value: string): string {
  let result = "";
  for (const ch of value) {
    result += slugTransliterateChar(ch);
  }
  return result;
}

function slugTransliterateChar(ch: string): string {
  const lower = ch.toLowerCase();
  const mapped = SLUG_TRANSLIT_MAP[lower];
  if (mapped === undefined) return ch;
  return mapped;
}

const SLUG_TRANSLIT_MAP: Record<string, string> = {
  // Русские буквы
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "c",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",

  // Латиница (оставляем как есть)
  a: "a",
  b: "b",
  c: "c",
  d: "d",
  e: "e",
  f: "f",
  g: "g",
  h: "h",
  i: "i",
  j: "j",
  k: "k",
  l: "l",
  m: "m",
  n: "n",
  o: "o",
  p: "p",
  q: "q",
  r: "r",
  s: "s",
  t: "t",
  u: "u",
  v: "v",
  w: "w",
  x: "x",
  y: "y",
  z: "z",

  // Пробел и подчёркивание -> дефис
  " ": "-",
  _: "-",
};

```

src\shared\ui\admin-kit\index.ts

```
export { AdminContainer } from "./_admin-container";
export { AdminNav } from "./_admin-nav";

```

src\shared\ui\admin-kit\_admin-container\index.tsx

```
import type { ReactNode } from "react";

export const AdminContainer = ({
  title,
  children,
  actions,
}: {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}) => {
  return (
    <div className="h-full w-full flex flex-col gap-2 md:gap-4 p-4 md:px-8">
      <div className="h-10 md:h-12 lg:h-14 flex items-center justify-between">
        <h1 className="font-bold text-md md:text-lg lg:text-xl">{title}</h1>
        {actions}
      </div>
      {children}
    </div>
  );
};

```

src\shared\ui\admin-kit\_admin-nav\index.tsx

```
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/shared/ui/kit/button";
import { Logo } from "@/shared/ui/kit/logo";

const adminLinks = [
  {
    name: "Категории",
    href: "/admin/categories",
  },
  {
    name: "Бренды",
    href: "/admin/brands",
  },
];

export const AdminNav = () => {
  const pathname = usePathname();

  return (
    <nav className="h-[calc(100vh-1.75rem-1px)] lg:h-full overflow-x-auto">
      <div className="h-14 flex items-center justify-center border-b lg:hidden">
        <Logo href="/admin" />
      </div>

      {adminLinks.map(({ name, href }) => (
        <Button
          asChild
          key={href}
          className="w-full rounded-none border-b"
          variant={pathname.startsWith(href) ? "default" : "ghost"}
        >
          <Link href={href}>{name}</Link>
        </Button>
      ))}
    </nav>
  );
};

```

src\shared\ui\menu\index.ts

```
export { Menu } from "./_ui/menu";

```

src\shared\ui\menu\_ui\hamburger-menu.module.css

```
.icon {
  width: 20px;
  height: 20px;
  position: relative;
  transition: 0.1s;
  margin: 10px 10px;
  cursor: pointer;
  display: inline-block;
}
.icon span {
  width: 4px;
  height: 4px;
  background-color: var(--foreground);
  display: block;
  border-radius: 50%;
  position: absolute;
}
.icon:hover span {
  transform: scale(1.2);
  transition: 350ms cubic-bezier(0.8, 0.5, 0.2, 1.4);
}
.icon span:nth-child(1) {
  left: 0;
  top: 0;
}
.icon span:nth-child(2) {
  left: 8px;
  top: 0;
}
.icon span:nth-child(3) {
  right: 0;
  top: 0;
}
.icon span:nth-child(4) {
  left: 0;
  top: 8px;
}
.icon span:nth-child(5) {
  position: absolute;
  left: 8px;
  top: 8px;
}
.icon span:nth-child(6) {
  right: 0px;
  top: 8px;
}
.icon span:nth-child(7) {
  left: 0px;
  bottom: 0px;
}
.icon span:nth-child(8) {
  position: absolute;
  left: 8px;
  bottom: 0px;
}
.icon span:nth-child(9) {
  right: 0px;
  bottom: 0px;
}
.icon.open {
  transform: rotate(180deg);
  cursor: pointer;
  transition: 0.2s cubic-bezier(0.8, 0.5, 0.2, 1.4);
}
.icon.open span {
  border-radius: 50%;
  transition: 0.5s cubic-bezier(0.8, 0.5, 0.2, 1.4);
  transition-delay: 200ms;
}
.icon.open span:nth-child(2) {
  left: 4px;
  top: 4px;
}
.icon.open span:nth-child(4) {
  left: 4px;
  top: 12px;
}
.icon.open span:nth-child(6) {
  right: 4px;
  top: 4px;
}
.icon.open span:nth-child(8) {
  left: 12px;
  bottom: 4px;
}

```

src\shared\ui\menu\_ui\hamburger-menu.tsx

```
import { cn } from "@/shared/lib/css";
import { Button } from "@/shared/ui/kit/button";

import styles from "./hamburger-menu.module.css";

export const HamburgerMenu = ({
  open,
  triggerName,
  ...props
}: { open: boolean; triggerName: string } & React.ComponentProps<"button">) => {
  return (
    <Button
      aria-label={triggerName}
      className="px-2 font-bold text-md uppercase gap-0"
      variant="ghost"
      {...props}
    >
      <span aria-hidden="true" className={cn(styles.icon, open && styles.open)}>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </span>
      <span aria-hidden="true" className="hidden lg:block">
        {triggerName}
      </span>
    </Button>
  );
};

```

src\shared\ui\menu\_ui\menu.tsx

```
import type { ReactNode } from "react";
import { SheetContent, SheetHeader, SheetTitle } from "@/shared/ui/kit/sheet";
import { MenuProvider } from "./provider";

export const Menu = ({
  triggerClassName,
  title,
  triggerName,
  children,
}: {
  triggerClassName?: string;
  title: string;
  triggerName: string;
  children: ReactNode;
}) => {
  return (
    <MenuProvider triggerClassName={triggerClassName} triggerName={triggerName}>
      <SheetContent className="gap-0">
        <SheetHeader className="border-b py-2">
          <SheetTitle className="font-bold text-lg">{title}</SheetTitle>
        </SheetHeader>
        {children}
      </SheetContent>
    </MenuProvider>
  );
};

```

src\shared\ui\menu\_ui\provider.tsx

```
"use client";

import { type ReactNode, useState } from "react";
import { Sheet } from "@/shared/ui/kit/sheet";
import { HamburgerMenu } from "./hamburger-menu";

export const MenuProvider = ({
  triggerClassName,
  triggerName,
  children,
}: {
  triggerClassName?: string;
  triggerName: string;
  children: ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <HamburgerMenu
        className={triggerClassName}
        triggerName={triggerName}
        onClick={() => setOpen(!open)}
        open={open}
      />
      {children}
    </Sheet>
  );
};

```