import * as THREE from "three";
import { ASSETS, type AssetId, type Economy } from "@/lib/market-data";
import { createRng } from "@/lib/market-game";

export type ZoneId = AssetId | "clock";

export type World = {
  spawnCoins: (values: number[], seed: number) => void;
  walkTo: (zone: ZoneId) => void;
  setKey: (code: string, down: boolean) => void;
  releaseKeys: () => void;
  setControls: (enabled: boolean) => void;
  setPanelOpen: (open: boolean) => void;
  setLabelDetails: (details: Partial<Record<ZoneId, string>>) => void;
  playYearEnd: (returns: Record<AssetId, number>, economy: Economy) => Promise<void>;
  startYear: () => void;
  resetPlayer: () => void;
  dispose: () => void;
};

type WorldEvents = {
  onCoin: (value: number) => void;
  onZone: (zone: ZoneId | null) => void;
};

type Updater = (time: number, delta: number) => void;

const RING = 17;
const ZONE_RING = 12.4;
const ZONE_RADIUS = 1.7;
const BOUND = 25.5;
const PLAYER_RADIUS = 0.7;
const SPEED = 8.5;
const START = new THREE.Vector3(0, 0, 6);
const SKY = "#bfe6ff";
const NAVY = "#061b45";
const GOLD = "#ffca20";
const STONE = "#eee6d6";

const SLOTS: Record<ZoneId, number> = {
  clock: 0,
  bank: 45,
  bonds: 90,
  index: 135,
  snacks: 180,
  bikes: 225,
  pixel: 270,
  rocket: 315,
};

const KEY_DIRECTIONS: Record<string, [number, number]> = {
  ArrowUp: [0, -1],
  KeyW: [0, -1],
  ArrowDown: [0, 1],
  KeyS: [0, 1],
  ArrowLeft: [-1, 0],
  KeyA: [-1, 0],
  ArrowRight: [1, 0],
  KeyD: [1, 0],
};

// The sky and weather during the year-end flyover tell the story before the newspaper does.
const MOODS: Record<Economy, { sky: string; sun: number; hemi: number; weather: "rain" | "confetti" | null }> = {
  boom: { sky: "#ffe3a3", sun: 2.9, hemi: 2.1, weather: "confetti" },
  normal: { sky: SKY, sun: 2.4, hemi: 1.9, weather: null },
  slowdown: { sky: "#c3cfd9", sun: 1.7, hemi: 1.6, weather: null },
  crash: { sky: "#6f8197", sun: 0.9, hemi: 1.15, weather: "rain" },
};

function onRing(degrees: number, radius: number) {
  const angle = THREE.MathUtils.degToRad(degrees);
  return new THREE.Vector3(Math.sin(angle) * radius, 0, -Math.cos(angle) * radius);
}

const materials = new Map<string, THREE.MeshStandardMaterial>();

function paint(color: string, glow = 0) {
  const key = `${color}-${glow}`;
  if (!materials.has(key)) {
    materials.set(
      key,
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.82,
        flatShading: true,
        emissive: glow ? color : "#000000",
        emissiveIntensity: glow,
      }),
    );
  }
  return materials.get(key)!;
}

function add<T extends THREE.Object3D>(parent: THREE.Object3D, object: T, x = 0, y = 0, z = 0) {
  object.position.set(x, y, z);
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  parent.add(object);
  return object;
}

function box(parent: THREE.Object3D, size: [number, number, number], color: string, at: [number, number, number], glow = 0) {
  return add(parent, new THREE.Mesh(new THREE.BoxGeometry(...size), paint(color, glow)), ...at);
}

function cylinder(
  parent: THREE.Object3D,
  radius: number,
  height: number,
  color: string,
  at: [number, number, number],
  { segments = 16, faceForward = false, glow = 0 } = {},
) {
  const geometry = new THREE.CylinderGeometry(radius, radius, height, segments);
  if (faceForward) geometry.rotateX(Math.PI / 2);
  return add(parent, new THREE.Mesh(geometry, paint(color, glow)), ...at);
}

function pyramid(parent: THREE.Object3D, radius: number, height: number, color: string, y: number) {
  const geometry = new THREE.ConeGeometry(radius, height, 4);
  geometry.rotateY(Math.PI / 4);
  return add(parent, new THREE.Mesh(geometry, paint(color)), 0, y, 0);
}

function windowRow(parent: THREE.Object3D, xs: number[], y: number, z: number, color = "#fff4c2") {
  for (const x of xs) box(parent, [0.8, 0.9, 0.08], color, [x, y, z], 0.35);
}

function door(parent: THREE.Object3D, z: number, x = 0) {
  box(parent, [1.2, 1.9, 0.1], NAVY, [x, 0.95 + 0.3, z]);
}

type Built = { group: THREE.Group; height: number };

function buildBank(color: string): Built {
  const group = new THREE.Group();
  box(group, [7, 0.5, 5.6], "#e3dccd", [0, 0.25, 0]);
  box(group, [6, 3.4, 4.2], "#f8f5ef", [0, 2.2, -0.4]);
  for (const x of [-2.25, -0.75, 0.75, 2.25]) {
    cylinder(group, 0.26, 3.2, "#ffffff", [x, 2.1, 2.2], { segments: 10 });
  }
  box(group, [6.8, 0.45, 5.4], color, [0, 4.12, 0.1]);
  const roof = pyramid(group, 4.2, 1.5, "#2678c4", 5.1);
  roof.scale.set(1.15, 1, 0.9);
  cylinder(group, 0.55, 0.16, GOLD, [0, 4.12, 2.85], { segments: 24, faceForward: true, glow: 0.2 });
  door(group, 1.75);
  return { group, height: 6 };
}

function buildBonds(color: string, updaters: Updater[]): Built {
  const group = new THREE.Group();
  box(group, [6.2, 0.6, 4.8], color, [0, 0.3, 0]);
  box(group, [6, 3.6, 4.6], "#eaf5f2", [0, 2.4, 0]);
  box(group, [6.4, 0.35, 5], color, [0, 4.37, 0]);
  windowRow(group, [-1.9, 1.9], 1.6, 2.33);
  windowRow(group, [-1.9, 0, 1.9], 3.2, 2.33);
  door(group, 2.33);
  box(group, [1.9, 0.12, 0.9], color, [0, 2.35, 2.75]);
  cylinder(group, 0.06, 2.4, "#cfd8e3", [2.6, 5.7, 1.6], { segments: 6 });
  const flag = box(group, [1.1, 0.6, 0.04], color, [3.15, 6.55, 1.6]);
  updaters.push((time) => {
    flag.rotation.y = Math.sin(time * 3) * 0.25;
  });
  return { group, height: 7 };
}

