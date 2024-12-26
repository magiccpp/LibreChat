import { useRef, useState } from 'react';

import { useExportDataQuery } from '~/data-provider';
import { useLocalize } from '~/hooks';

import { Spinner } from '~/components/svg';
import { Upload } from 'lucide-react';
import { saveAs } from 'file-saver';

// Define the available formats using an object pattern for better type-safety
const exportFormats = {
  OPENAI_JSONL: 'OpenAI jsonl',
  SHAREGPT_JSON: 'ShareGPT json',
};

function ExportConversations() {
  const localize = useLocalize();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [allowExport, setAllowExport] = useState(true);
  const [selectedFormat, setSelectedFormat] = useState(exportFormats.OPENAI_JSONL);

  // This fetches data based on the selected format
  const { refetch } = useExportDataQuery();

  const handleExportClick = () => {
    // Toggle the dropdown menu
    setDropdownOpen(!dropdownOpen);
  };

  const handleFormatSelect = async (format) => {
    setSelectedFormat(format);
    setDropdownOpen(false);  // Close the dropdown after selection
    setAllowExport(false);   // Disable the export button

    try {
      const result = await refetch();

      if (!result.data) {
        console.error('No export data available');
        return;
      }

      let content, contentType, filename;
      if (format === exportFormats.OPENAI_JSONL) {
        content = result.data.map(item => JSON.stringify(item)).join('\n');
        contentType = 'application/jsonl';
        filename = 'conversations.jsonl';
      } else if (format === exportFormats.SHAREGPT_JSON) {
        content = JSON.stringify(result.data, null, 2);
        contentType = 'application/json';
        filename = 'conversations.json';
      }

      if (content) {
        const blob = new Blob([content], { type: contentType });
        saveAs(blob, filename);
      }

    } catch (error) {
      console.error('Error exporting conversations:', error);
    } finally {
      setAllowExport(true); // Re-enable the export button
    }
  };

  return (
    <div className="relative flex items-center justify-between">
      <div>{localize('com_ui_export_conversation_info')}</div>
      <div className="relative">
        <button
          onClick={handleExportClick}
          disabled={!allowExport}
          aria-label={localize('com_ui_export_conversation')}
          className="btn btn-neutral"
        >
          {allowExport ? (
            <Upload className="mr-1 flex h-4 w-4 items-center stroke-1" />
          ) : (
            <Spinner className="mr-1 w-4" />
          )}
          <span>{localize('com_ui_export_conversation')}</span>
        </button>
        {dropdownOpen && (
          <div
            className="absolute right-0 bg-white border rounded mt-2 shadow-lg z-50"
            style={{ minWidth: '200px' }} // Ensure this width accommodates your longest text without wrapping
          >
            <ul>
              {Object.values(exportFormats).map((format) => (
                <li key={format}>
                  <button
                    onClick={() => handleFormatSelect(format)}
                    className="block w-full px-4 py-2 hover:bg-gray-200 text-left"
                  >
                    {format}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
export default ExportConversations;