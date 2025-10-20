'use client';

import { Task } from '@/lib/types';

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onDetail: () => void;
}

export default function TaskItem({ task, onToggle, onDetail }: TaskItemProps) {
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Verhindert, dass das Detail-Modal aufgeht
  };

  return (
    <div 
      className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
      onClick={onDetail}
    >
      <div onClick={handleCheckboxClick} className="pt-0.5">
        <input
          type="checkbox"
          checked={task.done}
          onChange={() => onToggle(task.id)}
          className="w-5 h-5 flex-shrink-0 cursor-pointer accent-blue-600"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4
          className={`text-base font-medium text-gray-900 ${task.done ? 'task-completed' : ''}`}
        >
          {task.title}
        </h4>
        {task.description && (
          <p className="text-sm text-gray-600 mt-1.5 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
        {(task.link || task.image_url || task.notes) && (
          <div className="flex gap-3 mt-2.5 text-sm text-gray-500">
            {task.link && <span className="flex items-center gap-1">🔗 Link</span>}
            {task.image_url && <span className="flex items-center gap-1">📷 Foto</span>}
            {task.notes && <span className="flex items-center gap-1">📝 Notizen</span>}
          </div>
        )}
      </div>
    </div>
  );
}