function buildIndex(color: string, updaters: Updater[]): Built {
  const group = new THREE.Group();
  box(group, [7.6, 0.4, 5.6], "#e3dccd", [0, 0.2, 0]);
  box(group, [7, 3.6, 4.8], color, [0, 2.2, 0]);
  box(group, [7.3, 0.5, 5.1], GOLD, [0, 4.25, 0]);
  for (const x of [-2.2, 2.2]) box(group, [1.2, 2, 0.08], GOLD, [x, 2.1, 2.42], 0.45);
  door(group, 2.42);
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(2.1, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    paint(GOLD, 0.15),
  );
  add(group, dome, 0, 4.5, 0);
  cylinder(group, 0.08, 1, NAVY, [0, 7.1, 0], { segments: 6 });
  // A ring of small flags in every building's color says "you own a bit of everything".
  const flags = new THREE.Group();
  ASSETS.forEach((asset, index) => {
    const angle = (index / ASSETS.length) * Math.PI * 2;
    const x = Math.cos(angle) * 3;
    const z = Math.sin(angle) * 2.05;
    cylinder(flags, 0.04, 1.1, "#d8dee8", [x, 5.05, z], { segments: 5 });
    box(flags, [0.5, 0.32, 0.03], asset.color, [x + 0.26, 5.42, z]);
  });
  group.add(flags);
  updaters.push((time) => {
    flags.children.forEach((child, index) => {
      if (child instanceof THREE.Mesh && child.geometry instanceof THREE.BoxGeometry) {
        child.rotation.y = Math.sin(time * 3 + index) * 0.3;
      }
    });
  });
  return { group, height: 7.4 };
}

function buildSnacks(color: string, updaters: Updater[]): Built {
  const group = new THREE.Group();
  box(group, [6, 3.2, 4.4], "#fff3d6", [0, 1.6, 0]);
  box(group, [6.3, 0.3, 4.7], "#d97706", [0, 3.35, 0]);
  for (let index = 0; index < 6; index++) {
    const stripe = box(group, [1, 0.14, 1.4], index % 2 ? "#ffffff" : color, [-2.5 + index, 2.75, 2.75]);
    stripe.rotation.x = 0.35;
  }
  box(group, [3.4, 1.4, 0.08], "#cfeaff", [-1, 1.3, 2.21], 0.2);
  door(group, 2.21, 1.8);
  const sun = new THREE.Group();
  cylinder(sun, 1, 0.25, "#ffc21a", [0, 0, 0], { segments: 20, faceForward: true, glow: 0.35 });
  for (let index = 0; index < 10; index++) {
    const ray = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.55, 5), paint("#ffb000", 0.3));
    const angle = (index / 10) * Math.PI * 2;
    ray.position.set(Math.cos(angle) * 1.35, Math.sin(angle) * 1.35, 0);
    ray.rotation.z = angle - Math.PI / 2;
    sun.add(ray);
  }
  add(group, sun, 0, 5, 0);
  updaters.push((_, delta) => {
    sun.rotation.z += delta * 0.6;
  });
  return { group, height: 6.6 };
}

function buildBikes(color: string, updaters: Updater[]): Built {
  const group = new THREE.Group();
  box(group, [5.8, 0.5, 4.6], color, [0, 0.25, 0]);
  box(group, [5.6, 3.2, 4.4], "#fde8e1", [0, 2.1, 0]);
  box(group, [6, 0.35, 4.8], color, [0, 3.85, 0]);
  box(group, [2.8, 1.6, 0.08], "#cfeaff", [1.1, 1.75, 2.21], 0.2);
  door(group, 2.21, -1.6);
  const bike = new THREE.Group();
  const wheels = [-1.1, 1.1].map((x) => {
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.11, 8, 24), paint(NAVY));
    wheel.position.x = x;
    bike.add(wheel);
    return wheel;
  });
  const tube = (from: [number, number], to: [number, number], material = paint(color)) => {
    const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(length, 0.14, 0.14), material);
    mesh.position.set((from[0] + to[0]) / 2, (from[1] + to[1]) / 2, 0);
    mesh.rotation.z = Math.atan2(to[1] - from[1], to[0] - from[0]);
    bike.add(mesh);
  };
  tube([-1.1, 0], [-0.2, 0]);
  tube([-0.2, 0], [-0.45, 0.9]);
  tube([-1.1, 0], [-0.45, 0.9]);
  tube([-0.45, 0.9], [0.75, 0.9]);
  tube([-0.2, 0], [0.75, 0.9]);
  tube([1.1, 0], [0.8, 1.25]);
  tube([0.55, 1.3], [1.1, 1.3], paint(NAVY));
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.14, 0.3), paint(NAVY));
  seat.position.set(-0.5, 1.08, 0);
  bike.add(seat);
  add(group, bike, 0, 4.9, 0);
  updaters.push((_, delta) => {
    for (const wheel of wheels) wheel.rotation.z -= delta * 2.5;
  });
  return { group, height: 6.4 };
}

function pixelScreen(updaters: Updater[]) {
  const canvas = document.createElement("canvas");
  canvas.width = 24;
  canvas.height = 18;
  const context = canvas.getContext("2d")!;
  const sprite = [
    "..x.....x..",
    "...x...x...",
    "..xxxxxxx..",
    ".xx.xxx.xx.",
    "xxxxxxxxxxx",
    "x.xxxxxxx.x",
    "x.x.....x.x",
    "...xx.xx...",
  ];
  const draw = (frame: number) => {
    context.fillStyle = "#140a2e";
    context.fillRect(0, 0, 24, 18);
    context.fillStyle = frame ? "#ffca20" : "#7cf2b0";
    sprite.forEach((row, y) =>
      [...row].forEach((cell, x) => {
        if (cell === "x") context.fillRect(x + 6, y + 4 + frame, 1, 1);
      }),
    );
    context.fillStyle = "#e0457b";
    context.fillRect(2, 15, 20, 1);
  };
  draw(0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  let frame = 0;
  let next = 0;
  updaters.push((time) => {
    if (time < next) return;
    next = time + 0.5;
    frame = 1 - frame;
    draw(frame);
    texture.needsUpdate = true;
  });
  return texture;
}

function buildPixel(color: string, updaters: Updater[]): Built {
  const group = new THREE.Group();
  box(group, [5, 6.4, 4.4], "#2a1b4d", [0, 3.2, 0]);
  box(group, [5.3, 0.3, 4.7], color, [0, 6.55, 0]);
  box(group, [4, 3.3, 0.1], color, [0, 4.1, 2.2], 0.4);
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(3.6, 2.9),
    new THREE.MeshBasicMaterial({ map: pixelScreen(updaters) }),
  );
  screen.position.set(0, 4.1, 2.26);
  group.add(screen);
  door(group, 2.21);
  box(group, [1.5, 0.12, 0.12], color, [0, 2.3, 2.25], 0.8);
  const palette = ["#7cf2b0", GOLD, "#e0457b", "#5ab8ff"];
  const pixels: THREE.Mesh[] = [];
  for (let x = -1; x <= 1; x++) {
    for (let z = -1; z <= 1; z++) {
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.55, 0.55),
        new THREE.MeshStandardMaterial({ color: palette[0], emissive: palette[0], emissiveIntensity: 0.6, flatShading: true }),
      );
      pixels.push(add(group, cube, x * 0.9, 7, z * 0.9));
    }
  }
  let next = 0;
  updaters.push((time) => {
    if (time < next) return;
    next = time + 0.35;
    pixels.forEach((cube, index) => {
      const material = cube.material as THREE.MeshStandardMaterial;
      const color = palette[Math.floor(time * 3 + index * 1.7) % palette.length];
      material.color.set(color);
      material.emissive.set(color);
      cube.position.y = 7 + ((Math.floor(time * 3) + index) % 3 === 0 ? 0.25 : 0);
    });
  });
  return { group, height: 8.4 };
}

