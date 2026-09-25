// Audio for the walkable zone (GAINS Draft 68).
//
// Two kinds of sound, two mechanisms, one unlock gesture:
//   - BEDS + VO are HTMLAudio elements created up front and "warmed up"
//     (muted play/pause) inside the Begin tap, which is what lets iOS play
//     them later from timers and effects. The zone ambience loops quietly
//     the whole time; the pond soundscape's volume follows the Traveler's
//     distance to the pond (proximity crossfade, ambience ducks a little
//     there); both duck while Spark speaks.
//   - SFX (footsteps, chime, whoosh, tap, equip, swell) go through one
//     WebAudio context resumed in the same gesture, so short overlapping
//     one-shots can fire from anywhere without needing their own gesture.
// Every file is optional: a fetch/decode/play failure is a silent no-op, so
// a late-arriving asset never breaks the zone.

// Draft 90 (item 20): -6dB across the board (Maggie/Josh, ambience was
// sitting over Spark) -- linear amplitude ×0.501 ≈ -6dB.
const AMBIENCE_VOL = 0.14
const POND_MAX_VOL = 0.28
const POND_DUCKS_AMBIENCE = 0.4 // ambience ×(1 - this×pond)
// A further -6dB while Spark speaks (on top of the level above), easing
// back over ~600ms once she's done rather than snapping back instantly.
const SPEECH_DUCK = 0.15
const DUCK_RESTORE_MS = 600
const SFX_VOL = { default: 0.7, step: 0.45, 'arrive-swell': 0.6, 'chime-unlock': 0.7 }

// Manual volume ramp (no Phaser/tween runtime available in this plain
// module) -- used only for the duck RELEASE, so it eases back in rather
// than snapping to full the instant speech ends. Cancels any ramp already
// in flight on the same element first.
const rampState = new WeakMap()
function rampVolume(el, to, ms) {
  const prev = rampState.get(el)
  if (prev) cancelAnimationFrame(prev)
  const from = el.volume
  const start = performance.now()
  const step = (now) => {
    const t = Math.min(1, (now - start) / ms)
    try {
      el.volume = from + (to - from) * t
    } catch {
      /* iOS ignores volume writes; fine */
    }
    if (t < 1) rampState.set(el, requestAnimationFrame(step))
    else rampState.delete(el)
  }
  rampState.set(el, requestAnimationFrame(step))
}

// Same technique, for a Web Audio GainNode's `.gain.value` instead of an
// HTMLAudio element's `.volume` -- Draft 98's runner music is scheduled on
// the Web Audio clock (for a gapless intro->loop splice, see
// `startRunnerMusic` below) so its own volume/duck ramps have to go through
// a gain node rather than `rampVolume`'s `el.volume`. Shares the same
// WeakMap; a GainNode is as valid a key as an HTMLAudioElement.
function rampGain(node, to, ms) {
  const prev = rampState.get(node)
  if (prev) cancelAnimationFrame(prev)
  const from = node.gain.value
  const start = performance.now()
  const step = (now) => {
    const t = Math.min(1, (now - start) / ms)
    node.gain.value = from + (to - from) * t
    if (t < 1) rampState.set(node, requestAnimationFrame(step))
    else rampState.delete(node)
  }
  rampState.set(node, requestAnimationFrame(step))
}

