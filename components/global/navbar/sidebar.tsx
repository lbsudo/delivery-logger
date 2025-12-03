// components/ui/Sidebar.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, View, Pressable, Text } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // <-- Import Expo Router

interface SidebarProps {
    visible: boolean;
    onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ visible, onClose }) => {
    const backgroundColor = useThemeColor({}, 'background'); // sidebar panel
    const textColor = useThemeColor({}, 'text');
    const iconColor = useThemeColor({}, 'icon');
    const router = useRouter(); // <-- Initialize router

    const slideAnim = useRef(new Animated.Value(-260)).current;

    useEffect(() => {
        if (visible) {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: false,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: -260,
                duration: 250,
                useNativeDriver: false,
            }).start();
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <View
            className="absolute top-0 left-0 right-0 bottom-0"
            style={{ zIndex: 1000 }}
        >
            {/* FULLSCREEN SOLID OVERLAY */}
            <Pressable
                className="absolute top-0 left-0 right-0 bottom-0 bg-black/50"
                onPress={onClose}
            />

            {/* SIDEBAR PANEL */}
            <Animated.View
                style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    width: 260,
                    backgroundColor,
                    paddingTop: 52,
                    paddingLeft: 12,
                    transform: [{ translateX: slideAnim }],
                    zIndex: 1001,
                }}
            >
                {/* HEADER ROW: Title + X BUTTON */}
                <View className="flex-row items-center justify-between mb-2">
                    <Text
                        style={{
                            color: textColor,
                            fontSize: 22,
                            fontWeight: 'bold',
                        }}
                    >
                        Admin Panel
                    </Text>

                    <Pressable onPress={onClose} className="p-1">
                        <Ionicons name="close" size={26} color={iconColor} />
                    </Pressable>
                </View>

                {/* MENU OPTIONS (solid background) */}
                <View
                    style={{
                        backgroundColor,
                        borderRadius: 12,
                        paddingVertical: 4,
                        paddingHorizontal: 0,
                    }}
                >
                    {/* Navigate to admin-shop */}
                    <Pressable
                        className="pb-4 rounded-lg"
                        onPress={() => {
                            router.push('/(admin)/admin-shop'); // <-- Navigation
                            onClose(); // close sidebar after navigation
                        }}
                    >
                        <Text style={{ color: textColor, fontSize: 18 }}>
                            Manage Shop
                        </Text>
                    </Pressable>

                    <Pressable className="p-0 rounded-lg">
                        <Text style={{ color: textColor, fontSize: 18 }}>
                            Manage Advisory
                        </Text>
                    </Pressable>
                </View>
            </Animated.View>
        </View>
    );
};
