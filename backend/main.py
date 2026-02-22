from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import scipy.integrate as integrate
from google import genai
import os

# [EXPLANATION] This file is the backend API using FastAPI.
# It handles HTTP requests, performs mathematical calculations,
# and connects to Google's Gemini AI to provide educational explanations.

# ==========================================
# CONFIGURATION IA
# ==========================================

API_KEY = "AIzaSyD-ncSlLGDb0kSERukNPSZU0cwMRSGNrdM" # ⚠️ Remplace par ta vraie clé

client = None
try:
    # [EXPLANATION] Initialize the Google Gemini AI client.
    # We use this client to generate the "Professor" explanations in the /compute endpoint.
    client = genai.Client(api_key=API_KEY)
    print("✅ IA Connectée (Modèle: gemini-3-flash)")
except Exception as e:
    print(f"⚠️ Erreur Client IA : {e}")

app = FastAPI()

# [EXPLANATION] Setup CORS (Cross-Origin Resource Sharing).
# This allows your frontend (likely running on a different port) to access this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class SignalRequest(BaseModel):
    expression: str
    t_start: float
    t_end: float

def get_signal_fn(expr: str):
    # [EXPLANATION] Security & Parsing:
    # This dictionary defines the ONLY functions allowed in the input string.
    # This prevents users from running malicious code (like deleting files) via the input.
    safe_dict = {
        'np': np, 'sin': np.sin, 'cos': np.cos, 'tan': np.tan, 
        'exp': np.exp, 'pi': np.pi, 'sqrt': np.sqrt, 'abs': np.abs,
        # Signal Processing specific functions defined using lambda (anonymous functions):
        'rect': lambda t: np.where(np.abs(t) <= 0.5, 1, 0),         # Rectangular pulse
        'tri': lambda t: np.where(np.abs(t) <= 1, 1 - np.abs(t), 0), # Triangular pulse
        'u': lambda t: np.where(t >= 0, 1, 0),                      # Unit step
        'ramp': lambda t: np.where(t >= 0, t, 0),                   # Ramp function
        'sinc': lambda t: np.sinc(t),                               # Sinc function
        'delta': lambda t, t0, w=0.03: np.where(np.abs(t - t0) < w, 1 / (2 * w), 0) # Approx. Dirac Delta
    }
    try:
        # [EXPLANATION] Safe Evaluation:
        # Evaluate the string using ONLY the safe_dict functions. 't' is passed as the variable.
        return lambda t: eval(expr, {"__builtins__": None}, {**safe_dict, 't': t})
    except:
        return None

def detect_signal_type(expr: str):
    """
    Détermine si le signal est Périodique ou Transitoire (Support Borné).
    Heuristique simple pour le TP.
    """
    # [EXPLANATION] Classification Logic:
    # We analyze the text of the function to guess if it repeats forever (Periodic)
    # or if it disappears after a while (Transient/Energy signal).
    expr_lower = expr.lower()
    # If it has sin/cos BUT NO decay terms (like exp, rect, etc.), it's likely Periodic (Power signal).
    if (('sin' in expr_lower or 'cos' in expr_lower) and 
        not ('exp' in expr_lower or 'rect' in expr_lower or 'tri' in expr_lower or 'sinc' in expr_lower)):
        return "periodic"
    return "transient"

