'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { CircularLoader } from '@finallinks/ui';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (columnKey: string) => void;
  onRowClick?: (row: T) => void;
  toolbar?: React.ReactNode;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No records found matching your query.',
  page = 1,
  totalPages = 1,
  onPageChange,
  sortColumn,
  sortDirection,
  onSort,
  onRowClick,
  toolbar,
}: DataTableProps<T>) {
  return (
    <div className="space-y-4 w-full">
      {toolbar && <div className="w-full">{toolbar}</div>}

      <div className="w-full rounded-xl border border-[#33373D] bg-[#1E2024] overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <CircularLoader size="lg" label="Loading" color="#0B9DF7" />
          </div>
        ) : data.length === 0 ? (
          <div className="py-20 text-center text-sm text-[#9CA3AF]">{emptyMessage}</div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#33373D] bg-[#16181B] text-[#9CA3AF]">
                  {columns.map((col) => {
                    const isSorted = sortColumn === col.key;
                    const alignClass =
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                          ? 'text-center'
                          : 'text-left';

                    return (
                      <th
                        key={col.key}
                        className={`py-3.5 px-5 font-semibold text-xs tracking-wider uppercase ${alignClass} ${
                          col.headerClassName || ''
                        }`}
                      >
                        {col.sortable && onSort ? (
                          <button
                            type="button"
                            onClick={() => onSort(col.key)}
                            className="inline-flex items-center gap-1.5 hover:text-[#F3F4F6] transition-colors"
                          >
                            <span>{col.header}</span>
                            {isSorted ? (
                              sortDirection === 'asc' ? (
                                <ArrowUp className="h-3.5 w-3.5 text-[#0B9DF7]" />
                              ) : (
                                <ArrowDown className="h-3.5 w-3.5 text-[#0B9DF7]" />
                              )
                            ) : (
                              <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                            )}
                          </button>
                        ) : (
                          <span>{col.header}</span>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#33373D]/60">
                {data.map((row, idx) => {
                  const key = row.id ? String(row.id) : idx;
                  return (
                    <tr
                      key={key}
                      onClick={() => onRowClick && onRowClick(row)}
                      className={`transition-colors ${
                        onRowClick ? 'cursor-pointer hover:bg-[#26292F]' : 'hover:bg-[#26292F]/60'
                      }`}
                    >
                      {columns.map((col) => {
                        const alignClass =
                          col.align === 'right'
                            ? 'text-right'
                            : col.align === 'center'
                              ? 'text-center'
                              : 'text-left';

                        return (
                          <td
                            key={col.key}
                            className={`py-3.5 px-5 text-[#F3F4F6] ${alignClass} ${col.className || ''}`}
                          >
                            {col.render
                              ? col.render(row)
                              : ((row as Record<string, any>)[col.key] ?? '—')}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && onPageChange && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#33373D] bg-[#16181B] text-sm text-[#9CA3AF]">
            <span>
              Page <strong className="text-[#F3F4F6]">{page}</strong> of{' '}
              <strong className="text-[#F3F4F6]">{totalPages}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-[#33373D] bg-[#1E2024] text-xs font-semibold text-[#F3F4F6] hover:bg-[#26292F] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-[#33373D] bg-[#1E2024] text-xs font-semibold text-[#F3F4F6] hover:bg-[#26292F] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
