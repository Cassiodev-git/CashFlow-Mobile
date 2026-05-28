import { UserService } from "@/features/user/services/UserService";
import { CreateUserDTO, UpdateUserDTO } from "@/features/user/validation";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

const userService = new UserService();

export function useUser() {
    const { loading, error, execute } = useAsyncAction();
    const {t} = useTranslation()

    const findFirstUser = useCallback(function findFirstUser() {
        return execute(
            () => userService.findFirstUser(),
            { showAlert: false }
        );
    }, [execute]);

    const createUser = useCallback(function createUser(data: CreateUserDTO) {
        return execute(
            () => userService.createUser(data),
            {   successMessage: t("user.createSuccess"),
                showAlert: false  
            }
        );
    }, [execute, t]);

    const updateUser = useCallback(function updateUser(id: string, data: UpdateUserDTO) {
        return execute(
            () => userService.updateUser(id, data),
            { successMessage: t("user.updateSuccess") }
        );
    }, [execute, t]);

    const deleteUser = useCallback(function deleteUser(id: string) {
        return execute(
            () => userService.deleteUser(id),
            { successMessage: t("user.deleteSuccess") }
        );
    }, [execute, t]);

    return {
        findFirstUser,
        createUser,
        updateUser,
        deleteUser,
        loading,
        error,
    };
}
