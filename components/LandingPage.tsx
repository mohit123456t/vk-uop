import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { ICONS } from '../constants';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const navItems = ["How It Works", "Pricing", "Why Us", "Case Study"];

  return (
    <div className="font-sans text-slate-700 bg-white">
      <header className="fixed top-0 left-0 right-0 z-20 bg-white/60 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-slate-900"><Logo /></div>
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="text-slate-700 hover:text-slate-900 font-medium transition-colors">{item}</a>
            ))}
          </nav>
          <button onClick={() => navigate('/role-login')} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-2 px-5 rounded-lg transition-all duration-300 transform hover:scale-105 btn-hover-effect shadow-lg">
            Sign In
          </button>
        </div>
      </header>

      <main>
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 text-center overflow-hidden">
             <div className="absolute inset-0 -z-10 bg-grid-slate-100/50 [mask-image:linear-gradient(to_bottom,white_0%,transparent_100%)]"></div>
            <div className="container mx-auto px-6 animate-fade-in-up">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-4">
                    Go Viral with <span className="text-slate-900">Mass Reel Marketing.</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-8">
                    We create and upload hundreds of reels from real accounts to make your brand trend on Instagram. Simple, powerful, and affordable.
                </p>
            </div>
        </section>

        <section id="how-it-works" className="py-20 bg-slate-50">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Your Brand, Everywhere in 3 Steps</h2>
            <p className="text-slate-600 mb-12 max-w-2xl mx-auto">Our streamlined process makes going viral effortless for you.</p>
            <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto relative">
              <div className="absolute top-1/2 left-0 w-full h-px bg-slate-200 -translate-y-1/2 hidden md:block"></div>
              <div className="absolute top-1/2 left-0 w-full flex justify-around -translate-y-1/2 hidden md:flex">
                  <div className="h-2 w-2 bg-slate-900 rounded-full"></div>
                  <div className="h-2 w-2 bg-slate-900 rounded-full"></div>
                  <div className="h-2 w-2 bg-slate-900 rounded-full"></div>
              </div>
               {[
                  { icon: ICONS.brief, title: "1. Give Us Your Product", text: "Tell us about your product and goals. We handle the entire creative strategy from A to Z." },
                  { icon: ICONS.magic, title: "2. We Create 100+ Reels", text: "Our 1000+ member team scripts, edits, and produces a high volume of engaging reels for your brand." },
                  { icon: ICONS.rocket, title: "3. Your Brand Goes Viral", text: "We upload your reels across hundreds of real accounts, driving massive reach and engagement." }
              ].map((step, i) => (
                  <div key={i} className="glass p-8 text-center animate-fade-in-up relative bg-white" style={{ animationDelay: `${i * 200}ms` }}>
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-slate-900 text-white mb-4">{step.icon}</div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">{step.title}</h3>
                    <p className="text-slate-600">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20">
            <div className="container mx-auto px-6 text-center">
                 <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Simple, Transparent Pricing</h2>
                 <p className="text-slate-600 mb-12 max-w-2xl mx-auto">One plan to make you go viral. No hidden fees, no complex tiers.</p>
                 <div className="max-w-md mx-auto">
                    <div className="glass p-8 md:p-10 animate-fade-in-up border-2 border-slate-900 shadow-2xl rounded-2xl">
                        <h3 className="text-2xl font-bold text-slate-800">Per Reel Plan</h3>
                        <p className="text-6xl font-extrabold text-slate-900 my-4">₹4.76</p>
                        <p className="font-semibold text-slate-600">per reel</p>
                        <p className="text-sm text-slate-500 mt-6 mb-6">Minimum 100 reels commitment.</p>
                        <ul className="text-left space-y-2 text-slate-600">
                           <li className="flex items-center"><span className="text-slate-800 mr-3">{ICONS.check}</span>Viral Scriptwriting</li>
                           <li className="flex items-center"><span className="text-slate-800 mr-3">{ICONS.check}</span>Professional Editing</li>
                           <li className="flex items-center"><span className="text-slate-800 mr-3">{ICONS.check}</span>Mass Upload Management</li>
                        </ul>
                    </div>
                 </div>
            </div>
        </section>

        <section id="case-study" className="py-20 bg-slate-50">
            <div className="container mx-auto px-6">
                <div className="glass p-10 md:p-16 text-center max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-4">The Math of Going Viral</h2>
                    <p className="text-slate-600 mb-8 text-lg">See how a small investment can generate massive reach at the lowest cost in the industry.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="border-t-2 border-slate-900 pt-4">
                            <p className="text-4xl md:text-5xl font-extrabold text-slate-900">100</p>
                            <p className="font-semibold text-slate-600">Reels Created</p>
                        </div>
                         <div className="border-t-2 border-slate-900 pt-4">
                            <p className="text-4xl md:text-5xl font-extrabold text-slate-900">₹476</p>
                            <p className="font-semibold text-slate-600">Total Cost</p>
                        </div>
                         <div className="border-t-2 border-slate-900 pt-4">
                            <p className="text-4xl md:text-5xl font-extrabold text-slate-900">100k+</p>
                            <p className="font-semibold text-slate-600">Potential Views</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section id="why-us" className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">The ViewzKart Advantage</h2>
              <p className="text-slate-600 mb-12 max-w-2xl mx-auto">We're not just another agency. We are a growth machine.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {[
                    { icon: ICONS.money, title: "Low-Cost Viral Marketing", text: "Our simple per-reel pricing makes mass marketing accessible to everyone, not just big brands." },
                    { icon: ICONS.shieldCheck, title: "100% Real Accounts", text: "We leverage a vast network of genuine Instagram accounts for authentic reach. No bots, ever." },
                    { icon: ICONS.users, title: "Full Creative Support", text: "From viral script ideas to professional editing, our 1000+ member team handles the entire creative process." },
                    { icon: ICONS.chart, title: "Dashboard Transparency", text: "Monitor every aspect of your campaign's performance with our advanced, real-time analytics dashboard." },
                ].map((feature, i) => (
                    <div key={i} className="flex items-start space-x-4 animate-fade-in-up" style={{ animationDelay: `${i * 100}ms`}}>
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-slate-900 text-white">{feature.icon}</div>
                        <div>
                            <h3 className="font-bold text-slate-800">{feature.title}</h3>
                            <p className="text-slate-600 text-sm">{feature.text}</p>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </section>

        <section id="call-to-action" className="py-20 bg-slate-50">
            <div className="container mx-auto px-6 text-center">
                 <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Launch Your Reel Campaign Today</h2>
                 <p className="text-slate-600 mb-8 max-w-2xl mx-auto">Let's make your brand the next big thing on Instagram. Contact us to get started.</p>
            </div>
        </section>
      </main>

      <footer id="contact" className="bg-slate-900 text-white">
          <div className="container mx-auto px-6 pt-20 pb-8">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Go Viral?</h2>
              <p className="text-slate-300 mb-8 max-w-2xl mx-auto">Contact us today for a custom quote or to discuss your campaign.</p>
              <a href="mailto:hello@viewzkart.com" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-all duration-300 transform hover:scale-105 btn-hover-effect inline-block">
                  hello@viewzkart.com
              </a>
            </div>
            <div className="mt-16 border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center">
              <div className="text-slate-400 text-sm text-center md:text-left">
                <div className="mb-2"><Logo /></div>
                <p>&copy; {new Date().getFullYear()} ViewzKart. All Rights Reserved.</p>
                <div className="mt-2">
                  <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                  <span className="mx-2">·</span>
                  <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
                </div>
              </div>
              <div className="flex space-x-4 mt-6 md:mt-0">
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">{ICONS.twitter}</a>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">{ICONS.linkedin}</a>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">{ICONS.instagram}</a>
              </div>
            </div>
          </div>
      </footer>
    </div>
  );
};

export default LandingPage;
