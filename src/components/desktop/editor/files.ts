import { site } from "@/config/site";
import { heroStack } from "@/lib/data";

export type TreeNode =
  | { kind: "folder"; name: string; path: string; children: TreeNode[] }
  | { kind: "file"; name: string; path: string };

export const PAGE_PATH = "apps/web-next/src/app/page.tsx";
export const README_PATH = "README.md";

const file = (path: string): TreeNode => ({
  kind: "file",
  name: path.split("/").at(-1) ?? path,
  path,
});

const folder = (
  name: string,
  path: string,
  children: TreeNode[],
): TreeNode => ({ kind: "folder", name, path, children });

export const tree: TreeNode[] = [
  folder("apps", "apps", [
    folder("web-react", "apps/web-react", [
      file("apps/web-react/src/main.tsx"),
      file("apps/web-react/src/App.tsx"),
      file("apps/web-react/vite.config.ts"),
    ]),
    folder("web-next", "apps/web-next", [
      folder("src/app", "apps/web-next/src/app", [
        file("apps/web-next/src/app/layout.tsx"),
        file(PAGE_PATH),
      ]),
      folder("src/components", "apps/web-next/src/components", [
        file("apps/web-next/src/components/Hero.tsx"),
      ]),
    ]),
    folder("api-dotnet", "apps/api-dotnet", [
      file("apps/api-dotnet/Program.cs"),
      file("apps/api-dotnet/ContactEndpoint.cs"),
      file("apps/api-dotnet/appsettings.json"),
    ]),
    folder("api-nest", "apps/api-nest", [
      file("apps/api-nest/src/projects.controller.ts"),
      file("apps/api-nest/src/projects.service.ts"),
    ]),
    folder("api-java", "apps/api-java", [
      file("apps/api-java/src/ProjectsController.java"),
      file("apps/api-java/src/ProjectRepository.java"),
      file("apps/api-java/application.yml"),
    ]),
    folder("worker-node", "apps/worker-node", [
      file("apps/worker-node/index.ts"),
    ]),
  ]),
  file("docker-compose.yml"),
  file("package.json"),
  file(README_PATH),
];

export type SourceText = {
  jobTitle: string;
  description: string;
  roles: string[];
};

export function pageSource(role: string) {
  const row = (items: string[]) => items.map((s) => `"${s}"`).join(", ");
  return `// apps/web-next/src/app/page.tsx
import { Hero } from "@/components/Hero";

export default function Home() {
  return (
    <Hero
      name="${site.name}"
      role="${role}"
      photo="${site.images.portrait}"
      stack={[
        ${row(heroStack.slice(0, 3))},
        ${row(heroStack.slice(3, 6))},
      ]}
    />
  );
}`;
}

