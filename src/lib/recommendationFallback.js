const LEVELS = new Set(['newbie', 'advanced', 'professional', 'hi-end', 'flagship']);

const BASE_PRESETS = {
    newbie: {
        good: {
            camName: 'Sony ZV-E10 II',
            camDesc: 'Body APS-C gon nhe, de bat dau quay/chup va nang cap len E-mount.',
            camPrice: 23990000,
            lensName: 'Sony E PZ 16-50mm F3.5-5.6 OSS II',
            lensType: 'Zoom da dung',
            lensPrice: 5990000
        },
        better: {
            camName: 'Sony A6700',
            camDesc: 'AF manh, quay 4K chat luong cao, can bang giua hoc va tac nghiep.',
            camPrice: 36990000,
            lensName: 'Sony E 18-135mm F3.5-5.6 OSS',
            lensType: 'Zoom all-in-one',
            lensPrice: 11990000
        },
        best: {
            camName: 'Sony A7C II',
            camDesc: 'Full-frame gon nhe de nang cap dai han ma van giu tinh co dong.',
            camPrice: 51990000,
            lensName: 'Sony FE 24-50mm F2.8 G',
            lensType: 'Zoom full-frame',
            lensPrice: 28990000
        }
    },
    advanced: {
        good: {
            camName: 'Sony A6700',
            camDesc: 'APS-C cao cap, tracking AF tot, phu hop nguoi dung ban chuyen.',
            camPrice: 36990000,
            lensName: 'Sony E 15mm F1.4 G',
            lensType: 'Prime goc rong',
            lensPrice: 16990000
        },
        better: {
            camName: 'Sony A7 IV',
            camDesc: 'Full-frame can bang cho ca anh va video, de mo rong he thong lens.',
            camPrice: 54990000,
            lensName: 'Sony FE 24-105mm F4 G OSS',
            lensType: 'Zoom da dung',
            lensPrice: 31990000
        },
        best: {
            camName: 'Sony A7C R',
            camDesc: 'Do phan giai cao trong than may compact, phu hop du lich va thuong mai.',
            camPrice: 73990000,
            lensName: 'Sony FE 24-70mm F2.8 GM II',
            lensType: 'Zoom chuyen nghiep',
            lensPrice: 51990000
        }
    },
    professional: {
        good: {
            camName: 'Sony A7R V',
            camDesc: 'May anh do phan giai cao cho workflow thuong mai va studio.',
            camPrice: 85990000,
            lensName: 'Sony FE 24-70mm F2.8 GM II',
            lensType: 'Zoom chuyen nghiep',
            lensPrice: 51990000
        },
        better: {
            camName: 'Sony FX3',
            camDesc: 'Cinema line gon nhe, toi uu quay phim dich vu va production.',
            camPrice: 91990000,
            lensName: 'Sony FE 16-35mm F2.8 GM II',
            lensType: 'Zoom goc rong',
            lensPrice: 55990000
        },
        best: {
            camName: 'Sony Alpha 1 II',
            camDesc: 'Hybrid flagship cho anh toc do cao va video production cap cao.',
            camPrice: 169990000,
            lensName: 'Sony FE 70-200mm F2.8 GM OSS II',
            lensType: 'Zoom tele',
            lensPrice: 69990000
        }
    },
    'hi-end': {
        good: {
            camName: 'Sony A7R V',
            camDesc: 'Diem vao hi-end voi do phan giai cao va AF thong minh.',
            camPrice: 85990000,
            lensName: 'Sony FE 24-70mm F2.8 GM II',
            lensType: 'Zoom chuyen nghiep',
            lensPrice: 51990000
        },
        better: {
            camName: 'Sony Alpha 9 III',
            camDesc: 'Global shutter cho tac nghiep toc do cao va anti-banding toi uu.',
            camPrice: 159990000,
            lensName: 'Sony FE 50mm F1.2 GM',
            lensType: 'Prime cao cap',
            lensPrice: 48990000
        },
        best: {
            camName: 'Sony Alpha 1 II',
            camDesc: 'Flagship all-round cho workflow premium khong thoa hiep.',
            camPrice: 169990000,
            lensName: 'Sony FE 28-70mm F2 GM',
            lensType: 'Zoom premium F2',
            lensPrice: 79990000
        }
    },
    flagship: {
        good: {
            camName: 'Sony Alpha 9 III',
            camDesc: 'Global shutter dan dau cho the thao, su kien va tac nghiep cao toc.',
            camPrice: 159990000,
            lensName: 'Sony FE 24-70mm F2.8 GM II',
            lensType: 'Zoom chuyen nghiep',
            lensPrice: 51990000
        },
        better: {
            camName: 'Sony Alpha 1 II',
            camDesc: 'Hieu nang flagship toan dien cho anh, video va newsroom.',
            camPrice: 169990000,
            lensName: 'Sony FE 50mm F1.2 GM',
            lensType: 'Prime flagship',
            lensPrice: 48990000
        },
        best: {
            camName: 'Sony Alpha 1 II',
            camDesc: 'Cau hinh dinh cao toi uu cho output thuong mai va production.',
            camPrice: 169990000,
            lensName: 'Sony FE 28-70mm F2 GM',
            lensType: 'Zoom premium F2',
            lensPrice: 79990000
        }
    }
};

