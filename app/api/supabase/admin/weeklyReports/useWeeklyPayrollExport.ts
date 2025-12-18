import { useMutation } from "@tanstack/react-query";
import { Platform, Alert } from "react-native";
import * as Linking from "expo-linking";
import { getBaseUrl } from "@/utils/getBaseUrl";

type ExportArgs = {
    weekStart: string; // YYYY-MM-DD (Monday)
};

export function useWeeklyPayrollExport() {
    return useMutation({
        mutationFn: async ({ weekStart }: ExportArgs) => {
            if (!weekStart) {
                throw new Error("weekStart is required");
            }

            const baseUrl = getBaseUrl();
            const url =
                `${baseUrl}/api/supabase/admin/weeklyReports/weekly-reports` +
                `?weekStart=${weekStart}`;

            // Web → let browser download
            if (Platform.OS === "web") {
                window.open(url, "_blank");
                return;
            }

            // Mobile → open in device browser
            const supported = await Linking.canOpenURL(url);
            if (!supported) {
                throw new Error("Cannot open download URL");
            }

            await Linking.openURL(url);
        },

        onError: (err: any) => {
            console.error("Weekly payroll export failed:", err);
            Alert.alert(
                "Download failed",
                err?.message ?? "Unable to download weekly payroll report"
            );
        },
    });
}
