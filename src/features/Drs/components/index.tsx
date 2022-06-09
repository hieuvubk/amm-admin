/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
/* eslint-disable react-hooks/exhaustive-deps */
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { CButton } from 'src/components/Base/Button';
import classnames from 'classnames/bind';
import React, { useEffect, useState, ChangeEvent } from 'react';
import { useHistory } from 'react-router-dom';
import styles from 'src/features/Drs/styles/Drs.module.scss';
import routeConstants from 'src/constants/routeConstants';
import LinksBreadcrumbs from 'src/features/Admin/components/LinksBreadcrumbs/LinksBreadcrumbs';
import { Tab, Tabs } from '@material-ui/core';
import {
  BORDER_COLOR_TABS,
  ODER_BOOK_DATA,
  CUSTOMER_TITLE_ORDERBOOK_CSV,
} from 'src/features/MarketOverview/constants/index';
import DrsList from 'src/features/Drs/components/Drs/Drs';
import { CSVLink } from 'react-csv';
const cx = classnames.bind(styles);
const DrsComponent: React.FC = () => {
  const history = useHistory();
  const [excelData] = useState<Array<any>>(ODER_BOOK_DATA);
  useEffect(() => {}, []);
  const [selectedTab, setSelectedTab] = useState(0);
  const [openPopup, setOpenPopup] = useState(false);
  const handleChange = (event: ChangeEvent<unknown>, value: number) => {
    setSelectedTab(value);
  };
  const downloadData = () => {
    setOpenPopup(true);
  };
  const handleSubmitCancel = async () => {
    await setOpenPopup(false);
  };
  const handleSubmitDownLoad = async () => {
    await setOpenPopup(false);
  };
  const getCsvData = () => {
    const csvData = [CUSTOMER_TITLE_ORDERBOOK_CSV];
    let i;
    for (i = 0; i < excelData.length; i += 1) {
      csvData.push([
        `${excelData[i].pair}`,
        `${excelData[i].date}`,
        `${excelData[i].side}`,
        `${excelData[i].price}`,
        `${excelData[i].filled}`,
        `${excelData[i].fee}`,
        `${excelData[i].total}`,
        `${excelData[i].wallet}`,
        `${excelData[i].network}`,
        `${excelData[i].user_id}`,
      ]);
    }
    return csvData;
  };
  return (
    <div className={cx('drs-list')}>
      <div>
        <LinksBreadcrumbs
          value={[
            {
              content: 'Dashboard',
            },
            {
              content: 'DRS',
              onClick: (): void => history.push(routeConstants.DRS),
            },
          ]}
        />
        <div className={cx('tabs-drs')}>
          <>
            <Tabs value={selectedTab} onChange={handleChange} TabIndicatorProps={BORDER_COLOR_TABS}>
              <Tab className={cx('tabs-drs')} label="DRS" />
              <Tab className={cx('tabs-drs')} label="FX cross matrix" />
              <button onClick={downloadData} className={cx('btn-export')}></button>
            </Tabs>
            {selectedTab === 0 && (
              <>
                <div>
                  <DrsList />
                </div>
              </>
            )}
            {selectedTab === 1 && <></>}
          </>
        </div>
      </div>
      <>
        {
          <Dialog
            className={cx('modal-type')}
            open={openPopup}
            onClose={() => setOpenPopup(false)}
            aria-labelledby="responsive-dialog-title"
          >
            <div>
              <DialogTitle id="responsive-dialog-title" className={cx('title-download')}>
                <p className={cx('title-download-svg')}>
                  Download
                  <IconButton aria-label="close" onClick={handleSubmitCancel} className={cx('btn-close')}>
                    <CloseIcon className={cx('csv-close')} />
                  </IconButton>
                </p>
                <button className={cx('img-download-svg')}></button>
              </DialogTitle>
              <DialogContent className={cx('modal-content')}>
                <p className={cx('text-download-svg')}>Are you sure want to dowload CSV file?</p>
              </DialogContent>
              <DialogActions>
                <div className={cx('btn-action')}>
                  <CSVLink filename="orderbook.csv" data={getCsvData()}>
                    <CButton
                      classNamePrefix={cx('btn-download')}
                      onClick={handleSubmitDownLoad}
                      size="sm"
                      fullWidth
                      type="primary"
                      content="Download"
                    />
                  </CSVLink>
                </div>
              </DialogActions>
            </div>
          </Dialog>
        }
      </>
    </div>
  );
};

export default DrsComponent;