const NEED_OVERRIDES = {
    sports: {
        good: { lensName: 'Sony FE 70-200mm F4 Macro G OSS II', lensType: 'Zoom tele' },
        better: { lensName: 'Sony FE 70-200mm F2.8 GM OSS II', lensType: 'Zoom tele chuyen nghiep' },
        best: { lensName: 'Sony FE 300mm F2.8 GM OSS', lensType: 'Prime sieu tele' }
    },
    wildlife: {
        good: { lensName: 'Sony FE 200-600mm F5.6-6.3 G OSS', lensType: 'Zoom tele xa' },
        better: { lensName: 'Sony FE 100-400mm F4.5-5.6 GM OSS', lensType: 'Zoom tele GM' },
        best: { lensName: 'Sony FE 300mm F2.8 GM OSS', lensType: 'Prime sieu tele' }
    },
    macro: {
        good: { lensName: 'Sony FE 90mm F2.8 Macro G OSS', lensType: 'Macro prime' },
        better: { lensName: 'Sony FE 90mm F2.8 Macro G OSS', lensType: 'Macro prime' },
        best: { lensName: 'Sony FE 100mm F2.8 Macro GM OSS', lensType: 'Macro GM' }
    },
    video: {
        good: { lensName: 'Sony FE PZ 16-35mm F4 G', lensType: 'Power Zoom' },
        better: { lensName: 'Sony FE 24-70mm F2.8 GM II', lensType: 'Zoom quay phim' },
        best: { lensName: 'Sony FE 28-70mm F2 GM', lensType: 'Zoom premium F2' }
    },
    travel: {
        good: { lensName: 'Sony FE 20-70mm F4 G', lensType: 'Zoom da dung' },
        better: { lensName: 'Sony FE 24-50mm F2.8 G', lensType: 'Zoom gon nhe' },
        best: { lensName: 'Sony FE 24-70mm F2.8 GM II', lensType: 'Zoom premium' }
    }
};

const PRIME_PREF_OVERRIDES = {
    good: { lensName: 'Sony FE 35mm F1.8', lensType: 'Prime da dung', lensPrice: 16990000 },
    better: { lensName: 'Sony FE 50mm F1.4 GM', lensType: 'Prime GM', lensPrice: 32990000 },
    best: { lensName: 'Sony FE 85mm F1.4 GM II', lensType: 'Prime chan dung', lensPrice: 44990000 }
};

const ZOOM_PREF_OVERRIDES = {
    good: { lensName: 'Sony FE 20-70mm F4 G', lensType: 'Zoom da dung', lensPrice: 33990000 },
    better: { lensName: 'Sony FE 24-105mm F4 G OSS', lensType: 'Zoom da dung', lensPrice: 31990000 },
    best: { lensName: 'Sony FE 24-70mm F2.8 GM II', lensType: 'Zoom chuyen nghiep', lensPrice: 51990000 }
};

