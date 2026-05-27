import {
  useEffect,
  useRef,
  type Dispatch,
  type PointerEvent,
  type SetStateAction,
} from "react";
import type { WorldState } from "../sim/types";
import { updateBodies } from "../sim/physics";

type UniverseCanvasProps = {
  world: WorldState;
  setWorld: Dispatch<SetStateAction<WorldState | null>>;
  selectedBodyId: string | null;
  onSelectBody: (bodyId: string | null) => void;
};

export function UniverseCanvas({
  world,
  setWorld,
  selectedBodyId,
  onSelectBody,
}: UniverseCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const worldRef = useRef<WorldState>(world);
  const selectedBodyIdRef = useRef<string | null>(selectedBodyId);

  worldRef.current = world;
  selectedBodyIdRef.current = selectedBodyId;

  function handleCanvasPointerDown(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clickX = (event.clientX - rect.left) * scaleX;
    const clickY = (event.clientY - rect.top) * scaleY;

    const clickedBody = findClickedBody(
      worldRef.current.bodies,
      clickX,
      clickY,
    );

    onSelectBody(clickedBody ? clickedBody.id : null);
  }

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

        render(context, canvas, nextWorld, selectedBodyIdRef.current);

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

  return (
    <canvas
      ref={canvasRef}
      width={900}
      height={600}
      onPointerDown={handleCanvasPointerDown}
    />
  );
}

function render(
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  world: WorldState,
  selectedBodyId: string | null,
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
    context.arc(
      body.position.x,
      body.position.y,
      body.radius * 2.2,
      0,
      Math.PI * 2,
    );
    context.strokeStyle = `${body.color}55`;
    context.stroke();

    if (body.id === selectedBodyId) {
      context.beginPath();
      context.arc(
        body.position.x,
        body.position.y,
        Math.max(body.radius * 3.1, 18),
        0,
        Math.PI * 2,
      );
      context.strokeStyle = "rgba(255, 255, 255, 0.8)";
      context.lineWidth = 2;
      context.stroke();
      context.lineWidth = 1;
    }
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

function findClickedBody(
  bodies: WorldState["bodies"],
  clickX: number,
  clickY: number,
) {
  for (let i = bodies.length - 1; i >= 0; i--) {
    const body = bodies[i];

    const dx = clickX - body.position.x;
    const dy = clickY - body.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const clickableRadius = Math.max(body.radius * 4, 32);

    if (distance <= clickableRadius) {
      return body;
    }
  }

  return null;
}
