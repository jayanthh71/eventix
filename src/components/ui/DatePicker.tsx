"use client";

import { useEffect, useRef, useState } from "react";

interface DatePickerProps {
  value: string;
  onDateChangeAction: (date: string) => void;
  minDate?: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

export default function DatePicker({
  value,
  onDateChangeAction,
  minDate,
  className = "",
  placeholder = "Select date",
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedDate = value ? new Date(value) : null;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const calendarDays = [];

  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(year, month, day);
    const formattedDate = selectedDate.toISOString().split("T")[0];

    if (minDate && formattedDate < minDate) {
      return;
    }

    onDateChangeAction(formattedDate);
    setIsOpen(false);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isDateDisabled = (day: number) => {
    if (!minDate) return false;
    const dateToCheck = new Date(year, month, day);
    const minDateObj = new Date(minDate);
    return dateToCheck < minDateObj;
  };

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    );
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`font-anek w-full cursor-pointer rounded-xl border border-gray-600/50 bg-gray-700/50 px-4 py-3 text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300 select-none focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/30 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 ${className}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`font-anek ${value ? "text-white" : "text-gray-400"}`}
            >
              {value ? formatDisplayDate(value) : placeholder}
            </span>
          </div>
          <svg
            className="h-4 w-4 cursor-pointer text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
          >
            <path d="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="font-anek animate-in slide-in-from-top-2 absolute top-full left-0 z-50 mt-2 w-full rounded-xl border border-gray-600/50 bg-gray-800/95 p-4 shadow-2xl backdrop-blur-sm duration-200 select-none">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigateMonth("prev")}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition-all duration-200 hover:scale-105 hover:bg-gray-700/50 hover:text-white"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <h3 className="font-anek text-lg font-semibold text-white">
              {monthNames[month]} {year}
            </h3>

            <button
              type="button"
              onClick={() => navigateMonth("next")}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition-all duration-200 hover:scale-105 hover:bg-gray-700/50 hover:text-white"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1">
            {weekDays.map((day) => (
              <div
                key={day}
                className="font-anek p-2 text-center text-xs font-semibold text-indigo-400"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <div key={index} className="aspect-square">
                {day ? (
                  <button
                    type="button"
                    onClick={() => handleDateSelect(day)}
                    disabled={isDateDisabled(day)}
                    className={`font-anek h-full w-full cursor-pointer rounded-lg text-sm font-medium transition-all duration-200 ${
                      isDateSelected(day)
                        ? "scale-95 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg ring-2 ring-indigo-500/30"
                        : isDateDisabled(day)
                          ? "cursor-not-allowed text-gray-500 opacity-50"
                          : "text-gray-300 hover:scale-105 hover:bg-gray-700/50 hover:text-white hover:shadow-md"
                    } `}
                  >
                    {day}
                  </button>
                ) : (
                  <div />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