@app.post("/compute")
async def compute_signal_metrics(req: SignalRequest):
    fn = get_signal_fn(req.expression)
    if not fn:
        raise HTTPException(status_code=400, detail="Expression invalide")

    # 1. Classification automatique
    sig_type = detect_signal_type(req.expression)

    # 2. Calculs Numériques de base (sur la fenêtre demandée)
    # [EXPLANATION] Numerical Integration:
    # We use 'quad' to calculate the area under the curve (integral) of the signal squared.
    # This gives us the Energy on the specific window [t_start, t_end].
    energy_window, _ = integrate.quad(lambda t: fn(t)**2, req.t_start, req.t_end, limit=100)
    duration = req.t_end - req.t_start
    power_window = energy_window / duration if duration > 0 else 0

    # 3. Application des Règles Théoriques
    final_energy = "∞"
    final_power = 0.0

    if sig_type == "periodic":
        # Périodique : E = Infini, P = Moyenne calculée
        final_energy = "∞" 
        final_power = round(float(power_window), 4)
    else:
        # Transitoire : E = Valeur calculée, P = 0
        final_energy = round(float(energy_window), 4)
        final_power = 0.0 # Théoriquement nul sur l'infini

    # 4. IA Gemini (Explications Expert avec Règles Strictes)
    ai_analysis = "Analyse indisponible."
    
    if client:
        try:
            # [EXPLANATION] AI Prompting:
            # We construct a detailed prompt for Gemini to act as a Professor.
            # We give it the math rules (Periodic = Infinite Energy) and ask for a proof.
            prompt = f"""
            Tu es un professeur expert en Traitement du Signal.
            CONTEXTE : Signal x(t) = {req.expression} sur [{req.t_start}, {req.t_end}].
            TYPE DÉTECTÉ : {sig_type.upper()}.
            
            RÈGLES STRICTES DE CLASSIFICATION :
            1. SI SIGNAL PÉRIODIQUE :
               - Énergie E = ∞ (Infinie).
               - Puissance Moyenne P = Constante finie (Calculée sur une période T).
               
            2. SI SIGNAL À SUPPORT BORNÉ (TRANSITOIRE) :
               - Énergie E = Finie (Intégrale du carré du signal).
               - Puissance Moyenne P = 0 (Car l'énergie est diluée sur un temps infini).
            
            TACHE :
            Rédige une démonstration mathématique qui prouve ces résultats.
            
            CONSIGNES FORMATAGE :
            - Utilise des symboles UNICODE (∫, ∞, π, ², →). PAS de LaTeX.
            
            STRUCTURE :
            1. CLASSIFICATION
               [Explique pourquoi c'est périodique ou borné]
            
            2. CALCUL DE L'ENERGIE (E)
               [Si périodique, écris direct E -> ∞]
               [Si borné, détaille l'intégrale]
            
            3. CALCUL DE LA PUISSANCE (P)
               [Si périodique, détaille le calcul sur T]
               [Si borné, explique pourquoi P -> 0]
            """
            
            response = client.models.generate_content(
                model="gemini-3-flash-preview",
                contents=prompt
            )
            ai_analysis = response.text
            
        except Exception as e:
            ai_analysis = f"⚠️ Erreur IA : {str(e)}"

    return {
        "energy": final_energy,   # Peut être un nombre ou "∞"
        "power": final_power,     # Peut être un nombre ou 0
        "ai_analysis": ai_analysis
    }

# ================================================================
# EXERCICE 2 — Endpoints Python
# Les calculs sont faits RÉELLEMENT en Python (NumPy),
# pas juste affichés — le frontend consomme ces résultats.
# ================================================================

# ── Fonctions signaux réutilisables ──
def _sgn(t):
    """Fonction signe"""
    return np.sign(t)

def _u(t):
    """Echelon unité"""
    return np.where(t >= 0, 1.0, 0.0)

def _u_from_sgn(t):
    """U(t) exprimé UNIQUEMENT via sgn(t) : U(t) = (1 + sgn(t)) / 2"""
    return (1 + _sgn(t)) / 2

def _rect(t):
    """Fonction porte"""
    return np.where(np.abs(t) <= 0.5, 1.0, 0.0)

def _rect2t_from_u(t):
    """Rect(2t) exprimé UNIQUEMENT via U(t) : Rect(2t) = U(t+1/4) - U(t-1/4)"""
    return _u(t + 0.25) - _u(t - 0.25)

def _delta_approx(t, t0, w=0.04):
    """Approximation de δ(t - t0)"""
    return np.where(np.abs(t - t0) < w, 1.0 / (2 * w), 0.0)

def _make_points(t_arr, values):
    """Convertit deux arrays NumPy en liste de {t, value} pour le frontend."""
    return [
        {"t": round(float(t_arr[i]), 4), "value": round(float(values[i]), 5)}
        for i in range(len(t_arr))
    ]


# ── Q1 : U(t) = f(sgn(t)) ──────────────────────────────────────

@app.get("/ex2/q1")
async def ex2_q1():
    """
    Calcule en Python :
      - sgn(t)
      - U(t) reconstruit via sgn(t) : U(t) = (1 + sgn(t)) / 2
    Retourne les points de tracé + formule vérifiée.
    """
    t = np.linspace(-3, 3, 800)

    sgn_values = _sgn(t)
    u_reconstructed = _u_from_sgn(t)

    # Vérification numérique
    checks = {
        "t=-1": {"sgn": float(_sgn(-1)), "u_reconstruit": float(_u_from_sgn(-1)), "attendu": 0.0},
        "t=0":  {"sgn": float(_sgn(0)),  "u_reconstruit": float(_u_from_sgn(0)),  "attendu": 0.5},
        "t=+1": {"sgn": float(_sgn(1)),  "u_reconstruit": float(_u_from_sgn(1)),  "attendu": 1.0},
    }

    return {
        "formula": "U(t) = (1 + sgn(t)) / 2",
        "sgn_points": _make_points(t, sgn_values),
        "u_points": _make_points(t, u_reconstructed),
        "verification": checks,
        "method": "python_numpy",
    }


# ── Q2 : Rect(2t) = f(U(t)) ────────────────────────────────────