// `pondUrl` is optional (Draft 80): not every zone's station has its own
// proximity-crossfaded soundscape (Zone 3's waystone doesn't). `sfxBase`
// defaults to `base` but can point elsewhere so a zone can reuse another
// zone's SFX pack instead of duplicating the files (Zone 3 reuses Zone 4's).
export function createZoneAudio({ base, sfxBase, pondUrl }) {
  const sfxDir = sfxBase || base
  const ambience = new Audio(`${base}/audio/ambience.mp3`)
  ambience.loop = true
  ambience.preload = 'auto'
  const pond = pondUrl ? new Audio(pondUrl) : null
  if (pond) {
    pond.loop = true
    pond.preload = 'auto'
  }
  const vo = new Audio()
  vo.preload = 'auto'
  const els = [ambience, vo, ...(pond ? [pond] : [])]

  let bedsOn = false
  let pondFactor = 0
  let speaking = false
  let disposed = false
  let unlocked = false
  let muted = false
  let ctx = null
  let master = null
  const buffers = {}
  let voToken = 0

  // Draft 90 (item 20): duck-IN stays snappy (a line starting under a still
  // -full bed would read as a jarring overlap), but duck-release eases back
  // over DUCK_RESTORE_MS rather than snapping to full the instant speech
  // ends -- `ease` is true only on that specific speaking:true->false edge
  // (see duck() below).
  function applyVolumes(ease) {
    const duck = speaking ? SPEECH_DUCK : 1
    const targetAmbience = bedsOn ? AMBIENCE_VOL * (1 - POND_DUCKS_AMBIENCE * pondFactor) * duck : 0
    const targetPond = bedsOn ? POND_MAX_VOL * pondFactor * duck : 0
    try {
      if (ease) {
        rampVolume(ambience, targetAmbience, DUCK_RESTORE_MS)
        if (pond) rampVolume(pond, targetPond, DUCK_RESTORE_MS)
      } else {
        ambience.volume = targetAmbience
        if (pond) pond.volume = targetPond
      }
    } catch {
      /* iOS ignores volume writes; fine */
    }
  }

  return {
    // Must be called synchronously inside a real user gesture.
    unlock() {
      if (unlocked || disposed) return
      unlocked = true
      els.forEach((el) => {
        try {
          // Muted warm-up; the mute flag is re-applied once the element's
          // primed so a user mute set before Begin sticks.
          el.muted = true
          const p = el.play()
          if (p && p.then) {
            p.then(() => {
              el.pause()
              el.currentTime = 0
              el.muted = muted
            }).catch(() => {
              el.muted = muted
            })
          }
        } catch {
          /* ignore */
        }
      })
      try {
        const AC = window.AudioContext || window.webkitAudioContext
        if (AC) {
          ctx = new AC()
          master = ctx.createGain()
          master.gain.value = muted ? 0 : 1
          master.connect(ctx.destination)
          if (ctx.state === 'suspended') ctx.resume().catch(() => {})
        }
      } catch {
        ctx = null
        master = null
      }
    },

    setMuted(m) {
      muted = !!m
      els.forEach((el) => {
        try {
          el.muted = muted
        } catch {
          /* ignore */
        }
      })
      if (master) master.gain.value = muted ? 0 : 1
    },

    startBeds() {
      if (disposed) return
      bedsOn = true
      applyVolumes()
      ambience.play().catch(() => {})
      if (pond) pond.play().catch(() => {})
    },

    // Pause (not stop) so the pond bed resumes where it left off.
    stopBeds() {
      bedsOn = false
      applyVolumes()
      try {
        ambience.pause()
        if (pond) pond.pause()
      } catch {
        /* ignore */
      }
    },

    // Draft 83: manual duck toggle for narration owned by an activity (e.g.
    // Body Mapping) rather than this manager's own speak() -- same ducking
    // as a VO line, just driven by the host reacting to the activity's own
    // onNarrate(bool) callback instead of a speak() token.
    duck(on) {
      const releasing = speaking && !on
      speaking = !!on
      applyVolumes(releasing)
    },

    // No-op when the zone has no proximity-crossfaded bed (see `pond` above).
    setPond(f) {
      if (!pond) return
      pondFactor = Math.max(0, Math.min(1, f || 0))
      applyVolumes()
    },

    // Plays one Spark line, ducking the beds; resolves when it ends (or
    // immediately if it can't play). A newer speak() cancels an older one.
    speak(file) {
      if (disposed) return Promise.resolve()
      const token = ++voToken
      speaking = true
      applyVolumes()
      return new Promise((resolve) => {
        const finish = () => {
          if (token !== voToken) return resolve()
          speaking = false
          applyVolumes(true)
          resolve()
        }
        try {
          vo.pause()
          vo.currentTime = 0
          vo.src = `${base}/audio/${file}`
          // `{ once: true }` self-removes after firing (Draft 92's fix for
          // the same class of bug): a bare `vo.onended =` is a property
          // assignment that a LATER speak() call on this same shared
          // element silently overwrites, orphaning whichever call's
          // playback is still in flight -- its promise then never
          // resolves. That's not just a theoretical race: React
          // StrictMode's dev-only double-invoke of an effect that calls
          // speak() does exactly this (Draft 94's StationSequence hit it).
          vo.addEventListener('ended', finish, { once: true })
          vo.addEventListener('error', finish, { once: true })
          const p = vo.play()
          if (p && p.catch) p.catch(finish)
        } catch {
          finish()
        }
      })
    },

    stopSpeech() {
      voToken++
      speaking = false
      applyVolumes()
      try {
        vo.pause()
      } catch {
        /* ignore */
      }
    },

    // Fire-and-forget one-shot. `name` is the file stem under /sfx/.
    sfx(name) {
      if (disposed || !ctx) return
      const play = (buf) => {
        try {
          const src = ctx.createBufferSource()
          src.buffer = buf
          const gain = ctx.createGain()
          const key = name.startsWith('step-') ? 'step' : name
          gain.gain.value = SFX_VOL[key] ?? SFX_VOL.default
          src.connect(gain).connect(master || ctx.destination)
          src.start()
        } catch {
          /* ignore */
        }
      }
      const cached = buffers[name]
      if (cached === null) return // known missing
      if (cached) return play(cached)
      buffers[name] = undefined
      fetch(`${sfxDir}/sfx/${name}.mp3`)
        .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
        .then((ab) => ctx.decodeAudioData(ab))
        .then((buf) => {
          buffers[name] = buf
          play(buf)
        })
        .catch(() => {
          buffers[name] = null
        })
    },

    // Warm the SFX cache so first footsteps aren't late.
    preloadSfx(names) {
      if (!ctx) return
      names.forEach((name) => {
        if (buffers[name] !== undefined) return
        buffers[name] = undefined
        fetch(`${sfxDir}/sfx/${name}.mp3`)
          .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
          .then((ab) => ctx.decodeAudioData(ab))
          .then((buf) => {
            buffers[name] = buf
          })
          .catch(() => {
            buffers[name] = null
          })
      })
    },

    dispose() {
      disposed = true
      voToken++
      els.forEach((el) => {
        try {
          el.pause()
          el.src = ''
        } catch {
          /* ignore */
        }
      })
      if (ctx) {
        try {
          ctx.close()
        } catch {
          /* ignore */
        }
        ctx = null
      }
    },
  }
}

