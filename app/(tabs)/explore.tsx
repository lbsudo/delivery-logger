import { View, ActivityIndicator, ScrollView } from 'react-native';
import React, { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import { Navbar } from "@/components/global/navbar";
import { useUser } from '@clerk/clerk-expo';
import Toast from "react-native-toast-message";

import useGetTodaysDeliveries  from "@/app/api/getTodaysDeliveries/useGetTodaysDeliveries";
import useLogDeliveries from "@/app/api/logDeliveries/useLogDeliveries";
import useUpdateDeliveries from "@/app/api/updateDeliveries/useUpdateDeliveries";
import {DeliveryInput} from "@/components/pages/explore/delivery-input";
import {DeliverySummary} from "@/components/pages/explore/delivery-summary";


export default function LogDeliveriesScreen() {
    const [deliveryCount, setDeliveryCount] = useState(0);
    const [scannerNumbers, setScannerNumbers] = useState<string[]>([]);
    const [currentScanner, setCurrentScanner] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const { user } = useUser();
    const today = new Date().toISOString().slice(0, 10);

    // Mutations
    const { mutateAsync: logDeliveries, isPending: logPending } = useLogDeliveries();
    const { mutateAsync: updateDeliveriesMutation, isPending: updatePending } = useUpdateDeliveries();

    // Today's data fetch
    const {
        data: todaysData,
        isLoading: todaysLoading,
        refetch: refetchTodaysDeliveries,
    } = useGetTodaysDeliveries(user?.id, today);

    // Loading state
    if (todaysLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-gray-950">
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    // Add scanner number
    const addScannerNumber = () => {
        if (currentScanner.trim()) {
            setScannerNumbers([...scannerNumbers, currentScanner.trim()]);
            setCurrentScanner('');
        }
    };

    // Remove scanner number
    const removeScannerNumber = (index: number) => {
        setScannerNumbers(scannerNumbers.filter((_, i) => i !== index));
    };

    // Submit new deliveries
    const submitDeliveries = async () => {
        if (!user) return;

        if (deliveryCount === 0) {
            Toast.show({
                type: "error",
                text1: "Please enter a delivery count",
                position: "bottom",
            });
            return;
        }

        try {
            await logDeliveries({
                auth_user_id: user.id,
                delivery_count: deliveryCount,
                scanner_numbers: scannerNumbers,
                delivery_date: today,
            });

            Toast.show({
                type: "success",
                text1: "Deliveries logged!",
                position: "bottom",
            });

            setDeliveryCount(0);
            setScannerNumbers([]);
            setIsEditing(false);
            refetchTodaysDeliveries();

        } catch (err: any) {
            Toast.show({
                type: "error",
                text1: err.message,
                position: "bottom",
            });
        }
    };

    // Update existing deliveries
    const updateDeliveries = async () => {
        if (!user) return;

        if (deliveryCount === 0) {
            Toast.show({
                type: "error",
                text1: "Please enter a delivery count",
                position: "bottom",
            });
            return;
        }

        try {
            await updateDeliveriesMutation({
                auth_user_id: user.id,
                delivery_count: deliveryCount,
                scanner_numbers: scannerNumbers,
                delivery_date: today,
            });

            Toast.show({
                type: "success",
                text1: "Deliveries updated!",
                position: "bottom",
            });

            setIsEditing(false);
            refetchTodaysDeliveries();

        } catch (err: any) {
            Toast.show({
                type: "error",
                text1: err.message || "Something went wrong",
                position: "bottom",
            });
        }
    };

    // Decide which component to show
    const showInput = !todaysData || todaysData.delivery_count === 0 || isEditing;

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-950">
            <Navbar />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="px-6 pt-8 pb-24">

                    {/* Header */}
                    <View className="mb-10">
                        <ThemedText
                            className="text-3xl font-bold text-center mb-2"
                            style={{ fontFamily: Fonts.rounded }}
                        >
                            Daily Deliveries
                        </ThemedText>

                        <ThemedText className="text-center text-gray-500 dark:text-gray-400">
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </ThemedText>
                    </View>

                    {/* Content */}
                    {!showInput ? (
                        <DeliverySummary
                            todaysData={todaysData}
                            onEdit={() => {
                                setIsEditing(true);
                                setDeliveryCount(todaysData.delivery_count);
                                setScannerNumbers([...todaysData.scanner_numbers]);
                            }}
                        />
                    ) : (
                        <DeliveryInput
                            deliveryCount={deliveryCount}
                            setDeliveryCount={setDeliveryCount}
                            scannerNumbers={scannerNumbers}
                            setScannerNumbers={setScannerNumbers}
                            currentScanner={currentScanner}
                            setCurrentScanner={setCurrentScanner}
                            addScannerNumber={addScannerNumber}
                            removeScannerNumber={removeScannerNumber}
                            isEditing={isEditing}
                            setIsEditing={setIsEditing}
                            onSubmit={submitDeliveries}
                            onUpdate={updateDeliveries}
                            logPending={logPending}
                            updatePending={updatePending}
                        />
                    )}

                </View>
            </ScrollView>
        </View>
    );
}
