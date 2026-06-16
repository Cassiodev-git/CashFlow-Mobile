import React, { useState, useEffect } from 'react';
import { Alert, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@shopify/restyle';
import { MotiView } from 'moti';
import { Box, Text, scale, verticalScale, Theme } from '@/theme/unistyles';
import { useProfile } from '@/hooks/useProfile';
import { ConfirmationModal } from '@/components/ConfirmationModal/ConfirmationModal';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/Skeleton/Skeleton';

export default function ProfileScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const theme = useTheme<Theme>();
    const { user, updateProfile, deleteAccount, loading } = useProfile();
    
    const [name, setName] = useState('');
    const [imageProfile, setImageProfile] = useState<string | null>(null);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const isInitialLoading = loading && !user;

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setImageProfile(user.imageProfile || null);
        }
    }, [user]);

    const handleSave = async () => {
        if (user?.id) {
            await updateProfile(user.id, { name, imageProfile: imageProfile || '' });
            router.back();
        }
    };

    const handleDeleteAccount = async () => {
        if (!user?.id || loading) return;

        try {
            await deleteAccount(user.id);
            setIsDeleteModalVisible(false);
            router.replace('/');
        } catch {
            Alert.alert(t("common.error"), t("profile.deleteError"));
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5, 
        });

        if (!result.canceled) {
            setImageProfile(result.assets[0].uri);
        }
    };

    return (
        <Box flex={1} backgroundColor="background">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    padding: scale(24),
                    paddingBottom: verticalScale(70),
                }}
            >
                <MotiView
                    from={{ opacity: 0, translateY: 6 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 220 }}
                >
                    <Box paddingTop="xxl" marginBottom="m">
                        <Text variant="titleLarge" color="textPrimary" fontWeight="700">
                            {t("profile.title")}
                        </Text>
                        <Text variant="body" color="textSecondary" marginTop="xs">
                            {t("profile.subtitle")}
                        </Text>
                    </Box>

                    <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
                        <Box alignItems="center" marginBottom="l">
                            <Box 
                                width={100} height={100} 
                                borderRadius="xl" 
                                backgroundColor="inputBackground" 
                                justifyContent="center" 
                                alignItems="center"
                                overflow="hidden"
                                borderWidth={1}
                                borderColor="border"
                            >
                                {isInitialLoading ? (
                                    <Skeleton width={100} height={100} borderRadius={24} />
                                ) : imageProfile ? (
                                    <Image source={{ uri: imageProfile }} style={{ width: 100, height: 100 }} />
                                ) : (
                                    <Feather name="user" size={40} color={theme.colors.textSecondary} />
                                )}
                            </Box>
                        </Box>
                    </TouchableOpacity>

                    <Box backgroundColor="surface" padding="m" borderRadius="l" borderWidth={1} borderColor="border">
                        <Text variant="caption" marginBottom="xs">{t("profile.fullName")}</Text>
                        {isInitialLoading ? (
                            <Skeleton width="70%" height={24} borderRadius={6} />
                        ) : (
                            <TextInput
                                value={name}
                                onChangeText={setName}
                                placeholder={t("profile.placeholderName")}
                                placeholderTextColor={theme.colors.placeholder}
                                maxLength={100}
                                style={{ fontSize: 16, color: theme.colors.textPrimary, paddingVertical: 8 }}
                            />
                        )}
                    </Box>

                    <TouchableOpacity onPress={handleSave} disabled={loading} activeOpacity={0.85}>
                        <Box marginTop="l" padding="m" backgroundColor="primary" borderRadius="s" alignItems="center">
                            {loading ? (
                                <Skeleton width={scale(72)} height={scale(18)} borderRadius={scale(8)} />
                            ) : (
                                <Text color="textInverse" fontWeight="600">{t("common.save")}</Text>
                            )}
                        </Box>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setIsDeleteModalVisible(true)} disabled={loading} style={{ marginTop: 40 }}>
                        <Box alignItems="center">
                            <Text color="danger" variant="body">{t("profile.deleteAccount")}</Text>
                        </Box>
                    </TouchableOpacity>
                </MotiView>
            </ScrollView>

            <ConfirmationModal 
                visible={isDeleteModalVisible}
                title={t("profile.deleteAccount")}
                message=""
                description={t("profile.deleteConfirmMessage")}
                confirmText={t("common.delete")}
                cancelText={t("common.cancel")}
                onClose={() => setIsDeleteModalVisible(false)}
                onConfirm={handleDeleteAccount}
                isDestructive={true}
            />
        </Box>
    );
}