const COURSE_BY_LEVEL = {
    newbie: { name: 'Co ban ve Mirrorless va bo cuc', instructor: 'Sony Alpha Vietnam Team' },
    advanced: { name: 'Ky thuat anh chan dung va su kien', instructor: 'Sony Alpha Academy' },
    professional: { name: 'Workflow quay phim chuyen nghiep voi Sony', instructor: 'Sony Pro Support' },
    'hi-end': { name: 'Mastering Hybrid Production voi Sony Alpha', instructor: 'Sony Imaging Specialist' },
    flagship: { name: 'Flagship Sony Alpha: High-end Commercial Workflow', instructor: 'Sony Master Trainer' }
};

function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
}

function normalizeLevel(level) {
    if (!level || typeof level !== 'string') return 'advanced';
    return LEVELS.has(level) ? level : 'advanced';
}

function normalizePrice(value) {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) return Math.round(value);
    return 0;
}

function applyOverrides(target, overrides) {
    if (!overrides) return;
    Object.assign(target, overrides);
}

function finalizeTier(tier, tierCode, label) {
    const camPrice = normalizePrice(tier.camPrice);
    const lensPrice = normalizePrice(tier.lensPrice);
    const totalPrice = camPrice + lensPrice;

    return {
        camName: tier.camName || 'Sony Camera',
        camDesc: tier.camDesc || 'Cau hinh Sony toi uu cho nhu cau hien tai.',
        camPrice,
        lensName: tier.lensName || 'Sony Lens',
        lensType: tier.lensType || 'Lens Sony',
        lensPrice,
        totalPrice,
        tierCode,
        label
    };
}

function getPrimaryNeed(userNeeds) {
    if (!Array.isArray(userNeeds) || userNeeds.length === 0) return null;
    return userNeeds.find((need) => typeof need === 'string') || null;
}

export function buildFallbackLoadout({ userNeeds = [], experienceLevel = 'advanced', prefs = {} } = {}) {
    const level = normalizeLevel(experienceLevel);
    const preset = deepClone(BASE_PRESETS[level] || BASE_PRESETS.advanced);
    const primaryNeed = getPrimaryNeed(userNeeds);

    if (primaryNeed && NEED_OVERRIDES[primaryNeed]) {
        const overrides = NEED_OVERRIDES[primaryNeed];
        applyOverrides(preset.good, overrides.good);
        applyOverrides(preset.better, overrides.better);
        applyOverrides(preset.best, overrides.best);
    }

    if (prefs?.lensPref === 'prime') {
        applyOverrides(preset.good, PRIME_PREF_OVERRIDES.good);
        applyOverrides(preset.better, PRIME_PREF_OVERRIDES.better);
        applyOverrides(preset.best, PRIME_PREF_OVERRIDES.best);
    }

    if (prefs?.lensPref === 'zoom') {
        applyOverrides(preset.good, ZOOM_PREF_OVERRIDES.good);
        applyOverrides(preset.better, ZOOM_PREF_OVERRIDES.better);
        applyOverrides(preset.best, ZOOM_PREF_OVERRIDES.best);
    }

    if (prefs?.currentGear && typeof prefs.currentGear === 'string' && prefs.currentGear.trim()) {
        const note = `Nang cap tu he thong hien tai (${prefs.currentGear.trim()}) de toi uu chi phi chuyen doi.`;
        preset.good.camDesc = `${preset.good.camDesc} ${note}`;
    }

    return {
        good: finalizeTier(preset.good, 'GOOD', 'Tiet kiem'),
        better: finalizeTier(preset.better, 'BETTER', 'De xuat'),
        best: finalizeTier(preset.best, 'BEST', 'Nang cap'),
        courseRecommendation: COURSE_BY_LEVEL[level] || COURSE_BY_LEVEL.advanced,
        source: 'fallback-local'
    };
}

