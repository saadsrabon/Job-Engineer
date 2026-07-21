'use client';

const OVERLAY_DESK =
  'https://images.unsplash.com/photo-1454165804604-c7101c2edb2f?auto=format&fit=crop&w=1800&q=80';
const OVERLAY_MESH =
  'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1800&q=80';

export function LandingBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="landing-green-wash absolute inset-0" />

      <div
        className="landing-photo-overlay landing-photo-a absolute inset-0"
        style={{ backgroundImage: `url(${OVERLAY_MESH})` }}
        data-parallax
        data-parallax-y="40"
        data-parallax-x="-30"
      />
      <div
        className="landing-photo-overlay landing-photo-b absolute inset-0"
        style={{ backgroundImage: `url(${OVERLAY_DESK})` }}
        data-parallax
        data-parallax-y="-35"
        data-parallax-x="45"
      />

      <div
        className="landing-mesh-svg absolute inset-0 opacity-40"
        style={{ backgroundImage: 'url(/landing/overlay-mesh.svg)' }}
        data-parallax
        data-parallax-y="55"
        data-parallax-x="-40"
      />

      <div
        className="landing-grid absolute inset-0 opacity-50"
        data-parallax
        data-parallax-y="70"
        data-parallax-x="-55"
      />

      <div
        className="landing-orb landing-orb-a"
        data-parallax
        data-parallax-y="160"
        data-parallax-x="100"
      />
      <div
        className="landing-orb landing-orb-b"
        data-parallax
        data-parallax-y="-120"
        data-parallax-x="-130"
      />
      <div
        className="landing-orb landing-orb-c"
        data-parallax
        data-parallax-y="90"
        data-parallax-x="75"
      />
      <div
        className="landing-orb landing-orb-d"
        data-parallax
        data-parallax-y="-70"
        data-parallax-x="110"
      />
    </div>
  );
}
