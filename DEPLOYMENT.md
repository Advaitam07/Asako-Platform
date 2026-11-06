# ASAKO deployment guide

ASAKO is a Node.js/Express application that serves the React client and its REST API from one process.

## Requirements

- Node.js 20 or newer
- npm
- A persistent writable filesystem for the JSON database and uploaded resumes

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `JWT_SECRET` to a unique random value.
3. Run `npm run lint` and `npm run build`.
4. Start the application with `npm run dev`. The app and API are available at `http://localhost:3000`.

The development server loads the existing data from `data/asako_db.json` when present. Do not remove or replace that file to reset development data.

## Configuration

| Variable | Required | Purpose |
|---|---|---|
| `JWT_SECRET` | Production | JWT signing secret; production requires at least 32 characters. |
| `PORT` | No | HTTP port; defaults to `3000`. |
| `NODE_ENV` | No | Set to `production` for a production deployment. |
| `APP_URL` | Production | Primary allowed browser origin, for example `https://asako.example`. |
| `CORS_ORIGINS` | No | Comma-separated additional allowed origins. |
| `ASAKO_DB_FILE` | No | Database JSON file path; defaults to `data/asako_db.json` under the process working directory. |
| `ASAKO_ADMIN_EMAIL` | First production boot | Email for the first administrator when creating a new production database. |
| `ASAKO_ADMIN_PASSWORD` | First production boot | Initial administrator password; must be at least 12 characters. |
| `ASAKO_ALLOW_DEMO_ACCOUNTS` | No | Set to `true` only for an explicitly intended production demo. Demo accounts are otherwise blocked in production. |

Use a secret manager for production values. Do not commit `.env` files or real credentials.

## Data and deployment limits

The current persistence layer is a local JSON file, not PostgreSQL or SQLite. It is intended for a single application process on a persistent disk. It does not provide database-server durability, cross-process locking, horizontal scaling, or multi-instance coordination. Do not deploy multiple instances against the same JSON file or use ephemeral storage for a production database.

Resume uploads are stored under the local `uploads` directory. Back up that directory together with the database, and keep it on persistent storage. Resume access is authenticated and limited to the owner and the company associated with an application.

The first production boot creates an administrator only when the configured database file does not exist. Keep the database and upload files between deployments. If a database file already exists, first-admin bootstrap settings do not replace or reset its contents.

## Production checklist

- Build with `npm run build` and run with `NODE_ENV=production npm start`.
- Set a unique `JWT_SECRET` with at least 32 characters.
- Set `APP_URL` and any required `CORS_ORIGINS`.
- Configure `ASAKO_ADMIN_EMAIL` and a unique `ASAKO_ADMIN_PASSWORD` for first initialization.
- Attach persistent storage for the configured database file and `uploads` directory.
- Run one application process/instance.
- Keep backups and test recovery before handling real user data.

The current local-file storage architecture is not suitable for stateless platforms or multi-instance deployments. A database adapter and migration strategy are required before moving to those environments.
