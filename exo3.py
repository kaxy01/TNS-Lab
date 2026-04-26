import numpy as np
import tkinter as tk
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from matplotlib.figure import Figure
import matplotlib.pyplot as plt

class Exo3App:
    def __init__(self, root):
        self.root = root
        self.root.title("Solution Exercice 3 - Signal et Dérivées")
        self.root.geometry("1000x900")
        
        self.setup_ui()
        self.plot_all()

    def setup_ui(self):
        # En-tête avec les formules analytiques
        frame_top = tk.Frame(self.root, bg="#f0f0f0", pady=10, padx=10)
        frame_top.pack(fill=tk.X)
        
        tk.Label(frame_top, text="Analyse Analytique du Signal y(t)", font=("Arial", 14, "bold"), bg="#f0f0f0").pack()
        
        formulas = [
            "1) Signal (ramp/échelon) : y(t) = -r(t+1) + 2u(t) + r(t-1)",
            "2) 1ère dérivée : y'(t) = -u(t+1) + 2δ(t) + u(t-1) = -Rect(t/2) + 2δ(t)",
            "3) 2ème dérivée : y''(t) = -δ(t+1) + 2δ'(t) + δ(t-1)",
            "4) Transformée de Fourier : Y(f) = j * [sin(2πf) - 2πf] / (2π²f²)"
        ]
        
        for f in formulas:
            tk.Label(frame_top, text=f, font=("Consolas", 12), bg="#f0f0f0", fg="#333333").pack(anchor="w", padx=20)

        # Figure matplotlib
        self.fig = Figure(figsize=(8, 12))
        self.ax1 = self.fig.add_subplot(411)
        self.ax2 = self.fig.add_subplot(412)
        self.ax3 = self.fig.add_subplot(413)
        self.ax4 = self.fig.add_subplot(414)
        
        self.fig.tight_layout(pad=4.0)
        
        self.canvas = FigureCanvasTkAgg(self.fig, master=self.root)
        self.canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)

    def plot_all(self):
        t = np.linspace(-3, 3, 1000)
        
        # 1. Signal y(t)
        y = np.piecewise(t, [t < -1, (t >= -1) & (t < 0), (t >= 0) & (t < 1), t >= 1], 
                        [0, lambda t: -t - 1, lambda t: -t + 1, 0])
        
        self.ax1.plot(t, y, 'b-', linewidth=2)
        self.ax1.plot([0, 0], [-1, 1], 'b-', linewidth=2) # Saut vertical en t=0
        self.ax1.set_title("1. Signal original y(t)")
        self.ax1.grid(True, linestyle='--', alpha=0.7)
        self.ax1.set_ylim([-1.5, 1.5])
        
        # 2. Première dérivée y'(t)
        y_prime = np.piecewise(t, [t < -1, (t > -1) & (t < 1), t > 1], [0, -1, 0])
        self.ax2.plot(t, y_prime, 'r-', linewidth=2)
        self.ax2.plot([-1, -1], [0, -1], 'r-', linewidth=2)
        self.ax2.plot([1, 1], [-1, 0], 'r-', linewidth=2)
        # Impulsion 2δ(t)
        self.ax2.annotate('2δ(t)', xy=(0.1, 1.5), color='red', weight='bold')
        self.ax2.annotate('', xy=(0, 2), xytext=(0, 0), arrowprops=dict(arrowstyle="->", color='red', lw=2))
        self.ax2.set_title("2. Première dérivée y'(t)")
        self.ax2.grid(True, linestyle='--', alpha=0.7)
        self.ax2.set_ylim([-1.5, 2.5])
        
        # 3. Seconde dérivée y''(t)
        self.ax3.axhline(0, color='black', lw=1)
        # -δ(t+1)
        self.ax3.annotate('', xy=(-1, -1), xytext=(-1, 0), arrowprops=dict(arrowstyle="->", color='orange', lw=2))
        self.ax3.annotate('-δ(t+1)', xy=(-0.9, -1), color='orange', weight='bold')
        # δ(t-1)
        self.ax3.annotate('', xy=(1, 1), xytext=(1, 0), arrowprops=dict(arrowstyle="->", color='orange', lw=2))
        self.ax3.annotate('δ(t-1)', xy=(1.1, 0.8), color='orange', weight='bold')
        # Doublet 2δ'(t)
        self.ax3.annotate('', xy=(0.1, 1.5), xytext=(0.1, 0), arrowprops=dict(arrowstyle="->", color='purple', lw=2))
        self.ax3.annotate('', xy=(-0.1, -1.5), xytext=(-0.1, 0), arrowprops=dict(arrowstyle="->", color='purple', lw=2))
        self.ax3.annotate("2δ'(t) (doublet)", xy=(0.2, 1.2), color='purple', weight='bold')
        self.ax3.set_title("3. Seconde dérivée y''(t)")
        self.ax3.grid(True, linestyle='--', alpha=0.7)
        self.ax3.set_ylim([-2, 2])
        self.ax3.set_xlim([-3, 3])
        
        # 4. Transformée de Fourier |Y(f)|
        f = np.linspace(-5, 5, 1000)
        # Gestion de f=0 pour éviter la division par zéro
        f_safe = np.where(f == 0, 1e-10, f)
        Y_amp = np.abs((np.sin(2*np.pi*f_safe) - 2*np.pi*f_safe) / (2 * np.pi**2 * f_safe**2))
        Y_amp[np.abs(f) < 1e-5] = 0 # Par la règle de L'Hôpital, Y(0) = 0
        
        self.ax4.plot(f, Y_amp, 'g-', linewidth=2)
        self.ax4.fill_between(f, 0, Y_amp, alpha=0.2, color='green')
        self.ax4.set_title("4. Transformée de Fourier - Amplitude |Y(f)|")
        self.ax4.grid(True, linestyle='--', alpha=0.7)
        self.ax4.set_xlabel("Fréquence f")
        
        self.canvas.draw()

if __name__ == "__main__":
    root = tk.Tk()
    app = Exo3App(root)
    root.mainloop()
