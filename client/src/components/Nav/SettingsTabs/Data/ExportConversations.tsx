import { useState, useRef } from 'react';
import type { TError } from 'librechat-data-provider';
import { useExportDataQuery } from '~/data-provider';
import { useLocalize, useConversations } from '~/hooks';
import { saveAs } from 'file-saver';
import { Spinner } from '~/components/svg';
import { cn } from '~/utils';
import { Upload } from 'lucide-react';
import { createLucideIcon } from 'lucide-react';

const ExportIcon = createLucideIcon('Export', [
  ['path', { d: 'M12 5v10' }],

  ['path', { d: 'm16 10-4-4-4 4' }],
  ['path', { d: 'M8 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4' }]
]);

enum ExportFormat {
  OPENAI_JSONL = 'OpenAI jsonl'
}

function ExportConversations() {
  const localize = useLocalize();
  const { data, error, isLoading, refetch } = useExportDataQuery();

  const [allowImport, setAllowImport] = useState(true);

  const handleExportClick = async () => {
    try {
      // Fetch the export data
      const result = await refetch();

      // Check if data exists
      if (!result.data) {
        console.error('No export data available');
        return;
      }

      // Convert data to JSONL format
      const jsonlContent = result.data.map(item => JSON.stringify(item)).join('\n');
      const blob = new Blob([jsonlContent], { type: 'application/jsonl' });
      const filename = 'conversations.jsonl';

      saveAs(blob, filename);
    } catch (error) {
      // Handle any errors
      console.error('Error exporting conversations:', error);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div>{localize('com_ui_export_conversation_info')}</div>
      <button
        onClick={handleExportClick}
        disabled={!allowImport}
        aria-label={localize('com_ui_export_conversation')}
        className="btn btn-neutral"
      >
        {allowImport ? (
          <Upload className="mr-1 flex h-4 w-4 items-center stroke-1" />
        ) : (
          <Spinner className="mr-1 w-4" />
        )}
        <span>{localize('com_ui_export_conversation')}</span>
      </button>
    </div>
  );
}

export default ExportConversations;