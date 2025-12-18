import { View, ActivityIndicator, ScrollView } from "react-native";
import React, { useMemo, useState } from "react";

import { ThemedText } from "@/components/themed-text";
import { Fonts } from "@/constants/theme";
import { Navbar } from "@/components/global/navbar";

import { useUser } from "@clerk/clerk-expo";

import {
    DeliveryInput,
    BatchInput,
} from "@/components/pages/explore/delivery-input";
import { DeliverySummary } from "@/components/pages/explore/delivery-summary";
import { useTodaySummary } from "@/app/api/supabase/deliveries/todaySummary/useTodaySummary";

export default function LogDeliveriesScreen() {
    /* ---------------------------------------
       Hooks (ALL FIRST)
    --------------------------------------- */

    const { user, isLoaded } = useUser();
    const [isEditing, setIsEditing] = useState(false);

    const clerkAuthId = user?.id ?? "";

    const {
        data: today,
        isLoading: summaryLoading,
        error: summaryError,
    } = useTodaySummary(clerkAuthId);

    const initialBatches: BatchInput[] = useMemo(() => {
        if (!today || !today.submitted) return [];

        return today.batches.map((b) => ({
            scannerCode: b.scanner_code,
            batchDeliveryCode: b.group_code,
            deliveryCount: b.delivered_count,
        }));
    }, [today]);

    const hasSubmittedToday = today?.submitted === true;

    /* ---------------------------------------
       Guards (AFTER hooks)
    --------------------------------------- */

    if (!isLoaded || summaryLoading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!user) {
        return (
            <View className="flex-1 items-center justify-center">
                <ThemedText>You must be logged in.</ThemedText>
            </View>
        );
    }

    if (summaryError) {
        return (
            <View className="flex-1 items-center justify-center px-6">
                <ThemedText className="text-red-600 text-center">
                    Failed to load today’s delivery status
                </ThemedText>
                <ThemedText className="text-sm text-gray-500 mt-2 text-center">
                    {summaryError.message}
                </ThemedText>
            </View>
        );
    }

    /* ---------------------------------------
       Render
    --------------------------------------- */

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-950">
            <Navbar />

            <ScrollView keyboardShouldPersistTaps="handled">
                <View className="px-6 pt-8 pb-24">
                    <View className="mb-10">
                        <ThemedText
                            className="text-3xl font-bold text-center"
                            style={{ fontFamily: Fonts.rounded }}
                        >
                            Daily Deliveries
                        </ThemedText>
                    </View>

                    {hasSubmittedToday && !isEditing ? (
                        <DeliverySummary
                            clerkAuthId={user.id}
                            onEdit={() => setIsEditing(true)}
                        />
                    ) : (
                        <DeliveryInput
                            initialBatches={isEditing ? initialBatches : []}
                            onCancelEdit={() => setIsEditing(false)}
                        />
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
