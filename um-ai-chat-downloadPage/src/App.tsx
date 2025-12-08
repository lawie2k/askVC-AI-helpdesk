
import HeaderPic from './assets/HeaderPic.png';

function App() {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleDownload = async () => {
    // Google Drive direct download link
    // File ID: 1f_rv_2CzXF2oKGBxPQTyKKDWksO4IV2C
    const apkUrl = import.meta.env.VITE_APK_URL || 'https://drive.google.com/uc?export=download&id=1f_rv_2CzXF2oKGBxPQTyKKDWksO4IV2C';
    
    try {
      // For Google Drive, we'll open directly (Drive handles the download)
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = apkUrl;
      link.download = 'askVC.apk';
      link.target = '_blank'; // Open in new tab for Google Drive
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      // If download fails, show user-friendly error
      alert('Unable to download APK. Please try again or contact support.');
      console.error('Download error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white">
      {/* Hero */}
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-12 px-4 py-14 sm:px-6 md:flex-row md:gap-20 md:py-20 lg:gap-28">
        <div className="flex-1 space-y-4 text-center md:text-left">
          <h1 className="text-4xl font-extrabold leading-tight md:text-5xl lg:text-6xl">
            Meet ask<span className="text-[#900C27]">VC</span>
          </h1>
          <p className="text-lg text-slate-300 md:text-xl lg:text-[26px]">
            Your AI-powered university assistant. Get instant answers about faculty, courses, and campus life.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center md:justify-start">
            <button
              className="rounded-lg bg-red-600 px-6 py-3 text-white shadow hover:bg-red-700 transition"
              onClick={handleDownload}
            >
              Download APK
            </button>
            <button
              className="rounded-lg border border-red-600 px-6 py-3 text-white hover:bg-red-900 transition"
              onClick={() => scrollToSection('why-choose')}
            >
              Learn More
            </button>
          </div>
        </div>

        <div className="relative flex-1 flex justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-[360px] w-[360px] sm:h-[480px] sm:w-[480px] md:h-[620px] md:w-[620px] lg:h-[760px] lg:w-[760px] rounded-full bg-[radial-gradient(circle_at_30%_30%,#8b0f2d,transparent_55%),radial-gradient(circle_at_70%_60%,#1a0f1d,transparent_60%)] blur-[90px] md:blur-[110px] opacity-80" />
          </div>
          <img
            src={HeaderPic}
            className="relative w-[240px] sm:w-[280px] md:w-[320px] object-contain border-[8px] md:border-[10px] border-[#3C3C3C] rounded-[24px] md:rounded-[30px] shadow-xl"
            alt="askVC header"
          />
        </div>
      </div>

      {/* Why Choose */}
      <section id="why-choose" className="px-4 pb-20">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-bold">
            Why Choose ask<span className="text-[#900C27]">VC</span>?
          </h2>
          <p className="text-slate-300 max-w-3xl mx-auto">
            Designed to make your university experience smoother and more informed.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-4">
          {[
            {
              title: 'Smart Conversations',
              desc: 'Natural language chat interface that understands your questions about faculty and university life.',
              icon: '💬',
            },
            {
              title: 'Room Locations',
              desc: 'Quickly find room locations and navigate the campus with ease.',
              icon: '👥',
            },
            {
              title: '24/7 Availability',
              desc: 'Get answers anytime, anywhere. No waiting for office hours or responses.',
              icon: '🕑',
            },
            {
              title: 'Instant Responses',
              desc: 'AI-powered responses that deliver accurate information in seconds.',
              icon: '⚡',
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-[#1f1f2a] bg-[#2C2C2C] px-6 py-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1b1c24] text-red-400 text-xl">
                {card.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>


      <section id="cta" className="px-4 pb-24">
        <div className="mx-auto flex max-w-4xl flex-col items-center rounded-3xl border border-[#3b111d] bg-[radial-gradient(circle_at_25%_20%,rgba(255,92,92,0.22),transparent_45%),radial-gradient(circle_at_75%_75%,rgba(140,28,46,0.28),transparent_50%),linear-gradient(145deg,#1a0f14,#120c10)] px-8 py-12 text-center shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
          <div className="mb-3 rounded-full border border-red-800/60 px-4 py-1 text-xs uppercase tracking-[0.2em] text-red-400">
            Android APK Available
          </div>
          <h2 className="text-4xl font-extrabold mb-3">Ready to Get Started?</h2>
          <p className="mb-8 max-w-2xl text-slate-300">
            Download askVC now and start exploring your university with AI-powered assistance at your fingertips.
          </p>
          <button 
            onClick={handleDownload}
            className="mb-4 flex items-center gap-2 rounded-xl bg-red-600 px-8 py-4 text-lg font-semibold text-white shadow-[0_20px_40px_rgba(255,0,0,0.25)] hover:bg-red-700 transition"
          >
            <span>⬇</span> Download APK
          </button>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="text-red-400">●</span> Safe &amp; Secure
            <span className="text-green-400">●</span> v1.0.0
          </div>
        </div>
      </section>


      <footer className="border-t border-[#1f1f2a] px-6 py-6 text-center text-sm text-slate-400">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 md:flex-row md:justify-between">
          <div className="font-semibold text-white text-[24px]">
            ask<span className="text-[#900C27]">VC</span>
          </div>
          <div>© 2025 All Rights Reserved. By askVC Team</div>
        </div>
      </footer>
    </div>
  );
}

export default App;
