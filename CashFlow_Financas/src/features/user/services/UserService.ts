import { UserRepository } from "../repository/UserRepository";
import type { CreateUserDTO, UpdateUserDTO} from "../validation";
import { createUserSchema, updateUserSchema } from "../validation";

const userRepo = new UserRepository()

export class UserService {
    async findFirstUser(){
        return await userRepo.findFirstUser()
    }

    async createUser(data: CreateUserDTO){
        const validatedData = createUserSchema.parse(data)

        const existingUser = await userRepo.findFirstUser()

        if(existingUser){
            throw new Error("Usuário já existe")
        }

        return await userRepo.createUser(validatedData)
    }
    async updateUser(id: string, data: UpdateUserDTO ){
        const validatedData = updateUserSchema.parse(data)
        const existingUser = await userRepo.findFirstUser()
        

        if(!existingUser){
            throw new Error("Usuário não encontrado")
        }

        return await userRepo.updateUser(id, validatedData)
    }
    async deleteUser(id: string){
        return await userRepo.deleteUser(id)
    }
}
