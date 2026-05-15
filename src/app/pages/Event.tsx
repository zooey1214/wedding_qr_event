import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Plus,
  Link as LinkIcon,
  Gift,
  Trophy,
  X,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Download,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import QRCode from "react-qr-code";

type UserData = {
  id: string;
  name: string;
  nickname: string;
  table_no: string;
  missions: Record<number, string | null>;
  missionPhotos: Record<number, string | null>;
  secretWordId: string | null;
  secretWord: string;
  contributionAmount: number;
  qrLink: string;
};

type SecretWordOption = {
  id: string;
  title: string;
  assigned_count: number;
  max_count: number;
};

const ACTIVE_MISSION_IDS = [1, 2, 3, 5, 6];

const QR_PRINT_GROUPS = [
  { label: "1그룹", names: ["한드레", "한헤세", "장서영"] },
  { label: "2그룹", names: ["이웅희", "최다민", "최태백", "정수정"] },
  { label: "3그룹", names: ["전준혁", "전준호"] },
  { label: "4그룹", names: ["진승재", "이정윤"] },
  { label: "5그룹", names: ["오승제", "김규리"] },
  { label: "6그룹", names: ["정성호", "민혜리", "정하진"] },
  { label: "7그룹", names: ["노승현", "신희라"] },
  {
    label: "8그룹",
    names: [
      "정성만",
      "권택례",
      "이형구",
      "권택자",
      "윤재돈",
      "권옥주",
      "권택근",
      "강혜경",
      "권찬희",
      "손송이",
    ],
  },
  {
    label: "9그룹",
    names: ["이상홍", "김미애", "유영민", "이서정", "이상원", "이원희", "유하영"],
  },
  {
    label: "10그룹 (신부 친가)",
    names: ["송태경", "오재덕", "송휘용", "송휘용아내"],
  },
  {
    label: "11그룹 (신부 외가)",
    names: ["이봉준", "박주익", "이명진", "이상호", "정춘금"],
  },
  { label: "12그룹", names: ["이태민", "오예슬"] },
] as const;

const QR_CARDS_PER_PAGE = 4;

type QrPrintUser = UserData & {
  qrPrintGroupLabel: string;
  qrPrintGroupIndex: number;
  qrPrintNameIndex: number;
};

const qrPrintGroupByName = QR_PRINT_GROUPS.reduce(
  (acc, group, groupIndex) => {
    group.names.forEach((name, nameIndex) => {
      acc.set(name, {
        label: group.label,
        groupIndex,
        nameIndex,
      });
    });
    return acc;
  },
  new Map<
    string,
    {
      label: string;
      groupIndex: number;
      nameIndex: number;
    }
  >(),
);

const getQrPrintUsers = (users: UserData[]): QrPrintUser[] =>
  users
    .map((user, originalIndex) => {
      const groupInfo = qrPrintGroupByName.get(user.name.trim());

      return {
        ...user,
        qrPrintGroupLabel: groupInfo?.label || "ㄱ-ㅎ",
        qrPrintGroupIndex: groupInfo?.groupIndex ?? QR_PRINT_GROUPS.length,
        qrPrintNameIndex: groupInfo?.nameIndex ?? originalIndex,
      };
    })
    .sort((a, b) => {
      if (a.qrPrintGroupIndex !== b.qrPrintGroupIndex) {
        return a.qrPrintGroupIndex - b.qrPrintGroupIndex;
      }

      if (a.qrPrintGroupIndex < QR_PRINT_GROUPS.length) {
        if (a.qrPrintNameIndex !== b.qrPrintNameIndex) {
          return a.qrPrintNameIndex - b.qrPrintNameIndex;
        }
      }

      const nameSort = a.name.localeCompare(b.name, "ko-KR");
      if (nameSort !== 0) return nameSort;

      return a.nickname.localeCompare(b.nickname, "ko-KR");
    });

const chunkQrPrintUsers = (users: QrPrintUser[]) =>
  Array.from({ length: Math.ceil(users.length / QR_CARDS_PER_PAGE) }, (_, index) =>
    users.slice(index * QR_CARDS_PER_PAGE, (index + 1) * QR_CARDS_PER_PAGE),
  );

