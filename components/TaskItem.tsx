'use client';

import { Task } from '@/lib/types';

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onDetail: () => void;
}

export default function TaskItem({ task, onToggle, onDetail }: TaskItemProps) {
  return (
    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
      <input
        type="checkbox"
        checked={task.done}
        onChange={() => onToggle(task.id)}
        className="mt-1 flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h4
          className={`text-gray-800 ${task.done ? 'task-completed' : ''}`}
        >
          {task.title}
        </h4>
        {task.subcategory && task.subcategory !== 'Allgemein' && (
          <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded mt-1">
            {task.subcategory}
          </span>
        )}
        {task.description && (
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {task.description}
          </p>
        )}
        {(task.link || task.image_url || task.notes) && (
          <div className="flex gap-2 mt-2 text-xs text-gray-500">
            {task.link && <span>🔗</span>}
            {task.image_url && <span>📷</span>}
            {task.notes && <span>📝</span>}
          </div>
        )}
      </div>
      <button
        onClick={onDetail}
        className="flex-shrink-0 text-blue-600 hover:text-blue-800 text-2xl px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors"
        aria-label="Details anzeigen"
      >
        ℹ️
      </button>
    </div>
  );
}

