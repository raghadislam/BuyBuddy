export const userSafeSelect = {
  id: true,
  name: true,
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

export const userResetPasswordSelect = {
  id: true,
  name: true,
  email: true,
  passwordResetCode: true,
  passwordResetCodeExpiresAt: true,
};
