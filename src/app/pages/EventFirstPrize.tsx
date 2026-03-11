import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Trophy } from 'lucide-react';
import Lottie from 'lottie-react';
import prize from '../../assets/prize.json';


export default function EventFirstPrize() {
  const navigate = useNavigate();
  const [showResult, setShowResult] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  // Mock winner
  const winner = {
    name: '송혜교',
    nickname: '교야',
    tableNo: '2번',
    missionsCompleted: 5
  };

  const startDraw = () => {
    setIsDrawing(true);
    setTimeout(() => {
      setShowResult(true);
      setIsDrawing(false);
    }, 2000);
  };

  return (
    <div className="min-h-[100dvh] bg-white relative overflow-hidden text-gray-800 flex flex-col items-center">
      <div className="relative z-10 flex flex-col flex-1 w-full max-w-[500px]">
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

        <div className="px-6 mb-6 mt-4 w-full">
          <div className="flex-1 pb-2 text-center">
            <h1 className="text-[26px] font-bold text-[#000000] mb-2 whitespace-pre-line">
              {!showResult ? (isDrawing ? '결과를 집계 중입니다...' : '가장 많은 미션을 완료한\n영광의 1등은 누구일까요?') : '우와앗!\n영광의 1등 발표!'}
            </h1>
            <p className={`font-medium text-lg text-gray-500 leading-relaxed whitespace-pre-line text-center transition-opacity duration-500`}>
              {!showResult ? '실시간으로 가장 많은 미션을\n달성한 분입니다' : `총 ${winner.missionsCompleted}개의 미션을 완료하셨습니다`}
            </p>

          </div>
        </div>
        {
          ((!showResult && !isDrawing) || isDrawing) && (
            <div className="w-80 h-80 flex flex-1 justify-center flex-col items-center self-center">
              <Lottie animationData={prize} loop={true} />
            </div>
          )
        }

        <div className="px-6 py-2 text-center w-full flex-1 flex flex-col items-center justify-center">
          {!showResult ? (
            <div className="flex flex-col items-center mb-8 w-full">

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full flex-1 mb-20 animate-in zoom-in duration-500">
              <div className="relative flex flex-col items-center justify-center space-y-4">
                <Trophy className="w-20 h-20 text-yellow-500 drop-shadow-md mb-2" />
                <div className="text-sm font-bold text-yellow-600 bg-yellow-50 px-4 py-1.5 rounded-full border border-yellow-200 shadow-sm">
                  {winner.tableNo} 자리
                </div>
                <div className="text-5xl font-black text-gray-900 mt-2">
                  {winner.name} 님
                </div>
                <div className="text-xl font-bold text-gray-500">
                  "{winner.nickname}"
                </div>
              </div>
            </div>
          )}
        </div>
      </div>



      {!showResult && !isDrawing && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm pb-8 pt-4 px-6 flex justify-center">
          <div className="w-full max-w-[500px]">
            <button
              onClick={startDraw}
              className="w-full py-4 bg-lime-500 text-white font-bold rounded-[16px] shadow-[0_4px_12px_rgba(132,204,22,0.3)] flex items-center justify-center gap-2 hover:-translate-y-1 active:scale-[0.98] transition-all cursor-pointer text-lg"
            >
              <Trophy className="w-5 h-5 mb-0.5" />
              1등상 확인하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
