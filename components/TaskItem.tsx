'use client';

import { Task } from '@/lib/types';
import Tooltip from './Tooltip';

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onDetail: () => void;
}

export default function TaskItem({ task, onToggle, onDetail }: TaskItemProps) {
  const handleDetailClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Verhindert, dass der Task-Status umgeschaltet wird
    onDetail();
  };

  return (
    <div 
      className={`flex items-start gap-2 sm:gap-3 md:gap-4 p-3 sm:p-3.5 md:p-4 bg-white rounded-lg sm:rounded-xl border-2 transition-all cursor-pointer transform hover:scale-[1.01] active:scale-[0.99] ${
        task.done 
          ? 'border-green-300 bg-green-50' 
          : 'border-gray-200 hover:border-blue-400 hover:shadow-lg'
      }`}
      onClick={() => onToggle(task.id)}
    >
      {/* Visueller Indikator statt Checkbox */}
      <div className="flex-shrink-0 pt-0.5 sm:pt-1">
        <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-all ${
          task.done ? 'bg-green-500' : 'bg-gray-200 border-2 border-gray-300'
        }`}>
          {task.done && (
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h4
          className={`text-sm sm:text-base md:text-lg font-semibold text-gray-900 ${task.done ? 'line-through text-gray-500' : ''}`}
        >
          {task.title}
        </h4>
        {task.description && (
          <p className={`text-xs sm:text-sm text-gray-600 mt-1 sm:mt-1.5 md:mt-2 line-clamp-2 leading-relaxed ${task.done ? 'text-gray-400' : ''}`}>
            {task.description}
          </p>
        )}
        {(task.link || task.image_url || task.notes) && (
          <div className="flex gap-1.5 sm:gap-2 md:gap-3 mt-2 sm:mt-2.5 md:mt-3 text-xs sm:text-sm flex-wrap">
            {task.link && <span className="flex items-center gap-0.5 sm:gap-1 bg-blue-50 text-blue-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg font-medium">🔗 Link</span>}
            {task.image_url && <span className="flex items-center gap-0.5 sm:gap-1 bg-purple-50 text-purple-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg font-medium">📷 Foto</span>}
            {task.notes && <span className="flex items-center gap-0.5 sm:gap-1 bg-gray-100 text-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg font-medium">📝 Notizen</span>}
          </div>
        )}
      </div>

      {/* Detail Button */}
      <Tooltip text="Details anzeigen, Notizen und Bilder bearbeiten" position="left">
        <button 
          onClick={handleDetailClick}
          className="flex-shrink-0 p-1.5 sm:p-2 rounded-full hover:bg-gray-200 active:bg-gray-300 transition-colors"
          aria-label="Task-Details anzeigen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </Tooltip>
    </div>
  );
}

