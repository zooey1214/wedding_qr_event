import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Link as LinkIcon, Gift, Trophy, X } from 'lucide-react';

type UserData = {
    id: number;
    name: string;
    nickname: string;
    tableNo: string;
    missions: Record<number, number | null>;
    missionPhotos: Record<number, string | null>;
    secretWord: string;
    qrLink: string;
};

const INITIAL_MOCK_DATA: UserData[] = [
    { id: 1, name: '김철수', nickname: '철수찡', tableNo: '1번', missions: { 1: 12, 2: null, 3: null, 4: null, 5: null, 6: null }, missionPhotos: { 1: 'https://placehold.co/400x400/png' }, secretWord: '비행기 티켓', qrLink: 'https://wedding.qr/m/a1b2' },
    { id: 2, name: '이영희', nickname: '영희짱', tableNo: '2번', missions: { 1: 15, 2: 8, 3: null, 4: null, 5: 20, 6: null }, missionPhotos: { 2: 'https://placehold.co/400x400/png', 5: 'https://placehold.co/400x400/png' }, secretWord: '고양이', qrLink: 'https://wedding.qr/m/c3d4' },
    { id: 3, name: '박지민', nickname: '지민쓰', tableNo: '1번', missions: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null }, missionPhotos: {}, secretWord: '다크 모드', qrLink: 'https://wedding.qr/m/e5f6' },
    { id: 4, name: '최동석', nickname: '동석바위', tableNo: '3번', missions: { 1: 10, 2: 12, 3: 5, 4: 8, 5: 15, 6: 22 }, missionPhotos: { 2: 'https://placehold.co/400x400/png', 3: 'https://placehold.co/400x400/png' }, secretWord: '메이플랜드', qrLink: 'https://wedding.qr/m/g7h8' },
    { id: 5, name: '정은지', nickname: '은지몬', tableNo: '2층 창가', missions: { 1: null, 2: 5, 3: null, 4: 10, 5: null, 6: null }, missionPhotos: { 2: 'https://placehold.co/400x400/png' }, secretWord: '마라샹궈', qrLink: 'https://wedding.qr/m/i9j0' },
    { id: 6, name: '강동원', nickname: '참치오빠', tableNo: '5번', missions: { 1: 5, 2: null, 3: 12, 4: null, 5: null, 6: 18 }, missionPhotos: { 3: 'https://placehold.co/400x400/png', 6: 'https://placehold.co/400x400/png' }, secretWord: '축의금 봉투', qrLink: 'https://wedding.qr/m/k1l2' },
    { id: 7, name: '송혜교', nickname: '교야', tableNo: '2번', missions: { 1: 20, 2: 25, 3: 18, 4: 30, 5: 15, 6: null }, missionPhotos: { 1: 'https://placehold.co/400x400/png', 2: 'https://placehold.co/400x400/png' }, secretWord: '넷플릭스', qrLink: 'https://wedding.qr/m/m3n4' },
    { id: 8, name: '공유', nickname: '도깨비', tableNo: '6번', missions: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null }, missionPhotos: {}, secretWord: '커피 머신', qrLink: 'https://wedding.qr/m/o5p6' }
];

export default function Event() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<UserData[]>(INITIAL_MOCK_DATA);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Photo Modal State
    const [photoModalOpen, setPhotoModalOpen] = useState(false);
    const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);

    // Modal Form State
    const [newName, setNewName] = useState('');
    const [newNickname, setNewNickname] = useState('');
    const [newTableNo, setNewTableNo] = useState('');

    const handleAddGuest = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim() || !newNickname.trim() || !newTableNo.trim()) return;

        const newUser: UserData = {
            id: Date.now(),
            name: newName,
            nickname: newNickname,
            tableNo: newTableNo,
            missions: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null },
            missionPhotos: {},
            secretWord: '지정 안됨',
            qrLink: `https://wedding.qr/m/${Math.random().toString(36).substring(7)}`
        };

        setUsers([newUser, ...users]);
        setIsModalOpen(false);
        setNewName('');
        setNewNickname('');
        setNewTableNo('');
    };

    const openPhotoModal = (photoUrl: string) => {
        setCurrentPhoto(photoUrl);
        setPhotoModalOpen(true);
    };

    return (
        <div className="min-h-[100dvh] bg-[#FFF8F9] p-4 text-gray-800">
            <div className="max-w-[1400px] mx-auto space-y-6">

                {/* Header Title & Actions */}
                <div className="flex flex-col gap-4">
                    <h1 className="text-2xl pt-2 font-bold text-gray-900 tracking-tight">어드민 대시보드</h1>
                    <div className="flex flex-wrap justify-end gap-3">
                        <button
                            onClick={() => navigate('/event/lottery')}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-rose-300 rounded-[12px] text-sm font-bold text-rose-500 hover:bg-rose-50 hover:-translate-y-0.5 active:scale-[0.98] transition-all shadow-sm"
                        >
                            <Gift className="w-4 h-4" />
                            일반 추첨
                        </button>
                        <button
                            onClick={() => navigate('/event/first-prize')}
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
                        <div className="text-3xl font-bold text-gray-900">{users.length}</div>
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
                            {users.reduce((acc, user) => acc + Object.keys(user.missionPhotos).length, 0)}
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
                            {users.filter(u => Object.values(u.missions).some(m => m !== null)).length}
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
                            {users.filter(u => [1, 2, 3, 4, 5, 6].every(m => u.missions[m] !== null)).length}
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
                            <thead className="bg-rose-50/30 border-b border-rose-100/80 text-[13px] text-rose-400  tracking-wider" style={{ fontWeight: 700 }}>
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
                                    <tr key={user.id} className="hover:bg-rose-50/40 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <div className="font-bold text-gray-900 text-[15px]">{user.name}</div>
                                                <div className="text-xs text-rose-400">{user.nickname}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className="font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-[6px] text-xs border border-rose-100 whitespace-nowrap">{user.tableNo}</span>
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
                                                            <span className="text-gray-900 font-bold">{score}</span>
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
                                                <span className="text-gray-500 font-mono text-xs truncate bg-gray-50 px-2 py-1 rounded flex-1 border border-gray-100" title={user.qrLink}>{user.qrLink}</span>
                                                <button className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-[6px] transition-colors border border-transparent hover:border-rose-100" title="링크 복사">
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
                            <button onClick={() => setPhotoModalOpen(false)} className="text-gray-400 hover:text-gray-700 p-2 rounded-full transition-colors mb-2">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <img src={currentPhoto} alt="Mission Photo" className="w-[300px] h-[300px] object-cover rounded-[16px] mb-6 shadow-sm border border-gray-100" />
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
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-100 p-1.5 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAddGuest} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700 ml-1">이름</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    placeholder="예: 홍길동"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-[12px] text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400 bg-gray-50 focus:bg-white transition-colors placeholder:text-gray-400 font-medium"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700 ml-1">닉네임</label>
                                <input
                                    type="text"
                                    value={newNickname}
                                    onChange={e => setNewNickname(e.target.value)}
                                    placeholder="예: 짱구"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-[12px] text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400 bg-gray-50 focus:bg-white transition-colors placeholder:text-gray-400 font-medium"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700 ml-1">식사 자리</label>
                                <input
                                    type="text"
                                    value={newTableNo}
                                    onChange={e => setNewTableNo(e.target.value)}
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
                                    className="flex-[2] py-3 bg-rose-400 text-white rounded-[12px] font-bold shadow-[0_4px_12px_rgba(247,50,149,0.3)] hover:-translate-y-0.5 active:scale-[0.98] transition-all border-[0.75px] border-transparent"
                                >
                                    하객 생성
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}