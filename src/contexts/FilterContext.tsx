import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { FilterState, DEFAULT_FILTER_STATE } from '../types/batch';

interface FilterContextValue {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
  /** Whether any non-default filter is active */
  hasActiveFilters: boolean;
  /** Future: live mode toggle for WebSocket real-time updates */
  isLive: boolean;
  setIsLive: (live: boolean) => void;
}

const FilterContext = createContext<FilterContextValue | undefined>(undefined);

interface FilterProviderProps {
  children: React.ReactNode;
  /** Optional initial filter state (e.g. from URL params) */
  initialFilters?: Partial<FilterState>;
}

/**
 * Provides global filter state and update helpers across the app.
 */
export const FilterProvider: React.FC<FilterProviderProps> = ({
  children,
  initialFilters,
}) => {
  const [filters, setFiltersState] = useState<FilterState>({
    ...DEFAULT_FILTER_STATE,
    ...initialFilters,
  });

  // Future real-time WebSocket toggle
  const [isLive, setIsLive] = useState(false);

  const setFilters = useCallback((newFilters: FilterState) => {
    setFiltersState(newFilters);
  }, []);

  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setFiltersState((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTER_STATE);
  }, []);

  const hasActiveFilters = useMemo(
    () =>
      filters.jobId !== DEFAULT_FILTER_STATE.jobId ||
      filters.date !== DEFAULT_FILTER_STATE.date ||
      filters.timeFrame !== DEFAULT_FILTER_STATE.timeFrame ||
      filters.status !== DEFAULT_FILTER_STATE.status,
    [filters],
  );

  const value = useMemo<FilterContextValue>(
    () => ({
      filters,
      setFilters,
      updateFilter,
      resetFilters,
      hasActiveFilters,
      isLive,
      setIsLive,
    }),
    [filters, setFilters, updateFilter, resetFilters, hasActiveFilters, isLive],
  );

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
};

/**
 * Custom hook to access filter context.
 * Must be used within a FilterProvider.
 */
export const useFilterContext = (): FilterContextValue => {
  const ctx = useContext(FilterContext);
  if (!ctx) {
    throw new Error('useFilterContext must be used within a FilterProvider');
  }
  return ctx;
};
