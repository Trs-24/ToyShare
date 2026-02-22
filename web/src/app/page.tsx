'use client';

import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import Navbar from '@/components/Navbar';
import { useEffect, useRef } from 'react';

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const items = el.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return ref;
}

export default function LandingPage() {
  const { t } = useTranslation();
  const containerRef = useScrollReveal();

  return (
    <div className="min-h-screen flex flex-col bg-white" ref={containerRef}>
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 py-12 md:py-24 relative overflow-hidden">
          {/* Ambient glow blobs */}
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl pointer-events-none" />

          <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
            <div className="max-w-xl">
              <div className="reveal reveal-up inline-flex items-center gap-2 px-4 py-2 rounded-full border border-teal-100 bg-teal-50/50 text-teal-700 text-sm font-medium mb-6 shadow-sm shadow-teal-100/50">
                <span className="animate-pulse">✨</span> {t('hero_freeHeader')}
              </div>

              <h1 className="reveal reveal-up delay-100 text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
                {t('hero_title')
                  .split(' ')
                  .map((word, i, arr) => {
                    if (i >= arr.length - 2) {
                      return (
                        <span
                          key={i}
                          className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-500"
                        >
                          {word}{' '}
                        </span>
                      );
                    }
                    return word + ' ';
                  })}
              </h1>

              <p className="reveal reveal-up delay-200 text-lg text-gray-500 leading-relaxed mb-8">
                {t('hero_subtitle')}
              </p>

              <div className="reveal reveal-up delay-300 flex flex-col sm:flex-row gap-4 mb-12">
                <Link
                  href="/catalog"
                  className="inline-flex justify-center items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 text-white font-semibold rounded-xl transition-[transform,box-shadow] duration-300 shadow-lg shadow-teal-200/50 hover:shadow-xl hover:shadow-teal-300/50 hover:-translate-y-0.5 active:translate-y-0"
                >
                  {t('hero_startBtn')}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex justify-center items-center px-8 py-3.5 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-[transform,box-shadow] duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  {t('hero_howItWorksBtn')}
                </a>
              </div>

              <div className="reveal reveal-up delay-400 flex items-center gap-8 md:gap-12 text-center md:text-left">
                {[
                  { val: '500+', label: t('hero_stats_toys') },
                  { val: '200+', label: t('hero_stats_families') },
                  { val: '98%', label: t('hero_stats_happy') },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center gap-8 md:gap-12">
                    {i > 0 && <div className="w-px h-10 bg-gray-200 hidden md:block" />}
                    <div>
                      <h3 className="text-3xl font-bold text-gray-900">{stat.val}</h3>
                      <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Banner */}
            <div className="reveal reveal-scale delay-200 relative w-full h-full flex justify-end">
              <div className="bg-gradient-to-br from-[#c1eabe] to-[#f4c878] rounded-3xl p-8 shadow-2xl shadow-teal-200/30 relative aspect-[4/3] flex items-center justify-center overflow-hidden w-full max-w-lg hover:scale-[1.02] transition-transform duration-500 will-change-transform ring-1 ring-white/30">
                <div className="absolute inset-x-0 top-0 pt-8 text-center text-3xl font-bold text-[#2a4f15] tracking-wide">
                  ToyShare
                </div>
                <div className="text-[120px] filter drop-shadow-xl z-10 leading-none select-none animate-float">
                  🧸🚗
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-lg shadow-black/5 flex items-center gap-3 ring-1 ring-white/50">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center text-xl flex-shrink-0">
                      🎉
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">{t('hero_freeHeader')}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{t('hero_freeText')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="bg-gray-50 py-20 px-4 scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="reveal reveal-up text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                {t('how_title')}
              </h2>
              <p className="reveal reveal-up delay-100 text-lg text-gray-500">
                {t('how_subtitle')}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: '👤', num: '1', title: t('how_step1_title'), text: t('how_step1_text') },
                { icon: '📸', num: '2', title: t('how_step2_title'), text: t('how_step2_text') },
                { icon: '🔄', num: '3', title: t('how_step3_title'), text: t('how_step3_text') },
                { icon: '📦', num: '4', title: t('how_step4_title'), text: t('how_step4_text') },
              ].map((step, i) => (
                <div
                  key={i}
                  className={`reveal reveal-up delay-${i * 100} bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-teal-100/40 hover:-translate-y-1 transition-[transform,box-shadow] duration-300 will-change-transform relative overflow-hidden group`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-50/0 to-teal-50/0 group-hover:from-teal-50/50 group-hover:to-cyan-50/30 transition-opacity duration-500 rounded-3xl" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-teal-100 transition-transform duration-300">
                        {step.icon}
                      </div>
                      <span className="text-4xl font-black text-gray-200 group-hover:text-teal-200 transition-color duration-200">
                        {step.num}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-500 leading-relaxed text-sm">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why ToyShare */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="reveal reveal-up text-3xl md:text-4xl font-extrabold mb-4 text-gray-900">
                {t('why_title')}
              </h2>
              <p className="reveal reveal-up delay-100 text-lg text-gray-500">
                {t('why_subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {[
                {
                  icon: '💰',
                  title: t('why_reason1_title'),
                  text: t('why_reason1_text'),
                  glow: 'hover:shadow-amber-100/60',
                },
                {
                  icon: '🌱',
                  title: t('why_reason2_title'),
                  text: t('why_reason2_text'),
                  glow: 'hover:shadow-emerald-100/60',
                },
                {
                  icon: '🤝',
                  title: t('why_reason3_title'),
                  text: t('why_reason3_text'),
                  glow: 'hover:shadow-blue-100/60',
                },
                {
                  icon: '🛡️',
                  title: t('why_reason4_title'),
                  text: t('why_reason4_text'),
                  glow: 'hover:shadow-purple-100/60',
                },
              ].map((reason, i) => (
                <div
                  key={i}
                  className={`reveal reveal-up delay-${i * 100} bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex gap-6 items-start hover:shadow-xl ${reason.glow} hover:-translate-y-1 transition-[transform,box-shadow] duration-300 will-change-transform cursor-default group`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 flex-shrink-0 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                    {reason.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{reason.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{reason.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Banner */}
            <div className="reveal reveal-scale mt-24 max-w-5xl mx-auto bg-gradient-to-r from-teal-500 to-cyan-500 rounded-[40px] p-10 md:p-16 text-center text-white shadow-2xl shadow-teal-300/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-10 blur-2xl" />
              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-white opacity-10 blur-2xl" />

              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-extrabold mb-6 text-white">
                  {t('cta_title')}
                </h2>
                <p className="text-lg md:text-xl text-teal-50 mb-10 max-w-2xl mx-auto">
                  {t('cta_subtitle')}
                </p>
                <Link
                  href="/catalog"
                  className="inline-flex justify-center items-center gap-2 px-8 py-4 bg-white text-teal-600 font-bold rounded-xl hover:bg-gray-50 transition-[transform,box-shadow] duration-300 shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                >
                  {t('cta_btn')}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <style jsx global>{`
        /* Scroll-reveal base states — GPU-accelerated */
        .reveal {
          opacity: 0;
          will-change: opacity, transform;
          transition:
            opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal-up {
          transform: translateY(30px) translateZ(0);
        }
        .reveal-scale {
          transform: scale(0.96) translateZ(0);
        }
        .revealed {
          opacity: 1 !important;
          transform: translateY(0) scale(1) translateZ(0) !important;
          will-change: auto;
        }

        /* Staggered delays */
        .delay-100 {
          transition-delay: 0.1s;
        }
        .delay-200 {
          transition-delay: 0.2s;
        }
        .delay-300 {
          transition-delay: 0.3s;
        }
        .delay-400 {
          transition-delay: 0.4s;
        }

        /* Floating animation — GPU layer */
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) translateZ(0);
          }
          50% {
            transform: translateY(-10px) translateZ(0);
          }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
          will-change: transform;
        }
      `}</style>
    </div>
  );
}
