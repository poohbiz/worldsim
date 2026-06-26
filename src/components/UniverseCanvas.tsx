import {
  useEffect,
  useRef,
  type Dispatch,
  type PointerEvent,
  type SetStateAction,
} from "react";
import type { WorldState } from "../sim/types";
import { updateBodies } from "../sim/physics";
import type { Society } from "../society/types";

type UniverseCanvasProps = {
  world: WorldState;
  setWorld: Dispatch<SetStateAction<WorldState | null>>;
  selectedBodyId: string | null;
  onSelectBody: (bodyId: string | null) => void;
  society: Society | null;
};

export function UniverseCanvas({
  world,
  setWorld,
  selectedBodyId,
  onSelectBody,
  society,
}: UniverseCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const worldRef = useRef<WorldState>(world);
  const selectedBodyIdRef = useRef<string | null>(selectedBodyId);
  const societyRef = useRef<Society | null>(society);

  worldRef.current = world;
  selectedBodyIdRef.current = selectedBodyId;
  societyRef.current = society;

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

        render(
          context,
          canvas,
          nextWorld,
          selectedBodyIdRef.current,
          societyRef.current,
          currentTime,
        );

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
  society: Society | null,
  currentTime: number,
) {
  context.clearRect(0, 0, canvas.width, canvas.height);

  drawCosmicBackground(context, canvas, currentTime);
  drawGrid(context, canvas);

  if (world.showTrails) {
    drawTrails(context, world);
  }

  for (const body of world.bodies) {
    drawBodyGlow(context, body);
  }

  for (const body of world.bodies) {
    drawBody(context, body);

    if (society?.homeBodyId === body.id) {
      drawCivilizationMarker(context, body, society, currentTime);
    }

    if (body.id === selectedBodyId) {
      drawSelectedBodyAura(context, body, currentTime);
    }
  }
}

function drawCosmicBackground(
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  currentTime: number,
) {
  const gradient = context.createRadialGradient(
    canvas.width * 0.5,
    canvas.height * 0.45,
    40,
    canvas.width * 0.5,
    canvas.height * 0.5,
    canvas.width * 0.8,
  );

  gradient.addColorStop(0, "#101633");
  gradient.addColorStop(0.45, "#050713");
  gradient.addColorStop(1, "#02030a");

  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawStarfield(context, canvas, currentTime);
}

