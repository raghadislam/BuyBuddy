import { Prisma } from "../../generated/prisma";

export const sendNotificationSelect: Prisma.NotificationSelect = {
  id: true,
  title: true,
  body: true,
  data: true,
  recipients: {
    select: {
      accountId: true,
      id: true,
    },
  },
};
