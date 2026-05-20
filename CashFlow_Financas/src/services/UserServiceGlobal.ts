import { UserService } from "@/features/user/services/UserService"
const UserServiceFeature = new UserService()
class UserServiceGlobal {
    async findFirstUser(){
        return await UserServiceFeature.findFirstUser()
    }
}
export default new UserServiceGlobal()