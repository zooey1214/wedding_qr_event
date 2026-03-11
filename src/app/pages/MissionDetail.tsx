import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Upload,
  Camera,
  QrCode,
  HelpCircle,
  Check,
  Award,
} from "lucide-react";
import QRCode from "react-qr-code";
import { Scanner } from "@yudiel/react-qr-scanner";
import Lottie from "lottie-react";
import photoAnimation from "../../assets/photo-animation.json";
import heartAnimation from "../../assets/heart-animation.json";
import treasureAnimation from "../../assets/treasure-animation.json";
import foodAnimation from "../../assets/food-animation.json";
import ideaAnimation from "../../assets/idea-animation.json";
import searchAnimation from "../../assets/search-animation.json";
import seatAnimation from "../../assets/seat-animation.json";
import { MISSIONS } from "../types/mission";
import { supabase } from "../../lib/supabase";
import { secretWordList } from "../../assets/secretWords";
import { useGuestMissionRealtime } from "../../lib/useGuestMissionRealtime";

export default function MissionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const missionId = parseInt(id || "0");
  const mission = MISSIONS.find((m) => m.id === missionId);

  const guestId = localStorage.getItem("guestId"); // Temporarily using local storage to identify the guest
  const [completedMissions, setCompletedMissions] = useState<number[]>([]);
  const [tickets, setTickets] = useState(0); // Optional: if you want to keep showing ticket count
  const [missionImages, setMissionImages] = useState<Record<number, string>>(
    {},
  );

  const [showHint, setShowHint] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [mission5State, setMission5State] = useState(false);
  const [secretWordData, setSecretWordData] = useState({} as any);
  const [secretWord, setSecretWord] = useState([] as string[]);
  const [secretWordTitle, setSecretWordTitle] = useState("");
  const [guestName, setGuestName] = useState("게스트");
  const [guestTableNo, setGuestTableNo] = useState("");

  // Seats animation states
  const [hasVisitedSeatCheck, setHasVisitedSeatCheck] = useState(() => {
    const saved = localStorage.getItem("missionProgress");
    if (saved) {
      const data = JSON.parse(saved);
      return data.hasVisitedSeatCheck || false;
    }
    return false;
  });
  const [showSeatResult, setShowSeatResult] = useState(() => {
    const saved = localStorage.getItem("missionProgress");
    if (saved) {
      const data = JSON.parse(saved);
      return data.hasVisitedSeatCheck || false;
    }
    return false;
  });
  const [seatCheckText, setSeatCheckText] = useState(
    "아, 식사 지정석이요?\n성함이 어떻게 되시죠?",
  );
  const [fakeNames, setFakeNames] = useState<string[]>([]);
  const [selectedSeatOption, setSelectedSeatOption] = useState<number | null>(
    null,
  );
  const [seatQuizSubmitted, setSeatQuizSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useGuestMissionRealtime(setMission5State);

  const loadMissionData = async () => {
    if (!guestId) {
      setIsLoading(false);
      return;
    }

    try {
      // 1. Fetch guest info (Name, Table No, Secret Word) and 2. Fetch completed missions info
      const [guestRes, missionsRes] = await Promise.all([
        supabase
          .from("guests")
          .select("name, table_no, secret_words(title, content, id)")
          .eq("id", guestId)
          .single(),
        supabase
          .from("guest_missions")
          .select("mission_id, is_completed, mission_image")
          .eq("guest_id", guestId),
      ]);

      if (guestRes.data) {
        setGuestName(guestRes.data.name || "게스트");
        setGuestTableNo(guestRes.data.table_no || "");

        if (guestRes.data.secret_words) {
          const swd = Array.isArray(guestRes.data.secret_words)
            ? guestRes.data.secret_words[0]
            : guestRes.data.secret_words;
          setSecretWordData(swd);
          if (swd) {
            setSecretWordTitle(swd.title);
            // Assuming content is an array
            setSecretWord(swd.content);
          }
        }
      }

      if (missionsRes.data) {
        const completedIds: number[] = [];
        const images: Record<number, string> = {};

        missionsRes.data.forEach((m) => {
          if (m.is_completed) completedIds.push(m.mission_id);
          if (m.mission_image) images[m.mission_id] = m.mission_image;
        });

        setCompletedMissions(completedIds);
        setMissionImages(images);

        // Seat Mission (Mission 1) UI specific state logic based on completion
        if (missionId === 1 && completedIds.includes(1)) {
          setHasVisitedSeatCheck(true);
          setShowSeatResult(true);
          setSeatCheckText(
            `아 ${guestRes.data?.name || "게스트"}님이요~\n잠시만요 자리가…`,
          );
        }

        if (images[missionId]) {
          setUploadedImage(images[missionId]);
        }
      }
    } catch (err) {
      console.error("Failed to load user missions", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMissionData();
  }, [missionId, guestId]);

  // Handle setup for the first mission (Seat Check) options
  useEffect(() => {
    if (mission?.id === 1 && guestName !== "게스트") {
      // Shuffle names (for layout only; keeping simple)
      const options = [
        "김칠수입니다",
        "김철수입니다",
        "김명수입니다",
        "김철희입니다",
      ];
      const actualNameIdx = Math.floor(Math.random() * 4);
      options[actualNameIdx] = `${guestName}입니다`;
      setFakeNames(options);
    }
  }, [mission, guestName]);

  useEffect(() => {
    if (mission5State === true) {
      handleQrScan();
    }
  }, [mission5State]);

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

  if (!mission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">미션을 찾을 수 없습니다.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-purple-600 font-medium"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const isCompleted = completedMissions.includes(missionId);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `mission_${missionId}_${Date.now()}.${fileExt}`;
      const filePath = `user_uploads/${fileName}`;

      const { data, error } = await supabase.storage
        .from("images")
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      const { data: publicUrlData } = supabase.storage
        .from("images")
        .getPublicUrl(filePath);

      setUploadedImage(publicUrlData.publicUrl);
    } catch (err) {
      console.error("업로드 실패. 로컬 프리뷰로 유지합니다.", err);
    } finally {
      setIsUploading(false);
    }
  };

  const checkAllMissionsComplete = async () => {
    if (!guestId) return;

    const { data } = await supabase
      .from("guest_missions")
      .select("id")
      .eq("guest_id", guestId)
      .eq("is_completed", true);

    if (data && data.length >= 6) {
      await supabase
        .from("guests")
        .update({ mission_complete_at: new Date().toISOString() })
        .eq("id", guestId)
        .is("mission_complete_at", null);
    }
  };

  const completeMission = async () => {
    if (!isCompleted && guestId) {
      try {
        const payload: any = {
          is_completed: true,
          completed_at: new Date().toISOString(),
        };
        if (uploadedImage) payload.mission_image = uploadedImage;

        await supabase
          .from("guest_missions")
          .update(payload)
          .eq("guest_id", guestId)
          .eq("mission_id", missionId);

        // Issue lottery ticket
        await supabase
          .from("lottery_tickets")
          .insert([{ guest_id: guestId, mission_id: missionId }]);

        await checkAllMissionsComplete();
        await loadMissionData();
      } catch (err) {
        console.error("Error completing mission", err);
      }
    }
  };

  const completeMissionWithoutRedirect = async () => {
    if (!isCompleted && guestId) {
      try {
        await supabase
          .from("guest_missions")
          .update({
            is_completed: true,
            completed_at: new Date().toISOString(),
          })
          .eq("guest_id", guestId)
          .eq("mission_id", missionId);

        // Issue lottery ticket
        await supabase
          .from("lottery_tickets")
          .insert([{ guest_id: guestId, mission_id: missionId }]);

        await checkAllMissionsComplete();
        await loadMissionData();
      } catch (err) {
        console.error("Error completing mission", err);
      }
    }
  };

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
    if (selectedQuiz === mission.quizAnswer) {
      setTimeout(() => {
        completeMission();
      }, 500);
    }
  };

  const handleQrScan = async () => {
    // Simulate QR scan
    // return
    setShowQrScanner(false);
    await completeMission();
  };

  return (
    <div className="min-h-screen bg-white relative" ref={scrollRef}>
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm pt-4 pb-4">
        <div className="max-w-md mx-auto px-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors flex w-fit"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Secret Word fixed background SVG */}
      {mission.type === "qr" && (
        <div className="fixed bottom-0 left-0 right-0 w-full pointer-events-none z-0 overflow-hidden flex justify-center">
          <svg
            className="w-full max-w-md"
            viewBox="0 0 606 736"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <g clipPath="url(#clip0_2028_6)">
              <rect width="606" height="736" fill="white" />
              <g filter="url(#filter0_d_2028_6)">
                <rect
                  x="-315.284"
                  y="260.183"
                  width="416.626"
                  height="800"
                  rx="27.0244"
                  transform="rotate(-27.5381 -315.284 260.183)"
                  fill="#FFF8F9"
                />
                <rect
                  x="-314.778"
                  y="260.342"
                  width="415.876"
                  height="799.25"
                  rx="26.6494"
                  transform="rotate(-27.5381 -314.778 260.342)"
                  stroke="black"
                  strokeOpacity="0.2"
                  strokeWidth="0.75"
                />
              </g>
              <g filter="url(#filter1_d_2028_6)">
                <rect
                  width="416.626"
                  height="800"
                  rx="27.0244"
                  transform="matrix(-0.886703 -0.462339 -0.462339 0.886703 921.132 260.183)"
                  fill="#FFF8F9"
                />
                <rect
                  x="-0.505891"
                  y="0.159137"
                  width="415.876"
                  height="799.25"
                  rx="26.6494"
                  transform="matrix(-0.886703 -0.462339 -0.462339 0.886703 920.251 259.967)"
                  stroke="black"
                  strokeOpacity="0.2"
                  strokeWidth="0.75"
                />
              </g>
            </g>
            <defs>
              <filter
                id="filter0_d_2028_6"
                x="-339.637"
                y="20.6874"
                width="788.001"
                height="950.692"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset dy="-22.5203" />
                <feGaussianBlur stdDeviation="16.8902" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.02 0"
                />
                <feBlend
                  mode="normal"
                  in2="BackgroundImageFix"
                  result="effect1_dropShadow_2028_6"
                />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="effect1_dropShadow_2028_6"
                  result="shape"
                />
              </filter>
              <filter
                id="filter1_d_2028_6"
                x="157.484"
                y="20.6874"
                width="788.001"
                height="950.692"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset dy="-22.5203" />
                <feGaussianBlur stdDeviation="16.8902" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.02 0"
                />
                <feBlend
                  mode="normal"
                  in2="BackgroundImageFix"
                  result="effect1_dropShadow_2028_6"
                />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="effect1_dropShadow_2028_6"
                  result="shape"
                />
              </filter>
              <clipPath id="clip0_2028_6">
                <rect width="606" height="736" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </div>
      )}

      {/* Static Title Area */}
      <div className={`pt-2 pb-2 ${missionId === 5 && "sticky top-[76px]"}`}>
        <div className={`max-w-md mx-auto px-6 `}>
          <div className="text-center">
            {mission.id === 1 ? (
              <h1 className="text-[26px] font-bold text-[#000000] mb-[2px] whitespace-pre-line">
                {seatCheckText}
              </h1>
            ) : (
              <>
                <h1 className="text-[26px] font-bold text-[#000000] mb-2">
                  {mission.title}
                </h1>
                <p className="font-medium text-lg text-gray-500 leading-relaxed whitespace-pre-line">
                  {mission.description}
                </p>
              </>
            )}

            {!isCompleted && !uploadedImage && mission.id === 2 && (
              <div className="w-full flex justify-center mt-[64px] mb-2">
                <div className="w-48 h-48">
                  <Lottie animationData={photoAnimation} loop={true} />
                </div>
              </div>
            )}
            {!isCompleted && !uploadedImage && mission.id === 3 && (
              <div className="w-full flex justify-center mt-2 mb-2">
                <div className="w-80 h-80">
                  <Lottie animationData={heartAnimation} loop={true} />
                </div>
              </div>
            )}
            {!isCompleted && !uploadedImage && mission.id === 4 && (
              <div className="w-full flex justify-center mt-[40px] mb-2 ">
                <div className="w-48 h-48">
                  <Lottie animationData={treasureAnimation} loop={true} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6 relative z-10">
        <div
          className={`rounded-[20px] p-6 mb-6 ${mission.type === "qr" ? "bg-transparent" : "bg-white"}`}
        >
          {missionId === 1 && (
            <div className="space-y-4">
              {!hasVisitedSeatCheck ? (
                <div className="space-y-4 relative w-full h-full pb-16">
                  {fakeNames.map((option, index) => {
                    const isCorrect = option === `${guestName}입니다`;

                    return (
                      <button
                        key={index}
                        onClick={() =>
                          !seatQuizSubmitted && setSelectedSeatOption(index)
                        }
                        disabled={seatQuizSubmitted || showSeatResult}
                        className={`
                            w-full p-4 rounded-[20px] border-[0.75px] text-left transition-all
                            ${
                              seatQuizSubmitted && isCorrect
                                ? "border-lime-500 bg-lime-50"
                                : seatQuizSubmitted &&
                                    index === selectedSeatOption
                                  ? "border-red-500 bg-red-50"
                                  : selectedSeatOption === index
                                    ? "border-lime-500 bg-lime-50"
                                    : "border-[#EBEBF0] hover:border-lime-300"
                            }
                            ${seatQuizSubmitted ? "cursor-not-allowed" : "cursor-pointer"}
                          `}
                      >
                        <div className="flex items-center gap-3 justify-center ">
                          <span
                            className={`
                              font-medium
                              ${
                                seatQuizSubmitted && isCorrect
                                  ? "text-lime-700"
                                  : seatQuizSubmitted &&
                                      index === selectedSeatOption
                                    ? "text-red-700"
                                    : "text-gray-700"
                              }
                            `}
                          >
                            {option}
                          </span>
                        </div>
                      </button>
                    );
                  })}

                  {seatQuizSubmitted &&
                    selectedSeatOption !== null &&
                    fakeNames[selectedSeatOption] !== `${guestName}입니다` && (
                      <div className="bg-red-50 border-[0.75px] border-red-300 rounded-[20px] p-4 text-center mt-2">
                        <p className="text-red-700 font-medium">
                          아쉽지만 틀렸습니다. 다시 시도해보세요!
                        </p>
                        <button
                          onClick={() => {
                            setSeatQuizSubmitted(false);
                            setSelectedSeatOption(null);
                          }}
                          className="mt-3 text-red-600 font-medium underline"
                        >
                          다시 풀기
                        </button>
                      </div>
                    )}

                  {!seatQuizSubmitted && (
                    <div
                      className="fixed bottom-0 left-0 right-0 p-4 z-50 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(255,255,255,1) 60%, rgba(255,255,255,0.8) 80%, rgba(255,255,255,0) 100%)",
                      }}
                    >
                      <div className="max-w-md mx-auto w-full pointer-events-auto">
                        <button
                          onClick={() => {
                            const isCorrect =
                              selectedSeatOption !== null &&
                              fakeNames[selectedSeatOption] ===
                                `${guestName}입니다`;
                            setSeatQuizSubmitted(true);

                            if (isCorrect) {
                              setTimeout(async () => {
                                const saved =
                                  localStorage.getItem("missionProgress");
                                const data = saved ? JSON.parse(saved) : {};
                                data.hasVisitedSeatCheck = true;
                                localStorage.setItem(
                                  "missionProgress",
                                  JSON.stringify(data),
                                );
                                setHasVisitedSeatCheck(true);

                                if (
                                  !isCompleted &&
                                  !completedMissions.includes(missionId)
                                ) {
                                  await completeMissionWithoutRedirect();
                                }
                              }, 500);
                            }
                          }}
                          disabled={
                            selectedSeatOption === null || showSeatResult
                          }
                          className="w-full bg-lime-500 text-white font-bold py-[16px] rounded-[16px] shadow-[0_4px_12px_rgba(132,204,22,0.3)] disabled:shadow-none flex items-center justify-center gap-2 hover:-translate-y-1 active:scale-[0.98] transition-transform disabled:opacity-100 disabled:bg-none disabled:bg-[#F4F4F5] disabled:text-[#37383C]/28 disabled:cursor-not-allowed border-[0.75px] border-transparent"
                        >
                          정답 제출
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center flex justify-center w-full mb-8">
                  <div className="transition-opacity duration-1000 opacity-100 flex flex-col items-center">
                    <div className="w-56 h-56 -mb-[53px] pointer-events-none z-0 relative">
                      <Lottie animationData={seatAnimation} loop={true} />
                    </div>
                    <div
                      className="bg-fuchsia-300 border-[0.75px] border-black/10 rounded-[20px] px-6 py-[44px] text-center w-full flex-col flex relative z-10 m-0"
                      style={{
                        boxShadow:
                          "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
                      }}
                    >
                      <p
                        className="text-4xl font-bold text-[#000000] my-0 flex justify-center items-baseline gap-1"
                        style={{
                          fontFamily: "CuteLotte",
                          fontWeight: 400,
                        }}
                      >
                        {guestTableNo.replace(/[^0-9]/g, "") || "15"}
                        <span className="text-xl">
                          {guestTableNo.replace(/[0-9]/g, "") || "번"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {isCompleted && missionId === 6 && (
            <div className="text-center mb-2 pb-12 ">
              <h2 className="text-xl font-bold text-gray-800 mb-2 mt-2">
                웨딩 코스 요리 메뉴
              </h2>
              <p className="text-gray-600 mb-6 font-medium text-sm">
                오늘 제공될 점심 식사 메뉴입니다
              </p>

              <div className="bg-gradient-to-br from-[#FFF0F5] to-white rounded-[16px] p-6 text-gray-800 space-y-7 font-medium border border-[#FFE2EA] shadow-inner relative">
                <div className="absolute top-0 right-0 translate-x-[calc(40%-24px)] -translate-y-1/2 bg-lime-500 rounded-[24px] px-3 py-1.5 flex items-center gap-1 shadow-md z-30 whitespace-nowrap">
                  <Check className="w-4 h-4 text-white stroke-[3px]" />
                  <span className="text-white font-bold text-sm">
                    추첨권 1매
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-3xl mb-1">🥖</span>{" "}
                  <div className="text-center">
                    <p className="text-[15px] font-bold">식전 빵</p>
                    <p className="text-xs text-gray-500 mt-0.5 font-normal">
                      Fresh Baked Bread
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-3xl mb-1">🥗</span>{" "}
                  <div className="text-center">
                    <p className="text-[15px] font-bold">훈제 연어 샐러드</p>
                    <p className="text-xs text-gray-500 mt-0.5 font-normal">
                      Smoked Salmon Salad
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-3xl mb-1">🥣</span>{" "}
                  <div className="text-center">
                    <p className="text-[15px] font-bold">양송이 크림 수프</p>
                    <p className="text-xs text-gray-500 mt-0.5 font-normal">
                      Mushroom Cream Soup
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-3xl mb-1">🥩</span>{" "}
                  <div className="text-center">
                    <p className="text-[15px] font-bold">안심 스테이크</p>
                    <p className="text-xs text-gray-500 mt-0.5 font-normal">
                      Tenderloin Steak
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-3xl mb-1">🍰</span>{" "}
                  <div className="text-center">
                    <p className="text-[15px] font-bold">티라미수 케이크</p>
                    <p className="text-xs text-gray-500 mt-0.5 font-normal">
                      Tiramisu Cake
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-3xl mb-1">☕</span>{" "}
                  <div className="text-center">
                    <p className="text-[15px] font-bold">커피 또는 홍차</p>
                    <p className="text-xs text-gray-500 mt-0.5 font-normal">
                      Coffee or Tea
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Photo Upload Missions */}
          {mission.type === "photo" && (
            <div className="space-y-4">
              {!isCompleted && !uploadedImage && mission.hint && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="flex justify-center items-center gap-1 text-rose-400 font-medium hover:text-rose-500 w-full"
                  >
                    힌트
                    <HelpCircle className="w-5 h-5" />
                  </button>
                  {showHint && (
                    <div className="mt-3 bg-rose-50 border-[0.75px] border-rose-200 rounded-xl p-4 mb-[80px]">
                      <p className="text-rose-700">{mission.hint}</p>
                    </div>
                  )}
                </div>
              )}

              {uploadedImage ? (
                <div className="space-y-4">
                  <div className="relative w-full h-auto">
                    <img
                      src={uploadedImage}
                      alt="Uploaded"
                      className="w-full rounded-xl object-contain max-h-[60vh]"
                    />
                    {isCompleted && (
                      <div className="absolute top-0 right-0 translate-x-[calc(40%-24px)] -translate-y-1/2 bg-lime-500 rounded-[24px] px-3 py-1.5 flex items-center gap-1 shadow-md z-30 whitespace-nowrap">
                        <Check className="w-4 h-4 text-white stroke-[3px]" />
                        <span className="text-white font-bold text-sm">
                          추첨권 1매
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 rounded-xl border-[0.75px] border-black/15 pointer-events-none z-10"></div>
                  </div>

                  <div className="h-12" />

                  {!isCompleted && (
                    <div
                      className="fixed bottom-0 left-0 right-0 p-4 z-50 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(255,255,255,1) 60%, rgba(255,255,255,0.8) 80%, rgba(255,255,255,0) 100%)",
                      }}
                    >
                      <div className="max-w-md mx-auto flex gap-3 w-full  pointer-events-auto">
                        <button
                          onClick={() => setUploadedImage(null)}
                          className="flex-1 px-[16px] py-[16px] bg-[#ffffff] text-rose-400 rounded-[16px] font-bold hover:bg-pink-50 hover:-translate-y-1 active:scale-[0.98] transition-all border-[1px] border-rose-200 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                        >
                          다시 촬영
                        </button>
                        <button
                          onClick={completeMission}
                          disabled={isUploading}
                          className="flex-[2] py-[16px] bg-rose-400 text-white rounded-[16px] font-bold shadow-[0_4px_12px_rgba(247,50,149,0.3)] hover:-translate-y-1 active:scale-[0.98] transition-transform border-[0.75px] border-transparent disabled:opacity-50"
                        >
                          {isUploading ? "업로드 중..." : "미션 완료"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : !isCompleted ? (
                <div
                  className="fixed bottom-0 left-0 right-0 p-4 z-50 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(255,255,255,1) 60%, rgba(255,255,255,0.8) 80%, rgba(255,255,255,0) 100%)",
                  }}
                >
                  {/* <div className="fixed bottom-0 left-0 right-0 pt-24 pb-8 z-50 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(255,255,255,1) 60%, rgba(255,255,255,0.8) 80%, rgba(255,255,255,0) 100%)' }}> */}
                  <div className="max-w-md mx-auto w-full pointer-events-auto">
                    <label className="block w-full cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <div className="w-full bg-rose-400 text-white font-bold py-[16px] rounded-[16px] shadow-[0_4px_12px_rgba(247,50,149,0.3)] flex items-center justify-center gap-2 hover:-translate-y-1 active:scale-[0.98] transition-all cursor-pointer">
                        <Camera className="w-6 h-6" />
                        사진 촬영하기
                      </div>
                    </label>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* QR Mission */}
          {mission.type === "qr" && (
            <div className="space-y-4 ">
              <div
                className="rounded-[20px] p-6 text-center mb-[48px] relative"
                style={{
                  boxShadow:
                    "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
                }}
              >
                {isCompleted && (
                  <div className="absolute top-0 right-0 translate-x-[calc(40%-24px)] -translate-y-1/2 bg-lime-500 rounded-[24px] px-3 py-1.5 flex items-center gap-1 shadow-sm z-30 whitespace-nowrap">
                    <Check className="w-4 h-4 text-white stroke-[3px]" />
                    <span className="text-white font-bold text-sm">
                      추첨권 1매
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 rounded-[20px] bg-white pointer-events-none z-0"></div>
                <div className="absolute inset-0 rounded-[20px] border-[0.75px] border-black/10 pointer-events-none z-10"></div>
                <div className="relative z-10 flex flex-col items-center justify-center">
                  {isCompleted && (
                    <div className="w-32 h-32 mb-2">
                      <Lottie animationData={ideaAnimation} loop={true} />
                    </div>
                  )}
                  <p className="text-3xl font-bold text-rose-500 my-1">
                    {secretWordTitle || "비밀의 단어"}
                  </p>

                  <div className="mb-4 mt-4 flex flex-col items-center gap-2">
                    {!isCompleted ? (
                      <>
                        <p className="text-sm text-rose-500 py-[4px] px-[8px] bg-rose-500/10 rounded-[8px] w-fit whitespace-pre-line">
                          {`오늘 결혼식의 주인공들에게\n무슨 의미 일까요?`}
                        </p>
                      </>
                    ) : (
                      <>
                        {secretWord.map((item, i) => {
                          return (
                            <p
                              key={i}
                              className="text-sm text-rose-500 py-[4px] px-[8px] bg-rose-500/10 rounded-[8px] w-fit"
                            >
                              {item}
                            </p>
                          );
                        })}
                      </>
                    )}
                  </div>

                  {!isCompleted && (
                    <p className="text-sm text-rose-800 mt-2 mb-6">
                      이 단어를 직접 언급하지 말고, 다른 방식으로 설명하여 같은
                      단어를 가진 사람을 찾아보세요!
                    </p>
                  )}

                  <div className="p-4 flex flex-col items-center">
                    <QRCode
                      value={`${window.location.origin}/${secretWordData.id}/${guestId}`}
                      size={150}
                      fgColor="#831843"
                    />
                    <p className="text-xs text-rose-500 font-medium mt-3">
                      나의 고유 QR 코드
                    </p>
                  </div>
                </div>
              </div>
              <div className="h-4" />

              {/* Live QR Scanner using yudiel/react-qr-scanner */}
              {!isCompleted &&
                (showQrScanner ? (
                  <div className="fixed inset-0 z-50 bg-black flex flex-col">
                    {/* Scanner overlay */}
                    <div className="flex-1 relative w-full h-full flex items-center justify-center">
                      <Scanner
                        onScan={async (result) => {
                          if (result && result.length > 0) {
                            const raw = result[0].rawValue;
                            const targetGusetId =
                              raw.split("/")[raw.split("/").length - 1];
                            const secretWordId =
                              raw.split("/")[raw.split("/").length - 2];
                            // alert(secretWordId);
                            // alert(guestId);

                            if (guestId) {
                              if (secretWordId === secretWordData.id) {
                                alert("성공!");
                                window.localStorage.setItem(
                                  "five_mission_completed",
                                  "true",
                                );
                                const { data, error } = await supabase
                                  .from("guest_missions")
                                  .update({ is_completed: true })
                                  .eq("mission_id", 5) // 첫 번째 조건
                                  .eq("guest_id", targetGusetId); // 두 번째 조건 (AND)
                                if (error) {
                                  console.error(
                                    "업데이트 실패:",
                                    error.message,
                                  );
                                } else {
                                  handleQrScan();
                                }
                                return;
                              } else {
                                alert("틀렸습니다");
                                return;
                              }
                            }
                            // 여기서 찍은 사람의 시크릿 id와 게스트 id를 찾을수있다.
                            // 나의 시크릿 id와 찍은사람의 시크릿 id가 같을 경우
                            // 상대방과 나의 guest_missions의 미션넘버 5번을 complete상태로 바꾼다.
                            // 이때 supabase의 리
                            // return;
                          }
                        }}
                        onError={(error: any) =>
                          console.log("QR Scan Error:", error?.message)
                        }
                        constraints={{ facingMode: "environment" }}
                      />
                      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
                        <button
                          onClick={() => setShowQrScanner(false)}
                          className="bg-black/50 p-2 rounded-full text-white"
                        >
                          <ArrowLeft className="w-6 h-6" />
                        </button>
                        <p className="text-white font-medium">
                          QR 코드를 스캔하세요
                        </p>
                        <div className="w-10"></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="fixed bottom-0 left-0 right-0 p-4 z-50 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(255,255,255,1) 60%, rgba(255,255,255,0.8) 80%, rgba(255,255,255,0) 100%)",
                    }}
                  >
                    <div className="max-w-md mx-auto  w-full pointer-events-auto">
                      <button
                        onClick={() => {
                          setShowQrScanner(true);
                        }}
                        className="w-full bg-rose-400 text-white font-bold py-[16px] rounded-[16px] shadow-[0_4px_12px_rgba(247,50,149,0.3)] flex items-center justify-center gap-2 hover:-translate-y-1 active:scale-[0.98] transition-transform border-[0.75px] border-transparent"
                      >
                        <QrCode className="w-5 h-5" />
                        상대방 QR 인식하기
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Quiz Mission */}
          {mission.type === "quiz" && !isCompleted && (
            <div className="space-y-4">
              {mission.quizOptions?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !quizSubmitted && setSelectedQuiz(index)}
                  disabled={quizSubmitted}
                  className={`
                    w-full p-4 rounded-[20px] border-[0.75px] text-left transition-all
                    ${
                      quizSubmitted && index === mission.quizAnswer
                        ? "border-lime-500 bg-lime-50"
                        : quizSubmitted && index === selectedQuiz
                          ? "border-red-500 bg-red-50"
                          : selectedQuiz === index
                            ? "border-lime-500 bg-lime-50"
                            : "border-[#EBEBF0] hover:border-lime-300"
                    }
                    ${quizSubmitted ? "cursor-not-allowed" : "cursor-pointer"}
                  `}
                >
                  <div className="flex items-center gap-3 justify-center ">
                    <span
                      className={`
                      font-medium
                      ${
                        quizSubmitted && index === mission.quizAnswer
                          ? "text-lime-700"
                          : quizSubmitted && index === selectedQuiz
                            ? "text-red-700"
                            : "text-gray-700"
                      }
                    `}
                    >
                      {option}
                    </span>
                  </div>
                </button>
              ))}

              {!quizSubmitted && (
                <div
                  className="fixed bottom-0 left-0 right-0 p-4 z-50 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(255,255,255,1) 60%, rgba(255,255,255,0.8) 80%, rgba(255,255,255,0) 100%)",
                  }}
                >
                  <div className="max-w-md mx-auto  w-full pointer-events-auto">
                    <button
                      onClick={handleQuizSubmit}
                      disabled={selectedQuiz === null}
                      className="w-full bg-lime-500 text-white font-bold py-[16px] rounded-[16px] shadow-[0_4px_12px_rgba(132,204,22,0.3)] disabled:shadow-none flex items-center justify-center gap-2 hover:-translate-y-1 active:scale-[0.98] transition-transform disabled:opacity-100 disabled:bg-none disabled:bg-[#F4F4F5] disabled:text-[#37383C]/28 disabled:cursor-not-allowed border-[0.75px] border-transparent"
                    >
                      정답 제출
                    </button>
                  </div>
                </div>
              )}

              {/* Removing the intermediate success state entirely */}
              {quizSubmitted && selectedQuiz !== mission.quizAnswer && (
                <div className="bg-red-50 border-[0.75px] border-red-300 rounded-[20px] p-4 text-center">
                  <p className="text-red-700 font-medium">
                    아쉽지만 틀렸습니다. 다시 시도해보세요!
                  </p>
                  <button
                    onClick={() => {
                      setQuizSubmitted(false);
                      setSelectedQuiz(null);
                    }}
                    className="mt-3 text-red-600 font-medium underline"
                  >
                    다시 풀기
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isCompleted && (
        <div
          className="fixed bottom-0 left-0 right-0 p-4 z-50 pointer-events-none bg-gradient-to-t from-white from-50% via-white/80 to-transparent"
          style={{
            background:
              "linear-gradient(to top, rgba(255,255,255,1) 60%, rgba(255,255,255,0.8) 80%, rgba(255,255,255,0) 100%)",
          }}
        >
          <div className="max-w-md mx-auto pointer-events-auto">
            <button
              onClick={() => navigate("/")}
              className="w-full bg-[#ffffff] text-[#E83E7A] border border-rose-200 font-bold py-[16px] rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-center gap-2 hover:-translate-y-1 active:scale-[0.98] transition-transform"
            >
              홈으로 가기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

//         </div >
//       </div >
//     </div >
//   );
// }