export default function Event() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [qrModalUser, setQrModalUser] = useState<UserData | null>(null);
  const [isQrPrintMode, setIsQrPrintMode] = useState(false);

  // Photo Modal State
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);

  // Modal Form State
  const [newName, setNewName] = useState("");
  const [newNickname, setNewNickname] = useState("");
  const [newTableNo, setNewTableNo] = useState("");
  const [selectedSecretWordId, setSelectedSecretWordId] = useState("auto");
  const [secretWordOptions, setSecretWordOptions] = useState<
    SecretWordOption[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  type SortConfig = { key: keyof UserData | null; direction: "asc" | "desc" };
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "asc",
  });

  const handleSort = (key: keyof UserData) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const key = sortConfig.key;
    if (a[key] < b[key]) return sortConfig.direction === "asc" ? -1 : 1;
    if (a[key] > b[key]) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const searchKeywords = searchTerm
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);

  const filteredAndSortedUsers =
    searchKeywords.length === 0
      ? sortedUsers
      : sortedUsers.filter((user) =>
          searchKeywords.some((keyword) =>
            [
              user.name,
              user.nickname,
              user.table_no,
              user.secretWord,
              String(user.contributionAmount),
            ].some((field) => field.includes(keyword)),
          ),
        );

  const totalContributionAmount = users.reduce(
    (sum, user) => sum + user.contributionAmount,
    0,
  );
  const qrPrintUsers = getQrPrintUsers(users);
  const qrPrintPages = chunkQrPrintUsers(qrPrintUsers);

  const formatWon = (amount: number) => amount.toLocaleString("ko-KR");

  const loadUsers = async () => {
    const { data: guestsData, error: guestsError } = await supabase
      .from("guests")
      .select(
        `
        id,
        name,
        nickname,
        table_no,
        contribution_amount,
        secret_word_id,
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
        5: null,
        6: null,
      };
      const missionPhotos: Record<number, string | null> = {};

      guest.guest_missions?.forEach((gm: any) => {
        if (!ACTIVE_MISSION_IDS.includes(gm.mission_id)) return;
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
        secretWordId: guest.secret_word_id || null,
        secretWord: guest.secret_words?.title || "지정 안됨",
        contributionAmount: Number(guest.contribution_amount || 0),
        qrLink: `${window.location.origin}/?guestId=${guest.id}`,
      };
    });

    setUsers(formattedUsers);
  };

  const loadSecretWords = async () => {
    const { data, error } = await supabase
      .from("secret_words")
      .select("id, title, assigned_count, max_count")
      .order("id", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setSecretWordOptions(data || []);
  };

  const handleUpdateGuestSecretWord = async (
    user: UserData,
    nextSecretWordId: string,
  ) => {
    const previousSecretWordId = user.secretWordId;
    const normalizedNextSecretWordId =
      nextSecretWordId === "none" ? null : nextSecretWordId;

    if (previousSecretWordId === normalizedNextSecretWordId) return;

    try {
      const { error } = await supabase
        .from("guests")
        .update({ secret_word_id: normalizedNextSecretWordId })
        .eq("id", user.id);

      if (error) throw error;

      const nextOptions = secretWordOptions.map((word) => {
        if (word.id === previousSecretWordId) {
          return {
            ...word,
            assigned_count: Math.max(0, word.assigned_count - 1),
          };
        }
        if (word.id === normalizedNextSecretWordId) {
          return {
            ...word,
            assigned_count: word.assigned_count + 1,
          };
        }
        return word;
      });

      setSecretWordOptions(nextOptions);

      await Promise.all(
        nextOptions
          .filter(
            (word) =>
              word.id === previousSecretWordId ||
              word.id === normalizedNextSecretWordId,
          )
          .map((word) =>
            supabase
              .from("secret_words")
              .update({ assigned_count: word.assigned_count })
              .eq("id", word.id),
          ),
      );

      await loadUsers();
      await loadSecretWords();
    } catch (err) {
      console.error("Error updating guest secret word:", err);
      alert("비밀의 단어 변경 중 오류가 발생했습니다.");
    }
  };

  const handleUpdateContributionAmount = async (user: UserData) => {
    const nextValue = window.prompt(
      `${user.name}님의 축의금을 입력해주세요.`,
      user.contributionAmount ? String(user.contributionAmount) : "",
    );

    if (nextValue === null) return;

    const normalizedValue = Number(nextValue.replaceAll(",", "").trim() || 0);

    if (!Number.isFinite(normalizedValue) || normalizedValue < 0) {
      alert("축의금은 0 이상의 숫자로 입력해주세요.");
      return;
    }

    const amount = Math.floor(normalizedValue);

    try {
      const { error } = await supabase
        .from("guests")
        .update({ contribution_amount: amount })
        .eq("id", user.id);

      if (error) throw error;

      setUsers((prevUsers) =>
        prevUsers.map((prevUser) =>
          prevUser.id === user.id
            ? { ...prevUser, contributionAmount: amount }
            : prevUser,
        ),
      );
    } catch (err) {
      console.error("Error updating contribution amount:", err);
      alert("축의금 수정 중 오류가 발생했습니다.");
    }
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newNickname.trim() || !newTableNo.trim()) return;

    setIsLoading(true);

    try {
      // 1. Secret Word 할당 로직
      let selectedWordId = null;
      const { data: wordsData } = await supabase
        .from("secret_words")
        .select("id, assigned_count, max_count")
        .order("id", { ascending: true }); // ID 순으로 오름차순 정렬

      if (selectedSecretWordId !== "auto") {
        const selectedWord = wordsData?.find(
          (word: any) => word.id === selectedSecretWordId,
        );

        if (!selectedWord) {
          throw new Error("선택한 비밀의 단어를 찾을 수 없습니다.");
        }

        selectedWordId = selectedWord.id;
        await supabase
          .from("secret_words")
          .update({ assigned_count: selectedWord.assigned_count + 1 })
          .eq("id", selectedWord.id);
      } else if (wordsData) {
        // 아직 인원(max_count)이 다 안 찬 단어들만 필터링
        const availableWords = wordsData.filter(
          (w: any) => w.assigned_count < w.max_count,
        );

        if (availableWords.length > 0) {
          // 연속해서 온 사람들이 너무 뭉치지 않도록, 앞에서부터 최대 10개의 단어를 풀(Pool)로 지정
          const poolSize = 10;
          const targetPool = availableWords.slice(0, poolSize);

          // 그 10개(또는 남은 개수) 안에서 랜덤으로 하나 선택
          const randomIndex = Math.floor(Math.random() * targetPool.length);
          const selectedWord = targetPool[randomIndex];
          selectedWordId = selectedWord.id;

          // 해당 단어의 할당 카운트 증가
          await supabase
            .from("secret_words")
            .update({ assigned_count: selectedWord.assigned_count + 1 })
            .eq("id", selectedWord.id);
        }
      }

      // 2. 게스트 생성
      const { data: guestData, error: guestError } = await supabase
        .from("guests")
        .insert([
          {
            name: newName,
            nickname: newNickname,
            table_no: newTableNo,
            contribution_amount: 0,
            secret_word_id: selectedWordId,
          },
        ])
        .select()
        .single();

      if (guestError) throw guestError;

      const guestId = guestData.id;

      const missionsToInsert = ACTIVE_MISSION_IDS.map((missionId) => ({
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
      setSelectedSecretWordId("auto");
      await loadSecretWords();
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

  const handleDownloadQrPdf = () => {
    if (users.length === 0) {
      alert("출력할 하객 데이터가 없습니다.");
      return;
    }

    const originalTitle = document.title;
    document.title = `wedding_qr_${new Date().toISOString().slice(0, 10)}`;
    setIsQrPrintMode(true);

    const handleAfterPrint = () => {
      document.title = originalTitle;
      setIsQrPrintMode(false);
      window.removeEventListener("afterprint", handleAfterPrint);
    };

    window.addEventListener("afterprint", handleAfterPrint);
    window.setTimeout(() => window.print(), 100);
  };

  useEffect(() => {
    loadUsers();
    loadSecretWords();
  }, []);

  return (
    <div className="min-h-[100dvh] bg-[#FFF8F9] p-4 text-gray-800">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header Title & Actions */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl pt-2 font-bold text-gray-900 tracking-tight whitespace-nowrap">
              어드민 대시보드
            </h1>
            <input
              type="text"
              placeholder="이름, 닉네임, 키워드 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-2 px-4 py-2 border border-rose-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400 bg-white min-w-[250px]"
            />
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            <button
              onClick={handleDownloadQrPdf}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-[12px] text-sm font-bold hover:bg-indigo-100 hover:-translate-y-0.5 active:scale-[0.98] transition-all whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              QR PDF 다운로드
            </button>
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
                  ACTIVE_MISSION_IDS.every((m) => u.missions[m] !== null),
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
                  <th
                    className="font-[00] px-6 py-4 cursor-pointer hover:bg-rose-100/50 transition-colors select-none"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-1">
                      하객 정보
                      {sortConfig.key === "name" ? (
                        sortConfig.direction === "asc" ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-30" />
                      )}
                    </div>
                  </th>
                  <th className="font-[00] px-4 py-4 text-center">식사 자리</th>
                  <th className="font-[00] px-3 py-4 text-center">미션 1</th>
                  <th className="font-[00] px-3 py-4 text-center">미션 2</th>
                  <th className="font-[00] px-3 py-4 text-center">미션 3</th>
                  <th className="font-[00] px-3 py-4 text-center">미션 5</th>
                  <th className="font-[00] px-3 py-4 text-center">미션 6</th>
                  <th
                    className="font-[00] px-6 py-4 cursor-pointer hover:bg-rose-100/50 transition-colors select-none"
                    onClick={() => handleSort("secretWord")}
                  >
                    <div className="flex items-center gap-1">
                      비밀의 단어
                      {sortConfig.key === "secretWord" ? (
                        sortConfig.direction === "asc" ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-30" />
                      )}
                    </div>
                  </th>
                  <th className="font-[00] px-6 py-4 text-center">
                    <div>축의금</div>
                    <div className="text-[11px] text-rose-500">
                      ({formatWon(totalContributionAmount)}원)
                    </div>
                  </th>
                  <th className="font-[00] px-6 py-4">QR 링크</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50 text-gray-600 bg-white">
                {filteredAndSortedUsers.map((user) => (
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
                    {ACTIVE_MISSION_IDS.map((m) => {
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
                      <select
                        value={user.secretWordId || "none"}
                        onChange={(e) =>
                          handleUpdateGuestSecretWord(user, e.target.value)
                        }
                        className="max-w-[180px] px-2.5 py-1 rounded-[6px] text-xs font-bold bg-white text-gray-700 border border-rose-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400"
                      >
                        <option value="none">지정 안됨</option>
                        {secretWordOptions.map((word) => (
                          <option key={word.id} value={word.id}>
                            {word.title} ({word.assigned_count}/{word.max_count})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleUpdateContributionAmount(user)}
                        className="min-w-[92px] px-3 py-1.5 rounded-[8px] border border-lime-200 bg-lime-50 text-lime-700 text-xs font-bold hover:bg-lime-100 hover:border-lime-300 transition-colors"
                        title="축의금 수정"
                      >
                        {formatWon(user.contributionAmount)}원
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 max-w-[160px]">
                        <button
                          onClick={() => setQrModalUser(user)}
                          className="px-3 py-1.5 bg-rose-50 text-rose-500 rounded-[8px] text-xs font-bold hover:bg-rose-100 transition-colors border border-rose-100 whitespace-nowrap"
                        >
                          QR 보기
                        </button>
                        <button
                          onClick={async () => {
                            await navigator.clipboard.writeText(user.qrLink);
                            alert("복사완료");
                          }}
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

      {/* QR Modal */}
      {qrModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-8 max-w-[400px] w-full flex flex-col items-center relative">
            <button
              onClick={() => setQrModalUser(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-2 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{qrModalUser.name} 님</h2>
            <div className="bg-rose-50 px-4 py-2 rounded-full text-rose-600 font-bold mb-8">
              식사자리: {qrModalUser.table_no}
            </div>
            <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
              <QRCode value={qrModalUser.qrLink} size={200} />
            </div>
            <p className="text-sm text-gray-500 mb-6 break-all text-center">
              {qrModalUser.qrLink}
            </p>
            <button
              onClick={() => setQrModalUser(null)}
              className="w-full py-3.5 bg-rose-500 text-white rounded-[14px] font-bold text-[15px] shadow-sm hover:bg-rose-600 active:scale-[0.98] transition-all"
            >
              닫기
            </button>
          </div>
        </div>
      )}

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
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 ml-1">
                  비밀의 단어
                </label>
                <select
                  value={selectedSecretWordId}
                  onChange={(e) => setSelectedSecretWordId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-[12px] text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400 bg-gray-50 focus:bg-white transition-colors font-medium"
                >
                  <option value="auto">자동 배정</option>
                  {secretWordOptions.map((word) => (
                    <option key={word.id} value={word.id}>
                      {word.title} ({word.assigned_count}/{word.max_count})
                    </option>
                  ))}
                </select>
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

      {isQrPrintMode && (
        <div className="qr-print-area">
          <style>
            {`
              @media screen {
                .qr-print-area {
                  display: none;
                }
              }

              @media print {
                @page {
                  size: A4 portrait;
                  margin: 10mm;
                }

                body * {
                  visibility: hidden !important;
                }

                .qr-print-area,
                .qr-print-area * {
                  visibility: visible !important;
                }

                .qr-print-area {
                  display: block !important;
                  position: absolute;
                  inset: 0;
                  width: 190mm;
                  background: #ffffff;
                  color: #111827;
                  font-family: Arial, sans-serif;
                }

                .qr-print-page {
                  display: grid;
                  grid-template-columns: repeat(2, 1fr);
                  grid-template-rows: repeat(2, 1fr);
                  gap: 8mm;
                  width: 190mm;
                  height: 277mm;
                  break-after: page;
                  page-break-after: always;
                }

                .qr-print-page:last-child {
                  break-after: auto;
                  page-break-after: auto;
                }

                .qr-print-card {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  min-height: 0;
                  border: 1px solid #e5e7eb;
                  border-radius: 6mm;
                  padding: 8mm;
                  box-sizing: border-box;
                }

                .qr-print-group {
                  align-self: flex-start;
                  margin-bottom: 4mm;
                  border: 1px solid #fecdd3;
                  border-radius: 999px;
                  padding: 1.5mm 3mm;
                  color: #be123c;
                  font-size: 9pt;
                  font-weight: 700;
                }

                .qr-print-name {
                  margin: 0 0 2mm;
                  font-size: 20pt;
                  font-weight: 800;
                  line-height: 1.15;
                }

                .qr-print-nickname,
                .qr-print-table {
                  margin: 0;
                  font-size: 10pt;
                  color: #4b5563;
                  line-height: 1.4;
                }

                .qr-print-code {
                  margin: 6mm 0 4mm;
                }

                .qr-print-link {
                  width: 100%;
                  margin: 0;
                  font-size: 7pt;
                  line-height: 1.35;
                  color: #6b7280;
                  text-align: center;
                  word-break: break-all;
                }
              }
            `}
          </style>

          {qrPrintPages.map((pageUsers, pageIndex) => (
            <section className="qr-print-page" key={pageIndex}>
              {pageUsers.map((user) => (
                <article className="qr-print-card" key={user.id}>
                  <div className="qr-print-group">{user.qrPrintGroupLabel}</div>
                  <h2 className="qr-print-name">{user.name}</h2>
                  {user.nickname && (
                    <p className="qr-print-nickname">{user.nickname}</p>
                  )}
                  {user.table_no && (
                    <p className="qr-print-table">식사자리: {user.table_no}</p>
                  )}
                  <div className="qr-print-code">
                    <QRCode value={user.qrLink} size={150} />
                  </div>
                  <p className="qr-print-link">{user.qrLink}</p>
                </article>
              ))}
            </section>
          ))}
        </div>
      )}

    </div>
  );
}
