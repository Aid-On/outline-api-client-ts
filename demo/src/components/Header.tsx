import React from 'react';

interface HeaderProps {
  onReset: () => void;
  showReset: boolean;
}

export default function Header({ onReset, showReset }: HeaderProps) {
  return (
    <header>
      <h1>📄 Outline API Client Demo</h1>
      {showReset && (
        <button className="reset-btn" onClick={onReset}>
          Reset Configuration
        </button>
      )}
    </header>
  );
}