export const userSafeSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  createdAt: true,
  updatedAt: true,
  role: true,
  status: true,
};

export const userLoginSelect = {
  ...userSafeSelect,
  password: true,
};
