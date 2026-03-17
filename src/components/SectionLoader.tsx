import React from 'react';

interface SectionLoaderProps {
  message?: string;
}

const SectionLoader: React.FC<SectionLoaderProps> = ({
  message = 'Loading data...',
}) => {
  return (
    <div className="rounded-sm border border-stroke bg-white px-5 py-10 text-center shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
      <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <p className="text-sm text-slate-500 dark:text-slate-300">{message}</p>
    </div>
  );
};

export default SectionLoader;