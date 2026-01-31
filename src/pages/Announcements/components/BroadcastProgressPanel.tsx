import React from 'react';
import {
    Clock,
    Play,
    Pause,
    Plus,
    Minus
} from 'lucide-react';

interface BroadcastProgressPanelProps {
    isSending: boolean;
    isPaused: boolean;
    sendProgress: {
        sent: number;
        failed: number;
        current: string;
        total: number;
    };
    currentDelayMs: number;
    onTogglePause: () => void;
    onSetDelay: (ms: number) => void;
}

export const BroadcastProgressPanel: React.FC<BroadcastProgressPanelProps> = ({
    isSending,
    isPaused,
    sendProgress,
    currentDelayMs,
    onTogglePause,
    onSetDelay,
}) => {
    const totalProcessed = sendProgress.sent + sendProgress.failed;
    const remaining = Math.max(0, sendProgress.total - totalProcessed);
    const remainingSeconds = Math.floor((remaining * currentDelayMs) / 1000);
    const remainingMinutes = Math.floor(remainingSeconds / 60);
    const displaySeconds = remainingSeconds % 60;

    const progressPercentage = sendProgress.total > 0 ? Math.round((totalProcessed / sendProgress.total) * 100) : 0;
    const successPercentage = sendProgress.total > 0 ? (sendProgress.sent / sendProgress.total) * 100 : 0;
    const failurePercentage = sendProgress.total > 0 ? (sendProgress.failed / sendProgress.total) * 100 : 0;

    const seconds = Math.floor(currentDelayMs / 1000);

    const adjustDelay = (deltaSeconds: number) => {
        const newSeconds = Math.max(1, seconds + deltaSeconds);
        onSetDelay(newSeconds * 1000);
    };

    return (
        <div className="px-6 py-0 border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-b-3xl">
            <div className="flex items-center gap-6">

                {/* Delay Adjustment (Left - No Label) */}
                <div className="flex items-center gap-1.5 bg-gray-50/50 dark:bg-gray-950/50 p-1 rounded-2xl border border-gray-100 dark:border-gray-800 shrink-0 shadow-sm">
                    <button
                        onClick={() => adjustDelay(-1)}
                        className="w-9 h-9 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-gray-400 hover:text-rose-500 transition-all active:scale-90 shadow-sm"
                    >
                        <Minus className="w-4 h-4" />
                    </button>

                    <div className="flex flex-col items-center px-2 min-w-[45px]">
                        <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 leading-none">{seconds}</span>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">ثانية</span>
                    </div>

                    <button
                        onClick={() => adjustDelay(1)}
                        className="w-9 h-9 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-gray-400 hover:text-emerald-500 transition-all active:scale-90 shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                {/* Progress Bar (Middle - Text Inside) */}
                <div className="flex-1 flex flex-col gap-0.5">
                    <div className="flex items-center justify-between px-1 mb-0.5">
                        <span className="text-[9px] font-black text-gray-400">{totalProcessed} / {sendProgress.total || 0}</span>
                        {isSending && (
                            <div className="flex items-center gap-1 py-0.5 px-2 bg-slate-950 text-white rounded-full scale-75 origin-right">
                                <Clock className="w-2.5 h-2.5 text-indigo-400" />
                                <span className="text-[8px] font-black">{remainingMinutes}د {displaySeconds}ث</span>
                            </div>
                        )}
                    </div>

                    <div className="relative h-6 bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden shadow-inner flex border border-gray-200/50 dark:border-gray-800/50">
                        {/* Shimmering Progress Bar */}
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700 relative z-10"
                            style={{ width: `${successPercentage}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                        </div>
                        {/* Failure Bar */}
                        <div
                            className="h-full bg-rose-500 transition-all duration-700 relative z-10"
                            style={{ width: `${failurePercentage}%` }}
                        />

                        {/* Centered Text OVER the progress bar (Z-INDEX 20) */}
                        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                            <span className="text-[10px] font-black flex items-center gap-2 drop-shadow-sm">
                                <span className="text-black dark:text-white mix-blend-difference">التقدم: {progressPercentage}%</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats & Controls (Right) */}
                <div className="flex items-center gap-6 shrink-0">
                    <div className="flex gap-5 border-l border-slate-100 dark:border-slate-800 pl-5 h-10 items-center">
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-1">تم</span>
                            <span className="text-lg font-black text-emerald-600 leading-none">{sendProgress.sent}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest leading-none mb-1">فشل</span>
                            <span className="text-lg font-black text-rose-600 leading-none">{sendProgress.failed}</span>
                        </div>
                    </div>

                    {isSending && (
                        <button
                            onClick={onTogglePause}
                            className={`flex items-center gap-2 px-4 h-9 rounded-xl font-black text-[10px] transition-all shadow-lg active:scale-95 ${isPaused
                                ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                                : 'bg-amber-500 text-white shadow-amber-500/20'
                                }`}
                        >
                            {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
                            <span>{isPaused ? 'استكمال' : 'إيقاف'}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