function buildRocket(color: string, updaters: Updater[]): Built {
  const group = new THREE.Group();
  box(group, [3.8, 2.4, 3], "#ffe0ec", [0, 1.2, 0]);
  box(group, [4.1, 0.3, 3.3], color, [0, 2.55, 0]);
  box(group, [3.8, 0.9, 0.5], color, [0, 0.9, 1.7]);
  const lights: THREE.Mesh[] = [];
  for (let index = 0; index < 7; index++) {
    lights.push(
      add(
        group,
        new THREE.Mesh(
          new THREE.SphereGeometry(0.12, 8, 6),
          new THREE.MeshStandardMaterial({ color: GOLD, emissive: GOLD, emissiveIntensity: 1 }),
        ),
        -1.8 + index * 0.6,
        2.4,
        1.68,
      ),
    );
  }
  const rocket = new THREE.Group();
  cylinder(rocket, 0.5, 2, "#ffffff", [0, 1, 0], { segments: 14 });
  add(rocket, new THREE.Mesh(new THREE.ConeGeometry(0.5, 1, 14), paint(color)), 0, 2.5, 0);
  cylinder(rocket, 0.22, 0.08, "#5ab8ff", [0, 1.35, 0.48], { segments: 12, faceForward: true, glow: 0.4 });
  for (let index = 0; index < 3; index++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 0.6), paint(color));
    const angle = (index / 3) * Math.PI * 2;
    fin.position.set(Math.cos(angle) * 0.5, 0.3, Math.sin(angle) * 0.5);
    fin.rotation.y = -angle;
    rocket.add(fin);
  }
  const flame = new THREE.Mesh(
    new THREE.ConeGeometry(0.32, 0.9, 10),
    new THREE.MeshBasicMaterial({ color: "#ff9a1f" }),
  );
  flame.rotation.x = Math.PI;
  flame.position.y = -0.4;
  rocket.add(flame);
  add(group, rocket, 0, 2.9, 0);
  updaters.push((time) => {
    rocket.rotation.z = Math.sin(time * 2.2) * 0.12;
    rocket.position.y = 2.9 + Math.sin(time * 3.1) * 0.12;
    flame.scale.y = 0.8 + Math.random() * 0.5;
    lights.forEach((light, index) => {
      (light.material as THREE.MeshStandardMaterial).emissiveIntensity =
        Math.floor(time * 4 + index) % 2 ? 1.2 : 0.1;
    });
  });
  return { group, height: 6.6 };
}

function buildClock(updaters: Updater[], spin: { speed: number }): Built {
  const group = new THREE.Group();
  box(group, [3.6, 0.6, 3.6], "#d8cfbd", [0, 0.3, 0]);
  box(group, [2.6, 8, 2.6], "#f3ebdc", [0, 4.6, 0]);
  box(group, [2.9, 0.35, 2.9], NAVY, [0, 6.4, 0]);
  box(group, [2.9, 0.35, 2.9], NAVY, [0, 8.75, 0]);
  door(group, 1.31);
  cylinder(group, 1, 0.1, "#ffffff", [0, 7.6, 1.32], { segments: 28, faceForward: true });
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1, 0.09, 6, 28), paint(NAVY));
  add(group, rim, 0, 7.6, 1.36);
  const hand = (length: number, width: number) => {
    const pivot = new THREE.Group();
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, length, 0.05), paint(NAVY));
    mesh.position.y = length / 2;
    pivot.add(mesh);
    add(group, pivot, 0, 7.6, 1.42);
    return pivot;
  };
  const hour = hand(0.5, 0.12);
  const minute = hand(0.78, 0.08);
  pyramid(group, 2.3, 2.2, NAVY, 10.05);
  add(group, new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 8), paint(GOLD, 0.3)), 0, 11.3, 0);
  updaters.push((_, delta) => {
    minute.rotation.z -= delta * (0.3 + spin.speed * 14);
    hour.rotation.z -= delta * (0.025 + spin.speed * 1.2);
    spin.speed = Math.max(0, spin.speed - delta * 0.4);
  });
  return { group, height: 11.6 };
}

function buildPenny() {
  const penny = new THREE.Group();
  const body = new THREE.Group();
  penny.add(body);
  const rim = new THREE.CylinderGeometry(0.75, 0.75, 0.28, 32);
  rim.rotateX(Math.PI / 2);
  add(body, new THREE.Mesh(rim, paint("#e9b810")));
  const face = new THREE.CylinderGeometry(0.62, 0.62, 0.32, 32);
  face.rotateX(Math.PI / 2);
  add(body, new THREE.Mesh(face, paint("#0173cc")));
  for (const x of [-0.2, 0.2]) {
    add(body, new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.14, 4, 10), paint("#ffffff")), x, 0.12, 0.165);
    add(body, new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.07, 4, 8), paint(NAVY)), x + 0.03, 0.1, 0.22);
  }
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.028, 6, 16, Math.PI), paint("#ffffff"));
  smile.rotation.z = Math.PI;
  add(body, smile, 0, -0.1, 0.17);
  const shine = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.025, 4, 24, Math.PI / 3), paint("#fff3b0", 0.3));
  shine.rotation.z = Math.PI / 2;
  add(body, shine, 0, 0, 0.15);
  return { penny, body };
}

