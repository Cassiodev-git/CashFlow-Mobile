import { logger } from "../utils/logger";
import { useState, useEffect } from 'react';
import AppUserService from "@/services/AppUserService";
import i18n from "@/i18n";

export const useProfile = () => {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);

    const loadUser = async () => {
        setLoading(true);
        try {
            const data = await AppUserService.findFirstUser();
            setUser(data);
        } catch (error) {
            logger.error("Error loading profile user:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    const updateProfile = async (id: string, data: { name: string; imageProfile?: string }) => {
        setLoading(true);
        try {
            await AppUserService.updateUser(id, data);
            setUser((prev: any) => ({ ...prev, ...data }));
        } catch (error) {
            logger.error("Error updating profile:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const deleteAccount = async (id: string) => {
        setLoading(true);
        try {
            await AppUserService.deleteUser(id);
            setUser(null);
            return true;
        } catch (error) {
            logger.error("Error deleting account:", error);
            throw new Error(i18n.t("profile.deleteError"));
        } finally {
            setLoading(false);
        }
    };

    return { user, updateProfile, deleteAccount, loading, loadUser };
};
