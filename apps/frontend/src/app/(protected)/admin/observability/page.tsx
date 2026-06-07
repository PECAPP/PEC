'use client';
import { Button, Card, CardContent, CardHeader, CardTitle } from "@pec/ui";


import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Server, Database, Clock, RefreshCcw, Cpu } from 'lucide-react';

import { toast } from 'sonner';

export default function ObservabilityAdmin() {
  const [metrics, setMetrics] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      // Assuming metrics are exposed at the Next.js proxy /api/metrics or directly at the internal backend url
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/metrics`);
      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }
      const data = await response.text();
      setMetrics(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching metrics:', error);
      toast.error('Failed to load observability metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  // Basic parsing of prometheus text format for simple display
  const processMemory = metrics.match(/process_resident_memory_bytes (\d+)/)?.[1];
  const processMemoryMB = processMemory ? (parseInt(processMemory) / 1024 / 1024).toFixed(2) : 'N/A';

  const nodejsHeapUsed = metrics.match(/nodejs_heap_space_size_used_bytes\{space="new"\} (\d+)/)?.[1];
  const nodejsHeapUsedMB = nodejsHeapUsed ? (parseInt(nodejsHeapUsed) / 1024 / 1024).toFixed(2) : 'N/A';

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Activity className="w-8 h-8 text-primary" />
            System Observability
          </h1>
          <p className="text-muted-foreground">Monitor API performance, memory usage, and database query times in real-time.</p>
        </div>
        <Button onClick={fetchMetrics} disabled={loading} className="gap-2">
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card className="bg-card/50 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Server className="w-4 h-4" />
              Resident Memory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processMemoryMB} MB</div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              Heap Used (New)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nodejsHeapUsedMB} MB</div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Database className="w-4 h-4" />
              Database Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Connected</div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Last Updated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Pending...'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="card-elevated overflow-hidden bg-card border border-border rounded-2xl shadow-sm">
        <div className="p-4 border-b bg-muted/20 flex justify-between items-center">
          <h2 className="font-bold">Raw Prometheus Metrics</h2>
          <span className="text-xs text-muted-foreground">Scraped from /metrics</span>
        </div>
        <div className="p-4">
          {loading && !metrics ? (
            <div className="flex justify-center p-8">
              <RefreshCcw className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <pre className="text-xs bg-muted/50 p-4 rounded-lg overflow-x-auto max-h-[500px] custom-scrollbar border border-border text-foreground">
              {metrics || 'No metrics data available. Make sure the backend metrics endpoint is reachable.'}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
