// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useState } from 'react';
import { Box, Link } from '~components';
import { DatePickerEmbedded } from '~components/date-picker/embedded';
import { normalizeLocale } from '~components/date-picker/calendar/utils/locales';
import { CalendarTypes } from '~components/date-picker/calendar/definitions';
import { formatDate } from '~components/date-picker/calendar/utils/date';

export default function DatePickerEditorScenario() {
  const dateValue = '';
  const normalizedLocale = normalizeLocale('DatePicker', 'en-EN');
  const [focusedDate, setFocusedDate] = useState<string | null>(null);

  const onDateFocusHandler = ({ date }: CalendarTypes.DateDetailNullable) => {
    if (date) {
      const value = formatDate(date);
      setFocusedDate(value);
    }
  };

  return (
    <Box padding="s">
      <h1>Date picker embedded version</h1>
      <Link id="focus-dismiss-helper">Focusable element before the date picker</Link>
      <br />
      <DatePickerEmbedded
        value={dateValue}
        locale={'en-EN'}
        previousMonthAriaLabel={'Previous month'}
        nextMonthAriaLabel={'Next month'}
        todayAriaLabel={'TEST TODAY'}
        calendarHasFocus={true}
        normalizedLocale={normalizedLocale}
        focusedDate={focusedDate}
        onDateFocusHandler={onDateFocusHandler}
      />
      <br />
      <br />
      <Link id="focusable-element-after-date-picker">Focusable element after the date picker</Link>
    </Box>
  );
}
