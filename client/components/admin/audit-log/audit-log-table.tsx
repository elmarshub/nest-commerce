"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/format";
import type { paths } from "@/lib/api/schema";

type AuditLogEntry =
  paths["/api/v1/audit-logs"]["get"]["responses"]["200"]["content"]["application/json"]["data"][number];

export function AuditLogTable({ entries }: { entries: AuditLogEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">
        No admin activity found.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Actor</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Target</TableHead>
          <TableHead className="text-right">Details</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell className="text-muted-foreground">
              {formatDate(entry.createdAt)}
            </TableCell>
            <TableCell className="text-foreground">{entry.actorEmail}</TableCell>
            <TableCell className="capitalize">
              {entry.action.toLowerCase().replaceAll("_", " ")}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {entry.targetType} — {String(entry.targetId ?? "—")}
            </TableCell>
            <TableCell className="text-right">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-none cursor-pointer">
                    View
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-none">
                  <DialogHeader>
                    <DialogTitle className="font-light">Action Details</DialogTitle>
                  </DialogHeader>
                  <dl className="text-sm space-y-2">
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Timestamp</dt>
                      <dd className="text-foreground text-right">
                        {formatDate(entry.createdAt)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Actor</dt>
                      <dd className="text-foreground text-right">{entry.actorEmail}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Action</dt>
                      <dd className="text-foreground text-right capitalize">
                        {entry.action.toLowerCase().replaceAll("_", " ")}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Target</dt>
                      <dd className="text-foreground text-right">
                        {entry.targetType} — {String(entry.targetId ?? "—")}
                      </dd>
                    </div>
                  </dl>
                  {entry.metadata && (
                    <pre className="text-xs bg-muted/30 p-4 overflow-auto max-h-96 mt-2">
                      {JSON.stringify(entry.metadata, null, 2)}
                    </pre>
                  )}
                </DialogContent>
              </Dialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
