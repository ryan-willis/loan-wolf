import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const SAMPLE_LOAN_PUBLIC_ID = "sample-loan";

(async function () {
  const exists = await db.loan.findUnique({
    where: { publicId: SAMPLE_LOAN_PUBLIC_ID },
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
      publicId: SAMPLE_LOAN_PUBLIC_ID,
      startAt: new Date("2021-01-21").getTime(),
      status: "active",
      paymentInterval: 5, //monthly
      interestCompounds: 5, //monthly
    },
  });
  await db.payment.create({
    data: {
      loanId: loan.id,
      amount: 856.07,
      paidAt: new Date("2021-02-21").getTime(),
      installment: 1,
    },
  });
})();
