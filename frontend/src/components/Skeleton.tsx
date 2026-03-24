interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`skeleton ${className}`} />
  );
}

// Dashboard Stats Skeleton - responsive grid
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="card p-3 sm:p-4">
          <Skeleton className="h-3 sm:h-4 w-12 sm:w-16 mb-1 sm:mb-2" />
          <Skeleton className="h-6 sm:h-8 w-8 sm:w-12" />
        </div>
      ))}
    </div>
  );
}

// Dashboard Tasks Skeleton - responsive layout
export function DashboardTasksSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="p-3 sm:p-4 border-b border-border">
        <Skeleton className="h-5 sm:h-6 w-24 sm:w-32" />
      </div>
      <div className="divide-y divide-border">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <Skeleton className="w-2 h-2 rounded-full flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-3 sm:h-4 w-32 sm:w-48 mb-1 sm:mb-2" />
                <Skeleton className="h-3 w-40 sm:w-64 hidden sm:block" />
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <Skeleton className="h-5 sm:h-6 w-16 sm:w-20 rounded-full" />
              <Skeleton className="h-3 sm:h-4 w-16 sm:w-24 hidden sm:block" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Kanban Column Skeleton - responsive
export function KanbanColumnSkeleton() {
  return (
    <div className="kanban-column p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <Skeleton className="h-4 sm:h-5 w-20 sm:w-24" />
        <Skeleton className="h-4 w-6 sm:w-8" />
      </div>
      <div className="space-y-2 sm:space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card p-2 sm:p-3">
            <div className="flex items-start justify-between mb-1 sm:mb-2">
              <Skeleton className="w-2 h-2 rounded-full" />
              <Skeleton className="h-3 sm:h-4 w-10 sm:w-12" />
            </div>
            <Skeleton className="h-3 sm:h-4 w-full mb-1" />
            <Skeleton className="h-3 w-2/3 sm:w-3/4 mb-1 sm:mb-2" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-16 sm:w-20" />
              <Skeleton className="h-3 w-10 sm:w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Tasks Page Skeleton (4 columns) - responsive
export function TasksPageSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <Skeleton className="h-6 sm:h-7 w-16 sm:w-20 mb-1" />
          <Skeleton className="h-3 sm:h-4 w-40 sm:w-48" />
        </div>
        <Skeleton className="h-9 sm:h-10 w-24 sm:w-28" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KanbanColumnSkeleton />
        <KanbanColumnSkeleton />
        <KanbanColumnSkeleton />
        <KanbanColumnSkeleton />
      </div>
    </div>
  );
}

// Calendar Skeleton - responsive with view support
type CalendarView = 'month' | 'week' | 'day';

interface CalendarSkeletonProps {
  view?: CalendarView;
}

