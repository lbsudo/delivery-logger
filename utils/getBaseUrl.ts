import { Platform } from "react-native";
import Constants from "expo-constants";

export function getBaseUrl() {
    // Web = same origin
    if (Platform.OS === "web") {
        return "";
    }

    /**
     * Expo dev:
     * hostUri looks like:
     *   192.168.1.28:19000
     *   or exp://192.168.1.28:19000
     */
    const hostUri = Constants.expoConfig?.hostUri;

    if (!hostUri) {
        throw new Error("Unable to determine Expo host URL");
    }

    // Force http (mobile browsers cannot use exp://)
    return `http://${hostUri.split(":").slice(0, 2).join(":")}`;
}
