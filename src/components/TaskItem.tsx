import React, { useState, useRef, useEffect } from 'react';
import { Task } from '../utils/storage';
import { formatReceiptTime } from '../utils/dates';
import { Check, X, Edit2 } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
  isReadOnly?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onDelete,
  onEdit,
  isReadOnly = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editText.trim() && editText.trim() !== task.text) {
      onEdit(task.id, editText.trim());
    } else {
      setEditText(task.text);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditText(task.text);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`task-row ${task.completed ? 'task-completed' : ''} ${
        isEditing ? 'task-editing' : ''
      }`}
    >
      {/* Receipt Checkbox [ ] or [✓] */}
      <button
        type="button"
        className={`task-checkbox-btn ${task.completed ? 'checked' : ''}`}
        onClick={() => !isReadOnly && onToggle(task.id)}
        disabled={isReadOnly}
        aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
        title={task.completed ? "Mark incomplete" : "Mark complete"}
      >
        <span className="bracket-left">[</span>
        <span className="checkbox-icon">
          {task.completed ? <Check size={13} strokeWidth={3} /> : ' '}
        </span>
        <span className="bracket-right">]</span>
      </button>

      {/* Task text or Inline Editor */}
      <div className="task-content">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            className="task-edit-input"
            value={editText}
            onChange={e => setEditText(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            maxLength={100}
          />
        ) : (
          <div
            className="task-text-container"
            onDoubleClick={() => !isReadOnly && !task.completed && setIsEditing(true)}
            title={!isReadOnly && !task.completed ? "Double-click to edit" : undefined}
          >
            <span className="task-text">{task.text}</span>
            {task.created_at && (
              <span className="task-time">{formatReceiptTime(task.created_at)}</span>
            )}
          </div>
        )}
      </div>

      {/* Action buttons (Edit & Delete) */}
      {!isReadOnly && !isEditing && (
        <div className="task-actions">
          {!task.completed && (
            <button
              type="button"
              className="task-action-btn edit-btn"
              onClick={() => setIsEditing(true)}
              title="Edit task"
              aria-label="Edit task"
            >
              <Edit2 size={11} />
            </button>
          )}
          <button
            type="button"
            className="task-action-btn delete-btn"
            onClick={() => onDelete(task.id)}
            title="Delete task"
            aria-label="Delete task"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
};
