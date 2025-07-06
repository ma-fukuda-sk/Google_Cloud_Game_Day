output "cloud_run_service_account_email" {
  description = "Email of the Cloud Run service account"
  value       = google_service_account.cloud_run_sa.email
}

output "cloud_build_service_account_email" {
  description = "Email of the default Cloud Build service account"
  value       = "${data.google_project.project.number}@cloudbuild.gserviceaccount.com"
}