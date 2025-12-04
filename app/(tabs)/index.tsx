// app/(tabs)/index.tsx

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/global/navbar";
import { useUser } from "@clerk/clerk-expo";

import { useGetWeeklyDeliveries } from "@/app/api/getWeeklyDeliveries/useGetWeeklyDeliveries";
import { useSyncDriver } from "@/app/api/syncDrivers/useSyncDrivers";
import { useSetDriverRole } from "@/app/api/setDriverRole/useSetDriverRole";

import { ProfileForm } from "@/components/home/ProfileForm";
import { WeeklyDeliveries } from "@/components/home/WeeklyDeliveries";
import { AdminControls } from "@/components/home/admin/AdminControls";

export default function HomeScreen() {
    const { user, isLoaded } = useUser();

    // Local name state for ProfileForm
    const [firstName, setFirstName] = useState(user?.firstName || "");
    const [lastName, setLastName] = useState(user?.lastName || "");
    const [savingName, setSavingName] = useState(false);

    // Driver sync state
    const [isSynced, setIsSynced] = useState<boolean | null>(null);

    // Role initialization tracking
    const [roleChecked, setRoleChecked] = useState(false);

    // Extract role from Clerk public metadata
    const role = (user?.publicMetadata as any)?.role as string | undefined;

    // === Weekly Deliveries Query (only for drivers) ===
    const {
        data: deliveries = [],
        isLoading: loadingDeliveries,
        refetch: refetchDeliveries,
    } = useGetWeeklyDeliveries(
        role === "driver" && user ? user.id : undefined
    );

    // === Mutations ===
    const syncDriverMutation = useSyncDriver();
    const setDriverRoleMutation = useSetDriverRole();

    // Keep local name state synchronized
    useEffect(() => {
        if (!user) return;
        setFirstName(user.firstName || "");
        setLastName(user.lastName || "");
    }, [user]);

    // 1️⃣ Automatically assign role=driver if missing
    useEffect(() => {
        if (!isLoaded || !user || roleChecked) return;

        if (!role) {
            console.log("ℹ️ No role found — calling API to set role = driver");

            setDriverRoleMutation.mutate(user.id, {
                onSuccess: (data: any) => {
                    console.log("✅ Role set successfully:", data.role);
                    setRoleChecked(true);
                },
                onError: (err: any) => {
                    console.error("❌ Failed to set role:", err.message);
                    setRoleChecked(true);
                }
            });

        } else {
            // role already exists
            setRoleChecked(true);
        }
    }, [isLoaded, user, role, roleChecked]);

    // 2️⃣ Auto-sync driver after role is confirmed
    useEffect(() => {
        if (!isLoaded || !user) return;
        if (!roleChecked) return;          // Wait until role assignment resolved
        if (role !== "driver") return;     // Admins skip entire driver flow
        if (!user.firstName || !user.lastName) return; // Must have names
        if (isSynced !== null) return;     // Avoid repeated sync attempts

        console.log("🔄 Running driver sync mutation…");

        syncDriverMutation.mutate(
            {
                auth_user_id: user.id,
                email: user.primaryEmailAddress?.emailAddress,
                first_name: user.firstName,
                last_name: user.lastName,
            },
            {
                onSuccess: (data: any) => {
                    console.log("✅ Driver sync success:", data.status);
                    setIsSynced(true);
                    refetchDeliveries();
                },
                onError: (err: any) => {
                    console.error("❌ Driver sync failed:", err.message);
                },
            }
        );
    }, [
        isLoaded,
        user,
        role,
        roleChecked,
        isSynced,
        syncDriverMutation,
        refetchDeliveries,
    ]);

    // 3️⃣ Save name to Clerk (driver only)
    const saveName = async () => {
        if (!firstName || !lastName) {
            alert("Please enter both first and last name.");
            return;
        }

        try {
            setSavingName(true);
            await user?.update({ firstName, lastName });
            setIsSynced(null); // re-sync needed
        } catch (err: any) {
            alert(err?.message || "Unable to save name.");
        } finally {
            setSavingName(false);
        }
    };

    // 4️⃣ Wait until the user + role assignment is ready
    if (!isLoaded || !user || !roleChecked) return null;

    // 5️⃣ ADMIN UI
    if (role === "admin") {
        return (
            <>
                <Navbar />
                <AdminControls />
            </>
        );
    }

    // 6️⃣ DRIVER UI
    const missingName = !user.firstName || !user.lastName;

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
