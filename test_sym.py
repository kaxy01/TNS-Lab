import numpy as np
import sympy as sp

t = sp.symbols('t')
# Triangle function from the image:
# 1 - |t| for |t| <= 1, else 0
# Can be written as Max(0, 1 - Abs(t))
expr = sp.sympify("Max(0, 1 - Abs(t))")
f = sp.lambdify(t, expr, modules=['numpy'])

val = np.linspace(-2, 2, 5)
print("Max test:", f(val))

expr2 = sp.sympify("Piecewise((1-abs(t), abs(t)<=1), (0, True))")
f2 = sp.lambdify(t, expr2, modules=['numpy'])
print("Piecewise test:", f2(val))
