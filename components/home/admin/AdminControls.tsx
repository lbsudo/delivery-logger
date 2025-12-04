import React from "react";
import { View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useUser } from "@clerk/clerk-expo";

export function AdminControls() {
    const { user } = useUser();

    if (!user) return null;

    const role = user.publicMetadata?.role;

    // Only show message if role === "admin"
    if (role !== "admin") return null;

    return (
        <View className="px-6 mt-6">
            <View className="bg-neutral-900 border border-neutral-700 rounded-xl p-4 shadow-lg shadow-black/30">
                <ThemedText className="text-center text-lg font-semibold text-white">
                    hello admin
                </ThemedText>
            </View>
        </View>
    );
}
