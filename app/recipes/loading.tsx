import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import DashboardLayout from "@/components/DashboardLayout";

export default function Loading() {
  return (
    <DashboardLayout>
    <div className="min-h-screen bg-background">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-6 w-96" />
        </div>

        {/* Search and Filters Skeleton */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Skeleton className="h-10 flex-1" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
        </div>

        {/* Results Count Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-5 w-48" />
        </div>

        {/* Recipe Grid Skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="relative">
                <Skeleton className="w-full h-48" />
                <Skeleton className="absolute top-2 right-2 h-8 w-8 rounded-full" />
                <Skeleton className="absolute top-2 left-2 h-6 w-20" />
              </div>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent className="pt-0">
                {/* Recipe Stats Skeleton */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>

                {/* Nutrition Info Skeleton */}
                <div className="bg-muted/50 rounded-lg p-3 mb-4">
                  <div className="grid grid-cols-4 gap-2">
                    <Skeleton className="h-4 w-12 mx-auto" />
                    <Skeleton className="h-4 w-12 mx-auto" />
                    <Skeleton className="h-4 w-12 mx-auto" />
                    <Skeleton className="h-4 w-12 mx-auto" />
                  </div>
                </div>

                {/* Tags Skeleton */}
                <div className="flex flex-wrap gap-1 mb-4">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>

                {/* Actions Skeleton */}
                <div className="flex gap-2">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
    </DashboardLayout>
  )
}
