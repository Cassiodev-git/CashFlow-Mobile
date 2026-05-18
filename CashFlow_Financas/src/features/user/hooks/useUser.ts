import { UserService } from "@/features/user/services/UserService";
import { CreateUserDTO, UpdateUserDTO } from "@/features/user/validation";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useCallback } from "react";

const userService = new UserService();

export function useUser() {
    const { loading, error, execute } = useAsyncAction();

    const findFirstUser = useCallback(function findFirstUser() {
        return execute(
            () => userService.findFirstUser(),
            { showAlert: false }
        );
    }, [execute]);

    const createUser = useCallback(function createUser(data: CreateUserDTO) {
        return execute(
            () => userService.createUser(data),
            {   successMessage: "Usuário criado com sucesso",
                showAlert: false  
            }
        );
    }, [execute]);

    const updateUser = useCallback(function updateUser(id: string, data: UpdateUserDTO) {
        return execute(
            () => userService.updateUser(id, data),
            { successMessage: "Usuário atualizado com sucesso" }
        );
    }, [execute]);

    const deleteUser = useCallback(function deleteUser(id: string) {
        return execute(
            () => userService.deleteUser(id),
            { successMessage: "Usuário removido com sucesso" }
        );
    }, [execute]);

    return {
        findFirstUser,
        createUser,
        updateUser,
        deleteUser,
        loading,
        error,
    };
}
