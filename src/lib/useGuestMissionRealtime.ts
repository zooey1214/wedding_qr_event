import { useEffect } from "react";
import { supabase } from "@/lib/supabase"; // 본인의 설정 경로에 맞게 수정

export const useGuestMissionRealtime = (setState: any) => {
  useEffect(() => {
    const channel = supabase
      .channel("guest-missions-channel")
      .on(
        "postgres_changes",
        {
          event: "UPDATE", // 값 변경을 감지하므로 UPDATE 이벤트만 필터링
          schema: "public",
          table: "guest_missions",
        },
        (payload) => {
          const { old: oldRecord, new: newRecord } = payload;
          // is_completed 값이 실제로 변경되었는지 확인
          const guestId = window.localStorage.getItem("guestId");
          const mission5Completed = window.localStorage.getItem(
            "five_mission_completed",
          );
          alert("신호옴");
          if (
            newRecord.mission_id === 5 &&
            newRecord.is_completed === true &&
            guestId === newRecord.guest_id &&
            !mission5Completed
          ) {
            console.log("업데이트 로직 실시");
            setState(true);
          }
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("실시간 구독이 시작되었습니다.");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
};
