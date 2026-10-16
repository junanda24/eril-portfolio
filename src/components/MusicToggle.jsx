import { useEffect, useRef, useState } from "react";

/**
 * Anime OST playlist player — hidden YouTube embed.
 * Tracks verified from official channels / THE FIRST TAKE.
 */
const TRACKS = [
  { id: "HB4iNVa746E", title: "We Are!", artist: "Hiroshi Kitadani", tag: "ONE PIECE OP 1 · THE FIRST TAKE" },
  { id: "nJ6A6GC_ki4", title: "Haruka Kanata", artist: "ASIAN KUNG-FU GENERATION", tag: "Naruto OP 2" },
  { id: "dlFA0Zq1k2A", title: "Silhouette", artist: "KANA-BOON", tag: "Naruto Shippuden OP 16" },
  { id: "KpsJWFuVTdI", title: "Blue Bird", artist: "Ikimonogakari", tag: "Naruto Shippuden OP 3" },
  { id: "GsLsBs4oW30", title: "unravel", artist: "TK from Ling Tosite Sigure", tag: "Tokyo Ghoul OP · THE FIRST TAKE" },
  { id: "CwkzK-F0Y00", title: "Gurenge", artist: "LiSA", tag: "Demon Slayer OP" },
  { id: "1tk1pqwrOys", title: "Kaikai Kitan", artist: "Eve", tag: "Jujutsu Kaisen OP 1" },
  { id: "zuoVd2QNxJo", title: "Ao no Sumika", artist: "Tatsuya Kitani", tag: "Jujutsu Kaisen S2 OP" },
  { id: "fhzKLBZJC3w", title: "SPECIALZ", artist: "King Gnu", tag: "Jujutsu Kaisen Shibuya OP" },
  { id: "AY-VqITnPrY", title: "Guren no Yumiya", artist: "Linked Horizon", tag: "Attack on Titan OP 1" },
  { id: "w5OUAY1j3gQ", title: "again", artist: "YUI", tag: "Fullmetal Alchemist: Brotherhood OP 1" },
  { id: "M2cckDmNLMI", title: "KICK BACK", artist: "Kenshi Yonezu", tag: "Chainsaw Man OP" },
  { id: "ZRtdQ81jPUQ", title: "Idol", artist: "YOASOBI", tag: "Oshi no Ko OP" },
  { id: "EL-D9LrFJd4", title: "Tank!", artist: "Seatbelts", tag: "Cowboy Bebop OP" },
  { id: "1aPOj0ERTEc", title: "crossing field", artist: "LiSA", tag: "Sword Art Online OP 1" },
];

