'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Wand2, Sparkles, Loader2, Bot, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useLiveStream } from '../LiveStreamContext';
import { generateTimelineAction, chatWithStudioBotAction } from '@/app/actions/gemini-ai';

export default function ContentSection() {
    const { 
        scriptTitle, setScriptTitle,
        scriptDesc, setScriptDesc,
        generatedTimeline, setGeneratedTimeline,
        chatMessages, setChatMessages
    } = useLiveStream();

    const [isGenerating, setIsGenerating] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const handleGenerateTimeline = async () => {
        if (!scriptTitle.trim()) return;
        setIsGenerating(true);
        try {
            const res = await generateTimelineAction(scriptTitle, scriptDesc);
            if (res.success) {
                setGeneratedTimeline(res.content);
            } else {
                alert(res.error || 'Lỗi không xác định');
            }
        } catch (err) {
            alert('Lỗi: ' + err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSendMessage = async () => {
        if (!chatInput.trim() || isThinking) return;
        
        const userMsg = { role: 'user', text: chatInput };
        setChatMessages(prev => [...prev, userMsg]);
        setChatInput('');
        setIsThinking(true);

        try {
            const res = await chatWithStudioBotAction([...chatMessages, userMsg]);
            if (res.success) {
                setChatMessages(prev => [...prev, { role: 'model', text: res.content }]);
            } else {
                setChatMessages(prev => [...prev, { role: 'model', text: 'Xin lỗi, tôi gặp chút trục trặc: ' + res.error }]);
            }
        } catch (err) {
            setChatMessages(prev => [...prev, { role: 'model', text: 'Lỗi kết nối: ' + err.message }]);
        } finally {
            setIsThinking(false);
        }
    };

    const renderFormattedScript = (text) => {
        return text.split('\n').map((line, i) => {
            const trimmed = line.trim();
            if (trimmed.match(/^\d+[:.h]/) || trimmed.toLowerCase().includes('phút')) {
                return <div key={i} className="font-black text-violet-600 mt-4 mb-1 text-[15px]">{line}</div>;
            }
            if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
                return <div key={i} className="pl-4 py-1 text-[13.5px] text-[#1d1d1f] font-medium border-l-2 border-violet-100 ml-1 mb-1">{line.replace(/^[*-\s]+/, '')}</div>;
            }
            return <div key={i} className="text-[14px] text-[#424245] leading-relaxed mb-2">{line}</div>;
        });
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 w-full animate-fade-in pb-8">
            {/* LEFT: Script Form + Timeline */}
            <div className="w-full lg:w-1/2 flex flex-col gap-6">
                <div className="glass-panel p-6 sm:p-10 rounded-[40px] bg-white flex flex-col gap-6">
                    <div className="flex items-center justify-between pb-4 border-b border-black/5">
                        <h4 className="text-[20px] font-black text-[#1d1d1f] flex items-center gap-2">
                            <Wand2 size={22} className="text-violet-500" />
                            Tạo Kịch Bản Phiên Live
                        </h4>
                        <span className="text-[11px] font-bold bg-violet-50 text-violet-600 px-3 py-1.5 rounded-lg uppercase tracking-wider ring-1 ring-violet-500/20 shadow-sm hidden sm:inline-flex">
                            AI Powered
                        </span>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="text-[12px] font-bold text-[#86868b] uppercase tracking-wider mb-2 block">Tiêu Đề Phiên Live *</label>
                            <input
                                type="text"
                                value={scriptTitle}
                                onChange={e => setScriptTitle(e.target.value)}
                                placeholder="VD: Livestream Ra mắt Sony ZV-E10 II"
                                className="w-full bg-[#F5F5F7] border border-slate-200 text-[#1d1d1f] text-[14px] font-medium rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500/50 transition-all shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="text-[12px] font-bold text-[#86868b] uppercase tracking-wider mb-2 block">Mô Tả Ngắn</label>
                            <textarea
                                value={scriptDesc}
                                onChange={e => setScriptDesc(e.target.value)}
                                placeholder="VD: Giới thiệu tính năng vượt trội, so sánh với thế hệ cũ, demo quay phim, tư vấn mua hàng..."
                                className="w-full bg-[#F5F5F7] border border-slate-200 text-[#1d1d1f] text-[13px] font-medium rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500/50 min-h-[100px] resize-y transition-all shadow-sm"
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

                    {generatedTimeline && (
                        <div className="flex flex-col gap-3 animate-fade-in">
                            <h5 className="text-[14px] font-bold text-[#1d1d1f] flex items-center gap-2">
                                <Sparkles size={16} className="text-violet-500" /> Timeline Được Tạo
                            </h5>
                            <div className="bg-[#F5F5F7] rounded-3xl p-6 ring-1 ring-black/5 max-h-[500px] overflow-y-auto custom-scrollbar shadow-inner">
                                <div className="flex flex-col">
                                    {renderFormattedScript(generatedTimeline)}
                                </div>
                            </div>
                        </div>
                    )}

                    {!generatedTimeline && !isGenerating && (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="w-16 h-16 rounded-3xl bg-violet-50 flex items-center justify-center mb-3 ring-1 ring-violet-100">
                                <Wand2 size={28} className="text-violet-400" />
                            </div>
                            <p className="text-[13px] text-[#86868b] font-medium px-4">Nhập tiêu đề và nhấn &quot;Tạo Kịch Bản AI&quot; để Gemini tự động xây dựng timeline cho phiên live của bạn.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT: Live Chatbot Q&A */}
            <div className="w-full lg:w-1/2 flex flex-col gap-6">
                <div className="bg-white rounded-[40px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.05] flex flex-col h-full min-h-[600px] overflow-hidden">
                    <div className="flex items-center gap-3 p-6 border-b border-black/5 shrink-0 bg-slate-50/50">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg ring-2 ring-white">
                            <Bot size={24} className="text-white" />
                        </div>
                        <div>
                            <h4 className="text-[17px] font-black text-[#1d1d1f] leading-tight">Trợ lý Live Q&A</h4>
                            <p className="text-[13px] text-[#86868b] font-medium">AI trả lời nhanh tư vấn khách hàng</p>
                        </div>
                        <div className="ml-auto flex items-center gap-2 bg-white px-3 py-1.5 rounded-full ring-1 ring-black/5 shadow-sm">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-[11px] font-black text-emerald-600 uppercase tracking-wider">Sẵn sàng</span>
                        </div>
                    </div>

                    <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar bg-white shadow-inner">
                        {chatMessages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center py-10">
                                <Bot size={48} className="text-slate-200 mb-4" />
                                <p className="text-slate-400 text-[14px] font-medium max-w-[280px]">Hãy hỏi tôi bất cứ điều gì về sản phẩm hoặc kịch bản livestream.</p>
                            </div>
                        )}
                        {chatMessages.map((msg, i) => (
                            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                {msg.role === 'model' && (
                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                                        <Bot size={16} className="text-white" />
                                    </div>
                                )}
                                <div className={`max-w-[85%] px-5 py-3 rounded-[24px] text-[14px] font-medium leading-relaxed shadow-sm ${msg.role === 'user'
                                    ? 'bg-[#1d1d1f] text-white rounded-tr-sm'
                                    : 'bg-[#F5F5F7] text-[#1d1d1f] rounded-tl-sm ring-1 ring-black/5'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isThinking && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                                    <Loader2 size={16} className="animate-spin text-slate-400" />
                                </div>
                                <div className="bg-[#F5F5F7] px-5 py-3 rounded-[24px] rounded-tl-sm ring-1 ring-black/5 flex gap-1 items-center">
                                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-100"></div>
                                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-200"></div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="p-6 border-t border-black/5 bg-slate-50/50 shrink-0">
                        <div className="relative flex items-center gap-3">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Hỏi AI tư vấn kịch bản..."
                                className="w-full bg-white border border-slate-200 text-[#1d1d1f] text-[14px] font-medium rounded-2xl pl-5 pr-14 py-4 outline-none focus:ring-2 focus:ring-teal-500/50 transition-all shadow-sm"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!chatInput.trim() || isThinking}
                                className="absolute right-2 p-3 rounded-xl bg-[#1d1d1f] text-white hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex justify-between flex-wrap gap-4 mt-8 pt-6 border-t border-black/5">
                <Link href="/livestream/lighting" className="px-6 py-3 rounded-xl bg-slate-100 text-[#1d1d1f] font-bold text-[14px] flex items-center gap-2 hover:bg-slate-200 transition-colors">
                    <ChevronLeft size={16} /> Quay lại Ánh sáng
                </Link>
                <Link href="/livestream/report" className="px-6 py-3 rounded-xl bg-[#1d1d1f] text-white font-bold text-[14px] flex items-center gap-2 hover:opacity-90 transition-opacity">
                    Tiếp tục → Báo cáo <ChevronRight size={16} />
                </Link>
            </div>

            <div className="fixed bottom-10 right-10 flex flex-col gap-4 z-50 print:hidden lg:hidden">
                 <Link href="/livestream/lighting" className="p-4 rounded-full bg-slate-100 text-[#1d1d1f] shadow-xl ring-1 ring-black/10 hover:bg-slate-200 transition-all active:scale-90">
                    <ChevronLeft size={24} />
                </Link>
            </div>
        </div>
    );
}
