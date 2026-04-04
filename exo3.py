import numpy as np
import tkinter as tk
from tkinter import messagebox
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from matplotlib.figure import Figure

def calculate_and_plot():
    func_str = entry.get()
    
    # Define a time vector for the plot
    t = np.linspace(-5, 5, 2000)
    dt = t[1] - t[0]
    
    # Create a safe dictionary with numpy functions for eval
    safe_dict = {"t": t, "np": np}
    for name in dir(np):
        if not name.startswith("_"):
            safe_dict[name] = getattr(np, name)
            
    # Add common aliases for ease of use
    safe_dict.update({
        "sin": np.sin, "cos": np.cos, "tan": np.tan, "exp": np.exp,
        "pi": np.pi, "sqrt": np.sqrt, "abs": np.abs, "Heaviside": np.heaviside,
        "maximum": np.maximum, "minimum": np.minimum, "Piecewise": np.piecewise,
        "where": np.where, "sign": np.sign
    })

    try:
        # Replace common math notations
        func_str_py = func_str.replace("^", "**")
        
        # Evaluate user function x(t)
        y = eval(func_str_py, {"__builtins__": {}}, safe_dict)
        
        # If scalar returned (e.g. constant function "1"), make it an array
        if np.isscalar(y):
            y = np.ones_like(t) * y
            
        # First and second derivatives using central difference
        dy = np.gradient(y, t)
        d2y = np.gradient(dy, t)
        
        # Calculate x(-t) for even and odd parts
        t_rev = -t
        safe_dict["t"] = t_rev
        y_rev = eval(func_str_py, {"__builtins__": {}}, safe_dict)
        if np.isscalar(y_rev):
            y_rev = np.ones_like(t) * y_rev
            
        y_even = (y + y_rev) / 2
        y_odd = (y - y_rev) / 2
        
        # Update plots
        ax1.clear(); ax2.clear(); ax3.clear()
        
        ax1.plot(t, y, label="Signal original $x(t)$", color='blue', linewidth=2)
        ax1.plot(t, dy, label="Première dérivée $x'(t)$", color='red', linestyle='--')
        ax1.plot(t, d2y, label="Seconde dérivée $x''(t)$", color='green', linestyle=':')
        ax1.set_title("Signal et ses Dérivées")
        ax1.set_xlim([-5, 5])
        ax1.legend(loc='upper right')
        ax1.grid(True, linestyle='--', alpha=0.7)
        
        ax2.plot(t, y_even, label="Partie paire $x_e(t)$", color='purple', linewidth=2)
        ax2.set_title("Partie Paire")
        ax2.set_xlim([-5, 5])
        ax2.legend(loc='upper right')
        ax2.grid(True, linestyle='--', alpha=0.7)
        
        ax3.plot(t, y_odd, label="Partie impaire $x_o(t)$", color='orange', linewidth=2)
        ax3.set_title("Partie Impaire")
        ax3.set_xlim([-5, 5])
        ax3.legend(loc='upper right')
        ax3.grid(True, linestyle='--', alpha=0.7)
        
        fig.tight_layout(pad=2.0)
        canvas.draw()
        
    except Exception as e:
        messagebox.showerror("Erreur de calcul", 
                             f"Impossible d'évaluer l'expression.\n"
                             f"Détails : {e}\n\n"
                             f"Assurez-vous d'utiliser la variable 't' et des fonctions mathématiques valides (sin, cos, abs, where, etc.)")

# Setup Tkinter Window
root = tk.Tk()
root.title("Analyseur de Signaux - Exo 3")
root.geometry("800x800")

# Top Frame for input
frame_top = tk.Frame(root)
frame_top.pack(fill=tk.X, padx=10, pady=10)

lbl = tk.Label(frame_top, text="Fonction x(t) = ", font=("Arial", 12, "bold"))
lbl.pack(side=tk.LEFT)

# Entry for function. Default is the triangle wave from Exercise 3: max(0, 1 - |t|)
entry = tk.Entry(frame_top, width=60, font=("Consolas", 12))
entry.insert(0, "where(abs(t) <= 1, 1 - abs(t), 0)")
entry.pack(side=tk.LEFT, padx=10)

btn = tk.Button(frame_top, text="Calculer et Tracer", font=("Arial", 11, "bold"), 
                bg="#4CAF50", fg="white", command=calculate_and_plot)
btn.pack(side=tk.LEFT)

# Instructions Label
lbl_inst = tk.Label(root, text="Exemples : sin(t)*exp(-t), where(abs(t) <= 1, 1 - abs(t), 0), Heaviside(t), t**2", 
                    fg="gray", font=("Arial", 10))
lbl_inst.pack(pady=2)

# Figure setup
fig = Figure(figsize=(8, 10))
ax1 = fig.add_subplot(311)
ax2 = fig.add_subplot(312)
ax3 = fig.add_subplot(313)

canvas = FigureCanvasTkAgg(fig, master=root)
canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)

# Initial execution to plot the default signal
calculate_and_plot()

root.mainloop()
