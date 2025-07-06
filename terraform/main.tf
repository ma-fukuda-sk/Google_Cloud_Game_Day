# Enable required APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "cloudbuild.googleapis.com",
    "run.googleapis.com",
    "firestore.googleapis.com",
    "secretmanager.googleapis.com",
    "artifactregistry.googleapis.com",
    "iam.googleapis.com",
    "cloudresourcemanager.googleapis.com"
  ])

  project = var.project_id
  service = each.value

  disable_dependent_services = true
  disable_on_destroy         = false
}

# Create Artifact Registry repository
resource "google_artifact_registry_repository" "docker_repo" {
  location      = var.region
  repository_id = "${var.app_name}-docker"
  description   = "Docker repository for ${var.app_name}"
  format        = "DOCKER"

  depends_on = [google_project_service.required_apis]
}

# IAM module
module "iam" {
  source = "./modules/iam"

  project_id = var.project_id
  app_name   = var.app_name
  environment = var.environment
  region     = var.region

  depends_on = [google_project_service.required_apis]
}

# Firestore module
module "firestore" {
  source = "./modules/firestore"

  project_id = var.project_id
  region     = var.region

  depends_on = [google_project_service.required_apis]
}

# Cloud Run module
module "cloud_run" {
  source = "./modules/cloud_run"

  project_id            = var.project_id
  region               = var.region
  app_name             = var.app_name
  environment          = var.environment
  service_account_email = module.iam.cloud_run_service_account_email
  docker_image         = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker_repo.repository_id}/${var.app_name}:latest"
  cpu                  = var.cloud_run_cpu
  memory               = var.cloud_run_memory
  min_instances        = var.cloud_run_min_instances
  max_instances        = var.cloud_run_max_instances

  depends_on = [google_project_service.required_apis]
}

# Cloud Build trigger - GitHub接続後に有効化
# Note: GitHub App接続が必要です。手動でCloud Buildコンソールから設定してください。
# resource "google_cloudbuild_trigger" "main_trigger" {
#   name        = "${var.app_name}-${var.environment}-trigger"
#   description = "Trigger for ${var.app_name} ${var.environment} environment"
# 
#   github {
#     owner = split("/", var.github_repo)[0]
#     name  = split("/", var.github_repo)[1]
#     push {
#       branch = var.github_branch
#     }
#   }
# 
#   filename = "cloudbuild.yaml"
# 
#   substitutions = {
#     _REGION           = var.region
#     _SERVICE_NAME     = module.cloud_run.service_name
#     _DOCKER_REPO      = google_artifact_registry_repository.docker_repo.repository_id
#     _ENVIRONMENT      = var.environment
#   }
# 
#   depends_on = [google_project_service.required_apis]
# }

# Secret Manager for environment variables
resource "google_secret_manager_secret" "env_vars" {
  secret_id = "${var.app_name}-${var.environment}-env"
  
  replication {
    auto {}
  }

  depends_on = [google_project_service.required_apis]
}

resource "google_secret_manager_secret_version" "env_vars_version" {
  secret = google_secret_manager_secret.env_vars.id
  secret_data = jsonencode({
    GOOGLE_CLOUD_PROJECT_ID = var.project_id
    GOOGLE_CLOUD_REGION     = var.region
    NODE_ENV                = var.environment == "prod" ? "production" : "development"
    FIREBASE_PROJECT_ID     = var.project_id
    ENVIRONMENT             = var.environment
  })
}

# IAM binding for Cloud Build to access Secret Manager
resource "google_secret_manager_secret_iam_binding" "cloud_build_secret_access" {
  secret_id = google_secret_manager_secret.env_vars.secret_id
  role      = "roles/secretmanager.secretAccessor"

  members = [
    "serviceAccount:${data.google_project.project.number}@cloudbuild.gserviceaccount.com"
  ]

  depends_on = [google_project_service.required_apis]
}

# Get project data to access project number
data "google_project" "project" {
  project_id = var.project_id
}