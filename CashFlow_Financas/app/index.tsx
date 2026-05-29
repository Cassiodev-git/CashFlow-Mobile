import { View } from "react-native";

//components
import { UserForm } from "@/features/user/components/UserForm/UserForm";
//Schema zod
import { CreateUserDTO } from "@/features/user/validation";
//hooks
import { useUser } from "@/features/user/hooks/useUser"

//router
import { router } from "expo-router";
//colors
import { colors } from "@/theme";
//reponsive
import { ScaledSheet } from "@/utils/responsive";

export default function ModalScreen() {
  const {createUser, error, loading} = useUser()
  async function handleSaveUser(data: CreateUserDTO){
    const user = await createUser(data)
    if(user){
      router.replace("/home")
    }
  }


  return (
    <View style={style.container}>
      <UserForm onSubmit={handleSaveUser} error={error} loading={loading} />
    </View>
  );
}
const style = ScaledSheet.create({
  container: {
    flex: 1,
    gap: 16,
    backgroundColor: colors.background
  }
})
