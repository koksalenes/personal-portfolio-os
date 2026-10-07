"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import {
  Music as MusicIcon,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume,
} from "@/components/ui/icons";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";
import { persistentStore } from "../session";
import { Window, type WindowControls } from "../Window";
import { music, trackDuration, tracks, type Track } from "./music-engine";

const savedMusic = persistentStore("music", { index: 0, volume: 0.6 });

const serverState = music.getState();
export const useMusic = () =>
  useSyncExternalStore(music.subscribe, music.getState, () => serverState);

const time = (sec: number) =>
  `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;

export function Artwork({
  track,
  className,
}: Readonly<{ track: Track; className?: string }>) {
  return (
    <span
      className={cn(
        "relative grid place-items-center overflow-hidden rounded-[18%] text-white",
        className,
      )}
      style={{
        background: `linear-gradient(135deg, ${track.colors[0]}, ${track.colors[1]})`,
      }}
    >
      <span className="absolute inset-[18%] rounded-full border-[0.12em] border-white/30" />
      <MusicIcon className="h-[42%] w-[42%]" />
    </span>
  );
}

export function MusicTile() {
  return (
    <span className="grid h-full w-full place-items-center rounded-[24%] bg-gradient-to-b from-[#fb5c74] to-[#fa233b] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
      <MusicIcon className="h-[55%] w-[55%]" />
    </span>
  );
}

function Visualizer({ playing }: Readonly<{ playing: boolean }>) {
  const bars = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const data = new Uint8Array(32);
    const tick = () => {
      music.analyser?.getByteFrequencyData(data);
      bars.current?.childNodes.forEach((node, i) => {
        (node as HTMLElement).style.transform =
          `scaleY(${Math.max(0.06, data[i + 1] / 255)})`;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  return (
    <div
      ref={bars}
      aria-hidden="true"
      className="flex h-10 items-end gap-[3px]"
    >
      {Array.from({ length: 20 }, (_, i) => (
        <span
          key={i}
          className="bg-accent h-full w-1.5 origin-bottom rounded-full transition-transform duration-75"
          style={{ transform: "scaleY(0.06)" }}
        />
      ))}
    </div>
  );
}

export function useElapsed() {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const update = () => setElapsed(music.elapsed());
    const id = setInterval(update, 250);
    const unsubscribe = music.subscribe(update);
    return () => {
      clearInterval(id);
      unsubscribe();
    };
  }, []);
  return elapsed;
}

export function SeekBar({
  elapsed,
  duration,
  label,
  className,
}: Readonly<{
  elapsed: number;
  duration: number;
  label: string;
  className?: string;
}>) {
  const pct = Math.min(100, (elapsed / duration) * 100);
  return (
    <input
      type="range"
      min={0}
      max={Math.round(duration)}
      step={1}
      value={Math.min(Math.round(elapsed), Math.round(duration))}
      onChange={(e) => music.seek(Number(e.target.value))}
      onClick={(e) => e.stopPropagation()}
      aria-label={label}
      style={{
        background: `linear-gradient(to right, var(--accent) ${pct}%, color-mix(in srgb, var(--foreground) 12%, transparent) ${pct}%)`,
      }}
      className={cn(
        "seek-bar h-1 w-full cursor-pointer appearance-none rounded-full",
        className,
      )}
    />
  );
}

export function MusicWidget({ className }: Readonly<{ className?: string }>) {
  const t = useTranslations("desktop.music");
  const state = useMusic();
  const track = tracks[state.index];
  const elapsed = useElapsed();
  return (
    <section
      aria-label={t("title")}
      onPointerDown={(e) => e.stopPropagation()}
      data-context="widget:music"
      onClick={() => music.toggle()}
      className={cn(
        "cursor-pointer rounded-2xl border border-white/20 bg-white/70 p-3 text-neutral-900 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur-2xl dark:bg-neutral-900/60 dark:text-white",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <Artwork
          track={track}
          className="h-11 w-11 shrink-0 text-[44px] shadow"
        />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-[#fa233b]">
            {state.playing ? t("nowPlaying") : t("title")}
          </p>
          <p className="truncate text-[13px] font-semibold">{track.title}</p>
          <p className="truncate text-[11px] opacity-60">
            {t(`grooves.${track.groove}`)} · {track.bpm} BPM
          </p>
        </div>
        <button
          type="button"
          aria-label={state.playing ? t("pause") : t("play")}
          onClick={(e) => {
            e.stopPropagation();
            music.toggle();
          }}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
        >
          {state.playing ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="ml-0.5 h-4 w-4" />
          )}
        </button>
        <button
          type="button"
          aria-label={t("next")}
          onClick={(e) => {
            e.stopPropagation();
            music.next();
          }}
          className="grid h-8 w-6 shrink-0 place-items-center opacity-70 hover:opacity-100"
        >
          <SkipForward className="h-4 w-4" />
        </button>
      </div>
      <SeekBar
        elapsed={elapsed}
        duration={trackDuration(track)}
        label={t("seek")}
        className="mt-2.5"
      />
    </section>
  );
}

export function MusicApp({ controls }: Readonly<{ controls: WindowControls }>) {
  const t = useTranslations("desktop.music");
  const state = useMusic();
  const saved = savedMusic.useValue();
  const track = tracks[state.index];
  const elapsed = useElapsed();
  const duration = trackDuration(track);

  useEffect(() => {
    music.configure(saved.index, saved.volume);
  }, [saved.index, saved.volume]);
  useEffect(
    () =>
      music.subscribe(() => {
        const { index, volume } = music.getState();
        if (
          index !== savedMusic.read().index ||
          volume !== savedMusic.read().volume
        )
          savedMusic.write({ index, volume });
      }),
    [],
  );

  const button =
    "text-foreground/80 hover:text-foreground grid place-items-center rounded-full transition-colors";

  return (
    <Window
      id="music"
      label={t("title")}
      controls={controls}
      titleBar={
        <p className="text-faint pointer-events-none absolute inset-x-0 text-center text-xs">
          {t("title")}
        </p>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
        <div className="border-border flex shrink-0 flex-col items-center gap-2 border-b p-4 sm:w-64 sm:gap-3 sm:border-r sm:border-b-0 sm:p-5">
          <Artwork
            track={track}
            className="h-20 w-20 text-[80px] shadow-xl sm:h-40 sm:w-40 sm:text-[160px]"
          />
          <div className="w-full text-center">
            <p className="truncate font-semibold">{track.title}</p>
            <p className="text-faint truncate text-xs">
              {site.name} · {t("original")}
            </p>
          </div>
          <div className="w-full">
            <SeekBar elapsed={elapsed} duration={duration} label={t("seek")} />
            <div className="text-faint mt-1 flex justify-between text-[10px] tabular-nums">
              <span>{time(elapsed)}</span>
              <span>{time(duration)}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              aria-label={t("back10")}
              title={t("back10")}
              onClick={() => music.skip(-10)}
              className={cn(button, "h-8 w-8 text-[11px] font-semibold")}
            >
              −10
            </button>
            <button
              type="button"
              aria-label={t("previous")}
              onClick={() => music.prev()}
              className={cn(button, "h-8 w-8")}
            >
              <SkipBack className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label={state.playing ? t("pause") : t("play")}
              onClick={() => music.toggle()}
              className="bg-foreground text-background grid h-11 w-11 place-items-center rounded-full"
            >
              {state.playing ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="ml-0.5 h-5 w-5" />
              )}
            </button>
            <button
              type="button"
              aria-label={t("next")}
              onClick={() => music.next()}
              className={cn(button, "h-8 w-8")}
            >
              <SkipForward className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label={t("forward10")}
              title={t("forward10")}
              onClick={() => music.skip(10)}
              className={cn(button, "h-8 w-8 text-[11px] font-semibold")}
            >
              +10
            </button>
          </div>
          <label className="text-faint flex w-full items-center gap-2">
            <Volume className="h-4 w-4 shrink-0" />
            <span className="sr-only">{t("volume")}</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={state.volume}
              onChange={(e) => music.setVolume(Number(e.target.value))}
              className="w-full accent-(--accent)"
            />
          </label>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-end justify-between px-4 pt-4 pb-2">
            <div>
              <p className="text-faint text-[10px] tracking-[0.18em] uppercase">
                {t("playlist")}
              </p>
              <p className="font-display text-lg font-bold">
                {t("playlistName", { os: site.os.name })}
              </p>
            </div>
            <Visualizer playing={state.playing} />
          </div>
          <ol className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
            {tracks.map((tr, i) => {
              const active = i === state.index;
              return (
                <li key={tr.id}>
                  <button
                    type="button"
                    onClick={() => music.select(i)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-sm",
                      active ? "bg-accent-soft" : "hover:bg-foreground/5",
                    )}
                  >
                    <span className="text-faint w-4 text-right text-xs tabular-nums">
                      {active && state.playing ? "♪" : i + 1}
                    </span>
                    <Artwork track={tr} className="h-8 w-8 text-[32px]" />
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block truncate",
                          active && "text-accent font-semibold",
                        )}
                      >
                        {tr.title}
                      </span>
                      <span className="text-faint block text-[11px]">
                        {tr.bpm} BPM · {t(`grooves.${tr.groove}`)}
                      </span>
                    </span>
                    <span className="text-faint text-xs tabular-nums">
                      {time(trackDuration(tr))}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </Window>
  );
}
