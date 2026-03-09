export interface Mission {
  id: number;
  title: string;
  description: string;
  type: 'photo' | 'qr' | 'quiz' | 'message';
  completed: boolean;
  hint?: string;
  quizOptions?: string[];
  quizAnswer?: number;
}

export interface User {
  id: string;
  name: string;
  secretWord?: string;
  tickets: number;
  completedMissions: number[];
  wonPrize: boolean;
}

export const MISSIONS: Mission[] = [
  {
    id: 1,
    title: '내 식사 지정석 확인하기',
    description: '내 식사자리(지정석)를\n확인해주세요!',
    type: 'message',
    completed: false,
  },
  {
    id: 2,
    title: '포토 부스에서 사진 찍기',
    description: '포토 부스에서\n멋진 사진을 촬영하고 업로드해주세요!',
    type: 'photo',
    completed: false,
  },
  {
    id: 3,
    title: '모르는 하객과 하트 만들기',
    description: '포토존에서 모르는 하객과 함께\n하트를 만들고 셀카를 촬영해주세요!',
    type: 'photo',
    completed: false,
  },
  {
    id: 5,
    title: '비밀의 단어 찾기',
    description: '나와 같은 비밀의 단어를 가진\n사람을 찾아보세요',
    type: 'qr',
    completed: false,
  },
  {
    id: 6,
    title: '요리 메뉴 맞추기',
    description: '오늘 식사에 들어가는 요리를 맞춰보세요!',
    type: 'quiz',
    completed: false,
    quizOptions: [
      '한식 정찬 코스',
      '양식 스테이크 코스',
      '프렌치 퀴진 코스',
      '퓨전 아시안 코스'
    ],
    quizAnswer: 1,
  },
  {
    id: 4,
    title: '숨겨진 물건 찾기',
    description: '야외 정원의 숨겨진 물건을 찾아\n사진을 촬영해주세요!',
    type: 'photo',
    completed: false,
    hint: '🌹 장미꽃 화분 근처를 살펴보세요. 작은 금색 리본이 달린 상자가 있습니다!',
  },
];
