export const accountSafeSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
  role: true,
  status: true,
  provider: true,
  user: true,
  brand: true,
};

export const accountLoginSelect = {
  ...accountSafeSelect,
  password: true,
};

export const accountResetPasswordSelect = {
  id: true,
  name: true,
  email: true,
  passwordResetCode: true,
  passwordResetCodeExpiresAt: true,
};

export const profileSelect = {
  ...accountSafeSelect,
  user: false,
  brand: false,
};
