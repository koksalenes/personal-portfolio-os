"use client";

import { persistentStore } from "./session";

export type DockerStatus = "running" | "starting" | "stopped";

export type Container = {
  name: string;
  image: string;
  ports: string;
};

export const containers: Container[] = [
  { name: "web", image: "node:22-alpine", ports: "3000:3000" },
  {
    name: "api-dotnet",
    image: "mcr.microsoft.com/dotnet/aspnet:10.0",
    ports: "5000:8080",
  },
  { name: "api-nest", image: "node:22-alpine", ports: "4001:3000" },
  { name: "api-java", image: "eclipse-temurin:21-jre", ports: "8081:8080" },
  { name: "worker-node", image: "node:22-alpine", ports: "4000:4000" },
  { name: "postgres", image: "postgres:18.3", ports: "5432:5432" },
  { name: "redis", image: "redis:7.4-alpine", ports: "6379:6379" },
  { name: "rabbitmq", image: "rabbitmq:4-management", ports: "5672:5672" },
];

export type DockerState = {
  status: DockerStatus;
  stopped: string[];
  startOnLogin: boolean;
  cpus: number;
  memoryGb: number;
};

export const dockerStore = persistentStore<DockerState>("docker", {
  status: "running",
  stopped: [],
  startOnLogin: true,
  cpus: 4,
  memoryGb: 8,
});

const patch = (next: Partial<DockerState>) =>
  dockerStore.write({ ...dockerStore.read(), ...next });

let timer: ReturnType<typeof setTimeout> | undefined;

export function startDocker(onReady?: () => void) {
  clearTimeout(timer);
  patch({ status: "starting" });
  timer = setTimeout(() => {
    patch({ status: "running" });
    onReady?.();
  }, 2800);
}

export function stopDocker() {
  clearTimeout(timer);
  patch({ status: "stopped" });
}

export function toggleContainer(name: string) {
  const { stopped } = dockerStore.read();
  patch({
    stopped: stopped.includes(name)
      ? stopped.filter((n) => n !== name)
      : [...stopped, name],
  });
}

export const setDocker = patch;

export function dockerPs(): string[] {
  const { status, stopped } = dockerStore.read();
  if (status !== "running")
    return [
      "Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?",
    ];
  const rows = containers.filter((c) => !stopped.includes(c.name));
  const pad = (s: string, n: number) => s.padEnd(n, " ");
  return [
    `${pad("CONTAINER ID", 14)}${pad("IMAGE", 38)}${pad("STATUS", 14)}${pad("PORTS", 12)}NAMES`,
    ...rows.map(
      (c, i) =>
        `${pad((0x3f2a91c + i * 0x1b7d).toString(16).padStart(12, "0"), 14)}${pad(c.image, 38)}${pad("Up 3 hours", 14)}${pad(c.ports, 12)}${c.name}`,
    ),
  ];
}
