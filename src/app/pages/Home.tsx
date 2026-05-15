import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  CalendarClock,
  ChevronRight,
  Ticket,
  BookHeart,
  Music,
  X,
} from "lucide-react";
import { MISSIONS } from "../types/mission";
import { Icon1 } from "../../components/icons/Icon1";
import { Icon2 } from "../../components/icons/Icon2";
import { Icon4 } from "../../components/icons/Icon4";
import { Icon5 } from "../../components/icons/Icon5";
import { Icon6 } from "../../components/icons/Icon6";

import { supabase } from "../../lib/supabase";

const WEDDING_PROGRAM = [
  { title: "식 전 이벤트" },
  { title: "개식 선언 및 인삿말" },
  { title: "양가 부모님 입장 및 인사" },
  { title: "신랑 입장" },
  { title: "신부 입장" },
  { title: "신랑 신부 맞절" },
  {
    title: "주례 및 혼인 서약",
    scripture: {
      reference: "창세기 2 : 22-25",
      verses: [
        {
          number: 22,
          text: "주 하나님이 남자에게서 뽑아 낸 갈빗대로 여자를 만드시고, 여자를 남자에게로 데리고 오셨다.",
        },
        {
          number: 23,
          text: '그 때에 그 남자가 말하였다. "이제야 나타났구나, 이 사람! 뼈도 나의 뼈, 살도 나의 살, 남자에게서 나왔으니 여자라고 부를 것이다."',
        },
        {
          number: 24,
          text: "그러므로 남자는 아버지와 어머니를 떠나, 아내와 결합하여 한 몸을 이루는 것이다.",
        },
        {
          number: 25,
          text: "남자와 그 아내가 둘 다 벌거벗고 있었으나, 부끄러워하지 않았다.",
        },
      ],
    },
  },
  { title: "성혼 선언" },
  { title: "축가" },
  { title: "축하 편지 낭독" },
  { title: "신랑 신부 인사" },
  { title: "신랑 신부 행진" },
  { title: "사진 촬영 안내" },
];

const getMissionIcon = (missionId: number) => {
  if (missionId === 1) return Icon6;
  if (missionId === 2) return Icon1;
  if (missionId === 3) return Icon2;
  if (missionId === 5) return Icon4;
  return Icon5;
};