export const staticSources = ({
  jobTitle,
  description,
  roles,
}: SourceText): Record<string, string> => ({
  "apps/web-next/src/app/layout.tsx": `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "${site.name} - ${jobTitle}",
  description: "${description}",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`,

  "apps/web-next/src/components/Hero.tsx": `import Image from "next/image";
import { RotatingRole, Stack } from "./ui";

type HeroProps = {
  name: string;
  role: string;
  photo: string;
  stack: string[];
};

export function Hero({ name, role, photo, stack }: HeroProps) {
  return (
    <section id="top" className="hero">
      <h1>{name}</h1>
      <RotatingRole roles={[${["role", ...roles.slice(1).map((r) => JSON.stringify(r))].join(", ")}]} />
      <Stack items={stack} />
      <Image src={photo} alt={name} width={898} height={788} priority />
    </section>
  );
}`,

  "apps/web-react/src/main.tsx": `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "./App";
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);`,

  "apps/web-react/src/App.tsx": `import { useQuery } from "@tanstack/react-query";

type Project = { id: number; name: string; stack: string[] };

const fetchProjects = (): Promise<Project[]> =>
  fetch("/api/projects").then((res) => res.json());

export function App() {
  const { data: projects = [], isPending } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  if (isPending) return <p>Loading...</p>;

  return (
    <main className="dashboard">
      <h1>${site.name} - Admin</h1>
      <ul>
        {projects.map((project) => (
          <li key={project.id}>
            {project.name} · {project.stack.join(", ")}
          </li>
        ))}
      </ul>
    </main>
  );
}`,

  "apps/web-react/vite.config.ts": `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: { "/api": "http://localhost:4001" },
  },
});`,

  "apps/api-dotnet/Program.cs": `using Portfolio.Api.Contact;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));
builder.Services.AddStackExchangeRedisCache(o => o.Configuration = "redis:6379");
builder.Services.AddScoped<IContactService, ContactService>();

var app = builder.Build();

app.MapGet("/api/health", () => Results.Ok(new { status = "healthy" }));
app.MapContactEndpoints();

app.Run();`,

  "apps/api-dotnet/ContactEndpoint.cs": `namespace Portfolio.Api.Contact;

public record ContactRequest(string Name, string Email, string Message);

public static class ContactEndpoint
{
    public static void MapContactEndpoints(this WebApplication app)
    {
        app.MapPost("/api/contact", async (ContactRequest req, IContactService service) =>
        {
            if (string.IsNullOrWhiteSpace(req.Email))
                return Results.BadRequest("Email is required.");

            var id = await service.SendAsync(req);
            return Results.Created($"/api/contact/{id}", new { id });
        });
    }
}`,

  "apps/api-dotnet/appsettings.json": `{
  "ConnectionStrings": {
    "Default": "Host=postgres;Database=portfolio;Username=app"
  },
  "Logging": {
    "LogLevel": { "Default": "Information" }
  },
  "AllowedHosts": "${site.domain}"
}`,

  "apps/api-nest/src/projects.controller.ts": `import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { ProjectsService } from "./projects.service";

@Controller("projects")
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  findAll() {
    return this.projects.findAll();
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.projects.findOne(id);
  }
}`,

  "apps/api-nest/src/projects.service.ts": `import { Injectable, NotFoundException } from "@nestjs/common";

export interface Project {
  id: number;
  name: string;
  stack: string[];
}

@Injectable()
export class ProjectsService {
  private readonly projects: Project[] = [
    { id: 1, name: "Signage CMS", stack: ["Next.js", "NestJS", "PostgreSQL"] },
    { id: 2, name: "Contact API", stack: [".NET", "Redis", "Docker"] },
  ];

  findAll(): Project[] {
    return this.projects;
  }

  findOne(id: number): Project {
    const project = this.projects.find((p) => p.id === id);
    if (!project) throw new NotFoundException(\`Project \${id} not found\`);
    return project;
  }
}`,

  "apps/api-java/src/ProjectsController.java": `package com.portfolio.api.projects;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects")
public class ProjectsController {
    private final ProjectRepository projects;

    public ProjectsController(ProjectRepository projects) {
        this.projects = projects;
    }

    @GetMapping
    public List<Project> findAll() {
        return projects.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> findOne(@PathVariable Long id) {
        return projects.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}`,

  "apps/api-java/src/ProjectRepository.java": `package com.portfolio.api.projects;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long> {}`,

  "apps/api-java/application.yml": `server:
  port: 8080

spring:
  datasource:
    url: jdbc:postgresql://postgres:5432/portfolio
    username: app
  jpa:
    hibernate:
      ddl-auto: validate
  data:
    redis:
      host: redis
      port: 6379
  rabbitmq:
    host: rabbitmq
    port: 5672`,

  "docker-compose.yml": `services:
  postgres:
    image: postgres:18.3
    environment:
      POSTGRES_DB: portfolio
      POSTGRES_USER: app
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql

  redis:
    image: redis:7.4-alpine
    ports:
      - "6379:6379"

  rabbitmq:
    image: rabbitmq:4-management
    ports:
      - "5672:5672"
      - "15672:15672"

  api-dotnet:
    build: ./apps/api-dotnet
    ports:
      - "5000:8080"
    depends_on: [postgres, redis]

  api-nest:
    build: ./apps/api-nest
    ports:
      - "4001:3000"
    depends_on: [postgres, redis]

  api-java:
    build: ./apps/api-java
    ports:
      - "8081:8080"
    depends_on: [postgres, redis, rabbitmq]

  worker-node:
    build: ./apps/worker-node
    depends_on: [rabbitmq]

volumes:
  pgdata:`,

  "apps/worker-node/index.ts": `import { createServer } from "node:http";
import { Queue } from "./queue";

const queue = new Queue("emails", { url: process.env.RABBITMQ_URL });

queue.consume(async (job) => {
  console.log(\`[worker] sending mail to \${job.to}\`);
  await job.ack();
});

createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ status: "ok", uptime: process.uptime() }));
}).listen(4000, () => console.log("worker listening on :4000"));`,

  "package.json": `{
  "name": "${site.handle}",
  "private": true,${site.repo ? `\n  "repository": "${site.repo}",` : ""}
  "workspaces": ["apps/*"],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint"
  },
  "devDependencies": {
    "turbo": "^2.5.0",
    "typescript": "^5.9.0"
  }
}`,

  [README_PATH]: `# ${site.domain}

Personal site of ${site.name}, ${jobTitle}.

## Apps

- \`apps/web\` - the Next.js site you are looking at
- \`apps/api-dotnet\` - .NET minimal API (contact, health)
- \`apps/api-nest\` - NestJS projects API
- \`apps/api-java\` - Spring Boot projects API
- \`apps/worker-node\` - Node.js mail worker

## Getting started

\`docker compose up -d\`
\`npm install\`
\`npm run dev\`

Press Run in the toolbar to start the site.${
    site.repo
      ? `

## Make it yours

This whole OS is open source. Click **Use this template** on
${site.repo}
and edit \`src/config/site.ts\` to boot your own portfolio.

If you enjoyed poking around, a ⭐ on GitHub means a lot!`
      : ""
  }`,
});

const languages: Record<string, string> = {
  tsx: "TypeScript JSX",
  ts: "TypeScript",
  cs: "C#",
  java: "Java",
  yml: "YAML",
  json: "JSON",
  md: "Markdown",
};

export const extOf = (path: string) => path.split(".").at(-1) ?? "";
export const nameOf = (path: string) => path.split("/").at(-1) ?? path;
export const languageOf = (path: string) =>
  languages[extOf(path)] ?? "Plain Text";

const walk = (nodes: TreeNode[]): string[] =>
  nodes.flatMap((n) => (n.kind === "file" ? [n.path] : walk(n.children)));

export const allFiles = walk(tree);
