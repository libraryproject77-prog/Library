'use client';

import React, { useState, useEffect } from 'react';
import {
  Users2,
  GraduationCap,
  Briefcase,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  History,
  BookOpen,
  Calendar,
  X
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminMembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  useEffect(() => {
    loadMembers();
  }, [roleFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      loadMembers();
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const res = await api.getMembers({
        role: roleFilter === 'all' ? undefined : roleFilter,
        search
      });
      if (res?.members) {
        setMembers(res.members);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await api.toggleMemberStatus(id);
      loadMembers();
    } catch (err: any) {
      alert(err.message || 'Error updating member status');
    }
  };

  const openHistory = async (id: string) => {
    try {
      const res = await api.getMemberById(id);
      if (res?.member) {
        setSelectedMember(res.member);
        setHistoryModalOpen(true);
      }
    } catch (err: any) {
      alert(err.message || 'Error loading member history');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users2 className="w-7 h-7 text-aura-neon" />
            Member Directory & Borrowing Records
          </h1>
          <p className="text-xs md:text-sm text-content-muted mt-1">
            Manage ECE department students, professors, account authorizations and circulation history.
          </p>
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-card border border-stroke-glass self-start sm:self-auto">
          {['all', 'STUDENT', 'STAFF', 'ADMIN'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                roleFilter === r
                  ? 'bg-aura-purple/20 text-aura-neon border border-aura-purple/50'
                  : 'text-content-muted hover:text-white'
              }`}
            >
              {r.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-panel-card p-4 rounded-2xl border border-stroke-subtle">
        <div className="relative">
          <Search className="w-4 h-4 text-content-subtle absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student roll number (e.g. 21EC104), staff ID, or name..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-low border border-stroke-glass text-xs text-white placeholder:text-content-subtle focus:outline-none focus:border-aura-purple"
          />
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full glass-panel-card p-12 rounded-2xl text-center text-content-muted text-xs">
            Loading member directory...
          </div>
        ) : members.length === 0 ? (
          <div className="col-span-full glass-panel-card p-12 rounded-2xl text-center text-content-muted text-xs">
            No matching members found.
          </div>
        ) : (
          members.map((m) => {
            const isActive = m.status === 'ACTIVE';
            const isStudent = m.role === 'STUDENT';
            return (
              <div
                key={m.id}
                className="glass-panel-card p-5 rounded-2xl border border-stroke-subtle hover:border-aura-purple/30 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="w-12 h-12 rounded-xl bg-surface-low border border-stroke-glass overflow-hidden shrink-0">
                    <img
                      src={(m.avatarUrl && !m.avatarUrl.includes('unsplash.com')) ? m.avatarUrl : '/default-avatar.jpg'}
                      alt={m.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate block">
                        {m.name}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                          isActive
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-content-muted mt-0.5 truncate">{m.email}</div>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-mono bg-surface-high px-2 py-0.5 rounded text-white border border-stroke-subtle">
                        {m.rollNumber || m.staffId || 'ID-NONE'}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-aura-neon">
                        {m.role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-stroke-subtle text-xs">
                  <button
                    onClick={() => openHistory(m.id)}
                    className="text-aura-neon hover:underline font-semibold flex items-center gap-1.5"
                  >
                    <History className="w-3.5 h-3.5" /> History
                  </button>

                  {m.role !== 'ADMIN' && (
                    <button
                      onClick={() => handleToggleStatus(m.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                        isActive
                          ? 'text-aura-error hover:bg-aura-errorBg/20'
                          : 'text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                    >
                      {isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* History Modal */}
      {historyModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="glass-panel-card p-6 md:p-8 rounded-3xl border border-stroke-glass w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stroke-subtle mb-6">
              <div>
                <h3 className="text-base font-bold text-white">
                  Borrowing History &bull; {selectedMember.name}
                </h3>
                <p className="text-xs text-content-muted">
                  Roll / Staff ID: {selectedMember.rollNumber || selectedMember.staffId} &bull; {selectedMember.email}
                </p>
              </div>
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="p-1 rounded-lg hover:bg-surface-high text-content-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Past Borrowings */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-content-muted">
                Transaction Records ({selectedMember.borrowings?.length || 0})
              </h4>

              {selectedMember.borrowings?.length === 0 ? (
                <p className="text-xs text-content-subtle py-4 text-center">No borrowing records on file.</p>
              ) : (
                <div className="divide-y divide-stroke-subtle border border-stroke-subtle rounded-2xl overflow-hidden bg-surface-low">
                  {selectedMember.borrowings?.map((tx: any) => (
                    <div key={tx.id} className="p-3.5 text-xs flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 font-mono font-bold text-white">
                          <span>{tx.copy?.copyNumber}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                            tx.status === 'BORROWED' ? 'bg-blue-500/20 text-blue-400' :
                            tx.status === 'OVERDUE' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {tx.status}
                          </span>
                        </div>
                        <div className="font-medium text-content mt-0.5">{tx.copy?.book?.title}</div>
                      </div>
                      <div className="text-right text-[11px] text-content-subtle">
                        <div>Issued: {tx.issueDate?.slice(0, 10)}</div>
                        <div>Due: {tx.dueDate?.slice(0, 10)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
