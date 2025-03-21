
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format, parse, isValid } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";

// Props interface for the DateRangePicker component
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
  
  // State for popover visibility
  const [startOpen, setStartOpen] = React.useState(false);
  const [endOpen, setEndOpen] = React.useState(false);
  
  // State for input field values
  const [startInput, setStartInput] = React.useState(
    startDate ? format(startDate, "MM/dd/yyyy") : ""
  );
  const [endInput, setEndInput] = React.useState(
    endDate ? format(endDate, "MM/dd/yyyy") : ""
  );

  // Update input fields when dates change externally
  React.useEffect(() => {
    setStartInput(startDate ? format(startDate, "MM/dd/yyyy") : "");
  }, [startDate]);

  React.useEffect(() => {
    setEndInput(endDate ? format(endDate, "MM/dd/yyyy") : "");
  }, [endDate]);

  // Handlers for calendar date selection
  const handleStartSelect = (date: Date | undefined) => {
    onStartDateChange(date);
    setStartOpen(false);
  };

  const handleEndSelect = (date: Date | undefined) => {
    onEndDateChange(date);
    setEndOpen(false);
  };

  // Handlers for manual date input
  const handleStartInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStartInput(value);
    
    if (value.length === 10) {
      const parsedDate = parse(value, "MM/dd/yyyy", new Date());
      if (isValid(parsedDate)) {
        onStartDateChange(parsedDate);
      } else {
        toast({
          title: "Invalid Date Format",
          description: "Please enter date in MM/DD/YYYY format",
          variant: "destructive",
        });
      }
    }
  };

  const handleEndInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEndInput(value);
    
    if (value.length === 10) {
      const parsedDate = parse(value, "MM/dd/yyyy", new Date());
      if (isValid(parsedDate)) {
        onEndDateChange(parsedDate);
      } else {
        toast({
          title: "Invalid Date Format",
          description: "Please enter date in MM/DD/YYYY format",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Start date picker */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Start Date</label>
        <div className="flex gap-2">
          <Input
            value={startInput}
            onChange={handleStartInputChange}
            placeholder="MM/DD/YYYY"
            className="flex-1"
          />
          <Popover open={startOpen} onOpenChange={setStartOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={handleStartSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* End date picker */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">End Date</label>
        <div className="flex gap-2">
          <Input
            value={endInput}
            onChange={handleEndInputChange}
            placeholder="MM/DD/YYYY"
            className="flex-1"
          />
          <Popover open={endOpen} onOpenChange={setEndOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={handleEndSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default DateRangePicker;
