import React from "react";
import prisma from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { History, Shield, Clock } from "lucide-react";

export default async function AdminAuditLogsPage() {
  const logs = await prisma.auditLog.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true, role: true } },
    },
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <History className="w-6 h-6 text-indigo-400" />
          <h1 className="text-2xl font-black text-white">System Audit Trail</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Immutable audit log recording every admin payment approval, pricing change, and setting update
        </p>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-300 font-bold border-b border-slate-800">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Admin / User</th>
                <th className="p-4">Action</th>
                <th className="p-4">Target Entity</th>
                <th className="p-4">Details / Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 font-sans">
                    No audit records logged yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="p-4 text-slate-400 whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </td>

                    <td className="p-4 font-sans text-slate-200">
                      <strong>{log.userName || log.user?.name || "System"}</strong>
                      <span className="text-slate-500 ml-1">({log.user?.role || "SYSTEM"})</span>
                    </td>

                    <td className="p-4">
                      <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded font-bold">
                        {log.action}
                      </span>
                    </td>

                    <td className="p-4 text-slate-300">
                      {log.entityType} {log.entityId && `#${log.entityId}`}
                    </td>

                    <td className="p-4 text-slate-400 max-w-xs truncate font-mono text-[10px]">
                      {log.details || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

