import { useMemo, useState } from 'react';
import { useStatsQuery } from '~/data-provider';
import { useLocalize } from '~/hooks';
import { Table, TableHeader, TableBody, TableRow, TableCell, Button } from '~/components/ui';
import { RefreshCcw, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

// Define possible sort fields
type SortField = 'model' | 'matches' | 'rating';

// Define sort direction
type SortDirection = 'asc' | 'desc';

const StatisticsPanel = () => {
  const localize = useLocalize();
  const { data: rawData, refetch, isRefetching } = useStatsQuery();

  // State for sorting
  const [sortField, setSortField] = useState<SortField>('rating');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Handle sort click
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Get sort icon for header
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="size-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" />;
  };

  // Sort the data whenever rawData, sortField, or sortDirection changes
  const sortedData = useMemo(() => {
    if (!rawData) return [];

    return [...rawData].sort((a, b) => {
      let compareResult = 0;

      // Compare based on field type
      if (sortField === 'model') {
        compareResult = a.model.localeCompare(b.model);
      } else {
        compareResult = a[sortField] - b[sortField];
      }

      // Reverse if descending
      return sortDirection === 'asc' ? compareResult : -compareResult;
    });
  }, [rawData, sortField, sortDirection]);

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="h-auto max-w-full overflow-x-hidden">
      <Button variant="outline" className="w-full gap-2 text-sm" onClick={handleRefresh}>
        <RefreshCcw className="size-4" />
        <div className="break-all">{isRefetching ? localize('com_ui_refreshing') : localize('com_ui_refresh')}</div>
      </Button>

      <Table className="table-fixed border-separate border-spacing-0">
        <TableHeader>
          <TableRow>
            <TableCell
              className="w-full bg-header-primary px-3 py-3.5 pl-6 cursor-pointer hover:bg-header-secondary"
              onClick={() => handleSort('model')}
            >
              <div className="flex items-center gap-2">
                {localize('com_ui_model_name')}
                {getSortIcon('model')}
              </div>
            </TableCell>
            <TableCell
              className="w-full bg-header-primary px-3 py-3.5 sm:pl-6 cursor-pointer hover:bg-header-secondary"
              onClick={() => handleSort('matches')}
            >
              <div className="flex items-center gap-2">
                {localize('com_ui_number_matches')}
                {getSortIcon('matches')}
              </div>
            </TableCell>
            <TableCell
              className="w-full bg-header-primary px-3 py-3.5 sm:pl-6 cursor-pointer hover:bg-header-secondary"
              onClick={() => handleSort('rating')}
            >
              <div className="flex items-center gap-2">
                {localize('com_ui_rating')}
                {getSortIcon('rating')}
              </div>
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData?.map((row: any) => (
            <TableRow key={row.model}>
              <TableCell className="w-full px-3 py-3.5 pl-6">
                <div>{row.model}</div>
              </TableCell>
              <TableCell className="w-full px-3 py-3.5 sm:pl-6">
                <div>{row.matches}</div>
              </TableCell>
              <TableCell className="w-full px-3 py-3.5 sm:pl-6">
                <div>{row.rating}</div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default StatisticsPanel;
