import React, { useEffect, useRef } from 'react';
import { ArrowRight, BookOpen, BriefcaseBusiness, GraduationCap, Network } from 'lucide-react';
import { UserRole } from '../types/asako';

interface AsakoHeroProps {
  onOpenAuth: (role?: UserRole) => void;
}

const words = [
  { text: 'Build', kind: '' },
  { text: 'what', kind: '' },
  { text: 'comes', kind: 'blue' },
  { text: 'next.', kind: 'blue' },
  { text: 'Make', kind: '' },
  { text: 'it', kind: '' },
  { text: 'matter.', kind: 'gold underline' },
];

export const AsakoHero: React.FC<AsakoHeroProps> = ({ onOpenAuth }) => {
  const heroRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -999, y: -999 });

  useEffect(() => {
    const hero = heroRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!hero || !canvas || !context || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    type Particle = { x: number; y: number; vx: number; vy: number; radius: number; color: string };
    const colors = ['37,99,184', '201,163,78', '26,42,64'];
    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let animationFrame: number | null = null;
    let isVisible = false;
    let lastFrameTime = 0;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = hero.clientWidth;
      height = hero.clientHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const maxParticles = width < 768 ? 22 : 36;
      const count = Math.round(Math.min(maxParticles, (width * height) / 26000));
      particles = Array.from({ length: count }, (_, index) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.65,
        vy: (Math.random() - 0.5) * 0.65,
        radius: Math.random() * 1.4 + 0.8,
        color: colors[index % colors.length],
      }));
    };

    const render = (time: number) => {
      if (!isVisible || time - lastFrameTime < 1000 / 30) return;
      const frameScale = lastFrameTime === 0 ? 1 : Math.min((time - lastFrameTime) / (1000 / 30), 2);
      lastFrameTime = time;
      context.clearRect(0, 0, width, height);
      particles.forEach((particle, index) => {
        particle.x += particle.vx * frameScale;
        particle.y += particle.vy * frameScale;
        if (particle.x < 0 || particle.x > width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > height) particle.vy *= -1;

        const mouseDistance = Math.hypot(particle.x - mouseRef.current.x, particle.y - mouseRef.current.y);
        if (mouseDistance < 140) {
          particle.x += (particle.x - mouseRef.current.x) * 0.004;
          particle.y += (particle.y - mouseRef.current.y) * 0.004;
        }

        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(${particle.color},.55)`;
        context.fill();

        for (let otherIndex = index + 1; otherIndex < particles.length; otherIndex += 1) {
          const other = particles[otherIndex];
          const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
          if (distance < 165) {
            const lineColor = (index + otherIndex) % 5 === 0 ? '201,163,78' : '37,99,184';
            context.strokeStyle = `rgba(${lineColor},${((1 - distance / 165) * 0.28).toFixed(3)})`;
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(particle.x, particle.y);
            context.lineTo(other.x, other.y);
            context.stroke();

            if ((index * particles.length + otherIndex) % 8 === 0) {
              const phase = (time * 0.00016 + index * 0.17 + otherIndex * 0.11) % 1;
              const pulseX = particle.x + (other.x - particle.x) * phase;
              const pulseY = particle.y + (other.y - particle.y) * phase;
              context.beginPath();
              context.arc(pulseX, pulseY, 1.6, 0, Math.PI * 2);
              context.fillStyle = `rgba(201,163,78,${(Math.sin(phase * Math.PI) * 0.8).toFixed(3)})`;
              context.fill();
            }
          }
        }

        if (mouseDistance < 150) {
          context.strokeStyle = `rgba(201,163,78,${((1 - mouseDistance / 150) * 0.3).toFixed(3)})`;
          context.beginPath();
          context.moveTo(particle.x, particle.y);
          context.lineTo(mouseRef.current.x, mouseRef.current.y);
          context.stroke();
        }
      });
    };

    const scheduleFrame = () => {
      if (isVisible && document.visibilityState === 'visible' && animationFrame === null) {
        animationFrame = window.requestAnimationFrame((time) => {
          animationFrame = null;
          render(time);
          scheduleFrame();
        });
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
        animationFrame = null;
        lastFrameTime = 0;
        return;
      }
      lastFrameTime = 0;
      scheduleFrame();
    };

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (!isVisible && animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = null;
        lastFrameTime = 0;
      } else {
        scheduleFrame();
      }
    });

    resize();
    observer.observe(hero);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
      observer.disconnect();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const hero = heroRef.current;
    if (!hero || event.pointerType !== 'mouse') return;
    const bounds = hero.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    mouseRef.current = { x, y };
    hero.style.setProperty('--px', `${x}px`);
    hero.style.setProperty('--py', `${y}px`);
  };

  const clearPointer = () => {
    mouseRef.current = { x: -999, y: -999 };
    heroRef.current?.style.setProperty('--px', '50%');
    heroRef.current?.style.setProperty('--py', '40%');
  };

  const moveCta = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== 'mouse') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left - bounds.width / 2) * 0.08;
    const y = (event.clientY - bounds.top - bounds.height / 2) * 0.08;
    event.currentTarget.style.transform = `translate(${x}px, ${y}px)`;
  };

  return (
    <section
      ref={heroRef}
      className="ah"
      onPointerMove={handlePointerMove}
      onPointerLeave={clearPointer}
      aria-labelledby="asako-hero-title"
    >
      <div className="ah__mesh" aria-hidden="true"><i /><i /><i /></div>
      <div className="ah__grid" aria-hidden="true" />
      <canvas ref={canvasRef} className="ah__canvas" aria-hidden="true" />
      <div className="ah__spot" aria-hidden="true" />

      <div className="ah__card ah__card--a" aria-hidden="true">
        <div><span className="ah__ico ah__ico--blue"><GraduationCap size={20} /></span><span>Learners<small>Build real skills</small></span></div>
      </div>
      <div className="ah__card ah__card--b" aria-hidden="true">
        <div><span className="ah__ico ah__ico--gold"><BriefcaseBusiness size={20} /></span><span>Employers<small>Find ready talent</small></span></div>
      </div>
      <div className="ah__card ah__card--c" aria-hidden="true">
        <div><span className="ah__ico ah__ico--navy"><BookOpen size={20} /></span><span>Education partners<small>Connect to industry</small></span></div>
      </div>
      <div className="ah__card ah__card--d" aria-hidden="true">
        <div><span className="ah__ico ah__ico--gold"><Network size={20} /></span><span>Pathways<small>Skills to opportunity</small></span></div>
      </div>

      <div className="ah__content">
        <span className="ah__badge">
          <span className="ah__dot" />
          Your next step starts here
        </span>

        <h1 className="ah__title" id="asako-hero-title" aria-label="Build what comes next. Make it matter.">
          <span className="ah__line" aria-hidden="true">
            {words.slice(0, 4).map((word, index) => (
              <span className={`ah__w ${word.kind ? `ah__acc ah__acc--${word.kind}` : ''}`} key={word.text}>
                <span style={{ animationDelay: `${0.4 + index * 0.12}s` }}>{word.text}</span>
              </span>
            ))}
          </span>
          <span className="ah__line" aria-hidden="true">
            {words.slice(4).map((word, index) => {
              const wordIndex = index + 4;
              return (
                <span className={`ah__w ${word.kind ? `ah__acc ah__acc--${word.kind.split(' ')[0]}` : ''} ${word.kind.includes('underline') ? 'ah__w--rel' : ''}`} key={word.text}>
                  <span style={{ animationDelay: `${0.4 + wordIndex * 0.12}s` }}>{word.text}</span>
                  {word.kind.includes('underline') && (
                    <svg className="ah__under" viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden="true">
                      <path d="M3 9 C 50 2, 110 2, 197 8" />
                    </svg>
                  )}
                </span>
              );
            })}
          </span>
        </h1>

        <p className="ah__sub">
          ASAKO brings learners, employers, and education partners together to create practical pathways from skills to opportunity.
        </p>

        <div className="ah__cta-wrap">
          <span className="ah__cta-box">
            <span className="ah__ring" aria-hidden="true" />
            <button
              type="button"
              className="ah__cta"
              onClick={() => onOpenAuth('student')}
              onPointerMove={moveCta}
              onPointerLeave={(event) => {
                event.currentTarget.style.transform = '';
              }}
            >
              Get started today
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </span>
        </div>
        <p className="ah__note">Choose your pathway and create your free account</p>
      </div>
    </section>
  );
};
