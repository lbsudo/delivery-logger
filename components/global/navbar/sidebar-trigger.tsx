import React, { useRef } from "react";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/use-theme-color";
import Sidebar, {SidebarRef} from "@/components/global/navbar/sidebar";

export function SidebarTrigger() {
    const iconColor = useThemeColor({}, "icon");

    const sidebarRef = useRef<SidebarRef>(null);

    const openSidebar = () => {
        sidebarRef.current?.open();
    };

    return (
        <>
            <Pressable onPress={openSidebar}>
                <Ionicons name="menu" size={28} color={iconColor} />
            </Pressable>

            {/* The Sidebar instance lives here */}
            <Sidebar ref={sidebarRef} />
        </>
    );
}
