import React from 'react';
import '../transitions.css';

const PageTransition = ({ children }) => {
    return (
        <div className="page-transition-wrapper">
            {children}
        </div>
    );
};

export default PageTransition;
