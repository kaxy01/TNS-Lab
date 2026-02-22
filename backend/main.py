from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import scipy.integrate as integrate
from google import genai
import os

# [EXPLANATION] This file is the backend API using FastAPI.
# It handles HTTP requests, performs mathematical calculations,
# and connects to Google's Gemini AI (with Groq fallback) for educational explanations.

# ==========================================
# CONFIGURATION IA — Gemini + Groq fallback
# ==========================================

GEMINI_KEY = "AIzaSyD-ncSlLGDb0kSERukNPSZU0cwMRSGNrdM"
GROQ_KEY   = "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"

# ── Gemini client ──
client = None
try:
    client = genai.Client(api_key=GEMINI_KEY)
    print("[OK] Gemini connecte")
except Exception as e:
    print(f"[WARN] Gemini non disponible : {e}")

# ── Groq client (fallback) ──
groq_client = None
try:
    from groq import Groq
    groq_client = Groq(api_key=GROQ_KEY)
    print("[OK] Groq connecte (fallback)")
except Exception as e:
    print(f"[WARN] Groq non disponible : {e}")

def ai_generate(prompt: str) -> str:
    """
    Tries Gemini first. On any error (rate limit, quota, etc.), falls back to Groq.
    Returns the generated text, or raises if both fail.
    """
    # ── Try Gemini ──
    if client:
        try:
            resp = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt
            )
            return resp.text.strip() if resp.text else ""
        except Exception as e:
            print(f"[WARN] Gemini echoue ({type(e).__name__}), bascule sur Groq...")

    # ── Fallback: Groq ──
    if groq_client:
        try:
            resp = groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1024,
            )
            return resp.choices[0].message.content.strip()
        except Exception as e:
            print(f"[WARN] Groq echoue aussi : {e}")

    raise RuntimeError("Aucun service IA disponible (Gemini et Groq ont echoue).")


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
            
            ai_analysis = ai_generate(prompt)
            
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
            ai_analysis = ai_generate(prompt)
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


# ================================================================
# EXERCICE 2 — Décomposition interactive de signaux
# L'utilisateur entre une fonction et choisit une base cible,
# Gemini dérive la formule décomposée.
# ================================================================

class DecomposeRequest(BaseModel):
    expression: str        # ex: "rect(2*t)", "u(t+1) - u(t-1)"
    target_basis: str      # "sgn", "u", "rect", "delta"

@app.post("/ex2/decompose")
async def ex2_decompose(req: DecomposeRequest):
    """
    Décompose une fonction en termes d'une base cible choisie par l'utilisateur.
    Utilise Gemini pour dériver la formule et NumPy pour la vérification numérique.
    """

    basis_names = {
        "sgn": "sgn(t) (fonction signe)",
        "u": "U(t) (échelon unité / Heaviside)",
        "rect": "Rect(t) (fonction porte)",
        "delta": "δ(t) (impulsion de Dirac)",
    }

    if req.target_basis not in basis_names:
        raise HTTPException(
            status_code=400,
            detail=f"Base cible inconnue: {req.target_basis}. Valeurs: {list(basis_names.keys())}"
        )

    # 1. Calculer le signal original numériquement
    fn = get_signal_fn(req.expression)
    if not fn:
        raise HTTPException(status_code=400, detail=f"Expression invalide: {req.expression}")

    t = np.linspace(-4, 4, 800)
    try:
        original_values = fn(t)
        original_points = _make_points(t, original_values)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erreur de calcul: {str(e)}")

    # 2. Demander à Gemini la décomposition
    decomposed_formula = None
    ai_explanation = "IA non disponible."

    if client:
        try:
            prompt = f"""Tu es un professeur expert en Traitement du Signal.

TÂCHE : Exprimer le signal x(t) = {req.expression} UNIQUEMENT en fonction de {basis_names[req.target_basis]}.

RÈGLES STRICTES :
1. Ta réponse DOIT commencer par la ligne "FORMULE: x(t) = ..." avec la formule décomposée exacte.
2. Ensuite, explique la dérivation étape par étape (5-10 lignes max).
3. Utilise des symboles UNICODE (∫, δ, π, →, ½, ¼). PAS de LaTeX.
4. Si la décomposition est impossible ou triviale, explique pourquoi.

RAPPELS UTILES :
- U(t) = ½(1 + sgn(t))
- sgn(t) = 2·U(t) - 1
- Rect(t) = U(t + ½) - U(t - ½)
- δ(t) = dU(t)/dt (dérivée de l'échelon)
- f(t)·δ(t - t₀) = f(t₀)·δ(t - t₀)  (prélèvement)

EXEMPLE :
  Entrée: x(t) = rect(2*t), base cible = U(t)
  FORMULE: x(t) = U(t + ¼) - U(t - ¼)
  Explication : Rect(t) = U(t+½) - U(t-½), donc Rect(2t) = U(2t+½) - U(2t-½) = U(t+¼) - U(t-¼)."""

            ai_text = ai_generate(prompt)

            # Extraire la formule de la première ligne
            for line in ai_text.split("\n"):
                line = line.strip()
                if line.upper().startswith("FORMULE"):
                    # Après "FORMULE:" ou "FORMULE :"
                    parts = line.split(":", 1)
                    if len(parts) > 1:
                        decomposed_formula = parts[1].strip()
                    break

            ai_explanation = ai_text

        except Exception as e:
            ai_explanation = f"⚠️ Erreur IA : {str(e)}"

    return {
        "expression": req.expression,
        "target_basis": req.target_basis,
        "target_basis_name": basis_names[req.target_basis],
        "original_points": original_points,
        "decomposed_formula": decomposed_formula,
        "ai_explanation": ai_explanation,
        "computed_by": "gemini + python_numpy",
    }


