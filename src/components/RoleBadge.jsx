'use client';
import { ROLES } from '@/lib/roles';

/**
 * RoleBadge — displays a colored pill with emoji + role label for the given roleKey.
 * size: 'sm' | 'md'
 */
export default function RoleBadge({ roleKey, size = 'sm' }) {
    const role = ROLES[roleKey];
    if (!role) return null;

    // Size variants
    const padding = size === 'md' ? 'px-2.5 py-0.5' : 'px-2 py-[2px]';
    const fontSize = size === 'md' ? 'text-[11px]' : 'text-[10px]';

    return (
        <span
            className={`inline-flex items-center gap-1.5 ${padding} ${fontSize} font-black rounded-full bg-gradient-to-r ${role.gradient} ${role.textColor} leading-none tracking-wide whitespace-nowrap select-none border border-white/20 dark:border-white/10 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 group relative overflow-hidden`}
            style={{
                boxShadow: `0 4px 12px ${role.glow}`,
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}
            title={role.label}
        >
            {/* Glossy overlay */}
            <span className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />

            <span className="relative z-10 drop-shadow-sm">{role.emoji}</span>
            <span className="relative z-10 uppercase tracking-wider">{role.short}</span>
        </span>
    );
}
