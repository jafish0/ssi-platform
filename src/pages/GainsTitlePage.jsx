// /gains-demo/title — "Shadowmend: The Long Light" title screen (GAINS
// Draft 97). Ported from the Design build at
// `Gains for Teens/Design System Assets/title-plate/design/Title Screen.html`
// -- port, don't rewrite: the CSS/SVG markup below is copied verbatim
// (mount as a component the same way the zone overlay sets are inlined),
// and the entrance/fit/sparks script is the same logic, just re-homed into
// a mount effect since a `dangerouslySetInnerHTML`'d <script> never runs.
//
// Two deliberate departures from the Design file, both called out in the
// draft:
//   - `--font-display`/`--ease-soft`/`--ease-drift` are dropped from this
//     component's own `:root` rule -- gains-tokens.css already defines all
//     three globally (the app's own display font is Nunito, not the
//     Design build's serif pick), so redeclaring them on :root here would
//     silently fight the global values depending on stylesheet order.
//   - The Design file's own tap-anywhere-begins wiring is NOT ported
//     as-is: Draft 97 wants the FIRST tap to only unlock audio (when
//     locked) and the SECOND to actually begin, which needs to run
//     *before* TitleScreen.begin() commits -- so this component supplies
//     its own click/keydown handlers instead of the two `begin()`-calling
//     listeners the original script attached, and never ports those two
//     lines. Everything else in the script (fit, fitTitle, entrance,
//     mute-visual-toggle, the whole sparks system, the TitleScreen API
//     itself) is unchanged.

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TITLE, SUBTITLE } from '../components/gains/title/titleCopy.js'
import '../styles/gains-tokens.css'

const BASE = '/long-light/title'
const UNLOCK_KEY = 'sm-title-audio-unlocked'

// ---- CSS, verbatim from Title Screen.html except the :root font/easing
// vars (see header comment) and the asset path baked into nothing here --
// the CSS itself never references the plate image. ----
const CSS = `
html,body{margin:0;height:100%;background:#07060c;overflow:hidden}
#title-screen{position:absolute;left:50%;top:50%;width:1080px;height:1920px;transform-origin:50% 50%;overflow:hidden;background:#07060c;cursor:pointer;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none}
.plate{position:absolute;left:0;top:0;width:1080px;height:1920px;opacity:0;transition:opacity 1s ease}
.is-entered .plate{opacity:1}
.layer{position:absolute;left:0;top:0;width:1080px;height:1920px;overflow:visible;pointer-events:none}
#layer-beacon,#layer-lamps,#layer-pond-glint,#layer-lantern,#layer-motes{mix-blend-mode:screen}

.intro{opacity:0;transition:opacity var(--in-dur,1.2s) var(--ease-soft) var(--in,0s)}
.is-entered .intro{opacity:1}
.intro-catch{transform:scale(.4);transition:transform 1.3s cubic-bezier(.2,.9,.25,1) 1s}
.is-entered .intro-catch{transform:none}

.sky-wisp{animation-name:ts-sky-l,ts-breathe;animation-timing-function:var(--ease-drift);animation-iteration-count:infinite;animation-direction:alternate}
.sky-wisp--r{animation-name:ts-sky-r,ts-breathe}
@keyframes ts-sky-l{from{transform:translateX(0)}to{transform:translateX(-80px)}}
@keyframes ts-sky-r{from{transform:translateX(0)}to{transform:translateX(80px)}}
@keyframes ts-breathe{from{opacity:.7}to{opacity:1}}

.beacon-bloom{animation:ts-beacon 8s var(--ease-soft) infinite}
.beacon-bloom--mid{animation-delay:-1.2s}
@keyframes ts-beacon{0%,100%{transform:scale(.92);opacity:.72}50%{transform:scale(1.08);opacity:1}}
.beacon-core{animation:ts-beacon-core 8s var(--ease-soft) infinite;animation-delay:-2.4s}
@keyframes ts-beacon-core{0%,100%{transform:scale(.9);opacity:.8}50%{transform:scale(1.15);opacity:1}}
.beacon-rays{animation:ts-rays 56s var(--ease-soft) infinite alternate}
@keyframes ts-rays{from{transform:rotate(-10deg)}to{transform:rotate(10deg)}}
.beacon-ray{animation-name:ts-ray;animation-timing-function:var(--ease-soft);animation-iteration-count:infinite;animation-direction:alternate}
@keyframes ts-ray{from{opacity:.5}to{opacity:1}}

.lamp-bloom,.lamp-core{animation-name:ts-lamp;animation-timing-function:var(--ease-soft);animation-iteration-count:infinite}
@keyframes ts-lamp{0%,100%{transform:scale(.94);opacity:.72}50%{transform:scale(1.07);opacity:1}}
.fire-breathe{animation:ts-lamp 5s var(--ease-soft) infinite}
.fire-breathe--spill{animation-delay:-1.7s}
.fire-flicker{animation-timing-function:steps(1,end);animation-iteration-count:infinite}
.fire-flicker--a{animation-name:ts-flick-a;animation-duration:.71s}
.fire-flicker--b{animation-name:ts-flick-c;animation-duration:.47s;animation-delay:-.2s}

.fog-a{animation:ts-fog-a 210s linear infinite}
.fog-b{animation:ts-fog-b 280s linear infinite}
@keyframes ts-fog-a{from{transform:translateX(0)}to{transform:translateX(-1080px)}}
@keyframes ts-fog-b{from{transform:translateX(-1080px)}to{transform:translateX(0)}}
.fog-pool-blob{animation-name:ts-pool-l,ts-breathe;animation-timing-function:var(--ease-drift);animation-iteration-count:infinite;animation-direction:alternate}
.fog-pool-blob--r{animation-name:ts-pool-r,ts-breathe}
@keyframes ts-pool-l{from{transform:translateX(0)}to{transform:translateX(-40px)}}
@keyframes ts-pool-r{from{transform:translateX(0)}to{transform:translateX(40px)}}

.pond-ring{animation:ts-ring 9s ease-out infinite}
@keyframes ts-ring{0%{transform:scale(.4);opacity:0}15%{opacity:1}100%{transform:scale(3.2);opacity:0}}
.pond-glint{animation-name:ts-glint;animation-timing-function:var(--ease-soft);animation-iteration-count:infinite;animation-direction:alternate}
@keyframes ts-glint{from{opacity:.25;transform:scaleX(.7)}to{opacity:1;transform:scaleX(1.05)}}
.pond-sheen{animation:ts-breathe 8s var(--ease-soft) infinite alternate}

.lantern-pool{animation:ts-pool 7s var(--ease-soft) infinite}
.lantern-bloom{animation:ts-pool 7s var(--ease-soft) infinite;animation-delay:-2s}
@keyframes ts-pool{0%,100%{transform:scale(.96);opacity:.78}50%{transform:scale(1.05);opacity:1}}
.lantern-flicker{animation-timing-function:steps(1,end);animation-iteration-count:infinite}
.lantern-flicker--a{animation-name:ts-flick-a;animation-duration:.87s}
.lantern-flicker--b{animation-name:ts-flick-b;animation-duration:.61s;animation-delay:-.2s}
.lantern-flicker--c{animation-name:ts-flick-c;animation-duration:.43s;animation-delay:-.1s}
@keyframes ts-flick-a{0%{opacity:.82;transform:scale(1)}17%{opacity:1;transform:scale(1.03,1.05)}38%{opacity:.76;transform:scale(.98)}55%{opacity:.94;transform:scale(1.02)}74%{opacity:.84;transform:scale(1,1.03)}91%{opacity:.98;transform:scale(1.03)}}
@keyframes ts-flick-b{0%{opacity:.74;transform:scale(1)}22%{opacity:.98;transform:scale(1.04,1.08)}47%{opacity:.68;transform:scale(.97)}68%{opacity:.9;transform:scale(1.02,1.05)}86%{opacity:.8;transform:scale(1)}}
@keyframes ts-flick-c{0%{opacity:.78;transform:scale(1)}25%{opacity:1;transform:scale(1.06,1.12)}51%{opacity:.72;transform:scale(.95)}77%{opacity:.94;transform:scale(1.03,1.08)}}

.mote{animation-name:ts-mote-a;animation-timing-function:var(--ease-drift);animation-iteration-count:infinite;will-change:transform,opacity}
.mote--b{animation-name:ts-mote-b}
@keyframes ts-mote-a{0%{transform:translate(0,0);opacity:0}12%{opacity:1}50%{transform:translate(14px,-90px)}88%{opacity:.9}100%{transform:translate(-6px,-190px);opacity:0}}
@keyframes ts-mote-b{0%{transform:translate(0,0);opacity:0}12%{opacity:1}50%{transform:translate(-16px,-84px)}88%{opacity:.9}100%{transform:translate(8px,-190px);opacity:0}}
.mote-core{animation-name:ts-blink;animation-timing-function:var(--ease-soft);animation-iteration-count:infinite}
@keyframes ts-blink{0%,100%{opacity:.2}45%{opacity:1}70%{opacity:.5}}

#title-block{position:absolute;left:90px;top:320px;transform:translateY(-50%);display:flex;flex-direction:column;align-items:flex-start;pointer-events:none}
.title-vignette{position:absolute;left:-150px;right:-170px;top:-150px;bottom:-150px;background:radial-gradient(closest-side,rgba(28,8,34,.12),rgba(28,8,34,.05) 62%,rgba(28,8,34,0));opacity:0;transition:opacity 2s var(--ease-soft) 4.2s}
.is-entered .title-vignette{opacity:1}
.title-l1{position:relative;opacity:0;filter:blur(10px);transform:translateY(6px);transition:opacity 1.8s var(--ease-soft) 4.6s,filter 2.2s var(--ease-soft) 4.6s,transform 2.2s var(--ease-soft) 4.6s}
.title-l2{position:relative;opacity:0;filter:blur(6px);transition:opacity 1.4s var(--ease-soft) 5.6s,filter 1.8s var(--ease-soft) 5.6s}
.is-entered .title-l1,.is-entered .title-l2{opacity:1;filter:none;transform:none}
.title-bloom{position:absolute;left:-8%;top:-48%;width:116%;height:196%;background:radial-gradient(ellipse 50% 50% at 50% 50%,rgba(255,140,96,.36),rgba(255,178,92,.16) 45%,rgba(255,178,92,0) 72%);filter:blur(6px);animation:ts-title-bloom 6s var(--ease-soft) infinite}
@keyframes ts-title-bloom{0%,100%{opacity:.72;transform:scale(.97)}50%{opacity:1;transform:scale(1.03)}}
.t1{margin:0 -.2em 0 0;font-family:var(--font-display);font-weight:700;font-size:var(--t1-size,58px);line-height:1.05;letter-spacing:.2em;white-space:nowrap;display:inline-block}
.title-line1{position:relative;color:#f4c56c;text-shadow:0 0 .18em rgba(255,168,96,.55),0 0 .6em rgba(255,120,86,.32),0 .03em 0 rgba(60,20,30,.35);animation:ts-lum 6s var(--ease-soft) infinite}
@keyframes ts-lum{0%,100%{filter:brightness(.92)}50%{filter:brightness(1.12)}}
.title-shimmer{position:absolute;left:0;top:0;color:transparent;background:linear-gradient(100deg,rgba(255,230,190,0) 42%,rgba(255,238,200,.95) 50%,rgba(255,190,120,0) 58%);background-size:260% 100%;background-repeat:no-repeat;background-position:100% 0;-webkit-background-clip:text;background-clip:text;mix-blend-mode:screen;animation:ts-shimmer 12s linear infinite;animation-delay:7s}
@keyframes ts-shimmer{0%{background-position:100% 0}24%,100%{background-position:0 0}}
.title-line2{margin:.5em 0 0 .06em;font-family:var(--font-display);font-weight:400;font-size:calc(var(--t1-size,58px)*.5);line-height:1.1;letter-spacing:.12em;color:#f7e9cc;text-shadow:0 0 .5em rgba(255,206,150,.35);white-space:nowrap}

.title-prompt{position:absolute;left:0;right:0;top:1840px;margin:0;padding-left:.24em;transform:translateY(-50%);text-align:center;font-family:var(--font-display);font-size:30px;letter-spacing:.24em;color:#f7e9cc;opacity:0;transition:opacity 1.4s var(--ease-soft) 7.6s;pointer-events:none;text-shadow:0 0 12px rgba(40,16,10,.6)}
.is-entered .title-prompt{opacity:.7}
.is-begun .title-prompt{opacity:0;transition-delay:0s;transition-duration:.6s}
.title-prompt.is-ack{opacity:1;transition-duration:.3s}
.title-prompt__text{display:inline-block;animation:ts-prompt 2s ease-in-out infinite alternate}
@keyframes ts-prompt{from{opacity:1}to{opacity:.45}}
.title-mute{position:absolute;right:34px;bottom:34px;width:72px;height:72px;padding:0;border:0;background:none;color:#f7e9cc;opacity:0;cursor:pointer;display:grid;place-items:center;transition:opacity 1.2s ease 7.6s}
.is-entered .title-mute{opacity:.5}
.title-mute:focus-visible{outline:2px solid rgba(247,233,204,.6);outline-offset:4px;border-radius:50%}
.title-mute svg{width:40px;height:40px;display:block}
.title-mute .mute-x{display:none}
.title-mute.is-muted .mute-waves{display:none}
.title-mute.is-muted .mute-x{display:inline}

@media (prefers-reduced-motion: reduce){
  .sky-wisp,.beacon-bloom,.beacon-core,.beacon-rays,.beacon-ray,.lamp-bloom,.lamp-core,.fire-breathe,.fire-flicker,.fog-a,.fog-b,.fog-pool-blob,.pond-glint,.pond-sheen,.lantern-pool,.lantern-bloom,.lantern-flicker,.mote,.mote-core,.title-line1,.title-bloom,.title-prompt__text{animation:none!important}
  .title-shimmer,.pond-ring{display:none}
  .mote{opacity:.6}
  .intro-catch{transform:none}
  .title-l1,.title-l2{filter:none;transform:none}
}

.sm-title-page{position:fixed;inset:0;background:#07060c}
.sm-fade-out{transition:opacity 1s ease}
`

