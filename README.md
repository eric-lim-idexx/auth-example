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

### JOSE Usage

Using [jose](https://www.npmjs.com/package/jose), verifying a JWT token looks like [this](https://github.com/eric-lim-idexx/auth-example/blob/04e12e65e198be8efbb434b3035c73a99451b46e/packages/common/src/auth/jwt.ts#L104-L107):

```ts
import { jwtVerify } from "jose";

const { payload } = await jwtVerify(token, JWKS, {
  issuer, // cognito or keycloak
  audience, // who's this token issues for (e.g., service-a or service-b)
});
```

> [!NOTE]
>
> - More claims can be verified with [these options](https://github.com/panva/jose/blob/b4f8fb372689b5b38074aa45c9921a6a997a9142/docs/types/interfaces/JWTClaimVerificationOptions.md)
> - JWKS can be obtained from https://cognito-idp.<Region>.amazonaws.com/<userPoolId>/.well-known/jwks.json

### JWT for target service

Before making a call to service B, [create a new token](https://github.com/eric-lim-idexx/auth-example/blob/e738672f56097f21c2632f1d42dc618d58836522/services/a/src/controllers/status.controller.ts#L49-L54).

> [!WARNING]
>
> Don't hardcode `clientSecret` like in the example...
