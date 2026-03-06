'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ChevronRight, Cpu, Loader2, BookOpen, SlidersHorizontal, Hexagon, Target, ArrowLeft, Camera, Headphones, Tv } from 'lucide-react';
import { NEEDS_DICT } from '@/lib/data';
import Layout from '@/components/Layout';
import ToggleCardBtn from '@/components/ToggleCardBtn';
import SpecCard from '@/components/SpecCard';
import ProductFormModal from '@/components/admin/ProductFormModal';
import CompareBar from '@/components/CompareBar';
import { trackFeatureUsage, trackActiveUser } from '@/services/analytics';
import { useUser } from '@clerk/nextjs';
import FeatureStar from '@/components/FeatureStar';

const CompareModal = dynamic(() => import('@/components/CompareModal'), { ssr: false, loading: () => null });

export default function AIPage() {
    const { user } = useUser();
    const [step, setStep] = useState('category');
    const [activeCategory, setActiveCategory] = useState(null);
    const [userNeeds, setUserNeeds] = useState([]);
    const [experienceLevel, setExperienceLevel] = useState('advanced');
    const [sensorPref, setSensorPref] = useState('all');
    const [lensPref, setLensPref] = useState('all');
    const [bodyPref, setBodyPref] = useState('all');
    const [investmentPref, setInvestmentPref] = useState('balanced');
    const [currentGear, setCurrentGear] = useState('');
    const [loadout, setLoadout] = useState(null);
    const [aiInsight, setAiInsight] = useState('');
    const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
    const [loadingLog, setLoadingLog] = useState([]);
    const [selectedProductForSpecs, setSelectedProductForSpecs] = useState(null);
    const [compareList, setCompareList] = useState([]);
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
    const [pageToast, setPageToast] = useState(null);

    const showPageToast = (type, msg) => {
        setPageToast({ type, msg });
        setTimeout(() => setPageToast(null), 3000);
    };

    const toggleCompareItem = (productName, productType) => {
        setCompareList(prev => {
            const exists = prev.find(item => item.productName === productName);
            if (exists) return prev.filter(item => item.productName !== productName);
            if (prev.length >= 4) { showPageToast('error', 'Chỉ có thể so sánh tối đa 4 sản phẩm.'); return prev; }
            return [...prev, { productName, productType }];
        });
    };

    const addCustomCompareItem = (productName, productType) => {
        if (!productName.trim()) return;
        setCompareList(prev => {
            if (prev.find(item => item.productName === productName)) { showPageToast('error', 'Sản phẩm này đã có trong danh sách so sánh.'); return prev; }
            if (prev.length >= 4) { showPageToast('error', 'Chỉ có thể so sánh tối đa 4 sản phẩm.'); return prev; }
            return [...prev, { productName, productType }];
        });
    };

    const toggleNeed = (needId) => {
        setUserNeeds(prev => prev.includes(needId) ? prev.filter(id => id !== needId) : [...prev, needId]);
    };

    const runAnalysisSimulation = async () => {
        setStep('analyzing');
        setLoadingLog(['KHỞI CHẠY HỆ THỐNG AI TƯ VẤN SONY...']);
        try {
            const logs = [
                `MỤC TIÊU: [${userNeeds.join(', ').toUpperCase()}]`,
                `TRÌNH ĐỘ YÊU CẦU: ${experienceLevel.toUpperCase()}`,
                "TRUY XUẤT VECTOR DB: Tìm kiếm thư viện E-Mount...",
                "KẾT NỐI GEMINI: Đang tổng hợp dữ liệu (RAG)...",
                "STATUS: Đang hoàn thiện khuyến nghị cuối cùng..."
            ];
            let i = 0;
            const interval = setInterval(() => { if (i < logs.length) setLoadingLog(prev => [...prev, logs[i++]]); }, 400);
            const res = await fetch('/api/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userNeeds, experienceLevel, prefs: { sensorPref, lensPref, bodyPref, investmentPref, currentGear } })
            });
            clearInterval(interval);
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setLoadout(data);
            setStep('result');

            // Track milestone action
            fetch('/api/track_action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'ai_chats' })
            }).then(r => r.json()).then(data => {
                if (data.unlockedBadges && data.unlockedBadges.length > 0) {
                    window.dispatchEvent(new CustomEvent('badge-unlocked', { detail: { unlockedBadges: data.unlockedBadges } }));
                }
            }).catch(e => console.error("Failed to track AI chat action", e));

        } catch (err) {
            setLoadingLog(prev => [...prev, 'LỖI HỆ THỐNG: Không thể kết nối tới AI.']);
            setTimeout(() => setStep('category'), 3000);
        }
    };

    const reset = () => {
        setStep('category');
        setAiInsight('');
        setUserNeeds([]);
        setExperienceLevel('advanced');
        setSensorPref('all');
        setLensPref('all');
        setBodyPref('all');
        setInvestmentPref('balanced');
        setCurrentGear('');
        setSelectedProductForSpecs(null);
        setCompareList([]);
        setIsCompareModalOpen(false);
        setActiveCategory(null);
    };

    const handleGenerateInsight = async () => {
        setIsGeneratingInsight(true);
        const activeNeedsText = userNeeds.map(id => NEEDS_DICT[id].label).join(' và ');
        try {
            const res = await fetch('/api/insight', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ activeNeedsText, loadout })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setAiInsight(data.text);
        } catch (err) {
            setAiInsight('SYS_ERR: Could not connect to the insight core.');
        } finally {
            setIsGeneratingInsight(false);
        }
    };

    useEffect(() => {
        if (user?.primaryEmailAddress?.emailAddress) trackActiveUser(user.primaryEmailAddress.emailAddress);
    }, [user]);

    useEffect(() => {
        if (step === 'configure') trackFeatureUsage('ai_step_configure', 'AI Step: Configure');
        if (step === 'analyzing') trackFeatureUsage('ai_step_analyzing', 'AI Step: Analyzing');
        if (step === 'result') trackFeatureUsage('ai_step_result', 'AI Step: Result');
    }, [step]);

    const stages = [
        { id: 'category', label: 'NGÀNH HÀNG' },
        { id: 'configure', label: 'THIẾT LẬP' },
        { id: 'analyzing', label: 'PHÂN TÍCH' },
        { id: 'result', label: 'BÁO CÁO' }
    ];

    const renderStageNavigation = (currentStepId) => {
        const activeIndex = stages.findIndex(s => s.id === currentStepId);
        return (
            <div className="w-full flex justify-center mb-8">
                <nav className="flex items-center space-x-1 sm:space-x-2 bg-white/60 backdrop-blur-xl p-1.5 rounded-full border border-black/[0.04] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-x-auto scrollbar-hide max-w-full">
                    {stages.map((s, idx) => {
                        const isActive = idx === activeIndex;
                        const isPast = idx < activeIndex;
                        return (
                            <div key={s.id} className={`flex items-center flex-shrink-0 ${isPast ? 'cursor-pointer hover:opacity-70 transition-opacity' : ''}`}
                                onClick={() => { if (isPast) setStep(s.id); }}>
                                <div className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-[13px] whitespace-nowrap font-semibold transition-all duration-300 ${isActive ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] text-[#1d1d1f]' : isPast ? 'text-[#86868b]' : 'text-slate-400 opacity-60'}`}>
                                    {s.label}
                                </div>
                                {idx < stages.length - 1 && (<ChevronRight size={14} className={`mx-1 sm:mx-2 flex-shrink-0 ${isPast ? 'text-[#1d1d1f]' : 'text-slate-300'}`} />)}
                            </div>
                        );
                    })}
                </nav>
            </div>
        );
    };

    if (step === 'category') {
        const categories = [
            {
                id: 'digital-imaging', icon: Camera, title: 'Digital Imaging', subtitle: 'Máy ảnh & Ống kính',
                desc: 'Tư vấn thân máy Sony Alpha, ống kính G Master và hệ sinh thái E-mount phù hợp với nhu cầu sáng tạo của bạn.',
                tags: ['Máy ảnh Mirrorless', 'Ống kính G Master', 'Hệ sinh thái E-mount'],
                color: 'from-blue-500 to-indigo-600', bg: 'from-blue-50 to-indigo-50', ready: true,
            },
            {
                id: 'personal-entertainment', icon: Headphones, title: 'Personal Entertainment', subtitle: 'Tai nghe & Loa di động',
                desc: 'Trải nghiệm âm thanh đỉnh cao với dòng tai nghe WH/WF và loa SRS di động của Sony.',
                tags: ['Tai nghe WH / WF', 'Loa SRS di động', 'Noise Cancelling'],
                color: 'from-violet-500 to-purple-600', bg: 'from-violet-50 to-purple-50', ready: false,
            },
            {
                id: 'home-entertainment', icon: Tv, title: 'Home Entertainment', subtitle: 'TV & Soundbar',
                desc: 'Tư vấn TV BRAVIA XR và soundbar HT tạo nên hệ thống giải trí gia đình hoàn hảo.',
                tags: ['BRAVIA XR TV', 'Soundbar HT', 'Dolby Atmos'],
                color: 'from-emerald-500 to-teal-600', bg: 'from-emerald-50 to-teal-50', ready: false,
            },
        ];
        return (
            <Layout>
                <div className="w-full animate-slide-up flex flex-col gap-6 mx-auto">
                    {renderStageNavigation('category')}
                    <div className="mb-2 text-center px-2">
                        <h2 className="text-3xl md:text-4xl font-bold text-[#1d1d1f] tracking-tight mb-3">Chọn Ngành Hàng Sản Phẩm</h2>
                        <p className="text-[15px] text-[#86868b] font-medium">Chọn dòng sản phẩm Sony bạn muốn được tư vấn.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            return (
                                <button key={cat.id}
                                    onClick={() => { if (cat.ready) { setActiveCategory(cat.id); setStep('configure'); } }}
                                    className={`relative group flex flex-col items-start p-7 rounded-[28px] text-left transition-all duration-300 ring-1 ${cat.ready ? 'bg-white ring-black/5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.10)] hover:-translate-y-1 cursor-pointer' : 'bg-white/50 ring-black/5 opacity-60 cursor-not-allowed'}`}>
                                    {!cat.ready && (<div className="absolute top-4 right-4 bg-[#F5F5F7] text-[#86868b] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">Sắp ra mắt</div>)}
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                                        <Icon size={24} className="text-white" strokeWidth={2} />
                                    </div>
                                    <div className="text-[11px] font-bold text-[#86868b] uppercase tracking-widest mb-1">{cat.subtitle}</div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="text-[20px] font-bold text-[#1d1d1f] tracking-tight">{cat.title}</div>
                                        <FeatureStar featureId={`cat_${cat.id}`} />
                                    </div>
                                    <p className="text-[13px] text-[#86868b] leading-relaxed mb-5">{cat.desc}</p>
                                    <div className="flex flex-wrap gap-2 mt-auto">
                                        {cat.tags.map(tag => (<span key={tag} className={`text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gradient-to-r ${cat.bg} text-[#424245] ring-1 ring-black/5`}>{tag}</span>))}
                                    </div>
                                    {cat.ready && (<div className="absolute bottom-6 right-6 w-9 h-9 rounded-full bg-[#1d1d1f] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"><ChevronRight size={16} className="text-white" /></div>)}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </Layout>
        );
    }

    if (step === 'configure') {
        return (
            <Layout>
                <div className="w-full animate-slide-up flex flex-col gap-6 mx-auto">
                    {renderStageNavigation('configure')}
                    <div className="mb-2 text-center sm:text-left px-2">
                        <h2 className="text-3xl md:text-4xl font-bold text-[#1d1d1f] tracking-tight mb-3">Thông số Đầu vào</h2>
                        <p className="text-[15px] text-[#86868b] font-medium">Định chuẩn các biến số để phân tích cơ sở dữ liệu hệ sinh thái E-Mount.</p>
                    </div>

                    <div className="bg-white rounded-[32px] p-6 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.02]">
                        <div className="text-[12px] font-bold text-[#86868b] mb-6 uppercase tracking-wider flex items-center">
                            <div className="bg-[#F5F5F7] p-2 rounded-xl mr-3 text-[#1d1d1f]"><Hexagon size={16} /></div>
                            BƯỚC 1: Chọn Nhu Cầu Tác Chiến
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {Object.entries(NEEDS_DICT).map(([id, info]) => (
                                <ToggleCardBtn key={id} active={userNeeds.includes(id)} onClick={() => toggleNeed(id)} icon={info.icon} title={info.label} desc={info.desc} />
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-[32px] p-6 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.02]">
                        <div className="text-[12px] font-bold text-[#86868b] mb-8 uppercase tracking-wider flex items-center">
                            <div className="bg-[#F5F5F7] p-2 rounded-xl mr-3 text-[#1d1d1f]"><Target size={16} /></div>
                            BƯỚC 2: Bộ Lọc Sở Thích Cá Nhân
                        </div>
                        <div className="flex flex-col gap-10">
                            {[
                                { label: '1. Định Dạng Cảm Biến', state: sensorPref, setState: setSensorPref, prefix: 'sensor', opts: [{ id: 'all', label: 'Tự Động', desc: 'Tối ưu hiệu năng / giá thành.' }, { id: 'fullframe', label: 'Full Frame', desc: 'Chất lượng ảnh cao nhất.' }, { id: 'crop', label: 'Crop (APS-C)', desc: 'Nhỏ gọn, độ phóng đại cao.' }] },
                                { label: '2. Sở Thích Ống Kính', state: lensPref, setState: setLensPref, prefix: 'lens', opts: [{ id: 'all', label: 'Tự Động', desc: 'Linh hoạt theo ngân sách.' }, { id: 'zoom', label: 'Lens Zoom', desc: 'Tiện lợi, đa dụng.' }, { id: 'prime', label: 'Lens Fix', desc: 'Quang học xuất sắc.' }] },
                                { label: '3. Trọng Lượng Thân Máy', state: bodyPref, setState: setBodyPref, prefix: 'body', opts: [{ id: 'all', label: 'Tự Động', desc: 'Cân bằng hiệu năng và kích thước.' }, { id: 'compact', label: 'Nhỏ Gọn', desc: 'Di động, phù hợp Vlog.' }, { id: 'pro', label: 'Chuyên Nghiệp', desc: 'Thân máy lớn, nhiều phím cứng.' }] },
                                { label: '4. Ưu Tiên Đầu Tư', state: investmentPref, setState: setInvestmentPref, prefix: 'invest', opts: [{ id: 'balanced', label: 'Cân Bằng', desc: 'Phân bổ đều Body & Lens.' }, { id: 'body', label: 'Thân Máy Mới Nhất', desc: 'Ưu tiên công nghệ Body.' }, { id: 'lens', label: 'Đầu Tư Ống Kính', desc: 'Đầu tư Lens chất lượng.' }] },
                            ].map(({ label, state, setState, prefix, opts }) => (
                                <div key={prefix}>
                                    <label className="block text-[15px] font-semibold text-[#1d1d1f] mb-4">{label}</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {opts.map(opt => (
                                            <button key={`${prefix}-${opt.id}`} onClick={() => setState(opt.id)} className={`p-4 rounded-2xl text-left transition-all duration-300 ${state === opt.id ? 'bg-slate-900 shadow-[0_4px_12px_rgba(0,0,0,0.1)] scale-[1.02]' : 'bg-white ring-1 ring-black/5 hover:bg-[#F5F5F7]/50'}`}>
                                                <div className={`text-[15px] font-semibold mb-1 ${state === opt.id ? 'text-white' : 'text-[#1d1d1f]'}`}>{opt.label}</div>
                                                <div className={`text-[13px] ${state === opt.id ? 'text-slate-300' : 'text-[#86868b]'}`}>{opt.desc}</div>
                                            </button>
                                        ))}\

                                    </div>
                                </div>
                            ))}
                            <div>
                                <label className="block text-[15px] font-semibold text-[#1d1d1f] mb-2">5. Lộ Trình Nâng Cấp (Tùy chọn)</label>
                                <p className="text-[13px] text-[#86868b] mb-4 font-medium">Bạn đang sử dụng thiết bị nào? AI sẽ ưu tiên giữ nguyên ngàm hoặc đề xuất nâng cấp phù hợp.</p>
                                <input type="text" value={currentGear} onChange={(e) => setCurrentGear(e.target.value)} placeholder="VD: Sony A6400, Kit 16-50mm..." className="w-full px-5 py-4 bg-[#F5F5F7] ring-1 ring-black/5 rounded-2xl text-[15px] text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#1d1d1f]/10 transition-all" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[32px] p-6 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.02]">
                        <div className="text-[12px] font-bold text-[#86868b] mb-8 uppercase tracking-wider flex items-center">
                            <div className="bg-[#F5F5F7] p-2 rounded-xl mr-3 text-[#1d1d1f]"><SlidersHorizontal size={16} /></div>
                            BƯỚC 3: Trình Độ & Phân Khúc
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            {[{ id: 'newbie', label: 'Nhập Môn', desc: 'Entry-level' }, { id: 'advanced', label: 'Bán Chuyên', desc: 'Cân bằng giá & hiệu năng' }, { id: 'professional', label: 'Chuyên Nghiệp', desc: 'Dành cho công việc' }, { id: 'hi-end', label: 'Tiên Tiến', desc: 'Công nghệ cao cấp' }, { id: 'flagship', label: 'Đỉnh Cao', desc: 'Không thỏa hiệp' }].map(opt => (
                                <button key={`exp-${opt.id}`} onClick={() => setExperienceLevel(opt.id)} className={`p-4 rounded-2xl text-left transition-all duration-300 ${experienceLevel === opt.id ? 'bg-slate-900 shadow-[0_4px_12px_rgba(0,0,0,0.1)] scale-[1.02]' : 'bg-white ring-1 ring-black/5 hover:bg-[#F5F5F7]/50'}`}>
                                    <div className={`text-[14px] font-semibold mb-1 ${experienceLevel === opt.id ? 'text-white' : 'text-[#1d1d1f]'}`}>{opt.label}</div>
                                    <div className={`text-[12px] ${experienceLevel === opt.id ? 'text-slate-300' : 'text-[#86868b]'}`}>{opt.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col-reverse md:flex-row justify-end mt-4 mb-10 gap-4">
                        <button onClick={() => setStep('category')} className="w-full md:w-auto flex items-center justify-center space-x-2 bg-white text-[#1d1d1f] border border-slate-200 px-8 py-5 rounded-full hover:bg-[#F5F5F7] transition-all font-medium text-[15px]">
                            <ArrowLeft size={18} /><span>Quay Lại</span>
                        </button>
                        <button onClick={runAnalysisSimulation} disabled={userNeeds.length === 0} className="w-full md:w-auto group flex items-center justify-center space-x-3 bg-[#1d1d1f] text-white px-10 py-5 rounded-full hover:bg-black transition-all duration-300 shadow-[0_4px_14px_rgba(0,0,0,0.15)] disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5">
                            <span className="text-[15px] font-medium tracking-wide">Phân Tích Tùy Chọn</span>
                            <Cpu size={20} className="group-hover:rotate-12 transition-transform" />
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    if (step === 'analyzing') {
        return (
            <Layout>
                <div className="w-full animate-slide-up flex flex-col gap-6 mx-auto">
                    {renderStageNavigation('analyzing')}
                    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[50vh]">
                        <div className="relative mb-10">
                            <div className="w-24 h-24 bg-white rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex items-center justify-center animate-pulse">
                                <Loader2 size={36} className="animate-spin text-[#1d1d1f]" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-[#1d1d1f] mb-8 tracking-tight">Đang phân tích hệ thống...</h3>
                        <div className="w-full bg-white/60 backdrop-blur-xl rounded-[32px] p-8 border border-white/40">
                            <div className="space-y-4">
                                {loadingLog.map((log, i) => (
                                    <div key={i} className="flex items-start">
                                        <div className="mt-1 mr-4 w-5 h-5 rounded-full bg-[#F5F5F7] flex items-center justify-center flex-shrink-0"><div className="w-1.5 h-1.5 rounded-full bg-[#1d1d1f]"></div></div>
                                        <span className="text-[15px] font-medium text-[#86868b]">{log}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (step === 'result' && loadout) {
        const activeNeedsText = userNeeds.map(id => NEEDS_DICT[id].label).join(', ');
        const expLabels = { newbie: 'Nhập Môn', advanced: 'Bán Chuyên', professional: 'Chuyên Nghiệp', 'hi-end': 'Tiên Tiến', flagship: 'Đỉnh Cao' };
        const sensorLabels = { all: 'Tự Động', fullframe: 'Full Frame', crop: 'Crop (APS-C)' };
        const lensLabels = { all: 'Tự Động', zoom: 'Lens Zoom', prime: 'Lens Fix' };
        const bodyLabels = { all: 'Tự Động', compact: 'Nhỏ Gọn', pro: 'Chuyên Nghiệp' };
        const investLabels = { balanced: 'Cân Bằng', body: 'Thân Máy', lens: 'Ống Kính' };
        return (
            <Layout>
                <div className="w-full animate-slide-up flex flex-col mx-auto">
                    {renderStageNavigation('result')}
                    <div className="mb-8 md:mb-12 text-center sm:text-left flex flex-col md:flex-row md:items-start justify-between gap-6 px-2">
                        <div>
                            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 text-emerald-700 font-semibold text-[11px] px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider ring-1 ring-emerald-500/20">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div><span>Hoàn Tất Chẩn Đoán</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold text-[#1d1d1f] tracking-tight mb-2">Cấu Hình Đề Xuất</h2>
                            <p className="text-[#86868b] text-[15px] font-medium">Báo cáo dựa trên thuật toán AI.</p>
                        </div>
                        <button onClick={() => setStep('configure')} className="inline-flex self-center items-center space-x-2 bg-white text-[#1d1d1f] ring-1 ring-black/5 px-5 py-2.5 rounded-full hover:bg-[#F5F5F7] transition-all font-medium text-[13px]">
                            <ArrowLeft size={14} /><span>Chỉnh sửa thông số</span>
                        </button>
                    </div>

                    <div className="mb-8 flex flex-wrap gap-2 px-2">
                        {[
                            { label: 'Nhu cầu', value: activeNeedsText },
                            { label: 'Cấp độ', value: expLabels[experienceLevel] || experienceLevel },
                            ...(sensorPref !== 'all' ? [{ label: 'Cảm biến', value: sensorLabels[sensorPref] }] : []),
                            ...(lensPref !== 'all' ? [{ label: 'Ống kính', value: lensLabels[lensPref] }] : []),
                            ...(bodyPref !== 'all' ? [{ label: 'Body', value: bodyLabels[bodyPref] }] : []),
                            ...(investmentPref !== 'balanced' ? [{ label: 'Ưu tiên', value: investLabels[investmentPref] }] : []),
                        ].map(({ label, value }) => (
                            <span key={label} className="bg-white/60 text-[#424245] text-[13px] font-medium px-4 py-1.5 rounded-full ring-1 ring-black/[0.04]">
                                {label}: <span className="text-[#1d1d1f] font-semibold">{value}</span>
                            </span>
                        ))}
                    </div>

                    <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-6 pb-8 w-full sm:-mx-2 px-2">
                        <SpecCard data={loadout.good} isRecommended={false} onViewSpecs={(name, type) => setSelectedProductForSpecs({ productName: name, productType: type })} onToggleCompare={toggleCompareItem} compareList={compareList} />
                        <SpecCard data={loadout.better} isRecommended={true} onViewSpecs={(name, type) => setSelectedProductForSpecs({ productName: name, productType: type })} onToggleCompare={toggleCompareItem} compareList={compareList} />
                        <SpecCard data={loadout.best} isRecommended={false} onViewSpecs={(name, type) => setSelectedProductForSpecs({ productName: name, productType: type })} onToggleCompare={toggleCompareItem} compareList={compareList} />
                    </div>

                    <div className="w-full mt-8 flex flex-col gap-6">
                        <div className="bg-white rounded-[32px] p-6 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.02] relative overflow-hidden">
                            <div className="text-[12px] font-bold text-[#86868b] mb-8 uppercase tracking-wider flex items-center">
                                <div className="bg-[#F5F5F7] p-2 rounded-xl mr-3 text-[#1d1d1f]"><Cpu size={16} /></div>
                                Góc Nhìn Từ Chuyên Gia AI
                            </div>
                            {!aiInsight && !isGeneratingInsight ? (
                                <div className="flex flex-col items-center justify-center py-10">
                                    <div className="w-16 h-16 rounded-full bg-[#F5F5F7] flex items-center justify-center mb-4"><Cpu size={24} className="text-[#86868b]" /></div>
                                    <p className="text-[15px] text-[#86868b] font-medium mb-6 text-center max-w-md">Hệ thống đã chọn lọc các sản phẩm tốt nhất. Bạn có muốn AI phân tích và giải thích lý do lựa chọn không?</p>
                                    <button onClick={handleGenerateInsight} className="flex items-center space-x-2 bg-[#1d1d1f] text-white px-6 py-3 rounded-full hover:bg-black transition-all shadow-[0_4px_14px_rgba(0,0,0,0.1)]">
                                        <span className="text-[14px] font-medium">Phân Tích Bằng AI</span><ChevronRight size={16} />
                                    </button>
                                </div>
                            ) : isGeneratingInsight ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader2 size={36} className="animate-spin text-[#1d1d1f] mb-4" />
                                    <p className="text-[15px] text-[#86868b] font-medium">Đang tổng hợp nhận định từ cố vấn...</p>
                                </div>
                            ) : (
                                <div className="text-[15px] font-medium text-[#1d1d1f] leading-relaxed space-y-4">
                                    {aiInsight.split('\n').map((line, i) => {
                                        if (!line?.trim()) return <div key={i} className="h-2"></div>;
                                        if (line.trim().startsWith('-')) return (
                                            <div key={i} className="flex items-start bg-[#F5F5F7]/50 p-4 rounded-2xl">
                                                <div className="mr-3 mt-1.5 text-lg">•</div>
                                                <p className="text-[#424245]">{line.substring(1).trim()}</p>
                                            </div>
                                        );
                                        return <p key={i} className="text-[#424245]">{line}</p>;
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <a href="https://alphauniverse.com/academy/" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-br from-[#1d1d1f] to-[#2d2d2f] rounded-[32px] p-8 flex flex-col justify-between text-white group hover:shadow-[0_12px_40px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition-all duration-300 h-full relative overflow-hidden">
                                <div className="mb-6">
                                    <div className="text-[11px] font-bold text-white/50 mb-2 uppercase">Khoá Học Gợi Ý (Bởi AI)</div>
                                    <div className="text-xl font-bold mb-3">Alpha Academy: {loadout?.courseRecommendation?.name || 'Khám phá ngay'}</div>
                                    <div className="text-[14px] text-white/70">Giảng viên: {loadout?.courseRecommendation?.instructor || 'Sony Master'}</div>
                                </div>
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white border border-white/10 transition-all self-end">
                                    <BookOpen size={20} className="text-white group-hover:text-[#1d1d1f] transition-colors" strokeWidth={2} />
                                </div>
                            </a>
                            <a href="https://experience.sony-asia.com/vn/home/Workshops" target="_blank" rel="noopener noreferrer" className="bg-white rounded-[32px] p-8 flex flex-col justify-between ring-1 ring-black/[0.02] group hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all h-full">
                                <div className="mb-6">
                                    <div className="text-[11px] font-bold text-[#86868b] mb-2 uppercase">Thực Chiến Cùng Chuyên Gia</div>
                                    <div className="text-xl font-bold text-[#1d1d1f] mb-3">Sony Offline Workshops</div>
                                    <div className="text-[14px] text-[#86868b]">Đăng ký tham gia các buổi workshop thực tế offline tại Việt Nam.</div>
                                </div>
                                <div className="w-12 h-12 bg-[#F5F5F7] rounded-2xl flex items-center justify-center group-hover:bg-[#1d1d1f] transition-all self-end">
                                    <Target size={20} className="text-[#1d1d1f] group-hover:text-white transition-colors" strokeWidth={2} />
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

                {selectedProductForSpecs && (
                    <ProductFormModal
                        product={{ name: selectedProductForSpecs.productName, category: selectedProductForSpecs.productType }}
                        readOnly={true}
                        onClose={() => setSelectedProductForSpecs(null)}
                    />
                )}
                <CompareBar compareList={compareList} onRemoveItem={(n) => toggleCompareItem(n, '')} onAddCustomItem={addCustomCompareItem} onCompare={() => setIsCompareModalOpen(true)} />
                <CompareModal isOpen={isCompareModalOpen} onClose={() => setIsCompareModalOpen(false)} compareList={compareList} />

                {pageToast && (
                    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] px-5 py-3 rounded-2xl text-[13px] font-semibold shadow-xl ${pageToast.type === 'success' ? 'bg-[#1d1d1f] text-white' : 'bg-rose-600 text-white'}`}>{pageToast.msg}</div>
                )}
            </Layout>
        );
    }

    return null;
}
