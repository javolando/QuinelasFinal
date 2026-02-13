# Guía de ejecución (ES)

## Requisitos
- Docker + Docker Compose (recomendado)  
  **o** Node 18+ y Python 3.11+ si quieres ejecutarlo en modo local.

---

## Opción A (recomendada): ejecutar con Docker Compose

1) Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
docker compose up --build
```

2) Abre el frontend:
- http://localhost:5173

3) API backend:
- http://localhost:8000/docs (Swagger)

### Cuenta de administrador (seed automática)
- Usuario: `admin`
- Contraseña: `Chocodonut22`

> El backend crea (si no existe) el admin al arrancar, usando `ADMIN_USERNAME` y `ADMIN_PASSWORD` del `docker-compose.yml`.

---

## Opción B: ejecutar en local (sin Docker)

### 1) MongoDB
- Arranca MongoDB en local en `mongodb://localhost:27017` (MongoDB Community o Docker).

### 2) Backend (FastAPI)
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
source .venv/bin/activate
pip install -r requirements.txt

export MONGO_URL="mongodb://localhost:27017"
export MONGO_DB="quiniela_pro"
export JWT_SECRET="CHANGE_ME_SUPER_SECRET"
export ADMIN_USERNAME="admin"
export ADMIN_PASSWORD="Chocodonut22"
export CORS_ORIGINS="http://localhost:5173"

uvicorn app.main:app --reload --port 8000
```

### 3) Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

---

## Flujo de uso recomendado

1) Entra con el admin → **Admin Panel**  
2) Crea una **Jornada oficial** (Quiniela/Quinigol) y rellena partidos  
3) Como usuario normal: **New Bet** → selecciona jornada → se autocompletan local/visitante → rellena pronósticos → guarda  
4) Cuando el admin introduce resultados y premios → se recalculan apuestas automáticamente  
5) **Friends** → añade amigos por email y mira el ranking por balance.

---

## Notas de seguridad (producción)
- Cambia `JWT_SECRET` por una clave fuerte.
- Configura `COOKIE_SECURE=true` detrás de HTTPS.
- Ajusta `CORS_ORIGINS` a tu dominio real.
