//Schema zod
import { CreateUserDTO } from "../../validation";
//Components
import { InputText } from "@/components/InputText/InputText";
import { ButtonForm } from "@/components/ButtonForm/ButtonForm";
//hook
import { useState } from "react";
import { Alert, View, StyleSheet, Text, Pressable, ScrollView } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
//colors
import { colors } from "@/theme";

const logoCashFlow = require("@/assets/Logo_CashFlow.png");

type UserFormProps = {
    initialValues?: Partial<CreateUserDTO>;
    onSubmit: (data: CreateUserDTO) => void;
}
export function UserForm({initialValues, onSubmit}: UserFormProps){
    const [name, setName] = useState(initialValues?.name ?? "")
    const [imageProfile, setImageProfile] = useState(initialValues?.imageProfile ?? "")

    function handleSubmit(){
        onSubmit({
            name: name.trim(),
            imageProfile: imageProfile || undefined
        })
    }

    async function handleSelectImage(){
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()

        if (!permission.granted) {
            Alert.alert(
                "Permissao necessaria",
                "Autorize o acesso a galeria para selecionar uma imagem de avatar."
            )
            return
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        })

        if (!result.canceled) {
            setImageProfile(result.assets[0].uri)
        }
    }

    return (
        <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.container}>
                <Image source={logoCashFlow} style={styles.logo} contentFit="contain" />

                <View style={styles.header}>
                    <Text style={styles.title}>Cadastre seu perfil</Text>
                    <Text style={styles.subtitle}>Informe seu nome e escolha uma imagem para o avatar.</Text>
                </View>

                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Adicionar avatar"
                    onPress={handleSelectImage}
                    style={styles.avatarButton}
                >
                    {imageProfile ? (
                        <Image source={{ uri: imageProfile }} style={styles.avatarImage} contentFit="cover" />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarIcon}>+</Text>
                        </View>
                    )}
                </Pressable>
                <Text style={styles.avatarLabel}>Imagem do avatar</Text>

                <InputText
                    placeholder="Nome"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    returnKeyType="done"
                />
                <ButtonForm label="Salvar" onPress={handleSubmit}/>
            </View>
        </ScrollView>
    )
}
const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        paddingTop: 40,
        paddingBottom: 160,
    },
    container: {
        width: "100%",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 24,
    },
    logo: {
        width: 150,
        height: 72,
        marginBottom: 4,
    },
    header: {
        width: "90%",
        gap: 6,
        marginBottom: 8,
    },
    title: {
        color: colors.textPrimary,
        fontSize: 20,
        textAlign: "center",
        fontWeight: "700",
    },
    subtitle: {
        color: colors.textSecondary,
        fontSize: 13,
        lineHeight: 18,
    },
    avatarButton: {
        width: 112,
        height: 112,
        borderRadius: 56,
        borderWidth: 2,
        borderColor: colors.primaryLight,
        backgroundColor: colors.surface,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
    avatarImage: {
        width: "100%",
        height: "100%",
    },
    avatarPlaceholder: {
        width: 92,
        height: 92,
        borderRadius: 46,
        backgroundColor: colors.primaryLight,
        alignItems: "center",
        justifyContent: "center",
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
})
