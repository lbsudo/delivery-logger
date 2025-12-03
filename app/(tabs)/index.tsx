import { StyleSheet, View, Pressable, Modal, Platform, Linking } from "react-native";
import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/global/navbar";
import { useUser } from "@clerk/clerk-expo";
import { ThemedText } from "@/components/themed-text";

import DateTimePicker from "@react-native-community/datetimepicker";
import { startOfWeek } from "date-fns";
import Constants from "expo-constants";
import Toast from "react-native-toast-message";

// Snap a date to Monday
function snapToMonday(date: Date): Date {
    return startOfWeek(date, { weekStartsOn: 1 });
}

// Get the *latest completed* week (last week's Monday)
function getLatestCompletedWeek(): Date {
    const today = new Date();
    const thisMonday = startOfWeek(today, { weekStartsOn: 1 });
    const lastMonday = new Date(thisMonday);
    lastMonday.setDate(lastMonday.getDate() - 7);
    return lastMonday;
}

// Build the correct API URL for Expo environment
function getApiUrl(path: string) {
    const host = Constants.expoConfig?.hostUri;
    if (!host) return path;
    return `http://${host.split(":")[0]}:8081${path}`;
}

export default function HomeScreen() {
    const { user, isLoaded } = useUser();
    const userRole = user?.publicMetadata?.role;

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedWeek, setSelectedWeek] = useState<Date | null>(null);
    const [showPicker, setShowPicker] = useState(false);

    // Sync driver on mount
    useEffect(() => {
        if (!isLoaded || !user) return;

        const syncDriver = async () => {
            try {
                const res = await fetch("/api/sync-drivers", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        auth_user_id: user.id,
                        email: user.primaryEmailAddress?.emailAddress,
                        first_name: user.firstName ?? "",
                        last_name: user.lastName ?? "",
                    }),
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
            } catch (err) {
                console.error("Driver sync failed:", err);
            }
        };

        syncDriver();
    }, [isLoaded, user]);

    // ===============================
    // EXPORT LATEST COMPLETED WEEK
    // ===============================
    const exportLatestCompletedWeek = async () => {
        const monday = getLatestCompletedWeek();
        const weekStartString = monday.toISOString().slice(0, 10);

        const url = getApiUrl(
            `/api/export-weekly-spreadsheet?week_start=${weekStartString}`
        );

        try {
            if (Platform.OS === "web") {
                const link = document.createElement("a");
                link.href = url;
                link.download = `weekly-deliveries-${weekStartString}.xlsx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                const can = await Linking.canOpenURL(url);
                if (!can) throw new Error("Unable to open browser.");
                await Linking.openURL(url);
            }

            Toast.show({
                type: "success",
                text1: "Spreadsheet Exported!",
                text2: "Latest completed week's report is downloading.",
            });
        } catch (err: any) {
            Toast.show({
                type: "error",
                text1: "Export Failed",
                text2: err.message,
            });
        }
    };

    // ===============================
    // EXPORT CUSTOM WEEK
    // ===============================
    const exportSelectedWeek = async () => {
        if (!selectedWeek) {
            alert("Please pick a week start date.");
            return;
        }

        const weekStartString = selectedWeek.toISOString().slice(0, 10);
        const url = getApiUrl(
            `/api/export-weekly-spreadsheet?week_start=${weekStartString}`
        );

        try {
            if (Platform.OS === "web") {
                const link = document.createElement("a");
                link.href = url;
                link.download = `weekly-deliveries-${weekStartString}.xlsx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                const can = await Linking.canOpenURL(url);
                if (!can) throw new Error("Unable to open browser.");
                await Linking.openURL(url);
            }

            Toast.show({
                type: "success",
                text1: "Spreadsheet Exported!",
                text2: "Your download has started.",
            });

            setModalVisible(false);
            setShowPicker(false);
        } catch (err: any) {
            Toast.show({
                type: "error",
                text1: "Export Failed",
                text2: err.message,
            });
        }
    };

    const handleDateChange = (event: any, date?: Date) => {
        if (!date) {
            if (Platform.OS === "android") setShowPicker(false);
            return;
        }
        const monday = snapToMonday(date);
        setSelectedWeek(monday);

        if (Platform.OS === "android") setShowPicker(false);
    };

    return (
        <>
            <Navbar />

            <View className="px-6 mt-10">
                {userRole === "admin" && (
                    <View className="gap-4">

                        {/* 1️⃣ Export Latest Completed Week */}
                        <Pressable
                            onPress={exportLatestCompletedWeek}
                            className="bg-blue-600 py-4 rounded-2xl items-center"
                        >
                            <ThemedText className="text-white text-xl font-semibold">
                                Export Latest Completed Week
                            </ThemedText>
                        </Pressable>

                        {/* 2️⃣ Export Custom Week */}
                        <Pressable
                            onPress={() => setModalVisible(true)}
                            className="bg-purple-600 py-4 rounded-2xl items-center"
                        >
                            <ThemedText className="text-white text-xl font-semibold">
                                Export a Different Week
                            </ThemedText>
                        </Pressable>

                    </View>
                )}
            </View>

            {/* Modal for selecting custom week */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View className="flex-1 justify-center items-center bg-black/50">
                    <View className="bg-white dark:bg-neutral-800 rounded-2xl p-6 w-80">
                        <ThemedText className="text-xl font-bold mb-4">
                            Choose Week Start (Monday Only)
                        </ThemedText>

                        <Pressable
                            onPress={() => setShowPicker(true)}
                            className="bg-neutral-200 dark:bg-neutral-700 rounded-xl p-4 items-center"
                        >
                            <ThemedText className="text-lg">
                                {selectedWeek
                                    ? selectedWeek.toISOString().slice(0, 10)
                                    : "Tap to Select Date"}
                            </ThemedText>
                        </Pressable>

                        {showPicker && (
                            <DateTimePicker
                                mode="date"
                                display={Platform.OS === "ios" ? "spinner" : "default"}
                                value={selectedWeek || new Date()}
                                onChange={handleDateChange}
                            />
                        )}

                        <View className="flex-row justify-between mt-6">
                            <Pressable
                                onPress={() => {
                                    setModalVisible(false);
                                    setShowPicker(false);
                                }}
                                className="px-4 py-2 bg-gray-400 rounded-xl"
                            >
                                <ThemedText className="text-white text-lg">Cancel</ThemedText>
                            </Pressable>

                            <Pressable
                                onPress={exportSelectedWeek}
                                className="px-4 py-2 bg-blue-600 rounded-xl"
                            >
                                <ThemedText className="text-white text-lg">Export</ThemedText>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({});
