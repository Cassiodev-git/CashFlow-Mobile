//Schema zod
import { CreateUserDTO } from "../../validation";

//Components
import { InputText } from "@/components/InputText/InputText";
import { ButtonForm } from "@/components/ButtonForm/ButtonForm";

//hook
import { useEffect, useState } from "react";
//Language
import { useTranslation } from "react-i18next";

import {
    Alert,
    Pressable,
    ScrollView,
    useWindowDimensions
} from "react-native";
import { useTheme } from "@shopify/restyle";

import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Box, Text, scale, type Theme } from "@/theme/unistyles";

const logoCashFlow = require("@/assets/Logo_CashFlow.png");

type UserFormProps = {
    initialValues?: Partial<CreateUserDTO>;
    onSubmit: (data: CreateUserDTO) => void;
    error?: string;
    loading?: boolean
}

export function UserForm({
    initialValues,
    onSubmit,
    error,
    loading
}: UserFormProps) {

    const [name, setName] = useState(initialValues?.name ?? "");

    const [localError, setLocalError] = useState("");

    const [imageProfile, setImageProfile] = useState(
        initialValues?.imageProfile ?? ""
    );

    const { width, height } = useWindowDimensions();
    const theme = useTheme<Theme>();
    const styles = createStyles(theme);

    const isLandscape = width > height;
    const {t} = useTranslation()

    useEffect(() => {
        if (error) {

            setLocalError(error);

            const timer = setTimeout(() => {
                setLocalError("");
            }, 4000);

            return () => clearTimeout(timer);
        }
    }, [error]);

    function handleSubmit() {

        if (!name.trim()) {

            setLocalError(t("errors.requiredName"));

            setTimeout(() => {
                setLocalError("");
            }, 4000);

            return;
        }

        onSubmit({
            name: name.trim(),
            imageProfile: imageProfile || undefined
        });
    }

    async function handleSelectImage() {

        const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {

            Alert.alert(
                t("alerts.permissionRequiredTitle"),
                t("alerts.permissionRequiredMessage")
            );

            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImageProfile(result.assets[0].uri);
        }
    }

    function handleChangeName(text: string) {

        setName(text);

        if (localError) {
            setLocalError("");
        }
    }

    return (
        <ScrollView
            contentContainerStyle={[
                styles.scrollContent,
                isLandscape && styles.scrollContentLandscape
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
        >
            <Box
                style={[
                    styles.container,
                    isLandscape && styles.containerLandscape
                ]}
            >
                <Box
                    style={[
                        styles.profileArea,
                        isLandscape && styles.profileAreaLandscape
                    ]}
                >
                    <Image
                        source={logoCashFlow}
                        style={[
                            styles.logo,
                            isLandscape && styles.logoLandscape
                        ]}
                        contentFit="contain"
                    />

                    <Box
                        style={[
                            styles.header,
                            isLandscape && styles.headerLandscape
                        ]}
                    >
                        <Text variant="titleMedium" color="textPrimary" fontWeight="700" style={styles.title}>
                            {t("user.title")}
                        </Text>

                        <Text
                            variant="caption"
                            color="textSecondary"
                            style={[
                                styles.subtitle,
                                isLandscape && styles.subtitleLandscape
                            ]}
                        >
                            {t("user.subtitle")}
                        </Text>
                    </Box>

                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={t("user.addAvatarAccessibilityLabel")}
                        onPress={handleSelectImage}
                        disabled={loading}
                        style={[
                            styles.avatarButton,
                            isLandscape && styles.avatarButtonLandscape
                        ]}
                    >
                        {imageProfile ? (
                            <Image
                                source={{ uri: imageProfile }}
                                style={styles.avatarImage}
                                contentFit="cover"
                            />
                        ) : (
                            <Box
                                style={[
                                    styles.avatarPlaceholder,
                                    isLandscape &&
                                    styles.avatarPlaceholderLandscape
                                ]}
                            >
                                <Text variant="titleLarge" color="primary" fontWeight="600" style={styles.avatarIcon}>+</Text>
                            </Box>
                        )}
                    </Pressable>

                    <Text variant="caption" color="textSecondary" style={styles.avatarLabel}>
                        {t("user.avatar")}
                    </Text>
                </Box>

                <Box
                    style={[
                        styles.formArea,
                        isLandscape && styles.formAreaLandscape
                    ]}
                >
                    <InputText
                        placeholder={t("user.namePlaceholder")}
                        value={name}
                        onChangeText={handleChangeName}
                        autoCapitalize="words"
                        returnKeyType="done"
                        error={localError}
                    />

                    <ButtonForm
                        label={loading ? t("user.saveLoading") : t("common.save")}
                        onPress={handleSubmit}
                        disabled={loading}
                    />
                </Box>
            </Box>
        </ScrollView>
    );
}

const createStyles = (theme: Theme) => ({
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        paddingTop: scale(40),
        paddingBottom: scale(160),
    },

    scrollContentLandscape: {
        paddingTop: scale(24),
        paddingBottom: scale(80),
    },

    container: {
        width: "100%",
        alignItems: "center",
        gap: scale(12),
        paddingHorizontal: scale(24),
        
    },

    containerLandscape: {
        flexDirection: "row",
        justifyContent: "center",
        gap: scale(32),
        paddingHorizontal: scale(32),
    },

    profileArea: {
        width: "100%",
        alignItems: "center",
        gap: scale(12),
    },

    profileAreaLandscape: {
        flex: 1,
        maxWidth: 320,
    },

    formArea: {
        width: "100%",
        alignItems: "center",
        gap: scale(12),
    },

    formAreaLandscape: {
        flex: 1,
        maxWidth: 360,
    },

    logo: {
        width: scale(150),
        height: scale(72),
        marginBottom: scale(4),
    },

    logoLandscape: {
        width: scale(132),
        height: scale(56),
    },

    header: {
        width: "90%",
        gap: scale(6),
        marginBottom: scale(8),
    },

    headerLandscape: {
        marginBottom: 0,
    },

    title: {
        textAlign: "center",
    },

    subtitle: {
        lineHeight: scale(18),
    },

    subtitleLandscape: {
        textAlign: "center",
    },

    avatarButton: {
        width: scale(96),
        height: scale(96),
        borderRadius: scale(56),
        borderWidth: scale(2),
        borderColor: theme.colors.primaryLight,
        backgroundColor: theme.colors.surface,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },

    avatarButtonLandscape: {
        width: scale(88),
        height: scale(88),
        borderRadius: scale(44),
    },

    avatarImage: {
        width: "100%",
        height: "100%",
    },

    avatarPlaceholder: {
        width: scale(100),
        height: scale(100),
        borderRadius: scale(46),
        backgroundColor: theme.colors.primaryLight,
        alignItems: "center",
        justifyContent: "center",
    },

    avatarPlaceholderLandscape: {
        width: scale(80),
        height: scale(80),
        borderRadius: scale(40),
    },

    avatarIcon: {
        lineHeight: scale(38),
    },

    avatarLabel: {
        marginBottom: scale(6),
    }
} as const);
