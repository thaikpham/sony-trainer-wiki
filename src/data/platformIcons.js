import { Youtube, Facebook, ShoppingBag, ShoppingCart, Smartphone, Camera } from 'lucide-react';

export const platformIcons = {
    tiktok: { icon: Smartphone, color: 'bg-black text-white hover:bg-slate-800' },
    facebook: { icon: Facebook, color: 'bg-blue-600 text-white hover:bg-blue-700' },
    youtube: { icon: Youtube, color: 'bg-red-600 text-white hover:bg-red-700' },
    shopee: { icon: ShoppingBag, color: 'bg-orange-500 text-white hover:bg-orange-600' },
    lazada: { icon: ShoppingCart, color: 'bg-indigo-600 text-white hover:bg-indigo-700' },
    default: { icon: Camera, color: 'bg-teal-600 text-white hover:bg-teal-700' }
};
