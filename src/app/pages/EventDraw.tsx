import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import searchAnimation from '../../assets/search-animation.json';
import arrow_down from '../../assets/arrow_down.json';
import Lottie from 'lottie-react';


export default function EventDraw() {
  const navigate = useNavigate();
  const [ticketNumber, setTicketNumber] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [ticketText, setTicketText] = useState('두구두구');
  const [isDrawing, setIsDrawing] = useState(false);

  // Mock winner
  const winner = {
    name: '최동석',
    nickname: '동석바위',
  };

  const startDraw = () => {
    setIsDrawing(true);
    let dotsCount = 0;
    const textInterval = setInterval(() => {
      if (dotsCount < 3) {
        dotsCount += 1;
      } else {
        dotsCount = 0;
      }
      setTicketText(`두구두구\n행운의 주인공은?${'.'.repeat(dotsCount)}`);
    }, 500);

    const delayTimeout = setTimeout(() => {
      clearInterval(textInterval);
      setTicketText(`두구두구\n행운의 주인공은!...`);

      // Randomly pick a ticket number (mock logic)
      setTicketNumber(Math.floor(Math.random() * 90) + 10);
      setShowResult(true);
      setIsDrawing(false);
    }, 3000);

    return () => {
      clearInterval(textInterval);
      clearTimeout(delayTimeout);
    };
  };

  return (
    <div className="min-h-[100dvh] bg-white relative overflow-hidden text-gray-800 flex flex-col items-center">
      <div className="relative z-10 flex flex-col flex-1 w-full max-w-[500px] ">
        {/* Header */}
        <div className="sticky top-0 z-10 pt-4 pb-2 w-full">
          <div className="px-6 flex items-center justify-between">
            <button
              onClick={() => navigate('/event')}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors flex w-fit"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div className="w-10"></div>
          </div>
        </div>

        <div className="px-6 mb-2 mt-4 w-full ">
          <div className="flex-1 pb-2 text-center">
            <h1 className="text-[26px] font-bold text-[#000000] mb-2 whitespace-pre-line">
              {!showResult ? (isDrawing ? ticketText : '준비되셨나요?\n추첨을 시작합니다!') : '두구두구\n행운의 주인공은!...'}
            </h1>
            <p className={`font-medium text-lg text-gray-500 leading-relaxed whitespace-pre-line text-center transition-opacity duration-500 ${!showResult && !isDrawing ? 'opacity-100' : 'opacity-0'}`}>
              아래 버튼을 눌러 추첨하세요
            </p>
          </div>
        </div>

        {!showResult && !isDrawing && (

          <div className="w-80 h-80 flex flex-1 justify-center flex-col items-center self-center">
            <Lottie animationData={arrow_down} loop={true} />
          </div>
        )}



        <div className="px-6 py-0 text-center w-full flex-1 flex flex-col items-center">
          {!showResult ? (
            <div className="flex flex-col items-center mb-8 w-full">
              {isDrawing && (
                <div className="transition-opacity duration-1000 opacity-100">
                  <Lottie animationData={searchAnimation} loop={true} />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full mb-20 animate-in zoom-in duration-500">
              <div className="relative flex flex-col items-center justify-center gap-8">
                <div className="relative flex items-center justify-center p-0" style={{ width: 500, }}>

                  {/* <svg className="w-[110%] h-auto drop-shadow-md" viewBox="0 0 176 169" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="87.5" cy="84.5" r="84" fill="#CEFAFE" stroke="#A2F4FD" />
                    <path d="M171.997 85C171.728 131.438 134.001 169 87.5 169C40.9987 169 3.272 131.438 3.00293 85H171.997Z" fill="#FFA1AD" />
                    <rect y="74" width="176" height="22" rx="4" fill="#FFCCD3" />
                  </svg> */}
                  <svg
                    className="w-full h-full drop-shadow-md" // w-[110%] 대신 w-full h-full 사용
                    viewBox="0 0 176 169"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none" // 비율을 무시하고 부모 크기에 강제로 맞춤
                  >
                    <circle cx="87.5" cy="84.5" r="84" fill="#CEFAFE" stroke="#A2F4FD" />
                    <path d="M171.997 85C171.728 131.438 134.001 169 87.5 169C40.9987 169 3.272 131.438 3.00293 85H171.997Z" fill="#FFA1AD" />
                    <rect y="74" width="176" height="22" rx="4" fill="#FFCCD3" />
                  </svg>
                  <span className="absolute font-black text-rose-900 z-10 text-[250px]" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)', marginTop: '-2px', fontFamily: "CuteLotte", fontWeight: 400 }}>
                    {ticketNumber}
                  </span>
                </div>
                <div className="mt-0 flex flex-col items-center relative z-20">
                  <div className="text-3xl font-black text-gray-900 mb-1">
                    {winner.name} 님
                  </div>
                  <div className="text-lg font-bold text-gray-500">
                    "{winner.nickname}"
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50   pb-8 pt-4 px-6 flex justify-center " style={{
        background:
          "linear-gradient(to top, rgba(255,255,255,1) 60%, rgba(255,255,255,0.8) 80%, rgba(255,255,255,0) 100%)",
      }} >
        <div className="w-full max-w-[500px] ">
          {!showResult && !isDrawing ? (
            <button
              onClick={startDraw}
              className="w-full py-4 bg-rose-400 text-white font-bold rounded-[16px] shadow-[0_4px_12px_rgba(247,50,149,0.3)] flex items-center justify-center gap-2 hover:-translate-y-1 active:scale-[0.98] transition-all cursor-pointer text-lg"
            >
              추첨 시작하기
            </button>
          ) : showResult ? (
            <button
              onClick={() => { setShowResult(false); setIsDrawing(false); }}
              className="w-full py-4 bg-white border border-rose-200 text-rose-400 rounded-[16px] font-bold text-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:bg-rose-50 active:scale-[0.98] transition-all active:bg-rose-50"
            >
              다시 뽑기
            </button>
          ) : (
            <div className="h-[60px]" /> /* Placeholder to maintain height during drawing */
          )}
        </div>
      </div>
    </div>
  );
}
