import { useState } from 'react';
import { useStatsQuery } from '~/data-provider';
import { useLocalize } from '~/hooks';
import { Table, TableHeader, TableBody, TableRow, TableCell, Input, Button } from '~/components/ui';
import { RefreshCcw } from 'lucide-react';



const StatisticsPanel = () => {
  const localize = useLocalize();
  const { data, refetch, isRefetching} = useStatsQuery();
  console.log(data);

  // Handler for the refresh button
  const handleRefresh = () => {
    refetch(); // This method is provided by useQuery
  };


  // simply visualize the data
  return (
    <div className="h-auto max-w-full overflow-x-hidden">

        <Button variant="outline" className="w-full gap-2 text-sm" onClick={handleRefresh}>
          <RefreshCcw className="size-4" />
          <div className="break-all">{isRefetching ? localize('com_ui_refreshing') : localize('com_ui_refresh')}</div>
        </Button>


        <Table className="table-fixed border-separate border-spacing-0">
          <TableHeader>
            <TableRow>
              <TableCell className="w-full bg-header-primary px-3 py-3.5 pl-6">
                <div>{localize('com_ui_model_name')}</div>
              </TableCell>
              <TableCell className="w-full bg-header-primary px-3 py-3.5 sm:pl-6">
                <div>{localize('com_ui_number_matches')}</div>
              </TableCell>
              <TableCell className="w-full bg-header-primary px-3 py-3.5 sm:pl-6">
                <div>{localize('com_ui_rating')}</div>
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((row: any) => (
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
