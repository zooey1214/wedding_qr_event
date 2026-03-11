import { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Ticket } from 'lucide-react';
import searchAnimation from '../../assets/search-animation.json';
import Lottie from 'lottie-react';
import { ResultTopDeco } from '../../components/icons/ResultTopDeco';
import { ResultBottomDeco } from '../../components/icons/ResultBottomDeco';

export default function Tickets() {
  const navigate = useNavigate();
  const [ticketNumbers, setTicketNumbers] = useState<number[]>([]);
  const [hasVisitedTickets, setHasVisitedTickets] = useState(() => {
    const saved = localStorage.getItem('missionProgress');
    if (saved) {
      const data = JSON.parse(saved);
      return data.hasVisitedTickets || false;
    }
    return false;
  });
  const [showResult, setShowResult] = useState(() => {
    const saved = localStorage.getItem('missionProgress');
    if (saved) {
      const data = JSON.parse(saved);
      return data.hasVisitedTickets || false;
    }
    return false;
  });
  const [ticketText, setTicketText] = useState('두구두구');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('missionProgress');
    if (saved) {
      const data = JSON.parse(saved);
      // Retrieve or generate numbers based on completed tickets
      const completedCount = data.tickets || 0;
      let numbers = data.ticketNumbers || [];

      // If we have tickets but no generated numbers, generate them once
      if (numbers.length < completedCount) {
        const newNumbers = [...numbers];
        for (let i = numbers.length; i < completedCount; i++) {
          newNumbers.push(Math.floor(Math.random() * 90) + 10); // Random 2 digit number
        }
        numbers = newNumbers;

        // Save back to localStorage
        const newData = { ...data, ticketNumbers: numbers };
        localStorage.setItem('missionProgress', JSON.stringify(newData));
      }

      setTicketNumbers(numbers);
    }
  }, []);

  useEffect(() => {
    // Animate unconditionally if it's the first visit.
    if (!hasVisitedTickets) {
      let dotsCount = 0;
      const textInterval = setInterval(() => {
        if (dotsCount < 3) {
          dotsCount += 1;
        }
        setTicketText(`두구두구\n내 추첨 번호는?${'.'.repeat(dotsCount)}`);
      }, 500);

      const delayTimeout = setTimeout(() => {
        clearInterval(textInterval);
        setTicketText(`두구두구\n내 추첨 번호는?...`);
        setShowResult(true);

        const saved = localStorage.getItem('missionProgress');
        const data = saved ? JSON.parse(saved) : {};
        data.hasVisitedTickets = true;
        localStorage.setItem('missionProgress', JSON.stringify(data));
        setHasVisitedTickets(true);
      }, 3000);

      return () => {
        clearInterval(textInterval);
        clearTimeout(delayTimeout);
      };
    } else {
      setShowResult(true);
    }
  }, [hasVisitedTickets]);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background Layer (cleared) */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-10 pt-4 pb-2">
          <div className="max-w-md mx-auto px-6">
            <button
              onClick={() => navigate('/')}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors flex w-fit"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>

        <div className="max-w-md mx-auto px-6 mb-6 mt-4 w-full">
          <div className="flex-1 pb-2 text-center">
            <h1 className="text-[26px] font-bold text-[#000000] mb-2 whitespace-pre-line">
              {!hasVisitedTickets && !showResult ? ticketText : '두구두구\n내 추첨 번호는?...'}
            </h1>
            <p className={`font-medium text-lg text-gray-500 leading-relaxed whitespace-pre-line text-center transition-opacity duration-500 ${!showResult ? 'opacity-0' : 'opacity-100'}`}>
              미션 완료를 통해 획득한 번호입니다
            </p>
          </div>
        </div>

        <div className="max-w-md mx-auto px-6 py-2 text-center w-full">
          {!showResult ? (
            <div className="flex flex-col items-center mb-8">
              <div className="transition-opacity duration-1000 opacity-100">
                <Lottie animationData={searchAnimation} loop={false} />
              </div>
            </div>
          ) : ticketNumbers.length === 0 ? (
            <div className="py-12 bg-gray-50/80 backdrop-blur-sm rounded-2xl border-[0.75px] border-gray-200">
              <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">아직 획득한 추첨권이 없습니다.</p>
              <p className="text-sm text-gray-400 mt-1">미션을 완료하고 번호를 받아보세요!</p>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full">
              <div className="transition-opacity duration-1000 opacity-100 flex flex-col items-center w-full">
                <div className="w-full mt-4 -mb-[53px] pointer-events-none z-0 relative flex justify-center items-end pb-2">
                  <div className="h-10" />
                </div>

                <div className="w-full flex flex-col items-center">
                  <div className="w-full flex justify-center z-20 overflow-hidden" style={{ width: '100%' }}>
                    <ResultTopDeco className="w-[110%] h-auto max-w-none -mb-[30px]" />
                  </div>

                  <div className="bg-cyan-50 border-[1.5px] border-cyan-200 rounded-t-none rounded-b-[20px] px-4 py-[44px] text-center w-full flex-col flex relative z-10 m-0" style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)' }}>
                    <div className="flex flex-wrap justify-center gap-3">
                      {ticketNumbers.map((num, idx) => (
                        <div
                          key={idx}
                          className="relative flex items-center justify-center p-0 flex-shrink-0"
                          style={{
                            width: 'calc(33.333% - 8px)',
                            minWidth: '70px',
                            maxWidth: '120px'
                          }}
                        >
                          <svg className="w-[85%] h-auto drop-shadow-sm" viewBox="0 0 176 169" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="87.5" cy="84.5" r="84" fill="#CEFAFE" stroke="#A2F4FD" />
                            <path d="M171.997 85C171.728 131.438 134.001 169 87.5 169C40.9987 169 3.272 131.438 3.00293 85H171.997Z" fill="#FFA1AD" />
                            <rect y="74" width="176" height="22" rx="4" fill="#FFCCD3" />
                          </svg>
                          <span className="absolute font-black text-rose-900 z-10" style={{ fontSize: 'clamp(1.5rem, 6vw, 2rem)', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', marginTop: '-2px', fontFamily: "CuteLotte", fontWeight: 500 }}>
                            {num}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="w-full flex justify-center z-20 overflow-hidden" style={{ width: '100%' }}>
                    <ResultBottomDeco className="w-[110%] h-auto max-w-none mt-[-5px]" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
