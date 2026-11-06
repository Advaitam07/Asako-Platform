# ASAKO Platform — Complete REST API Documentation & Specification

The ASAKO platform backend is architected with a modular, scalable REST API supporting 6 distinct roles: **Student**, **Institute**, **Company**, **Workshop Provider**, **Consumer**, and **System Admin**.

## Runtime and persistence

The API currently runs in one Express process and stores records in a local JSON file (`data/asako_db.json` by default). `ASAKO_DB_FILE` can select another persistent file path. This is not a PostgreSQL/SQLite integration and does not provide multi-process or multi-instance coordination. Do not horizontally scale this implementation or place its database on ephemeral storage.

Production requires a `JWT_SECRET` of at least 32 characters. On the first production start with a new database file, `ASAKO_ADMIN_EMAIL` and a 12-character-or-longer `ASAKO_ADMIN_PASSWORD` are required to create the initial administrator. Existing database contents are preserved. Resume uploads are local files in `uploads` and require persistent storage too.

Marketplace requests are enquiries/request records; the API does not process payments, issue downloads, or provide a checkout workflow.

---

## 1. Authentication & Security Architecture

### Base URL
`/api`

### Headers
| Header | Description |
|---|---|
| `Authorization` | `Bearer <JWT_TOKEN>` for authenticated endpoints |
| `Content-Type` | `application/json` (or `multipart/form-data` for file uploads) |
| `Accept` | `application/json` |

### Role Permissions Matrix
| Module | Student | Institute | Company | Provider | Consumer | Admin |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `POST /api/auth/register` | Public | Public | Public | Public | Public | Restricted |
| `POST /api/auth/login` | Yes | Yes | Yes | Yes | Yes | Yes |
| `/api/students/*` | Own Profile | Read Only | Candidates | No | No | Full |
| `/api/companies/*` | View Listings | No | Own Listings | No | No | Full |
| `/api/institutes/*` | Linkages | Own Institute | Partnerships | No | No | Full |
| `/api/providers/*` | Register WS | Host Alliance | Sponsor | Own WS | Attend | Full |
| `/api/consumers/*` | No | No | No | No | Own Profile | Full |
| `/api/opportunities/*` | Discover/Apply | View | Own CRUD | View | View | Moderate |
| `/api/workshops/*` | Discover/Enroll | Host | Sponsor | Own CRUD | Discover/Enroll | Moderate |
| `/api/marketplace/*` | Discover | View | Sponsor | Host Listing | Enquire/Order | Moderate |
| `/api/admin/*` | No | No | No | No | No | Root Authority |

---

## 2. API Endpoints Reference

### 2.1 Authentication (`/api/auth`)

#### `POST /api/auth/register`
Creates a new account and associated role profile.
- **Access**: Public (Admin registration is strictly rejected).
- **Request Body**:
  ```json
  {
    "email": "candidate@domain.com",
    "password": "SecurePassword123!",
    "role": "student | company | institute | provider | consumer",
    "fullName": "Alex Rivera",
    "organizationName": "Zurich Tech Institute"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "message": "Account created successfully",
    "token": "<JWT_TOKEN>",
    "user": {
      "id": "usr-student-...",
      "email": "candidate@domain.com",
      "role": "student",
      "status": "active",
      "name": "Alex Rivera",
      "organization": "Zurich Tech Institute"
    }
  }
  ```

