# Tekton setup notes

## Prerequisites

This folder assumes a Kubernetes cluster with Tekton Pipelines installed.

It also assumes the standard Tekton Catalog `git-clone` Task is installed. If your course environment already provides it, no action is required.

Example catalog installation:

```bash
kubectl apply -f https://storage.googleapis.com/tekton-releases/pipeline/latest/release.yaml
kubectl apply -f https://raw.githubusercontent.com/tektoncd/catalog/main/task/git-clone/0.9/git-clone.yaml
```

Use the course-provided commands/environment if they differ.

## IBM Cloud credentials

Create a Kubernetes Secret containing an IBM Cloud API key:

```bash
kubectl create secret generic ibmcloud-credentials \
  --from-literal=apikey='YOUR_IBM_CLOUD_API_KEY'
```

Do not commit this secret or API key to GitHub.

## Registry authentication

Kaniko must be able to authenticate to IBM Container Registry. In a real cluster, configure the IBM Container Registry pull/push secret for the Tekton service account used by the pipeline. The exact secret setup depends on your cluster and IBM Cloud course environment.

## Apply

```bash
kubectl apply -f task-test.yaml
kubectl apply -f task-build-push.yaml
kubectl apply -f task-deploy-codeengine.yaml
kubectl apply -f pipeline.yaml
```

Edit `pipeline-run.yaml` with your real GitHub URL, IBM Registry image, Code Engine project, region and resource group, then:

```bash
kubectl apply -f pipeline-run.yaml
```

Monitor:

```bash
tkn pipelinerun list
tkn pipelinerun logs <PIPELINERUN_NAME> -f
```

## Pipeline order

```text
git-clone
   |
   v
tax-test
   |
   v
tax-build-push
   |
   v
tax-deploy-codeengine
```

The `runAfter` relationships ensure that deployment does not start before tests and image build/push have succeeded.
