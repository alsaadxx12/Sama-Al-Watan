import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Calendar } from "./calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "./popover"

interface DatePickerProps {
    date?: Date
    setDate: (date?: Date) => void
    placeholder?: string
    className?: string
}

export function DatePicker({ date, setDate, placeholder = "اختر تاريخاً", className }: DatePickerProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-right font-black h-10 px-3",
                        !date && "text-gray-500",
                        className
                    )}
                >
                    <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                    {date ? format(date, "PPP", { locale: ar }) : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                    selected={date}
                    onSelect={(d) => {
                        setDate(d);
                    }}
                />
            </PopoverContent>
        </Popover>
    )
}
