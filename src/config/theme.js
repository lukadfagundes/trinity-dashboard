// Theme configuration for trinity-dashboard
// Centralized color and style definitions

export const theme = {
  charts: {
    colors: {
      primary: ['#3B82F6', '#10B981', '#A855F7', '#F97316', '#FACC15'],
      secondary: ['#6366F1', '#14B8A6', '#EC4899', '#F59E0B', '#84CC16'],
      background: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(250, 204, 21, 0.8)'
      ]
    },
    opacity: {
      background: 0.8,
      border: 1,
    }
  },
  
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    critical: '#DC2626',
    healthy: '#10B981',
  },
  
  thresholds: {
    good: 80,
    warning: 60,
    critical: 40,
  },
  
  colors: {
    trinity: {
      blue: '#3B82F6',
      green: '#10B981',
      purple: '#A855F7',
    },
    
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    }
  }
};

export default theme;
