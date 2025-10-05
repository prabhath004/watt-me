import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FlowStatCardProps {
  title: string;
  kw: number;
  tone: 'green' | 'blue' | 'orange' | 'cyan';
  description: string;
  icon: React.ReactNode;
}

export function FlowStatCard({ 
  title, 
  kw, 
  tone, 
  description, 
  icon 
}: FlowStatCardProps) {
  const getToneStyles = () => {
    switch (tone) {
      case 'green':
        return {
          text: 'text-green-600 dark:text-green-400',
          bg: 'bg-white dark:bg-gray-900',
          icon: 'text-green-600 dark:text-green-400',
          border: 'border-3 border-green-500 dark:border-green-400',
          shadow: 'shadow-[0_0_0_2px_rgba(34,197,94,0.2)] hover:shadow-[0_0_0_3px_rgba(34,197,94,0.3)]'
        };
      case 'blue':
        return {
          text: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-white dark:bg-gray-900',
          icon: 'text-blue-600 dark:text-blue-400',
          border: 'border-3 border-blue-500 dark:border-blue-400',
          shadow: 'shadow-[0_0_0_2px_rgba(59,130,246,0.2)] hover:shadow-[0_0_0_3px_rgba(59,130,246,0.3)]'
        };
      case 'orange':
        return {
          text: 'text-orange-600 dark:text-orange-400',
          bg: 'bg-white dark:bg-gray-900',
          icon: 'text-orange-600 dark:text-orange-400',
          border: 'border-3 border-orange-500 dark:border-orange-400',
          shadow: 'shadow-[0_0_0_2px_rgba(249,115,22,0.2)] hover:shadow-[0_0_0_3px_rgba(249,115,22,0.3)]'
        };
      case 'cyan':
        return {
          text: 'text-cyan-600 dark:text-cyan-400',
          bg: 'bg-white dark:bg-gray-900',
          icon: 'text-cyan-600 dark:text-cyan-400',
          border: 'border-3 border-cyan-500 dark:border-cyan-400',
          shadow: 'shadow-[0_0_0_2px_rgba(6,182,212,0.2)] hover:shadow-[0_0_0_3px_rgba(6,182,212,0.3)]'
        };
      default:
        return {
          text: 'text-gray-600 dark:text-gray-400',
          bg: 'bg-white dark:bg-gray-900',
          icon: 'text-gray-600 dark:text-gray-400',
          border: 'border-3 border-gray-500 dark:border-gray-400',
          shadow: 'shadow-[0_0_0_2px_rgba(107,114,128,0.2)] hover:shadow-[0_0_0_3px_rgba(107,114,128,0.3)]'
        };
    }
  };

  const styles = getToneStyles();

  return (
    <Card className={`${styles.bg} ${styles.border} ${styles.shadow} transition-all duration-200 hover:-translate-y-1`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg font-black text-gray-800 dark:text-white">
          <div className={styles.icon}>
            {icon}
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-5xl font-black ${styles.text} mb-3`}>
          {kw.toFixed(2)} kW
        </div>
        <p className="text-base font-black text-gray-700 dark:text-gray-300">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