export default function Home() {
  const [searchParams] = useSearchParams();
  const urlGuestId = searchParams.get("guestId");
  const [completedMissions, setCompletedMissions] = useState<number[]>([]);
  const [tickets, setTickets] = useState(0);
  const [guestName, setGuestName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isValidGuest, setIsValidGuest] = useState(false);
  const [isProgramOpen, setIsProgramOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null); // Ref 생성
  const navigate = useNavigate();

  useEffect(() => {
    async function loadGuestData() {
      // 1. Check for valid ID from URL or localStorage
      const activeGuestId = urlGuestId || localStorage.getItem("guestId");

      if (!activeGuestId) {
        setIsLoading(false);
        setIsValidGuest(false);
        return;
      }

      // Save it temporarily so other pages can still use the localstorage if they didn't migrate yet
      if (urlGuestId) {
        localStorage.clear();
        localStorage.setItem("guestId", urlGuestId);
      }

      try {
        // 2. Verify guest existence
        const { data: guestData, error: guestError } = await supabase
          .from("guests")
          .select("name, secret_word_id")
          .eq("id", activeGuestId)
          .single();

        if (guestError || !guestData) {
          setIsLoading(false);
          setIsValidGuest(false);
          return;
        }

        setGuestName(guestData.name || "게스트");
        setIsValidGuest(true);

        // 3. Load completed missions and tickets length
        const [missionsRes, ticketsRes] = await Promise.all([
          supabase
            .from("guest_missions")
            .select("mission_id")
            .eq("guest_id", activeGuestId)
            .eq("is_completed", true),
          supabase
            .from("lottery_tickets")
            .select("id", { count: "exact" })
            .eq("guest_id", activeGuestId),
        ]);

        if (missionsRes.data) {
          setCompletedMissions(missionsRes.data.map((m: any) => m.mission_id));
        }
        if (ticketsRes.count !== null) {
          setTickets(ticketsRes.count);
        }
      } catch (err) {
        console.error("Error loading guest data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadGuestData();
  }, [urlGuestId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8F9]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-400 rounded-full animate-spin"></div>
          <p className="text-rose-400 font-medium text-sm">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isValidGuest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8F9]">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-3xl font-bold text-gray-800">404</h1>
          <p className="text-gray-600 font-medium">
            유효하지 않은 접근이거나
            <br />
            없는 하객 정보입니다.
          </p>
        </div>
      </div>
    );
  }

  const completionRate = Math.round(
    (completedMissions.length / MISSIONS.length) * 100,
  );

  return (
    <div
      className="w-screen flex flex-col items-center h-screen bg-gradient-to-b from-[#FFF0F5] from-[20%] to-white to-[65%] fixed overflow-y-scroll px-[16px] pb-[100px]"
      ref={scrollRef}
    >
      {/* <div className="w-full h-full ">

      </div> */}

      {/* Header */}
      <div className="flex flex-col w-full bg-transparent">
        <div className="flex flex-1  flex-col self-start w-[100%] px-[16px] py-8 pt-[80px] text-left">
          <p className="text-[26px] font-bold text-[#000000] whitespace-pre-line leading-snug">
            안녕하세요, {guestName}님{"\n"}
            경품 미션에 도전해보세요 :)
          </p>
          <p className="mt-2 font-medium text-lg text-gray-500">
            완료한 스탬프만큼 추첨권을 드려요
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto py-6 pt-2">
        {/* Mission Stamps Grid */}
        <div className="mb-14">
          <div className="relative w-full pl-[2%] pr-[2%] py-8 my-2 flex justify-center">
            <div className="relative w-full aspect-[562/276] max-w-[400px]">
              {/* Stamp Board Background Path */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none scale-[0.85] origin-center"
                viewBox="0 0 562 276"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid meet"
                style={{ zIndex: 0 }}
              >
                <path
                  d="M10 10H430.5C471 10 551.5 59.2 551.5 145C551.5 230.8 466.5 265.5 430.5 265.5H135"
                  stroke="#FFB2DA"
                  strokeWidth="20"
                  strokeLinecap="round"
                />
              </svg>

              {/* Flex Container for Stamps */}
              <div className="relative z-10 w-full h-full flex flex-col justify-center gap-[34px] py-[4%] ">
                {/* Top Row: 3 Stamps */}
                <div className="flex justify-center gap-[16px]  ">
                  {MISSIONS.slice(0, 3).map((mission) => {
                    const isCompleted = completedMissions.includes(mission.id);
                    const IconComp = getMissionIcon(mission.id);

                    return (
                      <div
                        key={mission.id}
                        className=" flex-col items-center justify-center gap-1 w-[26vw] max-w-[110px] "
                        onClick={() => {
                          if (scrollRef.current) {
                            scrollRef.current.scrollTo(0, 0);
                          }
                          navigate(`/mission/${mission.id}`, {
                            preventScrollReset: true,
                          });
                        }}
                      >
                        <div
                          className={`
                          p-[2.5vw] min-w-[76px] min-h-[76px] aspect-square rounded-full flex flex-col items-center justify-center
                          transition-all duration-300 shadow-sm relative
                          ${
                            isCompleted
                              ? "bg-[#FFFAFC] border-[2px] border-rose-400 scale-[1] shadow-md"
                              : "bg-[#FFFAFC] border-[1px] border-dashed border-rose-200"
                          }
                        `}
                        >
                          {isCompleted ? (
                            <>
                              <div
                                className="flex flex-col items-center justify-center w-full h-full pt-1"
                                style={{ gap: "0px" }}
                              >
                                <IconComp className="w-9 h-9 opacity-90 scale-[1]" />
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-7 h-7 z-20">
                                <svg
                                  width="100%"
                                  height="100%"
                                  viewBox="0 0 28 28"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <circle
                                    cx="14"
                                    cy="14"
                                    r="14"
                                    fill="#fb7185"
                                  />
                                  <path
                                    d="M8 14L12.5 18.5L20 9"
                                    stroke="white"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
                            </>
                          ) : (
                            <IconComp className="w-14 h-14 p-2 opacity-40 grayscale" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Row: 3 Stamps */}
                <div className="flex justify-center gap-[16px] w-full ">
                  {MISSIONS.slice(3).map((mission) => {
                    const isCompleted = completedMissions.includes(mission.id);
                    const IconComp = getMissionIcon(mission.id);

                    return (
                      <div
                        key={mission.id}
                        className="flex-col items-center justify-center gap-1 w-[26vw] max-w-[110px]"
                        onClick={() => {
                          if (scrollRef.current) {
                            scrollRef.current.scrollTo(0, 0);
                          }
                          navigate(`/mission/${mission.id}`, {
                            preventScrollReset: true,
                          });
                        }}
                      >
                        <div
                          className={`
                          p-[2.5vw] min-w-[76px] min-h-[76px] aspect-square rounded-full flex flex-col items-center justify-center
                          transition-all duration-300 shadow-sm relative
                          ${
                            isCompleted
                              ? "bg-[#FFFAFC] border-[2px] border-rose-400 shadow-md"
                              : "bg-[#FFFAFC] border-[1px] border-dashed border-rose-200"
                          }
                        `}
                        >
                          {isCompleted ? (
                            <>
                              <div
                                className="flex flex-col items-center justify-center w-full h-full pt-1"
                                style={{ gap: "0px" }}
                              >
                                <IconComp className="w-9 h-9 opacity-90 scale-[1.05]" />
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-7 h-7 z-20">
                                <svg
                                  width="100%"
                                  height="100%"
                                  viewBox="0 0 28 28"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <circle
                                    cx="14"
                                    cy="14"
                                    r="14"
                                    fill="#fb7185"
                                  />
                                  <path
                                    d="M8 14L12.5 18.5L20 9"
                                    stroke="white"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
                            </>
                          ) : (
                            <IconComp className="w-14 h-14 p-2 opacity-40 grayscale" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission List */}
        <div className="flex flex-col gap-3 mb-6">
          {MISSIONS.map((mission) => {
            const isCompleted = completedMissions.includes(mission.id);
            if (isCompleted) return null;

            const IconComp = getMissionIcon(mission.id);

            let formattedDesc = mission.description.replace(/\n/g, " ");
            if (mission.id === 1)
              formattedDesc = formattedDesc.replace(
                "내 식사자리(지정석)를 확인해주세요!",
                "내 식사자리(지정석)를\n확인해주세요!",
              );
            if (mission.id === 2)
              formattedDesc = formattedDesc.replace(
                "멋진 사진을 촬영하고 업로드해주세요!",
                "멋진 사진을 촬영하고\n업로드해주세요!",
              );
            if (mission.id === 3)
              formattedDesc = formattedDesc.replace(
                "하객과 함께 하트를 만들고 셀카를 촬영해주세요!",
                "하객과 함께\n하트를 만들고 셀카를 촬영해주세요!",
              );
            if (false)
              formattedDesc = formattedDesc.replace(
                "물건을 찾아 사진을 촬영해주세요!",
                "물건을 찾아\n사진을 촬영해주세요!",
              );
            if (mission.id === 5)
              formattedDesc = formattedDesc.replace(
                "나와 같은 비밀의 단어를 가진 사람을 찾아보세요",
                "비밀의 단어를\n가진 사람을 찾아보세요",
              );
            if (mission.id === 6)
              formattedDesc = formattedDesc.replace(
                "오늘 식사에 들어가는 요리를 맞춰보세요!",
                "식사에 들어가는\n요리를 맞춰보세요!",
              );

            return (
              <Link
                to={`/mission/${mission.id}`}
                key={mission.id}
                className={`
                  block bg-white rounded-[20px] p-5 
                  transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]
                  flex flex-col justify-start gap-4 relative overflow-hidden group
                  hover:bg-rose-50 active:bg-rose-50/60
                `}
                style={{
                  boxShadow:
                    "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
                }}
              >
                <div className="absolute inset-0 rounded-[20px] border-[0.75px] border-black/10 pointer-events-none z-10 group-hover:border-rose-300 group-active:border-rose-300 transition-colors"></div>
                <div className="flex justify-between items-start mb-1 relative z-0">
                  <h3 className="font-semibold text-lg flex-1 pr-1 leading-tight text-[#363638]">
                    {mission.title}
                  </h3>
                  <ChevronRight className="w-5 h-5 flex-shrink-0 text-[#363638]" />
                </div>

                <div className="flex justify-between items-end gap-2 mt-auto">
                  <div className="flex-1 w-full">
                    {!isCompleted && (
                      <p className="text-sm text-gray-500 whitespace-pre-line leading-relaxed pb-1 ">
                        {formattedDesc}
                      </p>
                    )}
                  </div>

                  <div className="ml-2 flex-shrink-0 flex items-center justify-center">
                    <IconComp className="w-10 h-10 object-contain" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setIsProgramOpen(true)}
          className="w-full mb-3 bg-white rounded-[20px] p-5 text-left hover:-translate-y-1 active:scale-[0.98] transition-all overflow-hidden relative group"
          style={{
            boxShadow:
              "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div className="absolute inset-0 rounded-[20px] border-[0.75px] border-black/10 pointer-events-none z-10 group-hover:border-rose-300 transition-colors"></div>
          <div className="relative z-0 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-[18px] bg-gradient-to-br from-amber-100 to-rose-200 flex items-center justify-center shadow-sm">
                <CalendarClock className="w-7 h-7 text-rose-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-rose-500 mb-1">
                  오늘의 진행 순서
                </p>
                <h3 className="text-lg font-bold leading-tight text-[#363638]">
                  식순 보기
                </h3>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 flex-shrink-0 text-[#363638]" />
          </div>
        </button>

        {/* Special Missions */}
        <div className="grid grid-cols-2 gap-3 pb-6">
          <Link
            to="/guestbook"
            className="block bg-white rounded-[20px] hover:-translate-y-1 active:scale-[0.98] transition-all overflow-hidden relative"
            style={{
              boxShadow:
                "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div className="absolute inset-0 rounded-[20px] border-[0.75px] border-black/10 pointer-events-none z-10"></div>
            <div className="flex flex-col h-full relative z-0">
              <div className="w-full h-[120px] bg-gradient-to-br from-rose-200 to-rose-400 flex items-center justify-center relative">
                <img
                  src="/img5.png"
                  alt="한마디 남기기 이미지"
                  className="w-[88%] h-full scale-[0.7] object-contain drop-shadow-sm absolute bottom-0"
                />
              </div>
              <div className="p-4 pt-4 w-full text-left bg-white">
                <p className="text-sm font-semibold text-rose-500 mb-1">
                  축하 메시지 남기기
                </p>
                <h3 className="text-lg font-bold text-base leading-tight text-[#363638]">
                  한마디 남기기
                </h3>
              </div>
            </div>
          </Link>

          <Link
            to="/bgm"
            className="block bg-white rounded-[20px] hover:-translate-y-1 active:scale-[0.98] transition-all overflow-hidden relative"
            style={{
              boxShadow:
                "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div className="absolute inset-0 rounded-[20px] border-[0.75px] border-black/10 pointer-events-none z-10"></div>
            <div className="flex flex-col h-full relative z-0">
              <div className="w-full h-[120px] bg-gradient-to-br from-lime-200 to-lime-500 flex items-center justify-center relative">
                <img
                  src="/img4.png"
                  alt="BGM 신청 이미지"
                  className="w-[88%] h-full scale-[0.7] object-contain drop-shadow-sm absolute bottom-0"
                />
              </div>
              <div className="p-4 pt-4 w-full text-left bg-white">
                <p className="text-sm font-semibold text-lime-700 mb-1">
                  듣고 싶은 노래 신청
                </p>
                <h3 className="text-lg font-bold text-base leading-tight text-[#363638]">
                  BGM 신청
                </h3>
              </div>
            </div>
          </Link>
        </div>
      </div>
      <div className="flex flex-col items-center mt-8 mb-24 space-y-4">
        <p className="text-sm font-medium text-[#8E8E93]">© 2026 진진방구</p>
      </div>

      {isProgramOpen && (
        <div className="fixed inset-0 z-[60] bg-gray-900/40 backdrop-blur-sm px-4 py-8 flex items-end sm:items-center justify-center">
          <div className="w-full max-w-md max-h-[82vh] bg-white rounded-[28px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white z-10 px-6 pt-6 pb-4 border-b border-rose-100 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-rose-500 mb-1">
                  Wedding Program
                </p>
                <h2 className="text-2xl font-black text-gray-900">
                  식순 보기
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsProgramOpen(false)}
                className="p-2 rounded-full bg-gray-50 text-gray-500 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                aria-label="식순 닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 overflow-y-auto max-h-[calc(82vh-96px)]">
              <ol className="space-y-3">
                {WEDDING_PROGRAM.map((item, index) => (
                  <li
                    key={`${item.title}-${index}`}
                    className="flex items-start gap-3 rounded-[16px] bg-[#FFF8F9] border border-rose-100/80 px-4 py-3"
                  >
                    <span className="w-8 h-8 flex-shrink-0 rounded-full bg-white border border-rose-200 text-rose-500 text-sm font-black flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="block text-[15px] font-bold text-gray-800 leading-snug">
                        {item.title}
                      </span>
                      {item.scripture && (
                        <div className="mt-3 rounded-[14px] bg-white border border-rose-100 px-4 py-3 text-gray-700">
                          <p className="text-sm font-black text-rose-500 mb-2">
                            {item.scripture.reference}
                          </p>
                          <div className="space-y-2">
                            {item.scripture.verses.map((verse) => (
                              <p
                                key={verse.number}
                                className="text-[13px] leading-relaxed"
                              >
                                <span className="mr-2 font-black text-gray-900">
                                  {verse.number}
                                </span>
                                {verse.text}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Check Tickets Button (Bottom) */}
      {tickets > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 p-4 z-50 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(255,255,255,1) 60%, rgba(255,255,255,0.8) 80%, rgba(255,255,255,0) 100%)",
          }}
        >
          <div className="max-w-md mx-auto pointer-events-auto">
            <Link
              to="/tickets"
              className="w-full bg-[#000000] text-white font-bold py-4 rounded-[16px] shadow-lg flex items-center justify-center gap-2 hover:-translate-y-1 active:scale-[0.98] transition-transform"
            >
              <Ticket className="w-6 h-6" />내 추첨 번호 {tickets}개 보기
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