// ---- markup, verbatim from Title Screen.html's <body> (minus the
// trailing <script>, and with the plate src + title strings templated in). ----
function bodyHtml() {
  return `
<div id="title-screen" role="button" aria-label="Tap to begin">
  <img id="title-plate" class="plate" src="${BASE}/plate.webp" width="1080" height="1920" alt="">
  <svg class="layer" id="layer-sky-drift" viewBox="0 0 1080 1920" width="1080" height="1920" aria-hidden="true" focusable="false">
    <defs><radialGradient id="sky-g0" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#5e4258" stop-opacity="1"/><stop offset=".55" stop-color="#5e4258" stop-opacity=".45"/><stop offset="1" stop-color="#5e4258" stop-opacity="0"/></radialGradient><radialGradient id="sky-g1" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#8c5a62" stop-opacity="1"/><stop offset=".55" stop-color="#8c5a62" stop-opacity=".45"/><stop offset="1" stop-color="#8c5a62" stop-opacity="0"/></radialGradient><radialGradient id="sky-g2" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#7a4e5e" stop-opacity="1"/><stop offset=".55" stop-color="#7a4e5e" stop-opacity=".45"/><stop offset="1" stop-color="#7a4e5e" stop-opacity="0"/></radialGradient><radialGradient id="sky-g3" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#a9686a" stop-opacity="1"/><stop offset=".55" stop-color="#a9686a" stop-opacity=".45"/><stop offset="1" stop-color="#a9686a" stop-opacity="0"/></radialGradient><radialGradient id="sky-g4" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#eea070" stop-opacity="1"/><stop offset=".55" stop-color="#eea070" stop-opacity=".45"/><stop offset="1" stop-color="#eea070" stop-opacity="0"/></radialGradient><radialGradient id="sky-g5" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#e39a7a" stop-opacity="1"/><stop offset=".55" stop-color="#e39a7a" stop-opacity=".45"/><stop offset="1" stop-color="#e39a7a" stop-opacity="0"/></radialGradient><radialGradient id="sky-g6" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#f6b07a" stop-opacity="1"/><stop offset=".55" stop-color="#f6b07a" stop-opacity=".45"/><stop offset="1" stop-color="#f6b07a" stop-opacity="0"/></radialGradient><radialGradient id="sky-g7" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#d9a08e" stop-opacity="1"/><stop offset=".55" stop-color="#d9a08e" stop-opacity=".45"/><stop offset="1" stop-color="#d9a08e" stop-opacity="0"/></radialGradient><radialGradient id="sky-g8" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#c69aa0" stop-opacity="1"/><stop offset=".55" stop-color="#c69aa0" stop-opacity=".45"/><stop offset="1" stop-color="#c69aa0" stop-opacity="0"/></radialGradient><radialGradient id="sky-g9" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#c49ba2" stop-opacity="1"/><stop offset=".55" stop-color="#c49ba2" stop-opacity=".45"/><stop offset="1" stop-color="#c49ba2" stop-opacity="0"/></radialGradient><radialGradient id="sky-g10" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ab8aa0" stop-opacity="1"/><stop offset=".55" stop-color="#ab8aa0" stop-opacity=".45"/><stop offset="1" stop-color="#ab8aa0" stop-opacity="0"/></radialGradient><radialGradient id="sky-g11" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#9f86a6" stop-opacity="1"/><stop offset=".55" stop-color="#9f86a6" stop-opacity=".45"/><stop offset="1" stop-color="#9f86a6" stop-opacity="0"/></radialGradient><radialGradient id="sky-g12" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#e8a888" stop-opacity="1"/><stop offset=".55" stop-color="#e8a888" stop-opacity=".45"/><stop offset="1" stop-color="#e8a888" stop-opacity="0"/></radialGradient></defs>
    <g class="intro" style="--in:.2s;--in-dur:1.6s">
      <g opacity="0.12"><ellipse class="sky-wisp sky-wisp--l" cx="180" cy="60" rx="280" ry="50" fill="url(#sky-g0)" style="transform-origin:180px 60px;animation-duration:89s,28s;animation-delay:-48s,-17s"/></g>
      <g opacity="0.14"><ellipse class="sky-wisp sky-wisp--r" cx="700" cy="80" rx="300" ry="60" fill="url(#sky-g1)" style="transform-origin:700px 80px;animation-duration:118s,30s;animation-delay:-43s,-10s"/></g>
      <g opacity="0.09"><ellipse class="sky-wisp sky-wisp--l" cx="260" cy="210" rx="260" ry="48" fill="url(#sky-g2)" style="transform-origin:260px 210px;animation-duration:113s,25s;animation-delay:-53s,-10s"/></g>
      <g opacity="0.09"><ellipse class="sky-wisp sky-wisp--r" cx="430" cy="430" rx="240" ry="42" fill="url(#sky-g3)" style="transform-origin:430px 430px;animation-duration:123s,25s;animation-delay:-31s,-7s"/></g>
      <g opacity="0.22"><ellipse class="sky-wisp sky-wisp--l" cx="880" cy="300" rx="240" ry="60" fill="url(#sky-g4)" style="transform-origin:880px 300px;animation-duration:101s,23s;animation-delay:-32s,-4s"/></g>
      <g opacity="0.2"><ellipse class="sky-wisp sky-wisp--r" cx="1000" cy="420" rx="200" ry="56" fill="url(#sky-g5)" style="transform-origin:1000px 420px;animation-duration:102s,20s;animation-delay:-22s,-4s"/></g>
      <g opacity="0.17"><ellipse class="sky-wisp sky-wisp--l" cx="760" cy="420" rx="220" ry="50" fill="url(#sky-g6)" style="transform-origin:760px 420px;animation-duration:92s,21s;animation-delay:-12s,0s"/></g>
      <g opacity="0.2"><ellipse class="sky-wisp sky-wisp--r" cx="950" cy="560" rx="210" ry="60" fill="url(#sky-g7)" style="transform-origin:950px 560px;animation-duration:82s,18s;animation-delay:-13s,-14s"/></g>
      <g opacity="0.22"><ellipse class="sky-wisp sky-wisp--l" cx="120" cy="560" rx="230" ry="70" fill="url(#sky-g8)" style="transform-origin:120px 560px;animation-duration:83s,28s;animation-delay:-1s,-6s"/></g>
      <g opacity="0.2"><ellipse class="sky-wisp sky-wisp--r" cx="330" cy="620" rx="240" ry="64" fill="url(#sky-g9)" style="transform-origin:330px 620px;animation-duration:71s,22s;animation-delay:-44s,-8s"/></g>
      <g opacity="0.2"><ellipse class="sky-wisp sky-wisp--l" cx="80" cy="690" rx="200" ry="60" fill="url(#sky-g10)" style="transform-origin:80px 690px;animation-duration:114s,23s;animation-delay:-20s,-14s"/></g>
      <g opacity="0.18"><ellipse class="sky-wisp sky-wisp--r" cx="260" cy="700" rx="220" ry="56" fill="url(#sky-g11)" style="transform-origin:260px 700px;animation-duration:90s,28s;animation-delay:-25s,-18s"/></g>
      <g opacity="0.15"><ellipse class="sky-wisp sky-wisp--l" cx="540" cy="560" rx="200" ry="50" fill="url(#sky-g12)" style="transform-origin:540px 560px;animation-duration:95s,31s;animation-delay:-44s,-9s"/></g>
    </g>
  </svg>
  <svg class="layer" id="layer-beacon" viewBox="0 0 1080 1920" width="1080" height="1920" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id="bc-outer" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd9a0" stop-opacity=".75"/><stop offset=".35" stop-color="#ff9e70" stop-opacity=".32"/><stop offset=".7" stop-color="#e0706a" stop-opacity=".1"/><stop offset="1" stop-color="#a04a6a" stop-opacity="0"/></radialGradient>
      <radialGradient id="bc-mid" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff0cc" stop-opacity=".9"/><stop offset=".4" stop-color="#ffc878" stop-opacity=".4"/><stop offset="1" stop-color="#ff9860" stop-opacity="0"/></radialGradient>
      <radialGradient id="bc-core" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fffaf0" stop-opacity="1"/><stop offset="1" stop-color="#ffe2a8" stop-opacity="0"/></radialGradient>
      <linearGradient id="bc-ray" gradientUnits="userSpaceOnUse" x1="817" y1="160" x2="1717" y2="160"><stop offset="0" stop-color="#ffe6b8" stop-opacity=".9"/><stop offset=".4" stop-color="#ffb982" stop-opacity=".35"/><stop offset="1" stop-color="#ff9a78" stop-opacity="0"/></linearGradient>
    </defs>
    <g class="intro" style="--in:4.4s;--in-dur:1.8s">
      <g opacity=".5"><ellipse class="beacon-bloom" cx="817" cy="160" rx="320" ry="280" fill="url(#bc-outer)" style="transform-origin:817px 160px"/></g>
      <g opacity=".55"><ellipse class="beacon-bloom beacon-bloom--mid" cx="817" cy="160" rx="150" ry="140" fill="url(#bc-mid)" style="transform-origin:817px 160px"/></g>
      <g opacity=".8"><circle class="beacon-core" cx="817" cy="160" r="34" fill="url(#bc-core)" style="transform-origin:817px 160px"/></g>
    </g>
    <g class="intro" style="--in:4.9s;--in-dur:2.4s">
      <g class="beacon-rays" style="transform-origin:817px 160px">
        <g transform="rotate(-128 817 160)"><g opacity="0.11"><path class="beacon-ray" d="M817 160 L1717 114 L1717 206 Z" fill="url(#bc-ray)" style="animation-duration:13s"/></g></g>
        <g transform="rotate(-80 817 160)"><g opacity="0.12"><path class="beacon-ray" d="M817 160 L1717 114 L1717 206 Z" fill="url(#bc-ray)" style="animation-duration:17s"/></g></g>
        <g transform="rotate(-30 817 160)"><g opacity="0.1"><path class="beacon-ray" d="M817 160 L1717 114 L1717 206 Z" fill="url(#bc-ray)" style="animation-duration:11s"/></g></g>
      </g>
    </g>
  </svg>
  <svg class="layer" id="layer-lamps" viewBox="0 0 1080 1920" width="1080" height="1920" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id="lp-bloom" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe6b0" stop-opacity=".95"/><stop offset=".3" stop-color="#ffc062" stop-opacity=".42"/><stop offset=".7" stop-color="#d98a3e" stop-opacity=".12"/><stop offset="1" stop-color="#5a4a6e" stop-opacity="0"/></radialGradient>
      <radialGradient id="lp-core" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff4d6" stop-opacity="1"/><stop offset=".5" stop-color="#ffd08a" stop-opacity=".6"/><stop offset="1" stop-color="#ffb060" stop-opacity="0"/></radialGradient>
      <radialGradient id="fr-core" cx=".5" cy=".55" r=".5"><stop offset="0" stop-color="#fff0c4" stop-opacity=".95"/><stop offset=".3" stop-color="#ffc463" stop-opacity=".5"/><stop offset=".7" stop-color="#f08a36" stop-opacity=".14"/><stop offset="1" stop-color="#b8582a" stop-opacity="0"/></radialGradient>
    </defs>
      <g class="intro" style="--in:1.50s">
        <g opacity=".5"><ellipse class="lamp-bloom" cx="697" cy="1392" rx="74" ry="68" fill="url(#lp-bloom)" style="transform-origin:697px 1392px;animation-duration:6.21s;animation-delay:-3.54s"/></g>
        <g opacity=".75"><circle class="lamp-core" cx="697" cy="1392" r="13" fill="url(#lp-core)" style="transform-origin:697px 1392px;animation-duration:6.21s;animation-delay:-3.54s"/></g>
      </g>
      <g class="intro" style="--in:1.95s">
        <g opacity=".5"><ellipse class="lamp-bloom" cx="460" cy="1252" rx="74" ry="68" fill="url(#lp-bloom)" style="transform-origin:460px 1252px;animation-duration:5.03s;animation-delay:-5.21s"/></g>
        <g opacity=".75"><circle class="lamp-core" cx="460" cy="1252" r="13" fill="url(#lp-core)" style="transform-origin:460px 1252px;animation-duration:5.03s;animation-delay:-5.21s"/></g>
      </g>
      <g class="intro" style="--in:2.40s">
        <g opacity=".5"><ellipse class="lamp-bloom" cx="610" cy="1108" rx="74" ry="68" fill="url(#lp-bloom)" style="transform-origin:610px 1108px;animation-duration:5.27s;animation-delay:-5.18s"/></g>
        <g opacity=".75"><circle class="lamp-core" cx="610" cy="1108" r="13" fill="url(#lp-core)" style="transform-origin:610px 1108px;animation-duration:5.27s;animation-delay:-5.18s"/></g>
      </g>
      <g class="intro" style="--in:2.85s">
        <g opacity=".5"><ellipse class="lamp-bloom" cx="487" cy="992" rx="74" ry="68" fill="url(#lp-bloom)" style="transform-origin:487px 992px;animation-duration:6.25s;animation-delay:-5.29s"/></g>
        <g opacity=".75"><circle class="lamp-core" cx="487" cy="992" r="13" fill="url(#lp-core)" style="transform-origin:487px 992px;animation-duration:6.25s;animation-delay:-5.29s"/></g>
      </g>
      <g class="intro" style="--in:3.30s">
        <g opacity=".5"><ellipse class="lamp-bloom" cx="493" cy="884" rx="74" ry="68" fill="url(#lp-bloom)" style="transform-origin:493px 884px;animation-duration:6.81s;animation-delay:-2.01s"/></g>
        <g opacity=".75"><circle class="lamp-core" cx="493" cy="884" r="13" fill="url(#lp-core)" style="transform-origin:493px 884px;animation-duration:6.81s;animation-delay:-2.01s"/></g>
      </g>
      <g class="intro" style="--in:3.75s">
        <g opacity=".5"><ellipse class="lamp-bloom" cx="364" cy="872" rx="74" ry="68" fill="url(#lp-bloom)" style="transform-origin:364px 872px;animation-duration:5.36s;animation-delay:-2.28s"/></g>
        <g opacity=".75"><circle class="lamp-core" cx="364" cy="872" r="13" fill="url(#lp-core)" style="transform-origin:364px 872px;animation-duration:5.36s;animation-delay:-2.28s"/></g>
      </g>
      <g class="intro" style="--in:3.9s">
        <g opacity=".5"><ellipse class="fire-breathe" cx="360" cy="1171" rx="130" ry="92" fill="url(#lp-bloom)" style="transform-origin:360px 1171px"/></g>
        <g opacity=".3"><ellipse class="fire-breathe fire-breathe--spill" cx="360" cy="1193" rx="150" ry="42" fill="url(#fr-core)" style="transform-origin:360px 1193px"/></g>
        <g opacity=".55"><ellipse class="fire-flicker fire-flicker--a" cx="360" cy="1163" rx="50" ry="46" fill="url(#fr-core)" style="transform-origin:360px 1183px"/></g>
        <g opacity=".6"><ellipse class="fire-flicker fire-flicker--b" cx="362" cy="1157" rx="24" ry="30" fill="url(#fr-core)" style="transform-origin:360px 1179px"/></g>
      </g>
  </svg>
  <svg class="layer" id="layer-fog" viewBox="0 0 1080 1920" width="1080" height="1920" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id="fg-a" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#b3a8d6" stop-opacity=".85"/><stop offset=".5" stop-color="#8f86c0" stop-opacity=".35"/><stop offset="1" stop-color="#6a64a4" stop-opacity="0"/></radialGradient>
      <radialGradient id="fg-b" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#a09cd0" stop-opacity=".8"/><stop offset=".5" stop-color="#7d7bb8" stop-opacity=".32"/><stop offset="1" stop-color="#5b5a98" stop-opacity="0"/></radialGradient>
      <radialGradient id="fg-pool" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#6f5f88" stop-opacity=".9"/><stop offset=".5" stop-color="#4e4468" stop-opacity=".45"/><stop offset="1" stop-color="#2c2640" stop-opacity="0"/></radialGradient>
      <g id="fog-tile-a"><ellipse cx="412" cy="888" rx="213" ry="47" fill="url(#fg-a)" opacity="0.88"/><ellipse cx="371" cy="1045" rx="285" ry="89" fill="url(#fg-a)" opacity="0.75"/><ellipse cx="546" cy="1276" rx="284" ry="81" fill="url(#fg-a)" opacity="0.68"/><ellipse cx="352" cy="790" rx="312" ry="65" fill="url(#fg-a)" opacity="0.82"/><ellipse cx="148" cy="1046" rx="245" ry="82" fill="url(#fg-a)" opacity="0.69"/><ellipse cx="1228" cy="1046" rx="245" ry="82" fill="url(#fg-a)" opacity="0.69"/><ellipse cx="319" cy="1267" rx="230" ry="53" fill="url(#fg-a)" opacity="0.55"/><ellipse cx="89" cy="1226" rx="266" ry="48" fill="url(#fg-a)" opacity="0.92"/><ellipse cx="1169" cy="1226" rx="266" ry="48" fill="url(#fg-a)" opacity="0.92"/><ellipse cx="844" cy="1054" rx="280" ry="69" fill="url(#fg-a)" opacity="0.78"/><ellipse cx="-236" cy="1054" rx="280" ry="69" fill="url(#fg-a)" opacity="0.78"/><ellipse cx="826" cy="994" rx="295" ry="55" fill="url(#fg-a)" opacity="0.77"/><ellipse cx="-254" cy="994" rx="295" ry="55" fill="url(#fg-a)" opacity="0.77"/><ellipse cx="450" cy="976" rx="193" ry="87" fill="url(#fg-a)" opacity="0.68"/><ellipse cx="965" cy="1082" rx="255" ry="85" fill="url(#fg-a)" opacity="0.91"/><ellipse cx="-115" cy="1082" rx="255" ry="85" fill="url(#fg-a)" opacity="0.91"/></g>
      <g id="fog-tile-b"><ellipse cx="254" cy="937" rx="302" ry="48" fill="url(#fg-b)" opacity="0.67"/><ellipse cx="1334" cy="937" rx="302" ry="48" fill="url(#fg-b)" opacity="0.67"/><ellipse cx="353" cy="847" rx="218" ry="78" fill="url(#fg-b)" opacity="0.89"/><ellipse cx="161" cy="1143" rx="270" ry="79" fill="url(#fg-b)" opacity="0.74"/><ellipse cx="1241" cy="1143" rx="270" ry="79" fill="url(#fg-b)" opacity="0.74"/><ellipse cx="393" cy="1347" rx="231" ry="73" fill="url(#fg-b)" opacity="0.86"/><ellipse cx="240" cy="1014" rx="258" ry="73" fill="url(#fg-b)" opacity="0.76"/><ellipse cx="1320" cy="1014" rx="258" ry="73" fill="url(#fg-b)" opacity="0.76"/><ellipse cx="371" cy="1196" rx="282" ry="50" fill="url(#fg-b)" opacity="0.74"/><ellipse cx="109" cy="892" rx="247" ry="59" fill="url(#fg-b)" opacity="0.77"/><ellipse cx="1189" cy="892" rx="247" ry="59" fill="url(#fg-b)" opacity="0.77"/><ellipse cx="155" cy="1071" rx="217" ry="68" fill="url(#fg-b)" opacity="0.86"/><ellipse cx="1235" cy="1071" rx="217" ry="68" fill="url(#fg-b)" opacity="0.86"/><ellipse cx="220" cy="1325" rx="225" ry="88" fill="url(#fg-b)" opacity="0.74"/><ellipse cx="1300" cy="1325" rx="225" ry="88" fill="url(#fg-b)" opacity="0.74"/><ellipse cx="838" cy="1322" rx="182" ry="64" fill="url(#fg-b)" opacity="0.80"/></g>
    </defs>
    <g class="intro" style="--in:.2s;--in-dur:1.6s">
      <g opacity=".24"><g class="fog-a"><use href="#fog-tile-a" x="0"/><use href="#fog-tile-a" x="1080"/></g></g>
      <g opacity=".18"><g class="fog-b"><use href="#fog-tile-b" x="0"/><use href="#fog-tile-b" x="1080"/></g></g>
      <g class="fog-pool">
        <g opacity="0.42"><ellipse class="fog-pool-blob " cx="140" cy="1900" rx="260" ry="70" fill="url(#fg-pool)" style="transform-origin:140px 1900px;animation-duration:55s,19s;animation-delay:-26s,-3s"/></g>
        <g opacity="0.46"><ellipse class="fog-pool-blob fog-pool-blob--r" cx="420" cy="1915" rx="280" ry="64" fill="url(#fg-pool)" style="transform-origin:420px 1915px;animation-duration:51s,15s;animation-delay:-29s,-5s"/></g>
        <g opacity="0.46"><ellipse class="fog-pool-blob " cx="680" cy="1910" rx="280" ry="66" fill="url(#fg-pool)" style="transform-origin:680px 1910px;animation-duration:52s,21s;animation-delay:-11s,0s"/></g>
        <g opacity="0.42"><ellipse class="fog-pool-blob fog-pool-blob--r" cx="950" cy="1900" rx="260" ry="70" fill="url(#fg-pool)" style="transform-origin:950px 1900px;animation-duration:44s,21s;animation-delay:-16s,-2s"/></g>
        <g opacity="0.3"><ellipse class="fog-pool-blob " cx="540" cy="1880" rx="210" ry="42" fill="url(#fg-pool)" style="transform-origin:540px 1880px;animation-duration:57s,17s;animation-delay:-1s,-6s"/></g>
      </g>
    </g>
  </svg>
  <svg class="layer" id="layer-pond-glint" viewBox="0 0 1080 1920" width="1080" height="1920" aria-hidden="true" focusable="false">
    <defs>
      <filter id="pd-soft" x="-60%" y="-300%" width="220%" height="700%"><feGaussianBlur stdDeviation="1.6"/></filter>
      <linearGradient id="pd-ring" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffe0c0" stop-opacity="0"/><stop offset=".3" stop-color="#ffe0c0" stop-opacity=".9"/><stop offset=".7" stop-color="#ffe0c0" stop-opacity=".9"/><stop offset="1" stop-color="#ffe0c0" stop-opacity="0"/></linearGradient>
      <linearGradient id="pd-glint" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffeccc" stop-opacity="0"/><stop offset=".5" stop-color="#ffeccc" stop-opacity=".95"/><stop offset="1" stop-color="#ffeccc" stop-opacity="0"/></linearGradient>
      <radialGradient id="pd-sheen" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd6a8" stop-opacity=".5"/><stop offset="1" stop-color="#ffb888" stop-opacity="0"/></radialGradient>
    </defs>
    <g class="intro" style="--in:4.1s">
      <g opacity=".3"><ellipse class="pond-sheen" cx="700" cy="630" rx="92" ry="16" fill="url(#pd-sheen)" style="transform-origin:700px 630px"/></g>
        <g opacity=".4"><ellipse class="pond-ring" cx="680" cy="632" rx="18" ry="5" fill="none" stroke="url(#pd-ring)" stroke-width="1.6" filter="url(#pd-soft)" style="transform-origin:680px 632px;animation-delay:0s"/></g>
        <g opacity=".4"><ellipse class="pond-ring" cx="735" cy="628" rx="18" ry="5" fill="none" stroke="url(#pd-ring)" stroke-width="1.6" filter="url(#pd-soft)" style="transform-origin:735px 628px;animation-delay:-3s"/></g>
        <g opacity=".4"><ellipse class="pond-ring" cx="655" cy="640" rx="18" ry="5" fill="none" stroke="url(#pd-ring)" stroke-width="1.6" filter="url(#pd-soft)" style="transform-origin:655px 640px;animation-delay:-6s"/></g>
        <g opacity=".5"><rect class="pond-glint" x="627" y="621" width="26" height="2" rx="1" fill="url(#pd-glint)" filter="url(#pd-soft)" style="transform-origin:640px 622px;animation-duration:7.7s;animation-delay:-4.4s"/></g>
        <g opacity=".5"><rect class="pond-glint" x="673" y="627" width="34" height="2" rx="1" fill="url(#pd-glint)" filter="url(#pd-soft)" style="transform-origin:690px 628px;animation-duration:5.4s;animation-delay:-6.8s"/></g>
        <g opacity=".5"><rect class="pond-glint" x="730" y="623" width="24" height="2" rx="1" fill="url(#pd-glint)" filter="url(#pd-soft)" style="transform-origin:742px 624px;animation-duration:7.2s;animation-delay:-6.1s"/></g>
        <g opacity=".5"><rect class="pond-glint" x="695" y="639" width="30" height="2" rx="1" fill="url(#pd-glint)" filter="url(#pd-soft)" style="transform-origin:710px 640px;animation-duration:8.4s;animation-delay:-3.1s"/></g>
        <g opacity=".5"><rect class="pond-glint" x="655" y="633" width="20" height="2" rx="1" fill="url(#pd-glint)" filter="url(#pd-soft)" style="transform-origin:665px 634px;animation-duration:8.1s;animation-delay:-6.2s"/></g>
    </g>
  </svg>
  <svg class="layer" id="layer-lantern" viewBox="0 0 1080 1920" width="1080" height="1920" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id="ln-pool" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd694" stop-opacity=".8"/><stop offset=".45" stop-color="#e8964e" stop-opacity=".3"/><stop offset=".8" stop-color="#8a5a3a" stop-opacity=".08"/><stop offset="1" stop-color="#3a2a2a" stop-opacity="0"/></radialGradient>
      <radialGradient id="ln-bloom" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe8b8" stop-opacity=".9"/><stop offset=".3" stop-color="#ffc062" stop-opacity=".38"/><stop offset=".7" stop-color="#d9863e" stop-opacity=".1"/><stop offset="1" stop-color="#5a3a3a" stop-opacity="0"/></radialGradient>
      <radialGradient id="ln-core" cx=".5" cy=".6" r=".5"><stop offset="0" stop-color="#fff6dc" stop-opacity="1"/><stop offset=".45" stop-color="#ffd48a" stop-opacity=".6"/><stop offset="1" stop-color="#ffa04e" stop-opacity="0"/></radialGradient>
    </defs>
    <g class="intro" style="--in:1s;--in-dur:.9s">
      <g opacity=".42"><ellipse class="lantern-pool" cx="540" cy="1800" rx="310" ry="100" fill="url(#ln-pool)" style="transform-origin:540px 1800px"/></g>
      <g opacity=".4"><ellipse class="lantern-bloom" cx="540" cy="1725" rx="180" ry="200" fill="url(#ln-bloom)" style="transform-origin:540px 1725px"/></g>
      <g class="intro-catch" style="transform-origin:540px 1770px">
        <g opacity=".55"><ellipse class="lantern-flicker lantern-flicker--a" cx="540" cy="1750" rx="48" ry="64" fill="url(#ln-core)" style="transform-origin:540px 1790px"/></g>
        <g opacity=".6"><ellipse class="lantern-flicker lantern-flicker--b" cx="540" cy="1745" rx="28" ry="40" fill="url(#ln-core)" style="transform-origin:540px 1775px"/></g>
        <g opacity=".7"><ellipse class="lantern-flicker lantern-flicker--c" cx="540" cy="1742" rx="13" ry="22" fill="url(#ln-core)" style="transform-origin:540px 1763px"/></g>
      </g>
    </g>
  </svg>
  <svg class="layer" id="layer-motes" viewBox="0 0 1080 1920" width="1080" height="1920" aria-hidden="true" focusable="false">
    <defs><radialGradient id="mt-glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe6b0" stop-opacity=".66"/><stop offset=".45" stop-color="#ffc47c" stop-opacity=".22"/><stop offset="1" stop-color="#ffac62" stop-opacity="0"/></radialGradient></defs>
    <g class="intro" style="--in:5s;--in-dur:2s">
      <g class="mote" style="animation-duration:23.3s;animation-delay:-7.0s"><circle cx="359" cy="1520" r="16" fill="url(#mt-glow)" opacity=".5"/><circle class="mote-core" cx="359" cy="1520" r="2.2" fill="#ffe9b6" style="animation-duration:5.71s;animation-delay:-2.55s"/></g>
      <g class="mote mote--b" style="animation-duration:20.9s;animation-delay:-0.8s"><circle cx="951" cy="1003" r="16" fill="url(#mt-glow)" opacity=".5"/><circle class="mote-core" cx="951" cy="1003" r="2.3" fill="#ffe9b6" style="animation-duration:4.53s;animation-delay:-4.49s"/></g>
      <g class="mote" style="animation-duration:21.3s;animation-delay:-22.1s"><circle cx="416" cy="446" r="15" fill="url(#mt-glow)" opacity=".5"/><circle class="mote-core" cx="416" cy="446" r="2.0" fill="#ffe9b6" style="animation-duration:4.77s;animation-delay:-5.61s"/></g>
      <g class="mote mote--b" style="animation-duration:18.4s;animation-delay:-10.3s"><circle cx="47" cy="1392" r="13" fill="url(#mt-glow)" opacity=".5"/><circle class="mote-core" cx="47" cy="1392" r="1.8" fill="#ffe9b6" style="animation-duration:5.75s;animation-delay:-2.71s"/></g>
      <g class="mote" style="animation-duration:28.3s;animation-delay:-12.7s"><circle cx="461" cy="1413" r="13" fill="url(#mt-glow)" opacity=".5"/><circle class="mote-core" cx="461" cy="1413" r="1.8" fill="#ffe9b6" style="animation-duration:6.31s;animation-delay:-3.03s"/></g>
      <g class="mote mote--b" style="animation-duration:22.8s;animation-delay:-22.5s"><circle cx="490" cy="979" r="11" fill="url(#mt-glow)" opacity=".5"/><circle class="mote-core" cx="490" cy="979" r="1.6" fill="#ffe9b6" style="animation-duration:4.86s;animation-delay:-4.46s"/></g>
      <g class="mote" style="animation-duration:23.9s;animation-delay:-28.1s"><circle cx="790" cy="1426" r="18" fill="url(#mt-glow)" opacity=".5"/><circle class="mote-core" cx="790" cy="1426" r="2.5" fill="#ffe9b6" style="animation-duration:5.02s;animation-delay:-4.44s"/></g>
      <g class="mote mote--b" style="animation-duration:28.5s;animation-delay:-13.6s"><circle cx="359" cy="204" r="14" fill="url(#mt-glow)" opacity=".5"/><circle class="mote-core" cx="359" cy="204" r="2.0" fill="#ffe9b6" style="animation-duration:5.73s;animation-delay:-4.54s"/></g>
      <g class="mote" style="animation-duration:31.1s;animation-delay:-15.2s"><circle cx="459" cy="1155" r="15" fill="url(#mt-glow)" opacity=".5"/><circle class="mote-core" cx="459" cy="1155" r="2.1" fill="#ffe9b6" style="animation-duration:5.72s;animation-delay:-1.72s"/></g>
      <g class="mote mote--b" style="animation-duration:24.3s;animation-delay:-22.3s"><circle cx="462" cy="912" r="18" fill="url(#mt-glow)" opacity=".5"/><circle class="mote-core" cx="462" cy="912" r="2.5" fill="#ffe9b6" style="animation-duration:5.77s;animation-delay:-1.96s"/></g>
      <g class="mote" style="animation-duration:25.1s;animation-delay:-22.2s"><circle cx="342" cy="605" r="20" fill="url(#mt-glow)" opacity=".5"/><circle class="mote-core" cx="342" cy="605" r="2.8" fill="#ffe9b6" style="animation-duration:4.36s;animation-delay:-0.42s"/></g>
      <g class="mote mote--b" style="animation-duration:28.4s;animation-delay:-22.7s"><circle cx="389" cy="348" r="16" fill="url(#mt-glow)" opacity=".5"/><circle class="mote-core" cx="389" cy="348" r="2.1" fill="#ffe9b6" style="animation-duration:4.48s;animation-delay:-5.65s"/></g>
      <g class="mote" style="animation-duration:28.4s;animation-delay:-8.6s"><circle cx="106" cy="1282" r="16" fill="url(#mt-glow)" opacity=".5"/><circle class="mote-core" cx="106" cy="1282" r="2.2" fill="#ffe9b6" style="animation-duration:3.71s;animation-delay:-2.53s"/></g>
      <g class="mote mote--b" style="animation-duration:28.6s;animation-delay:-9.8s"><circle cx="59" cy="1555" r="18" fill="url(#mt-glow)" opacity=".5"/><circle class="mote-core" cx="59" cy="1555" r="2.5" fill="#ffe9b6" style="animation-duration:6.32s;animation-delay:-3.62s"/></g>
      <g class="mote" style="animation-duration:22.0s;animation-delay:-2.1s"><circle cx="474" cy="1350" r="18" fill="url(#mt-glow)" opacity=".5"/><circle class="mote-core" cx="474" cy="1350" r="2.5" fill="#ffe9b6" style="animation-duration:4.77s;animation-delay:-0.82s"/></g>
      <g class="mote mote--b" style="animation-duration:22.6s;animation-delay:-28.2s"><circle cx="548" cy="1441" r="18" fill="url(#mt-glow)" opacity=".5"/><circle class="mote-core" cx="548" cy="1441" r="2.5" fill="#ffe9b6" style="animation-duration:5.31s;animation-delay:-2.55s"/></g>
      <g class="mote" style="animation-duration:19.0s;animation-delay:-12.7s"><circle cx="878" cy="421" r="14" fill="url(#mt-glow)" opacity=".5"/><circle class="mote-core" cx="878" cy="421" r="1.9" fill="#ffe9b6" style="animation-duration:3.91s;animation-delay:-2.80s"/></g>
      <g class="mote mote--b" style="animation-duration:31.2s;animation-delay:-18.1s"><circle cx="453" cy="662" r="14" fill="url(#mt-glow)" opacity=".5"/><circle class="mote-core" cx="453" cy="662" r="2.0" fill="#ffe9b6" style="animation-duration:4.78s;animation-delay:-4.74s"/></g>
      <g class="mote" style="animation-duration:23.9s;animation-delay:-4.1s"><circle cx="944" cy="583" r="12" fill="url(#mt-glow)" opacity=".5"/><circle class="mote-core" cx="944" cy="583" r="1.6" fill="#ffe9b6" style="animation-duration:4.90s;animation-delay:-1.85s"/></g>
      <g class="mote mote--b" style="animation-duration:26.5s;animation-delay:-12.8s"><circle cx="514" cy="1028" r="20" fill="url(#mt-glow)" opacity=".5"/><circle class="mote-core" cx="514" cy="1028" r="2.8" fill="#ffe9b6" style="animation-duration:5.87s;animation-delay:-1.77s"/></g>
      <g class="mote" style="animation-duration:19.9s;animation-delay:-14.0s"><circle cx="844" cy="1128" r="15" fill="url(#mt-glow)" opacity=".5"/><circle class="mote-core" cx="844" cy="1128" r="2.1" fill="#ffe9b6" style="animation-duration:4.43s;animation-delay:-4.40s"/></g>
      <g class="mote mote--b" style="animation-duration:24.0s;animation-delay:-23.7s"><circle cx="241" cy="1656" r="17" fill="url(#mt-glow)" opacity=".5"/><circle class="mote-core" cx="241" cy="1656" r="2.3" fill="#ffe9b6" style="animation-duration:4.38s;animation-delay:-2.13s"/></g>
      <g class="mote" style="animation-duration:24.5s;animation-delay:-9.3s"><circle cx="425" cy="1054" r="13" fill="url(#mt-glow)" opacity=".5"/><circle class="mote-core" cx="425" cy="1054" r="1.7" fill="#ffe9b6" style="animation-duration:5.70s;animation-delay:-0.90s"/></g>
      <g class="mote mote--b" style="animation-duration:29.1s;animation-delay:-8.8s"><circle cx="328" cy="1301" r="15" fill="url(#mt-glow)" opacity=".5"/><circle class="mote-core" cx="328" cy="1301" r="2.1" fill="#ffe9b6" style="animation-duration:4.57s;animation-delay:-0.04s"/></g>
      <g class="mote" style="animation-duration:22.3s;animation-delay:-22.0s"><circle cx="597" cy="1593" r="16" fill="url(#mt-glow)" opacity=".5"/><circle class="mote-core" cx="597" cy="1593" r="2.2" fill="#ffe9b6" style="animation-duration:3.95s;animation-delay:-0.49s"/></g>
      <g class="mote mote--b" style="animation-duration:22.1s;animation-delay:-10.7s"><circle cx="422" cy="1469" r="19" fill="url(#mt-glow)" opacity=".5"/><circle class="mote-core" cx="422" cy="1469" r="2.6" fill="#ffe9b6" style="animation-duration:3.52s;animation-delay:-4.05s"/></g>
    </g>
  </svg>
  <div id="title-block">
    <div class="title-vignette"></div>
    <div class="title-l1">
      <div class="title-bloom"></div>
      <h1 id="title-line1" class="t1 title-line1">${TITLE}</h1>
      <span id="title-shimmer" class="t1 title-shimmer" aria-hidden="true"></span>
    </div>
    <div class="title-l2">
      <p id="title-line2" class="title-line2">${SUBTITLE}</p>
    </div>
  </div>
  <svg class="layer" id="layer-sparks" viewBox="0 0 1080 1920" width="1080" height="1920" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id="sp-halo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd48c" stop-opacity=".75"/><stop offset=".35" stop-color="#ffab62" stop-opacity=".3"/><stop offset=".7" stop-color="#ff8a6a" stop-opacity=".08"/><stop offset="1" stop-color="#e0706a" stop-opacity="0"/></radialGradient>
      <radialGradient id="sp-core" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff8e6" stop-opacity="1"/><stop offset=".45" stop-color="#ffe0a0" stop-opacity=".85"/><stop offset="1" stop-color="#ffb870" stop-opacity="0"/></radialGradient>
      <radialGradient id="sp-trail" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe4a8" stop-opacity=".9"/><stop offset=".5" stop-color="#ffb060" stop-opacity=".35"/><stop offset="1" stop-color="#ff8a5a" stop-opacity="0"/></radialGradient>
    </defs>
    <g id="spark-trails" style="mix-blend-mode:screen"></g>
    <g id="spark-sprites" style="mix-blend-mode:screen"></g>
  </svg>
  <p class="title-prompt"><span class="title-prompt__text">Tap to begin</span></p>
  <button class="title-mute" type="button" aria-label="Mute" aria-pressed="false">
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M8 16h6l8-6v20l-8-6H8z" fill="currentColor" fill-opacity=".18"/>
      <g class="mute-waves"><path d="M27 15.5a6 6 0 0 1 0 9"/><path d="M30.5 12a11 11 0 0 1 0 16"/></g>
      <g class="mute-x"><path d="M27 16l7 8M34 16l-7 8"/></g>
    </svg>
  </button>
</div>`
}

