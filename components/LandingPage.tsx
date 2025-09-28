import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { ICONS } from '../constants';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const navItems = ["How It Works", "Pricing", "Why Us", "Case Study"];

  const handleSignIn = () => {
    navigate('/portal');
  };

  return (
    <div className="bg-white text-slate-900 font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-lg z-50 border-b border-slate-200/80">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a href={`#${item.toLowerCase().replace(' ', '-')}`} key={item} className="text-slate-600 hover:text-slate-900 transition-colors">
                {item}
              </a>
            ))}
          </nav>
          <button 
            onClick={handleSignIn}
            className="hidden md:block px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
            Sign In
          </button>
          <button className="md:hidden text-slate-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-20">
        <section className="relative container mx-auto px-6 py-24 md:py-32 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-slate-900 mb-6 animate-fade-in-up">
            Scale Your Brand with Effortless Influencer Marketing
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-10 animate-fade-in-up [animation-delay:200ms]">
            ReelScale is your all-in-one platform to manage influencer campaigns, track performance, and drive massive ROI. Focus on your brand, we'll handle the outreach.
          </p>
          <div className="flex justify-center space-x-4 animate-fade-in-up [animation-delay:400ms]">
            <button onClick={handleSignIn} className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-black rounded-lg font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
              Get Started Free
            </button>
            <button className="px-8 py-4 bg-white text-slate-700 rounded-lg font-semibold text-lg hover:bg-slate-100 transition-colors duration-300 transform hover:scale-105 border border-slate-300 shadow-lg">
              Book a Demo
            </button>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-slate-50/70 animate-fade-in-up">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900">How It Works</h2>
                    <p className="text-lg text-slate-600 mt-2">A simple, streamlined process to launch your campaigns.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-10">
                    {[
                        { icon: ICONS.USER_PLUS, title: 'Create Your Campaign', text: 'Sign up and define your campaign goals, target audience, and budget in minutes.' },
                        { icon: ICONS.CHECK_CIRCLE, title: 'We Find Influencers', text: 'Our AI-powered system and expert team match you with the perfect influencers for your brand.' },
                        { icon: ICONS.TREND_UP, title: 'Track & Scale', text: 'Monitor real-time analytics, see your ROI, and easily scale your successful campaigns.' },
                    ].map((step, index) => (
                        <div key={index} className="text-center p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-2 animate-fade-in-up" style={{animationDelay: `${200 * (index + 1)}ms`}}>
                            <div className="inline-block p-4 bg-indigo-100 rounded-full mb-4">
                                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: step.icon }} />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-800 mb-2">{step.title}</h3>
                            <p className="text-slate-600">{step.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* ... other sections ... */}
      </main>
    </div>
  );
};

export default LandingPage;
