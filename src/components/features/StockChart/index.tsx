import { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import type { PriceCandle } from '../../../services/stockService';
import '../../../styles/components/_stockchart.scss';

interface StockChartProps {
  candles: PriceCandle[];
  symbol: string;
}

// Colors from design system
const colors = {
  success: '#10b981',
  error: '#ef4444',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
};

const StockChart = ({ candles }: StockChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);

  // Safely handle the data
  const list = Array.isArray(candles) ? candles : [];

  // Transform candles to chart format
  const chartData = list.map((candle) => ({
    time: candle.timestamp / 1000, // Convert milliseconds to seconds
    value: candle.close,
  }));

  // Determine color based on overall change
  const isPositive = list.length >= 2 
    ? list[list.length - 1].close >= list[0].close
    : true;

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current || chartData.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'white' },
        textColor: colors.textSecondary,
      },
      grid: {
        vertLines: { color: colors.border },
        horzLines: { color: colors.border },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        borderColor: colors.border,
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: colors.border,
      },
      crosshair: {
        vertLine: {
          color: colors.textSecondary,
          width: 1,
          style: 3,
          labelBackgroundColor: colors.textSecondary,
        },
        horzLine: {
          color: colors.textSecondary,
          width: 1,
          style: 3,
          labelBackgroundColor: colors.textSecondary,
        },
      },
    });

    // Add area series
    const areaSeries = chart.addAreaSeries({
      lineColor: isPositive ? colors.success : colors.error,
      topColor: isPositive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)',
      bottomColor: isPositive ? 'rgba(16, 185, 129, 0.0)' : 'rgba(239, 68, 68, 0.0)',
      lineWidth: 2,
    });

    areaSeries.setData(chartData);
    chart.timeScale().fitContent();

    chartRef.current = chart;
    seriesRef.current = areaSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chart.remove();
      }
    };
  }, [chartData.length, isPositive]);

  // Update data when candles change
  useEffect(() => {
    if (seriesRef.current && chartData.length > 0 && list.length >= 2) {
      const newIsPositive = list[list.length - 1].close >= list[0].close;

      seriesRef.current.applyOptions({
        lineColor: newIsPositive ? colors.success : colors.error,
        topColor: newIsPositive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)',
        bottomColor: newIsPositive ? 'rgba(16, 185, 129, 0.0)' : 'rgba(239, 68, 68, 0.0)',
      });

      seriesRef.current.setData(chartData);
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    }
  }, [candles, chartData.length, list.length]);

  // Show message if no data
  if (chartData.length === 0) {
    return (
      <div className="stock-chart">
        <div className="chart-container no-data">
          <p>No chart data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stock-chart">
      <div ref={chartContainerRef} className="chart-container" />
    </div>
  );
};

export default StockChart;