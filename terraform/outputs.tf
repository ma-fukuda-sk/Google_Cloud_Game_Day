output "project_id" {
  description = "The Google Cloud project ID"
  value       = var.project_id
}

output "region" {
  description = "The Google Cloud region"
  value       = var.region
}

output "cloud_run_url" {
  description = "URL of the Cloud Run service"
  value       = module.cloud_run.service_url
}

output "cloud_run_service_name" {
  description = "Name of the Cloud Run service"
  value       = module.cloud_run.service_name
}

output "docker_repository" {
  description = "Docker repository URL"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker_repo.repository_id}"
}

output "firestore_database_id" {
  description = "Firestore database ID"
  value       = module.firestore.database_id
}

output "cloud_run_service_account_email" {
  description = "Email of the Cloud Run service account"
  value       = module.iam.cloud_run_service_account_email
}

output "cloud_build_service_account_email" {
  description = "Email of the Cloud Build service account"
  value       = module.iam.cloud_build_service_account_email
}

output "secret_manager_secret_id" {
  description = "Secret Manager secret ID for environment variables"
  value       = google_secret_manager_secret.env_vars.secret_id
}