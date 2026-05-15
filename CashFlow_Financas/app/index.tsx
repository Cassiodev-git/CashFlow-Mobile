import { View, StyleSheet} from "react-native";
//components
import { UserForm } from "@/features/user/components/UserForm/UserForm";
//Schema zod
import { CreateUserDTO } from "@/features/user/validation";

export default function ModalScreen() {
  function handleSaveUser(data: CreateUserDTO){
    console.log(data)
  }
  return (
    <View>
      <UserForm onSubmit={handleSaveUser}/>
    </View>
  );
}

