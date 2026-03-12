import React, { useState, useEffect, useRef } from 'react';
import { Camera, Monitor, Upload, SlidersHorizontal, ChevronRight, ChevronLeft, PowerOff, Loader2, Mic, Settings2, FlipHorizontal, Download, Link, KeyRound, MonitorPlay, BookOpen, X, CheckCircle2, Cable, Laptop, RadioReceiver, Video, Lightbulb, PlayCircle, Star, Settings, Plus, Trash2, ClipboardList, Wand2, Bot, Send, Sparkles, BarChart3, Aperture, Printer } from 'lucide-react';
import { platformIcons } from '@/data/platformIcons';
import { platformsData } from '@/data/platformsData';
import StudioDiagram from './livestream/StudioDiagram';
import { useRoleAccess } from '@/components/RoleProvider';
import { saveLiveReport } from '@/services/db';
import { getLiveStreamConfig, updateLiveStreamConfig, getLiveStreamEquipment, updateLiveStreamEquipment } from '@/lib/supabaseClient';
import { useUser } from '@clerk/nextjs';
import { trackClientAction } from '@/lib/trackActionClient';

export default function LiveStream() {
    const videoRef = useRef(null);

    const [devices, setDevices] = useState([]);
    const [audioDevices, setAudioDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState('');
    const [selectedAudioDevice, setSelectedAudioDevice] = useState('');
    const [stream, setStream] = useState(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [cameraError, setCameraError] = useState('');
    const { user } = useUser();
    const { canViewReport, roleKeys } = useRoleAccess();
    const isEmployee = roleKeys?.some(k => ['DEV', 'TRAINER', 'PRODUCT_MARKETING', 'DATA'].includes(k));

    const [liveConfig, setLiveConfig] = useState({ 
        pictureProfile: `Công thức PROCOLOR-003: EXTRA DR Stream 109
- Black Level: -5
- Gamma: Cine4
- Black Gamma: Wide -7
- Knee: Auto
- Color Mode: Pro
- Saturation: +8
- Color Phase: 0
- Color Depth: R-1, G-1, B+1, C+1, M+1, Y-1
- Detail: Lvl 0, Mode Manual, V/H Bal 2, B/W Bal Type 3, Limit 3, Crisp 7, Hi-Light 4` 
    });
    const [isEditingPP, setIsEditingPP] = useState(false);
    const [tempPPText, setTempPPText] = useState('');

    const [equipmentList, setEquipmentList] = useState([]);
    const [isEditingEquipment, setIsEditingEquipment] = useState(false);

    useEffect(() => {
        async function fetchConfig() {
            try {
                const [config, equipment] = await Promise.all([
                    getLiveStreamConfig(),
                    getLiveStreamEquipment()
                ]);
                setLiveConfig(config);
                setTempPPText(config.pictureProfile);
                setEquipmentList(equipment || []);
            } catch (err) {
                console.error(err);
            }
        }
        fetchConfig();
    }, []);

    const handleSavePP = async () => {
        try {
            await updateLiveStreamConfig({ pictureProfile: tempPPText });
            setLiveConfig({ pictureProfile: tempPPText });
            setIsEditingPP(false);
        } catch (err) {
            alert('Lỗi cập nhật: ' + err.message);
        }
    };

    const [activePlatformIndex, setActivePlatformIndex] = useState(0);
    const [platforms, setPlatforms] = useState(platformsData);
    const [currentStep, setCurrentStep] = useState(1);

    const activePlatform = platforms[activePlatformIndex] || null;
    const PlatformIcon = activePlatform ? activePlatform.icon : Camera;

    const steps = [
        { id: 1, title: 'Chuẩn bị', icon: ClipboardList },
        { id: 2, title: 'Kết nối', icon: Cable },
        { id: 3, title: 'Máy ảnh', icon: Camera },
        { id: 4, title: 'Phần mềm', icon: Laptop },
        { id: 5, title: 'Ánh sáng', icon: Lightbulb },
        { id: 6, title: 'Kịch Bản', icon: Wand2 },
        { id: 7, title: 'Báo cáo', icon: CheckCircle2 }
    ];

    // Equipment and Report States
    // Script & Chatbot States
    const [scriptTitle, setScriptTitle] = useState('');
    const [scriptDesc, setScriptDesc] = useState('');
    const [generatedTimeline, setGeneratedTimeline] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [chatMessages, setChatMessages] = useState([
        { role: 'model', text: 'Xin chào! Tôi là trợ lý AI Live. Hỏi tôi bất cứ điều gì về sản phẩm Sony nhé! 🎬' }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const chatEndRef = useRef(null);


    // --- Post-Live Report State ---
    const [reportMetrics, setReportMetrics] = useState({
        topic: '',
        startTime: '',
        endTime: '',
        note: '',
        platforms: [] // Array of { name, views, likes, pcu, followers, clicks, orders, revenue }
    });

    // Initialize with active platform if empty
    useEffect(() => {
        if (activePlatform && reportMetrics.platforms.length === 0) {
            setReportMetrics(prev => ({
                ...prev,
                platforms: [{
                    name: activePlatform.name,
                    views: '', likes: '', pcu: '', followers: '', clicks: '', orders: '', revenue: ''
                }]
            }));
        }
    }, [activePlatform, reportMetrics.platforms.length, setReportMetrics]);
    const [isSavingReport, setIsSavingReport] = useState(false);
    const [reportSaved, setReportSaved] = useState(false);

    const handleSaveReport = async () => {
        if (!user) return;
        setIsSavingReport(true);
        try {
            // Aggregate totals across all platforms
            let totalViews = 0, totalOrders = 0, totalRevenue = 0, totalClicks = 0, totalLikes = 0;

            const processedPlatforms = reportMetrics.platforms.map(p => {
                const views = Number(p.views || 0);
                const orders = Number(p.orders || 0);
                const revenue = Number(p.revenue || 0);

                totalViews += views;
                totalOrders += orders;
                totalRevenue += revenue;
                totalClicks += Number(p.clicks || 0);
                totalLikes += Number(p.likes || 0);

                return {
                    ...p,
                    views, orders, revenue,
                    cvr: views > 0 ? ((orders / views) * 100).toFixed(2) : 0,
                    gpm: views > 0 ? ((revenue / views) * 1000).toFixed(0) : 0
                };
            });

            const totalCVR = totalViews > 0 ? ((totalOrders / totalViews) * 100).toFixed(2) : 0;
            const totalGPM = totalViews > 0 ? ((totalRevenue / totalViews) * 1000).toFixed(0) : 0;

            await saveLiveReport({
                topic: reportMetrics.topic,
                startTime: reportMetrics.startTime,
                endTime: reportMetrics.endTime,
                note: reportMetrics.note,
                platforms: processedPlatforms,
                views: totalViews,
                orders: totalOrders,
                revenue: totalRevenue,
                likes: totalLikes,
                productClicks: totalClicks,
                cvr: totalCVR,
                gpm: totalGPM,
                userEmail: user.primaryEmailAddress?.emailAddress,
                userName: user.fullName,
                timestamp: new Date().toISOString()
            });

            // Track milestone action
            trackClientAction('live_reports_submitted');

            setReportSaved(true);
            setTimeout(() => {
                setReportSaved(false);
                setCurrentStep(1);
                setReportMetrics({
                    topic: '', startTime: '', endTime: '', note: '',
                    platforms: activePlatform ? [{
                        name: activePlatform.name,
                        views: '', likes: '', pcu: '', followers: '', clicks: '', orders: '', revenue: ''
                    }] : []
                });
            }, 3000);
        } catch (err) {
            console.error("Failed to save report:", err);
            alert("Lỗi khi lưu báo cáo: " + err.message);
        } finally {
            setIsSavingReport(false);
        }
    };

    // Render the AI-generated script with proper formatting
    const renderFormattedScript = (text) => {
        if (!text) return null;
        const lines = text.split('\n');
        return lines.map((line, i) => {
            const clean = line.replace(/\*\*/g, '').trim();
            if (!clean) return <div key={i} className="h-2" />;

            // Section headers: ━━━ PHẦN ... ━━━
            if (/━━|——/.test(clean) || /^PHẦN \d/.test(clean)) {
                return (
                    <div key={i} className="flex items-center gap-2 mt-6 mb-3">
                        <div className="h-px flex-1 bg-violet-300/50" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-violet-600 px-2">
                            {clean.replace(/━/g, '').replace(/-/g, '').trim()}
                        </span>
                        <div className="h-px flex-1 bg-violet-300/50" />
                    </div>
                );
            }

            // Timeline items: start with a time like 00:00 or [00:00]
            if (/^\[?\d{2}:\d{2}/.test(clean)) {
                // Match time range like "00:00 - 00:05" or single "00:00"
                const timeRangeMatch = clean.match(/^(\d{2}:\d{2}(?:\s*-\s*\d{2}:\d{2})?)/);
                const timeRange = timeRangeMatch ? timeRangeMatch[0].trim() : '';
                const rest = clean.slice(timeRange.length).replace(/^[\s\-]+/, '');
                const parts = rest.split(/\s*-\s*/);
                const activity = parts[0]?.trim();
                const detail = parts.slice(1).join(' - ').trim();
                return (
                    <div key={i} className="flex gap-3 items-start py-2 border-b border-black/5 last:border-0">
                        <span className="shrink-0 text-[11px] font-black text-violet-600 bg-violet-50 px-2.5 py-1 rounded-lg text-center whitespace-nowrap">{timeRange}</span>
                        <div className="flex flex-col gap-0.5">
                            {activity && <span className="text-[13px] font-bold text-[#1d1d1f] leading-snug">{activity}</span>}
                            {detail && <span className="text-[12px] text-[#86868b] leading-snug">{detail}</span>}
                        </div>
                    </div>
                );
            }

            // Bullet points: start with • or *
            if (/^[•*]\s/.test(clean) || /^•/.test(clean)) {
                const parts = clean.replace(/^[•*]\s*/, '').split('→');
                const spec = parts[0]?.trim();
                const usage = parts[1]?.trim();
                return (
                    <div key={i} className="flex gap-2.5 items-start py-1.5">
                        <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-violet-400 mt-2" />
                        <div>
                            {spec && <span className="text-[13px] font-semibold text-[#1d1d1f]">{spec}</span>}
                            {usage && <div className="text-[12px] text-[#86868b] mt-0.5">↪ {usage}</div>}
                        </div>
                    </div>
                );
            }

            // Regular text / subheadings
            return (
                <p key={i} className="text-[13px] font-semibold text-[#1d1d1f] leading-relaxed py-0.5">{clean}</p>
            );
        });
    };

    // Timeline generation handler
    const handleGenerateTimeline = async () => {
        if (!scriptTitle.trim()) return;
        setIsGenerating(true);
        setGeneratedTimeline('');
        try {
            const res = await fetch('/api/live-timeline', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: scriptTitle, description: scriptDesc })
            });
            const data = await res.json();
            if (data.error) throw new Error(typeof data.error === 'string' ? data.error : (data.error.message || JSON.stringify(data.error)));
            setGeneratedTimeline(data.timeline || 'Không có phản hồi từ AI.');
        } catch (e) {
            setGeneratedTimeline(`Lỗi kết nối AI: ${e.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    // Chatbot handler
    const handleChatSend = async () => {
        const trimmed = chatInput.trim();
        if (!trimmed || isChatLoading) return;
        const newMessages = [...chatMessages, { role: 'user', text: trimmed }];
        setChatMessages(newMessages);
        setChatInput('');
        setIsChatLoading(true);
        try {
            const res = await fetch('/api/live-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: newMessages })
            });
            const data = await res.json();
            if (data.error) throw new Error(typeof data.error === 'string' ? data.error : (data.error.message || JSON.stringify(data.error)));
            setChatMessages(prev => [...prev, { role: 'model', text: data.text || '...' }]);
        } catch (e) {
            setChatMessages(prev => [...prev, { role: 'model', text: `Lỗi kết nối: ${e.message}` }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    // Auto-scroll chatbot
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    // Video adjustment states
    const [isMirrored, setIsMirrored] = useState(false);
    const [brightness, setBrightness] = useState(100);
    const [saturation, setSaturation] = useState(100);

    // Get available cameras and microphones
    useEffect(() => {
        async function getDevices() {
            try {
                // Request permission first to get labels
                const streamForPerms = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                const allDevices = await navigator.mediaDevices.enumerateDevices();

                // Stop the permission stream tracks immediately
                streamForPerms.getTracks().forEach(t => t.stop());

                const videoDevices = allDevices.filter(d => d.kind === 'videoinput');
                setDevices(videoDevices);
                if (videoDevices.length > 0) {
                    setSelectedDevice(videoDevices[0].deviceId);
                }

                const audioDevs = allDevices.filter(d => d.kind === 'audioinput');
                setAudioDevices(audioDevs);
                if (audioDevs.length > 0) {
                    setSelectedAudioDevice(audioDevs[0].deviceId);
                }
            } catch (err) {
                console.error("Camera/Mic access denied or error:", err);
                setCameraError("Không thể truy cập thiết bị. Vui lòng cấp quyền trong trình duyệt.");
            }
        }
        getDevices();
    }, []);

    // Handle stream start/stop
    useEffect(() => {
        if (!isStreaming || !selectedDevice) return;

        let currentStream = null;

        async function startStream() {
            try {
                setCameraError('');
                currentStream = await navigator.mediaDevices.getUserMedia({
                    video: selectedDevice ? { deviceId: { exact: selectedDevice }, width: { ideal: 1920 }, height: { ideal: 1080 } } : true,
                    audio: selectedAudioDevice ? { deviceId: { exact: selectedAudioDevice } } : false
                });
                setStream(currentStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = currentStream;
                    videoRef.current.play();
                }
            } catch (err) {
                setCameraError("Lỗi kết nối tới thiết bị Camera: " + err.message);
                setIsStreaming(false);
            }
        }

        startStream();

        const currentVideoRef = videoRef.current;

        return () => {
            if (currentStream) {
                currentStream.getTracks().forEach(t => t.stop());
            }
            setStream(null);
            if (currentVideoRef) currentVideoRef.srcObject = null;
        };
    }, [isStreaming, selectedDevice, selectedAudioDevice]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(t => t.stop());
            }
        };
    }, [stream]);

    // Platform navigation
    const nextPlatform = () => setActivePlatformIndex((prev) => platforms.length ? (prev + 1) % platforms.length : 0);
    const prevPlatform = () => setActivePlatformIndex((prev) => platforms.length ? (prev - 1 + platforms.length) % platforms.length : 0);


    return (
        <div className="w-full animate-slide-up flex flex-col mx-auto min-h-[85vh] print:min-h-0 print:w-full">
            <div className="mb-6 px-2 print:hidden">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-700 font-semibold text-[11px] px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider ring-1 ring-teal-500/20">
                    <Monitor size={12} className="mr-1" />
                    <span>Live Studio Hub</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-[#1d1d1f] tracking-tight mb-2">Trung tâm Livestream</h2>
                <p className="text-[#86868b] text-[15px] font-medium">Bản xem trước Camera trực tiếp và Hướng dẫn thiết lập cho từng nền tảng thương mại điện tử.</p>
            </div>

            <div className="flex flex-col gap-6 px-2 flex-grow h-full pb-12 print:pb-0 print:p-0">
                {/* Premium Step Navigation */}
                <div className="w-full relative py-8 px-4 sm:px-10 mb-8 bg-white/40 backdrop-blur-xl rounded-[40px] ring-1 ring-black/[0.03] shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden print:hidden">
                    {/* Background decorative elements */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-teal-500/5 blur-[100px] -z-10"></div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -z-10"></div>

                    {/* Navigation Container with horizontal scroll for Mobile */}
                    <div className="overflow-x-auto scrollbar-hide py-4 -my-4">
                        <div className="relative flex justify-between items-center min-w-[600px] sm:min-w-0 max-w-5xl mx-auto px-4 mt-2">
                            {/* Progress Line Container */}
                            <div className="absolute top-[24px] sm:top-[28px] left-0 right-0 h-[2px] z-0 mx-6 sm:mx-[28px]">
                                {/* Background Line */}
                                <div className="absolute inset-0 bg-slate-200 rounded-full"></div>
                                {/* Dynamic Active Progress Line */}
                                <div
                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-teal-500 to-emerald-400 z-0 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-full shadow-[0_0_15px_rgba(20,184,166,0.3)]"
                                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                                ></div>
                            </div>

                            {steps.map((step) => {
                                const Icon = step.icon;
                                const isActive = currentStep === step.id;
                                const isPast = currentStep > step.id;
                                const isFuture = currentStep < step.id;

                                return (
                                    <button
                                        key={step.id}
                                        onClick={() => setCurrentStep(step.id)}
                                        className={`relative z-10 flex flex-col items-center group transition-all duration-500 ${step.id === 2 ? 'hidden md:flex' : ''} ${isActive ? 'scale-110' : 'hover:scale-105'}`}
                                    >
                                        {/* Icon Container */}
                                        <div className={`
                                        w-12 h-12 sm:w-14 sm:h-14 rounded-[20px] flex items-center justify-center transition-all duration-500 relative
                                        ${isActive
                                                ? 'bg-[#1d1d1f] text-white shadow-[0_15px_30px_rgba(0,0,0,0.2)] scale-110'
                                                : isPast
                                                    ? 'bg-white text-teal-600 ring-2 ring-teal-500/20 shadow-sm'
                                                    : 'bg-white text-slate-400 ring-1 ring-black/5 shadow-sm group-hover:ring-slate-300'
                                            }
                                    `}>
                                            {/* Status Glow for Active */}
                                            {isActive && (
                                                <div className="absolute inset-0 rounded-[20px] bg-teal-500/20 animate-ping -z-10"></div>
                                            )}

                                            <Icon size={isActive ? 24 : 20} strokeWidth={isActive ? 2.5 : 2} className="transition-transform duration-500" />

                                            {/* Completed Checkmark Overlay */}
                                            {isPast && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white ring-2 ring-white shadow-lg animate-fade-in-up">
                                                    <CheckCircle2 size={12} strokeWidth={3} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Label Text */}
                                        <div className="mt-4 flex flex-col items-center">
                                            <span className={`
                                            text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-500 whitespace-nowrap
                                            ${isActive
                                                    ? 'text-[#1d1d1f] translate-y-0 opacity-100'
                                                    : isPast
                                                        ? 'text-teal-600/80 opacity-80'
                                                        : 'text-slate-400 opacity-60 group-hover:opacity-100'
                                                }
                                        `}>
                                                {step.title}
                                            </span>
                                            {/* Active underline indicator */}
                                            <div className={`h-[3px] rounded-full bg-teal-500 transition-all duration-700 mt-1.5 ${isActive ? 'w-4 opacity-100' : 'w-0 opacity-0'}`}></div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {currentStep === 1 && (
                    <div className="flex flex-col w-full animate-fade-in gap-6 print:m-0 print:p-0 print:gap-2">
                        {/* Print Header */}
                        <div className="hidden print:flex flex-col mb-6 items-center border-b-2 border-black pb-4 mt-8">
                            <h2 className="text-2xl font-black uppercase text-black">Cẩm Nang SONY</h2>
                            <h3 className="text-xl font-bold mt-1">Danh Sách Thiết Bị Cài Đặt Pre-Live</h3>
                            <p className="text-[13px] font-medium mt-1">Biểu mẫu kiểm kê ngày: {new Date().toLocaleDateString('vi-VN')}</p>
                        </div>
                        
                        <div className="glass-panel p-6 sm:p-10 rounded-[40px] bg-white print:p-0 print:shadow-none print:border-none print:rounded-none">
                            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 pb-4 border-b border-black/5 gap-4 print:hidden">
                                <div className="flex items-center gap-3">
                                    <ClipboardList size={28} className="text-teal-600" />
                                    <div>
                                        <h4 className="text-[22px] font-black text-[#1d1d1f] flex items-center gap-2">
                                            Chuẩn bị Thiết bị (Pre-Live)
                                        </h4>
                                        <p className="text-[13px] text-[#86868b] font-medium mt-1">Danh sách kiểm kê thiết bị phòng live.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 print:hidden">
                                    {isEmployee && (
                                        <button
                                            onClick={() => setIsEditingEquipment(!isEditingEquipment)}
                                            className={`px-4 py-2 rounded-xl font-bold text-[13px] transition-all flex items-center gap-2 ${isEditingEquipment ? 'bg-teal-500 text-white shadow-md' : 'bg-[#F5F5F7] text-[#1d1d1f] hover:bg-slate-200'}`}
                                        >
                                            <Settings size={16} />
                                            {isEditingEquipment ? 'Đang chỉnh sửa' : 'Chỉnh sửa'}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => window.print()}
                                        className="px-4 py-2 rounded-xl bg-[#1d1d1f] text-white font-bold text-[13px] hover:bg-black/80 transition-all flex items-center gap-2 shadow-md"
                                    >
                                        <Printer size={16} /> Print PDF
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto w-full custom-scrollbar pb-4 print:overflow-hidden print:pb-0">
                                <table className="w-full text-left border-collapse min-w-[900px] print:min-w-0 print:w-full print:text-[11px] print:leading-tight">
                                    <thead>
                                        <tr className="bg-[#F5F5F7] text-[#86868b] text-[12px] uppercase tracking-wider font-bold print:bg-slate-200 print:text-black print:border-y-2 print:border-black print:text-[10px]">
                                            <th className="p-3 border-b border-r border-slate-200 rounded-tl-xl w-[50px] text-center print:border-black/20 print:border-l print:rounded-none print:w-auto print:px-1 print:py-1.5">No.</th>
                                            <th className="p-3 border-b border-r border-slate-200 w-[180px] print:border-black/20 print:w-auto print:px-1 print:py-1.5">Group</th>
                                            <th className="p-3 border-b border-r border-slate-200 w-[120px] print:w-auto print:px-1 print:py-1.5 print:whitespace-nowrap">Brand</th>
                                            <th className="p-3 border-b border-r border-slate-200 min-w-[200px] print:w-auto print:px-2 print:py-1.5">Gear list</th>
                                            <th className="p-3 border-b border-r border-slate-200 w-[80px] text-center print:w-auto print:px-1 print:py-1.5 print:whitespace-nowrap">Qty</th>
                                            <th className="p-3 border-b border-r border-slate-200 w-[120px] print:w-auto print:px-1 print:py-1.5">Serial number</th>
                                            <th className="p-3 border-b border-r border-slate-200 w-[100px] text-center print:w-auto print:px-1 print:py-1.5 print:whitespace-nowrap">Source</th>
                                            <th className="p-3 border-b border-r border-slate-200 w-[100px] text-center print:border-black/20 print:w-auto print:px-1 print:py-1.5 print:whitespace-nowrap">Status</th>
                                            {!isEditingEquipment && <th className="p-3 border-b border-l border-slate-200 w-[80px] text-center rounded-tr-xl print:table-cell print:border-black/20 print:border-r print:border-l-0 print:rounded-none print:w-auto print:px-1 print:py-1.5">Check</th>}
                                            {isEditingEquipment && <th className="p-3 border-b border-l border-slate-200 w-[60px] text-center rounded-tr-xl print:hidden">Xóa</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="text-[13px] text-[#1d1d1f] align-middle">
                                        {equipmentList.map((item, index) => (
                                            <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors print:border-b-black/20 print:break-inside-avoid">
                                                <td className="p-3 border-r border-slate-100 text-center font-bold text-[#86868b] print:border-black/20 print:border-l print:text-black print:px-1 print:py-1">{index + 1}</td>
                                                
                                                {/* Group */}
                                                <td className="p-3 border-r border-slate-100 print:border-black/20 print:px-1 print:py-1">
                                                    {isEditingEquipment ? 
                                                        <input type="text" value={item.group || ''} onChange={(e) => {
                                                            const newList = [...equipmentList];
                                                            newList[index].group = e.target.value;
                                                            setEquipmentList(newList);
                                                        }} className="w-full bg-white border border-slate-200 rounded px-2 py-1 outline-none focus:border-teal-500" />
                                                    : <span className="font-semibold text-indigo-600">{item.group}</span>}
                                                </td>

                                                {/* Brand */}
                                                <td className="p-3 border-r border-slate-100 print:border-black/20 print:px-1 print:py-1">
                                                    {isEditingEquipment ? 
                                                        <input type="text" value={item.brand || ''} onChange={(e) => {
                                                            const newList = [...equipmentList];
                                                            newList[index].brand = e.target.value;
                                                            setEquipmentList(newList);
                                                        }} className="w-full bg-white border border-slate-200 rounded px-2 py-1 outline-none focus:border-teal-500" />
                                                    : item.brand}
                                                </td>

                                                {/* Gear list */}
                                                <td className="p-3 border-r border-slate-100 font-bold print:border-black/20 print:text-black print:px-2 print:py-1">
                                                    {isEditingEquipment ? 
                                                        <input type="text" value={item.gearList || ''} onChange={(e) => {
                                                            const newList = [...equipmentList];
                                                            newList[index].gearList = e.target.value;
                                                            setEquipmentList(newList);
                                                        }} className="w-full bg-white border border-slate-200 rounded px-2 py-1 outline-none focus:border-teal-500" />
                                                    : item.gearList}
                                                </td>

                                                {/* Quantity */}
                                                <td className="p-3 border-r border-slate-100 text-center print:border-black/20 print:px-1 print:py-1">
                                                    {isEditingEquipment ? 
                                                        <input type="number" value={item.quantity || ''} onChange={(e) => {
                                                            const newList = [...equipmentList];
                                                            newList[index].quantity = e.target.value;
                                                            setEquipmentList(newList);
                                                        }} className="w-full bg-white border border-slate-200 rounded px-2 py-1 outline-none focus:border-teal-500 text-center" />
                                                    : <span className="inline-block bg-slate-100 px-2.5 py-0.5 rounded-lg font-black text-slate-700">{item.quantity}</span>}
                                                </td>

                                                {/* Serial number */}
                                                <td className="p-3 border-r border-slate-100 print:border-black/20 print:px-1 print:py-1">
                                                    {isEditingEquipment ? 
                                                        <input type="text" value={item.serialNumber || ''} onChange={(e) => {
                                                            const newList = [...equipmentList];
                                                            newList[index].serialNumber = e.target.value;
                                                            setEquipmentList(newList);
                                                        }} className="w-full bg-white border border-slate-200 rounded px-2 py-1 outline-none focus:border-teal-500 text-xs font-mono" />
                                                    : <span className="text-xs font-mono text-slate-500">{item.serialNumber}</span>}
                                                </td>

                                                {/* Source */}
                                                <td className="p-3 border-r border-slate-100 text-center print:border-black/20 print:px-1 print:py-1">
                                                    {isEditingEquipment ? 
                                                        <input type="text" value={item.source || ''} onChange={(e) => {
                                                            const newList = [...equipmentList];
                                                            newList[index].source = e.target.value;
                                                            setEquipmentList(newList);
                                                        }} className="w-full bg-white border border-slate-200 rounded px-2 py-1 outline-none focus:border-teal-500 text-center" />
                                                    : item.source}
                                                </td>

                                                {/* Status */}
                                                <td className="p-3 border-r border-slate-100 text-center print:border-black/20 print:px-1 print:py-1">
                                                    {isEditingEquipment ? 
                                                        <input type="text" value={item.status || ''} onChange={(e) => {
                                                            const newList = [...equipmentList];
                                                            newList[index].status = e.target.value;
                                                            setEquipmentList(newList);
                                                        }} className="w-full bg-white border border-slate-200 rounded px-2 py-1 outline-none focus:border-teal-500 text-center" />
                                                    : <span className={`inline-block px-2 py-1 rounded-md text-[11px] font-bold ${item.status?.toLowerCase() === 'good' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                                                        {item.status || '-'}
                                                      </span>
                                                    }
                                                </td>

                                                {/* Actions */}
                                                {!isEditingEquipment && (
                                                    <td className="p-3 border-slate-100 text-center print:table-cell print:border-black/20 print:border-r print:px-1 print:py-1">
                                                        <div className="flex items-center justify-center">
                                                            <input 
                                                                type="checkbox" 
                                                                className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer accent-teal-600 print:appearance-none print:w-4 print:h-4 print:border-2 print:border-black print:rounded-sm"
                                                                checked={item.checked || false}
                                                                onChange={(e) => {
                                                                    const newList = [...equipmentList];
                                                                    newList[index].checked = e.target.checked;
                                                                    setEquipmentList(newList);
                                                                }}
                                                            />
                                                        </div>
                                                    </td>
                                                )}

                                                {isEditingEquipment && (
                                                    <td className="p-3 border-l border-slate-100 text-center print:hidden">
                                                        <button 
                                                            onClick={() => {
                                                                const newList = equipmentList.filter((_, i) => i !== index);
                                                                setEquipmentList(newList);
                                                            }}
                                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {isEditingEquipment && (
                                <div className="mt-4 flex gap-3 print:hidden border-t border-slate-100 pt-4">
                                    <button
                                        onClick={() => {
                                            setEquipmentList([...equipmentList, {
                                                id: Date.now(), group: '', brand: '', gearList: '', quantity: 1, serialNumber: '', source: '', status: 'Good', checked: false
                                            }]);
                                        }}
                                        className="px-4 py-2 rounded-xl bg-teal-50 text-teal-600 font-bold text-[13px] hover:bg-teal-100 transition-colors flex items-center gap-2"
                                    >
                                        <Plus size={16} /> Thêm Dòng
                                    </button>
                                    <button
                                        onClick={async () => {
                                            try {
                                                await updateLiveStreamEquipment(equipmentList);
                                                alert('Lưu danh sách thiết bị thành công!');
                                                setIsEditingEquipment(false);
                                            } catch (err) {
                                                alert('Lỗi khi lưu: ' + err.message);
                                            }
                                        }}
                                        className="px-6 py-2 rounded-xl bg-teal-600 text-white font-bold text-[13px] hover:bg-teal-700 transition-colors ml-auto shadow-md"
                                    >
                                        Lưu Thay Đổi
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex justify-end mt-8 print:hidden">
                            <button
                                onClick={() => setCurrentStep(2)}
                                className="px-6 py-3 rounded-xl bg-[#1d1d1f] text-white font-bold text-[14px] flex items-center gap-2 hover:opacity-90 transition-opacity"
                            >
                                Tiếp tục <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="flex flex-col gap-8 w-full animate-fade-in relative z-10">
                        {/* Header Section for Step 2 */}
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 px-4 sm:px-0">
                            <div className="flex flex-col">
                                <h3 className="text-[22px] md:text-[28px] font-black text-[#1d1d1f] flex items-center gap-3">
                                    <Cable size={28} className="text-indigo-500" />
                                    Thiết lập Kết nối Studio
                                </h3>
                                <p className="text-[14px] text-[#86868b] font-medium mt-1">Gắn cáp theo sơ đồ chuẩn và kiểm tra tín hiệu Camera.</p>
                            </div>
                            <div className="flex items-center gap-3 bg-white/60 backdrop-blur-md px-5 py-2.5 rounded-2xl ring-1 ring-black/5 shadow-sm">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-[12px] font-black text-[#1d1d1f] uppercase tracking-widest">Hệ thống đang sẵn sàng</span>
                            </div>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-8 w-full">
                            {/* Visual Studio (Camera Preview) - Now as a sidebar-like control panel on desktop */}
                            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 flex flex-col gap-6">
                                <div className="glass-panel p-6 sm:p-8 rounded-[40px] flex flex-col h-full border-t-4 border-t-teal-500 shadow-xl shadow-teal-500/5">
                                    <div className="flex flex-col gap-4 mb-5">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-teal-50 p-2.5 rounded-xl text-teal-600 flex-shrink-0 ring-1 ring-teal-500/10">
                                                <Camera size={20} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-[17px] font-bold text-[#1d1d1f] truncate">Màn hình Kiểm soát</h3>
                                                <p className="text-[12px] text-[#86868b] truncate">Giám sát luồng hình ảnh & âm thanh</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 w-full mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-[#F5F5F7] rounded-xl text-[#86868b]"><Camera size={16} /></div>
                                                <select
                                                    className="bg-[#F5F5F7] border border-slate-200 text-[#1d1d1f] text-[13px] font-medium rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500/50 w-full truncate flex-1 shadow-sm transition-all"
                                                    value={selectedDevice}
                                                    onChange={(e) => setSelectedDevice(e.target.value)}
                                                    disabled={isStreaming}
                                                >
                                                    {devices.length === 0 ? <option>Đang tìm Camera...</option> :
                                                        devices.map((d, i) => (
                                                            <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${i + 1}`}</option>
                                                        ))
                                                    }
                                                </select>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-[#F5F5F7] rounded-xl text-[#86868b]"><Mic size={16} /></div>
                                                <select
                                                    className="bg-[#F5F5F7] border border-slate-200 text-[#1d1d1f] text-[13px] font-medium rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500/50 w-full truncate flex-1 shadow-sm transition-all"
                                                    value={selectedAudioDevice}
                                                    onChange={(e) => setSelectedAudioDevice(e.target.value)}
                                                    disabled={isStreaming}
                                                >
                                                    {audioDevices.length === 0 ? <option>Đang tìm Micro...</option> :
                                                        audioDevices.map((d, i) => (
                                                            <option key={d.deviceId} value={d.deviceId}>{d.label || `Microphone ${i + 1}`}</option>
                                                        ))
                                                    }
                                                </select>
                                            </div>
                                            <button
                                                onClick={() => setIsStreaming(!isStreaming)}
                                                className={`w-full mt-2 py-3 rounded-2xl text-[14px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${isStreaming ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20' : 'bg-[#1d1d1f] text-white hover:bg-black shadow-black/20'}`}
                                            >
                                                {isStreaming ? <PowerOff size={18} /> : <Monitor size={18} />}
                                                {isStreaming ? 'Ngắt Kết Nối' : 'Kích hoạt Preview'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Video Canvas Container (9:16 Aspect Ratio) */}
                                    <div className="relative w-full max-w-[340px] mx-auto aspect-[9/16] bg-slate-900 rounded-[32px] overflow-hidden ring-4 ring-black/[0.03] flex items-center justify-center mb-6 shadow-2xl overflow-hidden group">
                                        {/* Scanline effect for look-and-feel */}
                                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%] pointer-events-none z-10 opacity-20"></div>

                                        {cameraError ? (
                                            <div className="text-red-400 text-[13px] font-bold px-8 text-center relative z-20">
                                                <PowerOff size={32} className="mx-auto mb-3 opacity-50" />
                                                {cameraError}
                                            </div>
                                        ) : !isStreaming ? (
                                            <div className="flex flex-col items-center justify-center text-slate-400 text-center p-6 relative z-20">
                                                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 ring-1 ring-white/10">
                                                    <Camera size={28} className="opacity-40" />
                                                </div>
                                                <p className="text-[14px] font-bold leading-relaxed px-4">Nhấn nút kích hoạt để kết nối Sony Camlink / USB Video.</p>
                                            </div>
                                        ) : (
                                            <>
                                                <video
                                                    ref={videoRef}
                                                    className="absolute inset-0 w-full h-full object-cover transition-all duration-300 contrast-[1.05] saturate-[1.1]"
                                                    autoPlay
                                                    playsInline
                                                    muted
                                                    style={{
                                                        transform: isMirrored ? 'scaleX(-1)' : 'none',
                                                        filter: `brightness(${brightness}%) saturate(${saturation}%)`
                                                    }}
                                                />
                                                {isStreaming && !stream && <Loader2 className="animate-spin text-teal-500 w-10 h-10 absolute z-20" />}

                                                {/* UI Overlays for Video */}
                                                <div className="absolute top-4 right-4 flex flex-col gap-2 z-20 items-end">
                                                    <div className="bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-black text-white/80 flex items-center gap-1.5 border border-white/10 uppercase tracking-tighter">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                                        Live 1080p
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Video Adjustment Controls */}
                                    <div className="bg-[#F5F5F7]/80 rounded-[28px] p-5 flex flex-col gap-4 ring-1 ring-black/5 mt-auto shadow-inner">
                                        <h4 className="text-[13px] font-black text-[#1d1d1f] mb-1 flex items-center gap-2 uppercase tracking-widest opacity-60">
                                            <Settings2 size={14} /> Video Tuning
                                        </h4>

                                        <div className="flex items-center justify-between">
                                            <span className="text-[12px] font-bold text-[#86868b]">Mirror Mode</span>
                                            <button
                                                onClick={() => setIsMirrored(!isMirrored)}
                                                className={`p-2 rounded-xl transition-all ${isMirrored ? 'bg-[#1d1d1f] text-white shadow-md' : 'bg-white text-[#86868b] ring-1 ring-black/5 hover:bg-slate-50'}`}
                                            >
                                                <FlipHorizontal size={14} />
                                            </button>
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-tight">
                                                <span className="text-[#86868b]">Brightness</span>
                                                <span className="text-[#1d1d1f] bg-white px-2 py-0.5 rounded-md ring-1 ring-black/5">{brightness}%</span>
                                            </div>
                                            <input type="range" min="50" max="150" value={brightness} onChange={(e) => setBrightness(e.target.value)} className="w-full h-1 bg-slate-200 rounded-full appearance-none outline-none accent-[#1d1d1f] cursor-pointer" />
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-tight">
                                                <span className="text-[#86868b]">Saturation</span>
                                                <span className="text-[#1d1d1f] bg-white px-2 py-0.5 rounded-md ring-1 ring-black/5">{saturation}%</span>
                                            </div>
                                            <input type="range" min="0" max="200" value={saturation} onChange={(e) => setSaturation(e.target.value)} className="w-full h-1 bg-slate-200 rounded-full appearance-none outline-none accent-[#1d1d1f] cursor-pointer" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Equipment Status / Diagram Panel - Expanded Full Width on Desktop */}
                            <div className="flex-1 glass-panel p-6 lg:p-10 rounded-[40px] flex flex-col relative overflow-hidden min-w-0 border-t-4 border-t-indigo-500 shadow-xl shadow-indigo-500/5">
                                <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-indigo-500/5 blur-[100px] pointer-events-none"></div>

                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 z-10 w-full shrink-0 gap-4">
                                    <div className="flex flex-col">
                                        <h3 className="text-[18px] md:text-[22px] font-black text-[#1d1d1f] flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                <Video size={18} />
                                            </div>
                                            Sơ đồ Luồng Kỹ thuật (Full-Width)
                                        </h3>
                                        <p className="text-[13px] text-[#86868b] font-medium mt-0.5 ml-10">Tương tác trực tiếp để thay đổi thiết bị và dây dẫn.</p>
                                    </div>
                                    <div className="flex items-center gap-2 self-end sm:self-auto">
                                        <div className="flex bg-[#F5F5F7] p-1 rounded-xl ring-1 ring-black/5">
                                            <button className="px-3 py-1.5 text-[11px] font-black uppercase text-[#1d1d1f] bg-white rounded-lg shadow-sm tracking-widest">Interactive</button>
                                            <button className="px-3 py-1.5 text-[11px] font-bold uppercase text-[#86868b] hover:text-[#1d1d1f] transition-colors tracking-widest opacity-60">Static View</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Connection Diagram flow (React Flow Integration) */}
                                <div className="flex-grow w-full relative z-10 rounded-[32px] overflow-hidden bg-[#FBFBFD] ring-1 ring-black/5 mt-6 min-h-[600px] lg:min-h-[750px] shadow-inner">
                                    <StudioDiagram />

                                    {/* Overlay Watermark/Branding for Wow-Factor */}
                                    <div className="absolute bottom-8 right-8 pointer-events-none opacity-20 hidden md:block select-none">
                                        <Aperture size={120} className="text-[#1d1d1f]" strokeWidth={1} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/* End of Step 2 */}

                {currentStep === 3 && (
                    <div className="flex flex-col gap-6 w-full animate-fade-in">
                        <div className="glass-panel p-6 sm:p-10 rounded-[40px]">
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/5">
                                <h4 className="text-[20px] font-black text-[#1d1d1f] flex items-center gap-2">
                                    <BookOpen size={24} className="text-teal-600" />
                                    Cẩm nang cài đặt Máy ảnh
                                </h4>
                                <span className="text-[11px] font-bold bg-[#F5F5F7] text-[#86868b] px-3 py-1.5 rounded-lg uppercase tracking-wider ring-1 ring-black/5 shadow-sm">
                                    Bước 2
                                </span>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                {/* Left column: hardware prep & checklist */}
                                <div className="space-y-8">
                                    <div>
                                        <h5 className="text-[14.5px] font-bold text-[#1d1d1f] mb-3">1. Cấu Hình Phần Cứng</h5>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13.5px] text-[#86868b] font-medium">
                                            <div className="bg-[#F5F5F7] p-4 rounded-2xl ring-1 ring-black/5 flex gap-3 shadow-sm hover:shadow-md transition-shadow">
                                                <Camera size={18} className="mt-0.5 text-[#1d1d1f] flex-shrink-0" />
                                                <span className="leading-tight"><strong className="text-[#1d1d1f]">Sony ZV-E10, A6700...</strong> gắn sẵn lens.</span>
                                            </div>
                                            <div className="bg-[#F5F5F7] p-4 rounded-2xl ring-1 ring-black/5 flex gap-3 shadow-sm hover:shadow-md transition-shadow">
                                                <PowerOff size={18} className="mt-0.5 text-[#1d1d1f] flex-shrink-0" />
                                                <span className="leading-tight"><strong className="text-[#1d1d1f]">Pin giả</strong> cắm điện liên tục 24/7.</span>
                                            </div>
                                            <div className="bg-[#F5F5F7] p-4 rounded-2xl ring-1 ring-black/5 flex gap-3 shadow-sm hover:shadow-md transition-shadow">
                                                <Link size={18} className="mt-0.5 text-[#1d1d1f] flex-shrink-0" />
                                                <span className="leading-tight">Cáp mạng <strong className="text-[#1d1d1f]">LAN</strong> siêu tốc (không Wi-Fi).</span>
                                            </div>
                                            <div className="bg-[#F5F5F7] p-4 rounded-2xl ring-1 ring-black/5 flex gap-3 shadow-sm hover:shadow-md transition-shadow">
                                                <Monitor size={18} className="mt-0.5 text-[#1d1d1f] flex-shrink-0" />
                                                <span className="leading-tight">Ánh sáng quyết định <strong className="text-[#1d1d1f]">80% độ đẹp</strong>.</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="text-[14.5px] font-bold text-[#1d1d1f] mb-3">2. Phương Pháp Trích Xuất</h5>
                                        <div className="flex flex-col gap-3">
                                            <div className="bg-[#F5F5F7] p-5 rounded-2xl ring-1 ring-black/5 shadow-sm border-l-4 border-l-teal-500 hover:shadow-md transition-shadow">
                                                <strong className="text-[14px] text-[#1d1d1f] block mb-1">Cách 1: Trực tiếp qua USB-C (Đơn giản)</strong>
                                                <p className="text-[13px] text-[#86868b] font-medium leading-relaxed">Chỉ cần 1 cáp truyền dữ liệu USB-C xịn, cắm thẳng từ Máy Ảnh sang PC. Máy tính tự nhận làm Webcam lập tức (Hỗ trợ tốt ZV-E10, A7C II...)</p>
                                            </div>
                                            <div className="bg-[#F5F5F7] p-5 rounded-2xl ring-1 ring-black/5 shadow-sm border-l-4 border-l-indigo-500 hover:shadow-md transition-shadow">
                                                <strong className="text-[14px] text-[#1d1d1f] block mb-1">Cách 2: Thông qua Capture Card (Sắc nét)</strong>
                                                <p className="text-[13px] text-[#86868b] font-medium leading-relaxed">Cáp Micro-HDMI xuất hình ảnh ra USB Capture Card, và cắm vào PC. Giữ được khung hình màu 10-bit nếu có.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="text-[14.5px] font-bold text-[#1d1d1f] mb-4 bg-red-50 text-red-600 px-4 py-2.5 rounded-xl inline-flex items-center gap-2 ring-1 ring-red-500/20 shadow-sm">
                                            <CheckCircle2 size={18} className="text-red-500" />
                                            Biển kiểm tra trước khi Lên Sóng
                                        </h5>
                                        <ul className="space-y-3.5 text-[14px] text-[#86868b] font-medium list-none">
                                            <li className="flex gap-4 p-1">
                                                <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5"><CheckCircle2 size={12} /></div>
                                                <span className="leading-relaxed"><strong className="text-[#1d1d1f]">Ánh sáng:</strong> Không bị Backlit quá mạnh. Tắt Auto ISO, ghim thông số đo sáng cố định để tránh hiện tượng Flicker sáng tối.</span>
                                            </li>
                                            <li className="flex gap-4 p-1">
                                                <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5"><CheckCircle2 size={12} /></div>
                                                <span className="leading-relaxed"><strong className="text-[#1d1d1f]">Âm thanh:</strong> Đếm thử {'"'}1..2..3..Alo{'"'} và quan sát hình sóng xanh nảy trên OBS/TikTok để chắc chắn luồng không bị {"'"}câm{"'"}.</span>
                                            </li>
                                            <li className="flex gap-4 p-1">
                                                <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5"><CheckCircle2 size={12} /></div>
                                                <span className="leading-relaxed"><strong className="text-[#1d1d1f]">Bật thu âm:</strong> Thêm phần bật thu âm trong menu máy ảnh Sony là ở chế độ quay phim, tab đỏ (shooting) - Audio Recording ON.</span>
                                            </li>

                                        </ul>
                                    </div>
                                </div>

                                {/* Right column: ZV-E10/FX3 Settings */}
                                <div className="space-y-6">
                                    <div className="bg-[#F5F5F7] p-6 sm:p-8 rounded-3xl ring-1 ring-black/5 shadow-sm">
                                        <h5 className="text-[16px] font-bold text-[#1d1d1f] mb-6 flex items-center gap-2">
                                            <Settings size={20} className="text-teal-600" />
                                            Thông số tiêu chuẩn (ZV-E10 II / FX3)
                                        </h5>
                                        <ul className="space-y-4 text-[14px] text-[#86868b] font-medium list-disc pl-5">
                                            <li>Chế độ quay: <strong className="text-[#1d1d1f]">Manual (M)</strong> hoặc <strong className="text-[#1d1d1f]">Movie</strong></li>
                                            <li>Khẩu độ (Aperture): Mở lớn nhất theo lens (vd: <strong className="text-[#1d1d1f]">f/1.4 - f/2.8</strong>)</li>
                                            <li>Tốc độ màn trập (Shutter Speed): <strong className="text-[#1d1d1f]">1/50</strong> (nếu live 25fps) hoặc <strong className="text-[#1d1d1f]">1/100</strong> (nếu live 50fps) - gấp đôi framerate</li>
                                            <li>ISO: Set cố định (tránh Auto). Thường tầm <strong className="text-[#1d1d1f]">400 - 800</strong> tùy ánh sáng</li>
                                            <li>Lấy nét: <strong className="text-[#1d1d1f]">AF-C</strong> (Continuous AF), bật <strong className="text-[#1d1d1f]">Face/Eye AF</strong></li>
                                            <li>White Balance: Chỉnh tay theo đèn studio (vd: <strong className="text-[#1d1d1f]">5600K</strong>)</li>
                                        </ul>
                                    </div>

                                    <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-6 sm:p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
                                        <div className="absolute -right-4 -bottom-4 opacity-20 transform rotate-12">
                                            <Star size={140} />
                                        </div>
                                        <h5 className="text-[18px] font-bold mb-3 relative z-10 flex items-center gap-2">
                                            <Star size={24} className="text-yellow-300 fill-yellow-300" />
                                            Picture Profile Khuyên Dùng
                                        </h5>
                                        <p className="text-[15px] text-teal-50 font-medium mb-5 relative z-10 leading-relaxed">
                                            Để da người sáng đẹp, tương phản vùng tối sáng tốt mà không cần hậu kỳ màu phức tạp, vui lòng sang tab ColorLab và thiết lập công thức sau:
                                        </p>
                                        {isEditingPP ? (
                                            <div className="relative z-10 font-mono flex flex-col gap-2">
                                                <textarea
                                                    value={tempPPText}
                                                    onChange={(e) => setTempPPText(e.target.value)}
                                                    className="w-full bg-black/20 backdrop-blur-md px-4 py-3 rounded-xl border border-white/20 text-[14px] font-bold tracking-wide text-white outline-none resize-none min-h-[80px]"
                                                />
                                                <div className="flex gap-2 justify-end">
                                                    <button onClick={() => setIsEditingPP(false)} className="px-4 py-2 rounded-lg bg-white/10 text-white text-[12px] font-bold hover:bg-white/20 transition-colors">Hủy</button>
                                                    <button onClick={handleSavePP} className="px-4 py-2 rounded-lg bg-white text-teal-700 text-[12px] font-bold hover:bg-white/90 transition-colors">Lưu</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-black/20 backdrop-blur-md px-5 py-4 rounded-xl border border-white/20 relative z-10 font-mono text-[14px] font-bold tracking-wide group flex flex-col gap-2">
                                                {liveConfig.pictureProfile.split('\n').map((line, idx) => {
                                                    const trimmed = line.trim();
                                                    if (!trimmed) return null;
                                                    
                                                    if (trimmed.startsWith('-')) {
                                                        const parts = trimmed.split(':');
                                                        const label = parts[0].replace(/^- /, '');
                                                        const value = parts.length > 1 ? parts.slice(1).join(':').trim() : '';
                                                        return (
                                                            <div key={idx} className="flex justify-between items-center bg-white/5 rounded-lg px-4 py-2 border border-white/10 hover:bg-white/10 transition-colors">
                                                                <span className="text-white/70 font-medium">{label}</span>
                                                                <span className="text-white text-right font-black">{value}</span>
                                                            </div>
                                                        );
                                                    } else {
                                                        return (
                                                            <div key={idx} className="text-center text-yellow-300 font-black text-[15px] mb-2 uppercase tracking-widest">{trimmed}</div>
                                                        );
                                                    }
                                                })}
                                                {isEmployee && (
                                                    <button onClick={() => { setTempPPText(liveConfig.pictureProfile); setIsEditingPP(true); }} className="absolute top-3 right-3 p-2 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md hover:bg-white/20">
                                                        <Settings size={16} className="text-white" />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 4 && (
                    <div className="flex flex-col w-full animate-fade-in relative z-10">
                        {/* --- BOTTOM SECTION: PLATFORM GUIDES --- */}
                        <div className="w-full flex justify-center sticky top-0 bg-white/80 backdrop-blur-xl z-30 py-4 mb-4 mt-6 border-b border-black/5">
                            <div className="flex overflow-x-auto gap-3 custom-scrollbar px-2 max-w-full">
                                {/* Desktop Software Apps (OBS, etc) */}
                                <div className="flex bg-[#F5F5F7] p-1.5 rounded-[20px] gap-1 ring-1 ring-black/5 shadow-sm shrink-0">
                                    {platforms.filter(p => p.software && p.software.type === 'obs').map((plat) => {
                                        const idx = platforms.findIndex(p => p.id === plat.id);
                                        const isActive = activePlatformIndex === idx;
                                        return (
                                            <button
                                                key={plat.id}
                                                onClick={() => setActivePlatformIndex(idx)}
                                                className={`px-5 py-2.5 rounded-2xl text-[14px] font-bold whitespace-nowrap transition-all duration-300 ${isActive ? plat.activeColor + ' shadow-[0_4px_16px_rgba(0,0,0,0.12)] scale-100 ring-2 ring-white/20' : 'text-[#86868b] hover:bg-black/5'}`}
                                            >
                                                {plat.name}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Separator */}
                                <div className="w-px bg-black/5 my-3 mx-1 hidden sm:block"></div>

                                {/* Mobile Apps (TikTok Studio, etc) */}
                                <div className="flex gap-2 items-center shrink-0">
                                    {platforms.filter(p => !p.software || p.software.type !== 'obs').map((plat) => {
                                        const idx = platforms.findIndex(p => p.id === plat.id);
                                        const isActive = activePlatformIndex === idx;
                                        return (
                                            <button
                                                key={plat.id}
                                                onClick={() => setActivePlatformIndex(idx)}
                                                className={`px-5 py-2.5 rounded-2xl text-[14px] font-bold whitespace-nowrap transition-all duration-300 ring-1 ring-black/5 ${isActive ? plat.activeColor + ' shadow-[0_4px_16px_rgba(0,0,0,0.12)] scale-105 z-10 ring-2 ring-white/20' : 'bg-[#F5F5F7] text-[#86868b] hover:bg-black/5 hover:shadow-sm'}`}
                                            >
                                                {plat.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="w-full flex flex-col glass-panel p-6 sm:p-8 lg:p-12 rounded-[40px] relative overflow-hidden h-full min-h-[500px]">
                            {/* Dynamic Background Glow based on Active Platform */}
                            {activePlatform && (
                                <div className={`absolute -top-40 -left-20 w-[600px] h-[600px] rounded-full blur-3xl opacity-10 -z-10 transition-colors duration-700 pointer-events-none ${activePlatform.activeColor.split(' ')[0]}`}></div>
                            )}

                            {/* Tutorial Content Wrapper */}
                            {activePlatform ? (
                                <div className="flex-grow flex flex-col relative z-10 animate-fade-in w-full max-w-4xl mx-auto" key={activePlatform.id}>

                                    <div className="flex flex-col pb-6">
                                        {/* Platform Setup */}
                                        <div className="flex flex-col border-black/5 pb-8">
                                            <div className="flex items-center gap-5 mb-6">
                                                <div className={`p-4 rounded-[20px] text-white shadow-lg flex-shrink-0 ${activePlatform.activeColor} scale-110 shadow-[0_8px_20px_rgba(0,0,0,0.15)]`}>
                                                    <PlatformIcon size={32} />
                                                </div>
                                                <h4 className="text-[32px] md:text-[36px] font-black text-[#1d1d1f] tracking-tight leading-tight">{activePlatform.name}</h4>
                                            </div>
                                            <p className="text-[15px] text-[#86868b] mb-8 font-medium leading-relaxed pr-4">{activePlatform.description}</p>


                                            {/* Stream Specs */}
                                            {activePlatform.streamSpecs && (
                                                <div className="mb-8 grid grid-cols-3 gap-3">
                                                    <div className="bg-[#F5F5F7] rounded-2xl p-4 flex flex-col items-center justify-center text-center ring-1 ring-black/5 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
                                                        <div className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider mb-1.5 flex items-center gap-1"><Monitor size={12} /> Độ Phân Giải</div>
                                                        <div className="text-[14px] font-black text-[#1d1d1f]">{activePlatform.streamSpecs.resolution}</div>
                                                    </div>
                                                    <div className="bg-[#F5F5F7] rounded-2xl p-4 flex flex-col items-center justify-center text-center ring-1 ring-black/5 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
                                                        <div className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider mb-1.5 flex items-center gap-1"><MonitorPlay size={12} /> Khung Hình</div>
                                                        <div className="text-[14px] font-black text-[#1d1d1f]">{activePlatform.streamSpecs.framerate}</div>
                                                    </div>
                                                    <div className="bg-[#F5F5F7] rounded-2xl p-4 flex flex-col items-center justify-center text-center ring-1 ring-black/5 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
                                                        <div className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider mb-1.5 flex items-center gap-1"><Upload size={12} /> Bitrate</div>
                                                        <div className="text-[14px] font-black text-[#1d1d1f]">{activePlatform.streamSpecs.bitrate}</div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Software */}
                                            {activePlatform.software && (
                                                <div className="mb-8 flex flex-col gap-3">
                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#F5F5F7] rounded-[20px] p-5 ring-1 ring-black/5 shadow-sm hover:shadow-md transition-shadow gap-4 sm:gap-0">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 shadow-sm rounded-[14px] bg-white flex items-center justify-center text-[#1d1d1f] ring-1 ring-black/5 shrink-0">
                                                                {activePlatform.software.type === 'obs' ? <KeyRound size={22} className="text-teal-600" /> : <MonitorPlay size={22} className="text-indigo-600" />}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-[11.5px] font-bold text-[#86868b] uppercase tracking-wider mb-0.5">
                                                                    {activePlatform.software.streamKeyRequired ? 'Yêu cầu Stream Key' : 'Phần mềm khuyên dùng'}
                                                                </span>
                                                                <span className="text-[16px] font-black text-[#1d1d1f] leading-tight">
                                                                    {activePlatform.software.name}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {activePlatform.software.url && (
                                                            <a
                                                                href={activePlatform.software.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold transition-all shadow-sm bg-white text-[#1d1d1f] ring-1 ring-black/5 hover:bg-slate-50 active:scale-95 whitespace-nowrap lg:ml-4 shrink-0"
                                                            >
                                                                <Download size={16} /> Tải
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Setup Steps */}
                                            <div className="space-y-6 lg:space-y-8 mt-2">
                                                {activePlatform.steps.map((step, idx) => (
                                                    <div key={idx} className="flex gap-5 group">
                                                        <div className="flex flex-col items-center">
                                                            <div className="w-10 h-10 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center text-[15px] font-black shadow-lg z-10 ring-4 ring-white group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition-all flex-shrink-0 duration-300">
                                                                {idx + 1}
                                                            </div>
                                                            {idx < activePlatform.steps.length - 1 && (
                                                                <div className="w-0.5 h-full bg-slate-200 mt-3 mb-1 group-hover:bg-teal-200 transition-colors duration-300"></div>
                                                            )}
                                                        </div>
                                                        <div className="pb-6 pt-1.5 w-full">
                                                            <h5 className="text-[17px] font-bold text-[#1d1d1f] mb-2 leading-tight group-hover:text-teal-700 transition-colors duration-300">{step.title}</h5>
                                                            <p className="text-[15px] text-[#86868b] leading-relaxed font-medium">{step.content}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center flex-grow py-12">
                                    <p className="text-slate-500 font-medium text-[15px]">Không có dữ liệu nền tảng.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )} {/* End of Step 4 */}

                {currentStep === 5 && (
                    <div className="flex flex-col w-full animate-fade-in gap-6 pb-8">
                        <div className="glass-panel p-6 sm:p-10 rounded-[40px]">
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/5">
                                <h4 className="text-[20px] font-black text-[#1d1d1f] flex items-center gap-2">
                                    <Lightbulb size={24} className="text-teal-600" />
                                    Hướng dẫn Đánh Sáng Studio
                                </h4>
                                <span className="text-[11px] font-bold bg-[#F5F5F7] text-[#86868b] px-3 py-1.5 rounded-lg uppercase tracking-wider ring-1 ring-black/5 shadow-sm">
                                    Bước 4
                                </span>
                            </div>

                            {/* Youtube Embedded Video */}
                            <div className="w-full max-w-4xl mx-auto mb-8 rounded-3xl overflow-hidden ring-1 ring-black/5 shadow-lg aspect-video isolate bg-black">
                                <iframe
                                    className="w-full h-full"
                                    src="https://www.youtube.com/embed/6p13FqFdgDc"
                                    title="YouTube video player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                ></iframe>
                            </div>

                            {/* Summary Key Points */}
                            <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-[#F5F5F7] p-6 rounded-3xl ring-1 ring-black/5">
                                    <h5 className="text-[16px] font-bold text-[#1d1d1f] mb-4 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center"><Lightbulb size={16} /></div>
                                        Key Light (Ánh sáng chính)
                                    </h5>
                                    <ul className="space-y-3 text-[14px] text-[#86868b] font-medium">
                                        <li>Đặt góc 45 độ so với mặt người, ánh sáng hơi hướng xuống.</li>
                                        <li>Chủ thể hơi ngẩng lên hoặc nhìn theo hướng Key Light để mắt tạo <strong className="text-[#1d1d1f]">Catchlight</strong>.</li>
                                        <li>Dùng đèn nguồn công suất lớn (150W - 300W) kết hợp Softbox to (Dome/Parabolic 90cm+) để da mịn màng nhất.</li>
                                    </ul>
                                </div>
                                <div className="bg-[#F5F5F7] p-6 rounded-3xl ring-1 ring-black/5">
                                    <h5 className="text-[16px] font-bold text-[#1d1d1f] mb-4 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center"><Settings size={16} /></div>
                                        Các chức năng đèn bổ trợ
                                    </h5>
                                    <ul className="space-y-3 text-[14px] text-[#86868b] font-medium">
                                        <li><strong className="text-[#1d1d1f]">Fill Light:</strong> Công suất ~30-50% Key Light, chiếu từ hướng ngược lại để làm sáng và mềm vùng đổ bóng râm.</li>
                                        <li><strong className="text-[#1d1d1f]">Hair/Rim Light:</strong> Đèn công suất vừa, đánh từ phía sau lưng tạt lên tóc/vai, giúp tách chủ thể ra khỏi phông nền.</li>
                                        <li><strong className="text-[#1d1d1f]">Background Light:</strong> Đèn màu RGB (Tube) hắt nhẹ vào phông nền tạo hiệu ứng chiều sâu bắt mắt.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )} {/* End of Step 5 */}

                {currentStep === 6 && (
                    <div className="flex flex-col lg:flex-row gap-6 w-full animate-fade-in pb-8">

                        {/* LEFT: Script Form + Timeline */}
                        <div className="w-full lg:w-1/2 flex flex-col gap-6">
                            <div className="glass-panel p-6 sm:p-10 rounded-[40px] flex flex-col gap-6">
                                <div className="flex items-center justify-between pb-4 border-b border-black/5">
                                    <h4 className="text-[20px] font-black text-[#1d1d1f] flex items-center gap-2">
                                        <Wand2 size={22} className="text-violet-500" />
                                        Tạo Kịch Bản Phiên Live
                                    </h4>
                                    <span className="text-[11px] font-bold bg-violet-50 text-violet-600 px-3 py-1.5 rounded-lg uppercase tracking-wider ring-1 ring-violet-500/20 shadow-sm hidden sm:inline-flex">
                                        AI Powered
                                    </span>
                                </div>

                                {/* Inputs */}
                                <div className="flex flex-col gap-4">
                                    <div>
                                        <label className="text-[12px] font-bold text-[#86868b] uppercase tracking-wider mb-2 block">Tiêu Đề Phiên Live *</label>
                                        <input
                                            type="text"
                                            value={scriptTitle}
                                            onChange={e => setScriptTitle(e.target.value)}
                                            placeholder="VD: Livestream Ra mắt Sony ZV-E10 II"
                                            className="w-full bg-[#F5F5F7] border border-slate-200 text-[#1d1d1f] text-[14px] font-medium rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[12px] font-bold text-[#86868b] uppercase tracking-wider mb-2 block">Mô Tả Ngắn</label>
                                        <textarea
                                            value={scriptDesc}
                                            onChange={e => setScriptDesc(e.target.value)}
                                            placeholder="VD: Giới thiệu tính năng vượt trội, so sánh với thế hệ cũ, demo quay phim, tư vấn mua hàng..."
                                            className="w-full bg-[#F5F5F7] border border-slate-200 text-[#1d1d1f] text-[13px] font-medium rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500/50 min-h-[100px] resize-y transition-all"
                                        />
                                    </div>
                                    <button
                                        onClick={handleGenerateTimeline}
                                        disabled={!scriptTitle.trim() || isGenerating}
                                        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-[14px] shadow-[0_8px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_12px_25px_rgba(139,92,246,0.4)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                                    >
                                        {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                                        {isGenerating ? 'Đang tạo kịch bản...' : '✨ Tạo Kịch Bản AI'}
                                    </button>
                                </div>

                                {/* Generated Timeline */}
                                {generatedTimeline && (
                                    <div className="flex flex-col gap-3 animate-fade-in">
                                        <h5 className="text-[14px] font-bold text-[#1d1d1f] flex items-center gap-2">
                                            <Sparkles size={16} className="text-violet-500" /> Timeline Được Tạo
                                        </h5>
                                        <div className="bg-[#F5F5F7] rounded-2xl p-5 ring-1 ring-black/5 max-h-[500px] overflow-y-auto custom-scrollbar">
                                            <div className="flex flex-col">
                                                {renderFormattedScript(generatedTimeline)}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {!generatedTimeline && !isGenerating && (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <div className="w-16 h-16 rounded-3xl bg-violet-50 flex items-center justify-center mb-3">
                                            <Wand2 size={28} className="text-violet-400" />
                                        </div>
                                        <p className="text-[13px] text-[#86868b] font-medium">Nhập tiêu đề và nhấn &quot;Tạo Kịch Bản AI&quot; để Gemini tự động xây dựng timeline cho phiên live của bạn.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT: Live Chatbot Q&A */}
                        <div className="w-full lg:w-1/2 flex flex-col">
                            <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.02] flex flex-col h-full min-h-[520px] overflow-hidden">
                                {/* Chat Header */}
                                <div className="flex items-center gap-3 p-5 sm:p-6 border-b border-black/5 shrink-0">
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-sm">
                                        <Bot size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-[16px] font-black text-[#1d1d1f] leading-tight">Trợ lý Live Q&amp;A</h4>
                                        <p className="text-[12px] text-[#86868b] font-medium">AI trả lời nhanh tuỳ vấn khách hàng</p>
                                    </div>
                                    <div className="ml-auto flex items-center gap-1.5">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                        <span className="text-[11px] font-bold text-emerald-600">Sẵn sàng</span>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-grow overflow-y-auto p-4 sm:p-5 flex flex-col gap-3 custom-scrollbar">
                                    {chatMessages.map((msg, i) => (
                                        <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                            {msg.role === 'model' && (
                                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                                                    <Bot size={14} className="text-white" />
                                                </div>
                                            )}
                                            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-[13px] font-medium leading-relaxed ${msg.role === 'user'
                                                ? 'bg-[#1d1d1f] text-white rounded-tr-sm'
                                                : 'bg-[#F5F5F7] text-[#1d1d1f] rounded-tl-sm ring-1 ring-black/5'
                                                }`}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}
                                    {isChatLoading && (
                                        <div className="flex gap-2.5 flex-row">
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shrink-0 shadow-sm">
                                                <Bot size={14} className="text-white" />
                                            </div>
                                            <div className="bg-[#F5F5F7] px-4 py-3 rounded-2xl rounded-tl-sm ring-1 ring-black/5 flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                {/* Input Box */}
                                <div className="p-4 sm:p-5 border-t border-black/5 shrink-0">
                                    <div className="flex gap-2 items-end">
                                        <textarea
                                            value={chatInput}
                                            onChange={e => setChatInput(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChatSend(); } }}
                                            placeholder="Nhập câu hỏi về sản phẩm Sony..."
                                            rows={1}
                                            className="flex-1 bg-[#F5F5F7] border border-slate-200 text-[#1d1d1f] text-[13px] font-medium rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500/50 resize-none transition-all"
                                        />
                                        <button
                                            onClick={handleChatSend}
                                            disabled={!chatInput.trim() || isChatLoading}
                                            className="w-11 h-11 rounded-2xl bg-[#1d1d1f] text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black transition-all shadow-sm shrink-0"
                                        >
                                            <Send size={17} />
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-[#86868b] mt-2 font-medium">Enter để gửi • Shift+Enter xuống dòng</p>
                                </div>
                            </div>
                        </div>

                    </div>
                )} {/* End of Step 6 */}

                {currentStep === 7 && (
                    <div className="flex flex-col w-full animate-fade-in gap-8 pb-20">
                        <div className="glass-panel p-8 sm:p-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/5 blur-[120px] -z-0"></div>

                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-600 shadow-inner">
                                        <CheckCircle2 size={30} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h4 className="text-[26px] font-black text-[#1d1d1f] tracking-tight leading-tight">Báo Cáo Hiệu Suất Live</h4>
                                        <p className="text-[14px] text-slate-500 font-bold">Chỉ số kinh doanh đa nền tảng (Tối đa 5)</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 px-6 py-3 bg-[#F5F5F7] rounded-2xl ring-1 ring-black/5 shadow-sm">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày báo cáo</span>
                                        <span className="text-[13px] font-black text-[#1d1d1f]">{new Date().toLocaleDateString('vi-VN')}</span>
                                    </div>
                                    <div className="w-px h-8 bg-black/5 mx-2"></div>
                                    <span className="text-[10px] font-black bg-teal-500/10 text-teal-600 px-3 py-1 rounded-lg uppercase tracking-wider text-center">Auto Sync</span>
                                </div>
                            </div>

                            {!canViewReport ? (
                                <div className="max-w-2xl mx-auto py-16 text-center flex flex-col items-center gap-8 relative z-10">
                                    <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white shadow-2xl shadow-orange-500/30 animate-pulse-slow">
                                        <KeyRound size={44} strokeWidth={2.5} />
                                    </div>
                                    <div className="space-y-4">
                                        <h5 className="text-[28px] font-black text-[#1d1d1f] tracking-tighter">Quyền Truy Cập Nội Bộ</h5>
                                        <p className="text-[16px] text-slate-500 font-bold leading-relaxed max-w-md mx-auto">
                                            Tính năng báo cáo kinh doanh chỉ dành cho tài khoản Sony Training Wiki được cấp quyền.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 px-8 py-4 bg-white rounded-3xl ring-1 ring-black/5 text-[13px] font-black text-slate-500 uppercase tracking-widest shadow-lg">
                                        <Bot size={20} className="text-teal-500" />
                                        Alpha Security Verified
                                    </div>
                                </div>
                            ) : (
                                <div className="max-w-7xl mx-auto relative z-10 space-y-10">
                                    {/* Section 1: Session Context */}
                                    <div className="bg-[#F5F5F7]/50 p-8 rounded-[32px] ring-1 ring-black/5">
                                        <div className="flex items-center gap-3 mb-6 px-2">
                                            <Video size={18} className="text-teal-500" />
                                            <h6 className="text-[12px] font-black text-[#86868b] uppercase tracking-[0.2em]">Thông Tin Chung</h6>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            <div className="flex flex-col gap-2 lg:col-span-2">
                                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Chủ đề & Topic</label>
                                                <input
                                                    type="text"
                                                    placeholder="VD: Sony ZV-E10 II Launch Event..."
                                                    value={reportMetrics.topic}
                                                    onChange={e => setReportMetrics({ ...reportMetrics, topic: e.target.value })}
                                                    className="bg-white border-0 rounded-2xl px-5 py-4 text-[15px] font-black text-[#1d1d1f] outline-none focus:ring-2 focus:ring-teal-500/50 shadow-sm transition-all"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Giờ Bắt Đầu</label>
                                                <input
                                                    type="time"
                                                    value={reportMetrics.startTime}
                                                    onChange={e => setReportMetrics({ ...reportMetrics, startTime: e.target.value })}
                                                    className="bg-white border-0 rounded-2xl px-5 py-4 text-[15px] font-black text-[#1d1d1f] outline-none focus:ring-2 focus:ring-teal-500/50 shadow-sm transition-all"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Giờ Kết Thúc</label>
                                                <input
                                                    type="time"
                                                    value={reportMetrics.endTime}
                                                    onChange={e => setReportMetrics({ ...reportMetrics, endTime: e.target.value })}
                                                    className="bg-white border-0 rounded-2xl px-5 py-4 text-[15px] font-black text-[#1d1d1f] outline-none focus:ring-2 focus:ring-teal-500/50 shadow-sm transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 2: Platform Specific Breakdown */}
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between mb-4 px-2">
                                            <div className="flex items-center gap-3">
                                                <BarChart3 size={18} className="text-teal-500" />
                                                <h6 className="text-[12px] font-black text-[#86868b] uppercase tracking-[0.2em]">Hiệu Suất Theo Nền Tảng ({reportMetrics.platforms.length}/5)</h6>
                                            </div>

                                            {reportMetrics.platforms.length < 5 && (
                                                <button
                                                    onClick={() => {
                                                        const unusedPlatforms = platformsData.filter(p => !reportMetrics.platforms.find(rp => rp.name === p.name));
                                                        if (unusedPlatforms.length > 0) {
                                                            setReportMetrics({
                                                                ...reportMetrics,
                                                                platforms: [...reportMetrics.platforms, {
                                                                    name: unusedPlatforms[0].name,
                                                                    views: '', likes: '', pcu: '', followers: '', clicks: '', orders: '', revenue: ''
                                                                }]
                                                            });
                                                        }
                                                    }}
                                                    className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all"
                                                >
                                                    <Plus size={16} /> Thêm nền tảng
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 gap-8">
                                            {reportMetrics.platforms.map((plat, idx) => (
                                                <div key={idx} className="bg-white rounded-[32px] p-6 lg:p-8 ring-1 ring-black/5 shadow-sm relative group animate-fade-in">
                                                    <div className="flex flex-col lg:flex-row gap-8">
                                                        {/* Platform Side */}
                                                        <div className="lg:w-1/4 flex flex-col gap-6 border-b lg:border-b-0 lg:border-r border-black/5 pb-6 lg:pb-0 lg:pr-8">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] flex items-center justify-center">
                                                                        {(() => {
                                                                            const pData = platformsData.find(p => p.name === plat.name);
                                                                            const Icon = pData?.icon || RadioReceiver;
                                                                            return <Icon size={20} className="text-[#1d1d1f]" />;
                                                                        })()}
                                                                    </div>
                                                                    <select
                                                                        value={plat.name}
                                                                        onChange={(e) => {
                                                                            const newPlats = [...reportMetrics.platforms];
                                                                            newPlats[idx].name = e.target.value;
                                                                            setReportMetrics({ ...reportMetrics, platforms: newPlats });
                                                                        }}
                                                                        className="bg-transparent border-0 text-[18px] font-black text-[#1d1d1f] focus:ring-0 outline-none cursor-pointer appearance-none"
                                                                    >
                                                                        {platformsData.map(p => (
                                                                            <option key={p.id} value={p.name}>{p.name}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                                {reportMetrics.platforms.length > 1 && (
                                                                    <button
                                                                        onClick={() => {
                                                                            const newPlats = reportMetrics.platforms.filter((_, i) => i !== idx);
                                                                            setReportMetrics({ ...reportMetrics, platforms: newPlats });
                                                                        }}
                                                                        className="text-slate-400 hover:text-red-500 transition-colors"
                                                                    >
                                                                        <Trash2 size={18} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <div className="space-y-4">
                                                                <div className="flex flex-col gap-1.5">
                                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Doanh thu dự kiến</label>
                                                                    <div className="relative">
                                                                        <input
                                                                            type="number"
                                                                            value={plat.revenue}
                                                                            onChange={(e) => {
                                                                                const newPlats = [...reportMetrics.platforms];
                                                                                newPlats[idx].revenue = e.target.value;
                                                                                setReportMetrics({ ...reportMetrics, platforms: newPlats });
                                                                            }}
                                                                            placeholder="0"
                                                                            className="w-full bg-[#F5F5F7] border-0 rounded-2xl px-4 py-4 text-[20px] font-black text-emerald-600 outline-none focus:ring-2 focus:ring-emerald-500/30"
                                                                        />
                                                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-black text-emerald-600/50 uppercase">VND</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col gap-1.5">
                                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Số đơn hàng</label>
                                                                    <input
                                                                        type="number"
                                                                        value={plat.orders}
                                                                        onChange={(e) => {
                                                                            const newPlats = [...reportMetrics.platforms];
                                                                            newPlats[idx].orders = e.target.value;
                                                                            setReportMetrics({ ...reportMetrics, platforms: newPlats });
                                                                        }}
                                                                        placeholder="0"
                                                                        className="w-full bg-[#F5F5F7] border-0 rounded-2xl px-4 py-4 text-[16px] font-black text-[#1d1d1f] outline-none focus:ring-2 focus:ring-teal-500/30"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Metrics Side */}
                                                        <div className="lg:w-3/4 grid grid-cols-2 md:grid-cols-4 gap-6 content-start">
                                                            <div className="flex flex-col gap-2">
                                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Lượt xem (Views)</label>
                                                                <input
                                                                    type="number"
                                                                    value={plat.views}
                                                                    onChange={(e) => {
                                                                        const newPlats = [...reportMetrics.platforms];
                                                                        newPlats[idx].views = e.target.value;
                                                                        setReportMetrics({ ...reportMetrics, platforms: newPlats });
                                                                    }}
                                                                    placeholder="0"
                                                                    className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-3.5 text-[14px] font-bold text-[#1d1d1f] outline-none focus:ring-2 focus:ring-teal-500/30"
                                                                />
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Mắt xem (PCU)</label>
                                                                <input
                                                                    type="number"
                                                                    value={plat.pcu}
                                                                    onChange={(e) => {
                                                                        const newPlats = [...reportMetrics.platforms];
                                                                        newPlats[idx].pcu = e.target.value;
                                                                        setReportMetrics({ ...reportMetrics, platforms: newPlats });
                                                                    }}
                                                                    placeholder="0"
                                                                    className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-3.5 text-[14px] font-bold text-[#1d1d1f] outline-none focus:ring-2 focus:ring-teal-500/30 text-right"
                                                                />
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Theo dõi mới</label>
                                                                <input
                                                                    type="number"
                                                                    value={plat.followers}
                                                                    onChange={(e) => {
                                                                        const newPlats = [...reportMetrics.platforms];
                                                                        newPlats[idx].followers = e.target.value;
                                                                        setReportMetrics({ ...reportMetrics, platforms: newPlats });
                                                                    }}
                                                                    placeholder="0"
                                                                    className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-3.5 text-[14px] font-bold text-[#1d1d1f] outline-none focus:ring-2 focus:ring-teal-500/30"
                                                                />
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Tổng lượt thích</label>
                                                                <input
                                                                    type="number"
                                                                    value={plat.likes}
                                                                    onChange={(e) => {
                                                                        const newPlats = [...reportMetrics.platforms];
                                                                        newPlats[idx].likes = e.target.value;
                                                                        setReportMetrics({ ...reportMetrics, platforms: newPlats });
                                                                    }}
                                                                    placeholder="0"
                                                                    className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-3.5 text-[14px] font-bold text-[#1d1d1f] outline-none focus:ring-2 focus:ring-teal-500/30 text-right"
                                                                />
                                                            </div>
                                                            <div className="flex flex-col gap-2 md:col-start-1">
                                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Số Click SP</label>
                                                                <input
                                                                    type="number"
                                                                    value={plat.clicks}
                                                                    onChange={(e) => {
                                                                        const newPlats = [...reportMetrics.platforms];
                                                                        newPlats[idx].clicks = e.target.value;
                                                                        setReportMetrics({ ...reportMetrics, platforms: newPlats });
                                                                    }}
                                                                    placeholder="0"
                                                                    className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-3.5 text-[14px] font-bold text-[#1d1d1f] outline-none focus:ring-2 focus:ring-teal-500/30"
                                                                />
                                                            </div>
                                                            <div className="col-span-2 md:col-start-3 md:col-span-2 mt-auto">
                                                                <div className="flex justify-between items-center bg-[#F5F5F7] rounded-2xl px-5 py-4">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tỉ lệ CVR</span>
                                                                        <span className="text-[18px] font-black text-teal-600">
                                                                            {plat.views > 0 ? ((plat.orders / plat.views) * 100).toFixed(2) : '0.00'}%
                                                                        </span>
                                                                    </div>
                                                                    <div className="w-px h-8 bg-black/5" />
                                                                    <div className="flex flex-col text-right">
                                                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Chỉ số GPM</span>
                                                                        <span className="text-[18px] font-black text-violet-600">
                                                                            {plat.views > 0 ? (plat.revenue / plat.views).toFixed(1) : '0.0'}k
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Section 3: Notes & Action */}
                                    <div className="flex flex-col lg:flex-row gap-10">
                                        <div className="lg:w-2/3 flex flex-col gap-2">
                                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-2">Ghi chú & Phân tích phiên live</label>
                                            <textarea
                                                value={reportMetrics.note}
                                                onChange={e => setReportMetrics({ ...reportMetrics, note: e.target.value })}
                                                placeholder="Nhập nhận định về hiệu quả phiên live, tệp khách hàng, sản phẩm bán chạy..."
                                                className="w-full bg-[#F5F5F7] border-0 rounded-[24px] px-6 py-5 text-[14px] font-medium text-[#1d1d1f] outline-none focus:ring-2 focus:ring-teal-500/50 min-h-[140px] resize-none"
                                            />
                                        </div>
                                        <div className="lg:w-1/3 flex flex-col justify-end gap-6">
                                            <div className="bg-teal-500 p-6 rounded-[28px] text-white shadow-xl shadow-teal-500/20">
                                                <div className="flex justify-between items-center mb-4">
                                                    <span className="text-[11px] font-black uppercase tracking-widest opacity-80">Tổng Doanh Thu</span>
                                                    <RadioReceiver size={18} />
                                                </div>
                                                <div className="text-[32px] font-black tracking-tight mb-1">
                                                    {reportMetrics.platforms.reduce((acc, p) => acc + Number(p.revenue || 0), 0).toLocaleString('vi-VN')}
                                                </div>
                                                <div className="text-[12px] font-bold opacity-80 uppercase tracking-wider">VND (Gộp {reportMetrics.platforms.length} Nền Tảng)</div>
                                            </div>

                                            <button
                                                onClick={handleSaveReport}
                                                disabled={isSavingReport || reportSaved}
                                                className={`w-full py-6 rounded-[28px] flex items-center justify-center gap-4 font-black text-[17px] uppercase tracking-[0.2em] transition-all duration-300 shadow-2xl ${reportSaved
                                                    ? 'bg-emerald-500 text-white'
                                                    : 'bg-[#1d1d1f] text-white hover:scale-[1.02] active:scale-95'
                                                    }`}
                                            >
                                                {isSavingReport ? <Loader2 size={24} className="animate-spin" /> : reportSaved ? <CheckCircle2 size={24} /> : <Download size={24} />}
                                                {isSavingReport ? 'Đang Xử Lý...' : reportSaved ? 'Đã Lưu Báo Cáo' : 'Chốt & Lưu Dữ Liệu'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}
