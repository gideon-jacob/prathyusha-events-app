# Gemini's Memory

This section contains facts that Gemini has been asked to remember across sessions.

- The user wants me to update the GEMINI.md file after each interaction to keep the knowledge base up-to-date.

# CloudFront Signed URLs

When generating signed URLs for CloudFront, the following should be considered:

- The `expireTime` parameter for `aws-cloudfront-sign`'s `getSignedUrl` function should be in milliseconds.
- The `privateKeyString` parameter should be used to pass the private key string, not `privateKey`.

# Update Event

The `PUT /events/:eventId` route is used to update an event.
- The request body can contain a `data` field with the event data in JSON format, an `image` file, or both. At least one of `data` or `image` must be present.
- The `image` field can be used to upload a new image for the event.
- The `updateEvent` service function handles the update logic.
- It can update any of the fields in the `events` table.
- When a new image is uploaded, the old image is deleted from S3.
- The service returns `{ success: true, eventId: string, message: string }`.

# Delete Event

The `DELETE /events/:eventId` route is used to delete an event.
- The `deleteEvent` service function handles the delete logic.
- It deletes the event from the `events` table.
- It also deletes the associated image from S3 if it exists.
- The service returns `{ success: true, message: string }`.

# Event Details Schema (for getEventById)

When returning details for a single event, the following schema should be used.

- `id`: string (UUID)
- `title`: string
- `description`: string
- `eventType`: string (formerly `event_type`)
- `date`: string (YYYY-MM-DD)
- `startTime`: string (H:MM AM/PM format, formerly `end_time` in HH:MM:SS)
- `endTime`: string (H:MM AM/PM format, formerly `end_time` in HH:MM:SS)
- `venue`: string
- `mode`: string
- `eligibility`: string
- `fee`: string
- `registrationLink`: string (formerly `registration_link`)
- `organizers`: array of objects with `orgName` and `parentOrgName`
- `contacts`: array of objects with `name`, `role`, and `phone`
- `imageUrl`: string (signed CloudFront URL, formerly `image_url`)
- `publisher`: object with `name` (from `fullname`) and `department` (Excluded for StudentService)

The following fields from the database should be excluded from the response:
- `publisher_id`
- `created_at`
- `updated_at`

# Get All Events Schema (for PublisherService getEvents)

When returning a list of all events for `PublisherService`, the following schema should be used for each event in the list.

- `id`: string (UUID)
- `title`: string
- `description`: string
- `date`: string (YYYY-MM-DD)
- `eventDepartment`: string (from the publisher's department)
- `eventType`: string
- `imageUrl`: string (signed CloudFront URL)

Events should be sorted in chronological order based on `date`, `start_time`, and `created_at` (like a social media feed).

# Get All Events Schema (for StudentService getEvents)

When returning a list of all events for `StudentService`, the following schema should be used for each event in the list.

- `imageUrl`: string
- `title`: string
- `description`: string
- `date`: string
- `startTime`: string
- `eventType`: string

# Get Publisher Profile

The `GET /profile` route in `src/routes/publisher.ts` is used to fetch the publisher's profile.
- It calls the `getProfile` service function in `src/services/publisher.service.ts`.
- The `getProfile` function has been implemented to fetch publisher details, past events, and upcoming events, using `userId` instead of `username`.
- The intended return schema for the profile data includes:
    - `user`: object with `username`, `role` (always "Publisher"), and `department`.
    - `pastEvents`: array of event objects, each with `imageUrl`, `title`, `date` (format "10 Jan, 2025"), and `eventType`.
    - `upcomingEvents`: array of event objects, with the same structure as `pastEvents`.

# Student Service

The `StudentService` in `src/services/student.service.ts` now includes the following functionalities:
- `getEvents(dept, type, name)`: Fetches a list of upcoming events. It supports filtering by department, event type, and name, and ensures only future events are returned. Event image URLs are signed. The output schema aligns with the "Get All Events Schema (for StudentService getEvents)" mentioned above.
- `getEventById(eventId)`: Retrieves a single event's details by its ID, similar to the `PublisherService`'s `getEventById` method. It signs the image URL and formats time fields. The output schema aligns with the "Event Details Schema" mentioned above.

# Event Utility Functions

The `src/utils/event.utils.ts` file contains common helper functions used across different services:
- `signUrl(url)`: Signs CloudFront URLs for secure, time-limited access.
- `formatTime(timeString)`: Formats time strings into a user-friendly "H:MM AM/PM" format.
- `formatDateToDDMonYYYY(dateString)`: Formats date strings into a user-friendly "DD Mon, YYYY" format.
