# Epics and Stories – Tax Calculator Modernisation

## Epic

**Title:** Modernise Tax Calculator

**Description:**
The Tax Calculator currently runs as a manually deployed static application and lacks a robust pipeline. This epic modernizes the application by containerizing it with Docker, deploying it on IBM Cloud Code Engine, and automating testing, packaging, and deployment through a Tekton pipeline. The tax bracket configuration is also externalized from the source code into a JSON config file, enabling runtime changes without code modifications.

---

## User Stories

### Story 1 – Containerizing the Application

**As a** developer,
**I want to** package the Tax Calculator into a Docker container,
**so that** it runs consistently across any environment without manual setup.

**Acceptance Criteria:**
- A `Dockerfile` exists at the project root targeting port 8080
- `docker build -t tax-calculator:latest .` succeeds without errors
- `docker run --rm -p 8080:8080 tax-calculator:latest` starts the app
- The web UI is accessible at `http://localhost:8080`
- Unit tests (`npm test`) pass before the container image is built

**Priority:** High
**Story Points:** 3

---

### Story 2 – Deploying on IBM Cloud

**As a** user,
**I want to** access the Tax Calculator via a public URL on IBM Cloud,
**so that** it is available without running a local server.

**Acceptance Criteria:**
- The Docker image is tagged for IBM Cloud Container Registry (`us.icr.io/<namespace>/tax-calculator:latest`)
- The image is pushed to IBM Cloud Container Registry successfully
- An IBM Cloud Code Engine application is created/updated using the pushed image
- The application is accessible via the Code Engine public HTTPS URL
- The health endpoint (`/api/health`) returns `{ "status": "ok" }`

**Priority:** High
**Story Points:** 3

---

### Story 3 – Creating a Pipeline for Packaging and Deploying the Application

**As a** DevOps engineer,
**I want to** automate the build, test, and deployment process with a Tekton pipeline,
**so that** there are no manual steps between code commit and production deployment.

**Acceptance Criteria:**
- A Tekton `Task` exists to run Jasmine unit tests (`npm test`)
- A Tekton `Task` exists to build and push the Docker image using Kaniko
- A Tekton `Task` exists to deploy to IBM Cloud Code Engine using IBM Cloud CLI
- A Tekton `Pipeline` connects the tasks in order: `clone → test → build-push → deploy`
- The build and deploy tasks only run after tests pass (`runAfter` dependency)
- A `PipelineRun` YAML is provided with configurable parameters (IMAGE, GIT_URL, CE_PROJECT, etc.)
- A successful `PipelineRun` results in the updated application deployed on Code Engine

**Priority:** High
**Story Points:** 5

---

## Kanban Board Summary

| Story | Status |
|-------|--------|
| Containerizing the Application | ✅ Done |
| Deploying on IBM Cloud | 🔄 In Progress (requires IBM Cloud lab) |
| Creating a pipeline for packaging and deploying | ✅ Done (YAML files complete) |
