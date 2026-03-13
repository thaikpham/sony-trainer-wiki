'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRoleAccess } from '@/components/RoleProvider';
import { getLiveStreamConfig, getLiveStreamEquipment } from '@/lib/supabaseClient';
import { platformsData } from '@/data/platformsData';

const LiveStreamContext = createContext();

export function LiveStreamProvider({ children }) {
    const { user } = useUser();
    const { canViewReport, roleKeys } = useRoleAccess();
    const isEmployee = roleKeys?.some(k => ['DEV', 'TRAINER', 'PRODUCT_MARKETING', 'DATA'].includes(k));

    const [liveConfig, setLiveConfig] = useState({ 
        pictureProfile: `PP Preset Phòng Live Sony (S-Cinetone)
- Gamma: S-Cinetone
- Color Mode: S-Cinetone
- Black Level: -2
- Knee: Manual (Point: 80%, Slope: +0)
- Detail: Lvl 0, Mode Manual` 
    });
    const [equipmentList, setEquipmentList] = useState([
        { id: 1, group: 'Audio', brand: 'Sony', gearList: 'Micro Sony C80', quantity: 1, serialNumber: 'SN-C80-001', source: 'Kho', status: 'Good', checked: true },
        { id: 2, group: 'Audio', brand: 'Elgato', gearList: 'Wave XLR Interface', quantity: 1, serialNumber: 'SN-WAVE-XLR', source: 'Kho', status: 'Good', checked: true },
        { id: 3, group: 'Video', brand: 'Sony', gearList: 'Camera Sony (4K Output)', quantity: 4, serialNumber: 'CAM-A7M4-PRO', source: 'Studio', status: 'Good', checked: true },
        { id: 4, group: 'Video', brand: 'Elgato', gearList: 'Cam Link Pro (PCIe)', quantity: 1, serialNumber: 'SN-CAMLINK-PRO', source: 'PC Slot', status: 'Good', checked: true },
        { id: 5, group: 'Control', brand: 'Elgato', gearList: 'Stream Deck MK.2', quantity: 1, serialNumber: 'SN-SDECK-MK2', source: 'Bàn', status: 'Good', checked: true },
    ]);
    const [isEditingEquipment, setIsEditingEquipment] = useState(false);
    const [activePlatformIndex, setActivePlatformIndex] = useState(0);
    const [platforms] = useState(platformsData);

    const [isStreaming, setIsStreaming] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState('');
    const [selectedAudioDevice, setSelectedAudioDevice] = useState('');

    // AI & Content Section State
    const [scriptTitle, setScriptTitle] = useState('');
    const [scriptDesc, setScriptDesc] = useState('');
    const [generatedTimeline, setGeneratedTimeline] = useState('');
    const [chatMessages, setChatMessages] = useState([]);

    // Video Tuning & Device Management
    const [brightness, setBrightness] = useState(100);
    const [saturation, setSaturation] = useState(100);
    const [isMirror, setIsMirror] = useState(false);
    const [videoStream, setVideoStream] = useState(null);
    const [availableCameras, setAvailableCameras] = useState([]);
    const [availableMics, setAvailableMics] = useState([]);
    const [isConnecting, setIsConnecting] = useState(false);

    // Enumerate devices on mount
    useEffect(() => {
        async function getDevices() {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const cameras = devices.filter(d => d.kind === 'videoinput');
                const mics = devices.filter(d => d.kind === 'audioinput');
                setAvailableCameras(cameras);
                setAvailableMics(mics);
                if (cameras.length > 0 && !selectedDevice) setSelectedDevice(cameras[0].deviceId);
                if (mics.length > 0 && !selectedAudioDevice) setSelectedAudioDevice(mics[0].deviceId);
            } catch (err) {
                console.error("Error enumerating devices:", err);
            }
        }
        getDevices();
    }, [selectedDevice, selectedAudioDevice]);

    useEffect(() => {
        async function fetchConfig() {
            try {
                const [config, equipment] = await Promise.all([
                    getLiveStreamConfig(),
                    getLiveStreamEquipment()
                ]);
                if (config) setLiveConfig((prev) => ({ ...prev, ...config }));
                if (equipment && equipment.length > 0) {
                    setEquipmentList(equipment.map((item) => ({
                        ...item,
                        checked: item.checked === true
                    })));
                }
            } catch (err) {
                console.error('Error fetching livestream data:', err);
            }
        }
        fetchConfig();
    }, []);

    const value = {
        user,
        isEmployee,
        canViewReport,
        liveConfig,
        setLiveConfig,
        equipmentList,
        setEquipmentList,
        isEditingEquipment,
        setIsEditingEquipment,
        activePlatformIndex,
        setActivePlatformIndex,
        platforms,
        isStreaming,
        setIsStreaming,
        selectedDevice,
        setSelectedDevice,
        selectedAudioDevice,
        setSelectedAudioDevice,
        scriptTitle,
        setScriptTitle,
        scriptDesc,
        setScriptDesc,
        generatedTimeline,
        setGeneratedTimeline,
        chatMessages,
        setChatMessages,
        brightness,
        setBrightness,
        saturation,
        setSaturation,
        isMirror,
        setIsMirror,
        videoStream,
        setVideoStream,
        availableCameras,
        availableMics,
        isConnecting,
        setIsConnecting
    };

    return (
        <LiveStreamContext.Provider value={value}>
            {children}
        </LiveStreamContext.Provider>
    );
}

export function useLiveStream() {
    const context = useContext(LiveStreamContext);
    if (!context) {
        throw new Error('useLiveStream must be used within a LiveStreamProvider');
    }
    return context;
}
