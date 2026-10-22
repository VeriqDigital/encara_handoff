"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const motionQuery = "(prefers-reduced-motion: reduce)";
const poster = "/videos/encara/encara-pier-poster.jpg";

function subscribe(callback: () => void) {
  const preference = window.matchMedia(motionQuery);
  preference.addEventListener("change", callback);
  return () => preference.removeEventListener("change", callback);
}

function motionAllowed() {
  return !window.matchMedia(motionQuery).matches;
}

export default function CinematicBackground({ children }: { children: React.ReactNode }) {
  // RootLayout retains this component across entrance/home navigation.
  // Pathname and entrance state are never playback dependencies or keys.
  const allowMotion = useSyncExternalStore(subscribe, motionAllowed, () => false);
  const video = useRef<HTMLVideoElement>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);

  function clearFallback() {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = null;
  }

  function waitForPlayback() {
    // Repeated waiting/stalled events must not postpone fallback forever.
    if (timeout.current) return;
    timeout.current = setTimeout(() => setFailed(true), 8000);
  }

  useEffect(() => {
    const player = video.current;
    if (!player || !allowMotion || failed) return;
    let cancelled = false;
    player.defaultMuted = true;
    player.muted = true;
    timeout.current = setTimeout(() => setFailed(true), 8000);
    // Effect replay may interrupt this request. A superseded rejection must
    // never discard the player used by the next effect.
    void player.play().catch(() => {
      if (!cancelled) { clearFallback(); setPlaying(false); }
    });
    return () => {
      cancelled = true;
      clearFallback();
      player.pause();
    };
  }, [allowMotion, failed]);

  function togglePlayback() {
    const player = video.current;
    if (!player) return;
    if (player.paused) {
      // Autoplay denial keeps the native poster and allows a user retry.
      waitForPlayback();
      void player.play().catch(() => { clearFallback(); setPlaying(false); });
    } else {
      player.pause();
    }
  }

  return (
    <>
      <div className="cinematic-background">
        <Image className="background-media" src={poster} alt="" fill preload unoptimized sizes="100vw" />
        {allowMotion && !failed && (
          <video
            id="background-video"
            ref={video}
            className="background-media"
            src="/videos/encara/encara-pier-monochrome.mp4"
            poster={poster}
            width={1600}
            height={900}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
            onPlaying={() => { clearFallback(); setPlaying(true); }}
            onPause={() => {
              if (video.current?.paused) { clearFallback(); setPlaying(false); }
            }}
            onWaiting={() => { if (!video.current?.paused) waitForPlayback(); }}
            onStalled={() => { if (!video.current?.paused) waitForPlayback(); }}
            onError={() => { clearFallback(); setFailed(true); }}
          />
        )}
        <div className="background-shade" aria-hidden="true" />
      </div>
      <div className="site-foreground">{children}</div>
      {allowMotion && !failed && (
        <button
          className="background-control"
          type="button"
          aria-controls="background-video"
          onClick={togglePlayback}
        >
          {playing ? "Pause video" : "Play video"}
        </button>
      )}
    </>
  );
}
