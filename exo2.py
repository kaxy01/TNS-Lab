import numpy as np
import tkinter as tk
from tkinter import ttk
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from matplotlib.figure import Figure

def sinc(x):
    """Normalized sinc function: sin(pi*x)/(pi*x)"""
    return np.sinc(x)

def tri(t):
    """Triangle function"""
    return np.where(np.abs(t) <= 1, 1 - np.abs(t), 0.0)

def rect(t):
    """Rectangle function"""
    return np.where(np.abs(t) <= 0.5, 1.0, 0.0)

# Dictionary defining the signals and their theoretical Fourier Transforms
SIGNALS = {
    "x(t) = cos(6πt)": {
        "time": lambda t: np.cos(6 * np.pi * t),
        "amp": lambda f: np.where(np.isclose(np.abs(f), 3, atol=0.05), 0.5, 0.0),
        "phase": lambda f: np.zeros_like(f),
        "desc": "TF: Impulsions de Dirac en f = -3 et f = 3 (Amplitude 0.5).\nPropriété: Modulation / Formule d'Euler."
    },
    "x1(t) = Tri(2t)": {
        "time": lambda t: tri(2 * t),
        "amp": lambda f: 0.5 * (sinc(f / 2)**2),
        "phase": lambda f: np.zeros_like(f),
        "desc": "TF: (1/2) * sinc²(f/2).\nPropriété: Changement d'échelle (a=2)."
    },
    "x2(t) = Rect((t-1)/2) - Rect((t+1)/2)": {
        "time": lambda t: rect((t - 1) / 2) - rect((t + 1) / 2),
        "amp": lambda f: np.abs(-4 * np.sin(2 * np.pi * f) * sinc(2 * f)),
        "phase": lambda f: np.piecewise(
            f, 
            [-4 * np.sin(2 * np.pi * f) * sinc(2 * f) > 1e-4, 
             -4 * np.sin(2 * np.pi * f) * sinc(2 * f) < -1e-4], 
            [np.pi/2, -np.pi/2, 0]
        ),
        "desc": "TF: -4j * sin(2πf) * sinc(2f).\nPropriétés: Linéarité, Changement d'échelle, Décalage temporel."
    },
    "x3(t) = Tri(t-1) - Tri(t+1)": {
        "time": lambda t: tri(t - 1) - tri(t + 1),
        "amp": lambda f: np.abs(-2 * np.sin(2 * np.pi * f) * (sinc(f)**2)),
        "phase": lambda f: np.piecewise(
            f, 
            [-2 * np.sin(2 * np.pi * f) * (sinc(f)**2) > 1e-4, 
             -2 * np.sin(2 * np.pi * f) * (sinc(f)**2) < -1e-4], 
            [np.pi/2, -np.pi/2, 0]
        ),
        "desc": "TF: -2j * sin(2πf) * sinc²(f).\nPropriétés: Linéarité, Décalage temporel."
    },
    "x4(t) = Rect(t/2) - Tri(t)": {
        "time": lambda t: rect(t / 2) - tri(t),
        "amp": lambda f: np.abs(2 * sinc(2 * f) - sinc(f)**2),
        "phase": lambda f: np.piecewise(
            f, 
            [2 * sinc(2 * f) - sinc(f)**2 < -1e-4], 
            [np.pi, 0]
        ),
        "desc": "TF: 2*sinc(2f) - sinc²(f).\nPropriétés: Linéarité, Changement d'échelle."
    }
}

class SignalAnalyzerApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Analyseur de Fourier - Exo 2")
        self.root.geometry("1000x800")
        
        self.setup_ui()
        self.plot_signal()

    def setup_ui(self):
        # Top Frame for controls
        control_frame = tk.Frame(self.root, pady=10, padx=10)
        control_frame.pack(fill=tk.X)
        
        tk.Label(control_frame, text="Choisir le signal :", font=("Arial", 12, "bold")).pack(side=tk.LEFT, padx=5)
        
        self.signal_var = tk.StringVar()
        self.combo = ttk.Combobox(control_frame, textvariable=self.signal_var, values=list(SIGNALS.keys()), width=40, font=("Arial", 11), state="readonly")
        self.combo.current(0)
        self.combo.pack(side=tk.LEFT, padx=10)
        self.combo.bind("<<ComboboxSelected>>", lambda e: self.plot_signal())
        
        self.desc_var = tk.StringVar()
        tk.Label(self.root, textvariable=self.desc_var, font=("Consolas", 11), fg="blue", justify=tk.CENTER).pack(pady=5)
        
        # Figure setup
        self.fig = Figure(figsize=(8, 10))
        self.ax1 = self.fig.add_subplot(311)
        self.ax2 = self.fig.add_subplot(312)
        self.ax3 = self.fig.add_subplot(313)
        
        self.fig.tight_layout(pad=4.0)
        
        self.canvas = FigureCanvasTkAgg(self.fig, master=self.root)
        self.canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)

    def plot_signal(self):
        sig_key = self.signal_var.get()
        sig_data = SIGNALS[sig_key]
        
        self.desc_var.set(sig_data["desc"])
        
        t = np.linspace(-4, 4, 1000)
        f = np.linspace(-5, 5, 1000)
        
        y_t = sig_data["time"](t)
        
        # Handle Dirac specifically for plotting
        if "cos" in sig_key:
            y_amp = sig_data["amp"](f)
            y_phase = sig_data["phase"](f)
            self.ax2.clear()
            self.ax2.stem(f, y_amp, linefmt='b-', markerfmt='bo', basefmt='k-')
            self.ax2.set_title("Spectre d'Amplitude $|X(f)|$ (Impulsions)")
        else:
            y_amp = sig_data["amp"](f)
            y_phase = sig_data["phase"](f)
            self.ax2.clear()
            self.ax2.plot(f, y_amp, 'b-', linewidth=2)
            self.ax2.fill_between(f, 0, y_amp, alpha=0.2, color='blue')
            self.ax2.set_title("Spectre d'Amplitude $|X(f)|$")

        self.ax1.clear()
        self.ax1.plot(t, y_t, 'r-', linewidth=2)
        self.ax1.set_title(f"Représentation temporelle : {sig_key}")
        self.ax1.set_xlabel("Temps (t)")
        self.ax1.set_ylabel("x(t)")
        self.ax1.grid(True, linestyle='--', alpha=0.7)
        self.ax1.set_xlim([-4, 4])
        
        self.ax2.set_xlabel("Fréquence (f)")
        self.ax2.set_ylabel("$|X(f)|$")
        self.ax2.grid(True, linestyle='--', alpha=0.7)
        self.ax2.set_xlim([-5, 5])
        
        self.ax3.clear()
        self.ax3.plot(f, y_phase, 'g-', linewidth=2)
        self.ax3.set_title("Spectre de Phase $Arg(X(f))$ [radians]")
        self.ax3.set_xlabel("Fréquence (f)")
        self.ax3.set_ylabel("Phase")
        self.ax3.set_yticks([-np.pi, -np.pi/2, 0, np.pi/2, np.pi])
        self.ax3.set_yticklabels(['-$\pi$', '-$\pi$/2', '0', '$\pi$/2', '$\pi$'])
        self.ax3.grid(True, linestyle='--', alpha=0.7)
        self.ax3.set_xlim([-5, 5])
        self.ax3.set_ylim([-np.pi - 0.5, np.pi + 0.5])
        
        self.canvas.draw()

if __name__ == "__main__":
    root = tk.Tk()
    app = SignalAnalyzerApp(root)
    root.mainloop()
