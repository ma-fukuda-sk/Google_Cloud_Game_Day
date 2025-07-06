# GitHub接続が設定済みの場合のみトリガーを作成
# 使用方法: terraform apply -var="enable_github_trigger=true"

variable "enable_github_trigger" {
  description = "Enable GitHub trigger creation (requires manual GitHub App setup)"
  type        = bool
  default     = false
}

resource "google_cloudbuild_trigger" "main_trigger" {
  count = var.enable_github_trigger ? 1 : 0
  
  name        = "${var.app_name}-${var.environment}-trigger"
  description = "Trigger for ${var.app_name} ${var.environment} environment"

  github {
    owner = split("/", var.github_repo)[0]
    name  = split("/", var.github_repo)[1]
    push {
      branch = var.github_branch
    }
  }

  filename = "cloudbuild.yaml"

  substitutions = {
    _REGION           = var.region
    _SERVICE_NAME     = module.cloud_run.service_name
    _DOCKER_REPO      = google_artifact_registry_repository.docker_repo.repository_id
    _ENVIRONMENT      = var.environment
  }

  depends_on = [google_project_service.required_apis]
}

output "github_trigger_id" {
  description = "ID of the GitHub trigger (if created)"
  value       = var.enable_github_trigger ? google_cloudbuild_trigger.main_trigger[0].id : "Not created - enable_github_trigger=false"
}