function drawStarfield(
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  currentTime: number,
) {
  const starCount = 130;
  const twinkle = Math.sin(currentTime * 0.001) * 0.15;

  for (let i = 0; i < starCount; i++) {
    const x = pseudoRandom(i * 13.37) * canvas.width;
    const y = pseudoRandom(i * 91.7) * canvas.height;
    const size = pseudoRandom(i * 3.11) * 1.6 + 0.3;
    const alpha = 0.25 + pseudoRandom(i * 8.41) * 0.45 + twinkle;

    context.beginPath();
    context.arc(x, y, size, 0, Math.PI * 2);
    context.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, alpha)})`;
    context.fill();
  }
}

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function drawTrails(context: CanvasRenderingContext2D, world: WorldState) {
  for (const body of world.bodies) {
    if (body.trail.length < 2) continue;

    for (let i = 1; i < body.trail.length; i++) {
      const previousPoint = body.trail[i - 1];
      const currentPoint = body.trail[i];

      const ageRatio = i / body.trail.length;
      const alpha = ageRatio * 0.55;
      const width = Math.max(body.radius * 0.25 * ageRatio, 0.6);

      context.beginPath();
      context.moveTo(previousPoint.x, previousPoint.y);
      context.lineTo(currentPoint.x, currentPoint.y);
      context.strokeStyle = hexToRgba(body.color, alpha);
      context.lineWidth = width;
      context.stroke();
    }

    context.lineWidth = 1;
  }
}

function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace("#", "");

  const red = parseInt(cleanHex.slice(0, 2), 16);
  const green = parseInt(cleanHex.slice(2, 4), 16);
  const blue = parseInt(cleanHex.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function drawBody(
  context: CanvasRenderingContext2D,
  body: WorldState["bodies"][number],
) {
  const gradient = context.createRadialGradient(
    body.position.x - body.radius * 0.35,
    body.position.y - body.radius * 0.45,
    body.radius * 0.2,
    body.position.x,
    body.position.y,
    body.radius,
  );

  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.08, body.color);
  gradient.addColorStop(1, "#050713");

  context.beginPath();
  context.arc(body.position.x, body.position.y, body.radius, 0, Math.PI * 2);
  context.fillStyle = gradient;
  context.fill();

  context.beginPath();
  context.arc(
    body.position.x,
    body.position.y,
    body.radius * 1.35,
    0,
    Math.PI * 2,
  );
  context.strokeStyle = hexToRgba(
    body.color,
    body.kind === "star" ? 0.5 : 0.25,
  );
  context.lineWidth = 1;
  context.stroke();

  if (body.id.includes("+m")) {
    drawMergeScar(context, body);
  }
}

function drawMergeScar(
  context: CanvasRenderingContext2D,
  body: WorldState["bodies"][number],
) {
  context.beginPath();
  context.arc(
    body.position.x,
    body.position.y,
    body.radius * 1.8,
    0,
    Math.PI * 2,
  );
  context.strokeStyle = "rgba(255, 230, 180, 0.35)";
  context.lineWidth = 2;
  context.stroke();
  context.lineWidth = 1;
}

function drawSelectedBodyAura(
  context: CanvasRenderingContext2D,
  body: WorldState["bodies"][number],
  currentTime: number,
) {
  const pulse = Math.sin(currentTime * 0.006) * 3;
  const auraRadius = Math.max(body.radius * 3.1, 18) + pulse;

  context.beginPath();
  context.arc(body.position.x, body.position.y, auraRadius, 0, Math.PI * 2);
  context.strokeStyle = "rgba(255, 255, 255, 0.85)";
  context.lineWidth = 2;
  context.stroke();

  context.beginPath();
  context.arc(body.position.x, body.position.y, auraRadius + 6, 0, Math.PI * 2);
  context.strokeStyle = hexToRgba(body.color, 0.25);
  context.lineWidth = 4;
  context.stroke();

  context.lineWidth = 1;
}

function drawBodyGlow(
  context: CanvasRenderingContext2D,
  body: WorldState["bodies"][number],
) {
  const glowRadius =
    body.kind === "star"
      ? body.radius * 5
      : body.kind === "planet"
        ? body.radius * 3.2
        : body.radius * 2.2;

  const gradient = context.createRadialGradient(
    body.position.x,
    body.position.y,
    body.radius,
    body.position.x,
    body.position.y,
    glowRadius,
  );

  const innerAlpha = body.kind === "star" ? 0.42 : 0.22;

  gradient.addColorStop(0, hexToRgba(body.color, innerAlpha));
  gradient.addColorStop(1, hexToRgba(body.color, 0));

  context.beginPath();
  context.arc(body.position.x, body.position.y, glowRadius, 0, Math.PI * 2);
  context.fillStyle = gradient;
  context.fill();
}

function drawGrid(
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
) {
  context.strokeStyle = "rgba(150, 170, 255, 0.025)";
  context.lineWidth = 1;

  const spacing = 75;

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

function drawCivilizationMarker(
  context: CanvasRenderingContext2D,
  body: WorldState["bodies"][number],
  society: Society,
  currentTime: number,
) {
  const presenceRatio = society.wellbeing.presence / 100;
  const trustRatio = society.wellbeing.socialTrust / 100;
  const pulse = Math.sin(currentTime * 0.004) * 0.12 + 0.88;

  const ringRadius = body.radius * (2.2 + presenceRatio * 0.8);

  context.beginPath();
  context.arc(body.position.x, body.position.y, ringRadius, 0, Math.PI * 2);
  context.strokeStyle = `rgba(120, 255, 190, ${0.25 + presenceRatio * 0.35})`;
  context.lineWidth = 2;
  context.stroke();

  const cityLightCount = 8;

  for (let i = 0; i < cityLightCount; i++) {
    const angle = (Math.PI * 2 * i) / cityLightCount + currentTime * 0.0004;
    const lightRadius = body.radius * 0.65;
    const x = body.position.x + Math.cos(angle) * lightRadius;
    const y = body.position.y + Math.sin(angle) * lightRadius;

    context.beginPath();
    context.arc(x, y, 1.4 + trustRatio * 0.8, 0, Math.PI * 2);
    context.fillStyle = `rgba(130, 255, 210, ${0.35 + presenceRatio * 0.45 * pulse})`;
    context.fill();
  }

  context.beginPath();
  context.arc(
    body.position.x,
    body.position.y - body.radius - 10,
    3 + presenceRatio * 2,
    0,
    Math.PI * 2,
  );
  context.fillStyle = "rgba(140, 255, 210, 0.9)";
  context.fill();
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
