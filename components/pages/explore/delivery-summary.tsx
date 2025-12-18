import React, { useMemo } from "react";
import { View, ActivityIndicator, Pressable } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useTodaySummary } from "@/app/api/supabase/deliveries/todaySummary/useTodaySummary";
import { ThemedView } from "@/components/themed-view";

type Props = {
    clerkAuthId: string;
    onEdit: () => void;
};

export function DeliverySummary({ clerkAuthId, onEdit }: Props) {
    const { data, isLoading, error } = useTodaySummary(clerkAuthId);

    const grouped = useMemo(() => {
        if (!data || !data.submitted) return {};

        const map: Record<string, Record<string, number>> = {};

        for (const b of data.batches) {
            map[b.group_code] ??= {};
            map[b.group_code][b.scanner_code] =
                (map[b.group_code][b.scanner_code] ?? 0) + b.delivered_count;
        }

        return map;
    }, [data]);

    if (isLoading) return <ActivityIndicator />;
    if (error || !data || !data.submitted) return null;

    return (
        <ThemedView
            className="
        rounded-3xl
        px-6
        py-6
        mb-8
        shadow-black/10
        shadow-lg
        border
        border-black/5
      "
        >
            {/* Header */}
            <View className="mb-6">
                <ThemedText className="text-2xl font-semibold text-center">
                    Deliveries Submitted
                </ThemedText>
                <ThemedText className="text-sm text-center opacity-60 mt-1">
                    Today’s activity summary
                </ThemedText>
            </View>

            {/* Groups */}
            <View className="space-y-5">
                {Object.entries(grouped).map(([group, scanners]) => (
                    <View
                        key={group}
                        className="
              rounded-2xl
              p-4
              bg-black/5
            "
                    >
                        {/* Group header */}
                        <View className="flex-row items-center justify-between mb-3">
                            <ThemedText className="font-semibold text-base">
                                Group
                            </ThemedText>
                            <View className="px-3 py-1 rounded-full bg-black/10">
                                <ThemedText className="font-mono text-sm">
                                    {group}
                                </ThemedText>
                            </View>
                        </View>

                        {/* Scanner rows */}
                        <View className="space-y-1.5">
                            {Object.entries(scanners).map(([scanner, count]) => (
                                <View
                                    key={scanner}
                                    className="flex-row justify-between items-center"
                                >
                                    <ThemedText className="font-mono text-sm opacity-80">
                                        {scanner}
                                    </ThemedText>
                                    <View className="px-2 py-0.5 rounded-lg bg-black/10">
                                        <ThemedText className="font-mono text-sm font-semibold">
                                            {count}
                                        </ThemedText>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}
            </View>

            {/* CTA */}
            <Pressable
                onPress={onEdit}
                className="
          mt-6
          rounded-2xl
          py-4
          items-center
          bg-[#0a7ea4]
          shadow-black/20
          shadow-md
          active:opacity-80
        "
            >
                <ThemedText className="text-white font-semibold text-base">
                    Edit Today’s Deliveries
                </ThemedText>
            </Pressable>
        </ThemedView>
    );
}
