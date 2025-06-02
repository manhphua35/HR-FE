export const roleTypeMapping : { [key: string]: number | undefined } = {
  'SYSTEM_ADMIN': 1,
  'HR_STAFF': 2,
  'DEPARTMENT_HEAD': 3,
  'EMPLOYEE': 4,
};

export const roleDisplayNameMapping: { [key: string]: string } = {
  'SYSTEM_ADMIN': 'Quản trị viên hệ thống',
  'HR_STAFF': 'Nhân viên HR',
  'DEPARTMENT_HEAD': 'Trưởng phòng',
  'EMPLOYEE': 'Nhân viên',
}; 