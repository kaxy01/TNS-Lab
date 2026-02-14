import { useEffect, useRef } from "react";

const WaveBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const drawWave = (
      yOffset: number,
      amplitude: number,
      frequency: number,
      speed: number,
      color: string,
      lineWidth: number
    ) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      for (let x = 0; x <= canvas.width; x += 2) {
        const y =
          yOffset +
          Math.sin(x * frequency + time * speed) * amplitude +
          Math.sin(x * frequency * 0.5 + time * speed * 1.3) * amplitude * 0.5;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.01;

      // Multiple waves with neon colors
      drawWave(canvas.height * 0.3, 40, 0.005, 1.2, "rgba(0, 224, 255, 0.15)", 2);
      drawWave(canvas.height * 0.4, 50, 0.004, 0.8, "rgba(138, 43, 226, 0.12)", 2);
      drawWave(canvas.height * 0.5, 35, 0.006, 1.5, "rgba(255, 0, 128, 0.1)", 1.5);
      drawWave(canvas.height * 0.6, 45, 0.003, 1.0, "rgba(0, 224, 255, 0.08)", 1.5);
      drawWave(canvas.height * 0.7, 30, 0.007, 1.8, "rgba(138, 43, 226, 0.06)", 1);

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.8 }}
    />
  );
};

export default WaveBackground;
