
import React from 'react';

const Logo: React.FC = () => (
    <div className="flex items-center">
        <div className="bg-current p-2 rounded-full">
            <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639l4.25-7.5a1.012 1.012 0 0 1 .832-.446l7.5 0a1.012 1.012 0 0 1 .832.446l4.25 7.5a1.012 1.012 0 0 1 0 .639l-4.25 7.5a1.012 1.012 0 0 1-.832.446l-7.5 0a1.012 1.012 0 0 1-.832-.446l-4.25-7.5Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="m9 12.75 3 3m0 0 3-3m-3 3v-7.5" />
            </svg>
        </div>
        <h1 className="text-xl font-bold ml-3 hidden md:inline">ViewzKart</h1>
         <h1 className="text-xl font-bold ml-3 md:hidden">VK</h1>
    </div>
);

export default Logo;