// Draft 94 (Zone 2): a second, parallel audio manager rather than
// retrofitting `createZoneAudio` above -- Zone 2 is the first zone with
// PER-PLATE music (switched, no overlap) and ambience (crossfaded), plus
// duck levels that differ by what's on screen (a zone video ducks harder
// than a station video, since a zone video carries its own score) rather
// than just "narrating or not." Retrofitting all of that into the shared
// path risked Zones 1/3/4's already-shipped audio for a shape only this
// zone needs. SFX/VO/unlock are copied verbatim from createZoneAudio
// (same WebAudio one-shot pack, same warm-up-on-Begin gesture).
const MUSIC_VOL = 0.32
const CAMPFIRE_VOL = 0.16
const FOREST_VOL = 0.13
const FOREST_UNDER_CAMPFIRE_MULT = 0.6 // plate 2 keeps forest running under campfire at 60%
// Draft 98: the Fogline Runner replaces Draft 95's drag-the-lens Fogline;
// forest ambience keeps the same 40% mix under it.
const FOREST_UNDER_FOGLINERUN_MULT = 0.4
const MUSIC_FADE_OUT_MS = 2000
const MUSIC_FADE_IN_MS = 3000
const AMBIENCE_CROSSFADE_MS = 2000
// Duck targets (music, ambience) per context -- "usual duck" (VO) reuses
// the same feel as createZoneAudio's SPEECH_DUCK; a zone video all but
// silences the music (it carries its own score) while a station video
// (no score of its own) only leans back.
const DUCK = {
  none: { music: 1, ambience: 1 },
  speaking: { music: 0.15, ambience: 0.15 },
  zoneVideo: { music: 0, ambience: 0.3 },
  stationVideo: { music: 0.35, ambience: 0.5 },
}

