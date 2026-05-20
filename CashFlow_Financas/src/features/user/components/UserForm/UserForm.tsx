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
    View,
    StyleSheet,
    Text,
    Pressable,
    ScrollView,
    useWindowDimensions
} from "react-native";

import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";

//colors
import { colors } from "@/theme";

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
                "Permissão necessária",
                "Autorize o acesso à galeria para selecionar uma imagem de avatar."
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
            <View
                style={[
                    styles.container,
                    isLandscape && styles.containerLandscape
                ]}
            >
                <View
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

                    <View
                        style={[
                            styles.header,
                            isLandscape && styles.headerLandscape
                        ]}
                    >
                        <Text style={styles.title}>
                            {t("user.title")}
                        </Text>

                        <Text
                            style={[
                                styles.subtitle,
                                isLandscape && styles.subtitleLandscape
                            ]}
                        >
                            {t("user.subtitle")}
                        </Text>
                    </View>

                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Adicionar avatar"
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
                            <View
                                style={[
                                    styles.avatarPlaceholder,
                                    isLandscape &&
                                    styles.avatarPlaceholderLandscape
                                ]}
                            >
                                <Text style={styles.avatarIcon}>+</Text>
                            </View>
                        )}
                    </Pressable>

                    <Text style={styles.avatarLabel}>
                        {t("user.avatar")}
                    </Text>
                </View>

                <View
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
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        paddingTop: 40,
        paddingBottom: 160,
    },

    scrollContentLandscape: {
        paddingTop: 24,
        paddingBottom: 80,
    },

    container: {
        width: "100%",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 24,
        
    },

    containerLandscape: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 32,
        paddingHorizontal: 32,
    },

    profileArea: {
        width: "100%",
        alignItems: "center",
        gap: 12,
    },

    profileAreaLandscape: {
        flex: 1,
        maxWidth: 320,
    },

    formArea: {
        width: "100%",
        alignItems: "center",
        gap: 12,
    },

    formAreaLandscape: {
        flex: 1,
        maxWidth: 360,
    },

    logo: {
        width: 150,
        height: 72,
        marginBottom: 4,
    },

    logoLandscape: {
        width: 132,
        height: 56,
    },

    header: {
        width: "90%",
        gap: 6,
        marginBottom: 8,
    },

    headerLandscape: {
        marginBottom: 0,
    },

    title: {
        color: colors.textPrimary,
        fontSize: 20,
        textAlign: "center",
        fontWeight: "700",
    },

    subtitle: {
        color: colors.textSecondary,
        fontSize: 12,
        lineHeight: 18,
    },

    subtitleLandscape: {
        textAlign: "center",
    },

    avatarButton: {
        width: 96,
        height: 96,
        borderRadius: 56,
        borderWidth: 2,
        borderColor: colors.primaryLight,
        backgroundColor: colors.surface,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },

    avatarButtonLandscape: {
        width: 88,
        height: 88,
        borderRadius: 44,
    },

    avatarImage: {
        width: "100%",
        height: "100%",
    },

    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 46,
        backgroundColor: colors.primaryLight,
        alignItems: "center",
        justifyContent: "center",
    },

    avatarPlaceholderLandscape: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },

    avatarIcon: {
        color: colors.primary,
        fontSize: 34,
        fontWeight: "600",
        lineHeight: 38,
    },

    avatarLabel: {
        color: colors.textSecondary,
        fontSize: 12,
        marginBottom: 6,
    }
});