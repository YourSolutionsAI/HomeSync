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
      className="flex items-start gap-4 p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer transform hover:scale-[1.01]"
      onClick={onDetail}
    >
      <div onClick={handleCheckboxClick} className="pt-0.5">
        <input
          type="checkbox"
          checked={task.done}
          onChange={() => onToggle(task.id)}
          className="w-6 h-6 flex-shrink-0 cursor-pointer accent-blue-600"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4
          className={`text-lg font-semibold text-gray-900 ${task.done ? 'task-completed' : ''}`}
        >
          {task.title}
        </h4>
        {task.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
        {(task.link || task.image_url || task.notes) && (
          <div className="flex gap-3 mt-3 text-sm">
            {task.link && <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-medium">🔗 Link</span>}
            {task.image_url && <span className="flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded-lg font-medium">📷 Foto</span>}
            {task.notes && <span className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-lg font-medium">📝 Notizen</span>}
          </div>
        )}
      </div>
    </div>
  );
}

