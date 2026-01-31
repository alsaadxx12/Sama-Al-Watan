import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    eachDayOfInterval,
    setYear,
    setMonth,
    getYear,
    getMonth,
} from "date-fns"
import { ar } from "date-fns/locale"
import { cn } from "../../lib/utils"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./select"

export interface CalendarProps {
    selected?: Date
    onSelect?: (date: Date | undefined) => void
    className?: string
    mode?: "single"
}

export function Calendar({ selected, onSelect, className }: CalendarProps) {
    const [currentMonth, setCurrentMonth] = React.useState(selected || new Date())

    // Date Logic
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)

    // Saturday is 6 in date-fns
    const startDate = startOfWeek(monthStart, { weekStartsOn: 6 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 6 })

    const days = eachDayOfInterval({
        start: startDate,
        end: endDate,
    })

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

    const handleYearChange = (year: string) => {
        setCurrentMonth(setYear(currentMonth, parseInt(year)))
    }

    const handleMonthChange = (month: string) => {
        setCurrentMonth(setMonth(currentMonth, parseInt(month)))
    }

    const years = React.useMemo(() => {
        const currentYear = getYear(new Date())
        const arr = []
        // Constrain range as requested
        for (let i = currentYear - 10; i <= currentYear + 10; i++) {
            arr.push(i)
        }
        return arr
    }, [])

    const monthOptions = [
        { value: 0, label: "يناير" },
        { value: 1, label: "فبراير" },
        { value: 2, label: "مارس" },
        { value: 3, label: "أبريل" },
        { value: 4, label: "مايو" },
        { value: 5, label: "يونيو" },
        { value: 6, label: "يوليو" },
        { value: 7, label: "أغسطس" },
        { value: 8, label: "سبتمبر" },
        { value: 9, label: "أكتوبر" },
        { value: 10, label: "نوفمبر" },
        { value: 11, label: "ديسمبر" },
    ]

    return (
        <div className={cn("p-4 bg-white dark:bg-gray-950 select-none", className)} dir="rtl">
            <div className="flex items-center justify-between mb-5 gap-2">
                {/* Nav Arrows */}
                <button
                    onClick={prevMonth}
                    className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors text-gray-500"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-1 flex-1 justify-center">
                    {/* Month Select */}
                    <Select
                        value={getMonth(currentMonth).toString()}
                        onValueChange={handleMonthChange}
                    >
                        <SelectTrigger className="h-8 border-0 bg-transparent px-2 font-black text-blue-600 dark:text-blue-400 hover:text-blue-700 shadow-none focus:ring-0 w-auto min-w-[3.5rem] justify-center gap-1.5 [&>svg]:opacity-30">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent position="popper" side="bottom" className="min-w-[8rem] max-h-[220px] z-[1001]">
                            {monthOptions.map((m) => (
                                <SelectItem key={m.value} value={m.value.toString()} className="text-xs">
                                    {m.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Year Select */}
                    <Select
                        value={getYear(currentMonth).toString()}
                        onValueChange={handleYearChange}
                    >
                        <SelectTrigger className="h-8 border-0 bg-transparent px-2 font-black text-blue-600 dark:text-blue-400 hover:text-blue-700 shadow-none focus:ring-0 w-auto min-w-[3.5rem] justify-center gap-1.5 [&>svg]:opacity-30">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent position="popper" side="bottom" className="min-w-[6rem] max-h-[220px] z-[1001]">
                            {years.map((y) => (
                                <SelectItem key={y} value={y.toString()} className="text-xs">
                                    {y}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <button
                    onClick={nextMonth}
                    className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors text-gray-500"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
            </div>

            {/* Week Days */}
            <div className="grid grid-cols-7 mb-3 border-b border-gray-100 dark:border-gray-900 pb-3">
                {["س", "ح", "ن", "ث", "ر", "خ", "ج"].map((day, idx) => (
                    <div key={idx} className="text-center text-[10px] font-black opacity-30 uppercase tracking-widest">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1.5">
                {days.map((day, i) => {
                    const isSelected = selected && isSameDay(day, selected)
                    const isToday = isSameDay(day, new Date())
                    const isOurMonth = isSameMonth(day, monthStart)

                    return (
                        <button
                            key={i}
                            onClick={() => onSelect?.(day)}
                            className={cn(
                                "h-8 w-8 flex items-center justify-center rounded-lg text-[11px] font-black transition-all relative",
                                !isOurMonth && "text-gray-300 dark:text-gray-800 font-medium",
                                isSelected && "bg-blue-600 text-white shadow-md shadow-blue-500/20 z-10 scale-105",
                                !isSelected && isOurMonth && "hover:bg-blue-50 dark:hover:bg-blue-900/40 text-gray-700 dark:text-gray-200",
                                isToday && !isSelected && "after:content-[''] after:absolute after:bottom-1 after:w-1 after:h-1 after:bg-blue-600 after:rounded-full"
                            )}
                        >
                            {format(day, "d")}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
Calendar.displayName = "Calendar"