export default function GainsTitlePage() {
  const navigate = useNavigate()
  const wrapRef = useRef(null)
  const audioRef = useRef({ ctx: null, masterGain: null, musicGain: null, ambienceGain: null, unlocked: false })
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const prev = document.title
    document.title = 'Shadowmend — Title'
    return () => {
      document.title = prev
    }
  }, [])

  // ---- unlock + schedule the intro->loop->ambience bed on the Web Audio
  // clock (Draft 97: "a 20-50ms gap is audible here, so prefer the clock"
  // over an `ended`-event handoff -- this is the only place in the app
  // that needs gapless music, so it gets its own small scheduler rather
  // than reaching for zoneAudio.js's HTMLAudio-based crossfade). Levels
  // are pre-mixed in the files themselves; nothing here re-normalizes. ----
  async function unlockAndPlay() {
    const a = audioRef.current
    if (a.unlocked) return
    a.unlocked = true
    try {
      const AC = window.AudioContext || window.webkitAudioContext
      const ctx = new AC()
      if (ctx.state === 'suspended') await ctx.resume().catch(() => {})
      const master = ctx.createGain()
      master.connect(ctx.destination)
      const musicGain = ctx.createGain()
      musicGain.connect(master)
      const ambienceGain = ctx.createGain()
      ambienceGain.gain.value = 1
      ambienceGain.connect(master)
      a.ctx = ctx
      a.masterGain = master
      a.musicGain = musicGain
      a.ambienceGain = ambienceGain

      const [introBuf, loopBuf, ambBuf] = await Promise.all(
        [`${BASE}/loops/title-music-intro.mp3`, `${BASE}/loops/title-music-loop.mp3`, '/long-light/zone2/audio/z2-amb-forest.mp3'].map((url) =>
          fetch(url)
            .then((r) => r.arrayBuffer())
            .then((buf) => ctx.decodeAudioData(buf)),
        ),
      )
      // The decode above is the only real await here -- long enough that a
      // fast second tap can navigate away (unmount closes `ctx`) before it
      // resolves. Scheduling on a closed context is a harmless no-op but
      // logs browser warnings, so bail out rather than reaching Zone 1 with
      // a noisy console.
      if (ctx.state === 'closed') return

      const startAt = ctx.currentTime + 0.06
      const introSrc = ctx.createBufferSource()
      introSrc.buffer = introBuf
      introSrc.connect(musicGain)
      introSrc.start(startAt)
      const loopSrc = ctx.createBufferSource()
      loopSrc.buffer = loopBuf
      loopSrc.loop = true
      loopSrc.connect(musicGain)
      loopSrc.start(startAt + introBuf.duration)

      const ambSrc = ctx.createBufferSource()
      ambSrc.buffer = ambBuf
      ambSrc.loop = true
      ambSrc.connect(ambienceGain)
      ambSrc.start(startAt)

      sessionStorage.setItem(UNLOCK_KEY, '1')
    } catch {
      /* audio is a nice-to-have here, never block begin on it */
    }
  }

  function fadeOutAudio(ms) {
    const a = audioRef.current
    if (!a.ctx || !a.masterGain) return
    try {
      const now = a.ctx.currentTime
      a.masterGain.gain.setValueAtTime(a.masterGain.gain.value, now)
      a.masterGain.gain.linearRampToValueAtTime(0, now + ms / 1000)
    } catch {
      /* ignore */
    }
  }

  function setMuted(m) {
    const a = audioRef.current
    if (!a.masterGain) return
    try {
      a.masterGain.gain.setValueAtTime(m ? 0 : 1, a.ctx.currentTime)
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    const root = document.getElementById('title-screen')
    if (!root) return undefined

    function fit() {
      const s = Math.min(window.innerWidth / 1080, window.innerHeight / 1920)
      root._scale = s
      root.style.transform = `translate(-50%,-50%) scale(${s})`
    }
    window.addEventListener('resize', fit)
    fit()

    const block = document.getElementById('title-block')
    const l1 = document.getElementById('title-line1')
    const sh = document.getElementById('title-shimmer')
    function fitTitle() {
      sh.textContent = l1.textContent
      block.style.setProperty('--t1-size', '100px')
      const w = l1.offsetWidth - 20
      block.style.setProperty('--t1-size', `${Math.max(24, (100 * 520) / Math.max(1, w)).toFixed(2)}px`)
    }
    fitTitle()
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitTitle)
    const titleObserver = new MutationObserver(fitTitle)
    titleObserver.observe(l1, { characterData: true, childList: true, subtree: true })

    let t0 = null
    const plate = document.getElementById('title-plate')
    function enter() {
      if (t0 !== null) return
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          root.classList.add('is-entered')
          t0 = performance.now()
        })
      })
      t0 = -1
    }
    if (plate.complete) enter()
    else {
      plate.addEventListener('load', enter)
      plate.addEventListener('error', enter)
    }

    let begun = false
    let muted = false
    const mute = root.querySelector('.title-mute')
    function begin() {
      if (begun) return
      begun = true
      root.classList.add('is-begun')
      root.dispatchEvent(new CustomEvent('titlescreen:begin', { bubbles: true }))
    }
    function setMutedVisual(m) {
      muted = !!m
      mute.classList.toggle('is-muted', muted)
      mute.setAttribute('aria-pressed', String(muted))
      mute.setAttribute('aria-label', muted ? 'Unmute' : 'Mute')
    }

    // Draft 97 (item 2): first tap unlocks (if not already), second begins.
    // If a prior page in this tab session already unlocked audio, skip
    // straight to begin-on-first-tap ("music starts with the entrance and
    // the first tap begins").
    const prompt = root.querySelector('.title-prompt')
    const alreadyUnlocked = sessionStorage.getItem(UNLOCK_KEY) === '1'
    if (alreadyUnlocked) unlockAndPlay()
    function handleActivate(e) {
      if (e.target.closest('.title-mute')) return
      if (!audioRef.current.unlocked) {
        unlockAndPlay()
        prompt.classList.add('is-ack')
        setTimeout(() => prompt.classList.remove('is-ack'), 2000)
        return
      }
      begin()
    }
    root.addEventListener('click', handleActivate)
    function handleKeydown(e) {
      if (e.target.closest && e.target.closest('.title-mute')) return
      if (e.key === 'Enter' || e.key === ' ') handleActivate(e)
    }
    window.addEventListener('keydown', handleKeydown)
    function handleMuteClick(e) {
      e.stopPropagation()
      setMutedVisual(!muted)
      setMuted(!muted)
    }
    mute.addEventListener('click', handleMuteClick)

    function handleBegin() {
      setFading(true)
      fadeOutAudio(1500)
      setTimeout(() => navigate('/gains-demo/zone1?fromTitle=1'), 1000)
    }
    root.addEventListener('titlescreen:begin', handleBegin)

    // ---- sparks (verbatim math from Title Screen.html) ----
    const TAU = Math.PI * 2
    const trailsG = document.getElementById('spark-trails')
    const spritesG = document.getElementById('spark-sprites')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    function R(s) {
      const x = Math.sin(s * 127.1) * 43758.5453
      return x - Math.floor(x)
    }
    function lerp(a, b, k) {
      return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k }
    }
    function smooth(k) {
      return k * k * (3 - 2 * k)
    }
    const DEFS = [
      ['drift', 22, 300, 1300, 260, 380, 41, 37, 60, 80, 13, 17],
      ['drift', 24, 780, 1150, 240, 420, 44, 39, 70, 60, 15, 11],
      ['drift', 26, 560, 700, 380, 300, 38, 45, 50, 90, 12, 14],
      ['drift', 21, 860, 1650, 180, 200, 35, 42, 60, 50, 11, 16],
      ['mid', 28, 420, 980, 300, 480, 29, 26, 110, 120, 9, 10],
      ['mid', 30, 720, 600, 300, 360, 31, 24, 120, 100, 8, 11],
      ['mid', 27, 250, 1580, 200, 260, 27, 33, 90, 110, 10, 8],
      ['mid', 32, 900, 400, 160, 300, 25, 30, 90, 120, 9, 12],
      ['quick', 36, 380, 380, 330, 260, 23, 21, 170, 130, 7.3, 8.1],
      ['quick', 34, 560, 300, 360, 220, 21, 26, 150, 160, 6.7, 9.4],
      ['quick', 38, 300, 520, 280, 300, 24, 22, 180, 140, 8.6, 7.1],
    ]
    const TRAIL = 12
    const FLICK = [
      ['.62', '1'],
      ['.9', '1.12'],
      ['.74', '.9'],
    ]
    function natural(sp, t) {
      return {
        x: sp.cx + sp.ax1 * Math.sin((TAU * t) / sp.p1x + sp.ph[0]) + sp.ax2 * Math.sin((TAU * t) / sp.p2x + sp.ph[1]),
        y: sp.cy + sp.ay1 * Math.sin((TAU * t) / sp.p1y + sp.ph[2]) + sp.ay2 * Math.cos((TAU * t) / sp.p2y + sp.ph[3]),
      }
    }
    const NS = 'http://www.w3.org/2000/svg'
    const sparks = DEFS.map((d, i) => {
      const sp = {
        kind: d[0],
        size: d[1],
        cx: d[2],
        cy: d[3],
        ax1: d[4],
        ay1: d[5],
        p1x: d[6],
        p1y: d[7],
        ax2: d[8],
        ay2: d[9],
        p2x: d[10],
        p2y: d[11],
        ph: [R(i + 1) * TAU, R(i + 2) * TAU, R(i + 3) * TAU, R(i + 4) * TAU],
        arrive: 5.0 + i * 0.32,
        frame: 1,
        nextFlick: 0,
        hist: [],
        trail: [],
      }
      const g = document.createElementNS(NS, 'g')
      g.setAttribute('class', `spark spark--${sp.kind}`)
      const halo = document.createElementNS(NS, 'circle')
      const core = document.createElementNS(NS, 'circle')
      const hot = document.createElementNS(NS, 'circle')
      halo.setAttribute('r', (sp.size * 0.9).toFixed(1))
      halo.setAttribute('fill', 'url(#sp-halo)')
      halo.setAttribute('class', 'spark-halo')
      core.setAttribute('r', (sp.size * 0.34).toFixed(1))
      core.setAttribute('fill', 'url(#sp-core)')
      core.setAttribute('class', 'spark-core')
      hot.setAttribute('r', (sp.size * 0.11).toFixed(1))
      hot.setAttribute('fill', '#fff6e0')
      hot.setAttribute('class', 'spark-hot')
      g.appendChild(halo)
      g.appendChild(core)
      g.appendChild(hot)
      spritesG.appendChild(g)
      sp.g = g
      sp.halo = halo
      sp.core = core
      const tg = document.createElementNS(NS, 'g')
      tg.setAttribute('class', 'spark-trail')
      for (let k = 0; k < TRAIL; k++) {
        const c = document.createElementNS(NS, 'circle')
        c.setAttribute('r', '0')
        c.setAttribute('fill', 'url(#sp-trail)')
        tg.appendChild(c)
        sp.trail.push(c)
      }
      trailsG.appendChild(tg)
      sp.tg = tg
      const P = natural(sp, sp.arrive + 2.8)
      const e = i % 4
      sp.edgePt = e === 0 ? { x: -80, y: P.y } : e === 1 ? { x: 1160, y: P.y } : e === 2 ? { x: P.x, y: -80 } : { x: P.x, y: 2000 }
      return sp
    })

    let raf = null
    if (reduce) {
      sparks.forEach((sp, i) => {
        const p = natural(sp, 12 + i * 3)
        sp.g.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`)
        sp.g.setAttribute('class', `${sp.g.getAttribute('class')} intro`)
        sp.g.style.setProperty('--in', '5s')
        sp.g.style.setProperty('--in-dur', '2s')
      })
    } else {
      sparks.forEach((sp) => {
        sp.g.style.opacity = '0'
        sp.tg.style.opacity = '0'
      })

      let hero = null
      let nextHero = 11
      let heroTurn = 0
      function toStage(r) {
        const s = root._scale || 1
        const rr = root.getBoundingClientRect()
        return { x: (r.left - rr.left) / s, y: (r.top - rr.top) / s, w: r.width / s, h: r.height / s }
      }
      function dPoint(fallback) {
        const node = l1.firstChild
        if (!node || node.nodeType !== 3) return fallback
        const i = node.data.search(/d/i)
        if (i < 0) return fallback
        const rg = document.createRange()
        rg.setStart(node, i)
        rg.setEnd(node, i + 1)
        const r = toStage(rg.getBoundingClientRect())
        return { x: r.x + r.w * 0.42, y: r.y + r.h * 0.14 }
      }
      function startHero(t) {
        const quick = sparks.filter((s) => s.kind === 'quick' && t > s.arrive + 3)
        const pool = quick.length ? quick : sparks.filter((s) => t > s.arrive + 3)
        if (!pool.length) return
        const sp = pool[heroTurn++ % pool.length]
        const tb = toStage(block.getBoundingClientRect())
        const c = { x: tb.x + tb.w / 2, y: tb.y + tb.h / 2 }
        const rx = tb.w / 2 + 70
        const ry = tb.h / 2 + 64
        const p0 = natural(sp, t)
        hero = { sp, t0: t, c, rx, ry, th0: Math.atan2((p0.y - c.y) / ry, (p0.x - c.x) / rx), dp: dPoint({ x: c.x, y: c.y - tb.h / 2 }) }
        nextHero = t + 15 + Math.random() * 5
      }
      function heroPos(t) {
        const h = hero
        let u = t - h.t0
        const L0 = { x: h.c.x + h.rx * Math.cos(h.th0), y: h.c.y + h.ry * Math.sin(h.th0) }
        if (u < 1.3) return lerp(natural(h.sp, t), L0, smooth(u / 1.3))
        u -= 1.3
        if (u < 4.2) {
          const a = h.th0 + TAU * smooth(u / 4.2)
          return { x: h.c.x + h.rx * Math.cos(a), y: h.c.y + h.ry * Math.sin(a) }
        }
        u -= 4.2
        if (u < 0.9) return lerp(L0, h.dp, smooth(u / 0.9))
        u -= 0.9
        if (u < 1.6) return { x: h.dp.x, y: h.dp.y + Math.sin(u * 4) * 2.5 }
        u -= 1.6
        if (u < 0.9) {
          const k = smooth(u / 0.9)
          const end = natural(h.sp, t)
          const cp = { x: h.dp.x + 240, y: h.dp.y - 220 }
          const m = 1 - k
          return { x: m * m * h.dp.x + 2 * m * k * cp.x + k * k * end.x, y: m * m * h.dp.y + 2 * m * k * cp.y + k * k * end.y }
        }
        return null
      }

      function frame(now) {
        if (t0 === null || t0 < 0) {
          raf = requestAnimationFrame(frame)
          return
        }
        const t = (now - t0) / 1000
        if (!hero && t > nextHero) startHero(t)
        sparks.forEach((sp) => {
          if (t < sp.arrive) return
          let p
          let isHero = hero && hero.sp === sp
          if (isHero) {
            p = heroPos(t)
            if (!p) {
              hero = null
              isHero = false
              p = natural(sp, t)
            }
          } else p = natural(sp, t)
          const ua = (t - sp.arrive) / 2.8
          if (ua < 1) {
            p = lerp(sp.edgePt, p, 1 - (1 - ua) ** 3)
            const o = String(Math.min(1, ua * 2.5))
            sp.g.style.opacity = o
            sp.tg.style.opacity = o
          } else if (sp.g.style.opacity !== '1') {
            sp.g.style.opacity = '1'
            sp.tg.style.opacity = '1'
          }
          sp.hist.unshift(p)
          if (sp.hist.length > TRAIL * 2) sp.hist.length = TRAIL * 2
          sp.g.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`)
          for (let k = 0; k < TRAIL; k++) {
            const hp = sp.hist[k * 2 + 1]
            const c = sp.trail[k]
            if (!hp) {
              c.setAttribute('r', '0')
              continue
            }
            const f = 1 - k / TRAIL
            c.setAttribute('cx', hp.x.toFixed(1))
            c.setAttribute('cy', hp.y.toFixed(1))
            c.setAttribute('r', (sp.size * 0.42 * f).toFixed(1))
            c.setAttribute('opacity', (0.55 * f * f).toFixed(2))
          }
          if (now > sp.nextFlick) {
            let nf = 1 + Math.floor(Math.random() * 3)
            if (nf === sp.frame) nf = (nf % 3) + 1
            sp.frame = nf
            const fl = FLICK[nf - 1]
            sp.halo.setAttribute('opacity', fl[0])
            sp.core.setAttribute('transform', `scale(${fl[1]})`)
            const perched = isHero && t - hero.t0 > 6.4 && t - hero.t0 < 8.0
            sp.nextFlick = now + (perched ? 260 : 90) + Math.random() * (perched ? 160 : 110)
          }
        })
        raf = requestAnimationFrame(frame)
      }
      raf = requestAnimationFrame(frame)
    }

    return () => {
      window.removeEventListener('resize', fit)
      window.removeEventListener('keydown', handleKeydown)
      root.removeEventListener('click', handleActivate)
      root.removeEventListener('titlescreen:begin', handleBegin)
      mute.removeEventListener('click', handleMuteClick)
      titleObserver.disconnect()
      if (raf) cancelAnimationFrame(raf)
      const a = audioRef.current
      if (a.ctx) a.ctx.close().catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={wrapRef}
      className={`sm-title-page${fading ? ' sm-fade-out' : ''}`}
      style={{ opacity: fading ? 0 : 1 }}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: `<style>${CSS}</style>${bodyHtml()}` }}
    />
  )
}
