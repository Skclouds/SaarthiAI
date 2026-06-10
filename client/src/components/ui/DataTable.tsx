import { cn } from '@/lib/cn';

interface DataTableProps {
  children: React.ReactNode;
  className?: string;
}

export default function DataTable({ children, className }: DataTableProps) {
  return (
    <div className={cn('dashboard-card overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-body">{children}</table>
      </div>
    </div>
  );
}

export function DataTableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="sticky top-0 z-10 bg-surface-muted/90 backdrop-blur-sm">
      <tr className="border-b border-border">{children}</tr>
    </thead>
  );
}

export function DataTableHeaderCell({
  children,
  className,
  align = 'left',
}: {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'right';
}) {
  return (
    <th
      className={cn(
        'px-4 py-3 font-medium text-slate-600 text-caption whitespace-nowrap',
        align === 'right' ? 'text-right' : 'text-left',
        className,
      )}
    >
      {children}
    </th>
  );
}

export function DataTableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-border-muted">{children}</tbody>;
}

export function DataTableRow({
  children,
  onClick,
  selected,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
}) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        'motion-safe-transition',
        onClick && 'cursor-pointer hover:bg-surface-muted/60',
        selected && 'bg-primary-50/60',
      )}
    >
      {children}
    </tr>
  );
}

export function DataTableCell({
  children,
  className,
  align = 'left',
}: {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'right';
}) {
  return (
    <td
      className={cn(
        'px-4 py-3.5 text-foreground',
        align === 'right' ? 'text-right' : 'text-left',
        className,
      )}
    >
      {children}
    </td>
  );
}
