// 🚀 SISTEMA DE MONITORAMENTO DE PERFORMANCE EMPRESARIAL

interface PerformanceMetrics {
  lcp: number;       // Largest Contentful Paint
  fid: number;       // First Input Delay
  cls: number;       // Cumulative Layout Shift
  ttfb: number;      // Time to First Byte
  fcp: number;       // First Contentful Paint
}

interface PageLoadMetrics {
  route: string;
  loadTime: number;
  timestamp: number;
  userAgent: string;
}

interface PerformanceReportDetails {
  averageLoadTime: number;
  totalPageLoads: number;
  slowPages: number;
  slowPagesDetails: PageLoadMetrics[];
}

// Compatibilidade: entrada de Layout Shift sem depender do tipo global LayoutShift
type LayoutShiftEntry = PerformanceEntry & {
  value: number;
  hadRecentInput: boolean;
};

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private pageLoads: PageLoadMetrics[] = [];
  private isProduction = process.env.NODE_ENV === 'production';

  // 📊 MÉTRICAS WEB VITALS
  collectWebVitals() {
    if (typeof window === 'undefined') return;

    // LCP - Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list: PerformanceObserverEntryList) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          this.recordMetric('lcp', entry.startTime);
        }
      }
    });

    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch {
      console.warn('Performance observer not supported');
    }

    // FID - First Input Delay
    const fidObserver = new PerformanceObserver((list: PerformanceObserverEntryList) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'first-input') {
          const e = entry as PerformanceEventTiming;
          this.recordMetric('fid', e.processingStart - e.startTime);
        }
      }
    });

    try {
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch {
      console.warn('FID observer not supported');
    }

    // CLS - Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list: PerformanceObserverEntryList) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'layout-shift') {
          const ls = entry as LayoutShiftEntry;
          if (!ls.hadRecentInput) {
            clsValue += ls.value;
            this.recordMetric('cls', clsValue);
          }
        }
      }
    });

    try {
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch {
      console.warn('CLS observer not supported');
    }
  }

  // 📈 MÉTRICAS DE CARREGAMENTO
  measurePageLoad(route: string) {
    if (typeof window === 'undefined') return;

    const startTime = performance.now();

    window.addEventListener('load', () => {
      const loadTime = performance.now() - startTime;

      this.pageLoads.push({
        route,
        loadTime,
        timestamp: Date.now(),
        userAgent: navigator.userAgent
      });

      if (loadTime >= 3000) {
        console.warn(`🚨 Slow page load: ${route} - ${loadTime.toFixed(2)}ms`);
      }

      this.sendMetricsIfNeeded();
    });
  }

  // 📊 REGISTRO DE MÉTRICAS
  private recordMetric(type: keyof PerformanceMetrics, value: number) {
    const thresholds = {
      lcp: 2500,   // < 2.5s é bom
      fid: 100,    // < 100ms é bom
      cls: 0.1,    // < 0.1 é bom
      ttfb: 800,   // < 800ms é bom
      fcp: 1800    // < 1.8s é bom
    };

    const isGood = value <= thresholds[type];

    if (!isGood && this.isProduction) {
      console.warn(`🚨 Poor ${type.toUpperCase()}: ${value}ms (threshold: ${thresholds[type]}ms)`);
    }

    if (!this.isProduction) {
      const status = isGood ? '✅' : '❌';
      console.log(`${status} ${type.toUpperCase()}: ${value.toFixed(2)}ms`);
    }
  }

  // 📤 ENVIO DE MÉTRICAS (MOCK - futura integração com analytics)
  private sendMetricsIfNeeded() {
    if (this.pageLoads.length >= 10 || this.metrics.length >= 10) {
      if (this.isProduction) {
        this.sendToAnalytics();
      }
      this.pageLoads = [];
      this.metrics = [];
    }
  }

  private sendToAnalytics() {
    console.log('📊 Sending metrics to analytics...', {
      pageLoads: this.pageLoads.length,
      metrics: this.metrics.length
    });
  }

  // 📋 RELATÓRIO DE PERFORMANCE
  getPerformanceReport(): { summary: string; details: PerformanceReportDetails } {
    const avgLoadTime = this.pageLoads.length > 0
      ? this.pageLoads.reduce((sum, load) => sum + load.loadTime, 0) / this.pageLoads.length
      : 0;

    const slowPages = this.pageLoads.filter(load => load.loadTime > 3000);

    return {
      summary: `Avg Load: ${avgLoadTime.toFixed(2)}ms | Slow Pages: ${slowPages.length}`,
      details: {
        averageLoadTime: avgLoadTime,
        totalPageLoads: this.pageLoads.length,
        slowPages: slowPages.length,
        slowPagesDetails: slowPages
      }
    };
  }
}

// 🎯 INSTÂNCIA SINGLETON
export const performanceMonitor = new PerformanceMonitor();

// 🚀 HOOK PARA COMPONENTS REACT
export function usePerformanceMonitoring(route: string) {
  if (typeof window !== 'undefined') {
    performanceMonitor.measurePageLoad(route);
    performanceMonitor.collectWebVitals();
  }
}

// 📊 MÉTRICAS EMPRESARIAIS - BENCHMARKS
export const ENTERPRISE_BENCHMARKS = {
  EXCELLENT: { lcp: 1500, fid: 50, cls: 0.05, pageLoad: 1500 },
  GOOD: { lcp: 2500, fid: 100, cls: 0.1, pageLoad: 3000 },
  POOR: { lcp: 4000, fid: 300, cls: 0.25, pageLoad: 5000 }
} as const;
