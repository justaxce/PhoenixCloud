export function LoadingScreen() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="h-1 overflow-hidden bg-gradient-to-r from-transparent via-primary to-transparent">
        <div 
          className="h-full bg-gradient-to-r from-transparent via-primary to-transparent"
          style={{
            animation: 'slideInfinite 2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
            width: '40%'
          }}
        />
      </div>
      
      {/* Text with animated dots */}
      <div className="flex items-center justify-center py-4">
        <span className="text-sm font-semibold text-foreground tracking-wide">
          PHEONIX CLOUD
          <span style={{
            display: 'inline-block',
            marginLeft: '0.4em',
          }}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  width: '0.25em',
                  animation: `blink 1.4s infinite`,
                  animationDelay: `${i * 0.2}s`,
                  marginRight: '0.15em'
                }}
              >
                .
              </span>
            ))}
          </span>
        </span>
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
        
        @keyframes blink {
          0%, 60%, 100% {
            opacity: 0.3;
          }
          30% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
