"use client";

import React, { useState, useEffect } from "react";
import { Users, Search, Shield, ShieldAlert, UserX, UserCheck, Lock } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (roleFilter !== "ALL") params.set("role", roleFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setUsers(json.users || []);
      }
    } catch (e) {
      console.error("Users fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleToggleBlock = async (user: any) => {
    const action = user.isBlocked ? "unblock" : "block";
    if (!confirm(`Are you sure you want to ${action} ${user.name}?`)) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, isBlocked: !user.isBlocked }),
      });
      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || "Action failed");
      }
    } catch {
      alert("Error updating user");
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, role: newRole }),
      });
      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || "Role update failed");
      }
    } catch {
      alert("Error updating role");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-black text-white">Students & Staff Management</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage student registrations, order histories, staff permissions and access controls
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
            placeholder="Search by student name, email, phone..."
            className="w-full bg-slate-800 text-xs text-white rounded-xl pl-9 pr-4 py-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-white text-xs font-semibold rounded-xl px-3 py-2 cursor-pointer focus:outline-none"
        >
          <option value="ALL">All Roles</option>
          <option value="STUDENT">Students</option>
          <option value="ADMIN">Academic Admins</option>
          <option value="SUPER_ADMIN">Super Admins</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-300 font-bold border-b border-slate-800">
              <tr>
                <th className="p-4">Name & Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Role</th>
                <th className="p-4 text-center">Orders Placed</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No users found matching query.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4">
                      <p className="font-bold text-white">{u.name}</p>
                      <p className="text-[11px] text-slate-400">{u.email}</p>
                    </td>

                    <td className="p-4 text-slate-300 font-mono">
                      {u.phone || "—"}
                    </td>

                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u.id, e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-[11px] font-bold text-indigo-300 rounded-lg px-2 py-1 cursor-pointer"
                      >
                        <option value="STUDENT">Student</option>
                        <option value="ADMIN">Admin</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
                      </select>
                    </td>

                    <td className="p-4 text-center font-bold text-white">
                      {u._count?.orders || 0}
                    </td>

                    <td className="p-4 text-slate-400">
                      {formatDate(u.createdAt)}
                    </td>

                    <td className="p-4 text-center">
                      {u.isBlocked ? (
                        <span className="bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold text-[10px]">
                          Suspended
                        </span>
                      ) : (
                        <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold text-[10px]">
                          Active
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleBlock(u)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          u.isBlocked
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300"
                        }`}
                      >
                        {u.isBlocked ? "Unblock" : "Block User"}
                      </button>
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

