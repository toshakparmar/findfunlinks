'use client';

import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  itemName?: string;
  confirmLabel?: string;
  loading?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Deletion',
  description = 'Are you sure you want to permanently delete this item? This action cannot be undone.',
  itemName,
  confirmLabel = 'Delete',
  loading = false,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[#33373D] bg-[#1E2024] p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Icon + Title */}
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#F3F4F6] tracking-tight">{title}</h3>
            <p className="text-sm text-[#9CA3AF] leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Item Name Callout */}
        {itemName && (
          <div className="rounded-xl border border-[#33373D] bg-[#16181B] px-4 py-3">
            <span className="text-xs uppercase tracking-wider text-[#6B7280] font-semibold block mb-0.5">
              Selected Item
            </span>
            <span className="text-sm font-semibold text-[#F3F4F6] font-mono break-all">
              {itemName}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-11 px-5 rounded-lg border border-[#33373D] bg-[#16181B] text-sm font-semibold text-[#D1D5DB] hover:bg-[#26292F] hover:text-[#F3F4F6] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="h-11 px-5 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#EF4444]/20 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>{confirmLabel}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
