//components
import { UserForm } from "@/features/user/components/UserForm/UserForm";
//Schema zod
import { CreateUserDTO } from "@/features/user/validation";
//hooks
import { useUser } from "@/features/user/hooks/useUser"

//router
import { router } from "expo-router";
import { Box, scale } from "@/theme/unistyles";

export default function ModalScreen() {
  const {createUser, error, loading} = useUser()
  async function handleSaveUser(data: CreateUserDTO){
    const user = await createUser(data)
    if(user){
      router.replace("/home")
    }
  }


  return (
    <Box flex={1} backgroundColor="background" style={{ gap: scale(16) }}>
      <UserForm onSubmit={handleSaveUser} error={error} loading={loading} />
    </Box>
  );
}
