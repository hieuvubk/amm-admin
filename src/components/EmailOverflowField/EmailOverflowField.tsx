import { Tooltip } from '@material-ui/core';
import React, { useRef, useEffect, useState } from 'react';

const EmailOverflowField: React.FC<{ email: string }> = ({ email }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref: any = useRef(null);
  const [overflow, setOverflow] = useState(false);

  useEffect(() => {
    if (ref.current) {
      if (ref.current.clientWidth < ref.current.scrollWidth) setOverflow(true);
    }
  }, [ref, email]);

  return overflow ? (
    <Tooltip title={email} placement={'top-start'} arrow>
      <div ref={ref} style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {email}
      </div>
    </Tooltip>
  ) : (
    <div ref={ref} style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
      {email}
    </div>
  );
};

export default EmailOverflowField;
