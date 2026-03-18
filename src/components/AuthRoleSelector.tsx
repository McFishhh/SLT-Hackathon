import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "@/constants/theme";
import { roleOptions } from "@/data/tagOptions";
import { UserRole } from "@/types";

type AuthRoleSelectorProps = {
  selectedRole: UserRole;
  onSelectRole: (role: UserRole) => void;
};

export function AuthRoleSelector({ selectedRole, onSelectRole }: AuthRoleSelectorProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Role</Text>
      <View style={styles.optionsRow}>
        {roleOptions.map((roleOption) => {
          const isSelected = roleOption.value === selectedRole;

          return (
            <Pressable
              key={roleOption.value}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => onSelectRole(roleOption.value)}
            >
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{roleOption.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md
  },
  label: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "700"
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm
  },
  option: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm
  },
  optionSelected: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent
  },
  optionText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "700"
  },
  optionTextSelected: {
    color: theme.colors.surface
  }
});
