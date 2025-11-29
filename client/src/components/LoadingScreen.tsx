export function LoadingScreen() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-transparent">
      {/* Horizontal loading bar */}
      <div className="h-full overflow-hidden bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse">
        <div 
          className="h-full bg-gradient-to-r from-transparent via-primary to-transparent"
          style={{
            animation: 'slideInfinite 2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
            width: '40%'
          }}
        />
      </div>
      <style>{`
        @keyframes slideInfinite {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(calc(100vw - 40%));
          }
          100% {
            transform: translateX(100vw);
          }
        }
      `}</style>
    </div>
  );
}
