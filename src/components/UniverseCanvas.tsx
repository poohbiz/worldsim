import { useEffect, useRef } from "react";
import type { WorldState } from "../sim/types";
import { updateBodies } from "../sim/physics";

type UniverseCanvasProps = {
  setWorld: React.Dispatch<React.SetStateAction<WorldState | null>>;
};

export function UniverseCanvas({ setWorld }: UniverseCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    function draw(currentTime: number) {
      if (!canvas || !context) return;

      const lastTime = lastTimeRef.current ?? currentTime;
      const deltaMs = currentTime - lastTime;
      lastTimeRef.current = currentTime;

      const dt = Math.min(deltaMs / 16.67, 2);

      setWorld((currentWorld) => {
        if (!currentWorld) return currentWorld;

        const nextBodies = currentWorld.isPaused
          ? currentWorld.bodies
          : updateBodies(currentWorld.bodies, dt * currentWorld.timeScale);

        const nextWorld = {
          ...currentWorld,
          bodies: nextBodies,
        };

        render(context, canvas, nextWorld);

        return nextWorld;
      });

      animationFrameRef.current = requestAnimationFrame(draw);
    }

    animationFrameRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [setWorld]);

  return <canvas ref={canvasRef} width={900} height={600} />;
}

function render(
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  world: WorldState,
) {
  context.clearRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "#050713";
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawGrid(context, canvas);

  for (const body of world.bodies) {
    context.beginPath();
    context.arc(body.position.x, body.position.y, body.radius, 0, Math.PI * 2);
    context.fillStyle = body.color;
    context.fill();

    context.beginPath();
    context.arc(body.position.x, body.position.y, body.radius, 0, Math.PI * 2);
    context.strokeStyle = `${body.color}55`;
    context.stroke();
  }
}

function drawGrid(
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
) {
  context.strokeStyle = "rgba(255, 255, 255, 0.04)";
  context.lineWidth = 1;

  const spacing = 50;

  for (let x = 0; x < canvas.width; x += spacing) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, canvas.height);
    context.stroke();
  }

  for (let y = 0; y < canvas.height; y += spacing) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(canvas.width, y);
    context.stroke();
  }
}
