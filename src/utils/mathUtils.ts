export const u = (t: number) => (t > 0 ? 1 : t === 0 ? 0.5 : 0);
export const sgn = (t: number) => (t > 0 ? 1 : t < 0 ? -1 : 0);
export const rect = (t: number) => (Math.abs(t) <= 0.5 ? 1 : 0);
export const tri = (t: number) => (Math.abs(t) <= 1 ? 1 - Math.abs(t) : 0);

export const parseExpression = (expr: string): ((t: number) => number) | null => {
    try {
        const body = `
            const u = (x) => x > 0 ? 1 : x === 0 ? 0.5 : 0;
            const sgn = (x) => x > 0 ? 1 : x < 0 ? -1 : 0;
            const rect = (x) => Math.abs(x) <= 0.5 ? 1 : 0;
            const tri = (x) => Math.abs(x) <= 1 ? 1 - Math.abs(x) : 0;
            const sin = Math.sin, cos = Math.cos, exp = Math.exp;
            const abs = Math.abs, sqrt = Math.sqrt, log = Math.log;
            const pi = Math.PI, PI = Math.PI;
            const pow = Math.pow;
            return ${expr};
        `;
        const fn = new Function("t", body) as (t: number) => number;
        fn(0); // test
        return fn;
    } catch {
        return null;
    }
};
