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

const AMBIENCE_VOL = 0.28
const POND_MAX_VOL = 0.55
const POND_DUCKS_AMBIENCE = 0.4 // ambience ×(1 - this×pond)
const SPEECH_DUCK = 0.3
const SFX_VOL = { default: 0.7, step: 0.45, 'arrive-swell': 0.6, 'chime-unlock': 0.7 }

export function createZoneAudio({ base, pondUrl }) {
  const ambience = new Audio(`${base}/audio/ambience.mp3`)
  ambience.loop = true
  ambience.preload = 'auto'
  const pond = new Audio(pondUrl)
  pond.loop = true
  pond.preload = 'auto'
  const vo = new Audio()
  vo.preload = 'auto'
  const els = [ambience, pond, vo]

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

  function applyVolumes() {
    const duck = speaking ? SPEECH_DUCK : 1
    try {
      ambience.volume = bedsOn ? AMBIENCE_VOL * (1 - POND_DUCKS_AMBIENCE * pondFactor) * duck : 0
      pond.volume = bedsOn ? POND_MAX_VOL * pondFactor * duck : 0
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
      pond.play().catch(() => {})
    },

    // Pause (not stop) so the pond bed resumes where it left off.
    stopBeds() {
      bedsOn = false
      applyVolumes()
      try {
        ambience.pause()
        pond.pause()
      } catch {
        /* ignore */
      }
    },

    setPond(f) {
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
          applyVolumes()
          resolve()
        }
        try {
          vo.pause()
          vo.currentTime = 0
          vo.src = `${base}/audio/${file}`
          vo.onended = finish
          vo.onerror = finish
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
      fetch(`${base}/sfx/${name}.mp3`)
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
        fetch(`${base}/sfx/${name}.mp3`)
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
