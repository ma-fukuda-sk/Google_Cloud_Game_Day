# Create Firestore database
resource "google_firestore_database" "database" {
  name        = "(default)"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"

  # Enable delete protection
  delete_protection_state = "DELETE_PROTECTION_ENABLED"
}

# Create collections (indexes will be created automatically as needed)
# Note: Collections are created automatically when documents are added,
# but we can create indexes for better performance

# Index for Game Day events
resource "google_firestore_index" "gameday_events_index" {
  database = google_firestore_database.database.name

  collection = "gameday_events"

  fields {
    field_path = "status"
    order      = "ASCENDING"
  }

  fields {
    field_path = "created_at"
    order      = "DESCENDING"
  }

  depends_on = [google_firestore_database.database]
}

# Index for teams
resource "google_firestore_index" "teams_index" {
  database = google_firestore_database.database.name

  collection = "teams"

  fields {
    field_path = "gameday_id"
    order      = "ASCENDING"
  }

  fields {
    field_path = "created_at"
    order      = "ASCENDING"
  }

  depends_on = [google_firestore_database.database]
}

# Index for scores
resource "google_firestore_index" "scores_index" {
  database = google_firestore_database.database.name

  collection = "scores"

  fields {
    field_path = "team_id"
    order      = "ASCENDING"
  }

  fields {
    field_path = "timestamp"
    order      = "DESCENDING"
  }

  depends_on = [google_firestore_database.database]
}

# Index for scenarios
resource "google_firestore_index" "scenarios_index" {
  database = google_firestore_database.database.name

  collection = "scenarios"

  fields {
    field_path = "gameday_id"
    order      = "ASCENDING"
  }

  fields {
    field_path = "difficulty"
    order      = "ASCENDING"
  }

  depends_on = [google_firestore_database.database]
}