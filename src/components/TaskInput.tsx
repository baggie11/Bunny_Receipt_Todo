import React, { useState, useRef } from 'react';
import { Plus } from 'lucide-react';

interface TaskInputProps {
  onAddTask: (text: string) => void;
  disabled?: boolean;
}

export const TaskInput: React.FC<TaskInputProps> = ({ onAddTask, disabled = false }) => {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (text.trim()) {
      onAddTask(text.trim());
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setText('');
      inputRef.current?.blur();
    }
  };

  return (
    <div className={`receipt-task-input-container ${isFocused ? 'focused' : ''}`}>
      <form onSubmit={handleSubmit} className="receipt-task-input-form">
        <span className="task-input-prefix">
          <Plus size={14} className="plus-icon" />
        </span>
        <input
          ref={inputRef}
          type="text"
          className="receipt-input-field"
          placeholder="add a task..."
          value={text}
          onChange={e => setText(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          maxLength={100}
        />
        {text.trim().length > 0 && (
          <button type="submit" className="receipt-submit-btn" title="Press Enter to add">
            ↵
          </button>
        )}
      </form>
    </div>
  );
};
