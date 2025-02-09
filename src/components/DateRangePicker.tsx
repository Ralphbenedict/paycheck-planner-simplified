
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface DateRangePickerProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
}

const DateRangePicker = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangePickerProps) => {
  const { toast } = useToast();
  const [startOpen, setStartOpen] = React.useState(false);
  const [endOpen, setEndOpen] = React.useState(false);
  const [tempStartDate, setTempStartDate] = React.useState<Date | undefined>(startDate);
  const [tempEndDate, setTempEndDate] = React.useState<Date | undefined>(endDate);

  React.useEffect(() => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
  }, [startDate, endDate]);

  const handleStartConfirm = () => {
    onStartDateChange(tempStartDate);
    setStartOpen(false);
  };

  const handleEndConfirm = () => {
    if (tempEndDate && startDate && tempEndDate < startDate) {
      toast({
        title: "Invalid Date Selection",
        description: "End date cannot be before start date",
        variant: "destructive",
      });
      return;
    }
    onEndDateChange(tempEndDate);
    setEndOpen(false);
  };

  const handleStartSelect = (date: Date | undefined) => {
    setTempStartDate(date);
  };

  const handleEndSelect = (date: Date | undefined) => {
    setTempEndDate(date);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium">Start Date</label>
        <Popover open={startOpen} onOpenChange={setStartOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={tempStartDate}
              onSelect={handleStartSelect}
              initialFocus
            />
            <div className="p-3 border-t border-border">
              <Button
                variant="default"
                className="w-full"
                onClick={handleStartConfirm}
              >
                <Check className="mr-2 h-4 w-4" />
                Confirm Date
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">End Date</label>
        <Popover open={endOpen} onOpenChange={setEndOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={tempEndDate}
              onSelect={handleEndSelect}
              initialFocus
            />
            <div className="p-3 border-t border-border">
              <Button
                variant="default"
                className="w-full"
                onClick={handleEndConfirm}
              >
                <Check className="mr-2 h-4 w-4" />
                Confirm Date
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default DateRangePicker;

