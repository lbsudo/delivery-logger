import { StyleSheet, View, TextInput, Pressable, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/global/navbar";
import { useUser } from "@clerk/clerk-expo";
import { ThemedText } from "@/components/themed-text";
import {useGetWeeklyDeliveries} from "@/app/api/getWeeklyDeliveries/useGetWeeklyDeliveries";

export default function HomeScreen() {
    const { user, isLoaded } = useUser();

    // Form state for missing names
    const [firstName, setFirstName] = useState(user?.firstName || "");
    const [lastName, setLastName] = useState(user?.lastName || "");
    const [savingName, setSavingName] = useState(false);

    // Sync status (null = not checked)
    const [isSynced, setIsSynced] = useState<boolean | null>(null);

    const missingName = !user?.firstName || !user?.lastName;

    // ⭐ WEEKLY DELIVERIES QUERY (TanStack)
    const {
        data: deliveries = [],
        isLoading: loadingDeliveries,
        refetch: refetchDeliveries,
    } = useGetWeeklyDeliveries(user?.id);

    // =====================================================
    // SAVE FIRST & LAST NAME TO CLERK
    // =====================================================
    const saveName = async () => {
        if (!firstName || !lastName) {
            alert("Please enter both first and last name.");
            return;
        }

        try {
            setSavingName(true);
            await user?.update({
                firstName,
                lastName,
            });

            // Allow sync to run again
            setIsSynced(null);
        } catch (err: any) {
            alert(err?.message || "Unable to save name.");
        } finally {
            setSavingName(false);
        }
    };

    // =====================================================
    // AUTO-SYNC DRIVER
    // =====================================================
    useEffect(() => {
        if (!isLoaded || !user) return;

        const hasName = !!user.firstName && !!user.lastName;
        if (!hasName) return;

        if (isSynced !== null) return;

        const syncDriver = async () => {
            try {
                const res = await fetch("/api/sync-drivers", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        auth_user_id: user.id,
                        email: user.primaryEmailAddress?.emailAddress,
                        first_name: user.firstName,
                        last_name: user.lastName,
                    }),
                });

                const data = await res.json();

                if (!res.ok) {
                    console.error("Sync error:", data.error);
                    return;
                }

                // Mark as synced
                setIsSynced(true);

                // Now refetch deliveries
                refetchDeliveries();
            } catch (err) {
                console.error("Driver sync failed:", err);
            }
        };

        syncDriver();
    }, [isLoaded, user, isSynced]);

    // =====================================================
    // RENDER UI
    // =====================================================
    if (!isLoaded) return null;

    return (
        <>
            <Navbar />

            {/* USER IS MISSING FIRST OR LAST NAME */}
            {missingName ? (
                <View style={{ padding: 24, marginTop: 40 }}>
                    <ThemedText className="text-2xl font-bold mb-4">
                        Complete Your Profile
                    </ThemedText>

                    <ThemedText>First Name</ThemedText>
                    <TextInput
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder="John"
                        placeholderTextColor="#666"
                        style={styles.input}
                    />

                    <ThemedText className="mt-4">Last Name</ThemedText>
                    <TextInput
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder="Doe"
                        placeholderTextColor="#666"
                        style={styles.input}
                    />

                    <Pressable
                        onPress={saveName}
                        disabled={savingName}
                        style={styles.saveButton}
                    >
                        <Text style={styles.saveButtonText}>
                            {savingName ? "Saving..." : "Save"}
                        </Text>
                    </Pressable>
                </View>
            ) : (
                // NORMAL HOME UI
                <View style={{ padding: 24, marginTop: 40 }}>
                    <ThemedText className="text-xl font-semibold mb-3">
                        Welcome back, {user.firstName}!
                    </ThemedText>

                    {isSynced === null && (
                        <ThemedText className="text-yellow-400 mt-2">
                            Checking sync status…
                        </ThemedText>
                    )}

                    {isSynced === true && (
                        <ThemedText className="text-green-400 mt-1 mb-3">
                            Driver profile synced ✔
                        </ThemedText>
                    )}

                    {/* WEEKLY DELIVERIES */}
                    <View style={{ marginTop: 12 }}>
                        <ThemedText className="text-lg font-bold mb-2">
                            Deliveries This Week
                        </ThemedText>

                        {loadingDeliveries ? (
                            <ThemedText>Loading...</ThemedText>
                        ) : deliveries.length === 0 ? (
                            <ThemedText>No deliveries recorded yet this week.</ThemedText>
                        ) : (
                            deliveries.map((d:any) => (
                                <View key={d.id} style={styles.deliveryCard}>
                                    <ThemedText>Date: {d.delivery_date}</ThemedText>
                                    <ThemedText>Deliveries: {d.delivery_count}</ThemedText>
                                    <ThemedText>
                                        Scanners: {d.scanner_numbers.join(", ") || "None"}
                                    </ThemedText>
                                </View>
                            ))
                        )}
                    </View>
                </View>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderColor: "#444",
        padding: 12,
        borderRadius: 10,
        color: "white",
        marginTop: 6,
    },
    saveButton: {
        backgroundColor: "#4ade80",
        padding: 14,
        borderRadius: 12,
        marginTop: 24,
    },
    saveButtonText: {
        textAlign: "center",
        fontWeight: "600",
        color: "black",
    },
    deliveryCard: {
        borderWidth: 1,
        borderColor: "#333",
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
    },
});
