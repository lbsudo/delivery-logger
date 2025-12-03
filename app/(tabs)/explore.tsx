import { View, Pressable, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { Navbar } from "@/components/global/navbar";
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';

export default function LogDeliveriesScreen() {
    const [deliveryCount, setDeliveryCount] = useState(0);
    const [scannerNumbers, setScannerNumbers] = useState<string[]>([]);
    const [currentScanner, setCurrentScanner] = useState('');
    const [todaysData, setTodaysData] = useState<{ delivery_count: number; scanner_numbers: string[] } | null>(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const { user } = useUser();

    const today = new Date().toISOString().slice(0, 10);

    // Check today's deliveries
    const checkTodaysDeliveries = async () => {
        if (!user) return;

        try {
            const res = await fetch('/api/get-todays-deliveries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    auth_user_id: user.id,
                    delivery_date: today,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setTodaysData(data);
            } else {
                console.error("Failed to get today's deliveries:", data.error);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setInitialLoading(false);
        }
    };

    useEffect(() => {
        checkTodaysDeliveries();
    }, [user]);

    const addScannerNumber = () => {
        if (currentScanner.trim()) {
            setScannerNumbers([...scannerNumbers, currentScanner.trim()]);
            setCurrentScanner('');
        }
    };

    const removeScannerNumber = (index: number) => {
        setScannerNumbers(scannerNumbers.filter((_, i) => i !== index));
    };

    const submitDeliveries = async () => {
        if (!user) return;

        if (deliveryCount === 0) {
            alert('Please enter a delivery count');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/log-deliveries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    auth_user_id: user.id,
                    delivery_count: deliveryCount,
                    scanner_numbers: scannerNumbers,
                    delivery_date: today,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to submit');

            alert('Deliveries logged!');
            setDeliveryCount(0);
            setScannerNumbers([]);
            checkTodaysDeliveries();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateDeliveries = async () => {
        if (!user) return;

        if (deliveryCount === 0) {
            alert('Please enter a delivery count');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/update-deliveries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    auth_user_id: user.id,
                    delivery_count: deliveryCount,
                    scanner_numbers: scannerNumbers,
                    delivery_date: today,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update');

            alert('Deliveries updated!');
            setIsEditing(false);
            checkTodaysDeliveries();

        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-gray-950">
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

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
                                day: 'numeric'
                            })}
                        </ThemedText>
                    </View>

                    {/* Already submitted view */}
                    {!showInput ? (
                        <View className="items-center">
                            {/* Success Card */}
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

                                {/* Scanner numbers section */}
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
                                onPress={() => {
                                    setIsEditing(true);
                                    setDeliveryCount(todaysData.delivery_count);
                                    setScannerNumbers([...todaysData.scanner_numbers]);
                                }}
                                className="bg-yellow-500 active:bg-yellow-600 px-8 py-4 rounded-2xl shadow-sm"
                            >
                                <View className="flex-row items-center gap-2">
                                    <Ionicons name="create-outline" size={20} color="#fff" />
                                    <ThemedText className="text-white text-base font-semibold">
                                        Edit Deliveries
                                    </ThemedText>
                                </View>
                            </Pressable>
                        </View>
                    ) : (
                        <>
                            {/* Delivery Counter Card */}
                            <View className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-lg dark:shadow-black/30 mb-6">
                                <ThemedText className="text-lg font-semibold mb-4 text-center">
                                    Number of Deliveries
                                </ThemedText>

                                <View className="flex-row items-center justify-center py-4">
                                    <Pressable
                                        onPress={() => setDeliveryCount(c => Math.max(0, c - 1))}
                                        className="bg-gray-100 dark:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 rounded-2xl p-4"
                                    >
                                        <Ionicons name="remove" size={32} color="#6b7280" />
                                    </Pressable>

                                    <View className="mx-8 min-w-[140px] items-center">
                                        <TextInput
                                            value={deliveryCount.toString()}
                                            onChangeText={(text) => {
                                                const num = parseInt(text) || 0;
                                                setDeliveryCount(Math.max(0, num));
                                            }}
                                            keyboardType="numeric"
                                            className="
            text-blue-600 dark:text-blue-400
            text-center
            font-bold
        "
                                            style={{
                                                fontFamily: Fonts.rounded,
                                                fontSize: 54,            // Large but safe
                                                height: 70,              // Prevent clipping
                                                paddingVertical: 6,      // Give room for full glyphs
                                            }}
                                            maxLength={4}
                                        />
                                    </View>


                                    <Pressable
                                        onPress={() => setDeliveryCount(c => c + 1)}
                                        className="bg-blue-600 active:bg-blue-700 rounded-2xl p-4"
                                    >
                                        <Ionicons name="add" size={32} color="#fff" />
                                    </Pressable>
                                </View>
                            </View>

                            {/* Scanner Numbers Card */}
                            <View className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-lg dark:shadow-black/30 mb-6">
                                <ThemedText className="text-lg font-semibold mb-4">
                                    Scanner Numbers
                                    <ThemedText className="text-sm font-normal text-gray-500 dark:text-gray-400"> (Optional)</ThemedText>
                                </ThemedText>

                                <View className="flex-row items-center gap-3 mb-4">
                                    <TextInput
                                        value={currentScanner}
                                        onChangeText={setCurrentScanner}
                                        placeholder="Enter scanner number"
                                        placeholderTextColor="#9ca3af"
                                        className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl text-base text-gray-900 dark:text-white"
                                        onSubmitEditing={addScannerNumber}
                                        returnKeyType="done"
                                    />
                                    <Pressable
                                        onPress={addScannerNumber}
                                        className="bg-blue-600 active:bg-blue-700 p-4 rounded-xl"
                                    >
                                        <Ionicons name="add" size={24} color="#fff" />
                                    </Pressable>
                                </View>

                                {/* Added Scanner Numbers */}
                                {scannerNumbers.length > 0 && (
                                    <View className="border-t border-gray-200 dark:border-gray-800 pt-4">
                                        <View className="flex-row items-center justify-between mb-3">
                                            <ThemedText className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Added ({scannerNumbers.length})
                                            </ThemedText>
                                        </View>
                                        <View className="gap-2">
                                            {scannerNumbers.map((num, idx) => (
                                                <View
                                                    key={idx}
                                                    className="flex-row items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800"
                                                >
                                                    <ThemedText className="font-mono text-base flex-1">{num}</ThemedText>
                                                    <Pressable
                                                        onPress={() => removeScannerNumber(idx)}
                                                        className="ml-3"
                                                    >
                                                        <Ionicons name="close-circle" size={24} color="#ef4444" />
                                                    </Pressable>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                )}
                            </View>

                            {/* Action Buttons */}
                            <View className="gap-3">
                                <Pressable
                                    onPress={isEditing ? updateDeliveries : submitDeliveries}
                                    disabled={loading || deliveryCount === 0}
                                    className={`py-5 rounded-2xl items-center shadow-sm ${
                                        deliveryCount === 0
                                            ? 'bg-gray-300 dark:bg-gray-700'
                                            : 'bg-blue-600 active:bg-blue-700'
                                    }`}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <View className="flex-row items-center gap-2">
                                            <Ionicons
                                                name={isEditing ? "checkmark" : "send"}
                                                size={20}
                                                color="#fff"
                                            />
                                            <ThemedText className="text-white text-lg font-semibold">
                                                {isEditing ? "Save Changes" : "Submit Deliveries"}
                                            </ThemedText>
                                        </View>
                                    )}
                                </Pressable>

                                {isEditing && (
                                    <Pressable
                                        onPress={() => {
                                            setIsEditing(false);
                                            setDeliveryCount(0);
                                            setScannerNumbers([]);
                                        }}
                                        className="py-4 rounded-2xl items-center border-2 border-gray-300 dark:border-gray-700"
                                    >
                                        <ThemedText className="text-gray-600 dark:text-gray-400 text-base font-medium">
                                            Cancel
                                        </ThemedText>
                                    </Pressable>
                                )}
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}