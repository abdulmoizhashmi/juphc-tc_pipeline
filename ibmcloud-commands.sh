#!/bin/bash
# =============================================================================
# IBM Cloud Deployment Commands – Tax Calculator
# =============================================================================
# Instructions:
#   1. Replace ALL <PLACEHOLDER> values with your actual IBM Cloud details
#   2. Run this script section-by-section in your IBM Cloud lab terminal
#   3. Do NOT commit your API key or any credentials to GitHub
# =============================================================================

# ── CONFIGURATION (edit these) ─────────────────────────────────────────────
REGISTRY="us.icr.io"                    # e.g. us.icr.io (US South) or uk.icr.io
NAMESPACE="<YOUR_NAMESPACE>"            # your IBM Container Registry namespace
IMAGE_NAME="tax-calculator"
TAG="latest"
FULL_IMAGE="${REGISTRY}/${NAMESPACE}/${IMAGE_NAME}:${TAG}"

IBM_REGION="us-south"                   # e.g. us-south, eu-gb, au-syd
IBM_RESOURCE_GROUP="default"

CE_PROJECT="<YOUR_CODE_ENGINE_PROJECT>" # your Code Engine project name
CE_APP="tax-calculator"                 # Code Engine app name

# =============================================================================
# SECTION 1 – Login to IBM Cloud
# =============================================================================
ibmcloud login --sso
# OR with API key (do NOT commit the key):
# ibmcloud login --apikey "$IBMCLOUD_API_KEY" -r "$IBM_REGION"

ibmcloud target -r "$IBM_REGION" -g "$IBM_RESOURCE_GROUP"

# =============================================================================
# SECTION 2 – Login to IBM Container Registry
# =============================================================================
ibmcloud cr login

# Verify login and list existing images
ibmcloud cr images

# (Optional) Create namespace if it doesn't exist yet
# ibmcloud cr namespace-add "$NAMESPACE"

# =============================================================================
# SECTION 3 – Build Docker Image Locally
# =============================================================================
docker build -t "${IMAGE_NAME}:${TAG}" .

# Quick local smoke test – runs on port 8080
docker run --rm -d -p 8080:8080 --name "${IMAGE_NAME}-test" "${IMAGE_NAME}:${TAG}"
echo "App running at http://localhost:8080  (Ctrl+C or run docker stop to stop)"
sleep 3
curl -sf http://localhost:8080/api/health && echo "Health check OK" || echo "Health check FAILED"
docker stop "${IMAGE_NAME}-test" 2>/dev/null || true

# =============================================================================
# SECTION 4 – Tag and Push to IBM Container Registry
# =============================================================================
docker tag "${IMAGE_NAME}:${TAG}" "${FULL_IMAGE}"
docker push "${FULL_IMAGE}"

# Verify image in registry
ibmcloud cr images --restrict "${NAMESPACE}"

# =============================================================================
# SECTION 5 – Deploy to IBM Cloud Code Engine
# =============================================================================
# Install Code Engine plugin if not already installed
ibmcloud plugin install code-engine -f 2>/dev/null || true

# Select (or create) Code Engine project
ibmcloud ce project select --name "$CE_PROJECT"
# If the project doesn't exist yet:
# ibmcloud ce project create --name "$CE_PROJECT"

# Deploy / update the application
if ibmcloud ce app get --name "$CE_APP" > /dev/null 2>&1; then
  echo "Updating existing Code Engine app..."
  ibmcloud ce app update \
    --name "$CE_APP" \
    --image "$FULL_IMAGE" \
    --port 8080
else
  echo "Creating new Code Engine app..."
  ibmcloud ce app create \
    --name "$CE_APP" \
    --image "$FULL_IMAGE" \
    --port 8080
fi

# Show app status and public URL
ibmcloud ce app get --name "$CE_APP"

# =============================================================================
# SECTION 6 – Tekton Pipeline (run in your Kubernetes/Tekton cluster)
# =============================================================================
# Install Tekton and git-clone task (if not already in your cluster):
# kubectl apply -f https://storage.googleapis.com/tekton-releases/pipeline/latest/release.yaml
# kubectl apply -f https://raw.githubusercontent.com/tektoncd/catalog/main/task/git-clone/0.9/git-clone.yaml

# Create IBM Cloud credentials secret (DO NOT commit this to GitHub):
# kubectl create secret generic ibmcloud-credentials \
#   --from-literal=apikey='YOUR_IBM_CLOUD_API_KEY'

# Apply Tekton tasks and pipeline:
kubectl apply -f tekton/task-test.yaml
kubectl apply -f tekton/task-build-push.yaml
kubectl apply -f tekton/task-deploy-codeengine.yaml
kubectl apply -f tekton/pipeline.yaml

# Edit pipeline-run.yaml with your values, then apply:
# (update GIT_URL, IMAGE, CE_PROJECT, IBM_REGION, IBM_RESOURCE_GROUP)
kubectl apply -f tekton/pipeline-run.yaml

# Monitor the pipeline run:
tkn pipelinerun list
# tkn pipelinerun logs <PIPELINERUN_NAME> -f

echo ""
echo "============================================"
echo "Deployment complete! Verify your public URL:"
ibmcloud ce app get --name "$CE_APP" | grep "URL:"
echo "============================================"
