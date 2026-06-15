import { UserService } from "@/features/user/services/UserService"
import { UpdateUserDTO } from "@/features/user/validation"
const userFeatureService = new UserService()

class AppUserService {
    async findFirstUser(){
        return await userFeatureService.findFirstUser()
    }
    async updateUser (id: string, data: UpdateUserDTO){
        return await userFeatureService.updateUser(id, data)
    }
    async deleteUser(id: string){
        return await userFeatureService.deleteUser(id)
    }
}

export default new AppUserService()
