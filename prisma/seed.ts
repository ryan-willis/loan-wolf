import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

(async function () {
  const exists = await db.loan.findUnique({
    where: { publicId: "sample-loan" },
  });
  if (exists) {
    return;
  }
  const loan = await db.loan.create({
    data: {
      name: "Sample Loan",
      amount: 10_000,
      interestRate: 0.05,
      term: 12,
      publicId: "sample-loan",
      startAt: new Date("2021-01-21").getTime(),
      status: "active",
    },
  });
  await db.payment.create({
    data: {
      loanId: loan.id,
      amount: 856.07,
      paidAt: new Date("2021-02-21").getTime(),
    },
  });
})();
