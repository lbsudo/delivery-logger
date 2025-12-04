import React from "react";
import { View, Pressable, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { Fonts } from "@/constants/theme";

interface Props {
    deliveryCount: number;
    setDeliveryCount: (n: number | ((prev: number) => number)) => void;

    scannerNumbers: string[];
    setScannerNumbers: (n: string[]) => void;

    currentScanner: string;
    setCurrentScanner: (s: string) => void;

    addScannerNumber: () => void;
    removeScannerNumber: (idx: number) => void;

    isEditing: boolean;
    setIsEditing: (v: boolean) => void;

    onSubmit: () => Promise<void>;
    onUpdate: () => Promise<void>;

    logPending: boolean;
    updatePending: boolean;
}

export function DeliveryInput({
                                      deliveryCount,
                                      setDeliveryCount,
                                      scannerNumbers,
                                      setScannerNumbers,
                                      currentScanner,
                                      setCurrentScanner,
                                      addScannerNumber,
                                      removeScannerNumber,
                                      isEditing,
                                      setIsEditing,
                                      onSubmit,
                                      onUpdate,
                                      logPending,
                                      updatePending
                                  }: Props) {
    return (
        <>
            {/* Delivery Counter Card */}
            <View className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-lg dark:shadow-black/30 mb-6">
                <ThemedText className="text-lg font-semibold mb-4 text-center">
                    Number of Deliveries
                </ThemedText>

                <View className="flex-row items-center justify-center py-4">
                    <Pressable
                        onPress={() => setDeliveryCount((c) => Math.max(0, c - 1))}
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
                            className="text-blue-600 dark:text-blue-400 text-center font-bold"
                            style={{
                                fontFamily: Fonts.rounded,
                                fontSize: 54,
                                height: 70,
                                paddingVertical: 6,
                            }}
                            maxLength={4}
                        />
                    </View>

                    <Pressable
                        onPress={() => setDeliveryCount((c) => c + 1)}
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
                    <ThemedText className="text-sm font-normal text-gray-500 dark:text-gray-400">
                        {" "} (Optional)
                    </ThemedText>
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

                {scannerNumbers.length > 0 && (
                    <View className="border-t border-gray-200 dark:border-gray-800 pt-4">
                        <ThemedText className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                            Added ({scannerNumbers.length})
                        </ThemedText>

                        <View className="gap-2">
                            {scannerNumbers.map((num, idx) => (
                                <View
                                    key={idx}
                                    className="flex-row items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800"
                                >
                                    <ThemedText className="font-mono text-base flex-1">{num}</ThemedText>
                                    <Pressable onPress={() => removeScannerNumber(idx)}>
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
                    onPress={isEditing ? onUpdate : onSubmit}
                    disabled={deliveryCount === 0 || logPending || updatePending}
                    className={`py-5 rounded-2xl items-center shadow-sm ${
                        deliveryCount === 0
                            ? 'bg-gray-300 dark:bg-gray-700'
                            : 'bg-blue-600 active:bg-blue-700'
                    }`}
                >
                    <View className="flex-row items-center gap-2">
                        <Ionicons
                            name={isEditing ? "checkmark" : "send"}
                            size={20}
                            color="#fff"
                        />
                        <ThemedText className="text-white text-lg font-semibold">
                            {isEditing
                                ? updatePending ? "Saving..." : "Save Changes"
                                : logPending ? "Submitting..." : "Submit Deliveries"}
                        </ThemedText>
                    </View>
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
    );
}
