import { StyleSheet, Text, View } from "react-native";
//hooks
import { useState, useEffect } from "react";
//Cores
import { colors } from "@/theme";
//Components
import { TopBar } from "@/components/TopBar/TopBar";
//Service
import UserServiceGlobal from "@/services/UserServiceGlobal";
//Type
import {User} from "@/features/user/types/User"

export default function HomeScreen() { 
    const [user, setUser] = useState<User | null>(null)
    useEffect(() => {
        async function loadUser() {
            const userData = await UserServiceGlobal.findFirstUser()
            setUser(userData)
        }
        loadUser()
    }, [])
    return (
        <View style={styles.container}>
            <TopBar user={user}/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 16,
        padding: 24,
        paddingTop: 72,
        backgroundColor: colors.background,
    }
});