export function CalendarSkeleton({ view = 'month' }: CalendarSkeletonProps) {
  // Month view skeleton
  if (view === 'month') {
    return (
      <div className="p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
          <div>
            <Skeleton className="h-6 sm:h-7 w-20 sm:w-24 mb-1" />
            <Skeleton className="h-3 sm:h-4 w-40 sm:w-48" />
          </div>
          <Skeleton className="h-9 sm:h-10 w-24 sm:w-28" />
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Skeleton className="h-7 sm:h-8 w-7 sm:w-8" />
            <Skeleton className="h-5 sm:h-6 w-24 sm:w-32" />
            <Skeleton className="h-7 sm:h-8 w-7 sm:w-8" />
            <Skeleton className="h-7 sm:h-8 w-14 sm:w-16 hidden sm:block" />
          </div>
          <div className="flex gap-1 sm:gap-2">
            <Skeleton className="h-7 sm:h-8 w-12 sm:w-16" />
            <Skeleton className="h-7 sm:h-8 w-12 sm:w-16" />
            <Skeleton className="h-7 sm:h-8 w-12 sm:w-16" />
          </div>
        </div>
        <div className="card p-2 sm:p-4 overflow-x-auto">
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1 min-w-[500px]">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="text-center text-xs sm:text-sm font-medium p-1 sm:p-2 bg-bg-tertiary">
                <Skeleton className="h-3 sm:h-4 w-6 sm:w-8 mx-auto" />
              </div>
            ))}
            {[...Array(42)].map((_, i) => (
              <div key={i} className="min-h-[60px] sm:min-h-[100px] p-0.5 sm:p-1 border border-border">
                <Skeleton className="h-4 sm:h-5 w-5 sm:w-6 mb-1 sm:mb-2" />
                <Skeleton className="h-2 sm:h-3 w-full mb-0.5 sm:mb-1" />
                <Skeleton className="h-2 sm:h-3 w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Week view skeleton
  if (view === 'week') {
    return (
      <div className="p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
          <div>
            <Skeleton className="h-6 sm:h-7 w-20 sm:w-24 mb-1" />
            <Skeleton className="h-3 sm:h-4 w-40 sm:w-48" />
          </div>
          <Skeleton className="h-9 sm:h-10 w-24 sm:w-28" />
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Skeleton className="h-7 sm:h-8 w-7 sm:w-8" />
            <Skeleton className="h-5 sm:h-6 w-24 sm:w-32" />
            <Skeleton className="h-7 sm:h-8 w-7 sm:w-8" />
            <Skeleton className="h-7 sm:h-8 w-14 sm:w-16 hidden sm:block" />
          </div>
          <div className="flex gap-1 sm:gap-2">
            <Skeleton className="h-7 sm:h-8 w-12 sm:w-16" />
            <Skeleton className="h-7 sm:h-8 w-12 sm:w-16" />
            <Skeleton className="h-7 sm:h-8 w-12 sm:w-16" />
          </div>
        </div>
        <div className="card p-2 sm:p-4 overflow-x-auto">
          <div className="grid grid-cols-8 gap-0.5 sm:gap-1 min-w-[600px]">
            {/* Time column */}
            <div></div>
            {/* Day columns */}
            {[...Array(7)].map((_, i) => (
              <div key={i} className="text-center p-1 sm:p-2 bg-bg-tertiary">
                <Skeleton className="h-3 sm:h-4 w-8 sm:w-10 mx-auto mb-1" />
                <Skeleton className="h-4 sm:h-5 w-6 sm:w-8 mx-auto" />
              </div>
            ))}
            {/* Hour rows */}
            {[...Array(8)].map((_, hourRow) => (
              <div key={hourRow} className="contents">
                <div className="text-xs text-text-muted p-1 text-right border-r border-border h-8 sm:h-10">
                  <Skeleton className="h-3 sm:h-4 w-8 sm:w-10 ml-auto" />
                </div>
                {[...Array(7)].map((_, dayCol) => (
                  <div key={dayCol} className="min-h-[32px] sm:min-h-[40px] border border-border p-0.5">
                    {hourRow < 3 && <Skeleton className="h-3 sm:h-4 w-full mb-1" />}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Day view skeleton
  return (
    <div className="p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div>
          <Skeleton className="h-6 sm:h-7 w-20 sm:w-24 mb-1" />
          <Skeleton className="h-3 sm:h-4 w-40 sm:w-48" />
        </div>
        <Skeleton className="h-9 sm:h-10 w-24 sm:w-28" />
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <Skeleton className="h-7 sm:h-8 w-7 sm:w-8" />
          <Skeleton className="h-5 sm:h-6 w-24 sm:w-32" />
          <Skeleton className="h-7 sm:h-8 w-7 sm:w-8" />
          <Skeleton className="h-7 sm:h-8 w-14 sm:w-16 hidden sm:block" />
        </div>
        <div className="flex gap-1 sm:gap-2">
          <Skeleton className="h-7 sm:h-8 w-12 sm:w-16" />
          <Skeleton className="h-7 sm:h-8 w-12 sm:w-16" />
          <Skeleton className="h-7 sm:h-8 w-12 sm:w-16" />
        </div>
      </div>
      <div className="card p-3 sm:p-4">
        {/* Day header */}
        <div className="text-center p-3 sm:p-4 bg-bg-tertiary rounded-lg mb-3 sm:mb-4">
          <Skeleton className="h-4 sm:h-5 w-32 sm:w-40 mx-auto mb-1" />
          <Skeleton className="h-6 sm:h-8 w-12 sm:w-16 mx-auto mb-1" />
          <Skeleton className="h-3 sm:h-4 w-40 sm:w-48 mx-auto" />
        </div>
        {/* Hour rows */}
        <div className="space-y-1 sm:space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex gap-2 sm:gap-4">
              <div className="w-16 sm:w-20 text-right text-xs sm:text-sm text-text-muted py-2">
                <Skeleton className="h-3 sm:h-4 w-10 sm:w-14 ml-auto" />
              </div>
              <div className="flex-1 min-h-[40px] sm:min-h-[50px] border border-border p-2 rounded">
                {i < 2 && <Skeleton className="h-4 sm:h-5 w-3/4 mb-1" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Departments Page Skeleton - responsive
export function DepartmentsPageSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <Skeleton className="h-6 sm:h-7 w-24 sm:w-32 mb-1" />
          <Skeleton className="h-3 sm:h-4 w-48 sm:w-56" />
        </div>
        <Skeleton className="h-9 sm:h-10 w-32 sm:w-40" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card p-3 sm:p-4">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <Skeleton className="h-4 sm:h-5 w-24 sm:w-32 mb-1" />
                <Skeleton className="h-3 sm:h-4 w-40 sm:w-48" />
              </div>
              <div className="flex gap-1">
                <Skeleton className="h-5 sm:h-6 w-5 sm:w-6" />
                <Skeleton className="h-5 sm:h-6 w-5 sm:w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Users Page Skeleton - responsive
export function UsersPageSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <Skeleton className="h-6 sm:h-7 w-16 sm:w-20 mb-1" />
        <Skeleton className="h-3 sm:h-4 w-48 sm:w-56" />
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-bg-tertiary">
              <tr>
                <th className="text-left p-3 sm:p-4 text-text-secondary font-medium text-xs sm:text-sm"><Skeleton className="h-3 sm:h-4 w-12 sm:w-16" /></th>
                <th className="text-left p-3 sm:p-4 text-text-secondary font-medium text-xs sm:text-sm hidden sm:table-cell"><Skeleton className="h-3 sm:h-4 w-16 sm:w-20" /></th>
                <th className="text-left p-3 sm:p-4 text-text-secondary font-medium text-xs sm:text-sm"><Skeleton className="h-3 sm:h-4 w-10 sm:w-12" /></th>
                <th className="text-left p-3 sm:p-4 text-text-secondary font-medium text-xs sm:text-sm"><Skeleton className="h-3 sm:h-4 w-12 sm:w-14" /></th>
                <th className="text-left p-3 sm:p-4 text-text-secondary font-medium text-xs sm:text-sm hidden sm:table-cell"><Skeleton className="h-3 sm:h-4 w-12 sm:w-16" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="hover:bg-bg-tertiary">
                  <td className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Skeleton className="w-8 sm:w-10 h-8 sm:h-10 rounded-full" />
                      <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
                    </div>
                  </td>
                  <td className="p-3 sm:p-4 hidden sm:table-cell"><Skeleton className="h-3 sm:h-4 w-32 sm:w-40" /></td>
                  <td className="p-3 sm:p-4"><Skeleton className="h-5 sm:h-6 w-20 sm:w-24 rounded-full" /></td>
                  <td className="p-3 sm:p-4"><Skeleton className="h-5 sm:h-6 w-14 sm:w-16 rounded-full" /></td>
                  <td className="p-3 sm:p-4 hidden sm:table-cell"><Skeleton className="h-5 sm:h-6 w-5 sm:w-6" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}