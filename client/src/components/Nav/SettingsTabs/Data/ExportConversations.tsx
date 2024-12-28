// ExportConversations.jsx
import { useState } from 'react';
import { useExportDataQuery } from '~/data-provider';
import { useLocalize } from '~/hooks';
import { Spinner } from '~/components/svg';
import { Upload } from 'lucide-react';
import ExportModal from './ExportModal';

function ExportConversations() {
  const localize = useLocalize();
  const [showModal, setShowModal] = useState(false);
  const [allowExport, setAllowExport] = useState(true);
  const { refetch } = useExportDataQuery();

  const handleExportClick = async () => {
    setAllowExport(false);
    try {
      const result = await refetch();
      if (!result.data) {
        console.error('No export data available');
        return;
      }
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching export data:', error);
    } finally {
      setAllowExport(true);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
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
      </div>
      {showModal && <ExportModal onClose={handleModalClose} />}
    </div>
  );
}

export default ExportConversations;