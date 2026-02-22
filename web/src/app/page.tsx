'use client';

import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import Navbar from '@/components/Navbar';

export default function LandingPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 py-12 md:py-24 relative overflow-hidden">
          <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-100 bg-indigo-50/50 text-indigo-700 text-sm font-medium mb-6">
                <span>✨</span> {t('hero_freeHeader')}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
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

              <p className="text-lg text-gray-500 leading-relaxed mb-8">{t('hero_subtitle')}</p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link
                  href="/catalog"
                  className="inline-flex justify-center items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
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
                  className="inline-flex justify-center items-center px-8 py-3.5 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all shadow-sm"
                >
                  {t('hero_howItWorksBtn')}
                </a>
              </div>

              <div className="flex items-center gap-8 md:gap-12 text-center md:text-left">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900">500+</h3>
                  <p className="text-sm text-gray-500 font-medium">{t('hero_stats_toys')}</p>
                </div>
                <div className="w-px h-10 bg-gray-200 hidden md:block"></div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900">200+</h3>
                  <p className="text-sm text-gray-500 font-medium">{t('hero_stats_families')}</p>
                </div>
                <div className="w-px h-10 bg-gray-200 hidden md:block"></div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900">98%</h3>
                  <p className="text-sm text-gray-500 font-medium">{t('hero_stats_happy')}</p>
                </div>
              </div>
            </div>

            {/* Hero Banner Image Placeholder */}
            <div className="relative w-full h-full flex justify-end">
              <div className="bg-gradient-to-br from-[#c1eabe] to-[#f4c878] rounded-3xl p-8 shadow-xl relative aspect-[4/3] flex items-center justify-center overflow-hidden w-full max-w-lg transform hover:scale-[1.02] transition-transform duration-500">
                <div className="absolute inset-x-0 top-0 pt-8 text-center text-3xl font-bold text-[#2a4f15] tracking-wide">
                  ToyShare
                </div>
                <div className="text-[120px] filter drop-shadow-xl z-10 leading-none select-none">
                  🧸🚗
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/90 backdrop-blur rounded-2xl p-4 shadow-lg flex items-center gap-3">
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
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                {t('how_title')}
              </h2>
              <p className="text-lg text-gray-500">{t('how_subtitle')}</p>
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
                  className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-teal-100 transition-all">
                      {step.icon}
                    </div>
                    <span className="text-4xl font-black text-gray-200 group-hover:text-teal-100 transition-colors">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why ToyShare */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-gray-900">
                {t('why_title')}
              </h2>
              <p className="text-lg text-gray-500">{t('why_subtitle')}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {[
                { icon: '💰', title: t('why_reason1_title'), text: t('why_reason1_text') },
                { icon: '🌱', title: t('why_reason2_title'), text: t('why_reason2_text') },
                { icon: '🤝', title: t('why_reason3_title'), text: t('why_reason3_text') },
                { icon: '🛡️', title: t('why_reason4_title'), text: t('why_reason4_text') },
              ].map((reason, i) => (
                <div
                  key={i}
                  className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex gap-6 items-start hover:shadow-md transition-shadow cursor-default"
                >
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 flex-shrink-0 flex items-center justify-center text-2xl">
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
            <div className="mt-24 max-w-5xl mx-auto bg-gradient-to-r from-teal-500 to-cyan-500 rounded-[40px] p-10 md:p-16 text-center text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-10 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-white opacity-10 blur-2xl"></div>

              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-extrabold mb-6 text-white">
                  {t('cta_title')}
                </h2>
                <p className="text-lg md:text-xl text-teal-50 mb-10 max-w-2xl mx-auto">
                  {t('cta_subtitle')}
                </p>
                <Link
                  href="/register"
                  className="inline-flex justify-center items-center gap-2 px-8 py-4 bg-white text-teal-600 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl"
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

      {/* Global Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <Link
                href="/"
                className="inline-block text-xl font-bold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent mb-4"
              >
                🧸 ToyShare
              </Link>
              <p className="text-sm text-gray-500 leading-relaxed pr-4">
                {t('footer_description')}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-5">{t('footer_platform')}</h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/catalog"
                    className="text-sm text-gray-500 hover:text-teal-600 transition-colors"
                  >
                    {t('nav_catalog')}
                  </Link>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="text-sm text-gray-500 hover:text-teal-600 transition-colors"
                  >
                    {t('nav_howItWorks')}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-500 hover:text-teal-600 transition-colors"
                  >
                    {t('footer_faq')}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-5">{t('footer_company')}</h4>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-500 hover:text-teal-600 transition-colors"
                  >
                    {t('footer_about')}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-500 hover:text-teal-600 transition-colors"
                  >
                    {t('footer_contacts')}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-500 hover:text-teal-600 transition-colors"
                  >
                    {t('footer_blog')}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-5">{t('footer_legal')}</h4>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-500 hover:text-teal-600 transition-colors"
                  >
                    {t('footer_terms')}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-500 hover:text-teal-600 transition-colors"
                  >
                    {t('footer_privacy')}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-400">{t('footer_rights')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