# ================================================================
# SIGNAL LAB — Démonstration mathématique (énergie/puissance)
# ================================================================

class LabDemoRequest(BaseModel):
    expression: str        # e.g. "rect(2*t)", "sin(t) + u(t)"

@app.post("/ex-lab/demo")
async def ex_lab_demo(req: LabDemoRequest):
    """
    Génère une démonstration mathématique complète pour le calcul
    de l'énergie, la puissance, et (si applicable) la fréquence.
    Inclut aussi les reformulations possibles dans chaque base.
    """
    expr = req.expression.strip()
    if not expr:
        return {"error": "Expression vide."}

    # ----- Calcul numérique via numpy -----
    import math
    t = np.linspace(-10, 10, 10000)
    dt = t[1] - t[0]

    safe_ns = {
        "t": t, "np": np, "pi": np.pi,
        "sin": np.sin, "cos": np.cos, "exp": np.exp,
        "abs": np.abs, "sqrt": np.sqrt, "log": np.log,
        "u": lambda x: np.heaviside(x, 0.5),
        "sgn": lambda x: np.sign(x),
        "rect": lambda x: np.where(np.abs(x) <= 0.5, 1.0, 0.0),
        "tri": lambda x: np.where(np.abs(x) <= 1, 1 - np.abs(x), 0.0),
        "delta": lambda x: np.where(np.abs(x) < dt, 1.0 / dt, 0.0),
        "pow": np.power,
    }

    try:
        y = eval(expr, {"__builtins__": {}}, safe_ns)
        if isinstance(y, (int, float)):
            y = np.full_like(t, float(y))
    except Exception as e:
        return {"error": f"Erreur d'évaluation: {e}"}

    # ── 2. Detect periodicity via autocorrelation ────────────────
    frequency = None
    period = None
    is_periodic = False
    try:
        y_centered = y - np.mean(y)
        corr = np.correlate(y_centered, y_centered, mode="full")
        corr = corr[len(corr) // 2:]
        if corr[0] > 0:
            corr = corr / corr[0]
            for i in range(1, len(corr) - 1):
                if corr[i] > corr[i - 1] and corr[i] > corr[i + 1] and corr[i] > 0.5:
                    period = float(i * dt)
                    frequency = float(1.0 / period)
                    is_periodic = True
                    break
    except Exception:
        pass

    # ── 3. Apply Theoretical Rules ──────────────────────────────
    energy_window = float(np.trapezoid(np.abs(y) ** 2, t))
    T_range = t[-1] - t[0]
    power_window = energy_window / T_range

    sig_type = "periodic" if is_periodic else "transient"

    if sig_type == "periodic" and period:
        # Periodic: E = ∞, P = average over one period
        t_period = np.linspace(0, period, 2000)
        safe_ns_period = {**safe_ns, "t": t_period}
        try:
            y_period = eval(expr, {"__builtins__": {}}, safe_ns_period)
            if isinstance(y_period, (int, float)):
                y_period = np.full_like(t_period, float(y_period))
            final_power = round(float(np.trapezoid(np.abs(y_period) ** 2, t_period) / period), 6)
        except Exception:
            final_power = round(float(power_window), 6)
        final_energy = "inf"  # Théoriquement infini
    else:
        # Transient: E = finite value, P = 0
        final_energy = round(float(energy_window), 6)
        final_power = 0.0

    # Signal points for chart
    t_chart = np.linspace(-5, 5, 500)
    safe_ns_chart = {**safe_ns, "t": t_chart}
    try:
        y_chart = eval(expr, {"__builtins__": {}}, safe_ns_chart)
        if isinstance(y_chart, (int, float)):
            y_chart = np.full_like(t_chart, float(y_chart))
    except Exception:
        y_chart = np.zeros_like(t_chart)

    chart_points = [{"t": round(float(tv), 3), "y": round(float(yv), 4)}
                    for tv, yv in zip(t_chart[::2], y_chart[::2])]

    # Display strings for prompt
    energy_display = "∞ (signal periodique)" if sig_type == "periodic" else f"{final_energy}"
    power_display = f"{final_power}" if sig_type == "periodic" else "0 (signal transitoire)"

    # ----- AI demonstration -----
    ai_demo = ""
    reformulations = {}
    if client:
        demo_prompt = f"""Tu es un professeur de traitement du signal. L'etudiant a construit le signal :
x(t) = {expr}

Resultats numeriques :
- Type : {"Periodique" if sig_type == "periodic" else "Transitoire (energie finie)"}
- Energie E = {energy_display}
- Puissance P = {power_display}
{"- Periode T0 = " + f"{period:.4f}" + " -> f0 = " + f"{frequency:.4f} Hz" if is_periodic else "- Signal aperiodique"}

RAPPELS THEORIQUES IMPORTANTS :
- Signal periodique : E = Infini (integrale de |x(t)|^2 sur R diverge), P = (1/T0) * integrale_0^T0 |x(t)|^2 dt > 0
- Signal transitoire (energie finie) : E = integrale_-inf^+inf |x(t)|^2 dt < Infini, P = 0
- Un signal ne peut PAS avoir a la fois E finie et P > 0

TACHE :
1. Explique la nature du signal (periodique ou transitoire, 2-3 lignes).
2. Montre le calcul DETAILLE de l'energie etape par etape (integrale, bornes, resolution).
   - Si periodique : montre que l'integrale diverge donc E = Infini.
   - Si transitoire : calcule la valeur finie.
3. Montre le calcul de la puissance.
   - Si periodique : P = (1/T0) * integrale sur une periode.
   - Si transitoire : explique P = lim(T->inf) E/T = 0.
{f"4. Explique pourquoi le signal est periodique et donne T0 et f0." if is_periodic else "4. Explique pourquoi le signal est aperiodique/a energie finie."}

REGLES :
- Utilise UNICODE (integrale, delta, pi, carre, 1/2, fleche, <=, >=, infini). PAS de LaTeX.
- Sois rigoureux mais clair.
- Formate avec des sections bien separees.
- Maximum 30 lignes."""

        try:
            ai_demo = ai_generate(demo_prompt)
        except Exception as e:
            ai_demo = f"Erreur IA: {e}"

        # ── Second AI call: structured reformulations ──
        try:
            reform_prompt = f"""Analyse le signal x(t) = {expr}

Pour CHAQUE fonction de base ci-dessous, indique si x(t) peut etre reecrit en termes de cette fonction.
Reponds EXACTEMENT dans ce format (une ligne par fonction, pas de texte avant ni apres) :

U(t)|OUI ou NON|formule equivalente ou "impossible"|explication courte
sgn(t)|OUI ou NON|formule equivalente ou "impossible"|explication courte
Rect(t)|OUI ou NON|formule equivalente ou "impossible"|explication courte
delta(t)|OUI ou NON|formule equivalente ou "impossible"|explication courte
tri(t)|OUI ou NON|formule equivalente ou "impossible"|explication courte

Rappels des relations :
- U(t) = (1 + sgn(t)) / 2
- sgn(t) = 2*U(t) - 1
- Rect(t) = U(t + 1/2) - U(t - 1/2)
- d/dt[U(t)] = delta(t)
- tri(t) = Rect(t) * Rect(t) (convolution)

IMPORTANT: Utilise UNICODE (pas de LaTeX). Reponds UNIQUEMENT les 5 lignes au format demande."""

            reform_text = ai_generate(reform_prompt)
            for line in reform_text.split("\n"):
                line = line.strip()
                if "|" not in line:
                    continue
                parts = [p.strip() for p in line.split("|")]
                if len(parts) >= 4:
                    basis = parts[0]
                    possible = parts[1].upper().startswith("OUI")
                    formula = parts[2] if possible else None
                    explanation = parts[3]
                    reformulations[basis] = {
                        "possible": possible,
                        "formula": formula,
                        "explanation": explanation,
                    }
        except Exception:
            # Fallback: basic reformulations
            for basis_name in ["U(t)", "sgn(t)", "Rect(t)", "delta(t)", "tri(t)"]:
                reformulations[basis_name] = {
                    "possible": False,
                    "formula": None,
                    "explanation": "Analyse non disponible",
                }

    return {
        "expression": expr,
        "energy": final_energy,
        "power": final_power,
        "is_periodic": is_periodic,
        "period": round(period, 6) if period else None,
        "frequency": round(frequency, 6) if frequency else None,
        "sig_type": sig_type,
        "chart_points": chart_points,
        "ai_demo": ai_demo,
        "reformulations": reformulations,
    }


# ================================================================

class RunPythonRequest(BaseModel):
    code: str

@app.post("/run-python")
async def run_python(req: RunPythonRequest):
    """
    Exécute un snippet Python dans un environnement restreint.
    Seules les fonctions mathématiques/numpy sont autorisées.
    Retourne stdout et les éventuelles erreurs.
    """
    import io
    import contextlib
    import math

    stdout_capture = io.StringIO()

    safe_builtins = {
        "print": print,
        "range": range,
        "len": len,
        "int": int,
        "float": float,
        "str": str,
        "list": list,
        "tuple": tuple,
        "dict": dict,
        "abs": abs,
        "round": round,
        "min": min,
        "max": max,
        "sum": sum,
        "enumerate": enumerate,
        "zip": zip,
        "map": map,
        "filter": filter,
        "sorted": sorted,
        "reversed": reversed,
        "isinstance": isinstance,
        "type": type,
        "True": True,
        "False": False,
        "None": None,
    }

    safe_globals = {
        "__builtins__": safe_builtins,
        "np": np,
        "numpy": np,
        "math": math,
    }

    try:
        with contextlib.redirect_stdout(stdout_capture):
            exec(req.code, safe_globals)
        return {"output": stdout_capture.getvalue(), "error": None}
    except Exception as e:
        return {"output": stdout_capture.getvalue(), "error": f"{type(e).__name__}: {str(e)}"}


# ================================================================
# QUIZ ENDPOINTS
# ================================================================

import uuid as _uuid

QUIZ_STORE: dict = {}  # in-memory session store

QUIZ_TEMPLATES = [
    {"fn": "rect",  "amp": 1, "scale": 1,   "label": "rect(t)"},
    {"fn": "rect",  "amp": 1, "scale": 2,   "label": "rect(2*t)"},
    {"fn": "rect",  "amp": 2, "scale": 1,   "label": "2*rect(t)"},
    {"fn": "tri",   "amp": 1, "scale": 1,   "label": "tri(t)"},
    {"fn": "tri",   "amp": 1, "scale": 2,   "label": "tri(2*t)"},
    {"fn": "sin",   "amp": 1, "scale": 1,   "label": "sin(t)"},
    {"fn": "sin",   "amp": 1, "scale": 2,   "label": "sin(2*t)"},
    {"fn": "cos",   "amp": 1, "scale": 1,   "label": "cos(t)"},
    {"fn": "cos",   "amp": 2, "scale": 2,   "label": "2*cos(2*t)"},
    {"fn": "u",     "amp": 1, "scale": 1,   "label": "u(t)"},
    {"fn": "sgn",   "amp": 1, "scale": 1,   "label": "sgn(t)"},
    {"fn": "exp",   "amp": 1, "scale": 1,   "label": "exp(-abs(t))"},
    {"fn": "exp",   "amp": 2, "scale": 2,   "label": "2*exp(-abs(2*t))"},
]

def _quiz_expr(tmpl: dict) -> str:
    fn, amp, sc = tmpl["fn"], tmpl["amp"], tmpl["scale"]
    inner = f"{sc}*t" if sc != 1 else "t"
    call = f"exp(-abs({inner}))" if fn == "exp" else f"{fn}({inner})"
    return f"{amp}*{call}" if amp != 1 else call

@app.post("/ex-lab/quiz")
async def ex_lab_quiz():
    import random
    tmpl = random.choice(QUIZ_TEMPLATES)
    expr = _quiz_expr(tmpl)
    t_arr = np.linspace(-5, 5, 600)
    safe_ns = {
        "t": t_arr, "np": np, "pi": np.pi,
        "sin": np.sin, "cos": np.cos, "exp": np.exp, "abs": np.abs,
        "u": lambda x: np.heaviside(x, 0.5),
        "sgn": lambda x: np.sign(x),
        "rect": lambda x: np.where(np.abs(x) <= 0.5, 1.0, 0.0),
        "tri": lambda x: np.where(np.abs(x) <= 1, 1 - np.abs(x), 0.0),
    }
    try:
        y = eval(expr, {"__builtins__": {}}, safe_ns)
        if isinstance(y, (int, float)):
            y = np.full_like(t_arr, float(y))
    except Exception as e:
        return {"error": f"Erreur de génération: {e}"}

    quiz_id = str(_uuid.uuid4())
    QUIZ_STORE[quiz_id] = {
        "fn": tmpl["fn"], "amplitude": float(tmpl["amp"]),
        "frequency": float(tmpl["scale"]), "label": tmpl["label"], "expr": expr,
    }
    return {
        "id": quiz_id,
        "display_expr": expr,
        "chart_points": [
            {"t": round(float(t_arr[i]), 3), "y": round(float(y[i]), 4)}
            for i in range(len(t_arr))
        ],
    }


class QuizCheckRequest(BaseModel):
    id: str
    answer_fn: str
    answer_amplitude: float
    answer_frequency: float

@app.post("/ex-lab/quiz/check")
async def ex_lab_quiz_check(req: QuizCheckRequest):
    session = QUIZ_STORE.get(req.id)
    if not session:
        return {"error": "Session expirée. Génère un nouveau signal."}

    ok_fn   = session["fn"] == req.answer_fn.strip()
    ok_amp  = abs(session["amplitude"] - req.answer_amplitude) < 0.35
    ok_freq = abs(session["frequency"]  - req.answer_frequency) < 0.45
    correct = ok_fn and ok_amp and ok_freq

    score = (50 if ok_fn else 0) + (25 if ok_amp else 0) + (25 if ok_freq else 0)

    explanation = ""
    try:
        prompt = (
            f"Quiz de traitement du signal.\n"
            f"Signal myst\u00e8re : x(t) = {session['label']}\n"
            f"R\u00e9ponse \u00e9tudiant : {req.answer_fn}(t), amplitude={req.answer_amplitude}, \u00e9chelle={req.answer_frequency}\n"
            f"Score : {score}/100 ({'CORRECT' if correct else 'INCORRECT'})\n"
            f"D\u00e9tail : fonction={'OK' if ok_fn else 'FAUX'}, amplitude={'OK' if ok_amp else 'FAUX'}, \u00e9chelle={'OK' if ok_freq else 'FAUX'}\n\n"
            "En 5-8 lignes, explique p\u00e9dagogiquement :\n"
            "- Si correct : confirme et rappelle les propri\u00e9t\u00e9s cl\u00e9s du signal.\n"
            f"- Si incorrect : explique ce qui est faux et comment reconna\u00eetre {session['label']} (forme, sym\u00e9trie, dur\u00e9e).\n"
            "Ton encourageant. UNICODE uniquement."
        )
        explanation = ai_generate(prompt)
    except Exception:
        explanation = "Explication IA non disponible."

    return {
        "correct": correct,
        "score": score,
        "correct_answer": session["label"],
        "details": {"fn": ok_fn, "amplitude": ok_amp, "frequency": ok_freq},
        "explanation": explanation,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)