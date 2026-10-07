import { Folder } from "@/components/ui/icons";

export function TerminalTitle({
  folder,
  process,
}: Readonly<{ folder: string; process: string }>) {
  return (
    <p className="text-faint pointer-events-none absolute inset-x-0 flex items-center justify-center gap-1.5 truncate px-24 text-center text-xs">
      <Folder className="h-3.5 w-3.5 shrink-0 text-[#5aa9ff]" />
      <span className="truncate">
        {folder} — {process} — 80×24
      </span>
    </p>
  );
}
