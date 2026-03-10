import { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Send, Music, ListMusic } from 'lucide-react';
import Lottie from 'lottie-react';
import checkAnimation from '../../assets/check-animation.json';

interface BgmRequest {
  id: string;
  name: string;
  song: string;
  artist: string;
  timestamp: Date;
}

export default function BgmRequest() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [song, setSong] = useState('');
  const [artist, setArtist] = useState('');
  const [requests, setRequests] = useState<BgmRequest[]>([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const guestName = localStorage.getItem('guestName');
    if (guestName) {
      setName(guestName);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('bgmRequests');
    if (saved) {
      const parsed = JSON.parse(saved);
      setRequests(parsed.map((r: any) => ({
        ...r,
        timestamp: new Date(r.timestamp)
      })));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!song.trim()) return;

    const newRequest: BgmRequest = {
      id: Date.now().toString(),
      name: name.trim() || '게스트',
      song: song.trim(),
      artist: artist.trim(),
      timestamp: new Date()
    };

    const updatedRequests = [newRequest, ...requests];
    setRequests(updatedRequests);
    localStorage.setItem('bgmRequests', JSON.stringify(updatedRequests));

    setSubmitted(true);
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  return (
    <div className="bg-white pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm pt-4 pb-4">
        <div className="max-w-md mx-auto px-6">
          <button
            onClick={() => {
              // scrollRef.current?.scrollTo(0, 0)
              navigate(-1)
            }}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors flex w-fit"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 mb-6 mt-4">
        <div className="flex-1 pb-2 text-center">
          <h1 className="text-[26px] font-bold text-[#000000] mb-2">BGM 신청하기</h1>
          <p className="font-medium text-lg text-gray-500 leading-relaxed whitespace-pre-line text-center">식사 시간에 듣고 싶은 노래를 신청하세요</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-2">
        {/* Form */}
        {!submitted ? (
          <div className="bg-white rounded-[20px] p-6 mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  노래 제목
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={song}
                    onChange={(e) => setSong(e.target.value)}
                    placeholder="노래 제목을 입력해주세요"
                    className="w-full px-4 py-3 border-[0.75px] border-[#000000]/10 rounded-xl focus:bg-lime-50 focus:border-lime-400 focus:outline-none transition-colors relative z-10 bg-[#F4F4F5]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  가수명 (선택)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder="가수명을 입력해주세요"
                    className="w-full px-4 py-3 border-[0.75px] border-[#000000]/10 rounded-xl focus:bg-lime-50 focus:border-lime-400 focus:outline-none transition-colors relative z-10 bg-[#F4F4F5]"
                  />
                </div>
              </div>

              <div className='h-2' />

              <button
                type="submit"
                disabled={!song.trim()}
                className="w-full px-[12px] py-[12px] bg-gradient-to-r from-lime-400 to-lime-500 text-white rounded-[12px] font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 border-[0.75px] border-transparent disabled:opacity-100 disabled:bg-none disabled:bg-[#F4F4F5] disabled:text-[#37383C]/28 disabled:cursor-not-allowed"
              >
                <Music className="w-5 h-5" />
                노래 신청하기
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-[20px] p-8 text-center mb-6">
            <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Lottie animationData={checkAnimation} loop={false} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">신청 완료!</h2>
            <p className="text-gray-600">
              노래 신청이 완료되었습니다 🎵
            </p>
          </div>
        )}

        {/* Playlist */}
        {requests.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-bold text-[#363638] flex items-center gap-2">
              <ListMusic className="w-5 h-5 text-lime-500" />
              재생 목록
            </h3>
            <div className="bg-white rounded-[20px] border-[0.75px] border-black/10 shadow-sm divide-y divide-[#000000]/10" style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)' }}>
              <div className="relative">
                {requests.map((request, index) => (
                  <div
                    key={request.id}
                    className="p-4 flex items-start gap-4 border-b border-[#000000]/10 last:border-b-0"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-lime-400 to-lime-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#363638] truncate">{request.song}</p>
                      {request.artist && (
                        <p className="text-sm text-gray-600 truncate">{request.artist}</p>
                      )}
                      <div className="mt-2">
                        <span className="inline-block px-1 py-[2px] bg-lime-400/20 text-lime-600 text-xs rounded font-medium">
                          신청자 {request.name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
