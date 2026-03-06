/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Palette, Play, Sliders, Info, Loader2, AlertCircle } from 'lucide-react';
import { getColorProfiles } from '../services/db';

export default function ColorLab() {
    const LUT_FILES = [
        "Batman.cube", "C&W_SLOG3_16.REST_4220.cube", "Catalyst_S-Log3_S-Gamut3.Cine-Rec709.cube", "Chicago_Slog3_LUT.cube",
        "Christmas-Sony-Slog-3-Alex-Don.cube", "DESERTS_SLOG3_8.RAS-FX6-0071.cube", "Denis-BarbasxSony-ARCTIC.cube",
        "Denis-BarbasxSony-BLIZZARD.cube", "Denis-BarbasxSony-WINTERFELL.cube", "Don_Autumn.cube", "EV_DREAMALITY_AFRICA_LUT.cube",
        "EV_GOLD+OVER+BLUE_NAZARE_LUT.cube", "EV_IMMERSIVE_BLUE_IRELAND_LUT.cube", "EV_PURPLE_HAZE_AFRICA_LUT.cube",
        "FOREST_SLOG3_27.RAS-FX6-2111.cube", "GLACIERS_SLOG3_6.RAS-FX6-3517.cube", "Halloween-0.cube", "Halloween2.cube",
        "JOKER.cube", "LAG_BLUE-HOUR.cube", "LAG_EARTHY.cube", "LAG_TRUE-TONE.cube", "Neutral_Slog3_LUT.cube", "OPPENHEIMER.cube",
        "Shot_by_Alice_Sony_LUT-DAWN.cube", "Shot_by_Alice_Sony_LUT-DUSK.cube", "Shot_by_Alice_Sony_LUT-FERN.cube",
        "SonyProSW-LUT1_REC709.cube", "SonyProSW-LUT2_REC709.cube", "SonyProSW-LUT3_REC709.cube", "TH_Nordic_Greens_LUT_x33.cube",
        "TH_Street_Tones_LUT_x33.cube", "TH_Studio_Mood_LUT_x33.cube", "The_Creator.cube", "Timeless_S-Log3_S-Gamut3.Cine-Rec709.cube",
        "VS-Creative-Look-1.cube", "VS-Creative-Look-2.cube", "VS-Creative-Look-3.cube", "VS-Creative-Look-4.cube", "Wanderer_S-Log3_S-Gamut3.Cine-Rec709.cube"
    ];

    const COVER_IMAGES = [
        "https://alphauniverseglobal.media.zestyio.com/CA_YR3_LAUNCH_VIDEO_LUTS_TEST_FOR_AU_SoftSunset_After_1.png",
        "https://alphauniverseglobal.media.zestyio.com/CA_YR3_LAUNCH_VIDEO_LUTS_TEST_FOR_AU_OrangeAndTeal_After_1.png",
        "https://dh0qks.media.zestyio.com/3.By2f0Go1T.jpeg",
        "https://alphauniverseglobal.media.zestyio.com/stem-greenhouse-recipient-thumb.jpg"
    ];

    // Build the rich library metadata
    const LUT_LIBRARY = LUT_FILES.map((filename, index) => {
        let cleanName = filename.replace('.cube', '').replace(/_/g, ' ');
        let category = 'Sony Cinematic';

        if (cleanName.includes('Denis-Barbas')) category = 'Denis Barbas';
        else if (cleanName.includes('EV')) category = 'Earth Vibes';
        else if (cleanName.includes('LAG')) category = 'LAG Collection';
        else if (cleanName.includes('TH')) category = 'Tropic Colour';
        else if (cleanName.includes('Shot by Alice')) category = 'Alice Collection';
        else if (cleanName.match(/Batman|JOKER|OPPENHEIMER|The Creator/i)) category = 'Hollywood Film';
        else if (cleanName.includes('ProSW')) category = 'Sony Pro';
        else if (cleanName.includes('VS-Creative-Look')) category = 'VS Creative Look';

        return {
            id: `lut-${index}`,
            filename,
            name: cleanName,
            category,
            coverImage: COVER_IMAGES[index % COVER_IMAGES.length],
            size: filename.length > 20 ? '1.2 MB' : '130 KB', // pseudo-realistic size estimation
        };
    });

    const [subTab, setSubTab] = useState('profile'); // 'creative', 'profile', 'lut'
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (subTab === 'profile') {
            let isCurrent = true;
            const fetchData = async () => {
                setLoading(true);
                setError(null);
                try {
                    const data = await getColorProfiles();
                    if (isCurrent) {
                        setRecipes(data || []);
                    }
                } catch (err) {
                    console.error("Error fetching color profiles:", err);
                    if (isCurrent) setError("Không thể tải cấu hình màu từ cơ sở dữ liệu.");
                } finally {
                    if (isCurrent) setLoading(false);
                }
            };
            fetchData();

            return () => { isCurrent = false; };
        }
    }, [subTab]);

    const handleRecipeSelect = (recipe) => {
        setSelectedRecipe(recipe);
        // Track milestone action
        fetch('/api/track_action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'color_profile_views' })
        }).then(r => r.json()).then(data => {
            if (data.unlockedBadges && data.unlockedBadges.length > 0) {
                window.dispatchEvent(new CustomEvent('badge-unlocked', { detail: { unlockedBadges: data.unlockedBadges } }));
            }
        }).catch(e => console.error("Failed to track color profile view action", e));
    };

    const handleTabSwitch = (tab) => {
        setSubTab(tab);
        if (tab === 'creative') {
            fetch('/api/track_action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'creative_look_views' })
            }).then(r => r.json()).then(data => {
                if (data.unlockedBadges && data.unlockedBadges.length > 0) {
                    window.dispatchEvent(new CustomEvent('badge-unlocked', { detail: { unlockedBadges: data.unlockedBadges } }));
                }
            });
        }
    };

    const trackLutDownload = () => {
        fetch('/api/track_action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'lut_downloads' })
        }).then(r => r.json()).then(data => {
            if (data.unlockedBadges && data.unlockedBadges.length > 0) {
                window.dispatchEvent(new CustomEvent('badge-unlocked', { detail: { unlockedBadges: data.unlockedBadges } }));
            }
        });
    };

    return (
        <div className="w-full flex flex-col gap-6 animate-slide-up relative z-10">
            {/* Top Sub-Navigation */}
            <div className="flex flex-col sm:flex-row gap-2 items-center justify-center p-2 glass-panel p-2 rounded-2xl">
                <button
                    onClick={() => handleTabSwitch('creative')}
                    className={`flex-1 w-full sm:w-auto px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all ${subTab === 'creative' ? 'bg-indigo-600 text-white shadow-md' : 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                >
                    <Palette size={16} /> Creative Look (Mod)
                </button>
                <button
                    onClick={() => handleTabSwitch('profile')}
                    className={`flex-1 w-full sm:w-auto px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all ${subTab === 'profile' ? 'bg-cyan-600 text-white shadow-md' : 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                >
                    <Sliders size={16} /> Picture Profile
                </button>
                <button
                    onClick={() => handleTabSwitch('lut')}
                    className={`flex-1 w-full sm:w-auto px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all ${subTab === 'lut' ? 'bg-emerald-600 text-white shadow-md' : 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                >
                    <Play size={16} /> LUT Màu (.cube)
                </button>
            </div>

            {/* Content Area */}
            <div className="glass-panel p-6 sm:p-10 rounded-[40px] min-h-[400px]">
                {subTab === 'profile' && (
                    <div className="flex flex-col gap-6">
                        <div className="text-center mb-4">
                            <h2 className="text-2xl font-black text-slate-900 mb-2">Cộng Đồng Picture Profile</h2>
                            <p className="text-slate-500 text-sm">Công thức màu cao cấp được nghiên cứu dành riêng cho hệ thống cảm biến Sony. Áp dụng ngay trên máy tính mà không cần qua hậu kỳ.</p>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 size={32} className="animate-spin text-cyan-500 mb-4" />
                                <p className="text-slate-500 font-medium">Đang tải công thức màu cục bộ...</p>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 text-red-600 flex flex-col items-center p-8 rounded-3xl border border-red-100 max-w-lg mx-auto">
                                <AlertCircle size={40} className="mb-4 text-red-400" />
                                <h3 className="text-lg font-bold mb-2">Lỗi Kết Nối Dữ Liệu</h3>
                                <p className="text-sm font-medium text-center">{error}</p>
                            </div>
                        ) : recipes.length === 0 ? (
                            <p className="text-center text-slate-500 py-10">Chưa có công thức màu nào được tải lên.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {recipes.map(recipe => (
                                    <div key={recipe.id} onClick={() => handleRecipeSelect(recipe)} className="border border-slate-200 rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-transform group bg-white">
                                        <div className="h-48 bg-slate-100 relative overflow-hidden">
                                            {recipe.images && recipe.images.length > 0 ? (
                                                <img src={recipe.images[0]} alt={recipe.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <Palette size={40} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-black text-lg text-slate-800 line-clamp-1">{recipe.name}</h3>
                                            </div>
                                            <div className="flex gap-2 mb-3">
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                                                    {recipe.contrast} contrast
                                                </span>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                                                    {recipe.type === 'bw' ? 'B&W' : 'Color'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 line-clamp-2 mb-4">{recipe.description}</p>

                                            <div className="flex gap-1.5 flex-wrap">
                                                {recipe.tags && Array.isArray(recipe.tags) && recipe.tags.slice(0, 3).map(t => (
                                                    <span key={t} className="text-[10px] bg-cyan-50 text-cyan-600 px-1.5 py-0.5 rounded-md font-medium border border-cyan-100/50">#{t}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {subTab === 'creative' && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 text-indigo-500">
                            <Palette size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2">Sony Creative Look</h3>
                        <p className="text-slate-500 max-w-md">Các hướng dẫn Mod màu tích hợp sẵn trong máy ảnh (FL, IN, SH, PT...) sẽ sớm được cập nhật tại đây.</p>
                    </div>
                )}

                {subTab === 'lut' && (
                    <div className="flex flex-col gap-6">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-black text-slate-900 mb-2">Alpha Universe LUT Library</h2>
                            <p className="text-slate-500 text-sm">Kho {LUT_LIBRARY.length} file LUT (.cube) chuẩn Cinematic để áp lên Footage quay S-Log3, HLG hoặc xem trên Monitor Preview.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {LUT_LIBRARY.map(lut => (
                                <div key={lut.id} className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                                    <div className="h-40 relative bg-slate-100 overflow-hidden shrink-0">
                                        <img src={lut.coverImage} alt={lut.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                        <span className="absolute top-3 left-3 bg-white/20 backdrop-blur-md text-white border border-white/20 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                                            {lut.category}
                                        </span>
                                    </div>
                                    <div className="p-4 flex flex-col flex-1 justify-between">
                                        <div className="mb-4">
                                            <h3 className="text-sm font-bold text-slate-800 leading-tight mb-1 truncate" title={lut.name}>{lut.name}</h3>
                                            <p className="text-[11px] font-medium text-slate-500">Cube File • {lut.size}</p>
                                        </div>
                                        <a href={`/luts/${lut.filename}`} onClick={trackLutDownload} download className="w-full relative overflow-hidden bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold text-xs py-2.5 rounded-xl border border-slate-200 hover:border-emerald-200 transition-colors flex items-center justify-center gap-2 group/btn">
                                            <svg className="w-4 h-4 transition-transform group-hover/btn:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                            Phân Phối Bởi Sony
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Premium Modal for Recipe Definition using React Portal */}
            {mounted && selectedRecipe && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-12 bg-black/[0.02] backdrop-blur-[20px] backdrop-saturate-[180%] animate-in fade-in duration-200" onClick={() => setSelectedRecipe(null)}>
                    <div className="relative w-full max-w-4xl max-h-full flex flex-col animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>

                        <div className="bg-white rounded-[2rem] w-full h-full overflow-y-auto custom-scrollbar shadow-2xl flex flex-col border border-white relative">
                            {/* Hero Image */}
                            {selectedRecipe.images && selectedRecipe.images.length > 0 && (
                                <div className="w-full h-64 sm:h-80 bg-slate-100 shrink-0 relative group rounded-t-[2rem] overflow-hidden">
                                    <button
                                        onClick={() => setSelectedRecipe(null)}
                                        className="absolute z-50 top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 sm:w-9 sm:h-9 bg-black/20 hover:bg-black/40 text-white/90 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10"
                                        aria-label="Đóng"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                    <img src={selectedRecipe.images[0]} alt={selectedRecipe.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
                                    <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 pr-6 text-white">
                                        <h2 className="text-3xl sm:text-5xl font-black mb-3 tracking-tight drop-shadow-lg">{selectedRecipe.name}</h2>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 uppercase tracking-widest shadow-sm">WB: {selectedRecipe.whiteBalance}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="p-6 sm:p-10 flex-1 bg-white relative">
                                {/* Title fallback if no image */}
                                {(!selectedRecipe.images || selectedRecipe.images.length === 0) && (
                                    <div className="mb-8 pb-6 border-b border-slate-100 relative">
                                        <button
                                            onClick={() => setSelectedRecipe(null)}
                                            className="absolute z-50 top-0 right-0 w-8 h-8 sm:w-9 sm:h-9 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full flex items-center justify-center"
                                            aria-label="Đóng"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                        <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight pr-12">{selectedRecipe.name}</h2>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-widest border border-slate-200">WB: {selectedRecipe.whiteBalance}</span>
                                        </div>
                                    </div>
                                )}

                                <p className="text-slate-600 leading-relaxed max-w-3xl text-[17px] mb-10 font-medium">{selectedRecipe.description}</p>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {selectedRecipe.recipeSettings?.settings && Object.keys(selectedRecipe.recipeSettings.settings).length > 0 && (
                                        <div className="border border-slate-100 rounded-3xl p-6 sm:p-8 bg-slate-50 hover:bg-slate-50">
                                            <h4 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-3"><span className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center"><Sliders size={16} /></span> Main Settings</h4>
                                            <ul className="space-y-4 text-sm">
                                                {Object.entries(selectedRecipe.recipeSettings.settings).map(([k, v]) => (
                                                    <li key={k} className="flex justify-between items-center border-b border-slate-200 pb-3 font-medium"><span className="text-slate-500 capitalize">{k.replace(/_/g, ' ')}</span> <span className="text-slate-800 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">{v}</span></li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    <div className="space-y-8">
                                        {selectedRecipe.recipeSettings?.colorDepth && Object.keys(selectedRecipe.recipeSettings.colorDepth).length > 0 && (
                                            <div className="border border-slate-100 rounded-3xl p-6 sm:p-8 bg-slate-50 hover:bg-slate-50">
                                                <h4 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-3"><span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center"><Palette size={16} /></span> Color Depth</h4>
                                                <div className="grid grid-cols-3 gap-3 text-center text-sm">
                                                    {Object.entries(selectedRecipe.recipeSettings.colorDepth).map(([k, v]) => (
                                                        <div key={k} className="bg-white p-3 py-4 rounded-2xl border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">{k}</div>
                                                            <div className="font-black text-slate-800 text-lg">{v > 0 ? `+${v}` : v}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {selectedRecipe.recipeSettings?.detailSettings && Object.keys(selectedRecipe.recipeSettings.detailSettings).length > 0 && (
                                            <div className="border border-slate-100 rounded-3xl p-6 sm:p-8 bg-slate-50 hover:bg-slate-50">
                                                <h4 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-3"><span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><Info size={16} /></span> Detail Settings</h4>
                                                <ul className="space-y-4 text-sm">
                                                    {Object.entries(selectedRecipe.recipeSettings.detailSettings).map(([k, v]) => (
                                                        <li key={k} className="flex justify-between items-center border-b border-slate-200 pb-3 font-medium"><span className="text-slate-500 capitalize">{k.replace(/_/g, ' ')}</span> <span className="text-slate-800 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">{v}</span></li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
