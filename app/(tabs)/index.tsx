// app/(tabs)/index.tsx

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/global/navbar";
import { useUser } from "@clerk/clerk-expo";

import useGetWeeklyDeliveries from "@/app/api/getWeeklyDeliveries/useGetWeeklyDeliveries";
import useSyncDriver from "@/app/api/supabase/sync/syncDrivers/useSyncDrivers";
import useSetDriverRole from "@/app/api/clerk/setDriverRole/useSetDriverRole";

import { ProfileForm } from "@/components/home/ProfileForm";
import { WeeklyDeliveries } from "@/components/home/WeeklyDeliveries";
import { AdminControls } from "@/components/home/admin/AdminControls";

export default function HomeScreen() {
    const { user, isLoaded } = useUser();

    // ----- LOCAL STATE -----
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [savingName, setSavingName] = useState(false);

    const [isSynced, setIsSynced] = useState<boolean | null>(null);

    // Role handling
    const [hasCheckedRole, setHasCheckedRole] = useState(false);
    const [roleState, setRoleState] = useState<string | undefined>(undefined);
    // ----- INITIAL USER LOAD -----
    useEffect(() => {
        if (!isLoaded || !user) return;

        // Initialize names
        setFirstName(user.firstName || "");
        setLastName(user.lastName || "");

        // Initialize local role state
        const existingRole = (user.publicMetadata as any)?.role;
        setRoleState(existingRole);

    }, [isLoaded, user?.id]); // only run when user identity changes

    // ----- MUTATIONS -----
    const setDriverRoleMutation = useSetDriverRole();
    const syncDriverMutation = useSyncDriver();

    // ----- ROLE ASSIGNMENT -----
    useEffect(() => {
        if (!isLoaded || !user) return;
        if (hasCheckedRole) return;

        // 🚫 If user is admin → DO NOT assign driver role
        if (roleState === "admin") {
            console.log("✔ Admin user detected — skipping role assignment");
            setHasCheckedRole(true);
            return;
        }

        // If no role → assign driver
        if (!roleState) {
            console.log("ℹ️ No role found. Setting role = driver…");

            setDriverRoleMutation.mutate(user.id, {
                onSuccess: (data) => {
                    console.log("✅ Role updated:", data.role);
                    setRoleState(data.role);
                    setHasCheckedRole(true);
                },
                onError: (err) => {
                    console.error("❌ Error setting role:", err);
                    setHasCheckedRole(true);
                }
            });

            return;
        }

        // Otherwise role exists and isn't admin
        console.log("✔ Existing role found:", roleState);
        setHasCheckedRole(true);

    }, [isLoaded, user?.id, roleState, hasCheckedRole]);


    // ----- WEEKLY DELIVERIES QUERY -----
    const {
        data: deliveries = [],
        isLoading: loadingDeliveries,
        refetch: refetchDeliveries,
    } = useGetWeeklyDeliveries(
        hasCheckedRole && roleState === "driver" ? user?.id : undefined
    );

    // ----- DRIVER SYNC -----
    useEffect(() => {
        if (!isLoaded || !user) return;
        if (!hasCheckedRole) return;

        // Only drivers sync; admins skip
        if (roleState !== "driver") return;

        // Must have names first
        if (!user.firstName || !user.lastName) return;

        // Already synced?
        if (isSynced !== null) return;

        console.log("🔄 Syncing driver info…");

        syncDriverMutation.mutate(
            {
                clerk_auth_id: user.id,
                email: user.primaryEmailAddress?.emailAddress,
                first_name: user.firstName,
                last_name: user.lastName,
            },
            {
                onSuccess: (data) => {
                    console.log("✅ Driver synced:", data.status);
                    setIsSynced(true);
                    refetchDeliveries();
                },
                onError: (err) => {
                    console.error("❌ Driver sync failed:", err);
                },
            }
        );

    }, [isLoaded, user?.id, hasCheckedRole, roleState, isSynced]);

    // ----- SAVE NAME -----
    const saveName = async () => {
        if (!firstName || !lastName) {
            alert("Please enter both names");
            return;
        }
        try {
            setSavingName(true);
            await user?.update({ firstName, lastName });

            // Force re-sync
            setIsSynced(null);
        } catch (err: any) {
            alert(err?.message || "Unable to save name.");
        } finally {
            setSavingName(false);
        }
    };

    // ----- LOADING STATE -----
    if (!isLoaded || !user || !hasCheckedRole) return null;

    // ----- ADMIN UI -----
    if (roleState === "admin") {
        return (
            <>
                <Navbar />
                <AdminControls />
            </>
        );
    }

    // ----- DRIVER UI -----
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
