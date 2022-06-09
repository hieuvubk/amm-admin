import { Fade, Tooltip } from '@material-ui/core';
import React from 'react';

interface ITooltip {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any;
}

const TooltipText: React.FC<ITooltip> = ({ content }) => {
  function get_ellipsis_mid(str: string) {
    if (str && str.length > 15) {
      return str.substr(0, 5) + '...' + str.substr(str.length - 3, str.length);
    }
    return str;
  }

  return (
    <Tooltip TransitionComponent={Fade} title={content} interactive arrow placement="top">
      <span style={{ width: '100%', overflow: 'hidden', height: 'fit-content' }}>{get_ellipsis_mid(content)}</span>
    </Tooltip>
  );
};

export default TooltipText;
