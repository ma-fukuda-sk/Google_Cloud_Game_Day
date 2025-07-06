variable "project_id" {
  description = "The Google Cloud project ID"
  type        = string
}

variable "region" {
  description = "The Google Cloud region"
  type        = string
  default     = "asia-northeast1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "gameday-console"
}

variable "github_repo" {
  description = "GitHub repository in format owner/repo"
  type        = string
  default     = "ma-fukuda-sk/Google_Cloud_Game_Day"
}

variable "github_branch" {
  description = "GitHub branch for Cloud Build trigger"
  type        = string
  default     = "main"
}

variable "cloud_run_cpu" {
  description = "CPU allocation for Cloud Run"
  type        = string
  default     = "1000m"
}

variable "cloud_run_memory" {
  description = "Memory allocation for Cloud Run"
  type        = string
  default     = "512Mi"
}

variable "cloud_run_min_instances" {
  description = "Minimum instances for Cloud Run"
  type        = number
  default     = 0
}

variable "cloud_run_max_instances" {
  description = "Maximum instances for Cloud Run"
  type        = number
  default     = 10
}