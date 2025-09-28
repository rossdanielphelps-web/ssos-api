
# SSOS API Starter (Render + Airtable)

Minimal Express API to connect to your Airtable base.

## 1) Prepare Airtable
- Create a **Personal Access Token** (Scopes: data.records:read, data.records:write).
- Note your **Base ID** (starts with `app...`).
- Ensure your tables exist (e.g., `Projects`, `PreSprintCanvas`).

## 2) Local test (optional)
```bash
npm install
AIRTABLE_TOKEN=pat_xxx AIRTABLE_BASE=appxxxx node index.js
```

## 3) Deploy to Render
1. Push this repo to GitHub.
2. In Render: New → Web Service → Connect repo.
3. Build: `npm install`
4. Start: `npm start`
5. Env vars:
   - `AIRTABLE_TOKEN` = your Airtable PAT
   - `AIRTABLE_BASE` = your Airtable Base ID

## 4) Endpoints
- `GET /api/projects` – list Projects
- `POST /api/projects` – create a Project
- `GET /api/search?tableName=Projects&field=Name&q=Aurora` – find IDs by name
- `POST /api/canvas` – create a Pre-Sprint Canvas (linked by record IDs)

## Notes
- Linked fields require Airtable **record IDs** (like `recXXX`). Use `/api/search` to find them.
- Free Render plan may spin down; first request wakes it up.
