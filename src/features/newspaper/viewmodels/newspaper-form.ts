import { checkNewspaperFile, type NewspaperFileIssue } from "./newspaper-file";
import { NEWSPAPER_TITLE_MAX } from "../models";

export type NewspaperFormValues = { title: string; file?: File };

export type NewspaperFormErrors = {
  title?: "required" | "tooLong";
  file?: NewspaperFileIssue | "required";
};

// Editing keeps the current PDF unless a new one is picked.
export function validateNewspaperForm(
  values: NewspaperFormValues,
  { requireFile }: { requireFile: boolean },
): NewspaperFormErrors {
  const errors: NewspaperFormErrors = {};
  const title = values.title.trim();
  if (!title) errors.title = "required";
  else if (title.length > NEWSPAPER_TITLE_MAX) errors.title = "tooLong";
  if (values.file) {
    const issue = checkNewspaperFile(values.file);
    if (issue) errors.file = issue;
  } else if (requireFile) {
    errors.file = "required";
  }
  return errors;
}

export const hasFormErrors = (errors: NewspaperFormErrors) =>
  Object.values(errors).some(Boolean);
