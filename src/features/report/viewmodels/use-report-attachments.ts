import { useCallback, useEffect, useRef, useState } from "react";

import { MAX_REPORT_FILES } from "../models";
import {
  checkReportFile,
  getReportFileKind,
  type ReportFileIssue,
  type ReportFileKind,
} from "./report-file";
import { uploadReportFile } from "./upload-report-file";

export type ReportAttachment = {
  id: string;
  name: string;
  size: number;
  kind: ReportFileKind;
  status: "invalid" | "uploading" | "done" | "failed";
  issue?: ReportFileIssue;
  /** 0 to 1. */
  progress: number;
  key?: string;
};

/** Why the attachments block submitting, if they do. */
export type ReportAttachmentsIssue = "pending" | "invalid";

let nextId = 0;

// Files upload as soon as they are picked, so the report itself only sends
// keys. Rejected files stay in the list with their reason until removed.
export function useReportAttachments() {
  const [attachments, setAttachments] = useState<ReportAttachment[]>([]);
  const [overflow, setOverflow] = useState(false);
  const files = useRef(new Map<string, File>());
  const uploads = useRef(new Map<string, AbortController>());

  const update = useCallback(
    (id: string, patch: Partial<ReportAttachment>) =>
      setAttachments((list) =>
        list.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      ),
    [],
  );

  const start = useCallback(
    (id: string) => {
      const file = files.current.get(id);
      if (!file) return;
      const controller = new AbortController();
      uploads.current.set(id, controller);
      update(id, { status: "uploading", progress: 0 });
      uploadReportFile(file, {
        signal: controller.signal,
        onProgress: (progress) => update(id, { progress }),
      })
        .then((key) => update(id, { status: "done", progress: 1, key }))
        .catch(() => {
          if (!controller.signal.aborted) update(id, { status: "failed" });
        })
        .finally(() => {
          if (uploads.current.get(id) === controller)
            uploads.current.delete(id);
        });
    },
    [update],
  );

  const add = useCallback(
    (incoming: File[]) => {
      let room =
        MAX_REPORT_FILES -
        attachments.filter((item) => item.status !== "invalid").length;
      const added: ReportAttachment[] = [];
      const toStart: string[] = [];
      let skipped = false;
      for (const file of incoming) {
        const id = `report-file-${++nextId}`;
        const issue = checkReportFile(file);
        const item = {
          id,
          name: file.name,
          size: file.size,
          kind: getReportFileKind(file.name),
          progress: 0,
        };
        if (issue) {
          added.push({ ...item, status: "invalid", issue });
        } else if (room <= 0) {
          skipped = true;
        } else {
          room--;
          files.current.set(id, file);
          added.push({ ...item, status: "uploading" });
          toStart.push(id);
        }
      }
      setOverflow(skipped);
      setAttachments((list) => [...list, ...added]);
      toStart.forEach(start);
    },
    [attachments, start],
  );

  const remove = useCallback((id: string) => {
    uploads.current.get(id)?.abort();
    uploads.current.delete(id);
    files.current.delete(id);
    setOverflow(false);
    setAttachments((list) => list.filter((item) => item.id !== id));
  }, []);

  useEffect(() => {
    const active = uploads.current;
    return () => active.forEach((controller) => controller.abort());
  }, []);

  const keys = attachments.flatMap((item) => (item.key ? [item.key] : []));
  const issue: ReportAttachmentsIssue | undefined = attachments.some(
    (item) => item.status === "uploading",
  )
    ? "pending"
    : attachments.some(
          (item) => item.status === "invalid" || item.status === "failed",
        )
      ? "invalid"
      : undefined;

  return { attachments, keys, issue, overflow, add, remove, retry: start };
}