function loadYouTubeAPI() {
  return new Promise((resolve) => {
    if (window.YT?.Player) return resolve();
    if (!document.getElementById("yt-iframe-api")) {
      const tag = document.createElement("script");
      tag.id = "yt-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
    const wait = setInterval(() => {
      if (window.YT?.Player) {
        clearInterval(wait);
        resolve();
      }
    }, 120);
  });
}

function EqBars({ playing, small }) {
  return (
    <span className={`flex items-end gap-[3px] ${small ? "h-3" : "h-4"}`} aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={`eq-bar w-[3px] rounded-full bg-neon ${playing ? "eq-playing" : ""}`}
          style={{ animationDelay: `${i * 0.18}s`, height: "30%" }}
        />
      ))}
    </span>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
      <path d="M3.5 2.3v9.4c0 .8.9 1.3 1.6.9l7-4.7c.6-.4.6-1.4 0-1.8l-7-4.7c-.7-.4-1.6.1-1.6.9z" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M5 4.5h8M5 7.5h8M5 10.5h8" />
      <circle cx="2.6" cy="4.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="2.6" cy="7.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="2.6" cy="10.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function MusicToggle() {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [ninjaFx, setNinjaFx] = useState(0); // increments to replay the shuriken burst
  const [audioBlocked, setAudioBlocked] = useState(false); // browser blocked audible autoplay
  const playerRef = useRef(null);
  const holderRef = useRef(null);
  const startedRef = useRef(false);
  const buildingRef = useRef(null); // shared build promise: prevents double-constructing the player
  const indexRef = useRef(0); // mirrors trackIndex for use inside YT event callbacks
  const errorStreakRef = useRef(0); // consecutive unplayable videos; gives up after a full cycle
  const watchRef = useRef(null); // watchdog timer: verifies real playback progress

  // YouTube sometimes falls back to muted autoplay when the browser rejects
  // audible autoplay — UI shows "playing" but there's no sound. Force unmute
  // on every play path.
  const forceAudible = (p) => {
    try {
      if (p.isMuted()) p.unMute();
      p.setVolume(100);
    } catch {
      /* noop */
    }
  };

  // A video can wedge with NO error at all: the player sits at cued(5) or
  // claims playing(1)/buffering(3) while the stream never arrives
  // (region block, restricted video, stalled network). The UI then lies —
  // eq bars dance, but there's silence. The watchdog verifies that the
  // video clock actually advances; if not, it skips to the next track.
  const skipWedged = () => {
    errorStreakRef.current += 1;
    if (errorStreakRef.current >= TRACKS.length) {
      clearTimeout(watchRef.current);
      setPlaying(false); // every track wedged — stop quietly
      return;
    }
    try {
      const nxt = (indexRef.current + 1) % TRACKS.length;
      indexRef.current = nxt;
      setTrackIndex(nxt);
      const p = playerRef.current;
      p?.playVideoAt(nxt);
      forceAudible(p);
      armWatchdog(1);
    } catch {
      /* noop */
    }
  };

  const armWatchdog = (stage) => {
    clearTimeout(watchRef.current);
    if (stage === "clear") return;
    const delay = stage === 1 ? 10000 : 20000;
    watchRef.current = setTimeout(() => {
      const p = playerRef.current;
      if (!p) return;
      try {
        const st = p.getPlayerState();
        const t = p.getCurrentTime();
        const wedged = st === 5 || ((st === 1 || st === 3) && t < 1);
        if (!wedged) return;
        if (stage === 1) {
          armWatchdog(2); // one more chance before giving up on this video
        } else {
          skipWedged();
        }
      } catch {
        /* noop */
      }
    }, delay);
  };

  // Warm up the YouTube player on mount (no playback yet) so the first tap's
  // loadPlaylist fires within milliseconds of the gesture — browsers are
  // strict about audible-autoplay timing.
  useEffect(() => {
    ensurePlayer().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ninja shuriken burst + smoke every time the track changes
  useEffect(() => {
    if (!startedRef.current) return;
    setNinjaFx((k) => k + 1);
    const t = setTimeout(() => setNinjaFx(0), 900);
    return () => clearTimeout(t);
  }, [trackIndex]);

  useEffect(
    () => () => {
      clearTimeout(watchRef.current);
      try {
        playerRef.current?.destroy();
      } catch {
        /* noop */
      }
      playerRef.current = null;
    },
    []
  );

  // Debug handle for live diagnostics (no secrets, player state only).
  useEffect(() => {
    window.__musicDebug = {
      snapshot: () => {
        const p = playerRef.current;
        const info = {
          hasPlayer: !!p,
          started: startedRef.current,
          uiPlaying: playing,
          audioBlocked,
          errorStreak: errorStreakRef.current,
        };
        if (p) {
          try {
            info.playerState = p.getPlayerState(); // -1,0,1,2,3,5
            info.muted = p.isMuted();
            info.volume = p.getVolume();
            info.videoUrl = p.getVideoUrl();
            info.playlistIndex = p.getPlaylistIndex();
          } catch (e) {
            info.error = String(e);
          }
        }
        try {
          const pill = document.querySelector(".fixed.bottom-6.left-1\\/2 p");
          info.pillText = pill ? pill.textContent : null;
        } catch {
          /* noop */
        }
        return info;
      },
    };
    return () => {
      delete window.__musicDebug;
    };
  }, [playing, audioBlocked]);

  // Concurrency-safe: every caller shares one build promise, so rapid taps
  // can never construct two YT players (the second would be broken and
  // steal the ref, silencing all playback).
  const ensurePlayer = () => {
    if (playerRef.current) return Promise.resolve(playerRef.current);
    if (!buildingRef.current) {
      buildingRef.current = (async () => {
        await loadYouTubeAPI();
        await new Promise((resolve, reject) => {
          try {
            playerRef.current = new window.YT.Player(holderRef.current, {
              playerVars: { autoplay: 0, controls: 0, disablekb: 1, fs: 0, rel: 0, playsinline: 1 },
              events: {
                onReady: () => resolve(),
                onStateChange: (e) => {
                  if (e.data === 1) {
                    errorStreakRef.current = 0;
                    setAudioBlocked(false);
                    forceAudible(playerRef.current);
                    setPlaying(true);
                    armWatchdog(1); // re-arm: verify this video really progresses
                    try {
                      const idx = playerRef.current.getPlaylistIndex();
                      if (idx >= 0) {
                        indexRef.current = idx;
                        setTrackIndex(idx);
                      }
                    } catch {
                      /* noop */
                    }
                  } else if (e.data === 0 || e.data === 2) {
                    armWatchdog("clear");
                    setPlaying(false);
                  }
                },
                onAutoplayBlocked: () => {
                  // Browser blocked audible autoplay: the video is cued but
                  // paused. Be honest in the UI and resume on the next real
                  // tap (a fresh user gesture is always honored).
                  errorStreakRef.current = 0;
                  setPlaying(false);
                  setAudioBlocked(true);
                  const resume = () => {
                    setAudioBlocked(false);
                    try {
                      const pl = playerRef.current;
                      forceAudible(pl);
                      pl?.playVideo();
                      armWatchdog(1);
                    } catch {
                      /* noop */
                    }
                    window.removeEventListener("pointerdown", resume);
                    window.removeEventListener("keydown", resume);
                  };
                  window.addEventListener("pointerdown", resume);
                  window.addEventListener("keydown", resume);
                },
                onError: (e) => {
                  // 101/150: owner disabled embedding; 100: not found; 5: player error.
                  // Auto-skip to the next track instead of dying silently.
                  if (![5, 100, 101, 150].includes(e.data)) return;
                  errorStreakRef.current += 1;
                  if (errorStreakRef.current >= TRACKS.length) {
                    setPlaying(false); // whole playlist unplayable — stop trying
                    return;
                  }
                  try {
                    const nxt = (indexRef.current + 1) % TRACKS.length;
                    indexRef.current = nxt;
                    setTrackIndex(nxt);
                    playerRef.current?.playVideoAt(nxt);
                    armWatchdog(1);
                  } catch {
                    /* noop */
                  }
                },
              },
            });
          } catch (err) {
            buildingRef.current = null;
            reject(err);
          }
        });
      })();
    }
    return buildingRef.current;
  };

  const playAt = async (i) => {
    const p = await ensurePlayer().catch(() => null);
    if (!p) return;
    if (!startedRef.current) {
      startedRef.current = true;
      p.loadPlaylist(TRACKS.map((t) => t.id), i);
    } else {
      try {
        p.playVideoAt(i);
      } catch {
        return;
      }
    }
    forceAudible(p);
    indexRef.current = i;
    setTrackIndex(i);
    setPlaying(true);
    armWatchdog(1);
  };

  const togglePlay = async () => {
    const p = await ensurePlayer().catch(() => null);
    if (!p) return;
    if (playing) {
      try {
        p.pauseVideo();
      } catch {
        /* noop */
      }
      setPlaying(false);
    } else if (!startedRef.current) {
      playAt(trackIndex);
    } else {
      try {
        forceAudible(p);
        p.playVideo();
      } catch {
        return;
      }
      setPlaying(true);
      armWatchdog(1);
    }
  };

  const next = async () => {
    const p = await ensurePlayer().catch(() => null);
    if (!p) return;
    if (!startedRef.current) return playAt(0);
    try {
      p.nextVideo();
    } catch {
      /* noop */
    }
  };

  const prev = async () => {
    const p = await ensurePlayer().catch(() => null);
    if (!p) return;
    if (!startedRef.current) return playAt(TRACKS.length - 1);
    try {
      p.previousVideo();
    } catch {
      /* noop */
    }
  };

  return (
    <div className="relative">
      <div
        ref={holderRef}
        aria-hidden="true"
        className="pointer-events-none fixed bottom-0 left-0 h-px w-px overflow-hidden opacity-0"
      />
      <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={togglePlay}
        aria-label={playing ? "Pause music" : "Play music"}
        title={playing ? "Pause music" : "Play music"}
        className="pressable group relative flex h-9 w-9 items-center justify-center rounded-full border border-line bg-panel/70 text-ink transition-colors hover:border-neon/60"
      >
        {playing ? <EqBars playing={playing} /> : <PlayIcon />}
        {playing && (
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulse-node rounded-full bg-neon" aria-hidden="true" />
        )}
      </button>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Anime OST playlist"
        title="Anime OST playlist"
        className="pressable relative flex h-9 w-9 items-center justify-center rounded-full border border-line bg-panel/70 text-muted transition-colors hover:border-neon/60 hover:text-ink"
      >
        <ListIcon />
      </button>
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />          <div className="fixed inset-x-4 top-[76px] z-50 overflow-hidden rounded-2xl border border-line bg-abyss/95 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.7)] backdrop-blur-xl md:absolute md:inset-x-auto md:right-0 md:top-full md:mt-3 md:w-80">
            {/* Anime FX header: spinning disc + now-playing ticker */}
            <div className="relative overflow-hidden border-b border-line">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-neon/10 via-electric/10 to-amber/10" aria-hidden="true" />
              <div className="relative flex items-center gap-3 px-4 py-3">
                <div className={`relative h-11 w-11 shrink-0 ${playing ? "disc-spin" : ""}`} aria-hidden="true">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-ink via-panel to-abyss" />
                  <div className="absolute inset-[5px] rounded-full border border-dashed border-neon/50" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-amber shadow-[0_0_8px_rgba(245,165,36,0.9)]" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[10px] tracking-[0.24em] text-neon">ANIME OST · PLAYLIST</p>
                  <div className="mt-0.5 overflow-hidden whitespace-nowrap" aria-hidden="true">
                    <p className={`inline-block text-xs text-muted ${playing ? "ticker-scroll" : ""}`}>
                      {playing
                        ? `♪ NOW PLAYING — ${TRACKS[trackIndex].title} · ${TRACKS[trackIndex].artist} ♪\u00A0\u00A0\u00A0`
                        : "TAP A TRACK TO PLAY"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-1 px-4 py-2">
                <button type="button" onClick={prev} aria-label="Previous track" className="pressable rounded-full p-2 text-muted hover:text-ink">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true"><path d="M3 2h2v10H3zM11 2v10L4.5 7z" /></svg>
                </button>
                <button type="button" onClick={togglePlay} aria-label={playing ? "Pause" : "Play"} className="pressable rounded-full bg-neon/15 p-2 text-neon hover:bg-neon/25">
                  {playing ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true"><path d="M3 2h3v10H3zM8 2h3v10H8z" /></svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true"><path d="M4 2l8 5-8 5z" /></svg>
                  )}
                </button>
                <button type="button" onClick={next} aria-label="Next track" className="pressable rounded-full p-2 text-muted hover:text-ink">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true"><path d="M9 2h2v10H9zM3 2v10l6.5-5z" /></svg>
                </button>
            </div>
            <ul className="max-h-72 overflow-y-auto p-2">
              {TRACKS.map((t, i) => {
                const active = i === trackIndex && (playing || startedRef.current);
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => playAt(i)}
                      className={`pressable flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                        active ? "bg-neon/10" : "hover:bg-panel/60"
                      }`}
                    >
                      <span className="w-5 shrink-0 font-mono text-[10px] text-muted">
                        {active && playing ? <EqBars playing small /> : String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate text-sm font-semibold ${active ? "text-neon" : "text-ink"}`}>
                          {t.title}
                        </span>
                        <span className="block truncate text-xs text-muted">{t.artist}</span>
                      </span>
                      <span className="hidden shrink-0 font-mono text-[9px] tracking-wider text-muted/70 sm:block">
                        {t.tag}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="border-t border-line px-4 py-2 font-mono text-[9px] tracking-wider text-muted/60">
              STREAMED VIA YOUTUBE · TAP A TRACK TO PLAY
            </p>
            {/* Ninja FX: shuriken burst + smoke + speed lines on track change */}
            {ninjaFx > 0 && (
              <div key={ninjaFx} className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden="true">
                {[18, 46, 68].map((top, i) => (
                  <span key={i} className="speed-line" style={{ top: `${top}%`, animationDelay: `${i * 0.06}s` }} />
                ))}
                <span className="shuriken-fly">
                  <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
                    <path d="M18 0 L21.5 14.5 L36 18 L21.5 21.5 L18 36 L14.5 21.5 L0 18 L14.5 14.5 Z" fill="#94a3b8" />
                    <path d="M18 4 L20.2 15.8 L32 18 L20.2 20.2 L18 32 L15.8 20.2 L4 18 L15.8 15.8 Z" fill="#cbd5e1" />
                    <circle cx="18" cy="18" r="3.4" fill="#0b1220" stroke="#94a3b8" strokeWidth="1.6" />
                  </svg>
                </span>
                <span className="smoke-puff" style={{ left: "18%", top: "30%", width: 70, height: 70 }} />
                <span className="smoke-puff" style={{ left: "55%", top: "55%", width: 90, height: 90, animationDelay: "0.12s" }} />
                <span className="smoke-puff" style={{ left: "72%", top: "22%", width: 56, height: 56, animationDelay: "0.2s" }} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
