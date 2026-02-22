---

# Unified Health Diagnosis Platform

## Overview
This project delivers a **Unified Health Diagnosis Platform** capable of cross-category analysis across **Diabetes, Cancer, Mental Health, and Vision**.  
By 2026, healthcare AI has shifted toward **Agentic MLOps**, where models not only predict but also **trigger workflows** (e.g., physician alerts, referrals, scheduling).

The platform is designed with:
- **Multi-Cloud Architecture** (AWS, Azure, GCP)  
- **POC Notebook** simulating diagnosis logic  
- **Terraform IaC** for secure, HIPAA-ready infrastructure provisioning  
- **Evaluation Metrics** for performance and fairness  

---

## Project Structure

```
unified-health-platform/
│
├── notebooks/
│   └── multi_diagnosis_poc.ipynb   # Jupyter notebook with POC logic
│
├── terraform/
│   ├── aws_sagemaker.tf            # AWS SageMaker workspace
│   ├── azure_ai_foundry.tf         # Azure AI Foundry workspace
│   └── gcp_vertex_ai.tf            # GCP Vertex AI workspace
│
└── README.md                       # Documentation
```

---

## Architecture

- **Data Plane:** Each cloud vendor runs isolated VPCs for PHI compliance.  
- **Control Plane:** Centralized orchestration for model lifecycle, versioning, and workflow triggers.  
- **Agentic MLOps:** Models initiate downstream workflows automatically.  

---

## Notebook (POC Logic)

The notebook demonstrates:
- **Datasets:**  
  - Pima Indians Diabetes  
  - Wisconsin Breast Cancer  
  - Synthetic Mental Health survey data  
  - Synthetic Vision dataset  

- **Models:**  
  - Logistic Regression (Diabetes)  
  - Random Forest (Cancer)  
  - Logistic Regression/Transformer (Mental Health synthetic)  
  - CNN (Vision synthetic)  

- **Unified Risk Profile:** Aggregates predictions across categories into a single risk score.  
- **Workflow Trigger:** High-risk cases initiate simulated physician alerts.  

---

## Terraform IaC

### AWS (SageMaker AI)
- Creates a HIPAA-ready SageMaker domain.  
- Enforces IAM roles and isolated security groups.  

### Azure (AI Foundry)
- Provisions ML workspace with Key Vault encryption.  

### GCP (Vertex AI)
- Deploys Vertex AI Workbench instance with KMS encryption.  

**Security Features Across Clouds:**
- HIPAA-ready encryption (KMS/Key Vault).  
- Isolated VPCs for PHI.  
- IAM-based access control.  

---

## Evaluation Metrics

| Category        | Dataset              | Model Type         | Metrics (POC) |
|-----------------|----------------------|--------------------|---------------|
| Diabetes        | Pima Diabetes        | Logistic Regression| Accuracy, AUC |
| Cancer          | Wisconsin Cancer     | Random Forest      | F1, Recall    |
| Mental Health   | Synthetic Survey     | Logistic Regression/Transformer | Precision, Recall |
| Vision          | Synthetic Ophthalmology | CNN             | Accuracy, Sensitivity |

**Cross-Category Evaluation:**
- Unified Risk Score (weighted aggregation).  
- Workflow Efficiency (time-to-trigger vs manual).  
- Fairness Metrics (bias detection across demographics).  

---

## Setup Instructions

### 1. Notebook
- Install dependencies:
  ```bash
  pip install scikit-learn tensorflow pandas numpy
  ```
- Run the notebook:
  ```bash
  jupyter notebook notebooks/multi_diagnosis_poc.ipynb
  ```

### 2. Terraform
- Initialize Terraform in each cloud directory:
  ```bash
  cd terraform
  terraform init
  ```
- Apply configuration (example for AWS):
  ```bash
  terraform apply -var-file=aws.tfvars
  ```

---

## Quickstart: Deploy Across All Clouds

To deploy all three cloud environments in parallel:

```bash
# AWS
cd terraform
terraform apply -var-file=aws.tfvars -auto-approve

# Azure
terraform apply -var-file=azure.tfvars -auto-approve

# GCP
terraform apply -var-file=gcp.tfvars -auto-approve
```

> ⚠️ Ensure you have configured credentials for **AWS CLI**, **Azure CLI**, and **gcloud** before running these commands.

---

## Packaging
To create a zip file of the project:

```bash
zip -r unified_health_platform.zip unified-health-platform/
```

---

## Next Steps
- Extend synthetic datasets with realistic distributions.  
- Integrate workflow orchestration (e.g., Airflow, Azure ML Pipelines).  
- Add monitoring dashboards for fairness and bias detection.  

---

Perfect — let’s add **sample `tfvars` files** so your Quickstart is truly plug‑and‑play. These files hold environment‑specific variables like regions, encryption keys, and resource group names. Developers can fill in their own values before running `terraform apply`.

---

## 📂 Suggested `tfvars` Files

### `aws.tfvars`
```hcl
region          = "us-east-1"
sagemaker_role  = "arn:aws:iam::123456789012:role/SageMakerExecutionRole"
phi_sg_id       = "sg-0123456789abcdef0"
kms_key_id      = "arn:aws:kms:us-east-1:123456789012:key/abcd-1234-efgh-5678"
```

---

### `azure.tfvars`
```hcl
location              = "eastus"
resource_group_name   = "health-ai-rg"
workspace_name        = "health-ai-foundry"
key_vault_id          = "/subscriptions/xxxx/resourceGroups/health-ai-rg/providers/Microsoft.KeyVault/vaults/health-kv"
```

---

### `gcp.tfvars`
```hcl
project_id       = "health-ai-project"
location         = "us-central1"
machine_type     = "n1-standard-4"
kms_key_name     = "projects/health-ai-project/locations/us-central1/keyRings/phi-ring/cryptoKeys/phi-key"
```

---

## 🔧 How to Use

1. Place each file (`aws.tfvars`, `azure.tfvars`, `gcp.tfvars`) inside the `terraform/` directory.
2. Run Terraform with the appropriate file:
   ```bash
   terraform apply -var-file=aws.tfvars -auto-approve
   terraform apply -var-file=azure.tfvars -auto-approve
   terraform apply -var-file=gcp.tfvars -auto-approve
   ```
3. Update values with your own **account IDs, resource names, and encryption keys** before deployment.

---

## ⚠️ Notes
- These are **placeholders** — replace with your actual IAM roles, Key Vault IDs, and KMS keys.  
- Ensure your CLI tools (`aws`, `az`, `gcloud`) are authenticated before running.  
- Keep `tfvars` files secure; they may contain sensitive resource identifiers.  

---

