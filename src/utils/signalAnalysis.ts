export const getSignalTypeJS = (expr: string) => {
    // Quick heuristic classification in JS
    if (expr.includes("sin") || expr.includes("cos")) {
        return {
            type: "Périodique",
            energy: "∞",
            power: "P > 0",
            desc: "Signal de puissance",
        };
    } else {
        return {
            type: "Transitoire",
            energy: "E < ∞",
            power: "0",
            desc: "Signal d'énergie",
        };
    }
};

export const computeLocalAnalysis = (fn: (t: number) => number) => {
    const N = 10000;
    const tMin = -10, tMax = 10;
    const dt = (tMax - tMin) / N;

    let energy = 0;
    for (let i = 0; i <= N; i++) {
        const t = tMin + i * dt;
        const y = fn(t);
        if (isFinite(y)) energy += y * y * dt;
    }

    const T = tMax - tMin;
    const power = energy / T;

    // Periodicity via autocorrelation
    const samples: number[] = [];
    const sN = 2000;
    const sDt = T / sN;
    let mean = 0;
    for (let i = 0; i <= sN; i++) {
        const t = tMin + i * sDt;
        const y = fn(t);
        samples.push(isFinite(y) ? y : 0);
        mean += samples[i];
    }
    mean /= (sN + 1);
    for (let i = 0; i <= sN; i++) samples[i] -= mean;

    let period: number | null = null;
    let frequency: number | null = null;
    let isPeriodic = false;

    // Normalized autocorrelation
    let r0 = 0;
    for (let i = 0; i <= sN; i++) r0 += samples[i] * samples[i];
    if (r0 > 1e-10) {
        const maxLag = Math.floor(sN / 2);
        for (let lag = 2; lag < maxLag; lag++) {
            let rLag = 0;
            for (let i = 0; i <= sN - lag; i++) rLag += samples[i] * samples[i + lag];
            const normalized = rLag / r0;
            // Check if it's a peak and above threshold
            if (normalized > 0.5) {
                let rPrev = 0;
                for (let i = 0; i <= sN - (lag - 1); i++) rPrev += samples[i] * samples[i + lag - 1];
                const nPrev = rPrev / r0;
                if (normalized > nPrev) {
                    period = lag * sDt;
                    frequency = 1.0 / period;
                    isPeriodic = true;
                    break;
                }
            }
        }
    }

    // ── Apply theoretical rules ──
    let finalEnergy: string | number;
    let finalPower: number;
    const sigType = isPeriodic ? "periodic" : "transient";

    if (isPeriodic && period) {
        // Periodic: E = ∞, P = average over one detected period
        let powerPeriod = 0;
        const pN = 2000;
        const pDt = period / pN;
        for (let i = 0; i <= pN; i++) {
            const t = i * pDt;
            const y = fn(t);
            if (isFinite(y)) powerPeriod += y * y * pDt;
        }
        finalPower = Math.round((powerPeriod / period) * 10000) / 10000;
        finalEnergy = "∞";
    } else {
        // Transient: E = finite, P = 0
        finalEnergy = Math.round(energy * 10000) / 10000;
        finalPower = 0;
    }

    return {
        energy: finalEnergy,
        power: finalPower,
        is_periodic: isPeriodic,
        sig_type: sigType,
        period: period ? Math.round(period * 10000) / 10000 : null,
        frequency: frequency ? Math.round(frequency * 10000) / 10000 : null,
    };
};
