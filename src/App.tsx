/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, forwardRef, useMemo } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { 
  Settings, 
  Download, 
  Maximize, 
  Minimize, 
  Plus, 
  Minus, 
  ChevronLeft, 
  ChevronRight,
  ExternalLink,
  X,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Types for the flipbook config
interface FlipbookConfig {
  title: string;
  tagtitle: string;
  description: string;
  companyLogo: string;
  showSocial: boolean;
  showformat: string;
  backlink: string;
  opacity: number;
  showDownload: boolean;
  direction: 'ltr' | 'rtl';
  numPages: number;
}

// Page component
const Page = forwardRef<HTMLDivElement, { number: number; children?: React.ReactNode; density?: 'hard' | 'soft' }>((props, ref) => {
  const isLeftPage = props.number % 2 === 0;

  return (
    <div 
      className="relative bg-white opacity-100 overflow-hidden" 
      ref={ref} 
      style={{ backgroundColor: '#ffffff', width: '100%', height: '100%', opacity: 1, willChange: 'transform' }}
      data-density={props.density || 'hard'}
    >
      <div className="h-full w-full relative overflow-hidden bg-white opacity-100" style={{ backgroundColor: '#ffffff', opacity: 1 }}>
        {props.children}
      </div>
    </div>
  );
});

Page.displayName = 'Page';

const PAGE_IMAGES = [
  "https://static.wixstatic.com/media/7fa905_374d915c0f7740b697f2fefe4a8a5647~mv2.jpg",
  "https://static.wixstatic.com/media/7fa905_9fad1efae63949cc814afde41383dc78~mv2.jpg",
  "https://static.wixstatic.com/media/7fa905_dd2d4e288c9c44d9a7f196953596ae1f~mv2.jpg",
  "https://static.wixstatic.com/media/7fa905_ae482edea3af4f839b0b7b297d9db1a9~mv2.jpg",
  "https://static.wixstatic.com/media/7fa905_858984b251bf4a6f9e1f75b417898f58~mv2.jpg",
  "https://static.wixstatic.com/media/7fa905_7cc073bf55f64b818a517a3396ac2ef0~mv2.jpg",
  "https://static.wixstatic.com/media/7fa905_4f129b58c4254906996bb5d9c21d04d2~mv2.jpg",
  "https://static.wixstatic.com/media/7fa905_f0e80a0a57c44cbb987d385f22023bb8~mv2.jpg",
  "https://static.wixstatic.com/media/7fa905_c48d19b86bd34d52bab04034e7239044~mv2.jpg",
  "https://static.wixstatic.com/media/7fa905_2a39e49c7e8647ddbf76f7c5c30feec4~mv2.jpg",
  "https://static.wixstatic.com/media/7fa905_885bbcfc843f419c80fc405b6ae9d790~mv2.jpg",
  "https://static.wixstatic.com/media/7fa905_975f105a9fcb4e9dbda9a0dfd6741ca3~mv2.jpg",
  "https://static.wixstatic.com/media/7fa905_1b78b3c434ad46d0a46b7dec9184945f~mv2.jpg",
  "https://static.wixstatic.com/media/7fa905_8bed343be7a94402a7a203ca3e0c9bd1~mv2.jpg",
  "https://static.wixstatic.com/media/7fa905_bcd8d2b723524c4381c8d96b9e195d9d~mv2.jpg",
  "https://static.wixstatic.com/media/7fa905_25ad49cbc3c1496cb7e03c0bc6017ab7~mv2.jpg",
  "https://static.wixstatic.com/media/7fa905_51122564fdd34f3b804b62581994d3ea~mv2.jpg",
  "https://static.wixstatic.com/media/7fa905_05514f00ff2a4b76b376df075dbbc339~mv2.jpg",
  "https://static.wixstatic.com/media/7fa905_6e8313f3eda14bc4968b833335b81654~mv2.jpg",
  "https://static.wixstatic.com/media/7fa905_4ec78a0c10624f65916452a86bdf9d5f~mv2.jpg",
  "https://static.wixstatic.com/media/7fa905_12af007381834c9789021242fb6d209c~mv2.jpg",
  "https://static.wixstatic.com/media/7fa905_e475413cd6594e8dac3ce7b7ef5ae622~mv2.jpg",
  "https://static.wixstatic.com/media/7fa905_645ed5c02eb84fdb8254bfd2bc1ae2a7~mv2.jpg",
  "https://static.wixstatic.com/media/7fa905_52bff60ebcaa4d0c86c6a32a26975975~mv2.jpg",
  "https://static.wixstatic.com/media/7fa905_4c34f0508c484a5891e69951cabd83a0~mv2.jpg",
];

const BACKSIDE_IMAGE = "https://static.wixstatic.com/media/7fa905_66b8fea35aea410594363d32cf286829~mv2.jpg";

export default function App() {
  const [config, setConfig] = useState<FlipbookConfig>({
    title: "Diary of neo is frank",
    tagtitle: "Diary of neo is frank",
    description: "Diary of neo is frank interactive flipbook.",
    companyLogo: "https://www.flipbookpdf.net/web/site/img/logonet.png",
    showSocial: true,
    showformat: "1",
    backlink: "https://www.flipbookpdf.net",
    opacity: 0.4,
    showDownload: true,
    direction: 'ltr',
    numPages: PAGE_IMAGES.length * 2
  });

  const [currentPage, setCurrentPage] = useState(0);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const bookRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Resize observer to scale the book
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width, height });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const onPage = (e: any) => {
    setCurrentPage(e.data);
  };

  const nextClick = () => {
    bookRef.current.pageFlip().flipNext();
  };

  const prevClick = () => {
    bookRef.current.pageFlip().flipPrev();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const isMobile = containerSize.width < 768;

  const bookWidth = useMemo(() => {
    // Fill most of the screen width
    // On mobile, we want the single active page to fill about 90% of the screen width
    const multiplier = isMobile ? 1.8 : 0.95;
    const baseWidth = Math.min(containerSize.width * multiplier, isMobile ? 1200 : 1400); 
    
    // Each page is half of the total spread width. 
    // We always use half width even on mobile to force the double-page flip logic.
    return (baseWidth / 2) * zoom;
  }, [containerSize.width, zoom, isMobile]);

  const bookHeight = useMemo(() => {
    const aspectRatio = 1.414; // A4
    if (isMobile) {
      // On mobile, try to fill up to 90% of the container height
      const maxHeight = containerSize.height * 0.9;
      // But also don't exceed the aspect ratio based on width
      return Math.min(bookWidth * aspectRatio, maxHeight);
    }
    return bookWidth * aspectRatio;
  }, [bookWidth, isMobile, containerSize.height]);

  return (
    <div 
      className="relative w-screen h-screen overflow-hidden font-sans select-none"
      style={{ 
        backgroundColor: `rgba(0, 0, 0, 0.05)`,
        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(0,0,0,0.05) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }}
    >
      {/* Background Overlay (Opacity simulation) */}
      <div 
        className="absolute inset-0 z-0 transition-opacity duration-300" 
        style={{ opacity: config.opacity }}
      />

      {/* Main Flipbook Viewport */}
      <div 
        ref={containerRef}
        className="w-full h-full flex items-center justify-center pt-8 pb-32 md:pt-16 md:pb-24 bg-white"
        style={{ backgroundColor: '#ffffff' }}
      >
        <div className="relative">
          {/* Navigation Arrows */}
          <button 
            onClick={prevClick}
            className="absolute -left-12 lg:-left-20 top-1/2 -translate-y-1/2 p-4 text-gray-400 hover:text-gray-800 transition-colors z-10"
            disabled={currentPage === 0}
          >
            <ChevronLeft size={48} strokeWidth={1} />
          </button>
          
          <button 
            onClick={nextClick}
            className="absolute -right-12 lg:-right-20 top-1/2 -translate-y-1/2 p-4 text-gray-400 hover:text-gray-800 transition-colors z-10"
            disabled={currentPage >= config.numPages - 1}
          >
            <ChevronRight size={48} strokeWidth={1} />
          </button>

          {/* The Book */}
          {containerSize.width > 0 && (
            <div 
              className="relative overflow-hidden"
              style={{ 
                width: isMobile ? `${bookWidth}px` : 'auto'
              }}
            >
              <div
                className="relative transition-transform duration-500 ease-in-out flex justify-center"
                style={{ 
                  transform: isMobile ? `translateX(-${bookWidth / 2}px)` : 'none',
                }}
              >
                <HTMLFlipBook
                  width={bookWidth}
                  height={bookHeight}
                  size="fixed"
                  minWidth={150}
                  maxWidth={1000}
                  minHeight={200}
                  maxHeight={1533}
                  maxShadowOpacity={0.4}
                  showCover={true}
                  mobileScrollSupport={true}
                  onFlip={onPage}
                  className="diary-flipbook shadow-2xl"
                  ref={bookRef}
                  style={{ backgroundColor: '#ffffff' }}
                  startPage={0}
                  drawShadow={true}
                  flippingTime={2000}
                  usePortrait={false}
                  startZIndex={1}
                  autoSize={false}
                  clickEventForward={true}
                  useMouseEvents={true}
                  swipeDistance={30}
                  showPageCorners={true}
                  disableFlipByClick={false}
                >
                {/* Pages mapping */}
                {PAGE_IMAGES.map((url, i) => [
                  <Page 
                    key={`front-${i}`} 
                    number={i * 2 + 1}
                    density={'soft'}
                  >
                    <div className="absolute inset-0 bg-white" style={{ backgroundColor: '#ffffff' }}>
                      <img 
                        src={url} 
                        alt={`Page Content ${i + 1}`} 
                        className="w-full h-full object-fill pointer-events-none bg-white"
                        style={{ backgroundColor: '#ffffff' }}
                        loading="eager"
                      />
                    </div>
                  </Page>,
                  <Page 
                    key={`back-${i}`} 
                    number={i * 2 + 2}
                    density="soft"
                  >
                    <div className="absolute inset-0 bg-white" style={{ backgroundColor: '#ffffff' }}>
                      <img 
                        src={BACKSIDE_IMAGE} 
                        alt={`Page Back ${i + 1}`} 
                        className="w-full h-full object-fill pointer-events-none bg-white"
                        style={{ backgroundColor: '#ffffff' }}
                        loading="eager"
                      />
                    </div>
                  </Page>
                ]).flat()}
              </HTMLFlipBook>
            </div>
          </div>
        )}
      </div>
    </div>



      {/* Image Pre-loader */}
      <div className="fixed -left-[9999px] -top-[9999px] opacity-0 pointer-events-none">
        <img src={BACKSIDE_IMAGE} alt="" />
        {PAGE_IMAGES.map((url, i) => (
          <img key={`preload-${i}`} src={url} alt="" />
        ))}
      </div>

      {/* Admin Config Modal */}
      <AnimatePresence>
        {isConfigOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConfigOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                    <Settings size={18} />
                  </div>
                  <h3 className="font-bold text-gray-800">Admin Configuration</h3>
                </div>
                <button 
                  onClick={() => setIsConfigOpen(false)}
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Tag Page Title</label>
                      <input 
                        type="text" 
                        value={config.tagtitle}
                        onChange={(e) => setConfig({...config, tagtitle: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1">
                        Flipbook Title <Info size={12} className="text-gray-400" />
                      </label>
                      <input 
                        type="text" 
                        value={config.title}
                        onChange={(e) => setConfig({...config, title: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Description</label>
                      <textarea 
                        value={config.description}
                        onChange={(e) => setConfig({...config, description: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm h-24 resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center justify-between">
                        Opacity <span>{config.opacity}</span>
                      </label>
                      <input 
                        type="range" 
                        min={0.1} 
                        max={1} 
                        step={0.1}
                        value={config.opacity}
                        onChange={(e) => setConfig({...config, opacity: parseFloat(e.target.value)})}
                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Social Icons</label>
                        <select 
                          value={config.showSocial ? "1" : "0"}
                          onChange={(e) => setConfig({...config, showSocial: e.target.value === "1"})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        >
                          <option value="1">Show</option>
                          <option value="0">Hide</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Download Button</label>
                        <select 
                          value={config.showDownload ? "1" : "0"}
                          onChange={(e) => setConfig({...config, showDownload: e.target.value === "1"})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        >
                          <option value="1">Yes</option>
                          <option value="0">No</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
                  <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="text-sm font-bold text-blue-900">Pro Features</h4>
                    <p className="text-xs text-blue-700 mt-1">Some options like Company Logo and Backlink are locked in this preview version. Upgrade to PRO for full customization.</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center gap-3">
                <div className="flex gap-2">
                  <button 
                    onClick={() => alert("Short link feature available in PRO version")}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-[10px] font-bold uppercase tracking-wider transition-colors"
                  >
                    Short Link
                  </button>
                  <button 
                    onClick={() => alert("Embedded code feature available in PRO version")}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-[10px] font-bold uppercase tracking-wider transition-colors"
                  >
                    Embedded Code
                  </button>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsConfigOpen(false)}
                    className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => setIsConfigOpen(false)}
                    className="px-6 py-2 bg-blue-600 rounded-lg text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
