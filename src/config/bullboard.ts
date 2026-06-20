import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { createBullBoard } from "@bull-board/api";
import { emailQueue } from "../queues/email/email.queue";
import { notificationQueue } from "../queues/notification/notification.queue";
import { feedSyncQueue } from "../queues/feedSync/feedSync.queue";

const serverAdapter = new ExpressAdapter();

serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [
    new BullMQAdapter(emailQueue),
    new BullMQAdapter(notificationQueue),
    new BullMQAdapter(feedSyncQueue),
  ],
  serverAdapter,
});

export { serverAdapter };
