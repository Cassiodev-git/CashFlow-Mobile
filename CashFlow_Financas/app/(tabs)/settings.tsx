import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Box, Text, Theme } from '@/theme/unistyles';
import { useTheme } from '@shopify/restyle';

const SettingsItem = ({ icon, title, subtitle }: { icon: string, title: string, subtitle: string }) => {
    const theme = useTheme<Theme>();
    return (
        <TouchableOpacity style={{ paddingVertical: 16, borderBottomWidth: 1, borderColor: theme.colors.divider }}>
            <Box flexDirection="row" alignItems="center">
                <Feather name={icon as any} size={20} color={theme.colors.textPrimary} />
                <Box marginLeft="m" flex={1}>
                    <Text variant="body" fontWeight="500">{title}</Text>
                    <Text variant="caption" color="textSecondary">{subtitle}</Text>
                </Box>
                <Feather name="chevron-right" size={20} color={theme.colors.textSecondary} />
            </Box>
        </TouchableOpacity>
    );
};

export default function SettingsScreen() {
    const theme = useTheme<Theme>();

    return (
        <Box flex={1} backgroundColor="background" paddingTop="xxl" paddingHorizontal="m">
            <Box marginBottom="l">
                <Text variant="titleLarge" fontWeight="700">Configurações</Text>
                <Text variant="body" color="textSecondary">Personalize sua experiência</Text>
            </Box>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Conta */}
                <Text variant="body" fontWeight="700" color="primary" marginTop="m">Conta</Text>
                <SettingsItem icon="user" title="Perfil" subtitle="Gerencie seus dados" />
                <SettingsItem icon="lock" title="Segurança" subtitle="Senha e autenticação" />
                <SettingsItem icon="bell" title="Notifications" subtitle="Gerencie seus alertas" />

                {/* Preferências */}
                <Text variant="body" fontWeight="700" color="primary" marginTop="l">Preferências</Text>
                <SettingsItem icon="dollar-sign" title="Moeda" subtitle="Real (R$)" />
                <SettingsItem icon="sun" title="Tema" subtitle="Claro" />
                <SettingsItem icon="globe" title="Idioma" subtitle="Português" />
                <SettingsItem icon="list" title="Categoria padrão" subtitle="Gerenciar categorias" />

                {/* Dados */}
                <Text variant="body" fontWeight="700" color="primary" marginTop="l">Dados</Text>
                <SettingsItem icon="download" title="Exportar dados" subtitle="Exporte seus dados financeiros" />
                <SettingsItem icon="shield" title="Backup" subtitle="Gerencie seus backups" />

                {/* Sobre */}
                <Text variant="body" fontWeight="700" color="primary" marginTop="l">Sobre</Text>
                <SettingsItem icon="info" title="Sobre o CashFlow" subtitle="Versão 1.0.0" />
                
                <Box height={100} />
            </ScrollView>
        </Box>
    );
}