import React, { useRef, useEffect } from "react";
import { View, Animated } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";

interface Props {
    firstName: string;
    deliveries: any[];
    loading: boolean;
}

export function WeeklyDeliveries({ firstName, deliveries, loading }: Props) {
    const pulse = useRef(new Animated.Value(1)).current;

    // Slower pulsing animation
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, {
                    toValue: 1.25,
                    duration: 1500, // slower
                    useNativeDriver: true,
                }),
                Animated.timing(pulse, {
                    toValue: 1,
                    duration: 1500, // slower
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [pulse]);

    return (
        <View className="px-6 mt-10">
            {/* Modern Card */}
            <View className="bg-neutral-900 rounded-2xl p-8 shadow-xl shadow-black/50 border border-neutral-800 items-center">

                {/* Pulsing Blue Icon */}
                <Animated.View style={{ transform: [{ scale: pulse }] }}>
                    <Ionicons
                        name="cube-outline"
                        size={48}
                        color="#3B82F6" // BLUE
                    />
                </Animated.View>

                {/* Welcome */}
                <ThemedText className="text-center text-2xl font-bold mt-4 mb-1 text-white">
                    Welcome back, {firstName}!
                </ThemedText>

                {/* Header */}
                <ThemedText className="text-center text-lg font-semibold mb-6 text-neutral-300">
                    Deliveries This Week
                </ThemedText>

                {/* Content */}
                {loading ? (
                    <ThemedText className="text-center">Loading…</ThemedText>
                ) : deliveries.length === 0 ? (
                    <ThemedText className="text-center">
                        No deliveries recorded yet this week.
                    </ThemedText>
                ) : (
                    deliveries.map((d: any) => (
                        <View
                            key={d.id}
                            className="bg-neutral-800 border border-neutral-700 rounded-xl px-6 py-4 mb-3 w-full"
                        >
                            <ThemedText className="text-center text-xl font-semibold text-white">
                                {d.delivery_count} Deliveries
                            </ThemedText>
                        </View>
                    ))
                )}
            </View>
        </View>
    );
}
