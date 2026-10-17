import React, { useState } from 'react';
import { DailyReceiptRecord } from '../utils/storage';
import { TaskItem } from './TaskItem';
import { formatShortDate } from '../utils/dates';

interface HistoryViewProps {
  history: Record<string, DailyReceiptRecord>;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const sortedDays = Object.values(history).sort(
    (a, b) => b.archivedAt - a.archivedAt
  );

  // ---- Detail view ----
  if (selectedDate) {
    const record = history[selectedDate];
    if (!record) {
      setSelectedDate(null);
      return null;
    }

    const completedTasks = record.tasks.filter(t => t.completed);
    const pendingTasks = record.tasks.filter(t => !t.completed);
    const pct = record.totalCount > 0
      ? Math.round((record.completedCount / record.totalCount) * 100)
      : 0;

    return (
      <div className="history-detail">
        <div className="history-detail-header">
          <button
            className="history-back-btn"
            onClick={() => setSelectedDate(null)}
            aria-label="Back to history list"
          >
            ← back
          </button>
          <span className="history-detail-title">{formatShortDate(selectedDate)}</span>
          <span className="history-detail-pct">{pct}%</span>
        </div>

        <div className="history-detail-tasks">
          <div className="history-detail-divider">- - - - - - - - - - - - - - - -</div>

          {completedTasks.length > 0 && (
            <>
              <div className="receipt-label-center" style={{ marginBottom: 4 }}>COMPLETED</div>
              {completedTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={() => {}}
                  onDelete={() => {}}
                  onEdit={() => {}}
                  isReadOnly
                />
              ))}
            </>
          )}

          {pendingTasks.length > 0 && (
            <>
              <div
                className="receipt-label-center"
                style={{ marginTop: completedTasks.length > 0 ? 8 : 0, marginBottom: 4 }}
              >
                NOT COMPLETED
              </div>
              {pendingTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={() => {}}
                  onDelete={() => {}}
                  onEdit={() => {}}
                  isReadOnly
                />
              ))}
            </>
          )}

          <div className="history-detail-divider" style={{ marginTop: 8 }}>
            - - - - - - - - - - - - - - - -
          </div>

          <div className="history-detail-summary">
            <div className="history-detail-summary-text">
              {record.completedCount} / {record.totalCount} TASKS &nbsp;·&nbsp; {pct}% COMPLETE
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- List view ----
  return (
    <div className="history-view">
      <div className="history-header">
        <div className="history-title">Past Receipts</div>
        <div className="history-subtitle">
          {sortedDays.length > 0
            ? `${sortedDays.length} day${sortedDays.length !== 1 ? 's' : ''} recorded`
            : 'no history yet'}
        </div>
      </div>

      {sortedDays.length === 0 ? (
        <div className="history-empty">
          <div className="history-empty-icon">🐰</div>
          <div className="history-empty-text">
            No past receipts yet.{'\n'}Complete a day to see it here.
          </div>
        </div>
      ) : (
        <div className="history-day-list">
          {sortedDays.map(record => {
            const pct = record.totalCount > 0
              ? Math.round((record.completedCount / record.totalCount) * 100)
              : 0;
            const filledBlocks = Math.round((pct / 100) * 10);
            const bar = '█'.repeat(filledBlocks) + '░'.repeat(10 - filledBlocks);

            return (
              <button
                key={record.date}
                className="history-day-btn"
                onClick={() => setSelectedDate(record.date)}
              >
                <div className="history-day-left">
                  <span className="history-day-date">{formatShortDate(record.date)}</span>
                  <span className="history-day-stats">
                    {record.completedCount}/{record.totalCount} tasks
                  </span>
                </div>
                <span className="history-day-bar">[{bar}]</span>
                <span className="history-day-pct">{pct}%</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