@app.get("/ex2/q2")
async def ex2_q2():
    """
    Calcule en Python :
      - Rect(2t) directement
      - Rect(2t) reconstruit via U(t) : U(t+1/4) - U(t-1/4)
    Vérifie que les deux sont identiques.
    """
    t = np.linspace(-1, 1, 800)

    rect_direct = _rect(2 * t)
    rect_from_u = _rect2t_from_u(t)

    # Vérification : différence max entre les deux méthodes
    max_diff = float(np.max(np.abs(rect_direct - rect_from_u)))

    return {
        "formula": "Rect(2t) = U(t + 1/4) - U(t - 1/4)",
        "rect_direct_points": _make_points(t, rect_direct),
        "rect_from_u_points": _make_points(t, rect_from_u),
        "max_difference": max_diff,
        "identical": max_diff < 1e-10,
        "method": "python_numpy",
    }


# ── Q3 : Signaux avec Dirac (propriété de prélèvement) ─────────

class Ex2Q3Request(BaseModel):
    signal_id: str  # "x", "y", "z", "w"

@app.post("/ex2/q3")
async def ex2_q3(req: Ex2Q3Request):
    """
    Calcule en Python les 4 signaux de la question 3 :
      x(t) = (t²-2t+5)·δ(3-t)    → 8·δ(t-3)
      y(t) = (cos(πt)-t)·δ(1-t)  → -2·δ(t-1)
      z(t) = (2t-1)·δ(t-2)       → 3·δ(t-2)
      w(t) = Rect(t)*δ(t-2)      → Rect(t-2)  (convolution = glissement)

    Utilise la propriété de prélèvement : f(t)·δ(t-t₀) = f(t₀)·δ(t-t₀)
    """

    configs = {
        "x": {
            "t_range": (-1, 6),
            "t0": 3,
            "expr_text": "(t² - 2t + 5) · δ(3-t)",
            "compute": lambda t: (t**2 - 2*t + 5) * _delta_approx(t, 3),
            "f_at_t0": lambda: float((3**2) - 2*3 + 5),  # = 8
            "sifting_result": lambda val: f"{val} · δ(t - 3)",
        },
        "y": {
            "t_range": (-1, 4),
            "t0": 1,
            "expr_text": "(cos(πt) - t) · δ(1-t)",
            "compute": lambda t: (np.cos(np.pi * t) - t) * _delta_approx(t, 1),
            "f_at_t0": lambda: float(np.cos(np.pi * 1) - 1),  # = -2
            "sifting_result": lambda val: f"{val} · δ(t - 1)",
        },
        "z": {
            "t_range": (-1, 5),
            "t0": 2,
            "expr_text": "(2t - 1) · δ(t-2)",
            "compute": lambda t: (2*t - 1) * _delta_approx(t, 2),
            "f_at_t0": lambda: float(2*2 - 1),  # = 3
            "sifting_result": lambda val: f"{val} · δ(t - 2)",
        },
        "w": {
            "t_range": (-1, 5),
            "t0": 2,
            "expr_text": "Rect(t) ∗ δ(t-2)",
            "compute": lambda t: _rect(t - 2),  # convolution avec δ(t-2) = glissement
            "f_at_t0": None,  # pas de prélèvement, c'est une convolution
            "sifting_result": lambda val: "Rect(t - 2)",
        },
    }

    if req.signal_id not in configs:
        raise HTTPException(status_code=400, detail=f"Signal inconnu: {req.signal_id}. Valeurs: x, y, z, w")

    cfg = configs[req.signal_id]
    t = np.linspace(cfg["t_range"][0], cfg["t_range"][1], 1200)
    values = cfg["compute"](t)

    # Calcul de la valeur au point de prélèvement
    if cfg["f_at_t0"] is not None:
        f_val = cfg["f_at_t0"]()
        sifting = cfg["sifting_result"](f_val)
        method_used = "prélèvement (sifting)"
    else:
        f_val = None
        sifting = cfg["sifting_result"](None)
        method_used = "convolution (glissement temporel)"

    # Analyse IA si disponible
    ai_analysis = None
    if client:
        try:
            prompt = f"""Tu es un professeur expert en Traitement du Signal.
SIGNAL : {cfg["expr_text"]}
RÉSULTAT PAR PRÉLÈVEMENT : {sifting}

Explique brièvement (5-8 lignes max) la propriété de prélèvement du Dirac
utilisée ici et montre le calcul étape par étape.
Utilise des symboles UNICODE (∫, δ, π, →). PAS de LaTeX."""
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt
            )
            ai_analysis = response.text
        except Exception as e:
            ai_analysis = f"⚠️ Erreur IA : {str(e)}"

    return {
        "signal_id": req.signal_id,
        "expression": cfg["expr_text"],
        "points": _make_points(t, values),
        "t0": cfg["t0"],
        "f_at_t0": f_val,
        "sifting_result": sifting,
        "method": method_used,
        "computed_by": "python_numpy",
        "ai_analysis": ai_analysis,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)