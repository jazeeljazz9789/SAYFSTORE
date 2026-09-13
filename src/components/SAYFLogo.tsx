// SAYF Logo Component — Uses the official metallic silver wordmark image

import React from "react";

interface SAYFLogoProps {
  /** Width in pixels (height scales proportionally) */
  width?: number;
  /** Additional className for the wrapper */
  className?: string;
}

const SAYFLogo: React.FC<SAYFLogoProps> = ({ width = 100, className = "" }) => {
  return (
    <div className={`sayf-logo ${className}`} style={{ width, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img
        src="/sayf-logo.png"
        alt="SAYF"
        style={{ width: '100%', height: 'auto', display: 'block' }}
      />
    </div>
  );
};

export default SAYFLogo;
