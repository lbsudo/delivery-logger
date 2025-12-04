// components/home/ProfileForm.tsx

import React from "react";
import { View, TextInput, Pressable, Text } from "react-native";
import { ThemedText } from "@/components/themed-text";

interface Props {
    firstName: string;
    lastName: string;
    setFirstName: (v: string) => void;
    setLastName: (v: string) => void;
    savingName: boolean;
    saveName: () => void;
}

export function ProfileForm({
                                firstName,
                                lastName,
                                setFirstName,
                                setLastName,
                                savingName,
                                saveName,
                            }: Props) {
    return (
        <View className="px-6 mt-10">
            <ThemedText className="text-2xl font-bold mb-4">
                Complete Your Profile
            </ThemedText>

            <ThemedText>First Name</ThemedText>
            <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="John"
                placeholderTextColor="#666"
                className="border border-neutral-700 rounded-xl px-3 py-2 text-white mt-1"
            />

            <ThemedText className="mt-4">Last Name</ThemedText>
            <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Doe"
                placeholderTextColor="#666"
                className="border border-neutral-700 rounded-xl px-3 py-2 text-white mt-1"
            />

            <Pressable
                onPress={saveName}
                disabled={savingName}
                className="bg-green-400 py-4 rounded-xl mt-6"
            >
                <Text className="text-center font-semibold text-black">
                    {savingName ? "Saving…" : "Save"}
                </Text>
            </Pressable>
        </View>
    );
}
