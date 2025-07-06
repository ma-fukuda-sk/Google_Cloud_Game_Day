# Cloud Run service
resource "google_cloud_run_v2_service" "service" {
  name     = "${var.app_name}-${var.environment}"
  location = var.region
  
  template {
    service_account = var.service_account_email
    
    scaling {
      min_instance_count = var.min_instances
      max_instance_count = var.max_instances
    }
    
    containers {
      # 初期デプロイ用の軽量イメージを使用（後でCI/CDで実際のイメージに更新）
      image = "gcr.io/cloudrun/hello"
      
      resources {
        limits = {
          cpu    = var.cpu
          memory = var.memory
        }
      }
      
      ports {
        container_port = 8080
      }
      
      env {
        name  = "GOOGLE_CLOUD_PROJECT_ID"
        value = var.project_id
      }
      
      env {
        name  = "GOOGLE_CLOUD_REGION"
        value = var.region
      }
      
      env {
        name  = "NODE_ENV"
        value = var.environment == "prod" ? "production" : "development"
      }
      
      env {
        name  = "ENVIRONMENT"
        value = var.environment
      }
      
      # Health check - Next.js起動時間を考慮して調整
      startup_probe {
        initial_delay_seconds = 10
        timeout_seconds       = 10
        period_seconds        = 5
        failure_threshold     = 10
        
        http_get {
          path = "/api/health"
          port = 8080
        }
      }
      
      liveness_probe {
        initial_delay_seconds = 30
        timeout_seconds       = 10
        period_seconds        = 30
        failure_threshold     = 3
        
        http_get {
          path = "/api/health"
          port = 8080
        }
      }
    }
  }
  
  traffic {
    percent = 100
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
  }

  # イメージの変更はCI/CDで管理するため、Terraformでは無視
  lifecycle {
    ignore_changes = [
      template[0].containers[0].image
    ]
  }
}

# IAM policy to allow public access
resource "google_cloud_run_service_iam_binding" "public_access" {
  location = google_cloud_run_v2_service.service.location
  service  = google_cloud_run_v2_service.service.name
  role     = "roles/run.invoker"
  
  members = [
    "allUsers"
  ]
}