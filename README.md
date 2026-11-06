# ASAKO | Career & Learning Platform

**Connecting Learners, Employers, Institutions, and Opportunities.**

ASAKO is a career and learning platform designed to bring students, companies, educational institutions, workshop providers, and consumers together in one ecosystem.

The platform provides a public landing page and dedicated, role-based portals with workflows for opportunities, applications, workshops, marketplace listings, and administration.

---

## ✨ Features

- **Public Landing Page:** Explore platform pathways, information, and FAQs without signing in.
- **Multi-Role Authentication:** Registration and sign-in for students, companies, institutes, workshop providers, and consumers.
- **Role-Based Dashboards:** Dedicated dashboards and workflows for each account type.
- **Opportunity Management:** Browse opportunities, submit applications, and save listings.
- **Workshop Management:** Explore workshops and register for sessions.
- **Marketplace:** Browse listings and submit enquiries.
- **Admin Dashboard:** Manage users, verifications, and platform listings.
- **File Management:** Authenticated resume and file access.
- **Responsive Interface:** Modern React-based user interface.

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS 4 |
| Backend | Node.js, Express 4 |
| Authentication | JWT, bcrypt |
| Database | JSON-file persistence |
| Package Manager | npm |

## 📁 Project Structure

```text
asako/
├── data/
│   └── asako_db.json
├── public/
├── uploads/
├── server/
│   ├── db/
│   │   ├── database.ts
│   │   └── schema.sql
│   ├── lib/
│   │   └── serializers.ts
│   ├── middleware/
│   │   └── auth.ts
│   └── routes/
│       ├── admin.routes.ts
│       ├── auth.routes.ts
│       ├── companies.routes.ts
│       ├── consumers.routes.ts
│       ├── institutes.routes.ts
│       ├── marketplace.routes.ts
│       ├── notifications.routes.ts
│       ├── opportunities.routes.ts
│       ├── providers.routes.ts
│       ├── students.routes.ts
│       ├── uploads.routes.ts
│       └── workshops.routes.ts
├── src/
│   ├── components/
│   │   ├── screens/
│   │   ├── AsakoHero.tsx
│   │   ├── AsakoLogo.tsx
│   │   ├── AuthModal.tsx
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── OpportunityModal.tsx
│   │   └── WorkshopModal.tsx
│   ├── data/
│   ├── services/
│   ├── types/
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .env.example
├── .gitignore
├── API_DOCUMENTATION.md
├── DEPLOYMENT.md
├── index.html
├── package.json
├── package-lock.json
├── server.ts
├── tsconfig.json
└── vite.config.ts
```

## ⚙️ Requirements

Make sure you have the following installed:

- Node.js 20 or newer
- npm

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Advaitam07/Asako-Platform.git
cd Asako-Platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create your local environment file:

```powershell
Copy-Item .env.example .env
```

Update `.env` with the required configuration. Set a unique `JWT_SECRET` for local development.

### 4. Start the Development Server

```bash
npm run dev
```

The application will be available at:

**http://localhost:3000**

### 5. Check API Health

Open the following endpoint:

```text
http://localhost:3000/api/health
```

The first development startup creates the local JSON database and seeds demo accounts if the database file does not already exist.

## 🔐 Local Demo Accounts

The following accounts are seeded only when a new development database is created.

| Portal | Email | Password |
|---|---|---|
| Administrator | `admin@asako.global` | `AsakoAdmin2026!` |
| Student | `alex.rivera@asako.student` | `StudentPass2026!` |
| Company | `sarah.vance@aethel.com` | `CompanyPass2026!` |
| Institute | `marcus.weber@zurichtech.edu` | `InstitutePass2026!` |
| Workshop Provider | `elena@monolithdesign.org` | `ProviderPass2026!` |
| Consumer | `jordan.lee@domain.com` | `ConsumerPass2026!` |

**Note:** These are public development demo credentials. They are not production credentials. Demo accounts are blocked in production unless explicitly enabled.

## 📜 Available Commands

| Command | Description |
|---|---|
| `npm install` | Install project dependencies |
| `npm run dev` | Start the development server |
| `npm run lint` | Run the TypeScript check |
| `npm run build` | Build the production frontend |
| `npm start` | Start the Express server |
| `npm run preview` | Preview the Vite frontend build |

## 🏗️ Application Architecture

ASAKO uses a React frontend connected to an Express backend.

1. `src/main.tsx` mounts the React application.
2. `src/App.tsx` manages session state, navigation, and screen composition.
3. Components inside `src/components/` render the interface and role-specific dashboards.
4. `src/services/api.ts` handles frontend API communication.
5. `server.ts` configures Express, middleware, health checks, and API routes.
6. `server/routes/` contains the application API endpoints.
7. `server/db/database.ts` handles JSON database initialization, persistence, and queries.

In development, Express runs with Vite middleware. In production, Express serves the compiled frontend from the `dist/` directory.

## 🔧 Environment Configuration

The application uses environment variables for configuration.

| Variable | Description |
|---|---|
| `JWT_SECRET` | Required production authentication secret, at least 32 characters |
| `PORT` | Server port, defaults to `3000` |
| `NODE_ENV` | Application environment |
| `APP_URL` | Primary application URL |
| `CORS_ORIGINS` | Additional allowed browser origins |
| `ASAKO_DB_FILE` | Optional JSON database file path |
| `ASAKO_ADMIN_EMAIL` | Initial production administrator email |
| `ASAKO_ADMIN_PASSWORD` | Initial production administrator password |
| `ASAKO_ALLOW_DEMO_ACCOUNTS` | Optional demo-account configuration |

**Security:** Never commit `.env` files, production secrets, private credentials, or sensitive user data to GitHub.

## ☁️ Deployment & Storage Notes

The current implementation uses:

- A local JSON file for application records.
- Local filesystem storage for uploaded files.
- A single Express server process.

Both the database and uploaded files require persistent writable storage.

The application does not currently provide multi-process database locking or multi-instance coordination. Do not run multiple instances against the same JSON database file.

Default serverless deployments, including Vercel, do not provide the persistent local filesystem required by this architecture.

Before using a serverless platform, adapt the application to use a managed database and object storage for uploaded files.

For production deployment:

1. Configure persistent storage.
2. Set `NODE_ENV=production`.
3. Configure a unique `JWT_SECRET`.
4. Set `APP_URL` and required CORS origins.
5. Configure the initial administrator credentials for a new database.
6. Run the production build.
7. Start the Express server.
8. Back up the database and uploads regularly.

```bash
npm run lint
npm run build
npm start
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for additional deployment guidance.

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md)
- [REST API Documentation](./API_DOCUMENTATION.md)

## 🔒 Data Safety

- Do not publish `.env` files.
- Do not commit private production credentials.
- Do not publish real user database records.
- Keep uploaded user files private.
- Back up persistent application data before making changes.

## 📌 Project Status

ASAKO is an evolving career and learning platform. Features and workflows may continue to improve as development progresses.

---

**Built with React, TypeScript, Node.js, and Express.**

*ASAKO | Bringing Learning, Careers, and Opportunities Together.*
