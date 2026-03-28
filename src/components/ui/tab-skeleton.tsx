import { Skeleton } from './skeleton'
import { Card, CardContent } from './card'

export function CostsTabSkeleton() {
  return (
    <div className="space-y-6">
      {/* CostSummary - 3 cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="pt-5">
              <div className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-7 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Cost trend chart */}
      <Card>
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-7 w-32 rounded-lg" />
        </div>
        <CardContent>
          <Skeleton className="h-[220px] w-full rounded-lg" />
        </CardContent>
      </Card>
      {/* Cost by service table */}
      <Card>
        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <Skeleton className="h-4 w-28" />
        </div>
        <CardContent>
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-16 rounded-md" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function PipelinesTabSkeleton() {
  return (
    <div className="space-y-6">
      {/* Pass rate chart */}
      <Card>
        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-1 h-3 w-40" />
        </div>
        <CardContent>
          <Skeleton className="h-[200px] w-full rounded-lg" />
        </CardContent>
      </Card>
      {/* Workflow cards */}
      {[0, 1].map((i) => (
        <Card key={i}>
          <CardContent className="pt-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-5 w-24 rounded-md" />
                <Skeleton className="h-5 w-20 rounded-md" />
              </div>
            </div>
            <div className="space-y-2">
              {[0, 1, 2].map((j) => (
                <div key={j} className="flex items-center gap-3 px-3 py-2">
                  <Skeleton className="h-3.5 w-3.5 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-2 w-32" />
                  </div>
                  <Skeleton className="h-2 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function SecurityTabSkeleton() {
  return (
    <div className="space-y-6">
      {/* Score card */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-start gap-6">
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="h-16 w-16 rounded-full" />
              <Skeleton className="h-10 w-12" />
              <Skeleton className="h-3 w-10" />
            </div>
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-36" />
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-1.5 flex-1 rounded-full" />
                  <Skeleton className="h-3 w-6" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Vulnerability list */}
      <Card>
        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <Skeleton className="h-4 w-28" />
        </div>
        <CardContent>
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 flex-1" />
                <Skeleton className="h-5 w-14 rounded-md" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function LogsTabSkeleton() {
  return (
    <div className="space-y-6">
      {/* Error rate chart */}
      <Card>
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-44" />
          </div>
          <Skeleton className="h-7 w-40 rounded-lg" />
        </div>
        <CardContent>
          <Skeleton className="h-[180px] w-full rounded-lg" />
        </CardContent>
      </Card>
      {/* Log entries */}
      <Card>
        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-3 px-6 py-3">
              <Skeleton className="mt-0.5 h-3.5 w-3.5" />
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-16 rounded-md" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="ml-auto h-2 w-16" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-2 w-40" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export function CoverageTabSkeleton() {
  return (
    <div className="space-y-6">
      {/* Coverage summary */}
      <Card>
        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <Skeleton className="h-4 w-32" />
        </div>
        <CardContent>
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-28" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                  <Skeleton className="h-2 w-28" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Coverage trend chart */}
      <Card>
        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <Skeleton className="h-4 w-28" />
        </div>
        <CardContent>
          <Skeleton className="h-[200px] w-full rounded-lg" />
        </CardContent>
      </Card>
      {/* File table */}
      <Card>
        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <Skeleton className="h-4 w-24" />
        </div>
        <CardContent>
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
