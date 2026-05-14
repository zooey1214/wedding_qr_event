import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ListMusic } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface BgmRequest {
  id: string;
  name: string;
  song: string;
  artist: string;
  timestamp: Date;
}

export default function AdminBgm() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<BgmRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("bgm")
        .select(
          `
          id,
          song,
          artist,
          created_at,
          guests (
            name,
            nickname
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const parsedRequests: BgmRequest[] = (data || []).map((entry: any) => ({
        id: entry.id,
        name: entry.guests?.name || entry.guests?.nickname || "게스트",
        song: entry.song,
        artist: entry.artist || "",
        timestamp: new Date(entry.created_at),
      }));

      setRequests(parsedRequests);
    } catch (err) {
      console.error("Error fetching bgm requests", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();

    const intervalId = window.setInterval(() => {
      fetchRequests();
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="min-h-[100dvh] bg-[#FFF8F9] text-gray-800 pb-10">
      <div className="sticky top-0 z-10 bg-[#FFF8F9]/90 backdrop-blur-sm pt-4 pb-4 border-b border-rose-100/70">
        <div className="max-w-3xl mx-auto px-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-white rounded-full transition-colors flex w-fit"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="w-10" />
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6">
          <p className="text-sm font-bold text-lime-600 mb-1">Admin</p>
          <h1 className="text-3xl font-black text-gray-900">BGM 재생목록</h1>
          <p className="text-gray-500 font-medium mt-2">
            하객들이 신청한 노래 목록입니다.
          </p>
        </div>

        <section className="bg-white rounded-[24px] border-[0.75px] border-black/10 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="px-5 py-4 border-b border-black/10 flex items-center justify-between">
            <h2 className="font-bold text-[#363638] flex items-center gap-2">
              <ListMusic className="w-5 h-5 text-lime-500" />
              재생 목록
            </h2>
            <span className="text-sm font-bold text-lime-600 bg-lime-50 border border-lime-200 px-2.5 py-1 rounded-full">
              {requests.length}곡
            </span>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-gray-500 font-medium">
              불러오는 중...
            </div>
          ) : requests.length === 0 ? (
            <div className="p-8 text-center text-gray-500 font-medium">
              아직 신청된 BGM이 없습니다.
            </div>
          ) : (
            <div className="divide-y divide-[#000000]/10">
              {requests.map((request, index) => (
                <div key={request.id} className="p-4 flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-lime-400 to-lime-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#363638] truncate">
                      {request.song}
                    </p>
                    {request.artist && (
                      <p className="text-sm text-gray-600 truncate">
                        {request.artist}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-block px-1.5 py-[2px] bg-lime-400/20 text-lime-600 text-xs rounded font-medium">
                        신청자 {request.name}
                      </span>
                      <span className="inline-block px-1.5 py-[2px] bg-gray-100 text-gray-500 text-xs rounded font-medium">
                        {request.timestamp
                          .toLocaleString("ko-KR", {
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })
                          .replace(/(\d+)\. (\d+)\. (\d+):(\d+)/, "$1.$2 $3:$4")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
