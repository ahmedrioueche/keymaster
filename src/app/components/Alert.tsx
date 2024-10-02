import React from 'react';

interface AlertProps {
  title: string | undefined;
  message: string | undefined;
  bg?: string;
  onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({ title, message, bg, onClose }) => {
  return (
    <div className={`fixed bottom-5 z-1000000 left-1/2 transform -translate-x-1/2 ${bg ? bg : 'bg-red-500'} text-white p-4 px-4 rounded-lg shadow-lg w-11/12`}>
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-lg">{title}</h4>
          <div className='flex flex-col justify-center'>
           <p className="text-sm mt-1">{message}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white text-xl leading-none ml-4 focus:outline-none"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default Alert;
