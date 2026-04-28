// Logo strip — UK + CTAC + GAINS marks shown at the top of the
// participant-facing landing page.
//
// Logo files live in public/logos/ and are served from the site root.
//
// `variant="single"` shows only the GAINS mark (e.g. inline within session
// chrome where the full strip is too busy).

export default function LogoStrip({ variant = 'full' }) {
  if (variant === 'single') {
    return (
      <div className="flex justify-center mb-6">
        <img
          src="/logos/gains.jpeg"
          alt="GAINS — Growth and Innovation for Success"
          className="h-14 w-auto"
        />
      </div>
    )
  }
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mb-6">
      <img
        src="/logos/uk.png"
        alt="University of Kentucky"
        className="h-9 sm:h-10 w-auto"
      />
      <img
        src="/logos/ctac.png"
        alt="Center on Trauma and Children — Evidence in action"
        className="h-12 sm:h-14 w-auto"
      />
      <img
        src="/logos/gains.jpeg"
        alt="GAINS — Growth and Innovation for Success"
        className="h-12 sm:h-14 w-auto"
      />
    </div>
  )
}
