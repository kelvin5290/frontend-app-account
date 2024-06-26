import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Collapsible, NavItem } from '@openedx/paragon';
import classNames from 'classnames';
import messages from './messages';
import ToggleSwitch from './ToggleSwitch';
import {
  selectPreferenceAppToggleValue,
  selectNonEditablePreferences,
  selectPreferencesOfApp,
  selectSelectedCourseId,
  selectUpdatePreferencesStatus,
} from './data/selectors';
import NotificationPreferenceRow from './NotificationPreferenceRow';
import { updateAppPreferenceToggle, updateChannelPreferenceToggle } from './data/thunks';
import { LOADING_STATUS } from '../constants';
import NOTIFICATION_CHANNELS from './data/constants';

const NotificationPreferenceApp = ({ appId }) => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const courseId = useSelector(selectSelectedCourseId());
  const appPreferences = useSelector(selectPreferencesOfApp(appId));
  const appToggle = useSelector(selectPreferenceAppToggleValue(appId));
  const updatePreferencesStatus = useSelector(selectUpdatePreferencesStatus());
  const nonEditable = useSelector(selectNonEditablePreferences(appId));

  const onChannelToggle = useCallback((event) => {
    const { id: notificationChannel } = event.target;
    const isPreferenceNonEditable = (preference) => nonEditable?.[preference.id]?.includes(notificationChannel);

    const hasActivePreferences = appPreferences.some(
      (preference) => preference[notificationChannel] && !isPreferenceNonEditable(preference),
    );

    dispatch(updateChannelPreferenceToggle(courseId, appId, notificationChannel, !hasActivePreferences));
  }, [appId, appPreferences, courseId, dispatch, nonEditable]);

  const preferences = useMemo(() => (
    appPreferences.map(preference => (
      <NotificationPreferenceRow
        key={preference.id}
        appId={appId}
        preferenceName={preference.id}
      />
    ))), [appId, appPreferences]);

  const onChangeAppSettings = useCallback((event) => {
    dispatch(updateAppPreferenceToggle(courseId, appId, event.target.checked));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId]);
  if (!courseId) {
    return null;
  }

  return (
    <Collapsible.Advanced open={appToggle} data-testid={`${appId}-app`} className="mb-5">
      <Collapsible.Trigger>
        <div className="d-flex align-items-center">
          <span className="mr-auto">
            {intl.formatMessage(messages.notificationAppTitle, { key: appId })}
          </span>
          <span className="d-flex" id={`${appId}-app-toggle`}>
            <ToggleSwitch
              name={appId}
              value={appToggle}
              onChange={onChangeAppSettings}
              disabled={updatePreferencesStatus === LOADING_STATUS}
            />
          </span>
        </div>
        <hr className="border-light-400 my-3" />
      </Collapsible.Trigger>
      <Collapsible.Body>
        <div className="d-flex flex-row header-label">
          <span className="col-8 px-0">{intl.formatMessage(messages.typeLabel)}</span>
          <span className="d-flex col-4 px-0">
            {NOTIFICATION_CHANNELS.map((channel) => (
              <NavItem
                id={channel}
                key={channel}
                className={classNames(
                  'd-flex',
                  { 'ml-auto': channel === 'web' },
                  { 'mx-auto': channel === 'email' },
                  { 'ml-auto mr-0': channel === 'push' },
                )}
                role="button"
                onClick={onChannelToggle}
              >
                {intl.formatMessage(messages.notificationChannel, { text: channel })}
              </NavItem>
            ))}
          </span>
        </div>
        <div className="my-3">
          { preferences }
        </div>
      </Collapsible.Body>
    </Collapsible.Advanced>
  );
};

NotificationPreferenceApp.propTypes = {
  appId: PropTypes.string.isRequired,
};

export default React.memo(NotificationPreferenceApp);