export function createZone2Audio({ base, sfxBase }) {
  const sfxDir = sfxBase || base
  const music = new Audio()
  music.preload = 'auto'
  const campfire = new Audio(`${base}/audio/z2-amb-campfire.mp3`)
  campfire.loop = true
  campfire.preload = 'auto'
  const forest = new Audio(`${base}/audio/z2-amb-forest.mp3`)
  forest.loop = true
  forest.preload = 'auto'
  const vo = new Audio()
  vo.preload = 'auto'
  const els = [music, campfire, forest, vo]

  let plate = null // 'plate1' | 'plate2' | 'foglinerun'
  let duckCtx = 'none'
  let speaking = false
  let disposed = false
  let unlocked = false
  let muted = false
  let ctx = null
  let master = null
  const buffers = {}
  let voToken = 0
  let musicToken = 0
  // Draft 98: the runner's music is scheduled directly on the Web Audio
  // clock (gapless intro->loop splice, same technique as the title
  // screen's `unlockAndPlay`) rather than swapped as an HTMLAudio `.src` --
  // `runnerGain` is its own sub-bus under `master` so it ducks/fades like
  // every other bed; `runnerSources` holds the two live BufferSourceNodes
  // so leaving the plate can `.stop()` them (a looping source otherwise
  // plays forever, silently, once its gain reaches 0).
  let runnerGain = null
  let runnerSources = null
  let runnerToken = 0

  function duckMul() {
    // Speaking can layer over a station video's own lighter duck (Spark's
    // hints/lessons play while the camp is on screen, not during a video);
    // the deepest applicable duck wins on each track.
    const base = DUCK[duckCtx] || DUCK.none
    const spoken = speaking ? DUCK.speaking : DUCK.none
    return { music: Math.min(base.music, spoken.music), ambience: Math.min(base.ambience, spoken.ambience) }
  }

  function applyVolumes(ease) {
    const d = duckMul()
    // The runner's music lives on `runnerGain` (Web Audio, gapless splice)
    // instead of the plain `music` HTMLAudio element -- keep `music` silent
    // for that plate so a stale `.src` from an earlier plate can't bleed in.
    const targetMusic = plate && plate !== 'foglinerun' ? MUSIC_VOL * d.music : 0
    const targetRunnerMusic = plate === 'foglinerun' ? MUSIC_VOL * d.music : 0
    const targetCampfire = plate === 'plate2' ? CAMPFIRE_VOL * d.ambience : 0
    const targetForest =
      plate === 'plate1'
        ? FOREST_VOL * d.ambience
        : plate === 'plate2'
          ? FOREST_VOL * FOREST_UNDER_CAMPFIRE_MULT * d.ambience
          : plate === 'foglinerun'
            ? FOREST_VOL * FOREST_UNDER_FOGLINERUN_MULT * d.ambience
            : 0
    try {
      if (ease) {
        rampVolume(music, targetMusic, DUCK_RESTORE_MS)
        rampVolume(campfire, targetCampfire, DUCK_RESTORE_MS)
        rampVolume(forest, targetForest, DUCK_RESTORE_MS)
        if (runnerGain) rampGain(runnerGain, targetRunnerMusic, DUCK_RESTORE_MS)
      } else {
        music.volume = targetMusic
        campfire.volume = targetCampfire
        forest.volume = targetForest
        if (runnerGain) runnerGain.gain.value = targetRunnerMusic
      }
    } catch {
      /* iOS ignores volume writes; fine */
    }
  }

  // Draft 98: the runner's intro->loop is scheduled up front on the shared
  // Web Audio clock, same technique as the title screen's `unlockAndPlay`
  // (`introSrc.start(startAt)`, `loopSrc.start(startAt + introBuf.duration)`
  // -- no `ended`-event handoff, so no audible gap at the splice).
  function decodeCached(name) {
    if (buffers[name]) return Promise.resolve(buffers[name])
    if (buffers[name] === null) return Promise.reject(new Error('previously failed'))
    return fetch(`${base}/audio/${name}.mp3`)
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
      .then((ab) => ctx.decodeAudioData(ab))
      .then((buf) => {
        buffers[name] = buf
        return buf
      })
      .catch((err) => {
        buffers[name] = null
        throw err
      })
  }

  function stopRunnerMusic() {
    runnerToken += 1
    if (runnerSources) {
      runnerSources.forEach((src) => {
        try {
          src.stop()
        } catch {
          /* already stopped */
        }
      })
      runnerSources = null
    }
  }

  function startRunnerMusic() {
    if (!ctx) return
    const token = ++runnerToken
    Promise.all([decodeCached('z2-music-runner-intro'), decodeCached('z2-music-runner-loop')])
      .then(([introBuf, loopBuf]) => {
        // A fast plate change away (or dispose) while this decode was in
        // flight -- don't schedule playback nobody asked for any more.
        if (token !== runnerToken || !ctx || ctx.state === 'closed') return
        const startAt = ctx.currentTime + 0.05
        const introSrc = ctx.createBufferSource()
        introSrc.buffer = introBuf
        introSrc.connect(runnerGain)
        introSrc.start(startAt)
        const loopSrc = ctx.createBufferSource()
        loopSrc.buffer = loopBuf
        loopSrc.loop = true
        loopSrc.connect(runnerGain)
        loopSrc.start(startAt + introBuf.duration)
        runnerSources = [introSrc, loopSrc]
      })
      .catch(() => {
        /* the runner's music is a nice-to-have; a failed fetch/decode never blocks the traversal */
      })
  }

  return {
    unlock() {
      if (unlocked || disposed) return
      unlocked = true
      els.forEach((el) => {
        try {
          el.muted = true
          const p = el.play()
          if (p && p.then) {
            p.then(() => {
              el.pause()
              el.currentTime = 0
              el.muted = muted
            }).catch(() => {
              el.muted = muted
            })
          }
        } catch {
          /* ignore */
        }
      })
      try {
        const AC = window.AudioContext || window.webkitAudioContext
        if (AC) {
          ctx = new AC()
          master = ctx.createGain()
          master.gain.value = muted ? 0 : 1
          master.connect(ctx.destination)
          runnerGain = ctx.createGain()
          runnerGain.gain.value = 0
          runnerGain.connect(master)
          if (ctx.state === 'suspended') ctx.resume().catch(() => {})
        }
      } catch {
        ctx = null
        master = null
      }
    },

    setMuted(m) {
      muted = !!m
      els.forEach((el) => {
        try {
          el.muted = muted
        } catch {
          /* ignore */
        }
      })
      if (master) master.gain.value = muted ? 0 : 1
    },

    // Draft 94 (item 1f): switch plates -- music fades OUT then, only once
    // silent, the new track fades IN (no overlap; the two loops are in
    // different keys). Ambience crossfades normally (2s overlap, per the
    // draft). `campfire`/`forest` are both real Audio elements the whole
    // time; which one(s) are actually audible is just `plate`'s effect on
    // applyVolumes's targets, so "crossfade" here is really "let both ramp
    // toward their new targets together."
    setPlate(which) {
      if (which === plate || disposed) return
      const token = ++musicToken
      const prevPlate = plate
      const goingSilent = plate !== null
      plate = which

      // Leaving the runner plate: fade its bus out, then stop its
      // BufferSourceNodes once silent (a looping source otherwise keeps
      // playing forever, just inaudibly, once its gain reaches 0).
      if (prevPlate === 'foglinerun') {
        rampGain(runnerGain, 0, MUSIC_FADE_OUT_MS)
        setTimeout(() => {
          if (token === musicToken) stopRunnerMusic()
        }, MUSIC_FADE_OUT_MS)
      }

      if (which === 'foglinerun') {
        // This plate's music is scheduled on the Web Audio clock instead
        // of swapped as `music.src` -- fade the plain HTMLAudio track out
        // of the way (it may still be carrying the previous plate's track)
        // and start the runner's own gapless intro->loop.
        rampVolume(music, 0, MUSIC_FADE_OUT_MS)
        startRunnerMusic()
        rampGain(runnerGain, MUSIC_VOL * duckMul().music, MUSIC_FADE_IN_MS)
      } else if (goingSilent) {
        rampVolume(music, 0, MUSIC_FADE_OUT_MS)
        setTimeout(() => {
          if (token !== musicToken) return
          try {
            music.pause()
            music.currentTime = 0
            music.src = `${base}/audio/z2-music-${which}.mp3`
            music.loop = true
            music.play().catch(() => {})
            rampVolume(music, MUSIC_VOL * duckMul().music, MUSIC_FADE_IN_MS)
          } catch {
            /* ignore */
          }
        }, MUSIC_FADE_OUT_MS)
      } else {
        try {
          music.src = `${base}/audio/z2-music-${which}.mp3`
          music.loop = true
          music.play().catch(() => {})
        } catch {
          /* ignore */
        }
        rampVolume(music, MUSIC_VOL * duckMul().music, MUSIC_FADE_IN_MS)
      }
      campfire.play().catch(() => {})
      forest.play().catch(() => {})
      rampVolume(campfire, which === 'plate2' ? CAMPFIRE_VOL * duckMul().ambience : 0, AMBIENCE_CROSSFADE_MS)
      rampVolume(
        forest,
        which === 'plate1'
          ? FOREST_VOL * duckMul().ambience
          : which === 'plate2'
            ? FOREST_VOL * FOREST_UNDER_CAMPFIRE_MULT * duckMul().ambience
            : which === 'foglinerun'
              ? FOREST_VOL * FOREST_UNDER_FOGLINERUN_MULT * duckMul().ambience
              : 0,
        AMBIENCE_CROSSFADE_MS,
      )
    },

    // Draft 94 (item 1f): the on-screen context's own duck level -- a zone
    // video ducks music to 0 (it carries its own score) and ambience to
    // 30%; a station video (no score) leans to 35%/50%. `null` clears back
    // to the plate's normal levels.
    setVideoDuck(context) {
      duckCtx = context || 'none'
      applyVolumes(true)
    },

    duck(on) {
      const releasing = speaking && !on
      speaking = !!on
      applyVolumes(releasing)
    },

    speak(file) {
      if (disposed) return Promise.resolve()
      const token = ++voToken
      speaking = true
      applyVolumes()
      return new Promise((resolve) => {
        const finish = () => {
          if (token !== voToken) return resolve()
          speaking = false
          applyVolumes(true)
          resolve()
        }
        try {
          vo.pause()
          vo.currentTime = 0
          vo.src = `${base}/audio/${file}`
          // `{ once: true }` self-removes after firing (Draft 92's fix for
          // the same class of bug): a bare `vo.onended =` is a property
          // assignment that a LATER speak() call on this same shared
          // element silently overwrites, orphaning whichever call's
          // playback is still in flight -- its promise then never
          // resolves. That's not just a theoretical race: React
          // StrictMode's dev-only double-invoke of an effect that calls
          // speak() does exactly this (Draft 94's StationSequence hit it).
          vo.addEventListener('ended', finish, { once: true })
          vo.addEventListener('error', finish, { once: true })
          const p = vo.play()
          if (p && p.catch) p.catch(finish)
        } catch {
          finish()
        }
      })
    },

    stopSpeech() {
      voToken++
      speaking = false
      applyVolumes()
      try {
        vo.pause()
      } catch {
        /* ignore */
      }
    },

    sfx(name) {
      if (disposed || !ctx) return
      const play = (buf) => {
        try {
          const src = ctx.createBufferSource()
          src.buffer = buf
          const gain = ctx.createGain()
          const key = name.startsWith('step-') ? 'step' : name
          gain.gain.value = SFX_VOL[key] ?? SFX_VOL.default
          src.connect(gain).connect(master || ctx.destination)
          src.start()
        } catch {
          /* ignore */
        }
      }
      const cached = buffers[name]
      if (cached === null) return
      if (cached) return play(cached)
      buffers[name] = undefined
      fetch(`${sfxDir}/sfx/${name}.mp3`)
        .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
        .then((ab) => ctx.decodeAudioData(ab))
        .then((buf) => {
          buffers[name] = buf
          play(buf)
        })
        .catch(() => {
          buffers[name] = null
        })
    },

    preloadSfx(names) {
      if (!ctx) return
      names.forEach((name) => {
        if (buffers[name] !== undefined) return
        buffers[name] = undefined
        fetch(`${sfxDir}/sfx/${name}.mp3`)
          .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
          .then((ab) => ctx.decodeAudioData(ab))
          .then((buf) => {
            buffers[name] = buf
          })
          .catch(() => {
            buffers[name] = null
          })
      })
    },

    dispose() {
      disposed = true
      voToken++
      musicToken++
      stopRunnerMusic()
      els.forEach((el) => {
        try {
          el.pause()
          el.src = ''
        } catch {
          /* ignore */
        }
      })
      if (ctx) {
        try {
          ctx.close()
        } catch {
          /* ignore */
        }
        ctx = null
      }
    },
  }
}
