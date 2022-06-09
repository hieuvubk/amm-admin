import { ClickAwayListener, Fade, Popper } from '@material-ui/core';
import classnames from 'classnames/bind';
import React, { useEffect, useState } from 'react';
import searchIcon from 'src/assets/icon/search.svg';
import { ISelect } from 'src/components/Base/Select/Select';
import { ICoin } from './Constant';
import styles from './DigitalCreditModal.module.scss';

const cx = classnames.bind(styles);

interface DigitalCreditModalProps {
  open: boolean;
  refElm: HTMLButtonElement | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleClose?: any;
  options?: Array<ISelect>;
  pairInfos?: Array<ICoin>;
  onClick?: (value: number) => void;
}
const DigitalCreditModal: React.FC<DigitalCreditModalProps> = ({ options, open, handleClose, refElm, onClick }) => {
  const [displayCoins, setDispayCoins] = useState<Array<ISelect>>([]);
  const [keywordSearch, setKeywordSearch] = useState<string>('');
  useEffect(() => {
    if (!!options?.length) {
      setDispayCoins(options);
    }
  }, [options]);
  useEffect(() => {
    setDispayCoins(
      options
        ? options.filter((option: ISelect) => option.label.toLowerCase().includes(keywordSearch.toLowerCase()))
        : [],
    );
  }, [keywordSearch]);

  const handleClosePopover = () => {
    handleClose();
    setTimeout(() => setKeywordSearch(''), 500);
  };
  return (
    <>
      {open && (
        <ClickAwayListener onClickAway={handleClosePopover}>
          <Popper
            open={open}
            anchorEl={refElm}
            transition
            placement="bottom"
            disablePortal={false}
            modifiers={{
              flip: {
                enabled: false,
              },
              preventOverflow: {
                enabled: true,
                boundariesElement: 'scrollParent',
              },
            }}
            className={cx('modal-paper')}
          >
            {({ TransitionProps }) => (
              <Fade {...TransitionProps}>
                <div>
                  <div className={cx('content-wrapper')}>
                    <div className={cx('search-wrapper')}>
                      <input
                        className={cx('input-search')}
                        type="text"
                        placeholder="Search"
                        value={keywordSearch}
                        onChange={(event) => setKeywordSearch(event.target.value.trim())}
                      />
                      <div className={cx('search-icon')}>
                        <img src={searchIcon} />
                      </div>
                    </div>
                  </div>
                  <div className={cx('search-item')}>
                    {displayCoins.length === 0 ? (
                      <p className={cx('not-found')}>Not Found</p>
                    ) : (
                      <>
                        {displayCoins.map((option: ISelect) => (
                          <div
                            className={cx('row')}
                            key={option.value}
                            onClick={() => {
                              if (onClick) {
                                onClick(option.value);
                              }
                              handleClosePopover();
                            }}
                          >
                            <div className={cx('data')}>{option.label}</div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </Fade>
            )}
          </Popper>
        </ClickAwayListener>
      )}
    </>
  );
};

export default DigitalCreditModal;
