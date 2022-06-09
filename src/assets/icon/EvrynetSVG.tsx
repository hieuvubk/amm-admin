/* eslint-disable max-len */
import React from 'react';

interface Props {
  size: 'xl' | 'lg' | 'md' | 'sm';
}

const EvrynetSVG: React.FC<Props> = ({ size = 'md' }: Props) => {
  const returnSize = (size: string) => {
    switch (size) {
      case 'xl':
        return {
          height: '36',
          width: '36',
        };
      case 'lg':
        return {
          height: '20',
          width: '20',
        };
      case 'md':
        return {
          height: '16',
          width: '16',
        };
      case 'sm':
        return {
          height: '12',
          width: '12',
        };

      default:
        break;
    }
  };
  return (
    <>
      <svg {...returnSize(size)} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0)">
          <path
            d="M20.6013 8.37877C21.6829 8.1132 22.5721 7.51509 23.3244 6.68836C21.5867 3.49923 17.5058 2.36306 13.3432 3.33296C8.60615 5.00258 7.27469 10.5888 9.10365 13.4338C9.46175 13.9927 10.774 15.5145 10.774 15.5145C6.52724 17.9092 5.11887 21.7195 6.53205 26.9362C9.05798 32.7233 15.958 34.7162 21.5555 31.3793C24.4563 29.3494 26.1459 26.7561 25.9152 23.2691C25.1701 22.9758 22.9879 22.9596 22.6322 23.3337C22.536 26.1395 21.2695 28.3333 17.9456 29.451C13.4009 30.0884 10.3606 28.5089 9.30553 24.0104C9.0003 19.7913 12.2593 17.4658 16.5397 17.2695C17.2895 17.2257 17.1429 14.2143 16.5348 14.2467C14.2877 14.3275 12.7592 13.4846 12.0021 11.6464C10.7548 5.73001 17.6572 4.57536 20.6013 8.37877Z"
            fill="url(#paint0_linear)"
          />
          <path
            d="M22.6148 14.1354H19.0458C18.3969 14.0985 18.3969 17.4239 19.0458 17.3869H22.6148C22.6148 17.3869 22.6051 20.8 22.6148 20.897C22.67 21.5136 25.8905 21.4697 25.9338 20.897V17.3707L29.5389 17.35C30.1589 17.3061 30.1469 14.1539 29.5389 14.1377H25.9338V10.7084C25.7343 10.2119 22.8166 10.0665 22.6027 10.7084L22.6148 14.1354Z"
            fill="#E53493"
          />
        </g>
        <defs>
          <linearGradient
            id="paint0_linear"
            x1="7.74988"
            y1="29.4951"
            x2="24.4533"
            y2="5.93167"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#56CAF6" />
            <stop offset="1" stopColor="#E53493" />
          </linearGradient>
          <clipPath id="clip0">
            <rect width="24" height="30" fill="white" transform="translate(6 3)" />
          </clipPath>
        </defs>
      </svg>
    </>
  );
};

export default EvrynetSVG;
