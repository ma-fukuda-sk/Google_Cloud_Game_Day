output "database_id" {
  description = "The Firestore database ID"
  value       = google_firestore_database.database.name
}

output "database_location" {
  description = "The Firestore database location"
  value       = google_firestore_database.database.location_id
}