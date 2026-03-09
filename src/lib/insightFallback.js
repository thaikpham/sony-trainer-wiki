function toSafeName(value, fallback) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    return fallback;
}

function toSafePrice(value) {
    return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
}

function formatVnd(value) {
    return new Intl.NumberFormat('vi-VN').format(toSafePrice(value));
}

export function buildFallbackInsight({ activeNeedsText, loadout } = {}) {
    const needs = typeof activeNeedsText === 'string' && activeNeedsText.trim()
        ? activeNeedsText.trim()
        : 'nhu cau chup/quay da dung';

    const good = loadout?.good || {};
    const better = loadout?.better || {};
    const best = loadout?.best || {};

    const goodName = `${toSafeName(good.camName, 'Body Good')} + ${toSafeName(good.lensName, 'Lens Good')}`;
    const betterName = `${toSafeName(better.camName, 'Body Better')} + ${toSafeName(better.lensName, 'Lens Better')}`;
    const bestName = `${toSafeName(best.camName, 'Body Best')} + ${toSafeName(best.lensName, 'Lens Best')}`;

    const gapFromGood = toSafePrice(better.totalPrice) - toSafePrice(good.totalPrice);
    const gapToBest = toSafePrice(best.totalPrice) - toSafePrice(better.totalPrice);

    return [
        'DEAL TOT NHAT (Khuyen dung):',
        `Cau hinh De xuat (${betterName}) la diem can bang tot nhat cho nhu cau ${needs}.`,
        '- CHIEN BINH BUT PHA:',
        '- AF theo doi va do on dinh van hanh cao hon goi Tiet kiem, giup giam miss-shot.',
        '- Bo lens de thich ung nhieu boi canh tac nghiep hon trong mot bo setup duy nhat.',
        '- Tong chi phi dat hieu qua dau tu cao, de nang cap tiep theo tung buoc.',
        'SO SANH NGANG:',
        `- So voi Tiet kiem (${goodName}): them khoang ${formatVnd(gapFromGood)} VND de nhan buoc nhay ro rang ve hieu nang.`,
        `- So voi Nang cap (${bestName}): can them khoang ${formatVnd(gapToBest)} VND de dat nguong production cao nhat.`
    ].join('\n');
}

