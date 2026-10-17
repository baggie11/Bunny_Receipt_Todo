import React from 'react';
import { BunnyMood } from '../utils/bunnyState';

interface BunnyProps {
  mood: BunnyMood;
  isBlinking: boolean;
  isEarWiggling: boolean;
  isBouncing: boolean;
  isCelebrating: boolean;
  text: string;
  subtext?: string;
  hasSpecialEasterEgg?: 'birthday' | 'early' | 'empty';
  onPoke?: () => void;
}

export const Bunny: React.FC<BunnyProps> = ({
  mood,
  isBlinking,
  isEarWiggling,
  isBouncing,
  isCelebrating,
  text,
  subtext,
  hasSpecialEasterEgg,
  onPoke,
}) => {
  // Render ears based on mood and animation
  const renderEars = () => {
    const wiggleLeft = isEarWiggling ? -10 : 0;
    const wiggleRight = isEarWiggling ? 10 : 0;

    switch (mood) {
      case 'tired':
        // Droopy ears
        return (
          <g className="bunny-ears-droopy">
            {/* Left ear drooped left */}
            <path
              d="M 36 34 C 26 24 16 34 22 46 C 26 52 34 46 38 40 Z"
              fill="#ffffff"
              stroke="#262320"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M 33 36 C 27 28 20 36 24 44"
              fill="none"
              stroke="#f7b5b5"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Right ear drooped right */}
            <path
              d="M 64 34 C 74 24 84 34 78 46 C 74 52 66 46 62 40 Z"
              fill="#ffffff"
              stroke="#262320"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M 67 36 C 73 28 80 36 76 44"
              fill="none"
              stroke="#f7b5b5"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        );

      case 'celebration':
        // High perky ears + party hat if birthday
        return (
          <g className="bunny-ears-celebration">
            {/* Left ear raised */}
            <path
              d={`M 36 36 C 30 14 36 2 44 4 C 49 6 47 18 43 36 Z`}
              transform={`rotate(${wiggleLeft - 6} 40 36)`}
              fill="#ffffff"
              stroke="#262320"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M 39 30 C 36 18 39 10 43 8"
              transform={`rotate(${wiggleLeft - 6} 40 36)`}
              fill="none"
              stroke="#f7a8a8"
              strokeWidth="2.2"
              strokeLinecap="round"
            />

            {/* Right ear raised */}
            <path
              d={`M 57 36 C 53 18 51 6 56 4 C 64 2 70 14 64 36 Z`}
              transform={`rotate(${wiggleRight + 6} 60 36)`}
              fill="#ffffff"
              stroke="#262320"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M 57 8 C 61 10 64 18 61 30"
              transform={`rotate(${wiggleRight + 6} 60 36)`}
              fill="none"
              stroke="#f7a8a8"
              strokeWidth="2.2"
              strokeLinecap="round"
            />

            {/* Optional Birthday Party Cone */}
            {hasSpecialEasterEgg === 'birthday' && (
              <g className="party-hat">
                <polygon
                  points="50,6 40,24 60,24"
                  fill="#ffc83b"
                  stroke="#262320"
                  strokeWidth="2"
                />
                <circle cx="50" cy="5" r="3" fill="#ff6b6b" />
                <line x1="42" y1="18" x2="58" y2="18" stroke="#ff6b6b" strokeWidth="1.5" />
                <line x1="45" y1="12" x2="55" y2="12" stroke="#4ecdc4" strokeWidth="1.5" />
              </g>
            )}
          </g>
        );

      default:
        // Standard perky ears with dynamic wiggle
        return (
          <g className="bunny-ears-standard">
            {/* Left ear */}
            <path
              d="M 37 36 C 30 18 33 6 41 8 C 47 10 45 22 43 36 Z"
              transform={`rotate(${wiggleLeft} 40 36)`}
              fill="#ffffff"
              stroke="#262320"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M 39 30 C 36 20 37 12 40 12"
              transform={`rotate(${wiggleLeft} 40 36)`}
              fill="none"
              stroke="#f7b5b5"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Right ear */}
            <path
              d="M 57 36 C 55 22 53 10 59 8 C 67 6 70 18 63 36 Z"
              transform={`rotate(${wiggleRight} 60 36)`}
              fill="#ffffff"
              stroke="#262320"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M 60 12 C 63 12 64 20 61 30"
              transform={`rotate(${wiggleRight} 60 36)`}
              fill="none"
              stroke="#f7b5b5"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        );
    }
  };

  // Render eyes based on mood and blinking state
  const renderEyes = () => {
    if (isBlinking && mood !== 'celebration' && mood !== 'happy') {
      return (
        <g className="bunny-eyes-blinking">
          <line x1="38" y1="46" x2="44" y2="46" stroke="#262320" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="56" y1="46" x2="62" y2="46" stroke="#262320" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      );
    }

    switch (mood) {
      case 'tired':
        // Sleepy droopy eyes
        return (
          <g className="bunny-eyes-tired">
            {/* Left eye droopy */}
            <path d="M 37 46 Q 41 43 45 47" fill="none" stroke="#262320" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="41" cy="47.5" r="1.2" fill="#262320" />
            {/* Right eye droopy */}
            <path d="M 55 47 Q 59 43 63 46" fill="none" stroke="#262320" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="59" cy="47.5" r="1.2" fill="#262320" />
          </g>
        );

      case 'happy':
        // Inverted arc smiling eyes ^ ^
        return (
          <g className="bunny-eyes-happy">
            <path d="M 37 47 Q 41 42 45 47" fill="none" stroke="#262320" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 55 47 Q 59 42 63 47" fill="none" stroke="#262320" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        );

      case 'excited':
        // Large round shiny eyes with double white gleam
        return (
          <g className="bunny-eyes-excited">
            <ellipse cx="41" cy="45" rx="3.5" ry="4" fill="#262320" />
            <circle cx="40" cy="43.5" r="1.4" fill="#ffffff" />
            <circle cx="42.5" cy="46.5" r="0.7" fill="#ffffff" />

            <ellipse cx="59" cy="45" rx="3.5" ry="4" fill="#262320" />
            <circle cx="58" cy="43.5" r="1.4" fill="#ffffff" />
            <circle cx="60.5" cy="46.5" r="0.7" fill="#ffffff" />
          </g>
        );

      case 'ecstatic':
        // Star sparkle eyes!
        return (
          <g className="bunny-eyes-ecstatic">
            <path d="M 41 41 L 42 44 L 45 45 L 42 46 L 41 49 L 40 46 L 37 45 L 40 44 Z" fill="#262320" />
            <path d="M 59 41 L 60 44 L 63 45 L 60 46 L 59 49 L 58 46 L 55 45 L 58 44 Z" fill="#262320" />
          </g>
        );

      case 'celebration':
        // Super joyful curved eyes with starry lashes
        return (
          <g className="bunny-eyes-celebration">
            <path d="M 36 47 Q 41 40 46 47" fill="none" stroke="#262320" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M 54 47 Q 59 40 64 47" fill="none" stroke="#262320" strokeWidth="2.8" strokeLinecap="round" />
            {/* Sparkles around eyes */}
            <circle cx="34" cy="42" r="1" fill="#ffb703" />
            <circle cx="66" cy="42" r="1" fill="#ffb703" />
          </g>
        );

      case 'hopeful':
        // Shiny round curious eyes looking up
        return (
          <g className="bunny-eyes-hopeful">
            <ellipse cx="41" cy="45" rx="3.2" ry="3.8" fill="#262320" />
            <circle cx="39.8" cy="43.5" r="1.4" fill="#ffffff" />

            <ellipse cx="59" cy="45" rx="3.2" ry="3.8" fill="#262320" />
            <circle cx="57.8" cy="43.5" r="1.4" fill="#ffffff" />
          </g>
        );

      case 'empty':
      default:
        // Normal curious round eyes
        return (
          <g className="bunny-eyes-normal">
            <ellipse cx="41" cy="46" rx="2.8" ry="3.2" fill="#262320" />
            <circle cx="40" cy="44.8" r="1" fill="#ffffff" />

            <ellipse cx="59" cy="46" rx="2.8" ry="3.2" fill="#262320" />
            <circle cx="58" cy="44.8" r="1" fill="#ffffff" />
          </g>
        );
    }
  };

  // Render mouth based on mood
  const renderMouth = () => {
    switch (mood) {
      case 'tired':
        return (
          <path
            d="M 47 54 Q 50 51 53 54"
            fill="none"
            stroke="#262320"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        );
      case 'happy':
      case 'hopeful':
        return (
          <path
            d="M 47 52 Q 50 55 53 52"
            fill="none"
            stroke="#262320"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        );
      case 'excited':
      case 'ecstatic':
      case 'celebration':
        // Open cheering mouth :D
        return (
          <g>
            <path
              d="M 47 51 Q 50 56 53 51 Z"
              fill="#e76f51"
              stroke="#262320"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path d="M 48 53 Q 50 54 52 53" fill="none" stroke="#f4a261" strokeWidth="1" />
          </g>
        );
      case 'empty':
      default:
        return (
          <path
            d="M 48 52 Q 50 54 52 52"
            fill="none"
            stroke="#262320"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        );
    }
  };

  return (
    <div
      className={`bunny-container ${isBouncing ? 'bunny-bounce' : ''} ${
        isCelebrating ? 'bunny-celebrating' : ''
      }`}
      onClick={onPoke}
      title="Click your bunny!"
    >
      <div className="bunny-svg-wrapper">
        <svg
          viewBox="0 0 100 80"
          className="bunny-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Ears */}
          {renderEars()}

          {/* Bunny Head & Body */}
          <g className="bunny-body">
            {/* Main Head Base */}
            <path
              d="M 32 40 C 26 50 26 62 34 68 C 40 73 60 73 66 68 C 74 62 74 50 68 40 C 62 33 38 33 32 40 Z"
              fill="#ffffff"
              stroke="#262320"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Rosy Cheeks */}
            <ellipse
              cx="34"
              cy="52"
              rx="4.5"
              ry="2.8"
              fill="#ffb3ba"
              opacity={mood === 'empty' ? '0.35' : mood === 'tired' ? '0.2' : '0.75'}
            />
            <ellipse
              cx="66"
              cy="52"
              rx="4.5"
              ry="2.8"
              fill="#ffb3ba"
              opacity={mood === 'empty' ? '0.35' : mood === 'tired' ? '0.2' : '0.75'}
            />

            {/* Whiskers */}
            <line x1="24" y1="50" x2="30" y2="51" stroke="#262320" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="23" y1="54" x2="30" y2="53" stroke="#262320" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="70" y1="51" x2="76" y2="50" stroke="#262320" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="70" y1="53" x2="77" y2="54" stroke="#262320" strokeWidth="1.4" strokeLinecap="round" />

            {/* Nose */}
            <polygon points="48,49 52,49 50,51" fill="#f4a261" />

            {/* Eyes */}
            {renderEyes()}

            {/* Mouth */}
            {renderMouth()}

            {/* Paws */}
            {mood === 'celebration' ? (
              // Raised paws in air
              <g className="bunny-paws-raised">
                <ellipse cx="26" cy="40" rx="3.5" ry="3.5" fill="#ffffff" stroke="#262320" strokeWidth="2" />
                <ellipse cx="74" cy="40" rx="3.5" ry="3.5" fill="#ffffff" stroke="#262320" strokeWidth="2" />
              </g>
            ) : (
              // Front cute paws resting
              <g className="bunny-paws-resting">
                <ellipse cx="44" cy="68" rx="3.5" ry="3" fill="#ffffff" stroke="#262320" strokeWidth="2" />
                <ellipse cx="56" cy="68" rx="3.5" ry="3" fill="#ffffff" stroke="#262320" strokeWidth="2" />
              </g>
            )}

            {/* Sweat droplet for tired */}
            {mood === 'tired' && (
              <path
                d="M 69 41 C 69 41 72 44 72 46 C 72 47.5 70.5 48.5 69 48.5 C 67.5 48.5 66 47.5 66 46 C 66 44 69 41 69 41 Z"
                fill="#8ecae6"
              />
            )}
          </g>
        </svg>
      </div>

      {/* Quote / Speech Bubble */}
      <div className="bunny-speech-bubble">
        <div className="bunny-quote-text">"{text}"</div>
        {subtext && <div className="bunny-subtext">{subtext}</div>}
      </div>
    </div>
  );
};
