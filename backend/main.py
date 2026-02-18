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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)