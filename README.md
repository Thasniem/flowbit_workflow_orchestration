# FlowBit Workflow Orchestration

FlowBit is a visual workflow orchestration platform powered by LangFlow agents and a modern Next.js frontend. It enables seamless execution of intelligent agents via manual trigger, webhooks, and cron schedules — with real-time streaming logs using Server-Sent Events (SSE).

## 🧠 Features

- 🧩 **Modular LangFlow Agent Integration**:
  - Email Parser Agent
  - PDF Parser Agent
  - JSON Parser Agent
  - Classifier Agent (Routes to appropriate downstream agent)
- ⚡ **Trigger Workflows** via:
  - Manual UI-based execution
  - Webhook endpoints
  - Scheduled cron jobs
- 📡 **Real-Time Streaming Logs** in UI using SSE
- 🧠 **Redis Memory** for context persistence
- 🐳 **Dockerized** development with isolated LangFlow + Redis environment

---

## 📁 Project Structure

```
flowbit-workflow-orchestration/
├── flows/                          # Auto-imported LangFlow workflows
├── app/
│   └── api/
│       ├── executions/            # API routes for execution start/stream
│       ├── triggers/              # Webhook & cron endpoints
│       └── integration-guide/     # Guide API endpoint
├── components/                    # React components (UI, modals)
├── hooks/                         # Custom React hooks
├── lib/
│   ├── cron.ts                    # Cron scheduling logic
│   └── utils.ts                   # Utility functions
├── styles/                        # Tailwind/global styles
├── public/                        # Static assets
├── Dockerfile                     # Docker setup for LangFlow
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/your-username/flowbit-workflow-orchestration.git
cd flowbit-workflow-orchestration
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start LangFlow + Redis via Docker
```bash
docker-compose up
```

LangFlow will:
- Auto-import workflows from `flows/`
- Store context in Redis
- Run on `http://localhost:7860`

### 4. Run Next.js frontend
```bash
npm run dev
```

Frontend runs at `http://localhost:3000`

---

## ⚙️ Trigger Types

| Type     | Description                     | Location                          |
|----------|----------------------------------|-----------------------------------|
| Manual   | Triggered via UI dashboard       | ExecutionDashboard.tsx            |
| Webhook  | External POST requests trigger   | `app/api/triggers/`               |
| Cron     | Scheduled job trigger (in-app)   | `lib/cron.ts`                     |

---

## 🧠 Agent Functions

- **Classifier Agent**: Detects input type & routes (Email, PDF, JSON)
- **Email Agent**: Parses plain/HTML email, extracts metadata + sender
- **PDF Agent**: Parses and extracts structured data from PDFs
- **JSON Agent**: Validates schema, detects anomalies, reformats input

---

## 🛠 Environment Variables

Create a `.env.local` file with:

```env
LANGFLOW_URL=http://localhost:7860
REDIS_URL=redis://localhost:6379
```

---

## 🐳 Docker Info

Dockerfile is preconfigured to run LangFlow with:

- Auto-import path: `LANGFLOW_DEFAULT_FLOWS_PATH=/app/flows`
- Redis for agent memory

Use `docker-compose` to bring up the stack.

---

## 📡 SSE Streaming Logs

Real-time agent output is streamed to the UI using Server-Sent Events.

See:
- `ExecutionDetailsModal.tsx`
- `app/api/executions/stream/route.ts`

---

## 🧪 Testing a Flow

1. Create a new flow visually in LangFlow
2. Export JSON to `/flows/`
3. Trigger via UI, webhook, or cron
4. Watch live logs in `ExecutionDetailsModal`

---

## 👥 Contributors

- **Thasniem Fathima J** – Project Owner

---

## 📜 License

MIT License
