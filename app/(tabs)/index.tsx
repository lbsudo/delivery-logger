// app/(tabs)/index.tsx

import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Navbar } from "@/components/global/navbar";
import { useUser } from "@clerk/clerk-expo";
import { useGetWeeklyDeliveries } from "@/app/api/getWeeklyDeliveries/useGetWeeklyDeliveries";
import { ProfileForm } from "@/components/home/ProfileForm";
import { WeeklyDeliveries } from "@/components/home/WeeklyDeliveries";
import {useSyncDriver} from "@/app/api/syncDrivers/useSyncDrivers";

export default function HomeScreen() {
    const { user, isLoaded } = useUser();

    const [firstName, setFirstName] = useState(user?.firstName || "");
    const [lastName, setLastName] = useState(user?.lastName || "");
    const [savingName, setSavingName] = useState(false);
    const [isSynced, setIsSynced] = useState<boolean | null>(null);

    const missingName = !user?.firstName || !user?.lastName;

    // WEEKLY DELIVERIES QUERY
    const {
        data: deliveries = [],
        isLoading: loadingDeliveries,
        refetch: refetchDeliveries,
    } = useGetWeeklyDeliveries(user?.id);

    // SYNC DRIVER MUTATION
    const syncDriverMutation = useSyncDriver();

    // SAVE NAME TO CLERK
    const saveName = async () => {
        if (!firstName || !lastName) {
            alert("Please enter both first and last name.");
            return;
        }

        try {
            setSavingName(true);
            await user?.update({ firstName, lastName });
            setIsSynced(null);
        } catch (err: any) {
            alert(err?.message || "Unable to save name.");
        } finally {
            setSavingName(false);
        }
    };

    // AUTO-SYNC DRIVER WHEN USER IS READY
    useEffect(() => {
        if (!isLoaded || !user) return;
        if (!user.firstName || !user.lastName) return;
        if (isSynced !== null) return;

        console.log("🔄 Running driver sync mutation…");

        syncDriverMutation.mutate(
            {
                auth_user_id: user.id,
                email: user.primaryEmailAddress?.emailAddress,
                first_name: user.firstName,
                last_name: user.lastName,
            },
            {
                onSuccess: (data:any) => {
                    console.log("✅ Driver sync success:", data.status);
                    setIsSynced(true);
                    refetchDeliveries();
                },
                onError: (err: any) => {
                    console.error("❌ Driver sync failed:", err.message);
                },
            }
        );
    }, [isLoaded, user, isSynced]);

    if (!isLoaded) return null;

    return (
        <>
            <Navbar />

            {missingName ? (
                <ProfileForm
                    firstName={firstName}
                    lastName={lastName}
                    setFirstName={setFirstName}
                    setLastName={setLastName}
                    savingName={savingName}
                    saveName={saveName}
                />
            ) : (
                <WeeklyDeliveries
                    firstName={user.firstName!}
                    deliveries={deliveries}
                    loading={loadingDeliveries}
                />
            )}
        </>
    );
}
