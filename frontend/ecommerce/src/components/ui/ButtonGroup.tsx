import { ReactNode, Children } from 'react';

interface ButtonGroupProps {
  children: ReactNode;
  className?: string;
}

const ButtonGroup = ({ children, className = '' }: ButtonGroupProps) => {
  return (
    <div className={`inline-flex rounded-md shadow-sm ${className}`} role="group">
      {Children.map(children, (child, index) => {
        // Apply styles directly to the wrapper elements instead of cloning
        let childClassName = '';
        
        if (index === 0) {
          childClassName = 'first-child:rounded-r-none';
        } 
        else if (index === Children.count(children) - 1) {
          childClassName = 'last-child:rounded-l-none last-child:border-l-0';
        } 
        else {
          childClassName = 'middle-child:rounded-none middle-child:border-l-0';
        }
        
        return <div className={childClassName}>{child}</div>;
      })}
    </div>
  );
};

export default ButtonGroup;
