import { Button, Dialog } from '@material-ui/core';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import CloseIcon from '@material-ui/icons/Close';
import { Pagination } from '@material-ui/lab';
import { unwrapResult } from '@reduxjs/toolkit';
import classnames from 'classnames/bind';
import React, { ChangeEvent, ReactElement, useEffect, useState } from 'react';
import CsvDownloader from 'react-csv-downloader';
import CSVReader from 'react-csv-reader';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router';
import stylesPagition from 'src/components/Pagination/style';
import routeConstants from 'src/constants/routeConstants';
import LinksBreadcrumbs from 'src/features/Admin/components/LinksBreadcrumbs';
import { DownloadType } from 'src/features/MarketOverview/constants';
import { getGeneralApi, updateGeneralSetting } from 'src/pages/Dashboard/GeneralSettings/api/index';
import {
  File,
  FIX_VALUE_GENERAL_CSV,
  General,
  PERCENT_NUMBER_REGEX,
  UpdateInterval,
} from 'src/pages/Dashboard/GeneralSettings/constants';
import { CUSTOMER_TITLE_GENERAL_CSV, IFilter, PAGINATION } from 'src/pages/Dashboard/GeneralSettings/constants/index';
import styles from 'src/pages/Dashboard/GeneralSettings/styles/GeneralSetting.module.scss';
import axiosInstance from 'src/services/config';
import { useAppSelector } from 'src/store/hooks';
import { THEME_MODE } from 'src/interfaces/theme';
import { initFetchListNotiPopup } from 'src/components/Navigation/TopNav2';
import { openSnackbar, SnackbarVariant } from 'src/store/snackbar';
const cx = classnames.bind(styles);
const GeneralSettings: React.FC = () => {
  const classes = stylesPagition();
  const history = useHistory();
  const dispatch = useDispatch();
  const [modalUpload, setModalUpload] = React.useState(false);
  const [modalUploadFalse, setModalUploadFalse] = React.useState(false); // false info
  const [modelTypeFalse, setModalTypeFalse] = React.useState(false); // false file
  const [conditionFilter, setConditionFilter] = useState<IFilter>({
    page: 1,
    limit: 10,
  });
  const theme = useAppSelector((state) => state.theme.themeMode);
  const [showDownloadBtn, setshowDownloadBtn] = useState(true);
  const intervalList = useAppSelector((state) => state.generalSetting.generals.data);
  const [, setCurrentPage] = useState(PAGINATION.DEFAULT_CURRENT_PAGE);
  const totalPage = useAppSelector((state) => state.generalSetting.generals.metadata.totalPage);
  const handleChange = (event: ChangeEvent<unknown>, value: number): void => {
    conditionFilter.page = value;
    dispatch(getGeneralApi(conditionFilter));
    setConditionFilter(conditionFilter);
    setCurrentPage(value);
  };
  useEffect(() => {
    if (intervalList.length === 0) {
      setshowDownloadBtn(false);
    } else {
      setshowDownloadBtn(true);
    }
  }, [intervalList]);
  const getCsvData = async () => {
    await axiosInstance.post('/admin/write-log-download', {
      downloadType: DownloadType.ConfidenceInterval,
    });
    const csvData: string[][] = [];
    csvData.push(CUSTOMER_TITLE_GENERAL_CSV.map((item) => item.displayName));
    let i;
    for (i = 0; i < intervalList.length; i += 1) {
      csvData.push([
        `${intervalList[i].interval}`,
        `${intervalList[i].by_the_interval.replace('%', '')}`,
        `${intervalList[i].annualized}`,
      ]);
    }
    return csvData;
  };
  useEffect(() => {
    dispatch(getGeneralApi(conditionFilter));
  }, [conditionFilter, dispatch]);

  //upload file call api
  const uploadCSV = async (data: Array<General>, fileInfo: File) => {
    await setModalUpload(false);
    await setModalTypeFalse(false);
    await setModalUpload(false);
    //invalid type file
    if (fileInfo && fileInfo.name && fileInfo.name.indexOf('.csv') === -1) {
      await setModalTypeFalse(true);
      await setModalUpload(false);
      await setModalUploadFalse(false);
    } else {
      const params: UpdateInterval = {
        interval: data,
        filter: conditionFilter,
      };
      const byTheIntervalFormatFalse = params.interval.filter(
        (item) => !new RegExp(PERCENT_NUMBER_REGEX).test(item.by_the_interval),
      );
      const intervalList = params.interval.map((item) => item.interval);
      const compareTwoArrayInterval = JSON.stringify(intervalList) === JSON.stringify(FIX_VALUE_GENERAL_CSV);
      if (byTheIntervalFormatFalse.length > 0 || !compareTwoArrayInterval) {
        await setModalUploadFalse(true);
        await setModalTypeFalse(false);
        await setModalUpload(false);
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await dispatch(updateGeneralSetting(params));
      // invalid info file
      if (!response.payload) {
        if (response.error.code === 'ECONNABORTED') {
          await setModalUploadFalse(false);
        } else {
          await setModalUploadFalse(true);
        }
        await setModalTypeFalse(false);
        await setModalUpload(false);
      } else {
        // sucess file
        const result = unwrapResult(response);
        dispatch(getGeneralApi(conditionFilter));
        dispatch(
          openSnackbar({
            message: 'Update Confidence interval successfully!',
            variant: SnackbarVariant.SUCCESS,
          }),
        );
        initFetchListNotiPopup();
        if (result && result.length > 0) {
          await setModalTypeFalse(false);
          await setModalUploadFalse(false);
          await setModalUpload(false);
        }
      }
    }
  };
  const papaparseOptions = {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => header.toLowerCase().replace(/\W/g, '_'),
  };
  const handleUpload = async () => {
    await setModalUpload(true);
  };
  const handleCancelUpload = async () => {
    await setModalUpload(false);
  };
  const handleCancelUploadFalse = async () => {
    await setModalUploadFalse(false);
  };
  const handleCancelTypeFalse = async () => {
    await setModalTypeFalse(false);
  };

  return (
    <div className={cx('general_setting')}>
      <LinksBreadcrumbs
        value={[
          {
            content: 'Dashboard',
            onClick: (): void => history.push(routeConstants.FX_CROSS_MATRIX),
          },
          {
            content: 'General settings',
            onClick: (): void => history.push(routeConstants.DASHBOARD_GENERALSETTINGS),
          },
        ]}
      />
      <div className={cx('title')}>
        <div>Confidence interval settings</div>
        <div className={showDownloadBtn ? cx('btn-action-general') : cx('btn-action-disable')}>
          <CsvDownloader
            filename="confidence_interval_format"
            extension=".csv"
            separator=";"
            wrapColumnChar=""
            disabled={!showDownloadBtn}
            datas={getCsvData}
          />
          <button type="button" className={cx('btn-download')} onClick={handleUpload}>
            Upload
          </button>
        </div>
      </div>
      <div className={cx('wrap-container')}>
        <div className={cx('title-table')}>Volatility table</div>
        <div className={cx('wrap-container-inside')}>
          <div className={cx('wrap-container')}>
            <table className={cx('theme-custom-table')}>
              <thead>
                <tr>
                  <th>Interval</th>
                  <th>By the Interval</th>
                  <th>Annualized</th>
                </tr>
                {intervalList?.map((item: General, index: number): ReactElement => {
                  return (
                    <tr className={cx('cursor-pointer')} key={index}>
                      <>
                        <td className={cx('tile-active')}>{item.interval}</td>
                        <td className={cx('tile-active')}>{item.by_the_interval}</td>
                        <td className={cx('tile-active')}>{item.annualized}</td>
                      </>
                    </tr>
                  );
                })}
              </thead>
            </table>
            {intervalList.length <= 0 && <p className={cx('table-no-data')}>Not found</p>}
          </div>
        </div>
      </div>
      {totalPage > 1 ? (
        <div className={cx('footer-pagination')}>
          <div>
            <Pagination
              className={classes.pagination}
              count={totalPage}
              variant="outlined"
              shape="rounded"
              onChange={handleChange}
            />
          </div>
        </div>
      ) : (
        <div></div>
      )}

      {
        <Dialog
          className={cx('modal-type')}
          open={modalUpload}
          onClose={() => setModalUpload(false)}
          aria-labelledby="responsive-dialog-title"
        >
          <div>
            <DialogTitle id="responsive-dialog-title" className={cx('title-general')}>
              <p className={cx('title-general')}>Upload confidence interval table</p>
              <button
                type="button"
                className={theme === THEME_MODE.DARK ? cx('btn-export-dark') : cx('btn-export-light')}
              ></button>
              <Button onClick={handleCancelUpload} className={cx('close-button')}>
                <CloseIcon />
              </Button>
            </DialogTitle>
            <DialogContent className={cx('modal-content')}>
              <p className={cx('description-general')}>
                Please upload a CSV file to update the Confidence interval table
              </p>
            </DialogContent>
            <DialogActions>
              <div className={cx('btn-action-popup')}>
                <CSVReader
                  cssClass={cx('btn-download-popup')}
                  accept=".csv"
                  label="Upload"
                  onFileLoaded={uploadCSV}
                  parserOptions={papaparseOptions}
                />
              </div>
            </DialogActions>
          </div>
        </Dialog>
      }
      {
        <Dialog
          className={cx('modal-type')}
          open={modalUploadFalse}
          onClose={() => setModalUploadFalse(false)}
          aria-labelledby="responsive-dialog-title"
        >
          <div>
            <DialogTitle id="responsive-dialog-title" className={cx('title-general')}>
              <p className={cx('title-general')}>Invalid information!</p>
              <button type="button" className={cx('btn-invalid')}></button>
              <Button onClick={handleCancelUploadFalse} className={cx('close-button')}>
                <CloseIcon />
              </Button>
            </DialogTitle>
            <DialogContent className={cx('modal-content')}>
              <p className={cx('description-general')}>
                The update was unsuccessful because there was invalid information in the CSV file uploaded.
              </p>
              <p className={cx('description-general')}>
                Please correct the invalid infomation and upload the file again.
              </p>
            </DialogContent>
          </div>
        </Dialog>
      }
      {
        <Dialog
          className={cx('modal-type')}
          open={modelTypeFalse}
          onClose={() => setModalUploadFalse(false)}
          aria-labelledby="responsive-dialog-title"
        >
          <div>
            <DialogTitle id="responsive-dialog-title" className={cx('title-general')}>
              <p className={cx('title-general')}>Invalid file format!</p>
              <button type="button" className={cx('btn-invalid')}></button>
              <Button onClick={handleCancelTypeFalse} className={cx('close-button')}>
                <CloseIcon />
              </Button>
            </DialogTitle>
            <DialogContent className={cx('modal-content')}>
              <p className={cx('description-general')}>Uploading confidence interval table only accepts CSV file.</p>
              <p className={cx('description-general')}>Please check your file format and upload again.</p>
            </DialogContent>
            <DialogActions>
              <div className={cx('btn-action-popup')}>
                <CSVReader
                  cssClass={cx('btn-download-popup')}
                  accept=".csv"
                  label="Upload"
                  onFileLoaded={uploadCSV}
                  parserOptions={papaparseOptions}
                />
              </div>
            </DialogActions>
          </div>
        </Dialog>
      }
    </div>
  );
};
export default GeneralSettings;
