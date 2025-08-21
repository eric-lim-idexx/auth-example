# Auth Example

Illustrating a Machine-to-Machine (M2M) authentication mechanism using `client_credentials` flow.

## Structure

This project is a monorepo with `pnpm` workspace.

```
.
├── packages/            # Shared packages and libraries
├── services/            # Applications and services
├── package.json         # Root package.json
└── pnpm-workspace.yaml  # Workspace configuration
```

## Getting Started

### Run

Bootstrap infra:

```bash
docker-compose -f docker/compose.yml up -d
cd infra
terraform init
terraform apply -auto-approve
cd ../
```

Build services:

```bash
pnpm install
pnpm build
```

Run each service:

```bash
pnpm --filter=@workspace/service-a start:dev
pnpm --filter=@workspace/service-b start:dev
```
