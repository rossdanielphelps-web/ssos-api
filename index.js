import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

const { AIRTABLE_TOKEN, AIRTABLE_BASE } = process.env;
if (!AIRTABLE_TOKEN || !AIRTABLE_BASE) {
  console.error("Missing env vars AIRTABLE_TOKEN or AIRTABLE_BASE");
}

const AIRTABLE_API = `https://api.airtable.com/v0/${AIRTABLE_BASE}`;
const airtable = axios.create({
  baseURL: AIRTABLE_API,
  headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` }
});

// health
app.get("/", (_req, res) => res.send("SSOS API is live 🚀"));

// list projects
app.get("/api/projects", async (_req, res) => {
  try {
    const r = await airtable.get("/Projects", { params: { maxRecords: 100 } });
    res.json(r.data.records);
  } catch (e) {
    console.error(e.response?.data || e.message);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// create project
app.post("/api/projects", async (req, res) => {
  try {
    const payload = {
      fields: {
        "Name": req.body.name,
        "Project Code": req.body.code || "",
        "Organisation": req.body.organisation || "",
        "Status": req.body.status || "Discovery",
        "Notes": req.body.notes || ""
      }
    };
    const r = await airtable.post("/Projects", payload);
    res.json(r.data);
  } catch (e) {
    console.error(e.response?.data || e.message);
    res.status(500).json({ error: "Failed to create project" });
  }
});

// simple search helper
app.get("/api/search", async (req, res) => {
  const { tableName, field = "Name", q = "" } = req.query;
  try {
    const filterByFormula = `FIND(LOWER(\\"${q}\\"), LOWER({${field}}))`;
    const r = await airtable.get(`/${encodeURIComponent(tableName)}`, {
      params: { filterByFormula, maxRecords: 20 }
    });
    res.json(r.data.records);
  } catch (e) {
    console.error(e.response?.data || e.message);
    res.status(500).json({ error: "Search failed" });
  }
});

// create pre-sprint canvas
app.post("/api/canvas", async (req, res) => {
  try {
    const f = req.body || {};
    const toLinks = (ids=[]) => ids.filter(Boolean).map(id => ({ id }));
    const payload = {
      fields: {
        "Project": toLinks([f.projectId]),
        "Canvas Title": f.title || "",
        "Date": f.date || null,
        "Version": f.version || "",
        "Facilitator": toLinks([f.facilitatorId]),
        "Sponsor": toLinks([f.sponsorId]),
        "Team Present": toLinks(f.teamPresentIds || []),
        "Core Problem": f.coreProblem || "",
        "Why Now": f.whyNow || "",
        "First Things That Happen": f.firstThings || "",
        "Service Concludes When": f.concludesWhen || "",
        "Direct User Groups": toLinks(f.directUserGroupIds || []),
        "Indirect User Groups": toLinks(f.indirectUserGroupIds || []),
        "Time Horizon": f.timeHorizon || undefined
      }
    };
    const r = await airtable.post("/PreSprintCanvas", payload);
    res.json(r.data);
  } catch (e) {
    console.error(e.response?.data || e.message);
    res.status(500).json({ error: "Failed to create canvas" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on :${PORT}`));
