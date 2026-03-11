import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Send, Heart } from "lucide-react";
import Lottie from "lottie-react";
import checkAnimation from "../../assets/check-animation.json";
import { supabase } from "../../lib/supabase";

interface GuestbookEntry {
  id: string;
  name: string;
  nickname: string;
  message: string;
  timestamp: Date;
}

export default function Guestbook() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const guestId = localStorage.getItem("guestId");

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from("guestbook")
        .select(
          `
          id,
          content,
          created_at,
          guests (
            name,
            nickname
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const parsedEntries: GuestbookEntry[] = data.map((entry: any) => ({
          id: entry.id,
          name: entry.guests?.name || "게스트",
          nickname: entry.guests?.nickname || "게스트",
          message: entry.content,
          timestamp: new Date(entry.created_at),
        }));
        setEntries(parsedEntries);
      }
    } catch (err) {
      console.error("Error fetching guestbook entries", err);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchEntries();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || !guestId) return;

    try {
      const { error } = await supabase.from("guestbook").insert([
        {
          guest_id: guestId,
          content: message.trim(),
        },
      ]);

      if (error) throw error;

      setSubmitted(true);
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      console.error("Error submitting guestbook entry", err);
      alert("메시지 전송에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="h-screen bg-white pb-6">
      {/* <div className="h-full bg-white pb-6 overflow-y-scroll pb-[100px]"> */}
      <div className="h-screen overflow-y-scroll pb-[200px]">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm pt-4 pb-4">
          <div className="max-w-md mx-auto px-6">
            <button
              onClick={() => {
                // scrollRef.current?.scrollTo(0, 0)
                navigate(-1);
              }}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors flex w-fit"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>

        <div className="max-w-md mx-auto px-6 mb-6 mt-4">
          <div className="flex-1 pb-2 text-center">
            <h1 className="text-[26px] font-bold text-[#000000] mb-2">
              한마디 남기기
            </h1>
            <p className="font-medium text-lg text-gray-500 leading-relaxed whitespace-pre-line text-center">
              신랑 신부에게 축하 메시지를 남겨주세요
            </p>
          </div>
        </div>

        <div className="max-w-md mx-auto px-6 py-2">
          {/* Form */}
          {!submitted ? (
            <div className="bg-white rounded-[20px] p-6 mb-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    축하 메시지
                  </label>
                  <div>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="신랑 신부에게 전할 따뜻한 메시지를 남겨주세요"
                      rows={6}
                      className="w-full px-4 py-3 border-[0.75px] border-[#000000]/10 rounded-xl focus:bg-pink-50 focus:border-rose-200 focus:outline-none transition-colors resize-none bg-[#F4F4F5]"
                      required
                    />
                  </div>
                </div>

                <div className="h-2" />

                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="w-full px-[12px] py-[12px] bg-gradient-to-r from-rose-300 to-rose-400 text-white rounded-[12px] font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 border-[0.75px] border-transparent disabled:opacity-100 disabled:bg-none disabled:bg-[#F4F4F5] disabled:text-[#37383C]/28 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                  메시지 전송
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-[20px] p-8 text-center mb-6">
              <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Lottie animationData={checkAnimation} loop={false} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                메시지 전송 완료!
              </h2>
              <p className="text-gray-600">따뜻한 축하 메시지 감사합니다 💕</p>
            </div>
          )}

          {/* Recent Entries */}
          {entries.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-[#363638] flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-400" />
                최근 축하 메시지
              </h3>
              {entries.slice(0, 5).map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white rounded-[20px] p-4 border-[0.75px] border-black/10"
                  style={{
                    boxShadow:
                      "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex flex-row gap-[4px] items-end">
                        <p className="font-semibold text-base text-[#363638]">
                          {entry.name}
                        </p>
                        <p className="font-medium text-xs text-[#36363888] mb-[2px]">
                          {entry.nickname}
                        </p>
                      </div>
                      <p className="text-xs text-[#37383C]/50">
                        {new Date(entry.timestamp)
                          .toLocaleString("ko-KR", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })
                          .replace(
                            /(\d+)\. (\d+)\. (\d+)\. (\d+):(\d+)/,
                            "$1.$2.$3 $4:$5",
                          )}
                      </p>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {entry.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="pb-6"></div>
      </div>
    </div>
  );
}
