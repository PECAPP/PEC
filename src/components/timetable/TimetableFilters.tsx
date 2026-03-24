import { Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type TimetableFilterValues = {
  department: string;
  academicYear: string;
  batch: string;
  courseQuery: string;
  facultyQuery: string;
  roomQuery: string;
};

type TimetableFiltersProps = {
  canManageAllTimetable: boolean;
  isFaculty: boolean;
  facultyDepartment?: string;
  departmentOptions: string[];
  batchOptions: string[];
  values: TimetableFilterValues;
  onChange: (next: Partial<TimetableFilterValues>) => void;
};

const YEAR_OPTIONS = [1, 2, 3, 4];

export default function TimetableFilters({
  canManageAllTimetable,
  isFaculty,
  facultyDepartment,
  departmentOptions,
  batchOptions,
  values,
  onChange,
}: TimetableFiltersProps) {
  if (!canManageAllTimetable && !isFaculty) {
    return null;
  }

  return (
    <div className="card-elevated ui-card-pad">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" />
          {canManageAllTimetable ? "Institutional Filters" : "Branch Filters"}
        </h3>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Select
            value={values.department}
            onValueChange={(value) => onChange({ department: value })}
            disabled={isFaculty}
          >
            <SelectTrigger>
              <SelectValue placeholder="Branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {(isFaculty && facultyDepartment ? [facultyDepartment] : departmentOptions).map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={values.academicYear}
            onValueChange={(value) => onChange({ academicYear: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {YEAR_OPTIONS.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  Year {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {canManageAllTimetable && (
            <Select value={values.batch} onValueChange={(value) => onChange({ batch: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Batches</SelectItem>
                {batchOptions.map((batch) => (
                  <SelectItem key={batch} value={batch}>
                    {batch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {canManageAllTimetable && (
            <>
              <Input
                placeholder="Search course"
                value={values.courseQuery}
                onChange={(event) => onChange({ courseQuery: event.target.value })}
              />
              <Input
                placeholder="Search faculty"
                value={values.facultyQuery}
                onChange={(event) => onChange({ facultyQuery: event.target.value })}
              />
              <Input
                placeholder="Search room"
                value={values.roomQuery}
                onChange={(event) => onChange({ roomQuery: event.target.value })}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