#### `POST /api/auth/login`
Authenticates user credentials and returns session JWT.
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "alex.rivera@asako.student",
    "password": "StudentPass2026!"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "message": "Login successful",
    "token": "<JWT_TOKEN>",
    "user": { ... }
  }
  ```

#### `GET /api/auth/me`
Retrieves currently authenticated user and linked role profile.
- **Access**: Authenticated

#### `PUT /api/auth/update-password`
Changes account password after validating old password.
- **Access**: Authenticated

---

### 2.2 Student Backend (`/api/students`)

#### `GET /api/students/profile`
Fetches the logged-in student's full profile (education, skills, bio, resume).
- **Access**: Student or Admin

#### `PUT /api/students/profile`
Updates student profile fields.
- **Access**: Student (owns profile)

#### `GET /api/students/applications`
Lists all submitted applications with enriched company and listing details.
- **Access**: Student (strictly isolated to own submissions)

#### `GET /api/students/saved-opportunities`
Lists opportunities bookmarked by the student.

#### `POST /api/students/saved-opportunities`
Bookmarks an opportunity: `{ "opportunityId": "opp-1" }`.

#### `DELETE /api/students/saved-opportunities/:opportunityId`
Removes an opportunity from saved list.

#### `GET /api/students/workshops`
Lists workshops the student has enrolled in.

---

### 2.3 Company Backend (`/api/companies`)

#### `GET /api/companies/profile` & `PUT /api/companies/profile`
View and update enterprise profile and recruiter contacts.

#### `GET /api/companies/opportunities`
Lists opportunities published exclusively by this company.

#### `POST /api/companies/opportunities`
Publishes a new role (Internship, Full-time, Freelance, Part-time).
- **Request Body**:
  ```json
  {
    "title": "Cloud Infrastructure Engineer",
    "type": "Internship",
    "category": "Software Engineering",
    "compensation": "€4,500 / month",
    "description": "Building telemetry systems...",
    "requirements": ["Go / TypeScript"],
    "skills": ["Distributed Systems"],
    "isRemote": true
  }
  ```

#### `PUT /api/companies/opportunities/:id` & `DELETE /api/companies/opportunities/:id`
Modify or delete owned opportunity. (Enforces server-side company ownership).

#### `GET /api/companies/applications`
Returns all applications received across this company's listings.
*(Companies can never access applications submitted to other companies).*

#### `PUT /api/companies/applications/:id/status`
Updates candidate status:
- `Applied` | `Under Review` | `Shortlisted` | `Rejected` | `Selected`
- Creates a notification for the candidate.

---

### 2.4 Institute Backend (`/api/institutes`)

#### `GET /api/institutes/profile` & `PUT /api/institutes/profile`
Manage accreditation standing, contact dean, and campus metadata.

#### `GET /api/institutes/partnerships`
Lists structured corporate linkages and capstones.

#### `POST /api/institutes/partnerships`
Registers new enterprise linkage:
```json
{
  "partnerCompany": "Aethel Technology Labs",
  "initiative": "Distributed Telemetry Capstone",
  "studentsInvolved": 24,
  "term": "Fall 2026"
}
```

---

### 2.5 Workshop Provider Backend (`/api/providers`)

#### `GET /api/providers/profile` & `PUT /api/providers/profile`
Provider studio accreditation and instructor profiles.

#### `GET /api/providers/workshops` & `POST /api/providers/workshops`
Create, manage, and publish masterclasses with capacity limits.

#### `GET /api/providers/workshops/:id/attendees`
View full attendee roster for an owned workshop.

---

### 2.6 Opportunities Discovery (`/api/opportunities`)

#### `GET /api/opportunities`
Query filters: `search`, `category`, `type`, `isRemote`.

#### `POST /api/opportunities/:id/apply`
Submit application as authenticated student. Validates single submission per student.

---

### 2.7 Workshops Discovery (`/api/workshops`)

#### `GET /api/workshops`
Query filters: `search`, `category`, `level`, `format`.

#### `POST /api/workshops/:id/register`
Registers a participant and enforces workshop capacity in the running process.

---

### 2.8 Marketplace (`/api/marketplace`)

#### `GET /api/marketplace`
Browse digital kits, curriculums, and advisory offerings.

#### `POST /api/marketplace/:id/enquire`
Submits enquiry directly to listing creator and generates notification.

---

### 2.9 Governance & System Administration (`/api/admin`)
*Strictly restricted to `admin` role.*

#### `GET /api/admin/overview`
Platform-wide counts of users, listings, applications, and pending verifications.

#### `GET /api/admin/users`
List all users with roles and status.

#### `PUT /api/admin/users/:id/status`
Suspend or reactivate accounts. Automatically generates tamper-evident audit log.

#### `GET /api/admin/verifications`
Review submitted academic and corporate credentials.

#### `PUT /api/admin/verifications/:id`
Approve or reject accreditation request.

#### `GET /api/admin/audit-logs`
Full chronological trail of administrative actions.

---

### 2.10 File & Resume Uploads (`/api/uploads`)

#### `POST /api/uploads/resume`
- Multipart form field: `resume`
- Allowed types: `.pdf`, `.doc`, `.docx`, `.txt` (Max 5MB)
- Returns: `{ "url": "/api/files/<filename>", "originalName": "..." }`
- Automatically links to authenticated student profile.
