'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  FileSpreadsheet,
  Layers,
  BookOpen,
  AlertTriangle,
  Clock,
  Sparkles
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'borrowing' | 'overdue'>('inventory');
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, [activeTab]);

  const loadReport = async () => {
    try {
      setLoading(true);
      if (activeTab === 'inventory') {
        const res = await api.getInventoryReport();
        setReportData(res?.report || []);
      } else if (activeTab === 'borrowing') {
        const res = await api.getBorrowingReport();
        setReportData(res?.report || []);
      } else if (activeTab === 'overdue') {
        const res = await api.getOverdueReport();
        setReportData(res?.overdues || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // CSV Generator
  const downloadCSV = () => {
    if (reportData.length === 0) return;
    const headers = Object.keys(reportData[0]).join(',');
    const rows = reportData.map((row) =>
      Object.values(row)
        .map((val) => `"${String(val ?? '').replace(/"/g, '""')}"`)
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FXEC_ECE_Library_${activeTab}_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-aura-neon" />
            Library Reports & CSV Analytics Export
          </h1>
          <p className="text-xs md:text-sm text-content-muted mt-1">
            Departmental audit reports, copy inventory tallies, and circulation ledgers.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={downloadCSV}
            className="aura-gradient-btn px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Export to CSV
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-surface-card hover:bg-surface-high border border-stroke-glass text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-content-muted" /> Print Audit Sheet
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stroke-subtle pb-2">
        {[
          { key: 'inventory', label: 'Book Inventory Report', icon: BookOpen },
          { key: 'borrowing', label: 'Borrowing Ledgers', icon: Clock },
          { key: 'overdue', label: 'Overdue Penalties', icon: AlertTriangle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-aura-purple/20 text-aura-neon border border-aura-purple/50'
                  : 'text-content-muted hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Report Table */}
      <div className="glass-panel-card rounded-3xl border border-stroke-subtle overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-content-muted">
            Compiling {activeTab} data...
          </div>
        ) : reportData.length === 0 ? (
          <div className="p-12 text-center text-xs text-content-muted">
            No records found for this report.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-low border-b border-stroke-subtle text-content-muted uppercase tracking-wider text-[10px]">
                <tr>
                  {Object.keys(reportData[0]).map((col) => (
                    <th key={col} className="py-3 px-4 font-semibold">
                      {col.replace(/([A-Z])/g, ' $1')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke-subtle">
                {reportData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-surface-high/40 transition-colors">
                    {Object.entries(row).map(([k, val]: any, cIdx) => (
                      <td key={cIdx} className="py-3 px-4 text-white">
                        {k === 'status' ? (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            val === 'OVERDUE' ? 'bg-rose-500/20 text-rose-400' :
                            val === 'BORROWED' ? 'bg-blue-500/20 text-blue-400' :
                            val === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-surface-high text-content'
                          }`}>
                            {val}
                          </span>
                        ) : (
                          String(val ?? '-')
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
