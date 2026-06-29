// SessionSummary — the end-of-session "This is what you built" screen
// (Draft 37, Part G). After the growth montage completes, the kid sees
// their actual outputs from all six activities reflected back, then a CTA
// into The Plan.
//
// Real per-kid output persistence is deferred (Draft 21 — cross-activity
// flow integration). For now the /demo preview passes `demoMode`, which
// renders hardcoded synthetic outputs for one example kid. When the flow
// is stitched, `demoMode` drops and the component reads the kid's real
// session state via the `data` prop.

import { useNavigate } from 'react-router-dom'
import TrampolineNet from './TrampolineNet.jsx'

// Synthetic outputs for one example kid (Part G.4). Poem + letter are
// original lines (the published-poet lock applies to the poem activity).
const DEMO_DATA = {
  selfReflection: {
    belonged:
      'When my coach put me in the starting lineup my first game on the team.',
    didntBelong:
      'First day at my new school — everyone already had their groups.',
  },
  poem: [
    'I am the kid who laughs too loud in quiet rooms.',
    'I wonder if the next house will feel like mine.',
    'I hear my little sister humming through the wall.',
    'I see the bus stop where I waited in the rain.',
    'I want a place where no one asks me to leave.',
    'I am the kid who keeps a bag half-packed, just in case.',
    'I pretend I don’t care when plans fall through.',
    'I feel braver than I did a year ago.',
    'I try to trust the people who keep showing up.',
    'I am still here, and I am still growing.',
  ],
  allies: [
    { id: 'foster-mom', name: 'Dana', support_types: ['practical', 'emotional'] },
    { id: 'best-friend', name: 'Mia', support_types: ['social', 'emotional'] },
    { id: 'coach', name: 'Coach R', support_types: ['practical', 'social'] },
    { id: 'counselor', name: 'Mr. Lee', support_types: ['emotional'] },
    { id: 'sibling', name: 'Theo', support_types: ['social'] },
  ],
  strengthenCommitments: [
    'Text Mia when I’m having a hard night instead of going quiet.',
    'Ask Coach R for a ride to Thursday practice.',
  ],
  bss: {
    doingNow: [
      'Asking for help when I need it',
      'Showing up even when it’s awkward',
      'Saying thank you and meaning it',
      'Sticking with one thing I’m good at',
    ],
    willingToTry: ['Starting a conversation first', 'Inviting someone along'],
    notInterested: ['Joining a big group activity'],
  },
  gettingUnstuck: [
    {
      kind: 'Challenge',
      thought:
        'I’ve started over before and still found people who get me — I can do that here too.',
    },
    {
      kind: 'Both/And',
      thought:
        'I don’t feel like I belong right now AND I’m building a net of people who keep showing up.',
    },
  ],
  letter: `Hey — I don’t know you, but I know some of what you’re carrying. Moving again. New faces who already have their groups. The way you learn not to unpack all the way. I used to think that meant something was wrong with me. It doesn’t. You get to belong somewhere, even if it takes a few tries to find it. Keep the people who show up for you — and let yourself be one of those people for someone else. You’re not behind. You’re just getting started. — Someone who’s been there`,
}

function Card({ title, children }) {
  return (
    <div className="bg-ctac-teal-50 border border-ctac-teal-200 rounded-2xl p-5 shadow-card">
      <h3 className="text-[15px] font-semibold text-ctac-navy mb-3 uppercase tracking-wide">
        {title}
      </h3>
      <div className="text-[15px] text-slate-700 leading-relaxed">{children}</div>
    </div>
  )
}

export default function SessionSummary({ demoMode = false, data }) {
  const navigate = useNavigate()
  const d = demoMode || !data ? DEMO_DATA : data

  return (
    <div className="max-w-[920px] mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-ctac-navy text-center mb-2">
        This is what you built.
      </h2>
      <p className="text-[14px] text-slate-500 italic text-center mb-8">
        Everything you made today, in one place.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Self-Reflection */}
        <Card title="Self-Reflection">
          <p className="mb-1 text-[13px] font-medium text-slate-500">
            A time I felt I belonged
          </p>
          <p className="italic mb-3">“{d.selfReflection.belonged}”</p>
          <p className="mb-1 text-[13px] font-medium text-slate-500">
            A time I felt I didn’t belong
          </p>
          <p className="italic">“{d.selfReflection.didntBelong}”</p>
        </Card>

        {/* Who I Am Poem */}
        <Card title="Who I Am Poem">
          <div className="font-serif text-[15px] leading-relaxed">
            {d.poem.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </Card>

        {/* Allies / Safety Net */}
        <Card title="Your Safety Net">
          <div className="max-w-[360px] mx-auto mb-3">
            <TrampolineNet allies={d.allies} showLabels />
          </div>
          {d.strengthenCommitments.length > 0 && (
            <>
              <p className="mb-1 text-[13px] font-medium text-slate-500">I commit to</p>
              <ul className="list-disc pl-5 space-y-1">
                {d.strengthenCommitments.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </>
          )}
        </Card>

        {/* Belonging Skills Sort */}
        <Card title="Belonging Skills">
          <p className="mb-1">
            <span className="font-semibold text-ctac-navy">Doing now:</span>{' '}
            {d.bss.doingNow.join(', ')}
          </p>
          <p className="mb-1">
            <span className="font-semibold text-ctac-navy">Willing to try:</span>{' '}
            {d.bss.willingToTry.join(', ')}
          </p>
          <p>
            <span className="font-semibold text-ctac-navy">Not for me right now:</span>{' '}
            {d.bss.notInterested.join(', ')}
          </p>
        </Card>

        {/* Getting Unstuck */}
        <Card title="Getting Unstuck">
          {d.gettingUnstuck.map((g, i) => (
            <div key={i} className={i > 0 ? 'mt-3' : ''}>
              <p className="text-[13px] font-medium text-slate-500">{g.kind}</p>
              <p className="italic">“{g.thought}”</p>
            </div>
          ))}
        </Card>

        {/* Letter to Another Youth */}
        <Card title="Your Letter">
          <p className="font-serif italic leading-relaxed whitespace-pre-line">{d.letter}</p>
        </Card>
      </div>

      {/* CTA into The Plan */}
      <div className="text-center mt-10">
        <button
          type="button"
          onClick={() => navigate('/the-plan')}
          className="bg-ctac-teal-500 hover:bg-ctac-teal-600 text-white rounded-full px-8 py-4 text-lg font-semibold transition-colors"
        >
          Ready for The Plan?
        </button>
        <div className="mt-4">
          <button
            type="button"
            onClick={() => window.print()}
            className="text-ctac-teal-700 hover:text-ctac-teal-900 underline text-sm"
          >
            Print or save your session
          </button>
        </div>
      </div>
    </div>
  )
}
