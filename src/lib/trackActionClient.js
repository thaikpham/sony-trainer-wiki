export async function trackClientAction(action, options = {}) {
    const { count = 1 } = options;

    if (!action) return null;

    try {
        const res = await fetch('/api/track_action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, count }),
        });

        if (!res.ok) {
            return null;
        }

        const data = await res.json();
        const unlockedBadges = Array.isArray(data.unlockedBadges) ? data.unlockedBadges : [];

        if (typeof window !== 'undefined' && unlockedBadges.length > 0) {
            window.dispatchEvent(
                new CustomEvent('badge-unlocked', {
                    detail: { unlockedBadges },
                })
            );
        }

        return data;
    } catch (error) {
        console.error('[trackClientAction] Failed to track action', error);
        return null;
    }
}

