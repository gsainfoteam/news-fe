import * as React from "react";

import {
  type ColumnDef,
  flexRender,
  metaHelper,
  type OnChangeFn,
  type Row,
  type RowData,
  rowSortingFeature,
  type SortingState,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from "lucide-react";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { cn } from "@/common/lib/cn";

export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  columnMeta: metaHelper<{ className?: string }>(),
});

type Features = typeof dataTableFeatures;

const NO_SORTING: SortingState = [];

export function DataTable<TData extends RowData>({
  columns,
  data,
  getRowId,
  sorting,
  onSortingChange,
  rowClassName,
  renderMobileItem,
  empty,
  caption,
}: DataTable.Props<TData>) {
  const table = useTable({
    features: dataTableFeatures,
    data,
    columns,
    getRowId,
    // Admin lists are paged by the API; sorting one page in the browser would
    // be wrong, so the caller refetches with the new `sorting`.
    manualSorting: true,
    enableSorting: !!onSortingChange,
    defaultColumn: { enableSorting: false },
    state: { sorting: sorting ?? NO_SORTING },
    onSortingChange,
  });
  const rows = table.getRowModel().rows;

  return (
    <>
      <div className={cn(renderMobileItem && "mobile:hidden")}>
        <Table>
          {caption && <TableCaption>{caption}</TableCaption>}
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => {
                  const { column } = header;
                  const sorted = column.getIsSorted();
                  const content = header.isPlaceholder
                    ? null
                    : flexRender(column.columnDef.header, header.getContext());

                  return (
                    <TableHead
                      key={header.id}
                      className={column.columnDef.meta?.className}
                      aria-sort={
                        !column.getCanSort()
                          ? undefined
                          : sorted === "asc"
                            ? "ascending"
                            : sorted === "desc"
                              ? "descending"
                              : "none"
                      }
                    >
                      {column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={column.getToggleSortingHandler()}
                          className={cn(
                            "-mx-1 inline-flex items-center gap-1 rounded-sm px-1 outline-none hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring",
                            sorted && "text-foreground",
                          )}
                        >
                          {content}
                          {sorted === "asc" ? (
                            <ArrowUpIcon className="size-3.5" />
                          ) : sorted === "desc" ? (
                            <ArrowDownIcon className="size-3.5" />
                          ) : (
                            <ChevronsUpDownIcon className="size-3.5 opacity-60" />
                          )}
                        </button>
                      ) : (
                        content
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((row) => (
                <TableRow key={row.id} className={rowClassName?.(row)}>
                  {row.getAllCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.columnDef.meta?.className}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllLeafColumns().length}
                  className="h-32 text-center text-muted-foreground"
                >
                  {empty}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {renderMobileItem && (
        <ul className="hidden flex-col rounded-lg border border-border bg-card mobile:flex">
          {rows.length ? (
            rows.map((row) => (
              <li
                key={row.id}
                className={cn(
                  "flex flex-col gap-2 border-b border-border p-4 last:border-b-0",
                  rowClassName?.(row),
                )}
              >
                {renderMobileItem(row)}
              </li>
            ))
          ) : (
            <li className="px-4 py-12 text-center text-sm text-muted-foreground">
              {empty}
            </li>
          )}
        </ul>
      )}
    </>
  );
}

export namespace DataTable {
  export type Props<TData extends RowData> = {
    // `unknown` rejects plain arrays of accessor columns (string, number, …):
    // ColumnDef is invariant in its value type. TanStack's own helper uses `any`.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    columns: ColumnDef<Features, TData, any>[];
    data: TData[];
    getRowId?: (row: TData, index: number) => string;
    sorting?: SortingState;
    onSortingChange?: OnChangeFn<SortingState>;
    rowClassName?: (row: Row<Features, TData>) => string | undefined;
    renderMobileItem?: (row: Row<Features, TData>) => React.ReactNode;
    empty?: React.ReactNode;
    caption?: string;
  };
}
