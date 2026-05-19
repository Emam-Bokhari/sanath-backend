import { Router } from "express";
import { TransactionController } from "./transaction.controller";
import { isAdmin } from "../../../helpers/authHelper";

const router = Router();

router.get(
  "/",
  isAdmin,
  TransactionController.getAllTransactions
);

router.get(
  "/:transactionId",
  isAdmin,
  TransactionController.getTransactionById
);

export const TransactionRoutes = router;
