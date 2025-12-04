import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { Fonts } from "@/constants/theme";

interface Props {
    todaysData: { delivery_count: number; scanner_numbers: string[] };
    onEdit: () => void;
}

export function DeliverySummary({ todaysData, onEdit }: Props) {
    return (
        <View className="items-center">
            {/* Summary Card */}
            <View className="w-full bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-lg dark:shadow-black/30 mb-6">
                <View className="items-center mb-6">
                    <View className="bg-green-100 dark:bg-green-900/30 rounded-full p-4 mb-4">
                        <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
                    </View>

                    <ThemedText className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Deliveries Completed
                    </ThemedText>

                    <ThemedText
                        className="text-6xl font-bold text-blue-600 dark:text-blue-400"
                        style={{ fontFamily: Fonts.rounded }}
                    >
                        {todaysData.delivery_count}
                    </ThemedText>
                </View>

                {/* Scanner numbers */}
                {todaysData.scanner_numbers.length > 0 && (
                    <View className="border-t border-gray-200 dark:border-gray-800 pt-6 mt-2">
                        <View className="flex-row items-center justify-between mb-4">
                            <ThemedText className="text-base font-semibold">
                                Scanner Numbers
                            </ThemedText>
                            <View className="bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                                <ThemedText className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                    {todaysData.scanner_numbers.length}
                                </ThemedText>
                            </View>
                        </View>

                        <View className="gap-2">
                            {todaysData.scanner_numbers.map((num, idx) => (
                                <View
                                    key={idx}
                                    className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700"
                                >
                                    <ThemedText className="font-mono text-base">{num}</ThemedText>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </View>

            {/* Edit Button */}
            <Pressable
                onPress={onEdit}
                className="bg-blue-600 active:bg-blue-700 px-8 py-4 rounded-2xl shadow-sm"
            >
                <View className="flex-row items-center gap-2">
                    <Ionicons name="create-outline" size={20} color="#fff" />
                    <ThemedText className="text-white text-base font-semibold">
                        Edit Deliveries
                    </ThemedText>
                </View>
            </Pressable>
        </View>
    );
}
