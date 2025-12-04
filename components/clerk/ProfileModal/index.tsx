import React, { useState } from 'react';
import { Modal, View, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '@clerk/clerk-expo';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedView } from '@/components/themed-view';
import supabaseClient  from '@/clients/supabase';
import { ProfileContent } from '@/components/clerk/ProfileModal/profile-content';

type ProfileModalProps = {
    visible: boolean;
    onClose: () => void;
    onAvatarChange: (newAvatarUrl: string) => void;
};

export function ProfileModal({ visible, onClose, onAvatarChange }: ProfileModalProps) {
    // ❗ Hooks MUST be unconditionally called
    const { user } = useUser();
    const backgroundColor = useThemeColor({}, 'background');
    const iconColor = useThemeColor({}, 'icon');

    // Local state
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    // This is the **instant preview image**
    const [newImageUri, setNewImageUri] = useState<string | null>(null);

    const [updateCardOpen, setUpdateCardOpen] = useState(false);

    // ---------------------------
    // PICK IMAGE → LIVE PREVIEW
    // ---------------------------
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets.length > 0) {
            const uri = result.assets[0].uri;

            // 🎉 INSTANT preview inside the modal
            setNewImageUri(uri);

            // 🎉 Also update parent UI immediately
            onAvatarChange(uri);
        }
    };

    // ---------------------------
    // UPLOAD TO SUPABASE
    // ---------------------------
    const uploadImageToSupabase = async (uri: string) => {
        if (!user?.id) throw new Error("No user ID");

        const bucket = supabaseClient.storage.from("profile-images");

        // ----------------------------------------------------
        // 1️⃣ LIST ALL EXISTING USER IMAGES
        // ----------------------------------------------------
        const { data: existingFiles, error: listError } = await bucket.list("", {
            search: `profile-${user.id}`,
        });

        if (listError) {
            console.error("Error listing images:", listError);
        }

        // ----------------------------------------------------
        // 2️⃣ DELETE ALL OLD IMAGES FOR THIS USER
        // ----------------------------------------------------
        if (existingFiles && existingFiles.length > 0) {
            const pathsToDelete = existingFiles.map((file) => file.name);

            const { error: deleteError } = await bucket.remove(pathsToDelete);

            if (deleteError) {
                console.error("Failed to delete old images:", deleteError);
            }
        }

        // ----------------------------------------------------
        // 3️⃣ UPLOAD NEW IMAGE
        // ----------------------------------------------------
        const response = await fetch(uri);
        const buffer = await response.arrayBuffer();
        const fileData = new Uint8Array(buffer);

        const fileName = `profile-${user.id}-${Date.now()}.jpg`;

        const { error: uploadError } = await bucket.upload(fileName, fileData, {
            contentType: "image/jpeg",
            upsert: true,
        });

        if (uploadError) throw uploadError;

        // ----------------------------------------------------
        // 4️⃣ GET PUBLIC URL
        // ----------------------------------------------------
        const { data: urlData } = bucket.getPublicUrl(fileName);
        if (!urlData?.publicUrl) throw new Error("Failed to get public URL");

        return urlData.publicUrl;
    };


    // ---------------------------
    // SAVE PROFILE
    // ---------------------------
    const saveProfile = async () => {
        if (!user) return;

        try {
            let profileImageUrl: string | undefined;

            // Upload new image if it exists
            if (newImageUri) {
                profileImageUrl = await uploadImageToSupabase(newImageUri);
            }

            // Update in your backend
            await fetch('/api/clerk/ManageAccount/update-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    firstName: firstName || user.firstName,
                    lastName: lastName || user.lastName,
                    profileImageUrl,
                }),
            });

            // 🔥 Refresh the Clerk user so avatar updates instantly
            await user.reload();

            // 🔥 Update parent UI with the ACTUAL new avatar URL from Clerk
            onAvatarChange(user.imageUrl);

            // Reset local editing UI
            setFirstName('');
            setLastName('');
            setNewImageUri(null);
            setUpdateCardOpen(false);

        } catch (err) {
            console.error(err);
        }
    };


    return (
        <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
            <ThemedView style={{ flex: 1, backgroundColor }}>
                {/* Close button */}
                <Pressable
                    style={{ position: 'absolute', top: 50, right: 20, zIndex: 20, padding: 4 }}
                    onPress={onClose}
                >
                    <Ionicons name="close" size={28} color={iconColor} />
                </Pressable>

                <ScrollView style={{ flex: 1, paddingTop: 48, paddingHorizontal: 12 }}>
                    {user && (
                        <ProfileContent
                            user={user}
                            firstName={firstName}
                            lastName={lastName}
                            newImageUri={newImageUri}       // 👈 instant preview
                            setFirstName={setFirstName}
                            setLastName={setLastName}
                            setNewImageUri={setNewImageUri}
                            pickImage={pickImage}
                            saveProfile={saveProfile}
                            updateCardOpen={updateCardOpen}
                            setUpdateCardOpen={setUpdateCardOpen}
                            avatarUrl={
                                newImageUri || // 👈 live preview takes priority
                                (typeof user.publicMetadata?.avatar === 'string'
                                    ? user.publicMetadata.avatar
                                    : user.imageUrl)
                            }
                        />
                    )}
                </ScrollView>
            </ThemedView>
        </Modal>
    );
}
