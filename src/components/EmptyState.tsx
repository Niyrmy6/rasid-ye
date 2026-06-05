type EmptyStateProps = {
  icon: string;
  message: string;
  variant?: 'plain' | 'card';
  className?: string;
};

export default function EmptyState({
  icon,
  message,
  variant = 'plain',
  className = '',
}: EmptyStateProps) {
  const content = (
    <>
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
        <span className="material-symbols-outlined text-[32px]">{icon}</span>
      </div>
      <p className="text-gray-500 dark:text-gray-400 font-medium">{message}</p>
    </>
  );

  if (variant === 'card') {
    return (
      <div className={`text-center p-8 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-800 ${className}`.trim()}>
        {content}
      </div>
    );
  }

  return (
    <div className={`text-center p-8 mt-10 ${className}`.trim()}>
      {content}
    </div>
  );
}
