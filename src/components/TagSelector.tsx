import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "@/constants/theme";
import { AnnouncementTag } from "@/types";

type TagSelectorProps = {
  title: string;
  helperText: string;
  tags: AnnouncementTag[];
  selectedTags: string[];
  onToggleTag: (tagId: string) => void;
};

export function TagSelector({ title, helperText, tags, selectedTags, onToggleTag }: TagSelectorProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.helperText}>{helperText}</Text>

      <View style={styles.tagGrid}>
        {tags.map((tag) => {
          const isSelected = selectedTags.includes(tag.id);

          return (
            <Pressable key={tag.id} style={[styles.tagCard, isSelected && styles.tagCardSelected]} onPress={() => onToggleTag(tag.id)}>
              <Text style={[styles.tagLabel, isSelected && styles.tagLabelSelected]}>{tag.label}</Text>
              <Text style={[styles.tagDescription, isSelected && styles.tagDescriptionSelected]}>{tag.description}</Text>
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
  title: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "700"
  },
  helperText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 22
  },
  tagGrid: {
    gap: theme.spacing.sm
  },
  tagCard: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    gap: theme.spacing.xs,
    padding: theme.spacing.md
  },
  tagCardSelected: {
    backgroundColor: theme.colors.accentSoft,
    borderColor: theme.colors.accent
  },
  tagLabel: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: "700"
  },
  tagLabelSelected: {
    color: theme.colors.accent
  },
  tagDescription: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 20
  },
  tagDescriptionSelected: {
    color: theme.colors.textPrimary
  }
});
