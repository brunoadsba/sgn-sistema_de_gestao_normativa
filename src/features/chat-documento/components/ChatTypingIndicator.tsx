'use client'

export function ChatTypingIndicator() {
    return (
        <div className="py-1" aria-live="polite">
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                        <span
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"
                            style={{ animationDelay: `${i * 150}ms`, animationDuration: '0.8s' }}
                        />
                    ))}
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                    NEX pensando...
                </span>
            </div>
        </div>
    )
}