function buildCoin(value: number, bonus: boolean) {
  const group = new THREE.Group();
  const geometry = new THREE.CylinderGeometry(0.5, 0.5, 0.12, 28);
  geometry.rotateX(Math.PI / 2);
  const coin = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.45, roughness: 0.35, emissive: "#8a6200", emissiveIntensity: 0.35 }),
  );
  coin.castShadow = true;
  const inner = new THREE.Mesh(
    new THREE.TorusGeometry(0.36, 0.035, 6, 24),
    new THREE.MeshStandardMaterial({ color: "#e9b810", metalness: 0.4, roughness: 0.4 }),
  );
  coin.add(inner);
  group.add(coin);
  if (bonus) {
    group.scale.setScalar(1.6);
    const halo = new THREE.Mesh(
      new THREE.RingGeometry(0.55, 0.75, 32),
      new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.6, side: THREE.DoubleSide }),
    );
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = -0.55;
    group.add(halo);
  }
  group.userData.value = value;
  return group;
}

function label(text: string, detail: string, color: string) {
  const element = document.createElement("div");
  element.className = "world-label";
  const dot = document.createElement("i");
  dot.style.background = color;
  const name = document.createElement("span");
  name.textContent = text;
  const small = document.createElement("small");
  small.textContent = detail;
  element.append(dot, name, small);
  return element;
}

