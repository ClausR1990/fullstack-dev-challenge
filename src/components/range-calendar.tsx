import React, {
  ChangeEventHandler,
  FormEvent,
  useEffect,
  useState,
} from "react";
import { addHours, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "../utils";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { TimePicker } from "./time-picker";

type RangeCalendarProps = React.HTMLAttributes<HTMLInputElement> & {};

export const RangeCalendar = ({
  className,
  onChange,
  ...props
}: RangeCalendarProps) => {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: addHours(new Date(), 18),
  });

  const TimeSelect = () => {
    const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
      const [hours = 0, minutes = 0] = e.target.value.split(":").map(Number);
      const currentDate = date![e.target.name as keyof typeof date] as Date;
      setDate({
        ...date!,
        [e.target.name]: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate(),
          hours,
          minutes
        ),
      });
    };
    return (
      <div className="flex items-center justify-between gap-2 p-3 pt-0">
        <TimePicker
          name="from"
          defaultTime={date?.from}
          onChange={handleChange}
        />
        <TimePicker name="to" defaultTime={date?.to} onChange={handleChange} />
      </div>
    );
  };

  useEffect(() => {
    if (!onChange) return;
    onChange(date as unknown as FormEvent<HTMLInputElement>);
  }, [date]);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            {...props}
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
            fromDate={new Date()}
          />
          <TimeSelect />
        </PopoverContent>
      </Popover>
    </div>
  );
};
