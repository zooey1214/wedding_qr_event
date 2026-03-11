import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Link as LinkIcon, Gift, Trophy, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
type UserData = {
  id: string;
  name: string;
  nickname: string;
  table_no: string;
  missions: Record<number, string | null>;
  missionPhotos: Record<number, string | null>;
  secretWord: string;
  qrLink: string;
};

export default function Event() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Photo Modal State
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);

  // Modal Form State
  const [newName, setNewName] = useState("");
  const [newNickname, setNewNickname] = useState("");
  const [newTableNo, setNewTableNo] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loadUsers = async () => {
    const { data: guestsData, error: guestsError } = await supabase
      .from("guests")
      .select(
        `
        id,
        name,
        nickname,
        table_no,
        secret_words (
          title
        ),
        guest_missions (
          mission_id,
          is_completed,
          mission_image
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (guestsError) {
      console.error(guestsError);
      return;
    }

    const formattedUsers: UserData[] = (guestsData || []).map((guest: any) => {
      const missions: Record<number, string | null> = {
        1: null,
        2: null,
        3: null,
        4: null,
        5: null,
        6: null,
      };
      const missionPhotos: Record<number, string | null> = {};

      guest.guest_missions?.forEach((gm: any) => {
        if (gm.is_completed || gm.mission_image) {
          missions[gm.mission_id] = "O";
        }
        if (gm.mission_image) {
          missionPhotos[gm.mission_id] = gm.mission_image;
        }
      });

      return {
        id: guest.id,
        name: guest.name || "",
        nickname: guest.nickname || "",
        table_no: guest.table_no || "",
        missions,
        missionPhotos,
        secretWord: guest.secret_words?.title || "지정 안됨",
        qrLink: `http://localhost:5173/${guest.id}`,
      };
    });

    setUsers(formattedUsers);
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newNickname.trim() || !newTableNo.trim()) return;

    setIsLoading(true);

    try {
      const { data: guestData, error: guestError } = await supabase
        .from("guests")
        .insert([
          { name: newName, nickname: newNickname, table_no: newTableNo },
        ])
        .select()
        .single();

      if (guestError) throw guestError;

      const guestId = guestData.id;

      const missionsToInsert = [1, 2, 3, 4, 5, 6].map((missionId) => ({
        guest_id: guestId,
        mission_id: missionId,
        is_completed: false,
      }));

      const { error: missionError } = await supabase
        .from("guest_missions")
        .insert(missionsToInsert);

      if (missionError) throw missionError;

      await loadUsers();

      setIsModalOpen(false);
      setNewName("");
      setNewNickname("");
      setNewTableNo("");
    } catch (err) {
      console.error("Error adding guest:", err);
      alert("하객 추가 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const openPhotoModal = (photoUrl: string) => {
    setCurrentPhoto(photoUrl);
    setPhotoModalOpen(true);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="min-h-[100dvh] bg-[#FFF8F9] p-4 text-gray-800">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header Title & Actions */}
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl pt-2 font-bold text-gray-900 tracking-tight">
            어드민 대시보드
          </h1>
          <div className="flex flex-wrap justify-end gap-3">
            <button
              onClick={() => navigate("/event/lottery")}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-rose-300 rounded-[12px] text-sm font-bold text-rose-500 hover:bg-rose-50 hover:-translate-y-0.5 active:scale-[0.98] transition-all shadow-sm"
            >
              <Gift className="w-4 h-4" />
              일반 추첨
            </button>
            <button
              onClick={() => navigate("/event/first-prize")}
              className="flex items-center gap-2 px-4 py-2.5 bg-lime-500 border border-lime-400 text-white rounded-[12px] text-sm font-bold hover:bg-lime-600 hover:-translate-y-0.5 active:scale-[0.98] transition-all shadow-[0_4px_12px_rgba(132,204,22,0.3)] whitespace-nowrap"
            >
              <Trophy className="w-4 h-4" />
              1등상 추첨
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-400 text-white border border-rose-400 rounded-[12px] text-sm font-bold hover:bg-rose-500 hover:-translate-y-0.5 active:scale-[0.98] transition-all shadow-[0_4px_12px_rgba(247,50,149,0.3)] whitespace-nowrap"
            >
              <Plus className="w-4 h-4" strokeWidth={3} />
              하객 추가
            </button>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-[20px] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] border border-rose-100 flex flex-wrap divide-y sm:divide-y-0 sm:divide-x divide-rose-100">
          <div className="flex-1 min-w-[200px] p-6 lg:p-8">
            <div className="text-xs text-rose-400 font-bold mb-1">
              총 하객 수
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {users.length}
            </div>
            <div className="text-[11px] text-lime-700 font-bold mt-1 tracking-wide bg-lime-50 inline-block px-1.5 py-0.5 rounded border border-lime-200/50">
              +1명 최근 추가됨
            </div>
          </div>
          <div className="flex-1 min-w-[200px] p-6 lg:p-8">
            {/* <div className="flex-1 min-w-[200px] p-6 lg:p-8 border-t sm:border-t-0 border-rose-100"> */}
            <div className="text-xs text-rose-400 font-bold mb-1">
              현재까지 업로드된 사진
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {users.reduce(
                (acc, user) => acc + Object.keys(user.missionPhotos).length,
                0,
              )}
            </div>
            <div className="text-[11px] text-lime-700 font-bold mt-1 tracking-wide bg-lime-50 inline-block px-1.5 py-0.5 rounded border border-lime-200/50">
              미션 진행중
            </div>
          </div>
          <div className="flex-1 min-w-[200px] p-6 lg:p-8">
            {/* <div className="flex-1 min-w-[200px] p-6 lg:p-8 border-t sm:border-t-0 sm:border-l lg:border-l-0 border-rose-100 xl:border-l xl:border-rose-100"> */}
            <div className="text-xs text-rose-400 font-bold mb-1">
              미션 참여 하객 수
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {
                users.filter((u) =>
                  Object.values(u.missions).some((m) => m !== null),
                ).length
              }
            </div>
            <div className="text-[11px] text-lime-700 font-bold mt-1 tracking-wide bg-lime-50 inline-block px-1.5 py-0.5 rounded border border-lime-200/50">
              1개 이상 미션 완료
            </div>
          </div>
          <div className="flex-1 min-w-[200px] p-6 lg:p-8 border-t sm:border-t-0 border-rose-100">
            <div className="text-xs text-rose-400 font-bold mb-1">
              미션 완주 하객 수
            </div>
            <div className="text-3xl font-bold text-lime-600">
              {
                users.filter((u) =>
                  [1, 2, 3, 4, 5, 6].every((m) => u.missions[m] !== null),
                ).length
              }
            </div>
            <div className="text-[11px] text-lime-700 font-bold mt-1 tracking-wide bg-lime-50 inline-block px-1.5 py-0.5 rounded border border-lime-200/50">
              모든 미션 완료
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-[20px] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] border border-rose-100 overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm whitespace-nowrap min-w-max">
              <thead
                className="bg-rose-50/30 border-b border-rose-100/80 text-[13px] text-rose-400  tracking-wider"
                style={{ fontWeight: 700 }}
              >
                <tr>
                  <th className="font-[00] px-6 py-4 ">하객 정보</th>
                  <th className="font-[00] px-4 py-4 text-center">식사 자리</th>
                  <th className="font-[00] px-3 py-4 text-center">미션 1</th>
                  <th className="font-[00] px-3 py-4 text-center">미션 2</th>
                  <th className="font-[00] px-3 py-4 text-center">미션 3</th>
                  <th className="font-[00] px-3 py-4 text-center">미션 4</th>
                  <th className="font-[00] px-3 py-4 text-center">미션 5</th>
                  <th className="font-[00] px-3 py-4 text-center">미션 6</th>
                  <th className="font-[00] px-6 py-4">비밀의 단어</th>
                  <th className="font-[00] px-6 py-4">QR 링크</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50 text-gray-600 bg-white">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-rose-50/40 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="font-bold text-gray-900 text-[15px]">
                          {user.name}
                        </div>
                        <div className="text-xs text-rose-400">
                          {user.nickname}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-[6px] text-xs border border-rose-100 whitespace-nowrap">
                        {user.table_no}
                      </span>
                    </td>
                    {[1, 2, 3, 4, 5, 6].map((m) => {
                      const score = user.missions[m];
                      const photo = user.missionPhotos[m];
                      return (
                        <td key={m} className="px-3 py-4 text-center font-mono">
                          {score !== null ? (
                            photo ? (
                              <button
                                onClick={() => openPhotoModal(photo)}
                                className="text-lime-600 font-bold underline decoration-lime-300 underline-offset-4 hover:text-lime-700 hover:decoration-lime-500 transition-colors"
                                title="사진 보기"
                              >
                                {score}
                              </button>
                            ) : (
                              <span className="text-gray-900 font-bold">
                                {score}
                              </span>
                            )
                          ) : (
                            <span className="text-gray-300 font-bold">x</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-[6px] text-xs font-bold bg-white text-gray-700 border border-rose-200 shadow-sm">
                        {user.secretWord}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 max-w-[160px]">
                        <span
                          className="text-gray-500 font-mono text-xs truncate bg-gray-50 px-2 py-1 rounded flex-1 border border-gray-100"
                          title={user.qrLink}
                        >
                          {user.qrLink}
                        </span>
                        <button
                          className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-[6px] transition-colors border border-transparent hover:border-rose-100"
                          title="링크 복사"
                        >
                          <LinkIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Photo Modal */}
      {photoModalOpen && currentPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-2 pb-6 max-w-[400px] w-full flex flex-col items-center">
            <div className="w-full flex justify-end">
              <button
                onClick={() => setPhotoModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-2 rounded-full transition-colors mb-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <img
              src={currentPhoto}
              alt="Mission Photo"
              className="w-[300px] h-[300px] object-cover rounded-[16px] mb-6 shadow-sm border border-gray-100"
            />
            <button
              onClick={() => setPhotoModalOpen(false)}
              className="px-8 py-3 bg-white border border-rose-300 text-rose-500 rounded-[14px] font-bold text-sm shadow-sm hover:bg-rose-50 active:scale-[0.98] transition-all"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* Modal for Adding Guest */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-rose-100 flex justify-between items-center bg-rose-50/30">
              <h2 className="text-lg font-bold text-gray-900">새 하객 추가</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-100 p-1.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddGuest} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 ml-1">
                  이름
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="예: 홍길동"
                  className="w-full px-4 py-3 border border-gray-200 rounded-[12px] text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400 bg-gray-50 focus:bg-white transition-colors placeholder:text-gray-400 font-medium"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 ml-1">
                  닉네임
                </label>
                <input
                  type="text"
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  placeholder="예: 짱구"
                  className="w-full px-4 py-3 border border-gray-200 rounded-[12px] text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400 bg-gray-50 focus:bg-white transition-colors placeholder:text-gray-400 font-medium"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 ml-1">
                  식사 자리
                </label>
                <input
                  type="text"
                  value={newTableNo}
                  onChange={(e) => setNewTableNo(e.target.value)}
                  placeholder="예: 2층 창가"
                  className="w-full px-4 py-3 border border-gray-200 rounded-[12px] text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400 bg-gray-50 focus:bg-white transition-colors placeholder:text-gray-400 font-medium"
                  required
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-white border border-rose-200 text-rose-500 rounded-[12px] font-bold hover:bg-rose-50 hover:-translate-y-0.5 active:scale-[0.98] active:bg-rose-50 transition-all shadow-sm"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-[2] py-3 bg-rose-400 text-white rounded-[12px] font-bold shadow-[0_4px_12px_rgba(247,50,149,0.3)] hover:-translate-y-0.5 active:scale-[0.98] transition-all border-[0.75px] border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "생성 중..." : "하객 생성"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
