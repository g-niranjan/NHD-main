
'use client'

import { MetricsPanel } from '@/components/tools/metrics/MetricsPanel';


export default function AnalyticsPage() {
  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>
      <p className="mb-4">Explore the metrics and analytics of your application.</p>
      <p className="mb-6">This page provides insights into the performance and usage
of your application, helping you make data-driven decisions.</p>
      
      {/* Render the MetricsPanel component */}

      <div className="bg-card text-card-foreground border border-border p-6 rounded-lg">
        <MetricsPanel responseTime={[]} />

      </div>
    </div>
  )
}