export async function createWorld(
  host: HTMLElement,
  overlay: HTMLElement,
  minimap: HTMLCanvasElement,
  events: WorldEvents,
): Promise<World> {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.domElement.className = "world-canvas";
  host.prepend(renderer.domElement);

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(SKY);
  scene.fog = new THREE.Fog(SKY, 70, 150);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 300);
  const updaters: Updater[] = [];
  const clockSpin = { speed: 0 };

  const hemi = new THREE.HemisphereLight("#e8f6ff", "#7fae5e", 1.9);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight("#fff6e0", 2.4);
  sun.position.set(-18, 34, 20);
  sun.castShadow = true;
  const shadowSize = Math.min(window.innerWidth, window.innerHeight) < 640 ? 1024 : 2048;
  sun.shadow.mapSize.set(shadowSize, shadowSize);
  Object.assign(sun.shadow.camera, { left: -32, right: 32, top: 32, bottom: -32, near: 1, far: 90 });
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.03;
  scene.add(sun);

  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 400),
    new THREE.MeshStandardMaterial({ color: "#59c0ee", roughness: 0.4 }),
  );
  water.rotation.x = -Math.PI / 2;
  water.position.y = -1.3;
  scene.add(water);
  box(scene, [61, 1.6, 61], "#e6d3a3", [0, -1, 0]);
  const grass = box(scene, [58, 0.4, 58], "#8fd16f", [0, -0.2, 0]);
  grass.castShadow = false;
  const plaza = cylinder(scene, 9.2, 0.08, STONE, [0, 0.04, 0], { segments: 48 });
  plaza.castShadow = false;
  const plazaRing = new THREE.Mesh(new THREE.RingGeometry(6.3, 6.7, 48), paint("#dcd2bd"));
  plazaRing.rotation.x = -Math.PI / 2;
  add(scene, plazaRing, 0, 0.09, 0);

  for (const degrees of Object.values(SLOTS)) {
    const path = box(scene, [2.4, 0.06, 5.6], STONE, [0, 0.04, 0]);
    path.position.copy(onRing(degrees, 11.6)).setY(0.04);
    path.rotation.y = -THREE.MathUtils.degToRad(degrees);
    path.castShadow = false;
  }

  const fountain = new THREE.Group();
  cylinder(fountain, 2.6, 0.6, "#d8cfbd", [0, 0.3, 0], { segments: 24 });
  cylinder(fountain, 2.25, 0.1, "#69c7f0", [0, 0.58, 0], { segments: 24 });
  cylinder(fountain, 0.45, 1.6, "#d8cfbd", [0, 1.3, 0], { segments: 10 });
  const statue = cylinder(fountain, 0.85, 0.22, GOLD, [0, 2.95, 0], { segments: 28, faceForward: true, glow: 0.15 });
  cylinder(statue, 0.68, 0.24, "#0173cc", [0, 0, 0], { segments: 28, faceForward: true });
  scene.add(fountain);
  updaters.push((_, delta) => {
    statue.rotation.y += delta * 0.8;
  });

  const obstacles: { x: number; z: number; r: number }[] = [
    { x: 0, z: 0, r: 2.7 },
  ];
  const zones = new Map<ZoneId, { center: THREE.Vector3; ring: THREE.Mesh; label: HTMLDivElement; anchor: THREE.Vector3; building: THREE.Group }>();
  const clickable: THREE.Object3D[] = [];

  const builders: Record<AssetId, (color: string) => Built> = {
    bank: (color) => buildBank(color),
    bonds: (color) => buildBonds(color, updaters),
    index: (color) => buildIndex(color, updaters),
    snacks: (color) => buildSnacks(color, updaters),
    bikes: (color) => buildBikes(color, updaters),
    pixel: (color) => buildPixel(color, updaters),
    rocket: (color) => buildRocket(color, updaters),
  };

  const placeZone = (id: ZoneId, built: Built, color: string, name: string, kind: string) => {
    const degrees = SLOTS[id];
    const position = onRing(degrees, RING);
    built.group.position.copy(position);
    built.group.rotation.y = Math.atan2(-position.x, -position.z);
    built.group.userData.zone = id;
    scene.add(built.group);
    clickable.push(built.group);
    obstacles.push({ x: position.x, z: position.z, r: id === "clock" ? 2.4 : id === "rocket" ? 3 : 3.9 });

    const center = onRing(degrees, ZONE_RING);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(1.25, 1.6, 40),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85 }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.copy(center).setY(0.1);
    const fill = new THREE.Mesh(
      new THREE.CircleGeometry(1.25, 40),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.18 }),
    );
    ring.add(fill);
    scene.add(ring);

    const element = label(name, kind, color);
    overlay.append(element);
    zones.set(id, {
      center,
      ring,
      label: element,
      anchor: position.clone().setY(built.height + 0.6),
      building: built.group,
    });
  };

  for (const asset of ASSETS) {
    placeZone(asset.id, builders[asset.id](asset.color), asset.color, asset.name, asset.kind);
  }
  placeZone("clock", buildClock(updaters, clockSpin), GOLD, "Clock Tower", "Skip to next year");

  const treeRng = createRng(2024);
  const trees: { x: number; z: number; scale: number }[] = [];
  for (let index = 0; index < 8; index++) {
    const spot = onRing(22.5 + index * 45, 17.5);
    trees.push({ x: spot.x, z: spot.z, scale: 1.2 + treeRng() * 0.3 });
  }
  for (let index = 0; index < 44; index++) {
    const spot = onRing(index * (360 / 44) + treeRng() * 5, 22 + treeRng() * 4.5);
    trees.push({ x: spot.x, z: spot.z, scale: 0.9 + treeRng() * 0.7 });
  }
  const trunkGeometry = new THREE.CylinderGeometry(0.18, 0.26, 1.3, 6);
  const crownGeometry = new THREE.IcosahedronGeometry(1, 0);
  const trunks = new THREE.InstancedMesh(trunkGeometry, paint("#8a5a3b"), trees.length);
  const crowns = new THREE.InstancedMesh(crownGeometry, new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.9 }), trees.length);
  const greens = ["#4caf50", "#3e9b4f", "#62bd5a", "#2f8a4a"].map((color) => new THREE.Color(color));
  const matrix = new THREE.Matrix4();
  trees.forEach((tree, index) => {
    matrix.compose(new THREE.Vector3(tree.x, 0.65 * tree.scale, tree.z), new THREE.Quaternion(), new THREE.Vector3(tree.scale, tree.scale, tree.scale));
    trunks.setMatrixAt(index, matrix);
    matrix.compose(
      new THREE.Vector3(tree.x, 1.9 * tree.scale, tree.z),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(0, treeRng() * Math.PI, 0)),
      new THREE.Vector3(tree.scale * 1.15, tree.scale * 1.3, tree.scale * 1.15),
    );
    crowns.setMatrixAt(index, matrix);
    crowns.setColorAt(index, greens[index % greens.length]);
    obstacles.push({ x: tree.x, z: tree.z, r: 0.55 * tree.scale });
  });
  for (const mesh of [trunks, crowns]) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
  }

  for (let index = 0; index < 8; index++) {
    const spot = onRing(22.5 + index * 45, 10.2);
    cylinder(scene, 0.08, 2.6, NAVY, [spot.x, 1.3, spot.z], { segments: 6 });
    add(scene, new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), paint("#fff1b8", 0.9)), spot.x, 2.75, spot.z);
  }

  const clouds: THREE.Group[] = [];
  for (let index = 0; index < 7; index++) {
    const cloud = new THREE.Group();
    for (let puff = 0; puff < 4; puff++) {
      const sphere = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4 + treeRng(), 1), paint("#ffffff"));
      sphere.position.set(puff * 1.6 - 2.4, treeRng() * 0.6, treeRng() - 0.5);
      cloud.add(sphere);
    }
    // Clouds stay over the water to the north so they never drift between the camera and the town.
    cloud.position.set(-70 + index * 20 + treeRng() * 8, 9 + treeRng() * 5, -38 - treeRng() * 16);
    scene.add(cloud);
    clouds.push(cloud);
  }
  updaters.push((_, delta) => {
    for (const cloud of clouds) {
      cloud.position.x += delta * 0.8;
      if (cloud.position.x > 70) cloud.position.x = -70;
    }
  });

  const { penny, body } = buildPenny();
  add(scene, penny, START.x, 0, START.z);

  const marker = new THREE.Mesh(
    new THREE.RingGeometry(0.35, 0.55, 28),
    new THREE.MeshBasicMaterial({ color: NAVY, transparent: true, opacity: 0 }),
  );
  marker.rotation.x = -Math.PI / 2;
  marker.position.y = 0.12;
  scene.add(marker);

  const hidden = new THREE.Matrix4().makeScale(0, 0, 0);
  const placeInstance = new THREE.Object3D();

  type Spark = { position: THREE.Vector3; velocity: THREE.Vector3; life: number };
  const sparks: Spark[] = Array.from({ length: 60 }, () => ({ position: new THREE.Vector3(), velocity: new THREE.Vector3(), life: 0 }));
  const sparkMesh = new THREE.InstancedMesh(
    new THREE.OctahedronGeometry(0.13, 0),
    new THREE.MeshBasicMaterial({ color: GOLD }),
    sparks.length,
  );
  sparks.forEach((_, index) => sparkMesh.setMatrixAt(index, hidden));
  scene.add(sparkMesh);
  let nextSpark = 0;
  const burst = (at: THREE.Vector3) => {
    for (let count = 0; count < 12; count++) {
      const spark = sparks[nextSpark];
      nextSpark = (nextSpark + 1) % sparks.length;
      const angle = (count / 12) * Math.PI * 2;
      spark.position.copy(at);
      spark.velocity.set(Math.cos(angle) * 3.2, 4 + Math.random() * 2.5, Math.sin(angle) * 3.2);
      spark.life = 0.7;
    }
  };
  updaters.push((_, delta) => {
    sparks.forEach((spark, index) => {
      if (spark.life <= 0) return;
      spark.life -= delta;
      spark.velocity.y -= 14 * delta;
      spark.position.addScaledVector(spark.velocity, delta);
      if (spark.life <= 0) {
        sparkMesh.setMatrixAt(index, hidden);
        return;
      }
      placeInstance.position.copy(spark.position);
      placeInstance.rotation.set(spark.life * 9, spark.life * 7, 0);
      placeInstance.scale.setScalar(spark.life / 0.7);
      placeInstance.updateMatrix();
      sparkMesh.setMatrixAt(index, placeInstance.matrix);
    });
    sparkMesh.instanceMatrix.needsUpdate = true;
  });

  let weather: "rain" | "confetti" | null = null;
  const RAIN_DROPS = 700;
  const rainPositions = new Float32Array(RAIN_DROPS * 6);
  for (let index = 0; index < RAIN_DROPS; index++) {
    const x = (Math.random() - 0.5) * 64;
    const y = Math.random() * 34;
    const z = (Math.random() - 0.5) * 64;
    rainPositions.set([x, y, z, x + 0.15, y + 1.1, z], index * 6);
  }
  const rainGeometry = new THREE.BufferGeometry();
  rainGeometry.setAttribute("position", new THREE.BufferAttribute(rainPositions, 3));
  const rain = new THREE.LineSegments(
    rainGeometry,
    new THREE.LineBasicMaterial({ color: "#dfe9f5", transparent: true, opacity: 0.65 }),
  );
  rain.visible = false;
  scene.add(rain);

  const CONFETTI = 240;
  const confettiPalette = [GOLD, ...ASSETS.map((asset) => asset.color), "#ffffff"].map((color) => new THREE.Color(color));
  const confettiMesh = new THREE.InstancedMesh(
    new THREE.PlaneGeometry(0.42, 0.24),
    new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }),
    CONFETTI,
  );
  const confetti = Array.from({ length: CONFETTI }, (_, index) => {
    confettiMesh.setColorAt(index, confettiPalette[index % confettiPalette.length]);
    return {
      position: new THREE.Vector3((Math.random() - 0.5) * 56, 8 + Math.random() * 26, (Math.random() - 0.5) * 56),
      spin: new THREE.Vector3(Math.random() * 6, Math.random() * 6, Math.random() * 6),
      speed: 2.5 + Math.random() * 2.5,
    };
  });
  confettiMesh.visible = false;
  scene.add(confettiMesh);

  updaters.push((time, delta) => {
    if (weather === "rain") {
      for (let index = 0; index < RAIN_DROPS; index++) {
        const base = index * 6;
        let y = rainPositions[base + 1] - delta * 32;
        if (y < 0) y += 34;
        rainPositions[base + 1] = y;
        rainPositions[base + 4] = y + 1.1;
      }
      rainGeometry.attributes.position.needsUpdate = true;
    }
    if (weather === "confetti") {
      confetti.forEach((piece, index) => {
        piece.position.y -= delta * piece.speed;
        piece.position.x += Math.sin(time * 2 + index) * delta * 0.8;
        if (piece.position.y < 0.2) piece.position.y += 30;
        placeInstance.position.copy(piece.position);
        placeInstance.rotation.set(time * piece.spin.x, time * piece.spin.y, time * piece.spin.z);
        placeInstance.scale.setScalar(1);
        placeInstance.updateMatrix();
        confettiMesh.setMatrixAt(index, placeInstance.matrix);
      });
      confettiMesh.instanceMatrix.needsUpdate = true;
    }
  });

  const mood = { sky: new THREE.Color(SKY), sun: 2.4, hemi: 1.9 };
  const setMood = (economy: Economy) => {
    const next = MOODS[economy];
    mood.sky.set(next.sky);
    mood.sun = next.sun;
    mood.hemi = next.hemi;
    weather = reducedMotion ? null : next.weather;
    rain.visible = weather === "rain";
    confettiMesh.visible = weather === "confetti";
  };
  updaters.push((_, delta) => {
    const blend = reducedMotion ? 1 : 1 - Math.exp(-delta * 2);
    (scene.background as THREE.Color).lerp(mood.sky, blend);
    scene.fog!.color.copy(scene.background as THREE.Color);
    sun.intensity += (mood.sun - sun.intensity) * blend;
    hemi.intensity += (mood.hemi - hemi.intensity) * blend;
  });

  // Movement and camera state
  const keys = new Set<string>();
  let target: THREE.Vector3 | null = null;
  let controls = false;
  let overview = false;
  let panelOpen = false;
  let currentZone: ZoneId | null = null;
  let yaw = 0;
  let walkPhase = 0;
  const cameraFocus = penny.position.clone();
  const cameraOffset = new THREE.Vector3(0, 23, 18);
  let width = 1;
  let height = 1;

  type LiveCoin = { group: THREE.Group; value: number; phase: number; picked: number | null };
  let coins: LiveCoin[] = [];
  const bounces = new Map<THREE.Group, { start: number; sign: number }>();
  const pops: { element: HTMLDivElement; anchor: THREE.Vector3; until: number }[] = [];
  const returnTags: { element: HTMLDivElement; anchor: THREE.Vector3 }[] = [];

  const resize = () => {
    width = host.clientWidth;
    height = host.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    const portrait = camera.aspect < 0.85;
    camera.fov = portrait ? 56 : camera.aspect < 1.25 ? 48 : 40;
    cameraOffset.set(0, portrait ? 28 : 23, portrait ? 20 : 18);
    camera.updateProjectionMatrix();
  };
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);

  let visible = true;
  const visibility = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  });
  visibility.observe(host);

  camera.position.copy(penny.position).add(cameraOffset);
  camera.lookAt(cameraFocus);

  const projected = new THREE.Vector3();
  const placeOnScreen = (element: HTMLElement, anchor: THREE.Vector3) => {
    projected.copy(anchor).project(camera);
    if (projected.z > 1 || Math.abs(projected.x) > 1.3 || Math.abs(projected.y) > 1.3) {
      element.style.visibility = "hidden";
      return;
    }
    element.style.visibility = "visible";
    element.style.transform = `translate(${(projected.x * 0.5 + 0.5) * width}px, ${(-projected.y * 0.5 + 0.5) * height}px) translate(-50%, -100%)`;
  };

  const blocked = (x: number, z: number) =>
    obstacles.some((obstacle) => Math.hypot(x - obstacle.x, z - obstacle.z) < obstacle.r + 1.2);

  const raycaster = new THREE.Raycaster();
  const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const pointer = new THREE.Vector2();

  const walkTo = (zone: ZoneId) => {
    const entry = zones.get(zone);
    if (!entry) return;
    if (zone === currentZone) {
      events.onZone(zone);
      return;
    }
    keys.clear();
    target = entry.center.clone();
  };

  const aimAt = (event: PointerEvent) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
  };

  const walkToPoint = (x: number, z: number) => {
    target = new THREE.Vector3(THREE.MathUtils.clamp(x, -BOUND, BOUND), 0, THREE.MathUtils.clamp(z, -BOUND, BOUND));
    marker.position.set(target.x, 0.12, target.z);
    (marker.material as THREE.MeshBasicMaterial).opacity = 0.9;
  };

  // Holding the pointer down keeps steering toward it, which feels better than repeated taps on a tablet.
  let steering: number | null = null;
  const onPointerDown = (event: PointerEvent) => {
    if (!controls || event.button !== 0) return;
    aimAt(event);
    const hit = raycaster.intersectObjects(clickable, true)[0];
    if (hit) {
      let object: THREE.Object3D | null = hit.object;
      while (object && !object.userData.zone) object = object.parent;
      if (object) {
        walkTo(object.userData.zone as ZoneId);
        return;
      }
    }
    const point = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(ground, point)) {
      walkToPoint(point.x, point.z);
      steering = event.pointerId;
      renderer.domElement.setPointerCapture(event.pointerId);
    }
  };
  const onPointerMove = (event: PointerEvent) => {
    if (steering !== event.pointerId || !controls) return;
    aimAt(event);
    const point = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(ground, point)) walkToPoint(point.x, point.z);
  };
  const onPointerUp = (event: PointerEvent) => {
    if (steering === event.pointerId) steering = null;
  };
  renderer.domElement.addEventListener("pointerdown", onPointerDown);
  renderer.domElement.addEventListener("pointermove", onPointerMove);
  renderer.domElement.addEventListener("pointerup", onPointerUp);
  renderer.domElement.addEventListener("pointercancel", onPointerUp);

  const map = minimap.getContext("2d")!;
  const MAP_SIZE = 132;
  const mapScale = MAP_SIZE / 58;
  const toMap = (value: number) => MAP_SIZE / 2 + value * mapScale;
  const pixelRatio = Math.min(window.devicePixelRatio, 2);
  minimap.width = MAP_SIZE * pixelRatio;
  minimap.height = MAP_SIZE * pixelRatio;
  const drawMinimap = (time: number) => {
    map.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    map.clearRect(0, 0, MAP_SIZE, MAP_SIZE);
    map.fillStyle = "#8fd16f";
    map.beginPath();
    map.roundRect(2, 2, MAP_SIZE - 4, MAP_SIZE - 4, 14);
    map.fill();
    map.fillStyle = STONE;
    map.beginPath();
    map.arc(toMap(0), toMap(0), 9.2 * mapScale, 0, Math.PI * 2);
    map.fill();
    for (const [id, zone] of zones) {
      const building = zone.building.position;
      map.fillStyle = id === "clock" ? GOLD : ASSETS.find((asset) => asset.id === id)!.color;
      map.beginPath();
      map.arc(toMap(building.x), toMap(building.z), id === currentZone ? 7 : 5.5, 0, Math.PI * 2);
      map.fill();
      map.strokeStyle = "#ffffff";
      map.lineWidth = 1.5;
      map.stroke();
    }
    map.fillStyle = GOLD;
    map.strokeStyle = NAVY;
    map.lineWidth = 1;
    for (const coin of coins) {
      if (coin.picked !== null) continue;
      const pulse = 2.4 + Math.sin(time * 4 + coin.phase) * 0.6;
      map.beginPath();
      map.arc(toMap(coin.group.position.x), toMap(coin.group.position.z), pulse, 0, Math.PI * 2);
      map.fill();
      map.stroke();
    }
    const x = toMap(penny.position.x);
    const z = toMap(penny.position.z);
    map.fillStyle = "#0173cc";
    map.strokeStyle = "#ffffff";
    map.lineWidth = 2;
    map.beginPath();
    map.arc(x, z, 4.5, 0, Math.PI * 2);
    map.fill();
    map.stroke();
  };
  const onMinimapDown = (event: PointerEvent) => {
    if (!controls) return;
    const rect = minimap.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * MAP_SIZE;
    const z = ((event.clientY - rect.top) / rect.height) * MAP_SIZE;
    const worldX = (x - MAP_SIZE / 2) / mapScale;
    const worldZ = (z - MAP_SIZE / 2) / mapScale;
    for (const [id, zone] of zones) {
      if (Math.hypot(zone.building.position.x - worldX, zone.building.position.z - worldZ) < 4) {
        walkTo(id);
        return;
      }
    }
    walkToPoint(worldX, worldZ);
  };
  minimap.addEventListener("pointerdown", onMinimapDown);

  const move = (delta: number) => {
    let dx = 0;
    let dz = 0;
    for (const code of keys) {
      const direction = KEY_DIRECTIONS[code];
      if (direction) {
        dx += direction[0];
        dz += direction[1];
      }
    }
    if (dx || dz) target = null;
    if (target) {
      dx = target.x - penny.position.x;
      dz = target.z - penny.position.z;
      if (Math.hypot(dx, dz) < 0.15) {
        target = null;
        dx = 0;
        dz = 0;
      }
    }
    const length = Math.hypot(dx, dz);
    const moving = controls && length > 0;
    if (moving) {
      const step = Math.min(SPEED * delta, target ? length : Infinity);
      penny.position.x += (dx / length) * step;
      penny.position.z += (dz / length) * step;
      for (const obstacle of obstacles) {
        const ox = penny.position.x - obstacle.x;
        const oz = penny.position.z - obstacle.z;
        const distance = Math.hypot(ox, oz);
        const minimum = obstacle.r + PLAYER_RADIUS;
        if (distance < minimum && distance > 0.0001) {
          penny.position.x = obstacle.x + (ox / distance) * minimum;
          penny.position.z = obstacle.z + (oz / distance) * minimum;
        }
      }
      penny.position.x = THREE.MathUtils.clamp(penny.position.x, -BOUND, BOUND);
      penny.position.z = THREE.MathUtils.clamp(penny.position.z, -BOUND, BOUND);
      yaw = Math.atan2(dx, dz);
      walkPhase += delta * 13;
    }
    const facing = moving ? yaw : 0;
    let turn = facing - penny.rotation.y;
    turn = Math.atan2(Math.sin(turn), Math.cos(turn));
    penny.rotation.y += turn * Math.min(1, delta * 10);
    const hop = moving && !reducedMotion ? Math.abs(Math.sin(walkPhase)) * 0.35 : 0;
    // Squash a little on each landing so the hop feels springy.
    const landing = moving && !reducedMotion ? 1 - Math.min(1, hop / 0.1) : 0;
    body.position.y = 0.8 + hop;
    body.scale.set(1 + landing * 0.1, 1 - landing * 0.12, 1);
    body.rotation.x = moving ? 0.12 : 0;
    return moving;
  };

  const checkZone = () => {
    let found: ZoneId | null = null;
    for (const [id, zone] of zones) {
      if (Math.hypot(penny.position.x - zone.center.x, penny.position.z - zone.center.z) < ZONE_RADIUS) {
        found = id;
      }
    }
    if (found !== currentZone) {
      if (currentZone) zones.get(currentZone)!.label.classList.remove("is-active");
      if (found) zones.get(found)!.label.classList.add("is-active");
      currentZone = found;
      events.onZone(found);
    }
  };

  const collectCoins = (time: number) => {
    for (const coin of coins) {
      if (coin.picked !== null) continue;
      const distance = Math.hypot(penny.position.x - coin.group.position.x, penny.position.z - coin.group.position.z);
      if (distance < 1.25) {
        coin.picked = time;
        burst(coin.group.position);
        events.onCoin(coin.value);
        const element = document.createElement("div");
        element.className = "world-pop";
        element.textContent = `+$${coin.value}`;
        overlay.append(element);
        pops.push({ element, anchor: coin.group.position.clone().setY(2.2), until: time + 0.9 });
      }
    }
  };

  const animateCoins = (time: number, delta: number) => {
    coins = coins.filter((coin) => {
      if (coin.picked === null) {
        coin.group.rotation.y += delta * 2.6;
        coin.group.position.y = 1 + Math.sin(time * 2.2 + coin.phase) * 0.15;
        return true;
      }
      const progress = (time - coin.picked) / 0.35;
      if (progress >= 1) {
        scene.remove(coin.group);
        return false;
      }
      coin.group.position.y += delta * 7;
      coin.group.rotation.y += delta * 16;
      coin.group.scale.setScalar((coin.group.userData.baseScale as number) * (1 - progress * 0.8));
      return true;
    });
  };

  const desiredFocus = new THREE.Vector3();
  const desiredPosition = new THREE.Vector3();
  const animateCamera = (delta: number) => {
    if (overview) {
      desiredFocus.set(0, 0, -1.5);
      desiredPosition.set(0, camera.aspect < 0.85 ? 74 : 40, camera.aspect < 0.85 ? 40 : 30);
    } else {
      // Slide the view so Penny stays visible beside the side panel, or above the bottom sheet on phones.
      desiredFocus.copy(penny.position);
      if (panelOpen) {
        if (camera.aspect >= 1) desiredFocus.x += 6.5;
        else desiredFocus.z += 8;
      }
      desiredPosition.copy(desiredFocus).add(cameraOffset);
    }
    const blend = reducedMotion ? 1 : 1 - Math.exp(-delta * (overview ? 2.2 : 4.5));
    cameraFocus.lerp(desiredFocus, blend);
    camera.position.lerp(desiredPosition, blend);
    camera.lookAt(cameraFocus);
  };

  let frame = 0;
  let last = performance.now();
  const loop = (now: number) => {
    frame = requestAnimationFrame(loop);
    const delta = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!visible || document.hidden) return;
    const time = now / 1000;

    move(delta);
    if (controls) {
      checkZone();
      collectCoins(time);
    }
    animateCoins(time, delta);
    for (const updater of updaters) updater(time, delta);

    for (const [id, zone] of zones) {
      const active = id === currentZone;
      const pulse = reducedMotion ? 1 : 1 + Math.sin(time * 3) * 0.05;
      zone.ring.scale.setScalar(active ? 1.18 : pulse);
      (zone.ring.material as THREE.MeshBasicMaterial).opacity = active ? 1 : 0.8;
    }
    for (const [group, bounce] of bounces) {
      const progress = (time - bounce.start) / 0.7;
      if (progress >= 1) {
        group.scale.set(1, 1, 1);
        bounces.delete(group);
      } else {
        const wave = Math.sin(progress * Math.PI) * (1 - progress * 0.5);
        group.scale.set(1 - bounce.sign * wave * 0.04, 1 + bounce.sign * wave * 0.14, 1 - bounce.sign * wave * 0.04);
      }
    }
    const markerMaterial = marker.material as THREE.MeshBasicMaterial;
    markerMaterial.opacity = Math.max(0, markerMaterial.opacity - delta * 1.5);

    animateCamera(delta);
    if (minimap.offsetParent) drawMinimap(time);
    for (const zone of zones.values()) placeOnScreen(zone.label, zone.anchor);
    for (const tag of returnTags) placeOnScreen(tag.element, tag.anchor);
    for (let index = pops.length - 1; index >= 0; index--) {
      const pop = pops[index];
      if (time > pop.until) {
        pop.element.remove();
        pops.splice(index, 1);
      } else {
        placeOnScreen(pop.element, pop.anchor);
      }
    }
    renderer.render(scene, camera);
  };
  frame = requestAnimationFrame(loop);

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const clearReturnTags = () => {
    for (const tag of returnTags) tag.element.remove();
    returnTags.length = 0;
  };

  return {
    spawnCoins(values, seed) {
      for (const coin of coins) scene.remove(coin.group);
      coins = [];
      const rng = createRng(seed);
      const placed: { x: number; z: number }[] = [];
      values.forEach((value, index) => {
        const bonus = index === values.length - 1;
        for (let attempt = 0; attempt < 200; attempt++) {
          const spot = onRing(rng() * 360, bonus ? 20 + rng() * 4 : 4 + rng() * 17);
          const nearZone = [...zones.values()].some((zone) => spot.distanceTo(zone.center) < 2.4);
          const nearCoin = placed.some((other) => Math.hypot(spot.x - other.x, spot.z - other.z) < 3);
          const nearPlayer = spot.distanceTo(penny.position) < 2.5;
          if (blocked(spot.x, spot.z) || nearZone || nearCoin || nearPlayer) continue;
          const group = buildCoin(value, bonus);
          group.userData.baseScale = bonus ? 1.6 : 1;
          group.position.set(spot.x, 1, spot.z);
          scene.add(group);
          coins.push({ group, value, phase: rng() * 6, picked: null });
          placed.push(spot);
          break;
        }
      });
    },
    walkTo,
    setKey(code, down) {
      if (!KEY_DIRECTIONS[code]) return;
      if (down) keys.add(code);
      else keys.delete(code);
    },
    releaseKeys() {
      keys.clear();
    },
    setPanelOpen(open) {
      panelOpen = open;
    },
    setLabelDetails(details) {
      for (const [id, text] of Object.entries(details)) {
        const detail = zones.get(id as ZoneId)?.label.querySelector("small");
        if (detail && text) detail.textContent = text;
      }
    },
    setControls(enabled) {
      controls = enabled;
      if (!enabled) {
        keys.clear();
        target = null;
      }
    },
    async playYearEnd(returns, economy) {
      controls = false;
      keys.clear();
      target = null;
      steering = null;
      overview = true;
      setMood(economy);
      overlay.classList.add("is-overview");
      clockSpin.speed = 1;
      for (const coin of coins) coin.picked = coin.picked ?? performance.now() / 1000 - 0.3;
      await wait(reducedMotion ? 150 : 1100);
      for (const asset of ASSETS) {
        const zone = zones.get(asset.id)!;
        const change = returns[asset.id];
        const element = document.createElement("div");
        element.className = `world-return ${change >= 0 ? "is-up" : "is-down"}`;
        element.textContent = `${change >= 0 ? "+" : "−"}${Math.abs(change * 100).toFixed(1)}%`;
        overlay.append(element);
        returnTags.push({ element, anchor: zone.anchor });
        bounces.set(zone.building, { start: performance.now() / 1000, sign: change >= 0 ? 1 : -1 });
        await wait(reducedMotion ? 0 : 140);
      }
      await wait(reducedMotion ? 300 : 1800);
    },
    startYear() {
      clearReturnTags();
      setMood("normal");
      overview = false;
      overlay.classList.remove("is-overview");
      controls = true;
    },
    resetPlayer() {
      penny.position.copy(START);
      penny.rotation.y = 0;
      target = null;
      keys.clear();
      currentZone = null;
      for (const zone of zones.values()) zone.label.classList.remove("is-active");
    },
    dispose() {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibility.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointercancel", onPointerUp);
      minimap.removeEventListener("pointerdown", onMinimapDown);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
          object.geometry.dispose();
          const material = object.material as THREE.Material & { map?: THREE.Texture | null };
          material.map?.dispose();
          material.dispose();
        }
      });
      materials.clear();
      renderer.dispose();
      renderer.domElement.remove();
      for (const zone of zones.values()) zone.label.remove();
      for (const pop of pops) pop.element.remove();
      clearReturnTags();
    },
  };
}
