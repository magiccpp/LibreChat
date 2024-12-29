// ExportModal.jsx
import { useState, useMemo, useEffect } from 'react';
import { saveAs } from 'file-saver';
import { useExportDataQuery } from '~/data-provider';
import { Spinner } from '~/components/svg';
import { TooltipAnchor } from '~/components/ui';
import { FileQuestion } from 'lucide-react'
import { TExportDataResponse } from 'librechat-data-provider/dist/types';
import { ChangeEvent } from 'react';



const EXPORT_FORMATS = {
  OPENAI_JSONL: 'OpenAI jsonl',
  SHAREGPT_JSON: 'ShareGPT json',
};

const ExportModal = ({ onClose }) => {
  const [selectedFormat, setSelectedFormat] = useState('');
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [exportData, setExportData] = useState<TExportDataResponse|null>(null);
  const { refetch } = useExportDataQuery();

  // Fetch data when modal opens
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await refetch();
        if (result.data) {
          setExportData(result.data);
        } else {
          console.error('No export data available');
        }
      } catch (error) {
        console.error('Error fetching export data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [refetch]);

  const availableModels: { model: string; count: number }[] = useMemo(() => {
    if (!exportData) return [];
  
    const modelCounts: Record<string, number> = {};
  
    exportData.forEach((conversation) => {
      if (Array.isArray(conversation.messages)) {
        const modelsInConversation = new Set<string>();
  
        conversation.messages.forEach((message) => {
          if (message.model) {
            modelsInConversation.add(message.model);
          }
        });
  
        modelsInConversation.forEach((model) => {
          modelCounts[model] = (modelCounts[model] || 0) + 1;
        });
      } else {
        console.warn('conversation.messages is not an array:', conversation);
      }
    });
  
    return Object.entries(modelCounts)
      .map(([model, count]) => ({ model, count }))
      .sort((a, b) => b.count - a.count || a.model.localeCompare(b.model));
  }, [exportData]);

  // Explicitly type the event parameter
  const handleModelChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) return;
    
    if (!selectedModels.includes(value)) {
      setSelectedModels([...selectedModels, value]);
    }
  };

  const removeModel = (modelToRemove) => {
    setSelectedModels(selectedModels.filter(model => model !== modelToRemove));
  };

  const handleExport = () => {
    if (!selectedFormat || selectedModels.length === 0 || !exportData) {
      alert('Please select both a format and at least one model');
      return;
    }

    // Filter conversations based on selected models
    const filteredData = exportData.filter(conversation => {
      return conversation.messages?.some(message => 
        message.model && selectedModels.includes(message.model)
      );
    });

    let content, contentType, filename;
    if (selectedFormat === EXPORT_FORMATS.OPENAI_JSONL) {
      content = filteredData.map(item => JSON.stringify(item)).join('\n');
      contentType = 'application/jsonl';
      filename = 'conversations.jsonl';
    } else {
      content = JSON.stringify(filteredData, null, 2);
      contentType = 'application/json';
      filename = 'conversations.json';
    }

    const blob = new Blob([content], { type: contentType });
    saveAs(blob, filename);
    onClose();
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 flex items-center">
          <Spinner className="w-6 h-6 mr-2" />
          <span>Loading conversations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Export Conversations</h2>
        
        {/* Format Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Export Format
          </label>
          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select a format</option>
            {Object.entries(EXPORT_FORMATS).map(([key, value]) => (
              <option key={key} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        {/* Model Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 flex items-center">
            <span>Select Models</span>
            <TooltipAnchor
              description="Conversations to be exported must contain at least one answer from these selected models"
              side="top"
              className="ml-1" // or you could use "ml-2" for more space
            >
              <FileQuestion className="h-4 w-4 text-gray-500" />
            </TooltipAnchor>
          </label>
          <select
            onChange={handleModelChange}
            className="w-full p-2 border rounded-md"
            value=""
          >
            <option value="">Add a model</option>
            {availableModels.map(({ model, count }) => (
            <option
              key={model}
              value={model}
              title={`${model} participated in ${count} conversations`}
            >
              {model} ({count})
            </option>
          ))}
          </select>

          {/* Selected Models Display */}
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedModels.map((model) => (
              <div 
                key={model}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md flex items-center gap-1"
              >
                <span>{model}</span>
                <button
                  onClick={() => removeModel(model)}
                  className="text-blue-600 hover:text-blue-800 font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
            disabled={!selectedFormat || selectedModels.length === 0}
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;