import React from 'react';

const WebGLFallback: React.FC = () => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#050816',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        zIndex: 10,
      }}
    >
      {/* Background blur circles */}
      <div
        style={{
          position: 'absolute',
          width: '50vw',
          height: '50vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, rgba(5,8,22,0) 70%)',
          animation: 'pulse 6s infinite ease-in-out alternate',
          top: '-10%',
          left: '-10%',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '40vw',
          height: '40vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, rgba(5,8,22,0) 70%)',
          animation: 'pulse 8s infinite ease-in-out alternate-reverse',
          bottom: '5%',
          right: '-5%',
        }}
      />

      <h1
        style={{
          fontSize: 'clamp(3rem, 10vw, 8rem)',
          fontWeight: 'bold',
          background: 'linear-gradient(90deg, #00d4ff, #7c3aed)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '0.1em',
          margin: 0,
          zIndex: 1,
        }}
      >
        HARITECH
      </h1>

      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.6; }
            100% { transform: scale(1.2); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default WebGLFallback;
