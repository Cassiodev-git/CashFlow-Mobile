import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { ZodError } from "zod";

type AsyncActionOptions = {
    successMessage?: string;
    showAlert?: boolean;
};

function getErrorMessage(error: unknown): string {

    if (error instanceof ZodError) {
        return error.issues[0].message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "Erro inesperado";
}

export function useAsyncAction() {

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState<string>();

    const execute = useCallback(
        async function execute<T>(
            action: () => Promise<T>,
            options?: AsyncActionOptions
        ): Promise<T | null> {

            try {

                setLoading(true);

                setError(undefined);

                const result = await action();

                if (options?.successMessage) {
                    Alert.alert("Sucesso", options.successMessage);
                }

                return result;

            } catch (err) {

                const message = getErrorMessage(err);

                setError(message);

                if (options?.showAlert) {
                    Alert.alert("Erro", message);
                }

                return null;

            } finally {

                setLoading(false);
            }
        },
        []
    );

    return {
        loading,
        error,
        execute,
    };
}