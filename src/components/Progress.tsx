import React from 'react';

interface ProgressProps {
  completed: number;
  total: number;
  percentage: number;
}

export const Progress: React.FC<ProgressProps> = ({ completed, total, percentage }) => {
  if (total === 0) {
    return (
      <div className="receipt-section receipt-progress-empty">
        <div className="receipt-divider-dotted">- - - - - - - - - - - - - - - -</div>
        <div className="receipt-label-center">NO TASKS YET</div>
        <div className="receipt-divider-dotted">- - - - - - - - - - - - - - - -</div>
      </div>
    );
  }

  // Generate 20-character block progress bar [██████████░░░░░░░░░░]
  const totalBlocks = 20;
  const filledBlocks = Math.round((percentage / 100) * totalBlocks);
  const emptyBlocks = Math.max(0, totalBlocks - filledBlocks);

  const blockString = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);

  if (percentage === 100) {
    return (
      <div className="receipt-section receipt-complete-banner">
        <div className="receipt-divider-double">================================</div>
        <div className="receipt-complete-title">★ RECEIPT COMPLETE ★</div>
        <div className="receipt-complete-sparkles">✨ ✨ ✨</div>
        <div className="receipt-complete-counter">{completed} / {total} TASKS</div>
        <div className="receipt-hope-tag">BUNNY HOPE: 100%</div>
        <div className="receipt-divider-double">================================</div>
      </div>
    );
  }

  return (
    <div className="receipt-section receipt-progress">
      <div className="receipt-divider-line">--------------------------------</div>
      <div className="receipt-progress-header">
        <span className="receipt-label">PROGRESS</span>
        <span className="receipt-counts">{completed} / {total}</span>
      </div>

      <div className="receipt-block-bar" aria-label={`Progress: ${percentage}%`}>
        [{blockString}]
      </div>

      <div className="receipt-hope-row">
        <span className="receipt-hope-label">BUNNY HOPE:</span>
        <span className="receipt-hope-value">{percentage}%</span>
      </div>
      <div className="receipt-divider-line">--------------------------------</div>
    </div>
  );
};
