"use client";

import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Flag, Check, Trash2, Ban, AlertTriangle } from "lucide-react";

interface Report {
  id: string;
  reportedBy: string;
  reportedUser: string;
  reason: string;
  text?: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: Timestamp;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Report[];
      setReports(items);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleDismiss = async (id: string) => {
    if (!confirm("Dismiss this report?")) return;
    try {
      await updateDoc(doc(db, "reports", id), { status: "dismissed" });
    } catch (error) {
      console.error("Error dismissing:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this report record?")) return;
    try {
      await deleteDoc(doc(db, "reports", id));
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  // Quick Ban Helper (Ideally we'd check if they are already banned, but this purely sets the flag)
  const handleBanUser = async (userId: string, reportId: string) => {
    if (!confirm("Ban the reported user and mark report as resolved?")) return;
    try {
      // 1. Ban User
      await updateDoc(doc(db, "users", userId), { isBanned: true });
      // 2. Resolve Report
      await updateDoc(doc(db, "reports", reportId), { status: "resolved" });
      alert("User banned and report resolved.");
    } catch (error) {
      console.error("Error banning user from report:", error);
      alert("Failed to ban user.");
    }
  };

  if (loading)
    return (
      <div className='p-8 text-center text-slate-500'>Loading reports...</div>
    );

  return (
    <div className='p-6 w-full'>
      <h1 className='text-2xl font-bold text-slate-900 dark:text-white mb-6'>
        Report Management
      </h1>

      <div className='bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse min-w-[800px]'>
            <thead className='bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold'>
              <tr>
                <th className='p-4'>Reason</th>
                <th className='p-4'>Content</th>
                <th className='p-4'>Reported User</th>
                <th className='p-4'>Status</th>
                <th className='p-4 text-right'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100 dark:divide-slate-800'>
              {reports.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className='p-8 text-center text-slate-400 italic'
                  >
                    No reports found. Good job!
                  </td>
                </tr>
              )}
              {reports.map((report) => (
                <tr
                  key={report.id}
                  className='hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors'
                >
                  <td className='p-4'>
                    <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'>
                      <AlertTriangle size={12} />
                      {report.reason}
                    </span>
                  </td>
                  <td className='p-4'>
                    <p
                      className='text-sm text-slate-600 dark:text-slate-300 max-w-xs truncate'
                      title={report.text}
                    >
                      "{report.text}"
                    </p>
                  </td>
                  <td className='p-4'>
                    <code className='bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs text-slate-500'>
                      {report.reportedUser}
                    </code>
                  </td>
                  <td className='p-4'>
                    {report.status === "pending" ? (
                      <span className='text-xs font-bold text-blue-500 uppercase tracking-wider'>
                        Pending
                      </span>
                    ) : report.status === "resolved" ? (
                      <span className='text-xs font-bold text-green-500 uppercase tracking-wider'>
                        Resolved
                      </span>
                    ) : (
                      <span className='text-xs font-bold text-slate-400 uppercase tracking-wider'>
                        Dismissed
                      </span>
                    )}
                  </td>
                  <td className='p-4 text-right'>
                    <div className='flex items-center justify-end gap-2'>
                      {report.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleBanUser(report.reportedUser, report.id)
                            }
                            className='p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors'
                            title='Ban User & Resolve'
                          >
                            <Ban size={16} />
                          </button>
                          <button
                            onClick={() => handleDismiss(report.id)}
                            className='p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors'
                            title='Dismiss Report'
                          >
                            <Check size={16} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(report.id)}
                        className='p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors'
                        title='Delete Record'
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
