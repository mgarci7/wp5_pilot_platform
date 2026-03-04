# What-If - WP5 Pilot Platform

Platform for integrating AI agents into simulated social media environments to support immersive user studies. A single human participant interacts with multiple AI agents in a chatroom, with agent behaviour driven by experimentally controlled treatment conditions.

**Status**: Under active development for WP5 pilot study by https://github.com/Rptkiddle

## STAGE Framework

The platform is powered by **STAGE** (**S**imulated **T**heater for **A**gent-**G**enerated **E**xperiments), a multi-agent framework that separates agent coordination from message generation duties:

- A **Director** (large general reasoning model) analyses the chatroom state and decides which agent should act, what action to take, and provides structured instructions.
- A **Performer** (smaller instruction fine-tuned model) generates the actual chatroom message from the Director's instructions.
- A **Moderator** (smaller general reasoning model) extracts clean message content from the Performer's raw output, handling cases where smaller Performer models include extraneous commentary or formatting. If extraction fails, the Performer is retried (up to 3 attempts).

This separation allows the Performer to be (instruction) fine-tuned for realistic online speech without compromising the Director's capacity for managing experimental conditions and multi-agent coordination. See the [backend documentation](./backend/README.md) for full details.

## Quick Start

### Backend
```bash
cd backend
pip install -e .
```

Then install the package(s) for the LLM provider(s) you want to use:

| Provider | Install command |
|---|---|
| Anthropic | `pip install anthropic` |
| Gemini | `pip install google-genai` |
| HuggingFace | `pip install huggingface_hub` |
| Mistral | `pip install mistralai` |
| Konstanz (vLLM) | `pip install openai` |
| Local model | `pip install torch transformers` |

Configure your chosen providers in [simulation_settings.toml](./backend/config/simulation_settings.toml), then copy [.env.example](./backend/.env.example) to `backend/.env` and fill in the API keys for the providers you are using.

Setup your experimental conditions in [experimental_settings.toml](./backend/config/experimental_settings.toml). See the file for detailed comments on each setting. Configure participant tokens (linked to treatment groups) in [participant_tokens.toml](./backend/config/participant_tokens.toml).

Setup the simulation settings in [simulation_settings.toml](./backend/config/simulation_settings.toml). See the file for detailed comments on each setting.

```bash
cp .env.example .env   # then edit .env with your keys
python main.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:300x (see reported link when starting front end) and use a token from [participant_tokens.toml](./backend/config/participant_tokens.toml) to log in. Tokens are configured by the researcher and can only be used once. Delete used_tokens.jsonl to reset tokens.


## Modo investigador (selección manual de tratamiento)

Este modo está pensado para pruebas internas (QA/research) y permite escoger manualmente uno de los grupos experimentales en el login del frontend.

> En producción, mantén este modo desactivado y usa tokens de participante de un solo uso.

### 1) Arranca backend con override habilitado

Linux/macOS (bash):
```bash
cd backend
cp .env.example .env   # si aún no existe
# edita .env y añade tus API keys
export ALLOW_TREATMENT_OVERRIDE=true
python main.py
```

Windows CMD / Anaconda Prompt:
```bat
cd backend
copy .env.example .env
REM edita .env y añade tus API keys
set ALLOW_TREATMENT_OVERRIDE=true
python main.py
```

PowerShell:
```powershell
cd backend
copy .env.example .env
# edita .env y añade tus API keys
$env:ALLOW_TREATMENT_OVERRIDE="true"
python main.py
```

### 2) Arranca frontend

```bash
cd frontend
npm install
npm run dev
```

Abre la URL que muestre Next.js (normalmente `http://localhost:3000`).

### 3) Entra en modo investigador desde la UI

1. Marca **Researcher test mode (manual treatment)** en la pantalla de login.
2. Elige el tratamiento en el desplegable (`low_*`, `medium_*`, `high_*`).
3. Pulsa **Join Chat**.

Si el backend no se lanzó con `ALLOW_TREATMENT_OVERRIDE=true`, el inicio de sesión manual fallará con error de configuración.

### 4) Probar múltiples tratamientos en una sola sesión de navegador

Dentro del chat puedes pulsar **Leave** para volver al login y entrar de nuevo con otro tratamiento, sin cerrar pestaña.

### 5) Diagnóstico rápido si “no responden” los agentes

- Revisa `backend/logs/<session_id>.json` y filtra eventos `turn_diagnostics`.
- Si aparecen `director_no_response` o `has_response=false` en performer/moderator, suele ser latencia/caída del proveedor LLM.
- Ajusta `llm_request_timeout_seconds` en `backend/config/simulation_settings.toml` para pruebas más rápidas.

## Project Structure

```
wp5_pilot_platform/
├── backend/          # FastAPI server
├── frontend/         # Next.js chat UI
└── README.md
```

## Documentation

- [Backend Documentation](./backend/README.md) 
- [Frontend Documentation](./frontend/README.md)
