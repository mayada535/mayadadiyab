Server for accepting orders and optional OpenAI summarization

Prereqs
- Python 3.8+
- Create and activate a virtualenv in `server/` (recommended)

Install

```powershell
cd server
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

Configure
- Copy `.env.example` to `.env` and set values. If you want OpenAI summarization, set `OPENAI_API_KEY`.
- To enable email sending, set `SMTP_HOST`, `SMTP_USER`, and `SMTP_PASS` (and optionally `SMTP_PORT`, `SMTP_FROM`).

Run

```powershell
.\.venv\Scripts\python.exe app.py
# server runs on port 5000 by default
```

Endpoints
- `POST /api/summarize`  { text: string } -> { summary }
- `POST /api/orders`     { ...order payload... } -> { ok: true, emailed: bool }
