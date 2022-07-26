// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { DatePickerProps } from './interfaces';
import Calendar from './calendar';
import { memoizedDate } from './calendar/utils/date';
import { useDatePicker } from './use-date-picker';
import { CalendarTypes } from './calendar/definitions';

export const DatePickerEmbedded = ({
  value,
  locale = '',
  normalizedLocale,
  startOfWeek,
  isDateEnabled,
  nextMonthAriaLabel,
  previousMonthAriaLabel,
  todayAriaLabel,
  calendarHasFocus,
  focusedDate,
  onDateFocusHandler,
}: DatePickerEmbeddedProps) => {
  const { displayedDate, selectedDate, onChangeMonthHandler, onSelectDateHandler } = useDatePicker({
    locale,
    value,
  });

  return (
    <Calendar
      selectedDate={memoizedDate('value', selectedDate)}
      focusedDate={memoizedDate('focused', focusedDate)}
      displayedDate={memoizedDate('displayed', displayedDate)}
      locale={normalizedLocale}
      startOfWeek={startOfWeek}
      isDateEnabled={isDateEnabled ? isDateEnabled : () => true}
      calendarHasFocus={calendarHasFocus}
      nextMonthLabel={nextMonthAriaLabel}
      previousMonthLabel={previousMonthAriaLabel}
      todayAriaLabel={todayAriaLabel}
      onChangeMonth={onChangeMonthHandler}
      onSelectDate={onSelectDateHandler}
      onFocusDate={onDateFocusHandler}
    />
  );
};

export type DatePickerEmbeddedProps = Omit<
  DatePickerProps,
  | 'placeholder'
  | 'openCalendarAriaLabel'
  | 'name'
  | 'disabled'
  | 'readOnly'
  | 'autoFocus'
  | 'ariaLabel'
  | 'ariaRequired'
  | 'onFocus'
  | 'onBlur'
  | 'onChange'
> & {
  calendarHasFocus: boolean;
  focusedDate: string | null;
  onDateFocusHandler: ({ date }: CalendarTypes.DateDetailNullable) => void;
  normalizedLocale: string;
};
