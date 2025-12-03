import React from 'react';
import { View, Image, TextInput, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUser } from '@clerk/clerk-expo';

type UserType = NonNullable<ReturnType<typeof useUser>['user']>;
type ProfileContentProps = {
    user: UserType;
    firstName: string;
    lastName: string;
    newImageUri: string | null;
    setFirstName: (name: string) => void;
    setLastName: (name: string) => void;
    setNewImageUri: (uri: string | null) => void;
    pickImage: () => Promise<void>;
    saveProfile: () => Promise<void>;
    updateCardOpen: boolean;
    setUpdateCardOpen: (open: boolean) => void;
    avatarUrl: string; // ✅ new prop
};

export function ProfileContent({
                                   user,
                                   firstName,
                                   lastName,
                                   newImageUri,
                                   setFirstName,
                                   setLastName,
                                   setNewImageUri,
                                   pickImage,
                                   saveProfile,
                                   updateCardOpen,
                                   setUpdateCardOpen,
                                   avatarUrl,
                               }: ProfileContentProps) {
    const backgroundColor = useThemeColor({}, 'background');
    const sidebarBorderColor = useThemeColor({}, 'icon') + '30';

    const displayAvatar = newImageUri ?? avatarUrl;

    return (
        <>
            {/* Profile Details */}
            <View style={{ marginBottom: 0 }}>
                <ThemedText type="subtitle" style={{ marginBottom: 4 }}>
                    Profile Details
                </ThemedText>
            </View>

            <View style={{ height: 1, backgroundColor: sidebarBorderColor, marginVertical: 12 }} />

            {/* Profile Row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image
                        source={{ uri: displayAvatar }}
                        style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12 }}
                    />
                    <ThemedText style={{ fontSize: 16, color: "#FFFFFF" }}>
                        {firstName || user.firstName} {lastName || user.lastName}
                    </ThemedText>
                </View>

                <Pressable onPress={() => setUpdateCardOpen(!updateCardOpen)}>
                    <ThemedText style={{ color: '#007BFF', fontWeight: '600' }}>Update Profile</ThemedText>
                </Pressable>
            </View>

            {/* Update Card */}
            {updateCardOpen && (
                <View style={{ backgroundColor: backgroundColor + '22', padding: 16, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: sidebarBorderColor }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 }}>
                        <Image
                            source={{ uri: displayAvatar }}
                            style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12 }}
                        />

                        <Pressable
                            onPress={pickImage}
                            style={{
                                flex: 1,
                                paddingVertical: 4,
                                paddingHorizontal: 8,
                                borderWidth: 1,
                                borderColor: '#687478',
                                borderRadius: 6,
                                alignItems: 'center',
                            }}
                        >
                            <ThemedText style={{ color: '#687478', fontSize: 16 }}>Upload</ThemedText>
                        </Pressable>

                        <Pressable
                            onPress={() => setNewImageUri(null)}
                            style={{
                                flex: 1,
                                paddingVertical: 4,
                                paddingHorizontal: 8,
                                borderRadius: 6,
                                alignItems: 'center',
                            }}
                        >
                            <ThemedText style={{ color: '#FF4D4D', fontSize: 16 }}>Remove</ThemedText>
                        </Pressable>
                    </View>

                    <TextInput
                        placeholder={user.firstName || 'First Name'}
                        placeholderTextColor="#aaa"
                        value={firstName}
                        onChangeText={setFirstName}
                        style={{
                            backgroundColor: backgroundColor + '33',
                            color: '#fff',
                            padding: 8,
                            borderRadius: 6,
                            marginBottom: 8,
                            borderWidth: 1,
                            borderColor: sidebarBorderColor,
                        }}
                    />

                    <TextInput
                        placeholder={user.lastName || 'Last Name'}
                        placeholderTextColor="#aaa"
                        value={lastName}
                        onChangeText={setLastName}
                        style={{
                            backgroundColor: backgroundColor + '33',
                            color: '#fff',
                            padding: 8,
                            borderRadius: 6,
                            marginBottom: 12,
                            borderWidth: 1,
                            borderColor: sidebarBorderColor,
                        }}
                    />

                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                        <Pressable onPress={() => setUpdateCardOpen(false)} style={{ marginRight: 12 }}>
                            <ThemedText style={{ color: '#fff' }}>Cancel</ThemedText>
                        </Pressable>

                        <Pressable onPress={saveProfile}>
                            <ThemedText style={{ color: '#007BFF', fontWeight: '600' }}>Save</ThemedText>
                        </Pressable>
                    </View>
                </View>
            )}

            <View style={{ marginBottom: 16 }}>
                <ThemedText type="subtitle" style={{ marginBottom: 4 }}>Email Addresses</ThemedText>
                <ThemedText>{user.emailAddresses[0]?.emailAddress}</ThemedText>
            </View>

            <View style={{ marginBottom: 16 }}>
                <ThemedText type="subtitle" style={{ marginBottom: 4 }}>User ID</ThemedText>
                <ThemedText>{user.id}</ThemedText>
            </View>
        </>
    );
}
