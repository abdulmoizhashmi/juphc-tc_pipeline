# Final Project Deliverables Checklist

## Part A - Agile

- [x] Epic: Modernise Tax Calculator
- [x] Story: Containerizing the application
- [x] Story: Deploying on IBM Cloud
- [x] Story: Creating a pipeline for packaging and deploying the application
- [ ] Screenshot or URL of Kanban board / written stories
  > See [`EPICS_AND_STORIES.md`](./EPICS_AND_STORIES.md) for the full Epic and Stories document.

## Part B - Application

- [x] `npm test` succeeds (6 specs, 0 failures)
- [x] Dockerfile exists (`FROM node:20-alpine`, port 8080, non-root user)
- [ ] `docker build -t tax-calculator:latest .` succeeds ← run locally
- [ ] Container runs on port 8080 ← run `docker run --rm -p 8080:8080 tax-calculator:latest`
- [ ] Local browser test succeeds ← open `http://localhost:8080`
- [ ] Image is tagged for IBM Container Registry ← see `ibmcloud-commands.sh` Section 4
- [ ] Image is pushed to IBM Container Registry ← see `ibmcloud-commands.sh` Section 4
- [ ] Code Engine deployment succeeds ← see `ibmcloud-commands.sh` Section 5
- [ ] Public Code Engine URL works ← verify after Section 5

## Part C - Tekton

- [x] Tekton Tasks created (`tekton/task-test.yaml`, `task-build-push.yaml`, `task-deploy-codeengine.yaml`)
- [x] Tekton Pipeline created (`tekton/pipeline.yaml`)
- [x] Test task executes Jasmine (`npm ci && npm test`)
- [x] Build/push task executes after tests (`runAfter: [test]` in pipeline.yaml)
- [x] Deploy task executes after build/push (`runAfter: [build-and-push]` in pipeline.yaml)
- [ ] PipelineRun succeeds ← apply `tekton/pipeline-run.yaml` in your cluster
- [ ] Final application is accessible from Code Engine ← verify public URL
- [ ] Evidence/screenshots saved for grading

## Important

Never submit an IBM Cloud API key, password, token, or Kubernetes secret to GitHub.

> **Steps requiring IBM Cloud lab access** are documented in [`ibmcloud-commands.sh`](./ibmcloud-commands.sh).
> Replace all `<PLACEHOLDER>` values with your actual IBM Cloud credentials and run section-by-section.
