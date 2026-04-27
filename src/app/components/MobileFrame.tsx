import { ReactNode } from 'react';

interface MobileFrameProps {
  children: ReactNode;
  device?: 'iphone' | 'android';
}

export function MobileFrame({ children, device = 'iphone' }: MobileFrameProps) {
  const isIPhone = device === 'iphone';

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      {/* Phone Frame */}
      <div
        className={`relative ${
          isIPhone
            ? 'w-[375px] h-[812px] rounded-[50px] border-[14px] border-gray-800'
            : 'w-[360px] h-[780px] rounded-[32px] border-[12px] border-gray-800'
        } bg-black shadow-2xl overflow-hidden`}
      >
        {/* Notch / Camera Cutout */}
        {isIPhone ? (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[160px] h-[34px] bg-black rounded-b-[20px] z-50">
            <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[80px] h-[4px] bg-gray-700 rounded-full" />
          </div>
        ) : (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[80px] h-[4px] bg-gray-700 rounded-full z-50" />
        )}

        {/* Screen Content */}
        <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-[#f5f2e9] dark:bg-[#1a1a1a]">
          {children}
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[120px] h-[5px] bg-gray-600 rounded-full z-50" />
      </div>

      {/* Device Label */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-gray-500 text-sm">
        {isIPhone ? 'iPhone Preview' : 'Android Preview'} — Press ESC to exit
      </div>
    </div>
  );
}

