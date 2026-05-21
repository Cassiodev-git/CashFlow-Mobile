import { UserService } from "@/features/user/services/UserService"
const userFeatureService = new UserService()

class AppUserService {
    async findFirstUser(){
        return await userFeatureService.findFirstUser()
    }
}

export default new AppUserService()
