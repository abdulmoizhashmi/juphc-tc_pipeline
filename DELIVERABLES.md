# Final Project Deliverables Checklist

## Part A - Agile

- [ ] Epic: Modernise Tax Calculator
- [ ] Story: Containerizing the application
- [ ] Story: Deploying on IBM Cloud
- [ ] Story: Creating a pipeline for packaging and deploying the application
- [ ] Screenshot or URL of Kanban board / written stories

## Part B - Application

- [ ] `npm test` succeeds
- [ ] Dockerfile exists
- [ ] `docker build -t tax-calculator:latest .` succeeds
- [ ] Container runs on port 8080
- [ ] Local browser test succeeds
- [ ] Image is tagged for IBM Container Registry
- [ ] Image is pushed to IBM Container Registry
- [ ] Code Engine deployment succeeds
- [ ] Public Code Engine URL works

## Part C - Tekton

- [ ] Tekton Tasks created
- [ ] Tekton Pipeline created
- [ ] Test task executes Jasmine
- [ ] Build/push task executes after tests
- [ ] Deploy task executes after build/push
- [ ] PipelineRun succeeds
- [ ] Final application is accessible from Code Engine
- [ ] Evidence/screenshots saved for grading

## Important

Never submit an IBM Cloud API key, password, token, or Kubernetes secret to GitHub.
