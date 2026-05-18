import { View } from "react-native";

//components
import { UserForm } from "@/features/user/components/UserForm/UserForm";
//Schema zod
import { CreateUserDTO } from "@/features/user/validation";
//hooks
import { useUser } from "@/features/user/hooks/useUser"

//router
import { router } from "expo-router";

export default function ModalScreen() {
  const {createUser, error, loading, findFirstUser} = useUser()
  async function handleSaveUser(data: CreateUserDTO){
    const useExists = await findFirstUser()
    const user = await createUser(data)
    if(user){
      router.replace("/home")
    }
  }


  return (
    <View >
      <UserForm onSubmit={handleSaveUser} error={error} />
    </View>
  );
}
